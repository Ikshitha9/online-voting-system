/**
 * Election Routes
 * ===============
 * Defines endpoints for elections. Write operations (create, update, delete)
 * are protected and restricted to administrators. Reading list and detail
 * operations are open to authenticated users.
 */

const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');
const protect = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// All election routes require authentication
router.use(protect);

// User & Admin shared endpoints
router.get('/', electionController.getAllElections);
router.get('/:id', electionController.getElectionById);
router.get('/:id/results', electionController.getElectionResults);

// Administrator restricted endpoints
router.post('/', isAdmin, electionController.createElection);
router.put('/:id', isAdmin, electionController.updateElection);
router.delete('/:id', isAdmin, electionController.deleteElection);

module.exports = router;
