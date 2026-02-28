// ============================================================
// middleware/rateLimit.middleware.js
// Per-route rate limiters using express-rate-limit.
// ============================================================

const rateLimit = require("express-rate-limit");
const {
  QUERY_RATE_LIMIT_WINDOW_MS,
  QUERY_RATE_LIMIT_MAX,
} = require("../config/env");

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

// Auth endpoints (login/register) — stricter
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts. Please try again in 1 hour.",
  },
});

// Query execution
const queryLimiter = rateLimit({
  windowMs: QUERY_RATE_LIMIT_WINDOW_MS,
  max: QUERY_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Query rate limit exceeded. Please slow down." },
});

module.exports = { apiLimiter, authLimiter, queryLimiter };
