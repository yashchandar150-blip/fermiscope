/**
 * Builds the PDF for a research report using PDFKit.
 * It receives a report whose references are already filled in (populated)
 * and writes the PDF into the stream you give it (for example the Express response).
 */
const PDFDocument = require("pdfkit");

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";

const buildReportPdf = (report, outputStream) => {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  doc.pipe(outputStream);

  const heading = (text) => {
    doc.moveDown(1);
    doc.font("Helvetica-Bold").fontSize(14).fillColor("#1e3a8a").text(text);
    doc
      .moveTo(50, doc.y + 2)
      .lineTo(545, doc.y + 2)
      .strokeColor("#c7d2fe")
      .stroke();
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10).fillColor("#111827");
  };

  const body = (text) => {
    doc.font("Helvetica").fontSize(10).fillColor("#111827").text(text || "-", { align: "left" });
  };

  const bold = (text) => {
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#111827").text(text);
    doc.font("Helvetica");
  };

  // ---- Title block ----
  doc.font("Helvetica-Bold").fontSize(20).fillColor("#1e3a8a").text("FermiScope", { align: "center" });
  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#374151")
    .text("Alien Civilization Research and Signal Detection System", { align: "center" });
  doc.moveDown(1);
  doc.font("Helvetica-Bold").fontSize(16).fillColor("#111827").text(report.title, { align: "center" });
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#6b7280")
    .text(`Report date: ${formatDate(report.createdAt)}   |   Exported: ${formatDate(new Date())}`, {
      align: "center",
    });

  // ---- Disclaimer ----
  doc.moveDown(1);
  doc
    .font("Helvetica-Oblique")
    .fontSize(9)
    .fillColor("#92400e")
    .text(
      "Scientific notice: FermiScope uses simplified, rule-based educational classification. Results are preliminary " +
        "and do not prove the existence of extraterrestrial life. Every Potential Artificial Signal is an UNCONFIRMED " +
        "CANDIDATE that requires further scientific verification. Records marked SIMULATED are educational data.",
      { align: "left" }
    );

  // ---- Researcher details ----
  heading("Researcher Details");
  body(`Name: ${report.createdBy ? report.createdBy.name : "-"}`);
  body(`Email: ${report.createdBy ? report.createdBy.email : "-"}`);
  body(`Role: ${report.createdBy ? report.createdBy.role : "-"}`);

  // ---- Description ----
  heading("Description");
  body(report.description);

  // ---- Observation summary ----
  heading(`Observation Summary (${report.observations.length})`);
  if (report.observations.length === 0) body("No observations were linked to this report.");
  report.observations.forEach((o, i) => {
    bold(`${i + 1}. ${o.title}${o.isSimulated ? "  [SIMULATED]" : ""}`);
    body(
      `Date: ${formatDate(o.observationDate)}  |  Type: ${o.observationType}  |  Status: ${o.status}\n` +
        `Source: ${o.source}  |  Location: ${o.celestialLocation || "-"}\n` +
        `Frequency: ${o.frequency ?? "-"} MHz  |  Signal strength: ${o.signalStrength ?? "-"} dB`
    );
    doc.moveDown(0.5);
  });

  // ---- Signal analysis results ----
  heading(`Signal Analysis Results (${report.signalAnalyses.length})`);
  if (report.signalAnalyses.length === 0) body("No signal analyses were linked to this report.");
  report.signalAnalyses.forEach((a, i) => {
    bold(`${i + 1}. ${a.signalName}${a.isSimulated ? "  [SIMULATED]" : ""}`);
    body(
      `Classification (preliminary): ${a.classification}\n` +
        `Rule-based confidence: ${a.confidenceScore}%  (confidence of the rules, NOT the probability of alien life)\n` +
        `Verification status: ${a.verificationStatus}\n` +
        `Frequency: ${a.frequency ?? "-"} MHz  |  Bandwidth: ${a.bandwidth ?? "-"} Hz  |  Strength: ${a.signalStrength ?? "-"} dB`
    );
    if (a.isUnconfirmedCandidate) {
      doc
        .font("Helvetica-Bold")
        .fillColor("#b91c1c")
        .text("UNCONFIRMED CANDIDATE - requires further scientific verification")
        .font("Helvetica")
        .fillColor("#111827");
    }
    body(`Explanation: ${a.classificationExplanation}`);
    doc.moveDown(0.5);
  });

  // ---- Hypothesis discussion ----
  heading(`Hypothesis Discussion (${report.hypotheses.length})`);
  if (report.hypotheses.length === 0) body("No hypotheses were selected for this report.");
  report.hypotheses.forEach((h, i) => {
    bold(`${i + 1}. ${h.name}`);
    body(h.explanation);
    if (h.limitations && h.limitations.length) {
      body(`Limitations: ${h.limitations.join("; ")}`);
    }
    doc.moveDown(0.5);
  });

  // ---- Findings and conclusion ----
  heading("Findings");
  body(report.findings);
  heading("Conclusion");
  body(report.conclusion);

  // ---- Footer line ----
  doc.moveDown(2);
  doc
    .font("Helvetica-Oblique")
    .fontSize(9)
    .fillColor("#6b7280")
    .text(`Generated by FermiScope on ${formatDate(new Date())}.`, { align: "center" });

  doc.end();
};

module.exports = { buildReportPdf };
