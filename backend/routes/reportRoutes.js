const express = require("express");
const {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  exportReportPdf,
} = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");
const { validateBody, validateId } = require("../middleware/validate");

const router = express.Router();

const rules = {
  title: { required: true, type: "string", minLength: 3, maxLength: 150 },
  description: { type: "string" },
  observations: { type: "array" },
  signalAnalyses: { type: "array" },
  hypotheses: { type: "array" },
  findings: { type: "string" },
  conclusion: { type: "string" },
  isSimulated: { type: "boolean" },
};

router.use(protect);

router.route("/").get(getReports).post(validateBody(rules), createReport);

router.get("/:id/pdf", validateId, exportReportPdf);

router
  .route("/:id")
  .get(validateId, getReportById)
  .put(validateId, validateBody(rules, { partial: true }), updateReport)
  .delete(validateId, deleteReport);

module.exports = router;
