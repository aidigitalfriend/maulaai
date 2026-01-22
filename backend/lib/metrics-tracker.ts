/**
 * Real-time Metrics Tracker
 * Tracks user sessions, agent usage, and API metrics using PostgreSQL/Prisma
 */

import { prisma } from './prisma.js';

interface UserSession {
  sessionId: string
  userId?: string
  startTime: Date
  lastActivity: Date
  currentAgent?: string
  ipAddress: string
  userAgent: string
  isActive: boolean
}

interface AgentMetric {
  agentName: string
  requestCount: number
  activeUsers: number
  totalResponseTime: number
  avgResponseTime: number
  successCount: number
  errorCount: number
  lastUpdated: Date
}

interface ApiMetricData {
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  timestamp: Date
  error?: string
}

interface HourlyMetric {
  hour: Date
  totalRequests: number
  uniqueUsers: number
  avgResponseTime: number
  errorRate: number
}

export class MetricsTracker {
  private static instance: MetricsTracker
  private sessionTimeout = 30 * 60 * 1000 // 30 minutes

  // In-memory cache for performance (to reduce DB writes)
  private sessionCache = new Map<string, { lastActivity: Date, agentName?: string }>()
  private apiMetricsBuffer: ApiMetricData[] = []
  private flushInterval: NodeJS.Timeout | null = null

  private constructor() {
    // Flush API metrics every 10 seconds
    this.flushInterval = setInterval(() => this.flushApiMetrics(), 10000)
  }

  static getInstance(): MetricsTracker {
    if (!MetricsTracker.instance) {
      MetricsTracker.instance = new MetricsTracker()
    }
    return MetricsTracker.instance
  }

  /**
   * Track a new user session or update existing one
   */
  async trackSession(sessionId: string, data: Partial<UserSession>): Promise<void> {
    try {
      const now = new Date()
      
      // Update in-memory cache
      this.sessionCache.set(sessionId, {
        lastActivity: now,
        agentName: data.currentAgent
      })

      // Upsert session in database
      await prisma.session.upsert({
        where: { sessionId },
        update: {
          lastActivity: now,
          isActive: true,
          userId: data.userId,
        },
        create: {
          sessionId,
          visitorId: data.userId || sessionId, // Use sessionId as visitorId if not available
          userId: data.userId,
          startTime: now,
          lastActivity: now,
          isActive: true,
        },
      })
    } catch (error) {
      console.error('Error tracking session:', error)
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
      const now = new Date()

      // Track as analytics event
      await prisma.analyticsEvent.create({
        data: {
          visitorId: sessionId,
          sessionId,
          eventName: 'agent_request',
          eventData: {
            agentName,
            responseTime,
            success,
          },
          timestamp: now,
        },
      })

      // Update session with current agent
      await this.trackSession(sessionId, { currentAgent: agentName })
    } catch (error) {
      console.error('Error tracking agent request:', error)
    }
  }

  /**
   * Track API endpoint usage (buffered for performance)
   */
  async trackApiRequest(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    error?: string
  ): Promise<void> {
    // Buffer API metrics for batch insert
    this.apiMetricsBuffer.push({
      endpoint,
      method,
      statusCode,
      responseTime,
      timestamp: new Date(),
      error,
    })

    // Flush if buffer is large
    if (this.apiMetricsBuffer.length >= 100) {
      await this.flushApiMetrics()
    }
  }

  /**
   * Flush buffered API metrics to database
   */
  private async flushApiMetrics(): Promise<void> {
    if (this.apiMetricsBuffer.length === 0) return

    const metrics = [...this.apiMetricsBuffer]
    this.apiMetricsBuffer = []

    try {
      await prisma.apiUsage.createMany({
        data: metrics.map(m => ({
          visitorId: 'system',
          sessionId: 'system',
          endpoint: m.endpoint,
          method: m.method,
          statusCode: m.statusCode,
          responseTime: m.responseTime,
          timestamp: m.timestamp,
        })),
      })
    } catch (error) {
      console.error('Error flushing API metrics:', error)
      // Re-add to buffer on failure
      this.apiMetricsBuffer.push(...metrics)
    }
  }

