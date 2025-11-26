/**
 * Billing Model
 * Billing cycles, usage tracking, and comprehensive billing management
 */

import mongoose from 'mongoose'

const billingSchema = new mongoose.Schema({
  // Billing Identity
  billingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Associated Entities
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true,
    index: true
  },
  
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  
  // Billing Period
  billingPeriod: {
    start: {
      type: Date,
      required: true,
      index: true
    },
    
    end: {
      type: Date,
      required: true,
      index: true
    },
    
    duration: {
      type: String,
      required: true,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'semi-annual', 'annual', 'biennial'],
      index: true
    },
    
    // Billing period number (1st month, 2nd month, etc.)
    periodNumber: {
      type: Number,
      required: true,
      min: 1
    },
    
    // Is this a partial period? (e.g., prorated)
    isPartial: {
      type: Boolean,
      default: false
    },
    
    // Proration details for partial periods
    proration: {
      reason: {
        type: String,
        enum: ['mid_cycle_upgrade', 'mid_cycle_downgrade', 'mid_cycle_start', 'mid_cycle_cancellation']
      },
      
      originalPeriodStart: Date,
      originalPeriodEnd: Date,
      
      // How many days of the period were used
      usedDays: Number,
      totalDays: Number,
      
      // Proration percentage (0-1)
      prorationRate: {
        type: Number,
        min: 0,
        max: 1
      }
    }
  },
  
  // Billing Status
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'disputed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Financial Details
  financial: {
    // Base subscription amount
    baseAmount: {
      type: Number,
      required: true,
      min: 0
    },
    
    // Usage-based charges
    usageCharges: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Add-ons and extras
    addOnCharges: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Overage charges
    overageCharges: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Setup fees (one-time charges)
    setupFees: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Subtotal before taxes and discounts
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    
    // Discounts applied
    discounts: {
      // Coupon discounts
      couponDiscount: {
        type: Number,
        default: 0,
        min: 0
      },
      
      // Promotional discounts
      promotionalDiscount: {
        type: Number,
        default: 0,
        min: 0
      },
      
      // Loyalty discounts
      loyaltyDiscount: {
        type: Number,
        default: 0,
        min: 0
      },
      
      // Volume discounts
      volumeDiscount: {
        type: Number,
        default: 0,
        min: 0
      },
      
      // Total discount amount
      total: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    
    // Tax calculations
    tax: {
      // Tax rate applied
      rate: {
        type: Number,
        default: 0,
        min: 0,
        max: 1
      },
      
      // Tax amount
      amount: {
        type: Number,
        default: 0,
        min: 0
      },
      
      // Tax type
      type: {
        type: String,
        enum: ['vat', 'sales_tax', 'gst', 'hst', 'exempt'],
        default: 'exempt'
      },
      
      // Tax jurisdiction
      jurisdiction: {
        country: String,
        state: String,
        city: String
      },
      
      // Tax exemption details
      exemption: {
        isExempt: { type: Boolean, default: false },
        reason: String,
        certificate: String
      }
    },
    
    // Final amounts
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    
    // Amount due (may be different from total due to credits)
    amountDue: {
      type: Number,
      required: true,
      min: 0
    },
    
    // Amount paid
    amountPaid: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Outstanding balance
    balance: {
      type: Number,
      default: 0
    },
    
    // Currency
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true
    }
  },
  
  // Usage Tracking
  usage: {
    // Metered usage for this billing period
    metrics: [{
      // Metric name (e.g., 'api_calls', 'storage_gb', 'bandwidth')
      name: {
        type: String,
        required: true
      },
      
      // Display name
      displayName: String,
      
      // Unit of measurement
      unit: {
        type: String,
        required: true
      },
      
      // Usage amount for this period
      quantity: {
        type: Number,
        required: true,
        min: 0
      },
      
      // Included amount in plan
      includedQuantity: {
        type: Number,
        default: 0,
        min: 0
      },
      
      // Overage amount
      overageQuantity: {
        type: Number,
        default: 0,
        min: 0
      },
      
      // Pricing
      unitPrice: {
        type: Number,
        min: 0
      },
      
      overagePrice: {
        type: Number,
        min: 0
      },
      
      // Total charge for this metric
      totalCharge: {
        type: Number,
        default: 0,
        min: 0
      },
      
      // Usage history during billing period
      dailyUsage: [{
        date: { type: Date, required: true },
        quantity: { type: Number, required: true, min: 0 }
      }],
      
      // Peak usage
      peakUsage: {
        quantity: Number,
        date: Date
      }
    }],
    
    // Usage summary
    totalUnits: {
      type: Number,
      default: 0,
      min: 0
    },
    
    totalOverage: {
      type: Number,
      default: 0,
      min: 0
    },
    
    usagePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // Line Items (detailed breakdown)
  lineItems: [{
    type: {
      type: String,
      required: true,
      enum: ['subscription', 'usage', 'addon', 'setup_fee', 'overage', 'tax', 'discount', 'credit', 'refund']
    },
    
    description: {
      type: String,
      required: true
    },
    
    // Quantity and pricing
    quantity: {
      type: Number,
      default: 1,
      min: 0
    },
    
    unitPrice: {
      type: Number,
      required: true
    },
    
    // Line item total
    amount: {
      type: Number,
      required: true
    },
    
    // Associated entities
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan'
    },
    
    addonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Addon'
    },
    
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon'
    },
    
    // Period this line item covers
    periodStart: Date,
    periodEnd: Date,
    
    // Metadata
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Payment Information
  payment: {
    // Payment method used
    paymentMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentMethod'
    },
    
    // Payment processor
    processor: {
      type: String,
      enum: ['stripe', 'paypal', 'square', 'braintree', 'authorize_net', 'manual']
    },
    
    // Payment attempts
    attempts: [{
      attemptNumber: { type: Number, required: true },
      
      // Attempt details
      paymentMethodId: String,
      processor: String,
      
      // Attempt result
      status: {
        type: String,
        enum: ['success', 'failed', 'pending', 'cancelled'],
        required: true
      },
      
      // Amounts
      attemptedAmount: { type: Number, required: true },
      processedAmount: Number,
      
      // Payment processor response
      processorResponse: {
        transactionId: String,
        status: String,
        message: String,
        errorCode: String,
        errorMessage: String,
        gateway: String
      },
      
      // Timestamps
      attemptedAt: { type: Date, required: true },
      completedAt: Date,
      
      // Failure details
      failureReason: String,
      retryEligible: { type: Boolean, default: true },
      
      // Risk assessment
      riskScore: Number,
      fraudFlags: [String]
    }],
    
    // Current payment status
    currentAttempt: Number,
    maxAttempts: { type: Number, default: 3 },
    nextRetryAt: Date,
    
    // Payment dates
    dueDate: {
      type: Date,
      required: true,
      index: true
    },
    
    paidAt: Date,
    
    // Grace period
    gracePeriodEnd: Date,
    
    // Dunning management
    dunning: {
      stage: {
        type: String,
        enum: ['none', 'soft', 'hard', 'final'],
        default: 'none'
      },
      
      notificationsSent: [{
        type: { type: String, enum: ['email', 'sms', 'push'] },
        template: String,
        sentAt: Date,
        delivered: Boolean
      }],
      
      lastNotificationAt: Date,
      nextNotificationAt: Date
    }
  },
  
  // Credits and Adjustments
  credits: [{
    type: {
      type: String,
      required: true,
      enum: ['account_credit', 'promotional_credit', 'refund_credit', 'loyalty_credit', 'compensation']
    },
    
    amount: {
      type: Number,
      required: true
    },
    
    description: String,
    
    // Source of credit
    source: {
      type: String,
      enum: ['manual', 'automated', 'refund', 'promotion', 'loyalty_program']
    },
    
    // Credit application
    appliedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    
    // Associated entities
    referenceId: String,
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice'
    }
  }],
  
  // Billing Events and History
  events: [{
    type: {
      type: String,
      required: true,
      enum: ['created', 'processed', 'payment_failed', 'payment_succeeded', 'disputed', 'refunded', 'cancelled']
    },
    
    description: String,
    
    // Event data
    data: mongoose.Schema.Types.Mixed,
    
    // Event metadata
    triggeredBy: {
      type: String,
      enum: ['system', 'user', 'admin', 'api']
    },
    
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Invoice Generation
  invoice: {
    // Associated invoice
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice'
    },
    
    // Invoice generation status
    generated: { type: Boolean, default: false },
    generatedAt: Date,
    
    // Invoice delivery
    delivered: { type: Boolean, default: false },
    deliveredAt: Date,
    deliveryMethod: {
      type: String,
      enum: ['email', 'mail', 'portal', 'api']
    },
    
    // Invoice preferences
    autoGenerate: { type: Boolean, default: true },
    deliveryPreference: {
      type: String,
      enum: ['immediate', 'batch', 'manual'],
      default: 'immediate'
    }
  },
  
  // Compliance and Regulations
  compliance: {
    // Tax compliance
    taxCompliance: {
      vatRegistered: Boolean,
      taxId: String,
      exemptionCertificate: String
    },
    
    // Regional compliance
    region: {
      type: String,
      enum: ['us', 'eu', 'uk', 'ca', 'au', 'other']
    },
    
    // Data retention
    retentionPeriod: {
      type: Number,
      default: 2555 // 7 years in days
    },
    
    // Audit trail
    auditLog: [{
      action: String,
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: { type: Date, default: Date.now },
      changes: mongoose.Schema.Types.Mixed
    }]
  },
  
  // Analytics and Reporting
  analytics: {
    // Revenue metrics
    mrr: { type: Number, default: 0 }, // Monthly Recurring Revenue
    arr: { type: Number, default: 0 }, // Annual Recurring Revenue
    
    // Customer metrics
    isFirstBill: { type: Boolean, default: false },
    isUpgrade: { type: Boolean, default: false },
    isDowngrade: { type: Boolean, default: false },
    
    // Cohort analysis
    cohort: {
      month: String, // YYYY-MM
      year: Number,
      quarter: String
    },
    
    // Revenue attribution
    attribution: {
      source: String,
      medium: String,
      campaign: String,
      channel: String
    }
  },
  
  // Integration Data
  integrations: {
    // Accounting systems
    accounting: {
      quickbooks: {
        invoiceId: String,
        syncedAt: Date
      },
      
      xero: {
        invoiceId: String,
        syncedAt: Date
      },
      
      netsuite: {
        recordId: String,
        syncedAt: Date
      }
    },
    
    // CRM systems
    crm: {
      salesforce: {
        opportunityId: String,
        syncedAt: Date
      },
      
      hubspot: {
        dealId: String,
        syncedAt: Date
      }
    },
    
    // Analytics platforms
    analytics: {
      segment: {
        eventId: String,
        tracked: Boolean
      },
      
      mixpanel: {
        eventId: String,
        tracked: Boolean
      }
    }
  },
  
  // Metadata
  metadata: mongoose.Schema.Types.Mixed,
  internalNotes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
billingSchema.index({ billingId: 1 }, { unique: true })
billingSchema.index({ user: 1, 'billingPeriod.start': -1 })
billingSchema.index({ subscription: 1, 'billingPeriod.periodNumber': -1 })
billingSchema.index({ status: 1, 'payment.dueDate': 1 })
billingSchema.index({ 'billingPeriod.start': 1, 'billingPeriod.end': 1 })

// Compound indexes
billingSchema.index({ 
  user: 1, 
  status: 1, 
  'billingPeriod.start': -1 
})

// Virtual properties
billingSchema.virtual('isOverdue').get(function() {
  return this.status !== 'completed' && 
         this.payment.dueDate && 
         new Date() > this.payment.dueDate
})

billingSchema.virtual('daysPastDue').get(function() {
  if (!this.isOverdue) return 0
  
  const now = new Date()
  const dueDate = new Date(this.payment.dueDate)
  const diffTime = now.getTime() - dueDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

billingSchema.virtual('remainingBalance').get(function() {
  return this.financial.amountDue - this.financial.amountPaid
})

billingSchema.virtual('paymentProgress').get(function() {
  if (this.financial.amountDue === 0) return 100
  return (this.financial.amountPaid / this.financial.amountDue) * 100
})

billingSchema.virtual('usageProgress').get(function() {
  const totalIncluded = this.usage.metrics.reduce((sum, metric) => 
    sum + (metric.includedQuantity || 0), 0)
  
  if (totalIncluded === 0) return 0
  
  return Math.min(100, (this.usage.totalUnits / totalIncluded) * 100)
})

// Static methods
billingSchema.statics.findOverdueBills = function(graceDays = 0) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - graceDays)
  
  return this.find({
    status: { $in: ['pending', 'failed'] },
    'payment.dueDate': { $lt: cutoffDate }
  }).populate('user subscription')
}

billingSchema.statics.findUpcomingBills = function(days = 7) {
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + days)
  
  return this.find({
    status: 'pending',
    'payment.dueDate': { $gte: startDate, $lte: endDate }
  }).populate('user subscription')
}

