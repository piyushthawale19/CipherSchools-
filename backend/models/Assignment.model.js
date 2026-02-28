// ============================================================
// models/Assignment.model.js — SQL challenge definitions (pre-populated by admin)
// ============================================================

const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema(
  {
    columnName: { type: String, required: true },
    dataType: { type: String, required: true }, 
  },
  { _id: false },
);

const sampleTableSchema = new mongoose.Schema(
  {
    tableName: { type: String, required: true },
    columns: [columnSchema],
    rows: [mongoose.Schema.Types.Mixed], 
  },
  { _id: false },
);

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 120,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    category: {
      type: String,
      enum: ["SELECT", "JOIN", "GROUP_BY", "SUBQUERY", "AGGREGATE"],
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    // Human-readable schema summary sent to LLM (NOT the actual DDL)
    schemaDescription: {
      type: String,
      required: true,
    },
    // Maps to the PostgreSQL schema name for sandbox execution
    postgresSchema: {
      type: String,
      required: true,  
    },
    sampleTables: [sampleTableSchema],
    expectedOutput: {
      type: {
        type: String,
        enum: ["table", "single_value", "column", "count", "row"],
      },
      value: mongoose.Schema.Types.Mixed,
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
assignmentSchema.index({ difficulty: 1 });
assignmentSchema.index({ isPublished: 1 });
assignmentSchema.index({ category: 1 });
assignmentSchema.index({ orderIndex: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
