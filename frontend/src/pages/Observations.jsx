import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useDebounce from "../hooks/useDebounce";
import useAuth from "../hooks/useAuth";
import { deleteObservation, getObservations } from "../services/observationService";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmModal from "../components/ConfirmModal";
import { SimulatedBadge, StatusBadge } from "../components/Badges";
import { OBSERVATION_STATUSES, OBSERVATION_TYPES } from "../utils/constants";
import { formatDate, formatNumber, getErrorMessage } from "../utils/format";

export default function Observations() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [toDelete, setToDelete] = useState(null);
  const [actionError, setActionError] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data, loading, error, reload } = useFetch(
    () => getObservations({ search: debouncedSearch, type, status, sort }),
    [debouncedSearch, type, status, sort]
  );

  const confirmDelete = async () => {
    try {
      await deleteObservation(toDelete._id);
      setToDelete(null);
      reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
      setToDelete(null);
    }
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (r) => (
        <>
          <div className="fw-semibold">{r.title}</div>
          {r.isSimulated && <SimulatedBadge />}
        </>
      ),
    },
    { key: "observationType", label: "Type" },
    { key: "source", label: "Source" },
    { key: "observationDate", label: "Date", render: (r) => formatDate(r.observationDate) },
    { key: "frequency", label: "Freq.", render: (r) => formatNumber(r.frequency, "MHz") },
    { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
    ...(isAdmin ? [{ key: "createdBy", label: "Researcher", render: (r) => r.createdBy?.name || "-" }] : []),
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Link to={`/observations/${r._id}/edit`} className="btn btn-sm btn-outline-light">Edit</Link>
          <button className="btn btn-sm btn-outline-danger" onClick={() => setToDelete(r)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Observations" subtitle={isAdmin ? "All observations in the system" : "Your astronomical observations"}>
        <Link to="/observations/new" className="btn btn-fs">+ Add observation</Link>
      </PageHeader>

      <div className="space-card p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-4">
            <input className="form-control" placeholder="Search title, source, location..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="col-6 col-md-2">
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All types</option>
              {OBSERVATION_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-2">
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {OBSERVATION_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-2">
            <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
      </div>

      <ErrorMessage message={actionError} />
      <ErrorMessage message={error} onRetry={reload} />

      <div className="space-card p-3">
        {loading ? (
          <Loader />
        ) : (
          <DataTable columns={columns} rows={data || []} onRowClick={(r) => navigate(`/observations/${r._id}`)} emptyText="No observations match your filters." />
        )}
      </div>

      <ConfirmModal
        show={!!toDelete}
        title="Delete observation?"
        message={`"${toDelete?.title}" will be deleted. Linked signal analyses are kept but unlinked.`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
