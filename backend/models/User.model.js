 // models/User.model.js — Mongoose schema for users collection
 
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    hashedPassword: {
      type: String,
      required: true,
      select: false,  
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    lastLoginAt: {
      type: Date,
    },
    refreshTokenHash: {
      type: String,
      select: false,  
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
