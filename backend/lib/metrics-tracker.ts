/**
 * Real-time Metrics Tracker
 * Tracks user sessions, agent usage, and API metrics in MongoDB
 */

import { MongoClient, Db } from 'mongodb'

// MongoDB connection helper
async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  const client = new MongoClient(uri)
  await client.connect()
  return client.db('aiAgent')
}

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

interface ApiMetric {
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

  private constructor() {}

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
      const db = await getDb()
      const now = new Date()

      // Remove sessionId from data to avoid conflict with $setOnInsert
      const { sessionId: _omit, ...dataWithoutSessionId } = data as any

      await db.collection('user_sessions').updateOne(
        { sessionId },
        {
          $set: {
            ...dataWithoutSessionId,
            lastActivity: now,
            isActive: true,
          },
          $setOnInsert: {
            sessionId,
            startTime: now,
          },
        },
        { upsert: true }
      )
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
      const db = await getDb()
      const now = new Date()

      // Update agent metrics
      await db.collection('agent_metrics').updateOne(
        { agentName, date: this.getDateKey(now) },
        {
          $inc: {
            requestCount: 1,
            totalResponseTime: responseTime,
            successCount: success ? 1 : 0,
            errorCount: success ? 0 : 1,
          },
          $set: {
            lastUpdated: now,
          },
          $addToSet: {
            activeSessions: sessionId,
          },
        },
        { upsert: true }
      )

      // Update session with current agent
      await this.trackSession(sessionId, { currentAgent: agentName })
    } catch (error) {
      console.error('Error tracking agent request:', error)
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
      const db = await getDb()
      const now = new Date()

      await db.collection('api_metrics').insertOne({
        endpoint,
        method,
        statusCode,
        responseTime,
        timestamp: now,
        error,
      })

      // Also update hourly aggregates
      await this.updateHourlyMetrics(now, responseTime, statusCode >= 400)
    } catch (error) {
      console.error('Error tracking API request:', error)
    }
  }

  /**
   * Get active user count
   */
  async getActiveUsers(): Promise<number> {
    try {
      const db = await getDb()
      const cutoff = new Date(Date.now() - this.sessionTimeout)

      const count = await db.collection('user_sessions').countDocuments({
        lastActivity: { $gte: cutoff },
        isActive: true,
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
      const db = await getDb()
      const today = this.getDateKey(new Date())

      const metrics = await db
        .collection('agent_metrics')
        .find({ date: today })
        .toArray()

      return metrics.map((m: any) => ({
        agentName: m.agentName,
        requestCount: m.requestCount || 0,
        activeUsers: m.activeSessions?.length || 0,
        totalResponseTime: m.totalResponseTime || 0,
        avgResponseTime: m.requestCount > 0 ? Math.round(m.totalResponseTime / m.requestCount) : 0,
        successCount: m.successCount || 0,
        errorCount: m.errorCount || 0,
        lastUpdated: m.lastUpdated,
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
      const db = await getDb()
      const cutoff = new Date(Date.now() - timeRange)

      const stats = await db
        .collection('api_metrics')
        .aggregate([
          { $match: { timestamp: { $gte: cutoff } } },
          {
            $group: {
              _id: null,
              totalRequests: { $sum: 1 },
              avgResponseTime: { $avg: '$responseTime' },
              errorCount: {
                $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] },
              },
            },
          },
        ])
        .toArray()

      if (stats.length === 0) {
        return {
          totalRequests: 0,
          avgResponseTime: 0,
          errorRate: 0,
          successRate: 100,
        }
      }

      const result = stats[0]
      const errorRate = result.totalRequests > 0 ? (result.errorCount / result.totalRequests) * 100 : 0

      return {
        totalRequests: result.totalRequests,
        avgResponseTime: Math.round(result.avgResponseTime || 0),
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
      const db = await getDb()
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)

      const metrics = await db
        .collection('hourly_metrics')
        .find({ hour: { $gte: last24Hours } })
        .sort({ hour: 1 })
        .toArray()

      return metrics as any[]
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
      const db = await getDb()
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      const data = await db
        .collection('daily_metrics')
        .find({ date: { $gte: last7Days } })
        .sort({ date: 1 })
        .toArray()

      return data.map((d: any) => ({
        date: d.date.toISOString(),
        uptime: d.uptime || 99.9,
        requests: d.totalRequests || 0,
        avgResponseTime: d.avgResponseTime || 0,
      }))
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
      const db = await getDb()
      const cutoff = new Date(Date.now() - this.sessionTimeout)

      await db.collection('user_sessions').updateMany(
        {
          lastActivity: { $lt: cutoff },
          isActive: true,
        },
        {
          $set: { isActive: false },
        }
      )
    } catch (error) {
      console.error('Error cleaning up sessions:', error)
    }
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
      const db = await getDb()
      const hourKey = new Date(timestamp)
      hourKey.setMinutes(0, 0, 0)

      await db.collection('hourly_metrics').updateOne(
        { hour: hourKey },
        {
          $inc: {
            totalRequests: 1,
            totalResponseTime: responseTime,
            errorCount: isError ? 1 : 0,
          },
          $set: {
            lastUpdated: timestamp,
          },
        },
        { upsert: true }
      )
    } catch (error) {
      console.error('Error updating hourly metrics:', error)
    }
  }

  /**
   * Update daily metrics aggregate
   */
  async updateDailyMetrics(): Promise<void> {
    try {
      const db = await getDb()
      const today = this.getDateKey(new Date())
      const stats = await this.getApiStats(24 * 60 * 60 * 1000)

      await db.collection('daily_metrics').updateOne(
        { date: new Date(today) },
        {
          $set: {
            totalRequests: stats.totalRequests,
            avgResponseTime: stats.avgResponseTime,
            errorRate: stats.errorRate,
            uptime: stats.successRate,
            lastUpdated: new Date(),
          },
        },
        { upsert: true }
      )
    } catch (error) {
      console.error('Error updating daily metrics:', error)
    }
  }

  /**
   * Get date key for grouping (YYYY-MM-DD)
   */
  private getDateKey(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  /**
   * Initialize database indexes
   */
  async initializeIndexes(): Promise<void> {
    try {
      const db = await getDb()

      // User sessions indexes
      await db.collection('user_sessions').createIndex({ sessionId: 1 }, { unique: true })
      await db.collection('user_sessions').createIndex({ lastActivity: 1 })
      await db.collection('user_sessions').createIndex({ isActive: 1 })

      // Agent metrics indexes
      await db.collection('agent_metrics').createIndex({ agentName: 1, date: 1 }, { unique: true })
      await db.collection('agent_metrics').createIndex({ date: 1 })

      // API metrics indexes
      await db.collection('api_metrics').createIndex({ timestamp: 1 })
      await db.collection('api_metrics').createIndex({ endpoint: 1, timestamp: 1 })

      // Hourly metrics indexes
      await db.collection('hourly_metrics').createIndex({ hour: 1 }, { unique: true })

      // Daily metrics indexes
      await db.collection('daily_metrics').createIndex({ date: 1 }, { unique: true })

      console.log('✅ Metrics indexes initialized')
    } catch (error) {
      console.error('Error initializing indexes:', error)
    }
  }
}

// Export singleton instance
export const metricsTracker = MetricsTracker.getInstance()
