import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import useDebounce from "../hooks/useDebounce";
import { getHypotheses, saveHypothesisNote } from "../services/hypothesisService";
import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import { getErrorMessage } from "../utils/format";

// One hypothesis card with its own personal-note editor
function HypothesisCard({ hypothesis, index }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(hypothesis.myNote || "");
  const [saved, setSaved] = useState(hypothesis.myNote || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setNote(hypothesis.myNote || "");
    setSaved(hypothesis.myNote || "");
  }, [hypothesis.myNote]);

  const save = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await saveHypothesisNote(hypothesis._id, note);
      setSaved(res.data.myNote);
      setMessage("Note saved.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-card mb-3">
      <button className="btn w-100 text-start d-flex justify-content-between align-items-center p-3 text-light" onClick={() => setOpen(!open)}>
        <span>
          <span className="stage-num">{index + 1}</span>
          <strong>{hypothesis.name}</strong>
          {saved && <span className="fs-badge ms-2" style={{ "--badge-color": "#4f8cff" }}>has your note</span>}
        </span>
        <span className="text-muted-space">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-3 pb-3">
          <p>{hypothesis.explanation}</p>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="card-title-sm" style={{ color: "#34d399" }}>Supporting arguments</div>
              <ul className="ps-3 mb-0">{hypothesis.supportingArguments.map((a, i) => <li key={i}>{a}</li>)}</ul>
            </div>
            <div className="col-md-6">
              <div className="card-title-sm" style={{ color: "#fbbf24" }}>Limitations</div>
              <ul className="ps-3 mb-0">{hypothesis.limitations.map((a, i) => <li key={i}>{a}</li>)}</ul>
            </div>
          </div>
          {hypothesis.researchNotes && (
            <div className="notice notice-info mt-3">
              <strong>Research note:</strong> {hypothesis.researchNotes}
            </div>
          )}

          <div className="mt-3">
            <label className="form-label">Your personal notes (private to you)</label>
            <textarea className="form-control" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write your own thoughts, questions or references..." />
            <div className="d-flex align-items-center gap-3 mt-2">
              <button className="btn btn-fs btn-sm" onClick={save} disabled={busy || note === saved}>{busy ? "Saving..." : "Save note"}</button>
              {message && <span className="text-success small">{message}</span>}
              {error && <span className="text-danger small">{error}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HypothesisExplorer() {
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search);
  const { data, loading, error, reload } = useFetch(() => getHypotheses({ search: debounced }), [debounced]);

  return (
    <>
      <PageHeader title="Fermi Paradox Hypothesis Explorer" subtitle="If intelligent civilizations are likely, why do we see no sign of them? Explore ten proposed answers." />
      <div className="notice notice-info mb-3">
        These are <strong>hypotheses</strong>, not facts. None of them has been proven, and several can be true at the same time.
      </div>
      <input className="form-control mb-3" placeholder="Search hypotheses (e.g. filter, distance, silence)..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <ErrorMessage message={error} onRetry={reload} />
      {loading && <Loader />}
      {data && data.length === 0 && <div className="text-muted-space">No hypothesis matches your search.</div>}
      {data && data.map((h, i) => <HypothesisCard key={h._id} hypothesis={h} index={i} />)}
    </>
  );
}
