/**
 * OTP Model
 * =========
 * Stores one-time passwords for email verification.
 *
 * Features:
 * - TTL (Time-To-Live) index: Documents automatically expire after 10 minutes
 * - MongoDB handles cleanup automatically via the TTL index
 */

const mongoose = require('mongoose');

// ─── Schema Definition ─────────────────────────────────────────────────────

const otpSchema = new mongoose.Schema({
  /**
   * The email address this OTP is associated with.
   */
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },

  /**
   * The 6-digit OTP code (stored as string to preserve leading zeros).
   */
  otp: {
    type: String,
    required: [true, 'OTP is required'],
  },

  /**
   * Creation timestamp. The TTL index uses this field to determine expiration.
   * Documents are automatically deleted 600 seconds (10 minutes) after creation.
   */
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // TTL: 10 minutes (600 seconds)
  },
});

// ─── Indexes ────────────────────────────────────────────────────────────────

// Index on email for quick lookups when verifying OTP
otpSchema.index({ email: 1 });

// ─── Export Model ───────────────────────────────────────────────────────────

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
