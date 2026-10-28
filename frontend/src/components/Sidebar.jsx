import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const researcherLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/observations", label: "Observations", icon: "🔭" },
  { to: "/analyses", label: "Signal Analysis", icon: "📡" },
  { to: "/analyses/new", label: "Analyze Signal", icon: "⚡" },
  { to: "/hypotheses", label: "Hypothesis Explorer", icon: "💡" },
  { to: "/reports", label: "Research Reports", icon: "📄" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

const adminLinks = [
  { to: "/admin", label: "Admin Dashboard", icon: "🛡️", end: true },
  { to: "/admin/users", label: "Manage Users", icon: "👥" },
  { to: "/admin/observations", label: "Manage Observations", icon: "🗂️" },
  { to: "/admin/reports", label: "Manage Reports", icon: "📚" },
];

export default function Sidebar({ open, onClose }) {
  const { isAdmin } = useAuth();

  const renderLink = (link) => (
    <NavLink
      key={link.to}
      to={link.to}
      end={link.end || link.to === "/analyses" || link.to === "/dashboard"}
      className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
      onClick={onClose}
    >
      <span>{link.icon}</span>
      {link.label}
    </NavLink>
  );

  return (
    <>
      <aside className={`fs-sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-heading">Research</div>
        <nav className="nav flex-column gap-1">{researcherLinks.map(renderLink)}</nav>

        {isAdmin && (
          <>
            <div className="sidebar-heading">Administration</div>
            <nav className="nav flex-column gap-1">{adminLinks.map(renderLink)}</nav>
            <div className="text-muted-space px-3 pt-2" style={{ fontSize: "0.72rem" }}>
              Admins see all users' records in Observations, Signal Analysis and Reports.
            </div>
          </>
        )}
      </aside>
      <div className={`sidebar-backdrop ${open ? "open" : ""}`} onClick={onClose} />
    </>
  );
}
