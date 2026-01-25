/**
 * METRICS TRACKER
 * Real-time metrics tracking service for Maula AI
 */

import { prisma } from './prisma.js';

/**
 * Metrics Tracker Service
 * Handles real-time metrics collection and retrieval
 */
export const metricsTracker = {
  /**
   * Initialize database indexes for metrics
   */
  async initializeIndexes() {
    try {
      // Indexes are defined in schema.prisma
      console.log('Metrics tracker indexes initialized');
    } catch (error) {
      console.error('Failed to initialize metrics indexes:', error);
    }
  },

  /**
   * Track user session activity
   */
  async trackSession(sessionId, data) {
    try {
      const session = await prisma.session.upsert({
        where: { sessionId },
        update: {
          lastActivity: new Date(),
          pageViews: { increment: data.pageViews || 0 },
          events: { increment: data.events || 0 },
          duration: data.duration || 0,
          isActive: true
        },
        create: {
          sessionId,
          visitorId: data.visitorId,
          userId: data.userId,
          pageViews: data.pageViews || 0,
          events: data.events || 0,
          duration: data.duration || 0
        }
      });
      return session;
    } catch (error) {
      console.error('Failed to track session:', error);
    }
  },

  /**
   * Track API request metrics
   */
  async trackApiRequest(endpoint, method, responseTime, statusCode, userId, sessionId) {
    try {
      await prisma.analyticsEvent.create({
        data: {
          visitorId: sessionId,
          sessionId,
          userId,
          eventName: 'api_request',
          eventData: {
            endpoint,
            method,
            responseTime,
            statusCode
          }
        }
      });
    } catch (error) {
      console.error('Failed to track API request:', error);
    }
  },

  /**
   * Track agent request metrics
   */
  async trackAgentRequest(agentName, sessionId, responseTime, success) {
    try {
      await prisma.analyticsEvent.create({
        data: {
          visitorId: sessionId,
          sessionId,
          eventName: 'agent_request',
          eventData: {
            agentName,
            responseTime,
            success
          }
        }
      });
    } catch (error) {
      console.error('Failed to track agent request:', error);
    }
  },

  /**
   * Get active users count
   */
  async getActiveUsers() {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const activeUsers = await prisma.session.count({
        where: {
          lastActivity: {
            gte: fiveMinutesAgo
          },
          isActive: true
        }
      });
      return activeUsers;
    } catch (error) {
      console.error('Failed to get active users:', error);
      return 0;
    }
  },

  /**
   * Get agent performance metrics
   */
  async getAgentMetrics() {
    try {
      const agentEvents = await prisma.analyticsEvent.findMany({
        where: {
          eventName: 'agent_request',
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      // Group by agent name
      const agentStats = {};
      agentEvents.forEach(event => {
        const agentName = event.eventData?.agentName;
        if (!agentName) return;

        if (!agentStats[agentName]) {
          agentStats[agentName] = {
            agentName,
            totalRequests: 0,
            successCount: 0,
            errorCount: 0,
            avgResponseTime: 0,
            activeUsers: 0
          };
        }

        agentStats[agentName].totalRequests++;
        if (event.eventData?.success) {
          agentStats[agentName].successCount++;
        } else {
          agentStats[agentName].errorCount++;
        }

        // Calculate average response time
        const currentAvg = agentStats[agentName].avgResponseTime;
        const newTime = event.eventData?.responseTime || 0;
        agentStats[agentName].avgResponseTime = (currentAvg + newTime) / 2;
      });

      return Object.values(agentStats);
    } catch (error) {
      console.error('Failed to get agent metrics:', error);
      return [];
    }
  },

  /**
   * Get API statistics
   */
  async getApiStats() {
    try {
      const apiEvents = await prisma.analyticsEvent.findMany({
        where: {
          eventName: 'api_request',
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      const totalRequests = apiEvents.length;
      const successfulRequests = apiEvents.filter(e => e.eventData?.statusCode < 400).length;
      const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 100;

      const avgResponseTime = apiEvents.reduce((sum, e) => sum + (e.eventData?.responseTime || 0), 0) / totalRequests || 0;

      return {
        totalRequests,
        successfulRequests,
        successRate,
        avgResponseTime
      };
    } catch (error) {
      console.error('Failed to get API stats:', error);
      return {
        totalRequests: 0,
        successfulRequests: 0,
        successRate: 100,
        avgResponseTime: 0
      };
    }
  },

  /**
   * Get historical data (last 7 days)
   */
  async getHistoricalData() {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const historicalData = await prisma.analyticsEvent.findMany({
        where: {
          timestamp: {
            gte: sevenDaysAgo
          }
        },
        orderBy: {
          timestamp: 'asc'
        }
      });

      // Group by date
      const dailyStats = {};
      historicalData.forEach(event => {
        const date = event.timestamp.toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = {
            date,
            apiRequests: 0,
            agentRequests: 0,
            activeUsers: 0
          };
        }

        if (event.eventName === 'api_request') {
          dailyStats[date].apiRequests++;
        } else if (event.eventName === 'agent_request') {
          dailyStats[date].agentRequests++;
        }
      });

      return Object.values(dailyStats);
    } catch (error) {
      console.error('Failed to get historical data:', error);
      return [];
    }
  },

  /**
   * Get hourly metrics (last 24 hours)
   */
  async getHourlyMetrics() {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const hourlyData = await prisma.analyticsEvent.findMany({
        where: {
          timestamp: {
            gte: twentyFourHoursAgo
          }
        },
        orderBy: {
          timestamp: 'asc'
        }
      });

      // Group by hour
      const hourlyStats = {};
      hourlyData.forEach(event => {
        const hour = new Date(event.timestamp);
        hour.setMinutes(0, 0, 0);
        const hourKey = hour.toISOString();

        if (!hourlyStats[hourKey]) {
          hourlyStats[hourKey] = {
            hour: hourKey,
            apiRequests: 0,
            agentRequests: 0
          };
        }

        if (event.eventName === 'api_request') {
          hourlyStats[hourKey].apiRequests++;
        } else if (event.eventName === 'agent_request') {
          hourlyStats[hourKey].agentRequests++;
        }
      });

      return Object.values(hourlyStats);
    } catch (error) {
      console.error('Failed to get hourly metrics:', error);
      return [];
    }
  },

  /**
   * Clean up inactive sessions
   */
  async cleanupSessions() {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      const result = await prisma.session.updateMany({
        where: {
          lastActivity: {
            lt: thirtyMinutesAgo
          },
          isActive: true
        },
        data: {
          isActive: false
        }
      });

      console.log(`Cleaned up ${result.count} inactive sessions`);
      return result.count;
    } catch (error) {
      console.error('Failed to cleanup sessions:', error);
      return 0;
    }
  },

  /**
   * Update daily metrics (could be used for aggregations)
   */
  async updateDailyMetrics() {
    try {
      // This could be used to create daily summary tables
      // For now, just log that it's running
      console.log('Daily metrics update completed');
    } catch (error) {
      console.error('Failed to update daily metrics:', error);
    }
  }
};