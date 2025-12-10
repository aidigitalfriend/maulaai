import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// DEVICE VERIFICATIONS MODEL
// ============================================
const deviceVerificationsSchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Verification Token
    verificationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Token Details
    token: {
      hash: {
        type: String,
        required: true,
        unique: true,
      },
      plainToken: {
        type: String,
        required: false, // Store temporarily, delete after sending
      },
      expiresAt: {
        type: Date,
        required: true,
        index: true,
      },
      issuedAt: {
        type: Date,
        default: Date.now,
      },
    },

    // Device Information
    device: {
      deviceId: {
        type: String,
        required: true,
        index: true,
      },
      fingerprint: {
        type: String,
        required: true,
      },
      name: String,
      type: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'other'],
        required: true,
      },
      os: String,
      browser: String,
      version: String,
      userAgent: String,
    },

    // Network Information
    network: {
      ipAddress: {
        type: String,
        required: true,
        index: true,
      },
      country: String,
      region: String,
      city: String,
      isp: String,
      timezone: String,
    },

    // Verification Type
    verificationType: {
      type: String,
      enum: ['email', 'sms', 'push', 'qr_code', 'magic_link'],
      required: true,
    },

    // Delivery Information
    delivery: {
      method: {
        type: String,
        enum: ['email', 'sms', 'push_notification', 'display'],
        required: true,
      },
      target: String, // email address or phone number
      sentAt: Date,
      deliveredAt: Date,
      attempts: {
        type: Number,
        default: 0,
      },
      lastAttemptAt: Date,
    },

    // Status
    status: {
      type: String,
      enum: [
        'pending',
        'sent',
        'delivered',
        'verified',
        'expired',
        'failed',
        'cancelled',
      ],
      default: 'pending',
      required: true,
      index: true,
    },

    // Verification Details
    verification: {
      verifiedAt: Date,
      verificationMethod: {
        type: String,
        enum: ['link_click', 'code_entry', 'qr_scan', 'push_approve'],
        required: false,
      },
      verificationIP: String,
      verificationDevice: String,
      attempts: {
        type: Number,
        default: 0,
      },
      maxAttempts: {
        type: Number,
        default: 3,
      },
    },

    // Purpose and Context
    purpose: {
      type: String,
      enum: [
        'new_device',
        'location_change',
        'suspicious_activity',
        'manual_verification',
        'password_reset',
      ],
      required: true,
    },

    context: {
      loginAttemptId: String,
      sessionId: String,
      requestId: String,
      triggeredBy: {
        type: String,
        enum: ['system', 'user', 'admin', 'security_rule'],
      },
      riskScore: {
        type: Number,
        min: 0,
        max: 100,
      },
    },

    // Security Settings
    security: {
      tokenLength: {
        type: Number,
        default: 32,
      },
      tokenType: {
        type: String,
        enum: ['numeric', 'alphanumeric', 'url_safe'],
        default: 'url_safe',
      },
      validityPeriod: {
        type: Number, // minutes
        default: 15,
      },
      oneTimeUse: {
        type: Boolean,
        default: true,
      },
    },

    // Result and Actions
    result: {
      outcome: {
        type: String,
        enum: ['success', 'failure', 'timeout', 'cancelled'],
        required: false,
      },
      failureReason: {
        type: String,
        enum: [
          'expired',
          'invalid_token',
          'max_attempts',
          'device_mismatch',
          'network_mismatch',
        ],
        required: false,
      },
      actionTaken: {
        type: String,
        enum: [
          'device_trusted',
          'access_granted',
          'access_denied',
          'account_locked',
          'require_2fa',
        ],
        required: false,
      },
    },

    // Audit Information
    audit: {
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      createdBySystem: {
        type: String,
        enum: ['auth_service', 'security_monitor', 'admin_panel', 'api'],
        default: 'auth_service',
      },
      ipAddress: String,
      userAgent: String,
      notes: String,
    },

    // Cleanup
    cleanupAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: 'deviceverifications',
  }
);

// Indexes for performance
deviceVerificationsSchema.index({ userId: 1, status: 1 });
deviceVerificationsSchema.index({ verificationId: 1 });
deviceVerificationsSchema.index({ 'token.hash': 1 });
deviceVerificationsSchema.index({ 'device.deviceId': 1, status: 1 });
deviceVerificationsSchema.index({ 'token.expiresAt': 1 });
deviceVerificationsSchema.index({ status: 1, 'token.expiresAt': 1 });

// Compound indexes
deviceVerificationsSchema.index({ userId: 1, 'device.deviceId': 1, status: 1 });
deviceVerificationsSchema.index({ userId: 1, purpose: 1, createdAt: -1 });
deviceVerificationsSchema.index({ 'network.ipAddress': 1, createdAt: -1 });

// TTL index for automatic cleanup
deviceVerificationsSchema.index(
  { 'token.expiresAt': 1 },
  { expireAfterSeconds: 0 }
);

// Conditional TTL for manual cleanup
deviceVerificationsSchema.index(
  { cleanupAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { cleanupAt: { $exists: true } },
  }
);

// Static method to verify token
deviceVerificationsSchema.statics.verifyToken = async function (
  token,
  deviceId
) {
  const crypto = require('crypto');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const verification = await this.findOne({
    'token.hash': tokenHash,
    'device.deviceId': deviceId,
    status: { $in: ['sent', 'delivered'] },
    'token.expiresAt': { $gt: new Date() },
  });

  return verification;
};

// Method to mark as verified
deviceVerificationsSchema.methods.markVerified = function (
  verificationDetails
) {
  this.status = 'verified';
  this.verification.verifiedAt = new Date();
  this.verification.verificationMethod = verificationDetails.method;
  this.verification.verificationIP = verificationDetails.ipAddress;
  this.verification.verificationDevice = verificationDetails.deviceInfo;
  this.result.outcome = 'success';
  this.result.actionTaken = verificationDetails.actionTaken;

  return this.save();
};

// Method to increment attempt count
deviceVerificationsSchema.methods.incrementAttempts = function () {
  this.verification.attempts += 1;

  if (this.verification.attempts >= this.verification.maxAttempts) {
    this.status = 'failed';
    this.result.outcome = 'failure';
    this.result.failureReason = 'max_attempts';
  }

  return this.save();
};

export default mongoose.model('DeviceVerifications', deviceVerificationsSchema);
