import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// POINTS HISTORY MODEL
// ============================================
const pointsHistorySchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Transaction Details (Reference to RewardPoints)
    transactionId: {
      type: String,
      required: true,
      index: true,
    },

    rewardPointId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RewardPoints',
      required: true,
      index: true,
    },

    // Summary Information (Cached for performance)
    summary: {
      type: {
        type: String,
        enum: [
          'earned',
          'spent',
          'bonus',
          'penalty',
          'transfer',
          'refund',
          'adjustment',
          'expired',
        ],
        required: true,
        index: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        enum: [
          'conversation',
          'achievement',
          'daily_login',
          'referral',
          'social',
          'purchase',
          'bonus',
          'admin',
          'migration',
        ],
        required: true,
        index: true,
      },
    },

    // Balance Information (Snapshot)
    balance: {
      before: {
        type: Number,
        required: true,
      },
      after: {
        type: Number,
        required: true,
      },
      change: {
        type: Number,
        required: true,
      },
    },

    // Date and Time Tracking
    timing: {
      occurredAt: {
        type: Date,
        required: true,
        index: true,
      },
      period: {
        year: { type: Number, index: true },
        month: { type: Number, index: true },
        week: { type: Number, index: true },
        day: { type: Number, index: true },
        hour: { type: Number },
        dayOfWeek: { type: Number },
        dayOfYear: { type: Number },
      },
      timezone: String,
    },

    // Related Information
    related: {
      sourceType: {
        type: String,
        enum: [
          'achievement',
          'conversation',
          'referral',
          'purchase',
          'social',
          'system',
          'manual',
        ],
        required: true,
      },
      sourceId: String,
      sourceName: String,
      sessionId: String,
      batchId: String, // For batch operations
      campaignId: String, // For promotional campaigns
    },

    // Context Information
    context: {
      device: {
        type: String,
        enum: ['web', 'mobile', 'tablet', 'api', 'system'],
        default: 'web',
      },
      platform: String,
      location: {
        country: String,
        region: String,
        city: String,
      },
      ipAddress: String,
      userAgent: String,
    },

    // Multipliers and Modifiers
    modifiers: {
      baseAmount: Number,
      multiplier: {
        type: Number,
        default: 1.0,
      },
      bonuses: [
        {
          type: String,
          amount: Number,
          reason: String,
        },
      ],
      streakBonus: Number,
      levelBonus: Number,
      membershipBonus: Number,
      eventBonus: Number,
    },

    // Tags and Classification
    tags: {
      primary: [String], // Main categories
      secondary: [String], // Sub-categories
      custom: [String], // User or admin defined tags
      system: [String], // System generated tags
    },

    // Streak Information
    streak: {
      isStreakActivity: {
        type: Boolean,
        default: false,
      },
      streakDay: Number,
      streakType: String,
      streakBonus: Number,
    },

    // Achievement Information
    achievement: {
      isAchievementReward: {
        type: Boolean,
        default: false,
      },
      achievementId: String,
      achievementName: String,
      achievementRarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      },
      milestoneReached: String,
    },

    // Social Activity
    social: {
      isSocialActivity: {
        type: Boolean,
        default: false,
      },
      activityType: {
        type: String,
        enum: ['share', 'like', 'comment', 'invite', 'referral', 'community'],
      },
      targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      contentId: String,
      engagementScore: Number,
    },

    // Spending Information
    spending: {
      isSpending: {
        type: Boolean,
        default: false,
      },
      itemId: String,
      itemName: String,
      itemCategory: String,
      originalCost: Number,
      discountApplied: Number,
      finalCost: Number,
      vendorId: String,
    },

    // Status and Validation
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed', 'reversed', 'expired'],
      default: 'confirmed',
      required: true,
      index: true,
    },

    // Aggregation Helpers (for performance)
    aggregation: {
      isPositive: {
        type: Boolean,
        required: true,
      },
      isNegative: {
        type: Boolean,
        required: true,
      },
      absoluteAmount: {
        type: Number,
        required: true,
      },
      impactScore: Number, // How significant this transaction is
      frequency: String, // 'rare', 'uncommon', 'common', 'frequent'
    },

    // Metadata
    metadata: {
      version: {
        type: String,
        default: '1.0',
      },
      flags: [String],
      notes: String,
      internalReference: String,
      apiVersion: String,
      clientVersion: String,
    },
  },
  {
    timestamps: true,
    collection: 'pointshistory',
  }
);

// Pre-save middleware to calculate aggregation fields
pointsHistorySchema.pre('save', function (next) {
  // Calculate period information
  const date = this.timing.occurredAt || new Date();
  this.timing.period = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    week: Math.ceil(date.getDate() / 7),
    day: date.getDate(),
    hour: date.getHours(),
    dayOfWeek: date.getDay(),
    dayOfYear: Math.floor(
      (date - new Date(date.getFullYear(), 0, 0)) / 86400000
    ),
  };

  // Calculate aggregation helpers
  this.aggregation.isPositive = this.summary.amount > 0;
  this.aggregation.isNegative = this.summary.amount < 0;
  this.aggregation.absoluteAmount = Math.abs(this.summary.amount);

  // Set spending flag
  this.spending.isSpending = this.summary.type === 'spent';

  next();
});

