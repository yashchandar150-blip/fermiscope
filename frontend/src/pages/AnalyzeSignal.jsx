import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useForm from "../hooks/useForm";
import useFetch from "../hooks/useFetch";
import FormField from "../components/FormField";
import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import Disclaimer from "../components/Disclaimer";
import AnalysisResultView from "../components/AnalysisResultView";
import { ClassificationBadge, SimulatedBadge } from "../components/Badges";
import { createAnalysis, getSampleSignals, previewAnalysis, previewSampleAnalysis } from "../services/analysisService";
import { getObservation, getObservations } from "../services/observationService";
import { SIGNAL_PATTERNS } from "../utils/constants";
import { cleanPayload, formatNumber, getErrorMessage, toInputDate } from "../utils/format";

const NUMBER_FIELDS = ["frequency", "signalStrength", "duration", "bandwidth"];

const emptyForm = {
  signalName: "",
  source: "",
  observationDate: toInputDate(new Date()),
  celestialObject: "",
  frequency: "",
  signalStrength: "",
  duration: "",
  bandwidth: "",
  signalPattern: "Unknown",
  isRepeated: false,
  isKnownInterference: false,
  isKnownNaturalPattern: false,
  signalNotes: "",
};

export default function AnalyzeSignal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState("manual");
  const [form, setForm, handleChange] = useForm(emptyForm);
  const [observationId, setObservationId] = useState(searchParams.get("observation") || "");
  const [selectedSample, setSelectedSample] = useState(null);
  const [preview, setPreview] = useState(null); // { data, sample?, expected?, matchesExpected? }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef(null);

  const { data: observations } = useFetch(() => getObservations({}), []);
  const { data: samples, loading: samplesLoading, error: samplesError } = useFetch(getSampleSignals, []);

  // Pre-fill the form when the user comes from an observation page
  const fillFromObservation = async (id) => {
    setObservationId(id);
    if (!id) return;
    try {
      const { data: o } = await getObservation(id);
      setForm((prev) => ({
        ...prev,
        signalName: prev.signalName || o.title,
        source: o.source || "",
        observationDate: toInputDate(o.observationDate),
        celestialObject: o.celestialLocation || "",
        frequency: o.frequency ?? "",
        signalStrength: o.signalStrength ?? "",
      }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    const fromUrl = searchParams.get("observation");
    if (fromUrl) fillFromObservation(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToResult = () => setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

  // ---------- Manual analysis ----------
  const manualPayload = () => {
    const payload = cleanPayload(form, NUMBER_FIELDS);
    if (observationId) payload.observation = observationId;
    return payload;
  };

  const runManual = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await previewAnalysis(manualPayload());
      const r = res.data.result;
      setPreview({ data: { ...r.input, ...r } });
      scrollToResult();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  // ---------- Sample analysis ----------
  const runSample = async (sample) => {
    setSelectedSample(sample);
    setError("");
    setBusy(true);
    try {
      const res = await previewSampleAnalysis(sample._id);
      const r = res.data.result;
      setPreview({ data: { ...r.input, ...r, isSimulated: true }, sample: res.data.sample, expected: res.data.expected, matchesExpected: res.data.matchesExpected });
      scrollToResult();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  // ---------- Save (the server runs the engine again before saving) ----------
  const save = async () => {
    setError("");
    setBusy(true);
    try {
      let payload;
      if (tab === "manual") {
        payload = manualPayload();
        if (!payload.signalName) throw new Error("Please enter a signal name before saving.");
      } else {
        const s = selectedSample;
        payload = {
          signalName: s.name,
          source: s.source,
          celestialObject: s.celestialObject,
          frequency: s.frequency,
          signalStrength: s.signalStrength,
          duration: s.duration,
          bandwidth: s.bandwidth,
          signalPattern: s.signalPattern,
          isRepeated: s.isRepeated,
          isKnownInterference: s.isKnownInterference,
          isKnownNaturalPattern: s.isKnownNaturalPattern,
          signalNotes: s.signalNotes,
          sampleSignal: s._id,
          isSimulated: true,
        };
        if (observationId) payload.observation = observationId;
        // remove null values so validation ignores them
        Object.keys(payload).forEach((k) => (payload[k] === null || payload[k] === "") && delete payload[k]);
      }
      const res = await createAnalysis(payload);
      navigate(`/analyses/${res.data._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  };

  const observationSelect = (
    <FormField
      label="Link to an observation (optional)"
      name="observation"
      type="select"
      value={observationId}
      onChange={(e) => (tab === "manual" ? fillFromObservation(e.target.value) : setObservationId(e.target.value))}
      options={[{ value: "", label: "- none -" }, ...(observations || []).map((o) => ({ value: o._id, label: o.title }))]}
    />
  );

  return (
    <>
      <PageHeader title="Analyze Signal" subtitle="Enter your own signal or analyze a simulated sample. Nothing is saved until you press Save." />
      <div className="mb-3"><Disclaimer /></div>

      <ul className="nav nav-pills mb-3 gap-2">
        {[["manual", "Manual analysis"], ["sample", "Sample signals (simulated)"]].map(([key, label]) => (
          <li className="nav-item" key={key}>
            <button
              className={`nav-link ${tab === key ? "active" : ""}`}
              style={tab === key ? { background: "linear-gradient(135deg,#4f8cff,#8b5cf6)" } : { color: "var(--fs-muted)" }}
              onClick={() => { setTab(key); setPreview(null); setError(""); }}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      <ErrorMessage message={error} />

      {tab === "manual" && (
        <form className="space-card p-4 mb-4" onSubmit={runManual}>
          <div className="row">
            <div className="col-md-6">{observationSelect}</div>
            <div className="col-md-6"><FormField label="Signal name" name="signalName" value={form.signalName} onChange={handleChange} placeholder="e.g. Test signal 01" hint="Required to save the analysis." /></div>
            <div className="col-md-4"><FormField label="Observation source" name="source" value={form.source} onChange={handleChange} /></div>
            <div className="col-md-4"><FormField label="Observation date" name="observationDate" type="date" value={form.observationDate} onChange={handleChange} /></div>
            <div className="col-md-4"><FormField label="Celestial object / location" name="celestialObject" value={form.celestialObject} onChange={handleChange} /></div>
            <div className="col-md-3"><FormField label="Frequency (MHz)" name="frequency" type="number" step="any" min="0" value={form.frequency} onChange={handleChange} required /></div>
            <div className="col-md-3"><FormField label="Signal strength (dB SNR)" name="signalStrength" type="number" step="any" value={form.signalStrength} onChange={handleChange} required /></div>
            <div className="col-md-3"><FormField label="Duration (seconds)" name="duration" type="number" step="any" min="0" value={form.duration} onChange={handleChange} /></div>
            <div className="col-md-3"><FormField label="Bandwidth (Hz)" name="bandwidth" type="number" step="any" min="0" value={form.bandwidth} onChange={handleChange} hint="Narrowband is 1000 Hz or less" /></div>
            <div className="col-md-4"><FormField label="Signal pattern" name="signalPattern" type="select" options={SIGNAL_PATTERNS} value={form.signalPattern} onChange={handleChange} /></div>
            <div className="col-md-8 d-flex flex-wrap align-items-end gap-4 pb-1">
              <FormField label="Repeated detection" name="isRepeated" type="checkbox" value={form.isRepeated} onChange={handleChange} className="mb-2" />
              <FormField label="Known interference" name="isKnownInterference" type="checkbox" value={form.isKnownInterference} onChange={handleChange} className="mb-2" />
              <FormField label="Known natural characteristics" name="isKnownNaturalPattern" type="checkbox" value={form.isKnownNaturalPattern} onChange={handleChange} className="mb-2" />
            </div>
            <div className="col-12"><FormField label="Signal notes" name="signalNotes" type="textarea" value={form.signalNotes} onChange={handleChange} /></div>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-fs" disabled={busy}>{busy ? "Analyzing..." : "Run analysis"}</button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => { setForm(emptyForm); setPreview(null); setObservationId(""); }}>Reset</button>
          </div>
        </form>
      )}

      {tab === "sample" && (
        <div className="mb-4">
          <div className="notice notice-warn mb-3">
            These signals are <strong>simulated educational data</strong>. They are not real astronomical discoveries.
          </div>
          {samplesLoading && <Loader />}
          <ErrorMessage message={samplesError} />
          <div className="row g-3">
            {(samples || []).map((s) => (
              <div className="col-md-6 col-xl-4" key={s._id}>
                <div className={`space-card p-3 h-100 sample-card ${selectedSample?._id === s._id ? "selected" : ""}`} onClick={() => !busy && runSample(s)}>
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <strong>{s.name}</strong>
                    <SimulatedBadge />
                  </div>
                  <p className="small text-muted-space">{s.description}</p>
                  <div className="small">
                    {formatNumber(s.frequency, "MHz")} · {formatNumber(s.bandwidth, "Hz")} · {s.signalPattern}
                    {s.isRepeated ? " · repeated" : ""}
                  </div>
                  <div className="mt-2 small text-muted-space">
                    Expected: <ClassificationBadge value={s.expectedClassification} /> {s.expectedConfidence}%
                  </div>
                  <button className="btn btn-sm btn-outline-light mt-3" disabled={busy}>Analyze this sample</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div ref={resultRef}>
        {busy && !preview && <Loader text="Running the analysis engine..." />}
        {preview && (
          <>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h4 className="mb-0">Analysis preview</h4>
              <button className="btn btn-fs" onClick={save} disabled={busy}>{busy ? "Saving..." : "💾 Save analysis"}</button>
            </div>
            {preview.expected && (
              <div className={`notice mb-3 ${preview.matchesExpected ? "notice-info" : "notice-warn"}`}>
                <strong>Expected result for this sample:</strong> {preview.expected.classification} ({preview.expected.confidence}%) -{" "}
                {preview.matchesExpected ? "the engine produced exactly this result." : "the engine result differs from the documented expectation."}
              </div>
            )}
            <AnalysisResultView data={preview.data} preview />
          </>
        )}
      </div>
    </>
  );
}
