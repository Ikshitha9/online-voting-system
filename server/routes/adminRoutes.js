/**
 * Admin Routes
 * ============
 * Defines administrative dashboard statistics, system logs,
 * and user auditing endpoints. All routes require administrator privileges.
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const protect = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// Enforce authentication and administrator access checks for all endpoints
router.use(protect);
router.use(isAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/users', adminController.getUsers);

module.exports = router;
