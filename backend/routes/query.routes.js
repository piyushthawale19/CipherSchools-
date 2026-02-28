// ============================================================
// routes/query.routes.js
// ============================================================

const { Router } = require("express");
const { executeQuery, getHistory } = require("../controllers/query.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { queryLimiter } = require("../middleware/rateLimit.middleware");

const router = Router();

router.use(authMiddleware);

router.post("/execute", queryLimiter, executeQuery);
router.get("/history/:assignmentId", getHistory);

module.exports = router;
