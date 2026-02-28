// ============================================================
// components/assignment/HintPanel.jsx
// Requests LLM hints (guidance only, never answers).
// ============================================================

import { useRef, useState } from "react";
import { useQueryExec } from "../../hooks/useQueryExec";
import Button from "../shared/Button";

export default function HintPanel() {
  const {
    hints,
    isFetchingHint,
    hintError,
    hintsRemaining,
    getHint,
    execError,
  } = useQueryExec();
  const [isOpen, setIsOpen] = useState(true);

  // To pass the current query to the hint request, we read from a shared ref
  // (EditorWrapper stores its value internally). We send execError as context.
  const handleRequestHint = () => {
    // We don't have the editor value here — send the error as context.
    // The query field is optional on the backend.
    getHint("", execError || "");
  };

  return (
    <div className="hint-panel">
      <button
        className="hint-panel__trigger"
        onClick={() => setIsOpen((p) => !p)}
        type="button"
        aria-expanded={isOpen}
      >
        <span>💡 Hints</span>
        <span className="hint-panel__counter">
          {hints.length > 0
            ? `${hints.length} hint${hints.length > 1 ? "s" : ""}`
            : ""}
        </span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="hint-panel__body">
          <p className="hint-panel__disclaimer">
            Hints guide you — never reveal the answer.
          </p>

          {hints.length === 0 ? (
            <p className="hint-panel__empty">
              Stuck? Request a hint to get guidance without spoilers.
            </p>
          ) : (
            <ol className="hint-panel__list">
              {hints.map((hint, i) => (
                <li key={i} className="hint-panel__item">
                  <span className="hint-panel__item-num">{i + 1}</span>
                  <p className="hint-panel__item-text">{hint}</p>
                </li>
              ))}
            </ol>
          )}

          {hintError && <p className="hint-panel__error">{hintError}</p>}

          {typeof hintsRemaining === "number" && hintsRemaining <= 1 && (
            <p className="hint-panel__limit-warn">
              {hintsRemaining === 0
                ? "Hint limit reached for this hour."
                : "1 hint remaining this hour."}
            </p>
          )}

          <Button
            variant="secondary"
            size="sm"
            full
            loading={isFetchingHint}
            disabled={isFetchingHint || hintsRemaining === 0}
            onClick={handleRequestHint}
          >
            {isFetchingHint ? "Getting hint…" : "Get a Hint"}
          </Button>
        </div>
      )}
    </div>
  );
}
