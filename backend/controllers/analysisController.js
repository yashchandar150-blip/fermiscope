const SignalAnalysis = require("../models/SignalAnalysis");
const SampleSignal = require("../models/SampleSignal");
const Observation = require("../models/Observation");
const ResearchReport = require("../models/ResearchReport");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { assertOwnerOrAdmin, ownerFilter, escapeRegex } = require("../utils/ownership");
const { analyzeSignal, buildAnalysisRecord } = require("../services/signalAnalysisService");

// The fields the analysis engine understands
const ENGINE_FIELDS = [
  "signalName",
  "source",
  "observationDate",
  "celestialObject",
  "frequency",
  "signalStrength",
  "duration",
  "bandwidth",
  "signalPattern",
  "isRepeated",
  "isKnownInterference",
  "isKnownNaturalPattern",
  "signalNotes",
];

const pickEngineInput = (body) => {
  const input = {};
  for (const field of ENGINE_FIELDS) {
    if (body[field] !== undefined) input[field] = body[field];
  }
  return input;
};

// Makes sure an observation exists and belongs to the user (or user is admin)
const assertObservationAccess = async (observationId, user) => {
  const observation = await Observation.findById(observationId);
  if (!observation) throw new HttpError(404, "Linked observation not found");
  assertOwnerOrAdmin(observation.createdBy, user);
  return observation;
};

// ---------------------------------------------------------------------------
// SIGNAL ANALYSIS ENGINE ENDPOINTS (preview only: nothing is saved)
// ---------------------------------------------------------------------------

// GET /api/analyses/samples - list simulated sample signals
const getSampleSignals = asyncHandler(async (req, res) => {
  const samples = await SampleSignal.find().sort({ code: 1 });
  res.json(samples);
});

// POST /api/analyses/analyze - manual analysis
const analyzeManual = asyncHandler(async (req, res) => {
  const result = analyzeSignal(pickEngineInput(req.body));
  res.json({ result });
});

// POST /api/analyses/analyze-sample - analyze a predefined simulated sample
const analyzeSample = asyncHandler(async (req, res) => {
  const sample = await SampleSignal.findById(req.body.sampleId);
  if (!sample) throw new HttpError(404, "Sample signal not found");

  const result = analyzeSignal({ ...sample.toObject(), signalName: sample.name });

  res.json({
    sample,
    result,
    expected: {
      classification: sample.expectedClassification,
      confidence: sample.expectedConfidence,
      verificationStatus: sample.expectedVerificationStatus,
      explanation: sample.expectedExplanation,
    },
    matchesExpected:
      result.classification === sample.expectedClassification &&
      result.confidenceScore === sample.expectedConfidence,
    isSimulated: true,
  });
});

// ---------------------------------------------------------------------------
// CRUD ENDPOINTS (these save to MongoDB)
// ---------------------------------------------------------------------------

// POST /api/analyses - analyze AND save
// The engine is run again on the server, so the classification can never be faked by the client.
const createAnalysis = asyncHandler(async (req, res) => {
  const { observation, sampleSignal, isSimulated, verificationStatus } = req.body;

  let simulated = isSimulated === true || isSimulated === "true";

  if (observation) await assertObservationAccess(observation, req.user);

  if (sampleSignal) {
    const sample = await SampleSignal.findById(sampleSignal);
    if (!sample) throw new HttpError(404, "Sample signal not found");
    simulated = true; // sample signals are always simulated
  }

  const record = buildAnalysisRecord(pickEngineInput(req.body));
  const { suggestedVerificationStatus, ...fields } = record;
  const status = verificationStatus || suggestedVerificationStatus;

  const analysis = await SignalAnalysis.create({
    ...fields,
    observation: observation || null,
    sampleSignal: sampleSignal || null,
    isSimulated: simulated,
    verificationStatus: status,
    verificationHistory: [
      {
        status,
        note: "Initial status suggested by the rule-based engine",
        changedByName: req.user.name,
      },
    ],
    analyzedBy: req.user._id,
  });

  // If the analysis is linked to a pending observation, mark it as analyzed
  if (observation) {
    await Observation.updateOne({ _id: observation, status: "Pending" }, { status: "Analyzed" });
  }

  res.status(201).json(analysis);
});

// GET /api/analyses
// Query: ?search= &classification= &verificationStatus= &observation=
const getAnalyses = asyncHandler(async (req, res) => {
  const { search, classification, verificationStatus, observation } = req.query;
  const filter = ownerFilter(req.user, "analyzedBy");

  if (classification) filter.classification = classification;
  if (verificationStatus) filter.verificationStatus = verificationStatus;
  if (observation) filter.observation = observation;
  if (search) filter.signalName = new RegExp(escapeRegex(search), "i");

  const analyses = await SignalAnalysis.find(filter)
    .select("-extractedFeatures -ruleTrace")
    .populate("analyzedBy", "name email")
    .populate("observation", "title")
    .sort({ createdAt: -1 });

  res.json(analyses);
});

// GET /api/analyses/:id
const getAnalysisById = asyncHandler(async (req, res) => {
  const analysis = await SignalAnalysis.findById(req.params.id)
    .populate("analyzedBy", "name email")
    .populate("observation", "title observationDate source");

  if (!analysis) throw new HttpError(404, "Signal analysis not found");
  assertOwnerOrAdmin(analysis.analyzedBy, req.user);

  res.json(analysis);
});

// PUT /api/analyses/:id
// - Update the verification status (adds a history entry)
// - Update notes / linked observation
// - If signal input fields are sent, the engine is run again
const updateAnalysis = asyncHandler(async (req, res) => {
  const analysis = await SignalAnalysis.findById(req.params.id);
  if (!analysis) throw new HttpError(404, "Signal analysis not found");
  assertOwnerOrAdmin(analysis.analyzedBy, req.user);

  const { verificationStatus, verificationNotes, observation } = req.body;

  // 1. Re-run the engine if any signal input changed
  const newInput = pickEngineInput(req.body);
  if (Object.keys(newInput).length > 0) {
    const currentInput = {};
    for (const field of ENGINE_FIELDS) currentInput[field] = analysis[field];
    const record = buildAnalysisRecord({ ...currentInput, ...newInput });
    const { suggestedVerificationStatus, ...fields } = record;
    analysis.set(fields);
  }

  // 2. Link or unlink an observation
  if (observation !== undefined) {
    if (observation) await assertObservationAccess(observation, req.user);
    analysis.observation = observation || null;
  }

  // 3. Verification status (human decision) + history entry
  if (verificationNotes !== undefined) analysis.verificationNotes = verificationNotes;
  if (verificationStatus && verificationStatus !== analysis.verificationStatus) {
    analysis.verificationStatus = verificationStatus;
    analysis.verificationHistory.push({
      status: verificationStatus,
      note: verificationNotes || "",
      changedByName: req.user.name,
    });
  }

  await analysis.save();
  res.json(analysis);
});

// DELETE /api/analyses/:id
const deleteAnalysis = asyncHandler(async (req, res) => {
  const analysis = await SignalAnalysis.findById(req.params.id);
  if (!analysis) throw new HttpError(404, "Signal analysis not found");
  assertOwnerOrAdmin(analysis.analyzedBy, req.user);

  await ResearchReport.updateMany({}, { $pull: { signalAnalyses: analysis._id } });
  await analysis.deleteOne();

  res.json({ message: "Signal analysis deleted" });
});

module.exports = {
  getSampleSignals,
  analyzeManual,
  analyzeSample,
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  updateAnalysis,
  deleteAnalysis,
};
