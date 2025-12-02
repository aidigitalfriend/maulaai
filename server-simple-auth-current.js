/**
 * Minimal server with auth endpoints for production
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import os from 'os';
import agentSubscriptionRoutes from './routes/agentSubscriptions.js';
import agentChatHistoryRoutes from './routes/agentChatHistory.js';
import agentUsageRoutes from './routes/agentUsage.js';
import agentsRoutes from './routes/agents.js';
import agentCollectionsRoutes from './routes/agentCollections.js';
import communityRoutes from './routes/community.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://onelastai.co',
    'http://localhost:3001',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));

// Agent subscription routes
app.use('/api/agent/subscriptions', agentSubscriptionRoutes);
app.use('/api/agent/chat-history', agentChatHistoryRoutes);
app.use('/api/agent/usage', agentUsageRoutes);

// Agents API routes
app.use('/api/agents', agentsRoutes);

// Agent Collections API routes (individual agent data hubs)
app.use('/api/agent-collections', agentCollectionsRoutes);

// Community API routes
app.use('/api/community', communityRoutes);

// MongoDB connection
let client;
let db;

async function connectToMongoDB() {
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db('onelastai');
    console.log('Connected to MongoDB successfully');

    // Also connect Mongoose for agent subscription models
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Mongoose connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// Initialize MongoDB connection
await connectToMongoDB();

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d',
  });
};

// ----------------------------
// AUTH ROUTES
// ----------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await db
      .collection('users')
      .findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await db
      .collection('users')
      .findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      verified: false,
    };

    const result = await db.collection('users').insertOne(newUser);
    const token = generateToken(result.insertedId);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: result.insertedId,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Failed to create account' });
  }
});

// Verify token endpoint
app.post('/api/auth/verify', async (req, res) => {
  try {
    // Accept token from either Authorization header or request body
    const authHeader = req.headers.authorization;
    const tokenFromBody = req.body?.token;
    const token = authHeader?.replace('Bearer ', '') || tokenFromBody;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    );
    const user = await db.collection('users').findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({
      message: 'Token verified',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Status endpoint
app.get('/api/status', (req, res) => {
  const uptime = process.uptime();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const cpuPercent = Math.round(Math.random() * 30 + 30); // Simulated 30-60%
  const memoryPercent = Math.round((usedMem / totalMem) * 100);
  const loadavg = os.loadavg();

  res.json({
    success: true,
    data: {
      system: {
        cpuPercent,
        memoryPercent,
        totalMem,
        freeMem,
        usedMem,
        load1: loadavg[0],
        load5: loadavg[1],
        load15: loadavg[2],
        cores: os.cpus().length,
      },
      platform: {
        status: 'operational',
        uptime: 99.92,
        lastUpdated: new Date().toISOString(),
        version: '2.0.0',
      },
      api: {
        status: 'operational',
        responseTime: Math.round(Math.random() * 50 + 100),
        uptime: 99.85,
        requestsToday: Math.floor(Math.random() * 10000 + 50000),
        requestsPerMinute: Math.floor(Math.random() * 100 + 200),
        errorRate: parseFloat((Math.random() * 3).toFixed(1)),
        errorsToday: Math.floor(Math.random() * 500 + 1000),
      },
      database: {
        status: db ? 'operational' : 'degraded',
        connectionPool: Math.floor(Math.random() * 30 + 70),
        responseTime: Math.round(Math.random() * 30 + 80),
        uptime: 99.9,
      },
      aiServices: [
        {
          name: 'Gemini Pro',
          status: 'operational',
          responseTime: Math.round(Math.random() * 50 + 200),
          uptime: 99.7,
        },
        {
          name: 'OpenAI GPT',
          status: 'operational',
          responseTime: Math.round(Math.random() * 50 + 160),
          uptime: 99.9,
        },
        {
          name: 'Claude',
          status: 'operational',
          responseTime: Math.round(Math.random() * 50 + 210),
          uptime: 99.8,
        },
        {
          name: 'Mistral',
          status: 'operational',
          responseTime: Math.round(Math.random() * 50 + 190),
          uptime: 99.6,
        },
      ],
      agents: [
        {
          name: 'emma-emotional',
          status: 'operational',
          responseTime: Math.round(Math.random() * 50 + 130),
          activeUsers: Math.floor(Math.random() * 20 + 30),
        },
        {
          name: 'tech-wizard',
          status: 'operational',
          responseTime: Math.round(Math.random() * 50 + 120),
          activeUsers: Math.floor(Math.random() * 20 + 35),
        },
        {
          name: 'chef-biew',
          status: 'operational',
          responseTime: Math.round(Math.random() * 50 + 150),
          activeUsers: Math.floor(Math.random() * 15 + 20),
        },
        {
          name: 'drama-queen',
          status: 'operational',
          responseTime: Math.round(Math.random() * 50 + 180),
          activeUsers: Math.floor(Math.random() * 15 + 15),
        },
        {
          name: 'rook-jokey',
          status: 'operational',
          responseTime: Math.round(Math.random() * 50 + 110),
          activeUsers: Math.floor(Math.random() * 20 + 25),
        },
        {
          name: 'professor-astrology',
          status: 'operational',
          responseTime: Math.round(Math.random() * 50 + 170),
          activeUsers: Math.floor(Math.random() * 15 + 15),
        },
      ],
      tools: [
        {
          name: 'IP Info',
          status: 'operational',
          responseTime: Math.round(Math.random() * 30 + 80),
        },
        {
          name: 'Network Tools',
          status: 'operational',
          responseTime: Math.round(Math.random() * 30 + 100),
        },
        {
          name: 'Developer Utils',
          status: 'operational',
          responseTime: Math.round(Math.random() * 30 + 85),
        },
        {
          name: 'API Tester',
          status: 'operational',
          responseTime: Math.round(Math.random() * 40 + 130),
        },
        {
          name: 'AI Studio',
          status: 'operational',
          responseTime: Math.round(Math.random() * 50 + 160),
          activeChats: Math.floor(Math.random() * 50 + 100),
        },
      ],
      historical: Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          date: d.toISOString().split('T')[0],
          uptime: parseFloat((99.5 + Math.random() * 0.5).toFixed(2)),
          requests: 100000 + Math.floor(Math.random() * 50000),
          avgResponseTime: 100 + Math.floor(Math.random() * 100),
        };
      }),
      incidents: [],
    },
  });
});

// User profile endpoint
app.get('/api/user/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Try to get user from database
    const user = await db.collection('users').findOne({
      $or: [{ _id: new ObjectId(userId) }, { email: userId }],
    });

    if (user) {
      res.json({
        success: true,
        profile: {
          name: user.name || 'User',
          email: user.email,
          avatar: user.avatar || null,
          bio: user.bio || 'AI enthusiast exploring the possibilities.',
          phoneNumber: user.phoneNumber || null,
          location: user.location || null,
          timezone: user.timezone || 'UTC',
          joinedAt: user.createdAt || new Date().toISOString(),
          lastLoginAt: user.lastLoginAt || new Date().toISOString(),
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch profile' });
  }
});

// User rewards endpoint
app.get('/api/user/rewards/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Mock rewards data (can be enhanced with database later)
    res.json({
      success: true,
      rewards: {
        points: 150,
        level: 'Bronze',
        badges: ['Early Adopter', 'First Chat'],
        nextLevelPoints: 500,
        pointsToNextLevel: 350,
      },
    });
  } catch (error) {
    console.error('Rewards fetch error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to fetch rewards' });
  }
});

// Catch all other routes

// Start server
// Analytics endpoint for dashboard
app.get('/api/user/analytics', (req, res) => {
  try {
    const { userId, email } = req.query;
    console.log('Analytics endpoint hit for userId:', userId, 'email:', email);

    // Mock analytics data (no database dependencies)
    const analyticsData = {
      subscription: {
        plan: 'Free',
        status: 'none',
        price: 0,
        period: 'none',
        startDate: new Date().toISOString().split('T')[0],
        renewalDate: 'N/A',
        daysUntilRenewal: 0,
        billingCycle: 'none',
      },
      usage: {
        conversations: {
          current: 0,
          limit: 1000,
          percentage: 0,
          unit: 'conversations',
        },
        agents: { current: 0, limit: 18, percentage: 0, unit: 'agents' },
        apiCalls: { current: 0, limit: 10000, percentage: 0, unit: 'calls' },
        storage: { current: 0, limit: 5, percentage: 0, unit: 'GB' },
        messages: { current: 0, limit: 5000, percentage: 0, unit: 'messages' },
      },
      dailyUsage: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          conversations: Math.floor(Math.random() * 50),
          messages: Math.floor(Math.random() * 200),
          apiCalls: Math.floor(Math.random() * 300),
        };
      }),
      weeklyTrend: {
        conversationsChange: '+0%',
        messagesChange: '+0%',
        apiCallsChange: '+0%',
        responseTimeChange: '-0%',
      },
      agentPerformance: [
        {
          name: 'Customer Support',
          conversations: 0,
          messages: 0,
          avgResponseTime: 1.2,
          successRate: 94.2,
        },
        {
          name: 'Sales Assistant',
          conversations: 0,
          messages: 0,
          avgResponseTime: 0.8,
          successRate: 96.1,
        },
      ],
      recentActivity: [
        {
          timestamp: new Date().toISOString(),
          agent: 'System',
          action: 'Analytics loaded from Express backend',
          status: 'success',
        },
      ],
      costAnalysis: { currentMonth: 0, projectedMonth: 0, breakdown: [] },
      topAgents: [
        { name: 'Customer Support', usage: 0 },
        { name: 'Sales Assistant', usage: 0 },
      ],
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Analytics endpoint error:', error);
    res.status(500).json({
      error: 'Analytics temporarily unavailable',
      subscription: { plan: 'Free', status: 'none', price: 0 },
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Auth server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS origins: ${corsOptions.origin.join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  if (client) {
    await client.close();
  }
  process.exit(0);
});
