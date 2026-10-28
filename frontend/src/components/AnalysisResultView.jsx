import { BreakdownBar } from "./Charts";
import { ClassificationBadge, SimulatedBadge, VerificationBadge } from "./Badges";
import ConfidenceMeter from "./ConfidenceMeter";
import Disclaimer from "./Disclaimer";
import { formatDate } from "../utils/format";

// Shows a full analysis result. "data" can be a saved analysis (from MongoDB)
// or a preview result (from the engine). Both have the same field names.
export default function AnalysisResultView({ data, preview = false }) {
  const status = data.verificationStatus || data.suggestedVerificationStatus;
  const features = data.extractedFeatures || {};
  const breakdown = data.confidenceBreakdown || [];
  const trace = data.ruleTrace || [];

  return (
    <div className="d-flex flex-column gap-3">
      <Disclaimer compact />

      {/* The three stages are kept separate on purpose */}
      <div className="row g-2">
        <div className="col-md-4">
          <div className="stage-box">
            <span className="stage-num">1</span>
            <strong>Detection</strong>
            <div className="small text-muted-space mt-1">Signal recorded with its measured properties.</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stage-box active">
            <span className="stage-num">2</span>
            <strong>Classification</strong>
            <div className="small text-muted-space mt-1">Preliminary label from simple, transparent rules.</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stage-box">
            <span className="stage-num">3</span>
            <strong>Verification</strong>
            <div className="small mt-1">
              {preview ? <span className="text-muted-space">Set after saving.</span> : <VerificationBadge value={status} />}
              <div className="text-muted-space">Done by researchers, not by the software.</div>
            </div>
          </div>
        </div>
      </div>

      {data.isUnconfirmedCandidate && (
        <div className="notice notice-candidate">
          <strong>⚠ UNCONFIRMED CANDIDATE</strong> - this signal meets the app's simplified candidate criteria,
          but its origin has <strong>not</strong> been scientifically verified. Interference, instrument
          artefacts and unknown natural sources must be ruled out first.
        </div>
      )}

      <div className="row g-3">
        {/* Classification */}
        <div className="col-lg-6">
          <div className="space-card p-3 h-100">
            <div className="card-title-sm">Classification (preliminary research result)</div>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <span className="fs-4 fw-bold">{data.classification}</span>
              <ClassificationBadge value={data.classification} />
              {data.isSimulated && <SimulatedBadge />}
            </div>
            <ConfidenceMeter score={data.confidenceScore} classification={data.classification} />
            <hr />
            <div className="card-title-sm">Explanation</div>
            <p className="mb-0">{data.classificationExplanation}</p>
          </div>
        </div>

        {/* Score breakdown chart */}
        <div className="col-lg-6">
          <div className="space-card p-3 h-100">
            <div className="card-title-sm">How the confidence score was calculated</div>
            {breakdown.length > 0 ? (
              <>
                <div style={{ height: Math.max(150, breakdown.length * 36) }}>
                  <BreakdownBar data={breakdown} />
                </div>
                <div className="small text-muted-space mt-2">
                  Every point comes from a visible rule. Total (capped at 95%): <strong>{data.confidenceScore}%</strong>
                </div>
              </>
            ) : (
              <div className="text-muted-space">No score breakdown available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Signal details + features */}
      <div className="row g-3">
        <div className="col-lg-5">
          <div className="space-card p-3 h-100">
            <div className="card-title-sm">Signal details</div>
            <table className="table fs-table table-sm">
              <tbody>
                <tr><th>Name</th><td>{data.signalName || "-"}</td></tr>
                <tr><th>Source</th><td>{data.source || "-"}</td></tr>
                <tr><th>Observation date</th><td>{formatDate(data.observationDate)}</td></tr>
                <tr><th>Celestial object</th><td>{data.celestialObject || "-"}</td></tr>
                <tr><th>Pattern</th><td>{data.signalPattern || "-"}</td></tr>
                <tr><th>Notes</th><td>{data.signalNotes || "-"}</td></tr>
                <tr><th>Data type</th><td>{data.isSimulated ? "Simulated educational data" : "Entered by researcher"}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="space-card p-3 h-100">
            <div className="card-title-sm">Extracted features</div>
            <div className="table-responsive">
              <table className="table fs-table table-sm">
                <thead>
                  <tr><th>Feature</th><th>Value</th><th>Note</th></tr>
                </thead>
                <tbody>
                  {(features.table || []).map((row) => (
                    <tr key={row.feature}>
                      <td>{row.feature}</td>
                      <td className="fw-semibold">{row.value}</td>
                      <td className="text-muted-space small">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Rule trace */}
      {trace.length > 0 && (
        <div className="space-card p-3">
          <div className="card-title-sm">Classification rules, step by step</div>
          {trace.map((step) => (
            <div
              key={step.step}
              className={`trace-step ${step.outcome === "Matched" || step.outcome === "Applied" ? "matched" : ""} ${step.outcome === "Skipped" ? "skipped" : ""}`}
            >
              <div>
                <strong>Step {step.step}:</strong> {step.rule}{" "}
                <span className="fs-badge ms-1" style={{ "--badge-color": step.outcome === "Matched" || step.outcome === "Applied" ? "#8b5cf6" : "#94a3b8" }}>
                  {step.outcome}
                </span>
              </div>
              <div className="small text-muted-space">{step.detail}</div>
            </div>
          ))}
        </div>
      )}

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="space-card p-3 h-100">
            <div className="card-title-sm">Features that matched the rules</div>
            {data.matchedFeatures && data.matchedFeatures.length > 0 ? (
              <ul className="mb-0 ps-3">
                {data.matchedFeatures.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            ) : (
              <div className="text-muted-space">No rule matched strongly.</div>
            )}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="space-card p-3 h-100">
            <div className="card-title-sm">Possible alternative explanations</div>
            <ul className="mb-0 ps-3">
              {(data.alternativeExplanations || []).map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="space-card p-3 h-100">
            <div className="card-title-sm">Recommended next investigation steps</div>
            <ol className="mb-0 ps-3">
              {(data.nextSteps || []).map((f, i) => <li key={i}>{f}</li>)}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
