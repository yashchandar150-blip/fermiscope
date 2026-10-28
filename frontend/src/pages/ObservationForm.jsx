import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useForm from "../hooks/useForm";
import FormField from "../components/FormField";
import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import { createObservation, getObservation, updateObservation } from "../services/observationService";
import { OBSERVATION_STATUSES, OBSERVATION_TYPES } from "../utils/constants";
import { cleanPayload, getErrorMessage, toInputDate } from "../utils/format";

const emptyForm = {
  title: "",
  description: "",
  observationDate: toInputDate(new Date()),
  source: "",
  celestialLocation: "",
  frequency: "",
  signalStrength: "",
  observationType: "Radio Signal",
  status: "Pending",
  researchNotes: "",
};

// Used for both "Add Observation" (/observations/new) and "Edit Observation" (/observations/:id/edit)
export default function ObservationForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm, handleChange] = useForm(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    getObservation(id)
      .then((res) => {
        const o = res.data;
        setForm({
          title: o.title,
          description: o.description || "",
          observationDate: toInputDate(o.observationDate),
          source: o.source,
          celestialLocation: o.celestialLocation || "",
          frequency: o.frequency ?? "",
          signalStrength: o.signalStrength ?? "",
          observationType: o.observationType,
          status: o.status,
          researchNotes: o.researchNotes || "",
        });
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, isEdit, setForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const payload = { ...form, frequency: form.frequency === "" ? "" : Number(form.frequency), signalStrength: form.signalStrength === "" ? "" : Number(form.signalStrength) };
      // When editing, empty text fields must still be sent so they can be cleared
      const body = isEdit ? payload : cleanPayload(payload, ["frequency", "signalStrength"]);
      const res = isEdit ? await updateObservation(id, body) : await createObservation(body);
      navigate(`/observations/${res.data._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <PageHeader title={isEdit ? "Edit observation" : "Add observation"} subtitle="Frequency is in MHz and signal strength is the signal-to-noise ratio in dB." />
      <ErrorMessage message={error} />
      <form className="space-card p-4" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-8"><FormField label="Title" name="title" value={form.title} onChange={handleChange} required /></div>
          <div className="col-md-4"><FormField label="Observation date" name="observationDate" type="date" value={form.observationDate} onChange={handleChange} required /></div>
          <div className="col-md-6"><FormField label="Telescope or source" name="source" value={form.source} onChange={handleChange} required placeholder="e.g. Simulated Radio Array A" /></div>
          <div className="col-md-6"><FormField label="Celestial location" name="celestialLocation" value={form.celestialLocation} onChange={handleChange} placeholder="e.g. Constellation Lyra, RA 18h36m" /></div>
          <div className="col-md-3"><FormField label="Frequency (MHz)" name="frequency" type="number" step="any" min="0" value={form.frequency} onChange={handleChange} /></div>
          <div className="col-md-3"><FormField label="Signal strength (dB)" name="signalStrength" type="number" step="any" value={form.signalStrength} onChange={handleChange} /></div>
          <div className="col-md-3"><FormField label="Observation type" name="observationType" type="select" options={OBSERVATION_TYPES} value={form.observationType} onChange={handleChange} required /></div>
          <div className="col-md-3"><FormField label="Status" name="status" type="select" options={OBSERVATION_STATUSES} value={form.status} onChange={handleChange} /></div>
          <div className="col-12"><FormField label="Description" name="description" type="textarea" value={form.description} onChange={handleChange} /></div>
          <div className="col-12"><FormField label="Research notes" name="researchNotes" type="textarea" value={form.researchNotes} onChange={handleChange} /></div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-fs" disabled={busy}>{busy ? "Saving..." : isEdit ? "Save changes" : "Add observation"}</button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </>
  );
}
