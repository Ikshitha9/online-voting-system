/**
 * Rate Limiting Middleware
 * ========================
 * Protects APIs from Denial of Service (DoS) and brute force attacks
 * using express-rate-limit.
 *
 * Implements:
 * - apiLimiter: A general request ceiling for overall API routes (100 requests per 15 minutes)
 * - authLimiter: Stricter limit on registration, login, and OTP endpoints (15 requests per 15 minutes)
 */

const rateLimit = require('express-rate-limit');

/**
 * General rate limiter for voter and admin API endpoints.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

/**
 * Strict rate limiter for sensitive authentication operations.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 auth-related requests per windowMs (e.g. login, register, verify-otp)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login or verification attempts, please try again after 15 minutes.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
