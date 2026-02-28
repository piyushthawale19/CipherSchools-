// ============================================================
// controllers/query.controller.js
// Validates, executes, formats SQL queries against the sandbox.
// Logs every submission to MongoDB for audit purposes.
// ============================================================

const { validateQuery } = require("../services/queryValidator.service");
const { runSandboxQuery } = require("../services/sandboxRunner.service");
const { formatResult } = require("../services/resultFormatter.service");
const Assignment = require("../models/Assignment.model");
const Submission = require("../models/Submission.model");
const logger = require("../utils/logger");

// POST /api/query/execute
async function executeQuery(req, res, next) {
  try {
    const { query, assignmentId } = req.body;

    if (!query || !assignmentId) {
      return res
        .status(400)
        .json({ error: "Both query and assignmentId are required." });
    }

    // Step 1: Validate query
    const validation = validateQuery(query);
    if (!validation.valid) {
      // Log blocked query attempt
      await logSubmission({
        userId: req.user.userId,
        assignmentId,
        query,
        status: "blocked",
        errorMessage: validation.reason,
      });
      return res
        .status(400)
        .json({ error: `Query blocked: ${validation.reason}` });
    }

    // Step 2: Fetch assignment to get schema name
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      isPublished: true,
    }).select("postgresSchema expectedOutput");
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found." });
    }

    // Step 3: Execute in sandbox
    let rawResult;
    try {
      rawResult = await runSandboxQuery(query, assignment.postgresSchema);
    } catch (sandboxErr) {
      // Execution error (not validation error)
      await logSubmission({
        userId: req.user.userId,
        assignmentId,
        query,
        status: "error",
        errorMessage: sandboxErr.message,
        executionTime: sandboxErr.executionTime,
      });
      return res
        .status(422)
        .json({
          error: sandboxErr.message,
          executionTime: sandboxErr.executionTime,
        });
    }

    // Step 4: Format result
    const formatted = formatResult(rawResult);

    // Step 5: Optional — compare with expected output
    const isCorrect = checkCorrectness(formatted, assignment.expectedOutput);

    // Step 6: Log submission
    const attemptNumber = await getAttemptNumber(req.user.userId, assignmentId);
    await logSubmission({
      userId: req.user.userId,
      assignmentId,
      query,
      status: isCorrect ? "correct" : "incorrect",
      rowCount: formatted.rowCount,
      executionTime: formatted.executionTime,
      isCorrect,
      attemptNumber,
    });

    logger.debug(
      `[Query] User ${req.user.userId} executed on assignment ${assignmentId}: ${isCorrect ? "CORRECT" : "INCORRECT"}`,
    );

    return res.status(200).json({ ...formatted, isCorrect });
  } catch (err) {
    next(err);
  }
}

// GET /api/query/history/:assignmentId — user's submission history for an assignment
async function getHistory(req, res, next) {
  try {
    const { assignmentId } = req.params;
    const submissions = await Submission.find({
      userId: req.user.userId,
      assignmentId,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("query status isCorrect executionTime rowCount createdAt");

    return res.status(200).json({ submissions });
  } catch (err) {
    next(err);
  }
}

// ------- Helpers -------

async function getAttemptNumber(userId, assignmentId) {
  const count = await Submission.countDocuments({ userId, assignmentId });
  return count + 1;
}

async function logSubmission(data) {
  try {
    await Submission.create(data);
  } catch (err) {
    logger.error(`[Query] Failed to log submission: ${err.message}`);
    // Non-fatal — don't block the response
  }
}

/**
 * Compares query result with expected output.
 * Simple row-count comparison for now — can be enhanced.
 */
function checkCorrectness(formatted, expectedOutput) {
  if (!expectedOutput || !expectedOutput.value) return false;

  const { type, value } = expectedOutput;

  switch (type) {
    case "count":
      return formatted.rowCount === value;
    case "single_value": {
      const firstRow = formatted.rows[0];
      return firstRow && firstRow[0] == value; // loose equality for numeric comparison
    }
    case "table":
    case "column":
    case "row":
      // Deep comparison would be more complex; do row count match for now
      return formatted.rowCount === (Array.isArray(value) ? value.length : 1);
    default:
      return false;
  }
}

module.exports = { executeQuery, getHistory };
