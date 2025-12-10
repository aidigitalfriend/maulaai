import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// COST BREAKDOWN MODEL
// ============================================
const costBreakdownSchema = new Schema(
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
        enum: ['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
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

    // Overall Cost Summary
    totalCost: {
      type: Number,
      required: true,
      default: 0,
    },

    currency: {
      type: String,
      required: true,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'],
    },

    exchangeRate: {
      type: Number,
      default: 1.0,
    },

    // Subscription Costs
    subscription: {
      baseCost: {
        type: Number,
        default: 0,
      },
      planName: String,
      planType: {
        type: String,
        enum: ['free', 'basic', 'premium', 'enterprise', 'custom'],
      },
      isProrated: {
        type: Boolean,
        default: false,
      },
      proratedDays: {
        type: Number,
        default: 0,
      },
      discounts: [
        {
          name: String,
          type: {
            type: String,
            enum: ['percentage', 'fixed_amount', 'credits'],
          },
          value: Number,
          amount: Number,
          description: String,
        },
      ],
      netCost: {
        type: Number,
        default: 0,
      },
    },

    // Usage-Based Costs
    usage: {
      // Conversation Costs
      conversations: {
        included: {
          type: Number,
          default: 0,
        },
        used: {
          type: Number,
          default: 0,
        },
        overage: {
          type: Number,
          default: 0,
        },
        ratePerUnit: {
          type: Number,
          default: 0,
        },
        cost: {
          type: Number,
          default: 0,
        },
        breakdown: [
          {
            agentType: String,
            agentName: String,
            count: Number,
            rate: Number,
            cost: Number,
          },
        ],
      },

      // Message Costs
      messages: {
        included: {
          type: Number,
          default: 0,
        },
        used: {
          type: Number,
          default: 0,
        },
        overage: {
          type: Number,
          default: 0,
        },
        ratePerUnit: {
          type: Number,
          default: 0,
        },
        cost: {
          type: Number,
          default: 0,
        },
        breakdown: [
          {
            messageType: String, // 'text', 'image', 'file', 'audio'
            count: Number,
            rate: Number,
            cost: Number,
          },
        ],
      },

      // API Call Costs
      apiCalls: {
        included: {
          type: Number,
          default: 0,
        },
        used: {
          type: Number,
          default: 0,
        },
        overage: {
          type: Number,
          default: 0,
        },
        ratePerUnit: {
          type: Number,
          default: 0,
        },
        cost: {
          type: Number,
          default: 0,
        },
        breakdown: [
          {
            endpoint: String,
            method: String,
            count: Number,
            rate: Number,
            cost: Number,
            averageLatency: Number,
          },
        ],
      },

      // Token Costs (AI Models)
      tokens: {
        inputTokens: {
          used: Number,
          rate: Number,
          cost: Number,
        },
        outputTokens: {
          used: Number,
          rate: Number,
          cost: Number,
        },
        totalCost: {
          type: Number,
          default: 0,
        },
        breakdown: [
          {
            model: String,
            provider: String, // 'openai', 'anthropic', 'mistral', etc.
            inputTokens: Number,
            outputTokens: Number,
            inputRate: Number,
            outputRate: Number,
            cost: Number,
            usage: Number, // number of requests
          },
        ],
      },

      // Storage Costs
      storage: {
        included: {
          type: Number,
          default: 0, // in GB
        },
        used: {
          type: Number,
          default: 0,
        },
        overage: {
          type: Number,
          default: 0,
        },
        ratePerGB: {
          type: Number,
          default: 0,
        },
        cost: {
          type: Number,
          default: 0,
        },
        breakdown: [
          {
            storageType: String, // 'conversations', 'files', 'media', 'backups'
            sizeGB: Number,
            rate: Number,
            cost: Number,
          },
        ],
      },

      // Bandwidth Costs
      bandwidth: {
        used: {
          type: Number,
          default: 0, // in GB
        },
        ratePerGB: {
          type: Number,
          default: 0,
        },
        cost: {
          type: Number,
          default: 0,
        },
        breakdown: [
          {
            type: String, // 'inbound', 'outbound', 'cdn'
            region: String,
            sizeGB: Number,
            rate: Number,
            cost: Number,
          },
        ],
      },
    },

    // Feature-Based Costs
    features: {
      addons: [
        {
          featureId: String,
          featureName: String,
          featureType: {
            type: String,
            enum: [
              'addon',
              'premium_feature',
              'integration',
              'support',
              'custom',
            ],
          },
          cost: Number,
          billing: {
            type: String,
            enum: ['one_time', 'monthly', 'usage_based'],
          },
          usage: {
            included: Number,
            used: Number,
            overage: Number,
            rate: Number,
          },
        },
      ],
      totalCost: {
        type: Number,
        default: 0,
      },
    },

    // Third-Party Integration Costs
    integrations: {
      breakdown: [
        {
          integrationId: String,
          integrationName: String,
          provider: String,
          serviceType: String, // 'payment', 'analytics', 'communication', etc.
          usage: {
            requests: Number,
            data: Number,
            transactions: Number,
          },
          cost: Number,
          billing: {
            model: String, // 'per_request', 'per_transaction', 'flat_rate'
            rate: Number,
          },
        },
      ],
      totalCost: {
        type: Number,
        default: 0,
      },
    },

    // Infrastructure Costs (for enterprise users)
    infrastructure: {
      compute: {
        cpuHours: Number,
        cost: Number,
        breakdown: [
          {
            instanceType: String,
            hours: Number,
            rate: Number,
            cost: Number,
          },
        ],
      },
      memory: {
        gbHours: Number,
        cost: Number,
      },
      storage: {
        gbHours: Number,
        cost: Number,
        breakdown: [
          {
            storageClass: String, // 'standard', 'cold', 'archive'
            gb: Number,
            hours: Number,
            rate: Number,
            cost: Number,
          },
        ],
      },
      network: {
        dataTransfer: Number,
        cost: Number,
      },
      totalCost: {
        type: Number,
        default: 0,
      },
    },

    // Support and Services Costs
    support: {
      tier: {
        type: String,
        enum: ['basic', 'standard', 'premium', 'enterprise'],
      },
      baseCost: {
        type: Number,
        default: 0,
      },
      additionalServices: [
        {
          serviceName: String,
          serviceType: String, // 'consultation', 'training', 'setup', 'custom_development'
          hours: Number,
          rate: Number,
          cost: Number,
          description: String,
        },
      ],
      totalCost: {
        type: Number,
        default: 0,
      },
    },

    // Tax and Fees
    taxes: {
      salesTax: {
        rate: Number,
        amount: Number,
        jurisdiction: String,
      },
      vatTax: {
        rate: Number,
        amount: Number,
        jurisdiction: String,
      },
      otherTaxes: [
        {
          taxName: String,
          rate: Number,
          amount: Number,
          jurisdiction: String,
        },
      ],
      totalTax: {
        type: Number,
        default: 0,
      },
    },

    fees: {
      processingFees: {
        type: Number,
        default: 0,
      },
      transactionFees: {
        type: Number,
        default: 0,
      },
      serviceFees: {
        type: Number,
        default: 0,
      },
      totalFees: {
        type: Number,
        default: 0,
      },
    },

    // Cost Analysis
    analysis: {
      // Comparison with previous period
      comparison: {
        previousPeriodCost: Number,
        change: Number,
        changePercentage: Number,
        trend: {
          type: String,
          enum: ['increasing', 'decreasing', 'stable'],
        },
      },

      // Cost efficiency metrics
      efficiency: {
        costPerConversation: Number,
        costPerMessage: Number,
        costPerAPICall: Number,
        costPerUser: Number,
        costPerToken: Number,
      },

      // Budget tracking
      budget: {
        allocated: Number,
        spent: Number,
        remaining: Number,
        utilizationPercentage: Number,
        forecastedOverage: Number,
      },

      // Cost optimization suggestions
      optimization: {
        suggestions: [
          {
            category: String,
            description: String,
            potentialSavings: Number,
            implementation: String,
            priority: {
              type: String,
              enum: ['low', 'medium', 'high', 'critical'],
            },
          },
        ],
        totalPotentialSavings: Number,
      },
    },

    // Predictions and Forecasting
    forecasting: {
      nextPeriodEstimate: {
        type: Number,
        default: 0,
      },
      confidence: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      factors: [
        {
          factor: String,
          impact: String, // 'positive', 'negative', 'neutral'
          confidence: Number,
        },
      ],
      seasonalAdjustment: Number,
      trendAdjustment: Number,
    },

    // Allocation and Attribution
    allocation: {
      // Cost allocation by department/team
      byDepartment: [
        {
          department: String,
          cost: Number,
          percentage: Number,
        },
      ],

      // Cost allocation by project
      byProject: [
        {
          projectId: String,
          projectName: String,
          cost: Number,
          percentage: Number,
        },
      ],

      // Cost allocation by user segment
      byUserSegment: [
        {
          segment: String,
          cost: Number,
          userCount: Number,
          costPerUser: Number,
        },
      ],
    },

    // Calculation Metadata
    calculation: {
      calculatedAt: {
        type: Date,
        default: Date.now,
      },
      calculationVersion: {
        type: String,
        default: '1.0',
      },
      dataPoints: {
        type: Number,
        default: 0,
      },
      accuracy: {
        type: Number,
        default: 100, // percentage
      },
      methodology: String,
      assumptions: [String],
    },
  },
  {
    timestamps: true,
    collection: 'costbreakdown',
  }
);

