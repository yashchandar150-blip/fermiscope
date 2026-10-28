import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { deleteReport, exportReportPdf, getReport } from "../services/reportService";
import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import ConfirmModal from "../components/ConfirmModal";
import DataTable from "../components/DataTable";
import Disclaimer from "../components/Disclaimer";
import { ClassificationBadge, SimulatedBadge, StatusBadge, VerificationBadge } from "../components/Badges";
import { downloadBlob, formatDate, formatNumber, getErrorMessage } from "../utils/format";

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: report, loading, error } = useFetch(() => getReport(id), [id]);
  const [confirm, setConfirm] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);

  const handlePdf = async () => {
    setPdfBusy(true);
    try {
      const res = await exportReportPdf(id);
      downloadBlob(res.data, `FermiScope_${report.title.replace(/[^a-z0-9]+/gi, "_")}.pdf`);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setPdfBusy(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReport(id);
      navigate("/reports");
    } catch (err) {
      setActionError(getErrorMessage(err));
      setConfirm(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <>
      <PageHeader title={report.title} subtitle={<span className="d-flex gap-2 align-items-center">By {report.createdBy?.name} · {formatDate(report.createdAt)} {report.isSimulated && <SimulatedBadge />}</span>}>
        <button className="btn btn-fs" onClick={handlePdf} disabled={pdfBusy}>{pdfBusy ? "Preparing..." : "⬇ Export PDF"}</button>
        <Link to={`/reports/${id}/edit`} className="btn btn-outline-light">Edit</Link>
        <button className="btn btn-outline-danger" onClick={() => setConfirm(true)}>Delete</button>
      </PageHeader>
      <ErrorMessage message={actionError} />
      <div className="mb-3"><Disclaimer compact /></div>

      <div className="space-card p-3 mb-3">
        <div className="card-title-sm">Description</div>
        <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{report.description || "-"}</p>
      </div>

      <div className="space-card p-3 mb-3">
        <div className="card-title-sm">Related observations ({report.observations.length})</div>
        <DataTable
          rows={report.observations}
          onRowClick={(r) => navigate(`/observations/${r._id}`)}
          emptyText="No observations selected."
          columns={[
            { key: "title", label: "Title" },
            { key: "observationType", label: "Type" },
            { key: "observationDate", label: "Date", render: (r) => formatDate(r.observationDate) },
            { key: "frequency", label: "Frequency", render: (r) => formatNumber(r.frequency, "MHz") },
            { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
          ]}
        />
      </div>

      <div className="space-card p-3 mb-3">
        <div className="card-title-sm">Related signal analyses ({report.signalAnalyses.length})</div>
        <DataTable
          rows={report.signalAnalyses}
          onRowClick={(r) => navigate(`/analyses/${r._id}`)}
          emptyText="No analyses selected."
          columns={[
            { key: "signalName", label: "Signal" },
            { key: "classification", label: "Classification", render: (r) => <ClassificationBadge value={r.classification} /> },
            { key: "confidenceScore", label: "Rule confidence", render: (r) => `${r.confidenceScore}%` },
            { key: "verificationStatus", label: "Verification", render: (r) => <VerificationBadge value={r.verificationStatus} /> },
          ]}
        />
      </div>

      <div className="space-card p-3 mb-3">
        <div className="card-title-sm">Hypothesis discussion ({report.hypotheses.length})</div>
        {report.hypotheses.length === 0 && <div className="text-muted-space">No hypotheses selected.</div>}
        {report.hypotheses.map((h) => (
          <div key={h._id} className="mb-3">
            <strong>{h.name}</strong>
            <div className="small text-muted-space">{h.explanation}</div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="space-card p-3 h-100">
            <div className="card-title-sm">Findings</div>
            <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{report.findings || "-"}</p>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="space-card p-3 h-100">
            <div className="card-title-sm">Conclusion</div>
            <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{report.conclusion || "-"}</p>
          </div>
        </div>
      </div>

      <ConfirmModal show={confirm} title="Delete report?" message="This report will be permanently deleted." onConfirm={handleDelete} onCancel={() => setConfirm(false)} />
    </>
  );
}
