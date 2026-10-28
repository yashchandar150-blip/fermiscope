// SIMULATED EDUCATIONAL SAMPLE SIGNALS
// ------------------------------------
// None of these are real astronomical detections. They are invented so that
// students can see how each classification is reached by the rule engine.
//
// "expected*" fields are what the engine SHOULD produce. The test script
// (npm run test:engine) checks that the real engine output matches them.

const sampleSignals = [
  {
    code: "SIM-NAT-001",
    name: "Hydrogen Line Emission (Simulated)",
    description:
      "A broad, noise-like emission centred on the 21 cm neutral hydrogen line, like the one seen along the Milky Way plane.",
    source: "Simulated Radio Telescope A",
    celestialObject: "Galactic Plane (simulated field)",
    frequency: 1420.405,
    signalStrength: 18,
    duration: 600,
    bandwidth: 500000,
    signalPattern: "Noise-like",
    isRepeated: true,
    isKnownInterference: false,
    isKnownNaturalPattern: false,
    signalNotes: "Simulated educational data. Typical hydrogen-line spectrum.",
    expectedClassification: "Natural Phenomenon",
    expectedConfidence: 70,
    expectedVerificationStatus: "Detected",
    expectedExplanation:
      "The frequency sits on the neutral hydrogen line and the emission is broadband and noise-like, which is typical of natural gas clouds. No interference rule matched.",
  },
  {
    code: "SIM-NAT-002",
    name: "Pulsar-like Periodic Pulses (Simulated)",
    description:
      "Regular, broadband pulses with very stable timing, similar to a rotating neutron star (pulsar).",
    source: "Simulated Radio Telescope B",
    celestialObject: "Simulated pulsar field",
    frequency: 408,
    signalStrength: 12,
    duration: 1200,
    bandwidth: 2000000,
    signalPattern: "Periodic Pulses",
    isRepeated: true,
    isKnownInterference: false,
    isKnownNaturalPattern: false,
    signalNotes: "Simulated educational data. Regular pulses with broadband spectrum.",
    expectedClassification: "Natural Phenomenon",
    expectedConfidence: 55,
    expectedVerificationStatus: "Detected",
    expectedExplanation:
      "Broadband periodic pulses resemble the timing of a pulsar. The natural-pattern rule matched, so the signal is classified as natural.",
  },
  {
    code: "SIM-INT-001",
    name: "FM Broadcast Leakage (Simulated)",
    description:
      "A strong steady carrier at a common FM radio frequency leaking into the receiver.",
    source: "Simulated Radio Telescope A",
    celestialObject: "Not tied to a celestial object (simulated)",
    frequency: 98.5,
    signalStrength: 35,
    duration: 3600,
    bandwidth: 200000,
    signalPattern: "Steady Carrier",
    isRepeated: true,
    isKnownInterference: false,
    isKnownNaturalPattern: false,
    signalNotes: "Simulated educational data. Typical terrestrial radio leakage.",
    expectedClassification: "Human-Made Interference",
    expectedConfidence: 75,
    expectedVerificationStatus: "Interference Suspected",
    expectedExplanation:
      "The frequency is inside the FM broadcast band and the signal is a steady carrier that repeats, which is typical of a terrestrial transmitter.",
  },
  {
    code: "SIM-UNK-001",
    name: "Short Burst with Missing Data (Simulated)",
    description:
      "A single, brief burst. The bandwidth was not recorded, so the rules cannot judge it properly.",
    source: "Simulated Radio Telescope C",
    celestialObject: "Simulated target field",
    frequency: 3250,
    signalStrength: 6,
    duration: 2,
    bandwidth: null,
    signalPattern: "Single Burst",
    isRepeated: false,
    isKnownInterference: false,
    isKnownNaturalPattern: false,
    signalNotes: "Simulated educational data. Bandwidth missing on purpose.",
    expectedClassification: "Unknown Signal",
    expectedConfidence: 50,
    expectedVerificationStatus: "Repeated Observation Required",
    expectedExplanation:
      "Bandwidth is missing and the burst was seen only once, so there is not enough information to match any rule.",
  },
  {
    code: "SIM-UNK-002",
    name: "Narrowband Single Detection (Simulated)",
    description:
      "A narrow, steady signal seen only one time. It looks interesting, but one detection is not enough.",
    source: "Simulated Radio Telescope B",
    celestialObject: "Simulated target field",
    frequency: 1650,
    signalStrength: 15,
    duration: 90,
    bandwidth: 8,
    signalPattern: "Steady Carrier",
    isRepeated: false,
    isKnownInterference: false,
    isKnownNaturalPattern: false,
    signalNotes:
      "Simulated educational data. Shows that a narrowband signal alone is not a candidate.",
    expectedClassification: "Unknown Signal",
    expectedConfidence: 40,
    expectedVerificationStatus: "Repeated Observation Required",
    expectedExplanation:
      "The signal is narrowband and steady, but it was detected only once. The candidate rules require repeated detection, so it stays Unknown.",
  },
  {
    code: "SIM-ART-001",
    name: "Narrowband Repeating Carrier (Simulated)",
    description:
      "A very narrow drifting carrier in the radio-quiet water-hole region that was seen on several nights.",
    source: "Simulated Radio Telescope A",
    celestialObject: "Simulated target star (not a real discovery)",
    frequency: 1452.31,
    signalStrength: 8.5,
    duration: 40,
    bandwidth: 3,
    signalPattern: "Drifting Carrier",
    isRepeated: true,
    isKnownInterference: false,
    isKnownNaturalPattern: false,
    signalNotes:
      "Simulated educational data. This is NOT a real signal. Used to demonstrate the candidate rules.",
    expectedClassification: "Potential Artificial Signal",
    expectedConfidence: 75,
    expectedVerificationStatus: "Unconfirmed Candidate",
    expectedExplanation:
      "The signal is very narrowband, repeated, stable and at an unusual frequency, and no known interference or natural rule matched. It is an UNCONFIRMED CANDIDATE, not a verified discovery.",
  },
];

module.exports = sampleSignals;
