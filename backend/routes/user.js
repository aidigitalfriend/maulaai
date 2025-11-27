import express from 'express';
const router = express.Router();
import User from '../models/User.ts';

// GET /api/user/profile - Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];

    if (!userId && !userEmail) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
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

    // Get user's community activity stats
    const { default: CommunityPost } = await import('../models/CommunityPost.ts');
    const { default: CommunityLike } = await import('../models/CommunityLike.ts');
    
    const [postsCount, likesGiven, likesReceived] = await Promise.all([
      CommunityPost.countDocuments({ 
        $or: [
          { authorId: user._id },
          { authorEmail: user.email }
        ]
      }),
      CommunityLike.countDocuments({ userId: user._id.toString() }),
      CommunityPost.aggregate([
        { $match: { 
          $or: [
            { authorId: user._id },
            { authorEmail: user.email }
          ]
        }},
        { $group: { _id: null, totalLikes: { $sum: { $ifNull: ['$likesCount', 0] } } } }
      ]).then(result => result[0]?.totalLikes || 0)
    ]);

    const profileData = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || '👤',
      joinedAt: user.createdAt,
      stats: {
        postsCount,
        likesGiven,
        likesReceived
      },
      preferences: user.preferences || {}
    };

    res.json({
      success: true,
      data: profileData
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
    const { name, avatar, preferences } = req.body;

    if (!userId && !userEmail) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
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

    // Update fields
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

export default router;