// ============================================================
// components/assignment/ResultsPanel.jsx
// Displays the query result table or an error message.
// ============================================================

import { useQueryExec } from "../../hooks/useQueryExec";
import LoadingSpinner from "../shared/LoadingSpinner";

export default function ResultsPanel() {
  const { result, execError, isExecuting, submitStatus } = useQueryExec();

  if (isExecuting) {
    return (
      <div className="results-panel">
        <div className="results-panel__header">
          <span>Results</span>
        </div>
        <div className="results-panel__body results-panel__empty">
          <LoadingSpinner size="md" label="Executing query…" />
        </div>
      </div>
    );
  }

  if (execError || submitStatus === "error" || submitStatus === "blocked") {
    return (
      <div className="results-panel">
        <div className="results-panel__header">
          <span>Results</span>
          <span className="badge badge--error">Error</span>
        </div>
        <div className="results-panel__body">
          <div className="error-panel">
            <p className="error-panel__title">
              {submitStatus === "blocked" ? "Query Blocked" : "Execution Error"}
            </p>
            <pre className="error-panel__message">{execError}</pre>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results-panel">
        <div className="results-panel__header">
          <span>Results</span>
        </div>
        <div className="results-panel__body results-panel__empty">
          <p>Run a query to see results here.</p>
        </div>
      </div>
    );
  }

  const { columns, rows, rowCount, executionTime, isTruncated } = result;

  return (
    <div className="results-panel">
      <div className="results-panel__header">
        <span>Results</span>
        <span className="results-panel__meta">
          {rowCount} row{rowCount !== 1 ? "s" : ""}
          {executionTime ? ` · ${executionTime}ms` : ""}
        </span>
      </div>

      {isTruncated && (
        <div className="results-panel__warning">Showing first 500 rows.</div>
      )}

      <div className="results-panel__body">
        {rows.length === 0 ? (
          <div className="results-panel__empty">
            <p>Query returned 0 rows.</p>
          </div>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="results-table__th">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="results-table__row">
                  {row.map((cell, ci) => {
                    const isNull = cell === null || cell === undefined;
                    const isNum = !isNull && typeof cell === "number";
                    const isBool = !isNull && typeof cell === "boolean";
                    return (
                      <td
                        key={ci}
                        className={[
                          "results-table__cell",
                          isNull ? "results-table__cell--null" : "",
                          isNum ? "results-table__cell--number" : "",
                          isBool ? "results-table__cell--boolean" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {isNull ? "NULL" : String(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
