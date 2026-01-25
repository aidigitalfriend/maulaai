/**
 * Advanced Analytics Route
 * Provides real-time analytics data from the database
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/analytics/advanced
 * Returns comprehensive analytics data from the database
 */
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Fetch API Usage data for last 7 days
    const apiUsageRecent = await prisma.apiUsage.findMany({
      where: {
        timestamp: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Fetch API Usage for previous 7 days (for comparison)
    const apiUsagePrevious = await prisma.apiUsage.findMany({
      where: {
        timestamp: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo,
        },
      },
    });

    // Fetch Chat Interactions for model usage
    const chatInteractions = await prisma.chatAnalyticsInteraction.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        agent: {
          select: {
            name: true,
            modelId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch Tool Usage data
    const toolUsage = await prisma.toolUsage.findMany({
      where: {
        occurredAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Fetch Analytics Events
    const analyticsEvents = await prisma.analyticsEvent.findMany({
      where: {
        timestamp: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Fetch User Events
    const userEvents = await prisma.userEvent.findMany({
      where: {
        occurredAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Calculate stats
    const totalRequests = apiUsageRecent.length;
    const previousTotalRequests = apiUsagePrevious.length;
    const requestChange = previousTotalRequests > 0 
      ? Math.round(((totalRequests - previousTotalRequests) / previousTotalRequests) * 100)
      : 0;

    const avgLatency = apiUsageRecent.length > 0
      ? Math.round(apiUsageRecent.reduce((sum, r) => sum + (r.responseTime || 0), 0) / apiUsageRecent.length)
      : 0;

    const previousAvgLatency = apiUsagePrevious.length > 0
      ? apiUsagePrevious.reduce((sum, r) => sum + (r.responseTime || 0), 0) / apiUsagePrevious.length
      : 0;

    const latencyChange = previousAvgLatency > 0
      ? Math.round(((avgLatency - previousAvgLatency) / previousAvgLatency) * 100)
      : 0;

    const successfulRequests = apiUsageRecent.filter(r => r.statusCode >= 200 && r.statusCode < 400).length;
    const avgSuccessRate = totalRequests > 0
      ? Math.round((successfulRequests / totalRequests) * 10000) / 100
      : 0;

    const previousSuccessful = apiUsagePrevious.filter(r => r.statusCode >= 200 && r.statusCode < 400).length;
    const previousSuccessRate = apiUsagePrevious.length > 0
      ? (previousSuccessful / apiUsagePrevious.length) * 100
      : 0;

    const successChange = previousSuccessRate > 0
      ? Math.round((avgSuccessRate - previousSuccessRate) * 100) / 100
      : 0;

    // Calculate total tokens from chat interactions
    const totalTokens = chatInteractions.reduce((sum, c) => sum + (c.totalTokens || 0), 0);

    // Calculate average response time as proxy for response size (no responseSize field)
    const avgResponseSize = apiUsageRecent.length > 0
      ? Math.round(apiUsageRecent.reduce((sum, r) => sum + (r.responseTime || 0), 0) / apiUsageRecent.length)
      : 0;

    // Get unique active users (now renamed to active agents for clarity)
    const uniqueUserIds = new Set([
      ...apiUsageRecent.filter(r => r.userId).map(r => r.userId),
      ...chatInteractions.filter(c => c.userId).map(c => c.userId),
    ]);
    
    // Also count unique agents
    const uniqueAgentIds = new Set([
      ...chatInteractions.filter(c => c.agentId).map(c => c.agentId),
    ]);
    const activeUsers = uniqueUserIds.size;
    const activeAgents = uniqueAgentIds.size;

    // Calculate estimated cost (based on tokens and API calls)
    const estimatedCost = (totalTokens * 0.00003) + (totalRequests * 0.001);

    // Group API metrics by endpoint
    const endpointGroups = apiUsageRecent.reduce((acc, r) => {
      const endpoint = r.endpoint || 'unknown';
      if (!acc[endpoint]) {
        acc[endpoint] = { requests: 0, totalLatency: 0, successful: 0 };
      }
      acc[endpoint].requests++;
      acc[endpoint].totalLatency += r.responseTime || 0;
      if (r.statusCode >= 200 && r.statusCode < 400) {
        acc[endpoint].successful++;
      }
      return acc;
    }, {});

    const apiMetrics = Object.entries(endpointGroups)
      .map(([endpoint, data]) => ({
        endpoint,
        requests: data.requests,
        latency: Math.round(data.totalLatency / data.requests),
        successRate: Math.round((data.successful / data.requests) * 10000) / 100,
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    // Group by model for model usage (use agent's modelId or agent name)
    const modelGroups = chatInteractions.reduce((acc, c) => {
      // Use agent's model ID, or agent name, or 'unknown'
      const model = c.agent?.modelId || c.agent?.name || c.agentId || 'unknown';
      if (!acc[model]) {
        acc[model] = { requests: 0, tokens: 0 };
      }
      acc[model].requests++;
      acc[model].tokens += c.totalTokens || 0;
      return acc;
    }, {});

    const modelUsage = Object.entries(modelGroups)
      .map(([model, data]) => ({
        model,
        requests: data.requests,
        tokens: data.tokens,
      }))
      .sort((a, b) => b.requests - a.requests);

    // Calculate success/failure breakdown
    const successCount = apiUsageRecent.filter(r => r.statusCode >= 200 && r.statusCode < 400).length;
    const clientErrors = apiUsageRecent.filter(r => r.statusCode >= 400 && r.statusCode < 500).length;
    const serverErrors = apiUsageRecent.filter(r => r.statusCode >= 500).length;

    const successFailure = [
      { name: 'Success', value: successCount },
      { name: 'Client Errors', value: clientErrors },
      { name: 'Server Errors', value: serverErrors },
    ];

    // Calculate peak traffic by hour (last 24 hours)
    const hourlyTraffic = {};
    for (let i = 0; i < 24; i++) {
      hourlyTraffic[i] = 0;
    }

    const last24Hours = apiUsageRecent.filter(r => 
      new Date(r.timestamp).getTime() > oneDayAgo.getTime()
    );

    last24Hours.forEach(r => {
      const hour = new Date(r.timestamp).getHours();
      hourlyTraffic[hour]++;
    });

    const peakTraffic = Object.entries(hourlyTraffic)
      .map(([hour, requests]) => ({
        hour: parseInt(hour),
        requests,
      }))
      .sort((a, b) => a.hour - b.hour);

    // Error breakdown
    const errorGroups = {};
    apiUsageRecent
      .filter(r => r.statusCode >= 400)
      .forEach(r => {
        let errorType = 'Unknown Error';
        if (r.statusCode === 429) errorType = 'Rate Limit';
        else if (r.statusCode === 401 || r.statusCode === 403) errorType = 'Auth Failed';
        else if (r.statusCode === 408 || r.statusCode === 504) errorType = 'Timeout';
        else if (r.statusCode === 400) errorType = 'Bad Request';
        else if (r.statusCode === 404) errorType = 'Not Found';
        else if (r.statusCode >= 500) errorType = 'Server Error';

        if (!errorGroups[errorType]) {
          errorGroups[errorType] = { count: 0, lastOccurred: r.timestamp };
        }
        errorGroups[errorType].count++;
        if (new Date(r.timestamp) > new Date(errorGroups[errorType].lastOccurred)) {
          errorGroups[errorType].lastOccurred = r.timestamp;
        }
      });

    const errors = Object.entries(errorGroups)
      .map(([type, data]) => ({
        type,
        count: data.count,
        lastOccurred: data.lastOccurred,
      }))
      .sort((a, b) => b.count - a.count);

    // Geographic distribution - use IP address prefix as region proxy (no country field)
    // Group by user agent to show client distribution instead
    const geoGroups = {};
    apiUsageRecent.forEach(r => {
      // Parse user agent for browser/client type as a proxy for geographic data
      let client = 'Unknown';
      const ua = r.userAgent || '';
      if (ua.includes('Chrome')) client = 'Chrome';
      else if (ua.includes('Safari')) client = 'Safari';
      else if (ua.includes('Firefox')) client = 'Firefox';
      else if (ua.includes('Edge')) client = 'Edge';
      else if (ua.includes('curl')) client = 'API/CLI';
      else if (ua.includes('Postman')) client = 'Postman';
      else if (ua.includes('node')) client = 'Node.js';
      else if (ua) client = 'Other';
      
      if (!geoGroups[client]) {
        geoGroups[client] = { requests: 0, totalLatency: 0 };
      }
      geoGroups[client].requests++;
      geoGroups[client].totalLatency += r.responseTime || 0;
    });

    const geographic = Object.entries(geoGroups)
      .map(([country, data]) => ({
        country, // This is actually client type, but keeping field name for frontend compatibility
        requests: data.requests,
        latency: Math.round(data.totalLatency / data.requests),
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    // Token trend by day (last 7 days)
    const dailyTokens = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dailyTokens[date.toISOString().split('T')[0]] = 0;
    }

    chatInteractions.forEach(c => {
      const date = new Date(c.createdAt).toISOString().split('T')[0];
      if (dailyTokens[date] !== undefined) {
        dailyTokens[date] += c.totalTokens || 0;
      }
    });

    const tokenTrend = Object.entries(dailyTokens)
      .map(([date, tokens]) => ({
        date,
        tokens,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Cost data by day (estimated)
    const costData = tokenTrend.map(t => ({
      date: t.date,
      cost: Math.round((t.tokens * 0.00003) * 100) / 100,
    }));

    // Endpoint stats with more detail
    const endpointStats = Object.entries(endpointGroups)
      .map(([endpoint, data]) => ({
        endpoint,
        requests: data.requests,
        avgLatency: Math.round(data.totalLatency / data.requests),
        successRate: Math.round((data.successful / data.requests) * 10000) / 100,
        errorCount: data.requests - data.successful,
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 15);

    // Recent requests (last 20)
    const recentRequests = apiUsageRecent.slice(0, 20).map(r => ({
      id: r.id,
      endpoint: r.endpoint,
      method: r.method,
      statusCode: r.statusCode,
      responseTime: r.responseTime,
      timestamp: r.timestamp,
      userId: r.userId,
    }));

    res.json({
      stats: {
        totalRequests,
        requestChange,
        avgLatency,
        latencyChange,
        avgSuccessRate,
        successChange,
        totalCost: Math.round(estimatedCost * 100) / 100,
        avgResponseSize,
        totalTokens,
        activeUsers,
        activeAgents,
      },
      apiMetrics,
      modelUsage,
      successFailure,
      peakTraffic,
      errors,
      geographic,
      costData,
      tokenTrend,
      endpointStats,
      recentRequests,
      lastUpdated: now.toISOString(),
    });
  } catch (error) {
    console.error('Advanced analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics data',
      message: error.message,
    });
  }
});

export default router;
