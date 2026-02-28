// ============================================================
// server.js — Application entry point
// Connects to databases, then starts the HTTP server.
// ============================================================

require("dotenv").config();

const { validateEnv, PORT } = require("./config/env");
const { connectMongoDB } = require("./config/db.mongo");
const { connectPostgres } = require("./config/db.postgres");
const logger = require("./utils/logger");
const app = require("./app");

// Validate all required environment variables before anything starts
validateEnv();

async function start() {
  await connectMongoDB();
  await connectPostgres();

  const server = app.listen(PORT, () => {
    logger.info(
      `[Server] CipherSQLStudio API running on port ${PORT} [${process.env.NODE_ENV}]`,
    );
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    logger.info("[Server] SIGTERM received. Shutting down gracefully...");
    server.close(() => {
      logger.info("[Server] HTTP server closed.");
      process.exit(0);
    });
  });
}

process.on("unhandledRejection", (reason) => {
  logger.error(`[Server] Unhandled Promise Rejection: ${reason}`);
  process.exit(1);
});

start();
