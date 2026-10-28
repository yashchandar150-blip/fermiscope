import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Layout for Home, Login and Register (no sidebar)
export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 56px - 62px)" }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
