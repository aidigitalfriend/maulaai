import express from 'express';
const router = express.Router();

// In-memory storage for gamification data (in production, use PostgreSQL)
const gamificationData = new Map();

// GET /api/gamification/metrics/:userId - Get user metrics
router.get('/metrics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
    }

    let metrics = gamificationData.get(userId);
    
    // Initialize if doesn't exist
    if (!metrics) {
      metrics = {
        userId,
        username: 'User',
        totalMessagesEarned: 0,
        perfectResponseCount: 0,
        highScoreCount: 0,
        agentsUsed: [],
        agentUsageCount: {},
        longestConversation: 0,
        totalConversationLength: 0,
        conversationSessions: [],
        usageByHour: {},
        usageByDay: {},
        firstUsageToday: null,
        lastActivityTime: new Date().toISOString(),
        currentStreak: 0,
        longestStreak: 0,
        lastChallengeTime: null,
        completedChallengesCount: 0,
        averageResponseTime: 0,
        averageConversationLength: 0,
        accountCreatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      
      gamificationData.set(userId, metrics);
    }

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Get gamification metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get metrics',
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
        error: 'User ID is required',
      });
    }

    let currentMetrics = gamificationData.get(userId);
    
    // Initialize if doesn't exist
    if (!currentMetrics) {
      currentMetrics = {
        userId,
        username: metricsUpdate.username || 'User',
        totalMessagesEarned: 0,
        perfectResponseCount: 0,
        highScoreCount: 0,
        agentsUsed: [],
        agentUsageCount: {},
        longestConversation: 0,
        totalConversationLength: 0,
        conversationSessions: [],
        usageByHour: {},
        usageByDay: {},
        firstUsageToday: null,
        lastActivityTime: new Date().toISOString(),
        currentStreak: 0,
        longestStreak: 0,
        lastChallengeTime: null,
        completedChallengesCount: 0,
        averageResponseTime: 0,
        averageConversationLength: 0,
        accountCreatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
    }

    // Merge updates
    const updatedMetrics = {
      ...currentMetrics,
      ...metricsUpdate,
      lastUpdated: new Date().toISOString(),
    };

    // Handle Set conversion for agentsUsed
    if (metricsUpdate.agentsUsed && Array.isArray(metricsUpdate.agentsUsed)) {
      updatedMetrics.agentsUsed = [...new Set([...currentMetrics.agentsUsed, ...metricsUpdate.agentsUsed])];
    }

    gamificationData.set(userId, updatedMetrics);

    res.json({
      success: true,
      data: updatedMetrics,
    });
  } catch (error) {
    console.error('Update gamification metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update metrics',
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
        error: 'User ID and event type are required',
      });
    }

    // Process the event and update metrics accordingly
    let metrics = gamificationData.get(userId);
    if (!metrics) {
      // Initialize if doesn't exist
      metrics = {
        userId,
        username: data.username || 'User',
        totalMessagesEarned: 0,
        perfectResponseCount: 0,
        highScoreCount: 0,
        agentsUsed: [],
        agentUsageCount: {},
        longestConversation: 0,
        totalConversationLength: 0,
        conversationSessions: [],
        usageByHour: {},
        usageByDay: {},
        firstUsageToday: null,
        lastActivityTime: new Date().toISOString(),
        currentStreak: 0,
        longestStreak: 0,
        lastChallengeTime: null,
        completedChallengesCount: 0,
        averageResponseTime: 0,
        averageConversationLength: 0,
        accountCreatedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
    }

    // Process different event types
    switch (type) {
    case 'message-sent':
      metrics.totalMessagesEarned += 1;
      if (data.agentId) {
        metrics.agentUsageCount[data.agentId] = (metrics.agentUsageCount[data.agentId] || 0) + 1;
        if (!metrics.agentsUsed.includes(data.agentId)) {
          metrics.agentsUsed.push(data.agentId);
        }
      }
      break;

    case 'perfect-response':
      metrics.perfectResponseCount += 1;
      break;

    case 'high-score':
      metrics.highScoreCount += 1;
      break;

    case 'session-end':
      if (data.messageCount) {
        metrics.longestConversation = Math.max(metrics.longestConversation, data.messageCount);
        metrics.totalConversationLength += data.messageCount;
      }
      break;

    case 'streak-update':
      if (data.streakCount) {
        metrics.currentStreak = data.streakCount;
        metrics.longestStreak = Math.max(metrics.longestStreak, data.streakCount);
      }
      break;
    }

    metrics.lastActivityTime = new Date().toISOString();
    metrics.lastUpdated = new Date().toISOString();

    gamificationData.set(userId, metrics);

    res.json({
      success: true,
      data: {
        eventProcessed: true,
        type,
        metrics,
      },
    });
  } catch (error) {
    console.error('Track gamification event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track event',
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
        error: 'User ID is required',
      });
    }

    const metrics = gamificationData.get(userId);
    const pendingEvents = []; // In real implementation, get from events queue

    res.json({
      success: true,
      data: {
        metrics: metrics || null,
        pendingEvents,
        lastSyncTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Gamification sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync data',
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
        error: 'User ID is required',
      });
    }

    // Store metrics
    if (metrics) {
      gamificationData.set(userId, {
        ...metrics,
        lastUpdated: new Date().toISOString(),
      });
    }

    // Process events (in real implementation, add to events queue)
    let processedEvents = 0;
    for (const _event of events) {
      // Process each event
      processedEvents++;
    }

    res.json({
      success: true,
      data: {
        metricsUpdated: !!metrics,
        eventsProcessed: processedEvents,
        syncTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Bulk gamification sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk sync',
    });
  }
});

export default router;