/**
 * Coupon Model
 * Discount codes, promotional offers, and coupon management
 */

import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
  // Coupon Identity
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  description: String,
  
  // Coupon Type and Value
  type: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed_amount', 'free_shipping', 'free_trial', 'bogo'],
    index: true
  },
  
  // Discount Value
  discount: {
    // For percentage coupons (0-100)
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      validate: {
        validator: function(v) {
          return this.type !== 'percentage' || (v != null && v >= 0 && v <= 100)
        },
        message: 'Percentage must be between 0 and 100'
      }
    },
    
    // For fixed amount coupons (in cents)
    amount: {
      type: Number,
      min: 0,
      validate: {
        validator: function(v) {
          return this.type !== 'fixed_amount' || (v != null && v >= 0)
        },
        message: 'Amount must be greater than or equal to 0'
      }
    },
    
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    },
    
    // Maximum discount amount (for percentage coupons)
    maxAmount: {
      type: Number,
      min: 0
    },
    
    // Minimum purchase amount required
    minAmount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Usage Limits
  usage: {
    // Total usage limit
    maxUses: {
      type: Number,
      min: 1
    },
    
    // Per-customer usage limit
    maxUsesPerCustomer: {
      type: Number,
      default: 1,
      min: 1
    },
    
    // Current usage count
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Usage tracking
    usageHistory: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      
      invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
      },
      
      subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
      },
      
      discountAmount: {
        type: Number,
        required: true
      },
      
      originalAmount: {
        type: Number,
        required: true
      },
      
      usedAt: {
        type: Date,
        default: Date.now
      },
      
      metadata: mongoose.Schema.Types.Mixed
    }]
  },
  
  // Validity Period
  validity: {
    startDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    
    endDate: {
      type: Date,
      index: true
    },
    
    // Duration-based validity (alternative to end date)
    durationDays: {
      type: Number,
      min: 1
    },
    
    // Time-sensitive restrictions
    timeRestrictions: {
      days: [{ 
        type: Number, 
        min: 0, 
        max: 6 
      }], // 0 = Sunday, 6 = Saturday
      
      startTime: String, // HH:MM format
      endTime: String,   // HH:MM format
      timezone: String
    }
  },
  
  // Applicability Rules
  applicability: {
    // Applicable plans
    plans: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan'
    }],
    
    // Applicable product categories
    categories: [String],
    
    // Applicable user segments
    userSegments: [{
      type: String,
      enum: ['new_users', 'returning_users', 'premium_users', 'enterprise_users', 'trial_users']
    }],
    
    // Geographic restrictions
    countries: [String], // ISO country codes
    regions: [String],
    
    // Subscription-specific rules
    subscriptionRules: {
      newSubscriptionsOnly: { type: Boolean, default: false },
      upgradeOnly: { type: Boolean, default: false },
      renewalOnly: { type: Boolean, default: false },
      firstPaymentOnly: { type: Boolean, default: false }
    },
    
    // Minimum requirements
    requirements: {
      minSubscriptionValue: Number,
      minBillingPeriod: String, // 'monthly', 'yearly'
      requiresVerifiedAccount: { type: Boolean, default: false }
    }
  },
  
  // Coupon Status
  status: {
    type: String,
    required: true,
    enum: ['draft', 'active', 'paused', 'expired', 'disabled'],
    default: 'draft',
    index: true
  },
  
  // Marketing and Campaign Information
  marketing: {
    campaignId: String,
    campaignName: String,
    
    // Marketing channels
    channels: [{
      type: String,
      enum: ['email', 'social', 'affiliate', 'paid_ads', 'organic', 'referral', 'direct']
    }],
    
    // Attribution tracking
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmContent: String,
    
    // A/B testing
    testGroup: String,
    testVariant: String
  },
  
  // Stacking and Combination Rules
  stacking: {
    // Can this coupon be combined with other coupons?
    allowStacking: { type: Boolean, default: false },
    
    // Which coupons can be stacked with this one?
    stackableWith: [String], // Coupon codes
    
    // Exclusions
    excludeCoupons: [String], // Coupon codes that cannot be used with this
    
    // Priority for conflict resolution
    priority: {
      type: Number,
      default: 0
    },
    
    // How to handle conflicts
    conflictResolution: {
      type: String,
      enum: ['highest_discount', 'lowest_discount', 'first_applied', 'priority_based'],
      default: 'highest_discount'
    }
  },
  
  // Auto-application Rules
  autoApply: {
    enabled: { type: Boolean, default: false },
    
    // Conditions for auto-application
    conditions: [{
      field: { type: String, required: true }, // 'cart_total', 'user_segment', etc.
      operator: { 
        type: String, 
        enum: ['equals', 'greater_than', 'less_than', 'contains', 'in'],
        required: true 
      },
      value: mongoose.Schema.Types.Mixed,
      description: String
    }],
    
    // Priority for auto-application
    priority: { type: Number, default: 0 }
  },
  
  // Referral Program Integration
  referral: {
    isReferralReward: { type: Boolean, default: false },
    
    // Referral details
    referrerReward: {
      type: String, // 'percentage', 'fixed_amount', 'credits'
      value: Number
    },
    
    refereeReward: {
      type: String,
      value: Number
    },
    
    // Referral tracking
    referralCode: String,
    referralSource: String
  },
  
  // Analytics and Performance
  analytics: {
    // Conversion metrics
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    successfulUses: { type: Number, default: 0 },
    
    // Revenue impact
    totalDiscountGiven: { type: Number, default: 0 },
    totalRevenueGenerated: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    
    // Performance ratios
    conversionRate: { type: Number, default: 0 },
    redemptionRate: { type: Number, default: 0 },
    
    // Customer acquisition
    newCustomersAcquired: { type: Number, default: 0 },
    customerRetention: { type: Number, default: 0 },
    
    // Last calculation
    lastCalculated: { type: Date, default: Date.now }
  },
  
  // Advanced Features
  advanced: {
    // Progressive discounts (increase with usage)
    progressiveDiscount: {
      enabled: { type: Boolean, default: false },
      stages: [{
        usageThreshold: { type: Number, required: true },
        discountIncrease: { type: Number, required: true },
        maxDiscount: Number
      }]
    },
    
    // Loyalty program integration
    loyaltyProgram: {
      pointsRequired: Number,
      pointsAwarded: Number,
      tierRequirement: String
    },
    
    // Subscription lifecycle targeting
    lifecycleTargeting: {
      trialExpiring: { type: Boolean, default: false },
      churnRisk: { type: Boolean, default: false },
      paymentFailed: { type: Boolean, default: false },
      cancellationAttempt: { type: Boolean, default: false }
    },
    
    // Dynamic pricing
    dynamicPricing: {
      enabled: { type: Boolean, default: false },
      pricePoints: [{
        condition: String,
        discountModifier: Number
      }]
    }
  },
  
  // Fraud Prevention
  security: {
    // Rate limiting
    rateLimit: {
      enabled: { type: Boolean, default: false },
      maxAttemptsPerHour: { type: Number, default: 10 },
      maxAttemptsPerDay: { type: Number, default: 50 }
    },
    
    // IP restrictions
    ipRestrictions: {
      whitelist: [String],
      blacklist: [String],
      enabled: { type: Boolean, default: false }
    },
    
    // Device fingerprinting
    deviceTracking: {
      enabled: { type: Boolean, default: false },
      maxDevicesPerUser: { type: Number, default: 3 }
    },
    
    // Suspicious activity flags
    fraudFlags: [{
      type: String,
      description: String,
      severity: { type: String, enum: ['low', 'medium', 'high'] },
      flaggedAt: { type: Date, default: Date.now }
    }]
  },
  
  // Integration Data
  integrations: {
    // External coupon systems
    external: {
      system: String, // 'groupon', 'honey', 'rakuten'
      externalId: String,
      syncedAt: Date
    },
    
    // Marketing platforms
    marketing: {
      mailchimp: String,
      klaviyo: String,
      hubspot: String
    },
    
    // Analytics platforms
    analytics: {
      googleAnalytics: String,
      mixpanel: String,
      amplitude: String
    }
  },
  
  // Admin and Management
  management: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Approval workflow
    approvalRequired: { type: Boolean, default: false },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    
    // Notes and comments
    notes: [{
      content: { type: String, required: true },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      createdAt: { type: Date, default: Date.now },
      type: {
        type: String,
        enum: ['general', 'approval', 'performance', 'issue'],
        default: 'general'
      }
    }],
    
    // Internal tags
    internalTags: [String],
    
    // Budget and cost tracking
    budget: {
      allocated: Number,
      spent: { type: Number, default: 0 },
      remaining: { type: Number, default: 0 }
    }
  },
  
  // Metadata and Custom Fields
  metadata: mongoose.Schema.Types.Mixed,
  customFields: mongoose.Schema.Types.Mixed
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
couponSchema.index({ code: 1 }, { unique: true })
couponSchema.index({ status: 1, 'validity.startDate': 1, 'validity.endDate': 1 })
couponSchema.index({ type: 1, status: 1 })
couponSchema.index({ 'marketing.campaignId': 1 })
couponSchema.index({ 'usage.usedCount': 1, 'usage.maxUses': 1 })

