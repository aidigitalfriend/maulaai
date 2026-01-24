/**
 * MAULA AI - PRODUCTION SERVER
 * PostgreSQL/Prisma Backend
 */

import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import cors from 'cors';
import helmet from 'helmet';
import os from 'os';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Prisma database connection
import { prisma, connectDatabase, disconnectDatabase, healthCheck as dbHealthCheck } from './lib/prisma.js';
import db from './lib/db.js';

// Middleware and services
import {
  initializeTracking,
  trackVisitorMiddleware,
  trackPageViewMiddleware,
} from './lib/tracking-middleware.js';
import analyticsRouter from './routes/analytics.js';
import agentSubscriptionsRouter from './routes/agentSubscriptions.js';
import apiRouter from './routes/api-router.js';
import { rateLimiters, cache } from './lib/cache.js';
import agentAIService from './lib/agent-ai-provider-service.js';
import { startSubscriptionExpirationCron } from './services/subscription-cron.js';

const app = express();
app.set('trust proxy', 1);
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
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
let perSecondBuckets = new Map();

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

// Check PostgreSQL connection
async function checkPostgresFast() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, message: 'ok', latencyMs: Date.now() - start };
  } catch (e) {
    return {
      ok: false,
      message: String(e?.message || e),
      latencyMs: Date.now() - start,
    };
  }
}

// Helper functions
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
  if (userAgent.includes('Mobile') || userAgent.includes('iPhone')) return 'mobile';
  if (userAgent.includes('iPad') || userAgent.includes('Tablet')) return 'tablet';
  return 'desktop';
}

function detectBrowser(userAgent) {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown Browser';
}

function calculateSecurityScore(userSecurity) {
  let score = 50;
  if (userSecurity.twoFactorEnabled) score += 25;
  const passwordAge = Date.now() - new Date(userSecurity.passwordLastChanged).getTime();
  const daysOld = passwordAge / (1000 * 60 * 60 * 24);
  if (daysOld < 90) score += 15;
  else if (daysOld < 180) score += 10;
  else if (daysOld < 365) score += 5;
  if (userSecurity.failedLoginAttempts === 0) score += 5;
  if (!userSecurity.accountLocked) score += 5;
  return Math.min(100, Math.max(0, score));
}

function generateSecurityRecommendations(userSecurity) {
  const recommendations = [];
  if (!userSecurity.twoFactorEnabled) {
    recommendations.push({
      id: 1,
      type: 'warning',
      title: 'Enable Two-Factor Authentication',
      description: 'Secure your account with 2FA for better protection',
      priority: 'high',
    });
  }
  const passwordAge = Date.now() - new Date(userSecurity.passwordLastChanged).getTime();
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
  if (userSecurity.failedLoginAttempts > 3) {
    recommendations.push({
      id: 3,
      type: 'warning',
      title: 'Recent Failed Login Attempts',
      description: 'Someone may be trying to access your account',
      priority: 'high',
    });
  }
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
  const load = os.loadavg();
  const cores = os.cpus().length;

  // Convert bytes to GB
  const memTotalGB = +(memTotal / (1024 ** 3)).toFixed(1);
  const memFreeGB = +(memFree / (1024 ** 3)).toFixed(1);
  const memUsedGB = +(memUsed / (1024 ** 3)).toFixed(1);

  return {
    cpuPercent: +load[0].toFixed(1), // 1-minute load average
    memoryPercent: memPct,
    totalMem: memTotalGB,
    freeMem: memFreeGB,
    usedMem: memUsedGB,
    load1: +load[0].toFixed(2),
    load5: +load[1].toFixed(2),
    load15: +load[2].toFixed(2),
    cores,
  };
}

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

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

  // Check PostgreSQL status
  const dbCheck = await checkPostgresFast();
  const pgStatus = dbCheck.ok ? 'connected' : 'disconnected';

  // Check S3 status
  let s3Status = 'not_configured';
  let s3Connected = false;
  const s3Bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME;
  try {
    if (s3Bucket && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
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
      postgresql: pgStatus,
      postgresLatencyMs: dbCheck.latencyMs,
      s3: s3Status,
      s3Connected,
      s3Bucket: s3Bucket || null,
    },
    hasAIService,
  });
});

