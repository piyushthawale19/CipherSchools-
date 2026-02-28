// ============================================================
// context/QueryContext.jsx
// Provides query execution state for the AssignmentPage.
// Scoped to a single assignment — mounted/unmounted per route.
// ============================================================

import { createContext, useCallback, useContext, useState } from "react";
import { executeQuery, requestHint } from "../api/queryApi";
import { parseError } from "../utils/errorParser";

// ── Context ──────────────────────────────────────────────────
const QueryContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────
export function QueryProvider({ assignmentId, children }) {
  // Query result state
  const [result, setResult] = useState(null); // { columns, rows, rowCount, executionTime }
  const [isExecuting, setIsExecuting] = useState(false);
  const [execError, setExecError] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null); // null | true | false
  const [submitStatus, setSubmitStatus] = useState(null); // 'correct'|'incorrect'|'error'|'blocked'

  // Hint state
  const [hints, setHints] = useState([]);
  const [isFetchingHint, setIsFetchingHint] = useState(false);
  const [hintError, setHintError] = useState(null);
  const [hintsRemaining, setHintsRemaining] = useState(null);

  // ── Execute query ────────────────────────────────────────
  const runQuery = useCallback(
    async (query) => {
      if (!query?.trim()) return;
      setIsExecuting(true);
      setExecError(null);
      setResult(null);
      setIsCorrect(null);
      setSubmitStatus(null);

      try {
        const { data } = await executeQuery(assignmentId, query);
        setResult({
          columns: data.columns,
          rows: data.rows,
          rowCount: data.rowCount,
          executionTime: data.executionTime,
          isTruncated: data.isTruncated,
        });
        setIsCorrect(data.isCorrect);
        setSubmitStatus(data.status);
      } catch (err) {
        const message = parseError(err);
        setExecError(message);
        setSubmitStatus("error");
      } finally {
        setIsExecuting(false);
      }
    },
    [assignmentId],
  );

  // ── Request hint ─────────────────────────────────────────
  const getHint = useCallback(
    async (query, errorMessage) => {
      setIsFetchingHint(true);
      setHintError(null);

      try {
        const { data } = await requestHint({
          assignmentId,
          query: query || "",
          errorMessage: errorMessage || "",
        });
        setHints((prev) => [...prev, data.hint]);
        if (typeof data.hintsUsedThisHour !== "undefined") {
          setHintsRemaining(data.hintLimitPerHour - data.hintsUsedThisHour);
        }
      } catch (err) {
        setHintError(parseError(err));
      } finally {
        setIsFetchingHint(false);
      }
    },
    [assignmentId],
  );

  // ── Reset state (e.g., on assignment change) ─────────────
  const reset = useCallback(() => {
    setResult(null);
    setExecError(null);
    setIsCorrect(null);
    setSubmitStatus(null);
    setHints([]);
    setHintError(null);
  }, []);

  return (
    <QueryContext.Provider
      value={{
        result,
        isExecuting,
        execError,
        isCorrect,
        submitStatus,
        hints,
        isFetchingHint,
        hintError,
        hintsRemaining,
        runQuery,
        getHint,
        reset,
      }}
    >
      {children}
    </QueryContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────
export const useQueryContext = () => {
  const ctx = useContext(QueryContext);
  if (!ctx)
    throw new Error("useQueryContext must be used within <QueryProvider>");
  return ctx;
};
