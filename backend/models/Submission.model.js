 // models/Submission.model.js — Every query a student runs
 
const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
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
      index: true,
    },
    query: {
      type: String,
      required: true,  
    },
    status: {
      type: String,
      enum: ["correct", "incorrect", "error", "blocked"],
      required: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    rowCount: {
      type: Number,
      default: null,
    },
    executionTime: {
      type: Number,  
      default: null,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for common queries
submissionSchema.index({ userId: 1, assignmentId: 1 });
submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ status: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
