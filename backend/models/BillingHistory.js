import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// BILLING HISTORY MODEL
// ============================================
const billingHistorySchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Invoice Information
    invoice: {
      invoiceId: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },
      invoiceNumber: {
        type: String,
        required: true,
      },
      externalInvoiceId: {
        type: String, // Stripe, PayPal, etc. invoice ID
      },
      currency: {
        type: String,
        required: true,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'],
      },
      exchangeRate: {
        type: Number,
        default: 1.0,
      },
    },

    // Billing Period
    billingPeriod: {
      start: {
        type: Date,
        required: true,
        index: true,
      },
      end: {
        type: Date,
        required: true,
        index: true,
      },
      daysInPeriod: {
        type: Number,
        required: true,
      },
      isProrated: {
        type: Boolean,
        default: false,
      },
      proratedDays: {
        type: Number,
        default: 0,
      },
    },

    // Subscription Details
    subscription: {
      subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
      },
      planId: {
        type: String,
        required: true,
      },
      planName: {
        type: String,
        required: true,
      },
      planType: {
        type: String,
        enum: ['free', 'basic', 'premium', 'enterprise', 'custom'],
        required: true,
      },
      planVersion: {
        type: String,
        default: '1.0',
      },
    },

    // Line Items
    lineItems: [
      {
        itemId: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: [
            'subscription',
            'usage',
            'addon',
            'one_time',
            'discount',
            'tax',
            'refund',
            'adjustment',
          ],
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        category: {
          type: String,
          enum: [
            'base_plan',
            'conversations',
            'messages',
            'api_calls',
            'storage',
            'tokens',
            'features',
            'support',
            'other',
          ],
        },

        // Pricing
        quantity: {
          type: Number,
          default: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        totalPrice: {
          type: Number,
          required: true,
        },
        currency: {
          type: String,
          required: true,
        },

        // Usage Details (for usage-based items)
        usage: {
          included: { type: Number, default: 0 },
          used: { type: Number, default: 0 },
          overage: { type: Number, default: 0 },
          unit: String, // 'messages', 'api_calls', 'GB', etc.
          ratePerUnit: Number,
        },

        // Time period for this item
        period: {
          start: Date,
          end: Date,
        },

        // Discounts applied
        discounts: [
          {
            discountId: String,
            discountName: String,
            discountType: {
              type: String,
              enum: ['percentage', 'fixed_amount', 'usage_credit'],
            },
            amount: Number,
            percentage: Number,
          },
        ],

        // Metadata
        metadata: {
          type: Map,
          of: String,
        },
      },
    ],

    // Totals
    totals: {
      subtotal: {
        type: Number,
        required: true,
      },
      discountAmount: {
        type: Number,
        default: 0,
      },
      taxAmount: {
        type: Number,
        default: 0,
      },
      creditAmount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
      amountPaid: {
        type: Number,
        default: 0,
      },
      amountDue: {
        type: Number,
        default: 0,
      },
      amountRefunded: {
        type: Number,
        default: 0,
      },
    },

    // Tax Information
    tax: {
      taxRate: {
        type: Number,
        default: 0,
      },
      taxRegion: String,
      taxId: String,
      exemptionReason: String,
      breakdown: [
        {
          taxName: String,
          taxRate: Number,
          taxAmount: Number,
          jurisdiction: String,
        },
      ],
    },

    // Payment Information
    payment: {
      status: {
        type: String,
        enum: [
          'pending',
          'processing',
          'paid',
          'failed',
          'refunded',
          'partially_refunded',
          'disputed',
        ],
        required: true,
        default: 'pending',
        index: true,
      },
      method: {
        type: String,
        enum: [
          'credit_card',
          'debit_card',
          'paypal',
          'bank_transfer',
          'crypto',
          'credit',
          'other',
        ],
      },
      paymentDate: Date,
      dueDate: {
        type: Date,
        required: true,
        index: true,
      },
      paidDate: Date,

      // Payment attempts
      attempts: [
        {
          attemptId: String,
          attemptDate: Date,
          status: String,
          amount: Number,
          failureReason: String,
          paymentMethodId: String,
          transactionId: String,
        },
      ],

      // Final payment details
      transactionId: String,
      paymentMethodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaymentMethod',
      },
      processorResponse: {
        type: Map,
        of: String,
      },
    },

    // Credits and Adjustments
    credits: [
      {
        creditId: String,
        type: {
          type: String,
          enum: [
            'promotional',
            'refund',
            'adjustment',
            'loyalty',
            'compensation',
          ],
        },
        description: String,
        amount: Number,
        appliedDate: Date,
        expiryDate: Date,
        referenceId: String,
      },
    ],

    // Refunds
    refunds: [
      {
        refundId: String,
        amount: Number,
        reason: String,
        status: {
          type: String,
          enum: ['pending', 'processed', 'failed', 'cancelled'],
        },
        requestedDate: Date,
        processedDate: Date,
        transactionId: String,
        notes: String,
      },
    ],

    // Disputes
    disputes: [
      {
        disputeId: String,
        amount: Number,
        reason: String,
        status: {
          type: String,
          enum: ['pending', 'under_review', 'won', 'lost', 'accepted'],
        },
        filedDate: Date,
        resolvedDate: Date,
        notes: String,
        evidence: [
          {
            type: String,
            url: String,
            uploadedDate: Date,
          },
        ],
      },
    ],

    // Usage Summary for this billing period
    usageSummary: {
      conversations: {
        included: Number,
        used: Number,
        overage: Number,
        cost: Number,
      },
      messages: {
        included: Number,
        used: Number,
        overage: Number,
        cost: Number,
      },
      apiCalls: {
        included: Number,
        used: Number,
        overage: Number,
        cost: Number,
      },
      tokens: {
        included: Number,
        used: Number,
        overage: Number,
        cost: Number,
      },
      storage: {
        included: Number, // in GB
        used: Number,
        overage: Number,
        cost: Number,
      },
      features: [
        {
          featureName: String,
          included: Boolean,
          used: Number,
          cost: Number,
        },
      ],
    },

    // Customer Information (snapshot at time of billing)
    customer: {
      email: String,
      name: String,
      company: String,
      address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
      },
      vatNumber: String,
      taxId: String,
    },

    // Invoice Generation
    generation: {
      generatedDate: {
        type: Date,
        default: Date.now,
      },
      generatedBy: {
        type: String,
        enum: ['system', 'admin', 'user', 'api'],
        default: 'system',
      },
      template: String,
      language: String,
      timezone: String,
      format: {
        type: String,
        enum: ['pdf', 'html', 'json'],
        default: 'pdf',
      },
    },

    // Communication
    communications: [
      {
        type: {
          type: String,
          enum: [
            'invoice_sent',
            'payment_reminder',
            'payment_failed',
            'payment_success',
            'refund_processed',
          ],
        },
        channel: {
          type: String,
          enum: ['email', 'sms', 'in_app', 'webhook'],
        },
        sentDate: Date,
        status: String,
        messageId: String,
        recipient: String,
      },
    ],

    // Analytics and Reporting
    analytics: {
      paymentLatency: Number, // days from due date to paid date
      collectionAttempts: Number,
      customerLifetimeValue: Number,
      churnRisk: {
        score: Number,
        factors: [String],
      },
      revenueRecognition: {
        recognized: Number,
        deferred: Number,
        recognitionDate: Date,
      },
    },

    // Audit Trail
    auditTrail: [
      {
        action: String,
        performedBy: {
          userId: mongoose.Schema.Types.ObjectId,
          userEmail: String,
          userRole: String,
        },
        timestamp: Date,
        changes: {
          type: Map,
          of: String,
        },
        reason: String,
        ipAddress: String,
      },
    ],

    // Integration Data
    integrations: {
      accounting: {
        exported: Boolean,
        exportDate: Date,
        referenceId: String,
        system: String, // 'quickbooks', 'xero', etc.
      },
      crm: {
        synced: Boolean,
        syncDate: Date,
        referenceId: String,
        system: String,
      },
    },

    // Metadata
    metadata: {
      type: Map,
      of: String,
    },

    // Status and Flags
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'],
      required: true,
      default: 'draft',
      index: true,
    },

    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },

    tags: [String],
  },
  {
    timestamps: true,
    collection: 'billinghistory',
  }
);

