import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// NOTIFICATION SETTINGS MODEL
// ============================================
const notificationSettingsSchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // Email Notifications
    email: {
      enabled: {
        type: Boolean,
        default: true,
      },
      frequency: {
        type: String,
        enum: ['immediate', 'daily', 'weekly', 'monthly', 'never'],
        default: 'immediate',
      },
      types: {
        security: {
          type: Boolean,
          default: true,
        },
        system: {
          type: Boolean,
          default: true,
        },
        updates: {
          type: Boolean,
          default: true,
        },
        marketing: {
          type: Boolean,
          default: false,
        },
        community: {
          type: Boolean,
          default: true,
        },
        achievements: {
          type: Boolean,
          default: true,
        },
        social: {
          type: Boolean,
          default: true,
        },
        billing: {
          type: Boolean,
          default: true,
        },
        conversations: {
          type: Boolean,
          default: false,
        },
        reminders: {
          type: Boolean,
          default: true,
        },
      },
      schedule: {
        preferredTime: {
          type: String,
          default: '09:00',
        },
        timezone: String,
        dayOfWeek: [
          {
            type: String,
            enum: [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday',
            ],
          },
        ],
        quietHours: {
          enabled: Boolean,
          start: String,
          end: String,
        },
      },
    },

    // Push Notifications
    push: {
      enabled: {
        type: Boolean,
        default: true,
      },
      devices: [
        {
          deviceId: String,
          deviceName: String,
          platform: {
            type: String,
            enum: ['web', 'ios', 'android', 'desktop'],
          },
          token: String,
          enabled: Boolean,
          registeredAt: Date,
          lastUsed: Date,
        },
      ],
      types: {
        security: { type: Boolean, default: true },
        system: { type: Boolean, default: true },
        achievements: { type: Boolean, default: true },
        social: { type: Boolean, default: false },
        reminders: { type: Boolean, default: true },
        conversations: { type: Boolean, default: false },
        breaking: { type: Boolean, default: true },
      },
      quietHours: {
        enabled: {
          type: Boolean,
          default: false,
        },
        start: {
          type: String,
          default: '22:00',
        },
        end: {
          type: String,
          default: '08:00',
        },
        timezone: String,
        weekendsOnly: Boolean,
        customDays: [String],
      },
      sound: {
        enabled: { type: Boolean, default: true },
        type: { type: String, default: 'default' },
        volume: { type: Number, default: 0.8, min: 0, max: 1 },
      },
      badge: {
        enabled: { type: Boolean, default: true },
        showCount: { type: Boolean, default: true },
      },
    },

    // SMS Notifications
    sms: {
      enabled: {
        type: Boolean,
        default: false,
      },
      phoneNumber: {
        type: String,
        required: false,
      },
      verified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: Date,
      types: {
        security: { type: Boolean, default: true },
        system: { type: Boolean, default: false },
        emergencies: { type: Boolean, default: true },
        account: { type: Boolean, default: true },
        billing: { type: Boolean, default: false },
      },
      rateLimit: {
        maxPerHour: { type: Number, default: 5 },
        maxPerDay: { type: Number, default: 20 },
      },
    },

    // In-App Notifications
    inApp: {
      enabled: {
        type: Boolean,
        default: true,
      },
      position: {
        type: String,
        enum: [
          'top-right',
          'top-left',
          'bottom-right',
          'bottom-left',
          'center',
        ],
        default: 'top-right',
      },
      duration: {
        type: Number,
        default: 5000, // milliseconds
      },
      types: {
        achievements: { type: Boolean, default: true },
        social: { type: Boolean, default: true },
        system: { type: Boolean, default: true },
        conversations: { type: Boolean, default: true },
        tips: { type: Boolean, default: true },
        updates: { type: Boolean, default: true },
      },
      sound: {
        enabled: { type: Boolean, default: true },
        volume: { type: Number, default: 0.5 },
      },
      animation: {
        type: String,
        enum: ['slide', 'fade', 'bounce', 'none'],
        default: 'slide',
      },
      priority: {
        high: { enabled: Boolean, override: Boolean },
        medium: { enabled: Boolean },
        low: { enabled: Boolean },
      },
    },

    // Desktop Notifications
    desktop: {
      enabled: {
        type: Boolean,
        default: false,
      },
      permission: {
        type: String,
        enum: ['default', 'granted', 'denied'],
        default: 'default',
      },
      types: {
        security: { type: Boolean, default: true },
        conversations: { type: Boolean, default: false },
        achievements: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true },
      },
      focus: {
        respectFocusMode: { type: Boolean, default: true },
        showInFullscreen: { type: Boolean, default: false },
      },
    },

    // Slack/Discord Integration
    integrations: {
      slack: {
        enabled: { type: Boolean, default: false },
        webhookUrl: String,
        channel: String,
        types: {
          achievements: Boolean,
          system: Boolean,
          alerts: Boolean,
        },
      },
      discord: {
        enabled: { type: Boolean, default: false },
        webhookUrl: String,
        types: {
          achievements: Boolean,
          social: Boolean,
          alerts: Boolean,
        },
      },
      teams: {
        enabled: { type: Boolean, default: false },
        webhookUrl: String,
        types: {
          system: Boolean,
          alerts: Boolean,
        },
      },
    },

    // Notification History and Analytics
    analytics: {
      trackOpens: {
        type: Boolean,
        default: true,
      },
      trackClicks: {
        type: Boolean,
        default: true,
      },
      optimizeDelivery: {
        type: Boolean,
        default: true,
      },
      personalizeContent: {
        type: Boolean,
        default: true,
      },
    },

    // Global Settings
    global: {
      masterSwitch: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        default: 'en',
      },
      timezone: String,
      doNotDisturb: {
        enabled: { type: Boolean, default: false },
        start: String,
        end: String,
        days: [String],
      },
      vacation: {
        enabled: { type: Boolean, default: false },
        startDate: Date,
        endDate: Date,
        autoReply: String,
      },
    },

    // Delivery Preferences
    delivery: {
      consolidation: {
        enabled: { type: Boolean, default: false },
        maxInterval: { type: Number, default: 60 }, // minutes
        maxCount: { type: Number, default: 5 },
      },
      priority: {
        high: {
          immediate: Boolean,
          channels: [String],
        },
        medium: {
          delay: Number, // minutes
          channels: [String],
        },
        low: {
          delay: Number, // minutes
          channels: [String],
        },
      },
      fallback: {
        enabled: { type: Boolean, default: true },
        sequence: [String], // ['push', 'email', 'sms']
        delay: Number, // minutes between attempts
      },
    },

    // Advanced Settings
    advanced: {
      smartScheduling: {
        type: Boolean,
        default: false,
      },
      predictiveFiltering: {
        type: Boolean,
        default: false,
      },
      machineLearning: {
        type: Boolean,
        default: false,
      },
      customRules: [
        {
          name: String,
          condition: String,
          action: String,
          enabled: Boolean,
        },
      ],
    },

    // Metadata
    metadata: {
      lastModified: {
        type: Date,
        default: Date.now,
      },
      modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      version: {
        type: String,
        default: '1.0',
      },
      migrationNotes: String,
    },
  },
  {
    timestamps: true,
    collection: 'notificationsettings',
  }
);

