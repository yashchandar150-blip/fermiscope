const mongoose = require("mongoose");
const { OBSERVATION_TYPES, OBSERVATION_STATUSES } = require("../utils/constants");

const observationSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 150 },
    description: { type: String, trim: true, default: "" },
    observationDate: { type: Date, required: [true, "Observation date is required"] },
    source: { type: String, required: [true, "Telescope or source is required"], trim: true },
    celestialLocation: { type: String, trim: true, default: "" },
    frequency: { type: Number, min: 0, default: null }, // MHz
    signalStrength: { type: Number, default: null }, // dB (SNR)
    observationType: { type: String, enum: OBSERVATION_TYPES, required: true },
    status: { type: String, enum: OBSERVATION_STATUSES, default: "Pending" },
    researchNotes: { type: String, trim: true, default: "" },
    isSimulated: { type: Boolean, default: false }, // true for seeded educational data
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Observation", observationSchema);
