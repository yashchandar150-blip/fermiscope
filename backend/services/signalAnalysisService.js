/**
 * FermiScope - Signal Analysis Service (the core engine)
 * -------------------------------------------------------
 * A SIMPLE, TRANSPARENT, RULE-BASED engine for educational use.
 *
 * What it does:
 *   1. normalizeInput()     - cleans the raw form data
 *   2. extractFeatures()    - evaluates frequency, strength, bandwidth, duration, ...
 *   3. evaluateXxx()        - checks the rules for each classification
 *   4. analyzeSignal()      - applies the 4-step logic and builds the final result
 *
 * What it does NOT do:
 *   - It cannot detect or prove extraterrestrial life.
 *   - The confidence score is "how strongly our rules matched",
 *     NOT the probability that aliens exist.
 *   - There is NO randomness anywhere in this file.
 *
 * Units used everywhere:
 *   frequency  -> MHz
 *   strength   -> dB (signal-to-noise ratio)
 *   duration   -> seconds
 *   bandwidth  -> Hz
 */

const {
  CLASSIFICATIONS,
  SIGNAL_PATTERNS,
} = require("../utils/constants");

// ---------------------------------------------------------------------------
// 1. SETTINGS - every threshold is here so it is easy to explain and change
// ---------------------------------------------------------------------------
const SETTINGS = {
  narrowbandMaxHz: 1000, // bandwidth <= 1 kHz  -> "narrowband"
  veryNarrowbandMaxHz: 10, // bandwidth <= 10 Hz  -> "very narrowband"
  broadbandMinHz: 100000, // bandwidth >= 100 kHz -> "broadband"

  strongSnrDb: 10, // SNR >= 10 dB is "strong"
  veryStrongSnrDb: 20,
  moderateSnrDb: 5,
  sustainedDurationSec: 60, // duration >= 60 s is "sustained"

  hydrogenLineMHz: 1420.405, // neutral hydrogen line
  hydrogenToleranceMHz: 1,
  waterHoleMinMHz: 1420, // the "water hole" quiet region (H line to OH lines)
  waterHoleMaxMHz: 1666,

  candidateMinScore: 60, // minimum points for "Potential Artificial Signal"
  maxConfidence: 95, // no rule-based result is ever shown as 100% sure
};

// Simplified table of well-known human-made radio bands (approximate, for education)
const KNOWN_INTERFERENCE_BANDS = [
  { name: "FM radio broadcast", minMHz: 87.5, maxMHz: 108 },
  { name: "Aircraft VHF communication", minMHz: 118, maxMHz: 137 },
  { name: "VHF television broadcast", minMHz: 174, maxMHz: 230 },
  { name: "UHF television broadcast", minMHz: 470, maxMHz: 698 },
  { name: "Mobile phone (GSM 900 and nearby bands)", minMHz: 698, maxMHz: 960 },
  { name: "L-band air traffic radar", minMHz: 1300, maxMHz: 1350 },
  { name: "GNSS navigation (GPS L5/L2, Galileo E6)", minMHz: 1164, maxMHz: 1300 },
  { name: "Satellite mobile downlink (L-band)", minMHz: 1525, maxMHz: 1559 },
  { name: "GNSS navigation (GPS L1, GLONASS)", minMHz: 1559, maxMHz: 1610 },
  { name: "Iridium satellite phones", minMHz: 1610, maxMHz: 1626.5 },
  { name: "Mobile phone (LTE / UMTS)", minMHz: 1710, maxMHz: 2170 },
  { name: "Wi-Fi / Bluetooth (2.4 GHz)", minMHz: 2400, maxMHz: 2483.5 },
  { name: "Wi-Fi (5 GHz)", minMHz: 5150, maxMHz: 5850 },
];

