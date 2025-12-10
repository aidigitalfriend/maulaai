import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// LOGIN HISTORY MODEL
// ============================================
const loginHistorySchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Login Attempt Details
    attemptId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Status of Login Attempt
    status: {
      type: String,
      enum: [
        'success',
        'failed',
        'blocked',
        'pending_2fa',
        'pending_verification',
      ],
      required: true,
      index: true,
    },

    // Login Method
    loginMethod: {
      type: String,
      enum: ['password', 'oauth', 'magic_link', '2fa', 'trusted_device'],
      required: true,
    },

    // OAuth Provider (if applicable)
    oauthProvider: {
      type: String,
      enum: ['google', 'github', 'discord', 'apple', 'facebook'],
      required: false,
    },

    // Device Information
    device: {
      deviceId: {
        type: String,
        required: false,
      },
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
      version: String,
      isTrusted: {
        type: Boolean,
        default: false,
      },
    },

    // Network Information
    network: {
      ipAddress: {
        type: String,
        required: true,
        index: true,
      },
      userAgent: {
        type: String,
        required: true,
      },
      fingerprint: String,
      proxyDetected: {
        type: Boolean,
        default: false,
      },
      vpnDetected: {
        type: Boolean,
        default: false,
      },
      torDetected: {
        type: Boolean,
        default: false,
      },
    },

    // Geographic Location
    location: {
      country: String,
      countryCode: String,
      region: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      timezone: String,
      isp: String,
    },

    // Session Information
    session: {
      sessionId: String,
      duration: Number, // in seconds
      endedAt: Date,
      endReason: {
        type: String,
        enum: ['logout', 'timeout', 'force_logout', 'session_expired'],
        required: false,
      },
    },

    // Security Information
    security: {
      riskScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      riskFactors: [
        {
          factor: String,
          score: Number,
          description: String,
        },
      ],
      twoFactorUsed: {
        type: Boolean,
        default: false,
      },
      twoFactorMethod: {
        type: String,
        enum: ['app', 'sms', 'email', 'backup_code'],
        required: false,
      },
      blockedReason: {
        type: String,
        enum: [
          'too_many_attempts',
          'suspicious_location',
          'blocked_ip',
          'account_locked',
          'device_not_trusted',
        ],
        required: false,
      },
    },

    // Failure Information (for failed attempts)
    failure: {
      reason: {
        type: String,
        enum: [
          'invalid_password',
          'invalid_2fa',
          'account_locked',
          'email_not_verified',
          'user_not_found',
          'rate_limited',
        ],
        required: false,
      },
      attemptNumber: {
        type: Number,
        default: 1,
      },
      details: String,
    },

    // Timestamps
    attemptedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    completedAt: {
      type: Date,
      required: false,
    },

    // Additional Metadata
    metadata: {
      referrer: String,
      loginPage: String,
      redirectTo: String,
      apiVersion: String,
      clientVersion: String,
    },

    // Notifications
    notifications: {
      emailSent: {
        type: Boolean,
        default: false,
      },
      emailSentAt: Date,
      pushSent: {
        type: Boolean,
        default: false,
      },
      pushSentAt: Date,
    },
  },
  {
    timestamps: true,
    collection: 'loginhistory',
  }
);

// Indexes for performance and queries
loginHistorySchema.index({ userId: 1, attemptedAt: -1 });
loginHistorySchema.index({ userId: 1, status: 1 });
loginHistorySchema.index({ attemptId: 1 });
loginHistorySchema.index({ 'network.ipAddress': 1 });
loginHistorySchema.index({ attemptedAt: -1 });
loginHistorySchema.index({ status: 1, attemptedAt: -1 });

// Compound indexes for common queries
loginHistorySchema.index({ userId: 1, status: 1, attemptedAt: -1 });
loginHistorySchema.index({
  userId: 1,
  'network.ipAddress': 1,
  attemptedAt: -1,
});
loginHistorySchema.index({ userId: 1, 'device.isTrusted': 1, attemptedAt: -1 });

// TTL index to automatically delete old login history (keep for 1 year)
loginHistorySchema.index({ attemptedAt: 1 }, { expireAfterSeconds: 31536000 });

export default mongoose.model('LoginHistory', loginHistorySchema);
