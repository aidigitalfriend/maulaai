/**
 * Agent Collection Hub Service
 * 
 * This service manages agent-specific data operations using PostgreSQL/Prisma.
 * Uses existing tables with agentId filtering rather than separate collections.
 */

import { prisma } from '../lib/prisma.js';

class AgentCollectionHub {
  constructor() {
    // No connection needed - Prisma handles connection pooling
  }

  async connect() {
    // Prisma handles connections automatically
    return prisma;
  }

  async disconnect() {
    // Prisma handles disconnection in the main server
  }

  /**
   * Sync chat session to agent's data
   * Uses the ChatSession table with agentId filtering
   */
  async syncChatSession(agentId, chatSessionData) {
    try {
      const session = await prisma.chatSession.upsert({
        where: { sessionId: chatSessionData.sessionId },
        update: {
          agentId,
          messageCount: chatSessionData.messages?.length || 0,
          totalTokens: chatSessionData.totalTokens || 0,
          lastMessageAt: new Date(),
        },
        create: {
          sessionId: chatSessionData.sessionId,
          userId: chatSessionData.userId,
          agentId,
          name: chatSessionData.name || 'Chat Session',
          messageCount: chatSessionData.messages?.length || 0,
          totalTokens: chatSessionData.totalTokens || 0,
          context: chatSessionData.context || {},
        },
      });
      
      console.log(`✅ Synced chat session for agent ${agentId}:`, session.id);
      return session.id;

    } catch (error) {
      console.error(`❌ Error syncing chat session for ${agentId}:`, error);
      return null;
    }
  }

  /**
   * Sync user interaction to agent's data
   * Uses UserEvent or AnalyticsEvent tables
   */
  async syncUserInteraction(agentId, interactionData) {
    try {
      const event = await prisma.analyticsEvent.create({
        data: {
          visitorId: interactionData.visitorId || 'system',
          sessionId: interactionData.sessionId || 'system',
          userId: interactionData.userId,
          eventName: 'agent_interaction',
          eventData: {
            agentId,
            interactionType: interactionData.type,
            messageContent: interactionData.userMessage?.substring(0, 500),
            aiResponsePreview: interactionData.aiResponse?.substring(0, 500),
            tokensUsed: interactionData.tokens || 0,
            responseTime: interactionData.responseTime || 0,
            ...interactionData.metadata,
          },
          timestamp: new Date(),
        },
      });

      console.log(`✅ Synced interaction for agent ${agentId}:`, event.id);
      return event.id;

    } catch (error) {
      console.error(`❌ Error syncing interaction for ${agentId}:`, error);
      return null;
    }
  }

  /**
   * Sync subscription event to agent's data
   * Uses Transaction or AgentSubscription tables
   */
  async syncSubscriptionEvent(agentId, subscriptionData) {
    try {
      // Log subscription event as analytics
      const event = await prisma.analyticsEvent.create({
        data: {
          visitorId: subscriptionData.visitorId || 'system',
          sessionId: subscriptionData.sessionId || 'system',
          userId: subscriptionData.userId,
          eventName: 'subscription_event',
          eventData: {
            agentId,
            eventType: subscriptionData.eventType, // 'created', 'renewed', 'cancelled', 'expired'
            plan: subscriptionData.plan,
            price: subscriptionData.price,
            subscriptionId: subscriptionData.subscriptionId,
            stripeId: subscriptionData.stripeSubscriptionId,
            ...subscriptionData.metadata,
          },
          timestamp: new Date(),
        },
      });

      console.log(`✅ Synced subscription event for agent ${agentId}:`, event.id);
      return event.id;

    } catch (error) {
      console.error(`❌ Error syncing subscription event for ${agentId}:`, error);
      return null;
    }
  }

  /**
   * Get agent analytics summary
   */
  async getAgentAnalytics(agentId, startDate, endDate) {
    try {
      const dateFilter = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);

      const [
        chatSessions,
        subscriptions,
        interactions,
      ] = await Promise.all([
        // Total chat sessions for this agent
        prisma.chatSession.count({
          where: {
            agentId,
            ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
          },
        }),
        // Active subscriptions for this agent
        prisma.agentSubscription.count({
          where: {
            agentId,
            status: 'active',
          },
        }),
        // Interactions (from analytics events)
        prisma.analyticsEvent.count({
          where: {
            eventName: 'agent_interaction',
            eventData: { path: ['agentId'], equals: agentId },
            ...(Object.keys(dateFilter).length ? { timestamp: dateFilter } : {}),
          },
        }),
      ]);

      return {
        agentId,
        totalChatSessions: chatSessions,
        activeSubscriptions: subscriptions,
        totalInteractions: interactions,
        period: {
          start: startDate || 'all-time',
          end: endDate || 'now',
        },
      };

    } catch (error) {
      console.error(`❌ Error getting analytics for ${agentId}:`, error);
      return null;
    }
  }

  /**
   * Get recent activity for an agent
   */
  async getAgentRecentActivity(agentId, limit = 10) {
    try {
      const recentSessions = await prisma.chatSession.findMany({
        where: { agentId },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        select: {
          id: true,
          sessionId: true,
          userId: true,
          name: true,
          messageCount: true,
          updatedAt: true,
        },
      });

      return recentSessions;

    } catch (error) {
      console.error(`❌ Error getting recent activity for ${agentId}:`, error);
      return [];
    }
  }
}

// Create singleton instance
const agentCollectionHub = new AgentCollectionHub();

export default agentCollectionHub;
export { AgentCollectionHub };