// Pattern groups
const STABLE_PATTERNS = ["Steady Carrier", "Drifting Carrier", "Periodic Pulses"];
const UNSTABLE_PATTERNS = ["Single Burst", "Drifting Burst", "Noise-like", "Irregular"];
const NATURAL_TYPE_PATTERNS = ["Noise-like", "Periodic Pulses", "Drifting Burst"];

// ---------------------------------------------------------------------------
// 2. SMALL HELPER FUNCTIONS
// ---------------------------------------------------------------------------
function toNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toBool(value) {
  return value === true || value === "true" || value === "on" || value === 1;
}

function sumPoints(items) {
  return items.reduce((total, item) => total + item.points, 0);
}

function cap(score) {
  return Math.min(score, SETTINGS.maxConfidence);
}

function fmt(n) {
  return Number(n).toLocaleString("en-US", { maximumFractionDigits: 3 });
}

// ---------------------------------------------------------------------------
// 3. INPUT NORMALIZATION
// ---------------------------------------------------------------------------
function normalizeInput(raw = {}) {
  const text = (v) => (v === undefined || v === null ? "" : String(v).trim());

  return {
    signalName: text(raw.signalName) || "Unnamed signal",
    source: text(raw.source),
    observationDate: raw.observationDate || null,
    celestialObject: text(raw.celestialObject),
    frequency: toNumber(raw.frequency),
    signalStrength: toNumber(raw.signalStrength),
    duration: toNumber(raw.duration),
    bandwidth: toNumber(raw.bandwidth),
    signalPattern: SIGNAL_PATTERNS.includes(raw.signalPattern)
      ? raw.signalPattern
      : "Unknown",
    isRepeated: toBool(raw.isRepeated),
    isKnownInterference: toBool(raw.isKnownInterference),
    isKnownNaturalPattern: toBool(raw.isKnownNaturalPattern),
    signalNotes: text(raw.signalNotes),
  };
}

