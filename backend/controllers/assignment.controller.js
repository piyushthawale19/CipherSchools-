// ============================================================
// controllers/assignment.controller.js
// CRUD for SQL assignments (list, detail).
// Create/update is admin-only. Students can only read.
// ============================================================

const Assignment = require("../models/Assignment.model");
const Submission = require("../models/Submission.model");

// GET /api/assignments — list all published assignments
async function listAssignments(req, res, next) {
  try {
    const { difficulty, category } = req.query;
    const filter = { isPublished: true };
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;

    const assignments = await Assignment.find(filter)
      .select("-expectedOutput -postgresSchema") // don't expose solution hint to students
      .sort({ orderIndex: 1, createdAt: -1 });

    return res.status(200).json({ assignments });
  } catch (err) {
    next(err);
  }
}

// GET /api/assignments/:id — get single assignment
async function getAssignment(req, res, next) {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      isPublished: true,
    }).select("-expectedOutput"); // never send expected output to students

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found." });
    }

    // Fetch user's attempt count for this assignment
    const attemptCount = await Submission.countDocuments({
      userId: req.user.userId,
      assignmentId: assignment._id,
    });

    const lastSubmission = await Submission.findOne({
      userId: req.user.userId,
      assignmentId: assignment._id,
    })
      .sort({ createdAt: -1 })
      .select("query status isCorrect createdAt");

    return res.status(200).json({
      assignment,
      userProgress: { attemptCount, lastSubmission },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/assignments/:id/schema — get schema info for sandbox
async function getAssignmentSchema(req, res, next) {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      isPublished: true,
    }).select("postgresSchema sampleTables schemaDescription title");
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found." });
    }
    return res.status(200).json({
      postgresSchema: assignment.postgresSchema,
      sampleTables: assignment.sampleTables,
      schemaDescription: assignment.schemaDescription,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/assignments — admin only: create assignment
async function createAssignment(req, res, next) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }
    const assignment = await Assignment.create({
      ...req.body,
      createdBy: req.user.userId,
    });
    return res.status(201).json({ assignment });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAssignments,
  getAssignment,
  getAssignmentSchema,
  createAssignment,
};