// Compound indexes for performance
costBreakdownSchema.index({
  userId: 1,
  'period.type': 1,
  'period.startDate': -1,
});
costBreakdownSchema.index({ userId: 1, 'period.startDate': -1 });
costBreakdownSchema.index({ 'period.startDate': -1, 'period.endDate': -1 });

// Single field indexes
costBreakdownSchema.index({ userId: 1 });
costBreakdownSchema.index({ 'period.type': 1 });
costBreakdownSchema.index({ 'period.startDate': -1 });
costBreakdownSchema.index({ totalCost: -1 });

// TTL index for old cost breakdowns (keep for 3 years)
costBreakdownSchema.index(
  { 'period.endDate': 1 },
  {
    expireAfterSeconds: 94608000, // 3 years
  }
);

// Static method to get cost breakdown for user and period
costBreakdownSchema.statics.getCostBreakdownForPeriod = async function (
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

// Static method to get cost trends
costBreakdownSchema.statics.getCostTrends = async function (
  userId,
  periodType = 'monthly',
  periods = 12
) {
  return this.find({
    userId,
    'period.type': periodType,
  })
    .sort({ 'period.startDate': -1 })
    .limit(periods)
    .select(
      'totalCost period usage.conversations.cost usage.messages.cost usage.tokens.totalCost'
    );
};

// Static method to aggregate costs by category
costBreakdownSchema.statics.aggregateCostsByCategory = async function (
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
        subscriptionCosts: { $sum: '$subscription.netCost' },
        conversationCosts: { $sum: '$usage.conversations.cost' },
        messageCosts: { $sum: '$usage.messages.cost' },
        tokenCosts: { $sum: '$usage.tokens.totalCost' },
        storageCosts: { $sum: '$usage.storage.cost' },
        featureCosts: { $sum: '$features.totalCost' },
        integrationCosts: { $sum: '$integrations.totalCost' },
        supportCosts: { $sum: '$support.totalCost' },
        infrastructureCosts: { $sum: '$infrastructure.totalCost' },
        totalCosts: { $sum: '$totalCost' },
      },
    },
  ];

  return this.aggregate(pipeline);
};

