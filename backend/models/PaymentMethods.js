import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// PAYMENT METHODS MODEL
// ============================================
const paymentMethodsSchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Payment Method Details
    paymentMethodId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Provider Information
    provider: {
      name: {
        type: String,
        enum: [
          'stripe',
          'paypal',
          'apple_pay',
          'google_pay',
          'bank_transfer',
          'crypto',
          'other',
        ],
        required: true,
      },
      providerId: String, // External provider's ID for this payment method
      accountId: String, // Provider account ID
      merchantId: String,
    },

    // Payment Type
    type: {
      type: String,
      enum: [
        'credit_card',
        'debit_card',
        'bank_account',
        'paypal',
        'apple_pay',
        'google_pay',
        'crypto_wallet',
        'gift_card',
        'prepaid',
      ],
      required: true,
      index: true,
    },

    // Card Information (for card payments)
    card: {
      brand: {
        type: String,
        enum: [
          'visa',
          'mastercard',
          'amex',
          'discover',
          'jcb',
          'diners',
          'unionpay',
          'unknown',
        ],
      },
      last4: String,
      expiryMonth: Number,
      expiryYear: Number,
      fingerprint: String, // Unique card fingerprint from provider
      funding: {
        type: String,
        enum: ['credit', 'debit', 'prepaid', 'unknown'],
      },
      country: String,
      issuer: String,
      cardholderName: String,
    },

    // Bank Account Information
    bankAccount: {
      bankName: String,
      accountType: {
        type: String,
        enum: ['checking', 'savings', 'business_checking', 'business_savings'],
      },
      last4: String,
      routingNumber: String,
      country: String,
      currency: String,
      accountHolderName: String,
      accountHolderType: {
        type: String,
        enum: ['individual', 'company'],
      },
    },

    // Digital Wallet Information
    digitalWallet: {
      walletType: {
        type: String,
        enum: [
          'paypal',
          'apple_pay',
          'google_pay',
          'samsung_pay',
          'amazon_pay',
        ],
      },
      email: String, // For PayPal
      phoneNumber: String, // For some wallets
      deviceId: String, // For device-based wallets
    },

    // Cryptocurrency Information
    crypto: {
      currency: {
        type: String,
        enum: ['bitcoin', 'ethereum', 'litecoin', 'ripple', 'cardano', 'other'],
      },
      walletAddress: String,
      network: String, // mainnet, testnet, etc.
      addressType: {
        type: String,
        enum: ['legacy', 'segwit', 'native_segwit'],
      },
    },

    // Status and Settings
    status: {
      type: String,
      enum: [
        'active',
        'inactive',
        'expired',
        'suspended',
        'pending_verification',
        'failed_verification',
      ],
      default: 'active',
      required: true,
      index: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationDate: Date,

    // Usage Information
    usage: {
      firstUsed: Date,
      lastUsed: Date,
      totalTransactions: {
        type: Number,
        default: 0,
      },
      successfulTransactions: {
        type: Number,
        default: 0,
      },
      failedTransactions: {
        type: Number,
        default: 0,
      },
      totalAmount: {
        type: Number,
        default: 0,
      },
      averageTransactionAmount: {
        type: Number,
        default: 0,
      },
    },

    // Billing Address
    billingAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      verified: {
        type: Boolean,
        default: false,
      },
      verificationDate: Date,
    },

    // Security and Risk
    security: {
      riskScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      riskFactors: [String],
      fraudFlags: [String],
      cvvVerified: Boolean,
      avsResult: String, // Address Verification System result
      threeDSecure: {
        supported: Boolean,
        version: String,
        authenticated: Boolean,
      },
    },

    // Limits and Restrictions
    limits: {
      dailyLimit: Number,
      monthlyLimit: Number,
      perTransactionLimit: Number,
      currency: {
        type: String,
        default: 'USD',
      },
      restrictedCountries: [String],
      allowedTransactionTypes: [String],
    },

    // Compliance and Verification
    compliance: {
      kycVerified: {
        type: Boolean,
        default: false,
      },
      kycDate: Date,
      amlChecked: {
        type: Boolean,
        default: false,
      },
      amlDate: Date,
      pciCompliant: {
        type: Boolean,
        default: true,
      },
      regulatoryFlags: [String],
    },

    // Notification Preferences
    notifications: {
      transactionAlerts: {
        type: Boolean,
        default: true,
      },
      securityAlerts: {
        type: Boolean,
        default: true,
      },
      expiryWarnings: {
        type: Boolean,
        default: true,
      },
      failureNotifications: {
        type: Boolean,
        default: true,
      },
    },

    // Metadata
    metadata: {
      nickname: String, // User-defined name
      tags: [String],
      notes: String,
      internalReference: String,
      externalReference: String,
      createdVia: {
        type: String,
        enum: ['web', 'mobile', 'api', 'admin'],
        default: 'web',
      },
      ipAddress: String,
      userAgent: String,
    },

    // Auto-update and Maintenance
    autoUpdate: {
      enabled: {
        type: Boolean,
        default: true,
      },
      lastChecked: Date,
      nextCheck: Date,
      updatedFields: [String],
      updateHistory: [
        {
          field: String,
          oldValue: String,
          newValue: String,
          updatedAt: Date,
          source: String,
        },
      ],
    },

    // Integration Data
    integration: {
      webhookEvents: [String],
      customFields: Schema.Types.Mixed,
      providerMetadata: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    collection: 'paymentmethods',
  }
);

