import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// LEADERBOARDS MODEL
// ============================================
const leaderboardsSchema = new Schema(
  {
    // Leaderboard Identification
    leaderboardId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Leaderboard Details
    leaderboard: {
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['global', 'regional', 'friends', 'group', 'seasonal', 'event'],
        required: true,
        index: true,
      },
      category: {
        type: String,
        enum: [
          'points',
          'conversations',
          'achievements',
          'streak',
          'level',
          'social',
          'custom',
        ],
        required: true,
        index: true,
      },
      subcategory: String,
      period: {
        type: String,
        enum: ['all_time', 'yearly', 'monthly', 'weekly', 'daily'],
        required: true,
        index: true,
      },
    },

    // User Information (cached for performance)
    user: {
      username: String,
      displayName: String,
      avatar: String,
      level: Number,
      title: String,
      isVerified: Boolean,
      membershipTier: String,
    },

    // Ranking Information
    ranking: {
      currentRank: {
        type: Number,
        required: true,
        index: true,
      },
      previousRank: Number,
      bestRank: Number,
      rankChange: {
        type: String,
        enum: ['up', 'down', 'same', 'new'],
        default: 'same',
      },
      rankChangeAmount: Number,
    },

    // Score Information
    score: {
      current: {
        type: Number,
        required: true,
        index: true,
      },
      previous: Number,
      best: Number,
      change: Number,
      changePercentage: Number,
      unit: {
        type: String,
        enum: ['points', 'count', 'hours', 'days', 'percentage'],
        default: 'points',
      },
    },

    // Performance Metrics
    metrics: {
      totalConversations: Number,
      totalAchievements: Number,
      currentStreak: Number,
      longestStreak: Number,
      averageDaily: Number,
      consistency: Number, // 0-100 score
      momentum: {
        type: String,
        enum: ['rising', 'falling', 'stable'],
        default: 'stable',
      },
    },

    // Time Period Information
    period: {
      startDate: {
        type: Date,
        required: true,
        index: true,
      },
      endDate: {
        type: Date,
        required: true,
        index: true,
      },
      isActive: {
        type: Boolean,
        default: true,
        index: true,
      },
      timeRemaining: String, // "2 days left", "Ended", etc.
    },

    // Geographic and Demographic Filters
    filters: {
      country: String,
      region: String,
      ageGroup: String,
      membershipTier: String,
      registrationPeriod: String,
      customFilters: Schema.Types.Mixed,
    },

    // Rewards and Recognition
    rewards: {
      eligible: {
        type: Boolean,
        default: true,
      },
      tier: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
        required: false,
      },
      points: Number,
      badges: [String],
      prizes: [
        {
          name: String,
          value: Number,
          currency: String,
          description: String,
          claimed: Boolean,
          claimedAt: Date,
        },
      ],
    },

    // Social Features
    social: {
      canShare: {
        type: Boolean,
        default: true,
      },
      isPublic: {
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

    // Competition Information
    competition: {
      participants: Number,
      isTopPercentile: Boolean,
      percentile: Number, // 0-100
      distanceFromTop: Number,
      distanceFromNext: Number,
      competitiveness: {
        type: String,
        enum: ['low', 'medium', 'high', 'extreme'],
        default: 'medium',
      },
    },

    // Historical Data
    history: {
      entries: [
        {
          date: Date,
          rank: Number,
          score: Number,
          participants: Number,
        },
      ],
      peakRank: Number,
      peakRankDate: Date,
      peakScore: Number,
      peakScoreDate: Date,
      averageRank: Number,
      averageScore: Number,
    },

    // Activity Tracking
    activity: {
      lastActiveAt: {
        type: Date,
        default: Date.now,
      },
      activeDays: Number,
      totalSessions: Number,
      averageSessionLength: Number, // minutes
      lastScoreUpdate: Date,
      updateFrequency: {
        type: String,
        enum: ['realtime', 'hourly', 'daily', 'weekly'],
        default: 'daily',
      },
    },

    // Event and Seasonal Information
    event: {
      isEvent: {
        type: Boolean,
        default: false,
      },
      eventName: String,
      eventType: String,
      eventMultiplier: Number,
      specialRules: [String],
      eventStartDate: Date,
      eventEndDate: Date,
    },

    // Metadata
    metadata: {
      version: String,
      algorithm: String,
      calculationMethod: String,
      lastCalculated: Date,
      dataSource: [String],
      tags: [String],
      featured: {
        type: Boolean,
        default: false,
      },
      archived: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
    collection: 'leaderboards',
  }
);

// Compound indexes for optimal query performance
leaderboardsSchema.index({
  'leaderboard.type': 1,
  'leaderboard.category': 1,
  'leaderboard.period': 1,
  'ranking.currentRank': 1,
});

leaderboardsSchema.index({
  userId: 1,
  'leaderboard.category': 1,
  'period.isActive': 1,
});

leaderboardsSchema.index({
  'leaderboard.category': 1,
  'period.isActive': 1,
  'score.current': -1,
});

leaderboardsSchema.index({
  'leaderboard.type': 1,
  'period.startDate': 1,
  'period.endDate': 1,
});

// Single field indexes
leaderboardsSchema.index({ leaderboardId: 1 });
leaderboardsSchema.index({ userId: 1, updatedAt: -1 });
leaderboardsSchema.index({ 'ranking.currentRank': 1 });
leaderboardsSchema.index({ 'score.current': -1 });
leaderboardsSchema.index({ 'period.isActive': 1, updatedAt: -1 });

// Geographic and filter indexes
leaderboardsSchema.index({ 'filters.country': 1, 'leaderboard.category': 1 });
leaderboardsSchema.index({
  'filters.membershipTier': 1,
  'leaderboard.category': 1,
});

// TTL index for inactive leaderboards (optional cleanup)
leaderboardsSchema.index(
  { 'period.endDate': 1 },
  {
    expireAfterSeconds: 7776000, // 90 days after end date
    partialFilterExpression: {
      'period.isActive': false,
      'metadata.archived': true,
    },
  }
);

// Static method to get leaderboard rankings
leaderboardsSchema.statics.getLeaderboard = async function (
  category,
  period,
  type = 'global',
  limit = 100,
  filters = {}
) {
  const query = {
    'leaderboard.category': category,
    'leaderboard.period': period,
    'leaderboard.type': type,
    'period.isActive': true,
    ...filters,
  };

  return this.find(query)
    .sort({ 'ranking.currentRank': 1 })
    .limit(limit)
    .populate('userId', 'username displayName avatar level');
};

// Static method to get user's position across all leaderboards
leaderboardsSchema.statics.getUserRankings = async function (
  userId,
  activeOnly = true
) {
  const query = { userId };
  if (activeOnly) query['period.isActive'] = true;

  return this.find(query)
    .sort({ 'ranking.currentRank': 1 })
    .select('leaderboard ranking score period rewards');
};

// Static method to update user's leaderboard position
leaderboardsSchema.statics.updateUserPosition = async function (
  userId,
  category,
  period,
  newScore,
  additionalData = {}
) {
  const leaderboardId = `${category}_${period}_${
    additionalData.type || 'global'
  }`;

  // Find current entry
  let entry = await this.findOne({
    userId,
    leaderboardId,
  });

  if (!entry) {
    // Create new entry
    entry = new this({
      leaderboardId,
      userId,
      leaderboard: {
        name: `${category} - ${period}`,
        type: additionalData.type || 'global',
        category,
        period,
      },
      ranking: { currentRank: 0 },
      score: { current: newScore },
      period: {
        startDate: additionalData.startDate || new Date(),
        endDate:
          additionalData.endDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      ...additionalData,
    });
  } else {
    // Update existing entry
    entry.score.previous = entry.score.current;
    entry.score.current = newScore;
    entry.score.change = newScore - (entry.score.previous || 0);
    entry.activity.lastScoreUpdate = new Date();
  }

  await entry.save();

  // Recalculate rankings for this leaderboard
  await this.recalculateRankings(
    category,
    period,
    additionalData.type || 'global'
  );

  return entry;
};

// Static method to recalculate all rankings
leaderboardsSchema.statics.recalculateRankings = async function (
  category,
  period,
  type = 'global'
) {
  const entries = await this.find({
    'leaderboard.category': category,
    'leaderboard.period': period,
    'leaderboard.type': type,
    'period.isActive': true,
  }).sort({ 'score.current': -1 });

  const updates = entries.map((entry, index) => {
    const newRank = index + 1;
    const rankChange = entry.ranking.currentRank
      ? entry.ranking.currentRank > newRank
        ? 'up'
        : entry.ranking.currentRank < newRank
        ? 'down'
        : 'same'
      : 'new';

    return this.updateOne(
      { _id: entry._id },
      {
        'ranking.previousRank': entry.ranking.currentRank,
        'ranking.currentRank': newRank,
        'ranking.rankChange': rankChange,
        'ranking.rankChangeAmount': entry.ranking.currentRank
          ? Math.abs(entry.ranking.currentRank - newRank)
          : 0,
        'competition.participants': entries.length,
        'competition.percentile': Math.round(
          (1 - (newRank - 1) / entries.length) * 100
        ),
      }
    );
  });

  await Promise.all(updates);
};

// Virtual for rank display
leaderboardsSchema.virtual('rankDisplay').get(function () {
  const rank = this.ranking.currentRank;
  if (rank === 1) return '🥇 1st';
  if (rank === 2) return '🥈 2nd';
  if (rank === 3) return '🥉 3rd';
  return `#${rank}`;
});

export default mongoose.model('Leaderboards', leaderboardsSchema);
