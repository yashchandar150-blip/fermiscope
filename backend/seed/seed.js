/**
 * Database seed script
 * Run with:  npm run seed
 *
 * WARNING: this DELETES all existing FermiScope data and replaces it with
 * SIMULATED EDUCATIONAL demo data.
 */
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const User = require("../models/User");
const Observation = require("../models/Observation");
const SignalAnalysis = require("../models/SignalAnalysis");
const SampleSignal = require("../models/SampleSignal");
const ResearchReport = require("../models/ResearchReport");
const Hypothesis = require("../models/Hypothesis");
const HypothesisNote = require("../models/HypothesisNote");
const { buildAnalysisRecord } = require("../services/signalAnalysisService");

const sampleSignals = require("./sampleSignals");
const {
  demoUsers,
  hypotheses,
  researcherOneObservations,
  researcherTwoObservations,
  analysisPlan,
} = require("./seedData");

const daysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB. Clearing old data...");

  await Promise.all([
    User.deleteMany({}),
    Observation.deleteMany({}),
    SignalAnalysis.deleteMany({}),
    SampleSignal.deleteMany({}),
    ResearchReport.deleteMany({}),
    Hypothesis.deleteMany({}),
    HypothesisNote.deleteMany({}),
  ]);

  // ---- Users (passwords are hashed by the User model) ----
  const users = await User.create(demoUsers);
  const admin = users[0];
  const researchers = { 1: users[1], 2: users[2] };
  console.log(`Created ${users.length} users`);

  // ---- Hypotheses ----
  const createdHypotheses = await Hypothesis.create(hypotheses);
  console.log(`Created ${createdHypotheses.length} hypotheses`);

  // ---- Sample signals ----
  const createdSamples = await SampleSignal.create(sampleSignals);
  const sampleByCode = {};
  createdSamples.forEach((s) => (sampleByCode[s.code] = s));
  console.log(`Created ${createdSamples.length} sample signals`);

  // ---- Observations ----
  const makeObservations = (list, owner) =>
    Observation.create(
      list.map(({ daysAgo: d, ...rest }) => ({
        ...rest,
        observationDate: daysAgo(d),
        isSimulated: true,
        createdBy: owner._id,
      }))
    );
  const obsOne = await makeObservations(researcherOneObservations, researchers[1]);
  const obsTwo = await makeObservations(researcherTwoObservations, researchers[2]);
  const allObservations = [...obsOne, ...obsTwo];
  console.log(`Created ${allObservations.length} observations`);

  // ---- Signal analyses (the REAL engine is run on every sample) ----
  const analyses = [];
  for (const plan of analysisPlan) {
    const sample = sampleByCode[plan.code];
    const record = buildAnalysisRecord({ ...sample.toObject(), signalName: sample.name });
    const { suggestedVerificationStatus, ...fields } = record;
    const linked = plan.obs
      ? allObservations.find((o) => o.title.includes(plan.obs))
      : null;

    const analysis = await SignalAnalysis.create({
      ...fields,
      observationDate: linked ? linked.observationDate : daysAgo(10),
      observation: linked ? linked._id : null,
      sampleSignal: sample._id,
      verificationStatus: plan.status,
      verificationNotes: plan.note,
      verificationHistory: [
        { status: suggestedVerificationStatus, note: "Initial status suggested by the rule-based engine", changedByName: researchers[plan.owner].name },
        ...(plan.status !== suggestedVerificationStatus
          ? [{ status: plan.status, note: plan.note, changedByName: researchers[plan.owner].name }]
          : []),
      ],
      isSimulated: true,
      analyzedBy: researchers[plan.owner]._id,
    });
    analyses.push(analysis);
  }
  console.log(`Created ${analyses.length} signal analyses`);

  // ---- Research reports ----
  const hyp = (name) => createdHypotheses.find((h) => h.name.includes(name))._id;
  const ana = (code, owner) =>
    analyses.find((a) => String(a.sampleSignal) === String(sampleByCode[code]._id) && String(a.analyzedBy) === String(researchers[owner]._id))._id;
  const obs = (keyword) => obsOne.find((o) => o.title.includes(keyword))._id;

  await ResearchReport.create([
    {
      title: "Comparing Natural, Interference and Candidate Signals (Simulated)",
      description:
        "SIMULATED EDUCATIONAL REPORT. Compares how the rule engine treats natural emission, human-made interference and a narrowband repeating signal.",
      observations: [obs("Hydrogen Line"), obs("Urban Interference"), obs("Repeating Narrowband")],
      signalAnalyses: [ana("SIM-NAT-001", 1), ana("SIM-INT-001", 1), ana("SIM-ART-001", 1)],
      hypotheses: [hyp("Great Silence"), hyp("Wrong Technology"), hyp("Great Filter")],
      findings:
        "The hydrogen-line signal was classified as a Natural Phenomenon. The FM leakage was classified as Human-Made Interference. The narrowband repeating carrier met the candidate criteria and is listed as a Potential Artificial Signal. All data in this report is simulated.",
      conclusion:
        "The classifications are preliminary and rule-based. The candidate is UNCONFIRMED and would need repeated observation, ON-OFF testing and independent confirmation. Nothing in this report is evidence of extraterrestrial life.",
      isSimulated: true,
      createdBy: researchers[1]._id,
    },
    {
      title: "Why One Detection Is Not Enough (Simulated)",
      description:
        "SIMULATED EDUCATIONAL REPORT. A short study of the narrowband signal that was seen only once.",
      observations: [obs("Narrowband Follow-up"), obs("Short Burst")],
      signalAnalyses: [ana("SIM-UNK-002", 1), ana("SIM-UNK-001", 1)],
      hypotheses: [hyp("Too Far Away"), hyp("Intelligent Life")],
      findings:
        "Both signals were classified as Unknown. One had missing bandwidth data, and the other was narrowband but not repeated.",
      conclusion:
        "Repeated observation is the next step. Until then, neither signal is a candidate.",
      isSimulated: true,
      createdBy: researchers[1]._id,
    },
    {
      title: "Interference Log: Satellite and Broadcast Bands (Simulated)",
      description: "SIMULATED EDUCATIONAL REPORT written by the second demo researcher.",
      observations: [obsTwo[1]._id],
      signalAnalyses: [ana("SIM-INT-001", 2)],
      hypotheses: [hyp("Destroy Themselves")],
      findings: "Local satellite and broadcast interference should be logged before searching for unusual signals.",
      conclusion: "A complete interference log reduces false candidates.",
      isSimulated: true,
      createdBy: researchers[2]._id,
    },
  ]);
  console.log("Created 3 research reports");

  // ---- A demo personal note ----
  await HypothesisNote.create({
    user: researchers[1]._id,
    hypothesis: hyp("Great Filter"),
    note: "Idea for my project viva: explain that the Great Filter may be behind us OR ahead of us.",
  });

  console.log("\n=========================================");
  console.log(" SEED COMPLETE (all data is SIMULATED)");
  console.log("=========================================");
  console.log(" Demo logins:");
  demoUsers.forEach((u) => console.log(`  ${u.role.padEnd(10)} ${u.email}  /  ${u.password}`));
  console.log("=========================================\n");

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(async (error) => {
  console.error("Seed failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
