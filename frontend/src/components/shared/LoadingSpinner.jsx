// ============================================================
// components/shared/LoadingSpinner.jsx
// ============================================================

import "./LoadingSpinner.scss";

/**
 * @param {{ size?: 'sm' | 'md' | 'lg', label?: string, fullPage?: boolean }} props
 */
export default function LoadingSpinner({
  size = "md",
  label,
  fullPage = false,
}) {
  const spinner = (
    <div
      className={`spinner spinner--${size}`}
      role="status"
      aria-label={label || "Loading"}
    >
      <div className="spinner__ring" />
    </div>
  );

  if (fullPage) {
    return (
      <div className="spinner-overlay">
        {spinner}
        {label && <p className="spinner-overlay__label">{label}</p>}
      </div>
    );
  }

  return spinner;
}
