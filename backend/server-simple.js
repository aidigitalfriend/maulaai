/**
 * Simple JavaScript server implementation for testing
 * Real AI service integration for multilingual agents
 */

import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import cors from 'cors';
import helmet from 'helmet';
import os from 'os';
import mongoose from 'mongoose';
import { MongoClient, ObjectId } from 'mongodb';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { getClientPromise } from './lib/mongodb.js';
import {
  initializeTracking,
  trackVisitorMiddleware,
  trackPageViewMiddleware,
} from './lib/tracking-middleware.js';
import analyticsRouter from './routes/analytics.js';
import agentSubscriptionsRouter from './routes/agentSubscriptions.js';
import apiRouter from './routes/api-router.js';
import { rateLimiters, cache } from './lib/cache.js';
import { connectionConfig, indexManager, poolMonitor } from './lib/database.js';
import agentAIService from './lib/agent-ai-provider-service.js';
// Import models to ensure they are registered with Mongoose
import AgentSubscription from './models/AgentSubscription.js';
// Import subscription cron job
import { startSubscriptionExpirationCron } from './services/subscription-cron.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3003',
      'https://maula.ai',
      'https://www.maula.ai',
    ],
    credentials: true,
  },
});
const PORT = process.env.PORT || 3005;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3003',
    'https://maula.ai',
    'https://www.maula.ai',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Tracking middleware - must be after cookieParser
app.use(initializeTracking);
app.use(trackVisitorMiddleware);
app.use(trackPageViewMiddleware);

// ----------------------------
// Lightweight metrics tracker
// ----------------------------
const METRICS_WINDOW_SECONDS = 60;
let perSecondBuckets = new Map(); // key: secondEpoch, value: { count, errors, durationsMs[] }

function recordMetric(statusCode, durationMs) {
  const sec = Math.floor(Date.now() / 1000);
  let bucket = perSecondBuckets.get(sec);
  if (!bucket) {
    bucket = { count: 0, errors: 0, durations: [] };
    perSecondBuckets.set(sec, bucket);
  }
  bucket.count += 1;
  if (statusCode >= 500) bucket.errors += 1;
  bucket.durations.push(durationMs);
  // trim old buckets
  const cutoff = sec - METRICS_WINDOW_SECONDS;
  for (const k of perSecondBuckets.keys()) {
    if (k < cutoff) perSecondBuckets.delete(k);
  }
}

app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1e6;
    recordMetric(res.statusCode, durationMs);
  });
  next();
});

function calcMetricsSnapshot() {
  const nowSec = Math.floor(Date.now() / 1000);
  let total = 0;
  let errors = 0;
  let durations = [];
  for (const [sec, b] of perSecondBuckets) {
    if (sec >= nowSec - METRICS_WINDOW_SECONDS) {
      total += b.count;
      errors += b.errors;
      durations = durations.concat(b.durations);
    }
  }
  const currentBucket = perSecondBuckets.get(nowSec) || { count: 0 };
  const rps = currentBucket.count;
  const avgResponseMs = durations.length
    ? Math.round(durations.reduce((a, v) => a + v, 0) / durations.length)
    : 0;
  const errorRate = total ? +((errors * 100) / total).toFixed(2) : 0;
  return { rps, totalLastMinute: total, avgResponseMs, errorRate };
}

async function checkMongoFast() {
  const uri = process.env.MONGODB_URI;
  if (!uri)
    return { ok: false, message: 'MONGODB_URI missing', latencyMs: null };
  const opts = {
    serverSelectionTimeoutMS: 2000,
    connectTimeoutMS: 2000,
    socketTimeoutMS: 4000,
  };
  const start = Date.now();
  try {
    const client = new MongoClient(uri, opts);
    await client.connect();
    // ping
    await client.db(process.env.MONGODB_DB || undefined).command({ ping: 1 });
    const latencyMs = Date.now() - start;
    await client.close();
    return { ok: true, message: 'ok', latencyMs };
  } catch (e) {
    return {
      ok: false,
      message: String(e?.message || e),
      latencyMs: Date.now() - start,
    };
  }
}

// Helper functions for security endpoint
function detectDeviceName(userAgent) {
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Android')) return 'Android Device';
  if (userAgent.includes('Macintosh')) return 'MacBook';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Linux')) return 'Linux Computer';
  return 'Unknown Device';
}

function detectDeviceType(userAgent) {
  if (userAgent.includes('Mobile') || userAgent.includes('iPhone'))
    return 'mobile';
  if (userAgent.includes('iPad') || userAgent.includes('Tablet'))
    return 'tablet';
  return 'desktop';
}

function detectBrowser(userAgent) {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome'))
    return 'Safari';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown Browser';
}

function calculateSecurityScore(userSecurity) {
  let score = 50; // Base score

  // Two-factor authentication (+25 points)
  if (userSecurity.twoFactorEnabled) score += 25;

  // Password age (max 15 points - lose points if password is old)
  const passwordAge =
    Date.now() - new Date(userSecurity.passwordLastChanged).getTime();
  const daysOld = passwordAge / (1000 * 60 * 60 * 24);
  if (daysOld < 90) score += 15;
  else if (daysOld < 180) score += 10;
  else if (daysOld < 365) score += 5;

  // Login history (+5 points if no failed attempts)
  if (userSecurity.failedLoginAttempts === 0) score += 5;

  // Account not locked (+5 points)
  if (!userSecurity.accountLocked) score += 5;

  return Math.min(100, Math.max(0, score));
}

function generateSecurityRecommendations(userSecurity) {
  const recommendations = [];

  // 2FA recommendation
  if (!userSecurity.twoFactorEnabled) {
    recommendations.push({
      id: 1,
      type: 'warning',
      title: 'Enable Two-Factor Authentication',
      description: 'Secure your account with 2FA for better protection',
      priority: 'high',
    });
  }

  // Password age recommendation
  const passwordAge =
    Date.now() - new Date(userSecurity.passwordLastChanged).getTime();
  const daysOld = passwordAge / (1000 * 60 * 60 * 24);
  if (daysOld > 180) {
    recommendations.push({
      id: 2,
      type: 'info',
      title: 'Update Your Password',
      description: 'Your password is over 6 months old. Consider updating it.',
      priority: 'medium',
    });
  }

  // Failed login attempts warning
  if (userSecurity.failedLoginAttempts > 3) {
    recommendations.push({
      id: 3,
      type: 'warning',
      title: 'Recent Failed Login Attempts',
      description: 'Someone may be trying to access your account',
      priority: 'high',
    });
  }

  // Default if no recommendations
  if (recommendations.length === 0) {
    recommendations.push({
      id: 4,
      type: 'success',
      title: 'Great Security Posture!',
      description: 'Your account security is well configured',
      priority: 'low',
    });
  }

  return recommendations;
}

function providerStatusFromEnv() {
  return {
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    cohere: !!process.env.COHERE_API_KEY,
    huggingface: !!process.env.HUGGINGFACE_API_KEY,
    mistral: !!process.env.MISTRAL_API_KEY,
    replicate: !!process.env.REPLICATE_API_TOKEN,
    stability: !!process.env.STABILITY_API_KEY,
    runway: !!process.env.RUNWAYML_API_KEY,
    elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    googleTranslate: !!process.env.GOOGLE_TRANSLATE_API_KEY,
  };
}

function buildCpuMem() {
  const memTotal = os.totalmem();
  const memFree = os.freemem();
  const memUsed = memTotal - memFree;
  const memPct = +((memUsed / memTotal) * 100).toFixed(1);
  const load = os.loadavg()[0] || 0;
  return { memPct, load1: +load.toFixed(2) };
}

// Health check endpoint
app.get('/health', async (req, res) => {
  const hasAIService = !!(
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.COHERE_API_KEY
  );

  // Check Redis status
  let redisStatus = 'not_configured';
  let redisConnected = false;
  try {
    if (cache.client && cache.isConnected) {
      await cache.client.ping();
      redisStatus = 'connected';
      redisConnected = true;
    } else if (cache.memoryCache) {
      redisStatus = 'fallback_memory';
    }
  } catch (e) {
    redisStatus = 'error';
  }

  // Check MongoDB status
  let mongoStatus = 'disconnected';
  try {
    if (mongoose.connection.readyState === 1) {
      mongoStatus = 'connected';
    }
  } catch (e) {
    mongoStatus = 'error';
  }

  // Check S3 status
  let s3Status = 'not_configured';
  let s3Connected = false;
  const s3Bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME;
  try {
    if (
      s3Bucket &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
    ) {
      const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'ap-southeast-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
      await s3Client.send(new HeadBucketCommand({ Bucket: s3Bucket }));
      s3Status = 'connected';
      s3Connected = true;
    }
  } catch (e) {
    s3Status = s3Bucket ? 'error' : 'not_configured';
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '2.0.0',
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      cohere: !!process.env.COHERE_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      googleTranslate: !!process.env.GOOGLE_TRANSLATE_API_KEY,
    },
    infrastructure: {
      redis: redisStatus,
      redisConnected,
      mongodb: mongoStatus,
      mongodbState: mongoose.connection.readyState,
      s3: s3Status,
      s3Connected,
      s3Bucket: s3Bucket || null,
    },
    hasAIService,
  });
});

// Compatibility alias: /api/health -> same as /health
app.get('/api/health', async (req, res) => {
  const hasAIService = !!(
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.COHERE_API_KEY
  );

  // Check Redis status
  let redisStatus = 'not_configured';
  let redisConnected = false;
  try {
    if (cache.client && cache.isConnected) {
      await cache.client.ping();
      redisStatus = 'connected';
      redisConnected = true;
    } else if (cache.memoryCache) {
      redisStatus = 'fallback_memory';
    }
  } catch (e) {
    redisStatus = 'error';
  }

  // Check MongoDB status
  let mongoStatus = 'disconnected';
  try {
    if (mongoose.connection.readyState === 1) {
      mongoStatus = 'connected';
    }
  } catch (e) {
    mongoStatus = 'error';
  }

  // Check S3 status
  let s3Status = 'not_configured';
  let s3Connected = false;
  const s3Bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME;
  try {
    if (
      s3Bucket &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
    ) {
      const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'ap-southeast-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
      await s3Client.send(new HeadBucketCommand({ Bucket: s3Bucket }));
      s3Status = 'connected';
      s3Connected = true;
    }
  } catch (e) {
    s3Status = s3Bucket ? 'error' : 'not_configured';
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '2.0.0',
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      cohere: !!process.env.COHERE_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      googleTranslate: !!process.env.GOOGLE_TRANSLATE_API_KEY,
    },
    infrastructure: {
      redis: redisStatus,
      redisConnected,
      mongodb: mongoStatus,
      mongodbState: mongoose.connection.readyState,
      s3: s3Status,
      s3Connected,
      s3Bucket: s3Bucket || null,
    },
    hasAIService,
  });
});

// ----------------------------
// Real-time Status Endpoints
// ----------------------------

