// Builds the Express app (routes + middleware). server.js connects to MongoDB and starts it.
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// ---- Middleware ----
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" })); // lets us read JSON from req.body
if (process.env.NODE_ENV !== "test") app.use(morgan("dev")); // logs each request

// ---- Health check ----
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    project: "FermiScope",
    message: "FermiScope API is running. This version uses simulated educational data.",
  });
});

// ---- Routes ----
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/observations", require("./routes/observationRoutes"));
app.use("/api/analyses", require("./routes/analysisRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/hypotheses", require("./routes/hypothesisRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/astronomy", require("./routes/astronomyRoutes"));

// ---- Error handlers (must come LAST) ----
app.use(notFound);
app.use(errorHandler);

module.exports = app;
