import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useForm from "../hooks/useForm";
import FormField from "../components/FormField";
import ErrorMessage from "../components/ErrorMessage";
import { getErrorMessage } from "../utils/format";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, , handleChange] = useForm({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    if (form.password !== form.confirm) return setError("Passwords do not match");

    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 460 }}>
      <div className="space-card p-4">
        <h2 className="mb-1">Create account</h2>
        <p className="text-muted-space small">New accounts are created with the Researcher role.</p>
        <ErrorMessage message={error} />
        <form onSubmit={handleSubmit}>
          <FormField label="Full name" name="name" value={form.name} onChange={handleChange} required />
          <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <FormField label="Password" name="password" type="password" value={form.password} onChange={handleChange} required hint="At least 6 characters" />
          <FormField label="Confirm password" name="confirm" type="password" value={form.confirm} onChange={handleChange} required />
          <button className="btn btn-fs w-100" disabled={busy}>{busy ? "Creating..." : "Register"}</button>
        </form>
        <p className="text-center mt-3 mb-0 small">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
