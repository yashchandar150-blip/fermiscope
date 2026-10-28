const Observation = require("../models/Observation");
const SignalAnalysis = require("../models/SignalAnalysis");
const ResearchReport = require("../models/ResearchReport");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { assertOwnerOrAdmin, ownerFilter, escapeRegex } = require("../utils/ownership");

// Only these fields can be set from the request body (prevents sneaking in createdBy etc.)
const EDITABLE_FIELDS = [
  "title",
  "description",
  "observationDate",
  "source",
  "celestialLocation",
  "frequency",
  "signalStrength",
  "observationType",
  "status",
  "researchNotes",
];

const pickFields = (body) => {
  const data = {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) {
      // empty strings for numbers become null
      data[field] = body[field] === "" && ["frequency", "signalStrength"].includes(field) ? null : body[field];
    }
  }
  return data;
};

// POST /api/observations
const createObservation = asyncHandler(async (req, res) => {
  const observation = await Observation.create({
    ...pickFields(req.body),
    createdBy: req.user._id,
  });
  res.status(201).json(observation);
});

// GET /api/observations
// Query: ?search= &type= &status= &sort=newest|oldest
// Researchers see their own records. Admins see everyone's.
const getObservations = asyncHandler(async (req, res) => {
  const { search, type, status, sort } = req.query;
  const filter = ownerFilter(req.user, "createdBy");

  if (type) filter.observationType = type;
  if (status) filter.status = status;
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { title: regex },
      { description: regex },
      { source: regex },
      { celestialLocation: regex },
    ];
  }

  const sortOrder = sort === "oldest" ? 1 : -1;
  const observations = await Observation.find(filter)
    .populate("createdBy", "name email")
    .sort({ observationDate: sortOrder, createdAt: sortOrder });

  res.json(observations);
});

// GET /api/observations/:id
const getObservationById = asyncHandler(async (req, res) => {
  const observation = await Observation.findById(req.params.id).populate("createdBy", "name email");
  if (!observation) throw new HttpError(404, "Observation not found");

  assertOwnerOrAdmin(observation.createdBy, req.user);
  res.json(observation);
});

// PUT /api/observations/:id
const updateObservation = asyncHandler(async (req, res) => {
  const observation = await Observation.findById(req.params.id);
  if (!observation) throw new HttpError(404, "Observation not found");

  assertOwnerOrAdmin(observation.createdBy, req.user);

  observation.set(pickFields(req.body));
  await observation.save();
  res.json(observation);
});

// DELETE /api/observations/:id
const deleteObservation = asyncHandler(async (req, res) => {
  const observation = await Observation.findById(req.params.id);
  if (!observation) throw new HttpError(404, "Observation not found");

  assertOwnerOrAdmin(observation.createdBy, req.user);

  // Keep analyses (they are valuable research records) but unlink them
  await SignalAnalysis.updateMany({ observation: observation._id }, { $set: { observation: null } });
  // Remove the observation from any report that used it
  await ResearchReport.updateMany({}, { $pull: { observations: observation._id } });

  await observation.deleteOne();
  res.json({ message: "Observation deleted" });
});

module.exports = {
  createObservation,
  getObservations,
  getObservationById,
  updateObservation,
  deleteObservation,
};