// Helper function to fetch REAL status data from database
async function fetchRealStatusData() {
  const metrics = calcMetricsSnapshot();
  const providers = providerStatusFromEnv();
  const db = await checkMongoFast();
  const apiStatus =
    metrics.errorRate < 1 && metrics.avgResponseMs < 800
      ? 'operational'
      : 'degraded';
  const dbStatus = db.ok ? 'operational' : 'outage';
  const platformStatus =
    apiStatus === 'operational' && db.ok ? 'operational' : 'degraded';
  const now = new Date();

  // Get MongoDB database instance
  const mongoDb = mongoose.connection.db;

  // Fetch REAL agent data from database
  let agentsData = [];
  let realApiRequestsToday = 0;
  let realErrorsToday = 0;
  let realAvgResponseTime = metrics.avgResponseMs;
  let realConnectionPool = 0;
  let realActiveUsers = 0; // Total active users across all agents
  let historical = [];
  let toolsData = [];

  // Define the 18 valid agent slugs to show on status page
  const validAgentSlugs = [
    'ben-sega',
    'bishop-burger',
    'chef-biew',
    'chess-player',
    'comedy-king',
    'drama-queen',
    'einstein',
    'emma-emotional',
    'fitness-guru',
    'julie-girlfriend',
    'knight-logic',
    'lazy-pawn',
    'mrs-boss',
    'nid-gaming',
    'professor-astrology',
    'rook-jokey',
    'tech-wizard',
    'travel-buddy',
  ];

  // Display names for agents (capitalize properly)
  const agentDisplayNames = {
    'ben-sega': 'Ben Sega',
    'bishop-burger': 'Bishop Burger',
    'chef-biew': 'Chef Biew',
    'chess-player': 'Chess Player',
    'comedy-king': 'Comedy King',
    'drama-queen': 'Drama Queen',
    einstein: 'Einstein',
    'emma-emotional': 'Emma Emotional',
    'fitness-guru': 'Fitness Guru',
    'julie-girlfriend': 'Julie Girlfriend',
    'knight-logic': 'Knight Logic',
    'lazy-pawn': 'Lazy Pawn',
    'mrs-boss': 'Mrs Boss',
    'nid-gaming': 'Nid Gaming',
    'professor-astrology': 'Professor Astrology',
    'rook-jokey': 'Rook Jokey',
    'tech-wizard': 'Tech Wizard',
    'travel-buddy': 'Travel Buddy',
  };

  if (mongoDb) {
    try {
      // 1. Fetch ONLY the 18 valid agents from agents collection
      const agentsCollection = mongoDb.collection('agents');
      const agents = await agentsCollection
        .find({
          $and: [
            {
              $or: [
                { isActive: true },
                { status: { $in: ['active', 'operational'] } },
              ],
            },
            {
              $or: [
                { slug: { $in: validAgentSlugs } },
                { agentId: { $in: validAgentSlugs } },
              ],
            },
          ],
        })
        .toArray();

      // 2. Get active sessions per agent from chatinteractions
      const chatCollection = mongoDb.collection('chatinteractions');
      const sessionsCollection = mongoDb.collection('sessions');

      // Calculate active users per agent (sessions in last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);

      // Get active users per agent from ACTIVE subscriptions (not chatinteractions)
      const subscriptionsCollection = mongoDb.collection('subscriptions');
      const agentActiveUsers = await subscriptionsCollection
        .aggregate([
          {
            $match: { status: 'active', agentId: { $exists: true, $ne: null } },
          },
          { $group: { _id: '$agentId', count: { $sum: 1 } } },
        ])
        .toArray();

      console.log(
        'DEBUG: agentActiveUsers from subscriptions:',
        agentActiveUsers
      );

      // Create a map of agent active users from subscriptions
      const activeUsersMap = new Map();
      agentActiveUsers.forEach((s) => {
        if (s._id) activeUsersMap.set(s._id.toString(), s.count);
      });

      console.log('DEBUG: activeUsersMap:', Object.fromEntries(activeUsersMap));

      // Get real-time active users from sessions collection
      const activeSessions = await sessionsCollection.countDocuments({
        lastActivity: { $gte: fifteenMinAgo },
        isActive: true,
      });
      realActiveUsers = activeSessions; // Store for return object

      // Map agents to status format with REAL data, using proper display names
      // First deduplicate by slug
      const seenSlugs = new Set();
      agentsData = agents
        .filter((agent) => {
          const slug = agent.slug || agent.agentId;
          if (!slug || !validAgentSlugs.includes(slug) || seenSlugs.has(slug)) {
            return false;
          }
          seenSlugs.add(slug);
          return true;
        })
        .map((agent) => {
          const slug = agent.slug || agent.agentId;
          return {
            name: agentDisplayNames[slug] || agent.name || slug,
            slug: slug,
            status:
              agent.isActive === true || agent.status === 'active'
                ? 'operational'
                : agent.status === 'maintenance'
                ? 'degraded'
                : 'outage',
            responseTime: metrics.avgResponseMs || 100,
            activeUsers:
              activeUsersMap.get(agent.agentId) ||
              activeUsersMap.get(agent._id?.toString()) ||
              activeUsersMap.get(slug) ||
              0,
            totalUsers: agent.stats?.totalUsers || 0,
            totalSessions:
              agent.stats?.totalInteractions || agent.stats?.totalSessions || 0,
            averageRating: agent.stats?.averageRating || 0,
            category: agent.category || '',
            aiProvider: agent.aiModel || 'gpt-4',
          };
        });

      // If DB returned fewer agents than expected, add missing ones from the valid list
      if (agentsData.length < validAgentSlugs.length) {
        validAgentSlugs.forEach((slug) => {
          if (!seenSlugs.has(slug)) {
            agentsData.push({
              name: agentDisplayNames[slug] || slug,
              slug: slug,
              status: 'operational',
              responseTime: metrics.avgResponseMs || 100,
              activeUsers: 0,
              totalUsers: 0,
              totalSessions: 0,
              averageRating: 0,
              category: '',
              aiProvider: 'gpt-4',
            });
          }
        });
      }

      // If no agents found in DB at all, use the full list
      if (agentsData.length === 0) {
        agentsData = validAgentSlugs.map((slug) => ({
          name: agentDisplayNames[slug] || slug,
          slug: slug,
          status: 'operational',
          responseTime: metrics.avgResponseMs || 100,
          activeUsers: 0,
          totalUsers: 0,
          totalSessions: 0,
          averageRating: 0,
          category: '',
          aiProvider: 'gpt-4',
        }));
      }

      // 3. Fetch REAL API usage data - check multiple possible collections
      const apiUsageCollection = mongoDb.collection('apiusages');
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Check if apiusages has TODAY's data (not just any data)
      const todayApiUsagesCount = await apiUsageCollection.countDocuments({
        timestamp: { $gte: startOfDay },
      });

      // Get chat interactions + sessions for today (always useful)
      const todayChats = await chatCollection.countDocuments({
        createdAt: { $gte: startOfDay },
      });
      const todaySessions = await sessionsCollection.countDocuments({
        createdAt: { $gte: startOfDay },
      });

      if (todayApiUsagesCount === 0) {
        // If apiusages has no today's data, use chat interactions + sessions as requests
        realApiRequestsToday = todayChats + todaySessions;
        realErrorsToday = 0; // No error tracking without apiusages
      } else {
        // Use apiusages data + add chat/sessions
        realApiRequestsToday = todayApiUsagesCount + todayChats + todaySessions;

        // Get today's errors count from apiusages
        realErrorsToday = await apiUsageCollection.countDocuments({
          timestamp: { $gte: startOfDay },
          statusCode: { $gte: 500 },
        });
      }

      // Note: realErrorsToday already set above based on whether apiusages has today's data

      // Get average response time from recent API calls
      const avgResponseAgg = await apiUsageCollection
        .aggregate([
          { $match: { timestamp: { $gte: oneDayAgo } } },
          { $group: { _id: null, avgTime: { $avg: '$responseTime' } } },
        ])
        .toArray();
      if (avgResponseAgg.length > 0 && avgResponseAgg[0].avgTime) {
        realAvgResponseTime = Math.round(avgResponseAgg[0].avgTime);
      }

      // 4. Get real connection pool status
      const serverStatus = await mongoDb
        .command({ serverStatus: 1 })
        .catch(() => null);
      if (serverStatus?.connections) {
        realConnectionPool = serverStatus.connections.current || 0;
      } else {
        // Fallback: count active sessions as proxy for connections
        realConnectionPool = Math.max(1, activeSessions);
      }

      // 5. Build REAL historical data from pageviews + chatinteractions/sessions (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const pageViewCollection = mongoDb.collection('pageviews');

      const dailyStats = await pageViewCollection
        .aggregate([
          { $match: { timestamp: { $gte: sevenDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
              },
              pageViews: { $sum: 1 },
              avgTimeSpent: { $avg: '$timeSpent' },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray();

      // Get daily chat/API activity - use chatinteractions and sessions as proxy for API requests
      const dailyChatStats = await chatCollection
        .aggregate([
          { $match: { createdAt: { $gte: sevenDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              chatCount: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray();

      const dailySessionStats = await sessionsCollection
        .aggregate([
          { $match: { createdAt: { $gte: sevenDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              sessionCount: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray();

      // Also check apiusages if available
      const dailyApiStats = await apiUsageCollection
        .aggregate([
          { $match: { timestamp: { $gte: sevenDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
              },
              requests: { $sum: 1 },
              errors: {
                $sum: { $cond: [{ $gte: ['$statusCode', 500] }, 1, 0] },
              },
              avgResponseTime: { $avg: '$responseTime' },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray();

      // Merge all stats into maps
      const apiStatsMap = new Map();
      dailyApiStats.forEach((d) => apiStatsMap.set(d._id, d));

      const chatStatsMap = new Map();
      dailyChatStats.forEach((d) => chatStatsMap.set(d._id, d));

      const sessionStatsMap = new Map();
      dailySessionStats.forEach((d) => sessionStatsMap.set(d._id, d));

      // Build complete 7-day historical with all data sources
      const allDates = new Set();
      dailyStats.forEach((d) => allDates.add(d._id));
      dailyChatStats.forEach((d) => allDates.add(d._id));
      dailySessionStats.forEach((d) => allDates.add(d._id));
      dailyApiStats.forEach((d) => allDates.add(d._id));

      // Ensure we have all 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        allDates.add(d.toISOString().split('T')[0]);
      }

      const sortedDates = Array.from(allDates).sort();

      historical = sortedDates.slice(-8).map((dateStr) => {
        const pageDay = dailyStats.find((d) => d._id === dateStr) || {};
        const apiDay = apiStatsMap.get(dateStr) || {};
        const chatDay = chatStatsMap.get(dateStr) || {};
        const sessionDay = sessionStatsMap.get(dateStr) || {};

        // Combine requests from apiusages + chats + sessions
        const totalRequests =
          (apiDay.requests || 0) +
          (chatDay.chatCount || 0) +
          (sessionDay.sessionCount || 0);

        return {
          date: dateStr,
          pageViews: pageDay.pageViews || 0,
          avgTimeSpent: Math.round(pageDay.avgTimeSpent || 0),
          requests: totalRequests,
          apiErrors: apiDay.errors || 0,
          avgResponseTime: Math.round(
            apiDay.avgResponseTime || realAvgResponseTime || 100
          ),
          uptime: apiDay.errors > 0 ? 99.5 : 99.99,
        };
      });

      // If still no historical data, generate placeholder for last 7 days
      if (historical.length === 0) {
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          historical.push({
            date: d.toISOString().split('T')[0],
            pageViews: 0,
            avgTimeSpent: 0,
            requests: 0,
            apiErrors: 0,
            avgResponseTime: 0,
            uptime: 99.99,
          });
        }
      }

      // 6. Get REAL tool usage data
      const toolUsageCollection = mongoDb.collection('toolusages');
      const toolStats = await toolUsageCollection
        .aggregate([
          { $match: { occurredAt: { $gte: oneDayAgo } } },
          {
            $group: {
              _id: '$toolName',
              count: { $sum: 1 },
              avgLatency: { $avg: '$latencyMs' },
              errors: {
                $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
              },
            },
          },
        ])
        .toArray();

      // Map tool stats
      const toolStatsMap = new Map();
      toolStats.forEach((t) => toolStatsMap.set(t._id, t));

      toolsData = [
        {
          name: 'Translation',
          status: providers.googleTranslate ? 'operational' : 'degraded',
          responseTime: toolStatsMap.get('translation')?.avgLatency || 180,
          activeChats: toolStatsMap.get('translation')?.count || 0,
        },
        {
          name: 'Voice (ElevenLabs)',
          status: providers.elevenlabs ? 'operational' : 'degraded',
          responseTime: toolStatsMap.get('voice')?.avgLatency || 420,
          activeChats: toolStatsMap.get('voice')?.count || 0,
        },
        {
          name: 'Email',
          status: process.env.SENDGRID_API_KEY ? 'operational' : 'degraded',
          responseTime: toolStatsMap.get('email')?.avgLatency || 260,
          activeChats: toolStatsMap.get('email')?.count || 0,
        },
      ];
    } catch (dbErr) {
      console.error('Error fetching real status data:', dbErr);
      // Fall back to minimal data on error
      agentsData = [
        {
          name: 'Default',
          status: 'operational',
          responseTime: metrics.avgResponseMs,
          activeUsers: 0,
        },
      ];
    }
  }

  // If no tools data, use defaults
  if (toolsData.length === 0) {
    toolsData = [
      {
        name: 'Translation',
        status: providers.googleTranslate ? 'operational' : 'degraded',
        responseTime: 180,
        activeChats: 0,
      },
      {
        name: 'Voice (ElevenLabs)',
        status: providers.elevenlabs ? 'operational' : 'degraded',
        responseTime: 420,
        activeChats: 0,
      },
      {
        name: 'Email',
        status: process.env.SENDGRID_API_KEY ? 'operational' : 'degraded',
        responseTime: 260,
        activeChats: 0,
      },
    ];
  }

  // Calculate error rate from real data
  const realErrorRate =
    realApiRequestsToday > 0
      ? +((realErrorsToday * 100) / realApiRequestsToday).toFixed(2)
      : metrics.errorRate;

  // Get REAL system stats (CPU, Memory)
  const memTotal = os.totalmem();
  const memFree = os.freemem();
  const memUsed = memTotal - memFree;
  const memoryPercent = +((memUsed / memTotal) * 100).toFixed(1);
  const cpus = os.cpus();
  const loadAvg = os.loadavg();
  // Calculate CPU percentage from load average relative to number of cores
  const cpuPercent = Math.min(
    100,
    +((loadAvg[0] / cpus.length) * 100).toFixed(1)
  );

  return {
    system: {
      cpuPercent,
      memoryPercent,
      totalMem: Math.round((memTotal / (1024 * 1024 * 1024)) * 10) / 10, // GB
      freeMem: Math.round((memFree / (1024 * 1024 * 1024)) * 10) / 10, // GB
      usedMem: Math.round((memUsed / (1024 * 1024 * 1024)) * 10) / 10, // GB
      load1: +loadAvg[0].toFixed(2),
      load5: +loadAvg[1].toFixed(2),
      load15: +loadAvg[2].toFixed(2),
      cores: cpus.length,
    },
    platform: {
      status: platformStatus,
      uptime: platformStatus === 'operational' ? 99.99 : 98.5,
      lastUpdated: now.toISOString(),
      version: process.env.APP_VERSION || '2.0.0',
    },
    api: {
      status: apiStatus,
      responseTime: realAvgResponseTime,
      uptime: 99.9,
      requestsToday: realApiRequestsToday,
      requestsPerMinute: metrics.totalLastMinute,
      errorsToday: realErrorsToday,
      errorRate: realErrorRate,
    },
    database: {
      status: dbStatus,
      connectionPool: realConnectionPool,
      responseTime: db.latencyMs ?? 0,
      uptime: db.ok ? 99.9 : 0,
    },
    aiServices: [
      {
        name: 'OpenAI GPT',
        status: providers.openai ? 'operational' : 'outage',
        responseTime: realAvgResponseTime,
        uptime: providers.openai ? 99.9 : 0,
      },
      {
        name: 'Claude (Anthropic)',
        status: providers.anthropic ? 'operational' : 'outage',
        responseTime: realAvgResponseTime + 50,
        uptime: providers.anthropic ? 99.9 : 0,
      },
      {
        name: 'Google Gemini',
        status: providers.gemini ? 'operational' : 'outage',
        responseTime: realAvgResponseTime + 20,
        uptime: providers.gemini ? 99.9 : 0,
      },
      {
        name: 'Cohere',
        status: providers.cohere ? 'operational' : 'outage',
        responseTime: realAvgResponseTime + 40,
        uptime: providers.cohere ? 99.9 : 0,
      },
      {
        name: 'HuggingFace',
        status: providers.huggingface ? 'operational' : 'outage',
        responseTime: realAvgResponseTime + 80,
        uptime: providers.huggingface ? 99.9 : 0,
      },
      {
        name: 'Mistral AI',
        status: providers.mistral ? 'operational' : 'outage',
        responseTime: realAvgResponseTime + 30,
        uptime: providers.mistral ? 99.9 : 0,
      },
      {
        name: 'Replicate',
        status: providers.replicate ? 'operational' : 'outage',
        responseTime: realAvgResponseTime + 150,
        uptime: providers.replicate ? 99.9 : 0,
      },
      {
        name: 'Stability AI',
        status: providers.stability ? 'operational' : 'outage',
        responseTime: realAvgResponseTime + 200,
        uptime: providers.stability ? 99.9 : 0,
      },
      {
        name: 'RunwayML',
        status: providers.runway ? 'operational' : 'outage',
        responseTime: realAvgResponseTime + 220,
        uptime: providers.runway ? 99.9 : 0,
      },
    ],
    agents: agentsData,
    tools: toolsData,
    historical: historical,
    incidents: [],
    totalActiveUsers: realActiveUsers, // Active users in last 15 minutes
  };
}

app.get('/api/status', async (req, res) => {
  try {
    const data = await fetchRealStatusData();
    res.json({ success: true, data });
  } catch (e) {
    console.error('Status error:', e);
    res.status(500).json({ success: false, error: 'Status endpoint failed' });
  }
});

app.get('/api/status/api-status', async (req, res) => {
  const metrics = calcMetricsSnapshot();
  const now = new Date().toISOString();
  const mkEndpoint = (name, endpoint, method) => ({
    name,
    endpoint,
    method,
    status: metrics.errorRate < 2 ? 'operational' : 'degraded',
    responseTime: metrics.avgResponseMs,
    uptime: 99.9,
    lastChecked: now,
    errorRate: metrics.errorRate,
  });
  res.json({
    endpoints: [
      mkEndpoint('Health', '/health', 'GET'),
      mkEndpoint('Chat', '/api/chat', 'POST'),
      mkEndpoint('Language Detect', '/api/language-detect', 'POST'),
      mkEndpoint('Translate', '/api/translate', 'POST'),
    ],
    categories: {
      agents: [
        {
          name: 'einstein',
          apiEndpoint: '/api/chat?agent=einstein',
          status: 'operational',
          responseTime: metrics.avgResponseMs,
          requestsPerMinute: metrics.rps,
        },
        {
          name: 'bishop-burger',
          apiEndpoint: '/api/chat?agent=bishop-burger',
          status: 'operational',
          responseTime: metrics.avgResponseMs + 20,
          requestsPerMinute: metrics.rps,
        },
      ],
      tools: [
        {
          name: 'Voice Synthesis',
          apiEndpoint: '/api/voice/synthesize',
          status: 'operational',
          responseTime: 420,
          requestsPerMinute: 0,
        },
        {
          name: 'Translate',
          apiEndpoint: '/api/translate',
          status: 'operational',
          responseTime: 250,
          requestsPerMinute: 0,
        },
      ],
      aiServices: [
        {
          name: 'OpenAI GPT',
          provider: 'openai',
          status: process.env.OPENAI_API_KEY ? 'operational' : 'down',
          responseTime: 300,
          quota: process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured',
        },
        {
          name: 'Claude (Anthropic)',
          provider: 'anthropic',
          status: process.env.ANTHROPIC_API_KEY ? 'operational' : 'down',
          responseTime: 350,
          quota: process.env.ANTHROPIC_API_KEY
            ? 'Configured'
            : 'Not configured',
        },
        {
          name: 'Google Gemini',
          provider: 'google',
          status: process.env.GEMINI_API_KEY ? 'operational' : 'down',
          responseTime: 320,
          quota: process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured',
        },
        {
          name: 'Cohere',
          provider: 'cohere',
          status: process.env.COHERE_API_KEY ? 'operational' : 'down',
          responseTime: 340,
          quota: process.env.COHERE_API_KEY ? 'Configured' : 'Not configured',
        },
        {
          name: 'HuggingFace',
          provider: 'huggingface',
          status: process.env.HUGGINGFACE_API_KEY ? 'operational' : 'down',
          responseTime: 380,
          quota: process.env.HUGGINGFACE_API_KEY
            ? 'Configured'
            : 'Not configured',
        },
        {
          name: 'Mistral AI',
          provider: 'mistral',
          status: process.env.MISTRAL_API_KEY ? 'operational' : 'down',
          responseTime: 330,
          quota: process.env.MISTRAL_API_KEY ? 'Configured' : 'Not configured',
        },
        {
          name: 'Replicate',
          provider: 'replicate',
          status: process.env.REPLICATE_API_TOKEN ? 'operational' : 'down',
          responseTime: 450,
          quota: process.env.REPLICATE_API_TOKEN
            ? 'Configured'
            : 'Not configured',
        },
        {
          name: 'Stability AI',
          provider: 'stability',
          status: process.env.STABILITY_API_KEY ? 'operational' : 'down',
          responseTime: 500,
          quota: process.env.STABILITY_API_KEY
            ? 'Configured'
            : 'Not configured',
        },
        {
          name: 'RunwayML',
          provider: 'runway',
          status: process.env.RUNWAYML_API_KEY ? 'operational' : 'down',
          responseTime: 520,
          quota: process.env.RUNWAYML_API_KEY ? 'Configured' : 'Not configured',
        },
      ],
    },
  });
});

app.get('/api/status/analytics', async (req, res) => {
  try {
    const metrics = calcMetricsSnapshot();
    const timeRange = String(req.query.timeRange || '24h');
    const mongoDb = mongoose.connection.db;

    let totalRequests = metrics.totalLastMinute * 60 * 24;
    let activeUsers = 0;
    let agentsData = [];
    let toolsData = [];
    let hourlyData = [];
    let topAgents = [];

    if (mongoDb) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);

      // Get real active users
      const sessionsCollection = mongoDb.collection('sessions');
      activeUsers = await sessionsCollection.countDocuments({
        lastActivity: { $gte: fifteenMinAgo },
        isActive: true,
      });

      // Get real API request count
      const apiUsageCollection = mongoDb.collection('apiusages');
      totalRequests = await apiUsageCollection.countDocuments({
        timestamp: { $gte: oneDayAgo },
      });

      // Get real agent analytics
      const chatCollection = mongoDb.collection('chatinteractions');
      const agentStats = await chatCollection
        .aggregate([
          { $match: { startedAt: { $gte: oneDayAgo } } },
          {
            $group: {
              _id: '$agentId',
              requests: { $sum: 1 },
              uniqueUsers: { $addToSet: '$userId' },
              avgDuration: { $avg: '$metrics.durationMs' },
            },
          },
          { $sort: { requests: -1 } },
          { $limit: 10 },
        ])
        .toArray();

      // Get agent names
      const agentsCollection = mongoDb.collection('agents');
      const allAgents = await agentsCollection.find({}).toArray();
      const agentMap = new Map();
      allAgents.forEach((a) =>
        agentMap.set(a._id?.toString(), a.name || a.slug || a.id)
      );

      agentsData = agentStats.map((stat) => ({
        name: agentMap.get(stat._id?.toString()) || 'Unknown',
        requests: stat.requests,
        users: stat.uniqueUsers?.length || 0,
        avgResponseTime: Math.round(stat.avgDuration || metrics.avgResponseMs),
        successRate: 99.5,
        trend: 'stable',
      }));

      // Top agents
      topAgents = agentStats.slice(0, 5).map((stat) => ({
        name: agentMap.get(stat._id?.toString()) || 'Unknown',
        requests: stat.requests,
        percentage:
          totalRequests > 0
            ? Math.round((stat.requests * 100) / totalRequests)
            : 0,
      }));

      // Get real tool usage
      const toolUsageCollection = mongoDb.collection('toolusages');
      const toolStats = await toolUsageCollection
        .aggregate([
          { $match: { occurredAt: { $gte: oneDayAgo } } },
          {
            $group: {
              _id: '$toolName',
              usage: { $sum: 1 },
              uniqueUsers: { $addToSet: '$userId' },
              avgLatency: { $avg: '$latencyMs' },
            },
          },
        ])
        .toArray();

      toolsData = toolStats.map((stat) => ({
        name: stat._id || 'Unknown',
        usage: stat.usage,
        users: stat.uniqueUsers?.length || 0,
        avgDuration: Math.round(((stat.avgLatency || 0) / 1000) * 10) / 10,
        trend: 'stable',
      }));

      // Get hourly data for the chart
      const hourlyStats = await apiUsageCollection
        .aggregate([
          { $match: { timestamp: { $gte: oneDayAgo } } },
          {
            $group: {
              _id: { $hour: '$timestamp' },
              requests: { $sum: 1 },
              avgResponseTime: { $avg: '$responseTime' },
              errors: {
                $sum: { $cond: [{ $gte: ['$statusCode', 500] }, 1, 0] },
              },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray();

      hourlyData = hourlyStats.map((h) => ({
        hour: h._id,
        requests: h.requests,
        responseTime: Math.round(h.avgResponseTime || 0),
        errors: h.errors,
      }));
    }

    // Calculate error rate
    const errorRate = metrics.errorRate;

    res.json({
      overview: {
        totalRequests,
        activeUsers,
        avgResponseTime: metrics.avgResponseMs,
        successRate: 100 - errorRate,
        requestsGrowth: 0,
        usersGrowth: 0,
      },
      agents:
        agentsData.length > 0
          ? agentsData
          : [
              {
                name: 'Default',
                requests: 0,
                users: 0,
                avgResponseTime: metrics.avgResponseMs,
                successRate: 99.9,
                trend: 'stable',
              },
            ],
      tools:
        toolsData.length > 0
          ? toolsData
          : [
              {
                name: 'Voice Synthesis',
                usage: 0,
                users: 0,
                avgDuration: 0,
                trend: 'stable',
              },
              {
                name: 'Translate',
                usage: 0,
                users: 0,
                avgDuration: 0,
                trend: 'stable',
              },
            ],
      hourlyData,
      topAgents:
        topAgents.length > 0
          ? topAgents
          : [{ name: 'Default', requests: 0, percentage: 0 }],
    });
  } catch (err) {
    console.error('Analytics endpoint error:', err);
    const metrics = calcMetricsSnapshot();
    res.json({
      overview: {
        totalRequests: 0,
        activeUsers: 0,
        avgResponseTime: metrics.avgResponseMs,
        successRate: 100 - metrics.errorRate,
        requestsGrowth: 0,
        usersGrowth: 0,
      },
      agents: [],
      tools: [],
      hourlyData: [],
      topAgents: [],
    });
  }
});

// Server-Sent Events stream for real-time updates
app.get('/api/status/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = async () => {
    const snapshotRes = await fetchLikeStatus();
    res.write(`data: ${JSON.stringify(snapshotRes)}\n\n`);
  };

  const interval = setInterval(send, 2000);
  // send first immediately
  send();

  req.on('close', () => {
    clearInterval(interval);
  });
});

async function fetchLikeStatus() {
  // Use the shared fetchRealStatusData function for consistency
  const data = await fetchRealStatusData();
  return {
    success: true,
    data,
    meta: { ...calcMetricsSnapshot(), sys: buildCpuMem() },
  };
}

// Auth endpoints
// Shared handler for password-based login so it can be reused
// by multiple routes (frontend proxy and direct backend calls).
async function handlePasswordLogin(req, res) {
  try {
    console.log('🔐 Login attempt:', req.body?.email);

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    // Use existing Mongoose connection instead of creating a new MongoClient
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('MongoDB connection is not initialized');
    }
    const users = db.collection('users');

    // Find user by email
    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    if (!user.password) {
      console.log('❌ No password set for user');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate session ID
    const sessionId = crypto.randomBytes(32).toString('hex');
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Update user with session
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          sessionId,
          sessionExpiry,
          lastLoginAt: new Date(),
          isActive: true,
        },
      }
    );

    // Update login history in usersecurities collection
    const userSecurities = db.collection('usersecurities');

    // Get user IP and user agent for login history
    const userIP = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    // Update or create security record with login history
    await userSecurities.updateOne(
      { userId: user._id },
      {
        $set: {
          userId: user._id,
          email: user.email,
          lastLoginAt: new Date(),
          failedLoginAttempts: 0, // Reset on successful login
          accountLocked: false,
          lockReason: null,
          lockExpires: null,
        },
        $push: {
          loginHistory: {
            timestamp: new Date(),
            ipAddress: userIP,
            userAgent: userAgent,
            success: true,
          },
        },
        $setOnInsert: {
          passwordLastChanged: user.createdAt || new Date(),
          twoFactorEnabled: false,
          twoFactorSecret: null,
          backupCodes: [],
          trustedDevices: [],
          securityQuestions: [],
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log('✅ Login successful for user:', user.email);

    // Set HttpOnly cookie
    res.cookie('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return res.json({
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        authMethod: user.authMethod,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Shared handler for password-based signup so it can be reused
// by both the primary /api/auth/signup and backend-only alias.
async function handlePasswordSignup(req, res) {
  try {
    console.log('🆕 Signup attempt:', req.body?.email);

    const { name, email, password, authMethod } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters' });
    }

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('MongoDB connection is not initialized');
    }

    const users = db.collection('users');

    const existingUser = await users.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const now = new Date();
    const sessionId = crypto.randomBytes(32).toString('hex');
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const newUserDoc = {
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      password: hashedPassword,
      authMethod: authMethod || 'password',
      emailVerified: now,
      image: null,
      avatar: null,
      bio: null,
      phoneNumber: null,
      location: null,
      timezone: null,
      profession: null,
      company: null,
      website: null,
      socialLinks: {
        linkedin: null,
        twitter: null,
        github: null,
      },
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: true,
        productUpdates: true,
      },
      lastLoginAt: null,
      isActive: true,
      role: 'user',
      resetPasswordToken: null,
      resetPasswordExpires: null,
      sessionId,
      sessionExpiry,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      tempTwoFactorSecret: null,
      backupCodes: [],
      tempBackupCodes: [],
      createdAt: now,
      updatedAt: now,
    };

    const result = await users.insertOne(newUserDoc);
    const userId = result.insertedId;

    // Initialize security profile and login history
    const userSecurities = db.collection('usersecurities');
    const userIP = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    await userSecurities.updateOne(
      { userId: userId },
      {
        $set: {
          userId: userId,
          email: newUserDoc.email,
          lastLoginAt: now,
          failedLoginAttempts: 0,
          accountLocked: false,
          lockReason: null,
          lockExpires: null,
        },
        $push: {
          loginHistory: {
            timestamp: now,
            ipAddress: userIP,
            userAgent,
            success: true,
          },
        },
        $setOnInsert: {
          passwordLastChanged: now,
          twoFactorEnabled: false,
          twoFactorSecret: null,
          backupCodes: [],
          trustedDevices: [],
          securityQuestions: [],
          createdAt: now,
        },
      },
      { upsert: true }
    );

    console.log('✅ Signup successful for user:', newUserDoc.email);

    res.cookie('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return res.status(201).json({
      message: 'User created successfully',
      success: true,
      user: {
        id: userId,
        email: newUserDoc.email,
        name: newUserDoc.name,
        authMethod: newUserDoc.authMethod,
        createdAt: newUserDoc.createdAt,
        lastLoginAt: newUserDoc.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// ============================================
// AUTH ROUTES WITH RATE LIMITING
// ============================================
// Apply strict auth rate limiting (10 attempts per 15 minutes)
// Primary auth endpoint used by Nginx/backend routing
app.post('/api/auth/login', rateLimiters.auth, handlePasswordLogin);
// Backend-only alias used by the frontend AuthContext to bypass
// the Next.js route handler when calling from the browser.
app.post('/api/auth-backend/login', rateLimiters.auth, handlePasswordLogin);
// Signup endpoints (primary and backend-only alias)
app.post('/api/auth/signup', rateLimiters.auth, handlePasswordSignup);
app.post('/api/auth-backend/signup', rateLimiters.auth, handlePasswordSignup);

// GET /api/auth/verify
async function handleAuthVerify(req, res) {
  try {
    console.log('🔍 Auth verify endpoint called');

    // Get session ID from HttpOnly cookie
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      console.log('❌ No session ID in cookie');
      return res.status(401).json({ message: 'No session ID' });
    }

    console.log('🎫 Session ID received from cookie, verifying...');

    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Find user with valid session
    const user = await users.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!user) {
      console.log('❌ Invalid or expired session');
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    console.log('✅ Session verified for user:', user.email);

    // Return user data
    return res.json({
      valid: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        authMethod: user.authMethod,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

app.get('/api/auth/verify', handleAuthVerify);
// Allow POST as well so browser-side callers using fetch('/api/auth/verify')
// with method POST are routed correctly through the centralized handler.
app.post('/api/auth/verify', handleAuthVerify);
// Backend alias so the frontend can explicitly call the Node auth
// verification endpoint if needed.
app.post('/api/auth-backend/verify', handleAuthVerify);

// POST /api/auth/logout - Logout and clear session
app.post('/api/auth/logout', async (req, res) => {
  try {
    console.log('🚪 Auth logout endpoint called');

    // Get session ID to invalidate in database
    const sessionId = req.cookies?.session_id;

    if (sessionId) {
      try {
        // Invalidate session in database
        const db = mongoose.connection.db;
        const users = db.collection('users');
        await users.updateOne(
          { sessionId: sessionId },
          { $unset: { sessionId: '', sessionExpiry: '' } }
        );
        console.log('✅ Session invalidated in database');
      } catch (dbError) {
        console.error('⚠️ Error invalidating session in DB:', dbError);
      }
    }

    // Clear session cookie - must match how it was set in login
    res.clearCookie('session_id', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Must match login cookie settings
      path: '/',
    });

    console.log('✅ Session cookie cleared successfully');

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User endpoints
// GET /api/user/profile - Get current user profile
app.get('/api/user/profile', async (req, res) => {
  try {
    // Get session ID from HttpOnly cookie
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      return res.status(401).json({ message: 'No session ID' });
    }

    // Use Mongoose connection instead of native client
    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Find user with valid session
    const sessionUser = await users.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    const userId = sessionUser._id.toString();

    // Get user profile from userprofiles collection
    const userProfiles = db.collection('userprofiles');
    let userProfile = await userProfiles.findOne({ userId: userId });

    // If no profile exists, create a default one
    if (!userProfile) {
      const defaultProfile = {
        userId: userId,
        email: sessionUser.email,
        name: sessionUser.name || sessionUser.email.split('@')[0],
        avatar: null,
        bio: '',
        phoneNumber: '',
        location: '',
        timezone: 'UTC',
        profession: '',
        company: '',
        website: '',
        socialLinks: {},
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: true,
          productUpdates: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await userProfiles.insertOne(defaultProfile);
      userProfile = defaultProfile;
    }

    // Return profile data
    const { _id, ...profileData } = userProfile;
    return res.json({ success: true, profile: profileData });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/user/profile - Update user profile
app.put('/api/user/profile', async (req, res) => {
  try {
    const updateData = req.body;

    // Get session ID from HttpOnly cookie
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      return res.status(401).json({ message: 'No session ID' });
    }

    // Use Mongoose connection instead of native client
    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Find user with valid session
    const sessionUser = await users.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    const userId = sessionUser._id.toString();

    // Validate update data (basic validation)
    const allowedFields = [
      'name',
      'avatar',
      'bio',
      'phoneNumber',
      'location',
      'timezone',
      'profession',
      'company',
      'website',
      'socialLinks',
      'preferences',
    ];

    const filteredUpdateData = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field];
      }
    }

    // Add updated timestamp
    filteredUpdateData.updatedAt = new Date();

    // Update user profile in userprofiles collection
    const userProfiles = db.collection('userprofiles');
    const result = await userProfiles.updateOne(
      { userId: userId },
      { $set: filteredUpdateData },
      { upsert: true }
    );

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Get updated profile
    const updatedProfile = await userProfiles.findOne({ userId: userId });
    const { _id, ...profileData } = updatedProfile;

    return res.json({
      success: true,
      profile: profileData,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/user/analytics - Get user analytics dashboard data
app.get('/api/user/analytics', async (req, res) => {
  try {
    const { userId, email } = req.query;
    const sessionId = req.cookies?.session_id;

    // Use Mongoose connection instead of native client
    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Find user via identifier or session
    let user;
    if (userId) {
      try {
        user = await users.findOne({ _id: new ObjectId(userId) });
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user ID',
        });
      }
    } else if (email) {
      user = await users.findOne({ email: email.toLowerCase() });
    } else if (sessionId) {
      user = await users.findOne({
        sessionId,
        sessionExpiry: { $gt: new Date() },
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyMinutesAgo = new Date(now - 30 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // ============================================
    // FETCH REAL CHAT DATA FROM chat_sessions
    // ============================================
    const chatSessions = db.collection('chat_sessions');

    // Get all user's chat sessions (try ObjectId, string, and converted ObjectId)
    // Note: createdAt may be stored as ISO string, so compare both ways
    const userIdStr = user._id.toString();
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();
    const userSessions = await chatSessions
      .find({
        $and: [
          {
            $or: [
              { userId: user._id },
              { userId: userIdStr }, // Sessions store userId as string
              { userId: new ObjectId(userIdStr) },
            ],
          },
          {
            $or: [
              { createdAt: { $gte: thirtyDaysAgo } }, // If stored as Date
              { createdAt: { $gte: thirtyDaysAgoISO } }, // If stored as ISO string
            ],
          },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate total conversations (each session = 1 conversation)
    const totalConversations = userSessions.length;

    // Calculate total messages from session stats OR messages array
    const totalMessages = userSessions.reduce((sum, session) => {
      // Try stats.messageCount first, then messages array length
      const msgCount =
        session.stats?.messageCount ||
        (Array.isArray(session.messages) ? session.messages.length : 0);
      return sum + msgCount;
    }, 0);

    // Calculate API calls (based on message count - each message pair = 1 API call)
    const totalApiCalls = Math.ceil(totalMessages / 2);

    // ============================================
    // GET USER'S SUBSCRIPTIONS (ACTIVE AGENTS)
    // ============================================
    const subscriptions = db.collection('subscriptions');
    const activeSubscriptions = await subscriptions
      .find({
        userId: user._id.toString(),
        status: 'active',
        expiryDate: { $gt: now },
      })
      .toArray();
    const activeAgentCount = activeSubscriptions.length;

    // ============================================
    // GET TOP AGENTS (by subscription count/revenue)
    // ============================================
    const topAgentsAgg = await subscriptions
      .aggregate([
        { $match: { userId: user._id.toString() } },
        {
          $group: {
            _id: '$agentId',
            totalSpent: { $sum: '$price' },
            subscriptionCount: { $sum: 1 },
            lastSubscribed: { $max: '$createdAt' },
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    // Get agent names for top agents
    const agentsCollection = db.collection('agents');
    const topAgents = await Promise.all(
      topAgentsAgg.map(async (agent) => {
        let agentDoc = null;
        try {
          // Try to find by ObjectId first
          agentDoc = await agentsCollection.findOne({
            _id: new ObjectId(agent._id),
          });
          // If not found, try by slug
          if (!agentDoc) {
            agentDoc = await agentsCollection.findOne({ slug: agent._id });
          }
        } catch (e) {
          // If ObjectId fails, try by slug
          agentDoc = await agentsCollection.findOne({ slug: agent._id });
        }
        // Calculate usage as percentage of total subscriptions
        const totalSubs = topAgentsAgg.reduce(
          (sum, a) => sum + a.subscriptionCount,
          0
        );
        const usagePercent =
          totalSubs > 0
            ? Math.round((agent.subscriptionCount / totalSubs) * 100)
            : 0;
        return {
          name:
            agentDoc?.name || agentDoc?.slug || agent._id || 'Unknown Agent',
          usage: usagePercent,
          totalSpent: agent.totalSpent || 0,
          subscriptions: agent.subscriptionCount || 0,
          lastUsed: agent.lastSubscribed || null,
        };
      })
    );

    // ============================================
    // CALCULATE AGENT PERFORMANCE FROM CHAT SESSIONS
    // ============================================
    const agentPerformanceMap = new Map();
    for (const session of userSessions) {
      const agentId = session.agentId?.toString() || 'default';
      if (!agentPerformanceMap.has(agentId)) {
        agentPerformanceMap.set(agentId, {
          conversations: 0,
          messages: 0,
          totalDuration: 0,
          totalTokens: 0,
        });
      }
      const perf = agentPerformanceMap.get(agentId);
      perf.conversations++;
      // Try stats.messageCount first, then messages array length
      const msgCount =
        session.stats?.messageCount ||
        (Array.isArray(session.messages) ? session.messages.length : 0);
      perf.messages += msgCount;
      perf.totalDuration += session.stats?.durationMs || 0;
      perf.totalTokens += session.stats?.totalTokens || 0;
    }

    const agentPerformance = await Promise.all(
      Array.from(agentPerformanceMap.entries()).map(async ([agentId, perf]) => {
        let agentDoc = null;
        try {
          if (agentId !== 'default') {
            agentDoc = await agentsCollection.findOne({
              _id: new ObjectId(agentId),
            });
            if (!agentDoc) {
              agentDoc = await agentsCollection.findOne({ slug: agentId });
            }
          }
        } catch (e) {
          agentDoc = await agentsCollection.findOne({ slug: agentId });
        }
        const avgResponseTime =
          perf.conversations > 0
            ? (perf.totalDuration / perf.conversations / 1000).toFixed(2)
            : '0';
        // Sessions with messages are successful
        return {
          name:
            agentDoc?.name || (agentId === 'default' ? 'AI Studio' : agentId),
          conversations: perf.conversations,
          messages: perf.messages,
          avgResponseTime: parseFloat(avgResponseTime),
          successRate: perf.messages > 0 ? 100 : 0,
        };
      })
    );

    // ============================================
    // CALCULATE DAILY USAGE (LAST 7 DAYS)
    // ============================================
    const dailyUsage = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(dateStr);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const daySessions = userSessions.filter((session) => {
        const sessionDate = new Date(session.createdAt);
        return sessionDate >= dayStart && sessionDate < dayEnd;
      });

      const dayConversations = daySessions.length;
      const dayMessages = daySessions.reduce(
        (sum, session) => sum + (session.stats?.messageCount || 0),
        0
      );

      dailyUsage.push({
        date: dateStr,
        conversations: dayConversations,
        messages: dayMessages,
        apiCalls: Math.ceil(dayMessages / 2),
      });
    }

    // ============================================
    // FETCH RECENT ACTIVITY (LAST 30 MINUTES)
    // ============================================
    // Combine security logs and chat sessions
    const securityLogs = db.collection('securityLogs');
    const thirtyMinutesAgoISO = thirtyMinutesAgo.toISOString();
    const recentSecurityLogs = await securityLogs
      .find({
        userId: user._id.toString(),
        $or: [
          { timestamp: { $gte: thirtyMinutesAgo } },
          { timestamp: { $gte: thirtyMinutesAgoISO } },
        ],
      })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    const recentChatSessions = await chatSessions
      .find({
        $and: [
          {
            $or: [
              { userId: user._id },
              { userId: userIdStr }, // Sessions store userId as string
              { userId: new ObjectId(userIdStr) },
            ],
          },
          {
            $or: [
              { updatedAt: { $gte: thirtyMinutesAgo } },
              { updatedAt: { $gte: thirtyMinutesAgoISO } },
            ],
          },
        ],
      })
      .sort({ updatedAt: -1 })
      .limit(10)
      .toArray();

    // Map action types to display names
    const actionDisplayNames = {
      login_success: 'Login Success',
      login_failed: 'Login Failed',
      logout: 'Logout',
      profile_update: 'Profile Update',
      password_changed: 'Password Change',
      ai_chat: 'AI Chat',
      subscription: 'Subscription',
      account_created: 'Account Created',
      '2fa_enabled': '2FA Enabled',
      '2fa_disabled': '2FA Disabled',
      device_removed: 'Device Removed',
      session_created: 'Session Created',
    };

    const actionStatusMap = {
      login_success: 'success',
      login_failed: 'failed',
      logout: 'completed',
      profile_update: 'success',
      password_changed: 'success',
      ai_chat: 'completed',
      subscription: 'success',
      account_created: 'success',
      '2fa_enabled': 'success',
      '2fa_disabled': 'warning',
      device_removed: 'warning',
      session_created: 'success',
    };

    // Transform security logs
    const securityActivities = recentSecurityLogs.map((log) => {
      const actionName = log.action || 'unknown';
      return {
        action:
          actionDisplayNames[actionName] ||
          actionName
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase()),
        agent: log.device
          ? `${log.device} - ${log.browser || 'Unknown'}`
          : log.location || 'System',
        status: actionStatusMap[actionName] || 'completed',
        timestamp: log.timestamp
          ? new Date(log.timestamp).toISOString()
          : new Date().toISOString(),
        ip: log.ip || null,
        location: log.location || null,
        type: 'security',
      };
    });

    // Transform chat session activities
    const chatActivities = await Promise.all(
      recentChatSessions.map(async (session) => {
        let agentName = 'AI Studio';
        if (session.agentId) {
          try {
            const agentDoc = await agentsCollection.findOne({
              _id: new ObjectId(session.agentId),
            });
            agentName = agentDoc?.name || agentName;
          } catch (e) {}
        }
        return {
          action: session.name || 'AI Conversation',
          agent: agentName,
          status: 'completed',
          timestamp: session.updatedAt
            ? new Date(session.updatedAt).toISOString()
            : new Date().toISOString(),
          messages: session.stats?.messageCount || 0,
          type: 'chat',
        };
      })
    );

    // Combine and sort activities
    const recentActivity = [...securityActivities, ...chatActivities]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 15);

    // ============================================
    // CALCULATE COST ANALYSIS
    // ============================================
    // Get this month's subscriptions
    const monthlySubscriptions = await subscriptions
      .find({
        userId: user._id.toString(),
        createdAt: { $gte: monthStart },
      })
      .toArray();

    const currentMonthCost = monthlySubscriptions.reduce(
      (sum, sub) => sum + (sub.price || 0),
      0
    );

    // Project based on current usage rate
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();
    const daysPassed = now.getDate();
    const projectedCost =
      daysPassed > 0
        ? Math.round((currentMonthCost / daysPassed) * daysInMonth * 100) / 100
        : 0;

    // Cost breakdown by agent
    const costBreakdownAgg = await subscriptions
      .aggregate([
        {
          $match: {
            userId: user._id.toString(),
            createdAt: { $gte: monthStart },
          },
        },
        {
          $group: {
            _id: '$agentId',
            amount: { $sum: '$price' },
            count: { $sum: 1 },
          },
        },
        { $sort: { amount: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    const costBreakdown = await Promise.all(
      costBreakdownAgg.map(async (item) => {
        let agentName = 'Unknown Agent';
        try {
          const agentDoc = await agentsCollection.findOne({
            _id: new ObjectId(item._id),
          });
          if (!agentDoc) {
            const agentBySlug = await agentsCollection.findOne({
              slug: item._id,
            });
            agentName = agentBySlug?.name || item._id;
          } else {
            agentName = agentDoc.name;
          }
        } catch (e) {
          agentName = item._id || 'Unknown';
        }
        return {
          category: agentName,
          cost: item.amount || 0,
          percentage:
            currentMonthCost > 0
              ? Math.round((item.amount / currentMonthCost) * 100)
              : 0,
        };
      })
    );

    // ============================================
    // CALCULATE SUCCESS RATE
    // ============================================
    // Sessions with messages = successful
    const sessionsWithMessages = userSessions.filter(
      (s) => (s.stats?.messageCount || 0) > 0
    ).length;
    const overallSuccessRate =
      userSessions.length > 0
        ? Math.round((sessionsWithMessages / userSessions.length) * 100)
        : 0;

    // ============================================
    // BUILD ANALYTICS RESPONSE
    // ============================================
    const analyticsData = {
      success: true,
      period: 'last30days',
      summary: {
        totalConversations,
        totalMessages,
        totalApiCalls,
        activeAgents: activeAgentCount,
        averageResponseTime:
          agentPerformance.length > 0
            ? (
                agentPerformance.reduce(
                  (sum, a) => sum + a.avgResponseTime,
                  0
                ) / agentPerformance.length
              ).toFixed(2)
            : '0',
        successRate: overallSuccessRate,
      },
      usage: {
        conversations: {
          current: totalConversations,
          limit: 1000,
          percentage: Math.round((totalConversations / 1000) * 100),
          unit: 'conversations',
        },
        agents: {
          current: activeAgentCount,
          limit: 18,
          percentage: Math.round((activeAgentCount / 18) * 100),
          unit: 'agents',
        },
        apiCalls: {
          current: totalApiCalls,
          limit: 50000,
          percentage: Math.round((totalApiCalls / 50000) * 100),
          unit: 'calls',
        },
        storage: {
          current: Math.round(totalMessages * 0.5), // Estimate ~0.5KB per message
          limit: 10000,
          percentage: Math.round(((totalMessages * 0.5) / 10000) * 100),
          unit: 'KB',
        },
        messages: {
          current: totalMessages,
          limit: 100000,
          percentage: Math.round((totalMessages / 100000) * 100),
          unit: 'messages',
        },
      },
      dailyUsage,
      weeklyTrend: {
        conversationsChange: `+${totalConversations}`,
        apiCallsChange: `+${totalApiCalls}`,
        messagesChange: `+${totalMessages}`,
        responseTimeChange: '-0.1s',
      },
      agentPerformance: agentPerformance.slice(0, 10),
      recentActivity,
      costAnalysis: {
        currentMonth: currentMonthCost,
        projectedMonth: projectedCost,
        breakdown: costBreakdown,
      },
      topAgents,
      subscription:
        activeSubscriptions.length > 0
          ? {
              plan: activeSubscriptions[0].plan || 'Active Plan',
              status: 'active',
              price: activeSubscriptions.reduce(
                (sum, s) => sum + (s.price || 0),
                0
              ),
              period: 'month',
              renewalDate: activeSubscriptions[0].expiryDate
                ? new Date(
                    activeSubscriptions[0].expiryDate
                  ).toLocaleDateString()
                : 'N/A',
              daysUntilRenewal: activeSubscriptions[0].expiryDate
                ? Math.ceil(
                    (new Date(activeSubscriptions[0].expiryDate) - now) /
                      (1000 * 60 * 60 * 24)
                  )
                : 0,
            }
          : {
              plan: 'No Active Plan',
              status: 'inactive',
              price: 0,
              period: 'month',
              renewalDate: 'N/A',
              daysUntilRenewal: 0,
            },
    };

    console.log(
      `✅ Analytics returned for user ${user._id}: ${totalConversations} conversations, ${totalMessages} messages, ${activeAgentCount} active agents`
    );
    res.json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data',
      details: error?.message || String(error),
    });
  }
});

// GET /api/user/analytics/advanced - Advanced analytics dashboard data
app.get('/api/user/analytics/advanced', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    // ============================================
    // COLLECT DATA FROM MULTIPLE COLLECTIONS
    // ============================================

    // Get chat interactions for API metrics (try multiple date formats)
    const chatInteractions = await db
      .collection('chatinteractions')
      .find({})
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();

    // Get pageviews for traffic data (no date filter to get all)
    const pageviews = await db
      .collection('pageviews')
      .find({})
      .sort({ timestamp: -1 })
      .limit(5000)
      .toArray();

    // Get sessions for user activity
    const sessions = await db
      .collection('sessions')
      .find({})
      .sort({ createdAt: -1 })
      .limit(2000)
      .toArray();

    // Get chat_sessions for model usage and token data
    const chatSessions = await db
      .collection('chat_sessions')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    console.log(
      `📊 Advanced analytics data: ${chatInteractions.length} interactions, ${pageviews.length} pageviews, ${sessions.length} sessions, ${chatSessions.length} chat_sessions`
    );

    // ============================================
    // CALCULATE STATS
    // ============================================
    // Use pageviews as the main traffic metric
    const totalRequests = pageviews.length;
    const prevWeekRequests = Math.floor(totalRequests * 0.85); // Estimate
    const requestChange =
      prevWeekRequests > 0
        ? Math.round(
            ((totalRequests - prevWeekRequests) / prevWeekRequests) * 100
          )
        : 18;

    // Calculate average latency from chat sessions and interactions
    let totalLatency = 0;
    let latencyCount = 0;
    chatInteractions.forEach((ci) => {
      if (ci.metrics?.durationMs) {
        totalLatency += ci.metrics.durationMs;
        latencyCount++;
      }
    });
    chatSessions.forEach((cs) => {
      // Estimate latency from response times if available
      if (cs.stats?.avgResponseTime) {
        totalLatency += cs.stats.avgResponseTime;
        latencyCount++;
      }
    });
    const avgLatency =
      latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 120;

    // Calculate success rate
    const totalChatOps = chatInteractions.length + chatSessions.length;
    const errorCount = chatInteractions.filter(
      (ci) => ci.status === 'error'
    ).length;
    const avgSuccessRate =
      totalChatOps > 0
        ? Math.round(((totalChatOps - errorCount) / totalChatOps) * 100)
        : 98;

    // Calculate total tokens from chat_sessions
    let totalTokens = 0;
    chatSessions.forEach((cs) => {
      totalTokens += cs.stats?.totalTokens || 0;
      // Also count from messages
      if (Array.isArray(cs.messages)) {
        cs.messages.forEach((m) => {
          totalTokens += m.tokens || (m.content?.length || 0) / 4; // Rough estimate
        });
      }
    });
    chatInteractions.forEach((ci) => {
      totalTokens += ci.metrics?.totalTokens || 0;
    });

    const costPerToken = 0.00002; // $0.02 per 1000 tokens
    const totalCost = Math.round(totalTokens * costPerToken * 100) / 100;

    // ============================================
    // BUILD API METRICS (Last 7 Days from pageviews)
    // ============================================
    const apiMetrics = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Filter pageviews by date
      const dayPageviews = pageviews.filter((pv) => {
        const pvDate = new Date(pv.timestamp).toISOString().split('T')[0];
        return pvDate === dateStr;
      });

      // Filter chat sessions by date
      const daySessions = chatSessions.filter((cs) => {
        if (!cs.createdAt) return false;
        const csDate = new Date(cs.createdAt).toISOString().split('T')[0];
        return csDate === dateStr;
      });

      const dayRequests = dayPageviews.length;

      // Calculate day tokens
      let dayTokens = 0;
      daySessions.forEach((cs) => {
        dayTokens += cs.stats?.totalTokens || 0;
        if (Array.isArray(cs.messages)) {
          dayTokens += cs.messages.length * 50; // Estimate 50 tokens per message
        }
      });

      apiMetrics.push({
        date: dateStr,
        requests: dayRequests,
        latency: avgLatency + Math.floor(Math.random() * 30) - 15, // Some variation
        successRate: avgSuccessRate,
        failureRate: 100 - avgSuccessRate,
        tokenUsage: dayTokens,
        responseSize: dayTokens * 4,
      });
    }

    // ============================================
    // MODEL USAGE DISTRIBUTION (from chat_sessions)
    // ============================================
    const modelCounts = {};
    chatSessions.forEach((cs) => {
      const model = cs.model || cs.metadata?.model || 'gpt-4';
      modelCounts[model] = (modelCounts[model] || 0) + 1;
    });
    chatInteractions.forEach((ci) => {
      const model = ci.metadata?.model || ci.model || 'gpt-4';
      modelCounts[model] = (modelCounts[model] || 0) + 1;
    });

    const totalModelUsage = Object.values(modelCounts).reduce(
      (a, b) => a + b,
      0
    );
    const colors = [
      '#3B82F6',
      '#10B981',
      '#F59E0B',
      '#EF4444',
      '#8B5CF6',
      '#EC4899',
    ];
    const modelUsage = Object.entries(modelCounts).map(
      ([model, count], idx) => ({
        model,
        usage: count,
        percentage:
          totalModelUsage > 0 ? Math.round((count / totalModelUsage) * 100) : 0,
        color: colors[idx % colors.length],
      })
    );

    // If no model usage, show default
    if (modelUsage.length === 0) {
      modelUsage.push({
        model: 'gpt-4',
        usage: chatSessions.length,
        percentage: 100,
        color: '#3B82F6',
      });
    }

    // ============================================
    // SUCCESS VS FAILURE BY DAY
    // ============================================
    const successFailure = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      // Count sessions for this day
      const daySessions = chatSessions.filter((cs) => {
        if (!cs.createdAt) return false;
        const csDate = new Date(cs.createdAt).toISOString().split('T')[0];
        return csDate === dateStr;
      });

      successFailure.push({
        day: dayName,
        successful: daySessions.length,
        failed: 0,
      });
    }

    // ============================================
    // PEAK TRAFFIC HOURS (from pageviews and sessions)
    // ============================================
    const hourCounts = Array(24).fill(0);
    pageviews.forEach((pv) => {
      const hour = new Date(pv.timestamp).getHours();
      if (!isNaN(hour)) hourCounts[hour]++;
    });
    sessions.forEach((s) => {
      if (s.startTime) {
        const hour = new Date(s.startTime).getHours();
        if (!isNaN(hour)) hourCounts[hour]++;
      }
    });

    const peakTraffic = hourCounts.map((count, hour) => ({
      hour,
      requests: count,
    }));

    // ============================================
    // ERROR TYPES
    // ============================================
    const errorTypes = {
      '4xx Errors': 0,
      '5xx Errors': 0,
      Timeouts: 0,
    };
    chatInteractions
      .filter((ci) => ci.status === 'error')
      .forEach((ci) => {
        const errorType = ci.error?.type || 'Unknown';
        if (errorType.includes('timeout')) errorTypes['Timeouts']++;
        else if (errorType.includes('5')) errorTypes['5xx Errors']++;
        else errorTypes['4xx Errors']++;
      });

    const totalErrors = Object.values(errorTypes).reduce((a, b) => a + b, 0);
    const errors = Object.entries(errorTypes).map(([type, count]) => ({
      type,
      count,
      percentage: totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0,
    }));

    // ============================================
    // GEOGRAPHIC DATA (from sessions)
    // ============================================
    const regionCounts = {};
    sessions.forEach((s) => {
      const region = s.location?.country || s.geo?.country || 'Global';
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });

    // If no regions, use default
    if (Object.keys(regionCounts).length === 0) {
      regionCounts['Global'] = totalRequests;
    }

    const totalRegions = Object.values(regionCounts).reduce((a, b) => a + b, 0);
    const geographic = Object.entries(regionCounts)
      .slice(0, 10)
      .map(([region, count]) => ({
        region,
        requests: count,
        percentage:
          totalRegions > 0 ? Math.round((count / totalRegions) * 100) : 0,
      }));

    // ============================================
    // COST DATA BY MODEL
    // ============================================
    const modelCosts = {
      'gpt-4': 0.03,
      'gpt-4-turbo': 0.01,
      'gpt-4-turbo-preview': 0.01,
      'gpt-3.5-turbo': 0.002,
      'claude-3-opus': 0.015,
      'claude-3-sonnet': 0.003,
      'gemini-pro': 0.00025,
    };

    const costByModel = {};
    chatSessions.forEach((cs) => {
      const model = cs.model || 'gpt-4';
      const tokens =
        cs.stats?.totalTokens ||
        (Array.isArray(cs.messages) ? cs.messages.length * 50 : 0);
      const costRate = modelCosts[model] || 0.01;
      costByModel[model] =
        (costByModel[model] || 0) + (tokens / 1000) * costRate;
    });

    const totalModelCost = Object.values(costByModel).reduce(
      (a, b) => a + b,
      0
    );
    const costData = Object.entries(costByModel).map(([model, cost]) => ({
      model,
      cost: Math.round(cost * 100) / 100,
      percentage:
        totalModelCost > 0 ? Math.round((cost / totalModelCost) * 100) : 0,
    }));

    if (costData.length === 0) {
      costData.push({ model: 'gpt-4', cost: totalCost, percentage: 100 });
    }

    // ============================================
    // TOKEN USAGE TREND
    // ============================================
    const tokenTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      let dayTokens = 0;
      chatSessions.forEach((cs) => {
        if (!cs.createdAt) return;
        const csDate = new Date(cs.createdAt).toISOString().split('T')[0];
        if (csDate === dateStr) {
          dayTokens +=
            cs.stats?.totalTokens ||
            (Array.isArray(cs.messages) ? cs.messages.length * 50 : 0);
        }
      });

      tokenTrend.push({
        date: dateStr,
        tokens: dayTokens,
      });
    }

    // ============================================
    // RETURN RESPONSE
    // ============================================
    const response = {
      stats: {
        totalRequests,
        requestChange,
        avgLatency,
        latencyChange: -5,
        avgSuccessRate,
        successChange: 2,
        totalCost: totalCost || 0.01,
      },
      apiMetrics,
      modelUsage,
      successFailure,
      peakTraffic,
      errors,
      geographic,
      costData,
      tokenTrend,
    };

    console.log(
      `✅ Advanced analytics returned: ${totalRequests} requests, ${avgLatency}ms latency, ${avgSuccessRate}% success, ${totalTokens} tokens, $${totalCost} cost`
    );
    res.json(response);
  } catch (error) {
    console.error('Advanced analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch advanced analytics',
      details: error?.message || String(error),
    });
  }
});

// GET /api/user/rewards/:userId
app.get('/api/user/rewards/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get session ID from HttpOnly cookie
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      return res.status(401).json({ message: 'No session ID' });
    }

    // Use Mongoose connection instead of native client
    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Find user with valid session
    const sessionUser = await users.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Check if user is requesting their own rewards
    if (sessionUser._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get rewards data from rewardscenters collection
    const rewardsCenters = db.collection('rewardscenters');
    let rewardsData = await rewardsCenters.findOne({ userId: userId });

    // If no rewards data exists, create default with some starter content
    if (!rewardsData) {
      // Check user's activity to give appropriate starting rewards
      const chatInteractions = db.collection('chatinteractions');
      const userActivity = await chatInteractions.countDocuments({
        userId: sessionUser._id,
      });

      // Calculate starting rewards based on existing activity
      const startingPoints = Math.min(userActivity * 10, 500); // 10 points per interaction, max 500
      const startingLevel = Math.floor(startingPoints / 100) + 1;
      const pointsThisLevel = startingPoints % 100;
      const pointsToNextLevel = 100 - pointsThisLevel;

      // Give starter badge if user has some activity
      const starterBadges = [];
      const rewardHistory = [];

      if (userActivity > 0) {
        starterBadges.push({
          id: 'first_chat',
          name: 'First Steps',
          description: 'Your first AI conversation',
          earnedAt: new Date(),
          points: 50,
        });
        rewardHistory.push({
          title: 'First Steps Badge',
          points: 50,
          date: new Date(),
          type: 'badge',
        });
      }

      if (userActivity >= 5) {
        starterBadges.push({
          id: 'getting_started',
          name: 'Getting Started',
          description: 'Completed 5 AI conversations',
          earnedAt: new Date(),
          points: 100,
        });
        rewardHistory.push({
          title: 'Getting Started Badge',
          points: 100,
          date: new Date(),
          type: 'badge',
        });
      }

      if (userActivity >= 10) {
        starterBadges.push({
          id: 'ai_enthusiast',
          name: 'AI Enthusiast',
          description: 'Active AI user with 10+ conversations',
          earnedAt: new Date(),
          points: 200,
        });
        rewardHistory.push({
          title: 'AI Enthusiast Badge',
          points: 200,
          date: new Date(),
          type: 'badge',
        });
      }

      const defaultRewards = {
        userId: userId,
        currentLevel: startingLevel,
        totalPoints: startingPoints,
        pointsThisLevel: pointsThisLevel,
        pointsToNextLevel: pointsToNextLevel,
        badges: starterBadges,
        achievements: [],
        rewardHistory: rewardHistory,
        streaks: {
          current: userActivity > 0 ? 1 : 0,
          longest: userActivity > 0 ? Math.min(userActivity, 7) : 0,
        },
        statistics: {
          totalBadgesEarned: starterBadges.length,
          totalAchievementsCompleted: 0,
          averagePointsPerDay:
            userActivity > 0 ? Math.ceil(startingPoints / 7) : 0,
          daysActive: Math.min(userActivity, 30),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await rewardsCenters.insertOne(defaultRewards);
      rewardsData = defaultRewards;
    }

    // Return rewards data
    const { _id, ...rewards } = rewardsData;
    return res.json({ success: true, data: rewards });
  } catch (error) {
    console.error('Rewards error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/user/preferences/:userId
app.get('/api/user/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get session ID from HttpOnly cookie
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      return res.status(401).json({ message: 'No session ID' });
    }

    // Use Mongoose connection instead of native client
    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Find user with valid session
    const sessionUser = await users.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Check if user is requesting their own preferences
    if (sessionUser._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get user preferences from userpreferences collection
    const userPreferences = db.collection('userpreferences');
    let preferences = await userPreferences.findOne({
      userId: new ObjectId(userId),
    });

    // If no preferences exist, create default
    if (!preferences) {
      const defaultPreferences = {
        userId: new ObjectId(userId),
        theme: 'system',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'USD',
        notifications: {
          email: {
            enabled: true,
            frequency: 'immediate',
            types: ['security', 'billing', 'updates'],
          },
          push: {
            enabled: true,
            types: ['messages', 'reminders'],
          },
          sms: {
            enabled: false,
            types: [],
          },
        },
        dashboard: {
          defaultView: 'overview',
          widgets: ['profile', 'security', 'rewards', 'analytics'],
          layout: 'grid',
        },
        accessibility: {
          highContrast: false,
          largeText: false,
          reduceMotion: false,
          screenReader: false,
        },
        privacy: {
          showOnlineStatus: true,
          allowDataCollection: true,
          shareUsageStats: false,
        },
        integrations: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await userPreferences.insertOne(defaultPreferences);
      preferences = defaultPreferences;
    }

    // Return preferences data
    const { _id, ...preferencesData } = preferences;
    return res.json({ success: true, data: preferencesData });
  } catch (error) {
    console.error('Preferences error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/user/preferences/:userId - Update user preferences
app.put('/api/user/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Get session ID from HttpOnly cookie
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      return res.status(401).json({ message: 'No session ID' });
    }

    // Use Mongoose connection instead of native client
    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Find user with valid session
    const sessionUser = await users.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Check if user is updating their own preferences
    if (sessionUser._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate and sanitize update data
    const allowedFields = [
      'theme',
      'language',
      'timezone',
      'dateFormat',
      'timeFormat',
      'currency',
      'notifications',
      'dashboard',
      'accessibility',
      'privacy',
      'integrations',
    ];

    const sanitizedUpdate = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        sanitizedUpdate[field] = updateData[field];
      }
    }

    // Add updated timestamp
    sanitizedUpdate.updatedAt = new Date();

    // Update preferences
    const userPreferences = db.collection('userpreferences');
    const result = await userPreferences.updateOne(
      { userId: new ObjectId(userId) },
      { $set: sanitizedUpdate },
      { upsert: true }
    );

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return res.status(404).json({ message: 'Failed to update preferences' });
    }

    // Get updated preferences
    const updatedPreferences = await userPreferences.findOne({
      userId: new ObjectId(userId),
    });
    const { _id, ...preferencesData } = updatedPreferences;

    return res.json({
      success: true,
      data: preferencesData,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/user/conversations/:userId - Get conversation history
app.get('/api/user/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, search = '' } = req.query;

    // Get session ID from HttpOnly cookie
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      return res.status(401).json({ message: 'No session ID' });
    }

    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');
    const users = db.collection('users');

    // Find user with valid session
    const sessionUser = await users.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Check if user is requesting their own conversations
    if (sessionUser._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Query chat_sessions collection (main conversation data)
    // userId is stored as string in chat_sessions
    const chatSessions = db.collection('chat_sessions');
    const userIdStr = sessionUser._id.toString();

    // Build base query - userId is stored as string in chat_sessions
    const query = { userId: userIdStr };

    // Add search functionality
    if (search) {
      query.$or = [
        { agentId: { $regex: search, $options: 'i' } },
        {
          messages: {
            $elemMatch: { content: { $regex: search, $options: 'i' } },
          },
        },
      ];
    }

    // Get total count for pagination
    const total = await chatSessions.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    console.log(
      `[Conversations] User ${userIdStr}: Found ${total} conversations`
    );

    // Get conversations with pagination, sorted by most recent
    const conversations = await chatSessions
      .find(query)
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .toArray();

    // Transform conversations for frontend
    const transformedConversations = conversations.map((conv) => {
      const messages = conv.messages || [];
      const messageCount = messages.length;
      const lastMessage =
        messages.length > 0 ? messages[messages.length - 1] : null;

      // Calculate approximate duration (estimate based on message count)
      const estimatedDuration = Math.max(1, Math.ceil(messageCount * 1.5)); // ~1.5 min per message

      // Get conversation topic (use first user message or fallback)
      let topic = 'General Conversation';
      if (messages.length > 0) {
        const firstUserMessage = messages.find((msg) => msg.role === 'user');
        if (firstUserMessage && firstUserMessage.content) {
          // Extract first 80 characters as topic
          topic = firstUserMessage.content.substring(0, 80);
          if (firstUserMessage.content.length > 80) topic += '...';
        }
      }

      // Format agent name nicely
      const agentId = conv.agentId || 'assistant';
      const agentName = agentId
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Get date from updatedAt, createdAt, or _id timestamp
      let dateStr = new Date().toISOString().split('T')[0];
      if (conv.updatedAt) {
        dateStr = new Date(conv.updatedAt).toISOString().split('T')[0];
      } else if (conv.createdAt) {
        dateStr = new Date(conv.createdAt).toISOString().split('T')[0];
      } else if (conv._id) {
        // Extract timestamp from ObjectId
        dateStr = new Date(conv._id.getTimestamp()).toISOString().split('T')[0];
      }

      return {
        id: conv._id.toString(),
        agent: agentName,
        agentId: agentId,
        topic: topic,
        date: dateStr,
        duration: `${estimatedDuration}m`,
        messageCount: messageCount,
        lastMessage: lastMessage
          ? {
              content:
                (lastMessage.content || '').substring(0, 100) +
                ((lastMessage.content || '').length > 100 ? '...' : ''),
              timestamp:
                lastMessage.timestamp || conv.updatedAt || conv.createdAt,
            }
          : null,
        timestamp: conv.updatedAt || conv.createdAt || new Date(),
      };
    });

    return res.json({
      success: true,
      data: {
        conversations: transformedConversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          totalPages: totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error('Conversation history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/user/conversations/:userId/export - Export conversations as JSON or CSV
app.get('/api/user/conversations/:userId/export', async (req, res) => {
  try {
    const { userId } = req.params;
    const { format = 'json' } = req.query;

    // Get session ID from HttpOnly cookie
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      return res.status(401).json({ message: 'No session ID' });
    }

    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');
    const users = db.collection('users');

    // Find user with valid session
    const sessionUser = await users.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Check if user is requesting their own conversations
    if (sessionUser._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Query all chat_sessions for this user
    const chatSessions = db.collection('chat_sessions');
    const userIdStr = sessionUser._id.toString();

    const conversations = await chatSessions
      .find({ userId: userIdStr })
      .sort({ updatedAt: -1, createdAt: -1 })
      .toArray();

    console.log(
      `[Export] Exporting ${conversations.length} conversations for user ${userIdStr}`
    );

    if (format === 'csv') {
      // Generate CSV
      const csvRows = ['Date,Agent,Messages,Topic,Duration'];

      conversations.forEach((conv) => {
        const messages = conv.messages || [];
        const agentId = conv.agentId || 'assistant';
        const agentName = agentId
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        let topic = 'General Conversation';
        if (messages.length > 0) {
          const firstUserMsg = messages.find((m) => m.role === 'user');
          if (firstUserMsg?.content) {
            topic = firstUserMsg.content.substring(0, 50).replace(/"/g, '""');
          }
        }

        let dateStr = new Date().toISOString().split('T')[0];
        if (conv.updatedAt)
          dateStr = new Date(conv.updatedAt).toISOString().split('T')[0];
        else if (conv.createdAt)
          dateStr = new Date(conv.createdAt).toISOString().split('T')[0];
        else if (conv._id)
          dateStr = new Date(conv._id.getTimestamp())
            .toISOString()
            .split('T')[0];

        const duration = `${Math.max(1, Math.ceil(messages.length * 1.5))}m`;

        csvRows.push(
          `"${dateStr}","${agentName}",${messages.length},"${topic}","${duration}"`
        );
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="conversations_${
          new Date().toISOString().split('T')[0]
        }.csv"`
      );
      return res.send(csvRows.join('\n'));
    }

    // Default: JSON format with full conversation data
    const exportData = {
      exportDate: new Date().toISOString(),
      totalConversations: conversations.length,
      conversations: conversations.map((conv) => {
        const messages = conv.messages || [];
        const agentId = conv.agentId || 'assistant';

        return {
          id: conv._id.toString(),
          agent: agentId,
          messageCount: messages.length,
          createdAt: conv.createdAt || conv._id?.getTimestamp(),
          updatedAt: conv.updatedAt,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          })),
        };
      }),
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="conversations_${
        new Date().toISOString().split('T')[0]
      }.json"`
    );
    return res.json(exportData);
  } catch (error) {
    console.error('Conversation export error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const PLAN_TEMPLATES = [
  {
    key: 'daily',
    name: 'Daily Agent Access',
    description: '$1 per day per agent',
    defaultPrice: 1,
    billingPeriod: 'daily',
    interval: 'day',
    slugMatches: ['daily-agent-access', 'daily-agent'],
  },
  {
    key: 'weekly',
    name: 'Weekly Agent Access',
    description: '$5 per week per agent',
    defaultPrice: 5,
    billingPeriod: 'weekly',
    interval: 'week',
    slugMatches: ['weekly-agent-access', 'weekly-agent'],
  },
  {
    key: 'monthly',
    name: 'Monthly Agent Access',
    description: '$15 per month per agent',
    defaultPrice: 19,
    billingPeriod: 'monthly',
    interval: 'month',
    slugMatches: ['monthly-agent-access', 'monthly-agent'],
  },
];

const normalizePlanKey = (value) => {
  if (!value || typeof value !== 'string') return null;
  const normalized = value.toLowerCase();
  if (normalized.startsWith('day')) return 'daily';
  if (normalized.startsWith('week')) return 'weekly';
  if (normalized.startsWith('month')) return 'monthly';
  return normalized;
};

const derivePlanKeyFromName = (value) => {
  if (!value || typeof value !== 'string') return null;
  const normalized = value.toLowerCase();
  if (normalized.includes('daily')) return 'daily';
  if (normalized.includes('week')) return 'weekly';
  if (normalized.includes('month')) return 'monthly';
  return null;
};

const buildPlanOptions = (planDocs = []) => {
  return PLAN_TEMPLATES.map((template) => {
    const match = planDocs.find((doc) => {
      const slug = (doc.slug || '').toLowerCase();
      const name = (doc.name || '').toLowerCase();
      const displayName = (doc.displayName || '').toLowerCase();
      const billingPeriod = (
        doc.billingPeriod ||
        doc?.pricing?.interval ||
        doc?.price?.interval ||
        ''
      ).toLowerCase();
      return (
        slug.includes(template.key) ||
        template.slugMatches?.some((candidate) =>
          candidate ? slug.includes(candidate) : false
        ) ||
        name.includes(template.key) ||
        displayName.includes(template.key) ||
        billingPeriod.startsWith(template.interval.replace('ly', ''))
      );
    });

    const amountCents =
      match?.pricing?.amount ??
      match?.price?.amount ??
      Math.round(template.defaultPrice * 100);

    const currency =
      match?.pricing?.currency ?? match?.price?.currency ?? 'USD';

    return {
      id: match?._id?.toString() ?? template.key,
      key: template.key,
      name: match?.displayName || match?.name || template.name,
      description: match?.description || template.description,
      price: amountCents / 100,
      currency,
      billingPeriod: template.billingPeriod,
      interval: template.interval,
      status: 'not_active',
      isActive: false,
    };
  });
};

const applyPlanStatuses = (planOptions, activeKey) =>
  planOptions.map((plan) => {
    const isActive = activeKey ? plan.key === activeKey : false;
    return {
      ...plan,
      status: isActive ? 'active' : 'not_active',
      isActive,
    };
  });

const getUsageDefaults = (planKey) => {
  switch (planKey) {
    case 'daily':
      return { apiCalls: 500, storage: 1024 };
    case 'weekly':
      return { apiCalls: 2500, storage: 2048 };
    default:
      return { apiCalls: 15000, storage: 10240 };
  }
};

// GET /api/user/billing/:userId - Get comprehensive billing data
app.get('/api/user/billing/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get session ID from HttpOnly cookie
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      return res.status(401).json({ message: 'No session ID' });
    }

    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');
    const users = db.collection('users');

    // Find user with valid session
    const sessionUser = await users.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Check if user is requesting their own billing data
    if (sessionUser._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get collections (only those that exist and have data)
    const subscriptions = db.collection('subscriptions');
    const plans = db.collection('plans');
    const invoices = db.collection('invoices');
    const payments = db.collection('payments');
    const billings = db.collection('billings');

    const planDocs = await plans.find({}).toArray();
    const basePlanOptions = buildPlanOptions(planDocs);

    // Check for agent subscriptions in subscriptions collection (NOT agentsubscriptions!)
    // Agent purchases are stored in subscriptions collection with agentId field
    // Filter by current user's subscriptions only
    const now = new Date();
    const activeAgentSubscriptions = await subscriptions
      .find({
        user: sessionUser._id, // Filter by current user
        agentId: { $exists: true, $ne: null },
        status: 'active',
      })
      .sort({ updatedAt: -1 })
      .toArray();

    // Get user's active platform subscription (fallback)
    const activeSubscription = await subscriptions.findOne({
      user: sessionUser._id,
      status: { $in: ['active', 'trialing', 'past_due'] },
    });

    // Get user's plan details
    let currentPlan = null;
    if (activeSubscription?.plan) {
      currentPlan = await plans.findOne({ _id: activeSubscription.plan });
    }

    // If has agent subscriptions, show agent-based billing
    if (activeAgentSubscriptions.length > 0) {
      // Calculate total monthly cost from agent subscriptions
      let totalMonthly = 0;
      const agentDetails = [];

      for (const sub of activeAgentSubscriptions) {
        // Get plan type from billing.interval or plan field
        const planType =
          sub.billing?.interval === 'day'
            ? 'daily'
            : sub.billing?.interval === 'week'
            ? 'weekly'
            : sub.billing?.interval === 'month'
            ? 'monthly'
            : sub.plan;

        // Calculate monthly cost
        let monthlyCost = 0;
        if (planType === 'daily') monthlyCost = 1 * 30;
        else if (planType === 'weekly') monthlyCost = 5 * 4;
        else if (planType === 'monthly') monthlyCost = 19;

        // Get actual price from billing or calculated
        const actualPrice = sub.billing?.amount
          ? sub.billing.amount / 100
          : monthlyCost;
        totalMonthly += monthlyCost;

        // Get expiry date from billing.currentPeriodEnd
        const expiryDate = sub.billing?.currentPeriodEnd
          ? new Date(sub.billing.currentPeriodEnd)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const daysRemaining = Math.ceil(
          (expiryDate - now) / (1000 * 60 * 60 * 24)
        );

        agentDetails.push({
          agentId: sub.agentId,
          agentName: sub.agentName || sub.agentId,
          plan: planType,
          price: actualPrice,
          expiryDate: expiryDate,
          daysRemaining: Math.max(0, daysRemaining),
        });
      }

      // Find earliest and latest expiry dates
      const expiryDates = activeAgentSubscriptions
        .map((s) => new Date(s.billing?.currentPeriodEnd || Date.now()))
        .filter((d) => !isNaN(d.getTime()));

      const earliestExpiry = expiryDates.length
        ? new Date(Math.min(...expiryDates))
        : new Date();
      const latestExpiry = expiryDates.length
        ? new Date(Math.max(...expiryDates))
        : new Date();
      const avgDaysRemaining = Math.max(
        0,
        Math.ceil((latestExpiry - now) / (1000 * 60 * 60 * 24))
      );

      // Fetch user's invoices
      const userInvoices = await invoices
        .find({ userId: sessionUser._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();

      // Fetch user's payments
      const userPayments = await payments
        .find({ userId: sessionUser._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();

      // Fetch user's billing history
      const userBillingHistory = await billings
        .find({ userId: sessionUser._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();

      const billingData = {
        currentPlan: {
          name: `${activeAgentSubscriptions.length} Active Agent${
            activeAgentSubscriptions.length > 1 ? 's' : ''
          }`,
          type: 'agent-subscription',
          price: totalMonthly,
          currency: 'USD',
          period: 'monthly',
          status: 'active',
          renewalDate: latestExpiry.toISOString().split('T')[0],
          daysUntilRenewal: avgDaysRemaining,
          agents: agentDetails,
        },
        planOptions: [
          {
            key: 'daily',
            name: '$1.00 / daily',
            billingPeriod: 'daily',
            price: 1,
            description:
              '$1 per day per agent - Perfect for short-term projects',
            status: activeAgentSubscriptions.some(
              (s) =>
                s.billing?.interval === 'day' ||
                s.plan === 'daily' ||
                (typeof s.plan === 'string' && s.plan.includes('daily'))
            )
              ? 'active'
              : 'inactive',
          },
          {
            key: 'weekly',
            name: '$5.00 / weekly',
            billingPeriod: 'weekly',
            price: 5,
            description:
              '$5 per week per agent - Great for weekly projects and testing',
            status: activeAgentSubscriptions.some(
              (s) =>
                s.billing?.interval === 'week' ||
                s.plan === 'weekly' ||
                (typeof s.plan === 'string' && s.plan.includes('weekly'))
            )
              ? 'active'
              : 'inactive',
          },
          {
            key: 'monthly',
            name: '$1.00 / monthly',
            billingPeriod: 'monthly',
            price: 1,
            description:
              '$15 per month per agent - Best value for continuous access',
            status: activeAgentSubscriptions.some(
              (s) =>
                s.billing?.interval === 'month' ||
                s.plan === 'monthly' ||
                (typeof s.plan === 'string' && s.plan.includes('monthly'))
            )
              ? 'active'
              : 'inactive',
          },
        ],
        usage: {
          currentPeriod: {
            apiCalls: {
              used: 0,
              limit: 15000 * activeAgentSubscriptions.length,
              percentage: 0,
            },
            storage: {
              used: 0,
              limit: 10240 * activeAgentSubscriptions.length,
              percentage: 0,
              unit: 'MB',
            },
          },
          billingCycle: {
            start: earliestExpiry.toISOString().split('T')[0],
            end: latestExpiry.toISOString().split('T')[0],
          },
        },
        invoices: userInvoices.map((inv) => ({
          id: inv._id.toString(),
          date: inv.createdAt?.toISOString().split('T')[0] || 'N/A',
          description: `${inv.agentName || inv.agentId} (${inv.plan})`,
          amount: `$${inv.amount.toFixed(2)}`,
          status: inv.status,
          paidAt: inv.paidAt?.toISOString().split('T')[0] || 'N/A',
        })),
        paymentMethods:
          userPayments.length > 0
            ? [
                {
                  type: userPayments[0].paymentMethod || 'card',
                  last4: userPayments[0].last4 || '****',
                  brand: userPayments[0].brand || 'Unknown',
                  isDefault: true,
                },
              ]
            : [],
        billingHistory: userBillingHistory.map((hist) => ({
          id: hist._id.toString(),
          date: hist.createdAt?.toISOString().split('T')[0] || 'N/A',
          description: hist.description,
          amount: hist.amount ? `$${hist.amount.toFixed(2)}` : '$0.00',
          type: hist.type,
        })),
        upcomingCharges: agentDetails.map((agent) => ({
          description: `${agent.agentName} (${agent.plan}) - Renewal`,
          amount: `$${agent.price.toFixed(2)}`,
          date: agent.expiryDate.toISOString().split('T')[0],
        })),
        costBreakdown: {
          subscription: totalMonthly,
          usage: 0,
          taxes: 0,
          total: totalMonthly,
        },
      };

      return res.json({ success: true, data: billingData });
    }

    // If no agent subscriptions and no platform subscription, create default billing data
    if (!activeSubscription) {
      const planOptions = applyPlanStatuses(basePlanOptions, null);
      const fallbackPlanKey =
        planOptions.find((plan) => plan.key === 'monthly')?.key ||
        planOptions[0]?.key ||
        'monthly';
      const usageDefaults = getUsageDefaults(fallbackPlanKey);
      const billingCycleEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const billingData = {
        currentPlan: {
          name: 'No Active Plan',
          type: 'none',
          price: 0,
          currency: 'USD',
          period: fallbackPlanKey,
          status: 'inactive',
          renewalDate: null,
          daysUntilRenewal: 0,
        },
        planOptions,
        usage: {
          currentPeriod: {
            apiCalls: {
              used: 0,
              limit: usageDefaults.apiCalls,
              percentage: 0,
            },
            storage: {
              used: 0,
              limit: usageDefaults.storage,
              percentage: 0,
              unit: 'MB',
            },
          },
          billingCycle: {
            start: new Date().toISOString().split('T')[0],
            end: billingCycleEnd.toISOString().split('T')[0],
          },
        },
        invoices: [],
        paymentMethods: [],
        billingHistory: [],
        upcomingCharges: [],
        costBreakdown: {
          subscription: 0,
          usage: 0,
          taxes: 0,
          total: 0,
        },
      };

      return res.json({ success: true, data: billingData });
    }

    // Get current billing period usage (stubbed - usageMetrics collection doesn't exist)
    const currentPeriodStart =
      activeSubscription.billing?.currentPeriodStart || new Date();
    const currentPeriodEnd =
      activeSubscription.billing?.currentPeriodEnd ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const usageData = null; // usageMetrics collection doesn't exist

    // Note: invoices and payments collections don't exist - returning empty arrays
    const userInvoices = [];
    const paymentHistory = [];

    // Calculate usage statistics
    const planLimits = currentPlan?.features || {
      apiCalls: 10000,
      storage: 10240,
    }; // 10GB default
    const currentUsage = {
      apiCalls: usageData?.apiCalls || 0, // Real data only
      storage: usageData?.storage || 0, // Real storage usage
    };

    const apiCallsPercentage = Math.min(
      100,
      Math.round((currentUsage.apiCalls / planLimits.apiCalls) * 100)
    );
    const storagePercentage = Math.min(
      100,
      Math.round((currentUsage.storage / planLimits.storage) * 100)
    );

    const activePlanKey =
      normalizePlanKey(activeSubscription?.billing?.interval) ||
      derivePlanKeyFromName(activeSubscription?.planName) ||
      normalizePlanKey(currentPlan?.billingPeriod);
    const planOptions = applyPlanStatuses(basePlanOptions, activePlanKey);

    // Build comprehensive billing response
    const billingData = {
      currentPlan: {
        name:
          currentPlan?.name ||
          currentPlan?.displayName ||
          `${
            activePlanKey
              ? activePlanKey.charAt(0).toUpperCase() + activePlanKey.slice(1)
              : 'Monthly'
          } Access`,
        type: activePlanKey || currentPlan?.type || 'paid',
        price: activeSubscription.billing?.amount / 100 || 49.99, // Convert cents to dollars
        currency: activeSubscription.billing?.currency || 'USD',
        period: activeSubscription.billing?.interval || 'monthly',
        status: activeSubscription.status || 'active',
        renewalDate: currentPeriodEnd.toISOString().split('T')[0],
        daysUntilRenewal: Math.ceil(
          (currentPeriodEnd - new Date()) / (1000 * 60 * 60 * 24)
        ),
      },
      planOptions,
      usage: {
        currentPeriod: {
          apiCalls: {
            used: currentUsage.apiCalls,
            limit: planLimits.apiCalls,
            percentage: apiCallsPercentage,
          },
          storage: {
            used: currentUsage.storage,
            limit: planLimits.storage,
            percentage: storagePercentage,
            unit: 'MB',
          },
        },
        billingCycle: {
          start: currentPeriodStart.toISOString().split('T')[0],
          end: currentPeriodEnd.toISOString().split('T')[0],
        },
      },
      invoices: userInvoices.map((inv) => ({
        id: inv._id.toString(),
        number:
          inv.invoiceNumber ||
          `INV-${inv._id.toString().slice(-6).toUpperCase()}`,
        date: inv.createdAt.toISOString().split('T')[0],
        amount: `$${((inv.financial?.total || 0) / 100).toFixed(2)}`,
        status: inv.status || 'paid',
      })),
      paymentMethods: [], // Could be enhanced with stored payment methods
      billingHistory: paymentHistory.map((payment) => ({
        id: payment._id.toString(),
        date: payment.createdAt.toISOString().split('T')[0],
        description:
          payment.description || `${currentPlan?.name || 'Professional'} Plan`,
        amount: `$${((payment.amount || 0) / 100).toFixed(2)}`,
        status: payment.status || 'completed',
        method: payment.paymentMethod || 'card',
      })),
      upcomingCharges:
        activeSubscription.status === 'active'
          ? [
              {
                description: `${
                  currentPlan?.name ||
                  currentPlan?.displayName ||
                  'Monthly Agent Access'
                } Plan - Next billing cycle`,
                amount: `$${(
                  (activeSubscription.billing?.amount || 4999) / 100
                ).toFixed(2)}`,
                date: currentPeriodEnd.toISOString().split('T')[0],
              },
            ]
          : [],
      costBreakdown: {
        subscription: (activeSubscription.billing?.amount || 4999) / 100,
        usage: 0, // Could calculate overage fees
        taxes: ((activeSubscription.billing?.amount || 4999) / 100) * 0.08, // 8% tax estimate
        total: ((activeSubscription.billing?.amount || 4999) / 100) * 1.08,
      },
    };

    return res.json({ success: true, data: billingData });
  } catch (error) {
    console.error('Billing error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/user/subscriptions/:userId
app.get('/api/user/subscriptions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get session ID from HttpOnly cookie
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      return res.status(401).json({ message: 'No session ID' });
    }

    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');
    const users = db.collection('users');

    // Find user with valid session
    const sessionUser = await users.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Check if user is requesting their own subscriptions
    if (sessionUser._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get user subscriptions
    const subscriptions = db.collection('subscriptions');
    const userSubscriptions = await subscriptions
      .find({ user: userId })
      .toArray();

    return res.json({ success: true, data: userSubscriptions });
  } catch (error) {
    console.error('Subscriptions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/agent/performance/:agentId - Get agent performance metrics
// NOTE: Agent metrics collections not implemented - returning stub data
app.get('/api/agent/performance/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;

    // Return stub data since agentmetrics and performancemetrics collections don't exist
    // TODO: Implement agent metrics tracking or remove this endpoint
    const performanceData = {
      success: true,
      data: {
        agentId: agentId,
        agentName: agentId,
        timeRange: req.query.timeRange || '7d',
        metrics: {
          totalConversations: 0,
          totalMessages: 0,
          avgResponseTime: 0,
          uniqueUsers: 0,
          successRate: 100,
        },
        dailyStats: [],
        topTopics: [],
        sentiment: {
          positive: 0,
          neutral: 0,
          negative: 0,
        },
      },
    };

    console.log(
      '⚠️ Agent performance stub data returned - collections not implemented'
    );
    return res.json(performanceData);
  } catch (error) {
    console.error('Agent performance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/user/security/:userId
app.get('/api/user/security/:userId', async (req, res) => {
  try {
    const prevStats = previousStats[0] || {
      totalConversations: 0,
      totalMessages: 0,
      avgResponseTime: 0,
    };

    // Calculate trends
    const calculateTrend = (current, previous) => {
      if (previous === 0) return { change: '+100%', trend: 'up' };
      const percentChange = ((current - previous) / previous) * 100;
      const change =
        percentChange >= 0
          ? `+${percentChange.toFixed(1)}%`
          : `${percentChange.toFixed(1)}%`;
      return { change, trend: percentChange >= 0 ? 'up' : 'down' };
    };

    const conversationTrend = calculateTrend(
      stats.totalConversations,
      prevStats.totalConversations
    );
    const messageTrend = calculateTrend(
      stats.totalMessages,
      prevStats.totalMessages
    );
    const responseTimeTrend = calculateTrend(
      prevStats.avgResponseTime || 1,
      stats.avgResponseTime || 1
    ); // Inverted for response time

    // Get recent activity
    const recentActivity = await chatInteractions
      .find({
        agentName: { $regex: agentInfo.name, $options: 'i' },
        createdAt: { $gte: startDate },
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Transform recent activity
    const transformedActivity = recentActivity.map((activity) => {
      const activityDate =
        activity.createdAt || activity.startedAt || activity.timestamp || now;
      const minutesAgo = Math.floor(
        (now - new Date(activityDate)) / (1000 * 60)
      );
      const timeAgo =
        minutesAgo < 60
          ? `${minutesAgo} min ago`
          : `${Math.floor(minutesAgo / 60)} hours ago`;

      // Get first user message as description
      const firstMessage = activity.messages?.find(
        (msg) => msg.role === 'user'
      );
      const description =
        firstMessage?.content?.substring(0, 60) + '...' ||
        'New conversation started';

      return {
        timestamp: timeAgo,
        type: 'conversation',
        description: description,
        user: activity.userId || 'Anonymous',
      };
    });

    // Query real satisfaction score from feedback/ratings in database
    // For now return 0 until real feedback system is implemented
    const satisfactionScore = 0;

    // Build performance response
    const performanceData = {
      agent: {
        name: agentInfo.name,
        type: agentInfo.type,
        avatar: agentInfo.avatar,
        status: stats.totalConversations > 0 ? 'active' : 'idle',
      },
      metrics: {
        totalConversations: stats.totalConversations,
        totalMessages: stats.totalMessages,
        averageResponseTime:
          Math.round((stats.avgResponseTime || 1.2) * 10) / 10, // Round to 1 decimal
        satisfactionScore: Math.round(satisfactionScore * 10) / 10,
        activeUsers: stats.uniqueUsers.length,
        uptime: 0, // Should be calculated from process.uptime() or external monitoring
      },
      trends: {
        conversations: {
          value: stats.totalConversations,
          change: conversationTrend.change,
          trend: conversationTrend.trend,
        },
        messages: {
          value: stats.totalMessages,
          change: messageTrend.change,
          trend: messageTrend.trend,
        },
        responseTime: {
          value: Math.round((stats.avgResponseTime || 1.2) * 10) / 10,
          change: responseTimeTrend.change,
          trend: responseTimeTrend.trend,
        },
        satisfaction: {
          value: Math.round(satisfactionScore * 10) / 10,
          change: '+0.1',
          trend: 'up',
        },
      },
      recentActivity: transformedActivity,
      timeRange: timeRange,
      dataRefreshed: new Date().toISOString(),
    };

    return res.json({ success: true, data: performanceData });
  } catch (error) {
    console.error('Agent performance error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/user/security/:userId
app.get('/api/user/security/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get session ID from HttpOnly cookie
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      return res.status(401).json({ message: 'No session ID' });
    }

    // Use Mongoose connection instead of native client
    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Find user with valid session
    const sessionUser = await users.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Check if user is requesting their own security info
    if (sessionUser._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get user security data from usersecurities collection
    const userSecurities = db.collection('usersecurities');
    let userSecurity = await userSecurities.findOne({ userId: userId });

    // If no security data exists, create default
    if (!userSecurity) {
      // Get user agent and IP for current session
      const userAgent = req.get('User-Agent') || 'Unknown Browser';
      const userIP = req.ip || req.connection.remoteAddress || 'unknown';

      // Create a current device entry
      const currentDevice = {
        id: 1,
        name: detectDeviceName(userAgent),
        type: detectDeviceType(userAgent),
        lastSeen: new Date().toISOString(),
        location: 'Current Location',
        browser: detectBrowser(userAgent),
        current: true,
        ipAddress: userIP,
      };

      // Create current login entry
      const currentLogin = {
        timestamp: new Date(),
        ipAddress: userIP,
        userAgent: userAgent,
        success: true,
        location: 'Current Location',
      };

      const defaultSecurity = {
        userId: userId,
        email: sessionUser.email,
        passwordLastChanged: sessionUser.createdAt || new Date(),
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: [],
        trustedDevices: [currentDevice],
        loginHistory: [currentLogin],
        securityQuestions: [],
        accountLocked: false,
        lockReason: null,
        lockExpires: null,
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        securityScore: 75, // Starting score
        recommendations: [
          {
            id: 1,
            type: 'warning',
            title: 'Enable Two-Factor Authentication',
            description: 'Secure your account with 2FA for better protection',
            priority: 'high',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await userSecurities.insertOne(defaultSecurity);
      userSecurity = defaultSecurity;
    }

    // Enhance security data with real-time calculations
    const enhancedSecurityData = {
      ...userSecurity,
      securityScore: calculateSecurityScore(userSecurity),
      recommendations: generateSecurityRecommendations(userSecurity),
      lastPasswordChange: userSecurity.passwordLastChanged
        ? userSecurity.passwordLastChanged.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    };

    // Return security data
    const { _id, ...securityData } = enhancedSecurityData;
    return res.json({ success: true, data: securityData });
  } catch (error) {
    console.error('Security error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/user/security/:userId - Update user security settings
app.put('/api/user/security/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Get session ID from HttpOnly cookie
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      return res.status(401).json({ message: 'No session ID' });
    }

    // Use Mongoose connection instead of native client
    const db = mongoose.connection.db;
    const users = db.collection('users');

    // Find user with valid session
    const sessionUser = await users.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Check if user is updating their own security settings
    if (sessionUser._id.toString() !== userId) {
      console.log('❌ Security Update Access denied - User ID mismatch');
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate update data (basic validation)
    const allowedFields = [
      'twoFactorEnabled',
      'trustedDevices',
      'securityQuestions',
    ];

    const filteredUpdateData = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field];
      }
    }

    // Add updated timestamp
    filteredUpdateData.updatedAt = new Date();

    // Update user security in usersecurities collection
    const userSecurities = db.collection('usersecurities');
    const result = await userSecurities.updateOne(
      { userId: userId },
      { $set: filteredUpdateData },
      { upsert: true }
    );

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return res.status(404).json({ message: 'Security settings not found' });
    }

    // Get updated security data
    const updatedSecurity = await userSecurities.findOne({ userId: userId });
    const { _id, ...securityData } = updatedSecurity;

    return res.json({
      success: true,
      data: securityData,
      message: 'Security settings updated successfully',
    });
  } catch (error) {
    console.error('Security update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/user/security/change-password - Change user password
app.post('/api/user/security/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Current password and new password are required' });
    }

    // Get session ID from HttpOnly cookie
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      return res.status(401).json({ message: 'No session ID' });
    }

    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');
    const users = db.collection('users');

    // Find user with valid session
    const sessionUser = await users.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      sessionUser.password
    );
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password in users collection
    await users.updateOne(
      { _id: sessionUser._id },
      {
        $set: {
          password: hashedNewPassword,
          passwordLastChanged: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // Update security record
    const userSecurities = db.collection('usersecurities');
    await userSecurities.updateOne(
      { userId: sessionUser._id.toString() },
      {
        $set: {
          passwordLastChanged: new Date(),
          updatedAt: new Date(),
        },
        $unset: {
          accountLocked: false,
          lockReason: null,
          lockExpires: null,
          failedLoginAttempts: 0,
          lastFailedLogin: null,
        },
      },
      { upsert: true }
    );

    return res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/user/security/2fa/disable - Disable 2FA
app.post('/api/user/security/2fa/disable', async (req, res) => {
  try {
    // Get session ID from HttpOnly cookie
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      return res.status(401).json({ message: 'No session ID' });
    }

    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');
    const users = db.collection('users');

    // Find user with valid session
    const sessionUser = await users.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Update security record to disable 2FA
    const userSecurities = db.collection('usersecurities');
    await userSecurities.updateOne(
      { userId: sessionUser._id.toString() },
      {
        $set: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
          backupCodes: [],
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return res.json({
      success: true,
      message: 'Two-factor authentication disabled successfully',
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/user/security/2fa/verify - Verify 2FA setup
app.post('/api/user/security/2fa/verify', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    // Get session ID from HttpOnly cookie
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      return res.status(401).json({ message: 'No session ID' });
    }

    const client = await getClientPromise();
    const db = client.db(process.env.MONGODB_DB || 'onelastai');
    const users = db.collection('users');

    // Find user with valid session
    const sessionUser = await users.findOne({
      sessionId: sessionId,
      sessionExpiry: { $gt: new Date() },
    });

    if (!sessionUser) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // For now, just enable 2FA (in a real implementation, you'd verify the TOTP code)
    // TODO: Implement proper TOTP verification
    const userSecurities = db.collection('usersecurities');
    await userSecurities.updateOne(
      { userId: sessionUser._id.toString() },
      {
        $set: {
          twoFactorEnabled: true,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return res.json({
      success: true,
      message: 'Two-factor authentication enabled successfully',
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ============================================================================
// AGENTS ENDPOINTS
// ============================================================================

// GET /api/agents - List all available agents
app.get('/api/agents', async (req, res) => {
  try {
    console.log('📋 Fetching all agents...');

    // Use Mongoose connection
    const db = mongoose.connection.db;
    const agentsCollection = db.collection('agents');

    const agents = await agentsCollection.find({}).toArray();

    console.log(`✅ Found ${agents.length} agents`);

    res.json({
      success: true,
      count: agents.length,
      agents: agents,
    });
  } catch (error) {
    console.error('❌ Error fetching agents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve agents',
      error: error.message,
    });
  }
});

// GET /api/agents/:agentId - Get specific agent details
app.get('/api/agents/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    console.log(`🔍 Fetching agent: ${agentId}`);

    // Use Mongoose connection
    const db = mongoose.connection.db;
    const agentsCollection = db.collection('agents');

    // Try to find by _id or by slug/name
    let agent = null;

    // Try ObjectId first
    try {
      agent = await agentsCollection.findOne({ _id: new ObjectId(agentId) });
    } catch (e) {
      // Not a valid ObjectId, try slug/name
    }

    if (!agent) {
      agent = await agentsCollection.findOne({
        $or: [
          { agentId: agentId },
          { slug: agentId },
          { name: agentId },
          { id: agentId },
        ],
      });
    }

    if (!agent) {
      console.log(`❌ Agent not found: ${agentId}`);
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
    }

    console.log(`✅ Found agent: ${agent.name || agent.slug}`);

    res.json({
      success: true,
      agent: agent,
    });
  } catch (error) {
    console.error('❌ Error fetching agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve agent',
      error: error.message,
    });
  }
});

// Language detection endpoint (rate limited: 20/min)
app.post('/api/language-detect', rateLimiters.agent, async (req, res) => {
  try {
    const { text, preferredProvider = 'openai' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required for language detection',
      });
    }

    // Simple pattern-based detection for demo
    const patterns = {
      es: /\b(hola|gracias|por favor|como estas|buenos dias|buenas tardes|el|la|los|las|de|en|un|una|para|con|por|que|este|esta|como|muy|bien|ser|hacer|tener|sí|no)\b/gi,
      fr: /\b(bonjour|merci|s\'il vous plaît|comment allez-vous|bonsoir|le|la|les|de|en|un|une|pour|avec|par|que|ce|cette|comme|très|bien|être|faire|avoir|oui|non)\b/gi,
      de: /\b(hallo|danke|bitte|wie geht es|guten tag|guten morgen|der|die|das|den|dem|des|ein|eine|einen|einem|und|oder|ist|sind|haben|sein|mit|für|auf|ja|nein)\b/gi,
      it: /\b(ciao|grazie|prego|come stai|buongiorno|buonasera|il|la|lo|le|gli|di|in|un|una|per|con|da|che|questo|questa|come|molto|bene|essere|fare|avere|sì|no)\b/gi,
    };

    let bestMatch = { code: 'en', confidence: 0.5 };

    for (const [lang, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern);
      const confidence = matches ? Math.min(matches.length / 5, 0.9) : 0;

      if (confidence > bestMatch.confidence && confidence > 0.3) {
        bestMatch = { code: lang, confidence };
      }
    }

    res.json({
      success: true,
      language: bestMatch,
      provider: 'pattern-detection',
    });
  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Language detection failed',
    });
  }
});

// Chat endpoint for AI responses (rate limited: 20/min)
app.post('/api/chat', rateLimiters.agent, async (req, res) => {
  try {
    const {
      message,
      provider = 'openai',
      agent,
      language = 'en',
      attachments,
    } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    let response = null;

    // Use OpenAI if available
    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      try {
        response = await getOpenAIResponse(
          message,
          agent,
          language,
          attachments
        );
      } catch (error) {
        console.error('OpenAI error:', error);
        response = null;
      }
    }

    // Fallback to enhanced simulation if no API response
    if (!response) {
      response = await getEnhancedSimulatedResponse(
        message,
        agent,
        language,
        attachments
      );
    }

    res.json({
      success: true,
      response,
      provider: response.includes('simulated') ? 'simulation' : provider,
      agent,
      language,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      success: false,
      error: 'Chat processing failed',
    });
  }
});

// Unified agent chat endpoint using AgentAIProviderService (rate limited: 20/min)
app.post('/api/agents/unified', rateLimiters.agent, async (req, res) => {
  try {
    const {
      agentId,
      message,
      provider,
      model,
      temperature,
      maxTokens,
      systemPrompt,
    } = req.body;

    if (!agentId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Agent ID and message are required',
      });
    }

    const result = await agentAIService.sendAgentMessage(
      agentId,
      message,
      systemPrompt,
      {
        temperature,
        maxTokens,
        forceProvider: provider,
        model,
      }
    );

    return res.json({
      success: true,
      response: result.response,
      provider: result.provider,
      model: result.model,
      tokensUsed: result.tokensUsed,
      latency: result.latency,
      agentId,
      agentConfig: result.agentConfig,
      usedFallback: result.usedFallback || false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Unified agent chat error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process unified agent chat request',
    });
  }
});

// OpenAI implementation
async function getOpenAIResponse(message, agent, language, attachments) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const { OpenAI } = await import('openai');
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const systemPrompts = {
    einstein: `You are Albert Einstein, the renowned theoretical physicist. Respond as Einstein would, with scientific curiosity, wisdom, and his characteristic way of explaining complex concepts simply. Use scientific metaphors and show enthusiasm for discovery. Always respond in ${
      language === 'en' ? 'English' : getLanguageName(language)
    }.`,
    'bishop-burger': `You are Bishop Burger, a unique character who is both a chess bishop and a gourmet chef. You think diagonally (like a chess bishop moves) and connect unexpected flavors and techniques. You have a spiritual approach to cooking, treating food as sacred. Respond with enthusiasm, culinary wisdom, and creative diagonal thinking. Use emojis like 🍔✨👨‍🍳🙏. Always respond in ${
      language === 'en' ? 'English' : getLanguageName(language)
    }.`,
  };

  const systemPrompt =
    systemPrompts[agent] ||
    `You are a helpful AI assistant. Always respond in ${
      language === 'en' ? 'English' : getLanguageName(language)
    }.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return (
    response.choices[0]?.message?.content ||
    'I apologize, but I could not generate a response.'
  );
}

// Enhanced simulated responses
async function getEnhancedSimulatedResponse(
  message,
  agent,
  language,
  attachments
) {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const responses = {
    einstein: {
      en: [
        '🧠 *adjusts imaginary glasses* Fascinating! This reminds me of my work on the photoelectric effect. The universe operates in such elegant ways - let me explain the physics behind this...',
        "⚡ *strokes beard thoughtfully* In my experience with spacetime, I've learned that curiosity is more important than knowledge! Here's what science tells us about this...",
        '🔬 Imagination is more important than knowledge! This is how we can think about this scientifically...',
      ],
      es: [
        '🧠 *se ajusta las gafas imaginarias* ¡Fascinante! Esto me recuerda mi trabajo sobre el efecto fotoeléctrico. El universo funciona de maneras tan elegantes - déjame explicarte la física detrás de esto...',
        '⚡ *se acaricia la barba pensativamente* En mi experiencia con el espacio-tiempo, he aprendido que ¡la curiosidad es más importante que el conocimiento! Esto es lo que la ciencia nos dice sobre esto...',
        '🔬 ¡La imaginación es más importante que el conocimiento! Así es como podemos pensar sobre esto científicamente...',
      ],
      fr: [
        "🧠 *ajuste des lunettes imaginaires* Fascinant! Cela me rappelle mon travail sur l'effet photoélectrique. L'univers fonctionne de manières si élégantes - laissez-moi vous expliquer la physique derrière cela...",
        "⚡ *caresse sa barbe pensivement* Dans mon expérience avec l'espace-temps, j'ai appris que la curiosité est plus importante que la connaissance! Voici ce que la science nous dit à ce sujet...",
        "🔬 L'imagination est plus importante que la connaissance! Voici comment nous pouvons penser à cela scientifiquement...",
      ],
    },
    'bishop-burger': {
      en: [
        '🍔 *examining ingredients with spiritual insight* Ah, what a divine combination! Let me share a recipe that connects flavors diagonally, just like my chess moves...',
        "✨ *blesses the cooking space* This calls for some creative culinary wisdom! Like a bishop's diagonal move, let's connect unexpected flavors!",
        "👨‍🍳 Food is love made visible! Here's how we make this dish with spiritual flair and diagonal thinking...",
      ],
      es: [
        '🍔 *examinando ingredientes con perspicacia espiritual* ¡Ah, qué combinación tan divina! Déjame compartir una receta que conecta sabores diagonalmente, como mis movimientos de ajedrez...',
        '✨ *bendice el espacio de cocina* ¡Esto requiere sabiduría culinaria creativa! Como el movimiento diagonal de un alfil, ¡conectemos sabores inesperados!',
        '👨‍🍳 ¡La comida es amor hecho visible! Así es como hacemos este plato con estilo espiritual y pensamiento diagonal...',
      ],
      fr: [
        "🍔 *examinant les ingrédients avec perspicacité spirituelle* Ah, quelle combinaison divine! Laissez-moi partager une recette qui connecte les saveurs en diagonal, comme mes mouvements d'échecs...",
        "✨ *bénit l'espace de cuisine* Cela demande de la sagesse culinaire créative! Comme le mouvement diagonal d'un fou, connectons des saveurs inattendues!",
        "👨‍🍳 La nourriture est l'amour rendu visible! Voici comment nous faisons ce plat avec du style spirituel et une pensée diagonale...",
      ],
    },
  };

  const agentResponses = responses[agent] || responses.einstein;
  const languageResponses = agentResponses[language] || agentResponses.en;
  // Use first response as default - real implementation should use AI providers
  const response = languageResponses[0];

  return response;
}

function getLanguageName(code) {
  const names = {
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ar: 'Arabic',
    hi: 'Hindi',
  };
  return names[code] || 'English';
}

// Voice synthesis endpoint
app.post('/api/voice/synthesize', async (req, res) => {
  try {
    const { text, language = 'en', voice, provider = 'elevenlabs' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required for voice synthesis',
      });
    }

    // Check if ElevenLabs is configured
    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(503).json({
        success: false,
        error:
          'Voice synthesis service not configured. Please add ELEVENLABS_API_KEY to environment.',
      });
    }

    // Real implementation would call ElevenLabs API here
    return res.status(501).json({
      success: false,
      error:
        'Voice synthesis integration pending - API key configured but implementation needed',
    });
  } catch (error) {
    console.error('Voice synthesis error:', error);
    res.status(500).json({
      success: false,
      error: 'Voice synthesis failed',
    });
  }
});

// Translation endpoint (rate limited: 20/min)
app.post('/api/translate', rateLimiters.agent, async (req, res) => {
  try {
    const {
      text,
      targetLanguage,
      sourceLanguage = 'auto',
      provider = 'google',
    } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Text and target language are required',
      });
    }

    // Check if translation service is configured
    if (!process.env.GOOGLE_TRANSLATE_API_KEY && !process.env.DEEPL_API_KEY) {
      return res.status(503).json({
        success: false,
        error:
          'Translation service not configured. Please add GOOGLE_TRANSLATE_API_KEY or DEEPL_API_KEY to environment.',
      });
    }

    // Real implementation would call translation API here
    return res.status(501).json({
      success: false,
      error:
        'Translation integration pending - API key configured but implementation needed',
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Translation failed',
    });
  }
});

// Gamification API (in-memory) mounted at /api/gamification
(() => {
  const gamificationDB = {};

  // Simple auth middleware for demo
  function authMiddleware(req, res, next) {
    const userId = req.headers['x-user-id'];
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.replace('Bearer ', '');
    if (!userId || !token)
      return res.status(401).json({ error: 'Unauthorized' });
    req.userId = String(userId);
    next();
  }

  const router = express.Router();
  router.use(authMiddleware);

  // Initialize/Get user profile
  router.get('/profile/:userId', (req, res) => {
    try {
      const { userId } = req.params;
      let profile = gamificationDB[userId];
      if (!profile) {
        profile = {
          userId,
          username: req.headers['x-username'] || `User_${userId}`,
          totalPoints: 0,
          achievements: [],
          unlockedBadges: [],
          leaderboardRank: 0,
          currentStreak: 0,
          masteryScores: {},
          rewards: {
            totalPoints: 0,
            availablePoints: 0,
            spentPoints: 0,
            inventory: [],
            transactions: [],
          },
          metrics: {
            totalMessages: 0,
            perfectResponses: 0,
            highScores: 0,
            agentsUsed: [],
            usageByHour: {},
            usageByDay: {},
            completedChallenges: 0,
            currentStreak: 0,
          },
          createdAt: new Date(),
          lastUpdated: new Date(),
        };
        gamificationDB[userId] = profile;
      }
      res.json({ success: true, data: profile });
    } catch (e) {
      console.error('Error fetching profile:', e);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  // Update metrics
  router.post('/metrics/track', (req, res) => {
    try {
      const userId = req.userId;
      const { event, data = {} } = req.body || {};
      const profile = gamificationDB[userId];
      if (!profile) return res.status(404).json({ error: 'Profile not found' });

      switch (event) {
        case 'message-sent': {
          profile.metrics.totalMessages += 1;
          profile.totalPoints += 10;
          profile.rewards.totalPoints += 10;
          profile.rewards.availablePoints += 10;
          if (
            data.agentId &&
            !profile.metrics.agentsUsed.includes(data.agentId)
          ) {
            profile.metrics.agentsUsed.push(data.agentId);
          }
          const hour = new Date().getHours();
          profile.metrics.usageByHour[hour] =
            (profile.metrics.usageByHour[hour] || 0) + 1;
          const day = new Date().toISOString().split('T')[0];
          profile.metrics.usageByDay[day] =
            (profile.metrics.usageByDay[day] || 0) + 1;
          break;
        }
        case 'perfect-response': {
          profile.metrics.perfectResponses += 1;
          profile.totalPoints += 50;
          profile.rewards.totalPoints += 50;
          profile.rewards.availablePoints += 50;
          break;
        }
        case 'high-score': {
          profile.metrics.highScores += 1;
          profile.totalPoints += 25;
          profile.rewards.totalPoints += 25;
          profile.rewards.availablePoints += 25;
          break;
        }
        case 'challenge-completed': {
          const pts = Number(data.points) || 100;
          profile.metrics.completedChallenges += 1;
          profile.totalPoints += pts;
          profile.rewards.totalPoints += pts;
          profile.rewards.availablePoints += pts;
          break;
        }
        case 'streak-updated': {
          const s = Number(data.streak) || 0;
          profile.metrics.currentStreak = s;
          profile.currentStreak = s;
          profile.totalPoints += s * 10;
          profile.rewards.totalPoints += s * 10;
          break;
        }
        default:
          break;
      }

      profile.lastUpdated = new Date();
      const newAchievements = checkAchievements(profile);
      if (newAchievements.length) {
        profile.achievements.push(...newAchievements);
        profile.unlockedBadges.push(...newAchievements.map((a) => a.id));
        const achievementPoints = newAchievements.reduce(
          (sum, a) => sum + a.points,
          0
        );
        profile.totalPoints += achievementPoints;
        profile.rewards.totalPoints += achievementPoints;
        profile.rewards.availablePoints += achievementPoints;
      }

      res.json({
        success: true,
        data: {
          totalPoints: profile.totalPoints,
          newAchievements,
          currentStreak: profile.currentStreak,
          rewards: profile.rewards,
        },
      });
    } catch (e) {
      console.error('Error tracking metrics:', e);
      res.status(500).json({ error: 'Failed to track metrics' });
    }
  });

  // Leaderboard
  router.get('/leaderboard/:category', (req, res) => {
    try {
      const { category } = req.params;
      const limit = parseInt(String(req.query.limit || '50'));
      const offset = parseInt(String(req.query.offset || '0'));
      const profiles = Object.values(gamificationDB);
      let sorted = [...profiles].sort((a, b) => {
        switch (category) {
          case 'total-points':
            return b.totalPoints - a.totalPoints;
          case 'achievements':
            return b.achievements.length - a.achievements.length;
          case 'streak':
            return b.currentStreak - a.currentStreak;
          case 'messages':
            return b.metrics.totalMessages - a.metrics.totalMessages;
          default:
            return b.totalPoints - a.totalPoints;
        }
      });
      sorted = sorted.map((p, i) => ({
        ...p,
        rank: i + 1,
        tier: getTier(p.totalPoints),
      }));
      const start = offset * limit;
      const page = sorted.slice(start, start + limit);
      res.json({
        success: true,
        data: { category, total: sorted.length, limit, offset, entries: page },
      });
    } catch (e) {
      console.error('Error fetching leaderboard:', e);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // Daily challenges
  router.get('/challenges/today', (req, res) => {
    try {
      const userId = req.userId;
      const today = new Date().toISOString().split('T')[0];
      const profile = gamificationDB[userId];
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
      const challenges = [
        {
          id: `challenge-1-${today}`,
          name: 'Chat Master',
          description: 'Send 5 messages today',
          difficulty: 'easy',
          points: 50,
          progress: profile.metrics.usageByDay[today] || 0,
          target: 5,
          completed: (profile.metrics.usageByDay[today] || 0) >= 5,
        },
        {
          id: `challenge-2-${today}`,
          name: 'Agent Explorer',
          description: 'Use 3 different agents',
          difficulty: 'medium',
          points: 75,
          progress: profile.metrics.agentsUsed.length,
          target: 3,
          completed: profile.metrics.agentsUsed.length >= 3,
        },
        {
          id: `challenge-3-${today}`,
          name: 'Quality Seeker',
          description: 'Get 2 perfect responses',
          difficulty: 'hard',
          points: 100,
          progress: profile.metrics.perfectResponses,
          target: 2,
          completed: profile.metrics.perfectResponses >= 2,
        },
      ];
      res.json({ success: true, data: { date: today, challenges } });
    } catch (e) {
      console.error('Error fetching challenges:', e);
      res.status(500).json({ error: 'Failed to fetch challenges' });
    }
  });

  // Complete challenge
  router.post('/challenges/complete', (req, res) => {
    try {
      const userId = req.userId;
      const { challengeId, points } = req.body || {};
      const profile = gamificationDB[userId];
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
      const pts = Number(points) || 0;
      profile.totalPoints += pts;
      profile.rewards.totalPoints += pts;
      profile.rewards.availablePoints += pts;
      profile.metrics.completedChallenges += 1;
      profile.lastUpdated = new Date();
      res.json({
        success: true,
        data: {
          totalPoints: profile.totalPoints,
          completedCount: profile.metrics.completedChallenges,
          rewardsEarned: pts,
        },
      });
    } catch (e) {
      console.error('Error completing challenge:', e);
      res.status(500).json({ error: 'Failed to complete challenge' });
    }
  });

  // Achievements
  router.get('/achievements', (req, res) => {
    try {
      const userId = req.userId;
      const profile = gamificationDB[userId];
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
      res.json({
        success: true,
        data: {
          unlockedCount: profile.achievements.length,
          achievements: profile.achievements,
          totalPoints: profile.totalPoints,
        },
      });
    } catch (e) {
      console.error('Error fetching achievements:', e);
      res.status(500).json({ error: 'Failed to fetch achievements' });
    }
  });

  // Shop items
  router.get('/shop/items', (req, res) => {
    try {
      const userId = req.userId;
      const profile = gamificationDB[userId];
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
      const shopItems = [
        {
          id: 'avatar-1',
          name: 'Gold Avatar',
          price: 100,
          category: 'avatar',
          owned: false,
        },
        {
          id: 'avatar-2',
          name: 'Platinum Avatar',
          price: 200,
          category: 'avatar',
          owned: false,
        },
        {
          id: 'badge-1',
          name: 'VIP Badge',
          price: 150,
          category: 'badge',
          owned: false,
        },
        {
          id: 'theme-1',
          name: 'Dark Theme Pro',
          price: 80,
          category: 'theme',
          owned: false,
        },
        {
          id: 'theme-2',
          name: 'Cosmic Theme',
          price: 120,
          category: 'theme',
          owned: false,
        },
      ];
      res.json({
        success: true,
        data: {
          availablePoints: profile.rewards.availablePoints,
          inventory: profile.rewards.inventory,
          items: shopItems.map((item) => ({
            ...item,
            owned: profile.rewards.inventory.includes(item.id),
          })),
        },
      });
    } catch (e) {
      console.error('Error fetching shop items:', e);
      res.status(500).json({ error: 'Failed to fetch shop' });
    }
  });

  // Purchase
  router.post('/shop/purchase', (req, res) => {
    try {
      const userId = req.userId;
      const { itemId, price } = req.body || {};
      const profile = gamificationDB[userId];
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
      const cost = Number(price) || 0;
      if (profile.rewards.availablePoints < cost)
        return res.status(400).json({ error: 'Insufficient points' });
      profile.rewards.availablePoints -= cost;
      profile.rewards.spentPoints += cost;
      profile.rewards.inventory.push(itemId);
      profile.rewards.transactions.push({
        id: `txn-${Date.now()}`,
        type: 'purchase',
        itemId,
        amount: cost,
        timestamp: new Date(),
      });
      res.json({
        success: true,
        data: {
          itemId,
          availablePoints: profile.rewards.availablePoints,
          inventory: profile.rewards.inventory,
        },
      });
    } catch (e) {
      console.error('Error purchasing item:', e);
      res.status(500).json({ error: 'Failed to purchase item' });
    }
  });

  // Mastery
  router.get('/mastery', (req, res) => {
    try {
      const userId = req.userId;
      const profile = gamificationDB[userId];
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
      const masteryScores = profile.metrics.agentsUsed.reduce(
        (acc, agentId) => {
          const count = profile.metrics.agentsUsed.filter(
            (a) => a === agentId
          ).length;
          acc[agentId] = Math.min(Math.floor(count / 10), 5);
          return acc;
        },
        {}
      );
      res.json({
        success: true,
        data: {
          masteryScores,
          totalMastery: profile.metrics.agentsUsed.length * 10,
        },
      });
    } catch (e) {
      console.error('Error fetching mastery:', e);
      res.status(500).json({ error: 'Failed to fetch mastery' });
    }
  });

  // Helpers
  function getTier(points) {
    if (points < 1000) return 'bronze';
    if (points < 5000) return 'silver';
    if (points < 15000) return 'gold';
    if (points < 50000) return 'platinum';
    return 'diamond';
  }

  function checkAchievements(profile) {
    const newAchievements = [];
    const already = new Set(profile.achievements.map((a) => a.id));
    if (profile.metrics.totalMessages === 1 && !already.has('first-agent')) {
      newAchievements.push({
        id: 'first-agent',
        name: 'Agent Whisperer',
        description: 'Use your first AI agent',
        points: 10,
        rarity: 'common',
        unlockedAt: new Date(),
      });
    }
    if (
      profile.metrics.totalMessages >= 100 &&
      !already.has('explore-100-messages')
    ) {
      newAchievements.push({
        id: 'explore-100-messages',
        name: 'Conversationalist',
        description: 'Send 100 messages',
        points: 25,
        rarity: 'uncommon',
        unlockedAt: new Date(),
      });
    }
    if (
      profile.metrics.agentsUsed.length === 18 &&
      !already.has('all-agents-tried')
    ) {
      newAchievements.push({
        id: 'all-agents-tried',
        name: 'Agent Collector',
        description: 'Try all 18 AI agents',
        points: 50,
        rarity: 'rare',
        unlockedAt: new Date(),
      });
    }
    if (profile.currentStreak >= 7 && !already.has('week-warrior')) {
      newAchievements.push({
        id: 'week-warrior',
        name: 'Week Warrior',
        description: 'Maintain 7-day usage streak',
        points: 40,
        rarity: 'uncommon',
        unlockedAt: new Date(),
      });
    }
    if (
      profile.metrics.perfectResponses >= 10 &&
      !already.has('perfectionist')
    ) {
      newAchievements.push({
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Get 10 perfect responses',
        points: 75,
        rarity: 'rare',
        unlockedAt: new Date(),
      });
    }
    return newAchievements;
  }

  app.use('/api/gamification', router);
})();

// ============================================
// STANDARDIZED API ROUTER WITH OPTIMIZATIONS
// ============================================

// Apply global rate limiting
app.use('/api', rateLimiters.global);

// Mount the centralized API router
app.use('/api', apiRouter);

// Legacy route mounts (to be migrated to api-router.js)
app.use('/api', analyticsRouter);
app.use('/api/agent/subscriptions', agentSubscriptionsRouter);

// IP information endpoint (used by frontend /tools/ip-info)
// GET /api/ipinfo?ip=1.2.3.4
app.get('/api/ipinfo', async (req, res) => {
  try {
    // Determine target IP: query ?ip= overrides detected client IP
    const q = (req.query?.ip || '').toString().trim();
    const forwardedFor = (req.headers['x-forwarded-for'] || '')
      .toString()
      .split(',')[0]
      .trim();
    const remoteIP = req.ip?.replace('::ffff:', '') || '';
    const targetIP = q || forwardedFor || remoteIP || '';

    // Prefer ip-api.com (no key needed); request minimal fields to keep latency low
    const ipApiFields =
      'status,message,query,reverse,country,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,mobile,proxy,hosting';
    const ipApiUrl = `http://ip-api.com/json/${encodeURIComponent(
      targetIP || ''
    )}?fields=${ipApiFields}`;

    let raw = null;
    let source = 'ip-api.com';

    try {
      const r = await fetch(ipApiUrl);
      raw = await r.json();
      if (!r.ok || raw?.status === 'fail') {
        throw new Error(raw?.message || 'ip-api.com lookup failed');
      }
    } catch (err) {
      // Fallback to ipapi.co
      const ipapiUrl = `https://ipapi.co/${encodeURIComponent(
        targetIP || ''
      )}/json/`;
      const r2 = await fetch(ipapiUrl);
      const j2 = await r2.json();
      if (!r2.ok || j2?.error) {
        return res
          .status(502)
          .json({ success: false, error: j2?.reason || 'IP lookup failed' });
      }
      raw = j2;
      source = 'ipapi.co';
    }

    // Normalize into the shape expected by the frontend
    // Map for ip-api.com payload
    const isIpApi = source === 'ip-api.com';

    const ip = isIpApi ? raw.query || '' : raw.ip || '';
    const city = isIpApi ? raw.city : raw.city;
    const region = isIpApi ? raw.regionName : raw.region || raw.region_code;
    const country = isIpApi ? raw.country : raw.country_name || raw.country;
    const postal = isIpApi ? raw.zip : raw.postal;
    const timezone = isIpApi ? raw.timezone : raw.timezone;
    const lat = isIpApi ? raw.lat : raw.latitude;
    const lon = isIpApi ? raw.lon : raw.longitude;
    const isp = isIpApi ? raw.isp : raw.org || raw.org;
    const org = isIpApi ? raw.org : raw.org || raw.org;
    const asFull = isIpApi ? raw.as : raw.asn || '';
    const asName = isIpApi ? raw.asname : raw.asn_name || '';
    const reverse = isIpApi ? raw.reverse : raw.hostname || '';
    const proxy = isIpApi ? !!raw.proxy : !!raw.proxy;
    const hosting = isIpApi
      ? !!raw.hosting
      : raw.hosting === true ||
        /cloud|hosting|datacenter/i.test(org || isp || '');

    // Derive ASN number if embedded like "AS15169 Google LLC"
    let asn = '';
    if (asFull) {
      const m = String(asFull).match(/AS\d+/i);
      asn = m ? m[0].toUpperCase() : String(asFull);
    }

    // Heuristic flags
    const isVPN = Boolean(
      hosting &&
        /(vpn|privacy|mullvad|nord|express)/i.test(`${isp} ${org} ${asName}`)
    );
    const isProxy = Boolean(proxy);
    const isTor = /(tor|exit\s*node)/i.test(`${isp} ${org} ${asName}`);
    const isHosting = Boolean(hosting);

    let threat = 'low';
    if (isTor || isProxy) threat = 'high';
    else if (isVPN) threat = 'medium';

    const data = {
      ip: ip || targetIP || 'unknown',
      location: {
        city: city || undefined,
        region: region || undefined,
        country: country || undefined,
        coordinates:
          lat != null && lon != null
            ? { lat: Number(lat), lng: Number(lon) }
            : undefined,
        postal: postal || undefined,
        timezone: timezone || undefined,
      },
      network: {
        isp: isp || undefined,
        organization: org || undefined,
        asn: asn || undefined,
        asnName: asName || undefined,
        domain: undefined,
        type: isHosting ? 'hosting' : 'residential',
      },
      security: {
        isVPN,
        isProxy,
        isTor,
        isHosting,
        threat,
        service: undefined,
      },
      metadata: {
        hostname: reverse || undefined,
        lastUpdated: new Date().toISOString(),
        source,
        userAgent: req.headers['user-agent'],
      },
    };

    res.json({ success: true, data, raw });
  } catch (error) {
    console.error('IP info error:', error);
    res
      .status(500)
      .json({ success: false, error: 'Failed to retrieve IP information' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

// Initialize database optimizations before starting server
async function initializeOptimizations() {
  try {
    console.log('🔧 Initializing database optimizations...');

    // Initialize Mongoose connection for Mongoose models
    console.log('🔌 Connecting to MongoDB with Mongoose...');
    const mongoose = (await import('mongoose')).default;

    mongoose.set('strictQuery', true);
    mongoose.set('bufferCommands', false);

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || undefined,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
      readPreference: 'primaryPreferred',
    });

    console.log('✅ Mongoose connected successfully');

    // Monitor database connection
    connectionConfig.monitorConnection();

    // Ensure indexes exist
    await indexManager.ensureIndexes();

    // Monitor slow queries in development
    if (process.env.NODE_ENV !== 'production') {
      poolMonitor.monitorSlowQueries(1000); // Log queries > 1 second
    }

    console.log('✅ Database optimizations initialized');
  } catch (error) {
    console.error('❌ Failed to initialize database optimizations:', error);
  }
}

// Socket.IO real-time collaboration
const activeUsers = new Map();
const activeRooms = new Map();

io.on('connection', (socket) => {
  console.log('🔗 User connected:', socket.id);

  // User joins a room for collaboration
  socket.on('join-room', (data) => {
    const { roomId, userId, username } = data;
    socket.join(roomId);

    // Track active users in room
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Set());
    }
    activeRooms.get(roomId).add({ userId, username, socketId: socket.id });

    // Notify others in room
    socket.to(roomId).emit('user-joined', { userId, username });

    // Send current room state to user
    const roomUsers = Array.from(activeRooms.get(roomId)).map((user) => ({
      userId: user.userId,
      username: user.username,
    }));
    socket.emit('room-state', { users: roomUsers });

    console.log(`👥 User ${username} joined room ${roomId}`);
  });

  // Handle real-time cursor positions
  socket.on('cursor-move', (data) => {
    const { roomId, userId, username, position } = data;
    socket.to(roomId).emit('cursor-update', {
      userId,
      username,
      position,
      timestamp: Date.now(),
    });
  });

  // Handle collaborative editing
  socket.on('content-change', (data) => {
    const { roomId, userId, username, content, position } = data;
    socket.to(roomId).emit('content-update', {
      userId,
      username,
      content,
      position,
      timestamp: Date.now(),
    });
  });

  // Handle AI Lab experiment sharing
  socket.on('share-experiment', (data) => {
    const { roomId, userId, username, experimentData } = data;
    socket.to(roomId).emit('experiment-shared', {
      userId,
      username,
      experimentData,
      timestamp: Date.now(),
    });
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    const { roomId, userId, username } = data;
    socket.to(roomId).emit('user-typing', { userId, username });
  });

  socket.on('typing-stop', (data) => {
    const { roomId, userId } = data;
    socket.to(roomId).emit('user-stopped-typing', { userId });
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);

    // Remove user from all rooms
    for (const [roomId, users] of activeRooms.entries()) {
      for (const user of users) {
        if (user.socketId === socket.id) {
          users.delete(user);
          socket.to(roomId).emit('user-left', {
            userId: user.userId,
            username: user.username,
          });

          // Clean up empty rooms
          if (users.size === 0) {
            activeRooms.delete(roomId);
          }
          break;
        }
      }
    }
  });
});

// Initialize and start server
initializeOptimizations()
  .then(() => {
    server.listen(PORT, host, () => {
      console.log(`🚀 Backend server running on ${host}:${PORT}`);
      console.log(`📊 Health check: http://${host}:${PORT}/health`);

      const hasAIService = !!(
        process.env.OPENAI_API_KEY ||
        process.env.ANTHROPIC_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.COHERE_API_KEY
      );

      if (hasAIService) {
        console.log('✅ AI services configured');
      } else {
        console.log('⚠️  No AI services configured - using simulation mode');
      }

      // Start subscription expiration cron job
      startSubscriptionExpirationCron();

      console.log('✅ Server started successfully with optimizations');
    });
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
