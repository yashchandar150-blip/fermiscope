const User = require("../models/User");
const Observation = require("../models/Observation");
const SignalAnalysis = require("../models/SignalAnalysis");
const ResearchReport = require("../models/ResearchReport");
const HypothesisNote = require("../models/HypothesisNote");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { escapeRegex } = require("../utils/ownership");

// GET /api/users  (admin) - supports ?search= and ?role=
const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "i");
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const users = await User.find(filter).sort({ createdAt: -1 });

  // Add simple counts so the admin can see how active each user is
  const withCounts = await Promise.all(
    users.map(async (u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      observationCount: await Observation.countDocuments({ createdBy: u._id }),
      analysisCount: await SignalAnalysis.countDocuments({ analyzedBy: u._id }),
      reportCount: await ResearchReport.countDocuments({ createdBy: u._id }),
    }))
  );

  res.json(withCounts);
});

// GET /api/users/:id  (admin, or the user themselves)
const getUserById = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && String(req.user._id) !== req.params.id) {
    throw new HttpError(403, "You can only view your own profile");
  }
  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, "User not found");
  res.json(user);
});

// PUT /api/users/:id  (admin, or the user themselves)
// - A normal user can change their own name, email and password.
// - Only an admin can change a role.
const updateUser = asyncHandler(async (req, res) => {
  const isSelf = String(req.user._id) === req.params.id;
  const isAdmin = req.user.role === "admin";

  if (!isSelf && !isAdmin) {
    throw new HttpError(403, "You can only update your own profile");
  }

  const user = await User.findById(req.params.id).select("+password");
  if (!user) throw new HttpError(404, "User not found");

  const { name, email, role, password, currentPassword } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;

  if (role !== undefined) {
    if (!isAdmin) throw new HttpError(403, "Only an administrator can change roles");
    if (isSelf && role !== user.role) {
      throw new HttpError(400, "You cannot change your own role");
    }
    user.role = role;
  }

  if (password) {
    // A user changing their OWN password must prove they know the old one
    if (isSelf) {
      if (!currentPassword || !(await user.matchPassword(currentPassword))) {
        throw new HttpError(400, "Current password is incorrect");
      }
    }
    user.password = password; // hashed by the pre-save hook in the User model
  }

  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
});

// DELETE /api/users/:id  (admin)
const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id) {
    throw new HttpError(400, "You cannot delete your own account");
  }

  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, "User not found");

  // Remove everything the user created so nothing is left pointing to a missing user
  await Promise.all([
    Observation.deleteMany({ createdBy: user._id }),
    SignalAnalysis.deleteMany({ analyzedBy: user._id }),
    ResearchReport.deleteMany({ createdBy: user._id }),
    HypothesisNote.deleteMany({ user: user._id }),
  ]);
  await user.deleteOne();

  res.json({ message: "User and related records deleted" });
});

module.exports = { getUsers, getUserById, updateUser, deleteUser };
