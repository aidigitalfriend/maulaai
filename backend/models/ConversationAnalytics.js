import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// CONVERSATION ANALYTICS MODEL
// ============================================
const conversationAnalyticsSchema = new Schema(
  {
    // Conversation Reference
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },

    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Agent Information
    agent: {
      agentId: {
        type: String,
        required: true,
        index: true,
      },
      agentName: {
        type: String,
        required: true,
      },
      agentVersion: {
        type: String,
        default: '1.0',
      },
      agentType: {
        type: String,
        enum: [
          'chatbot',
          'virtual_assistant',
          'customer_support',
          'sales',
          'technical',
          'custom',
        ],
        required: true,
      },
      model: {
        provider: String, // 'openai', 'anthropic', 'mistral', etc.
        name: String, // 'gpt-4', 'claude-3', etc.
        version: String,
      },
    },

    // Conversation Metadata
    conversation: {
      startTime: {
        type: Date,
        required: true,
        index: true,
      },
      endTime: Date,
      duration: {
        type: Number, // in seconds
        index: true,
      },
      status: {
        type: String,
        enum: ['completed', 'abandoned', 'escalated', 'timeout', 'error'],
        required: true,
        index: true,
      },
      channel: {
        type: String,
        enum: ['web_chat', 'mobile_app', 'api', 'widget', 'integration'],
        required: true,
      },
      language: {
        type: String,
        default: 'en',
      },
      timezone: String,
    },

    // Message Analytics
    messages: {
      total: {
        type: Number,
        required: true,
        default: 0,
      },
      userMessages: {
        type: Number,
        default: 0,
      },
      agentMessages: {
        type: Number,
        default: 0,
      },
      systemMessages: {
        type: Number,
        default: 0,
      },

      // Message characteristics
      averageLength: {
        user: Number, // characters
        agent: Number,
        overall: Number,
      },
      totalCharacters: {
        user: Number,
        agent: Number,
        total: Number,
      },

      // Message types
      messageTypes: {
        text: { type: Number, default: 0 },
        image: { type: Number, default: 0 },
        file: { type: Number, default: 0 },
        audio: { type: Number, default: 0 },
        video: { type: Number, default: 0 },
        link: { type: Number, default: 0 },
        quick_reply: { type: Number, default: 0 },
        button: { type: Number, default: 0 },
      },

      // Response times
      responseTime: {
        average: Number, // milliseconds
        median: Number,
        min: Number,
        max: Number,
        p95: Number, // 95th percentile
        p99: Number,
      },
    },

    // User Engagement Metrics
    engagement: {
      // User behavior
      userInitiated: {
        type: Boolean,
        default: true,
      },
      userSatisfaction: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        feedback: String,
        ratingDate: Date,
      },

      // Interaction patterns
      interactions: {
        clicks: Number,
        scrolls: Number,
        timeOnPage: Number, // seconds
        bounceRate: Number, // percentage
        returnVisitor: Boolean,
      },

      // Engagement quality
      quality: {
        followUpQuestions: Number,
        clarificationRequests: Number,
        topicSwitches: Number,
        conversationDepth: Number, // dialogue turns
        userCompletionRate: Number, // percentage of user completing intended flow
      },

      // Emotional analysis
      sentiment: {
        overall: {
          type: String,
          enum: [
            'very_negative',
            'negative',
            'neutral',
            'positive',
            'very_positive',
          ],
        },
        score: {
          type: Number,
          min: -1,
          max: 1,
        },
        confidence: {
          type: Number,
          min: 0,
          max: 1,
        },
        progression: [
          {
            messageIndex: Number,
            sentiment: String,
            score: Number,
            timestamp: Date,
          },
        ],
      },

      emotion: {
        detected: [String], // 'joy', 'anger', 'sadness', 'fear', 'surprise', 'disgust'
        dominant: String,
        confidence: Number,
        distribution: {
          joy: Number,
          anger: Number,
          sadness: Number,
          fear: Number,
          surprise: Number,
          disgust: Number,
          neutral: Number,
        },
      },
    },

    // Intent Analysis
    intent: {
      // Primary intent
      primary: {
        name: String,
        confidence: Number,
        category: String,
      },

      // All detected intents
      detected: [
        {
          name: String,
          confidence: Number,
          category: String,
          messageIndex: Number,
          timestamp: Date,
        },
      ],

      // Intent progression
      flow: [
        {
          from: String,
          to: String,
          transition: String,
          success: Boolean,
        },
      ],

      // Resolution tracking
      resolution: {
        resolved: Boolean,
        resolutionType: {
          type: String,
          enum: [
            'direct_answer',
            'guided_solution',
            'escalation',
            'self_service',
            'partial',
            'failed',
          ],
        },
        resolutionTime: Number, // seconds
        attempts: Number,
      },
    },

    // Topic Analysis
    topics: {
      primary: String,
      secondary: [String],

      // Topic progression
      progression: [
        {
          topic: String,
          startMessage: Number,
          endMessage: Number,
          duration: Number, // seconds
          userEngagement: Number, // 1-10 scale
        },
      ],

      // Topic clustering
      clusters: [
        {
          clusterId: String,
          keywords: [String],
          relevance: Number,
          messageCount: Number,
        },
      ],

      // Keyword analysis
      keywords: [
        {
          keyword: String,
          frequency: Number,
          importance: Number,
          context: String,
        },
      ],
    },

    // Performance Metrics
    performance: {
      // AI model performance
      aiMetrics: {
        tokensUsed: {
          input: Number,
          output: Number,
          total: Number,
        },
        cost: {
          input: Number,
          output: Number,
          total: Number,
        },
        latency: {
          average: Number, // milliseconds
          median: Number,
          p95: Number,
          p99: Number,
        },
        accuracy: Number, // 0-1 scale
        relevance: Number, // 0-1 scale
        coherence: Number, // 0-1 scale
        helpfulness: Number, // 0-1 scale
      },

      // System performance
      systemMetrics: {
        loadTime: Number, // milliseconds
        errorRate: Number, // percentage
        uptime: Number, // percentage
        throughput: Number, // messages per second
        resourceUsage: {
          cpu: Number, // percentage
          memory: Number, // MB
          storage: Number, // MB
        },
      },

      // Quality scores
      quality: {
        overallScore: Number, // 0-100
        responseQuality: Number,
        conversationFlow: Number,
        goalAchievement: Number,
        userExperience: Number,
      },
    },

    // Business Metrics
    business: {
      // Goal tracking
      goals: [
        {
          goalId: String,
          goalName: String,
          achieved: Boolean,
          value: Number,
          timestamp: Date,
        },
      ],

      // Conversion tracking
      conversion: {
        converted: Boolean,
        conversionType: String, // 'signup', 'purchase', 'lead', 'subscription'
        conversionValue: Number,
        conversionTime: Number, // seconds from start
        funnel: {
          awareness: Boolean,
          interest: Boolean,
          consideration: Boolean,
          intent: Boolean,
          evaluation: Boolean,
          purchase: Boolean,
        },
      },

      // Lead qualification
      leadQualification: {
        qualified: Boolean,
        score: Number, // 0-100
        criteria: [
          {
            criterion: String,
            met: Boolean,
            value: String,
          },
        ],
        stage: String, // 'cold', 'warm', 'hot', 'qualified'
      },

      // Revenue attribution
      revenue: {
        attributed: Boolean,
        amount: Number,
        currency: String,
        attributionModel: String, // 'first_touch', 'last_touch', 'multi_touch'
        confidence: Number,
      },
    },

    // Technical Analytics
    technical: {
      // API usage
      apiCalls: [
        {
          endpoint: String,
          method: String,
          responseTime: Number,
          statusCode: Number,
          timestamp: Date,
        },
      ],

      // Error tracking
      errors: [
        {
          errorType: String,
          errorCode: String,
          errorMessage: String,
          stackTrace: String,
          timestamp: Date,
          resolved: Boolean,
          impact: String, // 'low', 'medium', 'high', 'critical'
        },
      ],

      // Feature usage
      featuresUsed: [
        {
          featureName: String,
          usageCount: Number,
          lastUsed: Date,
        },
      ],

      // Integration data
      integrations: [
        {
          integrationType: String,
          integrationName: String,
          dataExchanged: Number, // bytes
          callCount: Number,
          successRate: Number,
          averageLatency: Number,
        },
      ],
    },

    // Context and Environment
    context: {
      // User context
      user: {
        sessionId: String,
        userAgent: String,
        deviceType: String, // 'desktop', 'mobile', 'tablet'
        browser: String,
        operatingSystem: String,
        screenResolution: String,
        location: {
          country: String,
          region: String,
          city: String,
          timezone: String,
          ipAddress: String, // hashed for privacy
        },
      },

      // Conversation context
      session: {
        isFirstConversation: Boolean,
        previousConversations: Number,
        daysSinceLastConversation: Number,
        referrer: String,
        source: String, // 'organic', 'direct', 'social', 'email', 'paid'
        campaign: String,
        medium: String,
      },

      // Business context
      business: {
        workingHours: Boolean,
        timeOfDay: String, // 'morning', 'afternoon', 'evening', 'night'
        dayOfWeek: String,
        seasonality: String,
        businessEvents: [String], // 'sale', 'launch', 'promotion', etc.
      },
    },

    // Comparative Analysis
    comparison: {
      // Benchmarking against similar conversations
      benchmark: {
        averageDuration: Number,
        averageMessages: Number,
        averageSatisfaction: Number,
        conversionRate: Number,
        resolutionRate: Number,
      },

      // Performance vs. previous conversations
      trend: {
        durationType: String, // 'shorter', 'similar', 'longer'
        satisfactionTrend: String, // 'improving', 'stable', 'declining'
        efficiencyTrend: String,
        engagementTrend: String,
      },
    },

    // Predictive Analytics
    predictions: {
      // Churn prediction
      churnRisk: {
        score: Number, // 0-1
        factors: [String],
        confidence: Number,
        timeframe: String, // 'immediate', 'short_term', 'medium_term', 'long_term'
      },

      // Next best action
      nextBestAction: {
        action: String,
        confidence: Number,
        expectedOutcome: String,
        suggestedContent: String,
      },

      // Lifetime value prediction
      lifetimeValue: {
        predicted: Number,
        confidence: Number,
        timeframe: Number, // months
        factors: [String],
      },
    },

    // Privacy and Compliance
    privacy: {
      dataProcessing: {
        anonymized: Boolean,
        pseudonymized: Boolean,
        encrypted: Boolean,
        retentionPeriod: Number, // days
        consentGiven: Boolean,
        consentDate: Date,
      },

      compliance: {
        gdprCompliant: Boolean,
        ccpaCompliant: Boolean,
        coppaCompliant: Boolean,
        hipaaCompliant: Boolean,
        customCompliance: [
          {
            regulation: String,
            compliant: Boolean,
            notes: String,
          },
        ],
      },
    },

    // Metadata and System Info
    metadata: {
      version: {
        type: String,
        default: '1.0',
      },
      source: String, // 'real_time', 'batch_processing', 'manual'
      processingTime: Number, // milliseconds
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
      tags: [String],
      customFields: {
        type: Map,
        of: String,
      },
    },
  },
  {
    timestamps: true,
    collection: 'conversationanalytics',
  }
);

