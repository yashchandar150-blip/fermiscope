import { CLASS_COLORS } from "../utils/constants";

// Shows the RULE-BASED confidence. It is NOT the probability that aliens exist.
export default function ConfidenceMeter({ score, classification }) {
  const color = CLASS_COLORS[classification] || "#4f8cff";
  return (
    <div>
      <div className="d-flex justify-content-between align-items-end">
        <span className="text-muted-space small">Rule-based confidence</span>
        <span style={{ fontSize: "1.8rem", fontWeight: 700, color }}>{score}%</span>
      </div>
      <div className="progress" style={{ height: 10, background: "var(--fs-bg-2)" }}>
        <div className="progress-bar" style={{ width: `${score}%`, background: color }} />
      </div>
      <div className="text-muted-space mt-1" style={{ fontSize: "0.75rem" }}>
        How strongly this app's simple rules matched. It is <strong>not</strong> the probability that
        extraterrestrial life exists.
      </div>
    </div>
  );
}
