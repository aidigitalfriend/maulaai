/**
 * Payment Method Model
 * Secure payment method storage and management
 */

import mongoose from 'mongoose'
import crypto from 'crypto'

const paymentMethodSchema = new mongoose.Schema({
  // Basic Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Payment Method Details
  type: {
    type: String,
    enum: ['card', 'bank_account', 'digital_wallet', 'crypto', 'paypal', 'apple_pay', 'google_pay', 'stripe_payment_method'],
    required: true
  },
  
  provider: {
    type: String,
    enum: ['stripe', 'paypal', 'square', 'braintree', 'adyen', 'razorpay'],
    required: true,
    default: 'stripe'
  },
  
  // External Provider IDs
  externalIds: {
    stripePaymentMethodId: String,
    stripeCustomerId: String,
    paypalAccountId: String,
    providerSpecificId: String
  },
  
  // Card Information (for card types)
  card: {
    // Display Information (safe to store)
    brand: {
      type: String,
      enum: ['visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay', 'unknown']
    },
    
    last4: {
      type: String,
      maxlength: 4,
      match: /^\d{4}$/
    },
    
    expiryMonth: {
      type: Number,
      min: 1,
      max: 12
    },
    
    expiryYear: {
      type: Number,
      min: 2020,
      max: 2050
    },
    
    // Security Features
    funding: {
      type: String,
      enum: ['credit', 'debit', 'prepaid', 'unknown']
    },
    
    country: String,
    
    // 3D Secure
    threeDSecure: {
      supported: Boolean,
      required: Boolean
    },
    
    // Card Checks
    checks: {
      cvcCheck: {
        type: String,
        enum: ['pass', 'fail', 'unavailable', 'unchecked']
      },
      addressLine1Check: {
        type: String,
        enum: ['pass', 'fail', 'unavailable', 'unchecked']
      },
      postalCodeCheck: {
        type: String,
        enum: ['pass', 'fail', 'unavailable', 'unchecked']
      }
    }
  },
  
  // Bank Account Information
  bankAccount: {
    accountType: {
      type: String,
      enum: ['checking', 'savings']
    },
    
    bankName: String,
    
    // Only store last 4 digits
    last4: {
      type: String,
      maxlength: 4,
      match: /^\d{4}$/
    },
    
    routingNumber: String, // Encrypted
    country: String,
    currency: String,
    
    // Verification Status
    verified: {
      type: Boolean,
      default: false
    },
    
    verificationMethod: {
      type: String,
      enum: ['microdeposits', 'instant', 'manual']
    },
    
    verifiedAt: Date
  },
  
  // Digital Wallet Information
  digitalWallet: {
    walletType: {
      type: String,
      enum: ['apple_pay', 'google_pay', 'samsung_pay', 'paypal', 'venmo', 'cashapp']
    },
    
    walletId: String, // Encrypted
    email: String, // For PayPal, etc.
    phoneNumber: String // For mobile wallets
  },
  
  // Cryptocurrency Information
  crypto: {
    currency: {
      type: String,
      enum: ['bitcoin', 'ethereum', 'litecoin', 'dogecoin', 'usdc', 'usdt']
    },
    
    network: String, // mainnet, testnet, etc.
    walletAddress: String, // Public address only
    
    // Wallet Provider
    provider: {
      type: String,
      enum: ['metamask', 'coinbase', 'binance', 'kraken', 'custom']
    }
  },
  
  // Billing Address
  billingAddress: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    
    // Address Verification
    verified: {
      type: Boolean,
      default: false
    }
  },
  
  // Status and Settings
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'invalid', 'requires_action', 'pending_verification'],
    default: 'pending_verification',
    index: true
  },
  
  // Default payment method for user
  isDefault: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Usage Tracking
  usage: {
    totalTransactions: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    successfulTransactions: { type: Number, default: 0 },
    failedTransactions: { type: Number, default: 0 },
    
    lastUsedAt: Date,
    firstUsedAt: Date,
    
    // Fraud indicators
    riskScore: { type: Number, min: 0, max: 100, default: 0 },
    
    // Performance metrics
    averageTransactionAmount: Number,
    successRate: { type: Number, min: 0, max: 1 }
  },
  
  // Security and Compliance
  security: {
    // Tokenization
    tokenized: {
      type: Boolean,
      default: true
    },
    
    // PCI DSS Compliance
    pciCompliant: {
      type: Boolean,
      default: true
    },
    
    // Encryption status
    encrypted: {
      type: Boolean,
      default: true
    },
    
    // Security alerts
    alerts: [{
      type: String,
      message: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      createdAt: { type: Date, default: Date.now },
      resolved: { type: Boolean, default: false }
    }],
    
    // Fraud detection
    fraudScore: { type: Number, min: 0, max: 100, default: 0 },
    flaggedForReview: { type: Boolean, default: false }
  },
  
  // Verification and KYC
  verification: {
    status: {
      type: String,
      enum: ['not_required', 'pending', 'in_progress', 'verified', 'failed', 'expired'],
      default: 'not_required'
    },
    
    method: String,
    verifiedAt: Date,
    expiresAt: Date,
    
    documents: [{
      type: String,
      url: String,
      status: String,
      uploadedAt: Date
    }],
    
    // ID verification for high-value transactions
    idVerification: {
      required: Boolean,
      completed: Boolean,
      provider: String,
      referenceId: String
    }
  },
  
  // Integration Settings
  integration: {
    // Webhook settings
    webhookUrl: String,
    webhookEvents: [String],
    
    // API settings
    apiVersion: String,
    
    // Custom metadata for integrations
    metadata: mongoose.Schema.Types.Mixed,
    
    // External system references
    externalReferences: [{
      system: String,
      id: String,
      type: String
    }]
  },
  
  // Compliance and Legal
  compliance: {
    // Regulatory requirements
    kycRequired: { type: Boolean, default: false },
    amlChecked: { type: Boolean, default: false },
    
    // Geographic restrictions
    allowedCountries: [String],
    restrictedCountries: [String],
    
    // Legal agreements
    termsAccepted: {
      version: String,
      acceptedAt: Date,
      ipAddress: String
    },
    
    // Data retention
    retentionPolicy: {
      deleteAfter: Number, // days
      archiveAfter: Number // days
    }
  },
  
  // Notifications and Alerts
  notifications: {
    // Transaction notifications
    transactionAlerts: { type: Boolean, default: true },
    
    // Security notifications
    securityAlerts: { type: Boolean, default: true },
    
    // Expiration reminders
    expirationReminders: { type: Boolean, default: true },
    
    // Failed payment notifications
    failureAlerts: { type: Boolean, default: true },
    
    // Notification preferences
    channels: [{
      type: { type: String, enum: ['email', 'sms', 'push', 'webhook'] },
      enabled: { type: Boolean, default: true },
      address: String
    }]
  },
  
  // Audit Trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'verified', 'used', 'failed', 'suspended', 'deleted']
    },
    
    details: mongoose.Schema.Types.Mixed,
    
    // Actor information
    actor: {
      type: { type: String, enum: ['user', 'system', 'admin'] },
      id: mongoose.Schema.Types.ObjectId,
      name: String,
      ipAddress: String,
      userAgent: String
    },
    
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Soft Delete
  deletedAt: Date,
  deletedBy: mongoose.Schema.Types.ObjectId,
  deleteReason: String
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: function(doc, ret) {
    // Remove sensitive fields from JSON output
    delete ret.bankAccount?.routingNumber
    delete ret.digitalWallet?.walletId
    delete ret.security?.alerts
    return ret
  }},
  toObject: { virtuals: true }
})

