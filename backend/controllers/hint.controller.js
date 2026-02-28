// ============================================================
// controllers/hint.controller.js
// Generates LLM-powered hints. Enforces per-user rate limit.
// Logs every hint request to MongoDB for academic integrity.
// ============================================================

const Assignment = require("../models/Assignment.model");
const HintLog = require("../models/HintLog.model");
const { getHint } = require("../services/llmHint.service");
const { HINT_RATE_LIMIT_PER_HOUR } = require("../config/env");
const logger = require("../utils/logger");

// POST /api/hints/request
async function requestHint(req, res, next) {
  try {
    const { assignmentId, userQuery, errorMessage } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ error: "assignmentId is required." });
    }

    // Rate limit: max N hints per assignment per hour per user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentHintCount = await HintLog.countDocuments({
      userId: req.user.userId,
      assignmentId,
      requestedAt: { $gte: oneHourAgo },
    });

    if (recentHintCount >= HINT_RATE_LIMIT_PER_HOUR) {
      return res.status(429).json({
        error: `Hint limit reached. You can request up to ${HINT_RATE_LIMIT_PER_HOUR} hints per hour per assignment. Try again later.`,
        hintsUsed: recentHintCount,
        hintsAllowed: HINT_RATE_LIMIT_PER_HOUR,
      });
    }

    // Fetch assignment metadata
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      isPublished: true,
    }).select("title description schemaDescription");
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found." });
    }

    // Generate hint via LLM
    const hint = await getHint(assignment, userQuery || "", errorMessage || "");

    // Log the hint request for academic integrity
    await HintLog.create({
      userId: req.user.userId,
      assignmentId,
      userQuery: userQuery || "",
      errorMessage: errorMessage || "",
      hintReceived: hint,
      llmModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
      requestedAt: new Date(),
    });

    logger.debug(
      `[Hint] User ${req.user.userId} requested hint for assignment ${assignmentId}`,
    );

    return res.status(200).json({
      hint,
      hintsUsed: recentHintCount + 1,
      hintsAllowed: HINT_RATE_LIMIT_PER_HOUR,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/hints/usage/:assignmentId — check hint usage for user
async function getHintUsage(req, res, next) {
  try {
    const { assignmentId } = req.params;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const hintsUsed = await HintLog.countDocuments({
      userId: req.user.userId,
      assignmentId,
      requestedAt: { $gte: oneHourAgo },
    });

    return res.status(200).json({
      hintsUsed,
      hintsAllowed: HINT_RATE_LIMIT_PER_HOUR,
      canRequest: hintsUsed < HINT_RATE_LIMIT_PER_HOUR,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { requestHint, getHintUsage };
