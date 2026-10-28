const ResearchReport = require("../models/ResearchReport");
const Observation = require("../models/Observation");
const SignalAnalysis = require("../models/SignalAnalysis");
const Hypothesis = require("../models/Hypothesis");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { assertOwnerOrAdmin, ownerFilter, escapeRegex } = require("../utils/ownership");
const { buildReportPdf } = require("../services/reportPdfService");

const EDITABLE_FIELDS = ["title", "description", "findings", "conclusion", "isSimulated"];

// Checks that every id in the list exists, and that the user owns it (admins skip the ownership check)
const assertReferences = async (Model, ids, ownerField, user, label) => {
  if (!ids || ids.length === 0) return;
  const filter = { _id: { $in: ids } };
  if (ownerField && user.role !== "admin") filter[ownerField] = user._id;

  const count = await Model.countDocuments(filter);
  if (count !== new Set(ids.map(String)).size) {
    throw new HttpError(400, `One or more selected ${label} do not exist or do not belong to you`);
  }
};

const validateReferences = async (body, user) => {
  await assertReferences(Observation, body.observations, "createdBy", user, "observations");
  await assertReferences(SignalAnalysis, body.signalAnalyses, "analyzedBy", user, "signal analyses");
  await assertReferences(Hypothesis, body.hypotheses, null, user, "hypotheses");
};

const pickFields = (body) => {
  const data = {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  for (const list of ["observations", "signalAnalyses", "hypotheses"]) {
    if (body[list] !== undefined) data[list] = body[list];
  }
  return data;
};

// Loads a report with all linked records filled in
const loadFullReport = (id) =>
  ResearchReport.findById(id)
    .populate("createdBy", "name email role")
    .populate("observations")
    .populate("signalAnalyses")
    .populate("hypotheses");

// POST /api/reports
const createReport = asyncHandler(async (req, res) => {
  await validateReferences(req.body, req.user);
  const report = await ResearchReport.create({ ...pickFields(req.body), createdBy: req.user._id });
  res.status(201).json(report);
});

// GET /api/reports  (?search=)
const getReports = asyncHandler(async (req, res) => {
  const filter = ownerFilter(req.user, "createdBy");
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "i");
    filter.$or = [{ title: regex }, { description: regex }, { findings: regex }];
  }

  const reports = await ResearchReport.find(filter)
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  res.json(reports);
});

// GET /api/reports/:id
const getReportById = asyncHandler(async (req, res) => {
  const report = await loadFullReport(req.params.id);
  if (!report) throw new HttpError(404, "Report not found");
  assertOwnerOrAdmin(report.createdBy, req.user);
  res.json(report);
});

// PUT /api/reports/:id
const updateReport = asyncHandler(async (req, res) => {
  const report = await ResearchReport.findById(req.params.id);
  if (!report) throw new HttpError(404, "Report not found");
  assertOwnerOrAdmin(report.createdBy, req.user);

  await validateReferences(req.body, req.user);
  report.set(pickFields(req.body));
  await report.save();
  res.json(report);
});

// DELETE /api/reports/:id
const deleteReport = asyncHandler(async (req, res) => {
  const report = await ResearchReport.findById(req.params.id);
  if (!report) throw new HttpError(404, "Report not found");
  assertOwnerOrAdmin(report.createdBy, req.user);

  await report.deleteOne();
  res.json({ message: "Report deleted" });
});

// ---------------------------------------------------------------------------
// PDF EXPORT  -  GET /api/reports/:id/pdf
// The PDF layout itself lives in services/reportPdfService.js
// ---------------------------------------------------------------------------
const exportReportPdf = asyncHandler(async (req, res) => {
  const report = await loadFullReport(req.params.id);
  if (!report) throw new HttpError(404, "Report not found");
  assertOwnerOrAdmin(report.createdBy, req.user);

  const safeName = report.title.replace(/[^a-z0-9]+/gi, "_").slice(0, 60) || "report";
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="FermiScope_${safeName}.pdf"`);

  buildReportPdf(report, res);
});

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
  exportReportPdf,
};
