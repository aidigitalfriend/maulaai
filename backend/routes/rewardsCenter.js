import express from 'express';
import RewardsCenter from '../models/RewardsCenter.js';
const router = express.Router();

// Get user rewards data
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let rewards = await RewardsCenter.findOne({ userId });
    
    if (!rewards) {
      // Create default rewards data if none exist
      rewards = new RewardsCenter({
        userId,
        currentLevel: 1,
        totalPoints: 100,
        pointsThisLevel: 100,
        pointsToNextLevel: 900,
        badges: [
          {
            name: 'Welcome',
            description: 'Joined the platform',
            rarity: 'common',
            earned: true,
            earnedDate: new Date()
          }
        ],
        achievements: [
          {
            category: 'Getting Started',
            title: 'First Steps',
            description: 'Complete your profile setup',
            points: 100,
            completed: true,
            completedDate: new Date()
          }
        ],
        rewardHistory: [
          {
            type: 'achievement',
            item: 'Welcome Achievement',
            points: 100,
            date: new Date()
          }
        ]
      });
      await rewards.save();
    }

    // Calculate leaderboard position (mock data for now)
    const leaderboard = [
      { rank: 1, name: 'Sarah Chen', points: 24850, avatar: '👩‍💻' },
      { rank: 2, name: 'Mike Johnson', points: 22100, avatar: '👨‍🎨' },
      { rank: 3, name: 'Alex Rivera', points: 18900, avatar: '🧑‍🔬' },
      { rank: 4, name: 'You', points: rewards.totalPoints, avatar: '🤖', isCurrentUser: true },
      { rank: 5, name: 'Emma Davis', points: 11200, avatar: '👩‍🚀' }
    ];

    res.json({
      success: true,
      rewards: {
        ...rewards.toObject(),
        leaderboard
      }
    });
  } catch (error) {
    console.error('Rewards fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rewards data'
    });
  }
});

// Add points to user
router.post('/:userId/points', async (req, res) => {
  try {
    const { userId } = req.params;
    const { points, reason, type = 'manual' } = req.body;

    const rewards = await RewardsCenter.findOne({ userId });
    if (!rewards) {
      return res.status(404).json({
        success: false,
        error: 'Rewards data not found'
      });
    }

    // Add points
    rewards.totalPoints += points;
    rewards.pointsThisLevel += points;

    // Check for level up
    const pointsPerLevel = 1000;
    while (rewards.pointsThisLevel >= pointsPerLevel) {
      rewards.currentLevel += 1;
      rewards.pointsThisLevel -= pointsPerLevel;
    }
    rewards.pointsToNextLevel = pointsPerLevel - rewards.pointsThisLevel;

    // Add to reward history
    rewards.rewardHistory.unshift({
      type,
      item: reason || 'Points awarded',
      points,
      date: new Date()
    });

    // Keep only last 50 entries
    if (rewards.rewardHistory.length > 50) {
      rewards.rewardHistory = rewards.rewardHistory.slice(0, 50);
    }

    await rewards.save();

    res.json({
      success: true,
      message: `${points} points added successfully`,
      rewards: rewards
    });
  } catch (error) {
    console.error('Points add error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add points'
    });
  }
});

// Award badge to user
router.post('/:userId/badges', async (req, res) => {
  try {
    const { userId } = req.params;
    const badgeData = {
      ...req.body,
      earned: true,
      earnedDate: new Date()
    };

    const rewards = await RewardsCenter.findOneAndUpdate(
      { userId },
      { $push: { badges: badgeData } },
      { new: true }
    );

    if (!rewards) {
      return res.status(404).json({
        success: false,
        error: 'Rewards data not found'
      });
    }

    // Add to reward history
    rewards.rewardHistory.unshift({
      type: 'badge',
      item: `${badgeData.name} Badge`,
      points: badgeData.points || 0,
      date: new Date()
    });

    await rewards.save();

    res.json({
      success: true,
      message: 'Badge awarded successfully',
      badge: badgeData,
      badges: rewards.badges
    });
  } catch (error) {
    console.error('Badge award error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to award badge'
    });
  }
});

