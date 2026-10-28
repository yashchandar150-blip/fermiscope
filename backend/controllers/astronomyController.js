const asyncHandler = require("../utils/asyncHandler");
const { getTargets, isRealDataEnabled } = require("../services/astronomyDataService");

// GET /api/astronomy/targets - optional list of target stars (simulated unless real data is enabled)
const getAstronomyTargets = asyncHandler(async (req, res) => {
  res.json(await getTargets());
});

// GET /api/astronomy/status - tells the frontend which data mode is active
const getDataStatus = asyncHandler(async (req, res) => {
  res.json({
    realDataEnabled: isRealDataEnabled(),
    mode: isRealDataEnabled() ? "optional real target data enabled" : "simulated educational data",
  });
});

module.exports = { getAstronomyTargets, getDataStatus };
