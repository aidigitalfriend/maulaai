/**
 * Payment Model
 * Payment transactions, processing, and financial records
 */

import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  // Payment Identity
  paymentId: {
    type: String,
    unique: true,
    required: true,
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
    index: true
  },
  
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    index: true
  },
  
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  
  // Payment Details
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
  
  // Payment Status
  status: {
    type: String,
    required: true,
    enum: [
      'pending',
      'processing',
      'succeeded', 
      'failed',
      'canceled',
      'refunded',
      'partially_refunded',
      'disputed',
      'chargeback'
    ],
    default: 'pending',
    index: true
  },
  
  // Payment Method Information
  paymentMethod: {
    type: {
      type: String,
      required: true,
      enum: ['card', 'bank_transfer', 'paypal', 'apple_pay', 'google_pay', 'crypto', 'invoice', 'check']
    },
    
    // Card details (if applicable)
    card: {
      brand: String, // visa, mastercard, amex, etc.
      last4: String,
      expiryMonth: Number,
      expiryYear: Number,
      country: String,
      funding: String, // credit, debit, prepaid
      fingerprint: String,
      cvcCheck: String,
      avsCheck: String
    },
    
    // Bank details (if applicable)
    bank: {
      accountType: String, // checking, savings
      bankName: String,
      routingNumber: String,
      accountLast4: String,
      country: String
    },
    
    // Digital wallet details
    wallet: {
      type: String, // paypal, apple_pay, google_pay
      email: String,
      phone: String
    },
    
    // Crypto details
    crypto: {
      currency: String, // BTC, ETH, USDC
      network: String,
      address: String,
      transactionHash: String
    }
  },
  
  // Payment Processor Information
  processor: {
    name: {
      type: String,
      required: true,
      enum: ['stripe', 'paypal', 'square', 'paddle', 'razorpay', 'manual']
    },
    
    // External IDs
    externalId: String, // Payment intent ID from processor
    chargeId: String,
    customerId: String,
    
    // Processor-specific data
    metadata: mongoose.Schema.Types.Mixed,
    
    // Processing timestamps
    createdAt: Date,
    processedAt: Date,
    capturedAt: Date
  },
  
  // Transaction Details
  transaction: {
    type: {
      type: String,
      required: true,
      enum: ['payment', 'refund', 'chargeback', 'adjustment', 'fee']
    },
    
    description: String,
    
    // Related transactions
    parentTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    
    // Reference information
    reference: String, // Invoice number, order ID, etc.
    externalReference: String,
    
    // Authorization info
    authorizationCode: String,
    captureMethod: {
      type: String,
      enum: ['automatic', 'manual'],
      default: 'automatic'
    }
  },
  
  // Fees and Costs
  fees: {
    // Processor fees
    processingFee: { type: Number, default: 0 },
    processingFeeRate: { type: Number, default: 0 },
    
    // Platform fees
    platformFee: { type: Number, default: 0 },
    applicationFee: { type: Number, default: 0 },
    
    // Total fees
    totalFees: { type: Number, default: 0 },
    
    // Net amount (after fees)
    netAmount: { type: Number, required: true },
    
    // Fee breakdown
    breakdown: [{
      type: String, // 'processing', 'platform', 'tax'
      amount: Number,
      rate: Number,
      description: String
    }]
  },
  
  // Tax Information
  tax: {
    amount: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    taxId: String,
    jurisdiction: String,
    
    // Tax breakdown
    breakdown: [{
      type: String, // 'sales', 'vat', 'gst'
      amount: Number,
      rate: Number,
      jurisdiction: String
    }],
    
    // Tax exemption
    exempt: { type: Boolean, default: false },
    exemptionReason: String
  },
  
  // Failure Information
  failure: {
    code: String,
    message: String,
    declineCode: String,
    networkStatus: String,
    reason: String,
    
    // Retry information
    retryable: { type: Boolean, default: false },
    retryCount: { type: Number, default: 0 },
    nextRetryAt: Date,
    maxRetries: { type: Number, default: 3 }
  },
  
  // Refund Information
  refunds: [{
    refundId: String,
    amount: { type: Number, required: true },
    currency: String,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'canceled'],
      default: 'pending'
    },
    
    // Refund details
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    requestedAt: { type: Date, default: Date.now },
    processedAt: Date,
    
    // External refund reference
    externalRefundId: String,
    
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Dispute Information
  disputes: [{
    disputeId: String,
    amount: { type: Number, required: true },
    currency: String,
    reason: String,
    status: {
      type: String,
      enum: ['warning_needs_response', 'warning_under_review', 'warning_closed', 'needs_response', 'under_review', 'charge_refunded', 'won', 'lost'],
      default: 'needs_response'
    },
    
    // Dispute timeline
    createdAt: { type: Date, default: Date.now },
    evidenceDueBy: Date,
    respondedAt: Date,
    resolvedAt: Date,
    
    // Evidence
    evidence: {
      customerCommunication: String,
      receipt: String,
      shippingCarrier: String,
      shippingTrackingNumber: String,
      shippingDate: Date,
      refundPolicy: String,
      cancellationPolicy: String,
      
      // Additional evidence
      additionalEvidence: [String]
    },
    
    // Dispute metadata
    networkReasonCode: String,
    externalDisputeId: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Risk Assessment
  risk: {
    score: { type: Number, min: 0, max: 100 },
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    
    // Risk factors
    factors: [{
      type: String, // 'velocity', 'geographic', 'device', 'behavioral'
      severity: String, // 'low', 'medium', 'high'
      description: String
    }],
    
    // Fraud detection
    fraudScore: { type: Number, min: 0, max: 100 },
    fraudIndicators: [String],
    
    // Decision
    decision: {
      type: String,
      enum: ['approve', 'decline', 'review'],
      default: 'approve'
    },
    
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    reviewedAt: Date,
    reviewNotes: String
  },
  
  // Customer Information
  customer: {
    name: String,
    email: String,
    phone: String,
    
    // Billing address
    billing: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    
    // Shipping address (if different)
    shipping: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    
    // Customer verification
    verified: { type: Boolean, default: false },
    verificationMethod: String
  },
  
  // Settlement Information
  settlement: {
    status: {
      type: String,
      enum: ['pending', 'in_transit', 'paid', 'failed'],
      default: 'pending'
    },
    
    expectedDate: Date,
    settledAt: Date,
    
    // Settlement details
    batchId: String,
    settlementId: String,
    
    // Bank account info
    destinationAccount: {
      bankName: String,
      accountLast4: String,
      routingNumber: String
    }
  },
  
  // Compliance and Legal
  compliance: {
    // PCI compliance
    pciCompliant: { type: Boolean, default: true },
    
    // 3D Secure
    threeDSecure: {
      authenticated: { type: Boolean, default: false },
      version: String, // '1.0.2', '2.1.0'
      authenticationFlow: String,
      result: String
    },
    
    // SCA (Strong Customer Authentication)
    sca: {
      required: { type: Boolean, default: false },
      exemption: String, // 'low_value', 'transaction_risk_analysis'
      status: String
    },
    
    // Anti-money laundering
    aml: {
      checked: { type: Boolean, default: false },
      checkedAt: Date,
      status: String, // 'passed', 'flagged', 'requires_review'
      riskLevel: String
    }
  },
  
  // Webhooks and Notifications
  webhooks: [{
    url: String,
    event: String, // 'payment.succeeded', 'payment.failed'
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending'
    },
    
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    lastAttempt: Date,
    nextAttempt: Date,
    
    response: {
      statusCode: Number,
      body: String,
      headers: mongoose.Schema.Types.Mixed
    }
  }],
  
  // Analytics and Tracking
  analytics: {
    // Source tracking
    source: String, // 'website', 'mobile_app', 'api'
    campaign: String,
    medium: String,
    
    // Device information
    device: {
      type: String, // 'desktop', 'mobile', 'tablet'
      os: String,
      browser: String,
      userAgent: String,
      ipAddress: String
    },
    
    // Geographic information
    location: {
      country: String,
      region: String,
      city: String,
      timezone: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    
    // Processing metrics
    processingTime: Number, // milliseconds
    
    // Conversion tracking
    conversionId: String,
    attributionData: mongoose.Schema.Types.Mixed
  },
  
  // Notes and Comments
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
      enum: ['general', 'risk', 'support', 'accounting'],
      default: 'general'
    },
    
    internal: { type: Boolean, default: true }
  }],
  
  // Tags and Labels
  tags: [String],
  
  // Metadata
  metadata: mongoose.Schema.Types.Mixed,
  
  // Timestamps
  attemptedAt: { type: Date, default: Date.now },
  confirmedAt: Date,
  failedAt: Date,
  refundedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
