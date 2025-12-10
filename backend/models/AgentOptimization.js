import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// AGENT OPTIMIZATION MODEL
// ============================================
const agentOptimizationSchema = new Schema(
  {
    // Optimization Session
    optimization: {
      sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },
      agentId: {
        type: String,
        required: true,
        index: true,
      },
      agentVersion: {
        type: String,
        required: true,
      },
      optimizationType: {
        type: String,
        enum: [
          'performance',
          'quality',
          'cost',
          'user_satisfaction',
          'comprehensive',
          'targeted',
        ],
        required: true,
        index: true,
      },
      trigger: {
        type: String,
        enum: [
          'scheduled',
          'performance_degradation',
          'user_feedback',
          'cost_threshold',
          'manual',
          'continuous',
        ],
        required: true,
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true,
        index: true,
      },
    },

    // Current Performance Baseline
    baseline: {
      // Performance metrics
      performance: {
        responseTime: {
          average: Number, // milliseconds
          p95: Number,
          p99: Number,
        },
        throughput: {
          requestsPerSecond: Number,
          conversationsPerHour: Number,
        },
        accuracy: {
          overall: Number, // percentage
          intentRecognition: Number,
          responseRelevance: Number,
        },
        reliability: {
          uptime: Number, // percentage
          errorRate: Number,
          recoveryTime: Number,
        },
      },

      // Quality metrics
      quality: {
        userSatisfaction: {
          averageRating: Number, // 1-5
          npsScore: Number, // -100 to 100
          satisfactionRate: Number, // percentage above 4
        },
        responseQuality: {
          relevance: Number,
          accuracy: Number,
          clarity: Number,
          helpfulness: Number,
        },
        conversationFlow: {
          completionRate: Number, // percentage
          escalationRate: Number,
          resolutionRate: Number,
        },
      },

      // Resource utilization
      resources: {
        compute: {
          cpuUsage: Number, // percentage
          memoryUsage: Number, // MB
          gpuUsage: Number,
        },
        costs: {
          tokenCost: Number, // per conversation
          computeCost: Number,
          storageCost: Number,
          totalCost: Number,
        },
        efficiency: {
          costPerConversation: Number,
          costPerResolution: Number,
          resourceEfficiency: Number, // 0-100
        },
      },

      // Business metrics
      business: {
        customerImpact: {
          retentionRate: Number,
          churnReduction: Number,
          satisfactionImprovement: Number,
        },
        operationalImpact: {
          ticketDeflection: Number, // percentage
          agentWorkloadReduction: Number,
          resolutionTimeReduction: Number,
        },
        revenueImpact: {
          conversionsSupported: Number,
          upsellsEnabled: Number,
          costSavings: Number,
        },
      },
    },

    // Optimization Analysis
    analysis: {
      // Performance bottlenecks
      bottlenecks: [
        {
          area: {
            type: String,
            enum: [
              'model_inference',
              'context_processing',
              'database_queries',
              'api_calls',
              'memory_management',
              'network_latency',
            ],
          },
          severity: {
            type: String,
            enum: ['minor', 'moderate', 'major', 'critical'],
          },
          impact: {
            responseTime: Number, // milliseconds added
            throughput: Number, // requests/sec reduced
            cost: Number, // additional cost percentage
            userExperience: String,
          },
          rootCause: String,
          frequency: Number, // percentage of requests affected
          detectdAt: Date,
        },
      ],

      // Quality issues
      qualityIssues: [
        {
          category: {
            type: String,
            enum: [
              'accuracy',
              'relevance',
              'clarity',
              'completeness',
              'tone',
              'context_retention',
            ],
          },
          description: String,
          frequency: Number, // percentage of responses affected
          severity: String,
          impact: {
            userSatisfaction: Number, // impact on satisfaction score
            businessMetrics: String,
            resolution: String,
          },
          examples: [String],
          patterns: [String],
        },
      ],

      // Cost inefficiencies
      costInefficiencies: [
        {
          area: {
            type: String,
            enum: [
              'token_usage',
              'compute_resources',
              'storage',
              'api_calls',
              'redundant_processing',
            ],
          },
          wastedCost: {
            amount: Number, // dollars
            percentage: Number,
          },
          opportunity: {
            description: String,
            potentialSavings: Number,
            implementationEffort: String, // 'low', 'medium', 'high'
          },
          priority: String,
        },
      ],

      // User experience gaps
      userExperienceGaps: [
        {
          area: String,
          currentPerformance: Number,
          userExpectation: Number,
          gap: Number,
          impact: String,
          segments: [String], // user segments affected
          feedback: [String],
        },
      ],
    },

    // Optimization Strategies
    strategies: {
      // Performance optimizations
      performance: [
        {
          name: String,
          category: {
            type: String,
            enum: [
              'caching',
              'model_optimization',
              'infrastructure',
              'algorithm_improvement',
              'parallel_processing',
            ],
          },
          description: String,
          expectedImpact: {
            responseTime: {
              improvement: Number, // percentage
              confidence: Number, // 0-100
            },
            throughput: {
              improvement: Number,
              confidence: Number,
            },
            cost: {
              change: Number, // positive for savings, negative for increase
              confidence: Number,
            },
          },
          implementation: {
            effort: {
              type: String,
              enum: ['low', 'medium', 'high', 'very_high'],
            },
            duration: Number, // days
            resources: [String],
            risks: [String],
            dependencies: [String],
          },
          testing: {
            required: Boolean,
            duration: Number, // days
            criteria: [String],
            rollbackPlan: String,
          },
        },
      ],

      // Quality improvements
      quality: [
        {
          name: String,
          targetArea: {
            type: String,
            enum: [
              'accuracy',
              'relevance',
              'clarity',
              'personalization',
              'context_awareness',
              'tone',
            ],
          },
          approach: {
            type: String,
            enum: [
              'training_data',
              'model_tuning',
              'prompt_engineering',
              'post_processing',
              'hybrid_approach',
            ],
          },
          description: String,
          expectedImpact: {
            qualityScore: {
              improvement: Number, // points
              confidence: Number,
            },
            userSatisfaction: {
              improvement: Number, // percentage
              confidence: Number,
            },
            businessMetrics: {
              metric: String,
              improvement: Number,
              confidence: Number,
            },
          },
          resources: {
            dataRequirements: [String],
            computeRequirements: String,
            timeRequirements: Number, // days
            expertiseRequired: [String],
          },
        },
      ],

      // Cost optimizations
      cost: [
        {
          name: String,
          targetArea: {
            type: String,
            enum: [
              'token_efficiency',
              'model_selection',
              'caching',
              'batch_processing',
              'resource_allocation',
            ],
          },
          description: String,
          expectedSavings: {
            percentage: Number,
            amount: Number, // dollars per month
            confidence: Number,
          },
          tradeoffs: {
            performance: String,
            quality: String,
            features: String,
            maintenance: String,
          },
          implementation: {
            complexity: String,
            timeline: Number, // days
            prerequisites: [String],
          },
        },
      ],

      // User experience enhancements
      userExperience: [
        {
          name: String,
          targetMetric: String,
          currentValue: Number,
          targetValue: Number,
          approach: String,
          userSegment: [String],
          expectedImpact: {
            satisfaction: Number,
            engagement: Number,
            retention: Number,
            adoption: Number,
          },
          personalization: {
            level: String, // 'basic', 'moderate', 'advanced'
            dataRequired: [String],
            privacyImpact: String,
          },
        },
      ],
    },

    // Optimization Plan
    plan: {
      // Phase planning
      phases: [
        {
          phaseNumber: Number,
          name: String,
          duration: Number, // days
          startDate: Date,
          endDate: Date,
          objectives: [String],
          strategies: [String], // references to strategy names

          // Resources
          resources: {
            team: [String],
            compute: String,
            budget: Number,
            tools: [String],
          },

          // Success criteria
          successCriteria: [
            {
              metric: String,
              currentValue: Number,
              targetValue: Number,
              tolerance: Number,
              measurement: String,
            },
          ],

          // Risk management
          risks: [
            {
              risk: String,
              probability: String, // 'low', 'medium', 'high'
              impact: String,
              mitigation: String,
              contingency: String,
            },
          ],

          // Dependencies
          dependencies: [String],
          blockers: [String],
        },
      ],

      // Overall timeline
      timeline: {
        totalDuration: Number, // days
        startDate: Date,
        expectedEndDate: Date,
        milestones: [
          {
            name: String,
            date: Date,
            description: String,
            deliverables: [String],
          },
        ],
      },

      // Resource allocation
      resources: {
        total: {
          team: Number, // person-days
          compute: Number, // compute hours
          budget: Number, // dollars
          external: [String],
        },
        breakdown: [
          {
            category: String,
            allocation: Number,
            justification: String,
          },
        ],
      },
    },

    // Implementation Status
    implementation: {
      // Current phase
      currentPhase: {
        phaseNumber: Number,
        name: String,
        status: {
          type: String,
          enum: [
            'not_started',
            'planning',
            'in_progress',
            'testing',
            'completed',
            'on_hold',
            'cancelled',
          ],
        },
        progress: Number, // percentage
        startedAt: Date,
        expectedCompletion: Date,
      },

      // Completed strategies
      completedStrategies: [
        {
          strategyName: String,
          completedAt: Date,
          actualImpact: {
            performance: {
              responseTime: Number,
              throughput: Number,
              accuracy: Number,
            },
            quality: {
              satisfaction: Number,
              qualityScore: Number,
            },
            cost: {
              savings: Number,
              efficiency: Number,
            },
          },
          actualVsExpected: {
            performance: String, // 'better', 'as_expected', 'worse'
            timeline: String,
            cost: String,
            quality: String,
          },
          lessonsLearned: [String],
          issues: [String],
        },
      ],

      // In-progress strategies
      inProgressStrategies: [
        {
          strategyName: String,
          startedAt: Date,
          expectedCompletion: Date,
          progress: Number, // percentage
          currentPhase: String,
          blockers: [String],
          risks: [String],
          earlyResults: {
            promising: [String],
            concerning: [String],
            neutral: [String],
          },
        },
      ],

      // Testing and validation
      testing: {
        currentTests: [
          {
            testName: String,
            testType: String, // 'a_b', 'canary', 'load', 'quality', 'integration'
            startedAt: Date,
            duration: Number, // days
            scope: String,
            metrics: [String],
            status: String,
          },
        ],
        results: [
          {
            testName: String,
            completedAt: Date,
            outcome: String, // 'success', 'partial_success', 'failure'
            results: {
              type: Map,
              of: Number,
            },
            conclusions: [String],
            recommendations: [String],
          },
        ],
      },
    },

    // Results and Impact
    results: {
      // Overall impact
      overallImpact: {
        performance: {
          responseTimeImprovement: Number, // percentage
          throughputIncrease: Number,
          accuracyIncrease: Number,
          reliabilityImprovement: Number,
        },
        quality: {
          satisfactionIncrease: Number,
          qualityScoreIncrease: Number,
          resolutionRateIncrease: Number,
          escalationRateDecrease: Number,
        },
        cost: {
          totalSavings: Number, // dollars
          percentageReduction: Number,
          efficiencyGain: Number,
        },
        business: {
          customerImpact: String,
          operationalImpact: String,
          revenueImpact: Number,
          competitiveAdvantage: String,
        },
      },

      // Detailed metrics
      detailedMetrics: {
        before: {
          responseTime: Number,
          throughput: Number,
          satisfaction: Number,
          cost: Number,
          errorRate: Number,
        },
        after: {
          responseTime: Number,
          throughput: Number,
          satisfaction: Number,
          cost: Number,
          errorRate: Number,
        },
        improvement: {
          responseTime: Number, // percentage
          throughput: Number,
          satisfaction: Number,
          cost: Number,
          errorRate: Number,
        },
      },

      // User feedback
      userFeedback: {
        satisfactionChange: Number,
        commonFeedback: [String],
        complaints: [String],
        compliments: [String],
        suggestions: [String],
      },

      // Unexpected outcomes
      unexpectedOutcomes: [
        {
          type: String, // 'positive', 'negative', 'neutral'
          description: String,
          impact: String,
          responseRequired: Boolean,
          actionTaken: String,
        },
      ],
    },

    // Continuous Optimization
    continuous: {
      // Monitoring
      monitoring: {
        enabled: Boolean,
        frequency: String, // 'hourly', 'daily', 'weekly'
        metrics: [String],
        thresholds: {
          type: Map,
          of: Number,
        },
        alerts: [
          {
            metric: String,
            condition: String,
            threshold: Number,
            severity: String,
            recipients: [String],
          },
        ],
      },

      // Auto-optimization
      autoOptimization: {
        enabled: Boolean,
        scope: [String], // areas where auto-optimization is allowed
        constraints: {
          maxCostIncrease: Number, // percentage
          minQualityMaintenance: Number,
          maxPerformanceImpact: Number,
        },
        approvalRequired: {
          costThreshold: Number,
          qualityImpact: Number,
          performanceImpact: Number,
        },
      },

      // Learning and adaptation
      learning: {
        patternRecognition: {
          enabled: Boolean,
          patterns: [
            {
              pattern: String,
              frequency: Number,
              impact: String,
              recommendation: String,
            },
          ],
        },
        adaptiveOptimization: {
          enabled: Boolean,
          strategies: [String],
          confidence: Number,
          successRate: Number,
        },
        knowledgeBase: {
          optimizations: Number,
          successfulStrategies: [String],
          failedStrategies: [String],
          bestPractices: [String],
        },
      },
    },

    // Comparative Analysis
    benchmarking: {
      // Performance comparison
      performance: {
        baseline: String, // reference point
        currentVsBaseline: {
          improvement: Number, // percentage
          areas: {
            type: Map,
            of: Number,
          },
        },
        industryComparison: {
          percentile: Number, // 0-100
          competitivePosition: String,
          advantages: [String],
          gaps: [String],
        },
      },

      // Cost comparison
      cost: {
        baselineCost: Number,
        currentCost: Number,
        savings: Number,
        efficiency: {
          costPerConversation: Number,
          costPerResolution: Number,
          resourceUtilization: Number,
        },
        industryBenchmark: {
          position: String, // 'above_average', 'average', 'below_average'
          savingsOpportunity: Number,
        },
      },

      // Quality comparison
      quality: {
        improvementAreas: [String],
        maintainedStandards: [String],
        exceededExpectations: [String],
        userSatisfactionTrend: {
          direction: String, // 'improving', 'stable', 'declining'
          rate: Number, // change per period
        },
      },
    },

    // Optimization Recommendations
    recommendations: {
      // Next optimization cycle
      nextCycle: {
        recommendedDate: Date,
        priority: String,
        focus: [String],
        expectedBenefits: [String],
        resources: String,
      },

      // Immediate actions
      immediate: [
        {
          action: String,
          priority: String,
          effort: String,
          impact: String,
          timeline: String,
          owner: String,
        },
      ],

      // Long-term strategy
      longTerm: [
        {
          strategy: String,
          timeframe: String, // '3_months', '6_months', '1_year'
          investment: String,
          expectedReturn: String,
          risks: [String],
          success_factors: [String],
        },
      ],

      // Continuous improvements
      continuous: [
        {
          area: String,
          approach: String,
          frequency: String,
          automation: String,
          monitoring: String,
        },
      ],
    },

    // Metadata
    metadata: {
      version: {
        type: String,
        default: '1.0',
      },

      // Optimization context
      context: {
        businessGoals: [String],
        constraints: [String],
        stakeholders: [String],
        environment: String, // 'production', 'staging', 'development'
      },

      // Documentation
      documentation: {
        playbooks: [String],
        procedures: [String],
        knowledgeBase: [String],
        trainingMaterials: [String],
      },

      // Approval and governance
      governance: {
        approvedBy: String,
        approvedAt: Date,
        reviewers: [String],
        compliance: [String],
        auditTrail: [
          {
            action: String,
            user: String,
            timestamp: Date,
            changes: String,
          },
        ],
      },
    },
  },
  {
    timestamps: true,
    collection: 'agentoptimization',
  }
);

