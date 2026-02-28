// ============================================================
// components/assignment/SchemaViewer.jsx
// Displays the PostgreSQL schema for an assignment (tables + columns).
// ============================================================

import { useState } from "react";

/**
 * sampleTables: Array<{
 *   tableName: string,
 *   columns: Array<{ name: string, type: string, constraints?: string }>,
 *   sampleRows?: Array<Record<string, any>>
 * }>
 */
export default function SchemaViewer({ sampleTables = [] }) {
  const [expanded, setExpanded] = useState(() =>
    Object.fromEntries(sampleTables.map((t) => [t.tableName, true])),
  );

  const toggle = (name) =>
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

  if (!sampleTables.length) {
    return (
      <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
        No schema information available.
      </p>
    );
  }

  return (
    <div className="schema-viewer">
      <p className="schema-viewer__title">Schema</p>
      {sampleTables.map((table) => (
        <div key={table.tableName} className="schema-viewer__table">
          <div
            className="schema-viewer__table-header"
            onClick={() => toggle(table.tableName)}
            role="button"
            aria-expanded={expanded[table.tableName]}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && toggle(table.tableName)}
          >
            <span className="schema-viewer__table-name">
              <span className="schema-viewer__table-icon">⊞</span>
              {table.tableName}
            </span>
            <span className="schema-viewer__table-toggle">
              {expanded[table.tableName] ? "▲" : "▼"}
            </span>
          </div>

          {expanded[table.tableName] && (
            <div className="schema-viewer__columns">
              {table.columns.map((col, i) => (
                <div key={i} className="schema-viewer__column">
                  <span className="schema-viewer__column-name">{col.name}</span>
                  <span className="schema-viewer__column-type">{col.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
