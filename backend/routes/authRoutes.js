const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateBody } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/register",
  validateBody({
    name: { required: true, type: "string", minLength: 2, maxLength: 80 },
    email: { required: true, type: "email" },
    password: { required: true, type: "string", minLength: 6 },
  }),
  register
);

router.post(
  "/login",
  validateBody({
    email: { required: true, type: "email" },
    password: { required: true, type: "string" },
  }),
  login
);

router.get("/me", protect, getMe);

module.exports = router;
