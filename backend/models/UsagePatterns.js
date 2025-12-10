import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// USAGE PATTERNS MODEL
// ============================================
const usagePatternsSchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Pattern Analysis Period
    analysisWindow: {
      startDate: {
        type: Date,
        required: true,
        index: true,
      },
      endDate: {
        type: Date,
        required: true,
        index: true,
      },
      duration: {
        type: Number, // days
        required: true,
      },
      analysisType: {
        type: String,
        enum: [
          'real_time',
          'daily',
          'weekly',
          'monthly',
          'quarterly',
          'annual',
          'custom',
        ],
        required: true,
        index: true,
      },
    },

    // Temporal Usage Patterns
    temporal: {
      // Time-of-day patterns
      hourlyUsage: [
        {
          hour: {
            type: Number,
            min: 0,
            max: 23,
          },
          usage: {
            conversations: Number,
            messages: Number,
            duration: Number, // seconds
            uniqueSessions: Number,
          },
          averageEngagement: Number,
          peakConcurrency: Number,
        },
      ],

      // Day-of-week patterns
      dailyUsage: [
        {
          dayOfWeek: {
            type: Number,
            min: 0,
            max: 6, // 0 = Sunday
          },
          dayName: String,
          usage: {
            conversations: Number,
            messages: Number,
            duration: Number,
            uniqueSessions: Number,
          },
          averageEngagement: Number,
          typicalStartTime: String,
          typicalEndTime: String,
        },
      ],

      // Monthly patterns
      monthlyUsage: [
        {
          month: {
            type: Number,
            min: 1,
            max: 12,
          },
          monthName: String,
          usage: {
            conversations: Number,
            messages: Number,
            duration: Number,
            uniqueSessions: Number,
          },
          seasonalFactor: Number, // multiplier vs average
          growthRate: Number, // percentage
        },
      ],

      // Peak usage identification
      peakPeriods: [
        {
          periodType: String, // 'hour', 'day', 'week', 'month'
          startTime: Date,
          endTime: Date,
          duration: Number,
          peakMetric: String, // 'conversations', 'messages', 'concurrent_users'
          peakValue: Number,
          normalValue: Number,
          intensityFactor: Number,
        },
      ],

      // Usage frequency patterns
      frequency: {
        dailyActiveUsers: Number,
        weeklyActiveUsers: Number,
        monthlyActiveUsers: Number,
        averageSessionsPerDay: Number,
        averageDaysBetweenSessions: Number,
        usageConsistency: Number, // 0-1 score
        burstyBehavior: Boolean,
      },
    },

    // Behavioral Usage Patterns
    behavioral: {
      // Session patterns
      sessionPatterns: {
        averageSessionDuration: Number, // seconds
        sessionDurationDistribution: [
          {
            range: String, // '0-5min', '5-15min', etc.
            count: Number,
            percentage: Number,
          },
        ],
        shortSessions: {
          // < 5 minutes
          count: Number,
          percentage: Number,
          averageDuration: Number,
        },
        mediumSessions: {
          // 5-30 minutes
          count: Number,
          percentage: Number,
          averageDuration: Number,
        },
        longSessions: {
          // > 30 minutes
          count: Number,
          percentage: Number,
          averageDuration: Number,
        },
        sessionInitiationPatterns: [
          {
            trigger: String, // 'proactive', 'reactive', 'scheduled', 'notification'
            count: Number,
            successRate: Number,
            averageEngagement: Number,
          },
        ],
      },

      // Conversation patterns
      conversationPatterns: {
        averageConversationLength: Number, // number of messages
        conversationLengthDistribution: [
          {
            range: String, // '1-5', '6-15', etc.
            count: Number,
            percentage: Number,
          },
        ],
        topicSwitchingFrequency: Number,
        multitaskingBehavior: {
          frequency: Number, // conversations per session
          simultaneousConversations: Number,
          contextSwitchingRate: Number,
        },
        conversationCompletion: {
          completionRate: Number, // percentage
          abandonmentRate: Number,
          averageDropOffPoint: Number, // message index
        },
      },

      // Interaction patterns
      interactionPatterns: {
        responseTimePreference: {
          immediate: Number, // < 1 second
          quick: Number, // 1-5 seconds
          moderate: Number, // 5-15 seconds
          patient: Number, // > 15 seconds
        },
        messageComplexity: {
          simple: Number, // < 50 characters
          medium: Number, // 50-200 characters
          complex: Number, // > 200 characters
          averageLength: Number,
        },
        questioningBehavior: {
          questionsPerConversation: Number,
          followUpRate: Number, // percentage
          clarificationRequests: Number,
          detailSeekingBehavior: Number, // 1-10 scale
        },
        helpSeekingPatterns: {
          selfServiceAttempts: Number,
          escalationRate: Number, // percentage
          documentationUsage: Number,
          preferredHelpFormat: String, // 'text', 'visual', 'interactive'
        },
      },
    },

    // Feature Usage Patterns
    features: {
      // Core feature usage
      coreFeatures: [
        {
          featureName: String,
          usageCount: Number,
          usageFrequency: Number, // uses per session
          adoptionRate: Number, // percentage of users
          proficiencyLevel: String, // 'beginner', 'intermediate', 'advanced'
          lastUsed: Date,
          usageTrend: String, // 'increasing', 'stable', 'decreasing'
        },
      ],

      // Advanced feature usage
      advancedFeatures: [
        {
          featureName: String,
          usageCount: Number,
          usageFrequency: Number,
          adoptionDate: Date,
          mastery: Number, // 0-1 score
          dependencyFeatures: [String], // features used together
          usageContext: String, // when/why feature is used
        },
      ],

      // Feature discovery patterns
      discovery: {
        averageTimeToFeatureDiscovery: Number, // days
        discoveryMethods: [
          {
            method: String, // 'exploration', 'tutorial', 'help', 'friend'
            featureCount: Number,
            successRate: Number,
          },
        ],
        featureAbandonmentRate: Number, // percentage
        featureRetentionRate: Number,
      },

      // Feature combinations
      combinations: [
        {
          features: [String],
          usageCount: Number,
          sequence: [String],
          effectiveness: Number, // success rate of combination
          userSatisfaction: Number,
        },
      ],
    },

    // Content and Communication Patterns
    communication: {
      // Communication style
      style: {
        verbosity: String, // 'concise', 'moderate', 'verbose'
        formality: String, // 'casual', 'professional', 'formal'
        emotionalExpression: String, // 'reserved', 'moderate', 'expressive'
        technicalLevel: String, // 'basic', 'intermediate', 'advanced'
      },

      // Language patterns
      language: {
        primaryLanguage: String,
        languageVariants: [String],
        multilingualBehavior: Boolean,
        vocabularyLevel: String,
        grammarComplexity: String,
        slangUsage: Number, // frequency
      },

      // Content preferences
      contentPreferences: {
        preferredContentTypes: [
          {
            type: String, // 'text', 'images', 'videos', 'links', 'files'
            preference: Number, // 1-10 scale
            usageFrequency: Number,
          },
        ],
        informationDensity: String, // 'light', 'medium', 'dense'
        explanationStyle: String, // 'step_by_step', 'overview', 'detailed'
        examplePreference: Boolean,
      },

      // Communication timing
      timing: {
        preferredResponseTiming: String, // 'immediate', 'quick', 'thoughtful'
        patienceLevel: Number, // seconds willing to wait
        timeoutBehavior: String, // 'wait', 'retry', 'abandon'
        notificationPreferences: {
          immediate: Boolean,
          batched: Boolean,
          scheduled: Boolean,
        },
      },
    },

    // Device and Platform Patterns
    platform: {
      // Device usage patterns
      devices: [
        {
          deviceType: String, // 'desktop', 'mobile', 'tablet'
          usagePercentage: Number,
          sessionDuration: Number, // average for this device
          preferredFeatures: [String],
          limitations: [String], // features less used on this device
          performance: {
            loadTime: Number,
            responsiveness: Number,
            errorRate: Number,
          },
        },
      ],

      // Browser/app patterns
      applications: [
        {
          platform: String, // 'web', 'mobile_app', 'desktop_app'
          usagePercentage: Number,
          version: String,
          featureAvailability: [String],
          userExperience: {
            rating: Number,
            commonIssues: [String],
            preferredInterface: String,
          },
        },
      ],

      // Cross-platform behavior
      crossPlatform: {
        deviceSwitching: Boolean,
        continuityUsage: Number, // percentage of cross-device sessions
        synchronizationImportance: Number, // 1-10 scale
        preferredStartDevice: String,
        handoffPatterns: [
          {
            fromDevice: String,
            toDevice: String,
            frequency: Number,
            context: String,
          },
        ],
      },
    },

    // Geographic and Cultural Patterns
    geographic: {
      // Location-based patterns
      locations: [
        {
          country: String,
          region: String,
          city: String,
          usagePercentage: Number,
          localizedBehavior: {
            languagePreference: String,
            culturalAdaptations: [String],
            localFeatureUsage: [String],
          },
          connectivityPatterns: {
            averageSpeed: String,
            reliabilityScore: Number,
            peakUsageHours: [Number],
          },
        },
      ],

      // Timezone patterns
      timezone: {
        primaryTimezone: String,
        timezoneChanges: Number, // frequency of travel
        adaptationBehavior: String, // how user adapts to new timezones
        globalUsagePattern: Boolean, // uses service across timezones
      },

      // Cultural adaptations
      cultural: {
        communicationStyle: String,
        formalityExpectations: String,
        colorPreferences: [String],
        layoutPreferences: String,
        privacyExpectations: String, // 'low', 'medium', 'high'
      },
    },

    // Learning and Adaptation Patterns
    learning: {
      // Skill progression
      skillProgression: {
        initialSkillLevel: String, // 'beginner', 'intermediate', 'advanced'
        currentSkillLevel: String,
        learningRate: Number, // skill points gained per week
        plateauPeriods: [
          {
            startDate: Date,
            endDate: Date,
            skillLevel: String,
            breakthroughTrigger: String,
          },
        ],
      },

      // Learning preferences
      preferences: {
        learningStyle: String, // 'visual', 'auditory', 'kinesthetic', 'mixed'
        pacePreference: String, // 'self_paced', 'guided', 'accelerated'
        feedbackFrequency: String, // 'immediate', 'periodic', 'minimal'
        challengeLevel: String, // 'easy', 'moderate', 'difficult'
      },

      // Adaptation behavior
      adaptation: {
        changeAdaptationRate: Number, // 1-10 scale
        featureAdoptionSpeed: Number, // days to adopt new features
        resistanceToChange: Number, // 1-10 scale
        customizationLevel: Number, // extent of personalization
        helpSeekingBehavior: String, // 'independent', 'collaborative', 'dependent'
      },
    },

    // Predictive Patterns
    predictions: {
      // Usage prediction
      futurePredictions: {
        predictedUsageGrowth: Number, // percentage over next month
        predictedFeatureAdoption: [String],
        predictedChurnRisk: Number, // 0-1 probability
        predictedLifetimeValue: Number,
        confidence: Number, // 0-1 confidence in predictions
      },

      // Behavioral predictions
      behaviorPredictions: {
        nextLikelyAction: String,
        nextLikelyFeature: String,
        nextLikelyTopic: String,
        sessionDurationPrediction: Number,
        engagementPrediction: Number, // 1-10 scale
      },

      // Trend predictions
      trends: {
        shortTermTrend: String, // next week
        mediumTermTrend: String, // next month
        longTermTrend: String, // next quarter
        seasonalPredictions: [
          {
            season: String,
            expectedUsage: Number,
            confidence: Number,
          },
        ],
      },
    },

    // Pattern Analysis Metadata
    analysis: {
      // Pattern strength and reliability
      patternStrength: {
        temporal: Number, // 0-1 how consistent temporal patterns are
        behavioral: Number, // 0-1 how predictable behavior is
        feature: Number, // 0-1 how consistent feature usage is
        overall: Number, // 0-1 overall pattern predictability
      },

      // Statistical measures
      statistics: {
        sampleSize: Number, // number of data points analyzed
        confidence: Number, // 0-1 confidence in pattern analysis
        variance: Number, // measure of pattern consistency
        outliers: Number, // number of outlier sessions identified
        dataQuality: Number, // 0-1 quality of underlying data
      },

      // Analysis methodology
      methodology: {
        algorithmUsed: String,
        parametersUsed: {
          type: Map,
          of: String,
        },
        validationMethod: String,
        lastUpdated: Date,
        updateFrequency: String,
      },
    },

    // Pattern Change Tracking
    changes: {
      // Pattern evolution
      evolution: [
        {
          date: Date,
          patternType: String,
          changeType: String, // 'emergence', 'strengthening', 'weakening', 'disappearance'
          changeDescription: String,
          impact: String, // 'minor', 'moderate', 'major'
          triggers: [String], // what caused the change
        },
      ],

      // Stability metrics
      stability: {
        changeFrequency: Number, // changes per month
        stabilityScore: Number, // 0-1 how stable patterns are
        volatilityMeasure: Number, // measure of pattern volatility
        adaptabilityScore: Number, // how quickly user adapts to changes
      },
    },
  },
  {
    timestamps: true,
    collection: 'usagepatterns',
  }
);

