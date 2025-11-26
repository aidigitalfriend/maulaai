import express from 'express';
import AgentUsage from '../models/AgentUsage.js';
import mongoose from 'mongoose';

const router = express.Router();

// ============================================
// 1. Record Daily Usage
// ============================================
router.post('/record', async (req, res) => {
  try {
    const { 
      userId, 
      agentId, 
      date,
      sessionId,
      messagesCount = 0,
      tokensUsed = 0,
      duration = 0,
      interactions = {},
      modelName = 'gpt-3.5-turbo'
    } = req.body;

    if (!userId || !agentId) {
      return res.status(400).json({ 
        error: 'userId and agentId are required' 
      });
    }

    const usageDate = date ? new Date(date) : new Date();
    usageDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Find or create usage record for this day
    let usage = await AgentUsage.findOne({
      userId,
      agentId,
      date: usageDate
    });

    if (!usage) {
      usage = new AgentUsage({
        userId,
        agentId,
        date: usageDate
      });
    }

    // Record session if sessionId provided
    if (sessionId) {
      usage.recordSession(sessionId, messagesCount, tokensUsed, duration);
    } else {
      // Add to totals without session details
      usage.totalMessages += messagesCount;
      usage.totalTokensUsed += tokensUsed;
      usage.totalDuration += duration;
    }

    // Update interaction counts
    if (interactions.textMessages) {
      usage.interactions.textMessages += interactions.textMessages;
    }
    if (interactions.fileUploads) {
      usage.interactions.fileUploads += interactions.fileUploads;
    }
    if (interactions.voiceMessages) {
      usage.interactions.voiceMessages += interactions.voiceMessages;
    }
    if (interactions.feedbackPositive) {
      usage.interactions.feedbackProvided.positive += interactions.feedbackPositive;
    }
    if (interactions.feedbackNegative) {
      usage.interactions.feedbackProvided.negative += interactions.feedbackNegative;
    }

    // Update model usage
    if (modelName && usage.modelUsage.hasOwnProperty(modelName)) {
      usage.modelUsage[modelName] += tokensUsed;
    }

    await usage.save();

    res.json({
      message: 'Usage recorded successfully',
      usage
    });
  } catch (error) {
    console.error('Error recording usage:', error);
    res.status(500).json({ error: 'Failed to record usage' });
  }
});

// ============================================
// 2. Get Daily Usage for User and Agent
// ============================================
router.get('/:userId/:agentId/daily', async (req, res) => {
  try {
    const { userId, agentId } = req.params;
    const { date } = req.query;

    const usageDate = date ? new Date(date) : new Date();
    usageDate.setHours(0, 0, 0, 0);

    const usage = await AgentUsage.findOne({
      userId,
      agentId,
      date: usageDate
    });

    res.json({ usage: usage || null });
  } catch (error) {
    console.error('Error fetching daily usage:', error);
    res.status(500).json({ error: 'Failed to fetch daily usage' });
  }
});

// ============================================
// 3. Get Usage Range for User and Agent
// ============================================
router.get('/:userId/:agentId/range', async (req, res) => {
  try {
    const { userId, agentId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'startDate and endDate are required' 
      });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const usageRecords = await AgentUsage.find({
      userId,
      agentId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    // Calculate totals
    const totals = usageRecords.reduce((acc, record) => ({
      totalSessions: acc.totalSessions + record.totalSessions,
      totalMessages: acc.totalMessages + record.totalMessages,
      totalTokens: acc.totalTokens + record.totalTokensUsed,
      totalDuration: acc.totalDuration + record.totalDuration
    }), {
      totalSessions: 0,
      totalMessages: 0,
      totalTokens: 0,
      totalDuration: 0
    });

    res.json({
      dateRange: { startDate: start, endDate: end },
      count: usageRecords.length,
      totals,
      usageRecords
    });
  } catch (error) {
    console.error('Error fetching usage range:', error);
    res.status(500).json({ error: 'Failed to fetch usage range' });
  }
});

// ============================================
// 4. Get User's Total Usage Across All Agents
// ============================================
router.get('/user/:userId/total', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const totalUsage = await AgentUsage.getUserTotalUsage(userId, start, end);

    res.json({
      dateRange: { startDate: start, endDate: end },
      totalUsage: totalUsage.length > 0 ? totalUsage[0] : {
        totalSessions: 0,
        totalMessages: 0,
        totalTokens: 0,
        totalDuration: 0
      }
    });
  } catch (error) {
    console.error('Error fetching total usage:', error);
    res.status(500).json({ error: 'Failed to fetch total usage' });
  }
});

