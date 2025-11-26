import { MongoClient } from 'mongodb';

/**
 * Agent Collection Hub Service
 * 
 * This service automatically syncs data to agent-specific collections
 * while maintaining the existing universal collections.
 * 
 * Usage: Call these functions alongside existing data operations
 * to maintain dual storage (universal + agent-specific)
 */

class AgentCollectionHub {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    if (!this.client) {
      this.client = new MongoClient(process.env.MONGODB_URI);
      await this.client.connect();
      this.db = this.client.db('ai-lab-main');
    }
    return this.db;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  getAgentCollectionName(agentId) {
    return `agent_${agentId.replace('-', '_')}`;
  }

  /**
   * Sync chat session to agent's collection
   * Call this after saving to universal agentchathistories collection
   */
  async syncChatSession(agentId, chatSessionData) {
    try {
      await this.connect();
      const collectionName = this.getAgentCollectionName(agentId);
      const collection = this.db.collection(collectionName);

      const agentDoc = {
        dataType: 'chatSession',
        agentId: agentId,
        userId: chatSessionData.userId,
        sessionId: chatSessionData.sessionId,
        timestamp: new Date(chatSessionData.timestamp || Date.now()),
        messages: chatSessionData.messages || [],
        sessionMetrics: {
          messageCount: chatSessionData.messages ? chatSessionData.messages.length : 0,
          duration: chatSessionData.duration || 0,
          userSatisfaction: chatSessionData.userSatisfaction || null,
          topicsDiscussed: chatSessionData.topicsDiscussed || []
        },
        subscriptionStatus: chatSessionData.subscriptionStatus || 'unknown',
        // Keep reference to universal collection
        universalDocId: chatSessionData._id || chatSessionData.id,
        syncedAt: new Date()
      };

      const result = await collection.insertOne(agentDoc);
      
      console.log(`✅ Synced chat session to ${collectionName}:`, result.insertedId);
      return result.insertedId;

    } catch (error) {
      console.error(`❌ Error syncing chat session to ${agentId} collection:`, error);
      // Don't throw - this is supplementary storage
      return null;
    }
  }

  /**
   * Log user interaction in agent's collection
   * Call this for any user interaction with the agent
   */
  async logInteraction(agentId, interactionData) {
    try {
      await this.connect();
      const collectionName = this.getAgentCollectionName(agentId);
      const collection = this.db.collection(collectionName);

      const interactionDoc = {
        dataType: 'userInteraction',
        agentId: agentId,
        userId: interactionData.userId,
        timestamp: new Date(),
        interactionType: interactionData.type, // 'chat_start', 'message_sent', 'session_end', 'subscription_purchased'
        sessionId: interactionData.sessionId,
        metadata: {
          userAgent: interactionData.userAgent,
          messageText: interactionData.messageText ? interactionData.messageText.substring(0, 100) : null, // First 100 chars
          responseTime: interactionData.responseTime,
          subscriptionStatus: interactionData.subscriptionStatus,
          ...interactionData.customData
        }
      };

      const result = await collection.insertOne(interactionDoc);
      
      console.log(`📊 Logged interaction for ${agentId}:`, interactionData.type);
      return result.insertedId;

    } catch (error) {
      console.error(`❌ Error logging interaction for ${agentId}:`, error);
      return null;
    }
  }

  /**
   * Sync subscription data to agent's collection
   * Call this when subscription changes occur
   */
  async syncSubscription(agentId, subscriptionData) {
    try {
      await this.connect();
      const collectionName = this.getAgentCollectionName(agentId);
      const collection = this.db.collection(collectionName);

      const subscriptionDoc = {
        dataType: 'subscriptionData',
        agentId: agentId,
        userId: subscriptionData.userId,
        timestamp: new Date(),
        subscriptionStatus: subscriptionData.status,
        plan: subscriptionData.plan,
        price: subscriptionData.price,
        expiryDate: subscriptionData.expiryDate,
        // Keep reference to universal collection
        universalSubscriptionId: subscriptionData._id || subscriptionData.id,
        syncedAt: new Date()
      };

      const result = await collection.insertOne(subscriptionDoc);
      
      console.log(`💰 Synced subscription to ${collectionName}:`, subscriptionData.plan);
      return result.insertedId;

    } catch (error) {
      console.error(`❌ Error syncing subscription to ${agentId} collection:`, error);
      return null;
    }
  }

