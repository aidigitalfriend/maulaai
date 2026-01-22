/**
 * Community Metrics Model
 * Analytics, insights, and performance tracking for community groups
 */

import mongoose from 'mongoose'

const communityMetricsSchema = new mongoose.Schema({
  // Associated Community
  communityGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityGroup',
    required: true,
    index: true
  },
  
  // Time Period
  period: {
    type: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
      index: true
    },
    
    date: {
      type: Date,
      required: true,
      index: true
    },
    
    startDate: Date,
    endDate: Date,
    
    // ISO week number for weekly metrics
    weekNumber: Number,
    
    // Quarter info for quarterly metrics
    quarter: Number,
    year: Number
  },
  
  // Member Metrics
  members: {
    // Growth metrics
    total: { type: Number, default: 0 },
    new: { type: Number, default: 0 },
    churned: { type: Number, default: 0 },
    netGrowth: { type: Number, default: 0 },
    
    // Growth rates
    growthRate: { type: Number, default: 0 }, // Percentage
    churnRate: { type: Number, default: 0 },
    
    // Activity metrics
    active: { type: Number, default: 0 }, // Active in period
    engaged: { type: Number, default: 0 }, // Posted/commented
    lurkers: { type: Number, default: 0 }, // Viewed but no activity
    
    // Activity rates
    activityRate: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    
    // Member segments
    byRole: {
      members: { type: Number, default: 0 },
      moderators: { type: Number, default: 0 },
      admins: { type: Number, default: 0 }
    },
    
    byTenure: {
      new: { type: Number, default: 0 }, // < 30 days
      regular: { type: Number, default: 0 }, // 30-365 days
      veteran: { type: Number, default: 0 } // > 365 days
    },
    
    // Demographics
    demographics: {
      byCountry: Map, // country code -> count
      byTimezone: Map, // timezone -> count
      byAge: Map, // age range -> count
      byGender: Map // gender -> count
    }
  },
  
  // Content Metrics
  content: {
    // Volume metrics
    totalPosts: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalReactions: { type: Number, default: 0 },
    
    // Content breakdown by type
    byType: {
      discussions: { type: Number, default: 0 },
      questions: { type: Number, default: 0 },
      announcements: { type: Number, default: 0 },
      tutorials: { type: Number, default: 0 },
      showcases: { type: Number, default: 0 },
      polls: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    
    // Quality metrics
    averageQualityScore: { type: Number, default: 0 },
    flaggedContent: { type: Number, default: 0 },
    moderatedContent: { type: Number, default: 0 },
    
    // Engagement metrics
    averageViews: { type: Number, default: 0 },
    averageComments: { type: Number, default: 0 },
    averageReactions: { type: Number, default: 0 },
    
    // Top content
    topPosts: [{
      postId: mongoose.Schema.Types.ObjectId,
      title: String,
      views: Number,
      engagement: Number,
      score: Number
    }],
    
    // Content distribution
    contentPerMember: { type: Number, default: 0 },
    commentsPerPost: { type: Number, default: 0 },
    reactionsPerPost: { type: Number, default: 0 }
  },
  
  // Engagement Metrics
  engagement: {
    // Overall engagement
    totalInteractions: { type: Number, default: 0 },
    uniqueContributors: { type: Number, default: 0 },
    
    // Engagement rates
    overallEngagementRate: { type: Number, default: 0 },
    memberEngagementRate: { type: Number, default: 0 },
    
    // Time-based engagement
    peakHours: [Number], // Hours with most activity (0-23)
    peakDays: [Number], // Days with most activity (0-6, Sunday=0)
    
    // Engagement distribution
    engagementDistribution: {
      highlyEngaged: { type: Number, default: 0 }, // Top 10%
      moderatelyEngaged: { type: Number, default: 0 }, // 11-50%
      lightlyEngaged: { type: Number, default: 0 }, // 51-90%
      lurkers: { type: Number, default: 0 } // Bottom 10%
    },
    
    // Social network metrics
    networkMetrics: {
      connections: { type: Number, default: 0 }, // Member-to-member interactions
      avgConnectionsPerMember: { type: Number, default: 0 },
      networkDensity: { type: Number, default: 0 },
      communityCoefficient: { type: Number, default: 0 }
    },
    
    // Content virality
    viralContent: [{
      postId: mongoose.Schema.Types.ObjectId,
      viralityScore: Number,
      shares: Number,
      reach: Number
    }]
  },
  
  // Events Metrics
  events: {
    // Event volume
    totalEvents: { type: Number, default: 0 },
    upcomingEvents: { type: Number, default: 0 },
    completedEvents: { type: Number, default: 0 },
    cancelledEvents: { type: Number, default: 0 },
    
    // Attendance metrics
    totalAttendees: { type: Number, default: 0 },
    averageAttendance: { type: Number, default: 0 },
    attendanceRate: { type: Number, default: 0 },
    
    // Event quality
    averageEventRating: { type: Number, default: 0 },
    eventSatisfactionScore: { type: Number, default: 0 },
    
    // Event types breakdown
    eventTypes: {
      workshops: { type: Number, default: 0 },
      webinars: { type: Number, default: 0 },
      meetups: { type: Number, default: 0 },
      conferences: { type: Number, default: 0 },
      networking: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    
    // Top events
    topEvents: [{
      eventId: mongoose.Schema.Types.ObjectId,
      title: String,
      attendees: Number,
      rating: Number,
      score: Number
    }]
  },
  
  // Moderation Metrics
  moderation: {
    // Report volume
    totalReports: { type: Number, default: 0 },
    resolvedReports: { type: Number, default: 0 },
    pendingReports: { type: Number, default: 0 },
    
    // Report categories
    reportCategories: {
      spam: { type: Number, default: 0 },
      harassment: { type: Number, default: 0 },
      inappropriate: { type: Number, default: 0 },
      copyright: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    
    // Moderation actions
    moderationActions: {
      warnings: { type: Number, default: 0 },
      tempBans: { type: Number, default: 0 },
      permanentBans: { type: Number, default: 0 },
      contentRemoved: { type: Number, default: 0 },
      contentEdited: { type: Number, default: 0 }
    },
    
    // Response times
    averageResponseTime: { type: Number, default: 0 }, // Hours
    averageResolutionTime: { type: Number, default: 0 }, // Hours
    
    // Moderation quality
    moderationAccuracy: { type: Number, default: 0 },
    appealRate: { type: Number, default: 0 },
    appealSuccessRate: { type: Number, default: 0 },
    
    // Community health
    toxicityScore: { type: Number, default: 0 },
    safetyScore: { type: Number, default: 0 },
    moderationBurden: { type: Number, default: 0 } // Reports per 100 members
  },
  
  // Financial Metrics
  financial: {
    // Revenue
    totalRevenue: { type: Number, default: 0 },
    subscriptionRevenue: { type: Number, default: 0 },
    sponsorshipRevenue: { type: Number, default: 0 },
    eventRevenue: { type: Number, default: 0 },
    
    // Costs
    totalCosts: { type: Number, default: 0 },
    hostingCosts: { type: Number, default: 0 },
    moderationCosts: { type: Number, default: 0 },
    marketingCosts: { type: Number, default: 0 },
    
    // Profitability
    profit: { type: Number, default: 0 },
    profitMargin: { type: Number, default: 0 },
    
    // Per-member metrics
    revenuePerMember: { type: Number, default: 0 },
    costPerMember: { type: Number, default: 0 },
    lifetimeValue: { type: Number, default: 0 },
    
    // Subscription metrics
    subscriptions: {
      total: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      cancelled: { type: Number, default: 0 },
      churnRate: { type: Number, default: 0 },
      mrr: { type: Number, default: 0 }, // Monthly Recurring Revenue
      arpu: { type: Number, default: 0 } // Average Revenue Per User
    }
  },
  
  // Performance Metrics
  performance: {
    // Technical performance
    pageLoadTime: { type: Number, default: 0 }, // Milliseconds
    apiResponseTime: { type: Number, default: 0 },
    uptime: { type: Number, default: 100 }, // Percentage
    
    // User experience
    bounceRate: { type: Number, default: 0 },
    sessionDuration: { type: Number, default: 0 }, // Minutes
    pageViewsPerSession: { type: Number, default: 0 },
    
    // Mobile performance
    mobileUsage: { type: Number, default: 0 }, // Percentage
    mobilePageLoadTime: { type: Number, default: 0 },
    
    // Search performance
    searchQueries: { type: Number, default: 0 },
    searchSuccessRate: { type: Number, default: 0 },
    
    // Feature usage
    featureUsage: {
      chat: { type: Number, default: 0 },
      polls: { type: Number, default: 0 },
      events: { type: Number, default: 0 },
      fileSharing: { type: Number, default: 0 },
      integrations: { type: Number, default: 0 }
    }
  },
  
  // Traffic and Acquisition Metrics
  traffic: {
    // Visit metrics
    totalVisits: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    
    // Traffic sources
    sources: {
      direct: { type: Number, default: 0 },
      search: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
      referral: { type: Number, default: 0 },
      email: { type: Number, default: 0 }
    },
    
    // Acquisition metrics
    newVisitors: { type: Number, default: 0 },
    returningVisitors: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }, // Visitors to members
    
    // Geographic distribution
    countries: [{
      country: String,
      visits: Number,
      percentage: Number
    }],
    
    // Referral tracking
    topReferrers: [{
      domain: String,
      visits: Number,
      conversions: Number
    }]
  },
  
  // Content Discovery and Search
  discovery: {
    // Search metrics
    searchQueries: { type: Number, default: 0 },
    topSearchTerms: [{
      term: String,
      count: Number,
      results: Number
    }],
    
    // Content discovery
    contentDiscovery: {
      browse: { type: Number, default: 0 },
      search: { type: Number, default: 0 },
      recommendations: { type: Number, default: 0 },
      social: { type: Number, default: 0 }
    },
    
    // Tag usage
    popularTags: [{
      tag: String,
      usage: Number,
      growth: Number
    }],
    
    // Trending topics
    trendingTopics: [{
      topic: String,
      mentions: Number,
      growth: Number,
      sentiment: Number
    }]
  },
  
  // Retention and Lifecycle
  retention: {
    // Retention rates
    day1Retention: { type: Number, default: 0 },
    day7Retention: { type: Number, default: 0 },
    day30Retention: { type: Number, default: 0 },
    day90Retention: { type: Number, default: 0 },
    
    // Cohort analysis
    cohortRetention: [{
      cohortDate: Date,
      size: Number,
      retention: [Number] // Retention at different periods
    }],
    
    // Member lifecycle
    lifecycle: {
      onboarding: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      dormant: { type: Number, default: 0 },
      churned: { type: Number, default: 0 }
    },
    
    // Reactivation
    reactivatedMembers: { type: Number, default: 0 },
    reactivationRate: { type: Number, default: 0 }
  },
  
  // Competitive and Benchmarking
  benchmarking: {
    // Industry benchmarks
    industryRank: Number,
    categoryRank: Number,
    
    // Comparison metrics
    memberGrowthVsIndustry: Number, // Percentage difference
    engagementVsIndustry: Number,
    contentVolumeVsIndustry: Number,
    
    // Competitive analysis
    competitorComparison: [{
      competitor: String,
      ourMetric: Number,
      theirMetric: Number,
      difference: Number
    }]
  },
  
  // Predictions and Forecasting
  predictions: {
    // Growth predictions
    predictedMemberGrowth: [{
      period: Date,
      predicted: Number,
      confidence: Number
    }],
    
    // Churn predictions
    churnRisk: {
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 }
    },
    
    // Revenue forecasting
    revenueForcast: [{
      period: Date,
      predicted: Number,
      confidence: Number
    }],
    
    // Trend analysis
    trends: [{
      metric: String,
      direction: String, // up, down, stable
      strength: Number, // 0-1
      significance: Number // 0-1
    }]
  },
  
  // Custom Metrics
  custom: [{
    name: String,
    description: String,
    value: Number,
    unit: String,
    category: String,
    trend: String, // up, down, stable
    target: Number,
    achieved: Boolean
  }],
  
  // Data Quality and Processing
  metadata: {
    // Data completeness
    dataCompleteness: { type: Number, default: 100 }, // Percentage
    missingFields: [String],
    
    // Processing information
    lastCalculated: { type: Date, default: Date.now },
    calculationDuration: Number, // Milliseconds
    dataSource: String,
    
    // Quality indicators
    confidence: { type: Number, default: 1 }, // 0-1 confidence in data
    accuracy: { type: Number, default: 1 }, // 0-1 accuracy score
    
    // Anomaly detection
    anomalies: [{
      metric: String,
      expected: Number,
      actual: Number,
      deviation: Number,
      flagged: Boolean
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound indexes for performance
communityMetricsSchema.index({ communityGroup: 1, 'period.type': 1, 'period.date': -1 })
communityMetricsSchema.index({ 'period.type': 1, 'period.date': -1 })
communityMetricsSchema.index({ communityGroup: 1, 'period.year': 1, 'period.quarter': 1 })
communityMetricsSchema.index({ communityGroup: 1, 'period.weekNumber': 1, 'period.year': 1 })

// Unique constraint to prevent duplicate metrics for same period
communityMetricsSchema.index(
  { communityGroup: 1, 'period.type': 1, 'period.date': 1 },
  { unique: true }
)

// Virtual for growth percentage
communityMetricsSchema.virtual('memberGrowthPercentage').get(function() {
  const total = this.members.total
  const growth = this.members.netGrowth
  
  return total > 0 ? (growth / (total - growth)) * 100 : 0
})

// Virtual for engagement health score
communityMetricsSchema.virtual('engagementHealth').get(function() {
  let score = 0
  
  // Member engagement rate (0-40 points)
  score += Math.min(40, this.members.engagementRate * 2)
  
  // Content quality (0-30 points)
  score += Math.min(30, this.content.averageQualityScore * 0.3)
  
  // Activity level (0-30 points)
  const activityScore = this.content.totalPosts + this.content.totalComments
  score += Math.min(30, activityScore / 10)
  
  return Math.round(score)
})

// Virtual for community health index
communityMetricsSchema.virtual('healthIndex').get(function() {
  let score = 0
  
  // Growth health (25%)
  const growthScore = Math.max(0, Math.min(25, this.members.growthRate))
  score += growthScore
  
  // Engagement health (25%)
  const engagementScore = Math.min(25, this.engagementHealth * 0.25)
  score += engagementScore
  
  // Content health (25%)
  const contentScore = Math.min(25, this.content.averageQualityScore * 0.25)
  score += contentScore
  
  // Safety health (25%)
  const safetyScore = Math.min(25, this.moderation.safetyScore * 0.25)
  score += safetyScore
  
  return Math.round(score)
})

// Static methods
communityMetricsSchema.statics.findByGroup = function(groupId, periodType = 'monthly', limit = 12) {
  return this.find({
    communityGroup: groupId,
    'period.type': periodType
  })
  .sort({ 'period.date': -1 })
  .limit(limit)
}

communityMetricsSchema.statics.getLatest = function(groupId) {
  return this.findOne({
    communityGroup: groupId
  })
  .sort({ 'period.date': -1, createdAt: -1 })
}

communityMetricsSchema.statics.getGrowthTrend = function(groupId, periods = 6) {
  return this.aggregate([
    {
      $match: {
        communityGroup: mongoose.Types.ObjectId(groupId),
        'period.type': 'monthly'
      }
    },
    { $sort: { 'period.date': -1 } },
    { $limit: periods },
    {
      $project: {
        date: '$period.date',
        members: '$members.total',
        growth: '$members.netGrowth',
        engagement: '$members.engagementRate',
        content: '$content.totalPosts'
      }
    },
    { $sort: { date: 1 } }
  ])
}

communityMetricsSchema.statics.getBenchmarkData = function(category, excludeGroupId = null) {
  const matchStage = {
    'period.type': 'monthly',
    'period.date': {
      $gte: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000) // Last 3 months
    }
  }
  
  if (excludeGroupId) {
    matchStage.communityGroup = { $ne: mongoose.Types.ObjectId(excludeGroupId) }
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        avgMembers: { $avg: '$members.total' },
        avgGrowthRate: { $avg: '$members.growthRate' },
        avgEngagementRate: { $avg: '$members.engagementRate' },
        avgContentPerMember: { $avg: '$content.contentPerMember' },
        avgQualityScore: { $avg: '$content.averageQualityScore' }
      }
    }
  ])
}

