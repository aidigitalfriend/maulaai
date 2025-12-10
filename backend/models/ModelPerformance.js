import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// MODEL PERFORMANCE MODEL
// ============================================
const modelPerformanceSchema = new Schema(
  {
    // Model Identification
    model: {
      modelId: {
        type: String,
        required: true,
        index: true,
      },
      modelName: {
        type: String,
        required: true,
      },
      version: {
        type: String,
        required: true,
        index: true,
      },
      provider: {
        type: String,
        enum: [
          'openai',
          'anthropic',
          'google',
          'meta',
          'mistral',
          'cohere',
          'huggingface',
          'custom',
        ],
        required: true,
        index: true,
      },
      category: {
        type: String,
        enum: [
          'llm',
          'embedding',
          'classification',
          'generation',
          'reasoning',
          'multimodal',
        ],
        required: true,
      },
      deployment: {
        type: String,
        enum: ['cloud_api', 'self_hosted', 'edge', 'hybrid'],
        required: true,
      },
    },

    // Configuration
    configuration: {
      // Model parameters
      parameters: {
        temperature: Number,
        maxTokens: Number,
        topP: Number,
        topK: Number,
        frequencyPenalty: Number,
        presencePenalty: Number,
        stopSequences: [String],
        contextWindow: Number,
      },

      // Deployment settings
      deployment: {
        instanceType: String,
        scaling: {
          minInstances: Number,
          maxInstances: Number,
          targetUtilization: Number,
        },
        region: String,
        availability: String, // 'single', 'multi_az', 'multi_region'
        loadBalancing: String,
      },

      // Optimization settings
      optimization: {
        quantization: String, // 'none', 'int8', 'int4', 'fp16'
        caching: {
          enabled: Boolean,
          strategy: String,
          ttl: Number,
        },
        batchProcessing: {
          enabled: Boolean,
          maxBatchSize: Number,
          timeout: Number,
        },
      },
    },

    // Time Period
    evaluationPeriod: {
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
      periodType: {
        type: String,
        enum: ['hour', 'day', 'week', 'month'],
        required: true,
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
    },

    // Usage Metrics
    usage: {
      // Request metrics
      requests: {
        total: {
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
        cached: {
          type: Number,
          default: 0,
        },
        retried: {
          type: Number,
          default: 0,
        },
      },

      // Token usage
      tokens: {
        input: {
          total: {
            type: Number,
            default: 0,
          },
          average: {
            type: Number,
            default: 0,
          },
          median: Number,
          p95: Number,
          p99: Number,
        },
        output: {
          total: {
            type: Number,
            default: 0,
          },
          average: {
            type: Number,
            default: 0,
          },
          median: Number,
          p95: Number,
          p99: Number,
        },
        total: {
          tokens: {
            type: Number,
            default: 0,
          },
          cost: {
            type: Number,
            default: 0,
          },
        },
      },

      // Concurrent usage
      concurrency: {
        peak: {
          type: Number,
          default: 0,
        },
        average: {
          type: Number,
          default: 0,
        },
        queueTime: {
          average: Number,
          p95: Number,
          p99: Number,
        },
      },
    },

    // Performance Metrics
    performance: {
      // Latency metrics
      latency: {
        // Time to first token
        ttft: {
          average: Number, // milliseconds
          median: Number,
          p90: Number,
          p95: Number,
          p99: Number,
          min: Number,
          max: Number,
        },

        // Token generation speed
        tokensPerSecond: {
          average: Number,
          median: Number,
          p90: Number,
          p95: Number,
          p99: Number,
        },

        // End-to-end latency
        endToEnd: {
          average: Number,
          median: Number,
          p90: Number,
          p95: Number,
          p99: Number,
        },

        // Processing stages
        stages: {
          preprocessing: Number,
          inference: Number,
          postprocessing: Number,
          network: Number,
        },
      },

      // Throughput metrics
      throughput: {
        requestsPerSecond: {
          average: Number,
          peak: Number,
          sustained: Number,
        },
        tokensPerSecond: {
          average: Number,
          peak: Number,
          sustained: Number,
        },
        batchEfficiency: {
          averageBatchSize: Number,
          batchUtilization: Number, // percentage
          batchThroughput: Number,
        },
      },

      // Reliability metrics
      reliability: {
        availability: {
          uptime: Number, // percentage
          downtime: Number, // minutes
          mtbf: Number, // mean time between failures (hours)
          mttr: Number, // mean time to recovery (minutes)
        },
        errorRates: {
          total: Number, // percentage
          server: Number,
          client: Number,
          timeout: Number,
          rateLimit: Number,
          other: Number,
        },
        slaCompliance: {
          latency: Number, // percentage meeting SLA
          availability: Number,
          throughput: Number,
        },
      },
    },

    // Quality Metrics
    quality: {
      // Output quality
      output: {
        // Language quality
        language: {
          fluency: {
            score: Number, // 0-100
            sampleSize: Number,
            method: String,
          },
          coherence: {
            score: Number,
            sampleSize: Number,
            method: String,
          },
          relevance: {
            score: Number,
            sampleSize: Number,
            method: String,
          },
          factuality: {
            score: Number,
            sampleSize: Number,
            method: String,
            verificationSources: [String],
          },
        },

        // Task-specific quality
        task: {
          accuracy: {
            score: Number, // 0-100
            sampleSize: Number,
            groundTruth: String, // how ground truth was obtained
          },
          completeness: {
            score: Number,
            sampleSize: Number,
          },
          consistency: {
            score: Number,
            sampleSize: Number,
            variance: Number,
          },
        },

        // User perception
        user: {
          satisfaction: {
            rating: Number, // 1-5
            responses: Number,
            distribution: {
              five: Number,
              four: Number,
              three: Number,
              two: Number,
              one: Number,
            },
          },
          helpfulness: {
            rating: Number,
            responses: Number,
          },
          appropriateness: {
            rating: Number,
            responses: Number,
            flaggedCount: Number,
          },
        },
      },

      // Safety and alignment
      safety: {
        // Harmful content detection
        harmfulContent: {
          detected: Number,
          prevented: Number,
          categories: {
            hate: Number,
            violence: Number,
            sexual: Number,
            harassment: Number,
            selfHarm: Number,
            illegal: Number,
          },
        },

        // Bias detection
        bias: {
          detected: Boolean,
          categories: [String],
          severity: String, // 'low', 'medium', 'high'
          samples: [String],
          mitigationApplied: Boolean,
        },

        // Privacy and security
        privacy: {
          personalDataLeakage: {
            detected: Number,
            prevented: Number,
            types: [String],
          },
          memorization: {
            detected: Boolean,
            samples: Number,
            severity: String,
          },
        },
      },

      // Hallucination detection
      hallucination: {
        rate: Number, // percentage
        categories: {
          factual: Number,
          temporal: Number,
          numerical: Number,
          logical: Number,
          contextual: Number,
        },
        detection: {
          method: String,
          confidence: Number,
          humanVerified: Number,
        },
        impact: {
          low: Number,
          medium: Number,
          high: Number,
          critical: Number,
        },
      },
    },

    // Resource Utilization
    resources: {
      // Compute resources
      compute: {
        gpu: {
          utilization: {
            average: Number, // percentage
            peak: Number,
            sustained: Number,
          },
          memory: {
            usage: Number, // GB
            peak: Number,
            efficiency: Number, // percentage
          },
          operations: {
            flops: Number, // floating point operations per second
            efficiency: Number, // percentage of theoretical max
          },
        },

        cpu: {
          utilization: {
            average: Number,
            peak: Number,
          },
          cores: {
            allocated: Number,
            utilized: Number,
          },
        },

        memory: {
          ram: {
            allocated: Number, // GB
            utilized: Number,
            peak: Number,
          },
          cache: {
            size: Number, // GB
            hitRate: Number, // percentage
            efficiency: Number,
          },
        },
      },

      // Storage
      storage: {
        model: {
          size: Number, // GB
          compressionRatio: Number,
          loadTime: Number, // seconds
        },
        cache: {
          size: Number, // GB
          utilization: Number, // percentage
          hitRate: Number,
        },
        logs: {
          size: Number, // GB
          retention: Number, // days
          compressionRatio: Number,
        },
      },

      // Network
      network: {
        bandwidth: {
          ingress: Number, // Mbps
          egress: Number,
          utilization: Number, // percentage
        },
        latency: {
          network: Number, // milliseconds
          dns: Number,
          ssl: Number,
        },
      },
    },

    // Cost Analysis
    cost: {
      // Direct costs
      direct: {
        compute: {
          gpu: Number, // dollars
          cpu: Number,
          memory: Number,
        },
        api: {
          inputTokens: Number,
          outputTokens: Number,
          requests: Number,
        },
        storage: {
          model: Number,
          cache: Number,
          logs: Number,
        },
        network: {
          ingress: Number,
          egress: Number,
        },
      },

      // Indirect costs
      indirect: {
        monitoring: Number,
        logging: Number,
        backup: Number,
        security: Number,
        support: Number,
      },

      // Total cost analysis
      total: {
        amount: Number, // dollars
        perRequest: Number,
        perToken: Number,
        perUser: Number,
        perConversation: Number,
      },

      // Cost optimization
      optimization: {
        opportunities: [
          {
            area: String,
            potentialSavings: Number,
            implementation: String,
            impact: String,
          },
        ],
        recommendations: [String],
      },
    },

    // Scalability Analysis
    scalability: {
      // Load testing results
      loadTesting: {
        maxConcurrentRequests: Number,
        breakingPoint: {
          requests: Number,
          responseTime: Number,
          errorRate: Number,
        },
        scalingPattern: {
          linear: Boolean,
          bottleneck: String,
          optimalLoad: Number,
        },
      },

      // Auto-scaling
      autoScaling: {
        enabled: Boolean,
        triggers: [
          {
            metric: String,
            threshold: Number,
            action: String,
          },
        ],
        performance: {
          scaleUpTime: Number, // seconds
          scaleDownTime: Number,
          efficiency: Number, // percentage
        },
      },

      // Capacity planning
      capacity: {
        current: {
          requests: Number,
          users: Number,
          tokens: Number,
        },
        projected: {
          timeframe: String,
          requests: Number,
          users: Number,
          tokens: Number,
        },
        recommendations: {
          scaling: String,
          resources: String,
          timeline: String,
        },
      },
    },

    // Comparative Analysis
    benchmarks: {
      // Against other models
      modelComparison: [
        {
          modelName: String,
          provider: String,
          metrics: {
            performance: String, // 'better', 'similar', 'worse'
            quality: String,
            cost: String,
            overall: String,
          },
          advantages: [String],
          disadvantages: [String],
        },
      ],

      // Against baseline
      baseline: {
        version: String,
        improvements: {
          performance: Number, // percentage
          quality: Number,
          cost: Number,
          reliability: Number,
        },
        regressions: [String],
      },

      // Industry benchmarks
      industry: {
        percentile: Number, // 0-100
        category: String, // 'leading', 'competitive', 'lagging'
        strengths: [String],
        weaknesses: [String],
        opportunities: [String],
      },
    },

    // A/B Testing
    abTesting: {
      // Active tests
      activeTests: [
        {
          testId: String,
          name: String,
          hypothesis: String,
          variants: {
            control: String,
            treatment: String,
          },
          metrics: [String],
          allocation: {
            control: Number, // percentage
            treatment: Number,
          },
          duration: Number, // days
          status: String, // 'running', 'completed', 'stopped'
        },
      ],

      // Completed tests
      completedTests: [
        {
          testId: String,
          name: String,
          results: {
            winner: String, // 'control', 'treatment', 'no_difference'
            confidence: Number, // percentage
            lift: Number, // percentage improvement
            significance: Boolean,
          },
          metrics: {
            type: Map,
            of: Number,
          },
          conclusions: [String],
          implemented: Boolean,
        },
      ],
    },

    // Error Analysis
    errors: {
      // Error categorization
      categories: {
        model: [
          {
            type: String, // 'generation', 'understanding', 'context'
            count: Number,
            rate: Number, // percentage
            examples: [String],
            impact: String,
            resolution: String,
          },
        ],

        infrastructure: [
          {
            type: String, // 'timeout', 'memory', 'network'
            count: Number,
            rate: Number,
            impact: String,
            resolution: String,
          },
        ],

        api: [
          {
            type: String, // 'rate_limit', 'auth', 'format'
            count: Number,
            rate: Number,
            httpStatus: String,
            resolution: String,
          },
        ],
      },

      // Error patterns
      patterns: [
        {
          pattern: String,
          frequency: Number,
          conditions: [String],
          impact: String,
          mitigation: String,
        },
      ],

      // Recovery metrics
      recovery: {
        automaticRecovery: {
          rate: Number, // percentage
          averageTime: Number, // seconds
        },
        manualIntervention: {
          rate: Number,
          averageTime: Number, // minutes
        },
      },
    },

    // Optimization Recommendations
    optimization: {
      // Performance optimizations
      performance: [
        {
          area: String,
          current: Number,
          target: Number,
          approach: String,
          effort: String, // 'low', 'medium', 'high'
          impact: String,
          risk: String,
        },
      ],

      // Quality improvements
      quality: [
        {
          metric: String,
          current: Number,
          target: Number,
          strategy: String,
          resources: String,
          timeline: String,
        },
      ],

      // Cost reductions
      cost: [
        {
          area: String,
          currentCost: Number,
          potentialSavings: Number,
          method: String,
          tradeoffs: String,
          priority: String,
        },
      ],
    },

    // Metadata
    metadata: {
      version: {
        type: String,
        default: '1.0',
      },

      // Evaluation metadata
      evaluation: {
        evaluationFramework: String,
        benchmarks: [String],
        groundTruthSource: String,
        evaluationModel: String,
        humanEvaluators: Number,
      },

      // Data sources
      dataSources: {
        metrics: [String],
        logs: [String],
        monitoring: [String],
        userFeedback: [String],
      },

      // Tags and labels
      tags: [String],
      environment: String, // 'production', 'staging', 'development'
      region: String,
      compliance: [String], // 'gdpr', 'hipaa', 'sox', etc.
    },
  },
  {
    timestamps: true,
    collection: 'modelperformance',
  }
);

// Compound indexes for performance
modelPerformanceSchema.index({
  'model.modelId': 1,
  'evaluationPeriod.startTime': -1,
});
modelPerformanceSchema.index({ 'model.provider': 1, 'model.category': 1 });
modelPerformanceSchema.index({ 'model.modelId': 1, 'model.version': 1 });

// Performance indexes
modelPerformanceSchema.index({ 'performance.latency.endToEnd.average': 1 });
modelPerformanceSchema.index({
  'performance.throughput.requestsPerSecond.average': -1,
});
modelPerformanceSchema.index({ 'quality.output.task.accuracy.score': -1 });
modelPerformanceSchema.index({ 'cost.total.perRequest': 1 });

// TTL index for old performance data (keep for 2 years)
modelPerformanceSchema.index(
  { 'evaluationPeriod.endTime': 1 },
  {
    expireAfterSeconds: 63072000, // 2 years
  }
);

// Static method to get model performance trends
modelPerformanceSchema.statics.getPerformanceTrends = async function (
  modelId,
  days = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        'model.modelId': modelId,
        'evaluationPeriod.startTime': { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$evaluationPeriod.startTime',
          },
        },
        avgLatency: { $avg: '$performance.latency.endToEnd.average' },
        avgThroughput: {
          $avg: '$performance.throughput.requestsPerSecond.average',
        },
        avgAccuracy: { $avg: '$quality.output.task.accuracy.score' },
        avgSatisfaction: { $avg: '$quality.output.user.satisfaction.rating' },
        totalCost: { $sum: '$cost.total.amount' },
        errorRate: { $avg: '$performance.reliability.errorRates.total' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ];

  return this.aggregate(pipeline);
};

// Static method to compare models
modelPerformanceSchema.statics.compareModels = async function (
  modelIds,
  timeframe = 'week'
) {
  const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        'model.modelId': { $in: modelIds },
        'evaluationPeriod.startTime': { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$model.modelId',
        modelName: { $first: '$model.modelName' },
        provider: { $first: '$model.provider' },
        avgLatency: { $avg: '$performance.latency.endToEnd.average' },
        avgThroughput: {
          $avg: '$performance.throughput.requestsPerSecond.average',
        },
        avgAccuracy: { $avg: '$quality.output.task.accuracy.score' },
        avgSatisfaction: { $avg: '$quality.output.user.satisfaction.rating' },
        avgCostPerRequest: { $avg: '$cost.total.perRequest' },
        availability: { $avg: '$performance.reliability.availability.uptime' },
        errorRate: { $avg: '$performance.reliability.errorRates.total' },
      },
    },
    {
      $sort: { avgAccuracy: -1, avgLatency: 1 },
    },
  ];

  return this.aggregate(pipeline);
};