billingSchema.statics.getRevenueMetrics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        'billingPeriod.start': { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$billingPeriod.start' },
          month: { $month: '$billingPeriod.start' }
        },
        totalRevenue: { $sum: '$financial.totalAmount' },
        totalMRR: { $sum: '$analytics.mrr' },
        billCount: { $sum: 1 },
        averageBillAmount: { $avg: '$financial.totalAmount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ])
}

billingSchema.statics.getUserBillingHistory = function(userId, limit = 12) {
  return this.find({ user: userId })
    .populate('subscription plan')
    .sort({ 'billingPeriod.start': -1 })
    .limit(limit)
}

// Instance methods
billingSchema.methods.calculateTotal = function() {
  // Calculate subtotal
  this.financial.subtotal = 
    this.financial.baseAmount + 
    this.financial.usageCharges + 
    this.financial.addOnCharges + 
    this.financial.overageCharges + 
    this.financial.setupFees
  
  // Apply discounts
  const totalDiscounts = 
    this.financial.discounts.couponDiscount + 
    this.financial.discounts.promotionalDiscount + 
    this.financial.discounts.loyaltyDiscount + 
    this.financial.discounts.volumeDiscount
  
  this.financial.discounts.total = totalDiscounts
  
  // Calculate amount after discounts
  const afterDiscounts = Math.max(0, this.financial.subtotal - totalDiscounts)
  
  // Calculate tax
  this.financial.tax.amount = afterDiscounts * (this.financial.tax.rate || 0)
  
  // Calculate total
  this.financial.totalAmount = afterDiscounts + this.financial.tax.amount
  
  // Apply credits
  const totalCredits = this.credits.reduce((sum, credit) => sum + credit.amount, 0)
  this.financial.amountDue = Math.max(0, this.financial.totalAmount - totalCredits)
  
  return this.save()
}

