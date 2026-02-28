// ============================================================
// components/assignment/EditorWrapper.jsx
// Monaco SQL editor + Execute button
// ============================================================

import { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import Button from "../shared/Button";
import { useQueryExec } from "../../hooks/useQueryExec";

const MONACO_OPTIONS = {
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontLigatures: true,
  minimap: { enabled: false },
  lineNumbers: "on",
  scrollBeyondLastLine: false,
  wordWrap: "on",
  tabSize: 2,
  automaticLayout: true,
  padding: { top: 12, bottom: 12 },
  suggest: { snippetsPreventQuickSuggestions: false },
};

const DEFAULT_QUERY = "-- Write your SQL query here\nSELECT ";

export default function EditorWrapper() {
  const editorRef = useRef(null);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const { runQuery, isExecuting } = useQueryExec();

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    // Focus editor on mount
    editor.focus();
  };

  const handleExecute = () => {
    const currentQuery = editorRef.current
      ? editorRef.current.getValue()
      : query;
    runQuery(currentQuery.trim());
  };

  // Ctrl/Cmd + Enter to execute
  const handleEditorKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleExecute();
    }
  };

  return (
    <div className="editor-wrapper" onKeyDown={handleEditorKeyDown}>
      <div className="editor-wrapper__toolbar">
        <span className="editor-wrapper__lang-badge">SQL</span>
        <div className="editor-wrapper__actions">
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-muted, #888)",
            }}
          >
            Ctrl+Enter to run
          </span>
        </div>
      </div>

      <div className="editor-wrapper__monaco">
        <Editor
          height="100%"
          defaultLanguage="sql"
          defaultValue={DEFAULT_QUERY}
          theme="vs-dark"
          options={MONACO_OPTIONS}
          onChange={(val) => setQuery(val || "")}
          onMount={handleEditorMount}
        />
      </div>

      <div className="editor-wrapper__footer">
        <button
          className={`execute-btn ${isExecuting ? "execute-btn--loading" : ""} execute-btn--full`}
          onClick={handleExecute}
          disabled={isExecuting}
          type="button"
        >
          {isExecuting ? "Executing…" : "▶  Run Query"}
        </button>
      </div>
    </div>
  );
}
