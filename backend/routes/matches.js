const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Match = require('../models/Match');
const matchingAlgorithm = require('../utils/matchingAlgorithm');

/**
 * @route   GET /api/matches/:userId
 * @desc    Get user's neighborhood matches
 * @access  Private
 */
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, recalculate = false } = req.query;

    // Check if user is requesting their own matches or is admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view these matches' });
    }

    // If recalculate is requested or no existing matches, run the algorithm
    if (recalculate === 'true' || !(await Match.findOne({ userId }))) {
      const algorithmResult = await matchingAlgorithm.findMatches(userId, parseInt(limit));
      
      if (!algorithmResult.success) {
        return res.status(500).json({ error: algorithmResult.error });
      }

      // Save or update matches in database
      const matches = algorithmResult.matches.map(match => ({
        userId,
        neighborhoodId: match.neighborhood._id,
        rank: match.rank,
        compatibility: match.compatibility,
        scores: match.scores,
        createdAt: new Date()
      }));

      // Delete existing matches and insert new ones
      await Match.deleteMany({ userId });
      await Match.insertMany(matches);

      return res.json({
        success: true,
        matches: algorithmResult.matches,
        algorithm: algorithmResult.algorithm,
        message: 'Matches calculated successfully'
      });
    }

    // Get existing matches from database
    const existingMatches = await Match.find({ userId })
      .populate('neighborhoodId')
      .sort({ rank: 1 })
      .limit(parseInt(limit));

    const matches = existingMatches.map(match => ({
      rank: match.rank,
      neighborhood: match.neighborhoodId,
      compatibility: match.compatibility,
      scores: match.scores
    }));

    res.json({
      success: true,
      matches,
      message: 'Retrieved existing matches'
    });

  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

/**
 * @route   POST /api/matches/calculate
 * @desc    Calculate new matches for a user
 * @access  Private
 */
router.post('/calculate', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.body;
    const userId = req.user._id;

    const result = await matchingAlgorithm.findMatches(userId, parseInt(limit));
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // Save matches to database
    const matches = result.matches.map(match => ({
      userId,
      neighborhoodId: match.neighborhood._id,
      rank: match.rank,
      compatibility: match.compatibility,
      scores: match.scores,
      createdAt: new Date()
    }));

    // Delete existing matches and insert new ones
    await Match.deleteMany({ userId });
    await Match.insertMany(matches);

    res.json({
      success: true,
      matches: result.matches,
      algorithm: result.algorithm,
      message: 'Matches calculated and saved successfully'
    });

  } catch (error) {
    console.error('Calculate matches error:', error);
    res.status(500).json({ error: 'Failed to calculate matches' });
  }
});

/**
 * @route   GET /api/matches/:userId/analysis/:neighborhoodId
 * @desc    Get detailed analysis for a specific neighborhood match
 * @access  Private
 */
router.get('/:userId/analysis/:neighborhoodId', authenticateToken, async (req, res) => {
  try {
    const { userId, neighborhoodId } = req.params;

    // Check authorization
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const analysis = await matchingAlgorithm.getMatchAnalysis(userId, neighborhoodId);
    
    if (!analysis.success) {
      return res.status(500).json({ error: analysis.error });
    }

    res.json(analysis);

  } catch (error) {
    console.error('Match analysis error:', error);
    res.status(500).json({ error: 'Failed to get match analysis' });
  }
});

/**
 * @route   PUT /api/matches/:matchId/interaction
 * @desc    Update user interaction with a match (like, dislike, save)
 * @access  Private
 */
router.put('/:matchId/interaction', authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.params;
    const { action, rating } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Check if user owns this match
    if (match.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update interaction
    match.interaction = action;
    if (rating) match.rating = rating;
    match.updatedAt = new Date();

    await match.save();

    res.json({
      success: true,
      match,
      message: `Match ${action} successfully`
    });

  } catch (error) {
    console.error('Update match interaction error:', error);
    res.status(500).json({ error: 'Failed to update match interaction' });
  }
});

/**
 * @route   GET /api/matches/:userId/saved
 * @desc    Get user's saved matches
 * @access  Private
 */
router.get('/:userId/saved', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check authorization
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const savedMatches = await Match.find({ 
      userId, 
      interaction: 'saved' 
    })
    .populate('neighborhoodId')
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      matches: savedMatches
    });

  } catch (error) {
    console.error('Get saved matches error:', error);
    res.status(500).json({ error: 'Failed to get saved matches' });
  }
});

/**
 * @route   DELETE /api/matches/:matchId
 * @desc    Delete a match
 * @access  Private
 */
router.delete('/:matchId', authenticateToken, async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Check if user owns this match
    if (match.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Match.findByIdAndDelete(matchId);

    res.json({
      success: true,
      message: 'Match deleted successfully'
    });

  } catch (error) {
    console.error('Delete match error:', error);
    res.status(500).json({ error: 'Failed to delete match' });
  }
});

module.exports = router; 