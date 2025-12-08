/**
 * Community Membership Model
 * User membership and role management in community groups
 */

import mongoose from 'mongoose'

const communityMembershipSchema = new mongoose.Schema({
  // Core Relationship
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  communityGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityGroup',
    required: true,
    index: true
  },
  
  // Membership Status
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'suspended', 'banned', 'left'],
    default: 'pending',
    index: true
  },
  
  // Role and Permissions
  role: {
    type: String,
    enum: ['member', 'contributor', 'moderator', 'admin', 'owner'],
    default: 'member',
    index: true
  },
  
  customRole: {
    name: String,
    permissions: [String],
    color: String, // Hex color for role display
    priority: { type: Number, default: 0 }, // Higher numbers = higher priority
    badge: String // URL to role badge image
  },
  
  permissions: [{
    permission: {
      type: String,
      enum: [
        // Basic permissions
        'read_posts', 'create_posts', 'edit_own_posts', 'delete_own_posts',
        'comment', 'react', 'share',
        
        // Moderation permissions
        'moderate_posts', 'moderate_comments', 'ban_members', 'manage_events',
        'manage_roles', 'manage_settings',
        
        // Admin permissions
        'manage_group', 'manage_members', 'view_analytics', 'manage_integrations',
        'financial_access', 'delete_group'
      ]
    },
    granted: { type: Boolean, default: true },
    grantedBy: mongoose.Schema.Types.ObjectId,
    grantedAt: { type: Date, default: Date.now },
    expiresAt: Date
  }],
  
  // Membership Timeline
  joinedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  invitedAt: Date,
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  approvedAt: Date,
  
  leftAt: Date,
  
  // Application Details (for groups requiring approval)
  application: {
    submitted: { type: Boolean, default: false },
    submittedAt: Date,
    
    // Application responses
    responses: [{
      question: String,
      answer: String
    }],
    
    // Review process
    reviewed: { type: Boolean, default: false },
    reviewedBy: mongoose.Schema.Types.ObjectId,
    reviewedAt: Date,
    reviewNotes: String,
    
    // Decision
    decision: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    decisionReason: String
  },
  
  // Member Profile in Group
  profile: {
    // Display preferences
    displayName: String,
    bio: String,
    
    // Contact preferences
    showEmail: { type: Boolean, default: false },
    allowDirectMessages: { type: Boolean, default: true },
    
    // Notification preferences
    notifications: {
      newPosts: { type: Boolean, default: true },
      newComments: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
      events: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
      
      // Delivery method
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    
    // Member interests and skills
    interests: [String],
    skills: [{
      name: String,
      level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
      verified: { type: Boolean, default: false }
    }],
    
    // Social links specific to this community
    socialLinks: {
      github: String,
      linkedin: String,
      twitter: String,
      website: String,
      portfolio: String
    }
  },
  
  // Activity and Engagement
  activity: {
    // Content creation
    totalPosts: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalReactions: { type: Number, default: 0 },
    
    // Recent activity
    postsThisWeek: { type: Number, default: 0 },
    postsThisMonth: { type: Number, default: 0 },
    commentsThisWeek: { type: Number, default: 0 },
    commentsThisMonth: { type: Number, default: 0 },
    
    // Engagement metrics
    postViews: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    
    // Quality metrics
    helpfulVotes: { type: Number, default: 0 },
    bestAnswers: { type: Number, default: 0 },
    
    // Time-based activity
    lastActiveAt: { type: Date, default: Date.now },
    lastPostAt: Date,
    lastCommentAt: Date,
    
    // Login streak
    loginStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    
    // Participation in events
    eventsAttended: { type: Number, default: 0 },
    eventsOrganized: { type: Number, default: 0 }
  },
  
  // Reputation and Recognition
  reputation: {
    // Point system
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    
    // Reputation breakdown
    pointsFromPosts: { type: Number, default: 0 },
    pointsFromComments: { type: Number, default: 0 },
    pointsFromHelpful: { type: Number, default: 0 },
    pointsFromEvents: { type: Number, default: 0 },
    
    // Achievements and badges
    badges: [{
      badgeId: String,
      name: String,
      description: String,
      icon: String,
      rarity: { type: String, enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'] },
      earnedAt: { type: Date, default: Date.now }
    }],
    
    // Recognition from peers
    endorsements: [{
      fromUser: mongoose.Schema.Types.ObjectId,
      skill: String,
      message: String,
      createdAt: { type: Date, default: Date.now }
    }],
    
    // Community rankings
    weeklyRank: Number,
    monthlyRank: Number,
    allTimeRank: Number
  },
  
  // Subscription and Payment
  subscription: {
    // Tier information
    tier: {
      type: String,
      enum: ['free', 'basic', 'premium', 'vip'],
      default: 'free'
    },
    
    // Payment details
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    autoRenew: { type: Boolean, default: true },
    
    // Billing
    monthlyFee: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    paymentMethod: mongoose.Schema.Types.ObjectId, // Reference to PaymentMethod
    
    // Payment history
    lastPayment: Date,
    nextPayment: Date,
    failedPayments: { type: Number, default: 0 },
    
    // Subscription benefits
    benefits: [String],
    
    // Trial information
    isTrialActive: { type: Boolean, default: false },
    trialStartDate: Date,
    trialEndDate: Date
  },
  
  // Moderation and Compliance
  moderation: {
    // Warnings and strikes
    warnings: [{
      reason: String,
      description: String,
      issuedBy: mongoose.Schema.Types.ObjectId,
      issuedAt: { type: Date, default: Date.now },
      severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
      acknowledged: { type: Boolean, default: false }
    }],
    
    strikes: { type: Number, default: 0 },
    lastStrikeAt: Date,
    
    // Suspension details
    suspended: { type: Boolean, default: false },
    suspendedAt: Date,
    suspendedBy: mongoose.Schema.Types.ObjectId,
    suspensionReason: String,
    suspensionExpires: Date,
    
    // Ban details
    banned: { type: Boolean, default: false },
    bannedAt: Date,
    bannedBy: mongoose.Schema.Types.ObjectId,
    banReason: String,
    banExpires: Date, // Permanent if null
    
    // Appeal process
    appeal: {
      submitted: { type: Boolean, default: false },
      submittedAt: Date,
      reason: String,
      reviewed: { type: Boolean, default: false },
      reviewedBy: mongoose.Schema.Types.ObjectId,
      reviewedAt: Date,
      decision: { type: String, enum: ['pending', 'approved', 'rejected'] },
      decisionReason: String
    }
  },
  
  // Privacy and Security
  privacy: {
    // Profile visibility
    profileVisibility: {
      type: String,
      enum: ['public', 'members_only', 'private'],
      default: 'members_only'
    },
    
    // Activity visibility
    showActivity: { type: Boolean, default: true },
    showBadges: { type: Boolean, default: true },
    showRankings: { type: Boolean, default: true },
    
    // Contact permissions
    allowMemberContact: { type: Boolean, default: true },
    allowModeratorContact: { type: Boolean, default: true },
    
    // Data sharing
    shareAnalytics: { type: Boolean, default: false },
    shareWithSponsors: { type: Boolean, default: false }
  },
  
  // Integration and Connections
  connections: {
    // External account connections
    github: {
      connected: { type: Boolean, default: false },
      username: String,
      connectedAt: Date
    },
    
    discord: {
      connected: { type: Boolean, default: false },
      userId: String,
      username: String,
      connectedAt: Date
    },
    
    slack: {
      connected: { type: Boolean, default: false },
      userId: String,
      username: String,
      connectedAt: Date
    },
    
    // Two-factor authentication for sensitive operations
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorMethod: { type: String, enum: ['sms', 'email', 'app'] }
  },
  
  // Analytics and Insights
  analytics: {
    // Engagement analytics
    dailyActivity: [{
      date: String, // YYYY-MM-DD
      posts: Number,
      comments: Number,
      reactions: Number,
      timeSpent: Number // minutes
    }],
    
    // Performance metrics
    averageEngagement: Number,
    influenceScore: Number, // Based on how others respond to content
    helpfulnessRatio: Number, // Helpful votes / total content
    
    // Growth metrics
    followerGrowth: [{ date: String, count: Number }],
    reputationGrowth: [{ date: String, points: Number }],
    
    // Behavioral patterns
    mostActiveHours: [Number], // Hours of day (0-23)
    mostActiveDays: [Number], // Days of week (0-6)
    preferredTopics: [String],
    
    // Interaction patterns
    collaborators: [{ userId: mongoose.Schema.Types.ObjectId, interactions: Number }],
    mentees: [mongoose.Schema.Types.ObjectId],
    mentors: [mongoose.Schema.Types.ObjectId]
  },
  
  // Metadata and Custom Fields
  metadata: {
    // Source tracking
    joinSource: {
      type: String,
      enum: ['direct', 'invitation', 'discovery', 'event', 'social', 'search'],
      default: 'direct'
    },
    
    // Referral tracking
    referralCode: String,
    referredBy: mongoose.Schema.Types.ObjectId,
    referralsCount: { type: Number, default: 0 },
    
    // Custom fields for group-specific data
    customFields: [{
      key: String,
      value: mongoose.Schema.Types.Mixed,
      type: { type: String, enum: ['string', 'number', 'boolean', 'date', 'array'] },
      visible: { type: Boolean, default: true }
    }],
    
    // Tags assigned by moderators
    tags: [String],
    
    // Notes for moderators
    moderatorNotes: [{
      note: String,
      addedBy: mongoose.Schema.Types.ObjectId,
      addedAt: { type: Date, default: Date.now },
      private: { type: Boolean, default: true }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound indexes for performance
communityMembershipSchema.index({ communityGroup: 1, status: 1 })
communityMembershipSchema.index({ user: 1, status: 1 })
communityMembershipSchema.index({ communityGroup: 1, role: 1 })
communityMembershipSchema.index({ communityGroup: 1, 'activity.lastActiveAt': -1 })
communityMembershipSchema.index({ communityGroup: 1, 'reputation.points': -1 })
communityMembershipSchema.index({ 'application.decision': 1, 'application.submittedAt': 1 })

// Unique constraint to prevent duplicate memberships
communityMembershipSchema.index({ user: 1, communityGroup: 1 }, { unique: true })

// Virtual for member level based on points
communityMembershipSchema.virtual('memberLevel').get(function() {
  const points = this.reputation.points
  
  if (points >= 10000) return 'Expert'
  if (points >= 5000) return 'Advanced'
  if (points >= 1000) return 'Intermediate'
  if (points >= 100) return 'Beginner'
  return 'Newcomer'
})

// Virtual for activity level
communityMembershipSchema.virtual('activityLevel').get(function() {
  const daysSinceActive = Math.floor((new Date() - this.activity.lastActiveAt) / (1000 * 60 * 60 * 24))
  
  if (daysSinceActive <= 1) return 'very_active'
  if (daysSinceActive <= 7) return 'active'
  if (daysSinceActive <= 30) return 'moderate'
  if (daysSinceActive <= 90) return 'low'
  return 'inactive'
})

// Virtual for subscription status
communityMembershipSchema.virtual('subscriptionStatus').get(function() {
  if (!this.subscription.isActive) return 'inactive'
  if (this.subscription.isTrialActive) return 'trial'
  if (this.subscription.endDate && this.subscription.endDate < new Date()) return 'expired'
  return 'active'
})

// Static methods
communityMembershipSchema.statics.findByGroup = function(groupId, options = {}) {
  const query = { communityGroup: groupId, status: 'active' }
  
  if (options.role) query.role = options.role
  if (options.minPoints) query['reputation.points'] = { $gte: options.minPoints }
  
  return this.find(query)
    .populate('user', 'name email avatar')
    .sort(options.sort || { 'reputation.points': -1 })
}

communityMembershipSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId, status: 'active' })
    .populate('communityGroup', 'name slug avatar type')
    .sort({ joinedAt: -1 })
}

communityMembershipSchema.statics.findPendingApplications = function(groupId) {
  return this.find({
    communityGroup: groupId,
    status: 'pending',
    'application.submitted': true,
    'application.decision': 'pending'
  })
  .populate('user', 'name email avatar')
  .sort({ 'application.submittedAt': 1 })
}

communityMembershipSchema.statics.getLeaderboard = function(groupId, timeframe = 'all') {
  const matchStage = { communityGroup: mongoose.Types.ObjectId(groupId), status: 'active' }
  
  let sortField = 'reputation.points'
  if (timeframe === 'week') sortField = 'activity.postsThisWeek'
  else if (timeframe === 'month') sortField = 'activity.postsThisMonth'
  
  return this.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: '$userInfo' },
    { $sort: { [sortField]: -1 } },
    { $limit: 10 },
    {
      $project: {
        user: '$userInfo',
        points: '$reputation.points',
        level: '$reputation.level',
        badges: '$reputation.badges',
        activity: '$activity',
        rank: { $add: [{ $indexOfArray: ['$$ROOT', '$_id'] }, 1] }
      }
    }
  ])
}

