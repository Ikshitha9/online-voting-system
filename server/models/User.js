/**
 * User Model
 * ==========
 * Represents a registered user in the online voting platform.
 * Supports both 'voter' and 'admin' roles.
 *
 * Features:
 * - Pre-save password hashing with bcryptjs (12 salt rounds)
 * - Auto-generated unique voter ID (format: VTR-XXXXXX)
 * - Instance method for password comparison
 * - Sensitive fields excluded from JSON serialization
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ─── Schema Definition ─────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    /**
     * The user's full legal name.
     */
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },

    /**
     * The user's email address. Used for authentication and OTP delivery.
     * Stored in lowercase to ensure uniqueness checks are case-insensitive.
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    /**
     * The user's hashed password. Minimum 8 characters before hashing.
     */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
    },

    /**
     * User role: 'voter' for regular users, 'admin' for administrators.
     */
    role: {
      type: String,
      enum: {
        values: ['voter', 'admin'],
        message: 'Role must be either voter or admin',
      },
      default: 'voter',
    },

    /**
     * Whether the user has verified their email via OTP.
     * Users must be verified before they can cast votes.
     */
    isVerified: {
      type: Boolean,
      default: false,
    },

    /**
     * A unique, human-readable voter identifier.
     * Format: VTR-XXXXXX (6 alphanumeric characters).
     * Auto-generated on first save.
     */
    voterId: {
      type: String,
      unique: true,
      sparse: true, // Allow null values (generated on save)
    },

    /**
     * JWT refresh token stored for token rotation.
     * Cleared on logout.
     */
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// ─── Pre-save Hooks ─────────────────────────────────────────────────────────

/**
 * Pre-save hook #1: Generate a unique voter ID on first creation.
 * Format: VTR- followed by 6 random uppercase alphanumeric characters.
 * Only runs when the document is new (not on updates).
 */
userSchema.pre('save', function () {
  // Only generate voterId for new documents that don't already have one
  if (this.isNew && !this.voterId) {
    const randomPart = crypto.randomBytes(4).toString('hex').substring(0, 6).toUpperCase();
    this.voterId = `VTR-${randomPart}`;
  }
});

/**
 * Pre-save hook #2: Hash the password before saving.
 * Uses bcryptjs with 12 salt rounds for strong security.
 * Only hashes if the password field has been modified (avoids re-hashing on profile updates).
 */
userSchema.pre('save', async function () {
  // Skip hashing if the password hasn't changed or if explicitly flagged to skip
  if (!this.isModified('password') || this.$skipPasswordHash) {
    return;
  }

  // Generate a salt with 12 rounds (good balance of security and speed)
  const salt = await bcrypt.genSalt(12);
  // Hash the plain-text password
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance Methods ───────────────────────────────────────────────────────

/**
 * Compare a candidate (plain-text) password against the stored hashed password.
 *
 * @param {string} candidatePassword - The plain-text password to verify
 * @returns {Promise<boolean>} True if the passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── JSON Serialization ─────────────────────────────────────────────────────

/**
 * Customize the JSON output to exclude sensitive fields.
 * Removes password, refreshToken, and __v from API responses.
 */
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.__v;
  return userObject;
};

// ─── Indexes ────────────────────────────────────────────────────────────────

// Email is already unique in the schema definition, but we add an explicit index for query performance
userSchema.index({ email: 1 });
userSchema.index({ voterId: 1 });

// ─── Export Model ───────────────────────────────────────────────────────────

const User = mongoose.model('User', userSchema);

module.exports = User;
