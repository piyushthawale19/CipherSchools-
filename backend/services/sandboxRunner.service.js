// services/sandboxRunner.service.js
// Executes validated SQL queries in the PostgreSQL sandbox.
// Sets search_path, statement_timeout, and work_mem per session.


const { pool } = require("../config/db.postgres");
const logger = require("../utils/logger");

const ROW_LIMIT = 500;
const STATEMENT_TIMEOUT_MS = 5000;
const WORK_MEM = "4MB";

/**
 * Sanitizes a PostgreSQL error before sending to the client.
 * Strips internal file paths, line numbers, etc.
 */
function sanitizePgError(err) {
  // Only expose the message, not the full detail
  const safe = err.message || "Query execution failed.";
  // Remove any file path references
  return safe.replace(/\/[^\s]+\.\w+/g, "[file]").replace(/line \d+/gi, "");
}

/**
 * Runs a validated SELECT query inside an isolated schema context.
 * @param {string} query - Validated SQL query
 * @param {string} schemaName - PostgreSQL schema to set as search_path
 * @returns {Promise<{ columns: string[], rows: any[][], rowCount: number, executionTime: number, truncated: boolean }>}
 */
async function runSandboxQuery(query, schemaName) {
  let client;
  const startTime = Date.now();

  try {
    client = await pool.connect();

    // Isolate to the assignment schema and apply safety limits
    await client.query(`SET search_path TO ${schemaName}, public`);
    await client.query(`SET statement_timeout = '${STATEMENT_TIMEOUT_MS}'`);
    await client.query(`SET work_mem = '${WORK_MEM}'`);

    const result = await client.query(query);
    const executionTime = Date.now() - startTime;

    const allRows = result.rows || [];
    const truncated = allRows.length > ROW_LIMIT;
    const rows = truncated ? allRows.slice(0, ROW_LIMIT) : allRows;
    const columns = result.fields ? result.fields.map((f) => f.name) : [];

    logger.debug(
      `[Sandbox] Query executed in ${executionTime}ms, ${rows.length} rows returned`,
    );

    return {
      columns,
      rows,
      rowCount: rows.length,
      executionTime,
      truncated,
    };
  } catch (err) {
    const executionTime = Date.now() - startTime;
    logger.error(`[Sandbox] Query error: ${err.message}`);
    throw {
      isQueryError: true,
      message: sanitizePgError(err),
      executionTime,
    };
  } finally {
    if (client) client.release();
  }
}

module.exports = { runSandboxQuery };
