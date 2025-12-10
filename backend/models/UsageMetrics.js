import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// USAGE METRICS MODEL
// ============================================
const usageMetricsSchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Time Period
    period: {
      type: {
        type: String,
        enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
        required: true,
        index: true,
      },
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
      timezone: {
        type: String,
        default: 'UTC',
      },
    },

    // Conversation Metrics
    conversations: {
      total: {
        type: Number,
        default: 0,
      },
      completed: {
        type: Number,
        default: 0,
      },
      abandoned: {
        type: Number,
        default: 0,
      },
      averageDuration: {
        type: Number,
        default: 0, // in seconds
      },
      totalDuration: {
        type: Number,
        default: 0, // in seconds
      },
      byAgent: [
        {
          agentId: String,
          agentName: String,
          count: Number,
          duration: Number,
        },
      ],
    },

    // Message Metrics
    messages: {
      sent: {
        type: Number,
        default: 0,
      },
      received: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
      averageLength: {
        type: Number,
        default: 0, // characters
      },
      totalCharacters: {
        type: Number,
        default: 0,
      },
      mediaMessages: {
        images: { type: Number, default: 0 },
        files: { type: Number, default: 0 },
        audio: { type: Number, default: 0 },
        video: { type: Number, default: 0 },
      },
    },

    // API Usage
    api: {
      totalCalls: {
        type: Number,
        default: 0,
      },
      successfulCalls: {
        type: Number,
        default: 0,
      },
      failedCalls: {
        type: Number,
        default: 0,
      },
      averageResponseTime: {
        type: Number,
        default: 0, // milliseconds
      },
      byEndpoint: [
        {
          endpoint: String,
          method: String,
          calls: Number,
          errors: Number,
          avgResponseTime: Number,
        },
      ],
      rateLimitHits: {
        type: Number,
        default: 0,
      },
    },

    // Token Usage (AI Models)
    tokens: {
      inputTokens: {
        type: Number,
        default: 0,
      },
      outputTokens: {
        type: Number,
        default: 0,
      },
      totalTokens: {
        type: Number,
        default: 0,
      },
      byModel: [
        {
          model: String,
          inputTokens: Number,
          outputTokens: Number,
          totalTokens: Number,
          cost: Number,
        },
      ],
      estimatedCost: {
        type: Number,
        default: 0,
      },
    },

    // Feature Usage
    features: {
      agentsUsed: [
        {
          agentId: String,
          agentName: String,
          interactions: Number,
          lastUsed: Date,
        },
      ],
      toolsUsed: [
        {
          toolName: String,
          usageCount: Number,
          lastUsed: Date,
        },
      ],
      experimentsParticipated: [
        {
          experimentId: String,
          experimentName: String,
          startDate: Date,
          endDate: Date,
        },
      ],
    },

    // Storage Usage
    storage: {
      totalUsed: {
        type: Number,
        default: 0, // in bytes
      },
      conversationHistory: {
        type: Number,
        default: 0,
      },
      uploadedFiles: {
        type: Number,
        default: 0,
      },
      mediaFiles: {
        type: Number,
        default: 0,
      },
      backups: {
        type: Number,
        default: 0,
      },
      breakdown: [
        {
          category: String,
          sizeBytes: Number,
          fileCount: Number,
        },
      ],
    },

    // Billing Usage
    billing: {
      planType: String,
      subscriptionId: String,
      cycleStart: Date,
      cycleEnd: Date,
      usage: {
        conversations: { used: Number, limit: Number },
        messages: { used: Number, limit: Number },
        apiCalls: { used: Number, limit: Number },
        storage: { used: Number, limit: Number },
        agents: { used: Number, limit: Number },
      },
      overages: [
        {
          resource: String,
          overage: Number,
          cost: Number,
        },
      ],
      estimatedBill: {
        type: Number,
        default: 0,
      },
    },

    // Performance Metrics
    performance: {
      averageLoadTime: {
        type: Number,
        default: 0, // milliseconds
      },
      slowQueries: {
        type: Number,
        default: 0,
      },
      errorRate: {
        type: Number,
        default: 0, // percentage
      },
      uptime: {
        type: Number,
        default: 100, // percentage
      },
      throughput: {
        type: Number,
        default: 0, // requests per second
      },
    },

    // User Behavior
    behavior: {
      sessionsCount: {
        type: Number,
        default: 0,
      },
      averageSessionDuration: {
        type: Number,
        default: 0, // seconds
      },
      totalActiveTime: {
        type: Number,
        default: 0, // seconds
      },
      pageViews: {
        type: Number,
        default: 0,
      },
      uniquePages: {
        type: Number,
        default: 0,
      },
      bounceRate: {
        type: Number,
        default: 0, // percentage
      },
      retentionRate: {
        type: Number,
        default: 0, // percentage
      },
    },

    // Geographic Data
    geographic: {
      countries: [
        {
          countryCode: String,
          countryName: String,
          sessions: Number,
          duration: Number,
        },
      ],
      regions: [
        {
          region: String,
          sessions: Number,
        },
      ],
      cities: [
        {
          city: String,
          sessions: Number,
        },
      ],
    },

    // Device and Platform
    devices: {
      desktop: { type: Number, default: 0 },
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
      browsers: [
        {
          browser: String,
          version: String,
          sessions: Number,
        },
      ],
      operatingSystems: [
        {
          os: String,
          version: String,
          sessions: Number,
        },
      ],
    },

    // Cost Analysis
    costs: {
      totalCost: {
        type: Number,
        default: 0,
      },
      breakdown: [
        {
          category: {
            type: String,
            enum: [
              'api_calls',
              'storage',
              'tokens',
              'features',
              'support',
              'other',
            ],
          },
          cost: Number,
          quantity: Number,
          unit: String,
          unitCost: Number,
        },
      ],
      savings: {
        type: Number,
        default: 0,
      },
      efficiency: {
        costPerConversation: Number,
        costPerMessage: Number,
        costPerAPICall: Number,
        costPerToken: Number,
      },
    },

    // Trends and Comparisons
    trends: {
      growthRate: {
        conversations: Number, // percentage
        messages: Number,
        apiCalls: Number,
        tokens: Number,
      },
      comparisonToPreviousPeriod: {
        conversations: { current: Number, previous: Number, change: Number },
        messages: { current: Number, previous: Number, change: Number },
        costs: { current: Number, previous: Number, change: Number },
      },
      seasonality: {
        pattern: String,
        confidence: Number,
        forecast: Number,
      },
    },

    // Quality Metrics
    quality: {
      satisfactionScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 10,
      },
      responseTime: {
        average: Number,
        median: Number,
        p95: Number,
        p99: Number,
      },
      accuracy: {
        type: Number,
        default: 0, // percentage
      },
      completionRate: {
        type: Number,
        default: 0, // percentage
      },
    },

    // Aggregation Metadata
    aggregation: {
      lastCalculated: {
        type: Date,
        default: Date.now,
      },
      calculationDuration: {
        type: Number,
        default: 0, // milliseconds
      },
      dataPoints: {
        type: Number,
        default: 0,
      },
      confidence: {
        type: Number,
        default: 100, // percentage
      },
      version: {
        type: String,
        default: '1.0',
      },
    },
  },
  {
    timestamps: true,
    collection: 'usagemetrics',
  }
);

