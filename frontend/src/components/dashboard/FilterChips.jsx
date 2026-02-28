// ============================================================
// components/dashboard/FilterChips.jsx
// ============================================================

const DIFFICULTIES = ["all", "easy", "medium", "hard"];
const CATEGORIES = ["all", "SELECT", "JOIN", "GROUP BY", "Subquery", "DML"];

/**
 * @param {{
 *   difficulty: string,
 *   category: string,
 *   onDifficulty: (v: string) => void,
 *   onCategory: (v: string) => void
 * }} props
 */
export default function FilterChips({
  difficulty,
  category,
  onDifficulty,
  onCategory,
}) {
  return (
    <div className="filter-section">
      <div
        className="filter-chips"
        role="group"
        aria-label="Filter by difficulty"
      >
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            className={`filter-chip ${difficulty === d ? "filter-chip--active" : ""}`}
            onClick={() => onDifficulty(d)}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>
      <div
        className="filter-chips"
        role="group"
        aria-label="Filter by category"
      >
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`filter-chip ${category === c ? "filter-chip--active" : ""}`}
            onClick={() => onCategory(c)}
          >
            {c === "all" ? "All Topics" : c}
          </button>
        ))}
      </div>
    </div>
  );
}
