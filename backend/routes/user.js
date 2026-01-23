/**
 * USER ROUTES - PRISMA/POSTGRESQL
 * User profile and settings management
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../lib/db.js';
import { cache, cacheKeys } from '../lib/cache.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const userId = req.params.userId || req.headers['x-user-id'] || 'user';
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${userId}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// GET /api/user/profile - Get current user profile
router.get('/profile', async (req, res) => {
  try {
    let userId = req.headers['x-user-id'];
    let userEmail = req.headers['x-user-email'];
    
    // Also check session cookie for authentication
    if (!userId && !userEmail) {
      const sessionId = req.cookies?.sessionId;
      if (sessionId) {
        const sessionUser = await db.User.findBySessionId(sessionId);
        if (sessionUser && (!sessionUser.sessionExpiry || new Date(sessionUser.sessionExpiry) > new Date())) {
          userId = sessionUser.id;
        }
      }
    }

    if (!userId && !userEmail) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Generate cache key
    const cacheKey = userId ? cacheKeys.user(`${userId}:profile`) : `user:email:${userEmail}:profile`;

    // Try to get from cache first
    const cachedProfile = await cache.get(cacheKey);
    if (cachedProfile) {
      return res.json({
        success: true,
        profile: cachedProfile,
        cached: true,
      });
    }

    // Find user by ID or email
    let user;
    if (userId) {
      user = await db.User.findById(userId);
    } else {
      user = await db.User.findByEmail(userEmail);
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Build complete profile data with defaults
    const profile = {
      name: user.name || 'User',
      email: user.email,
      avatar: user.avatar || '',
      bio: user.bio || 'AI enthusiast exploring the future of intelligent systems.',
      phoneNumber: user.phoneNumber || '',
      location: user.location || '',
      timezone: user.timezone || 'Pacific Time (PT)',
      profession: user.profession || 'AI Developer',
      company: user.company || '',
      website: user.socialLinks?.website || '',
      socialLinks: {
        linkedin: user.socialLinks?.linkedin || '',
        twitter: user.socialLinks?.twitter || '',
        github: user.socialLinks?.github || '',
      },
      preferences: user.preferences || {
        language: 'en',
        theme: 'auto',
        notifications: { email: true, push: true, sms: false },
        privacy: { profileVisibility: 'public', showEmail: false, showPhone: false },
      },
    };

    // Cache the profile for 10 minutes
    await cache.set(cacheKey, profile, 600);

    res.json({
      success: true,
      profile: profile,
      cached: false,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// PUT /api/user/profile - Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];
    const {
      name,
      avatar,
      bio,
      phoneNumber,
      location,
      timezone,
      profession,
      company,
      website,
      socialLinks,
      preferences,
    } = req.body;

    if (!userId && !userEmail) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Build update object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (bio !== undefined) updateData.bio = bio;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (location !== undefined) updateData.location = location;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (profession !== undefined) updateData.profession = profession;
    if (company !== undefined) updateData.company = company;

    // Handle social links
    if (socialLinks || website) {
      const currentSocial = {};
      if (socialLinks) {
        if (socialLinks.linkedin !== undefined) currentSocial.linkedin = socialLinks.linkedin;
        if (socialLinks.twitter !== undefined) currentSocial.twitter = socialLinks.twitter;
        if (socialLinks.github !== undefined) currentSocial.github = socialLinks.github;
      }
      if (website !== undefined) currentSocial.website = website;
      updateData.socialLinks = currentSocial;
    }

    // Handle preferences
    if (preferences) {
      updateData.preferences = preferences;
    }

    // Update user
    let user;
    if (userId) {
      user = await db.User.update(userId, updateData);
    } else {
      user = await db.User.updateByEmail(userEmail, updateData);
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Invalidate cache
    const cacheKey = userId ? cacheKeys.user(`${userId}:profile`) : `user:email:${userEmail}:profile`;
    await cache.del(cacheKey);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        location: user.location,
        timezone: user.timezone,
        profession: user.profession,
        company: user.company,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// POST /api/user/avatar - Upload avatar
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];

    if (!userId && !userEmail) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user avatar
    if (userId) {
      await db.User.update(userId, { avatar: avatarUrl });
    } else {
      await db.User.updateByEmail(userEmail, { avatar: avatarUrl });
    }

    // Invalidate cache
    const cacheKey = userId ? cacheKeys.user(`${userId}:profile`) : `user:email:${userEmail}:profile`;
    await cache.del(cacheKey);

    res.json({
      success: true,
      avatarUrl,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload avatar' });
  }
});

// GET /api/user/subscriptions - Get user's active subscriptions
router.get('/subscriptions', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const subscriptions = await db.AgentSubscription.findByUser(userId);

    res.json({
      success: true,
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        agentId: sub.agentId,
        agentName: sub.agent?.name || sub.agentId,
        plan: sub.plan,
        price: sub.price,
        status: sub.status,
        startDate: sub.startDate,
        expiryDate: sub.expiryDate,
        autoRenew: sub.autoRenew,
      })),
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch subscriptions' });
  }
});

// GET /api/user/favorites - Get user's favorites
router.get('/favorites', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const favorites = await db.Favorites.findByUser(userId);

    res.json({
      success: true,
      favorites,
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch favorites' });
  }
});

// POST /api/user/favorites - Add a favorite
router.post('/favorites', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { itemType, itemId, notes } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!itemType || !itemId) {
      return res.status(400).json({ success: false, error: 'itemType and itemId required' });
    }

    const favorite = await db.Favorites.add(userId, itemType, itemId, notes);

    res.json({
      success: true,
      favorite,
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ success: false, error: 'Failed to add favorite' });
  }
});

// DELETE /api/user/favorites/:itemType/:itemId - Remove a favorite
router.delete('/favorites/:itemType/:itemId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { itemType, itemId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    await db.Favorites.remove(userId, itemType, itemId);

    res.json({
      success: true,
      message: 'Favorite removed',
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove favorite' });
  }
});

// GET /api/user/settings - Get user settings
router.get('/settings', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const user = await db.User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      settings: {
        preferences: user.preferences || {},
        twoFactorEnabled: user.twoFactorEnabled || false,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

// PUT /api/user/settings - Update user settings
router.put('/settings', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { preferences } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const user = await db.User.update(userId, { preferences });

    res.json({
      success: true,
      message: 'Settings updated',
      settings: {
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

// POST /api/user/change-password - Change password
router.post('/change-password', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Both passwords required' });
    }

    const user = await db.User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify current password
    const isValid = await db.User.comparePassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    // Update password
    await db.User.update(userId, { password: newPassword });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
});

// ============================================
// USER REWARDS
// ============================================
router.get('/rewards/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's gamification/rewards data
    const user = await db.User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Return rewards data (with defaults for new users)
    const rewards = {
      points: user.points || 0,
      level: user.level || 1,
      badges: user.badges || [],
      achievements: user.achievements || [],
      streakDays: user.streakDays || 0,
      totalRewards: user.totalRewards || 0,
      lastActivityDate: user.lastActivityDate || new Date(),
    };

    res.json({
      success: true,
      rewards,
    });
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ success: false, error: 'Failed to get rewards' });
  }
});

// ============================================
// USER PREFERENCES
// ============================================
router.get('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await db.User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Return preferences with defaults
    const preferences = user.preferences || {
      language: 'en',
      theme: 'auto',
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: false,
      },
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        showActivity: true,
      },
      accessibility: {
        reduceMotion: false,
        highContrast: false,
        fontSize: 'medium',
      },
    };

    res.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ success: false, error: 'Failed to get preferences' });
  }
});

router.put('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;

    const user = await db.User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Merge new preferences with existing
    const updatedPreferences = {
      ...(user.preferences || {}),
      ...preferences,
    };

    await db.User.update(userId, { preferences: updatedPreferences });

    res.json({
      success: true,
      message: 'Preferences updated',
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ success: false, error: 'Failed to update preferences' });
  }
});

// ============================================
// USER SECURITY
// ============================================
router.get('/security/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await db.User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Return security settings (never include actual password)
    const security = {
      twoFactorEnabled: user.twoFactorEnabled || false,
      lastPasswordChange: user.lastPasswordChange || user.createdAt,
      activeSessions: user.activeSessions || 1,
      loginHistory: user.loginHistory || [],
      securityQuestions: user.securityQuestions ? true : false,
      trustedDevices: user.trustedDevices || [],
    };

    res.json({
      success: true,
      security,
    });
  } catch (error) {
    console.error('Get security error:', error);
    res.status(500).json({ success: false, error: 'Failed to get security settings' });
  }
});

router.put('/security/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const securitySettings = req.body;

    const user = await db.User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Update security settings
    const updates = {};
    if (securitySettings.twoFactorEnabled !== undefined) {
      updates.twoFactorEnabled = securitySettings.twoFactorEnabled;
    }
    if (securitySettings.securityQuestions) {
      updates.securityQuestions = securitySettings.securityQuestions;
    }

    await db.User.update(userId, updates);

    res.json({
      success: true,
      message: 'Security settings updated',
    });
  } catch (error) {
    console.error('Update security error:', error);
    res.status(500).json({ success: false, error: 'Failed to update security settings' });
  }
});

// ============================================
// USER BILLING
// ============================================
router.get('/billing/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await db.User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Return billing data (with defaults for users without billing info)
    const billing = {
      plan: user.subscription?.plan || 'free',
      status: user.subscription?.status || 'active',
      billingCycle: user.subscription?.billingCycle || 'monthly',
      nextBillingDate: user.subscription?.nextBillingDate || null,
      paymentMethod: user.paymentMethod ? {
        type: user.paymentMethod.type || 'card',
        last4: user.paymentMethod.last4 || '****',
        expiryMonth: user.paymentMethod.expiryMonth,
        expiryYear: user.paymentMethod.expiryYear,
      } : null,
      invoices: user.invoices || [],
      credits: user.credits || 0,
      usage: {
        apiCalls: user.usage?.apiCalls || 0,
        storage: user.usage?.storage || 0,
        bandwidth: user.usage?.bandwidth || 0,
      },
    };

    res.json({
      success: true,
      billing,
    });
  } catch (error) {
    console.error('Get billing error:', error);
    res.status(500).json({ success: false, error: 'Failed to get billing info' });
  }
});

// ============================================
// USER CONVERSATIONS
// ============================================
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    // Import prisma for direct queries
    const { prisma } = await import('../lib/prisma.js');

    // Build where clause
    const whereClause = {
      userId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Get total count
    const total = await prisma.chatSession.count({ where: whereClause });

    // Get conversations with messages
    const chatSessions = await prisma.chatSession.findMany({
      where: whereClause,
      include: {
        agent: {
          select: {
            name: true,
            agentId: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            createdAt: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    });

    // Transform to expected format
    const conversations = chatSessions.map((session) => {
      const lastMsg = session.messages[0];
      const createdAt = new Date(session.createdAt);
      const updatedAt = new Date(session.updatedAt);
      const durationMs = updatedAt.getTime() - createdAt.getTime();
      const durationMinutes = Math.max(1, Math.floor(durationMs / 60000));

      return {
        id: session.sessionId || session.id,
        agent: session.agent?.name || session.agentId || 'Unknown Agent',
        topic: session.name || 'Untitled Conversation',
        date: session.createdAt.toISOString(),
        duration: durationMinutes < 60 
          ? `${durationMinutes} min` 
          : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`,
        messageCount: session._count.messages || 0,
        lastMessage: lastMsg ? {
          content: lastMsg.content?.substring(0, 150) + (lastMsg.content?.length > 150 ? '...' : ''),
          timestamp: lastMsg.createdAt.toISOString(),
        } : null,
      };
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, error: 'Failed to get conversations' });
  }
});

// GET /api/user/conversations/:userId/export - Export user conversations
router.get('/conversations/:userId/export', async (req, res) => {
  try {
    const { userId } = req.params;
    const format = req.query.format || 'json';

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    // Import prisma for direct queries
    const { prisma } = await import('../lib/prisma.js');

    // Get all conversations with messages
    const chatSessions = await prisma.chatSession.findMany({
      where: { userId },
      include: {
        agent: {
          select: {
            name: true,
            agentId: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            role: true,
            content: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform data for export
    const exportData = chatSessions.map((session) => ({
      id: session.sessionId || session.id,
      agent: session.agent?.name || session.agentId || 'Unknown Agent',
      topic: session.name || 'Untitled Conversation',
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      messageCount: session.messages.length,
      messages: session.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt.toISOString(),
      })),
    }));

    if (format === 'csv') {
      // Build CSV content
      const csvRows = ['ID,Agent,Topic,Date,Messages'];
      exportData.forEach((conv) => {
        csvRows.push(
          `"${conv.id}","${conv.agent}","${conv.topic.replace(/"/g, '""')}","${conv.createdAt}",${conv.messageCount}`
        );
      });
      const csvContent = csvRows.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=conversations.csv');
      return res.send(csvContent);
    }

    // Default to JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=conversations.json');
    return res.json({ conversations: exportData });
  } catch (error) {
    console.error('Export conversations error:', error);
    res.status(500).json({ success: false, error: 'Failed to export conversations' });
  }
});

// ============================================
// USER ANALYTICS
// ============================================
router.get('/analytics', async (req, res) => {
  try {
    let userId = req.headers['x-user-id'];
    
    // Check session cookie if no header
    if (!userId) {
      const sessionId = req.cookies?.sessionId;
      if (sessionId) {
        const sessionUser = await db.User.findBySessionId(sessionId);
        if (sessionUser && (!sessionUser.sessionExpiry || new Date(sessionUser.sessionExpiry) > new Date())) {
          userId = sessionUser.id;
        }
      }
    }

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const user = await db.User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Import prisma for direct queries
    const { prisma } = await import('../lib/prisma.js');

    // Get user's agent subscriptions
    let activeAgents = 0;
    let subscriptions = [];
    try {
      subscriptions = await prisma.agentSubscription.findMany({
        where: { 
          userId,
          status: 'active'
        },
        include: {
          agent: true
        }
      });
      activeAgents = subscriptions.length;
    } catch (e) {
      console.log('Agent subscriptions query error:', e.message);
    }

    // Get total conversations (chat sessions) for this user
    let totalConversations = 0;
    let chatSessions = [];
    try {
      chatSessions = await prisma.chatSession.findMany({
        where: { userId },
        include: {
          agent: true,
          messages: {
            select: { id: true, createdAt: true, role: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      });
      totalConversations = chatSessions.length;
    } catch (e) {
      console.log('Chat sessions query error:', e.message);
    }

    // Get total messages count (API calls equivalent)
    let totalMessages = 0;
    try {
      totalMessages = await prisma.chatMessage.count({
        where: {
          session: { userId }
        }
      });
    } catch (e) {
      console.log('Messages count error:', e.message);
    }

    // Get API usage count
    let apiCallsCount = 0;
    try {
      apiCallsCount = await prisma.apiUsage.count({
        where: { userId }
      });
    } catch (e) {
      // Table might not exist
    }
    
    // Total API calls = messages + api usages
    const totalApiCalls = totalMessages + apiCallsCount;

    // Calculate success rate from chat feedback
    let successRate = 0;
    try {
      const feedbackStats = await prisma.chatFeedback.aggregate({
        where: { userId },
        _avg: { rating: true },
        _count: true
      });
      if (feedbackStats._count > 0 && feedbackStats._avg.rating) {
        successRate = (feedbackStats._avg.rating / 5) * 100;
      }
    } catch (e) {
      // No feedback yet
    }

    // Get 7-day activity data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    let dailyUsage = [];
    try {
      // Get messages per day for the last 7 days
      const dailyMessages = await prisma.chatMessage.groupBy({
        by: ['createdAt'],
        where: {
          session: { userId },
          createdAt: { gte: sevenDaysAgo }
        },
        _count: true
      });

      // Create a map for the last 7 days
      const dayMap = new Map();
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dayMap.set(dateStr, { date: dateStr, conversations: 0, messages: 0, apiCalls: 0 });
      }

      // Aggregate by day
      dailyMessages.forEach(m => {
        const dateStr = new Date(m.createdAt).toISOString().split('T')[0];
        if (dayMap.has(dateStr)) {
          const entry = dayMap.get(dateStr);
          entry.messages += m._count;
          entry.apiCalls += m._count;
        }
      });

      // Get conversations per day
      chatSessions.forEach(session => {
        const dateStr = new Date(session.createdAt).toISOString().split('T')[0];
        if (dayMap.has(dateStr)) {
          dayMap.get(dateStr).conversations++;
        }
      });

      dailyUsage = Array.from(dayMap.values());
    } catch (e) {
      console.log('Daily usage error:', e.message);
      // Generate empty 7-day data
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dailyUsage.push({
          date: date.toISOString().split('T')[0],
          conversations: 0,
          messages: 0,
          apiCalls: 0
        });
      }
    }

    // Calculate agent performance from chat sessions
    const agentUsageMap = new Map();
    chatSessions.forEach(session => {
      const agentId = session.agentId || 'studio';
      const agentName = session.agent?.name || 'AI Studio';
      
      if (!agentUsageMap.has(agentId)) {
        agentUsageMap.set(agentId, {
          agentId,
          name: agentName,
          conversations: 0,
          messages: 0,
          avgResponseTime: 0,
          successRate: 95 + Math.random() * 5, // Simulated success rate
          totalResponseTime: 0
        });
      }
      
      const agent = agentUsageMap.get(agentId);
      agent.conversations++;
      agent.messages += session.messages?.length || 0;
      
      // Calculate average response time from session stats if available
      const stats = session.stats;
      if (stats && typeof stats === 'object' && stats.durationMs) {
        agent.totalResponseTime += stats.durationMs;
      }
    });

    // Convert to array and calculate averages
    const agentPerformance = Array.from(agentUsageMap.values()).map(agent => ({
      agentId: agent.agentId,
      name: agent.name,
      conversations: agent.conversations,
      messages: agent.messages,
      avgResponseTime: agent.conversations > 0 
        ? Math.round((agent.totalResponseTime / agent.conversations) / 1000) || Math.floor(Math.random() * 3 + 1)
        : 2,
      successRate: Math.round(agent.successRate * 10) / 10
    }));

    // Sort by conversations for top agents
    // Calculate total conversations for percentage calculation
    const totalAgentConversations = agentPerformance.reduce((sum, a) => sum + a.conversations, 0) || 1;
    const topAgents = [...agentPerformance]
      .sort((a, b) => b.conversations - a.conversations)
      .slice(0, 5)
      .map((agent, index) => ({
        rank: index + 1,
        name: agent.name,
        usage: Math.round((agent.conversations / totalAgentConversations) * 100),
        conversations: agent.conversations,
        messages: agent.messages
      }));

    // Get recent activity (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    let recentActivity = [];
    try {
      const recentMessages = await prisma.chatMessage.findMany({
        where: {
          session: { userId },
          createdAt: { gte: thirtyMinutesAgo }
        },
        include: {
          session: {
            include: { agent: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      recentActivity = recentMessages.map(msg => ({
        id: msg.id,
        type: msg.role === 'user' ? 'message_sent' : 'message_received',
        action: msg.role === 'user' 
          ? `Sent message`
          : `Received response`,
        description: msg.role === 'user' 
          ? `Sent message to ${msg.session.agent?.name || 'AI Studio'}`
          : `Received response from ${msg.session.agent?.name || 'AI Studio'}`,
        agent: msg.session.agent?.name || 'AI Studio',
        timestamp: msg.createdAt,
        agentId: msg.session.agentId,
        agentName: msg.session.agent?.name || 'AI Studio',
        status: 'success'
      }));
    } catch (e) {
      console.log('Recent activity error:', e.message);
    }

    // Calculate weekly trends (compare current week vs last week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    let currentWeekConversations = 0;
    let lastWeekConversations = 0;
    let currentWeekMessages = 0;
    let lastWeekMessages = 0;

    chatSessions.forEach(session => {
      const sessionDate = new Date(session.createdAt);
      if (sessionDate >= oneWeekAgo) {
        currentWeekConversations++;
        currentWeekMessages += session.messages?.length || 0;
      } else if (sessionDate >= twoWeeksAgo) {
        lastWeekConversations++;
        lastWeekMessages += session.messages?.length || 0;
      }
    });

    const calcChange = (current, previous) => {
      if (previous === 0) return current > 0 ? '+100%' : '+0%';
      const change = ((current - previous) / previous * 100).toFixed(0);
      return change >= 0 ? `+${change}%` : `${change}%`;
    };

    // Cost analysis - estimate based on usage
    const estimatedCostPerMessage = 0.002; // $0.002 per message
    const currentMonthMessages = chatSessions
      .filter(s => new Date(s.createdAt).getMonth() === new Date().getMonth())
      .reduce((sum, s) => sum + (s.messages?.length || 0), 0);
    const currentMonthCost = Math.round(currentMonthMessages * estimatedCostPerMessage * 100) / 100;

    // Account age
    const accountAgeDays = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));

    // Build analytics response
    const analytics = {
      subscription: {
        plan: 'Free',
        status: 'active',
        price: 0,
        period: 'month',
        renewalDate: 'N/A',
        daysUntilRenewal: 0,
      },
      usage: {
        conversations: {
          current: totalConversations,
          limit: 1000,
          percentage: Math.min(100, (totalConversations / 1000) * 100),
          unit: 'messages',
        },
        agents: {
          current: activeAgents,
          limit: 10,
          percentage: Math.min(100, (activeAgents / 10) * 100),
          unit: 'agents',
        },
        apiCalls: {
          current: totalApiCalls,
          limit: 10000,
          percentage: Math.min(100, (totalApiCalls / 10000) * 100),
          unit: 'calls',
        },
        storage: {
          current: 0,
          limit: 1000,
          percentage: 0,
          unit: 'MB',
        },
        messages: {
          current: totalMessages,
          limit: 10000,
          percentage: Math.min(100, (totalMessages / 10000) * 100),
          unit: 'messages',
        },
      },
      dailyUsage,
      weeklyTrend: {
        conversationsChange: calcChange(currentWeekConversations, lastWeekConversations),
        messagesChange: calcChange(currentWeekMessages, lastWeekMessages),
        apiCallsChange: calcChange(currentWeekMessages, lastWeekMessages),
        responseTimeChange: '+0%',
      },
      agentPerformance,
      recentActivity,
      costAnalysis: {
        currentMonth: currentMonthCost,
        projectedMonth: Math.round(currentMonthCost * 1.1 * 100) / 100,
        breakdown: agentPerformance.map(agent => ({
          name: agent.name,
          category: agent.name,
          cost: Math.round(agent.messages * estimatedCostPerMessage * 100) / 100,
          percentage: totalMessages > 0 ? Math.round((agent.messages / totalMessages) * 100) : 0
        }))
      },
      topAgents,
      agentStatus: activeAgents > 0 ? 'active' : 'inactive',
      // Legacy fields for backwards compatibility
      totalLogins: user.totalLogins || 0,
      lastLogin: user.lastLoginAt || user.updatedAt,
      accountAge: accountAgeDays,
      totalMessages,
      totalAgentInteractions: totalApiCalls,
      favoriteAgents: user.favoriteAgents || [],
      activityHistory: recentActivity,
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to get analytics' });
  }
});

export default router;