// Compound indexes for performance
usageMetricsSchema.index({
  userId: 1,
  'period.type': 1,
  'period.startDate': -1,
});
usageMetricsSchema.index({ 'period.startDate': -1, 'period.endDate': -1 });
usageMetricsSchema.index({ userId: 1, 'period.startDate': -1 });

// Single field indexes
usageMetricsSchema.index({ userId: 1 });
usageMetricsSchema.index({ 'period.type': 1 });
usageMetricsSchema.index({ 'period.startDate': -1 });

// TTL index for old metrics (keep for 2 years)
usageMetricsSchema.index(
  { 'period.endDate': 1 },
  {
    expireAfterSeconds: 63072000, // 2 years
  }
);

// Static method to get metrics for user and period
usageMetricsSchema.statics.getMetricsForPeriod = async function (
  userId,
  periodType,
  startDate,
  endDate
) {
  return this.find({
    userId,
    'period.type': periodType,
    'period.startDate': { $gte: startDate },
    'period.endDate': { $lte: endDate },
  }).sort({ 'period.startDate': -1 });
};

// Static method to get latest metrics for user
usageMetricsSchema.statics.getLatestForUser = async function (
  userId,
  periodType = 'daily',
  limit = 30
) {
  return this.find({
    userId,
    'period.type': periodType,
  })
    .sort({ 'period.startDate': -1 })
    .limit(limit);
};

// Static method to aggregate usage across time periods
usageMetricsSchema.statics.aggregateUsage = async function (
  userId,
  startDate,
  endDate
) {
  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        'period.startDate': { $gte: startDate },
        'period.endDate': { $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalConversations: { $sum: '$conversations.total' },
        totalMessages: { $sum: '$messages.total' },
        totalTokens: { $sum: '$tokens.totalTokens' },
        totalCost: { $sum: '$costs.totalCost' },
        totalAPICall: { $sum: '$api.totalCalls' },
        avgSatisfaction: { $avg: '$quality.satisfactionScore' },
        avgResponseTime: { $avg: '$quality.responseTime.average' },
      },
    },
  ];

  return this.aggregate(pipeline);
};

// Method to calculate cost efficiency
usageMetricsSchema.methods.calculateEfficiency = function () {
  const efficiency = {};

  if (this.conversations.total > 0) {
    efficiency.costPerConversation =
      this.costs.totalCost / this.conversations.total;
  }

  if (this.messages.total > 0) {
    efficiency.costPerMessage = this.costs.totalCost / this.messages.total;
  }

  if (this.api.totalCalls > 0) {
    efficiency.costPerAPICall = this.costs.totalCost / this.api.totalCalls;
  }

  if (this.tokens.totalTokens > 0) {
    efficiency.costPerToken = this.costs.totalCost / this.tokens.totalTokens;
  }

  this.costs.efficiency = efficiency;
  return efficiency;
};

// Method to generate usage report
usageMetricsSchema.methods.generateReport = function () {
  return {
    period: {
      type: this.period.type,
      start: this.period.startDate,
      end: this.period.endDate,
    },
    summary: {
      conversations: this.conversations.total,
      messages: this.messages.total,
      apiCalls: this.api.totalCalls,
      tokens: this.tokens.totalTokens,
      cost: this.costs.totalCost,
      satisfaction: this.quality.satisfactionScore,
    },
    efficiency: this.costs.efficiency,
    trends: this.trends,
    topAgents: this.conversations.byAgent
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    deviceBreakdown: this.devices,
  };
};

// Virtual for usage percentage (of limits)
usageMetricsSchema.virtual('usagePercentage').get(function () {
  const percentages = {};

  if (this.billing.usage) {
    Object.keys(this.billing.usage).forEach((resource) => {
      const { used, limit } = this.billing.usage[resource];
      if (limit > 0) {
        percentages[resource] = Math.round((used / limit) * 100);
      }
    });
  }

  return percentages;
});

export default mongoose.model('UsageMetrics', usageMetricsSchema);
