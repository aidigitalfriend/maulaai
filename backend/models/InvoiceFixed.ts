/**
 * Invoice Model - Clean billing and invoice management system
 */

import mongoose from 'mongoose'

const invoiceSchema = new mongoose.Schema({
  // Invoice Identity
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Associated entities
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  
  billing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Billing'
  },
  
  // Invoice Status
  status: {
    type: String,
    required: true,
    enum: ['draft', 'sent', 'viewed', 'paid', 'overdue', 'disputed', 'cancelled', 'refunded'],
    default: 'draft',
    index: true
  },
  
  // Financial Details
  financial: {
    // Line items
    lineItems: [{
      description: { type: String, required: true },
      quantity: { type: Number, default: 1, min: 0 },
      unitPrice: { type: Number, required: true },
      amount: { type: Number, required: true },
      
      // Item categorization
      type: {
        type: String,
        enum: ['subscription', 'usage', 'setup', 'addon', 'discount', 'tax', 'credit'],
        required: true
      },
      
      // Period coverage
      periodStart: Date,
      periodEnd: Date,
      
      // Associated plan/addon
      planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
      addonId: String,
      
      // Tax details
      taxable: { type: Boolean, default: true },
      taxRate: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      
      metadata: mongoose.Schema.Types.Mixed
    }],
    
    // Financial totals
    subtotal: { type: Number, required: true, default: 0 },
    discountTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 },
    amountDue: { type: Number, required: true, default: 0 },
    amountPaid: { type: Number, default: 0 },
    
    // Currency
    currency: { type: String, required: true, default: 'USD' }
  },
  
  // Dates and periods
  dates: {
    issueDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true, index: true },
    paidDate: Date,
    
    // Service period
    serviceStart: Date,
    serviceEnd: Date
  },
  
  // Customer information (denormalized for historical accuracy)
  customer: {
    name: String,
    email: String,
    company: String,
    
    // Billing address
    billingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    
    // Tax information
    taxId: String,
    vatNumber: String
  },
  
  // Payment tracking
  payments: [{
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    amount: { type: Number, required: true },
    method: String,
    processor: String,
    transactionId: String,
    paidAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      required: true
    }
  }],
  
  // Dunning management
  dunning: {
    stage: {
      type: String,
      enum: ['none', 'reminder', 'warning', 'final', 'collection'],
      default: 'none'
    },
    
    attempts: [{
      type: { type: String, enum: ['email', 'sms', 'call', 'letter'] },
      sentAt: Date,
      template: String,
      response: String
    }],
    
    nextAction: Date,
    escalationLevel: { type: Number, default: 0 }
  },
  
  // Metadata
  metadata: mongoose.Schema.Types.Mixed,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true })
invoiceSchema.index({ user: 1, status: 1 })
invoiceSchema.index({ 'dates.dueDate': 1, status: 1 })

// Virtual properties
invoiceSchema.virtual('isOverdue').get(function() {
  return this.status !== 'paid' && this.dates.dueDate && new Date() > this.dates.dueDate
})

invoiceSchema.virtual('remainingBalance').get(function() {
  return this.financial.amountDue - this.financial.amountPaid
})

// Static methods
invoiceSchema.statics.findOverdueInvoices = function() {
  return this.find({
    status: { $in: ['sent', 'viewed', 'overdue'] },
    'dates.dueDate': { $lt: new Date() }
  })
}

// Instance methods
invoiceSchema.methods.markAsPaid = function(paymentId, amount) {
  this.financial.amountPaid += amount
  
  this.payments.push({
    paymentId,
    amount,
    paidAt: new Date(),
    status: 'completed'
  })
  
  if (this.financial.amountPaid >= this.financial.amountDue) {
    this.status = 'paid'
    this.dates.paidDate = new Date()
  }
  
  return this.save()
}

invoiceSchema.methods.addLineItem = function(item) {
  this.financial.lineItems.push(item)
  
  // Recalculate totals
  this.financial.subtotal = this.financial.lineItems
    .filter(item => item.type !== 'discount' && item.type !== 'tax')
    .reduce((sum, item) => sum + item.amount, 0)
  
  this.financial.discountTotal = this.financial.lineItems
    .filter(item => item.type === 'discount')
    .reduce((sum, item) => sum + Math.abs(item.amount), 0)
  
  this.financial.taxTotal = this.financial.lineItems
    .filter(item => item.type === 'tax')
    .reduce((sum, item) => sum + item.amount, 0)
  
  this.financial.total = this.financial.subtotal - this.financial.discountTotal + this.financial.taxTotal
  this.financial.amountDue = this.financial.total
  
  return this.save()
}

// Pre-save middleware
invoiceSchema.pre('save', function(next) {
  // Generate invoice number if not exists
  if (!this.invoiceNumber) {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    this.invoiceNumber = `INV-${timestamp}${random}`
  }
  
  next()
})

export default mongoose.model('Invoice', invoiceSchema)