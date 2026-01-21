/**
 * Community Group Model
 * Core community organization and group management system
 */

import mongoose from 'mongoose'

const communityGroupSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/,
    index: true
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  
  longDescription: {
    type: String,
    trim: true,
    maxlength: 5000
  },
  
  // Ownership and Management
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  admins: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'moderator'],
      default: 'admin'
    },
    permissions: [String],
    assignedBy: mongoose.Schema.Types.ObjectId,
    assignedAt: { type: Date, default: Date.now }
  }],
  
  // Group Configuration
  type: {
    type: String,
    enum: ['public', 'private', 'secret', 'premium'],
    default: 'public',
    index: true
  },
  
  category: {
    type: String,
    required: true,
    enum: [
      'ai-research', 'machine-learning', 'data-science', 'programming',
      'web-development', 'mobile-development', 'game-development',
      'blockchain', 'cybersecurity', 'cloud-computing', 'devops',
      'startups', 'entrepreneurship', 'business', 'networking',
      'design', 'art', 'music', 'writing', 'photography',
      'education', 'career', 'general', 'other'
    ],
    index: true
  },
  
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
    maxlength: 30
  }],
  
  // Visual Identity
  avatar: {
    url: String,
    filename: String,
    mimeType: String,
    size: Number, // bytes
    uploadedAt: Date
  },
  
  banner: {
    url: String,
    filename: String,
    mimeType: String,
    size: Number, // bytes
    uploadedAt: Date
  },
  
  theme: {
    primaryColor: { type: String, default: '#3B82F6' },
    secondaryColor: { type: String, default: '#10B981' },
    accentColor: { type: String, default: '#F59E0B' },
    darkMode: { type: Boolean, default: false }
  },
  
  // Membership Management
  membership: {
    // Current statistics
    totalMembers: { type: Number, default: 0, index: true },
    activeMembers: { type: Number, default: 0 }, // Active in last 30 days
    
    // Membership rules
    maxMembers: { type: Number, default: 10000 },
    autoApprove: { type: Boolean, default: true },
    requireApplication: { type: Boolean, default: false },
    
    // Application requirements
    applicationQuestions: [{
      question: { type: String, required: true },
      required: { type: Boolean, default: true },
      type: { type: String, enum: ['text', 'textarea', 'select', 'multiselect'], default: 'text' },
      options: [String] // For select/multiselect types
    }],
    
    // Invitation system
    inviteOnly: { type: Boolean, default: false },
    memberCanInvite: { type: Boolean, default: true },
    maxInvitesPerMember: { type: Number, default: 5 },
    
    // Premium features
    isPremium: { type: Boolean, default: false },
    subscriptionRequired: { type: Boolean, default: false },
    monthlyFee: Number, // USD cents
    
    // Verification
    verified: { type: Boolean, default: false },
    verifiedAt: Date,
    verificationBadge: String
  },
  
  // Content and Activity Rules
  rules: {
    // Posting permissions
    whoCanPost: {
      type: String,
      enum: ['anyone', 'members', 'moderators', 'admins'],
      default: 'members'
    },
    
    whoCanComment: {
      type: String,
      enum: ['anyone', 'members', 'moderators', 'admins'],
      default: 'members'
    },
    
    // Content guidelines
    contentRules: [{
      title: String,
      description: String,
      severity: { type: String, enum: ['info', 'warning', 'strict'], default: 'info' }
    }],
    
    // Moderation settings
    moderation: {
      autoModeration: { type: Boolean, default: true },
      requireApproval: { type: Boolean, default: false },
      spamFilter: { type: Boolean, default: true },
      profanityFilter: { type: Boolean, default: true },
      
      // Content filters
      blockedWords: [String],
      allowedDomains: [String],
      maxLinksPerPost: { type: Number, default: 3 }
    },
    
    // Rate limiting
    rateLimits: {
      postsPerHour: { type: Number, default: 10 },
      commentsPerHour: { type: Number, default: 50 },
      reactionsPerHour: { type: Number, default: 100 }
    }
  },
  
  // Features and Capabilities
  features: {
    // Core features
    discussions: { type: Boolean, default: true },
    events: { type: Boolean, default: true },
    fileSharing: { type: Boolean, default: true },
    polls: { type: Boolean, default: true },
    
    // Advanced features
    livestreams: { type: Boolean, default: false },
    videoConferencing: { type: Boolean, default: false },
    collaborativeTools: { type: Boolean, default: false },
    projectManagement: { type: Boolean, default: false },
    
    // AI features
    aiAssistant: { type: Boolean, default: false },
    smartRecommendations: { type: Boolean, default: false },
    contentAnalysis: { type: Boolean, default: false },
    
    // Gamification
    badges: { type: Boolean, default: true },
    leaderboards: { type: Boolean, default: true },
    achievements: { type: Boolean, default: true },
    points: { type: Boolean, default: true }
  },
  
  // Activity Tracking
  activity: {
    // Recent activity counters
    postsToday: { type: Number, default: 0 },
    postsThisWeek: { type: Number, default: 0 },
    postsThisMonth: { type: Number, default: 0 },
    
    commentsToday: { type: Number, default: 0 },
    commentsThisWeek: { type: Number, default: 0 },
    commentsThisMonth: { type: Number, default: 0 },
    
    // Growth metrics
    newMembersToday: { type: Number, default: 0 },
    newMembersThisWeek: { type: Number, default: 0 },
    newMembersThisMonth: { type: Number, default: 0 },
    
    // Engagement metrics
    totalPosts: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalReactions: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    
    // Quality metrics
    averageRating: { type: Number, default: 0 },
    satisfactionScore: { type: Number, default: 0 },
    
    // Last activity tracking
    lastPostAt: Date,
    lastCommentAt: Date,
    lastActivityAt: { type: Date, default: Date.now }
  },
  
  // Discovery and Visibility
  visibility: {
    searchable: { type: Boolean, default: true },
    showInDirectory: { type: Boolean, default: true },
    allowDiscovery: { type: Boolean, default: true },
    
    // SEO optimization
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],
    
    // Social sharing
    socialPreview: {
      title: String,
      description: String,
      image: String
    }
  },
  
  // Integration and Automation
  integrations: {
    // External platforms
    discord: {
      enabled: { type: Boolean, default: false },
      serverId: String,
      channelId: String,
      webhookUrl: String
    },
    
    slack: {
      enabled: { type: Boolean, default: false },
      workspaceId: String,
      channelId: String,
      webhookUrl: String
    },
    
    github: {
      enabled: { type: Boolean, default: false },
      organization: String,
      repository: String,
      accessToken: String
    },
    
    // Webhooks
    webhooks: [{
      url: String,
      events: [String], // member_joined, post_created, etc.
      secret: String,
      active: { type: Boolean, default: true }
    }],
    
    // API access
    apiAccess: {
      enabled: { type: Boolean, default: false },
      apiKey: String,
      rateLimit: { type: Number, default: 1000 }, // requests per hour
      allowedOrigins: [String]
    }
  },
  
  // Analytics and Insights
  analytics: {
    // Traffic analytics
    dailyViews: [{ date: String, views: Number }],
    weeklyViews: [{ week: String, views: Number }],
    monthlyViews: [{ month: String, views: Number }],
    
    // Member analytics
    memberGrowth: [{ date: String, total: Number, new: Number, churned: Number }],
    memberActivity: [{ date: String, active: Number, engaged: Number }],
    
    // Content analytics
    contentMetrics: [{
      date: String,
      posts: Number,
      comments: Number,
      reactions: Number,
      shares: Number
    }],
    
    // Engagement analytics
    engagementRate: { type: Number, default: 0 },
    retentionRate: { type: Number, default: 0 },
    churnRate: { type: Number, default: 0 },
    
    // Popular content
    topPosts: [{ postId: mongoose.Schema.Types.ObjectId, score: Number }],
    topContributors: [{ userId: mongoose.Schema.Types.ObjectId, score: Number }],
    trendingTopics: [{ topic: String, mentions: Number, growth: Number }]
  },
  
  // Monetization
  monetization: {
    // Revenue streams
    subscriptionRevenue: { type: Number, default: 0 },
    sponsorshipRevenue: { type: Number, default: 0 },
    merchandiseRevenue: { type: Number, default: 0 },
    
    // Subscription tiers
    subscriptionTiers: [{
      name: String,
      price: Number, // USD cents per month
      features: [String],
      maxMembers: Number,
      priority: Number
    }],
    
    // Sponsorship
    sponsors: [{
      name: String,
      logo: String,
      url: String,
      tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'] },
      amount: Number,
      startDate: Date,
      endDate: Date,
      active: { type: Boolean, default: true }
    }],
    
    // Merchandise
    merchandise: [{
      name: String,
      description: String,
      price: Number,
      image: String,
      available: { type: Boolean, default: true },
      sales: { type: Number, default: 0 }
    }]
  },
  
  // Status and Lifecycle
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'archived', 'deleted'],
    default: 'active',
    index: true
  },
  
  // Suspension/Moderation
  moderation: {
    suspended: { type: Boolean, default: false },
    suspendedAt: Date,
    suspendedBy: mongoose.Schema.Types.ObjectId,
    suspensionReason: String,
    suspensionExpires: Date,
    
    // Warnings and strikes
    warnings: [{
      reason: String,
      issuedBy: mongoose.Schema.Types.ObjectId,
      issuedAt: { type: Date, default: Date.now },
      severity: { type: String, enum: ['low', 'medium', 'high'] }
    }],
    
    strikes: { type: Number, default: 0 },
    maxStrikes: { type: Number, default: 3 }
  },
  
  // Metadata
  metadata: {
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    recommended: { type: Boolean, default: false },
    
    // Quality scores
    qualityScore: { type: Number, default: 50, min: 0, max: 100 },
    engagementScore: { type: Number, default: 50, min: 0, max: 100 },
    growthScore: { type: Number, default: 50, min: 0, max: 100 },
    
    // Custom fields
    customFields: [{
      key: String,
      value: mongoose.Schema.Types.Mixed,
      type: { type: String, enum: ['string', 'number', 'boolean', 'date', 'array'] }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound indexes for performance
communityGroupSchema.index({ category: 1, status: 1 })
communityGroupSchema.index({ type: 1, 'membership.totalMembers': -1 })
communityGroupSchema.index({ 'activity.lastActivityAt': -1, status: 1 })
communityGroupSchema.index({ 'metadata.featured': 1, 'activity.totalPosts': -1 })
communityGroupSchema.index({ 'visibility.searchable': 1, 'membership.totalMembers': -1 })

// Text search index
communityGroupSchema.index({ 
  name: 'text', 
  description: 'text', 
  longDescription: 'text',
  tags: 'text'
})

// Virtual for engagement rate calculation
communityGroupSchema.virtual('engagementRate').get(function() {
  if (this.membership.totalMembers === 0) return 0
  const totalEngagement = this.activity.totalPosts + this.activity.totalComments + this.activity.totalReactions
  return Math.round((totalEngagement / this.membership.totalMembers) * 100) / 100
})

// Virtual for growth rate (last 30 days)
communityGroupSchema.virtual('growthRate').get(function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentGrowth = this.analytics.memberGrowth.filter(g => new Date(g.date) >= thirtyDaysAgo)
  
  if (recentGrowth.length === 0) return 0
  
  const totalNew = recentGrowth.reduce((sum, g) => sum + g.new, 0)
  const totalChurned = recentGrowth.reduce((sum, g) => sum + g.churned, 0)
  
  return ((totalNew - totalChurned) / this.membership.totalMembers) * 100
})

// Virtual for activity level
communityGroupSchema.virtual('activityLevel').get(function() {
  const now = new Date()
  const daysSinceLastActivity = this.activity.lastActivityAt ? 
    Math.floor((now - this.activity.lastActivityAt) / (1000 * 60 * 60 * 24)) : 999
  
  if (daysSinceLastActivity <= 1) return 'very_active'
  if (daysSinceLastActivity <= 7) return 'active'
  if (daysSinceLastActivity <= 30) return 'moderate'
  if (daysSinceLastActivity <= 90) return 'low'
  return 'inactive'
})

// Static methods
communityGroupSchema.statics.findPublic = function() {
  return this.find({ type: 'public', status: 'active' })
    .populate('creator', 'name email avatar')
    .sort({ 'membership.totalMembers': -1 })
}

communityGroupSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'active', type: { $in: ['public', 'private'] } })
    .sort({ 'activity.lastActivityAt': -1 })
}

