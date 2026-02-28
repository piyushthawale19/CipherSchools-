// ============================================================
// api/queryApi.js
// Assignment, query execution, and hint API calls.
// ============================================================

import axiosInstance from "./axiosInstance";

// ── Assignments ──────────────────────────────────────────────

/**
 * Get a paginated, filterable list of published assignments.
 * @param {{ difficulty?: string, category?: string, page?: number, limit?: number }} params
 */
export const getAssignments = (params = {}) =>
  axiosInstance.get("/api/assignments", { params });

/**
 * Get a single assignment by ID (includes schemaDescription, sampleTables).
 * @param {string} id
 */
export const getAssignment = (id) =>
  axiosInstance.get(`/api/assignments/${id}`);

/**
 * Get the PostgreSQL schema description for a specific assignment.
 * @param {string} id
 */
export const getAssignmentSchema = (id) =>
  axiosInstance.get(`/api/assignments/${id}/schema`);

// ── Query execution ──────────────────────────────────────────

/**
 * Execute a SQL query against the assignment sandbox.
 * Returns { columns, rows, rowCount, executionTime, isCorrect, status }.
 * @param {string} assignmentId
 * @param {string} query
 */
export const executeQuery = (assignmentId, query) =>
  axiosInstance.post("/api/query/execute", { assignmentId, query });

/**
 * Get submission history for the current user for an assignment.
 * @param {string} assignmentId
 * @param {{ page?: number, limit?: number }} params
 */
export const getSubmissions = (assignmentId, params = {}) =>
  axiosInstance.get(`/api/query/history/${assignmentId}`, { params });

// ── Hints ────────────────────────────────────────────────────

/**
 * Request an LLM hint for a given assignment + current query + error.
 * @param {{ assignmentId: string, query: string, errorMessage?: string }} data
 */
export const requestHint = (data) =>
  axiosInstance.post("/api/hints/request", data);
