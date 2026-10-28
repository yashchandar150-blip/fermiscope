export default function StatCard({ label, value, color = "#4f8cff", hint }) {
  return (
    <div className="space-card stat-card" style={{ "--stat-color": color }}>
      <div className="stat-value">{value ?? 0}</div>
      <div className="stat-label">{label}</div>
      {hint && <div className="small mt-1" style={{ color }}>{hint}</div>}
    </div>
  );
}