// Compound indexes for performance
usagePatternsSchema.index({ userId: 1, 'analysisWindow.startDate': -1 });
usagePatternsSchema.index({ userId: 1, 'analysisWindow.analysisType': 1 });
usagePatternsSchema.index({
  'analysisWindow.startDate': -1,
  'analysisWindow.endDate': -1,
});

// Single field indexes
usagePatternsSchema.index({ userId: 1 });
usagePatternsSchema.index({ 'analysisWindow.analysisType': 1 });
usagePatternsSchema.index({ 'analysisWindow.startDate': -1 });
usagePatternsSchema.index({ 'analysis.patternStrength.overall': -1 });

// TTL index for old patterns (keep for 1 year)
usagePatternsSchema.index(
  { 'analysisWindow.endDate': 1 },
  {
    expireAfterSeconds: 31536000, // 1 year
  }
);

// Static method to get usage patterns for user
usagePatternsSchema.statics.getPatternsForUser = async function (
  userId,
  analysisType = null
) {
  const query = { userId };
  if (analysisType) query['analysisWindow.analysisType'] = analysisType;

  return this.find(query).sort({ 'analysisWindow.startDate': -1 }).limit(10);
};

// Static method to get latest patterns
usagePatternsSchema.statics.getLatestPatterns = async function (userId) {
  return this.findOne({ userId }).sort({ 'analysisWindow.startDate': -1 });
};