// ---------------------------------------------------------------------------
// 4. FEATURE EXTRACTION
// ---------------------------------------------------------------------------
function extractFeatures(input) {
  const { frequency, signalStrength, duration, bandwidth, signalPattern } = input;

  // Bandwidth category
  let bandwidthCategory = "Unknown";
  if (bandwidth !== null) {
    if (bandwidth <= SETTINGS.narrowbandMaxHz) bandwidthCategory = "Narrowband";
    else if (bandwidth >= SETTINGS.broadbandMinHz) bandwidthCategory = "Broadband";
    else bandwidthCategory = "Intermediate";
  }
  const isNarrowband = bandwidthCategory === "Narrowband";
  const isVeryNarrowband = bandwidth !== null && bandwidth <= SETTINGS.veryNarrowbandMaxHz;
  const isBroadband = bandwidthCategory === "Broadband";

  // Strength category
  let strengthCategory = "Unknown";
  if (signalStrength !== null) {
    if (signalStrength >= SETTINGS.veryStrongSnrDb) strengthCategory = "Very strong";
    else if (signalStrength >= SETTINGS.strongSnrDb) strengthCategory = "Strong";
    else if (signalStrength >= SETTINGS.moderateSnrDb) strengthCategory = "Moderate";
    else strengthCategory = "Weak";
  }
  const isStrong = signalStrength !== null && signalStrength >= SETTINGS.strongSnrDb;

  // Duration category
  let durationCategory = "Unknown";
  if (duration !== null) {
    durationCategory = duration >= SETTINGS.sustainedDurationSec ? "Sustained" : "Short";
  }
  const isSustained = durationCategory === "Sustained";

  // Stability (based on the pattern the researcher selected)
  let stability = "Unknown";
  if (STABLE_PATTERNS.includes(signalPattern)) stability = "Stable";
  else if (UNSTABLE_PATTERNS.includes(signalPattern)) stability = "Unstable";
  const isStable = stability === "Stable";

  // Frequency checks
  const interferenceBand =
    frequency === null
      ? null
      : KNOWN_INTERFERENCE_BANDS.find(
          (band) => frequency >= band.minMHz && frequency <= band.maxMHz
        ) || null;

  const atHydrogenLine =
    frequency !== null &&
    Math.abs(frequency - SETTINGS.hydrogenLineMHz) <= SETTINGS.hydrogenToleranceMHz;

  const inWaterHole =
    frequency !== null &&
    frequency >= SETTINGS.waterHoleMinMHz &&
    frequency <= SETTINGS.waterHoleMaxMHz;

  // "Unusual" here only means: in the quiet water-hole region AND not explained by our tables
  const isUnusualFrequency = inWaterHole && !interferenceBand && !atHydrogenLine;

  // Missing information
  const missingFields = [];
  if (bandwidth === null) missingFields.push("bandwidth");
  if (duration === null) missingFields.push("duration");
  if (signalPattern === "Unknown") missingFields.push("signal pattern");
  const insufficientInfo = missingFields.length > 0;

  // Unusual characteristics (for display)
  const unusualCharacteristics = [];
  if (isNarrowband) {
    unusualCharacteristics.push(
      `Narrowband signal (${fmt(bandwidth)} Hz bandwidth)` +
        (isVeryNarrowband ? " - very narrow" : "")
    );
  }
  if (input.isRepeated) unusualCharacteristics.push("Detected more than once");
  if (isStable) unusualCharacteristics.push(`Stable pattern (${signalPattern})`);
  if (isUnusualFrequency) {
    unusualCharacteristics.push(
      `Frequency ${fmt(frequency)} MHz lies in the radio-quiet "water hole" region and matches no known interference band`
    );
  }
  if (isStrong) unusualCharacteristics.push(`Strong signal (${fmt(signalStrength)} dB SNR)`);
  if (isSustained) unusualCharacteristics.push(`Sustained for ${fmt(duration)} s`);

  return {
    bandwidthCategory,
    isNarrowband,
    isVeryNarrowband,
    isBroadband,
    strengthCategory,
    isStrong,
    durationCategory,
    isSustained,
    stability,
    isStable,
    interferenceBand: interferenceBand ? interferenceBand.name : null,
    atHydrogenLine,
    inWaterHole,
    isUnusualFrequency,
    missingFields,
    insufficientInfo,
    unusualCharacteristics,
  };
}

// ---------------------------------------------------------------------------
// 5. RULE CHECKS
// ---------------------------------------------------------------------------

// Step 1 rule: known human-made interference
function evaluateInterference(input, features) {
  const evidence = [];
  const reasons = [];

  if (features.interferenceBand) {
    evidence.push({
      label: `Frequency falls inside a known human-made band (${features.interferenceBand})`,
      points: 45,
    });
    reasons.push(`Frequency ${fmt(input.frequency)} MHz is inside: ${features.interferenceBand}`);
  }
  if (input.isKnownInterference) {
    evidence.push({
      label: "Researcher flagged the signal as known interference",
      points: 30,
    });
    reasons.push("Researcher marked this signal as known interference");
  }

  const matched = evidence.length > 0;
  if (matched) {
    evidence.unshift({ label: "Interference rule matched (base points)", points: 20 });
    if (input.signalPattern === "Steady Carrier" && input.isRepeated) {
      evidence.push({
        label: "Steady carrier that repeats, typical of a terrestrial transmitter",
        points: 10,
      });
    }
  }

  return { matched, evidence, reasons };
}

