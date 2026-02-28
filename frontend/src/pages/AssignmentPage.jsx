// ============================================================
// pages/AssignmentPage.jsx
// Three-panel layout: Brief | Editor | Hints
// ============================================================

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/shared/Navbar";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import SchemaViewer from "../../components/assignment/SchemaViewer";
import EditorWrapper from "../../components/assignment/EditorWrapper";
import ResultsPanel from "../../components/assignment/ResultsPanel";
import HintPanel from "../../components/assignment/HintPanel";
import SubmissionBanner from "../../components/assignment/SubmissionBanner";
import Badge from "../../components/shared/Badge";
import { QueryProvider } from "../../context/QueryContext";
import { getAssignment } from "../../api/queryApi";
import { parseError } from "../../utils/errorParser";

function AssignmentLayout({ assignment }) {
  const [activeTab, setActiveTab] = useState("results"); // 'results' | 'hints' (mobile)

  return (
    <>
      <Navbar assignmentTitle={assignment.title} />

      <div className="assignment-layout">
        {/* ── Left: Brief + Schema ── */}
        <aside className="brief-panel">
          <div className="panel__header">
            <span className="panel__title">📋 Brief</span>
          </div>
          <div className="panel__body">
            <div className="brief-panel__meta">
              <Badge variant={assignment.difficulty}>
                {assignment.difficulty.charAt(0).toUpperCase() +
                  assignment.difficulty.slice(1)}
              </Badge>
              <Badge variant="category">{assignment.category}</Badge>
            </div>

            <p className="brief-panel__question-label">Task</p>
            <p className="brief-panel__question">{assignment.question}</p>

            <p className="brief-panel__schema-label">Database Schema</p>
            <SchemaViewer sampleTables={assignment.sampleTables} />
          </div>
        </aside>

        {/* ── Center: Editor + Results ── */}
        <main className="editor-panel">
          <div className="panel__header">
            <span className="panel__title">✏️ Query Editor</span>
          </div>
          <div className="panel__body editor-panel__body">
            <div className="editor-panel__monaco">
              <EditorWrapper />
            </div>

            {/* Mobile tabs */}
            <div className="panel-tabs">
              <button
                className={`panel-tabs__tab ${activeTab === "results" ? "panel-tabs__tab--active" : ""}`}
                onClick={() => setActiveTab("results")}
              >
                Results
              </button>
              <button
                className={`panel-tabs__tab ${activeTab === "hints" ? "panel-tabs__tab--active" : ""}`}
                onClick={() => setActiveTab("hints")}
              >
                Hints
              </button>
            </div>

            {/* Submission feedback */}
            <div style={{ padding: "0 1rem" }}>
              <SubmissionBanner />
            </div>

            {/* Results (always visible on desktop, tab-controlled on mobile) */}
            <div
              className="results-section"
              style={{ display: activeTab === "results" ? undefined : "none" }}
            >
              <ResultsPanel />
            </div>
          </div>
        </main>

        {/* ── Right: Hints (desktop) / tab panel (mobile) ── */}
        <aside
          className="hint-side-panel"
          style={{
            display:
              activeTab === "hints" || window.innerWidth >= 1024
                ? undefined
                : "none",
          }}
        >
          <div className="panel__header">
            <span className="panel__title">💡 Hints</span>
          </div>
          <div className="panel__body">
            <HintPanel />
          </div>
        </aside>
      </div>
    </>
  );
}

export default function AssignmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setFetchError("");
      try {
        const { data } = await getAssignment(id);
        setAssignment(data.assignment);
      } catch (err) {
        const msg = parseError(err);
        setFetchError(msg);
        if (err?.response?.status === 404) {
          navigate("/", { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="assignment-page assignment-page--loading">
        <LoadingSpinner size="lg" label="Loading assignment…" />
      </div>
    );
  }

  if (fetchError || !assignment) {
    return (
      <div className="assignment-page assignment-page--loading">
        <p style={{ color: "var(--color-danger, #ef4444)" }}>
          {fetchError || "Assignment not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="assignment-page">
      <QueryProvider assignmentId={id}>
        <AssignmentLayout assignment={assignment} />
      </QueryProvider>
    </div>
  );
}
