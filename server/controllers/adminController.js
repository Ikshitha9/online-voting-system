/**
 * Admin Controller
 * ================
 * Implements administrative reporting, user management,
 * and security audit trail extraction endpoints.
 */

const User = require('../models/User');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const Survey = require('../models/Survey');
const AuditLog = require('../models/AuditLog');

/**
 * Compile system dashboard statistics and indicators
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const totalVoters = await User.countDocuments({ role: 'voter' });
    const totalElections = await Election.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const totalSurveys = await Survey.countDocuments();

    const activeElections = await Election.countDocuments({ status: 'active' });
    const activeSurveys = await Survey.countDocuments({ status: 'active' });

    res.status(200).json({
      success: true,
      stats: {
        totalVoters,
        totalElections,
        totalVotes,
        totalSurveys,
        activeElections,
        activeSurveys,
      },
    });
  } catch (error) {
    console.error('🚨 GetDashboardStats error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error compiling dashboard statistics.',
    });
  }
};

/**
 * Retrieve system-wide security audit logs (ordered newest first)
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'fullName email role voterId')
      .sort({ timestamp: -1 })
      .limit(100); // Return the last 100 entries for performance

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error('🚨 GetAuditLogs error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving system audit logs.',
    });
  }
};

/**
 * Retrieve a list of all registered users (ordered newest first)
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('🚨 GetUsers error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving registered users list.',
    });
  }
};