// Compatibility alias
app.get('/api/health', async (req, res) => {
  const dbCheck = await checkPostgresFast();
  res.json({
    status: dbCheck.ok ? 'healthy' : 'degraded',
    database: 'postgresql',
    latencyMs: dbCheck.latencyMs,
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// STATUS ENDPOINT
// ============================================

app.get('/api/status', async (req, res) => {
  try {
    const metrics = calcMetricsSnapshot();
    const providers = providerStatusFromEnv();
    const dbCheck = await checkPostgresFast();
    
    const apiStatus = metrics.errorRate < 1 && metrics.avgResponseMs < 800 ? 'operational' : 'degraded';
    const dbStatus = dbCheck.ok ? 'operational' : 'outage';
    const platformStatus = apiStatus === 'operational' && dbCheck.ok ? 'operational' : 'degraded';

    // Get real agent data from PostgreSQL
    const agents = await prisma.agent.findMany({
      where: { status: 'active' },
      orderBy: { name: 'asc' },
    });

    // Get subscription counts per agent
    const subscriptionCounts = await prisma.agentSubscription.groupBy({
      by: ['agentId'],
      where: { status: 'active' },
      _count: { id: true },
    });

    const subscriptionMap = new Map(
      subscriptionCounts.map(s => [s.agentId, s._count.id])
    );

    const agentsData = agents.map(agent => ({
      name: agent.name,
      slug: agent.agentId,
      status: agent.status === 'active' ? 'operational' : 'degraded',
      responseTime: metrics.avgResponseMs || 100,
      activeUsers: subscriptionMap.get(agent.agentId) || 0,
      totalUsers: agent.totalUsers || 0,
      totalSessions: agent.totalSessions || 0,
      averageRating: agent.averageRating || 0,
      aiProvider: agent.aiProvider?.model || 'gpt-4',
    }));

    // Get analytics summary
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [todaySessions, todayPageViews, activeUsers] = await Promise.all([
      prisma.session.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.pageView.count({ where: { timestamp: { gte: startOfDay } } }),
      prisma.session.count({
        where: {
          lastActivity: { gte: new Date(Date.now() - 15 * 60 * 1000) },
          isActive: true,
        },
      }),
    ]);

    res.json({
      status: 'success',
      data: {
        platform: {
          status: platformStatus,
          uptime: process.uptime(), // Server uptime in seconds
          lastUpdated: new Date().toISOString(),
          version: process.env.APP_VERSION || '2.0.0',
        },
        api: {
          status: apiStatus,
          responseTime: metrics.avgResponseMs,
          uptime: process.uptime(),
          requestsToday: todaySessions + todayPageViews,
          requestsPerMinute: metrics.rps || 0,
          errorRate: metrics.errorRate,
          errorsToday: 0, // TODO: implement error counting
        },
        database: {
          status: dbStatus,
          connectionPool: 1, // TODO: implement connection pool info
          responseTime: dbCheck.latencyMs,
          uptime: process.uptime(),
        },
        agents: agentsData,
        aiServices: Object.entries(providers)
          .filter(([_, configured]) => configured)
          .map(([name]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            status: 'operational',
            responseTime: 100 + Math.random() * 200, // Mock response time
            uptime: process.uptime(),
          })),
        tools: [
          { name: 'API Tester', status: 'operational', responseTime: 150, activeChats: 0 },
          { name: 'DNS Lookup', status: 'operational', responseTime: 200, activeChats: 0 },
          { name: 'SSL Checker', status: 'operational', responseTime: 300, activeChats: 0 },
        ],
        historical: [], // TODO: implement historical data
        incidents: [], // TODO: implement incident tracking
        totalActiveUsers: activeUsers,
        system: buildCpuMem(),
      },
    });
  } catch (error) {
    console.error('Status endpoint error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Failed to fetch status',
    });
  }
});

// ============================================
// STATUS SUB-ENDPOINTS
// ============================================

app.get('/api/status/analytics', async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;

    // Calculate time range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get metrics for the period
    const [currentMetrics, previousMetrics] = await Promise.all([
      // Current period metrics
      Promise.all([
        prisma.session.count({ where: { createdAt: { gte: startDate } } }),
        prisma.pageView.count({ where: { timestamp: { gte: startDate } } }),
        prisma.session.count({
          where: {
            lastActivity: { gte: new Date(Date.now() - 15 * 60 * 1000) },
            isActive: true,
          },
        }),
        prisma.agentSubscription.count({ where: { createdAt: { gte: startDate } } }),
      ]),
      // Previous period for growth calculation
      timeRange === '24h' ? Promise.all([
        prisma.session.count({ where: { createdAt: { gte: new Date(startDate.getTime() - 24 * 60 * 60 * 1000), lt: startDate } } }),
        prisma.pageView.count({ where: { timestamp: { gte: new Date(startDate.getTime() - 24 * 60 * 60 * 1000), lt: startDate } } }),
        prisma.session.count({
          where: {
            lastActivity: { gte: new Date(Date.now() - 15 * 60 * 1000 - 24 * 60 * 60 * 1000) },
            isActive: true,
          },
        }),
        prisma.agentSubscription.count({ where: { createdAt: { gte: new Date(startDate.getTime() - 24 * 60 * 60 * 1000), lt: startDate } } }),
      ]) : Promise.resolve([0, 0, 0, 0])
    ]);

    const [sessions, pageViews, activeUsers, subscriptions] = currentMetrics;
    const [prevSessions, prevPageViews, prevActiveUsers, prevSubscriptions] = previousMetrics;

    const totalRequests = sessions + pageViews;
    const prevTotalRequests = prevSessions + prevPageViews;

    // Calculate growth percentages
    const requestsGrowth = prevTotalRequests > 0 ? ((totalRequests - prevTotalRequests) / prevTotalRequests) * 100 : 0;
    const usersGrowth = prevActiveUsers > 0 ? ((activeUsers - prevActiveUsers) / prevActiveUsers) * 100 : 0;

    // Get agent analytics
    const agentStats = await prisma.agent.findMany({
      include: {
        _count: {
          select: { subscriptions: { where: { status: 'active' } } }
        }
      }
    });

    const agents = agentStats.map(agent => ({
      name: agent.name,
      requests: Math.floor(Math.random() * 1000) + 100, // Mock data for now
      users: agent._count.subscriptions,
      avgResponseTime: Math.floor(Math.random() * 500) + 100,
      successRate: 95 + Math.random() * 5,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    }));

    // Get tool usage (mock for now)
    const tools = [
      { name: 'API Tester', usage: Math.floor(Math.random() * 500) + 50, users: Math.floor(Math.random() * 50) + 10, avgDuration: Math.floor(Math.random() * 300) + 50, trend: 'up' },
      { name: 'DNS Lookup', usage: Math.floor(Math.random() * 300) + 30, users: Math.floor(Math.random() * 30) + 5, avgDuration: Math.floor(Math.random() * 200) + 30, trend: 'stable' },
      { name: 'SSL Checker', usage: Math.floor(Math.random() * 200) + 20, users: Math.floor(Math.random() * 20) + 3, avgDuration: Math.floor(Math.random() * 150) + 20, trend: 'down' },
    ];

    // Generate hourly data
    const hourlyData = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      hourlyData.push({
        hour: hour.toISOString().slice(11, 16), // HH:MM format
        requests: Math.floor(Math.random() * 100) + 10,
        users: Math.floor(Math.random() * 20) + 5,
      });
    }

    // Top agents
    const topAgents = agents
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 5)
      .map((agent, index) => ({
        name: agent.name,
        requests: agent.requests,
        percentage: Math.floor((agent.requests / totalRequests) * 100),
      }));

    res.json({
      overview: {
        totalRequests,
        activeUsers,
        avgResponseTime: calcMetricsSnapshot().avgResponseMs || 150,
        successRate: 98.5,
        requestsGrowth,
        usersGrowth,
      },
      agents,
      tools,
      hourlyData,
      topAgents,
    });
  } catch (error) {
    console.error('Analytics endpoint error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Failed to fetch analytics',
    });
  }
});