// Indexes for performance
notificationSettingsSchema.index({ userId: 1 });
notificationSettingsSchema.index({ 'global.masterSwitch': 1 });
notificationSettingsSchema.index({ 'email.enabled': 1 });
notificationSettingsSchema.index({ 'push.enabled': 1 });

// Method to check if notification type is enabled
notificationSettingsSchema.methods.isEnabled = function (channel, type) {
  if (!this.global.masterSwitch) return false;

  const channelSettings = this[channel];
  if (!channelSettings || !channelSettings.enabled) return false;

  if (channelSettings.types && channelSettings.types[type] !== undefined) {
    return channelSettings.types[type];
  }

  return true;
};

// Method to get active notification channels for a type
notificationSettingsSchema.methods.getActiveChannels = function (
  notificationType
) {
  const activeChannels = [];

  if (!this.global.masterSwitch) return activeChannels;

  const channels = ['email', 'push', 'sms', 'inApp', 'desktop'];

  channels.forEach((channel) => {
    if (this.isEnabled(channel, notificationType)) {
      activeChannels.push(channel);
    }
  });

  return activeChannels;
};

// Method to check quiet hours
notificationSettingsSchema.methods.isInQuietHours = function (
  channel = 'push'
) {
  const channelSettings = this[channel];
  if (!channelSettings?.quietHours?.enabled) return false;

  const now = new Date();
  const currentTime =
    now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0');
  const start = channelSettings.quietHours.start;
  const end = channelSettings.quietHours.end;

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (start > end) {
    return currentTime >= start || currentTime <= end;
  }

  return currentTime >= start && currentTime <= end;
};

// Static method to get default settings
notificationSettingsSchema.statics.getDefaultSettings = function () {
  return {
    email: {
      enabled: true,
      frequency: 'immediate',
      types: {
        security: true,
        system: true,
        updates: true,
        marketing: false,
        community: true,
        achievements: true,
        social: true,
        billing: true,
        conversations: false,
        reminders: true,
      },
    },
    push: {
      enabled: true,
      types: {
        security: true,
        system: true,
        achievements: true,
        social: false,
        reminders: true,
        conversations: false,
        breaking: true,
      },
    },
    global: {
      masterSwitch: true,
      language: 'en',
    },
  };
};

// Virtual for notification summary
notificationSettingsSchema.virtual('summary').get(function () {
  const channels = ['email', 'push', 'sms', 'inApp', 'desktop'];
  const enabledChannels = channels.filter((channel) => this[channel]?.enabled);

  return {
    totalChannels: channels.length,
    enabledChannels: enabledChannels.length,
    channels: enabledChannels,
    masterEnabled: this.global.masterSwitch,
  };
});

export default mongoose.model(
  'NotificationSettings',
  notificationSettingsSchema
);
