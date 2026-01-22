/**
 * Real-time Metrics Tracker
 * Tracks user sessions, agent usage, and API metrics using Prisma/PostgreSQL
 */

import { prisma } from './prisma.js';

interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  currentAgent?: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

interface AgentMetric {
  agentName: string;
  requestCount: number;
  activeUsers: number;
  totalResponseTime: number;
  avgResponseTime: number;
  successCount: number;
  errorCount: number;
  lastUpdated: Date;
}

interface ApiMetric {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  error?: string;
}

interface HourlyMetric {
  hour: Date;
  totalRequests: number;
  uniqueUsers: number;
  avgResponseTime: number;
  errorRate: number;
}

export class MetricsTracker {
  private static instance: MetricsTracker;
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes

  private constructor() {}

  static getInstance(): MetricsTracker {
    if (!MetricsTracker.instance) {
      MetricsTracker.instance = new MetricsTracker();
    }
    return MetricsTracker.instance;
  }

  /**
   * Track a new user session or update existing one
   */
  async trackSession(sessionId: string, data: Partial<UserSession>): Promise<void> {
    try {
      const now = new Date();

      await prisma.analyticsEvent.create({
        data: {
          eventName: 'user_session',
          visitorId: data.userId || 'anonymous',
          sessionId,
          userId: data.userId,
          eventData: {
            currentAgent: data.currentAgent,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            isActive: true,
          },
          timestamp: now,
        },
      });
    } catch (error) {
      console.error('Error tracking session:', error);
    }
  }

  /**
   * Track agent usage
   */
  async trackAgentRequest(
    agentName: string,
    sessionId: string,
    responseTime: number,
    success: boolean
  ): Promise<void> {
    try {
      const now = new Date();

      // Track as analytics event
      await prisma.analyticsEvent.create({
        data: {
          eventName: 'agent_request',
          visitorId: sessionId,
          sessionId,
          eventData: {
            agentName,
            responseTime,
            success,
            date: this.getDateKey(now),
          },
          timestamp: now,
        },
      });

      // Update session with current agent
      await this.trackSession(sessionId, { currentAgent: agentName });
    } catch (error) {
      console.error('Error tracking agent request:', error);
    }
  }

  /**
   * Track API endpoint usage
   */
  async trackApiRequest(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    error?: string
  ): Promise<void> {
    try {
      const now = new Date();

      await prisma.analyticsEvent.create({
        data: {
          eventName: 'api_request',
          visitorId: 'system',
          sessionId: 'system',
          eventData: {
            endpoint,
            method,
            statusCode,
            responseTime,
            error,
          },
          timestamp: now,
        },
      });

      // Also update hourly aggregates
      await this.updateHourlyMetrics(now, responseTime, statusCode >= 400);
    } catch (error) {
      console.error('Error tracking API request:', error);
    }
  }

  /**
   * Get active user count
   */
  async getActiveUsers(): Promise<number> {
    try {
      const cutoff = new Date(Date.now() - this.sessionTimeout);

      const count = await prisma.analyticsEvent.count({
        where: {
          eventName: 'user_session',
          timestamp: { gte: cutoff },
        },
      });

      return count;
    } catch (error) {
      console.error('Error getting active users:', error);
      return 0;
    }
  }

  /**
   * Get agent metrics
   */
  async getAgentMetrics(): Promise<AgentMetric[]> {
    try {
      const today = this.getDateKey(new Date());
      const startOfDay = new Date(today);

      const events = await prisma.analyticsEvent.findMany({
        where: {
          eventName: 'agent_request',
          timestamp: { gte: startOfDay },
        },
      });

      // Aggregate by agent name
      const metricsMap = new Map<string, AgentMetric>();

      for (const event of events) {
        const data = event.eventData as any;
        const agentName = data?.agentName || 'unknown';

        if (!metricsMap.has(agentName)) {
          metricsMap.set(agentName, {
            agentName,
            requestCount: 0,
            activeUsers: 0,
            totalResponseTime: 0,
            avgResponseTime: 0,
            successCount: 0,
            errorCount: 0,
            lastUpdated: event.timestamp,
          });
        }

        const metric = metricsMap.get(agentName)!;
        metric.requestCount++;
        metric.totalResponseTime += data?.responseTime || 0;
        if (data?.success) {
          metric.successCount++;
        } else {
          metric.errorCount++;
        }
        metric.lastUpdated = event.timestamp;
      }

      // Calculate averages
      return Array.from(metricsMap.values()).map((m) => ({
        ...m,
        avgResponseTime: m.requestCount > 0 ? Math.round(m.totalResponseTime / m.requestCount) : 0,
      }));
    } catch (error) {
      console.error('Error getting agent metrics:', error);
      return [];
    }
  }

