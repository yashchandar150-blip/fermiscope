const express = require("express");
const {
  getSampleSignals,
  analyzeManual,
  analyzeSample,
  createAnalysis,
  getAnalyses,
  getAnalysisById,
  updateAnalysis,
  deleteAnalysis,
} = require("../controllers/analysisController");
const { protect } = require("../middleware/authMiddleware");
const { validateBody, validateId } = require("../middleware/validate");
const { SIGNAL_PATTERNS, VERIFICATION_STATUSES } = require("../utils/constants");

const router = express.Router();

// Rules for the signal input form
const signalRules = {
  signalName: { type: "string", maxLength: 120 },
  source: { type: "string" },
  observationDate: { type: "date" },
  celestialObject: { type: "string" },
  frequency: { required: true, type: "number", min: 0 }, // MHz
  signalStrength: { required: true, type: "number" }, // dB
  duration: { type: "number", min: 0 }, // seconds
  bandwidth: { type: "number", min: 0 }, // Hz
  signalPattern: { type: "string", enum: SIGNAL_PATTERNS },
  isRepeated: { type: "boolean" },
  isKnownInterference: { type: "boolean" },
  isKnownNaturalPattern: { type: "boolean" },
  signalNotes: { type: "string" },
};

router.use(protect);

// Engine endpoints (preview only, nothing is saved)
router.post("/analyze", validateBody(signalRules), analyzeManual);
router.post("/analyze-sample", validateBody({ sampleId: { required: true, type: "id" } }), analyzeSample);
router.get("/samples", getSampleSignals); // must be BEFORE "/:id"

// CRUD endpoints
router
  .route("/")
  .get(getAnalyses)
  .post(
    validateBody({
      ...signalRules,
      signalName: { required: true, type: "string", maxLength: 120 },
      observation: { type: "id" },
      sampleSignal: { type: "id" },
      isSimulated: { type: "boolean" },
      verificationStatus: { type: "string", enum: VERIFICATION_STATUSES },
    }),
    createAnalysis
  );

router
  .route("/:id")
  .get(validateId, getAnalysisById)
  .put(
    validateId,
    validateBody(
      {
        ...signalRules,
        observation: { type: "id" },
        verificationStatus: { type: "string", enum: VERIFICATION_STATUSES },
        verificationNotes: { type: "string" },
      },
      { partial: true }
    ),
    updateAnalysis
  )
  .delete(validateId, deleteAnalysis);

module.exports = router;
