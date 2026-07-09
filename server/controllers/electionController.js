/**
 * Election Controller
 * ===================
 * Implements election CRUD APIs (restricted to admin for write operations)
 * and aggregates vote tallies to present election results.
 */

const Election = require('../models/Election');
const Vote = require('../models/Vote');
const logAudit = require('../utils/auditLogger');

/**
 * Get all elections (accessible to all verified users)
 */
exports.getAllElections = async (req, res) => {
  try {
    // Sort elections by startDate (newest or closest first)
    const elections = await Election.find().sort({ startDate: -1 });
    res.status(200).json({
      success: true,
      elections,
    });
  } catch (error) {
    console.error('🚨 GetAllElections error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving elections.',
    });
  }
};

/**
 * Get detailed election data by ID
 */
exports.getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found.',
      });
    }

    res.status(200).json({
      success: true,
      election,
    });
  } catch (error) {
    console.error('🚨 GetElectionById error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving election details.',
    });
  }
};

/**
 * Create a new election (Admin only)
 */
exports.createElection = async (req, res) => {
  try {
    const { title, description, candidates, startDate, endDate, isPublic } = req.body;

    // Validate candidates length (handled in Mongoose, but checked here for immediate feedback)
    if (!candidates || candidates.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'An election must contain at least 2 candidates.',
      });
    }

    // Create document
    const election = await Election.create({
      title,
      description,
      candidates,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isPublic: isPublic !== undefined ? isPublic : true,
      createdBy: req.user._id,
    });

    // Write audit log
    await logAudit(
      'ELECTION_CREATED',
      req.user._id,
      `Created election: "${election.title}"`,
      req
    );

    res.status(201).json({
      success: true,
      message: 'Election created successfully.',
      election,
    });
  } catch (error) {
    console.error('🚨 CreateElection error:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating election.',
    });
  }
};

/**
 * Update an existing election (Admin only)
 */
exports.updateElection = async (req, res) => {
  try {
    const { title, description, candidates, startDate, endDate, isPublic } = req.body;

    let election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found.',
      });
    }

    // Map fields
    if (title) election.title = title;
    if (description) election.description = description;
    if (candidates) election.candidates = candidates;
    if (startDate) election.startDate = new Date(startDate);
    if (endDate) election.endDate = new Date(endDate);
    if (isPublic !== undefined) election.isPublic = isPublic;

    await election.save();

    // Write audit log
    await logAudit(
      'ELECTION_UPDATED',
      req.user._id,
      `Updated election details for: "${election.title}"`,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Election updated successfully.',
      election,
    });
  } catch (error) {
    console.error('🚨 UpdateElection error:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating election.',
    });
  }
};

/**
 * Delete an election (Admin only)
 */
exports.deleteElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found.',
      });
    }

    const title = election.title;
    await Election.findByIdAndDelete(req.params.id);

    // Clean up corresponding votes
    await Vote.deleteMany({ election: req.params.id });

    // Write audit log
    await logAudit(
      'ELECTION_DELETED',
      req.user._id,
      `Deleted election and its votes: "${title}" (ID: ${req.params.id})`,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Election and its associated votes deleted successfully.',
    });
  } catch (error) {
    console.error('🚨 DeleteElection error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting election.',
    });
  }
};

/**
 * Aggregate vote counts per candidate (Voter/Admin results)
 */
exports.getElectionResults = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
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
      name: candidate.name,
      party: candidate.party || 'Independent',
      image: candidate.image || '',
      candidateIndex: idx,
      votesCount: tallies[idx] || 0,
    }));

    const totalVotesCast = votes.length;

    res.status(200).json({
      success: true,
      electionTitle: election.title,
      totalVotes: totalVotesCast,
      results,
    });
  } catch (error) {
    console.error('🚨 GetElectionResults error:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error calculating election results.',
    });
  }
};
