import Reports from "../Reports";

// Administrators see every report (the backend returns all reports for admins).
export default function ManageReports() {
  return <Reports adminView />;
}