communityGroupSchema.statics.findTrending = function() {
  return this.find({ 'metadata.trending': true, status: 'active' })
    .sort({ 'activity.postsThisWeek': -1, 'membership.totalMembers': -1 })
    .limit(10)
}

communityGroupSchema.statics.findFeatured = function() {
  return this.find({ 'metadata.featured': true, status: 'active' })
    .populate('creator', 'name avatar')
    .sort({ 'metadata.qualityScore': -1 })
}

communityGroupSchema.statics.searchGroups = function(query, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'active',
    'visibility.searchable': true,
    ...filters
  }
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, 'membership.totalMembers': -1 })
}

communityGroupSchema.statics.getGroupStats = function() {
  return this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalMembers: { $sum: '$membership.totalMembers' },
        avgMembers: { $avg: '$membership.totalMembers' },
        avgEngagement: { $avg: '$metadata.engagementScore' }
      }
    },
    { $sort: { count: -1 } }
  ])
}

// Instance methods
communityGroupSchema.methods.addMember = function(userId, role = 'member') {
  this.membership.totalMembers += 1
  this.activity.newMembersToday += 1
  this.activity.newMembersThisWeek += 1
  this.activity.newMembersThisMonth += 1
  
  // Update analytics
  const today = new Date().toISOString().split('T')[0]
  let todayGrowth = this.analytics.memberGrowth.find(g => g.date === today)
  
  if (!todayGrowth) {
    todayGrowth = { date: today, total: this.membership.totalMembers, new: 1, churned: 0 }
    this.analytics.memberGrowth.push(todayGrowth)
  } else {
    todayGrowth.new += 1
    todayGrowth.total = this.membership.totalMembers
  }
  
  return this.save()
}