// Step 2 rule: known natural astronomical pattern
function evaluateNatural(input, features) {
  const evidence = [];
  const reasons = [];

  if (features.atHydrogenLine) {
    evidence.push({
      label: `Frequency is at the neutral hydrogen line (${SETTINGS.hydrogenLineMHz} MHz)`,
      points: 30,
    });
    reasons.push("Frequency matches the 21 cm neutral hydrogen emission line");
  }
  if (input.isKnownNaturalPattern) {
    evidence.push({
      label: "Researcher flagged a known natural pattern",
      points: 30,
    });
    reasons.push("Researcher marked this signal as a known natural pattern");
  }
  if (features.isBroadband && NATURAL_TYPE_PATTERNS.includes(input.signalPattern)) {
    evidence.push({
      label: `Broadband ${input.signalPattern.toLowerCase()} pattern resembles natural emission (pulsar, solar burst or thermal noise)`,
      points: 20,
    });
    reasons.push(
      `Broadband "${input.signalPattern}" pattern is typical of natural sources such as pulsars or solar bursts`
    );
  }

  const matched = evidence.length > 0;
  if (matched) {
    evidence.unshift({ label: "Natural-pattern rule matched (base points)", points: 20 });
    if (input.signalPattern === "Periodic Pulses" && input.isRepeated && features.isBroadband) {
      evidence.push({
        label: "Regular repeating pulses, like pulsar timing",
        points: 15,
      });
    }
  }

  return { matched, evidence, reasons };
}

// Step 3 rule: candidate criteria ("Potential Artificial Signal")
function evaluateCandidate(input, features) {
  const evidence = [];

  if (features.isNarrowband) {
    evidence.push({ label: "Narrowband signal (<= 1 kHz)", points: 25 });
  }
  if (features.isVeryNarrowband) {
    evidence.push({ label: "Very narrow bandwidth (<= 10 Hz)", points: 5 });
  }
  if (input.isRepeated) {
    evidence.push({ label: "Repeated detection", points: 20 });
  }
  if (features.isStable) {
    evidence.push({ label: "Stable signal pattern", points: 15 });
  }
  if (features.isUnusualFrequency) {
    evidence.push({ label: "Unusual frequency (radio-quiet water hole, not in interference table)", points: 10 });
  }
  if (features.isStrong) {
    evidence.push({ label: "Strong signal (SNR >= 10 dB)", points: 10 });
  }
  if (features.isSustained) {
    evidence.push({ label: "Sustained duration (>= 60 s)", points: 10 });
  }

  const score = cap(sumPoints(evidence));

  // Candidate criteria: narrowband AND repeated AND enough points.
  // (A narrowband signal alone, or an unusual frequency alone, is NOT enough.)
  const isCandidate =
    features.isNarrowband && input.isRepeated && score >= SETTINGS.candidateMinScore;

  return { evidence, score, isCandidate };
}

// ---------------------------------------------------------------------------
// 6. TEXT BUILDERS (explanations, alternatives, next steps)
// ---------------------------------------------------------------------------
const PRELIMINARY_NOTE =
  "This is a preliminary, rule-based research result. It is NOT scientific verification.";

function buildAlternatives(classification) {
  switch (classification) {
    case CLASSIFICATIONS.POTENTIAL:
      return [
        "Undetected human-made interference (satellite, aircraft, radar, or an unlisted local transmitter)",
        "Reflection or intermodulation of a terrestrial transmitter",
        "Instrument or receiver artifact (for example an internal oscillator)",
        "A rare natural process such as maser emission",
        "Data-processing error or mislabeled observation",
      ];
    case CLASSIFICATIONS.INTERFERENCE:
      return [
        "A natural source that coincidentally overlaps the same band (unlikely, but check with off-source pointing)",
        "Interference from a different transmitter than the one assumed",
        "Receiver or cable artifact producing a similar signal",
      ];
    case CLASSIFICATIONS.NATURAL:
      return [
        "Terrestrial interference that mimics a natural spectrum",
        "A different natural source than the one assumed",
        "Instrument noise or calibration effects",
      ];
    default:
      return [
        "Insufficient data: more measurements may make the signal easy to classify",
        "A short-lived terrestrial interference event",
        "Instrument glitch or cosmic-ray hit on the detector",
        "A natural transient that this simple rule set does not cover",
      ];
  }
}

