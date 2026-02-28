// ============================================================
// routes/assignment.routes.js
// ============================================================

const { Router } = require("express");
const {
  listAssignments,
  getAssignment,
  getAssignmentSchema,
  createAssignment,
} = require("../controllers/assignment.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = Router();

// All assignment routes require authentication
router.use(authMiddleware);

router.get("/", listAssignments);
router.get("/:id", getAssignment);
router.get("/:id/schema", getAssignmentSchema);
router.post("/", createAssignment); // admin only (checked inside controller)

module.exports = router;