// Indexes for performance
paymentMethodSchema.index({ userId: 1, isDefault: -1 })
paymentMethodSchema.index({ userId: 1, status: 1 })
paymentMethodSchema.index({ 'externalIds.stripePaymentMethodId': 1 })
paymentMethodSchema.index({ status: 1, createdAt: -1 })
paymentMethodSchema.index({ type: 1, provider: 1 })
paymentMethodSchema.index({ deletedAt: 1 })

// Compound index for user's default payment method
paymentMethodSchema.index({ userId: 1, isDefault: 1, status: 1 })

// Virtual for is expired
paymentMethodSchema.virtual('isExpired').get(function() {
  if (!this.card?.expiryMonth || !this.card?.expiryYear) return false
  
  const now = new Date()
  const expiry = new Date(this.card.expiryYear, this.card.expiryMonth - 1)
  
  return expiry < now
})

// Virtual for display name
paymentMethodSchema.virtual('displayName').get(function() {
  switch (this.type) {
    case 'card':
      return `${this.card?.brand?.toUpperCase() || 'Card'} ending in ${this.card?.last4 || '****'}`
    case 'bank_account':
      return `${this.bankAccount?.bankName || 'Bank'} ending in ${this.bankAccount?.last4 || '****'}`
    case 'digital_wallet':
      return `${this.digitalWallet?.walletType?.replace('_', ' ').toUpperCase() || 'Digital Wallet'}`
    case 'crypto':
      return `${this.crypto?.currency?.toUpperCase() || 'Crypto'} Wallet`
    default:
      return 'Payment Method'
  }
})

