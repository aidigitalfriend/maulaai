import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import { cache, cacheKeys, queryCache } from '../lib/cache.js';

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

// User model imported at top of file

// GET /api/user/profile - Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];

    if (!userId && !userEmail) {
      return res
        .status(401)
        .json({ success: false, error: 'Authentication required' });
    }

    // Generate cache key
    const cacheKey = userId ? cacheKeys.user(`${userId}:profile`) : `user:email:${userEmail}:profile`;

    // Try to get from cache first
    const cachedProfile = await cache.get(cacheKey);
    if (cachedProfile) {
      return res.json({
        success: true,
        profile: cachedProfile,
        cached: true
      });
    }

    // Find user by ID or email
    let user;
    if (userId) {
      user = await User.findById(userId).select('-password -__v');
    } else {
      user = await User.findOne({ email: userEmail }).select('-password -__v');
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Build complete profile data with defaults
    const profile = {
      name: user.name || 'User',
      email: user.email,
      avatar: user.avatar || '',
      bio:
        user.bio ||
        'AI enthusiast and developer passionate about creating intelligent solutions that bridge the gap between human creativity and machine efficiency.',
      phoneNumber: user.phoneNumber || '',
      location: user.location || '',
      timezone: user.timezone || 'Pacific Time (PT)',
      profession: user.profession || 'AI Developer',
      company: user.company || 'Tech Innovation Inc.',
      website: user.website || '',
      socialLinks: {
        linkedin: user.socialLinks?.linkedin || '',
        twitter: user.socialLinks?.twitter || '',
        github: user.socialLinks?.github || '',
      },
      preferences: {
        emailNotifications: user.preferences?.emailNotifications ?? true,
        smsNotifications: user.preferences?.smsNotifications ?? false,
        marketingEmails: user.preferences?.marketingEmails ?? true,
        productUpdates: user.preferences?.productUpdates ?? true,
      },
    };

    // Cache the profile for 10 minutes
    await cache.set(cacheKey, profile, 600);

    res.json({
      success: true,
      profile: profile,
      cached: false
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
      return res
        .status(401)
        .json({ success: false, error: 'Authentication required' });
    }

    // Find and update user
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ email: userEmail });
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Update all profile fields
    if (name !== undefined) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (location !== undefined) user.location = location;
    if (timezone !== undefined) user.timezone = timezone;
    if (profession !== undefined) user.profession = profession;
    if (company !== undefined) user.company = company;
    if (website !== undefined) user.website = website;
    if (socialLinks !== undefined) {
      user.socialLinks = { ...(user.socialLinks || {}), ...socialLinks };
    }
    if (preferences !== undefined) {
      user.preferences = { ...(user.preferences || {}), ...preferences };
    }

    user.updatedAt = new Date();
    await user.save();

    // Invalidate cache for this user
    const cacheKey = userId ? cacheKeys.user(`${userId}:profile`) : `user:email:${userEmail}:profile`;
    await cache.del(cacheKey);

    // Return complete profile data
    const profile = {
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
      bio: user.bio || '',
      phoneNumber: user.phoneNumber || '',
      location: user.location || '',
      timezone: user.timezone || '',
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
        marketingEmails: user.preferences?.marketingEmails ?? true,
        productUpdates: user.preferences?.productUpdates ?? true,
      },
    };

    res.json({
      success: true,
      profile: profile,
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// POST /api/user/profile/:userId/avatar - Upload avatar
router.post(
  '/profile/:userId/avatar',
  upload.single('avatar'),
  async (req, res) => {
    try {
      const { userId } = req.params;

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: 'No file uploaded' });
      }

      // Find user and update avatar
      const user = await User.findById(userId);
      if (!user) {
        // Clean up uploaded file if user not found
        if (req.file && req.file.path) {
          fs.unlink(req.file.path, () => {});
        }
        return res
          .status(404)
          .json({ success: false, error: 'User not found' });
      }

      // Remove old avatar if it exists
      if (user.avatar && user.avatar.startsWith('/uploads/')) {
        const oldAvatarPath = path.join(process.cwd(), 'public', user.avatar);
        fs.unlink(oldAvatarPath, () => {}); // Ignore errors
      }

      // Update user with new avatar URL
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      user.avatar = avatarUrl;
      user.updatedAt = new Date();
      await user.save();

      // Invalidate cache for this user
      const cacheKey = cacheKeys.user(`${userId}:profile`);
      await cache.del(cacheKey);

      res.json({
        success: true,
        avatarUrl: avatarUrl,
        message: 'Avatar uploaded successfully',
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, () => {});
      }
      console.error('Upload avatar error:', error);
      res
        .status(500)
        .json({ success: false, error: 'Failed to upload avatar' });
    }
  }
);

// PATCH /api/user/profile/:userId/preferences - Update preferences only
router.patch('/profile/:userId/preferences', async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferences } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.preferences = { ...(user.preferences || {}), ...preferences };
    user.updatedAt = new Date();
    await user.save();

    // Invalidate cache for this user
    const cacheKey = cacheKeys.user(`${userId}:profile`);
    await cache.del(cacheKey);

    res.json({
      success: true,
      preferences: user.preferences,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res
      .status(500)
      .json({ success: false, error: 'Failed to update preferences' });
  }
});

// GET /api/user/profile/:userId - Get specific user profile by ID
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: 'User ID is required' });
    }

    // Generate cache key
    const cacheKey = cacheKeys.user(`${userId}:profile`);

    // Try to get from cache first
    const cachedProfile = await cache.get(cacheKey);
    if (cachedProfile) {
      return res.json({
        success: true,
        profile: cachedProfile,
        cached: true
      });
    }

    const user = await User.findById(userId).select('-password -__v');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Build complete profile data with defaults
    const profile = {
      name: user.name || 'User',
      email: user.email,
      avatar: user.avatar || '',
      bio:
        user.bio ||
        'AI enthusiast and developer passionate about creating intelligent solutions.',
      phoneNumber: user.phoneNumber || '',
      location: user.location || '',
      timezone: user.timezone || 'Pacific Time (PT)',
      profession: user.profession || 'AI Developer',
      company: user.company || 'Tech Innovation Inc.',
      website: user.website || '',
      socialLinks: {
        linkedin: user.socialLinks?.linkedin || '',
        twitter: user.socialLinks?.twitter || '',
        github: user.socialLinks?.github || '',
      },
      preferences: {
        emailNotifications: user.preferences?.emailNotifications ?? true,
        smsNotifications: user.preferences?.smsNotifications ?? false,
        marketingEmails: user.preferences?.marketingEmails ?? true,
        productUpdates: user.preferences?.productUpdates ?? true,
      },
    };

    // Cache the profile for 10 minutes
    await cache.set(cacheKey, profile, 600);

    res.json({
      success: true,
      profile: profile,
      cached: false
    });
  } catch (error) {
    console.error('Get user profile by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

export default router;
