import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

// Navbar + sidebar + page content + footer. Used by MainLayout and AdminLayout.
export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Navbar onToggleSidebar={() => setSidebarOpen((open) => !open)} />
      <div className="app-shell">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-area">
          <main className="main-content">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