app.get('/api/status/api-status', async (req, res) => {
  try {
    const metrics = calcMetricsSnapshot();
    const providers = providerStatusFromEnv();

    // Mock endpoints data
    const endpoints = [
      { name: 'User Authentication', endpoint: '/api/auth/*', method: 'POST', status: 'operational', responseTime: 120, uptime: 99.9, lastChecked: new Date().toISOString(), errorRate: 0.1 },
      { name: 'Agent Subscriptions', endpoint: '/api/subscriptions/*', method: 'GET', status: 'operational', responseTime: 150, uptime: 99.8, lastChecked: new Date().toISOString(), errorRate: 0.2 },
      { name: 'Chat API', endpoint: '/api/chat/*', method: 'POST', status: 'operational', responseTime: 200, uptime: 99.7, lastChecked: new Date().toISOString(), errorRate: 0.3 },
      { name: 'Analytics API', endpoint: '/api/analytics/*', method: 'GET', status: 'operational', responseTime: 180, uptime: 99.9, lastChecked: new Date().toISOString(), errorRate: 0.1 },
      { name: 'Status API', endpoint: '/api/status/*', method: 'GET', status: 'operational', responseTime: 100, uptime: 100, lastChecked: new Date().toISOString(), errorRate: 0 },
    ];

    // Get real agent data
    const agents = await prisma.agent.findMany({
      where: { status: 'active' },
      include: {
        _count: {
          select: { subscriptions: { where: { status: 'active' } } }
        }
      }
    });

    const agentsData = agents.map(agent => ({
      name: agent.name,
      apiEndpoint: `/api/agents/${agent.agentId}`,
      status: 'operational',
      responseTime: Math.floor(Math.random() * 300) + 100,
      requestsPerMinute: Math.floor(Math.random() * 50) + 10,
    }));

    // Tools data
    const toolsData = [
      { name: 'API Tester', apiEndpoint: '/api/tools/api-tester', status: 'operational', responseTime: 150, requestsPerMinute: 5 },
      { name: 'DNS Lookup', apiEndpoint: '/api/tools/dns-lookup', status: 'operational', responseTime: 200, requestsPerMinute: 3 },
      { name: 'SSL Checker', apiEndpoint: '/api/tools/ssl-checker', status: 'operational', responseTime: 300, requestsPerMinute: 2 },
    ];

    // AI Services data
    const aiServicesData = Object.entries(providers)
      .filter(([_, configured]) => configured)
      .map(([name]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        provider: name.toUpperCase(),
        status: 'operational',
        responseTime: Math.floor(Math.random() * 500) + 200,
        quota: 'Available',
      }));

    res.json({
      endpoints,
      categories: {
        agents: agentsData,
        tools: toolsData,
        aiServices: aiServicesData,
      },
    });
  } catch (error) {
    console.error('API Status endpoint error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Failed to fetch API status',
    });
  }
});

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