// ============================================
// 5. Get Agent Usage Breakdown for User
// ============================================
router.get('/user/:userId/breakdown', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const breakdown = await AgentUsage.getAgentUsageBreakdown(userId, start, end);

    res.json({
      dateRange: { startDate: start, endDate: end },
      breakdown
    });
  } catch (error) {
    console.error('Error fetching usage breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch usage breakdown' });
  }
});

// ============================================
// 6. Get All Agents Usage for User (Last 30 Days)
// ============================================
router.get('/user/:userId/recent', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const usageRecords = await AgentUsage.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    res.json({
      days: parseInt(days),
      count: usageRecords.length,
      usageRecords
    });
  } catch (error) {
    console.error('Error fetching recent usage:', error);
    res.status(500).json({ error: 'Failed to fetch recent usage' });
  }
});

// ============================================
// 7. Get Model Usage Statistics
// ============================================
router.get('/:userId/:agentId/models', async (req, res) => {
  try {
    const { userId, agentId } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const usageRecords = await AgentUsage.find({
      userId,
      agentId,
      date: { $gte: start, $lte: end }
    });

    const modelStats = usageRecords.reduce((acc, record) => {
      Object.keys(record.modelUsage).forEach(model => {
        if (!acc[model]) acc[model] = 0;
        acc[model] += record.modelUsage[model];
      });
      return acc;
    }, {});

    res.json({
      dateRange: { startDate: start, endDate: end },
      modelStats
    });
  } catch (error) {
    console.error('Error fetching model stats:', error);
    res.status(500).json({ error: 'Failed to fetch model stats' });
  }
});

// ============================================
// 8. Get Interaction Statistics
// ============================================
router.get('/:userId/:agentId/interactions', async (req, res) => {
  try {
    const { userId, agentId } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const usageRecords = await AgentUsage.find({
      userId,
      agentId,
      date: { $gte: start, $lte: end }
    });

    const interactionStats = usageRecords.reduce((acc, record) => {
      acc.textMessages += record.interactions.textMessages;
      acc.fileUploads += record.interactions.fileUploads;
      acc.voiceMessages += record.interactions.voiceMessages;
      acc.feedbackPositive += record.interactions.feedbackProvided.positive;
      acc.feedbackNegative += record.interactions.feedbackProvided.negative;
      return acc;
    }, {
      textMessages: 0,
      fileUploads: 0,
      voiceMessages: 0,
      feedbackPositive: 0,
      feedbackNegative: 0
    });

    res.json({
      dateRange: { startDate: start, endDate: end },
      interactionStats
    });
  } catch (error) {
    console.error('Error fetching interaction stats:', error);
    res.status(500).json({ error: 'Failed to fetch interaction stats' });
  }
});

// ============================================
// 9. Get Global Agent Statistics (Admin)
// ============================================
router.get('/admin/agent-stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const agentStats = await AgentUsage.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$agentId',
          totalSessions: { $sum: '$totalSessions' },
          totalMessages: { $sum: '$totalMessages' },
          totalTokens: { $sum: '$totalTokensUsed' },
          totalDuration: { $sum: '$totalDuration' },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          agentId: '$_id',
          totalSessions: 1,
          totalMessages: 1,
          totalTokens: 1,
          totalDuration: 1,
          uniqueUsersCount: { $size: '$uniqueUsers' }
        }
      },
      {
        $sort: { totalMessages: -1 }
      }
    ]);

    res.json({
      dateRange: { startDate: start, endDate: end },
      agentStats
    });
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    res.status(500).json({ error: 'Failed to fetch agent stats' });
  }
});

// ============================================
// 10. Delete Old Usage Records (Cleanup)
// ============================================
router.delete('/cleanup', async (req, res) => {
  try {
    const { daysOld = 90 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));

    const result = await AgentUsage.deleteMany({
      date: { $lt: cutoffDate }
    });

    res.json({
      message: 'Cleanup completed',
      deletedCount: result.deletedCount,
      cutoffDate
    });
  } catch (error) {
    console.error('Error cleaning up usage records:', error);
    res.status(500).json({ error: 'Failed to cleanup' });
  }
});

export default router;