// Static method to analyze pattern trends
usagePatternsSchema.statics.analyzeTrends = async function (
  userId,
  months = 6
) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        'analysisWindow.startDate': { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m',
            date: '$analysisWindow.startDate',
          },
        },
        avgPatternStrength: { $avg: '$analysis.patternStrength.overall' },
        avgStabilityScore: { $avg: '$changes.stability.stabilityScore' },
        changeFrequency: { $avg: '$changes.stability.changeFrequency' },
        patternCount: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ];

  return this.aggregate(pipeline);
};

// Method to identify peak usage periods
usagePatternsSchema.methods.identifyPeakPeriods = function () {
  const peaks = [];

  // Analyze hourly patterns for peaks
  let maxHourlyUsage = 0;
  let peakHour = null;

  this.temporal.hourlyUsage.forEach((hourData) => {
    const totalUsage = hourData.usage.conversations + hourData.usage.messages;
    if (totalUsage > maxHourlyUsage) {
      maxHourlyUsage = totalUsage;
      peakHour = hourData.hour;
    }
  });

  if (peakHour !== null) {
    peaks.push({
      periodType: 'hour',
      startTime: new Date().setHours(peakHour, 0, 0, 0),
      endTime: new Date().setHours(peakHour + 1, 0, 0, 0),
      duration: 3600, // 1 hour in seconds
      peakMetric: 'total_usage',
      peakValue: maxHourlyUsage,
      intensityFactor: this.calculateIntensityFactor(maxHourlyUsage, 'hourly'),
    });
  }

  // Analyze daily patterns
  let maxDailyUsage = 0;
  let peakDay = null;

  this.temporal.dailyUsage.forEach((dayData) => {
    const totalUsage = dayData.usage.conversations + dayData.usage.messages;
    if (totalUsage > maxDailyUsage) {
      maxDailyUsage = totalUsage;
      peakDay = dayData.dayOfWeek;
    }
  });

  if (peakDay !== null) {
    peaks.push({
      periodType: 'day',
      peakMetric: 'total_usage',
      peakValue: maxDailyUsage,
      intensityFactor: this.calculateIntensityFactor(maxDailyUsage, 'daily'),
    });
  }

  this.temporal.peakPeriods = peaks;
  return peaks;
};

