// ============================================================
// controllers/auth.controller.js
// Handles user registration, login, token refresh, and logout.
// ============================================================

const { validationResult } = require("express-validator");
const User = require("../models/User.model");
const {
  hashPassword,
  comparePassword,
  hashToken,
} = require("../utils/hashHelper");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwtHelper");
const logger = require("../utils/logger");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, displayName } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email,
      hashedPassword,
      displayName: displayName || email.split("@")[0],
    });

    logger.info(`[Auth] New user registered: ${email}`);

    return res.status(201).json({
      message: "Registration successful.",
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Select +hashedPassword explicitly (field is select: false by default)
    const user = await User.findOne({ email }).select("+hashedPassword");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await comparePassword(password, user.hashedPassword);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const accessToken = signAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = signRefreshToken({ userId: user._id });

    // Store hashed refresh token in DB (one active at a time)
    user.refreshTokenHash = hashToken(refreshToken);
    user.lastLoginAt = new Date();
    await user.save();

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    logger.info(`[Auth] Login: ${email}`);

    return res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/refresh
async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ error: "No refresh token provided." });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return res
        .status(401)
        .json({ error: "Invalid or expired refresh token." });
    }

    const user = await User.findById(decoded.userId).select(
      "+refreshTokenHash",
    );
    if (!user || user.refreshTokenHash !== hashToken(token)) {
      return res
        .status(401)
        .json({ error: "Refresh token has been invalidated." });
    }

    // Rotate: issue new tokens
    const newAccessToken = signAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });
    const newRefreshToken = signRefreshToken({ userId: user._id });
    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();

    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout
async function logout(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const decoded = verifyRefreshToken(token);
        await User.findByIdAndUpdate(decoded.userId, {
          refreshTokenHash: null,
        });
      } catch {
        // Invalid token is fine — still clear cookie
      }
    }

    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout, getMe };
