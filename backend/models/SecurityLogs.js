import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// SECURITY LOGS MODEL
// ============================================
const securityLogsSchema = new Schema(
  {
    // User Reference (can be null for system-wide events)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },

    // Event Information
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    eventType: {
      type: String,
      required: true,
      enum: [
        // Authentication Events
        'login_success',
        'login_failed',
        'logout',
        'password_changed',
        'password_reset',
        'account_locked',
        'account_unlocked',
        'email_verified',
        'phone_verified',

        // 2FA Events
        '2fa_enabled',
        '2fa_disabled',
        '2fa_verified',
        '2fa_failed',
        'backup_code_used',

        // Device Events
        'device_trusted',
        'device_revoked',
        'new_device_detected',
        'device_verified',

        // Security Events
        'suspicious_activity',
        'multiple_failed_attempts',
        'ip_blocked',
        'rate_limited',
        'session_hijacking_attempt',
        'brute_force_detected',

        // Account Events
        'profile_updated',
        'email_changed',
        'phone_changed',
        'preferences_changed',
        'data_exported',
        'account_deleted',
        'gdpr_request',

        // Admin Events
        'admin_access',
        'admin_action',
        'system_maintenance',
        'security_alert',

        // API Events
        'api_key_created',
        'api_key_revoked',
        'api_rate_limited',
        'api_unauthorized',
      ],
      index: true,
    },

    // Event Severity
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
      index: true,
    },

    // Event Details
    details: {
      description: {
        type: String,
        required: true,
      },
      action: String,
      resource: String,
      outcome: {
        type: String,
        enum: ['success', 'failure', 'partial', 'blocked'],
        required: true,
      },
    },

    // User Information
    user: {
      email: String,
      username: String,
      role: String,
      accountStatus: String,
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
      userAgent: String,
      fingerprint: String,
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
      proxyDetected: Boolean,
      vpnDetected: Boolean,
      torDetected: Boolean,
    },

    // Session Information
    session: {
      sessionId: String,
      duration: Number,
    },

    // Risk Assessment
    risk: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      factors: [
        {
          factor: String,
          weight: Number,
          description: String,
        },
      ],
      classification: {
        type: String,
        enum: ['benign', 'suspicious', 'malicious', 'unknown'],
        default: 'benign',
      },
    },

    // Related Events
    related: {
      parentEventId: String,
      childEvents: [String],
      correlationId: String,
      sessionEvents: [String],
    },

    // Metadata
    metadata: {
      source: {
        type: String,
        enum: ['web', 'mobile', 'api', 'system', 'admin'],
        required: true,
      },
      version: String,
      environment: {
        type: String,
        enum: ['development', 'staging', 'production'],
        default: 'production',
      },
      requestId: String,
      traceId: String,
    },

    // Response Actions
    actions: {
      taken: [
        {
          action: {
            type: String,
            enum: [
              'alert_sent',
              'account_locked',
              'session_terminated',
              'ip_blocked',
              'admin_notified',
              '2fa_required',
              'device_blocked',
              'rate_limited',
            ],
          },
          timestamp: Date,
          details: String,
          automated: Boolean,
        },
      ],
      recommended: [
        {
          action: String,
          priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
          },
          reason: String,
        },
      ],
    },

    // Investigation Status
    investigation: {
      status: {
        type: String,
        enum: [
          'open',
          'investigating',
          'resolved',
          'false_positive',
          'ignored',
        ],
        default: 'open',
      },
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      notes: String,
      resolvedAt: Date,
      resolution: String,
    },

    // Timestamps
    occurredAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },

    detectedAt: {
      type: Date,
      default: Date.now,
    },

    // Data Retention
    retainUntil: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: 'securitylogs',
  }
);

// Indexes for performance and security queries
securityLogsSchema.index({ userId: 1, occurredAt: -1 });
securityLogsSchema.index({ eventType: 1, occurredAt: -1 });
securityLogsSchema.index({ severity: 1, occurredAt: -1 });
securityLogsSchema.index({ 'network.ipAddress': 1, occurredAt: -1 });
securityLogsSchema.index({ eventId: 1 });
securityLogsSchema.index({ occurredAt: -1 });

// Compound indexes for common security queries
securityLogsSchema.index({ userId: 1, eventType: 1, occurredAt: -1 });
securityLogsSchema.index({
  severity: 1,
  'investigation.status': 1,
  occurredAt: -1,
});
securityLogsSchema.index({
  'metadata.source': 1,
  eventType: 1,
  occurredAt: -1,
});
securityLogsSchema.index({
  'risk.classification': 1,
  severity: 1,
  occurredAt: -1,
});

// Text index for searching descriptions and details
securityLogsSchema.index({
  'details.description': 'text',
  'investigation.notes': 'text',
  'details.action': 'text',
});

// TTL index for automatic cleanup based on retainUntil field
securityLogsSchema.index({ retainUntil: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('SecurityLogs', securityLogsSchema);