// Compound indexes for performance
conversationAnalyticsSchema.index({ userId: 1, 'conversation.startTime': -1 });
conversationAnalyticsSchema.index({
  'agent.agentId': 1,
  'conversation.startTime': -1,
});
conversationAnalyticsSchema.index({ userId: 1, 'conversation.status': 1 });
conversationAnalyticsSchema.index({
  'conversation.startTime': -1,
  'conversation.endTime': -1,
});

// Single field indexes
conversationAnalyticsSchema.index({ conversationId: 1 }, { unique: true });
conversationAnalyticsSchema.index({ userId: 1 });
conversationAnalyticsSchema.index({ 'agent.agentId': 1 });
conversationAnalyticsSchema.index({ 'conversation.startTime': -1 });
conversationAnalyticsSchema.index({ 'conversation.status': 1 });
conversationAnalyticsSchema.index({ 'engagement.userSatisfaction.rating': 1 });

// TTL index for privacy compliance (configurable retention)
conversationAnalyticsSchema.index(
  { 'conversation.endTime': 1 },
  {
    expireAfterSeconds: 31536000, // 1 year default
    partialFilterExpression: {
      'privacy.dataProcessing.retentionPeriod': { $exists: false },
    },
  }
);

// Static method to get analytics for user
conversationAnalyticsSchema.statics.getAnalyticsForUser = async function (
  userId,
  options = {}
) {
  const {
    startDate,
    endDate,
    agentId,
    status,
    limit = 100,
    skip = 0,
  } = options;

  const query = { userId };

  if (startDate || endDate) {
    query['conversation.startTime'] = {};
    if (startDate) query['conversation.startTime'].$gte = startDate;
    if (endDate) query['conversation.startTime'].$lte = endDate;
  }

  if (agentId) query['agent.agentId'] = agentId;
  if (status) query['conversation.status'] = status;

  return this.find(query)
    .sort({ 'conversation.startTime': -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'email name')
    .populate('conversationId');
};

// Static method to get conversation insights
conversationAnalyticsSchema.statics.getInsights = async function (
  userId,
  timeframe = 'week'
) {
  const startDate = new Date();

  switch (timeframe) {
    case 'day':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
  }

  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        'conversation.startTime': { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalConversations: { $sum: 1 },
        completedConversations: {
          $sum: {
            $cond: [{ $eq: ['$conversation.status', 'completed'] }, 1, 0],
          },
        },
        averageDuration: { $avg: '$conversation.duration' },
        averageMessages: { $avg: '$messages.total' },
        averageSatisfaction: { $avg: '$engagement.userSatisfaction.rating' },
        totalTokens: { $sum: '$performance.aiMetrics.tokensUsed.total' },
        totalCost: { $sum: '$performance.aiMetrics.cost.total' },
        conversionCount: {
          $sum: { $cond: ['$business.conversion.converted', 1, 0] },
        },
      },
    },
  ];

  return this.aggregate(pipeline);
};

