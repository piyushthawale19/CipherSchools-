// ============================================================
// utils/hashHelper.js — bcrypt and crypto hash utilities
// ============================================================

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const SALT_ROUNDS = 12;

async function hashPassword(plainText) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainText, salt);
}

async function comparePassword(plainText, hash) {
  return bcrypt.compare(plainText, hash);
}

/**
 * SHA-256 hash of a token (for storing refresh tokens safely).
 * NOT for passwords — use bcrypt for those.
 */
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = { hashPassword, comparePassword, hashToken };
