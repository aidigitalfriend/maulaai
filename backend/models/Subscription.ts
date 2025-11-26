/**
 * Subscription Model
 * User subscriptions, billing cycles, and lifecycle management
 */

import mongoose from 'mongoose'

const subscriptionSchema = new mongoose.Schema({
  // Associated Entities
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
    index: true
  },
  
  // Legacy fields for backward compatibility
  userId: String,
  email: String,
  agentId: String,
  agentName: String,
  
  // Subscription Identity
  subscriptionId: {
    type: String,
    unique: true,
    sparse: true // Allow null for draft subscriptions
  },
  
  externalId: {
    stripe: String,
    paypal: String,
    paddle: String,
    custom: String
  },
  
  // Legacy Stripe fields
  stripeSubscriptionId: String,
  stripeCustomerId: String,
  stripePriceId: String,
  
  // Subscription Status
  status: {
    type: String,
    required: true,
    enum: [
      'trial',
      'active', 
      'past_due',
      'canceled',
      'unpaid',
      'paused',
      'expired',
      'incomplete',
      'incomplete_expired',
      'trialing' // Legacy compatibility
    ],
    default: 'trial',
    index: true
  },
  
  // Billing Information
  billing: {
    // Billing cycle
    interval: {
      type: String,
      required: true,
      enum: ['day', 'week', 'month', 'quarter', 'year'],
      default: 'month'
    },
    
    intervalCount: {
      type: Number,
      default: 1,
      min: 1
    },
    
    // Pricing
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true
    },
    
    // Dates
    startDate: {
      type: Date,
      required: true,
      index: true
    },
    
    endDate: Date,
    
    currentPeriodStart: {
      type: Date,
      required: true
    },
    
    currentPeriodEnd: {
      type: Date,
      required: true
    },
    
    nextBillingDate: {
      type: Date,
      index: true
    },
    
    // Legacy price field
    price: Number
  },
  
  // Legacy fields for backward compatibility
  cancelAtPeriodEnd: { type: Boolean, default: false },
  canceledAt: Date,
  
  // Trial Information
  trial: {
    isActive: { type: Boolean, default: false },
    startDate: Date,
    endDate: Date,
    daysRemaining: { type: Number, default: 0 }
  },
  
  // Usage Tracking
  usage: {
    current: {
      apiCalls: { type: Number, default: 0 },
      storage: { type: Number, default: 0 },
      aiQueries: { type: Number, default: 0 },
      projects: { type: Number, default: 0 }
    },
    lastReset: { type: Date, default: Date.now }
  },
  
  // Metrics
  metrics: {
    totalRevenue: { type: Number, default: 0 },
    loginCount: { type: Number, default: 0 },
    lastLogin: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
subscriptionSchema.index({ user: 1, status: 1 })
subscriptionSchema.index({ 'billing.nextBillingDate': 1, status: 1 })
subscriptionSchema.index({ 'billing.currentPeriodEnd': 1 })

// Legacy indexes for backward compatibility
subscriptionSchema.index({ userId: 1, agentId: 1 })
subscriptionSchema.index({ userId: 1, status: 1 })
subscriptionSchema.index({ email: 1, status: 1 })
subscriptionSchema.index({ stripeCustomerId: 1, status: 1 })
subscriptionSchema.index({ currentPeriodEnd: 1, status: 1 })

// Virtual properties
subscriptionSchema.virtual('daysUntilBilling').get(function() {
  const billingDate = this.billing?.nextBillingDate || this.currentPeriodEnd
  if (!billingDate) return null
  
  const now = new Date()
  const diffTime = billingDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

subscriptionSchema.virtual('isTrialActive').get(function() {
  if (!this.trial?.isActive) return false
  
  const now = new Date()
  return this.trial.endDate && new Date(this.trial.endDate) > now
})

// Static methods
subscriptionSchema.statics.findActiveSubscriptions = function() {
  return this.find({
    status: { $in: ['trial', 'active', 'trialing'] }
  }).populate('user plan')
}

subscriptionSchema.statics.findExpiring = function(days = 7) {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)
  
  return this.find({
    status: { $in: ['trial', 'active', 'trialing'] },
    $or: [
      { 'billing.currentPeriodEnd': { $lte: futureDate } },
      { currentPeriodEnd: { $lte: futureDate } }
    ]
  }).populate('user plan')
}

// Legacy static methods for backward compatibility
subscriptionSchema.statics.findActiveByUser = function(userId) {
  return this.find({
    $or: [
      { user: userId },
      { userId: userId }
    ],
    status: { $in: ['active', 'trialing', 'trial'] }
  })
}

subscriptionSchema.statics.findExpiringSoon = function(days = 3) {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)
  
  return this.find({
    status: { $in: ['active', 'trialing', 'trial'] },
    $or: [
      { 'billing.currentPeriodEnd': { $lte: futureDate } },
      { currentPeriodEnd: { $lte: futureDate } }
    ],
    cancelAtPeriodEnd: { $ne: true }
  })
}

// Instance methods
subscriptionSchema.methods.isActive = function() {
  const now = new Date()
  const periodEnd = this.billing?.currentPeriodEnd || this.currentPeriodEnd
  
  return (
    ['active', 'trialing', 'trial'].includes(this.status) &&
    periodEnd && new Date(periodEnd) > now
  )
}

subscriptionSchema.methods.isPastDue = function() {
  return this.status === 'past_due'
}

subscriptionSchema.methods.isCanceled = function() {
  return this.status === 'canceled' || this.canceledAt
}

subscriptionSchema.methods.daysUntilRenewal = function() {
  const renewalDate = this.billing?.currentPeriodEnd || this.currentPeriodEnd
  if (!renewalDate) return -1
  
  const now = new Date()
  const diffTime = renewalDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

subscriptionSchema.methods.getDaysUntilRenewal = function() {
  return this.daysUntilRenewal() // Legacy method
}

subscriptionSchema.methods.addUsage = function(metric, amount) {
  if (!this.usage?.current) {
    this.usage = { current: {}, lastReset: new Date() }
  }
  
  if (!this.usage.current[metric]) {
    this.usage.current[metric] = 0
  }
  
  this.usage.current[metric] += amount
  return this.save()
}

// Pre-save middleware
subscriptionSchema.pre('save', function(next) {
  // Generate subscription ID if not present
  if (!this.subscriptionId && this.status !== 'draft') {
    this.subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  // Ensure billing object exists for new subscriptions
  if (!this.billing && this.isNew) {
    this.billing = {
      interval: 'month',
      intervalCount: 1,
      amount: this.price || 0,
      currency: (this.currency || 'USD').toUpperCase(),
      startDate: this.startDate || new Date(),
      currentPeriodStart: this.currentPeriodStart || new Date(),
      currentPeriodEnd: this.currentPeriodEnd || new Date()
    }
  }
  
  next()
})

export default mongoose.model('Subscription', subscriptionSchema)
