const mongoose = require("mongoose");
const HttpError = require("../utils/httpError");

// Checks that :id in the URL is a valid MongoDB id
const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new HttpError(400, "Invalid ID format"));
  }
  next();
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * validateBody(rules, options)
 *
 * Example rules:
 *   {
 *     title: { required: true, type: "string", minLength: 3 },
 *     frequency: { type: "number", min: 0 },
 *     observationType: { type: "string", enum: ["Radio Signal", "Other"] },
 *   }
 *
 * Supported types: string, number, boolean, date, email, array, id
 * options.partial = true -> "required" is ignored (used for PUT updates)
 */
const validateBody = (rules, options = {}) => (req, res, next) => {
  const errors = [];
  const body = req.body || {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = body[field];
    const isEmpty = value === undefined || value === null || value === "";

    if (isEmpty) {
      if (rule.required && !options.partial) errors.push(`${field} is required`);
      continue;
    }

    switch (rule.type) {
      case "string":
      case "email":
        if (typeof value !== "string") {
          errors.push(`${field} must be text`);
          break;
        }
        if (rule.type === "email" && !EMAIL_REGEX.test(value)) {
          errors.push(`${field} must be a valid email`);
        }
        if (rule.minLength && value.trim().length < rule.minLength) {
          errors.push(`${field} must be at least ${rule.minLength} characters`);
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${field} must be at most ${rule.maxLength} characters`);
        }
        break;

      case "number": {
        const n = typeof value === "boolean" ? NaN : Number(value);
        if (Number.isNaN(n)) {
          errors.push(`${field} must be a number`);
        } else {
          if (rule.min !== undefined && n < rule.min) errors.push(`${field} must be at least ${rule.min}`);
          if (rule.max !== undefined && n > rule.max) errors.push(`${field} must be at most ${rule.max}`);
        }
        break;
      }

      case "boolean":
        if (![true, false, "true", "false"].includes(value)) {
          errors.push(`${field} must be true or false`);
        }
        break;

      case "date":
        if (Number.isNaN(Date.parse(value))) errors.push(`${field} must be a valid date`);
        break;

      case "array":
        if (!Array.isArray(value)) errors.push(`${field} must be a list`);
        break;

      case "id":
        if (!mongoose.Types.ObjectId.isValid(value)) errors.push(`${field} must be a valid ID`);
        break;

      default:
        break;
    }

    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rule.enum.join(", ")}`);
    }
  }

  if (errors.length > 0) {
    return next(new HttpError(400, errors.join(". ")));
  }
  next();
};

module.exports = { validateId, validateBody };
