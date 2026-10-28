// Express 4 does not catch errors thrown inside async functions.
// This small wrapper sends them to our error middleware instead.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
