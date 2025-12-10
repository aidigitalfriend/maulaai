import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// AGENT METRICS MODEL
// ============================================
const agentMetricsSchema = new Schema(
  {
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
        required: true,
        index: true,
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
        index: true,
      },
      model: {
        provider: String, // 'openai', 'anthropic', 'mistral', etc.
        name: String, // 'gpt-4', 'claude-3', etc.
        version: String,
        parameters: {
          temperature: Number,
          maxTokens: Number,
          topP: Number,
          frequencyPenalty: Number,
          presencePenalty: Number,
        },
      },
    },

    // Time Period
    period: {
      type: {
        type: String,
        enum: ['hour', 'day', 'week', 'month', 'quarter', 'year'],
        required: true,
        index: true,
      },
      startTime: {
        type: Date,
        required: true,
        index: true,
      },
      endTime: {
        type: Date,
        required: true,
        index: true,
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
    },

    // Usage Metrics
    usage: {
      // Conversation metrics
      conversations: {
        total: {
          type: Number,
          default: 0,
        },
        initiated: {
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
        escalated: {
          type: Number,
          default: 0,
        },
        transferred: {
          type: Number,
          default: 0,
        },
      },

      // Message metrics
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
          default: 0,
        },
        totalCharacters: {
          type: Number,
          default: 0,
        },
      },

      // Session metrics
      sessions: {
        total: {
          type: Number,
          default: 0,
        },
        uniqueUsers: {
          type: Number,
          default: 0,
        },
        averageDuration: {
          type: Number, // seconds
          default: 0,
        },
        totalDuration: {
          type: Number, // seconds
          default: 0,
        },
        concurrentPeak: {
          type: Number,
          default: 0,
        },
      },

      // API usage
      api: {
        requests: {
          type: Number,
          default: 0,
        },
        successful: {
          type: Number,
          default: 0,
        },
        failed: {
          type: Number,
          default: 0,
        },
        averageLatency: {
          type: Number, // milliseconds
          default: 0,
        },
        p95Latency: {
          type: Number,
          default: 0,
        },
        p99Latency: {
          type: Number,
          default: 0,
        },
      },
    },

    // Performance Metrics
    performance: {
      // Response time metrics
      responseTime: {
        average: {
          type: Number, // milliseconds
          default: 0,
        },
        median: {
          type: Number,
          default: 0,
        },
        p90: { type: Number, default: 0 },
        p95: { type: Number, default: 0 },
        p99: { type: Number, default: 0 },
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
      },

      // Accuracy metrics
      accuracy: {
        overall: {
          type: Number, // percentage
          default: 0,
        },
        intentRecognition: {
          type: Number,
          default: 0,
        },
        entityExtraction: {
          type: Number,
          default: 0,
        },
        responseRelevance: {
          type: Number,
          default: 0,
        },
        factualAccuracy: {
          type: Number,
          default: 0,
        },
      },

      // Quality metrics
      quality: {
        conversationFlow: {
          type: Number, // 1-10 scale
          default: 0,
        },
        responseCoherence: {
          type: Number,
          default: 0,
        },
        contextRetention: {
          type: Number,
          default: 0,
        },
        personalization: {
          type: Number,
          default: 0,
        },
        empathy: {
          type: Number,
          default: 0,
        },
      },

      // Efficiency metrics
      efficiency: {
        resolutionRate: {
          type: Number, // percentage
          default: 0,
        },
        firstContactResolution: {
          type: Number,
          default: 0,
        },
        averageResolutionTime: {
          type: Number, // minutes
          default: 0,
        },
        handoffRate: {
          type: Number, // percentage to human agents
          default: 0,
        },
        containmentRate: {
          type: Number, // percentage handled without escalation
          default: 0,
        },
      },
    },

    // User Satisfaction
    satisfaction: {
      // Rating metrics
      ratings: {
        count: {
          type: Number,
          default: 0,
        },
        average: {
          type: Number, // 1-5 scale
          default: 0,
        },
        distribution: {
          five: { type: Number, default: 0 },
          four: { type: Number, default: 0 },
          three: { type: Number, default: 0 },
          two: { type: Number, default: 0 },
          one: { type: Number, default: 0 },
        },
      },

      // NPS metrics
      nps: {
        score: {
          type: Number, // -100 to 100
          default: 0,
        },
        promoters: {
          type: Number,
          default: 0,
        },
        passives: {
          type: Number,
          default: 0,
        },
        detractors: {
          type: Number,
          default: 0,
        },
        responseCount: {
          type: Number,
          default: 0,
        },
      },

      // Feedback analysis
      feedback: {
        positive: {
          type: Number,
          default: 0,
        },
        neutral: {
          type: Number,
          default: 0,
        },
        negative: {
          type: Number,
          default: 0,
        },
        commonPraises: [String],
        commonComplaints: [String],
        improvementSuggestions: [String],
      },
    },

    // Error and Issue Tracking
    errors: {
      // Error counts
      total: {
        type: Number,
        default: 0,
      },

      // Error types
      types: {
        understanding: {
          type: Number,
          default: 0,
        },
        response: {
          type: Number,
          default: 0,
        },
        technical: {
          type: Number,
          default: 0,
        },
        integration: {
          type: Number,
          default: 0,
        },
        timeout: {
          type: Number,
          default: 0,
        },
      },

      // Error details
      details: [
        {
          errorType: String,
          count: Number,
          lastOccurred: Date,
          resolved: Boolean,
          impact: String, // 'low', 'medium', 'high', 'critical'
        },
      ],

      // Error rate
      rate: {
        type: Number, // percentage
        default: 0,
      },
    },

    // Learning and Adaptation
    learning: {
      // Training data
      training: {
        conversationsProcessed: {
          type: Number,
          default: 0,
        },
        newIntentsLearned: {
          type: Number,
          default: 0,
        },
        patternsIdentified: {
          type: Number,
          default: 0,
        },
        knowledgeUpdates: {
          type: Number,
          default: 0,
        },
      },

      // Adaptation metrics
      adaptation: {
        userPreferencesLearned: {
          type: Number,
          default: 0,
        },
        contextualImprovements: {
          type: Number,
          default: 0,
        },
        responseOptimizations: {
          type: Number,
          default: 0,
        },
        feedbackIncorporated: {
          type: Number,
          default: 0,
        },
      },

      // Knowledge expansion
      knowledge: {
        factsLearned: {
          type: Number,
          default: 0,
        },
        skillsAcquired: {
          type: Number,
          default: 0,
        },
        domainExpertiseGained: [String],
        confidenceImprovement: {
          type: Number, // percentage improvement
          default: 0,
        },
      },
    },

    // Resource Utilization
    resources: {
      // Computational resources
      compute: {
        cpuUsage: {
          average: Number, // percentage
          peak: Number,
        },
        memoryUsage: {
          average: Number, // MB
          peak: Number,
        },
        gpuUsage: {
          average: Number, // percentage
          peak: Number,
        },
        networkBandwidth: {
          ingress: Number, // Mbps
          egress: Number,
        },
      },

      // Token usage (for AI models)
      tokens: {
        input: {
          total: Number,
          average: Number,
          cost: Number,
        },
        output: {
          total: Number,
          average: Number,
          cost: Number,
        },
        total: {
          tokens: Number,
          cost: Number,
        },
      },

      // Storage usage
      storage: {
        conversationHistory: {
          type: Number, // GB
          default: 0,
        },
        knowledgeBase: {
          type: Number,
          default: 0,
        },
        temporaryFiles: {
          type: Number,
          default: 0,
        },
        totalUsed: {
          type: Number,
          default: 0,
        },
      },
    },

    // Business Impact
    business: {
      // Revenue impact
      revenue: {
        conversionsInfluenced: {
          type: Number,
          default: 0,
        },
        revenueGenerated: {
          type: Number, // dollars
          default: 0,
        },
        upsellsAchieved: {
          type: Number,
          default: 0,
        },
        churnPrevented: {
          type: Number,
          default: 0,
        },
      },

      // Cost savings
      costSavings: {
        humanAgentHoursSaved: {
          type: Number,
          default: 0,
        },
        supportTicketsDeflected: {
          type: Number,
          default: 0,
        },
        operationalCostSavings: {
          type: Number, // dollars
          default: 0,
        },
        efficiencyGains: {
          type: Number, // percentage
          default: 0,
        },
      },

      // Customer impact
      customer: {
        satisfactionImprovement: {
          type: Number, // percentage
          default: 0,
        },
        retentionImpact: {
          type: Number, // percentage
          default: 0,
        },
        engagementIncrease: {
          type: Number,
          default: 0,
        },
        loyaltyScore: {
          type: Number, // 1-10
          default: 0,
        },
      },
    },

    // Comparative Analysis
    benchmarks: {
      // Performance vs. baseline
      vsBaseline: {
        responseTime: {
          improvement: Number, // percentage
          significance: String, // 'insignificant', 'minor', 'moderate', 'major'
        },
        accuracy: {
          improvement: Number,
          significance: String,
        },
        satisfaction: {
          improvement: Number,
          significance: String,
        },
      },

      // Performance vs. other agents
      vsOtherAgents: {
        rankingPosition: {
          type: Number,
          default: 0,
        },
        percentileRank: {
          type: Number,
          default: 0,
        },
        topPerformer: {
          type: Boolean,
          default: false,
        },
        improvementNeeded: {
          type: Boolean,
          default: false,
        },
      },

      // Industry benchmarks
      vsIndustry: {
        performanceRating: {
          type: String,
          enum: [
            'below_average',
            'average',
            'above_average',
            'excellent',
            'exceptional',
          ],
        },
        competitiveAdvantage: {
          type: Boolean,
          default: false,
        },
        areasOfLeadership: [String],
        areasForImprovement: [String],
      },
    },

    // Trend Analysis
    trends: {
      // Performance trends
      performance: {
        direction: {
          type: String,
          enum: ['improving', 'stable', 'declining'],
          default: 'stable',
        },
        rate: {
          type: Number, // percentage change per period
          default: 0,
        },
        consistency: {
          type: Number, // variance measure
          default: 0,
        },
      },

      // Usage trends
      usage: {
        growth: {
          type: Number, // percentage growth
          default: 0,
        },
        seasonality: {
          detected: Boolean,
          pattern: String,
          strength: Number,
        },
        adoption: {
          rate: Number,
          acceleration: Number,
        },
      },

      // Quality trends
      quality: {
        improvement: {
          type: Number, // percentage improvement
          default: 0,
        },
        stability: {
          type: Number, // consistency score
          default: 0,
        },
        predictability: {
          type: Number, // how predictable performance is
          default: 0,
        },
      },
    },

    // Alerts and Notifications
    alerts: {
      // Performance alerts
      performance: [
        {
          alertType: String,
          threshold: Number,
          currentValue: Number,
          severity: String, // 'info', 'warning', 'error', 'critical'
          triggered: Boolean,
          triggerTime: Date,
          resolved: Boolean,
          resolutionTime: Date,
        },
      ],

      // Quality alerts
      quality: [
        {
          metric: String,
          threshold: Number,
          currentValue: Number,
          severity: String,
          triggered: Boolean,
          triggerTime: Date,
          actionRequired: String,
        },
      ],

      // Usage alerts
      usage: [
        {
          alertType: String,
          description: String,
          severity: String,
          triggered: Boolean,
          impact: String,
        },
      ],
    },

    // Configuration and Settings
    configuration: {
      // Current settings
      settings: {
        confidenceThreshold: Number,
        escalationRules: [String],
        responseTimeouts: {
          type: Map,
          of: Number,
        },
        qualityGates: {
          type: Map,
          of: Number,
        },
      },

      // Configuration changes
      changes: [
        {
          parameter: String,
          oldValue: String,
          newValue: String,
          changedBy: String,
          changedAt: Date,
          reason: String,
          impact: String,
        },
      ],

      // Optimization suggestions
      optimization: [
        {
          parameter: String,
          currentValue: String,
          suggestedValue: String,
          expectedImprovement: String,
          confidence: Number,
          implementationEffort: String, // 'low', 'medium', 'high'
        },
      ],
    },

    // Integration Performance
    integrations: {
      // External service performance
      services: [
        {
          serviceName: String,
          responseTime: Number,
          availability: Number, // percentage
          errorRate: Number,
          dataAccuracy: Number,
          lastHealthCheck: Date,
          issues: [String],
        },
      ],

      // API performance
      apis: [
        {
          apiName: String,
          callCount: Number,
          successRate: Number,
          averageLatency: Number,
          rateLimitHits: Number,
          lastError: {
            timestamp: Date,
            error: String,
            resolved: Boolean,
          },
        },
      ],

      // Data pipeline performance
      pipelines: [
        {
          pipelineName: String,
          throughput: Number, // records per second
          latency: Number,
          errorRate: Number,
          backlogSize: Number,
          lastProcessed: Date,
        },
      ],
    },

    // Metadata and Context
    metadata: {
      version: {
        type: String,
        default: '1.0',
      },

      // Collection context
      context: {
        environment: String, // 'production', 'staging', 'development'
        region: String,
        datacenter: String,
        cluster: String,
      },

      // Data quality
      dataQuality: {
        completeness: Number, // percentage
        accuracy: Number,
        timeliness: Number,
        consistency: Number,
        reliability: Number,
      },

      // Custom metrics
      customMetrics: {
        type: Map,
        of: Number,
      },

      // Tags and labels
      tags: [String],
      labels: {
        type: Map,
        of: String,
      },
    },
  },
  {
    timestamps: true,
    collection: 'agentmetrics',
  }
);