function buildNextSteps(classification, input) {
  switch (classification) {
    case CLASSIFICATIONS.POTENTIAL:
      return [
        "Re-observe the same target on different nights to confirm the signal repeats",
        "Run an ON-OFF pointing test: a real celestial signal should disappear when the telescope points away",
        "Check the Doppler drift: it should be consistent with Earth's rotation and the target's motion",
        "Compare with satellite, aircraft and local transmitter databases for the observation time",
        "Ask an independent observatory to observe the same position",
        "Follow established SETI verification and post-detection procedures before any public claim",
      ];
    case CLASSIFICATIONS.INTERFERENCE:
      return [
        "Record the likely source (broadcast, satellite, radar, Wi-Fi) in the research notes",
        "Add the frequency to your local interference list",
        "Repeat the observation at a quieter time or location to confirm the interference is gone",
      ];
    case CLASSIFICATIONS.NATURAL:
      return [
        "Compare with catalogues of known natural sources (hydrogen line surveys, pulsar catalogues)",
        "Document the result and mark the verification status after review",
        "Use the signal as a calibration reference for later observations",
      ];
    default: {
      const steps = [];
      if (!input.isRepeated) {
        steps.push("Observe the same target again: a single detection cannot be classified reliably");
      }
      steps.push("Measure bandwidth, duration and pattern more precisely");
      steps.push("Check nearby frequencies and times for interference");
      steps.push("Add detailed notes so another researcher can review the data");
      return steps;
    }
  }
}

function describeList(items) {
  return items.length ? items.join("; ") : "no unusual features";
}

// ---------------------------------------------------------------------------
// 7. BUILD THE "EXTRACTED FEATURES" TABLE SHOWN ON THE RESULT PAGE
// ---------------------------------------------------------------------------
function buildFeatureTable(input, f, interference, natural) {
  const rows = [];

  rows.push({
    feature: "Frequency",
    value: input.frequency === null ? "Not provided" : `${fmt(input.frequency)} MHz`,
    note: f.interferenceBand
      ? `Inside known human-made band: ${f.interferenceBand}`
      : f.atHydrogenLine
      ? "At the neutral hydrogen line (21 cm)"
      : f.inWaterHole
      ? "Inside the radio-quiet water-hole region (1420-1666 MHz)"
      : "Not in any band from the simplified rule tables",
  });
  rows.push({
    feature: "Signal strength",
    value: input.signalStrength === null ? "Not provided" : `${fmt(input.signalStrength)} dB (SNR)`,
    note: f.strengthCategory,
  });
  rows.push({
    feature: "Duration",
    value: input.duration === null ? "Not provided" : `${fmt(input.duration)} s`,
    note: f.durationCategory,
  });
  rows.push({
    feature: "Bandwidth",
    value: input.bandwidth === null ? "Not provided" : `${fmt(input.bandwidth)} Hz`,
    note: f.isVeryNarrowband ? "Very narrow" : f.bandwidthCategory,
  });
  rows.push({
    feature: "Narrowband / broadband",
    value: f.bandwidthCategory,
    note: "Narrowband <= 1 kHz, broadband >= 100 kHz",
  });
  rows.push({
    feature: "Repeated detection",
    value: input.isRepeated ? "Yes" : "No",
    note: input.isRepeated ? "Seen more than once" : "Single detection so far",
  });
  rows.push({
    feature: "Signal stability",
    value: f.stability,
    note: `Pattern: ${input.signalPattern}`,
  });
  rows.push({
    feature: "Possible interference",
    value: interference.matched ? "Yes" : "No",
    note: interference.matched ? interference.reasons.join("; ") : "No known interference match",
  });
  rows.push({
    feature: "Known natural pattern",
    value: natural.matched ? "Yes" : "No",
    note: natural.matched ? natural.reasons.join("; ") : "No known natural match",
  });
  rows.push({
    feature: "Unusual characteristics",
    value: f.unusualCharacteristics.length ? `${f.unusualCharacteristics.length} found` : "None",
    note: describeList(f.unusualCharacteristics),
  });

  return rows;
}

