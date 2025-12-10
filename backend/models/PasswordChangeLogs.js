import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// PASSWORD CHANGE LOGS MODEL
// ============================================
const passwordChangeLogsSchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Change Event Details
    changeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Change Type
    changeType: {
      type: String,
      enum: [
        'user_initiated',
        'password_reset',
        'admin_reset',
        'security_forced',
        'migration',
      ],
      required: true,
      index: true,
    },

    // Change Method
    changeMethod: {
      type: String,
      enum: [
        'form_submission',
        'reset_link',
        'admin_panel',
        'api',
        'bulk_reset',
      ],
      required: true,
    },

    // Authentication Details
    authentication: {
      currentPasswordVerified: {
        type: Boolean,
        default: false,
      },
      twoFactorUsed: {
        type: Boolean,
        default: false,
      },
      twoFactorMethod: {
        type: String,
        enum: ['app', 'sms', 'email', 'backup_code'],
        required: false,
      },
      securityQuestionUsed: {
        type: Boolean,
        default: false,
      },
      emailVerificationUsed: {
        type: Boolean,
        default: false,
      },
    },

    // Password Strength Analysis
    passwordStrength: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },
      level: {
        type: String,
        enum: ['very_weak', 'weak', 'fair', 'good', 'strong', 'very_strong'],
        required: true,
      },
      criteria: {
        length: { met: Boolean, score: Number },
        uppercase: { met: Boolean, score: Number },
        lowercase: { met: Boolean, score: Number },
        numbers: { met: Boolean, score: Number },
        symbols: { met: Boolean, score: Number },
        uniqueness: { met: Boolean, score: Number },
        commonPassword: { met: Boolean, score: Number },
        personalInfo: { met: Boolean, score: Number },
      },
      entropy: Number,
      estimatedCrackTime: String,
    },

    // Previous Password Info (hashed data only)
    previousPassword: {
      hashedValue: String, // For comparison to prevent reuse
      strength: {
        score: Number,
        level: String,
      },
      createdAt: Date,
      ageInDays: Number,
    },

    // Device and Network Information
    device: {
      deviceId: String,
      name: String,
      type: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'other'],
      },
      os: String,
      browser: String,
      version: String,
      userAgent: String,
      fingerprint: String,
      isTrusted: {
        type: Boolean,
        default: false,
      },
    },

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
      proxyDetected: Boolean,
      vpnDetected: Boolean,
      torDetected: Boolean,
    },

    // Security Context
    security: {
      riskScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      riskFactors: [
        {
          factor: String,
          weight: Number,
          description: String,
        },
      ],
      wasCompromised: {
        type: Boolean,
        default: false,
      },
      compromiseIndicators: [String],
      triggeredBy: {
        type: String,
        enum: [
          'user_request',
          'security_policy',
          'breach_detection',
          'admin_action',
          'scheduled_rotation',
        ],
        required: false,
      },
    },

    // Session Information
    session: {
      sessionId: String,
      loginHistoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LoginHistory',
      },
      duration: Number, // seconds since login
      pagesVisited: Number,
      actionsPerformed: [String],
    },

    // Validation and Compliance
    validation: {
      policyCompliant: {
        type: Boolean,
        required: true,
      },
      policyViolations: [String],
      passwordReused: {
        type: Boolean,
        default: false,
      },
      reuseDistance: Number, // how many passwords back was this reused
      breachCheck: {
        checked: Boolean,
        inBreach: Boolean,
        breachCount: Number,
        checkedAt: Date,
      },
    },

    // Timing Information
    timing: {
      requestedAt: {
        type: Date,
        default: Date.now,
      },
      completedAt: {
        type: Date,
        required: true,
      },
      duration: Number, // milliseconds to complete
      timeOfDay: String,
      dayOfWeek: String,
    },

    // Metadata
    metadata: {
      userAgent: String,
      referrer: String,
      apiVersion: String,
      clientVersion: String,
      requestId: String,
      correlationId: String,
      source: {
        type: String,
        enum: ['web', 'mobile', 'api', 'admin', 'system'],
        required: true,
      },
    },

    // Notifications
    notifications: {
      emailSent: {
        type: Boolean,
        default: false,
      },
      emailSentAt: Date,
      smsNotificationSent: {
        type: Boolean,
        default: false,
      },
      smsSentAt: Date,
      pushNotificationSent: {
        type: Boolean,
        default: false,
      },
      pushSentAt: Date,
      securityTeamNotified: {
        type: Boolean,
        default: false,
      },
    },

    // Status and Results
    status: {
      type: String,
      enum: ['initiated', 'in_progress', 'completed', 'failed', 'cancelled'],
      default: 'initiated',
      required: true,
    },

    result: {
      success: {
        type: Boolean,
        required: true,
      },
      errorCode: String,
      errorMessage: String,
      nextRequiredAction: {
        type: String,
        enum: [
          'none',
          'verify_email',
          'update_recovery',
          'setup_2fa',
          'logout_all_sessions',
        ],
      },
    },

    // Audit Trail
    audit: {
      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      adminUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      notes: String,
      tags: [String],
    },
  },
  {
    timestamps: true,
    collection: 'passwordchangelogs',
  }
);

