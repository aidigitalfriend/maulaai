import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// REWARD POINTS MODEL
// ============================================
const rewardPointsSchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Transaction Details
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Point Transaction Type
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

    // Points Amount
    points: {
      amount: {
        type: Number,
        required: true,
      },
      previousBalance: {
        type: Number,
        required: true,
      },
      newBalance: {
        type: Number,
        required: true,
      },
    },

    // Source of Points
    source: {
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
      subcategory: String,
      sourceId: String, // ID of the related object (achievement, conversation, etc.)
      description: {
        type: String,
        required: true,
      },
      metadata: Schema.Types.Mixed,
    },

    // Earning Details (for earned points)
    earning: {
      action: {
        type: String,
        enum: [
          'conversation_completed',
          'achievement_unlocked',
          'daily_streak',
          'referral_signup',
          'social_interaction',
          'feature_usage',
        ],
        required: false,
      },
      multiplier: {
        type: Number,
        default: 1,
        min: 0,
      },
      basePoints: Number,
      bonusPoints: Number,
      streakBonus: Number,
      levelBonus: Number,
    },

    // Spending Details (for spent points)
    spending: {
      item: {
        type: String,
        required: false,
      },
      itemId: String,
      itemCategory: {
        type: String,
        enum: ['reward', 'feature', 'customization', 'boost', 'subscription'],
        required: false,
      },
      cost: Number,
      discountApplied: Number,
      finalCost: Number,
    },

    // Expiration Information
    expiration: {
      expiresAt: Date,
      isExpirable: {
        type: Boolean,
        default: true,
      },
      expiryWarningAt: Date,
      gracePeriod: Number, // days
      status: {
        type: String,
        enum: ['active', 'expiring_soon', 'expired', 'permanent'],
        default: 'active',
      },
    },

    // Related Entities
    related: {
      achievementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Achievements',
      },
      conversationId: String,
      sessionId: String,
      referralId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      orderId: String,
      campaignId: String,
    },

    // Multipliers and Bonuses
    bonuses: {
      streakDays: Number,
      levelMultiplier: Number,
      eventMultiplier: Number,
      membershipBonus: Number,
      seasonalBonus: Number,
      totalMultiplier: Number,
    },

    // Status and Validation
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed', 'reversed', 'expired'],
      default: 'confirmed',
      required: true,
      index: true,
    },

    validation: {
      isValid: {
        type: Boolean,
        default: true,
      },
      validatedAt: Date,
      validatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      invalidReason: String,
    },

    // Processing Information
    processing: {
      processedAt: {
        type: Date,
        default: Date.now,
      },
      processedBy: {
        type: String,
        enum: ['system', 'admin', 'api', 'batch'],
        default: 'system',
      },
      batchId: String,
      retryCount: {
        type: Number,
        default: 0,
      },
    },

    // Reversal Information
    reversal: {
      isReversed: {
        type: Boolean,
        default: false,
      },
      reversedAt: Date,
      reversedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reversalReason: {
        type: String,
        enum: ['fraud', 'error', 'refund', 'dispute', 'admin_action'],
      },
      reversalTransactionId: String,
    },

    // Geographic and Device Context
    context: {
      ipAddress: String,
      country: String,
      timezone: String,
      device: {
        type: String,
        enum: ['web', 'mobile', 'tablet', 'api'],
      },
      platform: String,
      userAgent: String,
    },

    // Notifications
    notifications: {
      emailSent: {
        type: Boolean,
        default: false,
      },
      pushSent: {
        type: Boolean,
        default: false,
      },
      inAppShown: {
        type: Boolean,
        default: false,
      },
      notificationsSentAt: Date,
    },

    // Audit Trail
    audit: {
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      notes: String,
      tags: [String],
      internalReference: String,
    },

    // Event Information
    event: {
      isEventPoints: {
        type: Boolean,
        default: false,
      },
      eventName: String,
      eventType: String,
      eventMultiplier: Number,
      eventStartDate: Date,
      eventEndDate: Date,
    },
  },
  {
    timestamps: true,
    collection: 'rewardpoints',
  }
);