// Compound indexes for performance
agentOptimizationSchema.index({ 'optimization.agentId': 1, createdAt: -1 });
agentOptimizationSchema.index({
  'optimization.optimizationType': 1,
  'optimization.priority': 1,
});

// Status indexes
agentOptimizationSchema.index({ 'implementation.currentPhase.status': 1 });
agentOptimizationSchema.index({ 'optimization.trigger': 1 });

// Results indexes
agentOptimizationSchema.index({
  'results.overallImpact.performance.responseTimeImprovement': -1,
});
agentOptimizationSchema.index({
  'results.overallImpact.cost.totalSavings': -1,
});

// TTL index for old optimizations (keep for 3 years)
agentOptimizationSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 94608000, // 3 years
  }
);

// Static method to get optimization history
agentOptimizationSchema.statics.getOptimizationHistory = async function (
  agentId,
  limit = 10
) {
  return this.find({ 'optimization.agentId': agentId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('optimization results implementation.currentPhase createdAt');
};

// Static method to get active optimizations
agentOptimizationSchema.statics.getActiveOptimizations = async function (
  agentId
) {
  return this.find({
    'optimization.agentId': agentId,
    'implementation.currentPhase.status': {
      $in: ['planning', 'in_progress', 'testing'],
    },
  }).sort({ 'optimization.priority': -1, createdAt: -1 });
};

// Static method to get optimization impact summary
agentOptimizationSchema.statics.getImpactSummary = async function (
  agentId,
  timeframe = 'year'
) {
  const days = timeframe === 'month' ? 30 : timeframe === 'quarter' ? 90 : 365;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        'optimization.agentId': agentId,
        'implementation.currentPhase.status': 'completed',
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalOptimizations: { $sum: 1 },
        avgPerformanceImprovement: {
          $avg: '$results.overallImpact.performance.responseTimeImprovement',
        },
        avgSatisfactionIncrease: {
          $avg: '$results.overallImpact.quality.satisfactionIncrease',
        },
        totalCostSavings: {
          $sum: '$results.overallImpact.cost.totalSavings',
        },
        avgEfficiencyGain: {
          $avg: '$results.overallImpact.cost.efficiencyGain',
        },
      },
    },
  ];

  return this.aggregate(pipeline);
};

