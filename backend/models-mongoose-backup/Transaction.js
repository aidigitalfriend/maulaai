/**
 * TRANSACTION MODEL
 * Tracks all payment transactions, invoices, and billing events
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    // Transaction identification
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // User reference
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Stripe references
    stripePaymentIntentId: { type: String, sparse: true },
    stripeChargeId: { type: String, sparse: true },
    stripeInvoiceId: { type: String, sparse: true },
    stripeSubscriptionId: { type: String, sparse: true },

    // Transaction type
    type: {
      type: String,
      required: true,
      enum: [
        'purchase', // One-time purchase
        'subscription', // Subscription payment
        'renewal', // Subscription renewal
        'upgrade', // Plan upgrade
        'downgrade', // Plan downgrade
        'refund', // Refund issued
        'credit', // Credit applied
        'chargeback', // Chargeback
        'failed', // Failed payment
      ],
      index: true,
    },

    // What was purchased
    item: {
      type: {
        type: String,
        enum: ['agent', 'plan', 'credits', 'addon', 'other'],
      },
      id: { type: String }, // Agent ID, Plan ID, etc.
      name: { type: String }, // Display name
      description: { type: String },
    },

    // Subscription details (if applicable)
    subscription: {
      plan: { type: String }, // daily, weekly, monthly
      startDate: { type: Date },
      endDate: { type: Date },
      autoRenew: { type: Boolean },
    },

    // Amount details
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },

    // Payment method
    paymentMethod: {
      type: { type: String }, // card, paypal, etc.
      last4: { type: String },
      brand: { type: String }, // visa, mastercard, etc.
    },

    // Status
    status: {
      type: String,
      required: true,
      enum: [
        'pending',
        'processing',
        'completed',
        'failed',
        'refunded',
        'partially_refunded',
        'cancelled',
        'disputed',
      ],
      default: 'pending',
      index: true,
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        reason: String,
      },
    ],

    // Refund details
    refund: {
      amount: { type: Number },
      reason: { type: String },
      processedAt: { type: Date },
      stripeRefundId: { type: String },
    },

    // Invoice/Receipt
    invoiceUrl: { type: String },
    receiptUrl: { type: String },
    invoiceNumber: { type: String },

    // Error details (for failed transactions)
    error: {
      code: { type: String },
      message: { type: String },
      declineCode: { type: String },
    },

    // Metadata
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: 'transactions',
  }
);

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });
transactionSchema.index({ 'item.id': 1 });
transactionSchema.index({ status: 1, type: 1 });

export const Transaction =
  mongoose.models.Transaction ||
  mongoose.model('Transaction', transactionSchema);