// Static method to get optimization opportunities
modelPerformanceSchema.statics.getOptimizationOpportunities = async function (
  modelId
) {
  const latest = await this.findOne({ 'model.modelId': modelId }).sort({
    'evaluationPeriod.startTime': -1,
  });

  if (!latest) return [];

  const opportunities = [];

  // Performance opportunities
  if (latest.performance.latency.endToEnd.average > 2000) {
    opportunities.push({
      type: 'performance',
      area: 'latency',
      priority: 'high',
      current: latest.performance.latency.endToEnd.average,
      target: 1500,
      strategy: 'Model optimization and caching improvements',
    });
  }

  // Quality opportunities
  if (latest.quality.output.task.accuracy.score < 85) {
    opportunities.push({
      type: 'quality',
      area: 'accuracy',
      priority: 'high',
      current: latest.quality.output.task.accuracy.score,
      target: 90,
      strategy: 'Fine-tuning and training data improvement',
    });
  }

  // Cost opportunities
  if (latest.cost.total.perRequest > 0.05) {
    opportunities.push({
      type: 'cost',
      area: 'efficiency',
      priority: 'medium',
      current: latest.cost.total.perRequest,
      target: 0.03,
      strategy: 'Resource optimization and batch processing',
    });
  }

  return opportunities.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

// Method to calculate overall performance score
modelPerformanceSchema.methods.calculatePerformanceScore = function () {
  const weights = {
    latency: 0.25, // Lower is better
    throughput: 0.2, // Higher is better
    accuracy: 0.25, // Higher is better
    availability: 0.15, // Higher is better
    cost: 0.15, // Lower is better
  };

  let score = 0;

  // Latency score (normalized - 2000ms = 0, 100ms = 100)
  const latencyScore = Math.max(
    0,
    100 - (this.performance.latency.endToEnd.average - 100) / 19
  );
  score += latencyScore * weights.latency;

  // Throughput score (normalized to 0-100)
  const throughputScore = Math.min(
    100,
    this.performance.throughput.requestsPerSecond.average * 10
  );
  score += throughputScore * weights.throughput;

  // Accuracy score (already 0-100)
  const accuracyScore = this.quality.output.task.accuracy.score || 0;
  score += accuracyScore * weights.accuracy;

  // Availability score (already percentage)
  const availabilityScore =
    this.performance.reliability.availability.uptime || 0;
  score += availabilityScore * weights.availability;

  // Cost score (normalized - $0.10 = 0, $0.01 = 100)
  const costScore = Math.max(
    0,
    100 - ((this.cost.total.perRequest - 0.01) / 0.0009) * 100
  );
  score += costScore * weights.cost;

  return Math.round(score);
};

// Method to identify critical issues
modelPerformanceSchema.methods.getCriticalIssues = function () {
  const issues = [];

  // Performance issues
  if (this.performance.latency.endToEnd.average > 5000) {
    issues.push({
      type: 'performance',
      severity: 'critical',
      metric: 'latency',
      value: this.performance.latency.endToEnd.average,
      threshold: 5000,
      message: 'Response latency exceeds acceptable limits',
    });
  }

  // Quality issues
  if (this.quality.output.task.accuracy.score < 70) {
    issues.push({
      type: 'quality',
      severity: 'critical',
      metric: 'accuracy',
      value: this.quality.output.task.accuracy.score,
      threshold: 70,
      message: 'Model accuracy below minimum threshold',
    });
  }

  // Reliability issues
  if (this.performance.reliability.availability.uptime < 99) {
    issues.push({
      type: 'reliability',
      severity: 'high',
      metric: 'availability',
      value: this.performance.reliability.availability.uptime,
      threshold: 99,
      message: 'Service availability below SLA requirements',
    });
  }

  // Cost issues
  if (this.cost.total.perRequest > 0.1) {
    issues.push({
      type: 'cost',
      severity: 'medium',
      metric: 'per_request_cost',
      value: this.cost.total.perRequest,
      threshold: 0.1,
      message: 'Per-request cost exceeds budget targets',
    });
  }

  // Error rate issues
  if (this.performance.reliability.errorRates.total > 5) {
    issues.push({
      type: 'reliability',
      severity: 'high',
      metric: 'error_rate',
      value: this.performance.reliability.errorRates.total,
      threshold: 5,
      message: 'Error rate above acceptable threshold',
    });
  }

  return issues.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
};

// Method to generate performance report
modelPerformanceSchema.methods.generateReport = function () {
  const performanceScore = this.calculatePerformanceScore();
  const criticalIssues = this.getCriticalIssues();

  return {
    model: {
      id: this.model.modelId,
      name: this.model.modelName,
      version: this.model.version,
      provider: this.model.provider,
    },
    period: {
      start: this.evaluationPeriod.startTime,
      end: this.evaluationPeriod.endTime,
      type: this.evaluationPeriod.periodType,
    },
    summary: {
      performanceScore: performanceScore,
      grade: this.performanceGrade,
      criticalIssues: criticalIssues.length,
      status: this.modelStatus,
    },
    metrics: {
      performance: {
        latency: this.performance.latency.endToEnd.average,
        throughput: this.performance.throughput.requestsPerSecond.average,
        availability: this.performance.reliability.availability.uptime,
      },
      quality: {
        accuracy: this.quality.output.task.accuracy.score,
        satisfaction: this.quality.output.user.satisfaction.rating,
        hallucination: this.quality.hallucination.rate,
      },
      cost: {
        perRequest: this.cost.total.perRequest,
        total: this.cost.total.amount,
        efficiency: this.costEfficiency,
      },
    },
    issues: criticalIssues,
    recommendations: this.optimization.performance
      .concat(this.optimization.quality, this.optimization.cost)
      .slice(0, 5),
  };
};

// Virtual for performance grade
modelPerformanceSchema.virtual('performanceGrade').get(function () {
  const score = this.calculatePerformanceScore();

  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
});

// Virtual for model status
modelPerformanceSchema.virtual('modelStatus').get(function () {
  const criticalIssues = this.getCriticalIssues();
  const criticalCount = criticalIssues.filter(
    (i) => i.severity === 'critical'
  ).length;
  const highCount = criticalIssues.filter((i) => i.severity === 'high').length;

  if (criticalCount > 0) return 'critical';
  if (highCount > 1) return 'degraded';
  if (this.performance.reliability.availability.uptime < 99.5)
    return 'unstable';

  return 'healthy';
});

// Virtual for cost efficiency
modelPerformanceSchema.virtual('costEfficiency').get(function () {
  if (!this.cost.total.perRequest || !this.quality.output.task.accuracy.score) {
    return 0;
  }

  // Cost efficiency = Quality per dollar (higher is better)
  return Math.round(
    this.quality.output.task.accuracy.score /
      (this.cost.total.perRequest * 1000)
  );
});

export default mongoose.model('ModelPerformance', modelPerformanceSchema);