// Text search index
couponSchema.index({
  code: 'text',
  name: 'text',
  description: 'text',
  'marketing.campaignName': 'text'
})

// Virtual properties
couponSchema.virtual('isExpired').get(function() {
  return this.validity.endDate && new Date() > this.validity.endDate
})

couponSchema.virtual('isActive').get(function() {
  const now = new Date()
  return this.status === 'active' &&
         (!this.validity.startDate || now >= this.validity.startDate) &&
         (!this.validity.endDate || now <= this.validity.endDate) &&
         (!this.usage.maxUses || this.usage.usedCount < this.usage.maxUses)
})

couponSchema.virtual('usagePercentage').get(function() {
  if (!this.usage.maxUses) return 0
  return (this.usage.usedCount / this.usage.maxUses) * 100
})

couponSchema.virtual('remainingUses').get(function() {
  if (!this.usage.maxUses) return Infinity
  return Math.max(0, this.usage.maxUses - this.usage.usedCount)
})

couponSchema.virtual('daysRemaining').get(function() {
  if (!this.validity.endDate) return Infinity
  
  const now = new Date()
  const endDate = new Date(this.validity.endDate)
  const diffTime = endDate.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
})

// Static methods
couponSchema.statics.findValidCoupons = function() {
  const now = new Date()
  
  return this.find({
    status: 'active',
    $or: [
      { 'validity.startDate': { $lte: now } },
      { 'validity.startDate': { $exists: false } }
    ],
    $or: [
      { 'validity.endDate': { $gte: now } },
      { 'validity.endDate': { $exists: false } }
    ],
    $or: [
      { 'usage.maxUses': { $gt: '$usage.usedCount' } },
      { 'usage.maxUses': { $exists: false } }
    ]
  })
}

