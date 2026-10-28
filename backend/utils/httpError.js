// An Error that also carries an HTTP status code.
// Usage:  throw new HttpError(404, "Observation not found");
class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = HttpError;