// Method to calculate cost efficiency metrics
costBreakdownSchema.methods.calculateEfficiencyMetrics = function (
  usageMetrics
) {
  const efficiency = {};

  if (usageMetrics) {
    if (usageMetrics.conversations && usageMetrics.conversations.total > 0) {
      efficiency.costPerConversation =
        this.totalCost / usageMetrics.conversations.total;
    }

    if (usageMetrics.messages && usageMetrics.messages.total > 0) {
      efficiency.costPerMessage = this.totalCost / usageMetrics.messages.total;
    }

    if (usageMetrics.api && usageMetrics.api.totalCalls > 0) {
      efficiency.costPerAPICall = this.totalCost / usageMetrics.api.totalCalls;
    }

    if (usageMetrics.tokens && usageMetrics.tokens.totalTokens > 0) {
      efficiency.costPerToken =
        this.totalCost / usageMetrics.tokens.totalTokens;
    }
  }

  this.analysis.efficiency = efficiency;
  return efficiency;
};

// Method to generate cost optimization suggestions
costBreakdownSchema.methods.generateOptimizationSuggestions = function () {
  const suggestions = [];

  // High token usage suggestion
  if (this.usage.tokens.totalCost > this.totalCost * 0.5) {
    suggestions.push({
      category: 'token_optimization',
      description:
        'Consider optimizing AI model usage or switching to more cost-effective models',
      potentialSavings: this.usage.tokens.totalCost * 0.2,
      implementation:
        'Review conversation flows and implement response caching',
      priority: 'high',
    });
  }

  // High storage usage suggestion
  if (this.usage.storage.cost > this.totalCost * 0.2) {
    suggestions.push({
      category: 'storage_optimization',
      description: 'Implement data archiving and cleanup policies',
      potentialSavings: this.usage.storage.cost * 0.3,
      implementation: 'Set up automated data lifecycle management',
      priority: 'medium',
    });
  }

  // Underutilized subscription suggestion
  const subscriptionUtilization =
    (this.usage.conversations.used / this.usage.conversations.included) * 100;
  if (subscriptionUtilization < 50 && this.subscription.baseCost > 0) {
    suggestions.push({
      category: 'plan_optimization',
      description: 'Consider downgrading to a lower-tier plan',
      potentialSavings: this.subscription.baseCost * 0.4,
      implementation: 'Review usage patterns and adjust subscription plan',
      priority: 'medium',
    });
  }

  this.analysis.optimization.suggestions = suggestions;
  this.analysis.optimization.totalPotentialSavings = suggestions.reduce(
    (total, s) => total + s.potentialSavings,
    0
  );

  return suggestions;
};

