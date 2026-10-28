import { CLASS_COLORS, STATUS_COLORS, VERIFICATION_COLORS } from "../utils/constants";

const Badge = ({ color, children }) => (
  <span className="fs-badge" style={{ "--badge-color": color }}>
    {children}
  </span>
);

export const ClassificationBadge = ({ value }) => <Badge color={CLASS_COLORS[value]}>{value}</Badge>;

export const VerificationBadge = ({ value }) => <Badge color={VERIFICATION_COLORS[value]}>{value}</Badge>;

export const StatusBadge = ({ value }) => <Badge color={STATUS_COLORS[value]}>{value}</Badge>;

export const RoleBadge = ({ value }) => <Badge color={value === "admin" ? "#8b5cf6" : "#4f8cff"}>{value}</Badge>;

// Shown next to every simulated / educational record
export const SimulatedBadge = () => (
  <span className="sim-badge" title="SIMULATED EDUCATIONAL DATA - not a real astronomical discovery">
    Simulated educational data
  </span>
);
