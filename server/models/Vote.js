/**
 * Vote Model
 * ==========
 * Records an individual vote cast by a verified user in an election.
 *
 * Security Features:
 * - Compound unique index on { election, voter } prevents double voting at the DB level
 * - SHA-256 vote hash provides tamper-evident receipt
 * - IP address and user agent logged for audit trail
 * - Immutable once created (no update operations should be allowed)
 */

const mongoose = require('mongoose');

// ─── Schema Definition ─────────────────────────────────────────────────────

const voteSchema = new mongoose.Schema(
  {
    /**
     * Reference to the election this vote belongs to.
     */
    election: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: [true, 'Election reference is required'],
    },

    /**
     * Reference to the user who cast this vote.
     */
    voter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Voter reference is required'],
    },

    /**
     * Index of the selected candidate in the election's candidates array.
     * Zero-based index (0 = first candidate, 1 = second, etc.).
     */
    candidateIndex: {
      type: Number,
      required: [true, 'Candidate index is required'],
      min: [0, 'Candidate index cannot be negative'],
    },

    /**
     * SHA-256 hash of the vote for verification and tamper detection.
     * Generated from: electionId + usertId + candidateIndex + timestamp
     */
    voteHash: {
      type: String,
      required: [true, 'Vote hash is required'],
    },

    /**
     * IP address of the voter at the time of casting.
     * Stored for audit and security purposes.
     */
    ipAddress: {
      type: String,
    },

    /**
     * User agent string of the voter's browser/client.
     * Helps identify suspicious automated voting.
     */
    userAgent: {
      type: String,
    },

    /**
     * Timestamp when the vote was actually cast.
     * Separate from Mongoose timestamps for explicit audit tracking.
     */
    castedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Also adds createdAt and updatedAt for admin tracking
  }
);

// ─── Compound Unique Index (CRITICAL) ───────────────────────────────────────

/**
 * CRITICAL: This compound unique index prevents a voter from casting
 * multiple votes in the same election at the database level.
 * Even if application-level checks fail, this index guarantees integrity.
 */
voteSchema.index({ election: 1, voter: 1 }, { unique: true });

// Additional indexes for query performance
voteSchema.index({ election: 1, candidateIndex: 1 }); // For result aggregation
voteSchema.index({ voter: 1 }); // For user vote history
voteSchema.index({ voteHash: 1 }); // For receipt verification

// ─── JSON Cleanup ───────────────────────────────────────────────────────────

/**
 * Customize JSON output to exclude internal fields.
 */
voteSchema.methods.toJSON = function () {
  const voteObject = this.toObject();
  delete voteObject.__v;
  // Don't expose IP and user agent in regular API responses
  delete voteObject.ipAddress;
  delete voteObject.userAgent;
  return voteObject;
};

// ─── Export Model ───────────────────────────────────────────────────────────

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