// Method to calculate intensity factor
usagePatternsSchema.methods.calculateIntensityFactor = function (
  peakValue,
  periodType
) {
  let averageUsage = 0;

  if (periodType === 'hourly') {
    const totalUsage = this.temporal.hourlyUsage.reduce(
      (sum, h) => sum + h.usage.conversations + h.usage.messages,
      0
    );
    averageUsage = totalUsage / this.temporal.hourlyUsage.length;
  } else if (periodType === 'daily') {
    const totalUsage = this.temporal.dailyUsage.reduce(
      (sum, d) => sum + d.usage.conversations + d.usage.messages,
      0
    );
    averageUsage = totalUsage / this.temporal.dailyUsage.length;
  }

  return averageUsage > 0 ? peakValue / averageUsage : 1;
};

// Method to analyze behavioral changes
usagePatternsSchema.methods.analyzeBehavioralChanges = function (
  previousPattern
) {
  const changes = [];

  if (previousPattern) {
    // Session duration changes
    const sessionDurationChange =
      this.behavioral.sessionPatterns.averageSessionDuration -
      previousPattern.behavioral.sessionPatterns.averageSessionDuration;

    if (Math.abs(sessionDurationChange) > 60) {
      // More than 1 minute change
      changes.push({
        date: new Date(),
        patternType: 'session_duration',
        changeType: sessionDurationChange > 0 ? 'strengthening' : 'weakening',
        changeDescription: `Average session duration ${
          sessionDurationChange > 0 ? 'increased' : 'decreased'
        } by ${Math.abs(sessionDurationChange)} seconds`,
        impact: Math.abs(sessionDurationChange) > 300 ? 'major' : 'moderate',
        triggers: ['user_engagement_change', 'feature_adoption'],
      });
    }

    // Feature usage changes
    this.features.coreFeatures.forEach((feature) => {
      const prevFeature = previousPattern.features.coreFeatures.find(
        (f) => f.featureName === feature.featureName
      );
      if (prevFeature) {
        const usageChange =
          ((feature.usageCount - prevFeature.usageCount) /
            prevFeature.usageCount) *
          100;

        if (Math.abs(usageChange) > 20) {
          // More than 20% change
          changes.push({
            date: new Date(),
            patternType: 'feature_usage',
            changeType: usageChange > 0 ? 'strengthening' : 'weakening',
            changeDescription: `${
              feature.featureName
            } usage changed by ${usageChange.toFixed(1)}%`,
            impact: Math.abs(usageChange) > 50 ? 'major' : 'moderate',
            triggers: ['feature_update', 'user_preference_change'],
          });
        }
      }
    });
  }

  this.changes.evolution = changes;
  return changes;
};

