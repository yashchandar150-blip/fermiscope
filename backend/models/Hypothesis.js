const mongoose = require("mongoose");

const hypothesisSchema = new mongoose.Schema(
  {
    order: { type: Number, default: 0 }, // used only to keep the list in a nice order
    name: { type: String, required: true, unique: true, trim: true },
    explanation: { type: String, required: true },
    supportingArguments: [String],
    limitations: [String],
    researchNotes: { type: String, default: "" }, // general study notes written by the project
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hypothesis", hypothesisSchema);