// Method to calculate ROI
agentOptimizationSchema.methods.calculateROI = function () {
  if (
    !this.results.overallImpact.cost.totalSavings ||
    !this.plan.resources.total.budget
  ) {
    return null;
  }

  const savings = this.results.overallImpact.cost.totalSavings;
  const investment = this.plan.resources.total.budget;

  return ((savings - investment) / investment) * 100;
};

// Method to get optimization status
agentOptimizationSchema.methods.getOptimizationStatus = function () {
  const currentPhase = this.implementation.currentPhase;
  const totalPhases = this.plan.phases.length;
  const completedPhases = this.implementation.completedStrategies.length;

  return {
    status: currentPhase.status,
    currentPhase: currentPhase.name,
    progress: currentPhase.progress,
    overallProgress:
      totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0,
    daysRemaining: currentPhase.expectedCompletion
      ? Math.ceil(
          (currentPhase.expectedCompletion - new Date()) / (1000 * 60 * 60 * 24)
        )
      : null,
    onTrack:
      currentPhase.progress >=
      ((new Date() - currentPhase.startedAt) /
        (currentPhase.expectedCompletion - currentPhase.startedAt)) *
        100,
  };
};

// Method to generate optimization report
agentOptimizationSchema.methods.generateReport = function () {
  const roi = this.calculateROI();
  const status = this.getOptimizationStatus();

  return {
    optimization: {
      sessionId: this.optimization.sessionId,
      agentId: this.optimization.agentId,
      type: this.optimization.optimizationType,
      priority: this.optimization.priority,
    },
    status: status,
    impact: {
      performance: this.results.overallImpact.performance,
      quality: this.results.overallImpact.quality,
      cost: this.results.overallImpact.cost,
      roi: roi,
    },
    timeline: {
      started: this.plan.timeline.startDate,
      expectedEnd: this.plan.timeline.expectedEndDate,
      actualProgress: status.overallProgress,
    },
    keyAchievements: [
      `${this.results.overallImpact.performance.responseTimeImprovement}% faster response time`,
      `${this.results.overallImpact.quality.satisfactionIncrease}% satisfaction increase`,
      `$${this.results.overallImpact.cost.totalSavings} cost savings`,
      `${this.results.overallImpact.cost.efficiencyGain}% efficiency gain`,
    ].filter(
      (achievement) =>
        !achievement.includes('null') && !achievement.includes('undefined')
    ),
  };
};

