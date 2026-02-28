// ============================================================
// models/HintLog.model.js — LLM hint request audit trail
// ============================================================

const mongoose = require("mongoose");

const hintLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    userQuery: {
      type: String,
      default: "",
    },
    errorMessage: {
      type: String,
      default: "",
    },
    hintReceived: {
      type: String,
      required: true,
    },
    llmModel: {
      type: String,
      default: "gpt-4o-mini",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
    timestamps: false,
  },
);

// Compound index for rate limiting queries
hintLogSchema.index({ userId: 1, assignmentId: 1, requestedAt: -1 });

module.exports = mongoose.model("HintLog", hintLogSchema);
