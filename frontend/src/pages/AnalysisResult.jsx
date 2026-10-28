import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { deleteAnalysis, getAnalysis, updateAnalysis } from "../services/analysisService";
import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmModal from "../components/ConfirmModal";
import AnalysisResultView from "../components/AnalysisResultView";
import { VerificationBadge } from "../components/Badges";
import { VERIFICATION_STATUSES } from "../utils/constants";
import { formatDateTime, getErrorMessage } from "../utils/format";

export default function AnalysisResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: analysis, loading, error, setData } = useFetch(() => getAnalysis(id), [id]);

  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (analysis) {
      setStatus(analysis.verificationStatus);
      setNotes("");
    }
  }, [analysis]);

  const saveVerification = async () => {
    setSaving(true);
    setMessage("");
    setActionError("");
    try {
      const res = await updateAnalysis(id, { verificationStatus: status, verificationNotes: notes });
      setData({ ...analysis, ...res.data });
      setMessage("Verification status updated.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAnalysis(id);
      navigate("/analyses");
    } catch (err) {
      setActionError(getErrorMessage(err));
      setConfirm(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  const history = [...(analysis.verificationHistory || [])].reverse();

  return (
    <>
      <PageHeader title={analysis.signalName} subtitle={`Analyzed ${formatDateTime(analysis.createdAt)} by ${analysis.analyzedBy?.name || "-"}`}>
        {analysis.observation && (
          <Link to={`/observations/${analysis.observation._id}`} className="btn btn-outline-light">View observation</Link>
        )}
        <Link to="/analyses" className="btn btn-outline-secondary">Back to list</Link>
        <button className="btn btn-outline-danger" onClick={() => setConfirm(true)}>Delete</button>
      </PageHeader>
      <ErrorMessage message={actionError} />

      <AnalysisResultView data={analysis} />

      {/* Stage 3: Verification, done by humans */}
      <div className="space-card p-3 mt-3">
        <div className="card-title-sm">Verification workflow (done by researchers)</div>
        <div className="d-flex align-items-center gap-2 mb-3">
          Current status: <VerificationBadge value={analysis.verificationStatus} />
        </div>
        {message && <div className="alert alert-success py-2">{message}</div>}
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <label className="form-label">New verification status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {VERIFICATION_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Note (why are you changing it?)</label>
            <input className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Signal disappeared on second pass" />
          </div>
          <div className="col-md-2">
            <button className="btn btn-fs w-100" onClick={saveVerification} disabled={saving}>{saving ? "Saving..." : "Update"}</button>
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-4">
            <div className="card-title-sm">Verification history</div>
            {history.map((h, i) => (
              <div key={i} className="trace-step matched">
                <VerificationBadge value={h.status} />{" "}
                <span className="small text-muted-space">{formatDateTime(h.changedAt)} · {h.changedByName || "system"}</span>
                {h.note && <div className="small">{h.note}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal show={confirm} title="Delete analysis?" message="This analysis will be permanently deleted and removed from any report." onConfirm={handleDelete} onCancel={() => setConfirm(false)} />
    </>
  );
}