couponSchema.statics.findByCode = function(code) {
  return this.findOne({ 
    code: code.toUpperCase(),
    status: 'active'
  })
}

couponSchema.statics.findExpiring = function(days = 7) {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)
  
  return this.find({
    status: 'active',
    'validity.endDate': { $lte: futureDate, $gte: new Date() }
  }).sort({ 'validity.endDate': 1 })
}

couponSchema.statics.getPerformanceMetrics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        'usage.usageHistory.usedAt': { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalCouponsUsed: { $sum: 1 },
        totalDiscountGiven: { $sum: '$analytics.totalDiscountGiven' },
        totalRevenueGenerated: { $sum: '$analytics.totalRevenueGenerated' },
        averageDiscountAmount: { $avg: '$analytics.totalDiscountGiven' }
      }
    }
  ])
}

// Instance methods
couponSchema.methods.canBeUsedBy = function(user, orderDetails = {}) {
  const issues = []
  
  // Check if coupon is active
  if (!this.isActive) {
    issues.push('Coupon is not active or has expired')
  }
  
  // Check usage limits
  if (this.usage.maxUses && this.usage.usedCount >= this.usage.maxUses) {
    issues.push('Coupon usage limit reached')
  }
  
  // Check per-customer usage
  if (this.usage.maxUsesPerCustomer) {
    const userUsageCount = this.usage.usageHistory.filter(
      usage => usage.user.toString() === user._id.toString()
    ).length
    
    if (userUsageCount >= this.usage.maxUsesPerCustomer) {
      issues.push('Personal usage limit reached')
    }
  }
  
  // Check minimum amount
  if (this.discount.minAmount && orderDetails.amount < this.discount.minAmount) {
    issues.push(`Minimum order amount of ${this.discount.minAmount} required`)
  }
  
  // Check user segment restrictions
  if (this.applicability.userSegments && this.applicability.userSegments.length > 0) {
    // This would need to check user's segment
    // Simplified check here
  }
  
  // Check plan restrictions
  if (this.applicability.plans && this.applicability.plans.length > 0) {
    if (orderDetails.planId && !this.applicability.plans.includes(orderDetails.planId)) {
      issues.push('Coupon not applicable to selected plan')
    }
  }
  
  return {
    canUse: issues.length === 0,
    issues
  }
}

