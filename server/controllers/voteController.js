/**
 * Vote Controller
 * ===============
 * Handles casting votes, double-voting prevention, SHA-256 vote hashing,
 * and retrieval of receipt info.
 */

const crypto = require('crypto');
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const logAudit = require('../utils/auditLogger');

/**
 * Cast a vote in an active election
 */
exports.castVote = async (req, res) => {
  try {
    const { electionId, candidateIndex, candidateId } = req.body;

    if (!electionId || (candidateIndex === undefined && !candidateId)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide election ID and candidate selection.',
      });
    }

    // 1. Safety Check: Verify voter is verified
    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your account is not verified. Please complete email OTP verification to vote.',
      });
    }

    // 2. Safety Check: Verify election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found.',
      });
    }

    // 3. Safety Check: Verify election is active
    const now = new Date();
    if (now < election.startDate) {
      return res.status(400).json({
        success: false,
        message: 'Voting has not opened for this election yet.',
      });
    }
    if (now > election.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Voting for this election is closed.',
      });
    }

    // Find index of the candidate
    let idx;
    if (candidateIndex !== undefined) {
      idx = parseInt(candidateIndex, 10);
    } else {
      idx = election.candidates.findIndex(c => c._id.toString() === candidateId);
    }

    // 4. Safety Check: Verify candidate index validity
    if (isNaN(idx) || idx < 0 || idx >= election.candidates.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid candidate selection.',
      });
    }

    // 5. Safety Check: Verify voter hasn't already voted (Double-Voting prevention)
    const existingVote = await Vote.findOne({ election: electionId, voter: req.user._id });
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'Double voting detected! You have already cast a vote in this election.',
      });
    }

    // 6. Security: Generate SHA-256 vote integrity hash
    const timestamp = Date.now();
    const hashData = `${electionId}-${req.user._id}-${idx}-${timestamp}`;
    const voteHash = crypto
      .createHash('sha256')
      .update(hashData)
      .digest('hex');

    // 7. Security: Log metadata
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // 8. DB Transaction: Create Vote
    const vote = await Vote.create({
      election: electionId,
      voter: req.user._id,
      candidateIndex: idx,
      voteHash,
      ipAddress,
      userAgent,
      castedAt: new Date(timestamp),
    });

    // 9. Increment Vote Count on Election
    election.totalVoters += 1;
    await election.save();

    // 10. Audit log
    await logAudit(
      'VOTE_CAST',
      req.user._id,
      `Cast vote in election: "${election.title}" - Receipt Hash: ${voteHash.substring(0, 10)}...`,
      req
    );

    res.status(201).json({
      success: true,
      message: 'Your vote has been recorded successfully.',
      vote: {
        voteId: vote._id,
        electionTitle: election.title,
        candidateName: election.candidates[idx].name,
        candidateParty: election.candidates[idx].party || 'Independent',
        voteHash: vote.voteHash,
        castedAt: vote.castedAt,
      },
    });
  } catch (error) {
    console.error('🚨 CastVote error:', error.stack);
    
    // Catch Mongo unique index duplicate key error if concurrent requests bypass mongoose check
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Security validation error: A vote has already been cast from this account.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while recording vote.',
    });
  }
};

/**
 * Check if the current user has already voted in a specific election
 */
exports.checkVoteStatus = async (req, res) => {
  try {
    const hasVoted = await Vote.exists({
      election: req.params.electionId,
      voter: req.user._id,
    });

    res.status(200).json({
      success: true,
      hasVoted: !!hasVoted,
    });
  } catch (error) {
    console.error('🚨 CheckVoteStatus error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error checking voting status.',
    });
  }
};

/**
 * Get the actual vote cast by the current user for an election
 */
exports.getMyVote = async (req, res) => {
  try {
    const vote = await Vote.findOne({
      election: req.params.electionId,
      voter: req.user._id,
    });

    res.status(200).json({
      success: true,
      vote,
    });
  } catch (error) {
    console.error('🚨 GetMyVote error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user vote.',
    });
  }
};

/**
 * Get results of an election (vote counts per candidate)
 */
exports.getResults = async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found.',
      });
    }

    // Retrieve all votes for this election
    const votes = await Vote.find({ election: election._id });

    // Map candidates to tallies (initialize with 0 votes)
    const tallies = {};
    election.candidates.forEach((_, idx) => {
      tallies[idx] = 0;
    });

    // Calculate vote sums
    votes.forEach((vote) => {
      if (tallies[vote.candidateIndex] !== undefined) {
        tallies[vote.candidateIndex]++;
      }
    });

    // Assemble dynamic charts data structure
    const results = election.candidates.map((candidate, idx) => ({
      _id: candidate._id,
      name: candidate.name,
      party: candidate.party || 'Independent',
      image: candidate.image || '',
      candidateIndex: idx,
      votes: tallies[idx] || 0,
    }));

    res.status(200).json({
      success: true,
      electionTitle: election.title,
      totalVotes: votes.length,
      results,
    });
  } catch (error) {
    console.error('🚨 GetResults error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error calculating election results.',
    });
  }
};

/**
 * Get a specific vote receipt by ID (access limited to voter or admin)
 */
exports.getVoteReceipt = async (req, res) => {
  try {
    const vote = await Vote.findById(req.params.voteId)
      .populate('election', 'title candidates')
      .populate('voter', 'fullName email voterId');

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: 'Vote receipt not found.',
      });
    }

    // Access control: only the voter who cast the vote or an admin can access this receipt
    if (vote.voter._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this receipt.',
      });
    }

    const candidate = vote.election.candidates[vote.candidateIndex];

    res.status(200).json({
      success: true,
      receipt: {
        voteId: vote._id,
        electionTitle: vote.election.title,
        candidateName: candidate ? candidate.name : 'Unknown Candidate',
        candidateParty: candidate ? (candidate.party || 'Independent') : 'N/A',
        voteHash: vote.voteHash,
        voterId: vote.voter.voterId,
        voterName: vote.voter.fullName,
        castedAt: vote.castedAt,
      },
    });
  } catch (error) {
    console.error('🚨 GetVoteReceipt error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving vote receipt details.',
    });
  }
};
