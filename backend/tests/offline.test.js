// Tests that run WITHOUT a database.
// Run with:  npm run test:offline
//
// 1. Every seed document is checked against its Mongoose schema.
// 2. The HTTP layer is checked for security rules (401 / 400 / 404).
// 3. The PDF builder is run with mock data.

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret";
process.env.CLIENT_URL = "http://localhost:5173";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Observation = require("../models/Observation");
const SignalAnalysis = require("../models/SignalAnalysis");
const SampleSignal = require("../models/SampleSignal");
const Hypothesis = require("../models/Hypothesis");
const ResearchReport = require("../models/ResearchReport");
const mongoose = require("mongoose");

const sampleSignals = require("../seed/sampleSignals");
const { demoUsers, hypotheses, researcherOneObservations, researcherTwoObservations, analysisPlan } = require("../seed/seedData");
const { buildAnalysisRecord } = require("../services/signalAnalysisService");
const { buildReportPdf } = require("../services/reportPdfService");

let passed = 0;
let failed = 0;

const check = async (name, fn) => {
  try {
    await fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.log(`  FAIL  ${name}\n        ${err.message}`);
    failed++;
  }
};

const fakeId = () => new mongoose.Types.ObjectId();

(async () => {
  console.log("\nSchema validation of seed data");

  await check("demo users are valid", () => {
    demoUsers.forEach((u) => {
      const err = new User(u).validateSync();
      assert.ifError(err);
    });
  });

  await check("hypotheses are valid (10 of them)", () => {
    assert.strictEqual(hypotheses.length, 10);
    hypotheses.forEach((h) => assert.ifError(new Hypothesis(h).validateSync()));
  });

  await check("sample signals are valid", () => {
    sampleSignals.forEach((s) => assert.ifError(new SampleSignal(s).validateSync()));
  });

  await check("observations are valid", () => {
    [...researcherOneObservations, ...researcherTwoObservations].forEach(({ daysAgo, ...o }) => {
      assert.ifError(new Observation({ ...o, observationDate: new Date(), createdBy: fakeId() }).validateSync());
    });
  });

  await check("every engine result can be saved as a SignalAnalysis", () => {
    analysisPlan.forEach((plan) => {
      const sample = sampleSignals.find((s) => s.code === plan.code);
      const { suggestedVerificationStatus, ...fields } = buildAnalysisRecord({ ...sample, signalName: sample.name });
      const doc = new SignalAnalysis({
        ...fields,
        verificationStatus: plan.status,
        verificationHistory: [{ status: plan.status, note: plan.note, changedByName: "Test" }],
        isSimulated: true,
        analyzedBy: fakeId(),
      });
      assert.ifError(doc.validateSync());
    });
  });

  await check("report with references is valid", () => {
    const r = new ResearchReport({
      title: "Test report",
      observations: [fakeId()],
      signalAnalyses: [fakeId()],
      hypotheses: [fakeId()],
      createdBy: fakeId(),
    });
    assert.ifError(r.validateSync());
  });

  await check("analysis with an invalid classification is rejected", () => {
    const err = new SignalAnalysis({
      signalName: "x", classification: "Aliens Confirmed", confidenceScore: 99, analyzedBy: fakeId(),
    }).validateSync();
    assert.ok(err, "should have failed validation");
  });

  console.log("\nHTTP security and validation (no database needed)");

  const app = require("../app");
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (method, url, body, token) => {
    const res = await fetch(base + url, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch (e) { /* not json */ }
    return { status: res.status, data };
  };

  await check("GET /api/health -> 200", async () => {
    const r = await call("GET", "/api/health");
    assert.strictEqual(r.status, 200);
  });

  for (const url of [
    "/api/observations", "/api/analyses", "/api/analyses/samples", "/api/reports",
    "/api/hypotheses", "/api/dashboard/stats", "/api/users", "/api/auth/me", "/api/astronomy/targets",
  ]) {
    await check(`GET ${url} without token -> 401`, async () => {
      assert.strictEqual((await call("GET", url)).status, 401);
    });
  }

  await check("POST /api/analyses/analyze without token -> 401", async () => {
    assert.strictEqual((await call("POST", "/api/analyses/analyze", { frequency: 1, signalStrength: 1 })).status, 401);
  });

  await check("DELETE /api/users/:id without token -> 401", async () => {
    assert.strictEqual((await call("DELETE", `/api/users/${fakeId()}`)).status, 401);
  });

  await check("invalid token -> 401", async () => {
    assert.strictEqual((await call("GET", "/api/observations", null, "not-a-real-token")).status, 401);
  });

  await check("expired token -> 401", async () => {
    const token = jwt.sign({ id: String(fakeId()) }, "test_secret", { expiresIn: -10 });
    assert.strictEqual((await call("GET", "/api/observations", null, token)).status, 401);
  });

  await check("token signed with the wrong secret -> 401", async () => {
    const token = jwt.sign({ id: String(fakeId()) }, "wrong_secret");
    assert.strictEqual((await call("GET", "/api/observations", null, token)).status, 401);
  });

  await check("register with bad data -> 400", async () => {
    const r = await call("POST", "/api/auth/register", { name: "A", email: "nope", password: "123" });
    assert.strictEqual(r.status, 400);
    assert.ok(r.data.message.includes("email"));
  });

  await check("register cannot be used to choose a role (role field ignored by validation, forced in controller)", async () => {
    const src = fs.readFileSync(path.join(__dirname, "../controllers/authController.js"), "utf8");
    assert.ok(src.includes('role: "researcher"'));
  });

  await check("login with missing password -> 400", async () => {
    const r = await call("POST", "/api/auth/login", { email: "a@b.com" });
    assert.strictEqual(r.status, 400);
  });

  await check("unknown route -> 404", async () => {
    assert.strictEqual((await call("GET", "/api/does-not-exist")).status, 404);
  });

  server.close();

  console.log("\nPDF export");

  await check("PDF builds from mock report data", async () => {
    const sample = sampleSignals[5];
    const { suggestedVerificationStatus, ...rec } = buildAnalysisRecord({ ...sample, signalName: sample.name });
    const report = {
      title: "Mock Report for Testing",
      description: "A test description.",
      createdAt: new Date(),
      createdBy: { name: "Aarav Researcher", email: "researcher@fermiscope.com", role: "researcher" },
      observations: [{ title: "Obs 1", isSimulated: true, observationDate: new Date(), observationType: "Radio Signal", status: "Analyzed", source: "Sim Telescope", celestialLocation: "Sim star", frequency: 1452.31, signalStrength: 8.5 }],
      signalAnalyses: [{ ...rec, isSimulated: true, verificationStatus: "Unconfirmed Candidate" }],
      hypotheses: [{ name: hypotheses[0].name, explanation: hypotheses[0].explanation, limitations: hypotheses[0].limitations }],
      findings: "Some findings.",
      conclusion: "Some conclusion.",
    };
    const out = path.join(process.env.PDF_TEST_OUT || __dirname, "sample-report.pdf");
    await new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(out);
      stream.on("finish", resolve);
      stream.on("error", reject);
      buildReportPdf(report, stream);
    });
    const size = fs.statSync(out).size;
    assert.ok(size > 2000, "PDF too small");
    if (!process.env.PDF_TEST_OUT) fs.unlinkSync(out);
  });

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
})();
