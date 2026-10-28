const mongoose = require("mongoose");
const {
  CLASSIFICATION_LIST,
  VERIFICATION_STATUSES,
  SIGNAL_PATTERNS,
  SIMULATION_LABEL,
} = require("../utils/constants");

// Predefined SIMULATED signals that researchers can analyze with one click
const sampleSignalSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },

    // input features
    source: { type: String, default: "" },
    celestialObject: { type: String, default: "" },
    frequency: { type: Number, default: null }, // MHz
    signalStrength: { type: Number, default: null }, // dB
    duration: { type: Number, default: null }, // seconds
    bandwidth: { type: Number, default: null }, // Hz
    signalPattern: { type: String, enum: SIGNAL_PATTERNS, default: "Unknown" },
    isRepeated: { type: Boolean, default: false },
    isKnownInterference: { type: Boolean, default: false },
    isKnownNaturalPattern: { type: Boolean, default: false },
    signalNotes: { type: String, default: "" },

    // what the engine is expected to produce
    expectedClassification: { type: String, enum: CLASSIFICATION_LIST, required: true },
    expectedConfidence: { type: Number, required: true },
    expectedExplanation: { type: String, default: "" },
    expectedVerificationStatus: { type: String, enum: VERIFICATION_STATUSES, required: true },

    isSimulated: { type: Boolean, default: true },
    simulationLabel: { type: String, default: SIMULATION_LABEL },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SampleSignal", sampleSignalSchema);