  /**
   * Get active user count
   */
  async getActiveUsers(): Promise<number> {
    try {
      const cutoff = new Date(Date.now() - this.sessionTimeout)

      const count = await prisma.session.count({
        where: {
          lastActivity: { gte: cutoff },
          isActive: true,
        },
      })

      return count
    } catch (error) {
      console.error('Error getting active users:', error)
      return 0
    }
  }

  /**
   * Get agent metrics
   */
  async getAgentMetrics(): Promise<AgentMetric[]> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Get agent request events from today
      const events = await prisma.analyticsEvent.findMany({
        where: {
          eventName: 'agent_request',
          timestamp: { gte: today },
        },
      })

      // Aggregate by agent name
      const agentMap = new Map<string, {
        requestCount: number
        totalResponseTime: number
        successCount: number
        errorCount: number
        sessions: Set<string>
        lastUpdated: Date
      }>()

      for (const event of events) {
        const data = event.eventData as any
        const agentName = data?.agentName || 'unknown'
        
        if (!agentMap.has(agentName)) {
          agentMap.set(agentName, {
            requestCount: 0,
            totalResponseTime: 0,
            successCount: 0,
            errorCount: 0,
            sessions: new Set(),
            lastUpdated: event.timestamp,
          })
        }

        const stats = agentMap.get(agentName)!
        stats.requestCount += 1
        stats.totalResponseTime += data?.responseTime || 0
        stats.successCount += data?.success ? 1 : 0
        stats.errorCount += data?.success ? 0 : 1
        stats.sessions.add(event.sessionId)
        if (event.timestamp > stats.lastUpdated) {
          stats.lastUpdated = event.timestamp
        }
      }

