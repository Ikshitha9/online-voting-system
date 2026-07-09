/**
 * Authentication Routes
 * =====================
 * Defines authentication endpoints. Applies the strict auth rate limiter
 * to registration and login paths to safeguard against brute-force attacks.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protect = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Public and Auth-limited routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/verify-otp', authLimiter, authController.verifyOTP);
router.post('/resend-otp', authLimiter, authController.resendOTP);
router.post('/refresh-token', authLimiter, authController.refreshToken);

// Protected routes (require JWT verification)
router.get('/me', protect, authController.getMe);
router.put('/update-profile', protect, authController.updateProfile);
router.post('/logout', protect, authController.logout);

module.exports = router;