paymentSchema.index({ paymentId: 1 }, { unique: true })
paymentSchema.index({ user: 1, status: 1 })
paymentSchema.index({ subscription: 1, status: 1 })
paymentSchema.index({ status: 1, createdAt: -1 })
paymentSchema.index({ 'processor.name': 1, 'processor.externalId': 1 })
paymentSchema.index({ amount: 1, currency: 1, status: 1 })
paymentSchema.index({ 'settlement.status': 1, 'settlement.expectedDate': 1 })

// Compound indexes
paymentSchema.index({ 
  user: 1, 
  'transaction.type': 1, 
  status: 1, 
  createdAt: -1 
})

// Text search index
paymentSchema.index({ 
  'transaction.description': 'text',
  'transaction.reference': 'text',
  'customer.name': 'text',
  'customer.email': 'text'
})

// Virtual properties
paymentSchema.virtual('totalAmount').get(function() {
  return this.amount + (this.tax?.amount || 0)
})

paymentSchema.virtual('refundedAmount').get(function() {
  return this.refunds.reduce((total, refund) => {
    return refund.status === 'succeeded' ? total + refund.amount : total
  }, 0)
})

paymentSchema.virtual('isRefunded').get(function() {
  return this.status === 'refunded' || this.status === 'partially_refunded'
})

