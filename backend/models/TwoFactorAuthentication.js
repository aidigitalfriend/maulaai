import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// TWO FACTOR AUTHENTICATION MODEL
// ============================================
const twoFactorAuthenticationSchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // 2FA Status
    isEnabled: {
      type: Boolean,
      default: false,
      required: true,
    },

    // Authentication Method
    method: {
      type: String,
      enum: ['app', 'sms', 'email'],
      default: 'app',
      required: true,
    },

    // Secret Key (for TOTP apps like Google Authenticator)
    secretKey: {
      type: String,
      required: true,
    },

    // QR Code Data URL (base64)
    qrCodeDataUrl: {
      type: String,
      required: false,
    },

    // Backup Codes
    backupCodes: [
      {
        code: {
          type: String,
          required: true,
        },
        used: {
          type: Boolean,
          default: false,
        },
        usedAt: {
          type: Date,
          default: null,
        },
      },
    ],

    // Recovery Information
    recoveryEmail: {
      type: String,
      required: false,
    },

    recoveryPhone: {
      type: String,
      required: false,
    },

    // Setup Information
    setupAt: {
      type: Date,
      default: Date.now,
    },

    setupDevice: {
      userAgent: String,
      ipAddress: String,
      location: {
        country: String,
        region: String,
        city: String,
      },
    },

    // Last Verification
    lastVerifiedAt: {
      type: Date,
      default: null,
    },

    // Failed Attempts
    failedAttempts: {
      type: Number,
      default: 0,
    },

    lockedUntil: {
      type: Date,
      default: null,
    },

    // Settings
    settings: {
      requireFor: {
        login: { type: Boolean, default: true },
        passwordChange: { type: Boolean, default: true },
        sensitiveActions: { type: Boolean, default: true },
      },
      trustDevices: { type: Boolean, default: false },
      rememberFor: { type: Number, default: 30 }, // days
    },

    // Metadata
    metadata: {
      appName: { type: String, default: 'OneLastAI' },
      issuer: { type: String, default: 'onelastai.co' },
      algorithm: { type: String, default: 'SHA1' },
      digits: { type: Number, default: 6 },
      period: { type: Number, default: 30 },
    },
  },
  {
    timestamps: true,
    collection: 'twofactorauthentication',
  }
);

// Indexes for performance
twoFactorAuthenticationSchema.index({ userId: 1 });
twoFactorAuthenticationSchema.index({ isEnabled: 1 });
twoFactorAuthenticationSchema.index({ lastVerifiedAt: -1 });

export default mongoose.model(
  'TwoFactorAuthentication',
  twoFactorAuthenticationSchema
);
