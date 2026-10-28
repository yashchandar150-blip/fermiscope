const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

// Shape of the user object we send to the frontend (never includes the password)
const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

// POST /api/auth/register  (public)
// Everyone who registers becomes a "researcher". Admins are created by the seed script
// or promoted by an existing admin.
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) {
    throw new HttpError(409, "An account with this email already exists");
  }

  const user = await User.create({ name, email, password, role: "researcher" });

  res.status(201).json({ token: generateToken(user._id), user: userResponse(user) });
});

// POST /api/auth/login  (public)
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw new HttpError(401, "Invalid email or password");
  }

  res.json({ token: generateToken(user._id), user: userResponse(user) });
});

// GET /api/auth/me  (logged in)
const getMe = asyncHandler(async (req, res) => {
  res.json({ user: userResponse(req.user) });
});

module.exports = { register, login, getMe };
