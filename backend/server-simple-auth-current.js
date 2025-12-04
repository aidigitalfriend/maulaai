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

// Enable/Disable 2FA endpoint
app.post('/api/user/security/2fa/toggle', async (req, res) => {
  try {
    const { userId, enabled } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let updateData = {
      'twoFactor.enabled': enabled,
      updatedAt: new Date(),
    };

    // If enabling 2FA, generate secret and backup codes
    if (enabled && !user.twoFactor?.secret) {
      const speakeasy = await import('speakeasy').catch(() => null);
      const crypto = await import('crypto');

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(4).toString('hex').toUpperCase()
      );

      updateData = {
        ...updateData,
        'twoFactor.secret': crypto.randomBytes(20).toString('hex'),
        'twoFactor.backupCodes': backupCodes,
        'twoFactor.method': 'authenticator',
      };
    }

    await db
      .collection('users')
      .updateOne({ _id: new ObjectId(userId) }, { $set: updateData });

    // Log the 2FA change
    await db.collection('securityLogs').insertOne({
      userId: new ObjectId(userId),
      action: enabled ? '2fa_enabled' : '2fa_disabled',
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: enabled
        ? '2FA enabled successfully'
        : '2FA disabled successfully',
      backupCodes: enabled ? updateData['twoFactor.backupCodes'] : undefined,
    });
  } catch (error) {
    console.error('2FA toggle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle 2FA',
    });
  }
});

// Get 2FA QR Code and backup codes
app.get('/api/user/security/2fa/setup/:userId', async (req, res) => {
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

    const crypto = await import('crypto');
    const secret =
      user.twoFactor?.secret || crypto.randomBytes(20).toString('hex');

    // If no secret exists, create one
    if (!user.twoFactor?.secret) {
      const backupCodes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(4).toString('hex').toUpperCase()
      );

      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            'twoFactor.secret': secret,
            'twoFactor.backupCodes': backupCodes,
            updatedAt: new Date(),
          },
        }
      );
    }

    // Generate QR code URL (for authenticator apps)
    const qrCodeUrl = `otpauth://totp/OneLastAI:${user.email}?secret=${secret}&issuer=OneLastAI`;

    res.json({
      success: true,
      secret,
      qrCodeUrl,
      backupCodes: user.twoFactor?.backupCodes || [],
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup 2FA',
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
    const ip = req.ip || req.connection.remoteAddress;

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

    // Log to security logs
    await db.collection('securityLogs').insertOne({
      userId: new ObjectId(userId),
      action: `login_${status}`,
      timestamp: new Date(),
      ip,
      userAgent,
      device: deviceName,
      browser,
      location: 'Unknown', // Can be enhanced with IP geolocation
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
            location: 'Unknown',
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