// Compound indexes for performance
billingHistorySchema.index({ userId: 1, 'billingPeriod.start': -1 });
billingHistorySchema.index({ userId: 1, status: 1, 'payment.dueDate': 1 });
billingHistorySchema.index({ 'invoice.invoiceId': 1 }, { unique: true });
billingHistorySchema.index({
  'subscription.subscriptionId': 1,
  'billingPeriod.start': -1,
});

// Single field indexes
billingHistorySchema.index({ userId: 1 });
billingHistorySchema.index({ status: 1 });
billingHistorySchema.index({ 'payment.status': 1 });
billingHistorySchema.index({ 'payment.dueDate': 1 });
billingHistorySchema.index({ 'billingPeriod.start': -1 });

// Static method to get billing history for user
billingHistorySchema.statics.getHistoryForUser = async function (
  userId,
  options = {}
) {
  const {
    startDate,
    endDate,
    status,
    limit = 50,
    skip = 0,
    sort = { 'billingPeriod.start': -1 },
  } = options;

  const query = { userId };

  if (startDate || endDate) {
    query['billingPeriod.start'] = {};
    if (startDate) query['billingPeriod.start'].$gte = startDate;
    if (endDate) query['billingPeriod.start'].$lte = endDate;
  }

  if (status) {
    query.status = status;
  }

  return this.find(query)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('subscription.subscriptionId')
    .populate('payment.paymentMethodId');
};

