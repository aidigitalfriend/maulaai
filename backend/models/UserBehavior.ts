/**
 * User Behavior Model
 * Detailed behavior tracking and analytics for advanced insights
 */

import mongoose from 'mongoose'

const userBehaviorSchema = new mongoose.Schema({
  // User Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Session Information
  sessionId: {
    type: String,
    required: true,
    index: true
  },

  // Event Details
  eventType: {
    type: String,
    required: true,
    enum: [
      'page_view', 'button_click', 'form_submit', 'api_call', 'feature_usage',
      'time_spent', 'scroll_depth', 'search_query', 'content_interaction',
      'error_encountered', 'goal_completed', 'abandonment'
    ],
    index: true
  },

  eventName: {
    type: String,
    required: true,
    maxlength: 100
  },

  // Event Data
  properties: {
    // Page/Area information
    page: String,
    section: String,
    component: String,

    // User interaction details
    element: String,
    action: String,
    target: String,

    // Content information
    contentType: String,
    contentId: String,
    category: String,

    // Technical details
    userAgent: String,
    screenResolution: String,
    viewportSize: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'tablet', 'mobile', 'unknown']
    },

    // Custom properties
    customData: mongoose.Schema.Types.Mixed
  },

  // Quantitative Metrics
  metrics: {
    duration: Number, // in milliseconds
    scrollDepth: Number, // percentage 0-100
    timeSpent: Number, // in seconds
    interactions: Number,
    errors: Number
  },

  // Context Information
  context: {
    referrer: String,
    campaign: String,
    source: String,
    medium: String,

    // User state
    userType: {
      type: String,
      enum: ['guest', 'registered', 'premium', 'admin']
    },
    subscriptionTier: String,

    // Session context
    sessionStart: Date,
    previousPage: String,
    nextPage: String
  },

  // Geographic & Demographic Data
  location: {
    country: String,
    region: String,
    city: String,
    timezone: String,
    ip: String // anonymized
  },

  // Performance Metrics
  performance: {
    pageLoadTime: Number, // in milliseconds
    apiResponseTime: Number,
    errorRate: Number,
    satisfaction: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // Business Impact
  businessValue: {
    revenue: Number,
    conversion: Boolean,
    goalType: String,
    goalValue: Number
  }

}, {
  timestamps: true
})

// Indexes for efficient querying
userBehaviorSchema.index({ userId: 1, createdAt: -1 })
userBehaviorSchema.index({ eventType: 1, createdAt: -1 })
userBehaviorSchema.index({ sessionId: 1 })
userBehaviorSchema.index({ 'properties.page': 1 })
userBehaviorSchema.index({ 'properties.contentType': 1 })
userBehaviorSchema.index({ 'context.userType': 1 })

// Static methods for analytics
userBehaviorSchema.statics.getUserActivity = function(userId, days = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return this.find({
    userId,
    createdAt: { $gte: startDate }
  }).sort({ createdAt: -1 })
}

userBehaviorSchema.statics.getPageAnalytics = function(page, days = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return this.aggregate([
    {
      $match: {
        'properties.page': page,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        avgDuration: { $avg: '$metrics.duration' },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        eventType: '$_id',
        count: 1,
        avgDuration: 1,
        uniqueUsersCount: { $size: '$uniqueUsers' }
      }
    }
  ])
}

userBehaviorSchema.statics.getUserJourney = function(userId, sessionId = null) {
  const match = { userId }
  if (sessionId) match.sessionId = sessionId

  return this.find(match)
    .sort({ createdAt: 1 })
    .select('eventType eventName properties.page createdAt')
}

userBehaviorSchema.statics.getConversionFunnel = function(steps, days = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return this.aggregate([
    {
      $match: {
        eventType: { $in: steps },
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$eventType',
        users: { $addToSet: '$userId' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        step: '$_id',
        userCount: { $size: '$users' },
        eventCount: '$count'
      }
    },
    {
      $sort: { step: 1 }
    }
  ])
}

userBehaviorSchema.statics.getTopPages = function(limit = 10, days = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return this.aggregate([
    {
      $match: {
        eventType: 'page_view',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$properties.page',
        views: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        avgTimeSpent: { $avg: '$metrics.timeSpent' }
      }
    },
    {
      $project: {
        page: '$_id',
        views: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        avgTimeSpent: 1
      }
    },
    {
      $sort: { views: -1 }
    },
    {
      $limit: limit
    }
  ])
}

// Instance methods
userBehaviorSchema.methods.isConversion = function() {
  return this.businessValue && this.businessValue.conversion === true
}

userBehaviorSchema.methods.getDuration = function() {
  return this.metrics && this.metrics.duration ? this.metrics.duration : 0
}

export default mongoose.model('UserBehavior', userBehaviorSchema)