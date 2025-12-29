/**
 * SUGGESTIONS ROUTES
 * Handles community feature requests and feedback
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CommunitySuggestion } from '../models/CommunitySuggestion.js';

const router = express.Router();

/**
 * Submit a new suggestion
 */
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      userName,
      isAnonymous,
      title,
      description,
      category,
      relatedTo,
      userPriority,
      tags,
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const suggestion = new CommunitySuggestion({
      suggestionId: `sug_${Date.now()}_${uuidv4().slice(0, 8)}`,
      userId,
      userEmail: isAnonymous ? null : userEmail,
      userName: isAnonymous ? null : userName,
      isAnonymous: isAnonymous || false,
      title,
      description,
      category,
      relatedTo,
      userPriority: userPriority || 'would-be-helpful',
      tags,
      status: 'submitted',
    });

    await suggestion.save();

    res.json({
      success: true,
      suggestion: {
        suggestionId: suggestion.suggestionId,
        title: suggestion.title,
        status: suggestion.status,
        createdAt: suggestion.createdAt,
      },
      message: 'Thank you for your suggestion!',
    });
  } catch (error) {
    console.error('Error creating suggestion:', error);
    res.status(500).json({ error: 'Failed to submit suggestion' });
  }
});

/**
 * Get all suggestions (public)
 */
router.get('/', async (req, res) => {
  try {
    const {
      category,
      status,
      sort = 'votes',
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    let sortOption = {};
    switch (sort) {
      case 'votes':
        sortOption = { 'votes.up': -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { 'votes.up': -1 };
    }

    const suggestions = await CommunitySuggestion.find(filter)
      .select(
        'suggestionId title description category status votes.up votes.down userPriority createdAt updatedAt'
      )
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await CommunitySuggestion.countDocuments(filter);

    res.json({
      success: true,
      suggestions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

/**
 * Get single suggestion details
 */
router.get('/:suggestionId', async (req, res) => {
  try {
    const { suggestionId } = req.params;

    const suggestion = await CommunitySuggestion.findOne({
      suggestionId,
    }).select('-internal'); // Hide internal notes

    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    res.json({ success: true, suggestion });
  } catch (error) {
    console.error('Error fetching suggestion:', error);
    res.status(500).json({ error: 'Failed to fetch suggestion' });
  }
});

/**
 * Vote on a suggestion
 */
router.post('/:suggestionId/vote', async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const { userId, vote } = req.body; // vote: 1 or -1

    if (!userId || ![1, -1].includes(vote)) {
      return res.status(400).json({ error: 'Invalid vote' });
    }

    const suggestion = await CommunitySuggestion.findOne({ suggestionId });

    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    // Check if user already voted
    const existingVoteIndex = suggestion.votes.voters.findIndex(
      (v) => v.userId.toString() === userId
    );

    if (existingVoteIndex >= 0) {
      const oldVote = suggestion.votes.voters[existingVoteIndex].vote;

      // Remove old vote count
      if (oldVote === 1) suggestion.votes.up -= 1;
      else suggestion.votes.down -= 1;

      // Update or remove vote
      if (oldVote === vote) {
        // Same vote = remove vote
        suggestion.votes.voters.splice(existingVoteIndex, 1);
      } else {
        // Different vote = change vote
        suggestion.votes.voters[existingVoteIndex].vote = vote;
        if (vote === 1) suggestion.votes.up += 1;
        else suggestion.votes.down += 1;
      }
    } else {
      // New vote
      suggestion.votes.voters.push({
        userId,
        vote,
        votedAt: new Date(),
      });
      if (vote === 1) suggestion.votes.up += 1;
      else suggestion.votes.down += 1;
    }

    await suggestion.save();

    res.json({
      success: true,
      votes: {
        up: suggestion.votes.up,
        down: suggestion.votes.down,
      },
    });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

/**
 * Add comment to suggestion
 */
router.post('/:suggestionId/comments', async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const { userId, userName, text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Comment text required' });
    }

    const suggestion = await CommunitySuggestion.findOne({ suggestionId });

    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }

    suggestion.comments.push({
      userId,
      userName,
      text,
      isOfficial: false,
      createdAt: new Date(),
    });

    await suggestion.save();

    res.json({
      success: true,
      message: 'Comment added',
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

/**
 * Get user's suggestions
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const suggestions = await CommunitySuggestion.find({ userId })
      .select(
        'suggestionId title category status votes.up votes.down createdAt'
      )
      .sort({ createdAt: -1 });

    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('Error fetching user suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

export default router;
