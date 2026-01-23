import express from 'express';
import db from '../lib/db.js';
const router = express.Router();

// GET /api/gamification/metrics/:userId - Get user metrics
router.get('/metrics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    let gamification = await db.Gamification.getUserGamification(userId);
    
    // Initialize if doesn't exist
    if (!gamification) {
      gamification = await db.Gamification.createUserGamification(userId);
    }

    res.json({
      success: true,
      data: gamification
    });
  } catch (error) {
    console.error('Get gamification metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics'
    });
  }
});

// POST /api/gamification/metrics/:userId - Update user metrics
router.post('/metrics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const metricsUpdate = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    let gamification = await db.Gamification.getUserGamification(userId);
    
    // Initialize if doesn't exist
    if (!gamification) {
      gamification = await db.Gamification.createUserGamification(userId);
    }

    // Update the gamification record
    const updatedGamification = await db.Gamification.updateUserGamification(userId, metricsUpdate);

    res.json({
      success: true,
      data: updatedGamification
    });
  } catch (error) {
    console.error('Update gamification metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update metrics'
    });
  }
});

// POST /api/gamification/events/:userId - Track gamification events
router.post('/events/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, data = {} } = req.body;

    if (!userId || !type) {
      return res.status(400).json({
        success: false,
        error: 'User ID and event type are required'
      });
    }

    // Get or create user gamification record
    let userGamification = await db.Gamification.getUserGamification(userId);
    if (!userGamification) {
      userGamification = await db.Gamification.initializeUserGamification(userId, data.username || 'User');
    }

    // Define points for different event types
    const eventPoints = {
      'message-sent': 1,
      'perfect-response': 5,
      'high-score': 10,
      'session-end': 2,
      'streak-update': 3,
      'challenge-completed': 15,
      'agent-created': 20,
      'first-login': 5
    };

    const pointsToAward = eventPoints[type] || 0;

    // Award points if applicable
    if (pointsToAward > 0) {
      await db.Gamification.addPoints(userId, pointsToAward, `Event: ${type}`, 'gamification');
    }

    // Update specific metrics based on event type
    switch (type) {
      case 'message-sent':
        if (data.agentId) {
          await db.Gamification.updateAgentUsage(userId, data.agentId);
        }
        break;

      case 'perfect-response':
        await db.Gamification.incrementPerfectResponses(userId);
        break;

      case 'high-score':
        await db.Gamification.incrementHighScores(userId);
        break;

      case 'session-end':
        if (data.messageCount) {
          await db.Gamification.updateConversationStats(userId, data.messageCount);
        }
        break;

      case 'streak-update':
        if (data.streakCount) {
          await db.Gamification.updateStreak(userId, data.streakCount);
        }
        break;

      case 'challenge-completed':
        await db.Gamification.incrementCompletedChallenges(userId);
        break;
    }

    // Check for new badges/achievements
    await db.Gamification.checkAndAwardBadges(userId);
    await db.Gamification.checkAndCompleteAchievements(userId);

    // Get updated gamification data
    const updatedGamification = await db.Gamification.getUserGamification(userId);

    res.json({
      success: true,
      data: {
        eventProcessed: true,
        type,
        pointsAwarded: pointsToAward,
        gamification: updatedGamification
      }
    });
  } catch (error) {
    console.error('Track gamification event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track event'
    });
  }
});

// GET /api/gamification/sync/:userId - Get all user gamification data for sync
router.get('/sync/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const gamification = await db.Gamification.getUserGamification(userId);
    const recentPoints = await db.Gamification.getRecentPointsHistory(userId, 10);
    const badges = await db.Gamification.getUserBadges(userId);
    const achievements = await db.Gamification.getUserAchievements(userId);

    res.json({
      success: true,
      data: {
        gamification: gamification || null,
        recentPoints,
        badges,
        achievements,
        lastSyncTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Gamification sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync data'
    });
  }
});

// POST /api/gamification/bulk-sync/:userId - Bulk sync gamification data
router.post('/bulk-sync/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { metrics, events = [] } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    let metricsUpdated = false;
    let eventsProcessed = 0;

    // Update metrics if provided
    if (metrics) {
      await db.Gamification.updateUserGamification(userId, metrics);
      metricsUpdated = true;
    }

    // Process events
    for (const event of events) {
      if (event.type) {
        await db.Gamification.processEvent(userId, event.type, event.data || {});
        eventsProcessed++;
      }
    }

    // Check for new badges/achievements after bulk sync
    await db.Gamification.checkAndAwardBadges(userId);
    await db.Gamification.checkAndCompleteAchievements(userId);

    res.json({
      success: true,
      data: {
        metricsUpdated,
        eventsProcessed,
        syncTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Bulk gamification sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk sync'
    });
  }
});

export default router;