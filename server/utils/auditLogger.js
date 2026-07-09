/**
 * Audit Trail Logger Utility
 * ==========================
 * Facilitates system-wide logging of security events (e.g., login, voting, election creation)
 * directly into the AuditLog collection in MongoDB.
 */

const AuditLog = require('../models/AuditLog');

/**
 * Creates an audit log record asynchronously.
 *
 * @param {string} action - The type of action performed (matches enum in AuditLog model)
 * @param {string|mongoose.Types.ObjectId} [userId] - The ID of the user performing the action
 * @param {string} details - Human-readable explanation of the action
 * @param {object} [req] - The Express request object to extract IP address
 * @returns {Promise<void>}
 */
const logAudit = async (action, userId, details, req = null) => {
  try {
    let ipAddress = 'unknown';

    if (req) {
      // Fetch IP from standard express fields or headers
      ipAddress =
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        req.ip ||
        'unknown';
      
      // Clean up IP string if IPv6 mapped IPv4 is present (e.g. ::ffff:127.0.0.1)
      if (ipAddress.startsWith('::ffff:')) {
        ipAddress = ipAddress.substring(7);
      }
    }

    // Save record to DB
    await AuditLog.create({
      action,
      userId: userId || null,
      details,
      ipAddress,
    });

    console.log(`🔒 [AUDIT LOG] ${action} - User: ${userId || 'system'} - Details: ${details}`);
  } catch (error) {
    // Log error, but do not crash the request lifecycle if audit logging fails
    console.error('🚨 Audit logging failed to record event:', error.message);
  }
};

module.exports = logAudit;
