import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { deleteObservation, getObservation } from "../services/observationService";
import { getAnalyses } from "../services/analysisService";
import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmModal from "../components/ConfirmModal";
import DataTable from "../components/DataTable";
import { ClassificationBadge, SimulatedBadge, StatusBadge, VerificationBadge } from "../components/Badges";
import { formatDate, formatDateTime, formatNumber, getErrorMessage } from "../utils/format";

export default function ObservationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: obs, loading, error } = useFetch(() => getObservation(id), [id]);
  const { data: analyses } = useFetch(() => getAnalyses({ observation: id }), [id]);
  const [confirm, setConfirm] = useState(false);
  const [actionError, setActionError] = useState("");

  const handleDelete = async () => {
    try {
      await deleteObservation(id);
      navigate("/observations");
    } catch (err) {
      setActionError(getErrorMessage(err));
      setConfirm(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  const rows = [
    ["Observation type", obs.observationType],
    ["Telescope / source", obs.source],
    ["Observation date", formatDate(obs.observationDate)],
    ["Celestial location", obs.celestialLocation || "-"],
    ["Frequency", formatNumber(obs.frequency, "MHz")],
    ["Signal strength", formatNumber(obs.signalStrength, "dB")],
    ["Created by", obs.createdBy?.name || "-"],
    ["Created", formatDateTime(obs.createdAt)],
    ["Last updated", formatDateTime(obs.updatedAt)],
  ];

  return (
    <>
      <PageHeader title={obs.title} subtitle={<span className="d-flex gap-2 align-items-center"><StatusBadge value={obs.status} />{obs.isSimulated && <SimulatedBadge />}</span>}>
        <Link to={`/analyses/new?observation=${obs._id}`} className="btn btn-fs">⚡ Analyze this signal</Link>
        <Link to={`/observations/${obs._id}/edit`} className="btn btn-outline-light">Edit</Link>
        <button className="btn btn-outline-danger" onClick={() => setConfirm(true)}>Delete</button>
      </PageHeader>
      <ErrorMessage message={actionError} />

      <div className="row g-3">
        <div className="col-lg-5">
          <div className="space-card p-3 h-100">
            <div className="card-title-sm">Details</div>
            <table className="table fs-table table-sm">
              <tbody>
                {rows.map(([k, v]) => (
                  <tr key={k}><th style={{ width: "42%" }}>{k}</th><td>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="space-card p-3 mb-3">
            <div className="card-title-sm">Description</div>
            <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{obs.description || "No description."}</p>
          </div>
          <div className="space-card p-3">
            <div className="card-title-sm">Research notes</div>
            <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{obs.researchNotes || "No notes yet."}</p>
          </div>
        </div>
        <div className="col-12">
          <div className="space-card p-3">
            <div className="card-title-sm">Signal analyses linked to this observation</div>
            <DataTable
              rows={analyses || []}
              onRowClick={(r) => navigate(`/analyses/${r._id}`)}
              emptyText="No analyses linked yet. Use 'Analyze this signal'."
              columns={[
                { key: "signalName", label: "Signal" },
                { key: "classification", label: "Classification", render: (r) => <ClassificationBadge value={r.classification} /> },
                { key: "confidenceScore", label: "Confidence", render: (r) => `${r.confidenceScore}%` },
                { key: "verificationStatus", label: "Verification", render: (r) => <VerificationBadge value={r.verificationStatus} /> },
              ]}
            />
          </div>
        </div>
      </div>

      <ConfirmModal show={confirm} title="Delete observation?" message="This cannot be undone. Linked analyses are kept but unlinked." onConfirm={handleDelete} onCancel={() => setConfirm(false)} />
    </>
  );
}