communityMetricsSchema.statics.getTopPerformers = function(metric, limit = 10) {
  const sortField = {}
  sortField[metric] = -1
  
  return this.aggregate([
    {
      $match: {
        'period.type': 'monthly',
        'period.date': {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last month
        }
      }
    },
    {
      $lookup: {
        from: 'communitygroups',
        localField: 'communityGroup',
        foreignField: '_id',
        as: 'group'
      }
    },
    { $unwind: '$group' },
    { $sort: sortField },
    { $limit: limit },
    {
      $project: {
        groupName: '$group.name',
        groupSlug: '$group.slug',
        metricValue: `$${metric}`,
        members: '$members.total',
        engagement: '$members.engagementRate'
      }
    }
  ])
}

// Instance methods
communityMetricsSchema.methods.calculateHealthScore = function() {
  // Implement comprehensive health calculation
  const weights = {
    growth: 0.2,
    engagement: 0.3,
    content: 0.2,
    retention: 0.2,
    safety: 0.1
  }
  
  let totalScore = 0
  
  // Growth score (0-100)
  const growthScore = Math.max(0, Math.min(100, 50 + (this.members.growthRate * 2)))
  totalScore += growthScore * weights.growth
  
  // Engagement score (0-100)
  const engagementScore = Math.min(100, this.members.engagementRate * 2)
  totalScore += engagementScore * weights.engagement
  
  // Content score (0-100)
  const contentScore = this.content.averageQualityScore || 0
  totalScore += contentScore * weights.content
  
  // Retention score (0-100)
  const retentionScore = this.retention.day30Retention || 0
  totalScore += retentionScore * weights.retention
  
  // Safety score (0-100)
  const safetyScore = this.moderation.safetyScore || 100
  totalScore += safetyScore * weights.safety
  
  return Math.round(totalScore)
}

