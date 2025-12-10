import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// TRUSTED DEVICES MODEL
// ============================================
const trustedDevicesSchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Device Identification
    deviceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Device Information
    deviceInfo: {
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'other'],
        required: true,
      },
      os: {
        type: String,
        required: true,
      },
      browser: {
        type: String,
        required: true,
      },
      version: {
        type: String,
        required: false,
      },
    },

    // Network Information
    networkInfo: {
      ipAddress: {
        type: String,
        required: true,
      },
      userAgent: {
        type: String,
        required: true,
      },
      fingerprint: {
        type: String,
        required: true,
        unique: true,
      },
    },

    // Location Information
    location: {
      country: {
        type: String,
        required: false,
      },
      region: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      timezone: String,
    },

    // Trust Status
    status: {
      type: String,
      enum: ['trusted', 'pending', 'revoked', 'suspicious'],
      default: 'pending',
      required: true,
    },

    // Trust Information
    trustedAt: {
      type: Date,
      default: null,
    },

    trustMethod: {
      type: String,
      enum: ['2fa', 'email_verification', 'manual', 'auto'],
      required: false,
    },

    // Usage Statistics
    usage: {
      firstSeenAt: {
        type: Date,
        default: Date.now,
      },
      lastSeenAt: {
        type: Date,
        default: Date.now,
      },
      loginCount: {
        type: Number,
        default: 1,
      },
      successfulLogins: {
        type: Number,
        default: 0,
      },
      failedLogins: {
        type: Number,
        default: 0,
      },
    },

    // Verification
    verificationToken: {
      type: String,
      required: false,
    },

    verificationExpires: {
      type: Date,
      required: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    // Auto-trust Settings
    autoTrusted: {
      type: Boolean,
      default: false,
    },

    trustDuration: {
      type: Number, // days
      default: 30,
    },

    expiresAt: {
      type: Date,
      required: false,
    },

    // Security Flags
    securityFlags: {
      isIncognito: { type: Boolean, default: false },
      isVPN: { type: Boolean, default: false },
      isTor: { type: Boolean, default: false },
      riskScore: { type: Number, default: 0, min: 0, max: 100 },
    },

    // Notes and Actions
    notes: {
      type: String,
      required: false,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },

    revokeReason: {
      type: String,
      enum: [
        'user_request',
        'security_breach',
        'suspicious_activity',
        'expired',
        'admin_action',
      ],
      required: false,
    },
  },
  {
    timestamps: true,
    collection: 'trusteddevices',
  }
);

// Indexes for performance
trustedDevicesSchema.index({ userId: 1, status: 1 });
trustedDevicesSchema.index({ deviceId: 1 });
trustedDevicesSchema.index({ 'networkInfo.fingerprint': 1 });
trustedDevicesSchema.index({ 'usage.lastSeenAt': -1 });
trustedDevicesSchema.index({ expiresAt: 1 });
trustedDevicesSchema.index({ status: 1 });

// Compound indexes
trustedDevicesSchema.index({ userId: 1, 'networkInfo.ipAddress': 1 });
trustedDevicesSchema.index({ userId: 1, 'usage.lastSeenAt': -1 });

export default mongoose.model('TrustedDevices', trustedDevicesSchema);
