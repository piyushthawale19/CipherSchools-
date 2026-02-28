 // services/queryValidator.service.js
// Validates SQL queries before execution in the sandbox.
// Uses blocklist + allowlist + statement count checks.
 
const MAX_QUERY_LENGTH = 2000;

 const BLOCKED_KEYWORDS = [
  /\bDROP\b/i,
  /\bDELETE\b/i,
  /\bTRUNCATE\b/i,
  /\bALTER\b/i,
  /\bUPDATE\b/i,
  /\bINSERT\b/i,
  /\bCREATE\b/i,
  /\bGRANT\b/i,
  /\bREVOKE\b/i,
  /\bEXEC(?:UTE)?\b/i,
  /\bxp_/i,
  /pg_sleep/i,
  /pg_read_file/i,
  /pg_ls_dir/i,
  /COPY\b/i,
  /\\\\copy/i,
  /information_schema/i,
  /pg_catalog/i,
];

/**
 * Validates a SQL query string.
 * @param {string} queryString - Raw SQL from user
 * @returns {{ valid: boolean, reason?: string }}
 */
function validateQuery(queryString) {
  if (!queryString || typeof queryString !== "string") {
    return { valid: false, reason: "Query must be a non-empty string." };
  }

  const trimmed = queryString.trim();

  // Length check
  if (trimmed.length > MAX_QUERY_LENGTH) {
    return {
      valid: false,
      reason: `Query exceeds maximum allowed length of ${MAX_QUERY_LENGTH} characters.`,
    };
  }

  // Strip single-line and multi-line comments before checking
  const stripped = trimmed
    .replace(/--[^\n]*/g, "") // single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // multi-line comments
    .trim();

  if (!stripped) {
    return { valid: false, reason: "Query is empty after stripping comments." };
  }

  // Multiple statement check: split by semicolons
  const statements = stripped.split(";").filter((s) => s.trim().length > 0);
  if (statements.length > 1) {
    return {
      valid: false,
      reason: "Only one SQL statement is allowed per execution.",
    };
  }

  // Allowlist: must start with SELECT
  if (!/^\s*SELECT\b/i.test(stripped)) {
    return { valid: false, reason: "Only SELECT statements are allowed." };
  }

  // Blocklist check
  for (const pattern of BLOCKED_KEYWORDS) {
    if (pattern.test(stripped)) {
      const match = stripped.match(pattern);
      return {
        valid: false,
        reason: `Query contains a disallowed keyword: "${match ? match[0] : "unknown"}".`,
      };
    }
  }

  return { valid: true };
}

module.exports = { validateQuery };
