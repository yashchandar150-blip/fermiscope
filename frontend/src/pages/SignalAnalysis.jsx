import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useDebounce from "../hooks/useDebounce";
import useAuth from "../hooks/useAuth";
import { deleteAnalysis, getAnalyses } from "../services/analysisService";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmModal from "../components/ConfirmModal";
import Disclaimer from "../components/Disclaimer";
import { ClassificationBadge, SimulatedBadge, VerificationBadge } from "../components/Badges";
import { CLASSIFICATION_LIST, VERIFICATION_STATUSES } from "../utils/constants";
import { formatDate, formatNumber, getErrorMessage } from "../utils/format";

export default function SignalAnalysis() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [classification, setClassification] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [actionError, setActionError] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data, loading, error, reload } = useFetch(
    () => getAnalyses({ search: debouncedSearch, classification, verificationStatus }),
    [debouncedSearch, classification, verificationStatus]
  );

  const confirmDelete = async () => {
    try {
      await deleteAnalysis(toDelete._id);
      setToDelete(null);
      reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
      setToDelete(null);
    }
  };

  const columns = [
    {
      key: "signalName",
      label: "Signal",
      render: (r) => (
        <>
          <div className="fw-semibold">{r.signalName}</div>
          {r.isSimulated && <SimulatedBadge />}
        </>
      ),
    },
    { key: "classification", label: "Classification", render: (r) => <ClassificationBadge value={r.classification} /> },
    { key: "confidenceScore", label: "Rule confidence", render: (r) => `${r.confidenceScore}%` },
    { key: "frequency", label: "Frequency", render: (r) => formatNumber(r.frequency, "MHz") },
    { key: "verificationStatus", label: "Verification", render: (r) => <VerificationBadge value={r.verificationStatus} /> },
    { key: "createdAt", label: "Analyzed", render: (r) => formatDate(r.createdAt) },
    ...(isAdmin ? [{ key: "analyzedBy", label: "Researcher", render: (r) => r.analyzedBy?.name || "-" }] : []),
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-sm btn-outline-danger" onClick={() => setToDelete(r)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Signal Analysis" subtitle={isAdmin ? "All signal analyses in the system" : "Your analyzed signals and their verification status"}>
        <Link to="/analyses/new" className="btn btn-fs">⚡ Analyze signal</Link>
      </PageHeader>

      <div className="mb-3"><Disclaimer compact /></div>

      <div className="space-card p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-5">
            <input className="form-control" placeholder="Search by signal name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="col-md-4">
            <select className="form-select" value={classification} onChange={(e) => setClassification(e.target.value)}>
              <option value="">All classifications</option>
              {CLASSIFICATION_LIST.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={verificationStatus} onChange={(e) => setVerificationStatus(e.target.value)}>
              <option value="">All verification statuses</option>
              {VERIFICATION_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <ErrorMessage message={actionError} />
      <ErrorMessage message={error} onRetry={reload} />

      <div className="space-card p-3">
        {loading ? <Loader /> : <DataTable columns={columns} rows={data || []} onRowClick={(r) => navigate(`/analyses/${r._id}`)} emptyText="No signal analyses yet." />}
      </div>

      <ConfirmModal show={!!toDelete} title="Delete analysis?" message={`"${toDelete?.signalName}" will be permanently deleted and removed from any report.`} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </>
  );
}
