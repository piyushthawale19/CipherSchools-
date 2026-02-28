// ============================================================
// pages/ProfilePage.jsx
// ============================================================

import { useEffect, useState } from "react";
import Navbar from "../../components/shared/Navbar";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import Badge from "../../components/shared/Badge";
import { useAuth } from "../../hooks/useAuth";
import axiosInstance from "../../api/axiosInstance";
import { parseError } from "../../utils/errorParser";

export default function ProfilePage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get("/api/query/history", {
          params: { limit: 20 },
        });
        setHistory(data.submissions || []);
      } catch (err) {
        setError(parseError(err));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const correct = history.filter((s) => s.isCorrect).length;

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="welcome-section">
        <div className="container">
          <div className="welcome-section__text">
            <p className="welcome-section__greeting">Your profile</p>
            <h1 className="welcome-section__heading">
              {user?.displayName || user?.email}
            </h1>
            <p className="welcome-section__subheading">{user?.email}</p>
          </div>

          <div className="welcome-section__stats">
            <div className="progress-card progress-card--total">
              <span className="progress-card__icon">📝</span>
              <div>
                <div className="progress-card__value">{history.length}</div>
                <div className="progress-card__label">Submissions</div>
              </div>
            </div>
            <div className="progress-card progress-card--completed">
              <span className="progress-card__icon">✅</span>
              <div>
                <div className="progress-card__value">{correct}</div>
                <div className="progress-card__label">Correct</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="assignments-section">
        <div className="container">
          <h2
            className="assignments-section__title"
            style={{ marginBottom: "1.5rem" }}
          >
            Recent submissions
          </h2>

          {isLoading ? (
            <LoadingSpinner size="lg" />
          ) : error ? (
            <p style={{ color: "var(--color-danger, #ef4444)" }}>{error}</p>
          ) : history.length === 0 ? (
            <div className="assignments-section__empty">
              <span className="assignments-section__empty-icon">📭</span>
              <p className="assignments-section__empty-text">
                No submissions yet.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {history.map((sub) => (
                <div
                  key={sub._id}
                  className="stat-card"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {new Date(sub.createdAt).toLocaleString()}
                    </p>
                    <pre
                      style={{
                        fontFamily: "var(--font-family-mono, monospace)",
                        fontSize: "0.8rem",
                        color: "var(--color-text-secondary)",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all",
                        marginTop: "0.25rem",
                        maxHeight: "4rem",
                        overflow: "hidden",
                      }}
                    >
                      {sub.query}
                    </pre>
                  </div>
                  <Badge
                    variant={
                      sub.isCorrect
                        ? "success"
                        : sub.status === "error"
                          ? "error"
                          : "category"
                    }
                  >
                    {sub.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
