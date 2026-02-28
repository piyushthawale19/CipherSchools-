 // services/resultFormatter.service.js
// Converts raw pg query results into a structured frontend format.
 
/**
 * Formats the sandbox runner result for the frontend.
 * @param {{ columns, rows, rowCount, executionTime, truncated }} rawResult
 * @returns {{ columns: string[], rows: any[][], rowCount: number, executionTime: number, truncated: boolean }}
 */
function formatResult(rawResult) {
  const { columns, rows, rowCount, executionTime, truncated } = rawResult;

  // Convert row objects to arrays aligned with column order
  const formattedRows = rows.map((row) =>
    columns.map((col) => {
      const val = row[col];
      if (val === null || val === undefined) return null;
      return val;
    }),
  );

  return {
    columns,
    rows: formattedRows,
    rowCount,
    executionTime,
    truncated: truncated || false,
  };
}

module.exports = { formatResult };
