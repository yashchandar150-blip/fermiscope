const express = require("express");
const { getAstronomyTargets, getDataStatus } = require("../controllers/astronomyController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/status", getDataStatus);
router.get("/targets", getAstronomyTargets);

module.exports = router;
