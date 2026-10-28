const express = require("express");
const { getHypotheses, getHypothesisById, saveNote } = require("../controllers/hypothesisController");
const { protect } = require("../middleware/authMiddleware");
const { validateBody, validateId } = require("../middleware/validate");

const router = express.Router();

router.use(protect);

router.get("/", getHypotheses);
router.get("/:id", validateId, getHypothesisById);
router.put("/:id/note", validateId, validateBody({ note: { type: "string", maxLength: 5000 } }), saveNote);

module.exports = router;
