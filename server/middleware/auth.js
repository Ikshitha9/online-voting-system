/**
 * JWT Authentication Middleware
 * =============================
 * Validates the JWT access token in the request headers (Authorization: Bearer <token>).
 * On successful validation, attaches the user object to `req.user` for downstream routes.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect API routes. Requires a valid JWT access token.
 */
const protect = async (req, res, next) => {
  let token;

  // Check for JWT in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Split the header to isolate the token (Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // Find the user associated with this token and attach to request
      // Exclude sensitive fields from the request user object
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists.',
        });
      }

      // Proceed to the next middleware or controller
      next();
    } catch (error) {
      console.error('🚨 Auth middleware error:', error.message);
      
      let message = 'Not authorized, token failed.';
      if (error.name === 'TokenExpiredError') {
        message = 'Access token expired.';
      }

      return res.status(401).json({
        success: false,
        message,
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided.',
    });
  }
};

module.exports = protect;
