import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useDebounce from "../hooks/useDebounce";
import useAuth from "../hooks/useAuth";
import { deleteReport, exportReportPdf, getReports } from "../services/reportService";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmModal from "../components/ConfirmModal";
import { SimulatedBadge } from "../components/Badges";
import { downloadBlob, formatDate, getErrorMessage } from "../utils/format";

// Shared by "Research Reports" (researcher) and "Manage Reports" (admin)
export default function Reports({ adminView = false }) {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [actionError, setActionError] = useState("");
  const debounced = useDebounce(search);
  const { data, loading, error, reload } = useFetch(() => getReports({ search: debounced }), [debounced]);

  const confirmDelete = async () => {
    try {
      await deleteReport(toDelete._id);
      setToDelete(null);
      reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
      setToDelete(null);
    }
  };

  const handlePdf = async (report) => {
    try {
      const res = await exportReportPdf(report._id);
      downloadBlob(res.data, `FermiScope_${report.title.replace(/[^a-z0-9]+/gi, "_")}.pdf`);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const columns = [
    {
      key: "title",
      label: "Report",
      render: (r) => (
        <>
          <div className="fw-semibold">{r.title}</div>
          {r.isSimulated && <SimulatedBadge />}
        </>
      ),
    },
    { key: "description", label: "Description", render: (r) => <span className="text-muted-space small">{(r.description || "-").slice(0, 80)}</span> },
    ...(isAdmin ? [{ key: "createdBy", label: "Researcher", render: (r) => r.createdBy?.name || "-" }] : []),
    { key: "createdAt", label: "Created", render: (r) => formatDate(r.createdAt) },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-sm btn-outline-light" onClick={() => handlePdf(r)}>PDF</button>
          <Link to={`/reports/${r._id}/edit`} className="btn btn-sm btn-outline-light">Edit</Link>
          <button className="btn btn-sm btn-outline-danger" onClick={() => setToDelete(r)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title={adminView ? "Manage Reports" : "Research Reports"} subtitle={isAdmin ? "All research reports in the system" : "Your research reports"}>
        <Link to="/reports/new" className="btn btn-fs">+ Create report</Link>
      </PageHeader>

      <input className="form-control mb-3" placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <ErrorMessage message={actionError} />
      <ErrorMessage message={error} onRetry={reload} />

      <div className="space-card p-3">
        {loading ? <Loader /> : <DataTable columns={columns} rows={data || []} onRowClick={(r) => navigate(`/reports/${r._id}`)} emptyText="No reports yet." />}
      </div>

      <ConfirmModal show={!!toDelete} title="Delete report?" message={`"${toDelete?.title}" will be permanently deleted.`} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </>
  );
}
