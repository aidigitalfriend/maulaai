/**
 * Plan Model
 * Subscription plans, pricing tiers, and feature configurations
 */

import mongoose from 'mongoose'

const planSchema = new mongoose.Schema({
  // Basic Plan Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  shortDescription: {
    type: String,
    maxlength: 100
  },
  
  // Plan Type and Category
  type: {
    type: String,
    required: true,
    enum: ['free', 'basic', 'pro', 'enterprise', 'custom'],
    index: true
  },
  
  category: {
    type: String,
    required: true,
    enum: ['individual', 'team', 'business', 'enterprise'],
    index: true
  },
  
  // Pricing Information
  pricing: {
    // Base price in cents (to avoid floating point issues)
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true,
      match: /^[A-Z]{3}$/
    },
    
    // Billing intervals
    interval: {
      type: String,
      required: true,
      enum: ['day', 'week', 'month', 'quarter', 'year', 'one-time'],
      default: 'month'
    },
    
    intervalCount: {
      type: Number,
      default: 1,
      min: 1
    },
    
    // Trial period
    trialPeriod: {
      enabled: { type: Boolean, default: false },
      days: { type: Number, default: 0, min: 0 }
    },
    
    // Setup fee
    setupFee: {
      amount: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: 'USD' }
    },
    
    // Multi-tier pricing
    tiers: [{
      name: String,
      minQuantity: { type: Number, default: 1 },
      maxQuantity: Number,
      pricePerUnit: { type: Number, required: true },
      flatFee: { type: Number, default: 0 }
    }],
    
    // Volume discounts
    volumeDiscounts: [{
      minQuantity: { type: Number, required: true },
      discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
      discountValue: { type: Number, required: true }
    }]
  },
  
  // Feature Limits and Quotas
  limits: {
    // AI Lab Limits
    aiModels: {
      total: { type: Number, default: 0 }, // 0 = unlimited
      concurrent: { type: Number, default: 1 },
      monthlyQueries: { type: Number, default: 1000 },
      customModels: { type: Boolean, default: false }
    },
    
    // User and Team Limits
    users: {
      total: { type: Number, default: 1 },
      teamMembers: { type: Number, default: 0 },
      administrators: { type: Number, default: 1 }
    },
    
    // Storage Limits
    storage: {
      totalGB: { type: Number, default: 1 },
      fileUploadMB: { type: Number, default: 10 },
      backupRetentionDays: { type: Number, default: 7 }
    },
    
    // API Limits
    api: {
      requestsPerMonth: { type: Number, default: 10000 },
      requestsPerMinute: { type: Number, default: 100 },
      webhooks: { type: Number, default: 5 },
      integrations: { type: Number, default: 3 }
    },
    
    // Community Features
    community: {
      groups: { type: Number, default: 0 },
      events: { type: Number, default: 0 },
      moderators: { type: Number, default: 0 },
      customBranding: { type: Boolean, default: false }
    },
    
    // Analytics and Reporting
    analytics: {
      historyDays: { type: Number, default: 30 },
      customReports: { type: Boolean, default: false },
      exportData: { type: Boolean, default: false },
      realTimeData: { type: Boolean, default: false }
    },
    
    // Support Limits
    support: {
      level: { 
        type: String, 
        enum: ['community', 'email', 'priority', 'dedicated'], 
        default: 'community' 
      },
      responseTimeHours: { type: Number, default: 72 },
      phone: { type: Boolean, default: false },
      onboarding: { type: Boolean, default: false }
    }
  },
  
  // Feature Flags
  features: {
    // Core Features
    dashboard: { type: Boolean, default: true },
    analytics: { type: Boolean, default: false },
    reporting: { type: Boolean, default: false },
    
    // AI Features
    aiLab: { type: Boolean, default: false },
    voiceCloning: { type: Boolean, default: false },
    imageGeneration: { type: Boolean, default: false },
    textAnalysis: { type: Boolean, default: false },
    chatbots: { type: Boolean, default: false },
    
    // Collaboration Features
    teamWorkspaces: { type: Boolean, default: false },
    sharedProjects: { type: Boolean, default: false },
    commenting: { type: Boolean, default: false },
    realTimeEdit: { type: Boolean, default: false },
    
    // Integration Features
    apiAccess: { type: Boolean, default: false },
    webhooks: { type: Boolean, default: false },
    sso: { type: Boolean, default: false },
    ldap: { type: Boolean, default: false },
    
    // Security Features
    twoFactorAuth: { type: Boolean, default: false },
    ipWhitelist: { type: Boolean, default: false },
    auditLogs: { type: Boolean, default: false },
    encryption: { type: Boolean, default: true },
    
    // Customization Features
    whiteLabeling: { type: Boolean, default: false },
    customDomain: { type: Boolean, default: false },
    customCSS: { type: Boolean, default: false },
    customIntegrations: { type: Boolean, default: false },
    
    // Advanced Features
    workflows: { type: Boolean, default: false },
    automations: { type: Boolean, default: false },
    advancedPermissions: { type: Boolean, default: false },
    bulkOperations: { type: Boolean, default: false }
  },
  
  // Plan Visibility and Availability
  visibility: {
    public: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    recommended: { type: Boolean, default: false },
    legacy: { type: Boolean, default: false }
  },
  
  availability: {
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    regions: [{ type: String, uppercase: true }], // ISO country codes
    customerTypes: [{ 
      type: String, 
      enum: ['individual', 'startup', 'business', 'enterprise'] 
    }]
  },
  
  // Marketing and Positioning
  marketing: {
    tagline: String,
    badges: [String], // e.g., "Most Popular", "Best Value"
    color: { type: String, match: /^#[0-9A-F]{6}$/i },
    icon: String,
    
    // Comparison positioning
    compareToPlans: [mongoose.Schema.Types.ObjectId],
    competitorComparison: [{
      competitor: String,
      advantages: [String],
      disadvantages: [String]
    }],
    
    // Target audience
    targetAudience: {
      roles: [String], // "Developer", "Manager", "Designer"
      industries: [String],
      companySize: String, // "1-10", "11-50", etc.
      useCase: String
    }
  },
  
  // Add-ons and Extras
  addOns: [{
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    type: { 
      type: String, 
      enum: ['per-user', 'per-month', 'one-time', 'usage-based'],
      required: true 
    },
    features: [String],
    limits: mongoose.Schema.Types.Mixed
  }],
  
  // Billing Configuration
  billing: {
    // Prorations
    prorateUpgrades: { type: Boolean, default: true },
    prorateDowngrades: { type: Boolean, default: false },
    
    // Grace periods
    gracePeriodDays: { type: Number, default: 3 },
    
    // Payment collection
    advanceBilling: { type: Boolean, default: true },
    invoiceTerms: { type: Number, default: 30 }, // Net 30
    
    // Dunning management
    dunningEnabled: { type: Boolean, default: true },
    maxRetryAttempts: { type: Number, default: 3 },
    
    // Tax settings
    taxInclusive: { type: Boolean, default: false },
    taxCode: String
  },
  
  // Usage-based Billing
  usageBilling: {
    enabled: { type: Boolean, default: false },
    
    // Metered components
    components: [{
      name: { type: String, required: true },
      unit: { type: String, required: true }, // "API calls", "GB", "users"
      pricePerUnit: { type: Number, required: true },
      includedQuantity: { type: Number, default: 0 },
      overage: {
        enabled: { type: Boolean, default: true },
        pricePerUnit: Number
      },
      tiers: [{
        from: { type: Number, required: true },
        to: Number,
        pricePerUnit: { type: Number, required: true }
      }]
    }],
    
    // Billing aggregation
    aggregation: {
      type: String,
      enum: ['sum', 'max', 'last-during-period'],
      default: 'sum'
    },
    
    // Reset frequency
    resetFrequency: {
      type: String,
      enum: ['never', 'monthly', 'billing-cycle'],
      default: 'billing-cycle'
    }
  },
  
  // Plan Transitions
  transitions: {
    // Upgrades
    upgradeOptions: [{
      targetPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
      automatic: { type: Boolean, default: false },
      conditions: [{
        metric: String, // "users", "storage", "api-calls"
        threshold: Number,
        operator: String // "gt", "gte", "lt", "lte"
      }]
    }],
    
    // Downgrades
    downgradeRestrictions: {
      preventIfOverLimit: { type: Boolean, default: true },
      dataRetentionDays: { type: Number, default: 30 },
      gracePeriodDays: { type: Number, default: 7 }
    },
    
    // Cancellation
    cancellation: {
      allowed: { type: Boolean, default: true },
      effectiveDate: { 
        type: String, 
        enum: ['immediate', 'end-of-billing-cycle'],
        default: 'end-of-billing-cycle'
      },
      dataRetentionDays: { type: Number, default: 90 },
      refundPolicy: String
    }
  },
  
  // Compliance and Legal
  compliance: {
    gdprCompliant: { type: Boolean, default: true },
    hipaaCompliant: { type: Boolean, default: false },
    soc2Compliant: { type: Boolean, default: false },
    
    dataProcessing: {
      regions: [String], // "US", "EU", "APAC"
      retention: String, // "As per user request", "7 years"
      deletion: String // "30 days after request", "immediate"
    },
    
    terms: {
      serviceLevel: String, // URL to SLA
      privacy: String, // URL to privacy policy
      terms: String // URL to terms of service
    }
  },
  
  // Metrics and Analytics
  metrics: {
    // Subscription metrics
    totalSubscriptions: { type: Number, default: 0 },
    activeSubscriptions: { type: Number, default: 0 },
    churnedSubscriptions: { type: Number, default: 0 },
    
    // Revenue metrics
    monthlyRevenue: { type: Number, default: 0 },
    annualRevenue: { type: Number, default: 0 },
    averageRevenuePerUser: { type: Number, default: 0 },
    
    // Conversion metrics
    trialConversionRate: { type: Number, default: 0 },
    upgradeRate: { type: Number, default: 0 },
    churnRate: { type: Number, default: 0 },
    
    // Usage metrics
    averageUsage: mongoose.Schema.Types.Mixed,
    peakUsage: mongoose.Schema.Types.Mixed,
    
    // Last calculated
    lastCalculated: { type: Date, default: Date.now }
  },
  
  // Status and Lifecycle
  status: {
    type: String,
    required: true,
    enum: ['draft', 'active', 'deprecated', 'archived'],
    default: 'draft',
    index: true
  },
  
  // Admin and Management
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Plan versioning
  version: {
    type: Number,
    default: 1
  },
  
  parentPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  
  // Metadata
  metadata: {
    tags: [String],
    notes: String,
    internalName: String,
    salesNotes: String,
    supportNotes: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
planSchema.index({ type: 1, status: 1 })
planSchema.index({ 'visibility.public': 1, status: 1 })
planSchema.index({ 'pricing.amount': 1, 'pricing.interval': 1 })
planSchema.index({ category: 1, type: 1 })

// Text search index
planSchema.index({ 
  name: 'text', 
  description: 'text', 
  'marketing.tagline': 'text' 
})

// Virtual for monthly price (normalized)
planSchema.virtual('monthlyPrice').get(function() {
  const { amount, interval, intervalCount } = this.pricing
  
  const multipliers = {
    day: 30,
    week: 4.33,
    month: 1,
    quarter: 1/3,
    year: 1/12,
    'one-time': 0
  }
  
  const multiplier = multipliers[interval] || 1
  return Math.round((amount * multiplier) / (intervalCount || 1))
})

// Virtual for yearly price
planSchema.virtual('yearlyPrice').get(function() {
  return this.monthlyPrice * 12
})

// Virtual for display price
planSchema.virtual('displayPrice').get(function() {
  const { amount, currency, interval } = this.pricing
  const price = (amount / 100).toFixed(2)
  
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥'
  }
  
  const symbol = currencySymbols[currency] || currency
  const intervalText = interval === 'month' ? '/mo' : `/${interval}`
  
  return `${symbol}${price}${intervalText}`
})

// Virtual for feature count
planSchema.virtual('featureCount').get(function() {
  return Object.values(this.features).filter(Boolean).length
})

// Static methods
planSchema.statics.findPublic = function() {
  return this.find({
    status: 'active',
    'visibility.public': true
  }).sort({ 'pricing.amount': 1 })
}

planSchema.statics.findByCategory = function(category) {
  return this.find({
    category,
    status: 'active',
    'visibility.public': true
  }).sort({ 'pricing.amount': 1 })
}

planSchema.statics.findRecommended = function() {
  return this.findOne({
    status: 'active',
    'visibility.public': true,
    'visibility.recommended': true
  })
}

planSchema.statics.findFeatured = function() {
  return this.find({
    status: 'active',
    'visibility.public': true,
    'visibility.featured': true
  }).sort({ 'pricing.amount': 1 })
}

planSchema.statics.searchPlans = function(query, options = {}) {
  const {
    category,
    maxPrice,
    features = [],
    interval = 'month'
  } = options
  
  let filter = {
    status: 'active',
    'visibility.public': true
  }
  
  if (category) {
    filter.category = category
  }
  
  if (maxPrice) {
    // Convert to monthly equivalent for comparison
    filter['pricing.amount'] = { $lte: maxPrice * 100 }
  }
  
  if (interval) {
    filter['pricing.interval'] = interval
  }
  
  // Add feature filters
  features.forEach(feature => {
    filter[`features.${feature}`] = true
  })
  
  let queryBuilder = this.find(filter)
  
  if (query) {
    queryBuilder = queryBuilder.find({ $text: { $search: query } })
  }
  
  return queryBuilder.sort({ 'pricing.amount': 1 })
}

// Instance methods
planSchema.methods.canUpgradeTo = function(targetPlan) {
  // Check if upgrade is allowed
  const upgradeOption = this.transitions.upgradeOptions.find(
    opt => opt.targetPlan.toString() === targetPlan._id.toString()
  )
  
  return upgradeOption !== undefined
}

planSchema.methods.calculatePrice = function(quantity = 1, addOns = []) {
  let basePrice = this.pricing.amount
  
  // Apply volume discounts
  const discount = this.pricing.volumeDiscounts.find(
    d => quantity >= d.minQuantity
  )
  
  if (discount) {
    if (discount.discountType === 'percentage') {
      basePrice = basePrice * (1 - discount.discountValue / 100)
    } else {
      basePrice = Math.max(0, basePrice - discount.discountValue)
    }
  }
  
  // Calculate add-on costs
  let addOnCost = 0
  addOns.forEach(addOnId => {
    const addOn = this.addOns.id(addOnId)
    if (addOn) {
      addOnCost += addOn.price
    }
  })
  
  return {
    basePrice: Math.round(basePrice * quantity),
    addOnCost,
    setupFee: this.pricing.setupFee.amount,
    total: Math.round(basePrice * quantity) + addOnCost + this.pricing.setupFee.amount
  }
}

planSchema.methods.checkLimits = function(usage) {
  const violations = []
  
  // Check each limit
  Object.keys(this.limits).forEach(category => {
    Object.keys(this.limits[category]).forEach(limit => {
      const allowedValue = this.limits[category][limit]
      const usedValue = usage[category]?.[limit] || 0
      
      // Skip unlimited (0) and boolean limits
      if (typeof allowedValue !== 'number' || allowedValue === 0) return
      
      if (usedValue > allowedValue) {
        violations.push({
          category,
          limit,
          allowed: allowedValue,
          used: usedValue,
          overage: usedValue - allowedValue
        })
      }
    })
  })
  
  return violations
}

planSchema.methods.generateQuote = function(options = {}) {
  const {
    quantity = 1,
    addOns = [],
    couponCode,
    taxRate = 0,
    billingCycle = 1
  } = options
  
  const pricing = this.calculatePrice(quantity, addOns)
  
  // Apply coupon (simplified)
  let discount = 0
  if (couponCode) {
    // This would typically lookup coupon from database
    discount = 0 // Placeholder
  }
  
  const subtotal = pricing.total * billingCycle
  const discountAmount = subtotal * (discount / 100)
  const taxableAmount = subtotal - discountAmount
  const taxAmount = taxableAmount * (taxRate / 100)
  const total = taxableAmount + taxAmount
  
  return {
    plan: {
      id: this._id,
      name: this.name,
      displayPrice: this.displayPrice
    },
    pricing,
    quantity,
    billingCycle,
    subtotal,
    discount: {
      code: couponCode,
      rate: discount,
      amount: discountAmount
    },
    tax: {
      rate: taxRate,
      amount: taxAmount
    },
    total,
    currency: this.pricing.currency
  }
}

// Pre-save middleware
planSchema.pre('save', function(next) {
  // Generate slug if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
  
  // Ensure only one recommended plan per category
  if (this.visibility.recommended && this.isModified('visibility.recommended')) {
    this.constructor.updateMany(
      { 
        category: this.category,
        _id: { $ne: this._id }
      },
      { 'visibility.recommended': false }
    ).exec()
  }
  
  next()
})

// Post-save middleware for metrics
planSchema.post('save', function(doc) {
  // Update plan metrics asynchronously
  if (doc.status === 'active') {
    // This would typically trigger a background job to recalculate metrics
    console.log(`Plan ${doc.name} saved, updating metrics...`)
  }
})

export default mongoose.model('Plan', planSchema)