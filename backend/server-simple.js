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
  const load = os.loadavg()[0] || 0;
  return { memPct, load1: +load.toFixed(2) };
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
        platformStatus,
        lastUpdated: new Date().toISOString(),
        metrics: {
          apiStatus,
          databaseStatus: dbStatus,
          rps: metrics.rps,
          avgResponseTime: metrics.avgResponseMs,
          errorRate: metrics.errorRate,
          requestsToday: todaySessions + todayPageViews,
          activeUsers,
        },
        agents: agentsData,
        providers,
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