// Indexes for performance and analytics
pointsHistorySchema.index({ userId: 1, 'timing.occurredAt': -1 });
pointsHistorySchema.index({
  userId: 1,
  'summary.type': 1,
  'timing.occurredAt': -1,
});
pointsHistorySchema.index({
  userId: 1,
  'summary.category': 1,
  'timing.occurredAt': -1,
});
pointsHistorySchema.index({ transactionId: 1 });
pointsHistorySchema.index({ rewardPointId: 1 });

// Time-based indexes for analytics
pointsHistorySchema.index({
  'timing.period.year': 1,
  'timing.period.month': 1,
});
pointsHistorySchema.index({ 'timing.period.year': 1, 'timing.period.week': 1 });
pointsHistorySchema.index({ 'timing.occurredAt': -1 });

// Category and type indexes
pointsHistorySchema.index({ 'summary.category': 1, 'timing.occurredAt': -1 });
pointsHistorySchema.index({ 'summary.type': 1, 'timing.occurredAt': -1 });
pointsHistorySchema.index({ status: 1, 'timing.occurredAt': -1 });

// Compound indexes for complex queries
pointsHistorySchema.index({
  userId: 1,
  'summary.type': 1,
  'timing.period.year': 1,
  'timing.period.month': 1,
});

pointsHistorySchema.index({
  userId: 1,
  'aggregation.isPositive': 1,
  'timing.occurredAt': -1,
});

// Text search for descriptions and notes
pointsHistorySchema.index({
  'summary.description': 'text',
  'related.sourceName': 'text',
  'metadata.notes': 'text',
});

// Static method to get user's points history summary
pointsHistorySchema.statics.getUserSummary = async function (
  userId,
  period = 'all'
) {
  let dateFilter = {};

  const now = new Date();
  switch (period) {
    case 'today':
      dateFilter = {
        'timing.period.year': now.getFullYear(),
        'timing.period.month': now.getMonth() + 1,
        'timing.period.day': now.getDate(),
      };
      break;
    case 'week':
      const startOfWeek = new Date(now - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { 'timing.occurredAt': { $gte: startOfWeek } };
      break;
    case 'month':
      dateFilter = {
        'timing.period.year': now.getFullYear(),
        'timing.period.month': now.getMonth() + 1,
      };
      break;
    case 'year':
      dateFilter = {
        'timing.period.year': now.getFullYear(),
      };
      break;
  }

  const pipeline = [
    { $match: { userId: new mongoose.Types.ObjectId(userId), ...dateFilter } },
    {
      $group: {
        _id: '$summary.type',
        total: { $sum: '$summary.amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$summary.amount' },
      },
    },
  ];

  const results = await this.aggregate(pipeline);

  const summary = {
    totalEarned: 0,
    totalSpent: 0,
    totalBonus: 0,
    netGain: 0,
    transactionCount: 0,
    categories: {},
  };

  results.forEach((result) => {
    switch (result._id) {
      case 'earned':
        summary.totalEarned = result.total;
        break;
      case 'spent':
        summary.totalSpent = Math.abs(result.total);
        break;
      case 'bonus':
        summary.totalBonus = result.total;
        break;
    }
    summary.transactionCount += result.count;
  });

  summary.netGain =
    summary.totalEarned + summary.totalBonus - summary.totalSpent;

  return summary;
};

// Static method to get spending patterns
pointsHistorySchema.statics.getSpendingPatterns = async function (
  userId,
  limit = 10
) {
  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        'summary.type': 'spent',
        status: 'confirmed',
      },
    },
    {
      $group: {
        _id: '$spending.itemCategory',
        totalSpent: { $sum: { $abs: '$summary.amount' } },
        count: { $sum: 1 },
        avgSpent: { $avg: { $abs: '$summary.amount' } },
        lastPurchase: { $max: '$timing.occurredAt' },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: limit },
  ];

  return this.aggregate(pipeline);
};

// Static method to get earning trends
pointsHistorySchema.statics.getEarningTrends = async function (
  userId,
  days = 30
) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        'timing.occurredAt': { $gte: startDate },
        'aggregation.isPositive': true,
        status: 'confirmed',
      },
    },
    {
      $group: {
        _id: {
          year: '$timing.period.year',
          month: '$timing.period.month',
          day: '$timing.period.day',
        },
        dailyEarnings: { $sum: '$summary.amount' },
        transactionCount: { $sum: 1 },
        categories: { $push: '$summary.category' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ];

  return this.aggregate(pipeline);
};

export default mongoose.model('PointsHistory', pointsHistorySchema);
