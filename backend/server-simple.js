/**
 * Simple JavaScript server implementation for testing
 * Real AI service integration for multilingual agents
 */

import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
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
      'https://onelastai.co',
      'https://www.onelastai.co',
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
    'https://onelastai.co',
    'https://www.onelastai.co',
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
app.get('/health', (req, res) => {
  const hasAIService = !!(
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.COHERE_API_KEY
  );

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      cohere: !!process.env.COHERE_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      googleTranslate: !!process.env.GOOGLE_TRANSLATE_API_KEY,
    },
    hasAIService,
  });
});

// Compatibility alias: /api/health -> same as /health
app.get('/api/health', (req, res) => {
  const hasAIService = !!(
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.COHERE_API_KEY
  );

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      cohere: !!process.env.COHERE_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      googleTranslate: !!process.env.GOOGLE_TRANSLATE_API_KEY,
    },
    hasAIService,
  });
});

// ----------------------------
// Real-time Status Endpoints
// ----------------------------
app.get('/api/status', async (req, res) => {
  try {
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

    // Return empty historical array - frontend should query dedicated historical metrics endpoint
    const hist = [];

    const data = {
      platform: {
        status: platformStatus,
        uptime: platformStatus === 'operational' ? 99.99 : 98.5,
        lastUpdated: now.toISOString(),
        version: process.env.APP_VERSION || '1.0.0',
      },
      api: {
        status: apiStatus,
        responseTime: metrics.avgResponseMs,
        uptime: 99.9,
        requestsToday: 10000 + metrics.totalLastMinute,
        requestsPerMinute: metrics.totalLastMinute,
      },
      database: {
        status: dbStatus,
        connectionPool: db.ok ? 65 : 0,
        responseTime: db.latencyMs ?? 0,
        uptime: db.ok ? 99.9 : 0,
      },
      aiServices: [
        {
          name: 'OpenAI GPT',
          status: providers.openai ? 'operational' : 'outage',
          responseTime: 300,
          uptime: providers.openai ? 99.9 : 0,
        },
        {
          name: 'Claude (Anthropic)',
          status: providers.anthropic ? 'operational' : 'outage',
          responseTime: 350,
          uptime: providers.anthropic ? 99.9 : 0,
        },
        {
          name: 'Google Gemini',
          status: providers.gemini ? 'operational' : 'outage',
          responseTime: 320,
          uptime: providers.gemini ? 99.9 : 0,
        },
        {
          name: 'Cohere',
          status: providers.cohere ? 'operational' : 'outage',
          responseTime: 340,
          uptime: providers.cohere ? 99.9 : 0,
        },
        {
          name: 'HuggingFace',
          status: providers.huggingface ? 'operational' : 'outage',
          responseTime: 380,
          uptime: providers.huggingface ? 99.9 : 0,
        },
        {
          name: 'Mistral AI',
          status: providers.mistral ? 'operational' : 'outage',
          responseTime: 330,
          uptime: providers.mistral ? 99.9 : 0,
        },
        {
          name: 'Replicate',
          status: providers.replicate ? 'operational' : 'outage',
          responseTime: 450,
          uptime: providers.replicate ? 99.9 : 0,
        },
        {
          name: 'Stability AI',
          status: providers.stability ? 'operational' : 'outage',
          responseTime: 500,
          uptime: providers.stability ? 99.9 : 0,
        },
        {
          name: 'RunwayML',
          status: providers.runway ? 'operational' : 'outage',
          responseTime: 520,
          uptime: providers.runway ? 99.9 : 0,
        },
      ],
      agents: [
        {
          name: 'einstein',
          status: 'operational',
          responseTime: metrics.avgResponseMs,
          activeUsers: 12,
        },
        {
          name: 'bishop-burger',
          status: 'operational',
          responseTime: metrics.avgResponseMs + 20,
          activeUsers: 7,
        },
        {
          name: 'ben-sega',
          status: 'operational',
          responseTime: metrics.avgResponseMs + 15,
          activeUsers: 5,
        },
        {
          name: 'default',
          status: 'operational',
          responseTime: metrics.avgResponseMs + 10,
          activeUsers: 9,
        },
      ],
      tools: [
        {
          name: 'Translation',
          status: providers.googleTranslate ? 'operational' : 'degraded',
          responseTime: 180,
          activeChats: 4,
        },
        {
          name: 'Voice (ElevenLabs)',
          status: providers.elevenlabs ? 'operational' : 'degraded',
          responseTime: 420,
        },
        {
          name: 'Email',
          status: process.env.SENDGRID_API_KEY ? 'operational' : 'degraded',
          responseTime: 260,
        },
      ],
      historical: hist,
      incidents: [],
    };

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

app.get('/api/status/analytics', (req, res) => {
  const metrics = calcMetricsSnapshot();
  const timeRange = String(req.query.timeRange || '24h');
  // Return only real metrics - no fake hourly data
  const hourlyData = [];
  res.json({
    overview: {
      totalRequests: metrics.totalLastMinute * 60 * 24, // Estimate daily from current rate
      activeUsers: 0, // Should query from real user sessions
      avgResponseTime: metrics.avgResponseMs,
      successRate: 100 - metrics.errorRate,
      requestsGrowth: 0,
      usersGrowth: 0,
    },
    agents: [
      {
        name: 'einstein',
        requests: 1540,
        users: 53,
        avgResponseTime: metrics.avgResponseMs,
        successRate: 99.6,
        trend: 'up',
      },
      {
        name: 'bishop-burger',
        requests: 980,
        users: 41,
        avgResponseTime: metrics.avgResponseMs + 22,
        successRate: 99.2,
        trend: 'stable',
      },
    ],
    tools: [
      {
        name: 'Voice Synthesis',
        usage: 240,
        users: 30,
        avgDuration: 4.2,
        trend: 'up',
      },
      {
        name: 'Translate',
        usage: 420,
        users: 60,
        avgDuration: 1.1,
        trend: 'down',
      },
    ],
    hourlyData,
    topAgents: [
      { name: 'einstein', requests: 1540, percentage: 31 },
      { name: 'bishop-burger', requests: 980, percentage: 19 },
      { name: 'default', requests: 720, percentage: 15 },
    ],
  });
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
  const providers = providerStatusFromEnv();
  const metrics = calcMetricsSnapshot();
  const db = await checkMongoFast();
  const apiStatus =
    metrics.errorRate < 1 && metrics.avgResponseMs < 800
      ? 'operational'
      : 'degraded';
  const dbStatus = db.ok ? 'operational' : 'outage';
  const platformStatus =
    apiStatus === 'operational' && db.ok ? 'operational' : 'degraded';
  return {
    success: true,
    data: {
      platform: {
        status: platformStatus,
        uptime: platformStatus === 'operational' ? 99.99 : 98.5,
        lastUpdated: new Date().toISOString(),
        version: process.env.APP_VERSION || '1.0.0',
      },
      api: {
        status: apiStatus,
        responseTime: metrics.avgResponseMs,
        uptime: 99.9,
        requestsToday: 10000 + metrics.totalLastMinute,
        requestsPerMinute: metrics.totalLastMinute,
      },
      database: {
        status: dbStatus,
        connectionPool: db.ok ? 65 : 0,
        responseTime: db.latencyMs ?? 0,
        uptime: db.ok ? 99.9 : 0,
      },
      aiServices: [
        {
          name: 'OpenAI GPT',
          status: providers.openai ? 'operational' : 'outage',
          responseTime: 300,
          uptime: providers.openai ? 99.9 : 0,
        },
        {
          name: 'Claude (Anthropic)',
          status: providers.anthropic ? 'operational' : 'outage',
          responseTime: 350,
          uptime: providers.anthropic ? 99.9 : 0,
        },
        {
          name: 'Google Gemini',
          status: providers.gemini ? 'operational' : 'outage',
          responseTime: 320,
          uptime: providers.gemini ? 99.9 : 0,
        },
        {
          name: 'Cohere',
          status: providers.cohere ? 'operational' : 'outage',
          responseTime: 340,
          uptime: providers.cohere ? 99.9 : 0,
        },
        {
          name: 'HuggingFace',
          status: providers.huggingface ? 'operational' : 'outage',
          responseTime: 380,
          uptime: providers.huggingface ? 99.9 : 0,
        },
        {
          name: 'Mistral AI',
          status: providers.mistral ? 'operational' : 'outage',
          responseTime: 330,
          uptime: providers.mistral ? 99.9 : 0,
        },
        {
          name: 'Replicate',
          status: providers.replicate ? 'operational' : 'outage',
          responseTime: 450,
          uptime: providers.replicate ? 99.9 : 0,
        },
        {
          name: 'Stability AI',
          status: providers.stability ? 'operational' : 'outage',
          responseTime: 500,
          uptime: providers.stability ? 99.9 : 0,
        },
        {
          name: 'RunwayML',
          status: providers.runway ? 'operational' : 'outage',
          responseTime: 520,
          uptime: providers.runway ? 99.9 : 0,
        },
      ],
      agents: [
        {
          name: 'einstein',
          status: 'operational',
          responseTime: metrics.avgResponseMs,
          activeUsers: 12,
        },
        {
          name: 'bishop-burger',
          status: 'operational',
          responseTime: metrics.avgResponseMs + 20,
          activeUsers: 7,
        },
        {
          name: 'ben-sega',
          status: 'operational',
          responseTime: metrics.avgResponseMs + 15,
          activeUsers: 5,
        },
        {
          name: 'default',
          status: 'operational',
          responseTime: metrics.avgResponseMs + 10,
          activeUsers: 9,
        },
      ],
      tools: [
        {
          name: 'Translation',
          status: providers.googleTranslate ? 'operational' : 'degraded',
          responseTime: 180,
          activeChats: 4,
        },
        {
          name: 'Voice (ElevenLabs)',
          status: providers.elevenlabs ? 'operational' : 'degraded',
          responseTime: 420,
        },
        {
          name: 'Email',
          status: process.env.SENDGRID_API_KEY ? 'operational' : 'degraded',
          responseTime: 260,
        },
      ],
      historical: [],
      incidents: [],
    },
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

// Primary auth endpoint used by Nginx/backend routing
app.post('/api/auth/login', handlePasswordLogin);
// Backend-only alias used by the frontend AuthContext to bypass
// the Next.js route handler when calling from the browser.
app.post('/api/auth-backend/login', handlePasswordLogin);
// Signup endpoints (primary and backend-only alias)
app.post('/api/auth/signup', handlePasswordSignup);
app.post('/api/auth-backend/signup', handlePasswordSignup);

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
      sameSite: 'lax',  // Must match login cookie settings
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

    // Fetch recent activity from securityLogs for this user
    const securityLogs = db.collection('securityLogs');
    const recentLogs = await securityLogs
      .find({ userId: user._id.toString() })
      .sort({ timestamp: -1 })
      .limit(20)
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

    // Map action types to status
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

    // Transform security logs to activity format
    const recentActivity = recentLogs.map((log) => {
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
      };
    });

    // Get daily usage data (last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // Generate daily usage from security logs
    const dailyUsage = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Count activities for this day
      const dayStart = new Date(dateStr);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayLogs = recentLogs.filter((log) => {
        const logDate = new Date(log.timestamp);
        return logDate >= dayStart && logDate < dayEnd;
      });

      dailyUsage.push({
        date: dateStr,
        conversations: dayLogs.filter((l) => l.action === 'ai_chat').length,
        messages: dayLogs.length,
        apiCalls: dayLogs.filter((l) =>
          ['login_success', 'login_failed'].includes(l.action)
        ).length,
      });
    }

    // Get user's subscriptions count
    const subscriptions = db.collection('subscriptions');
    const userSubscriptions = await subscriptions.countDocuments({
      userId: user._id.toString(),
      status: 'active',
    });

    // Calculate weekly trend
    const thisWeekLogs = recentLogs.filter(
      (log) => new Date(log.timestamp) >= sevenDaysAgo
    );
    const loginCount = thisWeekLogs.filter(
      (l) => l.action === 'login_success'
    ).length;

    const analyticsData = {
      success: true,
      period: 'last30days',
      summary: {
        totalConversations: thisWeekLogs.filter((l) => l.action === 'ai_chat')
          .length,
        totalMessages: thisWeekLogs.length,
        totalApiCalls: loginCount,
        activeAgents: userSubscriptions,
        averageResponseTime: 1.2,
      },
      usage: {
        conversations: {
          current: thisWeekLogs.filter((l) => l.action === 'ai_chat').length,
          limit: 1000,
          percentage: 0,
          unit: 'conversations',
        },
        agents: {
          current: userSubscriptions,
          limit: 18,
          percentage: Math.round((userSubscriptions / 18) * 100),
          unit: 'agents',
        },
        apiCalls: {
          current: loginCount,
          limit: 50000,
          percentage: 0,
          unit: 'calls',
        },
        storage: { current: 0, limit: 10000, percentage: 0, unit: 'KB' },
        messages: {
          current: thisWeekLogs.length,
          limit: 100000,
          percentage: 0,
          unit: 'messages',
        },
      },
      dailyUsage: dailyUsage,
      weeklyTrend: {
        conversationsChange:
          '+' + thisWeekLogs.filter((l) => l.action === 'ai_chat').length,
        apiCallsChange: '+' + loginCount,
        messagesChange: '+' + thisWeekLogs.length,
        responseTimeChange: '-0.1s',
      },
      agentPerformance: [],
      recentActivity: recentActivity,
      costAnalysis: {
        currentMonth: 0,
        projectedMonth: 0,
        breakdown: [],
      },
      topAgents: [],
      subscription: {
        plan: 'No Active Plan',
        status: 'inactive',
        price: 0,
        period: 'month',
        renewalDate: 'N/A',
        daysUntilRenewal: 0,
      },
    };

    console.log(
      `✅ Analytics returned for user ${user._id} with ${recentActivity.length} activities`
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

    // Build query for chat interactions
    const chatInteractions = db.collection('chatinteractions');
    const query = { userId: sessionUser._id };

    // Add search functionality
    if (search) {
      query.$or = [
        { agentName: { $regex: search, $options: 'i' } },
        {
          messages: {
            $elemMatch: { content: { $regex: search, $options: 'i' } },
          },
        },
      ];
    }

    // Get total count for pagination
    const total = await chatInteractions.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Get conversations with pagination
    const conversations = await chatInteractions
      .find(query)
      .sort({ createdAt: -1 }) // Most recent first
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .toArray();

    // Transform conversations for frontend
    const transformedConversations = conversations.map((conv) => {
      const messageCount = conv.messages ? conv.messages.length : 0;
      const lastMessage =
        conv.messages && conv.messages.length > 0
          ? conv.messages[conv.messages.length - 1]
          : null;

      // Calculate approximate duration (estimate based on message count)
      const estimatedDuration = Math.max(1, Math.ceil(messageCount * 1.5)); // ~1.5 min per message

      // Get conversation topic (use first user message or fallback)
      let topic = 'General Conversation';
      if (conv.messages && conv.messages.length > 0) {
        const firstUserMessage = conv.messages.find(
          (msg) => msg.role === 'user'
        );
        if (firstUserMessage && firstUserMessage.content) {
          // Extract first 50 characters as topic
          topic = firstUserMessage.content.substring(0, 50);
          if (firstUserMessage.content.length > 50) topic += '...';
        }
      }

      return {
        id: conv._id.toString(),
        agent: conv.agentName || 'Assistant',
        topic: topic,
        date: conv.timestamp
          ? conv.timestamp.toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        duration: `${estimatedDuration}m`,
        messageCount: messageCount,
        lastMessage: lastMessage
          ? {
              content:
                lastMessage.content.substring(0, 100) +
                (lastMessage.content.length > 100 ? '...' : ''),
              timestamp: lastMessage.timestamp || conv.timestamp,
            }
          : null,
        timestamp: conv.timestamp || new Date(),
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
    description: '$19 per month per agent',
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
              '$19 per month per agent - Best value for continuous access',
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

// Language detection endpoint
app.post('/api/language-detect', async (req, res) => {
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

// Chat endpoint for AI responses
app.post('/api/chat', async (req, res) => {
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

// Unified agent chat endpoint using AgentAIProviderService
app.post('/api/agents/unified', async (req, res) => {
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

// Translation endpoint
app.post('/api/translate', async (req, res) => {
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