// Compound indexes for performance
agentMetricsSchema.index({ 'agent.agentId': 1, 'period.startTime': -1 });
agentMetricsSchema.index({
  'agent.agentId': 1,
  'period.type': 1,
  'period.startTime': -1,
});
agentMetricsSchema.index({ 'agent.agentType': 1, 'period.startTime': -1 });

// Single field indexes
agentMetricsSchema.index({ 'agent.agentId': 1 });
agentMetricsSchema.index({ 'agent.agentType': 1 });
agentMetricsSchema.index({ 'period.type': 1 });
agentMetricsSchema.index({ 'period.startTime': -1 });
agentMetricsSchema.index({ 'performance.accuracy.overall': -1 });
agentMetricsSchema.index({ 'satisfaction.ratings.average': -1 });
agentMetricsSchema.index({ 'satisfaction.nps.score': -1 });

// TTL index for old metrics (keep for 2 years)
agentMetricsSchema.index(
  { 'period.endTime': 1 },
  {
    expireAfterSeconds: 63072000, // 2 years
  }
);

// Static method to get metrics for agent
agentMetricsSchema.statics.getMetricsForAgent = async function (
  agentId,
  options = {}
) {
  const { periodType, startDate, endDate, limit = 100, skip = 0 } = options;

  const query = { 'agent.agentId': agentId };

  if (periodType) query['period.type'] = periodType;
  if (startDate || endDate) {
    query['period.startTime'] = {};
    if (startDate) query['period.startTime'].$gte = startDate;
    if (endDate) query['period.startTime'].$lte = endDate;
  }

  return this.find(query)
    .sort({ 'period.startTime': -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get agent rankings
agentMetricsSchema.statics.getAgentRankings = async function (
  metric = 'overall',
  timeframe = 'month'
) {
  const startDate = new Date();

  switch (timeframe) {
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(startDate.getMonth() - 3);
      break;
  }

  let groupStage = {};

  switch (metric) {
    case 'accuracy':
      groupStage = {
        _id: '$agent.agentId',
        agentName: { $first: '$agent.agentName' },
        agentType: { $first: '$agent.agentType' },
        averageAccuracy: { $avg: '$performance.accuracy.overall' },
        totalConversations: { $sum: '$usage.conversations.total' },
        averageRating: { $avg: '$satisfaction.ratings.average' },
      };
      break;
    case 'satisfaction':
      groupStage = {
        _id: '$agent.agentId',
        agentName: { $first: '$agent.agentName' },
        agentType: { $first: '$agent.agentType' },
        averageRating: { $avg: '$satisfaction.ratings.average' },
        npsScore: { $avg: '$satisfaction.nps.score' },
        totalRatings: { $sum: '$satisfaction.ratings.count' },
      };
      break;
    default:
      groupStage = {
        _id: '$agent.agentId',
        agentName: { $first: '$agent.agentName' },
        agentType: { $first: '$agent.agentType' },
        averageAccuracy: { $avg: '$performance.accuracy.overall' },
        averageRating: { $avg: '$satisfaction.ratings.average' },
        totalConversations: { $sum: '$usage.conversations.total' },
        resolutionRate: { $avg: '$performance.efficiency.resolutionRate' },
      };
  }

  const pipeline = [
    {
      $match: {
        'period.startTime': { $gte: startDate },
      },
    },
    {
      $group: groupStage,
    },
    {
      $sort: { averageRating: -1, averageAccuracy: -1 },
    },
  ];

  return this.aggregate(pipeline);
};

// Static method to get performance summary
agentMetricsSchema.statics.getPerformanceSummary = async function (
  agentId,
  days = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        'agent.agentId': agentId,
        'period.startTime': { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalConversations: { $sum: '$usage.conversations.total' },
        averageAccuracy: { $avg: '$performance.accuracy.overall' },
        averageRating: { $avg: '$satisfaction.ratings.average' },
        averageResponseTime: { $avg: '$performance.responseTime.average' },
        resolutionRate: { $avg: '$performance.efficiency.resolutionRate' },
        errorRate: { $avg: '$errors.rate' },
        totalErrors: { $sum: '$errors.total' },
        npsScore: { $avg: '$satisfaction.nps.score' },
      },
    },
  ];

  return this.aggregate(pipeline);
};

// Method to calculate overall performance score
agentMetricsSchema.methods.calculatePerformanceScore = function () {
  const weights = {
    accuracy: 0.25,
    satisfaction: 0.25,
    efficiency: 0.2,
    responseTime: 0.15,
    reliability: 0.15,
  };

  let score = 0;

  // Accuracy score (0-100)
  const accuracyScore = (this.performance.accuracy.overall / 100) * 100;
  score += accuracyScore * weights.accuracy;

  // Satisfaction score (1-5 scale to 0-100)
  const satisfactionScore = ((this.satisfaction.ratings.average - 1) / 4) * 100;
  score += satisfactionScore * weights.satisfaction;

  // Efficiency score (resolution rate)
  const efficiencyScore = this.performance.efficiency.resolutionRate;
  score += efficiencyScore * weights.efficiency;

  // Response time score (inverse relationship, faster is better)
  const maxResponseTime = 5000; // 5 seconds
  const responseTimeScore = Math.max(
    0,
    100 - (this.performance.responseTime.average / maxResponseTime) * 100
  );
  score += responseTimeScore * weights.responseTime;

  // Reliability score (inverse of error rate)
  const reliabilityScore = Math.max(0, 100 - this.errors.rate);
  score += reliabilityScore * weights.reliability;

  return Math.round(score);
};

// Method to identify improvement opportunities
agentMetricsSchema.methods.identifyImprovements = function () {
  const improvements = [];

  // Accuracy improvements
  if (this.performance.accuracy.overall < 85) {
    improvements.push({
      area: 'accuracy',
      currentValue: this.performance.accuracy.overall,
      target: 90,
      priority: 'high',
      suggestion: 'Improve training data quality and model fine-tuning',
    });
  }

  // Response time improvements
  if (this.performance.responseTime.average > 3000) {
    improvements.push({
      area: 'response_time',
      currentValue: this.performance.responseTime.average,
      target: 2000,
      priority: 'medium',
      suggestion: 'Optimize processing pipeline and caching strategies',
    });
  }

  // Satisfaction improvements
  if (this.satisfaction.ratings.average < 4.0) {
    improvements.push({
      area: 'satisfaction',
      currentValue: this.satisfaction.ratings.average,
      target: 4.5,
      priority: 'high',
      suggestion: 'Analyze user feedback and improve response quality',
    });
  }

  // Error rate improvements
  if (this.errors.rate > 5) {
    improvements.push({
      area: 'reliability',
      currentValue: this.errors.rate,
      target: 2,
      priority: 'high',
      suggestion: 'Investigate and fix recurring error patterns',
    });
  }

  return improvements.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

// Method to generate performance report
agentMetricsSchema.methods.generateReport = function () {
  return {
    agent: {
      id: this.agent.agentId,
      name: this.agent.agentName,
      type: this.agent.agentType,
      version: this.agent.agentVersion,
    },
    period: {
      type: this.period.type,
      start: this.period.startTime,
      end: this.period.endTime,
    },
    summary: {
      totalConversations: this.usage.conversations.total,
      averageAccuracy: this.performance.accuracy.overall,
      averageRating: this.satisfaction.ratings.average,
      npsScore: this.satisfaction.nps.score,
      resolutionRate: this.performance.efficiency.resolutionRate,
    },
    performance: {
      score: this.calculatePerformanceScore(),
      trends: this.trends.performance.direction,
      improvements: this.identifyImprovements(),
    },
    resources: {
      tokenUsage: this.resources.tokens.total.tokens,
      cost: this.resources.tokens.total.cost,
      efficiency:
        this.usage.conversations.total > 0
          ? this.resources.tokens.total.cost / this.usage.conversations.total
          : 0,
    },
  };
};

// Virtual for performance grade
agentMetricsSchema.virtual('performanceGrade').get(function () {
  const score = this.calculatePerformanceScore();

  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
});

// Virtual for health status
agentMetricsSchema.virtual('healthStatus').get(function () {
  const errorRate = this.errors.rate;
  const accuracy = this.performance.accuracy.overall;
  const satisfaction = this.satisfaction.ratings.average;

  if (errorRate > 10 || accuracy < 70 || satisfaction < 3) {
    return 'unhealthy';
  } else if (errorRate > 5 || accuracy < 85 || satisfaction < 4) {
    return 'degraded';
  }

  return 'healthy';
});

export default mongoose.model('AgentMetrics', agentMetricsSchema);
