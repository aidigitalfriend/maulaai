import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// ACHIEVEMENTS MODEL
// ============================================
const achievementsSchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Achievement Reference
    achievementId: {
      type: String,
      required: true,
      index: true,
    },

    // Achievement Details
    achievement: {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        enum: [
          'conversations',
          'social',
          'learning',
          'streak',
          'milestones',
          'special',
          'seasonal',
        ],
        required: true,
        index: true,
      },
      subcategory: String,
      icon: String,
      badgeUrl: String,
      color: String,
      rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        default: 'common',
      },
    },

    // Achievement Status
    status: {
      type: String,
      enum: ['locked', 'in_progress', 'unlocked', 'completed'],
      default: 'locked',
      required: true,
      index: true,
    },

    // Progress Tracking
    progress: {
      current: {
        type: Number,
        default: 0,
        required: true,
      },
      target: {
        type: Number,
        required: true,
      },
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      unit: {
        type: String,
        enum: ['count', 'hours', 'days', 'points', 'percentage'],
        default: 'count',
      },
    },

    // Completion Information
    completion: {
      unlockedAt: Date,
      completedAt: Date,
      completionMethod: {
        type: String,
        enum: ['automatic', 'manual_claim', 'admin_awarded'],
        default: 'automatic',
      },
      completionContext: {
        action: String,
        location: String,
        additionalData: Schema.Types.Mixed,
      },
    },

    // Rewards
    rewards: {
      points: {
        type: Number,
        default: 0,
      },
      experience: {
        type: Number,
        default: 0,
      },
      badges: [String],
      unlocks: [String], // Features or content unlocked
      bonuses: [
        {
          type: String,
          value: Number,
          duration: Number, // in days
          description: String,
        },
      ],
    },

    // Requirements
    requirements: {
      level: Number,
      prerequisites: [String], // Other achievement IDs
      timeLimit: {
        enabled: Boolean,
        duration: Number, // in days
        startDate: Date,
        endDate: Date,
      },
      conditions: [
        {
          type: {
            type: String,
            enum: [
              'conversation_count',
              'streak_days',
              'agent_interaction',
              'feature_usage',
              'social_action',
              'time_spent',
            ],
          },
          operator: {
            type: String,
            enum: ['equals', 'greater_than', 'less_than', 'between', 'in_list'],
          },
          value: Schema.Types.Mixed,
          description: String,
        },
      ],
    },

    // Difficulty and Effort
    difficulty: {
      level: {
        type: String,
        enum: ['beginner', 'easy', 'medium', 'hard', 'expert', 'legendary'],
        default: 'easy',
      },
      estimatedTime: String, // "1 day", "1 week", etc.
      effortRequired: {
        type: String,
        enum: ['minimal', 'low', 'moderate', 'high', 'extreme'],
        default: 'low',
      },
    },

    // Tracking Data
    tracking: {
      startedAt: Date,
      lastProgressAt: Date,
      progressHistory: [
        {
          value: Number,
          timestamp: Date,
          trigger: String,
          context: Schema.Types.Mixed,
        },
      ],
      milestones: [
        {
          percentage: Number,
          reachedAt: Date,
          reward: {
            points: Number,
            message: String,
          },
        },
      ],
    },

    // Social Features
    social: {
      isPublic: {
        type: Boolean,
        default: true,
      },
      canShare: {
        type: Boolean,
        default: true,
      },
      shareCount: {
        type: Number,
        default: 0,
      },
      likesReceived: {
        type: Number,
        default: 0,
      },
      commentsReceived: {
        type: Number,
        default: 0,
      },
    },

    // Seasonal/Event Information
    event: {
      isEvent: {
        type: Boolean,
        default: false,
      },
      eventName: String,
      eventType: {
        type: String,
        enum: ['seasonal', 'limited_time', 'community', 'milestone'],
      },
      startDate: Date,
      endDate: Date,
      isExpired: {
        type: Boolean,
        default: false,
      },
    },

    // Metadata
    metadata: {
      version: {
        type: String,
        default: '1.0',
      },
      tags: [String],
      hidden: {
        type: Boolean,
        default: false,
      },
      featured: {
        type: Boolean,
        default: false,
      },
      displayOrder: Number,
      createdBySystem: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    collection: 'achievements',
  }
);

// Indexes for performance
achievementsSchema.index({ userId: 1, status: 1 });
achievementsSchema.index({ userId: 1, 'achievement.category': 1 });
achievementsSchema.index({ achievementId: 1, userId: 1 });
achievementsSchema.index({ status: 1, 'completion.completedAt': -1 });
achievementsSchema.index({
  'achievement.category': 1,
  'achievement.rarity': 1,
});
achievementsSchema.index({ 'event.isEvent': 1, 'event.endDate': 1 });

// Compound indexes
achievementsSchema.index({ userId: 1, status: 1, 'achievement.category': 1 });
achievementsSchema.index({ userId: 1, 'completion.completedAt': -1 });
achievementsSchema.index({ userId: 1, 'metadata.featured': 1, status: 1 });

// Text search for achievement names and descriptions
achievementsSchema.index({
  'achievement.name': 'text',
  'achievement.description': 'text',
  'metadata.tags': 'text',
});

// Method to update progress
achievementsSchema.methods.updateProgress = function (newValue, context = {}) {
  this.progress.current = Math.min(newValue, this.progress.target);
  this.progress.percentage = Math.round(
    (this.progress.current / this.progress.target) * 100
  );
  this.tracking.lastProgressAt = new Date();

  // Add to progress history
  this.tracking.progressHistory.push({
    value: newValue,
    timestamp: new Date(),
    trigger: context.trigger || 'manual',
    context: context,
  });

  // Check if unlocked
  if (this.status === 'locked' && this.progress.current > 0) {
    this.status = 'in_progress';
    this.tracking.startedAt = new Date();
  }

  // Check if completed
  if (
    this.progress.current >= this.progress.target &&
    this.status === 'in_progress'
  ) {
    this.status = 'completed';
    this.completion.completedAt = new Date();
    this.completion.completionMethod = 'automatic';
    this.completion.completionContext = context;
  }

  return this.save();
};

// Static method to find achievements by category
achievementsSchema.statics.findByCategory = function (
  userId,
  category,
  status = null
) {
  const query = { userId, 'achievement.category': category };
  if (status) query.status = status;

  return this.find(query).sort({ 'metadata.displayOrder': 1, createdAt: 1 });
};

// Static method to get user achievement summary
achievementsSchema.statics.getUserSummary = async function (userId) {
  const pipeline = [
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalPoints: { $sum: '$rewards.points' },
        categories: { $addToSet: '$achievement.category' },
      },
    },
  ];

  const results = await this.aggregate(pipeline);

  return {
    total: results.reduce((sum, r) => sum + r.count, 0),
    completed: results.find((r) => r._id === 'completed')?.count || 0,
    inProgress: results.find((r) => r._id === 'in_progress')?.count || 0,
    locked: results.find((r) => r._id === 'locked')?.count || 0,
    totalPoints: results.reduce((sum, r) => sum + (r.totalPoints || 0), 0),
  };
};

export default mongoose.model('Achievements', achievementsSchema);