communityMetricsSchema.methods.compareWithPrevious = function() {
  // Find previous period metrics for comparison
  const previousDate = new Date(this.period.date)
  
  if (this.period.type === 'daily') {
    previousDate.setDate(previousDate.getDate() - 1)
  } else if (this.period.type === 'weekly') {
    previousDate.setDate(previousDate.getDate() - 7)
  } else if (this.period.type === 'monthly') {
    previousDate.setMonth(previousDate.getMonth() - 1)
  }
  
  return this.constructor.findOne({
    communityGroup: this.communityGroup,
    'period.type': this.period.type,
    'period.date': previousDate
  })
}

communityMetricsSchema.methods.flagAnomalies = function(thresholds = {}) {
  const anomalies = []
  
  // Default thresholds (standard deviations)
  const defaultThresholds = {
    memberGrowth: 2.0,
    engagement: 1.5,
    contentVolume: 2.0,
    ...thresholds
  }
  
  // Check for anomalies (this would typically use historical data)
  // Simplified example:
  if (Math.abs(this.members.growthRate) > defaultThresholds.memberGrowth * 10) {
    anomalies.push({
      metric: 'members.growthRate',
      expected: 0,
      actual: this.members.growthRate,
      deviation: Math.abs(this.members.growthRate),
      flagged: true
    })
  }
  
  this.metadata.anomalies = anomalies
  return anomalies
}

