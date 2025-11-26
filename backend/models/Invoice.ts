/**
 * Enhanced Invoice Model
 * Comprehensive billing invoices, line items, and payment tracking
 */

import mongoose from 'mongoose'

const invoiceSchema = new mongoose.Schema({
  // Invoice Identity
  invoiceNumber: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Associated Entities (both new and legacy)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    index: true
  },
  
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  
  // Legacy Stripe fields
  stripeInvoiceId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  
  stripeCustomerId: {
    type: String,
    index: true
  },
  
  // Invoice Status
  status: {
    type: String,
    required: true,
    enum: [
      'draft',
      'open',
      'paid',
      'past_due',
      'canceled',
      'void'
    ],
    default: 'draft',
    index: true
  },
  
  // Invoice Type
  type: {
    type: String,
    required: true,
    enum: ['subscription', 'one_time', 'usage', 'credit_note', 'debit_note'],
    default: 'subscription'
  },
  
  // Basic amount (legacy)
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Legacy fields
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true
  },
  
  tax: {
    amount: { type: Number, default: 0, min: 0 },
    rate: { type: Number, default: 0, min: 0, max: 1 },
    description: String
  },
  
  discount: {
    amount: { type: Number, default: 0, min: 0 },
    percentage: { type: Number, default: 0, min: 0, max: 1 },
    code: String,
    description: String
  },
  
  total: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Billing Information
  billing: {
    periodStart: Date,
    periodEnd: Date,
    
    issueDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    
    dueDate: {
      type: Date,
      required: true
    },
    
    paymentTerms: {
      type: Number,
      default: 30
    },
    
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true
    }
  },
  
  // Customer Information
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: String,
    phone: String,
    
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    
    taxId: String,
    vatNumber: String,
    taxExempt: { type: Boolean, default: false }
  },
  
  // Enhanced Line Items
  lineItems: [{
    description: { type: String, required: true },
    productId: String,
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    
    quantity: { type: Number, default: 1, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    
    discountAmount: { type: Number, default: 0 },
    discountRate: { type: Number, default: 0 },
    
    taxable: { type: Boolean, default: true },
    taxAmount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    
    period: {
      start: Date,
      end: Date
    },
    
    prorated: { type: Boolean, default: false },
    prorationDetails: {
      originalAmount: Number,
      daysUsed: Number,
      totalDays: Number
    },
    
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Totals
  totals: {
    subtotal: { type: Number, required: true, default: 0 },
    discountTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    amountDue: { type: Number, required: true, default: 0 },
    amountPaid: { type: Number, default: 0 },
    amountRemaining: { type: Number, default: 0 }
  },
  
  // Legacy date fields
  dueDate: {
    type: Date,
    index: true
  },
  
  paidAt: {
    type: Date,
    index: true
  },
  
  voidedAt: Date,
  
  // Payment Information
  payments: [{
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    amount: { type: Number, required: true },
    currency: String,
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: String,
    externalId: String,
    reference: String,
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed'],
      default: 'pending'
    }
  }],
  
  // Payment Method (legacy)
  paymentMethod: {
    type: {
      type: String,
      enum: ['card', 'bank_account', 'paypal', 'crypto', 'other']
    },
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  
  // Payment Attempts
  paymentAttempts: [{
    attemptedAt: { type: Date, default: Date.now },
    success: { type: Boolean, required: true },
    errorCode: String,
    errorMessage: String,
    paymentIntentId: String
  }],
  
  // Notes and Metadata
  notes: String,
  internalNotes: String,
  
  metadata: {
    agentId: String,
    agentName: String,
    plan: String,
    source: String,
    campaignId: String
  },
  
  // File Attachments
  attachments: [{
    filename: String,
    path: String,
    size: Number,
    contentType: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
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

// Indexes for performance
invoiceSchema.index({ userId: 1, createdAt: -1 })
invoiceSchema.index({ status: 1, dueDate: 1 })
invoiceSchema.index({ stripeCustomerId: 1, status: 1 })
invoiceSchema.index({ 'metadata.agentId': 1 })
invoiceSchema.index({ amount: -1 })

// Virtual for overdue status
invoiceSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'open' || !this.dueDate) return false
  return new Date() > this.dueDate
})

// Virtual for days overdue
invoiceSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0
  const diffTime = new Date() - this.dueDate
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual for formatted amount
invoiceSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency.toUpperCase()
  }).format(this.amount / 100)
})

