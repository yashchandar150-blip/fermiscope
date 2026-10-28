const mongoose = require("mongoose");
const {
  CLASSIFICATION_LIST,
  VERIFICATION_STATUSES,
  SIGNAL_PATTERNS,
} = require("../utils/constants");

// One entry per change of verification status (audit trail)
const historySchema = new mongoose.Schema(
  {
    status: { type: String, enum: VERIFICATION_STATUSES },
    note: { type: String, default: "" },
    changedByName: { type: String, default: "" },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// One line of the transparent confidence score
const breakdownSchema = new mongoose.Schema(
  {
    label: String,
    points: Number,
  },
  { _id: false }
);

const signalAnalysisSchema = new mongoose.Schema(
  {
    observation: { type: mongoose.Schema.Types.ObjectId, ref: "Observation", default: null },
    sampleSignal: { type: mongoose.Schema.Types.ObjectId, ref: "SampleSignal", default: null },

    // ---- Signal input (units: MHz, dB, seconds, Hz) ----
    signalName: { type: String, required: true, trim: true },
    source: { type: String, trim: true, default: "" },
    observationDate: { type: Date, default: null },
    celestialObject: { type: String, trim: true, default: "" },
    frequency: { type: Number, default: null },
    signalStrength: { type: Number, default: null },
    duration: { type: Number, default: null },
    bandwidth: { type: Number, default: null },
    signalPattern: { type: String, enum: SIGNAL_PATTERNS, default: "Unknown" },
    isNarrowband: { type: Boolean, default: false },
    isRepeated: { type: Boolean, default: false },
    isKnownInterference: { type: Boolean, default: false },
    isKnownNaturalPattern: { type: Boolean, default: false },
    signalNotes: { type: String, trim: true, default: "" },

    // ---- Classification result (preliminary, rule-based) ----
    classification: { type: String, enum: CLASSIFICATION_LIST, required: true },
    confidenceScore: { type: Number, min: 0, max: 100, required: true }, // rule-based confidence, NOT alien probability
    confidenceBreakdown: [breakdownSchema],
    classificationExplanation: { type: String, default: "" },
    matchedFeatures: [String],
    alternativeExplanations: [String],
    nextSteps: [String],
    extractedFeatures: { type: mongoose.Schema.Types.Mixed, default: {} },
    ruleTrace: { type: [mongoose.Schema.Types.Mixed], default: [] },
    isUnconfirmedCandidate: { type: Boolean, default: false },

    // ---- Verification (done by humans) ----
    verificationStatus: { type: String, enum: VERIFICATION_STATUSES, default: "Detected" },
    verificationNotes: { type: String, trim: true, default: "" },
    verificationHistory: [historySchema],

    isSimulated: { type: Boolean, default: false },
    analyzedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SignalAnalysis", signalAnalysisSchema);
