 // config/db.postgres.js — PostgreSQL sandbox connection pool
// Uses a read-only user with SELECT-only privileges.
 
const { Pool } = require("pg");
const { PG } = require("./env");
const logger = require("../utils/logger");

const pool = new Pool({
  host: PG.host,
  port: PG.port,
  database: PG.database,
  user: PG.user,
  password: PG.password,
  max: 20, // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

async function connectPostgres() {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    logger.info("[PostgreSQL] Connected successfully");
  } catch (err) {
    logger.error(`[PostgreSQL] Connection failed: ${err.message}`);
    // Non-fatal if sandbox is temporarily unavailable — warn only
    logger.warn(
      "[PostgreSQL] Sandbox DB may be unavailable. Query execution will fail.",
    );
  }
}

module.exports = { pool, connectPostgres };