communityMembershipSchema.statics.getMemberStats = function(groupId) {
  return this.aggregate([
    { $match: { communityGroup: mongoose.Types.ObjectId(groupId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgPoints: { $avg: '$reputation.points' },
        totalPosts: { $sum: '$activity.totalPosts' },
        totalComments: { $sum: '$activity.totalComments' }
      }
    }
  ])
}

// Instance methods
communityMembershipSchema.methods.approve = function(approvedBy, welcomeMessage) {
  this.status = 'active'
  this.application.decision = 'approved'
  this.application.reviewed = true
  this.application.reviewedBy = approvedBy
  this.application.reviewedAt = new Date()
  this.approvedBy = approvedBy
  this.approvedAt = new Date()
  
  return this.save()
}

communityMembershipSchema.methods.reject = function(rejectedBy, reason) {
  this.status = 'rejected'
  this.application.decision = 'rejected'
  this.application.reviewed = true
  this.application.reviewedBy = rejectedBy
  this.application.reviewedAt = new Date()
  this.application.decisionReason = reason
  
  return this.save()
}

communityMembershipSchema.methods.addPoints = function(points, source = 'general') {
  this.reputation.points += points
  
  // Update source-specific points
  if (source === 'post') this.reputation.pointsFromPosts += points
  else if (source === 'comment') this.reputation.pointsFromComments += points
  else if (source === 'helpful') this.reputation.pointsFromHelpful += points
  else if (source === 'event') this.reputation.pointsFromEvents += points
  
  // Update level based on points
  this.reputation.level = Math.floor(Math.log2(Math.max(1, this.reputation.points / 10))) + 1
  
  return this.save()
}

communityMembershipSchema.methods.awardBadge = function(badge) {
  // Check if badge already exists
  const existingBadge = this.reputation.badges.find(b => b.badgeId === badge.badgeId)
  if (existingBadge) return this
  
  this.reputation.badges.push(badge)
  
  // Award points for badge
  const pointsMap = {
    'common': 10,
    'uncommon': 25,
    'rare': 50,
    'epic': 100,
    'legendary': 250
  }
  
  this.addPoints(pointsMap[badge.rarity] || 10, 'badge')
  
  return this.save()
}

communityMembershipSchema.methods.recordActivity = function(type, count = 1) {
  const now = new Date()
  
  // Update counters based on activity type
  if (type === 'post') {
    this.activity.totalPosts += count
    this.activity.postsThisWeek += count
    this.activity.postsThisMonth += count
    this.activity.lastPostAt = now
  } else if (type === 'comment') {
    this.activity.totalComments += count
    this.activity.commentsThisWeek += count
    this.activity.commentsThisMonth += count
    this.activity.lastCommentAt = now
  } else if (type === 'reaction') {
    this.activity.totalReactions += count
  }
  
  this.activity.lastActiveAt = now
  
  // Update login streak
  const lastActiveDay = new Date(this.activity.lastActiveAt)
  const today = new Date()
  
  lastActiveDay.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  const daysDiff = Math.floor((today - lastActiveDay) / (1000 * 60 * 60 * 24))
  
  if (daysDiff === 1) {
    this.activity.loginStreak += 1
    this.activity.longestStreak = Math.max(this.activity.longestStreak, this.activity.loginStreak)
  } else if (daysDiff > 1) {
    this.activity.loginStreak = 1
  }
  
  return this.save()
}

communityMembershipSchema.methods.updateRole = function(newRole, updatedBy) {
  const oldRole = this.role
  this.role = newRole
  
  // Log role change in metadata
  this.metadata.moderatorNotes.push({
    note: `Role changed from ${oldRole} to ${newRole}`,
    addedBy: updatedBy
  })
  
  return this.save()
}

communityMembershipSchema.methods.addWarning = function(reason, issuedBy, severity = 'medium') {
  this.moderation.warnings.push({
    reason,
    issuedBy,
    severity
  })
  
  if (severity === 'high') {
    this.moderation.strikes += 1
    this.moderation.lastStrikeAt = new Date()
  }
  
  return this.save()
}

communityMembershipSchema.methods.suspend = function(reason, suspendedBy, duration) {
  this.status = 'suspended'
  this.moderation.suspended = true
  this.moderation.suspendedAt = new Date()
  this.moderation.suspendedBy = suspendedBy
  this.moderation.suspensionReason = reason
  
  if (duration) {
    this.moderation.suspensionExpires = new Date(Date.now() + duration)
  }
  
  return this.save()
}

communityMembershipSchema.methods.ban = function(reason, bannedBy, duration) {
  this.status = 'banned'
  this.moderation.banned = true
  this.moderation.bannedAt = new Date()
  this.moderation.bannedBy = bannedBy
  this.moderation.banReason = reason
  
  if (duration) {
    this.moderation.banExpires = new Date(Date.now() + duration)
  }
  
  return this.save()
}

communityMembershipSchema.methods.leave = function() {
  this.status = 'left'
  this.leftAt = new Date()
  
  return this.save()
}

// Pre-save middleware
communityMembershipSchema.pre('save', function(next) {
  // Auto-approve if group doesn't require approval
  if (this.isNew && this.status === 'pending') {
    // This would need to check the group's settings
    // For now, we'll leave it as pending and let the application logic handle it
  }
  
  // Update subscription status
  if (this.subscription.endDate && this.subscription.endDate < new Date()) {
    this.subscription.isActive = false
  }
  
  // Reset weekly/monthly counters if needed
  const now = new Date()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  
  if (!this.metadata.lastWeekReset || this.metadata.lastWeekReset < weekStart) {
    this.activity.postsThisWeek = 0
    this.activity.commentsThisWeek = 0
    this.metadata.lastWeekReset = weekStart
  }
  
  if (!this.metadata.lastMonthReset || this.metadata.lastMonthReset < monthStart) {
    this.activity.postsThisMonth = 0
    this.activity.commentsThisMonth = 0
    this.metadata.lastMonthReset = monthStart
  }
  
  next()
})

export default mongoose.model('CommunityMembership', communityMembershipSchema)