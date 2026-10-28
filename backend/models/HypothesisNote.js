const mongoose = require("mongoose");

// A researcher's PERSONAL note about one hypothesis (one note per user per hypothesis)
const hypothesisNoteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hypothesis: { type: mongoose.Schema.Types.ObjectId, ref: "Hypothesis", required: true },
    note: { type: String, default: "", maxlength: 5000 },
  },
  { timestamps: true }
);

hypothesisNoteSchema.index({ user: 1, hypothesis: 1 }, { unique: true });

module.exports = mongoose.model("HypothesisNote", hypothesisNoteSchema);