// User signup
app.post('/api/auth/signup', rateLimiters.auth, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Check if user exists
    const existing = await db.User.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Create user
    const user = await db.User.create({
      email,
      password,
      name: name || email.split('@')[0],
    });

    // Generate session
    const sessionId = crypto.randomBytes(32).toString('hex');
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.User.update(user.id, {
      sessionId,
      sessionExpiry,
      lastLoginAt: new Date(),
    });

    // Set cookie
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create account',
    });
  }
});

// User login
app.post('/api/auth/login', rateLimiters.auth, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await db.User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const valid = await db.User.comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      // Generate temp token for 2FA verification
      const tempToken = crypto.randomBytes(32).toString('hex');
      const tempTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await db.User.update(user.id, {
        resetPasswordToken: tempToken,
        resetPasswordExpires: tempTokenExpiry,
      });

      return res.json({
        requires2FA: true,
        tempToken,
        userId: user.id,
        message: 'Please enter your 2FA code',
      });
    }

    // Generate session
    const sessionId = crypto.randomBytes(32).toString('hex');
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.User.update(user.id, {
      sessionId,
      sessionExpiry,
      lastLoginAt: new Date(),
    });

    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
    });
  }
});

// 2FA Verification during login
app.post('/api/auth/verify-2fa', rateLimiters.auth, async (req, res) => {
  try {
    const { tempToken, userId, code } = req.body;

    if (!tempToken || !userId || !code) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Import otplib dynamically
    const { authenticator } = await import('otplib');

    // Find user with matching temp token
    const user = await db.User.findById(userId);
    if (!user || user.resetPasswordToken !== tempToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired verification session',
      });
    }

    // Check if token expired
    if (user.resetPasswordExpires && new Date(user.resetPasswordExpires) < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Verification session expired. Please login again.',
      });
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: '2FA not configured',
      });
    }

    // Verify TOTP code
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    // Also check backup codes if TOTP fails
    let usedBackupCode = false;
    if (!isValid && user.backupCodes && user.backupCodes.length > 0) {
      const backupCodeIndex = user.backupCodes.indexOf(code.toUpperCase());
      if (backupCodeIndex !== -1) {
        const updatedBackupCodes = [...user.backupCodes];
        updatedBackupCodes.splice(backupCodeIndex, 1);
        await db.User.update(user.id, { backupCodes: updatedBackupCodes });
        usedBackupCode = true;
      }
    }

    if (!isValid && !usedBackupCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code',
      });
    }

    // 2FA verified - create session
    const sessionId = crypto.randomBytes(32).toString('hex');
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.User.update(user.id, {
      sessionId,
      sessionExpiry,
      lastLoginAt: new Date(),
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: usedBackupCode ? 'Login successful (backup code used)' : 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed',
    });
  }
});

// Logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      const user = await db.User.findBySessionId(sessionId);
      if (user) {
        await db.User.update(user.id, {
          sessionId: null,
          sessionExpiry: null,
        });
      }
    }

    res.clearCookie('sessionId');
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.json({ success: true });
  }
});

// Get current session
app.get('/api/auth/session', async (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
      return res.json({ success: true, user: null });
    }

    const user = await db.User.findBySessionId(sessionId);
    if (!user || (user.sessionExpiry && new Date(user.sessionExpiry) < new Date())) {
      res.clearCookie('sessionId');
      return res.json({ success: true, user: null });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    res.json({ success: true, user: null });
  }
});

// ============================================
// AGENTS ENDPOINTS
// ============================================

app.get('/api/agents', async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      where: { status: 'active' },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      agents: agents.map(a => ({
        id: a.id,
        agentId: a.agentId,
        name: a.name,
        avatarUrl: a.avatarUrl,
        specialty: a.specialty,
        description: a.description,
        specialties: a.specialties,
        tags: a.tags,
        color: a.color,
        pricing: {
          daily: a.pricingDaily,
          weekly: a.pricingWeekly,
          monthly: a.pricingMonthly,
        },
        stats: {
          totalUsers: a.totalUsers,
          totalSessions: a.totalSessions,
          averageRating: a.averageRating,
        },
      })),
    });
  } catch (error) {
    console.error('Agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agents',
    });
  }
});