communityGroupSchema.methods.removeMember = function(userId) {
  this.membership.totalMembers = Math.max(0, this.membership.totalMembers - 1)
  
  // Update analytics
  const today = new Date().toISOString().split('T')[0]
  let todayGrowth = this.analytics.memberGrowth.find(g => g.date === today)
  
  if (!todayGrowth) {
    todayGrowth = { date: today, total: this.membership.totalMembers, new: 0, churned: 1 }
    this.analytics.memberGrowth.push(todayGrowth)
  } else {
    todayGrowth.churned += 1
    todayGrowth.total = this.membership.totalMembers
  }
  
  return this.save()
}

communityGroupSchema.methods.recordActivity = function(type, count = 1) {
  const activityMap = {
    'post': ['postsToday', 'postsThisWeek', 'postsThisMonth', 'totalPosts'],
    'comment': ['commentsToday', 'commentsThisWeek', 'commentsThisMonth', 'totalComments'],
    'reaction': ['totalReactions'],
    'view': ['totalViews']
  }
  
  const fields = activityMap[type] || []
  
  fields.forEach(field => {
    this.activity[field] = (this.activity[field] || 0) + count
  })
  
  if (type === 'post') {
    this.activity.lastPostAt = new Date()
  } else if (type === 'comment') {
    this.activity.lastCommentAt = new Date()
  }
  
  this.activity.lastActivityAt = new Date()
  
  return this.save()
}

