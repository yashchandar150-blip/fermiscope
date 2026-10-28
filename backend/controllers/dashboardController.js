const Observation = require("../models/Observation");
const SignalAnalysis = require("../models/SignalAnalysis");
const ResearchReport = require("../models/ResearchReport");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { CLASSIFICATIONS, VERIFICATION_STATUSES } = require("../utils/constants");

// Frequency buckets (MHz) for the frequency distribution chart
const FREQUENCY_BUCKETS = [
  { range: "< 100 MHz", min: 0, max: 100 },
  { range: "100 - 1000", min: 100, max: 1000 },
  { range: "1000 - 1500", min: 1000, max: 1500 },
  { range: "1500 - 3000", min: 1500, max: 3000 },
  { range: "3000 - 10000", min: 3000, max: 10000 },
  { range: ">= 10000", min: 10000, max: Infinity },
];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// GET /api/dashboard/stats
// Researchers get statistics for THEIR records. Admins get statistics for the WHOLE system.
const getDashboardStats = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const obsFilter = isAdmin ? {} : { createdBy: req.user._id };
  const anaFilter = isAdmin ? {} : { analyzedBy: req.user._id };
  const repFilter = isAdmin ? {} : { createdBy: req.user._id };

  // ---- Totals (counted by MongoDB) ----
  const [totalObservations, totalAnalyses, totalReports] = await Promise.all([
    Observation.countDocuments(obsFilter),
    SignalAnalysis.countDocuments(anaFilter),
    ResearchReport.countDocuments(repFilter),
  ]);

  const countClass = (name) => SignalAnalysis.countDocuments({ ...anaFilter, classification: name });
  const [candidates, natural, interference, unknown] = await Promise.all([
    countClass(CLASSIFICATIONS.POTENTIAL),
    countClass(CLASSIFICATIONS.NATURAL),
    countClass(CLASSIFICATIONS.INTERFERENCE),
    countClass(CLASSIFICATIONS.UNKNOWN),
  ]);

  const totals = {
    observations: totalObservations,
    analyses: totalAnalyses,
    candidates,
    natural,
    interference,
    unknown,
    reports: totalReports,
  };

  // ---- Chart data ----
  const classificationDistribution = [
    { name: CLASSIFICATIONS.NATURAL, value: natural },
    { name: CLASSIFICATIONS.INTERFERENCE, value: interference },
    { name: CLASSIFICATIONS.UNKNOWN, value: unknown },
    { name: CLASSIFICATIONS.POTENTIAL, value: candidates },
  ];

  const analysisDocs = await SignalAnalysis.find(anaFilter).select("frequency verificationStatus classification").lean();

  const verificationDistribution = VERIFICATION_STATUSES.map((status) => ({
    name: status,
    value: analysisDocs.filter((a) => a.verificationStatus === status).length,
  }));

  const frequencyDistribution = FREQUENCY_BUCKETS.map((bucket) => ({
    range: bucket.range,
    count: analysisDocs.filter(
      (a) => a.frequency !== null && a.frequency !== undefined && a.frequency >= bucket.min && a.frequency < bucket.max
    ).length,
  }));

  // Observation trends: number of observations per month for the last 6 months
  const observationDates = await Observation.find(obsFilter).select("observationDate").lean();
  const now = new Date();
  const observationTrends = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const count = observationDates.filter((o) => {
      const od = new Date(o.observationDate);
      return `${od.getFullYear()}-${String(od.getMonth() + 1).padStart(2, "0")}` === key;
    }).length;
    observationTrends.push({ month: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`, count });
  }

  // ---- Recent records ----
  const recentObservations = await Observation.find(obsFilter)
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  const recentAnalyses = await SignalAnalysis.find(anaFilter)
    .select("signalName classification confidenceScore verificationStatus isSimulated createdAt analyzedBy")
    .populate("analyzedBy", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  const response = {
    scope: isAdmin ? "system" : "personal",
    totals,
    classificationDistribution,
    observationTrends,
    frequencyDistribution,
    verificationDistribution,
    recentObservations,
    recentAnalyses,
  };

  // Extra information only for administrators
  if (isAdmin) {
    const [totalUsers, researchers, admins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "researcher" }),
      User.countDocuments({ role: "admin" }),
    ]);
    response.totals.users = totalUsers;
    response.totals.researchers = researchers;
    response.totals.admins = admins;
    response.recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
  }

  res.json(response);
});

module.exports = { getDashboardStats };
