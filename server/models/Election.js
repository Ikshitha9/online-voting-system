/**
 * Election Model
 * ==============
 * Represents an election/poll in the online voting platform.
 * Contains candidates, scheduling, and status management.
 *
 * Features:
 * - Embedded candidate sub-documents with party and manifesto info
 * - Automatic status updates based on start/end dates
 * - Virtual field for checking if election is currently active
 * - Pre-find middleware for auto-status computation
 */

const mongoose = require('mongoose');

// ─── Candidate Sub-Schema ───────────────────────────────────────────────────

/**
 * Embedded schema for election candidates.
 * Each candidate has a name, optional party affiliation, manifesto, and image.
 */
const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
    },
    party: {
      type: String,
      trim: true,
      default: '',
    },
    manifesto: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    _id: true, // Each candidate gets a unique _id for reference
  }
);

// ─── Election Schema ────────────────────────────────────────────────────────

const electionSchema = new mongoose.Schema(
  {
    /**
     * The title of the election (e.g., "2024 Presidential Election").
     */
    title: {
      type: String,
      required: [true, 'Election title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    /**
     * A detailed description of the election purpose and rules.
     */
    description: {
      type: String,
      required: [true, 'Election description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },

    /**
     * Array of candidates participating in this election.
     * Minimum 2 candidates required for a valid election.
     */
    candidates: {
      type: [candidateSchema],
      validate: {
        validator: function (candidates) {
          return candidates && candidates.length >= 2;
        },
        message: 'An election must have at least 2 candidates',
      },
    },

    /**
     * The date and time when voting opens.
     */
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },

    /**
     * The date and time when voting closes.
     */
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (endDate) {
          // End date must be after start date
          return endDate > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },

    /**
     * Current status of the election.
     * Automatically computed based on dates but can be manually overridden.
     * - upcoming: Before startDate
     * - active: Between startDate and endDate
     * - completed: After endDate
     */
    status: {
      type: String,
      enum: {
        values: ['upcoming', 'active', 'completed'],
        message: 'Status must be upcoming, active, or completed',
      },
      default: 'upcoming',
    },

    /**
     * Reference to the admin user who created this election.
     */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
    },

    /**
     * Running count of total votes cast in this election.
     * Incremented each time a valid vote is recorded.
     */
    totalVoters: {
      type: Number,
      default: 0,
      min: [0, 'Total voters cannot be negative'],
    },

    /**
     * Whether this election is publicly visible to all users.
     */
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ───────────────────────────────────────────────────────────────

/**
 * Virtual property that checks if the election is currently accepting votes.
 * Returns true if current time is between startDate and endDate.
 */
electionSchema.virtual('isActive').get(function () {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

// ─── Instance Methods ───────────────────────────────────────────────────────

/**
 * Computes and updates the election status based on the current date/time.
 * Call this method to synchronize the stored status with real-time dates.
 *
 * @returns {string} The computed status
 */
electionSchema.methods.computeStatus = function () {
  const now = new Date();
  if (now < this.startDate) {
    this.status = 'upcoming';
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = 'active';
  } else {
    this.status = 'completed';
  }
  return this.status;
};

// ─── Static Methods ─────────────────────────────────────────────────────────

/**
 * Updates the status of all elections based on their dates.
 * Useful as a scheduled task or to run before querying elections.
 *
 * @returns {Promise<object>} Result of the bulk update operations
 */
electionSchema.statics.updateAllStatuses = async function () {
  const now = new Date();

  // Mark elections as 'active' if current time is within their date range
  await this.updateMany(
    {
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: { $ne: 'active' },
    },
    { $set: { status: 'active' } }
  );

  // Mark elections as 'completed' if current time is past their end date
  await this.updateMany(
    {
      endDate: { $lt: now },
      status: { $ne: 'completed' },
    },
    { $set: { status: 'completed' } }
  );

  // Mark elections as 'upcoming' if current time is before their start date
  await this.updateMany(
    {
      startDate: { $gt: now },
      status: { $ne: 'upcoming' },
    },
    { $set: { status: 'upcoming' } }
  );
};

// ─── Pre-find Middleware ────────────────────────────────────────────────────

/**
 * Pre-find hook to auto-update election statuses before any query.
 * This ensures that the status field is always accurate when reading elections.
 * Runs on find, findOne, and findById operations.
 */
electionSchema.pre('find', async function () {
  try {
    await mongoose.model('Election').updateAllStatuses();
  } catch (error) {
    // Log but don't block the query if status update fails
    console.error('Warning: Failed to auto-update election statuses:', error.message);
  }
});

electionSchema.pre('findOne', async function () {
  try {
    await mongoose.model('Election').updateAllStatuses();
  } catch (error) {
    console.error('Warning: Failed to auto-update election statuses:', error.message);
  }
});

// ─── Indexes ────────────────────────────────────────────────────────────────

electionSchema.index({ status: 1 });
electionSchema.index({ startDate: 1, endDate: 1 });
electionSchema.index({ createdBy: 1 });

// ─── JSON Cleanup ───────────────────────────────────────────────────────────

electionSchema.methods.toJSON = function () {
  const electionObject = this.toObject({ virtuals: true });
  delete electionObject.__v;
  return electionObject;
};

// ─── Export Model ───────────────────────────────────────────────────────────

const Election = mongoose.model('Election', electionSchema);

module.exports = Election;
