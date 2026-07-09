/**
 * Survey Routes
 * =============
 * Defines endpoints for surveys. Admin routes (create, update, delete, results view)
 * are protected via role-checks, while reading details and submitting answers are
 * accessible to all authenticated voters.
 */

const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const protect = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// Require authentication for all endpoints
router.use(protect);

// Voter operations
router.get('/', surveyController.getAllSurveys);
router.get('/:id', surveyController.getSurveyById);
router.post('/:id/respond', surveyController.submitSurveyResponse);

// Administrative operations
router.post('/', isAdmin, surveyController.createSurvey);
router.put('/:id', isAdmin, surveyController.updateSurvey);
router.delete('/:id', isAdmin, surveyController.deleteSurvey);
router.get('/:id/results', isAdmin, surveyController.getSurveyResults);

module.exports = router;
