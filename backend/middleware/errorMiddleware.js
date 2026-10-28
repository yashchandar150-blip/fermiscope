// Runs when a request URL does not match any route
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Central error handler: every error ends up here
const errorHandler = (err, req, res, next) => {
  // HttpError carries statusCode; otherwise use the status already set on res; otherwise 500
  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message;

  // Invalid MongoDB id, e.g. /api/observations/abc
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose validation problems
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Duplicate unique value (e.g. same email twice)
  if (err.code === 11000) {
    statusCode = 409;
    message = `${Object.keys(err.keyValue || {}).join(", ")} already exists`;
  }

  // Broken JSON body
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON in request body";
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
