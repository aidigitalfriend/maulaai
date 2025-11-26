/**
 * Transaction Model
 * Comprehensive payment transaction tracking and management
 */

import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  // Basic Information
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // References
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    index: true
  },
  
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    index: true
  },
  
  // Payment Provider Integration
  stripePaymentIntentId: {
    type: String,
    index: true,
    sparse: true
  },
  
  stripeChargeId: {
    type: String,
    index: true,
    sparse: true
  },
  
  stripeCustomerId: {
    type: String,
    index: true
  },
  
  // Transaction Details
  type: {
    type: String,
    enum: ['payment', 'refund', 'chargeback', 'adjustment', 'fee', 'credit'],
    required: true,
    index: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'succeeded', 'failed', 'cancelled', 'disputed'],
    required: true,
    default: 'pending',
    index: true
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    required: true,
    default: 'usd',
    uppercase: true
  },
  
  netAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  fees: {
    processing: { type: Number, default: 0, min: 0 },
    platform: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    other: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 }
  },
  
  // Payment Method Information
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'bank_account', 'paypal', 'apple_pay', 'google_pay', 'crypto', 'wire', 'ach', 'other'],
      required: true
    },
    
    // Card details (if applicable)
    card: {
      last4: String,
      brand: String,
      expiryMonth: Number,
      expiryYear: Number,
      country: String,
      funding: String
    },
    
    // Bank details (if applicable)
    bankAccount: {
      last4: String,
      routingNumber: String,
      bankName: String,
      accountType: String
    },
    
    // Digital wallet details
    wallet: {
      type: String, // apple_pay, google_pay, etc.
      email: String
    }
  },
  
  // Transaction Metadata
  description: {
    type: String,
    required: true
  },
  
  reference: String, // Internal reference number
  
  metadata: {
    agentId: String,
    agentName: String,
    plan: String,
    source: String,
    campaignId: String,
    ipAddress: String,
    userAgent: String,
    sessionId: String
  },
  
  // Risk and Security
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'blocked'],
    default: 'low',
    index: true
  },
  
  riskScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  fraudFlags: [{
    type: String,
    reason: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    detectedAt: { type: Date, default: Date.now }
  }],
  
  // Processing Information
  processedAt: Date,
  settledAt: Date,
  
  processingTime: Number, // in milliseconds
  
  gateway: {
    name: String,
    transactionId: String,
    responseCode: String,
    responseMessage: String,
    authCode: String,
    avsResult: String,
    cvvResult: String
  },
  
  // Dispute and Chargeback Information
  dispute: {
    id: String,
    reason: String,
    status: String,
    amount: Number,
    evidence: [{
      type: String,
      description: String,
      filename: String,
      uploadedAt: Date
    }],
    dueDate: Date,
    createdAt: Date
  },
  
  // Refund Information
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    status: String,
    processedAt: Date,
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Error Information
  errors: [{
    code: String,
    message: String,
    details: mongoose.Schema.Types.Mixed,
    occurredAt: { type: Date, default: Date.now }
  }],
  
  // Billing Address
  billingAddress: {
    name: String,
    email: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  
  // Reconciliation
  reconciled: {
    type: Boolean,
    default: false,
    index: true
  },
  
  reconciledAt: Date,
  
  batchId: String, // For batch processing
  
  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance and queries
transactionSchema.index({ userId: 1, createdAt: -1 })
transactionSchema.index({ type: 1, status: 1 })
transactionSchema.index({ stripeCustomerId: 1, createdAt: -1 })
transactionSchema.index({ 'metadata.agentId': 1 })
transactionSchema.index({ amount: -1 })
transactionSchema.index({ processedAt: -1 })
transactionSchema.index({ riskLevel: 1 })
transactionSchema.index({ reconciled: 1, processedAt: -1 })

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency.toUpperCase()
  }).format(this.amount / 100)
})

// Virtual for success rate
transactionSchema.virtual('isSuccessful').get(function() {
  return this.status === 'succeeded'
})

// Virtual for processing duration
transactionSchema.virtual('processingDuration').get(function() {
  if (!this.processedAt || !this.createdAt) return null
  return this.processedAt - this.createdAt
})

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  // Generate transaction ID if not provided
  if (!this.transactionId && this.isNew) {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    this.transactionId = `txn_${timestamp}_${random}`.toUpperCase()
  }
  
  // Calculate total fees
  const feeTypes = ['processing', 'platform', 'tax', 'other']
  this.fees.total = feeTypes.reduce((total, type) => total + (this.fees[type] || 0), 0)
  
  // Calculate net amount
  this.netAmount = this.amount - this.fees.total
  
  // Set processed timestamp for succeeded transactions
  if (this.status === 'succeeded' && !this.processedAt) {
    this.processedAt = new Date()
  }
  
  next()
})

// Static methods
transactionSchema.statics.findByUser = function(userId, options = {}) {
  return this.find({ userId }, null, options)
    .populate('userId', 'name email')
    .populate('invoiceId', 'invoiceNumber amount')
    .sort({ createdAt: -1 })
}

transactionSchema.statics.getRevenueStats = function(startDate, endDate, filters = {}) {
  const matchCondition = {
    status: 'succeeded',
    processedAt: { $gte: startDate, $lte: endDate },
    ...filters
  }
  
  return this.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$netAmount' },
        totalFees: { $sum: '$fees.total' },
        transactionCount: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    }
  ])
}

transactionSchema.statics.getFraudStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        $or: [
          { riskLevel: { $in: ['high', 'blocked'] } },
          { 'fraudFlags.0': { $exists: true } },
          { 'dispute.id': { $exists: true } }
        ]
      }
    },
    {
      $group: {
        _id: '$riskLevel',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ])
}

// Instance methods
transactionSchema.methods.addFraudFlag = function(flag) {
  this.fraudFlags.push({
    type: flag.type,
    reason: flag.reason,
    severity: flag.severity || 'medium'
  })
  
  // Auto-adjust risk level based on flags
  const criticalFlags = this.fraudFlags.filter(f => f.severity === 'critical')
  const highFlags = this.fraudFlags.filter(f => f.severity === 'high')
  
  if (criticalFlags.length > 0) {
    this.riskLevel = 'blocked'
  } else if (highFlags.length > 0) {
    this.riskLevel = 'high'
  } else if (this.fraudFlags.length > 2) {
    this.riskLevel = 'medium'
  }
  
  return this.save()
}

transactionSchema.methods.processRefund = function(amount, reason) {
  const refund = {
    refundId: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    amount: amount || this.amount,
    reason: reason || 'Customer request',
    status: 'pending',
    processedAt: new Date()
  }
  
  this.refunds.push(refund)
  return this.save()
}

transactionSchema.methods.markReconciled = function(batchId) {
  this.reconciled = true
  this.reconciledAt = new Date()
  if (batchId) this.batchId = batchId
  return this.save()
}

transactionSchema.methods.addError = function(error) {
  this.errors.push({
    code: error.code,
    message: error.message,
    details: error.details
  })
  return this.save()
}

export default mongoose.model('Transaction', transactionSchema)