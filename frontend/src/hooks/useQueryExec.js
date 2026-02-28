// ============================================================
// hooks/useQueryExec.js
// Convenience wrapper around QueryContext.
// ============================================================

import { useQueryContext } from "../context/QueryContext";

/**
 * Returns query execution state and actions from the nearest QueryProvider.
 * Must be used inside an AssignmentPage (which mounts QueryProvider).
 */
export const useQueryExec = () => useQueryContext();
