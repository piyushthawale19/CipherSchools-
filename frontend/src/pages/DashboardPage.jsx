// ============================================================
// pages/DashboardPage.jsx
// ============================================================

import { useEffect, useState, useMemo } from "react";
import Navbar from "../../components/shared/Navbar";
import AssignmentCard from "../../components/dashboard/AssignmentCard";
import FilterChips from "../../components/dashboard/FilterChips";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import { getAssignments } from "../../api/queryApi";
import { parseError } from "../../utils/errorParser";

export default function DashboardPage() {
  const { user } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Filter state
  const [difficulty, setDifficulty] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("order"); // 'order' | 'difficulty'

  // Load assignments on mount
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const { data } = await getAssignments();
        setAssignments(data.assignments || []);
      } catch (err) {
        setFetchError(parseError(err));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Client-side filter + sort
  const filtered = useMemo(() => {
    let list = [...assignments];
    if (difficulty !== "all")
      list = list.filter((a) => a.difficulty === difficulty);
    if (category !== "all") list = list.filter((a) => a.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q),
      );
    }
    if (sortBy === "difficulty") {
      const ORDER = { easy: 1, medium: 2, hard: 3 };
      list.sort(
        (a, b) => (ORDER[a.difficulty] || 0) - (ORDER[b.difficulty] || 0),
      );
    } else {
      list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    }
    return list;
  }, [assignments, difficulty, category, search, sortBy]);

  // Progress stats (placeholder — would come from submissions API in a full impl)
  const totalCount = assignments.length;

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="welcome-section">
        <div className="container">
          <div className="welcome-section__text">
            <p className="welcome-section__greeting">
              Hello, {user?.displayName || "there"} 👋
            </p>
            <h1 className="welcome-section__heading">Ready to practice SQL?</h1>
            <p className="welcome-section__subheading">
              Choose an assignment below, write a SQL query in the editor, and
              get instant feedback. Stuck? Use the AI hint system.
            </p>
          </div>

          <div className="welcome-section__stats">
            <div className="progress-card progress-card--total">
              <span className="progress-card__icon">📚</span>
              <div>
                <div className="progress-card__value">{totalCount}</div>
                <div className="progress-card__label">Assignments</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="assignments-section">
        <div className="container">
          <div className="assignments-section__header">
            <div>
              <h2 className="assignments-section__title">Assignments</h2>
              <p className="assignments-section__count">
                {filtered.length} of {totalCount} shown
              </p>
            </div>
          </div>

          {/* Search + Sort controls */}
          <div className="assignments-section__controls">
            <div className="assignments-section__search">
              <span className="assignments-section__search-icon">🔍</span>
              <input
                type="search"
                placeholder="Search assignments…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search assignments"
              />
            </div>
            <div className="assignments-section__sort">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="order">Default order</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
          </div>

          {/* Filter chips */}
          <FilterChips
            difficulty={difficulty}
            category={category}
            onDifficulty={setDifficulty}
            onCategory={setCategory}
          />

          {/* Content */}
          {isLoading ? (
            <LoadingSpinner size="lg" label="Loading assignments…" />
          ) : fetchError ? (
            <div className="assignments-section__empty">
              <span className="assignments-section__empty-icon">⚠️</span>
              <p className="assignments-section__empty-text">{fetchError}</p>
            </div>
          ) : (
            <div className="assignment-grid">
              {filtered.length === 0 ? (
                <div className="assignments-section__empty">
                  <span className="assignments-section__empty-icon">🔍</span>
                  <p className="assignments-section__empty-text">
                    No assignments match your filters.
                  </p>
                </div>
              ) : (
                filtered.map((a) => (
                  <AssignmentCard key={a._id} assignment={a} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
