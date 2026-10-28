// adminOnly: must be used AFTER protect. Only administrators can continue.
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403);
  next(new Error("Access denied: administrators only"));
};

module.exports = { adminOnly };
