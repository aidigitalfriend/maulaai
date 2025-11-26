import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import UserProfile from '../models/UserProfile.js';
const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/avatars';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let profile = await UserProfile.findOne({ userId });
    
    if (!profile) {
      // Create default profile if none exists
      profile = new UserProfile({
        userId,
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        timezone: 'Pacific Time (PT)',
        profession: 'AI Developer',
        company: 'Tech Innovation Inc.',
        website: 'https://johndoe.dev',
        bio: 'AI enthusiast and developer passionate about creating intelligent solutions.',
        socialLinks: {
          linkedin: 'https://linkedin.com/in/johndoe',
          twitter: 'https://twitter.com/johndoe',
          github: 'https://github.com/johndoe'
        },
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: true,
          productUpdates: true
        }
      });
      await profile.save();
    }

    res.json({
      success: true,
      profile: profile
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

// Update user profile
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      profile: profile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user profile'
    });
  }
});

// Update profile preferences
router.patch('/:userId/preferences', async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferences } = req.body;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: { preferences } },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    res.json({
      success: true,
      preferences: profile.preferences,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
});

// Upload avatar
router.post('/:userId/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Create avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update profile with new avatar
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: { avatar: avatarUrl } },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      avatarUrl: avatarUrl,
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload avatar'
    });
  }
});

export default router;