billingSchema.methods.addUsage = function(metricName, quantity, date = new Date()) {
  let metric = this.usage.metrics.find(m => m.name === metricName)
  
  if (!metric) {
    // Create new metric
    metric = {
      name: metricName,
      unit: 'units', // Default unit
      quantity: 0,
      includedQuantity: 0,
      dailyUsage: []
    }
    this.usage.metrics.push(metric)
  }
  
  // Add to total quantity
  metric.quantity += quantity
  
  // Add to daily usage
  const dateStr = date.toISOString().split('T')[0]
  let dailyEntry = metric.dailyUsage.find(d => 
    d.date.toISOString().split('T')[0] === dateStr)
  
  if (dailyEntry) {
    dailyEntry.quantity += quantity
  } else {
    metric.dailyUsage.push({ date, quantity })
  }
  
  // Update peak usage
  if (!metric.peakUsage || quantity > metric.peakUsage.quantity) {
    metric.peakUsage = { quantity, date }
  }
  
  // Calculate overage
  metric.overageQuantity = Math.max(0, metric.quantity - (metric.includedQuantity || 0))
  
  // Calculate charge
  if (metric.unitPrice && metric.overagePrice) {
    const includedCharge = Math.min(metric.quantity, metric.includedQuantity || 0) * metric.unitPrice
    const overageCharge = metric.overageQuantity * metric.overagePrice
    metric.totalCharge = includedCharge + overageCharge
  }
  
  // Update totals
  this.usage.totalUnits = this.usage.metrics.reduce((sum, m) => sum + m.quantity, 0)
  this.usage.totalOverage = this.usage.metrics.reduce((sum, m) => sum + m.overageQuantity, 0)
  
  return this.save()
}