// ---------------------------------------------------------------------------
// 8. MAIN FUNCTION: analyzeSignal
// ---------------------------------------------------------------------------
function analyzeSignal(rawInput) {
  const input = normalizeInput(rawInput);
  const features = extractFeatures(input);

  const interference = evaluateInterference(input, features);
  const natural = evaluateNatural(input, features);
  const candidate = evaluateCandidate(input, features);

  let classification;
  let confidenceBreakdown;
  let explanation;
  let matchedFeatures;
  let suggestedVerificationStatus;

  if (interference.matched) {
    // STEP 1
    classification = CLASSIFICATIONS.INTERFERENCE;
    confidenceBreakdown = interference.evidence;
    matchedFeatures = interference.reasons;
    suggestedVerificationStatus = "Interference Suspected";
    explanation =
      `The signal matches known human-made interference: ${interference.reasons.join("; ")}. ` +
      `Step 1 of the rules stops here, so other possibilities were not scored. ` +
      PRELIMINARY_NOTE;
  } else if (natural.matched) {
    // STEP 2
    classification = CLASSIFICATIONS.NATURAL;
    confidenceBreakdown = natural.evidence;
    matchedFeatures = natural.reasons;
    suggestedVerificationStatus = "Detected";
    explanation =
      `The signal matches a known natural astronomical pattern: ${natural.reasons.join("; ")}. ` +
      `A researcher must still review the data before marking it "Verified as Natural". ` +
      PRELIMINARY_NOTE;
  } else if (candidate.isCandidate) {
    // STEP 3
    classification = CLASSIFICATIONS.POTENTIAL;
    confidenceBreakdown = candidate.evidence;
    matchedFeatures = features.unusualCharacteristics;
    suggestedVerificationStatus = "Unconfirmed Candidate";
    explanation =
      `The signal matched no known interference or natural rule, and it meets the candidate criteria ` +
      `(narrowband, repeated, and at least ${SETTINGS.candidateMinScore} rule points): ` +
      `${describeList(features.unusualCharacteristics)}. ` +
      `It is therefore listed as a Potential Artificial Signal - an UNCONFIRMED CANDIDATE. ` +
      `Its origin has NOT been scientifically verified, and ordinary explanations such as undetected ` +
      `interference or instrument artifacts remain much more likely. ` +
      PRELIMINARY_NOTE;
  } else {
    // STEP 4
    classification = CLASSIFICATIONS.UNKNOWN;
    confidenceBreakdown = [{ label: "No interference, natural or candidate rule applied (base points)", points: 30 }];
    if (features.insufficientInfo) {
      confidenceBreakdown.push({
        label: `Information is missing: ${features.missingFields.join(", ")}`,
        points: 20,
      });
    }
    if (candidate.score >= 20) {
      confidenceBreakdown.push({
        label: "Some unusual features are present, but the candidate criteria are not met",
        points: 10,
      });
    }
    matchedFeatures = features.unusualCharacteristics;
    suggestedVerificationStatus = input.isRepeated
      ? "Under Investigation"
      : "Repeated Observation Required";

    const reasons = [];
    if (features.insufficientInfo) {
      reasons.push(`there is not enough information (missing ${features.missingFields.join(", ")})`);
    }
    if (!input.isRepeated) reasons.push("the signal has been detected only once");
    if (features.isNarrowband && !input.isRepeated) {
      reasons.push("a narrowband signal alone is not enough to be a candidate");
    }
    if (!reasons.length) reasons.push("the features do not meet the candidate criteria");

    explanation =
      `The rules cannot place this signal in a more specific class because ${reasons.join(", ")}. ` +
      `It is classified as Unknown Signal. ` +
      PRELIMINARY_NOTE;
  }

  const confidenceScore = cap(sumPoints(confidenceBreakdown));

  // Rule trace (shows which of the 4 steps decided the result)
  const decidedAt = interference.matched ? 1 : natural.matched ? 2 : candidate.isCandidate ? 3 : 4;
  const skipped = (step) => step > decidedAt;
  const ruleTrace = [
    {
      step: 1,
      rule: "Does it match known human-made interference?",
      outcome: interference.matched ? "Matched" : "Not matched",
      detail: interference.matched
        ? interference.reasons.join("; ")
        : "No known interference band and no researcher interference flag",
    },
    {
      step: 2,
      rule: "Does it match a known natural astronomical pattern?",
      outcome: skipped(2) ? "Skipped" : natural.matched ? "Matched" : "Not matched",
      detail: skipped(2)
        ? "Not checked because step 1 already matched"
        : natural.matched
        ? natural.reasons.join("; ")
        : "No hydrogen-line match, natural flag or natural-type broadband pattern",
    },
    {
      step: 3,
      rule: "Does it meet the candidate criteria?",
      outcome: skipped(3) ? "Skipped" : candidate.isCandidate ? "Matched" : "Not matched",
      detail: skipped(3)
        ? "Not checked because an earlier step matched"
        : `Narrowband: ${features.isNarrowband ? "yes" : "no"}; repeated: ${
            input.isRepeated ? "yes" : "no"
          }; rule points: ${candidate.score} (needs ${SETTINGS.candidateMinScore})`,
    },
    {
      step: 4,
      rule: "Insufficient information or no rule matched?",
      outcome: decidedAt === 4 ? "Applied" : "Not needed",
      detail:
        decidedAt === 4
          ? "Classified as Unknown Signal"
          : "An earlier step already produced a classification",
    },
  ];

  return {
    input,
    classification,
    confidenceScore,
    confidenceBreakdown,
    classificationExplanation: explanation,
    matchedFeatures,
    alternativeExplanations: buildAlternatives(classification),
    nextSteps: buildNextSteps(classification, input),
    suggestedVerificationStatus,
    isUnconfirmedCandidate: classification === CLASSIFICATIONS.POTENTIAL,
    isNarrowband: features.isNarrowband,
    extractedFeatures: {
      ...features,
      table: buildFeatureTable(input, features, interference, natural),
      candidateScore: candidate.score,
    },
    ruleTrace,
    disclaimer:
      "Preliminary rule-based result for educational use. It does not prove the existence of extraterrestrial life. " +
      "Any Potential Artificial Signal is an UNCONFIRMED CANDIDATE requiring further scientific verification.",
  };
}

