const express = require("express");
const { getUsers, getUserById, updateUser, deleteUser } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { validateBody, validateId } = require("../middleware/validate");
const { ROLES } = require("../utils/constants");

const router = express.Router();

router.use(protect);

// Only administrators can list all users
router.get("/", adminOnly, getUsers);

router
  .route("/:id")
  .get(validateId, getUserById) // admin or the user themselves (checked in the controller)
  .put(
    validateId,
    validateBody(
      {
        name: { type: "string", minLength: 2, maxLength: 80 },
        email: { type: "email" },
        role: { type: "string", enum: ROLES },
        password: { type: "string", minLength: 6 },
        currentPassword: { type: "string" },
      },
      { partial: true }
    ),
    updateUser
  )
  .delete(validateId, adminOnly, deleteUser);

module.exports = router;
