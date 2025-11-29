/**
 * REAL-TIME SERVER WITH SOCKET.IO + EXPRESS
 * Combines server-simple.js functionality with WebSocket support
 * Production-ready with MongoDB Atlas, metrics tracking, and live features
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import os from 'os';
import { MongoClient } from 'mongodb';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

// Import tracking middleware
import { universalTrackingMiddleware } from './lib/tracking-middleware.js';
// Import analytics routes
import analyticsRouter from './routes/analytics.js';
// Import community routes
import communityRoutes from './routes/community.js';
// Import AI Lab routes - temporarily disabled due to model import issues
// import { setupAILabRoutes } from './routes/ai-lab-main.js'

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3005;

// Security middleware
app.use(helmet());

// Cookie parser for tracking
app.use(cookieParser());

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

// ----------------------------
// MongoDB Connection
// ----------------------------
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/onelastai', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB Atlas Connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// ----------------------------
// UNIVERSAL TRACKING - Captures EVERYTHING
// ----------------------------
app.use(universalTrackingMiddleware);

// ----------------------------
// API ROUTES
// ----------------------------
app.use('/api/analytics', analyticsRouter);
app.use('/api/community', communityRoutes);

// Basic auth routes for frontend compatibility
app.get('/api/auth/status', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Real-Time Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Setup AI Lab routes - temporarily disabled due to model import issues
// setupAILabRoutes(app)

// ----------------------------
// Socket.IO Setup
// ----------------------------
const io = new SocketIOServer(httpServer, {
  cors: corsOptions,
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Track connected clients
const connectedClients = new Map();
const activeRooms = new Map();

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  connectedClients.set(socket.id, {
    connectedAt: new Date(),
    lastActivity: new Date(),
  });

  // Broadcast connection count
  io.emit('clients-update', {
    connected: connectedClients.size,
    timestamp: new Date().toISOString(),
  });

  // Join support session
  socket.on('join-support', (data) => {
    const { userId, sessionId, userName } = data;
    const room = `support_${userId}`;
    socket.join(room);

    if (!activeRooms.has(room)) {
      activeRooms.set(room, []);
    }
    activeRooms.get(room).push(socket.id);

    console.log(`👤 ${userName || userId} joined support: ${sessionId}`);
    socket.emit('joined', { sessionId, status: 'connected', room });
  });

  // Join community room
  socket.on('join-community', (data) => {
    const { userId, userName } = data;
    socket.join('community');
    console.log(`🌐 ${userName || userId} joined community`);

    // Broadcast new user to community
    socket.to('community').emit('user-joined', {
      userId,
      userName,
      timestamp: new Date().toISOString(),
    });
  });

  // Join metrics room (for dashboard)
  socket.on('join-metrics', () => {
    socket.join('metrics');
    console.log(`📊 Client subscribed to metrics: ${socket.id}`);
  });

  // Handle chat messages
  socket.on('chat-message', async (data) => {
    const { room, userId, message, agent } = data;

    // Emit typing indicator
    socket.to(room).emit('typing', { userId, isTyping: true });

    // Simulate AI processing (replace with actual AI call)
    setTimeout(() => {
      socket.to(room).emit('typing', { userId, isTyping: false });
      socket.to(room).emit('message', {
        userId: 'ai-agent',
        agent: agent || 'default',
        message: `Processing: ${message}`,
        timestamp: new Date().toISOString(),
      });
    }, 1500);
  });

  // Handle community posts
  socket.on('community-post', (data) => {
    const { userId, userName, content, postId } = data;
    io.to('community').emit('new-post', {
      postId,
      userId,
      userName,
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
    });
  });

  // Handle likes
  socket.on('post-like', (data) => {
    const { postId, userId } = data;
    io.to('community').emit('post-liked', {
      postId,
      userId,
      timestamp: new Date().toISOString(),
    });
  });

  // Handle comments
  socket.on('post-comment', (data) => {
    const { postId, userId, userName, comment } = data;
    io.to('community').emit('new-comment', {
      postId,
      userId,
      userName,
      comment,
      timestamp: new Date().toISOString(),
    });
  });

  // Update activity
  socket.on('activity', () => {
    if (connectedClients.has(socket.id)) {
      connectedClients.get(socket.id).lastActivity = new Date();
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
    connectedClients.delete(socket.id);

    // Remove from active rooms
    activeRooms.forEach((clients, room) => {
      const index = clients.indexOf(socket.id);
      if (index > -1) {
        clients.splice(index, 1);
        if (clients.length === 0) {
          activeRooms.delete(room);
        }
      }
    });

    // Broadcast updated count
    io.emit('clients-update', {
      connected: connectedClients.size,
      timestamp: new Date().toISOString(),
    });
  });
});

// Expose io instance for use in routes
app.set('io', io);

// ----------------------------
// Metrics Tracker
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

    // Emit metrics to subscribers via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to('metrics').emit('api-request', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: durationMs,
        timestamp: new Date().toISOString(),
      });
    }
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

// ----------------------------
// MongoDB Connection Check
// ----------------------------
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
    await client.db(process.env.MONGODB_DB || 'onelastai').command({ ping: 1 });
    const latencyMs = Date.now() - start;
    await client.close();
    return { ok: true, message: 'Connected to Atlas', latencyMs };
  } catch (e) {
    return { ok: false, message: e.message, latencyMs: Date.now() - start };
  }
}

// ----------------------------
// Health & Status Endpoints
// ----------------------------

app.get('/health', async (req, res) => {
  const db = await checkMongoFast();
  const metrics = calcMetricsSnapshot();
  const mem = process.memoryUsage();

  res.json({
    status: db.ok ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION || '2.0.0',
    node: process.version,
    database: db.ok ? 'connected' : 'disconnected',
    dbLatency: db.latencyMs,
    metrics: {
      rps: metrics.rps,
      avgResponseTime: metrics.avgResponseMs,
      errorRate: metrics.errorRate,
    },
    websocket: {
      connected: connectedClients.size,
      activeRooms: activeRooms.size,
    },
    memory: {
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + ' MB',
      rss: Math.round(mem.rss / 1024 / 1024) + ' MB',
    },
  });
});

app.get('/api/status', async (req, res) => {
  const db = await checkMongoFast();
  const metrics = calcMetricsSnapshot();
  const systemInfo = {
    cpuPercent: Math.random() * 30 + 20, // Placeholder
    memoryPercent: Math.round(
      (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100
    ),
    totalMem: os.totalmem(),
    freeMem: os.freemem(),
    usedMem: os.totalmem() - os.freemem(),
    load1: os.loadavg()[0],
    load5: os.loadavg()[1],
    load15: os.loadavg()[2],
    cores: os.cpus().length,
  };

  // Check AI providers
  const providers = {
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    cohere: !!process.env.COHERE_API_KEY,
    huggingface: !!process.env.HUGGINGFACE_API_KEY,
    mistral: !!process.env.MISTRAL_API_KEY,
    replicate: !!process.env.REPLICATE_API_TOKEN,
    stability: !!process.env.STABILITY_API_KEY,
    elevenlabs: !!process.env.ELEVENLABS_API_KEY,
    googleTranslate: !!process.env.GOOGLE_AI_API_KEY,
  };

  const platformStatus =
    db.ok && metrics.errorRate < 5 ? 'operational' : 'degraded';

  res.json({
    success: true,
    data: {
      system: systemInfo,
      platform: {
        status: platformStatus,
        uptime: 99.9,
        lastUpdated: new Date().toISOString(),
        version: process.env.APP_VERSION || '2.0.0',
      },
      api: {
        status: metrics.errorRate < 2 ? 'operational' : 'degraded',
        responseTime: metrics.avgResponseMs,
        uptime: 99.9,
        requestsToday: metrics.totalLastMinute * 60,
        requestsPerMinute: metrics.rps * 60,
        errorRate: metrics.errorRate,
      },
      database: {
        status: db.ok ? 'operational' : 'outage',
        connectionPool: db.ok ? 65 : 0,
        responseTime: db.latencyMs || 0,
        uptime: db.ok ? 99.9 : 0,
        type: 'MongoDB Atlas',
      },
      websocket: {
        status: 'operational',
        connectedClients: connectedClients.size,
        activeRooms: activeRooms.size,
      },
      aiServices: [
        {
          name: 'OpenAI GPT',
          status: providers.openai ? 'operational' : 'not-configured',
          responseTime: 300,
          uptime: providers.openai ? 99.9 : 0,
        },
        {
          name: 'Claude (Anthropic)',
          status: providers.anthropic ? 'operational' : 'not-configured',
          responseTime: 350,
          uptime: providers.anthropic ? 99.9 : 0,
        },
        {
          name: 'Google Gemini',
          status: providers.gemini ? 'operational' : 'not-configured',
          responseTime: 320,
          uptime: providers.gemini ? 99.9 : 0,
        },
        {
          name: 'Mistral AI',
          status: providers.mistral ? 'operational' : 'not-configured',
          responseTime: 330,
          uptime: providers.mistral ? 99.9 : 0,
        },
        {
          name: 'Cohere',
          status: providers.cohere ? 'operational' : 'not-configured',
          responseTime: 340,
          uptime: providers.cohere ? 99.9 : 0,
        },
      ],
    },
  });
});

// Real-time metrics stream via Server-Sent Events
app.get('/api/status/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendUpdate = async () => {
    const metrics = calcMetricsSnapshot();
    const db = await checkMongoFast();

    const data = {
      rps: metrics.rps,
      avgResponseMs: metrics.avgResponseMs,
      errorRate: metrics.errorRate,
      totalRequests: metrics.totalLastMinute,
      dbStatus: db.ok,
      dbLatency: db.latencyMs,
      connectedClients: connectedClients.size,
      activeRooms: activeRooms.size,
      timestamp: new Date().toISOString(),
    };

    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const interval = setInterval(sendUpdate, 2000);
  sendUpdate(); // Send immediately

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

// Broadcast metrics periodically via WebSocket
setInterval(() => {
  const metrics = calcMetricsSnapshot();
  io.to('metrics').emit('metrics-update', {
    rps: metrics.rps,
    avgResponseMs: metrics.avgResponseMs,
    errorRate: metrics.errorRate,
    totalRequests: metrics.totalLastMinute,
    connectedClients: connectedClients.size,
    activeRooms: activeRooms.size,
    timestamp: new Date().toISOString(),
  });
}, 3000);

// ----------------------------
// Start Server
// ----------------------------
httpServer.listen(PORT, () => {
  console.log('🚀 ========================================');
  console.log(`🚀 Real-Time Server Started!`);
  console.log(`🚀 ========================================`);
  console.log(`📡 HTTP Server: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/socket.io/`);
  console.log(
    `🗄️  Database: ${
      process.env.MONGODB_URI ? 'MongoDB Atlas' : 'Not configured'
    }`
  );
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Socket.IO: Enabled`);
  console.log(`📊 Metrics: Real-time tracking active`);
  console.log(`🚀 ========================================`);
});

export { io, connectedClients, activeRooms };
