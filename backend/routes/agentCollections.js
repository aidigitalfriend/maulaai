import express from 'express';
import { MongoClient } from 'mongodb';

const router = express.Router();

// ============================================
// Agent Collection Service - Central Hub Management
// ============================================

// Get collection name for a specific agent
function getAgentCollectionName(agentId) {
  return `agent_${agentId.replace('-', '_')}`;
}

// ============================================
// POST /api/agent-collections/:agentId/chat-session
// Store chat session in agent's collection
// ============================================
router.post('/:agentId/chat-session', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { userId, sessionId, messages, sessionMetrics, subscriptionStatus } = req.body;

    if (!userId || !sessionId || !messages) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, sessionId, messages' 
      });
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('ai-lab-main');
    
    const collectionName = getAgentCollectionName(agentId);
    const collection = db.collection(collectionName);
    
    const chatSessionDoc = {
      dataType: 'chatSession',
      userId: userId,
      sessionId: sessionId,
      agentId: agentId,
      timestamp: new Date(),
      messages: messages,
      sessionMetrics: sessionMetrics || {
        messageCount: messages.length,
        duration: 0,
        userSatisfaction: null,
        topicsDiscussed: []
      },
      subscriptionStatus: subscriptionStatus || 'unknown'
    };
    
    const result = await collection.insertOne(chatSessionDoc);
    await client.close();
    
    res.json({
      success: true,
      documentId: result.insertedId,
      agentCollection: collectionName,
      message: 'Chat session stored in agent collection'
    });
    
  } catch (error) {
    console.error('Error storing chat session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store chat session in agent collection'
    });
  }
});

// ============================================
// POST /api/agent-collections/:agentId/interaction
// Log user interaction with specific agent
// ============================================
router.post('/:agentId/interaction', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { userId, interactionType, sessionId, metadata } = req.body;

    if (!userId || !interactionType) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, interactionType' 
      });
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('ai-lab-main');
    
    const collectionName = getAgentCollectionName(agentId);
    const collection = db.collection(collectionName);
    
    const interactionDoc = {
      dataType: 'userInteraction',
      userId: userId,
      agentId: agentId,
      timestamp: new Date(),
      interactionType: interactionType, // 'chat_start', 'message_sent', 'session_end', 'subscription_purchased', etc.
      sessionId: sessionId,
      metadata: metadata || {}
    };
    
    const result = await collection.insertOne(interactionDoc);
    await client.close();
    
    res.json({
      success: true,
      documentId: result.insertedId,
      agentCollection: collectionName,
      message: 'User interaction logged'
    });
    
  } catch (error) {
    console.error('Error logging interaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log interaction'
    });
  }
});

// ============================================
// GET /api/agent-collections/:agentId/user/:userId/sessions
// Get all chat sessions for a user with specific agent
// ============================================
router.get('/:agentId/user/:userId/sessions', async (req, res) => {
  try {
    const { agentId, userId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('ai-lab-main');
    
    const collectionName = getAgentCollectionName(agentId);
    const collection = db.collection(collectionName);
    
    const sessions = await collection
      .find({ 
        dataType: 'chatSession',
        userId: userId,
        agentId: agentId 
      })
      .sort({ timestamp: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();
    
    const totalCount = await collection.countDocuments({
      dataType: 'chatSession',
      userId: userId,
      agentId: agentId
    });
    
    await client.close();
    
    res.json({
      success: true,
      agentId: agentId,
      userId: userId,
      sessions: sessions,
      totalCount: totalCount,
      returned: sessions.length
    });
    
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user sessions'
    });
  }
});

// ============================================
// GET /api/agent-collections/:agentId/analytics
// Get analytics for specific agent
// ============================================
router.get('/:agentId/analytics', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { period = 'daily', startDate, endDate } = req.query;

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('ai-lab-main');
    
    const collectionName = getAgentCollectionName(agentId);
    const collection = db.collection(collectionName);
    
    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }
    
    // Get basic stats
    const totalSessions = await collection.countDocuments({
      dataType: 'chatSession',
      agentId: agentId,
      ...dateFilter
    });
    
    const totalInteractions = await collection.countDocuments({
      dataType: 'userInteraction',
      agentId: agentId,
      ...dateFilter
    });
    
    // Get unique users
    const uniqueUsers = await collection.distinct('userId', {
      dataType: 'chatSession',
      agentId: agentId,
      ...dateFilter
    });
    
    // Get recent analytics records
    const analyticsRecords = await collection
      .find({
        dataType: 'agentAnalytics',
        agentId: agentId,
        period: period,
        ...dateFilter
      })
      .sort({ timestamp: -1 })
      .limit(30)
      .toArray();
    
    await client.close();
    
    res.json({
      success: true,
      agentId: agentId,
      period: period,
      summary: {
        totalSessions: totalSessions,
        totalInteractions: totalInteractions,
        uniqueUsers: uniqueUsers.length
      },
      analytics: analyticsRecords
    });
    
  } catch (error) {
    console.error('Error fetching agent analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent analytics'
    });
  }
});

// ============================================
// GET /api/agent-collections/:agentId/stats
// Get real-time stats for agent collection
// ============================================
router.get('/:agentId/stats', async (req, res) => {
  try {
    const { agentId } = req.params;

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('ai-lab-main');
    
    const collectionName = getAgentCollectionName(agentId);
    const collection = db.collection(collectionName);
    
    // Get collection stats
    const totalDocs = await collection.countDocuments();
    const chatSessions = await collection.countDocuments({ dataType: 'chatSession' });
    const userInteractions = await collection.countDocuments({ dataType: 'userInteraction' });
    const analyticsRecords = await collection.countDocuments({ dataType: 'agentAnalytics' });
    
    // Get recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivity = await collection.countDocuments({
      timestamp: { $gte: oneDayAgo }
    });
    
    // Get unique users (all time)
    const allUniqueUsers = await collection.distinct('userId');
    
    await client.close();
    
    res.json({
      success: true,
      agentId: agentId,
      collectionName: collectionName,
      stats: {
        totalDocuments: totalDocs,
        chatSessions: chatSessions,
        userInteractions: userInteractions,
        analyticsRecords: analyticsRecords,
        uniqueUsers: allUniqueUsers.length,
        recentActivity24h: recentActivity
      },
      lastUpdated: new Date()
    });
    
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent stats'
    });
  }
});

// ============================================
// GET /api/agent-collections/mapping
// Get all agent collection mappings
// ============================================
router.get('/mapping', async (req, res) => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('ai-lab-main');
    
    const mappings = await db.collection('agent_collection_mapping')
      .find({ isActive: true })
      .sort({ agentId: 1 })
      .toArray();
    
    await client.close();
    
    res.json({
      success: true,
      count: mappings.length,
      mappings: mappings
    });
    
  } catch (error) {
    console.error('Error fetching collection mappings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collection mappings'
    });
  }
});

export default router;