paymentSchema.virtual('isDisputed').get(function() {
  return this.disputes && this.disputes.length > 0
})

paymentSchema.virtual('processingTimeSeconds').get(function() {
  if (!this.analytics?.processingTime) return null
  return this.analytics.processingTime / 1000
})

// Static methods
paymentSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 })
}

paymentSchema.statics.findByUser = function(userId, options = {}) {
  const { status, startDate, endDate, limit = 50 } = options
  
  let query = { user: userId }
  
  if (status) {
    query.status = Array.isArray(status) ? { $in: status } : status
  }
  
  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) query.createdAt.$gte = new Date(startDate)
    if (endDate) query.createdAt.$lte = new Date(endDate)
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('subscription')
}

paymentSchema.statics.getRevenueMetrics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'succeeded',
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalFees: { $sum: '$fees.totalFees' },
        netRevenue: { $sum: '$fees.netAmount' },
        totalTransactions: { $sum: 1 },
        averageTransaction: { $avg: '$amount' },
        
        // Currency breakdown
        currencies: {
          $push: {
            currency: '$currency',
            amount: '$amount'
          }
        }
      }
    }
  ])
}

paymentSchema.statics.findFailedPayments = function(days = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  return this.find({
    status: 'failed',
    createdAt: { $gte: startDate }
  }).populate('user subscription')
}

paymentSchema.statics.findHighRiskPayments = function() {
  return this.find({
    $or: [
      { 'risk.level': { $in: ['high', 'critical'] } },
      { 'risk.score': { $gte: 70 } }
    ],
    status: { $in: ['pending', 'processing'] }
  }).sort({ 'risk.score': -1 })
}

