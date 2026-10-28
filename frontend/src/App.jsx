import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./layouts/PublicLayout";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import Dashboard from "./pages/Dashboard";
import Observations from "./pages/Observations";
import ObservationForm from "./pages/ObservationForm";
import ObservationDetails from "./pages/ObservationDetails";
import SignalAnalysis from "./pages/SignalAnalysis";
import AnalyzeSignal from "./pages/AnalyzeSignal";
import AnalysisResult from "./pages/AnalysisResult";
import HypothesisExplorer from "./pages/HypothesisExplorer";
import Reports from "./pages/Reports";
import ReportForm from "./pages/ReportForm";
import ReportDetails from "./pages/ReportDetails";
import Profile from "./pages/Profile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageObservations from "./pages/admin/ManageObservations";
import ManageReports from "./pages/admin/ManageReports";

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Pages for logged-in users (researchers and admins) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/observations" element={<Observations />} />
          <Route path="/observations/new" element={<ObservationForm />} />
          <Route path="/observations/:id" element={<ObservationDetails />} />
          <Route path="/observations/:id/edit" element={<ObservationForm />} />
          <Route path="/analyses" element={<SignalAnalysis />} />
          <Route path="/analyses/new" element={<AnalyzeSignal />} />
          <Route path="/analyses/:id" element={<AnalysisResult />} />
          <Route path="/hypotheses" element={<HypothesisExplorer />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/new" element={<ReportForm />} />
          <Route path="/reports/:id" element={<ReportDetails />} />
          <Route path="/reports/:id/edit" element={<ReportForm />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Administrator pages */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/observations" element={<ManageObservations />} />
          <Route path="/admin/reports" element={<ManageReports />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