// Virtual for risk level
paymentMethodSchema.virtual('riskLevel').get(function() {
  const score = this.security?.fraudScore || 0
  if (score >= 75) return 'high'
  if (score >= 50) return 'medium'
  if (score >= 25) return 'low'
  return 'minimal'
})

// Static methods
paymentMethodSchema.statics.findActiveByUser = function(userId) {
  return this.find({ 
    userId, 
    status: 'active',
    deletedAt: { $exists: false }
  }).sort({ isDefault: -1, createdAt: -1 })
}

paymentMethodSchema.statics.getDefaultByUser = function(userId) {
  return this.findOne({ 
    userId, 
    isDefault: true,
    status: 'active',
    deletedAt: { $exists: false }
  })
}

paymentMethodSchema.statics.findByProvider = function(provider, providerPaymentMethodId) {
  const query = { provider }
  
  switch (provider) {
    case 'stripe':
      query['externalIds.stripePaymentMethodId'] = providerPaymentMethodId
      break
    case 'paypal':
      query['externalIds.paypalAccountId'] = providerPaymentMethodId
      break
    default:
      query['externalIds.providerSpecificId'] = providerPaymentMethodId
  }
  
  return this.findOne(query)
}

paymentMethodSchema.statics.getUsageStats = function(timeframe = 30) {
  const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000)
  
  return this.aggregate([
    {
      $match: {
        'usage.lastUsedAt': { $gte: startDate },
        deletedAt: { $exists: false }
      }
    },
    {
      $group: {
        _id: {
          type: '$type',
          provider: '$provider'
        },
        count: { $sum: 1 },
        totalTransactions: { $sum: '$usage.totalTransactions' },
        totalAmount: { $sum: '$usage.totalAmount' },
        averageSuccessRate: { $avg: '$usage.successRate' }
      }
    },
    { $sort: { totalTransactions: -1 } }
  ])
}

// Instance methods
paymentMethodSchema.methods.setAsDefault = async function() {
  // Remove default from other payment methods for this user
  await this.constructor.updateMany(
    { 
      userId: this.userId, 
      _id: { $ne: this._id },
      deletedAt: { $exists: false }
    },
    { $set: { isDefault: false } }
  )
  
  // Set this as default
  this.isDefault = true
  this.addAuditEntry('updated', { action: 'set_as_default' })
  
  return this.save()
}

