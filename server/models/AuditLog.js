/**
 * Audit Log Model
 * ===============
 * Records security-relevant actions for compliance and forensics.
 * Every significant action in the platform is logged here.
 *
 * Features:
 * - Predefined action types via enum for consistency
 * - References the acting user
 * - Stores IP address for security tracking
 * - Indexed for efficient querying and reporting
 */

const mongoose = require('mongoose');

// ─── Schema Definition ─────────────────────────────────────────────────────

const auditLogSchema = new mongoose.Schema(
  {
    /**
     * The type of action that was performed.
     * Must be one of the predefined action types.
     */
    action: {
      type: String,
      required: [true, 'Action type is required'],
      enum: {
        values: [
          'VOTE_CAST',
          'LOGIN',
          'LOGIN_FAILED',
          'REGISTER',
          'OTP_VERIFIED',
          'ELECTION_CREATED',
          'ELECTION_UPDATED',
          'ELECTION_DELETED',
          'SURVEY_CREATED',
          'SURVEY_RESPONSE',
          'PROFILE_UPDATED',
        ],
        message: 'Invalid action type',
      },
    },

    /**
     * Reference to the user who performed the action.
     * May be null for failed login attempts with non-existent users.
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    /**
     * Human-readable details about the action.
     * Example: "Voted in election: 2024 Presidential Election"
     */
    details: {
      type: String,
      maxlength: [500, 'Details cannot exceed 500 characters'],
    },

    /**
     * IP address of the client that triggered the action.
     */
    ipAddress: {
      type: String,
    },

    /**
     * When the action occurred.
     */
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // No updatedAt needed for audit logs — they are immutable
    timestamps: false,
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────

// Index for querying by action type (e.g., "show me all VOTE_CAST events")
auditLogSchema.index({ action: 1 });

// Index for querying by user (e.g., "show me all actions by user X")
auditLogSchema.index({ userId: 1 });

// Index for chronological queries with sorting
auditLogSchema.index({ timestamp: -1 });

// Compound index for filtered + sorted queries
auditLogSchema.index({ action: 1, timestamp: -1 });

// ─── JSON Cleanup ───────────────────────────────────────────────────────────

auditLogSchema.methods.toJSON = function () {
  const logObject = this.toObject();
  delete logObject.__v;
  return logObject;
};

// ─── Export Model ───────────────────────────────────────────────────────────

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
