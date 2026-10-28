// Simple test for the signal engine. No testing library needed.
// Run with:  npm run test:engine
//
// It checks that every simulated sample signal produces the classification,
// confidence score and verification status that we documented in sampleSignals.js.

const assert = require("assert");
const { analyzeSignal } = require("../services/signalAnalysisService");
const sampleSignals = require("../seed/sampleSignals");

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.log(`  FAIL  ${name}\n        ${err.message}`);
    failed++;
  }
}

console.log("\nSample signals vs expected results");
for (const sample of sampleSignals) {
  check(`${sample.code} -> ${sample.expectedClassification}`, () => {
    const result = analyzeSignal(sample);
    assert.strictEqual(result.classification, sample.expectedClassification);
    assert.strictEqual(result.confidenceScore, sample.expectedConfidence);
    assert.strictEqual(result.suggestedVerificationStatus, sample.expectedVerificationStatus);
  });
}

console.log("\nSafety rules");

check("Narrowband alone is NOT a candidate", () => {
  const result = analyzeSignal({
    frequency: 1500, signalStrength: 12, duration: 100, bandwidth: 2,
    signalPattern: "Steady Carrier", isRepeated: false,
  });
  assert.notStrictEqual(result.classification, "Potential Artificial Signal");
});

check("Unusual frequency alone is NOT a candidate", () => {
  const result = analyzeSignal({
    frequency: 1452, signalStrength: 12, duration: 100, bandwidth: 5000000,
    signalPattern: "Irregular", isRepeated: false,
  });
  assert.notStrictEqual(result.classification, "Potential Artificial Signal");
});

check("Known interference band wins over candidate rules (step 1 first)", () => {
  const result = analyzeSignal({
    frequency: 98.5, signalStrength: 12, duration: 100, bandwidth: 2,
    signalPattern: "Steady Carrier", isRepeated: true,
  });
  assert.strictEqual(result.classification, "Human-Made Interference");
});

check("Researcher interference flag is respected", () => {
  const result = analyzeSignal({
    frequency: 1452.31, signalStrength: 12, duration: 100, bandwidth: 2,
    signalPattern: "Steady Carrier", isRepeated: true, isKnownInterference: true,
  });
  assert.strictEqual(result.classification, "Human-Made Interference");
});

check("Confidence never exceeds 95", () => {
  const result = analyzeSignal({
    frequency: 98.5, signalStrength: 30, duration: 500, bandwidth: 2,
    signalPattern: "Steady Carrier", isRepeated: true, isKnownInterference: true,
  });
  assert.ok(result.confidenceScore <= 95);
});

check("Same input always gives the same score (no randomness)", () => {
  const input = sampleSignals[5];
  assert.strictEqual(analyzeSignal(input).confidenceScore, analyzeSignal(input).confidenceScore);
});

check("Candidate result is labeled as unconfirmed", () => {
  const result = analyzeSignal(sampleSignals[5]);
  assert.strictEqual(result.isUnconfirmedCandidate, true);
  assert.ok(result.classificationExplanation.includes("UNCONFIRMED CANDIDATE"));
});

check("Score breakdown adds up to the confidence score", () => {
  const result = analyzeSignal(sampleSignals[5]);
  const total = result.confidenceBreakdown.reduce((sum, item) => sum + item.points, 0);
  assert.strictEqual(Math.min(total, 95), result.confidenceScore);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
