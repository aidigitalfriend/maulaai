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

    // Get active subscriptions count for user
    let activeAgentsCount = 0;
    try {
      const subscriptions = await db.Subscription.findByUserId(userId);
      activeAgentsCount = subscriptions?.filter(s => s.status === 'active')?.length || 0;
    } catch (e) {
      console.warn('Could not fetch subscriptions for analytics:', e.message);
    }

    // Calculate usage stats
    const totalMessages = user.totalMessages || 0;
    const totalConversations = user.totalAgentInteractions || 0;
    const apiCalls = totalMessages + totalConversations;

    // Return user analytics data in the format expected by frontend
    const analyticsData = {
      // Subscription info (defaults, will be merged with billing data on frontend)
      subscription: {
        plan: 'Free',
        status: 'active',
        price: 0,
        period: 'month',
        renewalDate: 'N/A',
        daysUntilRenewal: 0,
      },
      // Usage metrics
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
          current: apiCalls,
          limit: 10000,
          percentage: Math.min(100, Math.round((apiCalls / 10000) * 100)),
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
      // Daily usage (last 7 days placeholder)
      dailyUsage: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          conversations: Math.floor(Math.random() * 10),
          messages: Math.floor(Math.random() * 50),
          apiCalls: Math.floor(Math.random() * 100),
        };
      }),
      // Weekly trends
      weeklyTrend: {
        conversationsChange: '+5%',
        messagesChange: '+12%',
        apiCallsChange: '+8%',
        responseTimeChange: '-3%',
      },
      // Agent performance (placeholder)
      agentPerformance: [],
      // Recent activity
      recentActivity: (user.activityHistory || []).slice(0, 10).map(activity => ({
        timestamp: activity.timestamp || new Date().toISOString(),
        agent: activity.agent || 'System',
        action: activity.action || 'Activity',
        status: activity.status || 'completed',
        type: activity.type || 'interaction',
      })),
      // Cost analysis
      costAnalysis: {
        currentMonth: 0,
        projectedMonth: 0,
        breakdown: [],
      },
      // Top agents
      topAgents: (user.favoriteAgents || []).slice(0, 5).map(agent => ({
        name: agent,
        usage: Math.floor(Math.random() * 100),
      })),
      // Summary
      summary: {
        totalConversations,
        totalMessages,
        totalApiCalls: apiCalls,
        activeAgents: activeAgentsCount,
        averageResponseTime: '1.2s',
        successRate: 98.5,
      },
      // Agent status
      agentStatus: activeAgentsCount > 0 ? 'active' : 'inactive',
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to get analytics' });
  }
});

export default router;
