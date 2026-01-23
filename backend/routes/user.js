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
// USER ANALYTICS - REAL DATABASE DATA
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

    // ============================================
    // 1. Get Active Subscriptions
    // ============================================
    let activeAgentsCount = 0;
    let activeSubscriptions = [];
    try {
      activeSubscriptions = await prisma.agentSubscription.findMany({
        where: { 
          userId, 
          status: 'active',
          expiryDate: { gte: new Date() }
        },
        include: { agent: true }
      });
      activeAgentsCount = activeSubscriptions.length;
    } catch (e) {
      console.warn('Could not fetch subscriptions for analytics:', e.message);
    }

    // ============================================
    // 2. Get Real Conversation & Message Counts
    // ============================================
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total conversations (chat sessions) for user
    const totalConversations = await prisma.chatSession.count({
      where: { userId }
    });

    // Total messages for user
    const totalMessagesResult = await prisma.chatMessage.count({
      where: {
        session: { userId }
      }
    });
    const totalMessages = totalMessagesResult || 0;

    // API calls count (from ApiUsage table)
    const totalApiCalls = await prisma.apiUsage.count({
      where: { userId }
    });

    // ============================================
    // 3. Get 7-Day Activity Data (Real)
    // ============================================
    const dailyUsage = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const [dayConversations, dayMessages, dayApiCalls] = await Promise.all([
        prisma.chatSession.count({
          where: {
            userId,
            createdAt: { gte: dayStart, lte: dayEnd }
          }
        }),
        prisma.chatMessage.count({
          where: {
            session: { userId },
            createdAt: { gte: dayStart, lte: dayEnd }
          }
        }),
        prisma.apiUsage.count({
          where: {
            userId,
            timestamp: { gte: dayStart, lte: dayEnd }
          }
        })
      ]);

      dailyUsage.push({
        date: dayStart.toISOString().split('T')[0],
        conversations: dayConversations,
        messages: dayMessages,
        apiCalls: dayApiCalls
      });
    }

    // ============================================
    // 4. Calculate Weekly Trends
    // ============================================
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const lastWeekEnd = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [thisWeekConversations, lastWeekConversations] = await Promise.all([
      prisma.chatSession.count({
        where: { userId, createdAt: { gte: thisWeekStart } }
      }),
      prisma.chatSession.count({
        where: { userId, createdAt: { gte: lastWeekStart, lt: lastWeekEnd } }
      })
    ]);

    const [thisWeekMessages, lastWeekMessages] = await Promise.all([
      prisma.chatMessage.count({
        where: { session: { userId }, createdAt: { gte: thisWeekStart } }
      }),
      prisma.chatMessage.count({
        where: { session: { userId }, createdAt: { gte: lastWeekStart, lt: lastWeekEnd } }
      })
    ]);

    const conversationsChange = lastWeekConversations > 0 
      ? Math.round(((thisWeekConversations - lastWeekConversations) / lastWeekConversations) * 100) 
      : thisWeekConversations > 0 ? 100 : 0;
    const messagesChange = lastWeekMessages > 0 
      ? Math.round(((thisWeekMessages - lastWeekMessages) / lastWeekMessages) * 100) 
      : thisWeekMessages > 0 ? 100 : 0;

    // ============================================
    // 5. Top Agents by Usage (Real)
    // ============================================
    const agentUsageStats = await prisma.chatSession.groupBy({
      by: ['agentId'],
      where: { 
        userId,
        agentId: { not: null }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    const totalAgentSessions = agentUsageStats.reduce((sum, a) => sum + a._count.id, 0);
    
    // Get agent names for the top agents
    const topAgentIds = agentUsageStats.map(a => a.agentId).filter(Boolean);
    const agents = topAgentIds.length > 0 ? await prisma.agent.findMany({
      where: { agentId: { in: topAgentIds } }
    }) : [];
    
    const agentNameMap = {};
    agents.forEach(a => { agentNameMap[a.agentId] = a.name; });

    const topAgents = agentUsageStats.map(stat => ({
      id: stat.agentId,
      name: agentNameMap[stat.agentId] || stat.agentId || 'Unknown',
      sessions: stat._count.id,
      usage: totalAgentSessions > 0 ? Math.round((stat._count.id / totalAgentSessions) * 100) : 0
    }));

    // ============================================
    // 6. Agent Performance Stats
    // ============================================
    const agentPerformance = [];
    for (const sub of activeSubscriptions.slice(0, 5)) {
      const agentSessions = await prisma.chatSession.count({
        where: { userId, agentId: sub.agentId }
      });
      const agentMessages = await prisma.chatMessage.count({
        where: { session: { userId, agentId: sub.agentId } }
      });
      
      // Calculate success rate from feedback
      const feedbackStats = await prisma.chatFeedback.aggregate({
        where: {
          userId,
          session: { agentId: sub.agentId }
        },
        _avg: { rating: true },
        _count: { id: true }
      });

      const avgRating = feedbackStats._avg.rating || 4.5;
      const successRate = Math.min(100, Math.round((avgRating / 5) * 100));

      agentPerformance.push({
        agentId: sub.agentId,
        name: sub.agent?.name || sub.agentId,
        sessions: agentSessions,
        messages: agentMessages,
        successRate,
        avgResponseTime: '1.2s', // TODO: Calculate from actual latency data
        status: 'active'
      });
    }

    // ============================================
    // 7. Recent Activity (Last 30 minutes)
    // ============================================
    const [recentSessions, recentEvents, recentApiCalls] = await Promise.all([
      prisma.chatSession.findMany({
        where: { userId, updatedAt: { gte: thirtyMinutesAgo } },
        include: { agent: true },
        orderBy: { updatedAt: 'desc' },
        take: 10
      }),
      prisma.userEvent.findMany({
        where: { userId, occurredAt: { gte: thirtyMinutesAgo } },
        orderBy: { occurredAt: 'desc' },
        take: 10
      }),
      prisma.apiUsage.findMany({
        where: { userId, timestamp: { gte: thirtyMinutesAgo } },
        orderBy: { timestamp: 'desc' },
        take: 10
      })
    ]);

    const recentActivity = [
      ...recentSessions.map(s => ({
        timestamp: s.updatedAt.toISOString(),
        agent: s.agent?.name || s.agentId || 'Chat',
        action: 'Chat Session',
        status: s.isActive ? 'active' : 'completed',
        type: 'conversation'
      })),
      ...recentEvents.map(e => ({
        timestamp: e.occurredAt.toISOString(),
        agent: 'System',
        action: e.action || e.eventType,
        status: e.success !== false ? 'completed' : 'failed',
        type: e.category || 'event'
      })),
      ...recentApiCalls.map(a => ({
        timestamp: a.timestamp.toISOString(),
        agent: 'API',
        action: `${a.method} ${a.endpoint}`,
        status: a.statusCode < 400 ? 'completed' : 'failed',
        type: 'api_call'
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15);

    // ============================================
    // 8. Cost Analysis (from subscriptions)
    // ============================================
    const thisMonthCost = activeSubscriptions.reduce((sum, sub) => {
      if (new Date(sub.startDate) >= thisMonthStart) {
        return sum + (sub.price || 0);
      }
      return sum;
    }, 0);

    const totalSubscriptionCost = activeSubscriptions.reduce((sum, sub) => sum + (sub.price || 0), 0);

    const costBreakdown = activeSubscriptions.map(sub => ({
      agent: sub.agent?.name || sub.agentId,
      plan: sub.plan,
      cost: sub.price,
      startDate: sub.startDate.toISOString()
    }));

    // ============================================
    // 9. Success Rate Calculation
    // ============================================
    const totalFeedback = await prisma.chatFeedback.aggregate({
      where: { userId },
      _avg: { rating: true },
      _count: { id: true }
    });
    const overallSuccessRate = totalFeedback._avg.rating 
      ? Math.min(100, Math.round((totalFeedback._avg.rating / 5) * 100))
      : 98.5; // Default if no feedback

    // ============================================
    // Build Analytics Response
    // ============================================
    const analyticsData = {
      subscription: {
        plan: activeSubscriptions.length > 0 ? `${activeSubscriptions.length} Active Agent${activeSubscriptions.length > 1 ? 's' : ''}` : 'No Active Plan',
        status: activeSubscriptions.length > 0 ? 'active' : 'inactive',
        price: totalSubscriptionCost,
        period: 'current',
        renewalDate: activeSubscriptions[0]?.expiryDate?.toISOString() || 'N/A',
        daysUntilRenewal: activeSubscriptions[0]?.expiryDate 
          ? Math.ceil((new Date(activeSubscriptions[0].expiryDate) - now) / (1000 * 60 * 60 * 24))
          : 0,
      },
      usage: {
        conversations: {
          current: totalConversations,
          limit: 1000,
          percentage: Math.min(100, Math.round((totalConversations / 1000) * 100)),
          unit: 'conversations',
        },
        agents: {
          current: activeAgentsCount,
          limit: 18,
          percentage: Math.round((activeAgentsCount / 18) * 100),
          unit: 'agents',
        },
        apiCalls: {
          current: totalApiCalls,
          limit: 10000,
          percentage: Math.min(100, Math.round((totalApiCalls / 10000) * 100)),
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
          limit: 5000,
          percentage: Math.min(100, Math.round((totalMessages / 5000) * 100)),
          unit: 'messages',
        },
      },
      dailyUsage,
      weeklyTrend: {
        conversationsChange: `${conversationsChange >= 0 ? '+' : ''}${conversationsChange}%`,
        messagesChange: `${messagesChange >= 0 ? '+' : ''}${messagesChange}%`,
        apiCallsChange: '+0%', // TODO: Calculate
        responseTimeChange: '-0%', // TODO: Calculate
      },
      agentPerformance,
      recentActivity,
      costAnalysis: {
        currentMonth: thisMonthCost,
        projectedMonth: totalSubscriptionCost,
        breakdown: costBreakdown,
      },
      topAgents,
      summary: {
        totalConversations,
        totalMessages,
        totalApiCalls,
        activeAgents: activeAgentsCount,
        averageResponseTime: '1.2s',
        successRate: overallSuccessRate,
      },
      agentStatus: activeAgentsCount > 0 ? 'active' : 'inactive',
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to get analytics' });
  }
});

// GET /api/user/conversations/:userId - Get user's conversation history
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Import prisma for direct database access
    const prisma = db.prisma;

    // Build where clause
    const where = {
      userId,
      isArchived: false,
    };

    // Add search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count and conversations in parallel
    const [totalCount, conversations] = await Promise.all([
      prisma.chatSession.count({ where }),
      prisma.chatSession.findMany({
        where,
        include: {
          agent: {
            select: {
              agentId: true,
              name: true,
              avatarUrl: true,
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              content: true,
              role: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    // Transform conversations for response - match frontend expected format
    const formattedConversations = conversations.map((conv) => {
      // Calculate duration from session stats if available
      const stats = conv.stats || {};
      const durationMs = stats.durationMs || 0;
      const durationMinutes = Math.round(durationMs / 60000);
      const duration = durationMinutes > 60 
        ? `${Math.round(durationMinutes / 60)}h ${durationMinutes % 60}m`
        : `${durationMinutes}m`;

      return {
        id: conv.id,
        sessionId: conv.sessionId,
        agent: conv.agent?.name || 'AI Assistant',
        topic: conv.name || 'Untitled Conversation',
        date: conv.updatedAt.toISOString(),
        duration: duration || '0m',
        messageCount: conv._count.messages,
        lastMessage: conv.messages[0] ? {
          content: conv.messages[0].content?.substring(0, 150) || '',
          timestamp: conv.messages[0].createdAt?.toISOString(),
        } : null,
        // Additional fields for compatibility
        agentId: conv.agentId,
        agentAvatar: conv.agent?.avatarUrl,
        tags: conv.tags || [],
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Response format matching frontend expectations
    res.json({
      success: true,
      data: {
        conversations: formattedConversations,
        pagination: {
          page,
          limit,
          total: totalCount,
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

// GET /api/user/conversations/:userId/export - Export user's conversations
router.get('/conversations/:userId/export', async (req, res) => {
  try {
    const { userId } = req.params;
    const format = req.query.format || 'json';

    const prisma = db.prisma;

    // Get all conversations with messages
    const conversations = await prisma.chatSession.findMany({
      where: {
        userId,
        isArchived: false,
      },
      include: {
        agent: {
          select: {
            agentId: true,
            name: true,
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

    if (format === 'csv') {
      // Generate CSV
      const csvRows = ['Conversation,Agent,Role,Message,Timestamp'];
      conversations.forEach((conv) => {
        conv.messages.forEach((msg) => {
          const escapedContent = `"${msg.content.replace(/"/g, '""')}"`;
          csvRows.push(
            `"${conv.name}","${conv.agent?.name || 'AI'}","${msg.role}",${escapedContent},"${msg.createdAt.toISOString()}"`
          );
        });
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="conversations-${userId}.csv"`);
      return res.send(csvRows.join('\n'));
    }

    // Default to JSON format
    const exportData = conversations.map((conv) => ({
      name: conv.name,
      agent: conv.agent?.name || 'AI Assistant',
      createdAt: conv.createdAt,
      messages: conv.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
      })),
    }));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="conversations-${userId}.json"`);
    res.json({
      success: true,
      exportedAt: new Date().toISOString(),
      totalConversations: exportData.length,
      conversations: exportData,
    });
  } catch (error) {
    console.error('Export conversations error:', error);
    res.status(500).json({ success: false, error: 'Failed to export conversations' });
  }
});

export default router;