// Indexes for performance and security queries
passwordChangeLogsSchema.index({ userId: 1, 'timing.completedAt': -1 });
passwordChangeLogsSchema.index({
  userId: 1,
  changeType: 1,
  'timing.completedAt': -1,
});
passwordChangeLogsSchema.index({ changeId: 1 });
passwordChangeLogsSchema.index({
  'network.ipAddress': 1,
  'timing.completedAt': -1,
});
passwordChangeLogsSchema.index({ status: 1, 'timing.completedAt': -1 });
passwordChangeLogsSchema.index({ changeType: 1, 'timing.completedAt': -1 });

// Compound indexes for common queries
passwordChangeLogsSchema.index({
  userId: 1,
  status: 1,
  'timing.completedAt': -1,
});
passwordChangeLogsSchema.index({
  userId: 1,
  'security.wasCompromised': 1,
  'timing.completedAt': -1,
});
passwordChangeLogsSchema.index({
  userId: 1,
  'validation.passwordReused': 1,
  'timing.completedAt': -1,
});

// Text index for searching notes and error messages
passwordChangeLogsSchema.index({
  'audit.notes': 'text',
  'result.errorMessage': 'text',
  'security.compromiseIndicators': 'text',
});

// TTL index to automatically delete old logs (keep for 2 years)
passwordChangeLogsSchema.index(
  { 'timing.completedAt': 1 },
  { expireAfterSeconds: 63072000 }
);

// Static method to check password reuse
passwordChangeLogsSchema.statics.checkPasswordReuse = async function (
  userId,
  passwordHash,
  lookbackCount = 12
) {
  const recentLogs = await this.find({
    userId,
    'result.success': true,
    'previousPassword.hashedValue': { $exists: true },
  })
    .sort({ 'timing.completedAt': -1 })
    .limit(lookbackCount)
    .select('previousPassword.hashedValue timing.completedAt');

  const isReused = recentLogs.some(
    (log) => log.previousPassword.hashedValue === passwordHash
  );
  const reuseDistance = isReused
    ? recentLogs.findIndex(
        (log) => log.previousPassword.hashedValue === passwordHash
      ) + 1
    : 0;

  return { isReused, reuseDistance };
};

// Method to calculate password age
passwordChangeLogsSchema.methods.calculatePasswordAge = function () {
  if (this.previousPassword.createdAt) {
    const ageInMs = this.timing.completedAt - this.previousPassword.createdAt;
    return Math.floor(ageInMs / (1000 * 60 * 60 * 24)); // Convert to days
  }
  return null;
};

export default mongoose.model('PasswordChangeLogs', passwordChangeLogsSchema);
