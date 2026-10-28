import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The proxy forwards every "/api" request from the React app (port 5173)
// to the Express server (port 5000). This avoids CORS problems during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