      return Array.from(agentMap.entries()).map(([agentName, stats]) => ({
        agentName,
        requestCount: stats.requestCount,
        activeUsers: stats.sessions.size,
        totalResponseTime: stats.totalResponseTime,
        avgResponseTime: stats.requestCount > 0 ? Math.round(stats.totalResponseTime / stats.requestCount) : 0,
        successCount: stats.successCount,
        errorCount: stats.errorCount,
        lastUpdated: stats.lastUpdated,
      }))
    } catch (error) {
      console.error('Error getting agent metrics:', error)
      return []
    }
  }

  /**
   * Get API usage statistics
   */
  async getApiStats(timeRange: number = 24 * 60 * 60 * 1000): Promise<any> {
    try {
      const cutoff = new Date(Date.now() - timeRange)

      const stats = await prisma.apiUsage.aggregate({
        where: {
          timestamp: { gte: cutoff },
        },
        _count: { id: true },
        _avg: { responseTime: true },
      })

      const errorCount = await prisma.apiUsage.count({
        where: {
          timestamp: { gte: cutoff },
          statusCode: { gte: 400 },
        },
      })

      const totalRequests = stats._count.id || 0
      const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0

      return {
        totalRequests,
        avgResponseTime: Math.round(stats._avg.responseTime || 0),
        errorRate: Math.round(errorRate * 10) / 10,
        successRate: Math.round((100 - errorRate) * 10) / 10,
      }
    } catch (error) {
      console.error('Error getting API stats:', error)
      return { totalRequests: 0, avgResponseTime: 0, errorRate: 0, successRate: 100 }
    }
  }

  /**
   * Get hourly metrics for the last 24 hours
   */
  async getHourlyMetrics(): Promise<HourlyMetric[]> {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)

      // Get raw API usage data
      const apiData = await prisma.apiUsage.findMany({
        where: {
          timestamp: { gte: last24Hours },
        },
        select: {
          timestamp: true,
          responseTime: true,
          statusCode: true,
          visitorId: true,
        },
      })

      // Aggregate by hour
      const hourlyMap = new Map<string, {
        totalRequests: number
        totalResponseTime: number
        errorCount: number
        users: Set<string>
      }>()

      for (const record of apiData) {
        const hourKey = new Date(record.timestamp)
        hourKey.setMinutes(0, 0, 0)
        const key = hourKey.toISOString()

        if (!hourlyMap.has(key)) {
          hourlyMap.set(key, {
            totalRequests: 0,
            totalResponseTime: 0,
            errorCount: 0,
            users: new Set(),
          })
        }

        const stats = hourlyMap.get(key)!
        stats.totalRequests += 1
        stats.totalResponseTime += record.responseTime
        if (record.statusCode >= 400) stats.errorCount += 1
        stats.users.add(record.visitorId)
      }

      // Convert to array
      return Array.from(hourlyMap.entries())
        .map(([hourStr, stats]) => ({
          hour: new Date(hourStr),
          totalRequests: stats.totalRequests,
          uniqueUsers: stats.users.size,
          avgResponseTime: stats.totalRequests > 0 
            ? Math.round(stats.totalResponseTime / stats.totalRequests) 
            : 0,
          errorRate: stats.totalRequests > 0 
            ? Math.round((stats.errorCount / stats.totalRequests) * 100 * 10) / 10 
            : 0,
        }))
        .sort((a, b) => a.hour.getTime() - b.hour.getTime())
    } catch (error) {
      console.error('Error getting hourly metrics:', error)
      return []
    }
  }

  /**
   * Get historical data for the last 7 days
   */
  async getHistoricalData(): Promise<any[]> {
    try {
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      // Get raw API usage data
      const apiData = await prisma.apiUsage.findMany({
        where: {
          timestamp: { gte: last7Days },
        },
        select: {
          timestamp: true,
          responseTime: true,
          statusCode: true,
        },
      })

      // Aggregate by day
      const dailyMap = new Map<string, {
        totalRequests: number
        totalResponseTime: number
        errorCount: number
      }>()

      for (const record of apiData) {
        const dateKey = record.timestamp.toISOString().split('T')[0]

        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, {
            totalRequests: 0,
            totalResponseTime: 0,
            errorCount: 0,
          })
        }

        const stats = dailyMap.get(dateKey)!
        stats.totalRequests += 1
        stats.totalResponseTime += record.responseTime
        if (record.statusCode >= 400) stats.errorCount += 1
      }

      // Convert to array
      return Array.from(dailyMap.entries())
        .map(([date, stats]) => ({
          date: new Date(date).toISOString(),
          uptime: stats.totalRequests > 0 
            ? Math.round((1 - stats.errorCount / stats.totalRequests) * 100 * 10) / 10 
            : 99.9,
          requests: stats.totalRequests,
          avgResponseTime: stats.totalRequests > 0 
            ? Math.round(stats.totalResponseTime / stats.totalRequests) 
            : 0,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } catch (error) {
      console.error('Error getting historical data:', error)
      return []
    }
  }

  /**
   * Clean up old inactive sessions
   */
  async cleanupSessions(): Promise<void> {
    try {
      const cutoff = new Date(Date.now() - this.sessionTimeout)

      await prisma.session.updateMany({
        where: {
          lastActivity: { lt: cutoff },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      })

      // Also clean up old cache entries
      for (const [sessionId, data] of this.sessionCache.entries()) {
        if (data.lastActivity < cutoff) {
          this.sessionCache.delete(sessionId)
        }
      }
    } catch (error) {
      console.error('Error cleaning up sessions:', error)
    }
  }

  /**
   * Update daily metrics aggregate (called by cron job)
   */
  async updateDailyMetrics(): Promise<void> {
    // Stats are calculated on-demand from raw data
    // No need to maintain separate daily_metrics collection
    console.log('Daily metrics calculated on-demand from raw data')
  }

  /**
   * Initialize (no-op for Prisma - indexes are in schema)
   */
  async initializeIndexes(): Promise<void> {
    console.log('✅ Metrics indexes managed by Prisma schema')
  }

  /**
   * Cleanup on shutdown
   */
  async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    await this.flushApiMetrics()
  }
}

// Export singleton instance
export const metricsTracker = MetricsTracker.getInstance()