// Static method to get satisfaction trends
conversationAnalyticsSchema.statics.getSatisfactionTrends = async function (
  userId,
  days = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        'conversation.startTime': { $gte: startDate },
        'engagement.userSatisfaction.rating': { $exists: true },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$conversation.startTime',
          },
        },
        averageRating: { $avg: '$engagement.userSatisfaction.rating' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ];

  return this.aggregate(pipeline);
};

// Method to calculate engagement score
conversationAnalyticsSchema.methods.calculateEngagementScore = function () {
  let score = 0;
  let factors = 0;

  // Message engagement (40%)
  if (this.messages.total > 0) {
    const messageRatio = this.messages.userMessages / this.messages.total;
    score += messageRatio * 40;
    factors++;
  }

  // Duration engagement (30%)
  if (this.conversation.duration > 0) {
    const durationScore = Math.min(this.conversation.duration / 300, 1) * 30; // 5 minutes = max score
    score += durationScore;
    factors++;
  }

  // Satisfaction (30%)
  if (this.engagement.userSatisfaction.rating) {
    const satisfactionScore =
      (this.engagement.userSatisfaction.rating / 5) * 30;
    score += satisfactionScore;
    factors++;
  }

  return factors > 0 ? Math.round((score / factors) * 100) : 0;
};

