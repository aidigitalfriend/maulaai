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
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];

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

export default router;