// Indexes for performance and queries
rewardPointsSchema.index({ userId: 1, createdAt: -1 });
rewardPointsSchema.index({ userId: 1, type: 1, createdAt: -1 });
rewardPointsSchema.index({ transactionId: 1 });
rewardPointsSchema.index({ 'source.category': 1, createdAt: -1 });
rewardPointsSchema.index({ status: 1, createdAt: -1 });
rewardPointsSchema.index({ 'expiration.expiresAt': 1, 'expiration.status': 1 });

// Compound indexes for common queries
rewardPointsSchema.index({ userId: 1, status: 1, type: 1, createdAt: -1 });
rewardPointsSchema.index({ userId: 1, 'source.category': 1, createdAt: -1 });
rewardPointsSchema.index({
  userId: 1,
  'expiration.status': 1,
  'expiration.expiresAt': 1,
});

// TTL index for expired points cleanup (if needed)
rewardPointsSchema.index(
  { 'expiration.expiresAt': 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: {
      'expiration.status': 'expired',
      'expiration.isExpirable': true,
    },
  }
);

// Static method to get user balance
rewardPointsSchema.statics.getUserBalance = async function (userId) {
  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: 'confirmed',
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$points.amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const earned = result.find((r) => r._id === 'earned')?.total || 0;
  const spent = result.find((r) => r._id === 'spent')?.total || 0;
  const bonus = result.find((r) => r._id === 'bonus')?.total || 0;
  const penalty = result.find((r) => r._id === 'penalty')?.total || 0;
  const adjustment = result.find((r) => r._id === 'adjustment')?.total || 0;

  return {
    currentBalance: earned + bonus + adjustment - spent - penalty,
    totalEarned: earned,
    totalSpent: spent,
    totalBonus: bonus,
    totalPenalty: penalty,
    totalAdjustment: adjustment,
  };
};

// Static method to award points
rewardPointsSchema.statics.awardPoints = async function (
  userId,
  amount,
  source,
  options = {}
) {
  const User = mongoose.model('User');
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Calculate current balance
  const balance = await this.getUserBalance(userId);

  // Create transaction
  const transaction = new this({
    userId,
    transactionId:
      options.transactionId ||
      `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'earned',
    points: {
      amount,
      previousBalance: balance.currentBalance,
      newBalance: balance.currentBalance + amount,
    },
    source,
    earning: options.earning,
    expiration: options.expiration,
    related: options.related,
    bonuses: options.bonuses,
    context: options.context,
    audit: options.audit,
  });

  return await transaction.save();
};

// Static method to spend points
rewardPointsSchema.statics.spendPoints = async function (
  userId,
  amount,
  spending,
  options = {}
) {
  const balance = await this.getUserBalance(userId);

  if (balance.currentBalance < amount) {
    throw new Error('Insufficient points balance');
  }

  const transaction = new this({
    userId,
    transactionId:
      options.transactionId ||
      `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'spent',
    points: {
      amount: -amount,
      previousBalance: balance.currentBalance,
      newBalance: balance.currentBalance - amount,
    },
    source: {
      category: 'purchase',
      description: `Spent on ${spending.item}`,
      ...options.source,
    },
    spending,
    context: options.context,
    audit: options.audit,
  });

  return await transaction.save();
};

// Method to reverse transaction
rewardPointsSchema.methods.reverse = function (reversalReason, reversedBy) {
  this.reversal.isReversed = true;
  this.reversal.reversedAt = new Date();
  this.reversal.reversedBy = reversedBy;
  this.reversal.reversalReason = reversalReason;
  this.status = 'reversed';

  return this.save();
};

export default mongoose.model('RewardPoints', rewardPointsSchema);