billingSchema.methods.addLineItem = function(lineItem) {
  this.lineItems.push(lineItem)
  
  // Update financial totals based on line item type
  switch (lineItem.type) {
    case 'subscription':
      this.financial.baseAmount += lineItem.amount
      break
    case 'usage':
      this.financial.usageCharges += lineItem.amount
      break
    case 'addon':
      this.financial.addOnCharges += lineItem.amount
      break
    case 'overage':
      this.financial.overageCharges += lineItem.amount
      break
    case 'setup_fee':
      this.financial.setupFees += lineItem.amount
      break
    case 'discount':
      // Handle different discount types
      this.financial.discounts.total += Math.abs(lineItem.amount)
      break
  }
  
  return this.save()
}

billingSchema.methods.processPayment = function(paymentMethodId, processor = 'stripe') {
  const attempt = {
    attemptNumber: (this.payment.currentAttempt || 0) + 1,
    paymentMethodId,
    processor,
    status: 'pending',
    attemptedAmount: this.financial.amountDue,
    attemptedAt: new Date()
  }
  
  this.payment.attempts.push(attempt)
  this.payment.currentAttempt = attempt.attemptNumber
  this.status = 'processing'
  
  // This would integrate with actual payment processor
  // For now, we'll simulate the payment process
  
  return this.save()
}

