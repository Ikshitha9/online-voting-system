/**
 * Survey Response Model
 * =====================
 * Records a user's answers to a survey.
 *
 * Features:
 * - Compound unique index on { survey, respondent } prevents duplicate submissions
 * - Flexible answer storage using Mixed type to support all question types
 * - References both Survey and User models
 */

const mongoose = require('mongoose');

// ─── Answer Sub-Schema ──────────────────────────────────────────────────────

/**
 * Embedded schema for individual question answers.
 * Uses Mixed type for the answer field to support:
 * - String (for text and multiple-choice)
 * - Number (for rating)
 * - Array (for multi-select if needed)
 */
const answerSchema = new mongoose.Schema(
  {
    /**
     * Index of the question in the survey's questions array.
     * Zero-based (0 = first question).
     */
    questionIndex: {
      type: Number,
      required: [true, 'Question index is required'],
      min: [0, 'Question index cannot be negative'],
    },

    /**
     * The answer provided by the respondent.
     * Type depends on the question type:
     * - multiple-choice: String (the selected option)
     * - text: String (free text)
     * - rating: Number (the rating value)
     */
    answer: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Answer is required'],
    },
  },
  {
    _id: false, // No need for individual answer IDs
  }
);

// ─── Survey Response Schema ─────────────────────────────────────────────────

const surveyResponseSchema = new mongoose.Schema(
  {
    /**
     * Reference to the survey being responded to.
     */
    survey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Survey',
      required: [true, 'Survey reference is required'],
    },

    /**
     * Reference to the user submitting this response.
     */
    respondent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Respondent reference is required'],
    },

    /**
     * Array of answers, one for each question in the survey.
     */
    answers: {
      type: [answerSchema],
      validate: {
        validator: function (answers) {
          return answers && answers.length >= 1;
        },
        message: 'At least one answer is required',
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// ─── Compound Unique Index (CRITICAL) ───────────────────────────────────────

/**
 * CRITICAL: Prevents a user from submitting multiple responses to the same survey.
 * This is enforced at the database level for maximum reliability.
 */
surveyResponseSchema.index({ survey: 1, respondent: 1 }, { unique: true });

// Additional indexes for query performance
surveyResponseSchema.index({ survey: 1 }); // For aggregating responses per survey

// ─── JSON Cleanup ───────────────────────────────────────────────────────────

surveyResponseSchema.methods.toJSON = function () {
  const responseObject = this.toObject();
  delete responseObject.__v;
  return responseObject;
};

// ─── Export Model ───────────────────────────────────────────────────────────

const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);

module.exports = SurveyResponse;