// Method to calculate period comparison
costBreakdownSchema.methods.calculatePeriodComparison = async function (
  previousPeriodBreakdown
) {
  if (previousPeriodBreakdown) {
    const change = this.totalCost - previousPeriodBreakdown.totalCost;
    const changePercentage =
      previousPeriodBreakdown.totalCost > 0
        ? (change / previousPeriodBreakdown.totalCost) * 100
        : 0;

    let trend = 'stable';
    if (Math.abs(changePercentage) > 5) {
      trend = changePercentage > 0 ? 'increasing' : 'decreasing';
    }

    this.analysis.comparison = {
      previousPeriodCost: previousPeriodBreakdown.totalCost,
      change,
      changePercentage,
      trend,
    };
  }
};

// Virtual for cost breakdown summary
costBreakdownSchema.virtual('costSummary').get(function () {
  return {
    total: this.totalCost,
    subscription: this.subscription.netCost,
    usage: {
      conversations: this.usage.conversations.cost,
      messages: this.usage.messages.cost,
      tokens: this.usage.tokens.totalCost,
      storage: this.usage.storage.cost,
      bandwidth: this.usage.bandwidth.cost,
    },
    features: this.features.totalCost,
    integrations: this.integrations.totalCost,
    support: this.support.totalCost,
    taxes: this.taxes.totalTax,
    fees: this.fees.totalFees,
  };
});

// Virtual for largest cost categories
costBreakdownSchema.virtual('topCostCategories').get(function () {
  const categories = [
    { name: 'Subscription', cost: this.subscription.netCost },
    { name: 'Conversations', cost: this.usage.conversations.cost },
    { name: 'Messages', cost: this.usage.messages.cost },
    { name: 'Tokens', cost: this.usage.tokens.totalCost },
    { name: 'Storage', cost: this.usage.storage.cost },
    { name: 'Features', cost: this.features.totalCost },
    { name: 'Integrations', cost: this.integrations.totalCost },
    { name: 'Support', cost: this.support.totalCost },
  ];

  return categories
    .filter((cat) => cat.cost > 0)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5);
});

export default mongoose.model('CostBreakdown', costBreakdownSchema);
