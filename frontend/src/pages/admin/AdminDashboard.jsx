import Dashboard from "../Dashboard";

// The admin dashboard is the same component as the researcher dashboard,
// with extra user statistics (the backend sends system-wide numbers to admins).
export default function AdminDashboard() {
  return <Dashboard admin />;
}