communityGroupSchema.methods.updateQualityScore = function() {
  let score = 50 // Base score
  
  // Factor in member engagement
  const engagementRate = this.engagementRate || 0
  score += Math.min(25, engagementRate * 5)
  
  // Factor in activity level
  const daysSinceActivity = this.activity.lastActivityAt ? 
    Math.floor((new Date() - this.activity.lastActivityAt) / (1000 * 60 * 60 * 24)) : 999
  
  if (daysSinceActivity <= 1) score += 15
  else if (daysSinceActivity <= 7) score += 10
  else if (daysSinceActivity <= 30) score += 5
  else if (daysSinceActivity > 90) score -= 20
  
  // Factor in member count
  if (this.membership.totalMembers > 1000) score += 10
  else if (this.membership.totalMembers > 100) score += 5
  else if (this.membership.totalMembers < 10) score -= 10
  
  // Factor in content quality (posts vs spam ratio)
  const contentRatio = this.activity.totalComments > 0 ? 
    this.activity.totalPosts / this.activity.totalComments : 0
  
  if (contentRatio > 0.1 && contentRatio < 1) score += 10
  
  this.metadata.qualityScore = Math.max(0, Math.min(100, score))
  return this.save()
}

communityGroupSchema.methods.calculateTrendingScore = function() {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  // Recent activity weight
  let score = 0
  
  // Posts and comments in last week
  score += this.activity.postsThisWeek * 3
  score += this.activity.commentsThisWeek * 1
  
  // New member growth
  score += this.activity.newMembersThisWeek * 2
  
  // Engagement rate bonus
  score += this.engagementRate * 10
  
  // Size penalty for fairness (smaller groups get boost)
  if (this.membership.totalMembers > 1000) score *= 0.8
  else if (this.membership.totalMembers < 50) score *= 1.2
  
  return score
}

communityGroupSchema.methods.suspend = function(reason, suspendedBy, duration) {
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

communityGroupSchema.methods.addWarning = function(reason, issuedBy, severity = 'medium') {
  this.moderation.warnings.push({
    reason,
    issuedBy,
    severity
  })
  
  if (severity === 'high') {
    this.moderation.strikes += 1
  }
  
  // Auto-suspend if too many strikes
  if (this.moderation.strikes >= this.moderation.maxStrikes) {
    return this.suspend('Too many strikes', issuedBy, 7 * 24 * 60 * 60 * 1000) // 7 days
  }
  
  return this.save()
}

// Pre-save middleware
communityGroupSchema.pre('save', function(next) {
  // Generate slug from name if not provided
  if (this.isNew && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50)
  }
  
  // Update quality score on significant changes
  if (this.isModified('activity') || this.isModified('membership.totalMembers')) {
    this.updateQualityScore()
  }
  
  // Reset daily counters if it's a new day
  const today = new Date().toISOString().split('T')[0]
  if (!this.metadata.lastResetDate || this.metadata.lastResetDate !== today) {
    this.activity.postsToday = 0
    this.activity.commentsToday = 0
    this.activity.newMembersToday = 0
    this.metadata.lastResetDate = today
  }
  
  next()
})

export default mongoose.model('CommunityGroup', communityGroupSchema)