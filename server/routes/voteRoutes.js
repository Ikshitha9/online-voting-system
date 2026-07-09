/**
 * Vote Routes
 * ===========
 * Defines endpoints for casting votes and checking voting status/receipts.
 * All routes require active token authentication.
 */

const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const protect = require('../middleware/auth');

// All voting routes require authentication
router.use(protect);

router.post('/cast', voteController.castVote);
router.post('/', voteController.castVote);
router.get('/status/:electionId', voteController.checkVoteStatus);
router.get('/my-vote/:electionId', voteController.getMyVote);
router.get('/results/:electionId', voteController.getResults);
router.get('/receipt/:voteId', voteController.getVoteReceipt);

module.exports = router;
