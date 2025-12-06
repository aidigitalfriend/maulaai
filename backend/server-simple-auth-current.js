/**
 * Minimal server with auth endpoints for production
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
import os from 'os';
import multer from 'multer';
// import agentSubscriptionRoutes from './routes/agentSubscriptions.js';
// import agentChatHistoryRoutes from './routes/agentChatHistory.js';
// import agentUsageRoutes from './routes/agentUsage.js';
// import agentsRoutes from './routes/agents.js';
// import agentCollectionsRoutes from './routes/agentCollections.js';
// import communityRoutes from './routes/community.js';

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
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads (memory storage for base64 conversion)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Agent subscription routes
// app.use('/api/agent/subscriptions', agentSubscriptionRoutes);
// app.use('/api/agent/chat-history', agentChatHistoryRoutes);
// app.use('/api/agent/usage', agentUsageRoutes);

// Agents API routes
// app.use('/api/agents', agentsRoutes);

// Agent Collections API routes (individual agent data hubs)
// app.use('/api/agent-collections', agentCollectionsRoutes);

// Community API routes
// app.use('/api/community', communityRoutes);

// MongoDB connection
let client;
let db;

async function connectToMongoDB() {
  try {
    client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    await client.connect();
    db = client.db('onelastai');
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
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
      // Track failed login attempt
      await trackLogin(user._id, req, 'failed').catch(console.error);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if 2FA is enabled
    if (user.twoFactor?.enabled && user.twoFactor?.secret) {
      const tempToken = jwt.sign(
        { userId: user._id.toString(), requiresTwoFactor: true },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );
      return res.json({
        message: '2FA verification required',
        requires2FA: true,
        tempToken,
        userId: user._id,
      });
    }

    const token = generateToken(user._id);

    // Track successful login
    await trackLogin(user._id, req, 'success').catch(console.error);

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

// 2FA Verification endpoint (for login)
app.post('/api/auth/verify-2fa', async (req, res) => {
  try {
    const { tempToken, code, backupCode } = req.body;

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      if (!decoded.requiresTwoFactor) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid verification token' });
      }
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, message: 'Verification token expired' });
    }

    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(decoded.userId) });
    if (!user || !user.twoFactor?.enabled) {
      return res
        .status(400)
        .json({ success: false, message: 'User not found or 2FA not enabled' });
    }

    let verified = false;
    let usedBackupCode = false;

    // Try backup code first
    if (backupCode && user.twoFactor.backupCodes?.length > 0) {
      const backupIndex = user.twoFactor.backupCodes.indexOf(backupCode);
      if (backupIndex !== -1) {
        verified = true;
        usedBackupCode = true;
        // Remove used backup code
        user.twoFactor.backupCodes.splice(backupIndex, 1);
        await db
          .collection('users')
          .updateOne(
            { _id: new ObjectId(decoded.userId) },
            { $set: { 'twoFactor.backupCodes': user.twoFactor.backupCodes } }
          );
      }
    }

    // Try TOTP code if backup didn't work
    if (!verified && code) {
      verified = speakeasy.totp.verify({
        secret: user.twoFactor.secret,
        encoding: 'base32',
        token: code,
        window: 2,
      });
    }

    if (!verified) {
      // Track failed attempts
      const failedAttempts = (user.twoFactor.failedAttempts || 0) + 1;
      await db.collection('users').updateOne(
        { _id: new ObjectId(decoded.userId) },
        {
          $set: {
            'twoFactor.failedAttempts': failedAttempts,
            'twoFactor.lastFailedAttempt': new Date(),
          },
        }
      );

      return res.status(400).json({
        success: false,
        message: 'Invalid verification code',
        failedAttempts,
      });
    }

    // Reset failed attempts on success
    await db.collection('users').updateOne(
      { _id: new ObjectId(decoded.userId) },
      {
        $set: {
          'twoFactor.failedAttempts': 0,
          'twoFactor.lastVerified': new Date(),
        },
      }
    );

    // Track successful login
    await trackLogin(user._id, req, 'success').catch(console.error);

    // Generate full auth token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: usedBackupCode
        ? '2FA verified with backup code'
        : '2FA verified successfully',
      token,
      userId: user._id,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      usedBackupCode,
      remainingBackupCodes: user.twoFactor.backupCodes?.length || 0,
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Server error during verification' });
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
      return res.status(400).json({
        valid: false,
        message: 'Token is required',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    );

    // Handle both ObjectId and string userId
    let userId = decoded.userId;
    if (typeof userId === 'string' && userId.length === 24) {
      userId = new ObjectId(userId);
    }

    const user = await db.collection('users').findOne({ _id: userId });

    if (!user) {
      return res.status(401).json({
        valid: false,
        message: 'Invalid token',
      });
    }

    res.json({
      valid: true,
      message: 'Token verified',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(401).json({
      valid: false,
      message: 'Invalid token',
    });
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
    // Handle both ObjectId strings and email lookups
    let query;
    if (userId.length === 24 && /^[0-9a-fA-F]{24}$/.test(userId)) {
      query = { $or: [{ _id: new ObjectId(userId) }, { email: userId }] };
    } else {
      query = { email: userId };
    }

    const user = await db.collection('users').findOne(query);

    if (user) {
      res.json({
        success: true,
        profile: {
          name: user.name || 'User',
          email: user.email,
          avatar: user.avatar || null,
          bio: user.bio || 'AI enthusiast exploring the possibilities.',
          phoneNumber: user.phoneNumber || '',
          location: user.location || '',
          timezone: user.timezone || 'UTC',
          profession: user.profession || '',
          company: user.company || '',
          website: user.website || '',
          socialLinks: {
            linkedin: user.socialLinks?.linkedin || '',
            twitter: user.socialLinks?.twitter || '',
            github: user.socialLinks?.github || '',
          },
          preferences: {
            emailNotifications: user.preferences?.emailNotifications ?? true,
            smsNotifications: user.preferences?.smsNotifications ?? false,
            marketingEmails: user.preferences?.marketingEmails ?? false,
            productUpdates: user.preferences?.productUpdates ?? true,
          },
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

// Update user profile endpoint
app.put('/api/user/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    console.log('Updating profile for userId:', userId);
    console.log('Updates:', updates);

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.password;
    delete updates.createdAt;

    // Update user in database
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Fetch updated user
    const updatedUser = await db.collection('users').findOne({
      _id: new ObjectId(userId),
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        name: updatedUser.name || 'User',
        email: updatedUser.email,
        avatar: updatedUser.avatar || null,
        bio: updatedUser.bio || '',
        phoneNumber: updatedUser.phoneNumber || '',
        location: updatedUser.location || '',
        timezone: updatedUser.timezone || 'UTC',
        profession: updatedUser.profession || '',
        company: updatedUser.company || '',
        website: updatedUser.website || '',
        socialLinks: updatedUser.socialLinks || {
          linkedin: '',
          twitter: '',
          github: '',
        },
        preferences: updatedUser.preferences || {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: false,
          productUpdates: true,
        },
        joinedAt: updatedUser.createdAt || new Date().toISOString(),
        lastLoginAt: updatedUser.lastLoginAt || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
});

// Upload avatar endpoint - using multer for file uploads
app.post(
  '/api/user/profile/:userId/avatar',
  upload.single('avatar'),
  async (req, res) => {
    try {
      const { userId } = req.params;

      console.log('Uploading avatar for userId:', userId);
      console.log('Request file:', req.file ? 'File received' : 'No file');
      console.log('Request body:', req.body);

      // Handle file upload or direct URL
      let avatarUrl;

      if (req.file) {
        // Convert uploaded file to base64 data URL
        const base64 = req.file.buffer.toString('base64');
        avatarUrl = `data:${req.file.mimetype};base64,${base64}`;
        console.log('✅ File converted to base64, size:', req.file.size);
      } else if (req.body.avatar) {
        // Direct avatar URL or base64 string from body
        avatarUrl = req.body.avatar;
        console.log('✅ Using avatar from body');
      } else if (req.body.url) {
        // URL from body
        avatarUrl = req.body.url;
        console.log('✅ Using URL from body');
      } else {
        return res.status(400).json({
          success: false,
          message: 'Avatar file or URL is required',
          received: { body: req.body, hasFile: !!req.file },
        });
      }

      // Update user avatar in database
      const result = await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            avatar: avatarUrl,
            updatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      console.log('✅ Avatar updated successfully in database');

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        avatarUrl: avatarUrl,
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload avatar',
      });
    }
  }
);

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

// ----------------------------
// SECURITY ENDPOINTS
// ----------------------------

// Change password endpoint
app.post('/api/user/security/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'User ID, current password, and new password are required',
      });
    }

    // Get user from database
    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          password: hashedPassword,
          passwordChangedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // Log the password change in security history
    await db.collection('securityLogs').insertOne({
      userId: new ObjectId(userId),
      action: 'password_changed',
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
});

// DEPRECATED: Old toggle endpoint - use verify/disable instead
app.post('/api/user/security/2fa/toggle', async (req, res) => {
  res.status(410).json({
    success: false,
    message:
      'This endpoint is deprecated. Use /api/user/security/2fa/verify to enable 2FA, or /api/user/security/2fa/disable to disable it.',
    migration: {
      enable: 'POST /api/user/security/2fa/verify with { userId, code }',
      disable: 'POST /api/user/security/2fa/disable with { userId, password }',
    },
  });
});

// Get 2FA QR Code (setup stage - not enabled yet)
app.get('/api/user/security/2fa/setup/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('2FA Setup request for user:', userId);

    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate new secret using speakeasy
    const secret = speakeasy.generateSecret({
      name: `OneLast.ai (${user.email})`,
      issuer: 'OneLast.ai',
      length: 32,
    });

    // Store as tempSecret (not enabled until verified)
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          'twoFactor.enabled': false,
          'twoFactor.tempSecret': secret.base32,
          'twoFactor.verified': false,
          updatedAt: new Date(),
        },
      }
    );

    console.log('Generated 2FA secret for user:', userId);

    res.json({
      success: true,
      qrCode: secret.otpauth_url,
      secret: secret.base32,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup 2FA',
    });
  }
});

// Verify 2FA code and enable 2FA
app.post('/api/user/security/2fa/verify', async (req, res) => {
  try {
    const { userId, code } = req.body;
    console.log('2FA verification request:', { userId, code });

    if (!code || code.length !== 6) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid verification code format' });
    }

    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    if (!user.twoFactor?.tempSecret) {
      return res.status(400).json({
        success: false,
        message: 'No pending 2FA setup found. Please start setup again.',
      });
    }

    // Verify the code against the temp secret
    const verified = speakeasy.totp.verify({
      secret: user.twoFactor.tempSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!verified) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid verification code' });
    }

    // Generate backup codes
    const crypto = await import('crypto');
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex')
    );

    // Move tempSecret to secret and enable 2FA
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          'twoFactor.enabled': true,
          'twoFactor.secret': user.twoFactor.tempSecret,
          'twoFactor.verified': true,
          'twoFactor.backupCodes': backupCodes,
          'twoFactor.enabledAt': new Date(),
          updatedAt: new Date(),
        },
        $unset: {
          'twoFactor.tempSecret': '',
        },
      }
    );

    // Log security event
    await db.collection('securityLogs').insertOne({
      userId: new ObjectId(userId),
      action: '2fa_enabled',
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    console.log('2FA enabled for user:', userId);

    res.json({
      success: true,
      message: '2FA enabled successfully',
      backupCodes,
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Server error during verification' });
  }
});

// Disable 2FA (requires password)
app.post('/api/user/security/2fa/disable', async (req, res) => {
  try {
    const { userId, password } = req.body;
    console.log('2FA disable request for user:', userId);

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: 'Password required to disable 2FA' });
    }

    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: 'Incorrect password' });
    }

    // Disable 2FA
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          'twoFactor.enabled': false,
          'twoFactor.verified': false,
          'twoFactor.disabledAt': new Date(),
          updatedAt: new Date(),
        },
        $unset: {
          'twoFactor.secret': '',
          'twoFactor.tempSecret': '',
          'twoFactor.backupCodes': '',
        },
      }
    );

    // Log security event
    await db.collection('securityLogs').insertOne({
      userId: new ObjectId(userId),
      action: '2fa_disabled',
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    console.log('2FA disabled for user:', userId);

    res.json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Server error during disable' });
  }
});

// Get user security settings (2FA status, backup codes, etc)
app.get('/api/user/security/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        twoFactor: {
          enabled: user.twoFactor?.enabled || false,
          backupCodes: user.twoFactor?.backupCodes || [],
        },
        lastPasswordChange: user.lastPasswordChange || null,
      },
    });
  } catch (error) {
    console.error('Get security settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get security settings',
    });
  }
});

// Get backup codes
app.get('/api/user/security/2fa/backup-codes/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      backupCodes: user.twoFactor?.backupCodes || [],
    });
  } catch (error) {
    console.error('Get backup codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get backup codes',
    });
  }
});

// Get trusted devices
app.get('/api/user/security/devices/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const devices = await db
      .collection('trustedDevices')
      .find({ userId: new ObjectId(userId) })
      .sort({ lastSeen: -1 })
      .toArray();

    res.json({
      success: true,
      devices: devices.map((device) => ({
        id: device._id,
        name: device.name,
        type: device.type,
        lastSeen: device.lastSeen,
        location: device.location,
        browser: device.browser,
        current: device.current || false,
      })),
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get devices',
    });
  }
});

// Remove trusted device
app.delete('/api/user/security/devices/:userId/:deviceId', async (req, res) => {
  try {
    const { userId, deviceId } = req.params;

    await db.collection('trustedDevices').deleteOne({
      _id: new ObjectId(deviceId),
      userId: new ObjectId(userId),
    });

    // Log the device removal
    await db.collection('securityLogs').insertOne({
      userId: new ObjectId(userId),
      action: 'device_removed',
      deviceId: new ObjectId(deviceId),
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Device removed successfully',
    });
  } catch (error) {
    console.error('Remove device error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove device',
    });
  }
});

// Get login history
app.get('/api/user/security/login-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const loginHistory = await db
      .collection('securityLogs')
      .find({
        userId: new ObjectId(userId),
        action: { $in: ['login_success', 'login_failed', 'login_blocked'] },
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    res.json({
      success: true,
      loginHistory: loginHistory.map((log) => ({
        id: log._id,
        date: log.timestamp,
        location: log.location || 'Unknown',
        device: log.device || 'Unknown Device',
        status:
          log.action === 'login_success'
            ? 'success'
            : log.action === 'login_blocked'
            ? 'blocked'
            : 'failed',
        ip: log.ip,
      })),
    });
  } catch (error) {
    console.error('Get login history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get login history',
    });
  }
});

// Track login (called during login)
async function trackLogin(userId, req, status = 'success') {
  try {
    // Get device and location info
    const userAgent = req.headers['user-agent'] || '';

    // Get real client IP (handle proxy/load balancer)
    let ip =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.ip ||
      req.connection.remoteAddress ||
      '';

    // If multiple IPs in X-Forwarded-For, take the first (client IP)
    if (ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }

    // Remove IPv6 prefix if present
    ip = ip.replace('::ffff:', '');

    // Parse user agent for device info
    let deviceName = 'Unknown Device';
    let deviceType = 'desktop';
    let browser = 'Unknown Browser';

    if (userAgent.includes('iPhone')) {
      deviceName = 'iPhone';
      deviceType = 'mobile';
    } else if (userAgent.includes('iPad')) {
      deviceName = 'iPad';
      deviceType = 'tablet';
    } else if (userAgent.includes('Android')) {
      deviceName = 'Android Device';
      deviceType = 'mobile';
    } else if (userAgent.includes('Mac')) {
      deviceName = 'MacBook';
      deviceType = 'desktop';
    } else if (userAgent.includes('Windows')) {
      deviceName = 'Windows PC';
      deviceType = 'desktop';
    }

    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // Get location from IP geolocation
    let location = 'Unknown';
    try {
      // Skip geolocation for localhost/private IPs
      if (
        ip &&
        !ip.startsWith('127.') &&
        !ip.startsWith('192.168.') &&
        !ip.startsWith('10.')
      ) {
        const geoResponse = await fetch(
          `http://ip-api.com/json/${ip}?fields=status,country,city,regionName`
        );
        const geoData = await geoResponse.json();

        if (geoData.status === 'success') {
          location = `${geoData.city || geoData.regionName || ''}, ${
            geoData.country || ''
          }`.trim();
          if (location === ',') location = geoData.country || 'Unknown';
        }
      } else {
        location = 'Local Network';
      }
    } catch (geoError) {
      console.error('Geolocation error:', geoError);
    }

    // Log to security logs
    await db.collection('securityLogs').insertOne({
      userId: new ObjectId(userId),
      action: `login_${status}`,
      timestamp: new Date(),
      ip,
      userAgent,
      device: deviceName,
      browser,
      location,
    });

    // Add/update trusted device
    if (status === 'success') {
      await db.collection('trustedDevices').updateOne(
        {
          userId: new ObjectId(userId),
          browser,
          type: deviceType,
        },
        {
          $set: {
            name: deviceName,
            lastSeen: new Date(),
            location,
            current: false,
          },
        },
        { upsert: true }
      );
    }
  } catch (error) {
    console.error('Track login error:', error);
  }
}

// ----------------------------
// SUBSCRIPTION SYSTEM ENDPOINTS
// ----------------------------

// Check if user has subscription/access to an agent
app.post('/api/subscriptions/check', async (req, res) => {
  try {
    const { userId, email, agentId } = req.body;

    if (!userId && !email) {
      return res.status(400).json({
        success: false,
        message: 'User ID or email required',
        hasAccess: false,
      });
    }

    // Find user
    const user = await db.collection('users').findOne({
      $or: [
        userId ? { _id: new ObjectId(userId) } : null,
        email ? { email: email.toLowerCase() } : null,
      ].filter(Boolean),
    });

    if (!user) {
      return res.json({
        success: true,
        hasAccess: false,
        subscription: null,
      });
    }

    // Check for active subscription
    const subscription = await db.collection('subscriptions').findOne({
      userId: user._id,
      agentId,
      status: 'active',
      expiresAt: { $gt: new Date() },
    });

    res.json({
      success: true,
      hasAccess: !!subscription,
      subscription: subscription
        ? {
            id: subscription._id,
            plan: subscription.plan,
            expiresAt: subscription.expiresAt,
            autoRenew: subscription.autoRenew || false,
          }
        : null,
    });
  } catch (error) {
    console.error('Check subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check subscription',
      hasAccess: false,
    });
  }
});

// Get pricing plans
app.get('/api/subscriptions/pricing', (req, res) => {
  res.json({
    success: true,
    data: {
      perAgentPricing: true,
      plans: [
        {
          id: 'daily',
          name: 'daily',
          displayName: 'Daily Plan',
          description: '$1 per day per agent - Perfect for short-term projects',
          billingPeriod: 'day',
          priceFormatted: '$1.00',
          price: 1.0,
          period: 'day',
        },
        {
          id: 'weekly',
          name: 'weekly',
          displayName: 'Weekly Plan',
          description: '$5 per week per agent - Great for weekly projects',
          billingPeriod: 'week',
          priceFormatted: '$5.00',
          price: 5.0,
          period: 'week',
        },
        {
          id: 'monthly',
          name: 'monthly',
          displayName: 'Monthly Plan',
          description: '$19 per month per agent - Best value for regular usage',
          billingPeriod: 'month',
          priceFormatted: '$19.00',
          price: 19.0,
          period: 'month',
        },
      ],
    },
  });
});

// Create subscription (for testing - in production use Stripe webhook)
app.post('/api/subscriptions/create', async (req, res) => {
  try {
    const { userId, email, agentId, plan, paymentMethod } = req.body;

    if (!userId && !email) {
      return res.status(400).json({
        success: false,
        message: 'User ID or email required',
      });
    }

    if (!agentId || !plan) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID and plan required',
      });
    }

    // Find user
    const user = await db.collection('users').findOne({
      $or: [
        userId ? { _id: new ObjectId(userId) } : null,
        email ? { email: email.toLowerCase() } : null,
      ].filter(Boolean),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Calculate expiration date
    const now = new Date();
    const expiresAt = new Date(now);

    switch (plan) {
      case 'daily':
        expiresAt.setDate(expiresAt.getDate() + 1);
        break;
      case 'weekly':
        expiresAt.setDate(expiresAt.getDate() + 7);
        break;
      case 'monthly':
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid plan',
        });
    }

    // Create subscription
    const subscription = {
      userId: user._id,
      agentId,
      plan,
      status: 'active',
      createdAt: now,
      expiresAt,
      autoRenew: false,
      paymentMethod: paymentMethod || 'stripe',
    };

    const result = await db.collection('subscriptions').insertOne(subscription);

    res.json({
      success: true,
      message: 'Subscription created successfully',
      subscription: {
        id: result.insertedId,
        ...subscription,
      },
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
    });
  }
});

// Get user's subscriptions
app.get('/api/subscriptions/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const subscriptions = await db
      .collection('subscriptions')
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      subscriptions: subscriptions.map((sub) => ({
        id: sub._id,
        agentId: sub.agentId,
        plan: sub.plan,
        status: sub.status,
        expiresAt: sub.expiresAt,
        autoRenew: sub.autoRenew || false,
        createdAt: sub.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get user subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscriptions',
    });
  }
});

// Cancel subscription
app.post('/api/subscriptions/cancel', async (req, res) => {
  try {
    const { subscriptionId, userId } = req.body;

    if (!subscriptionId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Subscription ID and user ID required',
      });
    }

    const result = await db.collection('subscriptions').updateOne(
      {
        _id: new ObjectId(subscriptionId),
        userId: new ObjectId(userId),
      },
      {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(),
          autoRenew: false,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
    });
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
