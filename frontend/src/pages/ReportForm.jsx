import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useForm from "../hooks/useForm";
import useFetch from "../hooks/useFetch";
import FormField from "../components/FormField";
import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import { ClassificationBadge } from "../components/Badges";
import { createReport, getReport, updateReport } from "../services/reportService";
import { getObservations } from "../services/observationService";
import { getAnalyses } from "../services/analysisService";
import { getHypotheses } from "../services/hypothesisService";
import { formatDate, getErrorMessage } from "../utils/format";

// A scrollable list of checkboxes used to pick related records
function CheckList({ title, items, selected, onToggle, renderLabel, emptyText }) {
  return (
    <div className="mb-3">
      <label className="form-label">{title} ({selected.length} selected)</label>
      <div className="check-list">
        {items.length === 0 && <div className="text-muted-space small">{emptyText}</div>}
        {items.map((item) => (
          <div className="form-check" key={item._id}>
            <input className="form-check-input" type="checkbox" id={`chk-${item._id}`} checked={selected.includes(item._id)} onChange={() => onToggle(item._id)} />
            <label className="form-check-label" htmlFor={`chk-${item._id}`}>{renderLabel(item)}</label>
          </div>
        ))}
      </div>
    </div>
  );
}

// Used for both "Create Report" (/reports/new) and "Edit Report" (/reports/:id/edit)
export default function ReportForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm, handleChange] = useForm({ title: "", description: "", findings: "", conclusion: "" });
  const [observationIds, setObservationIds] = useState([]);
  const [analysisIds, setAnalysisIds] = useState([]);
  const [hypothesisIds, setHypothesisIds] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const { data: observations } = useFetch(() => getObservations({}), []);
  const { data: analyses } = useFetch(() => getAnalyses({}), []);
  const { data: hypotheses } = useFetch(() => getHypotheses({}), []);

  useEffect(() => {
    if (!isEdit) return;
    getReport(id)
      .then((res) => {
        const r = res.data;
        setForm({ title: r.title, description: r.description || "", findings: r.findings || "", conclusion: r.conclusion || "" });
        setObservationIds(r.observations.map((o) => o._id));
        setAnalysisIds(r.signalAnalyses.map((a) => a._id));
        setHypothesisIds(r.hypotheses.map((h) => h._id));
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, isEdit, setForm]);

  const toggle = (setter) => (value) =>
    setter((list) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const payload = { ...form, observations: observationIds, signalAnalyses: analysisIds, hypotheses: hypothesisIds };
      const res = isEdit ? await updateReport(id, payload) : await createReport(payload);
      navigate(`/reports/${res.data._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <PageHeader title={isEdit ? "Edit report" : "Create research report"} subtitle="Combine observations, analyses and hypotheses into a document you can export as PDF." />
      <ErrorMessage message={error} />
      <form className="space-card p-4" onSubmit={handleSubmit}>
        <FormField label="Report title" name="title" value={form.title} onChange={handleChange} required />
        <FormField label="Description" name="description" type="textarea" rows={2} value={form.description} onChange={handleChange} />

        <div className="row">
          <div className="col-lg-4">
            <CheckList
              title="Related observations"
              items={observations || []}
              selected={observationIds}
              onToggle={toggle(setObservationIds)}
              emptyText="You have no observations yet."
              renderLabel={(o) => `${o.title} (${formatDate(o.observationDate)})`}
            />
          </div>
          <div className="col-lg-4">
            <CheckList
              title="Related signal analyses"
              items={analyses || []}
              selected={analysisIds}
              onToggle={toggle(setAnalysisIds)}
              emptyText="You have no analyses yet."
              renderLabel={(a) => (
                <>
                  {a.signalName} <ClassificationBadge value={a.classification} />
                </>
              )}
            />
          </div>
          <div className="col-lg-4">
            <CheckList
              title="Selected hypotheses"
              items={hypotheses || []}
              selected={hypothesisIds}
              onToggle={toggle(setHypothesisIds)}
              emptyText="No hypotheses found. Run the seed script."
              renderLabel={(h) => h.name}
            />
          </div>
        </div>

        <FormField label="Findings" name="findings" type="textarea" rows={5} value={form.findings} onChange={handleChange} />
        <FormField label="Conclusion" name="conclusion" type="textarea" rows={4} value={form.conclusion} onChange={handleChange} hint="Remember: potential artificial signals are unconfirmed candidates, not proof of extraterrestrial life." />

        <div className="d-flex gap-2">
          <button className="btn btn-fs" disabled={busy}>{busy ? "Saving..." : isEdit ? "Save changes" : "Create report"}</button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </>
  );
}