communityMetricsSchema.methods.generateReport = function() {
  return {
    period: this.period,
    summary: {
      totalMembers: this.members.total,
      memberGrowth: this.members.netGrowth,
      engagementRate: this.members.engagementRate,
      contentVolume: this.content.totalPosts + this.content.totalComments,
      healthScore: this.calculateHealthScore()
    },
    highlights: {
      topContent: this.content.topPosts,
      topEvents: this.events.topEvents,
      trendingTopics: this.discovery.trendingTopics
    },
    concerns: this.metadata.anomalies.filter(a => a.flagged),
    recommendations: this.generateRecommendations()
  }
}

communityMetricsSchema.methods.generateRecommendations = function() {
  const recommendations = []
  
  // Growth recommendations
  if (this.members.growthRate < 5) {
    recommendations.push({
      category: 'growth',
      priority: 'high',
      title: 'Improve member acquisition',
      description: 'Growth rate is below healthy threshold. Consider marketing campaigns or referral programs.'
    })
  }
  
  // Engagement recommendations
  if (this.members.engagementRate < 20) {
    recommendations.push({
      category: 'engagement',
      priority: 'medium',
      title: 'Boost member engagement',
      description: 'Low engagement rate. Consider hosting events or creating interactive content.'
    })
  }
  
  // Content recommendations
  if (this.content.averageQualityScore < 60) {
    recommendations.push({
      category: 'content',
      priority: 'medium',
      title: 'Improve content quality',
      description: 'Content quality is below average. Provide content guidelines and encourage high-quality posts.'
    })
  }
  
  return recommendations
}