app.get('/api/agents/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = await prisma.agent.findUnique({
      where: { agentId },
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
    }

    res.json({
      success: true,
      agent: {
        id: agent.id,
        agentId: agent.agentId,
        name: agent.name,
        avatarUrl: agent.avatarUrl,
        specialty: agent.specialty,
        description: agent.description,
        systemPrompt: agent.systemPrompt,
        welcomeMessage: agent.welcomeMessage,
        specialties: agent.specialties,
        tags: agent.tags,
        color: agent.color,
        aiProvider: agent.aiProvider,
        pricing: {
          daily: agent.pricingDaily,
          weekly: agent.pricingWeekly,
          monthly: agent.pricingMonthly,
        },
        stats: {
          totalUsers: agent.totalUsers,
          totalSessions: agent.totalSessions,
          averageRating: agent.averageRating,
        },
      },
    });
  } catch (error) {
    console.error('Agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent',
    });
  }
});

// ============================================
// MOUNT ROUTERS
// ============================================

app.use('/api', apiRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/subscriptions', agentSubscriptionsRouter);

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// ============================================
// SOCKET.IO
// ============================================

const activeUsers = new Map();
const activeRooms = new Map();

io.on('connection', (socket) => {
  console.log('🔗 User connected:', socket.id);

  socket.on('join-room', (data) => {
    const { roomId, userId, username } = data;
    socket.join(roomId);

    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Set());
    }
    activeRooms.get(roomId).add({ userId, username, socketId: socket.id });

    socket.to(roomId).emit('user-joined', { userId, username });

    const roomUsers = Array.from(activeRooms.get(roomId)).map((user) => ({
      userId: user.userId,
      username: user.username,
    }));
    socket.emit('room-state', { users: roomUsers });
  });

  socket.on('cursor-move', (data) => {
    const { roomId, userId, username, position } = data;
    socket.to(roomId).emit('cursor-update', {
      userId,
      username,
      position,
      timestamp: Date.now(),
    });
  });

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

  socket.on('typing-start', (data) => {
    const { roomId, userId, username } = data;
    socket.to(roomId).emit('user-typing', { userId, username });
  });

  socket.on('typing-stop', (data) => {
    const { roomId, userId } = data;
    socket.to(roomId).emit('user-stopped-typing', { userId });
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);

    for (const [roomId, users] of activeRooms.entries()) {
      for (const user of users) {
        if (user.socketId === socket.id) {
          users.delete(user);
          socket.to(roomId).emit('user-left', {
            userId: user.userId,
            username: user.username,
          });

          if (users.size === 0) {
            activeRooms.delete(roomId);
          }
          break;
        }
      }
    }
  });
});

// ============================================
// START SERVER
// ============================================

const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

async function initializeServer() {
  try {
    console.log('🔧 Initializing Maula AI Server...');
    console.log('📦 Database: PostgreSQL via Prisma');

    // Connect to PostgreSQL
    console.log('🔌 Connecting to PostgreSQL...');
    await connectDatabase();

    // Start subscription cron job
    startSubscriptionExpirationCron();

    // Start server
    server.listen(PORT, host, () => {
      console.log(`🚀 Maula AI Backend running on ${host}:${PORT}`);
      console.log(`📊 Health check: http://${host}:${PORT}/health`);
      console.log(`🔗 API: http://${host}:${PORT}/api`);

      const hasAIService = !!(
        process.env.OPENAI_API_KEY ||
        process.env.ANTHROPIC_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.COHERE_API_KEY
      );

      if (hasAIService) {
        console.log('✅ AI services configured');
      } else {
        console.log('⚠️  No AI services configured');
      }

      console.log('✅ Server started successfully');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📴 SIGTERM received, shutting down...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📴 SIGINT received, shutting down...');
  await disconnectDatabase();
  process.exit(0);
});

// Start
initializeServer();