// Static method to get overdue invoices
billingHistorySchema.statics.getOverdueInvoices = async function (
  daysOverdue = 0
) {
  const overdueDate = new Date();
  overdueDate.setDate(overdueDate.getDate() - daysOverdue);

  return this.find({
    'payment.status': 'pending',
    'payment.dueDate': { $lt: overdueDate },
    status: { $nin: ['paid', 'cancelled', 'refunded'] },
  }).populate('userId', 'email name');
};

// Static method to calculate revenue for period
billingHistorySchema.statics.getRevenueForPeriod = async function (
  startDate,
  endDate,
  options = {}
) {
  const { currency = 'USD', includeRefunded = false } = options;

  const matchStage = {
    'billingPeriod.start': { $gte: startDate, $lte: endDate },
    'invoice.currency': currency,
    status: includeRefunded ? { $in: ['paid', 'refunded'] } : 'paid',
  };

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totals.total' },
        paidRevenue: { $sum: '$totals.amountPaid' },
        refundedAmount: { $sum: '$totals.amountRefunded' },
        invoiceCount: { $sum: 1 },
        averageInvoice: { $avg: '$totals.total' },
      },
    },
  ];

  return this.aggregate(pipeline);
};

// Method to calculate payment latency
billingHistorySchema.methods.calculatePaymentLatency = function () {
  if (this.payment.paidDate && this.payment.dueDate) {
    const latency = Math.ceil(
      (this.payment.paidDate - this.payment.dueDate) / (1000 * 60 * 60 * 24)
    );
    this.analytics.paymentLatency = latency;
    return latency;
  }
  return null;
};

// Method to add audit trail entry
billingHistorySchema.methods.addAuditEntry = function (
  action,
  performedBy,
  changes,
  reason
) {
  this.auditTrail.push({
    action,
    performedBy,
    timestamp: new Date(),
    changes,
    reason,
    ipAddress: performedBy.ipAddress,
  });
};

// Method to process payment
billingHistorySchema.methods.processPayment = function (paymentDetails) {
  this.payment.attempts.push({
    attemptId: paymentDetails.attemptId,
    attemptDate: new Date(),
    status: paymentDetails.status,
    amount: paymentDetails.amount,
    paymentMethodId: paymentDetails.paymentMethodId,
    transactionId: paymentDetails.transactionId,
  });

  if (paymentDetails.status === 'success') {
    this.payment.status = 'paid';
    this.payment.paidDate = new Date();
    this.payment.transactionId = paymentDetails.transactionId;
    this.totals.amountPaid = paymentDetails.amount;
    this.status = 'paid';
  } else if (paymentDetails.status === 'failed') {
    this.payment.status = 'failed';
    this.payment.attempts[this.payment.attempts.length - 1].failureReason =
      paymentDetails.failureReason;
  }
};

// Method to apply refund
billingHistorySchema.methods.processRefund = function (refundDetails) {
  this.refunds.push({
    refundId: refundDetails.refundId,
    amount: refundDetails.amount,
    reason: refundDetails.reason,
    status: 'processed',
    requestedDate: refundDetails.requestedDate || new Date(),
    processedDate: new Date(),
    transactionId: refundDetails.transactionId,
    notes: refundDetails.notes,
  });

  this.totals.amountRefunded += refundDetails.amount;
  this.totals.amountDue = Math.max(
    0,
    this.totals.total - this.totals.amountPaid - this.totals.amountRefunded
  );

  if (this.totals.amountRefunded >= this.totals.total) {
    this.status = 'refunded';
    this.payment.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
    this.payment.status = 'partially_refunded';
  }
};

// Virtual for days overdue
billingHistorySchema.virtual('daysOverdue').get(function () {
  if (this.payment.status === 'paid' || this.status === 'paid') {
    return 0;
  }

  const today = new Date();
  const dueDate = this.payment.dueDate;

  if (today > dueDate) {
    return Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
  }

  return 0;
});

// Virtual for payment status description
billingHistorySchema.virtual('paymentStatusDescription').get(function () {
  const statusDescriptions = {
    pending: 'Payment pending',
    processing: 'Payment being processed',
    paid: 'Payment completed',
    failed: 'Payment failed',
    refunded: 'Fully refunded',
    partially_refunded: 'Partially refunded',
    disputed: 'Payment disputed',
  };

  return statusDescriptions[this.payment.status] || 'Unknown status';
});

export default mongoose.model('BillingHistory', billingHistorySchema);
