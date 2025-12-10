import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// PRIVACY SETTINGS MODEL
// ============================================
const privacySettingsSchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    // Profile Privacy
    profile: {
      visibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public',
      },
      showRealName: {
        type: Boolean,
        default: false,
      },
      showEmail: {
        type: Boolean,
        default: false,
      },
      showLocation: {
        type: Boolean,
        default: false,
      },
      showJoinDate: {
        type: Boolean,
        default: true,
      },
      showActivityStatus: {
        type: Boolean,
        default: true,
      },
      showAchievements: {
        type: Boolean,
        default: true,
      },
      allowSearch: {
        type: Boolean,
        default: true,
      },
    },

    // Data Collection
    dataCollection: {
      analytics: {
        type: Boolean,
        default: true,
      },
      performance: {
        type: Boolean,
        default: true,
      },
      usage: {
        type: Boolean,
        default: true,
      },
      behavior: {
        type: Boolean,
        default: false,
      },
      location: {
        type: Boolean,
        default: false,
      },
      device: {
        type: Boolean,
        default: true,
      },
      contacts: {
        type: Boolean,
        default: false,
      },
      thirdParty: {
        type: Boolean,
        default: false,
      },
    },

    // Communication Privacy
    communication: {
      allowDirectMessages: {
        type: String,
        enum: ['everyone', 'friends', 'none'],
        default: 'friends',
      },
      allowGroupInvites: {
        type: String,
        enum: ['everyone', 'friends', 'none'],
        default: 'friends',
      },
      showOnlineStatus: {
        type: Boolean,
        default: true,
      },
      showTypingIndicator: {
        type: Boolean,
        default: true,
      },
      showReadReceipts: {
        type: Boolean,
        default: true,
      },
      allowVoiceMessages: {
        type: Boolean,
        default: true,
      },
      allowFileSharing: {
        type: Boolean,
        default: true,
      },
    },

    // Conversation Privacy
    conversations: {
      saveHistory: {
        type: Boolean,
        default: true,
      },
      shareWithAI: {
        type: Boolean,
        default: true,
      },
      allowAnalytics: {
        type: Boolean,
        default: true,
      },
      allowImprovement: {
        type: Boolean,
        default: true,
      },
      retentionPeriod: {
        type: String,
        enum: ['1month', '6months', '1year', '2years', 'forever'],
        default: '1year',
      },
      anonymizeData: {
        type: Boolean,
        default: false,
      },
      allowExport: {
        type: Boolean,
        default: true,
      },
    },

    // Social Privacy
    social: {
      allowFriendRequests: {
        type: String,
        enum: ['everyone', 'friends_of_friends', 'none'],
        default: 'everyone',
      },
      showFriendsList: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'friends',
      },
      allowTagging: {
        type: String,
        enum: ['everyone', 'friends', 'none'],
        default: 'friends',
      },
      showInLeaderboards: {
        type: Boolean,
        default: true,
      },
      allowComparison: {
        type: Boolean,
        default: true,
      },
      shareAchievements: {
        type: Boolean,
        default: true,
      },
    },

    // Data Sharing
    dataSharing: {
      improvementProgram: {
        type: Boolean,
        default: true,
      },
      researchProgram: {
        type: Boolean,
        default: false,
      },
      marketingProgram: {
        type: Boolean,
        default: false,
      },
      partnersProgram: {
        type: Boolean,
        default: false,
      },
      anonymousUsage: {
        type: Boolean,
        default: true,
      },
      crashReports: {
        type: Boolean,
        default: true,
      },
      errorReports: {
        type: Boolean,
        default: true,
      },
    },

    // Third Party Integration
    thirdParty: {
      allowConnections: {
        type: Boolean,
        default: false,
      },
      connectedServices: [
        {
          service: String,
          permissions: [String],
          connectedAt: Date,
          lastUsed: Date,
          enabled: Boolean,
        },
      ],
      allowDataExchange: {
        type: Boolean,
        default: false,
      },
      allowCrossService: {
        type: Boolean,
        default: false,
      },
    },

    // Marketing and Advertising
    marketing: {
      allowPersonalizedAds: {
        type: Boolean,
        default: false,
      },
      allowEmailMarketing: {
        type: Boolean,
        default: false,
      },
      allowSMSMarketing: {
        type: Boolean,
        default: false,
      },
      allowPushMarketing: {
        type: Boolean,
        default: false,
      },
      allowThirdPartyMarketing: {
        type: Boolean,
        default: false,
      },
      allowBehavioralTargeting: {
        type: Boolean,
        default: false,
      },
      adPreferences: [String],
      blockedAdvertisers: [String],
    },

    // Data Rights and Control
    dataRights: {
      allowDataPortability: {
        type: Boolean,
        default: true,
      },
      allowDataDeletion: {
        type: Boolean,
        default: true,
      },
      allowDataCorrection: {
        type: Boolean,
        default: true,
      },
      autoDeleteInactive: {
        enabled: { type: Boolean, default: false },
        period: {
          type: String,
          enum: ['6months', '1year', '2years', '3years'],
          default: '2years',
        },
      },
      dataMinimization: {
        type: Boolean,
        default: true,
      },
    },

    // Security and Access
    security: {
      allowPasswordReset: {
        type: Boolean,
        default: true,
      },
      requireEmailVerification: {
        type: Boolean,
        default: true,
      },
      allow2FABackup: {
        type: Boolean,
        default: true,
      },
      allowDeviceRemembering: {
        type: Boolean,
        default: true,
      },
      allowLocationBasedSecurity: {
        type: Boolean,
        default: true,
      },
      allowBiometric: {
        type: Boolean,
        default: false,
      },
    },

    // Children's Privacy (COPPA compliance)
    childrenPrivacy: {
      isMinor: {
        type: Boolean,
        default: false,
      },
      parentalConsent: {
        given: { type: Boolean, default: false },
        givenAt: Date,
        parentEmail: String,
        verificationMethod: String,
      },
      restrictedData: {
        noLocation: { type: Boolean, default: true },
        noBehavioral: { type: Boolean, default: true },
        noThirdParty: { type: Boolean, default: true },
        noMarketing: { type: Boolean, default: true },
      },
    },

    // GDPR Compliance
    gdpr: {
      consentGiven: {
        type: Boolean,
        default: false,
      },
      consentDate: Date,
      consentVersion: String,
      lawfulBasis: {
        type: String,
        enum: [
          'consent',
          'contract',
          'legal_obligation',
          'vital_interests',
          'public_task',
          'legitimate_interests',
        ],
      },
      rightsExercised: [
        {
          right: {
            type: String,
            enum: [
              'access',
              'rectification',
              'erasure',
              'portability',
              'restriction',
              'objection',
            ],
          },
          requestDate: Date,
          fulfilledDate: Date,
          status: String,
        },
      ],
    },

    // Regional Privacy Laws
    regionalCompliance: {
      ccpa: {
        optOut: { type: Boolean, default: false },
        optOutDate: Date,
        doNotSell: { type: Boolean, default: false },
      },
      lgpd: {
        consentGiven: { type: Boolean, default: false },
        consentDate: Date,
      },
      pipeda: {
        consentGiven: { type: Boolean, default: false },
        consentDate: Date,
      },
    },

    // Audit and Compliance
    audit: {
      lastReviewed: Date,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      complianceVersion: String,
      privacyPolicyVersion: String,
      tosVersion: String,
      changes: [
        {
          field: String,
          oldValue: Schema.Types.Mixed,
          newValue: Schema.Types.Mixed,
          changedAt: Date,
          reason: String,
        },
      ],
    },

    // Metadata
    metadata: {
      version: {
        type: String,
        default: '1.0',
      },
      lastModified: {
        type: Date,
        default: Date.now,
      },
      autoUpdated: {
        type: Boolean,
        default: false,
      },
      migrationNotes: String,
    },
  },
  {
    timestamps: true,
    collection: 'privacysettings',
  }
);

