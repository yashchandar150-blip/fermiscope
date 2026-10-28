import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { RoleBadge } from "./Badges";

// Top bar. "onToggleSidebar" opens the sidebar on small screens.
export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="fs-navbar d-flex align-items-center px-3 gap-3">
      {user && (
        <button className="btn btn-sm btn-outline-secondary d-lg-none" onClick={onToggleSidebar} aria-label="Toggle menu">
          ☰
        </button>
      )}
      <Link to={user ? "/dashboard" : "/"} className="brand-mark fs-5">
        ✦ Fermi<span>Scope</span>
      </Link>

      <div className="ms-auto d-flex align-items-center gap-2">
        {user ? (
          <>
            <Link to="/profile" className="text-decoration-none d-none d-sm-flex align-items-center gap-2 text-light">
              <span className="small">{user.name}</span>
              <RoleBadge value={user.role} />
            </Link>
            <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-sm btn-outline-light">
              Login
            </Link>
            <Link to="/register" className="btn btn-sm btn-fs">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