// Builds a plain object that is ready to be saved as a SignalAnalysis document
function buildAnalysisRecord(rawInput) {
  const result = analyzeSignal(rawInput);
  const { input } = result;

  return {
    signalName: input.signalName,
    source: input.source,
    observationDate: input.observationDate,
    celestialObject: input.celestialObject,
    frequency: input.frequency,
    signalStrength: input.signalStrength,
    duration: input.duration,
    bandwidth: input.bandwidth,
    signalPattern: input.signalPattern,
    isNarrowband: result.isNarrowband,
    isRepeated: input.isRepeated,
    isKnownInterference: input.isKnownInterference,
    isKnownNaturalPattern: input.isKnownNaturalPattern,
    signalNotes: input.signalNotes,
    classification: result.classification,
    confidenceScore: result.confidenceScore,
    confidenceBreakdown: result.confidenceBreakdown,
    classificationExplanation: result.classificationExplanation,
    matchedFeatures: result.matchedFeatures,
    alternativeExplanations: result.alternativeExplanations,
    nextSteps: result.nextSteps,
    extractedFeatures: result.extractedFeatures,
    ruleTrace: result.ruleTrace,
    isUnconfirmedCandidate: result.isUnconfirmedCandidate,
    suggestedVerificationStatus: result.suggestedVerificationStatus,
  };
}

module.exports = {
  SETTINGS,
  KNOWN_INTERFERENCE_BANDS,
  normalizeInput,
  extractFeatures,
  analyzeSignal,
  buildAnalysisRecord,
};
