// ============================================================
// middleware/errorHandler.middleware.js
// Global Express error handler — always the last middleware.
// Sanitizes errors before sending to client.
// ============================================================

const logger = require("../utils/logger");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;

  // Log full error internally
  logger.error(`[ErrorHandler] ${req.method} ${req.path} → ${err.message}`);
  if (err.stack && process.env.NODE_ENV !== "production") {
    logger.debug(err.stack);
  }

  // Never expose stack traces to client
  const response = {
    error: status === 500 ? "An internal server error occurred." : err.message,
  };

  if (err.code) {
    response.code = err.code;
  }

  res.status(status).json(response);
}

module.exports = errorHandler;
