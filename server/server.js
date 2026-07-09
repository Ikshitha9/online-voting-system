/**
 * Backend Entry Point (Server Bootstrap)
 * =====================================
 * Initializes the Express application, loads environment variables,
 * connects to MongoDB, attaches global security/utility middleware,
 * registers API routers, and boots the HTTP server.
 */

// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const electionRoutes = require('./routes/electionRoutes');
const voteRoutes = require('./routes/voteRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB database
connectDB();

// ─── Global Middlewares ──────────────────────────────────────────────────────

// HTTP security headers
app.use(helmet());

// CORS configuration (allow requests from the frontend client port)
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173' , 'https://online-voting-system-1-5jle.onrender.com'], // Vite dev servers
    credentials: true,
  })
);

// Logging request logs (dev format)
app.use(morgan('dev'));

// JSON parsing body limit
app.use(express.json({ limit: '10kb' }));

// Apply base rate limiter to all API endpoints
app.use('/api', apiLimiter);

// ─── Route Declarations ─────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date(),
  });
});

// ─── Fallback & Error Handling ──────────────────────────────────────────────

// Catch-all route for unmatched paths (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.originalUrl}`,
  });
});

// Global central error handler middleware
app.use((err, req, res, next) => {
  console.error('🚨 Central Error Handler caught:', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
});

// ─── Port Listener ──────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle server closing on crash or shutdown signals
process.on('unhandledRejection', (err) => {
  console.error(`🚨 Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
