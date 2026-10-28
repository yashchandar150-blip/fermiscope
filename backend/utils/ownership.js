const HttpError = require("./httpError");

// True when the logged-in user owns the record OR is an administrator
const isOwnerOrAdmin = (ownerId, user) => {
  if (user.role === "admin") return true;
  const id = ownerId && ownerId._id ? ownerId._id : ownerId;
  return String(id) === String(user._id);
};

// Throws 403 if the user is not allowed to touch the record
const assertOwnerOrAdmin = (ownerId, user) => {
  if (!isOwnerOrAdmin(ownerId, user)) {
    throw new HttpError(403, "You are not allowed to access this record");
  }
};

// Researchers only see their own records, admins see everything.
// ownerField is the name of the field that stores the owner id.
const ownerFilter = (user, ownerField) => {
  return user.role === "admin" ? {} : { [ownerField]: user._id };
};

// Makes a user-typed search string safe to use inside a RegExp
const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = { isOwnerOrAdmin, assertOwnerOrAdmin, ownerFilter, escapeRegex };
