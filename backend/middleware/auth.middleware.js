// ============================================================
// middleware/auth.middleware.js
// Verifies the JWT access token from Authorization header.
// Attaches decoded user payload to req.user.
// ============================================================

const { verifyAccessToken } = require("../utils/jwtHelper");
const logger = require("../utils/logger");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Authentication required. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { userId, email, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expired.", code: "TOKEN_EXPIRED" });
    }
    logger.warn(`[Auth] Invalid token attempt: ${err.message}`);
    return res.status(403).json({ error: "Invalid or malformed token." });
  }
}

module.exports = authMiddleware;