// Indexes for performance and compliance
privacySettingsSchema.index({ userId: 1 });
privacySettingsSchema.index({ 'gdpr.consentGiven': 1 });
privacySettingsSchema.index({ 'childrenPrivacy.isMinor': 1 });
privacySettingsSchema.index({ 'dataRights.autoDeleteInactive.enabled': 1 });
privacySettingsSchema.index({ 'audit.lastReviewed': 1 });

// Method to check if user has given valid consent
privacySettingsSchema.methods.hasValidConsent = function () {
  if (this.childrenPrivacy.isMinor) {
    return this.childrenPrivacy.parentalConsent.given;
  }
  return this.gdpr.consentGiven;
};

// Method to get data collection permissions
privacySettingsSchema.methods.getDataPermissions = function () {
  const permissions = {};

  // Apply restrictions for minors
  if (this.childrenPrivacy.isMinor) {
    permissions.location = false;
    permissions.behavior = false;
    permissions.thirdParty = false;
    permissions.marketing = false;
    permissions.analytics =
      this.dataCollection.analytics &&
      this.childrenPrivacy.parentalConsent.given;
    permissions.performance =
      this.dataCollection.performance &&
      this.childrenPrivacy.parentalConsent.given;
    permissions.usage =
      this.dataCollection.usage && this.childrenPrivacy.parentalConsent.given;
  } else {
    permissions.location = this.dataCollection.location;
    permissions.behavior = this.dataCollection.behavior;
    permissions.thirdParty = this.dataCollection.thirdParty;
    permissions.marketing = this.marketing.allowPersonalizedAds;
    permissions.analytics = this.dataCollection.analytics;
    permissions.performance = this.dataCollection.performance;
    permissions.usage = this.dataCollection.usage;
  }

  return permissions;
};

