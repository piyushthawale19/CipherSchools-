// ============================================================
// routes/auth.routes.js
// ============================================================

const { Router } = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  refresh,
  logout,
  getMe,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimit.middleware");

const router = Router();

const registerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters."),
  body("displayName").optional().trim().isLength({ max: 60 }),
];

const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

router.post("/register", authLimiter, registerValidation, register);
router.post("/login", authLimiter, loginValidation, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

module.exports = router;