// Complete achievement
router.post('/:userId/achievements/:achievementId/complete', async (req, res) => {
  try {
    const { userId, achievementId } = req.params;

    const rewards = await RewardsCenter.findOne({ userId });
    if (!rewards) {
      return res.status(404).json({
        success: false,
        error: 'Rewards data not found'
      });
    }

    const achievement = rewards.achievements.id(achievementId);
    if (!achievement) {
      return res.status(404).json({
        success: false,
        error: 'Achievement not found'
      });
    }

    if (achievement.completed) {
      return res.status(400).json({
        success: false,
        error: 'Achievement already completed'
      });
    }

    // Mark as completed
    achievement.completed = true;
    achievement.completedDate = new Date();

    // Add points
    rewards.totalPoints += achievement.points;
    rewards.pointsThisLevel += achievement.points;

    // Check for level up
    const pointsPerLevel = 1000;
    while (rewards.pointsThisLevel >= pointsPerLevel) {
      rewards.currentLevel += 1;
      rewards.pointsThisLevel -= pointsPerLevel;
    }
    rewards.pointsToNextLevel = pointsPerLevel - rewards.pointsThisLevel;

    // Add to reward history
    rewards.rewardHistory.unshift({
      type: 'achievement',
      item: achievement.title,
      points: achievement.points,
      date: new Date()
    });

    await rewards.save();

    res.json({
      success: true,
      message: 'Achievement completed successfully',
      achievement: achievement,
      pointsEarned: achievement.points,
      rewards: rewards
    });
  } catch (error) {
    console.error('Achievement completion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete achievement'
    });
  }
});

// Get leaderboard
// Get leaderboard (default route)
router.get('/leaderboard', async (req, res) => {
  try {
    const category = 'global'
    const limit = parseInt(req.query.limit) || 10

    // For now, return mock leaderboard data
    // In production, this would query the database for top users
    const leaderboard = [
      { rank: 1, name: 'Sarah Chen', points: 24850, avatar: '👩‍💻' },
      { rank: 2, name: 'Mike Johnson', points: 22100, avatar: '👨‍🎨' },
      { rank: 3, name: 'Alex Rivera', points: 18900, avatar: '🧑‍🔬' },
      { rank: 4, name: 'Jessica Wu', points: 17600, avatar: '👩‍🎓' },
      { rank: 5, name: 'David Kim', points: 15300, avatar: '👨‍💼' },
      { rank: 6, name: 'Maria Garcia', points: 14200, avatar: '👩‍🔬' },
      { rank: 7, name: 'James Wilson', points: 13800, avatar: '👨‍🎨' },
      { rank: 8, name: 'Lisa Zhang', points: 12900, avatar: '👩‍💻' },
      { rank: 9, name: 'Robert Taylor', points: 12450, avatar: '👨‍🚀' },
      { rank: 10, name: 'Emma Davis', points: 11200, avatar: '👩‍🚀' }
    ].slice(0, limit);

    res.json({
      success: true,
      leaderboard,
      category
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});

// Get leaderboard by category
router.get('/leaderboard/:category', async (req, res) => {
  try {
    const { category } = req.params
    const limit = parseInt(req.query.limit) || 10

    // For now, return mock leaderboard data
    // In production, this would query the database for top users
    const leaderboard = [
      { rank: 1, name: 'Sarah Chen', points: 24850, avatar: '👩‍💻' },
      { rank: 2, name: 'Mike Johnson', points: 22100, avatar: '👨‍🎨' },
      { rank: 3, name: 'Alex Rivera', points: 18900, avatar: '🧑‍🔬' },
      { rank: 4, name: 'Jessica Wu', points: 17600, avatar: '👩‍🎓' },
      { rank: 5, name: 'David Kim', points: 15300, avatar: '👨‍💼' },
      { rank: 6, name: 'Maria Garcia', points: 14200, avatar: '👩‍🔬' },
      { rank: 7, name: 'James Wilson', points: 13800, avatar: '👨‍🎨' },
      { rank: 8, name: 'Lisa Zhang', points: 12900, avatar: '👩‍💻' },
      { rank: 9, name: 'Robert Taylor', points: 12450, avatar: '👨‍🚀' },
      { rank: 10, name: 'Emma Davis', points: 11200, avatar: '👩‍🚀' }
    ].slice(0, limit);

    res.json({
      success: true,
      leaderboard,
      category
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
});

export default router;