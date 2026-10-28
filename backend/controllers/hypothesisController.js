const Hypothesis = require("../models/Hypothesis");
const HypothesisNote = require("../models/HypothesisNote");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { escapeRegex } = require("../utils/ownership");

// GET /api/hypotheses  (?search=)
// Each hypothesis also includes the logged-in user's personal note ("myNote")
const getHypotheses = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "i");
    filter.$or = [
      { name: regex },
      { explanation: regex },
      { supportingArguments: regex },
      { limitations: regex },
    ];
  }

  const hypotheses = await Hypothesis.find(filter).sort({ order: 1 });
  const notes = await HypothesisNote.find({ user: req.user._id });
  const noteMap = {};
  notes.forEach((n) => {
    noteMap[String(n.hypothesis)] = n.note;
  });

  res.json(hypotheses.map((h) => ({ ...h.toObject(), myNote: noteMap[String(h._id)] || "" })));
});

// GET /api/hypotheses/:id
const getHypothesisById = asyncHandler(async (req, res) => {
  const hypothesis = await Hypothesis.findById(req.params.id);
  if (!hypothesis) throw new HttpError(404, "Hypothesis not found");

  const note = await HypothesisNote.findOne({ user: req.user._id, hypothesis: hypothesis._id });
  res.json({ ...hypothesis.toObject(), myNote: note ? note.note : "" });
});

// PUT /api/hypotheses/:id/note - save the logged-in user's personal note
const saveNote = asyncHandler(async (req, res) => {
  const hypothesis = await Hypothesis.findById(req.params.id);
  if (!hypothesis) throw new HttpError(404, "Hypothesis not found");

  const note = await HypothesisNote.findOneAndUpdate(
    { user: req.user._id, hypothesis: hypothesis._id },
    { note: req.body.note || "" },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );

  res.json({ hypothesis: hypothesis._id, myNote: note.note });
});

module.exports = { getHypotheses, getHypothesisById, saveNote };