  /**
   * Get API usage statistics
   */
  async getApiStats(timeRange: number = 24 * 60 * 60 * 1000): Promise<any> {
    try {
      const cutoff = new Date(Date.now() - timeRange);

      const events = await prisma.analyticsEvent.findMany({
        where: {
          eventName: 'api_request',
          timestamp: { gte: cutoff },
        },
      });

      if (events.length === 0) {
        return {
          totalRequests: 0,
          avgResponseTime: 0,
          errorRate: 0,
          successRate: 100,
        };
      }

      let totalResponseTime = 0;
      let errorCount = 0;

      for (const event of events) {
        const data = event.eventData as any;
        totalResponseTime += data?.responseTime || 0;
        if (data?.statusCode >= 400) {
          errorCount++;
        }
      }

      const errorRate = events.length > 0 ? (errorCount / events.length) * 100 : 0;

      return {
        totalRequests: events.length,
        avgResponseTime: Math.round(totalResponseTime / events.length),
        errorRate: Math.round(errorRate * 10) / 10,
        successRate: Math.round((100 - errorRate) * 10) / 10,
      };
    } catch (error) {
      console.error('Error getting API stats:', error);
      return { totalRequests: 0, avgResponseTime: 0, errorRate: 0, successRate: 100 };
    }
  }

  /**
   * Get hourly metrics for the last 24 hours
   */
  async getHourlyMetrics(): Promise<HourlyMetric[]> {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const events = await prisma.analyticsEvent.findMany({
        where: {
          eventName: 'hourly_metrics',
          timestamp: { gte: last24Hours },
        },
        orderBy: { timestamp: 'asc' },
      });

      return events.map((e) => {
        const data = e.eventData as any;
        return {
          hour: e.timestamp,
          totalRequests: data?.totalRequests || 0,
          uniqueUsers: data?.uniqueUsers || 0,
          avgResponseTime: data?.avgResponseTime || 0,
          errorRate: data?.errorRate || 0,
        };
      });
    } catch (error) {
      console.error('Error getting hourly metrics:', error);
      return [];
    }
  }

  /**
   * Get historical data for the last 7 days
   */
  async getHistoricalData(): Promise<any[]> {
    try {
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const events = await prisma.analyticsEvent.findMany({
        where: {
          eventName: 'daily_metrics',
          timestamp: { gte: last7Days },
        },
        orderBy: { timestamp: 'asc' },
      });

      return events.map((e) => {
        const data = e.eventData as any;
        return {
          date: e.timestamp.toISOString(),
          uptime: data?.uptime || 99.9,
          requests: data?.totalRequests || 0,
          avgResponseTime: data?.avgResponseTime || 0,
        };
      });
    } catch (error) {
      console.error('Error getting historical data:', error);
      return [];
    }
  }

  /**
   * Clean up old inactive sessions (no-op for event-based tracking)
   */
  async cleanupSessions(): Promise<void> {
    // Event-based tracking doesn't need cleanup
    // Historical data is retained for analytics
  }

  /**
   * Update hourly metrics aggregate
   */
  private async updateHourlyMetrics(
    timestamp: Date,
    responseTime: number,
    isError: boolean
  ): Promise<void> {
    try {
      const hourKey = new Date(timestamp);
      hourKey.setMinutes(0, 0, 0);

      // Store as an event - aggregation happens on read
      await prisma.analyticsEvent.create({
        data: {
          eventName: 'hourly_metric_point',
          visitorId: 'system',
          sessionId: 'system',
          eventData: {
            hourKey: hourKey.toISOString(),
            responseTime,
            isError,
          },
          timestamp,
        },
      });
    } catch (error) {
      console.error('Error updating hourly metrics:', error);
    }
  }

  /**
   * Update daily metrics aggregate
   */
  async updateDailyMetrics(): Promise<void> {
    try {
      const today = this.getDateKey(new Date());
      const stats = await this.getApiStats(24 * 60 * 60 * 1000);

      await prisma.analyticsEvent.create({
        data: {
          eventName: 'daily_metrics',
          visitorId: 'system',
          sessionId: 'system',
          eventData: {
            date: today,
            totalRequests: stats.totalRequests,
            avgResponseTime: stats.avgResponseTime,
            errorRate: stats.errorRate,
            uptime: stats.successRate,
          },
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating daily metrics:', error);
    }
  }

  /**
   * Get date key for grouping (YYYY-MM-DD)
   */
  private getDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Initialize database indexes (handled by Prisma schema)
   */
  async initializeIndexes(): Promise<void> {
    // Indexes are defined in the Prisma schema
    console.log('✅ Metrics indexes managed by Prisma schema');
  }
}

// Export singleton instance
export const metricsTracker = MetricsTracker.getInstance();
