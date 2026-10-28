import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Disclaimer from "../components/Disclaimer";

const features = [
  { icon: "📡", title: "Signal Analysis Engine", text: "Enter a signal or pick a simulated sample. A transparent rule-based engine classifies it and explains every score point." },
  { icon: "🔭", title: "Observation Records", text: "Log telescope observations, search, filter and keep your research history organised." },
  { icon: "💡", title: "Fermi Paradox Explorer", text: "Read ten hypotheses, compare supporting arguments with limitations and save personal notes." },
  { icon: "📄", title: "Research Reports", text: "Combine observations, analyses and hypotheses into a report and export it as a PDF." },
  { icon: "📊", title: "Research Dashboard", text: "Live statistics and charts built from your MongoDB data." },
  { icon: "🛡️", title: "Roles and Security", text: "JWT login with Researcher and Administrator roles, enforced in the frontend and the backend." },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container py-5">
      <section className="text-center py-4">
        <div className="text-muted-space small mb-2">Alien Civilization Research and Signal Detection System</div>
        <h1 className="hero-title">
          If super civilizations exist,
          <br />
          <span className="gradient-text">why haven't we found them yet?</span>
        </h1>
        <p className="text-muted-space mx-auto mt-3" style={{ maxWidth: 700 }}>
          FermiScope simulates how scientists investigate unusual astronomical signals: detect, classify
          with transparent rules, and leave verification to careful follow-up.
        </p>
        <div className="d-flex justify-content-center gap-2 mt-4">
          {user ? (
            <Link to="/dashboard" className="btn btn-fs btn-lg">Open dashboard</Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-fs btn-lg">Get started</Link>
              <Link to="/login" className="btn btn-outline-light btn-lg">Login</Link>
            </>
          )}
        </div>
      </section>

      <section className="my-4">
        <Disclaimer />
      </section>

      <section className="row g-3 my-2">
        {features.map((f) => (
          <div className="col-md-6 col-lg-4" key={f.title}>
            <div className="space-card p-3 h-100">
              <div className="fs-2">{f.icon}</div>
              <h5 className="mt-2">{f.title}</h5>
              <p className="text-muted-space mb-0 small">{f.text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="space-card p-4 my-4">
        <h4 className="mb-3">How a signal is investigated</h4>
        <div className="row g-3">
          {[
            ["1", "Detection", "A researcher records frequency, strength, bandwidth, duration and pattern."],
            ["2", "Classification", "Four rule steps check interference, natural patterns, candidate criteria, then unknown."],
            ["3", "Verification", "Researchers update the status by hand: from Detected to Unconfirmed Candidate or Verified as Natural."],
          ].map(([n, t, d]) => (
            <div className="col-md-4" key={n}>
              <div className="stage-box">
                <span className="stage-num">{n}</span>
                <strong>{t}</strong>
                <div className="small text-muted-space mt-1">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
