// ============================================================
// components/shared/ErrorMessage.jsx
// ============================================================

/**
 * @param {{ message: string, onDismiss?: Function }} props
 */
export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="auth-card__alert" role="alert">
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "inherit",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
