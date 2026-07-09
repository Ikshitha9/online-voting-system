/**
 * Survey Model
 * ============
 * Represents a survey/questionnaire in the online voting platform.
 * Supports multiple question types: multiple-choice, text, and rating.
 *
 * Features:
 * - Flexible question schema supporting 3 question types
 * - Status management (draft → active → closed)
 * - Date-based scheduling
 * - Response counting
 */

const mongoose = require('mongoose');

// ─── Question Sub-Schema ────────────────────────────────────────────────────

/**
 * Embedded schema for survey questions.
 * Supports three types:
 * - multiple-choice: Requires options array
 * - text: Free-form text response
 * - rating: Numerical rating (typically 1-5 or 1-10)
 */
const questionSchema = new mongoose.Schema(
  {
    /**
     * The text of the question displayed to the respondent.
     */
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: [500, 'Question text cannot exceed 500 characters'],
    },

    /**
     * The type of question, determines how the answer is collected.
     */
    questionType: {
      type: String,
      enum: {
        values: ['multiple-choice', 'text', 'rating'],
        message: 'Question type must be multiple-choice, text, or rating',
      },
      required: [true, 'Question type is required'],
    },

    /**
     * Available options for multiple-choice questions.
     * Should be empty or omitted for text and rating types.
     */
    options: {
      type: [String],
      default: [],
      validate: {
        validator: function (options) {
          // Multiple-choice questions must have at least 2 options
          if (this.questionType === 'multiple-choice') {
            return options && options.length >= 2;
          }
          return true; // No validation for other types
        },
        message: 'Multiple-choice questions must have at least 2 options',
      },
    },

    /**
     * Whether this question must be answered before submitting.
     */
    required: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true, // Each question gets a unique _id
  }
);

// ─── Survey Schema ──────────────────────────────────────────────────────────

const surveySchema = new mongoose.Schema(
  {
    /**
     * The title of the survey.
     */
    title: {
      type: String,
      required: [true, 'Survey title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    /**
     * A description explaining the purpose of the survey.
     */
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },

    /**
     * Array of questions in the survey.
     * Must contain at least one question.
     */
    questions: {
      type: [questionSchema],
      validate: {
        validator: function (questions) {
          return questions && questions.length >= 1;
        },
        message: 'A survey must have at least 1 question',
      },
    },

    /**
     * Reference to the admin user who created this survey.
     */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    /**
     * The date when the survey becomes available for responses.
     */
    startDate: {
      type: Date,
    },

    /**
     * The date when the survey stops accepting responses.
     */
    endDate: {
      type: Date,
    },

    /**
     * Current status of the survey.
     * - draft: Not yet published
     * - active: Currently accepting responses
     * - closed: No longer accepting responses
     */
    status: {
      type: String,
      enum: {
        values: ['draft', 'active', 'closed'],
        message: 'Status must be draft, active, or closed',
      },
      default: 'draft',
    },

    /**
     * Running count of total responses submitted.
     */
    totalResponses: {
      type: Number,
      default: 0,
      min: [0, 'Total responses cannot be negative'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────

surveySchema.index({ status: 1 });
surveySchema.index({ createdBy: 1 });

// ─── JSON Cleanup ───────────────────────────────────────────────────────────

surveySchema.methods.toJSON = function () {
  const surveyObject = this.toObject();
  delete surveyObject.__v;
  return surveyObject;
};

// ─── Export Model ───────────────────────────────────────────────────────────

const Survey = mongoose.model('Survey', surveySchema);

module.exports = Survey;
