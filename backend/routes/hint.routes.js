// ============================================================
// routes/hint.routes.js
// ============================================================

const { Router } = require("express");
const { requestHint, getHintUsage } = require("../controllers/hint.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = Router();

router.use(authMiddleware);

router.post("/request", requestHint);
router.get("/usage/:assignmentId", getHintUsage);

module.exports = router;