  /**
   * Update agent analytics
   * Call this periodically to update agent performance metrics
   */
  async updateAnalytics(agentId, period = 'daily') {
    try {
      await this.connect();
      const collectionName = this.getAgentCollectionName(agentId);
      const collection = this.db.collection(collectionName);

      // Calculate analytics from agent's collection data
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'hourly':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case 'daily':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      // Get metrics from the period
      const totalSessions = await collection.countDocuments({
        dataType: 'chatSession',
        timestamp: { $gte: startDate }
      });

      const totalInteractions = await collection.countDocuments({
        dataType: 'userInteraction',
        timestamp: { $gte: startDate }
      });

      const uniqueUsers = await collection.distinct('userId', {
        dataType: 'chatSession',
        timestamp: { $gte: startDate }
      });

      // Get subscription conversions
      const subscriptionEvents = await collection.countDocuments({
        dataType: 'userInteraction',
        interactionType: 'subscription_purchased',
        timestamp: { $gte: startDate }
      });

      const analyticsDoc = {
        dataType: 'agentAnalytics',
        agentId: agentId,
        period: period,
        timestamp: now,
        startDate: startDate,
        endDate: now,
        metrics: {
          totalSessions: totalSessions,
          totalInteractions: totalInteractions,
          uniqueUsers: uniqueUsers.length,
          subscriptionConversions: subscriptionEvents,
          avgSessionsPerUser: uniqueUsers.length > 0 ? (totalSessions / uniqueUsers.length).toFixed(2) : 0,
          interactionRate: totalSessions > 0 ? (totalInteractions / totalSessions).toFixed(2) : 0
        }
      };

      const result = await collection.insertOne(analyticsDoc);
      
      console.log(`📈 Updated analytics for ${agentId} (${period}):`, analyticsDoc.metrics);
      return result.insertedId;

    } catch (error) {
      console.error(`❌ Error updating analytics for ${agentId}:`, error);
      return null;
    }
  }

  /**
   * Get agent collection statistics
   */
  async getAgentStats(agentId) {
    try {
      await this.connect();
      const collectionName = this.getAgentCollectionName(agentId);
      const collection = this.db.collection(collectionName);

      const totalDocs = await collection.countDocuments();
      const chatSessions = await collection.countDocuments({ dataType: 'chatSession' });
      const interactions = await collection.countDocuments({ dataType: 'userInteraction' });
      const analytics = await collection.countDocuments({ dataType: 'agentAnalytics' });
      const subscriptions = await collection.countDocuments({ dataType: 'subscriptionData' });

      return {
        agentId: agentId,
        collectionName: collectionName,
        totalDocuments: totalDocs,
        chatSessions: chatSessions,
        userInteractions: interactions,
        analyticsRecords: analytics,
        subscriptionRecords: subscriptions
      };

    } catch (error) {
      console.error(`❌ Error getting stats for ${agentId}:`, error);
      return null;
    }
  }

  /**
   * Batch sync existing data from universal collections
   * Use this for migration/backfill
   */
  async backfillAgentData(agentId, limit = 100) {
    try {
      await this.connect();
      
      console.log(`🔄 Starting backfill for ${agentId}...`);
      
      // Backfill chat histories
      const chatHistories = await this.db.collection('agentchathistories')
        .find({ agentId: agentId })
        .limit(limit)
        .toArray();

      for (const chat of chatHistories) {
        await this.syncChatSession(agentId, chat);
      }

      // Backfill subscriptions
      const subscriptions = await this.db.collection('agentsubscriptions')
        .find({ agentId: agentId })
        .limit(limit)
        .toArray();

      for (const sub of subscriptions) {
        await this.syncSubscription(agentId, sub);
      }

      console.log(`✅ Backfilled ${chatHistories.length} chat histories and ${subscriptions.length} subscriptions for ${agentId}`);

      return {
        chatHistoriesBackfilled: chatHistories.length,
        subscriptionsBackfilled: subscriptions.length
      };

    } catch (error) {
      console.error(`❌ Error backfilling data for ${agentId}:`, error);
      return null;
    }
  }
}

// Create singleton instance
const agentHub = new AgentCollectionHub();

export default agentHub;

// Export convenience functions
export const syncChatSession = (agentId, data) => agentHub.syncChatSession(agentId, data);
export const logInteraction = (agentId, data) => agentHub.logInteraction(agentId, data);
export const syncSubscription = (agentId, data) => agentHub.syncSubscription(agentId, data);
export const updateAnalytics = (agentId, period) => agentHub.updateAnalytics(agentId, period);
export const getAgentStats = (agentId) => agentHub.getAgentStats(agentId);
export const backfillAgentData = (agentId, limit) => agentHub.backfillAgentData(agentId, limit);