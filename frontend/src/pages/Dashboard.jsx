import { Link, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useAuth from "../hooks/useAuth";
import { getDashboardStats } from "../services/dashboardService";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import Disclaimer from "../components/Disclaimer";
import { ClassificationPie, FrequencyBar, TrendLine, VerificationBar } from "../components/Charts";
import { ClassificationBadge, RoleBadge, StatusBadge, VerificationBadge } from "../components/Badges";
import { CLASS_COLORS } from "../utils/constants";
import { formatDate } from "../utils/format";

// "admin" = true shows the administrator version (system-wide numbers + user statistics)
export default function Dashboard({ admin = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useFetch(getDashboardStats, []);

  if (loading) return <Loader text="Loading statistics from MongoDB..." />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;

  const t = data.totals;
  const isSystem = data.scope === "system";

  return (
    <>
      <PageHeader
        title={admin ? "Admin Dashboard" : "Research Dashboard"}
        subtitle={
          isSystem
            ? "System-wide statistics (all researchers)"
            : `Your personal research statistics, ${user.name}`
        }
      >
        <Link to="/analyses/new" className="btn btn-fs">⚡ Analyze signal</Link>
        <Link to="/observations/new" className="btn btn-outline-light">+ Observation</Link>
      </PageHeader>

      <div className="mb-3"><Disclaimer compact /></div>

      {admin && isSystem && (
        <div className="row g-3 mb-3">
          <div className="col-6 col-md-3"><StatCard label="Registered users" value={t.users} color="#22d3ee" /></div>
          <div className="col-6 col-md-3"><StatCard label="Researchers" value={t.researchers} color="#4f8cff" /></div>
          <div className="col-6 col-md-3"><StatCard label="Administrators" value={t.admins} color="#8b5cf6" /></div>
          <div className="col-6 col-md-3"><StatCard label="Research reports" value={t.reports} color="#fb923c" /></div>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-4 col-xl"><StatCard label="Total observations" value={t.observations} color="#4f8cff" /></div>
        <div className="col-6 col-md-4 col-xl"><StatCard label="Analyzed signals" value={t.analyses} color="#22d3ee" /></div>
        <div className="col-6 col-md-4 col-xl"><StatCard label="Potential artificial (unconfirmed)" value={t.candidates} color={CLASS_COLORS["Potential Artificial Signal"]} /></div>
        <div className="col-6 col-md-4 col-xl"><StatCard label="Natural phenomena" value={t.natural} color={CLASS_COLORS["Natural Phenomenon"]} /></div>
        <div className="col-6 col-md-4 col-xl"><StatCard label="Human-made interference" value={t.interference} color={CLASS_COLORS["Human-Made Interference"]} /></div>
        <div className="col-6 col-md-4 col-xl"><StatCard label="Unknown signals" value={t.unknown} color={CLASS_COLORS["Unknown Signal"]} /></div>
        {!(admin && isSystem) && (
          <div className="col-6 col-md-4 col-xl"><StatCard label="Research reports" value={t.reports} color="#fb923c" /></div>
        )}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-6"><ClassificationPie data={data.classificationDistribution} /></div>
        <div className="col-lg-6"><TrendLine data={data.observationTrends} /></div>
        <div className="col-lg-6"><FrequencyBar data={data.frequencyDistribution} /></div>
        <div className="col-lg-6"><VerificationBar data={data.verificationDistribution} /></div>
      </div>

      <div className="row g-3">
        <div className="col-xl-6">
          <div className="space-card p-3">
            <div className="d-flex justify-content-between">
              <div className="card-title-sm">Recent observations</div>
              <Link to="/observations" className="small">View all</Link>
            </div>
            <DataTable
              rows={data.recentObservations}
              onRowClick={(r) => navigate(`/observations/${r._id}`)}
              emptyText="No observations yet."
              columns={[
                { key: "title", label: "Title" },
                { key: "observationDate", label: "Date", render: (r) => formatDate(r.observationDate) },
                { key: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
              ]}
            />
          </div>
        </div>
        <div className="col-xl-6">
          <div className="space-card p-3">
            <div className="d-flex justify-content-between">
              <div className="card-title-sm">Recent signal analyses</div>
              <Link to="/analyses" className="small">View all</Link>
            </div>
            <DataTable
              rows={data.recentAnalyses}
              onRowClick={(r) => navigate(`/analyses/${r._id}`)}
              emptyText="No analyses yet."
              columns={[
                { key: "signalName", label: "Signal" },
                { key: "classification", label: "Class", render: (r) => <ClassificationBadge value={r.classification} /> },
                { key: "confidenceScore", label: "Conf.", render: (r) => `${r.confidenceScore}%` },
                { key: "verificationStatus", label: "Verification", render: (r) => <VerificationBadge value={r.verificationStatus} /> },
              ]}
            />
          </div>
        </div>
        {admin && data.recentUsers && (
          <div className="col-12">
            <div className="space-card p-3">
              <div className="d-flex justify-content-between">
                <div className="card-title-sm">Newest users</div>
                <Link to="/admin/users" className="small">Manage users</Link>
              </div>
              <DataTable
                rows={data.recentUsers}
                columns={[
                  { key: "name", label: "Name" },
                  { key: "email", label: "Email" },
                  { key: "role", label: "Role", render: (r) => <RoleBadge value={r.role} /> },
                  { key: "createdAt", label: "Joined", render: (r) => formatDate(r.createdAt) },
                ]}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