// Virtual for success score
agentOptimizationSchema.virtual('successScore').get(function () {
  if (!this.results.overallImpact) return 0;

  let score = 0;
  let factors = 0;

  // Performance factor (25%)
  if (this.results.overallImpact.performance.responseTimeImprovement > 0) {
    score +=
      Math.min(
        this.results.overallImpact.performance.responseTimeImprovement,
        50
      ) * 0.25;
    factors++;
  }

  // Quality factor (25%)
  if (this.results.overallImpact.quality.satisfactionIncrease > 0) {
    score +=
      Math.min(this.results.overallImpact.quality.satisfactionIncrease, 30) *
      0.25;
    factors++;
  }

  // Cost factor (25%)
  if (this.results.overallImpact.cost.percentageReduction > 0) {
    score +=
      Math.min(this.results.overallImpact.cost.percentageReduction, 40) * 0.25;
    factors++;
  }

  // ROI factor (25%)
  const roi = this.calculateROI();
  if (roi && roi > 0) {
    score += Math.min(roi, 200) * 0.25;
    factors++;
  }

  return factors > 0 ? Math.round((score / factors) * 4) : 0; // Scale to 0-100
});

// Virtual for optimization health
agentOptimizationSchema.virtual('optimizationHealth').get(function () {
  const status = this.getOptimizationStatus();

  if (status.status === 'completed' && this.successScore > 70) {
    return 'excellent';
  } else if (status.status === 'completed' && this.successScore > 50) {
    return 'good';
  } else if (status.onTrack && status.status === 'in_progress') {
    return 'on_track';
  } else if (status.status === 'in_progress' && !status.onTrack) {
    return 'at_risk';
  } else if (status.status === 'on_hold') {
    return 'blocked';
  }

  return 'unknown';
});

export default mongoose.model('AgentOptimization', agentOptimizationSchema);
