// ============================================================
// components/shared/Button.jsx
// ============================================================

/**
 * @param {{
 *   variant?: 'primary'|'secondary'|'danger'|'ghost',
 *   size?: 'sm'|'lg',
 *   full?: boolean,
 *   loading?: boolean,
 *   disabled?: boolean,
 *   type?: 'button'|'submit'|'reset',
 *   onClick?: Function,
 *   children: React.ReactNode,
 *   className?: string
 * }} props
 */
export default function Button({
  variant = "primary",
  size,
  full = false,
  loading = false,
  disabled = false,
  type = "button",
  onClick,
  children,
  className = "",
}) {
  const classes = [
    "btn",
    `btn--${variant}`,
    size ? `btn--${size}` : "",
    full ? "btn--full" : "",
    loading ? "btn--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {children}
    </button>
  );
}
