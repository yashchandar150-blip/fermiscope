import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useForm from "../hooks/useForm";
import FormField from "../components/FormField";
import ErrorMessage from "../components/ErrorMessage";
import { getErrorMessage } from "../utils/format";
import { DEMO_ACCOUNTS } from "../utils/constants";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm, handleChange] = useForm({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      const fallback = user.role === "admin" ? "/admin" : "/dashboard";
      navigate(location.state?.from || fallback, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 460 }}>
      <div className="space-card p-4">
        <h2 className="mb-1">Login</h2>
        <p className="text-muted-space small">Welcome back, researcher.</p>
        <ErrorMessage message={error} />
        <form onSubmit={handleSubmit}>
          <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <FormField label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
          <button className="btn btn-fs w-100" disabled={busy}>{busy ? "Signing in..." : "Login"}</button>
        </form>

        <div className="notice notice-info mt-4">
          <div className="fw-semibold mb-2">Demo accounts (after running the seed script)</div>
          {DEMO_ACCOUNTS.map((acc) => (
            <div key={acc.email} className="d-flex justify-content-between align-items-center small mb-1">
              <span>
                <strong>{acc.label}:</strong> {acc.email} / {acc.password}
              </span>
              <button type="button" className="btn btn-sm btn-outline-light" onClick={() => setForm({ email: acc.email, password: acc.password })}>
                Fill
              </button>
            </div>
          ))}
        </div>

        <p className="text-center mt-3 mb-0 small">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