// Virtual for payment status
invoiceSchema.virtual('paymentStatus').get(function() {
  if (this.status === 'paid') return 'paid'
  if (this.isOverdue) return 'overdue'
  if (this.status === 'open') return 'pending'
  return this.status
})

// Pre-save middleware
invoiceSchema.pre('save', function(next) {
  // Generate invoice number if not provided
  if (!this.invoiceNumber && this.isNew) {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    this.invoiceNumber = `INV-${year}${month}-${random}`
  }
  
  // Calculate total
  let subtotal = this.lineItems.reduce((sum, item) => sum + item.amount, 0)
  subtotal += this.tax.amount || 0
  subtotal -= this.discount.amount || 0
  this.total = Math.max(0, subtotal)
  
  // Set due date if not provided (default 30 days)
  if (!this.dueDate && this.isNew) {
    this.dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
  
  next()
})

// Static methods
invoiceSchema.statics.findByUser = function(userId, options = {}) {
  return this.find({ userId }, null, options)
    .populate('userId', 'name email')
    .populate('subscriptionId', 'plan agentName')
    .sort({ createdAt: -1 })
}

invoiceSchema.statics.findOverdue = function(options = {}) {
  return this.find({
    status: 'open',
    dueDate: { $lt: new Date() }
  }, null, options)
    .populate('userId', 'name email')
    .sort({ dueDate: 1 })
}

invoiceSchema.statics.getRevenueStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'paid',
        paidAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' },
        invoiceCount: { $sum: 1 },
        averageAmount: { $avg: '$total' }
      }
    }
  ])
}

// Instance methods
invoiceSchema.methods.markPaid = function(paymentDetails = {}) {
  this.status = 'paid'
  this.paidAt = new Date()
  return this.save()
}

  // Communication History
  communications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'call', 'letter'],
      required: true
    },
    
    template: String,
    subject: String,
    content: String,
    sentAt: { type: Date, default: Date.now },
    deliveredAt: Date,
    
    recipient: {
      name: String,
      email: String,
      phone: String
    },
    
    status: {
      type: String,
      enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'],
      default: 'sent'
    }
  }],

  // Notes
  notes: [{
    content: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['general', 'payment', 'collection', 'accounting'],
      default: 'general'
    },
    internal: { type: Boolean, default: true }
  }],

  // Legacy fields
  internalNotes: String,
  tags: [String],
  metadata: mongoose.Schema.Types.Mixed,

  // Timestamps
  finalizedAt: Date,
  sentAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true })
invoiceSchema.index({ user: 1, status: 1 })
invoiceSchema.index({ status: 1, dueDate: 1 })

