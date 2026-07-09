/**
 * Role-Based Access Control Middleware
 * ====================================
 * Verifies that the authenticated user has administrative privileges.
 * Relies on `protect` middleware being executed first to populate `req.user`.
 */

/**
 * Middleware to restrict route access to administrators only.
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
    });
  }
};

module.exports = {
  isAdmin,
};
