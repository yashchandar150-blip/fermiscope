import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import useForm from "../hooks/useForm";
import FormField from "../components/FormField";
import PageHeader from "../components/PageHeader";
import ErrorMessage from "../components/ErrorMessage";
import { RoleBadge } from "../components/Badges";
import { updateUser } from "../services/userService";
import { formatDate, getErrorMessage } from "../utils/format";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile, handleProfile] = useForm({ name: user.name, email: user.email });
  const [pw, setPw, handlePw] = useForm({ currentPassword: "", password: "", confirm: "" });
  const [profileMsg, setProfileMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setProfile({ name: user.name, email: user.email });
  }, [user, setProfile]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileErr("");
    setProfileMsg("");
    setBusy(true);
    try {
      const res = await updateUser(user._id, { name: profile.name, email: profile.email });
      setUser({ ...user, ...res.data });
      setProfileMsg("Profile updated.");
    } catch (err) {
      setProfileErr(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwErr("");
    setPwMsg("");
    if (pw.password.length < 6) return setPwErr("New password must be at least 6 characters");
    if (pw.password !== pw.confirm) return setPwErr("New passwords do not match");
    setBusy(true);
    try {
      await updateUser(user._id, { currentPassword: pw.currentPassword, password: pw.password });
      setPw({ currentPassword: "", password: "", confirm: "" });
      setPwMsg("Password changed.");
    } catch (err) {
      setPwErr(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Profile" subtitle="Update your personal details" />
      <div className="row g-3">
        <div className="col-lg-6">
          <form className="space-card p-4 h-100" onSubmit={saveProfile}>
            <div className="card-title-sm">Account</div>
            <div className="mb-3 d-flex align-items-center gap-2">
              Role: <RoleBadge value={user.role} />
              <span className="text-muted-space small">Member since {formatDate(user.createdAt)}</span>
            </div>
            <ErrorMessage message={profileErr} />
            {profileMsg && <div className="alert alert-success py-2">{profileMsg}</div>}
            <FormField label="Name" name="name" value={profile.name} onChange={handleProfile} required />
            <FormField label="Email" name="email" type="email" value={profile.email} onChange={handleProfile} required />
            <button className="btn btn-fs" disabled={busy}>Save profile</button>
          </form>
        </div>
        <div className="col-lg-6">
          <form className="space-card p-4 h-100" onSubmit={savePassword}>
            <div className="card-title-sm">Change password</div>
            <ErrorMessage message={pwErr} />
            {pwMsg && <div className="alert alert-success py-2">{pwMsg}</div>}
            <FormField label="Current password" name="currentPassword" type="password" value={pw.currentPassword} onChange={handlePw} required />
            <FormField label="New password" name="password" type="password" value={pw.password} onChange={handlePw} required />
            <FormField label="Confirm new password" name="confirm" type="password" value={pw.confirm} onChange={handlePw} required />
            <button className="btn btn-outline-light" disabled={busy}>Change password</button>
          </form>
        </div>
      </div>
    </>
  );
}
