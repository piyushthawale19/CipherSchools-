 // config/env.js — Centralized environment variable validation
// Validates required env vars at startup and fails fast.
 
const requiredVars = [
  "MONGO_URI",
  "PG_HOST",
  "PG_DATABASE",
  "PG_USER",
  "PG_PASSWORD",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "OPENAI_API_KEY",
];

function validateEnv() {
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(
      `[ENV] Missing required environment variables:\n  ${missing.join("\n  ")}`,
    );
    console.error("[ENV] Check your .env file against .env.example");
    process.exit(1);
  }
}

module.exports = {
  validateEnv,
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
  PG: {
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT || "5432", 10),
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
  },
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  HINT_RATE_LIMIT_PER_HOUR: parseInt(
    process.env.HINT_RATE_LIMIT_PER_HOUR || "5",
    10,
  ),
  QUERY_RATE_LIMIT_WINDOW_MS: parseInt(
    process.env.QUERY_RATE_LIMIT_WINDOW_MS || "60000",
    10,
  ),
  QUERY_RATE_LIMIT_MAX: parseInt(process.env.QUERY_RATE_LIMIT_MAX || "30", 10),
};
