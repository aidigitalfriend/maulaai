import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// LEVEL SYSTEM MODEL
// ============================================
const levelSystemSchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // Current Level Information
    currentLevel: {
      level: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
        index: true,
      },
      name: String,
      title: String,
      icon: String,
      color: String,
      description: String,
    },

    // Experience Points
    experience: {
      current: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },
      total: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },
      requiredForNext: {
        type: Number,
        required: true,
        default: 100,
      },
      progressToNext: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      sinceLastLevel: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // Level Progress
    progress: {
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      milestones: [
        {
          milestone: Number, // 25%, 50%, 75%
          reached: Boolean,
          reachedAt: Date,
          reward: {
            points: Number,
            message: String,
            unlocks: [String],
          },
        },
      ],
      streaks: {
        current: {
          type: Number,
          default: 0,
        },
        longest: {
          type: Number,
          default: 0,
        },
        lastActiveDate: Date,
      },
    },

    // Level History
    history: {
      levels: [
        {
          level: Number,
          reachedAt: Date,
          experienceRequired: Number,
          timeToReach: Number, // days since previous level
          celebrationShown: {
            type: Boolean,
            default: false,
          },
        },
      ],
      levelUps: {
        type: Number,
        default: 0,
      },
      averageTimePerLevel: Number, // days
      fastestLevelUp: Number, // days
      slowestLevelUp: Number, // days
    },

    // Category-Specific Levels
    categories: {
      conversations: {
        level: { type: Number, default: 1 },
        experience: { type: Number, default: 0 },
        specialty: String,
      },
      social: {
        level: { type: Number, default: 1 },
        experience: { type: Number, default: 0 },
        specialty: String,
      },
      achievements: {
        level: { type: Number, default: 1 },
        experience: { type: Number, default: 0 },
        specialty: String,
      },
      learning: {
        level: { type: Number, default: 1 },
        experience: { type: Number, default: 0 },
        specialty: String,
      },
    },

    // Bonuses and Multipliers
    bonuses: {
      experienceMultiplier: {
        type: Number,
        default: 1.0,
        min: 0.1,
        max: 10.0,
      },
      activeBoosts: [
        {
          type: {
            type: String,
            enum: ['experience', 'points', 'conversation', 'social'],
          },
          multiplier: Number,
          duration: Number, // minutes
          startedAt: Date,
          expiresAt: Date,
          source: String,
        },
      ],
      membershipBonus: {
        type: Number,
        default: 1.0,
      },
      streakBonus: {
        type: Number,
        default: 1.0,
      },
    },

    // Unlocks and Rewards
    unlocks: {
      features: [String], // Feature IDs unlocked at this level
      customization: [String], // Customization options
      privileges: [String], // Special privileges
      limits: {
        conversationsPerDay: Number,
        agentsAccess: Number,
        storageLimit: Number,
        apiCallsLimit: Number,
      },
    },

    // Prestige System
    prestige: {
      level: {
        type: Number,
        default: 0,
        min: 0,
      },
      isEligible: {
        type: Boolean,
        default: false,
      },
      hasPrestiged: {
        type: Boolean,
        default: false,
      },
      prestigedAt: [Date], // Array of prestige dates
      rewards: [
        {
          prestigeLevel: Number,
          reward: String,
          claimed: Boolean,
          claimedAt: Date,
        },
      ],
      benefits: {
        experienceRetained: Number, // percentage
        bonusMultiplier: Number,
        exclusiveFeatures: [String],
      },
    },

    // Statistics
    statistics: {
      totalExperienceEarned: {
        type: Number,
        default: 0,
      },
      experienceToday: {
        type: Number,
        default: 0,
      },
      experienceThisWeek: {
        type: Number,
        default: 0,
      },
      experienceThisMonth: {
        type: Number,
        default: 0,
      },
      averageDailyExperience: {
        type: Number,
        default: 0,
      },
      bestDay: {
        date: Date,
        experience: Number,
      },
      longestStreak: {
        days: Number,
        startDate: Date,
        endDate: Date,
      },
    },

    // Activity Tracking
    activity: {
      lastActiveDate: {
        type: Date,
        default: Date.now,
      },
      activeDays: {
        type: Number,
        default: 1,
      },
      inactiveDays: {
        type: Number,
        default: 0,
      },
      lastExperienceGain: Date,
      dailyGoal: {
        target: { type: Number, default: 100 },
        current: { type: Number, default: 0 },
        achieved: { type: Boolean, default: false },
      },
      weeklyGoal: {
        target: { type: Number, default: 700 },
        current: { type: Number, default: 0 },
        achieved: { type: Boolean, default: false },
      },
    },

    // Social Comparison
    social: {
      ranking: {
        global: Number,
        friends: Number,
        local: Number,
      },
      isPublic: {
        type: Boolean,
        default: true,
      },
      showProgress: {
        type: Boolean,
        default: true,
      },
      allowComparison: {
        type: Boolean,
        default: true,
      },
    },

    // Notifications and Celebrations
    notifications: {
      levelUpNotification: {
        type: Boolean,
        default: true,
      },
      milestoneNotification: {
        type: Boolean,
        default: true,
      },
      goalAchievedNotification: {
        type: Boolean,
        default: true,
      },
      celebrationAnimation: {
        type: Boolean,
        default: true,
      },
    },

    // Metadata
    metadata: {
      calculationVersion: {
        type: String,
        default: '1.0',
      },
      lastCalculated: Date,
      algorithm: String,
      customRules: Schema.Types.Mixed,
      tags: [String],
    },
  },
  {
    timestamps: true,
    collection: 'levelsystem',
  }
);

