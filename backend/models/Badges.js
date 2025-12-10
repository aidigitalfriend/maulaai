import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// BADGES MODEL
// ============================================
const badgesSchema = new Schema(
  {
    // Badge Identification
    badgeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Badge Information
    badge: {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      tagline: String,
      icon: {
        type: String,
        required: true,
      },
      color: String,
      imageUrl: String,
      animationUrl: String,
    },

    // Badge Classification
    classification: {
      category: {
        type: String,
        enum: [
          'achievement',
          'milestone',
          'social',
          'skill',
          'participation',
          'special',
          'seasonal',
        ],
        required: true,
        index: true,
      },
      subcategory: String,
      rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'],
        default: 'common',
        index: true,
      },
      difficulty: {
        type: String,
        enum: ['trivial', 'easy', 'moderate', 'hard', 'expert', 'legendary'],
        default: 'easy',
      },
    },

    // Badge Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'deprecated', 'seasonal', 'limited'],
      default: 'active',
      required: true,
      index: true,
    },

    // Availability
    availability: {
      isActive: {
        type: Boolean,
        default: true,
      },
      startDate: Date,
      endDate: Date,
      isLimited: {
        type: Boolean,
        default: false,
      },
      maxRecipients: Number,
      currentRecipients: {
        type: Number,
        default: 0,
      },
    },

    // Requirements to Earn Badge
    requirements: {
      type: {
        type: String,
        enum: ['automatic', 'manual', 'nominated', 'purchased', 'event'],
        default: 'automatic',
      },
      conditions: [
        {
          type: {
            type: String,
            enum: [
              'achievement_count',
              'points_earned',
              'conversation_count',
              'streak_days',
              'social_actions',
              'time_spent',
              'level_reached',
              'custom',
            ],
          },
          operator: {
            type: String,
            enum: [
              'equals',
              'greater_than',
              'less_than',
              'between',
              'in_list',
              'custom',
            ],
          },
          value: Schema.Types.Mixed,
          description: String,
        },
      ],
      prerequisites: [String], // Other badge IDs required first
      exclusions: [String], // Badge IDs that prevent earning this one
      timeLimit: {
        enabled: Boolean,
        duration: Number, // in days
        startDate: Date,
        endDate: Date,
      },
    },

    // Rewards and Benefits
    rewards: {
      points: {
        type: Number,
        default: 0,
      },
      experience: {
        type: Number,
        default: 0,
      },
      unlocks: [String], // Features unlocked
      bonuses: [
        {
          type: String,
          value: Number,
          duration: Number, // in days
          description: String,
        },
      ],
      title: String, // Special title unlocked
      profileEffects: [
        {
          type: String,
          value: String,
          duration: Number,
        },
      ],
    },

    // Statistics
    statistics: {
      totalAwarded: {
        type: Number,
        default: 0,
        index: true,
      },
      awardedToday: {
        type: Number,
        default: 0,
      },
      awardedThisWeek: {
        type: Number,
        default: 0,
      },
      awardedThisMonth: {
        type: Number,
        default: 0,
      },
      firstAwardedDate: Date,
      lastAwardedDate: Date,
      averageTimeToEarn: Number, // in days
      completionRate: Number, // percentage of users who earn this badge
    },

    // Design and Display
    design: {
      shape: {
        type: String,
        enum: [
          'circle',
          'square',
          'shield',
          'star',
          'hexagon',
          'diamond',
          'custom',
        ],
        default: 'circle',
      },
      theme: String,
      backgroundColor: String,
      borderColor: String,
      textColor: String,
      gradient: {
        enabled: Boolean,
        colors: [String],
        direction: String,
      },
      effects: {
        glow: Boolean,
        sparkle: Boolean,
        animation: String,
      },
    },

    // Social Features
    social: {
      isShareable: {
        type: Boolean,
        default: true,
      },
      shareMessage: String,
      socialProof: {
        showCount: Boolean,
        showRecentRecipients: Boolean,
        enableComments: Boolean,
        enableLikes: Boolean,
      },
      leaderboard: {
        enabled: Boolean,
        type: String,
      },
    },

    // Event and Seasonal Information
    event: {
      isEvent: {
        type: Boolean,
        default: false,
      },
      eventName: String,
      eventType: {
        type: String,
        enum: [
          'seasonal',
          'holiday',
          'anniversary',
          'community',
          'milestone',
          'promotional',
        ],
      },
      eventStartDate: Date,
      eventEndDate: Date,
      eventMultiplier: Number,
      commemorates: String,
    },

    // Progression and Series
    progression: {
      isProgressive: {
        type: Boolean,
        default: false,
      },
      seriesName: String,
      seriesPosition: Number, // 1st, 2nd, 3rd in series
      totalInSeries: Number,
      nextBadgeId: String,
      previousBadgeId: String,
      progressionType: {
        type: String,
        enum: ['linear', 'branching', 'tiered'],
      },
    },

    // Creator and Management
    creation: {
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      creationType: {
        type: String,
        enum: ['system', 'admin', 'community', 'auto_generated'],
        default: 'system',
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      approvedAt: Date,
      version: {
        type: String,
        default: '1.0',
      },
    },

    // Metadata
    metadata: {
      tags: [String],
      keywords: [String],
      displayOrder: Number,
      featured: {
        type: Boolean,
        default: false,
      },
      hidden: {
        type: Boolean,
        default: false,
      },
      deprecated: {
        type: Boolean,
        default: false,
      },
      notes: String,
      changeLog: [String],
    },

    // Localization
    localization: {
      supportedLanguages: [String],
      translations: [
        {
          language: String,
          name: String,
          description: String,
          tagline: String,
        },
      ],
    },
  },
  {
    timestamps: true,
    collection: 'badges',
  }
);