// Instance methods
paymentSchema.methods.addRefund = function(refundData) {
  const refund = {
    refundId: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: refundData.amount,
    currency: refundData.currency || this.currency,
    reason: refundData.reason,
    requestedBy: refundData.requestedBy,
    metadata: refundData.metadata
  }
  
  this.refunds.push(refund)
  
  // Update status if fully refunded
  const totalRefunded = this.refunds.reduce((total, r) => {
    return r.status === 'succeeded' ? total + r.amount : total
  }, refundData.amount)
  
  if (totalRefunded >= this.amount) {
    this.status = 'refunded'
    this.refundedAt = new Date()
  } else if (totalRefunded > 0) {
    this.status = 'partially_refunded'
  }
  
  return this.save()
}

paymentSchema.methods.addDispute = function(disputeData) {
  const dispute = {
    disputeId: disputeData.disputeId || `dp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: disputeData.amount,
    currency: disputeData.currency || this.currency,
    reason: disputeData.reason,
    evidenceDueBy: disputeData.evidenceDueBy,
    networkReasonCode: disputeData.networkReasonCode,
    externalDisputeId: disputeData.externalDisputeId,
    metadata: disputeData.metadata
  }
  
  this.disputes.push(dispute)
  
  // Update payment status
  if (this.status !== 'disputed') {
    this.status = 'disputed'
  }
  
  return this.save()
}

paymentSchema.methods.calculateRiskScore = function() {
  let score = 0
  
  // Amount-based risk
  if (this.amount > 100000) score += 20 // Large transactions
  if (this.amount < 100) score += 10 // Very small transactions
  
  // Geographic risk
  const highRiskCountries = ['NG', 'PH', 'ID', 'BD']
  if (this.analytics?.location?.country && 
      highRiskCountries.includes(this.analytics.location.country)) {
    score += 25
  }
  
  // Payment method risk
  if (this.paymentMethod.type === 'bank_transfer') score += 15
  if (this.paymentMethod.card?.funding === 'prepaid') score += 20
  
  // Historical patterns (simplified)
  // This would typically analyze user's payment history
  
  this.risk.score = Math.min(100, score)
  
  if (score >= 70) {
    this.risk.level = 'critical'
  } else if (score >= 50) {
    this.risk.level = 'high'
  } else if (score >= 30) {
    this.risk.level = 'medium'
  } else {
    this.risk.level = 'low'
  }
  
  return score
}

paymentSchema.methods.processWebhook = function(event, url) {
  const webhook = {
    url,
    event,
    status: 'pending',
    attempts: 0,
    maxAttempts: 5,
    lastAttempt: new Date()
  }
  
  this.webhooks.push(webhook)
  return this.save()
}

paymentSchema.methods.retry = function() {
  if (this.status !== 'failed' || !this.failure.retryable) {
    throw new Error('Payment is not retryable')
  }
  
  if (this.failure.retryCount >= this.failure.maxRetries) {
    throw new Error('Maximum retry attempts reached')
  }
  
  this.failure.retryCount += 1
  this.status = 'pending'
  
  // Calculate next retry time (exponential backoff)
  const backoffMinutes = Math.pow(2, this.failure.retryCount) * 5
  this.failure.nextRetryAt = new Date(Date.now() + (backoffMinutes * 60 * 1000))
  
  return this.save()
}

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  // Generate payment ID if not present
  if (!this.paymentId) {
    this.paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  // Calculate net amount after fees
  if (this.isModified('amount') || this.isModified('fees')) {
    this.fees.netAmount = this.amount - (this.fees.totalFees || 0)
  }
  
  // Update timestamps based on status
  if (this.isModified('status')) {
    if (this.status === 'succeeded' && !this.confirmedAt) {
      this.confirmedAt = new Date()
    } else if (this.status === 'failed' && !this.failedAt) {
      this.failedAt = new Date()
    }
  }
  
  // Calculate risk score for new payments
  if (this.isNew) {
    this.calculateRiskScore()
  }
  
  next()
})

// Post-save middleware
paymentSchema.post('save', function(doc) {
  // Trigger webhook notifications
  if (doc.isModified('status')) {
    // This would typically trigger background job to send webhooks
    console.log(`Payment ${doc.paymentId} status changed to ${doc.status}`)
  }
})

export default mongoose.model('Payment', paymentSchema)