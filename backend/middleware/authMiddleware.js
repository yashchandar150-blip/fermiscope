const jwt = require("jsonwebtoken");
const User = require("../models/User");

// protect: only logged-in users (valid JWT) can continue
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("Not authorized: no token provided");
    }

    const token = header.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      res.status(401);
      throw new Error("Not authorized: token is invalid or expired");
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(401);
      throw new Error("Not authorized: user no longer exists");
    }

    req.user = user; // available in every controller after this
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
