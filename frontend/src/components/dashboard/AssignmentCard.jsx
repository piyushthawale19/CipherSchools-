// ============================================================
// components/dashboard/AssignmentCard.jsx
// ============================================================

import { useNavigate } from "react-router-dom";
import Badge from "../shared/Badge";

const DIFFICULTY_LABEL = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

/**
 * @param {{ assignment: object, isCompleted?: boolean }} props
 */
export default function AssignmentCard({ assignment, isCompleted = false }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/assignments/${assignment._id}`);
  };

  return (
    <article
      className={[
        "assignment-card",
        `assignment-card--${assignment.difficulty}`,
        isCompleted ? "assignment-card--completed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      aria-label={`Open assignment: ${assignment.title}`}
    >
      {isCompleted && (
        <div
          className="assignment-card__completed-badge"
          aria-label="Completed"
        >
          ✓
        </div>
      )}

      <div className="assignment-card__header">
        <Badge variant={assignment.difficulty}>
          {DIFFICULTY_LABEL[assignment.difficulty] || assignment.difficulty}
        </Badge>
        <Badge variant="category">{assignment.category}</Badge>
      </div>

      <h2 className="assignment-card__title">{assignment.title}</h2>
      <p className="assignment-card__description">{assignment.description}</p>

      <div className="assignment-card__footer">
        <span className="assignment-card__meta">
          #{assignment.orderIndex || 1}
        </span>
        <span className="assignment-card__cta">
          {isCompleted ? "Review →" : "Start →"}
        </span>
      </div>
    </article>
  );
}
