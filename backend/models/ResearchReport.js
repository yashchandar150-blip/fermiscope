const mongoose = require("mongoose");

const researchReportSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Report title is required"], trim: true, maxlength: 150 },
    description: { type: String, trim: true, default: "" },
    observations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Observation" }],
    signalAnalyses: [{ type: mongoose.Schema.Types.ObjectId, ref: "SignalAnalysis" }],
    hypotheses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hypothesis" }],
    findings: { type: String, trim: true, default: "" },
    conclusion: { type: String, trim: true, default: "" },
    isSimulated: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResearchReport", researchReportSchema);
