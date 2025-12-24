import { MongoClient } from "mongodb";
async function getDb() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  await client.connect();
  return client.db("aiAgent");
}
class MetricsTracker {
  static instance;
  sessionTimeout = 30 * 60 * 1e3;
  // 30 minutes
  constructor() {
  }
  static getInstance() {
    if (!MetricsTracker.instance) {
      MetricsTracker.instance = new MetricsTracker();
    }
    return MetricsTracker.instance;
  }
  /**
   * Track a new user session or update existing one
   */
  async trackSession(sessionId, data) {
    try {
      const db = await getDb();
      const now = /* @__PURE__ */ new Date();
      const { sessionId: _omit, ...dataWithoutSessionId } = data;
      await db.collection("user_sessions").updateOne(
        { sessionId },
        {
          $set: {
            ...dataWithoutSessionId,
            lastActivity: now,
            isActive: true
          },
          $setOnInsert: {
            sessionId,
            startTime: now
          }
        },
        { upsert: true }
      );
    } catch (error) {
      console.error("Error tracking session:", error);
    }
  }
  /**
   * Track agent usage
   */
  async trackAgentRequest(agentName, sessionId, responseTime, success) {
    try {
      const db = await getDb();
      const now = /* @__PURE__ */ new Date();
      await db.collection("agent_metrics").updateOne(
        { agentName, date: this.getDateKey(now) },
        {
          $inc: {
            requestCount: 1,
            totalResponseTime: responseTime,
            successCount: success ? 1 : 0,
            errorCount: success ? 0 : 1
          },
          $set: {
            lastUpdated: now
          },
          $addToSet: {
            activeSessions: sessionId
          }
        },
        { upsert: true }
      );
      await this.trackSession(sessionId, { currentAgent: agentName });
    } catch (error) {
      console.error("Error tracking agent request:", error);
    }
  }
  /**
   * Track API endpoint usage
   */
  async trackApiRequest(endpoint, method, statusCode, responseTime, error) {
    try {
      const db = await getDb();
      const now = /* @__PURE__ */ new Date();
      await db.collection("api_metrics").insertOne({
        endpoint,
        method,
        statusCode,
        responseTime,
        timestamp: now,
        error
      });
      await this.updateHourlyMetrics(now, responseTime, statusCode >= 400);
    } catch (error2) {
      console.error("Error tracking API request:", error2);
    }
  }
  /**
   * Get active user count
   */
  async getActiveUsers() {
    try {
      const db = await getDb();
      const cutoff = new Date(Date.now() - this.sessionTimeout);
      const count = await db.collection("user_sessions").countDocuments({
        lastActivity: { $gte: cutoff },
        isActive: true
      });
      return count;
    } catch (error) {
      console.error("Error getting active users:", error);
      return 0;
    }
  }
  /**
   * Get agent metrics
   */
  async getAgentMetrics() {
    try {
      const db = await getDb();
      const today = this.getDateKey(/* @__PURE__ */ new Date());
      const metrics = await db.collection("agent_metrics").find({ date: today }).toArray();
      return metrics.map((m) => ({
        agentName: m.agentName,
        requestCount: m.requestCount || 0,
        activeUsers: m.activeSessions?.length || 0,
        totalResponseTime: m.totalResponseTime || 0,
        avgResponseTime: m.requestCount > 0 ? Math.round(m.totalResponseTime / m.requestCount) : 0,
        successCount: m.successCount || 0,
        errorCount: m.errorCount || 0,
        lastUpdated: m.lastUpdated
      }));
    } catch (error) {
      console.error("Error getting agent metrics:", error);
      return [];
    }
  }
  /**
   * Get API usage statistics
   */
  async getApiStats(timeRange = 24 * 60 * 60 * 1e3) {
    try {
      const db = await getDb();
      const cutoff = new Date(Date.now() - timeRange);
      const stats = await db.collection("api_metrics").aggregate([
        { $match: { timestamp: { $gte: cutoff } } },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            avgResponseTime: { $avg: "$responseTime" },
            errorCount: {
              $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] }
            }
          }
        }
      ]).toArray();
      if (stats.length === 0) {
        return {
          totalRequests: 0,
          avgResponseTime: 0,
          errorRate: 0,
          successRate: 100
        };
      }
      const result = stats[0];
      const errorRate = result.totalRequests > 0 ? result.errorCount / result.totalRequests * 100 : 0;
      return {
        totalRequests: result.totalRequests,
        avgResponseTime: Math.round(result.avgResponseTime || 0),
        errorRate: Math.round(errorRate * 10) / 10,
        successRate: Math.round((100 - errorRate) * 10) / 10
      };
    } catch (error) {
      console.error("Error getting API stats:", error);
      return { totalRequests: 0, avgResponseTime: 0, errorRate: 0, successRate: 100 };
    }
  }
  /**
   * Get hourly metrics for the last 24 hours
   */
  async getHourlyMetrics() {
    try {
      const db = await getDb();
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1e3);
      const metrics = await db.collection("hourly_metrics").find({ hour: { $gte: last24Hours } }).sort({ hour: 1 }).toArray();
      return metrics;
    } catch (error) {
      console.error("Error getting hourly metrics:", error);
      return [];
    }
  }
  /**
   * Get historical data for the last 7 days
   */
  async getHistoricalData() {
    try {
      const db = await getDb();
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
      const data = await db.collection("daily_metrics").find({ date: { $gte: last7Days } }).sort({ date: 1 }).toArray();
      return data.map((d) => ({
        date: d.date.toISOString(),
        uptime: d.uptime || 99.9,
        requests: d.totalRequests || 0,
        avgResponseTime: d.avgResponseTime || 0
      }));
    } catch (error) {
      console.error("Error getting historical data:", error);
      return [];
    }
  }
  /**
   * Clean up old inactive sessions
   */
  async cleanupSessions() {
    try {
      const db = await getDb();
      const cutoff = new Date(Date.now() - this.sessionTimeout);
      await db.collection("user_sessions").updateMany(
        {
          lastActivity: { $lt: cutoff },
          isActive: true
        },
        {
          $set: { isActive: false }
        }
      );
    } catch (error) {
      console.error("Error cleaning up sessions:", error);
    }
  }
  /**
   * Update hourly metrics aggregate
   */
  async updateHourlyMetrics(timestamp, responseTime, isError) {
    try {
      const db = await getDb();
      const hourKey = new Date(timestamp);
      hourKey.setMinutes(0, 0, 0);
      await db.collection("hourly_metrics").updateOne(
        { hour: hourKey },
        {
          $inc: {
            totalRequests: 1,
            totalResponseTime: responseTime,
            errorCount: isError ? 1 : 0
          },
          $set: {
            lastUpdated: timestamp
          }
        },
        { upsert: true }
      );
    } catch (error) {
      console.error("Error updating hourly metrics:", error);
    }
  }
  /**
   * Update daily metrics aggregate
   */
  async updateDailyMetrics() {
    try {
      const db = await getDb();
      const today = this.getDateKey(/* @__PURE__ */ new Date());
      const stats = await this.getApiStats(24 * 60 * 60 * 1e3);
      await db.collection("daily_metrics").updateOne(
        { date: new Date(today) },
        {
          $set: {
            totalRequests: stats.totalRequests,
            avgResponseTime: stats.avgResponseTime,
            errorRate: stats.errorRate,
            uptime: stats.successRate,
            lastUpdated: /* @__PURE__ */ new Date()
          }
        },
        { upsert: true }
      );
    } catch (error) {
      console.error("Error updating daily metrics:", error);
    }
  }
  /**
   * Get date key for grouping (YYYY-MM-DD)
   */
  getDateKey(date) {
    return date.toISOString().split("T")[0];
  }
  /**
   * Initialize database indexes
   */
  async initializeIndexes() {
    try {
      const db = await getDb();
      await db.collection("user_sessions").createIndex({ sessionId: 1 }, { unique: true });
      await db.collection("user_sessions").createIndex({ lastActivity: 1 });
      await db.collection("user_sessions").createIndex({ isActive: 1 });
      await db.collection("agent_metrics").createIndex({ agentName: 1, date: 1 }, { unique: true });
      await db.collection("agent_metrics").createIndex({ date: 1 });
      await db.collection("api_metrics").createIndex({ timestamp: 1 });
      await db.collection("api_metrics").createIndex({ endpoint: 1, timestamp: 1 });
      await db.collection("hourly_metrics").createIndex({ hour: 1 }, { unique: true });
      await db.collection("daily_metrics").createIndex({ date: 1 }, { unique: true });
      console.log("\u2705 Metrics indexes initialized");
    } catch (error) {
      console.error("Error initializing indexes:", error);
    }
  }
}
const metricsTracker = MetricsTracker.getInstance();
export {
  MetricsTracker,
  metricsTracker
};