// Method to analyze conversation patterns
conversationAnalyticsSchema.methods.analyzePatterns = function () {
  const patterns = {
    messagePattern: 'unknown',
    engagementPattern: 'unknown',
    resolutionPattern: 'unknown',
  };

  // Message pattern analysis
  const messageRatio = this.messages.userMessages / this.messages.total;
  if (messageRatio > 0.6) {
    patterns.messagePattern = 'user_driven';
  } else if (messageRatio < 0.4) {
    patterns.messagePattern = 'agent_driven';
  } else {
    patterns.messagePattern = 'balanced';
  }

  // Engagement pattern
  const engagementScore = this.calculateEngagementScore();
  if (engagementScore > 80) {
    patterns.engagementPattern = 'highly_engaged';
  } else if (engagementScore > 60) {
    patterns.engagementPattern = 'moderately_engaged';
  } else if (engagementScore > 40) {
    patterns.engagementPattern = 'low_engagement';
  } else {
    patterns.engagementPattern = 'disengaged';
  }

  // Resolution pattern
  if (this.intent.resolution.resolved) {
    if (this.intent.resolution.attempts <= 1) {
      patterns.resolutionPattern = 'quick_resolution';
    } else if (this.intent.resolution.attempts <= 3) {
      patterns.resolutionPattern = 'standard_resolution';
    } else {
      patterns.resolutionPattern = 'complex_resolution';
    }
  } else {
    patterns.resolutionPattern = 'unresolved';
  }

  return patterns;
};

// Virtual for conversation efficiency
conversationAnalyticsSchema.virtual('efficiency').get(function () {
  if (!this.conversation.duration || !this.messages.total) return 0;

  const messagesPerMinute =
    this.messages.total / (this.conversation.duration / 60);
  const resolutionBonus = this.intent.resolution.resolved ? 1.2 : 1.0;
  const satisfactionMultiplier = this.engagement.userSatisfaction.rating
    ? this.engagement.userSatisfaction.rating / 5
    : 1.0;

  return (
    Math.round(
      messagesPerMinute * resolutionBonus * satisfactionMultiplier * 10
    ) / 10
  );
});

// Virtual for cost per conversation
conversationAnalyticsSchema.virtual('costPerConversation').get(function () {
  return this.performance.aiMetrics.cost.total || 0;
});

export default mongoose.model(
  'ConversationAnalytics',
  conversationAnalyticsSchema
);