// Indexes for performance
badgesSchema.index({ badgeId: 1 });
badgesSchema.index({ status: 1, 'availability.isActive': 1 });
badgesSchema.index({
  'classification.category': 1,
  'classification.rarity': 1,
});
badgesSchema.index({ 'availability.isActive': 1, 'metadata.featured': 1 });
badgesSchema.index({ 'statistics.totalAwarded': -1 });
badgesSchema.index({ 'event.isEvent': 1, 'event.eventEndDate': 1 });

// Compound indexes for common queries
badgesSchema.index({
  'classification.category': 1,
  status: 1,
  'availability.isActive': 1,
});
badgesSchema.index({
  'availability.isActive': 1,
  'classification.rarity': 1,
  'statistics.totalAwarded': 1,
});

// Text search for badge names and descriptions
badgesSchema.index({
  'badge.name': 'text',
  'badge.description': 'text',
  'metadata.tags': 'text',
  'metadata.keywords': 'text',
});

// TTL index for expired event badges
badgesSchema.index(
  { 'availability.endDate': 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: {
      'event.isEvent': true,
      'availability.endDate': { $exists: true },
    },
  }
);

// Static method to find badges by category
badgesSchema.statics.findByCategory = function (
  category,
  includeInactive = false
) {
  const query = { 'classification.category': category };
  if (!includeInactive) {
    query.status = 'active';
    query['availability.isActive'] = true;
  }

  return this.find(query).sort({ 'metadata.displayOrder': 1, 'badge.name': 1 });
};

// Static method to find available badges for earning
badgesSchema.statics.findEarnableBadges = function (userId) {
  const now = new Date();
  return this.find({
    status: 'active',
    'availability.isActive': true,
    $or: [
      { 'availability.startDate': { $exists: false } },
      { 'availability.startDate': { $lte: now } },
    ],
    $or: [
      { 'availability.endDate': { $exists: false } },
      { 'availability.endDate': { $gte: now } },
    ],
    $or: [
      { 'availability.isLimited': false },
      {
        'availability.isLimited': true,
        $expr: {
          $lt: [
            '$availability.currentRecipients',
            '$availability.maxRecipients',
          ],
        },
      },
    ],
  }).sort({ 'classification.difficulty': 1, 'statistics.totalAwarded': -1 });
};

// Static method to award badge to user
badgesSchema.statics.awardBadge = async function (
  badgeId,
  userId,
  context = {}
) {
  const badge = await this.findOne({ badgeId, status: 'active' });
  if (!badge) throw new Error('Badge not found or inactive');

  // Check if user already has this badge (assuming separate UserBadges collection)
  const UserBadges = mongoose.model('UserBadges');
  const existingBadge = await UserBadges.findOne({ userId, badgeId });
  if (existingBadge) throw new Error('User already has this badge');

  // Check availability limits
  if (
    badge.availability.isLimited &&
    badge.availability.currentRecipients >= badge.availability.maxRecipients
  ) {
    throw new Error('Badge award limit reached');
  }

  // Create user badge record
  const userBadge = new UserBadges({
    userId,
    badgeId,
    badge: badge.badge,
    classification: badge.classification,
    rewards: badge.rewards,
    awardedAt: new Date(),
    context: context,
  });

  await userBadge.save();

  // Update badge statistics
  badge.statistics.totalAwarded += 1;
  badge.statistics.lastAwardedDate = new Date();
  if (!badge.statistics.firstAwardedDate) {
    badge.statistics.firstAwardedDate = new Date();
  }
  if (badge.availability.isLimited) {
    badge.availability.currentRecipients += 1;
  }

  await badge.save();

  return userBadge;
};

// Method to check if badge is currently available
badgesSchema.methods.isAvailable = function () {
  const now = new Date();

  if (!this.availability.isActive || this.status !== 'active') {
    return false;
  }

  if (this.availability.startDate && this.availability.startDate > now) {
    return false;
  }

  if (this.availability.endDate && this.availability.endDate < now) {
    return false;
  }

  if (
    this.availability.isLimited &&
    this.availability.currentRecipients >= this.availability.maxRecipients
  ) {
    return false;
  }

  return true;
};

// Virtual for badge rarity score
badgesSchema.virtual('rarityScore').get(function () {
  const rarityScores = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
    mythic: 6,
  };
  return rarityScores[this.classification.rarity] || 1;
});

export default mongoose.model('Badges', badgesSchema);
