// Shared constants used by models, services and controllers.
// Keeping them in ONE file means the frontend and backend always agree on the names.

const ROLES = ["researcher", "admin"];

const CLASSIFICATIONS = {
  NATURAL: "Natural Phenomenon",
  INTERFERENCE: "Human-Made Interference",
  UNKNOWN: "Unknown Signal",
  POTENTIAL: "Potential Artificial Signal",
};

const CLASSIFICATION_LIST = Object.values(CLASSIFICATIONS);

const VERIFICATION_STATUSES = [
  "Detected",
  "Under Investigation",
  "Interference Suspected",
  "Repeated Observation Required",
  "Verified as Natural",
  "Unconfirmed Candidate",
];

const SIGNAL_PATTERNS = [
  "Steady Carrier",
  "Drifting Carrier",
  "Periodic Pulses",
  "Single Burst",
  "Drifting Burst",
  "Noise-like",
  "Irregular",
  "Unknown",
];

const OBSERVATION_TYPES = [
  "Radio Signal",
  "Optical Signal",
  "Infrared Signal",
  "Other",
];

const OBSERVATION_STATUSES = ["Pending", "Under Review", "Analyzed", "Archived"];

const SIMULATION_LABEL = "SIMULATED EDUCATIONAL DATA - not a real astronomical discovery";

module.exports = {
  ROLES,
  CLASSIFICATIONS,
  CLASSIFICATION_LIST,
  VERIFICATION_STATUSES,
  SIGNAL_PATTERNS,
  OBSERVATION_TYPES,
  OBSERVATION_STATUSES,
  SIMULATION_LABEL,
};