couponSchema.methods.calculateDiscount = function(amount, currency = 'USD') {
  if (this.type === 'percentage') {
    let discount = (amount * this.discount.percentage) / 100
    
    // Apply maximum discount limit
    if (this.discount.maxAmount && discount > this.discount.maxAmount) {
      discount = this.discount.maxAmount
    }
    
    return {
      type: 'percentage',
      percentage: this.discount.percentage,
      amount: Math.round(discount),
      maxAmount: this.discount.maxAmount
    }
  } else if (this.type === 'fixed_amount') {
    // Convert currency if needed (simplified)
    let discountAmount = this.discount.amount
    
    // Don't discount more than the total amount
    discountAmount = Math.min(discountAmount, amount)
    
    return {
      type: 'fixed_amount',
      amount: discountAmount,
      currency: this.discount.currency
    }
  }
  
  return {
    type: this.type,
    amount: 0
  }
}

couponSchema.methods.recordUsage = function(usageData) {
  const usage = {
    user: usageData.userId,
    invoice: usageData.invoiceId,
    subscription: usageData.subscriptionId,
    discountAmount: usageData.discountAmount,
    originalAmount: usageData.originalAmount,
    metadata: usageData.metadata
  }
  
  this.usage.usageHistory.push(usage)
  this.usage.usedCount += 1
  
  // Update analytics
  this.analytics.successfulUses += 1
  this.analytics.totalDiscountGiven += usageData.discountAmount
  this.analytics.totalRevenueGenerated += (usageData.originalAmount - usageData.discountAmount)
  
  // Recalculate metrics
  if (this.analytics.successfulUses > 0) {
    this.analytics.averageOrderValue = this.analytics.totalRevenueGenerated / this.analytics.successfulUses
  }
  
  return this.save()
}

couponSchema.methods.pause = function(reason) {
  this.status = 'paused'
  
  if (this.management.notes) {
    this.management.notes.push({
      content: `Coupon paused: ${reason}`,
      type: 'general'
    })
  }
  
  return this.save()
}

couponSchema.methods.activate = function() {
  this.status = 'active'
  return this.save()
}

couponSchema.methods.expire = function() {
  this.status = 'expired'
  this.validity.endDate = new Date()
  return this.save()
}

couponSchema.methods.generateReport = function() {
  return {
    code: this.code,
    name: this.name,
    type: this.type,
    status: this.status,
    
    usage: {
      used: this.usage.usedCount,
      remaining: this.remainingUses,
      percentage: this.usagePercentage
    },
    
    performance: {
      totalDiscountGiven: this.analytics.totalDiscountGiven,
      totalRevenueGenerated: this.analytics.totalRevenueGenerated,
      averageOrderValue: this.analytics.averageOrderValue,
      conversionRate: this.analytics.conversionRate
    },
    
    validity: {
      startDate: this.validity.startDate,
      endDate: this.validity.endDate,
      daysRemaining: this.daysRemaining,
      isExpired: this.isExpired
    }
  }
}

// Pre-save middleware
couponSchema.pre('save', function(next) {
  // Ensure code is uppercase
  if (this.code) {
    this.code = this.code.toUpperCase().trim()
  }
  
  // Set end date based on duration
  if (this.validity.durationDays && !this.validity.endDate) {
    const endDate = new Date(this.validity.startDate || Date.now())
    endDate.setDate(endDate.getDate() + this.validity.durationDays)
    this.validity.endDate = endDate
  }
  
  // Update budget remaining
  if (this.management.budget && this.management.budget.allocated) {
    this.management.budget.spent = this.analytics.totalDiscountGiven || 0
    this.management.budget.remaining = this.management.budget.allocated - this.management.budget.spent
  }
  
  next()
})

export default mongoose.model('Coupon', couponSchema)