// Legacy static methods for backward compatibility
invoiceSchema.statics.findByUser = function(userId, options = {}) {
  const { status, limit = 50 } = options
  let query = { $or: [{ user: userId }, { userId: userId }] }
  
  if (status) {
    query.status = status
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
}

invoiceSchema.statics.findOverdue = function() {
  return this.find({
    status: 'open',
    dueDate: { $lt: new Date() }
  }).sort({ dueDate: 1 })
}

// Instance methods
invoiceSchema.methods.calculateTotals = function() {
  this.totals = this.totals || {}
  
  // Calculate from line items if available
  if (this.lineItems && this.lineItems.length > 0) {
    this.totals.subtotal = this.lineItems.reduce((total, item) => {
      return total + (item.amount || 0)
    }, 0)
    
    this.totals.discountTotal = this.lineItems.reduce((total, item) => {
      return total + (item.discountAmount || 0)
    }, 0)
    
    this.totals.taxTotal = this.lineItems.reduce((total, item) => {
      return total + (item.taxAmount || 0)
    }, 0)
  } else {
    // Fallback to legacy fields
    this.totals.subtotal = this.amount || 0
    this.totals.taxTotal = (this.tax && this.tax.amount) || 0
    this.totals.discountTotal = (this.discount && this.discount.amount) || 0
  }
  
  this.totals.total = this.totals.subtotal - this.totals.discountTotal + this.totals.taxTotal
  this.totals.amountDue = this.totals.total - (this.totals.amountPaid || 0)
  
  // Update legacy total field
  this.total = this.totals.total
  
  return this
}

invoiceSchema.methods.addPayment = function(paymentData) {
  if (!this.payments) this.payments = []
  
  this.payments.push({
    amount: paymentData.amount,
    currency: paymentData.currency || this.currency,
    paymentMethod: paymentData.paymentMethod,
    status: 'succeeded'
  })
  
  if (!this.totals) this.totals = {}
  this.totals.amountPaid = (this.totals.amountPaid || 0) + paymentData.amount
  this.totals.amountRemaining = (this.totals.total || this.total) - this.totals.amountPaid
  
  if (this.totals.amountRemaining <= 0) {
    this.status = 'paid'
    this.paidAt = new Date()
  }
  
  return this.save()
}

invoiceSchema.methods.markPaid = function(paymentDetails = {}) {
  this.status = 'paid'
  this.paidAt = new Date()
  
  // Legacy compatibility
  if (paymentDetails.paymentMethod) {
    this.paymentMethod = paymentDetails.paymentMethod
  }
  
  if (this.paymentAttempts) {
    this.paymentAttempts.push({
      success: true,
      paymentIntentId: paymentDetails.paymentIntentId,
      attemptedAt: new Date()
    })
  }
  
  return this.save()
}

invoiceSchema.methods.markFailed = function(errorDetails = {}) {
  if (this.paymentAttempts) {
    this.paymentAttempts.push({
      success: false,
      errorCode: errorDetails.code,
      errorMessage: errorDetails.message,
      paymentIntentId: errorDetails.paymentIntentId,
      attemptedAt: new Date()
    })
  }
  
  return this.save()
}

invoiceSchema.methods.addLineItem = function(item) {
  if (!this.lineItems) this.lineItems = []
  this.lineItems.push(item)
  this.calculateTotals()
  return this.save()
}

invoiceSchema.methods.void = function(reason) {
  this.status = 'void'
  this.voidedAt = new Date()
  if (reason) {
    this.internalNotes = (this.internalNotes || '') + `\nVoided: ${reason}`
  }
  return this.save()
}

// Pre-save middleware
invoiceSchema.pre('save', function(next) {
  // Generate invoice number if not present
  if (!this.invoiceNumber) {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const sequence = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
    
    this.invoiceNumber = `INV-${year}${month}-${sequence}`
  }
  
  // Ensure user field is populated from legacy userId
  if (!this.user && this.userId) {
    this.user = this.userId
  }
  
  // Ensure subscription field is populated from legacy subscriptionId  
  if (!this.subscription && this.subscriptionId) {
    this.subscription = this.subscriptionId
  }
  
  // Set billing dates from legacy fields
  if (!this.billing) {
    this.billing = {
      issueDate: this.createdAt || new Date(),
      dueDate: this.dueDate || new Date(),
      currency: this.currency || 'USD',
      paymentTerms: 30
    }
  }
  
  // Calculate totals if line items changed
  if (this.isModified('lineItems') || this.isModified('amount')) {
    this.calculateTotals()
  }
  
  next()
})

export default mongoose.model('Invoice', invoiceSchema)
}

export default mongoose.model('Invoice', invoiceSchema)