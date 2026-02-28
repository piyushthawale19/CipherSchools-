// ============================================================
// components/shared/Badge.jsx
// ============================================================

/**
 * @param {{ variant?: string, children: React.ReactNode, className?: string }} props
 * variant: 'easy' | 'medium' | 'hard' | 'category' | 'success' | 'error'
 */
export default function Badge({
  variant = "category",
  children,
  className = "",
}) {
  return (
    <span className={`badge badge--${variant} ${className}`.trim()}>
      {children}
    </span>
  );
}