paymentMethodSchema.methods.updateUsage = function(transactionAmount, success = true) {
  this.usage.totalTransactions += 1
  this.usage.totalAmount += transactionAmount
  
  if (success) {
    this.usage.successfulTransactions += 1
  } else {
    this.usage.failedTransactions += 1
  }
  
  // Update success rate
  this.usage.successRate = this.usage.successfulTransactions / this.usage.totalTransactions
  
  // Update average transaction amount
  this.usage.averageTransactionAmount = this.usage.totalAmount / this.usage.totalTransactions
  
  // Update last used timestamp
  this.usage.lastUsedAt = new Date()
  
  if (!this.usage.firstUsedAt) {
    this.usage.firstUsedAt = new Date()
  }
  
  this.addAuditEntry('used', { amount: transactionAmount, success })
  
  return this.save()
}

paymentMethodSchema.methods.verify = function(method = 'automatic', details = {}) {
  this.verification.status = 'verified'
  this.verification.method = method
  this.verification.verifiedAt = new Date()
  this.status = 'active'
  
  this.addAuditEntry('verified', { method, details })
  
  return this.save()
}

paymentMethodSchema.methods.flagForReview = function(reason, riskScore = null) {
  this.security.flaggedForReview = true
  
  if (riskScore !== null) {
    this.security.fraudScore = riskScore
  }
  
  this.security.alerts.push({
    type: 'fraud_alert',
    message: reason,
    severity: 'high'
  })
  
  this.status = 'requires_action'
  this.addAuditEntry('flagged', { reason, riskScore })
  
  return this.save()
}

paymentMethodSchema.methods.addAuditEntry = function(action, details = {}, actor = {}) {
  this.auditTrail.push({
    action,
    details,
    actor: {
      type: actor.type || 'system',
      id: actor.id,
      name: actor.name,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent
    }
  })
}

paymentMethodSchema.methods.softDelete = function(reason, deletedBy = null) {
  this.deletedAt = new Date()
  this.deletedBy = deletedBy
  this.deleteReason = reason
  this.status = 'inactive'
  
  this.addAuditEntry('deleted', { reason }, { 
    type: deletedBy ? 'user' : 'system', 
    id: deletedBy 
  })
  
  return this.save()
}

paymentMethodSchema.methods.updateFraudScore = function(newScore, factors = []) {
  const oldScore = this.security.fraudScore
  this.security.fraudScore = Math.max(0, Math.min(100, newScore))
  
  // Auto-flag if score is too high
  if (newScore >= 75 && !this.security.flaggedForReview) {
    this.flagForReview('High fraud score detected', newScore)
  }
  
  this.addAuditEntry('fraud_score_updated', {
    oldScore,
    newScore,
    factors
  })
  
  return this.save()
}

// Pre-save middleware
paymentMethodSchema.pre('save', function(next) {
  // Ensure only one default payment method per user
  if (this.isDefault && this.isModified('isDefault')) {
    this.constructor.updateMany(
      { 
        userId: this.userId, 
        _id: { $ne: this._id },
        deletedAt: { $exists: false }
      },
      { $set: { isDefault: false } }
    ).exec()
  }
  
  // Update security score based on various factors
  if (this.isNew || this.isModified(['card.checks', 'verification.status', 'usage'])) {
    this.calculateSecurityScore()
  }
  
  next()
})

// Security score calculation
paymentMethodSchema.methods.calculateSecurityScore = function() {
  let score = 0
  
  // Card verification checks
  if (this.type === 'card' && this.card?.checks) {
    if (this.card.checks.cvcCheck === 'pass') score += 20
    if (this.card.checks.addressLine1Check === 'pass') score += 15
    if (this.card.checks.postalCodeCheck === 'pass') score += 15
  }
  
  // Verification status
  if (this.verification?.status === 'verified') score += 25
  
  // Usage history
  if (this.usage?.successRate > 0.9) score += 15
  if (this.usage?.totalTransactions > 10) score += 10
  
  // Invert score for fraud calculation (high security = low fraud)
  this.security.fraudScore = Math.max(0, 100 - score)
}

export default mongoose.model('PaymentMethod', paymentMethodSchema)