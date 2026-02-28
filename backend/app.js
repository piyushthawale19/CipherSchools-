// ============================================================
// app.js — Express application setup
// Configures middleware stack and mounts all route modules.
// ============================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const { CLIENT_ORIGIN } = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const assignmentRoutes = require("./routes/assignment.routes");
const queryRoutes = require("./routes/query.routes");
const hintRoutes = require("./routes/hint.routes");
const { apiLimiter } = require("./middleware/rateLimit.middleware");
const errorHandler = require("./middleware/errorHandler.middleware");

const app = express();

// --- Security headers ---
app.use(helmet());

// --- CORS ---
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true, // needed for httpOnly cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// --- Request parsing ---
app.use(express.json({ limit: "50kb" })); // Limit body size
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// --- HTTP request logging ---
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// --- Global rate limiter ---
app.use("/api", apiLimiter);

// --- Health check ---
app.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() }),
);

// --- Route mounting ---
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/hints", hintRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// --- Global error handler (must be last) ---
app.use(errorHandler);

module.exports = app;
