// Names here match backend/utils/constants.js exactly.

export const CLASSIFICATIONS = {
  NATURAL: "Natural Phenomenon",
  INTERFERENCE: "Human-Made Interference",
  UNKNOWN: "Unknown Signal",
  POTENTIAL: "Potential Artificial Signal",
};

export const CLASSIFICATION_LIST = Object.values(CLASSIFICATIONS);

// One colour per classification (used by badges and charts)
export const CLASS_COLORS = {
  "Natural Phenomenon": "#34d399",
  "Human-Made Interference": "#fbbf24",
  "Unknown Signal": "#94a3b8",
  "Potential Artificial Signal": "#8b5cf6",
};

export const VERIFICATION_STATUSES = [
  "Detected",
  "Under Investigation",
  "Interference Suspected",
  "Repeated Observation Required",
  "Verified as Natural",
  "Unconfirmed Candidate",
];

export const VERIFICATION_COLORS = {
  Detected: "#4f8cff",
  "Under Investigation": "#22d3ee",
  "Interference Suspected": "#fbbf24",
  "Repeated Observation Required": "#fb923c",
  "Verified as Natural": "#34d399",
  "Unconfirmed Candidate": "#8b5cf6",
};

export const SIGNAL_PATTERNS = [
  "Steady Carrier",
  "Drifting Carrier",
  "Periodic Pulses",
  "Single Burst",
  "Drifting Burst",
  "Noise-like",
  "Irregular",
  "Unknown",
];

export const OBSERVATION_TYPES = ["Radio Signal", "Optical Signal", "Infrared Signal", "Other"];
export const OBSERVATION_STATUSES = ["Pending", "Under Review", "Analyzed", "Archived"];

export const STATUS_COLORS = {
  Pending: "#fbbf24",
  "Under Review": "#22d3ee",
  Analyzed: "#34d399",
  Archived: "#94a3b8",
};

export const DEMO_ACCOUNTS = [
  { label: "Researcher", email: "researcher@fermiscope.com", password: "Researcher@123" },
  { label: "Administrator", email: "admin@fermiscope.com", password: "Admin@123" },
];

export const SIMULATION_LABEL = "SIMULATED EDUCATIONAL DATA - not a real astronomical discovery";