// Pre-save middleware
communityMetricsSchema.pre('save', function(next) {
  // Calculate derived metrics
  this.members.netGrowth = this.members.new - this.members.churned
  
  if (this.members.total > 0) {
    this.members.growthRate = (this.members.netGrowth / this.members.total) * 100
    this.members.activityRate = (this.members.active / this.members.total) * 100
    this.members.engagementRate = (this.members.engaged / this.members.total) * 100
  }
  
  // Calculate content per member
  if (this.members.total > 0) {
    this.content.contentPerMember = 
      (this.content.totalPosts + this.content.totalComments) / this.members.total
  }
  
  // Calculate engagement metrics
  if (this.content.totalPosts > 0) {
    this.content.commentsPerPost = this.content.totalComments / this.content.totalPosts
    this.content.reactionsPerPost = this.content.totalReactions / this.content.totalPosts
  }
  
  // Set week number and year for weekly metrics
  if (this.period.type === 'weekly') {
    const date = new Date(this.period.date)
    this.period.weekNumber = getWeekNumber(date)
    this.period.year = date.getFullYear()
  }
  
  // Set quarter and year for quarterly metrics
  if (this.period.type === 'quarterly') {
    const date = new Date(this.period.date)
    this.period.quarter = Math.floor(date.getMonth() / 3) + 1
    this.period.year = date.getFullYear()
  }
  
  next()
})

// Helper function to get ISO week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

export default mongoose.model('CommunityMetrics', communityMetricsSchema)