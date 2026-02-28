// ============================================================
// components/assignment/SubmissionBanner.jsx
// Shows correctness feedback after query execution.
// ============================================================

import { useQueryExec } from "../../hooks/useQueryExec";

const BANNER_CONFIG = {
  correct: {
    icon: "✅",
    title: "Correct!",
    message: "Your query returned the expected result. Well done!",
    modifier: "correct",
  },
  incorrect: {
    icon: "⚠️",
    title: "Not quite right",
    message:
      "Your query ran successfully but didn't match the expected output. Try adjusting your logic.",
    modifier: "incorrect",
  },
  error: null, // handled by ResultsPanel
  blocked: null, // handled by ResultsPanel
};

export default function SubmissionBanner() {
  const { submitStatus, isCorrect } = useQueryExec();

  if (!submitStatus || !BANNER_CONFIG[submitStatus]) return null;

  const config = BANNER_CONFIG[submitStatus];

  return (
    <div className={`submission-banner submission-banner--${config.modifier}`}>
      <span className="submission-banner__icon">{config.icon}</span>
      <div className="submission-banner__text">
        <p className="submission-banner__title">{config.title}</p>
        <p>{config.message}</p>
      </div>
    </div>
  );
}