billingSchema.methods.markPaymentSuccessful = function(transactionId, processedAmount) {
  const currentAttempt = this.payment.attempts[this.payment.attempts.length - 1]
  
  if (currentAttempt) {
    currentAttempt.status = 'success'
    currentAttempt.processedAmount = processedAmount
    currentAttempt.completedAt = new Date()
    currentAttempt.processorResponse = { transactionId, status: 'success' }
  }
  
  this.financial.amountPaid += processedAmount
  this.status = 'completed'
  this.payment.paidAt = new Date()
  
  // Add event
  this.events.push({
    type: 'payment_succeeded',
    description: `Payment of ${processedAmount} processed successfully`,
    data: { transactionId, amount: processedAmount },
    triggeredBy: 'system'
  })
  
  return this.save()
}

billingSchema.methods.markPaymentFailed = function(errorMessage, errorCode) {
  const currentAttempt = this.payment.attempts[this.payment.attempts.length - 1]
  
  if (currentAttempt) {
    currentAttempt.status = 'failed'
    currentAttempt.failureReason = errorMessage
    currentAttempt.completedAt = new Date()
    currentAttempt.processorResponse = { 
      status: 'failed', 
      errorMessage, 
      errorCode 
    }
  }
  
  this.status = 'failed'
  
  // Schedule retry if eligible
  if (this.payment.currentAttempt < this.payment.maxAttempts) {
    const nextRetry = new Date()
    nextRetry.setHours(nextRetry.getHours() + (this.payment.currentAttempt * 24))
    this.payment.nextRetryAt = nextRetry
  }
  
  // Add event
  this.events.push({
    type: 'payment_failed',
    description: `Payment failed: ${errorMessage}`,
    data: { errorCode, errorMessage },
    triggeredBy: 'system'
  })
  
  return this.save()
}

billingSchema.methods.applyCredit = function(creditAmount, type = 'account_credit', description) {
  const credit = {
    type,
    amount: creditAmount,
    description,
    source: 'manual'
  }
  
  this.credits.push(credit)
  
  // Recalculate amount due
  const totalCredits = this.credits.reduce((sum, c) => sum + c.amount, 0)
  this.financial.amountDue = Math.max(0, this.financial.totalAmount - totalCredits)
  
  return this.save()
}

billingSchema.methods.generateInvoice = function() {
  // This would trigger invoice generation
  // Implementation depends on invoice service
  
  this.invoice.generated = true
  this.invoice.generatedAt = new Date()
  
  this.events.push({
    type: 'invoice_generated',
    description: 'Invoice generated for billing period',
    triggeredBy: 'system'
  })
  
  return this.save()
}

billingSchema.methods.getUsageSummary = function() {
  return this.usage.metrics.map(metric => ({
    name: metric.name,
    displayName: metric.displayName || metric.name,
    unit: metric.unit,
    used: metric.quantity,
    included: metric.includedQuantity || 0,
    overage: metric.overageQuantity,
    percentage: metric.includedQuantity ? 
      Math.min(100, (metric.quantity / metric.includedQuantity) * 100) : 0,
    charge: metric.totalCharge || 0
  }))
}

// Pre-save middleware
billingSchema.pre('save', function(next) {
  // Generate billing ID if not exists
  if (!this.billingId) {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    this.billingId = `bill_${timestamp}${random}`
  }
  
  // Update financial calculations
  this.calculateTotal()
  
  next()
})

export default mongoose.model('Billing', billingSchema)