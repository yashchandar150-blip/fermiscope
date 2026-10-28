const express = require("express");
const {
  createObservation,
  getObservations,
  getObservationById,
  updateObservation,
  deleteObservation,
} = require("../controllers/observationController");
const { protect } = require("../middleware/authMiddleware");
const { validateBody, validateId } = require("../middleware/validate");
const { OBSERVATION_TYPES, OBSERVATION_STATUSES } = require("../utils/constants");

const router = express.Router();

const rules = {
  title: { required: true, type: "string", minLength: 3, maxLength: 150 },
  description: { type: "string" },
  observationDate: { required: true, type: "date" },
  source: { required: true, type: "string", minLength: 2 },
  celestialLocation: { type: "string" },
  frequency: { type: "number", min: 0 },
  signalStrength: { type: "number" },
  observationType: { required: true, type: "string", enum: OBSERVATION_TYPES },
  status: { type: "string", enum: OBSERVATION_STATUSES },
  researchNotes: { type: "string" },
};

router.use(protect); // every observation route needs a logged-in user

router.route("/").get(getObservations).post(validateBody(rules), createObservation);

router
  .route("/:id")
  .get(validateId, getObservationById)
  .put(validateId, validateBody(rules, { partial: true }), updateObservation)
  .delete(validateId, deleteObservation);

module.exports = router;