// Method to predict future usage
usagePatternsSchema.methods.predictFutureUsage = function () {
  // Simple linear prediction based on historical trends
  const predictions = {
    predictedUsageGrowth: 0,
    predictedFeatureAdoption: [],
    predictedChurnRisk: 0,
    confidence: 0.7,
  };

  // Calculate usage growth based on pattern strength
  const patternStrength = this.analysis.patternStrength.overall;
  const stabilityScore = this.changes.stability.stabilityScore;

  // Higher pattern strength and stability suggest predictable growth
  predictions.predictedUsageGrowth = (patternStrength + stabilityScore) * 10; // percentage

  // Predict feature adoption based on current trends
  this.features.coreFeatures.forEach((feature) => {
    if (feature.usageTrend === 'increasing' && feature.adoptionRate < 80) {
      predictions.predictedFeatureAdoption.push(feature.featureName);
    }
  });

  // Calculate churn risk based on engagement and stability
  const avgEngagement =
    this.temporal.hourlyUsage.reduce(
      (sum, h) => sum + (h.averageEngagement || 5),
      0
    ) / this.temporal.hourlyUsage.length;

  predictions.predictedChurnRisk = Math.max(0, (10 - avgEngagement) / 10);

  // Adjust confidence based on data quality
  predictions.confidence =
    this.analysis.statistics.dataQuality * this.analysis.statistics.confidence;

  this.predictions.futurePredictions = predictions;
  return predictions;
};