// Indexes for performance and queries
paymentMethodsSchema.index({ userId: 1, isDefault: -1 });
paymentMethodsSchema.index({ userId: 1, status: 1 });
paymentMethodsSchema.index({ paymentMethodId: 1 });
paymentMethodsSchema.index({ 'provider.name': 1, type: 1 });
paymentMethodsSchema.index({ 'card.fingerprint': 1 });
paymentMethodsSchema.index({ status: 1, 'usage.lastUsed': -1 });

// Compound indexes
paymentMethodsSchema.index({ userId: 1, type: 1, status: 1 });
paymentMethodsSchema.index({ userId: 1, 'usage.lastUsed': -1 });

// TTL index for expired/inactive payment methods
paymentMethodsSchema.index(
  { 'usage.lastUsed': 1 },
  {
    expireAfterSeconds: 94608000, // 3 years
    partialFilterExpression: {
      status: { $in: ['expired', 'inactive'] },
      'usage.lastUsed': {
        $lt: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000),
      },
    },
  }
);

// Pre-save middleware for validation and processing
paymentMethodsSchema.pre('save', function (next) {
  // Ensure only one default payment method per user
  if (this.isDefault && this.isModified('isDefault')) {
    this.constructor
      .updateMany(
        { userId: this.userId, _id: { $ne: this._id } },
        { isDefault: false }
      )
      .exec();
  }

  // Update usage statistics
  if (
    this.isModified('usage.totalTransactions') ||
    this.isModified('usage.totalAmount')
  ) {
    if (this.usage.totalTransactions > 0) {
      this.usage.averageTransactionAmount =
        this.usage.totalAmount / this.usage.totalTransactions;
    }
  }

  next();
});

// Static method to get user's default payment method
paymentMethodsSchema.statics.getDefaultForUser = function (userId) {
  return this.findOne({
    userId,
    status: 'active',
    isDefault: true,
  });
};

// Static method to get available payment methods for user
paymentMethodsSchema.statics.getAvailableForUser = function (userId) {
  return this.find({
    userId,
    status: { $in: ['active', 'pending_verification'] },
  }).sort({ isDefault: -1, 'usage.lastUsed': -1 });
};

// Method to validate payment method
paymentMethodsSchema.methods.validate = function () {
  const errors = [];

  // Card validation
  if (this.type.includes('card')) {
    if (!this.card.last4 || this.card.last4.length !== 4) {
      errors.push('Invalid card last 4 digits');
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    if (
      this.card.expiryYear < currentYear ||
      (this.card.expiryYear === currentYear &&
        this.card.expiryMonth < currentMonth)
    ) {
      errors.push('Card has expired');
      this.status = 'expired';
    }
  }

  // Bank account validation
  if (this.type === 'bank_account') {
    if (!this.bankAccount.last4 || this.bankAccount.last4.length !== 4) {
      errors.push('Invalid bank account last 4 digits');
    }
  }

  return errors;
};

// Method to mark as used
paymentMethodsSchema.methods.recordUsage = function (
  transactionAmount,
  success = true
) {
  this.usage.totalTransactions += 1;
  this.usage.lastUsed = new Date();

  if (!this.usage.firstUsed) {
    this.usage.firstUsed = new Date();
  }

  if (success) {
    this.usage.successfulTransactions += 1;
    this.usage.totalAmount += transactionAmount;
  } else {
    this.usage.failedTransactions += 1;
  }

  this.usage.averageTransactionAmount =
    this.usage.totalAmount / this.usage.successfulTransactions;

  return this.save();
};

// Method to check if payment method needs verification
paymentMethodsSchema.methods.needsVerification = function () {
  if (!this.isVerified) return true;

  // Check if card is about to expire
  if (this.type.includes('card')) {
    const expiryDate = new Date(
      this.card.expiryYear,
      this.card.expiryMonth - 1
    );
    const warningDate = new Date();
    warningDate.setMonth(warningDate.getMonth() + 1); // 1 month warning

    return expiryDate <= warningDate;
  }

  return false;
};

// Virtual for display name
paymentMethodsSchema.virtual('displayName').get(function () {
  if (this.metadata.nickname) {
    return this.metadata.nickname;
  }

  if (this.type.includes('card')) {
    return `${this.card.brand} •••• ${this.card.last4}`;
  }

  if (this.type === 'bank_account') {
    return `${this.bankAccount.bankName} •••• ${this.bankAccount.last4}`;
  }

  if (this.digitalWallet.walletType) {
    return `${this.digitalWallet.walletType}`;
  }

  return this.type.replace('_', ' ').toUpperCase();
});

export default mongoose.model('PaymentMethods', paymentMethodsSchema);
