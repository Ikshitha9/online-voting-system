/**
 * Database Configuration
 * =====================
 * Handles MongoDB connection via Mongoose with retry logic,
 * connection event handlers, and graceful shutdown support.
 */

const mongoose = require('mongoose');

/**
 * Maximum number of connection retry attempts before giving up.
 */
const MAX_RETRIES = 5;

/**
 * Delay (in ms) between each retry attempt. Doubles on each retry (exponential backoff).
 */
const INITIAL_RETRY_DELAY_MS = 3000;

/**
 * Connects to MongoDB with automatic retry logic.
 * Uses exponential backoff to avoid hammering the database server.
 *
 * @param {number} retryCount - Current retry attempt (used internally for recursion)
 * @returns {Promise<void>}
 */
const connectDB = async (retryCount = 0) => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/online-voting';

    // Mongoose connection options for stability and performance
    const options = {
      // Maximum time (ms) to wait for initial connection
      serverSelectionTimeoutMS: 5000,
      // Maximum time (ms) to wait for a socket connection
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoURI, options);
    console.log(`✅ MongoDB connected successfully: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed (attempt ${retryCount + 1}/${MAX_RETRIES}): ${error.message}`);

    if (retryCount < MAX_RETRIES - 1) {
      // Calculate exponential backoff delay
      const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount);
      console.log(`🔄 Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectDB(retryCount + 1);
    } else {
      console.error('💀 Max retries reached. Could not connect to MongoDB. Exiting...');
      process.exit(1);
    }
  }
};

// ─── Connection Event Handlers ──────────────────────────────────────────────

/**
 * Fires when Mongoose successfully connects to MongoDB.
 */
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to the database.');
});

/**
 * Fires when Mongoose encounters a connection error.
 */
mongoose.connection.on('error', (err) => {
  console.error(`🚨 Mongoose connection error: ${err.message}`);
});

/**
 * Fires when the Mongoose connection is disconnected.
 */
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Mongoose disconnected from the database.');
});

/**
 * Fires when the Mongoose connection is reconnected after a disconnection.
 */
mongoose.connection.on('reconnected', () => {
  console.log('🔁 Mongoose reconnected to the database.');
});

// ─── Graceful Shutdown Handlers ─────────────────────────────────────────────

/**
 * Gracefully close the Mongoose connection when the Node.js process exits.
 * Handles SIGINT (Ctrl+C), SIGTERM (kill command), and uncaught exceptions.
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received. Closing MongoDB connection...`);
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed gracefully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during graceful shutdown:', err.message);
    process.exit(1);
  }
};

// Listen for process termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = connectDB;