// Virtual for user persona
usagePatternsSchema.virtual('userPersona').get(function () {
  const persona = {
    type: 'unknown',
    characteristics: [],
    confidence: 0,
  };

  // Determine persona based on usage patterns
  const avgSessionDuration =
    this.behavioral.sessionPatterns.averageSessionDuration;
  const featureUsageCount = this.features.coreFeatures.length;
  const patternStrength = this.analysis.patternStrength.overall;

  if (avgSessionDuration > 1800 && featureUsageCount > 10) {
    persona.type = 'power_user';
    persona.characteristics = [
      'long_sessions',
      'feature_explorer',
      'consistent_usage',
    ];
  } else if (avgSessionDuration < 300 && featureUsageCount < 5) {
    persona.type = 'casual_user';
    persona.characteristics = [
      'short_sessions',
      'basic_features',
      'sporadic_usage',
    ];
  } else if (patternStrength > 0.8) {
    persona.type = 'routine_user';
    persona.characteristics = [
      'predictable_usage',
      'consistent_behavior',
      'habitual',
    ];
  } else {
    persona.type = 'explorer';
    persona.characteristics = ['variable_usage', 'trying_features', 'learning'];
  }

  persona.confidence = patternStrength;
  return persona;
});

// Virtual for engagement level
usagePatternsSchema.virtual('engagementLevel').get(function () {
  const sessionFrequency = this.temporal.frequency.dailyActiveUsers;
  const sessionDuration =
    this.behavioral.sessionPatterns.averageSessionDuration;
  const featureAdoption = this.features.coreFeatures.length;

  // Calculate engagement score (0-100)
  const frequencyScore = Math.min(sessionFrequency * 10, 40);
  const durationScore = Math.min(sessionDuration / 60, 30); // max 30 for 30+ minutes
  const featureScore = Math.min(featureAdoption * 3, 30);

  const totalScore = frequencyScore + durationScore + featureScore;

  if (totalScore >= 80) return 'high';
  if (totalScore >= 60) return 'medium';
  if (totalScore >= 40) return 'low';
  return 'very_low';
});

export default mongoose.model('UsagePatterns', usagePatternsSchema);