// Indexes for performance
levelSystemSchema.index({ userId: 1 });
levelSystemSchema.index({ 'currentLevel.level': -1 });
levelSystemSchema.index({ 'experience.total': -1 });
levelSystemSchema.index({ 'activity.lastActiveDate': -1 });
levelSystemSchema.index({ 'progress.streaks.current': -1 });

// Compound indexes
levelSystemSchema.index({ 'currentLevel.level': -1, 'experience.total': -1 });
levelSystemSchema.index({ 'social.isPublic': 1, 'currentLevel.level': -1 });
levelSystemSchema.index({ userId: 1, 'activity.lastActiveDate': -1 });

// Static method to calculate level from experience
levelSystemSchema.statics.calculateLevel = function (totalExperience) {
  // Formula: level = floor(sqrt(totalExperience / 100))
  // Each level requires exponentially more XP
  const baseExp = 100;
  const level = Math.floor(Math.sqrt(totalExperience / baseExp)) + 1;
  const currentLevelExp = Math.pow(level - 1, 2) * baseExp;
  const nextLevelExp = Math.pow(level, 2) * baseExp;
  const experienceForNext = nextLevelExp - totalExperience;
  const progressToNext =
    ((totalExperience - currentLevelExp) / (nextLevelExp - currentLevelExp)) *
    100;

  return {
    level,
    currentLevelExp,
    nextLevelExp,
    experienceForNext,
    progressToNext: Math.round(progressToNext * 100) / 100,
  };
};

// Static method to add experience
levelSystemSchema.statics.addExperience = async function (
  userId,
  experienceAmount,
  source = 'manual'
) {
  let userLevel = await this.findOne({ userId });

  if (!userLevel) {
    // Create new level record
    userLevel = new this({
      userId,
      experience: { current: 0, total: 0, requiredForNext: 100 },
      currentLevel: { level: 1 },
    });
  }

  const oldLevel = userLevel.currentLevel.level;
  const oldTotalExp = userLevel.experience.total;

  // Add experience
  userLevel.experience.total += experienceAmount;
  userLevel.statistics.totalExperienceEarned += experienceAmount;
  userLevel.statistics.experienceToday += experienceAmount;
  userLevel.activity.lastExperienceGain = new Date();
  userLevel.activity.lastActiveDate = new Date();

  // Calculate new level
  const levelInfo = this.calculateLevel(userLevel.experience.total);
  userLevel.currentLevel.level = levelInfo.level;
  userLevel.experience.requiredForNext = levelInfo.experienceForNext;
  userLevel.experience.progressToNext = levelInfo.progressToNext;
  userLevel.progress.percentage = levelInfo.progressToNext;

  // Check for level up
  if (levelInfo.level > oldLevel) {
    // Level up!
    userLevel.history.levelUps += 1;
    userLevel.history.levels.push({
      level: levelInfo.level,
      reachedAt: new Date(),
      experienceRequired: levelInfo.currentLevelExp,
      timeToReach:
        userLevel.history.levels.length > 0
          ? Math.floor(
              (Date.now() -
                userLevel.history.levels[userLevel.history.levels.length - 1]
                  .reachedAt) /
                (1000 * 60 * 60 * 24)
            )
          : 0,
    });

    // Award level up rewards (if any)
    const RewardPoints = mongoose.model('RewardPoints');
    await RewardPoints.awardPoints(userId, levelInfo.level * 100, {
      category: 'achievement',
      description: `Level ${levelInfo.level} reached!`,
      sourceId: 'level_up',
    });
  }

  await userLevel.save();

  return {
    leveledUp: levelInfo.level > oldLevel,
    oldLevel,
    newLevel: levelInfo.level,
    experienceGained: experienceAmount,
    totalExperience: userLevel.experience.total,
    progressToNext: levelInfo.progressToNext,
  };
};

// Method to check daily goal progress
levelSystemSchema.methods.updateDailyProgress = function () {
  const today = new Date().toDateString();
  const lastActive = this.activity.lastActiveDate
    ? this.activity.lastActiveDate.toDateString()
    : null;

  // Reset daily counters if new day
  if (today !== lastActive) {
    this.statistics.experienceToday = 0;
    this.activity.dailyGoal.current = 0;
    this.activity.dailyGoal.achieved = false;
  }

  // Check if daily goal achieved
  if (this.statistics.experienceToday >= this.activity.dailyGoal.target) {
    this.activity.dailyGoal.achieved = true;
  }

  return this.save();
};

// Method to calculate prestige eligibility
levelSystemSchema.methods.checkPrestigeEligibility = function () {
  const maxLevel = 100; // Define max level before prestige
  const minAchievements = 50; // Minimum achievements required

  this.prestige.isEligible =
    this.currentLevel.level >= maxLevel &&
    this.statistics.totalExperienceEarned >= 1000000; // 1M experience

  return this.prestige.isEligible;
};

// Virtual for level display name
levelSystemSchema.virtual('levelDisplayName').get(function () {
  const level = this.currentLevel.level;
  if (level >= 100) return 'Legendary';
  if (level >= 80) return 'Master';
  if (level >= 60) return 'Expert';
  if (level >= 40) return 'Advanced';
  if (level >= 20) return 'Intermediate';
  if (level >= 10) return 'Apprentice';
  return 'Novice';
});

export default mongoose.model('LevelSystem', levelSystemSchema);