// Static method to create compliant default settings
privacySettingsSchema.statics.createDefaultSettings = function (
  userId,
  options = {}
) {
  const isMinor = options.isMinor || false;
  const jurisdiction = options.jurisdiction || 'US';

  const settings = new this({
    userId,
    childrenPrivacy: {
      isMinor,
      restrictedData: {
        noLocation: isMinor,
        noBehavioral: isMinor,
        noThirdParty: isMinor,
        noMarketing: isMinor,
      },
    },
  });

  // Apply jurisdiction-specific defaults
  if (jurisdiction === 'EU') {
    settings.gdpr.consentGiven = false; // Must be explicitly given
    settings.dataCollection.analytics = false;
    settings.dataCollection.behavior = false;
    settings.marketing.allowPersonalizedAds = false;
  } else if (jurisdiction === 'CA') {
    settings.regionalCompliance.ccpa.doNotSell = true;
    settings.marketing.allowPersonalizedAds = false;
  }

  return settings;
};

// Method to exercise data rights
privacySettingsSchema.methods.exerciseRight = function (
  rightType,
  requestDetails
) {
  this.gdpr.rightsExercised.push({
    right: rightType,
    requestDate: new Date(),
    status: 'pending',
  });

  // Log the change
  this.audit.changes.push({
    field: 'rightsExercised',
    oldValue: null,
    newValue: rightType,
    changedAt: new Date(),
    reason: `User exercised ${rightType} right`,
  });

  return this.save();
};

// Virtual for privacy score (0-100)
privacySettingsSchema.virtual('privacyScore').get(function () {
  let score = 0;
  const maxScore = 100;

  // Profile privacy (20 points)
  if (this.profile.visibility === 'private') score += 10;
  if (!this.profile.showEmail) score += 5;
  if (!this.profile.showLocation) score += 5;

  // Data collection (30 points)
  if (!this.dataCollection.behavior) score += 10;
  if (!this.dataCollection.location) score += 10;
  if (!this.dataCollection.thirdParty) score += 10;

  // Marketing (25 points)
  if (!this.marketing.allowPersonalizedAds) score += 10;
  if (!this.marketing.allowEmailMarketing) score += 5;
  if (!this.marketing.allowBehavioralTargeting) score += 10;

  // Data sharing (25 points)
  if (!this.dataSharing.marketingProgram) score += 5;
  if (!this.dataSharing.partnersProgram) score += 10;
  if (!this.thirdParty.allowConnections) score += 10;

  return Math.round((score / maxScore) * 100);
});

export default mongoose.model('PrivacySettings', privacySettingsSchema);
