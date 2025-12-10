import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// AGENT TRAINING MODEL
// ============================================
const agentTrainingSchema = new Schema(
  {
    // Training Session Identification
    training: {
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
      trainingType: {
        type: String,
        enum: [
          'initial_training',
          'fine_tuning',
          'reinforcement_learning',
          'knowledge_update',
          'performance_improvement',
          'safety_training',
          'continuous_learning',
        ],
        required: true,
        index: true,
      },
      trainingMode: {
        type: String,
        enum: [
          'supervised',
          'unsupervised',
          'reinforcement',
          'self_supervised',
          'few_shot',
          'zero_shot',
          'human_feedback',
        ],
        required: true,
      },
      trigger: {
        type: String,
        enum: [
          'scheduled',
          'performance_decline',
          'new_data',
          'feedback_threshold',
          'manual',
          'error_pattern',
          'user_request',
        ],
        required: true,
      },
    },

    // Training Configuration
    configuration: {
      // Model configuration
      model: {
        baseModel: String,
        architecture: String,
        version: String,
        parameters: Number, // billions of parameters
        contextWindow: Number,
        vocabulary: Number,
      },

      // Training parameters
      parameters: {
        learningRate: {
          initial: Number,
          final: Number,
          schedule: String, // 'constant', 'linear_decay', 'cosine', 'exponential'
        },
        batchSize: Number,
        epochs: Number,
        steps: Number,
        warmupSteps: Number,
        gradientClipping: Number,
        weightDecay: Number,
        dropout: Number,
      },

      // Optimization
      optimization: {
        optimizer: String, // 'adam', 'sgd', 'adamw'
        beta1: Number,
        beta2: Number,
        epsilon: Number,
        momentum: Number,
        lossFunction: String,
        regularization: {
          l1: Number,
          l2: Number,
          elastic: Number,
        },
      },

      // Hardware configuration
      hardware: {
        gpus: Number,
        cpus: Number,
        memory: Number, // GB
        storage: Number, // GB
        distributed: Boolean,
        parallelStrategy: String, // 'data', 'model', 'pipeline'
      },
    },

    // Training Data
    trainingData: {
      // Data sources
      sources: [
        {
          sourceId: String,
          name: String,
          type: String, // 'conversations', 'feedback', 'knowledge_base', 'synthetic', 'external'
          size: Number, // records
          quality: {
            score: Number, // 0-100
            completeness: Number,
            accuracy: Number,
            consistency: Number,
            freshness: Number, // days old
          },
          preprocessing: [String],
          validation: {
            passed: Boolean,
            issues: [String],
            corrections: [String],
          },
        },
      ],

      // Dataset statistics
      statistics: {
        total: {
          records: Number,
          tokens: Number,
          size: Number, // GB
          conversations: Number,
          uniqueUsers: Number,
        },

        // Data distribution
        distribution: {
          // by category
          categories: {
            type: Map,
            of: Number,
          },
          // by difficulty
          difficulty: {
            easy: Number,
            medium: Number,
            hard: Number,
            expert: Number,
          },
          // by source
          sources: {
            type: Map,
            of: Number,
          },
          // by quality
          quality: {
            high: Number,
            medium: Number,
            low: Number,
          },
        },

        // Data quality metrics
        quality: {
          duplicates: Number,
          incomplete: Number,
          inconsistent: Number,
          biased: Number,
          outdated: Number,
          validated: Number,
        },
      },

      // Data preparation
      preparation: {
        // Preprocessing steps
        preprocessing: [
          {
            step: String,
            description: String,
            recordsAffected: Number,
            timeSpent: Number, // minutes
            quality_impact: String,
          },
        ],

        // Data augmentation
        augmentation: {
          techniques: [String],
          syntheticData: Number, // records generated
          augmentationRatio: Number, // synthetic/original
          quality_validation: Boolean,
        },

        // Data splitting
        splits: {
          train: {
            records: Number,
            percentage: Number,
          },
          validation: {
            records: Number,
            percentage: Number,
          },
          test: {
            records: Number,
            percentage: Number,
          },
        },
      },
    },

    // Training Process
    process: {
      // Training phases
      phases: [
        {
          phaseNumber: Number,
          name: String,
          objective: String,
          duration: {
            planned: Number, // hours
            actual: Number,
          },

          // Phase configuration
          configuration: {
            learningRate: Number,
            epochs: Number,
            batchSize: Number,
            freezeParameters: [String],
          },

          // Phase results
          results: {
            startLoss: Number,
            endLoss: Number,
            bestLoss: Number,
            convergence: Boolean,
            overfitting: Boolean,
            earlyStop: Boolean,
          },

          status: {
            type: String,
            enum: ['planned', 'running', 'paused', 'completed', 'failed'],
          },
        },
      ],

      // Training metrics tracking
      metrics: {
        // Loss metrics
        loss: {
          train: [Number],
          validation: [Number],
          test: Number,
          convergence: {
            achieved: Boolean,
            epoch: Number,
            patience: Number,
          },
        },

        // Performance metrics
        performance: {
          accuracy: [Number],
          f1Score: [Number],
          precision: [Number],
          recall: [Number],
          bleu: [Number], // for text generation
          rouge: [Number], // for summarization
          perplexity: [Number], // for language models
        },

        // Training dynamics
        dynamics: {
          gradientNorm: [Number],
          learningRate: [Number],
          parameterNorms: [Number],
          updateMagnitude: [Number],
        },
      },

      // Resource utilization
      resources: {
        // Computational resources
        compute: {
          gpuUtilization: {
            average: Number, // percentage
            peak: Number,
            efficiency: Number,
          },
          memoryUsage: {
            gpu: Number, // GB
            cpu: Number,
            peak: Number,
          },
          powerConsumption: Number, // watts
          carbonFootprint: Number, // kg CO2
        },

        // Time resources
        time: {
          planned: Number, // hours
          actual: Number,
          breakdown: {
            dataLoading: Number,
            training: Number,
            validation: Number,
            checkpointing: Number,
            other: Number,
          },
        },

        // Cost resources
        cost: {
          compute: Number, // dollars
          storage: Number,
          network: Number,
          personnel: Number,
          total: Number,
        },
      },
    },

    // Training Results
    results: {
      // Final performance
      performance: {
        // Quantitative metrics
        quantitative: {
          accuracy: Number,
          f1Score: Number,
          precision: Number,
          recall: Number,
          auc: Number,
          loss: Number,
          perplexity: Number,
        },

        // Qualitative assessment
        qualitative: {
          responseQuality: Number, // 0-100
          coherence: Number,
          relevance: Number,
          safety: Number,
          creativity: Number,
          factuality: Number,
        },

        // Task-specific metrics
        taskSpecific: {
          conversationFlow: Number,
          intentRecognition: Number,
          entityExtraction: Number,
          sentimentAccuracy: Number,
          knowledgeRetention: Number,
        },
      },

      // Capability assessment
      capabilities: {
        // Core capabilities
        core: {
          understanding: {
            score: Number, // 0-100
            improvement: Number, // vs previous
            examples: [String],
          },
          generation: {
            score: Number,
            improvement: Number,
            examples: [String],
          },
          reasoning: {
            score: Number,
            improvement: Number,
            examples: [String],
          },
        },

        // Specialized capabilities
        specialized: [
          {
            capability: String,
            score: Number,
            improvement: Number,
            confidence: Number,
            evaluation_method: String,
          },
        ],

        // Emergent capabilities
        emergent: [
          {
            capability: String,
            discovered: Boolean,
            strength: Number,
            applications: [String],
          },
        ],
      },

      // Model comparison
      comparison: {
        // vs. previous version
        previous: {
          available: Boolean,
          improvements: {
            performance: Number, // percentage
            accuracy: Number,
            speed: Number,
            efficiency: Number,
          },
          regressions: [String],
          tradeoffs: [String],
        },

        // vs. baseline models
        baseline: [
          {
            modelName: String,
            comparison: {
              performance: String, // 'better', 'similar', 'worse'
              accuracy: Number, // percentage difference
              efficiency: Number,
              overall: String,
            },
          },
        ],

        // vs. industry benchmarks
        industry: {
          percentile: Number, // 0-100
          ranking: Number,
          strengths: [String],
          weaknesses: [String],
        },
      },
    },

    // Validation and Testing
    validation: {
      // Validation strategy
      strategy: {
        method: String, // 'holdout', 'k_fold', 'time_series', 'stratified'
        parameters: {
          folds: Number,
          testSize: Number,
          validationSize: Number,
          stratifyBy: String,
        },
      },

      // Test results
      tests: [
        {
          testName: String,
          testType: String, // 'unit', 'integration', 'performance', 'safety', 'bias'
          dataset: String,
          metrics: {
            type: Map,
            of: Number,
          },
          results: {
            passed: Boolean,
            score: Number,
            issues: [String],
            recommendations: [String],
          },
        },
      ],

      // Cross-validation
      crossValidation: {
        folds: Number,
        scores: [Number],
        meanScore: Number,
        standardDeviation: Number,
        confidence: {
          interval: [Number], // [lower, upper]
          level: Number, // e.g., 95
        },
      },

      // Human evaluation
      humanEvaluation: {
        evaluators: Number,
        samples: Number,
        agreement: Number, // inter-annotator agreement
        results: {
          overall: Number, // 0-100
          categories: {
            type: Map,
            of: Number,
          },
          feedback: [String],
        },
      },
    },

    // Safety and Alignment
    safety: {
      // Safety testing
      testing: {
        // Harmful content generation
        harmfulContent: {
          tested: Boolean,
          attempts: Number,
          successful: Number,
          rate: Number, // percentage
          categories: {
            hate: Number,
            violence: Number,
            sexual: Number,
            harassment: Number,
          },
        },

        // Bias testing
        bias: {
          tested: Boolean,
          biasTypes: [String],
          severity: String, // 'low', 'medium', 'high'
          mitigation: [String],
          effectiveness: Number, // 0-100
        },

        // Robustness testing
        robustness: {
          adversarialExamples: {
            tested: Number,
            success_rate: Number,
            mitigation: [String],
          },
          distributionShift: {
            performance: Number, // on shifted data
            degradation: Number, // percentage
          },
        },
      },

      // Alignment measures
      alignment: {
        // Human preference alignment
        humanPreference: {
          score: Number, // 0-100
          method: String, // 'rlhf', 'constitutional_ai', 'preference_learning'
          agreements: Number, // with human preferences
          disagreements: Number,
        },

        // Value alignment
        valueAlignment: {
          helpfulness: Number,
          harmlessness: Number,
          honesty: Number,
          overall: Number,
        },

        // Constitutional AI
        constitution: {
          rules: [String],
          compliance: Number, // percentage
          violations: Number,
          correctionRate: Number,
        },
      },
    },

    // Learning Analytics
    learning: {
      // Learning curves
      curves: {
        trainingLoss: [Number],
        validationLoss: [Number],
        accuracy: [Number],
        learningRate: [Number],
        epochs: [Number],
      },

      // Knowledge acquisition
      knowledge: {
        // Concepts learned
        concepts: [
          {
            concept: String,
            confidence: Number,
            examples: [String],
            generalizes: Boolean,
          },
        ],

        // Skills acquired
        skills: [
          {
            skill: String,
            proficiency: Number, // 0-100
            improvement: Number, // vs. pre-training
            transferable: Boolean,
          },
        ],

        // Knowledge retention
        retention: {
          shortTerm: Number, // immediately after training
          longTerm: Number, // after deployment
          forgetting: {
            rate: Number, // percentage per time unit
            mitigation: [String],
          },
        },
      },

      // Transfer learning
      transfer: {
        sourceModel: String,
        transferredLayers: [String],
        frozenLayers: [String],
        effectiveness: {
          convergenceTime: Number, // vs. from scratch
          finalPerformance: Number,
          dataEfficiency: Number, // data required vs. from scratch
        },
      },

      // Continual learning
      continual: {
        enabled: Boolean,
        strategy: String, // 'ewc', 'rehearsal', 'progressive', 'meta_learning'
        catastrophicForgetting: {
          measured: Boolean,
          severity: Number, // 0-100
          mitigation: {
            strategy: String,
            effectiveness: Number,
          },
        },
        plasticity: {
          score: Number, // ability to learn new tasks
          stability: Number, // retention of old tasks
        },
      },
    },

    // Deployment Preparation
    deployment: {
      // Model packaging
      packaging: {
        format: String, // 'onnx', 'tensorrt', 'pytorch', 'huggingface'
        size: Number, // MB
        compression: {
          technique: String, // 'quantization', 'pruning', 'distillation'
          ratio: Number,
          qualityImpact: Number, // percentage degradation
        },
      },

      // Performance optimization
      optimization: {
        quantization: {
          applied: Boolean,
          type: String, // 'int8', 'int4', 'fp16'
          speedup: Number,
          accuracyLoss: Number,
        },
        pruning: {
          applied: Boolean,
          sparsity: Number, // percentage of weights removed
          speedup: Number,
          accuracyLoss: Number,
        },
        distillation: {
          applied: Boolean,
          teacherModel: String,
          compressionRatio: Number,
          knowledgeTransfer: Number, // percentage retained
        },
      },

      // Readiness assessment
      readiness: {
        technical: {
          score: Number, // 0-100
          requirements: [String],
          dependencies: [String],
          tested: Boolean,
        },
        business: {
          score: Number,
          criteria: [String],
          approved: Boolean,
          approvedBy: String,
        },
        safety: {
          score: Number,
          assessments: [String],
          cleared: Boolean,
          restrictions: [String],
        },
      },
    },

    // Monitoring and Feedback
    monitoring: {
      // Training monitoring
      training: {
        realTime: {
          enabled: Boolean,
          metrics: [String],
          alerts: [
            {
              metric: String,
              threshold: Number,
              action: String,
            },
          ],
        },
        logging: {
          level: String, // 'debug', 'info', 'warning', 'error'
          storage: String,
          retention: Number, // days
        },
      },

      // Post-deployment monitoring
      postDeployment: {
        performanceTracking: {
          enabled: Boolean,
          metrics: [String],
          frequency: String, // 'hourly', 'daily', 'weekly'
          baseline: {
            type: Map,
            of: Number,
          },
        },

        // Performance drift detection
        drift: {
          detection: {
            enabled: Boolean,
            method: String, // 'statistical', 'ml_based', 'rule_based'
            sensitivity: Number, // 0-1
            windowSize: Number, // samples
          },
          response: {
            alertThreshold: Number,
            retrainThreshold: Number,
            automaticRetrain: Boolean,
          },
        },
      },

      // Feedback integration
      feedback: {
        collection: {
          enabled: Boolean,
          sources: [String],
          frequency: String,
          processing: String, // 'real_time', 'batch', 'manual'
        },
        integration: {
          retrainTrigger: {
            feedbackCount: Number,
            sentimentThreshold: Number,
            performanceDrop: Number,
          },
          dataIncorporation: {
            automatic: Boolean,
            validation: Boolean,
            weighting: String, // how feedback is weighted
          },
        },
      },
    },

    // Metadata and Documentation
    metadata: {
      version: {
        type: String,
        default: '1.0',
      },

      // Training context
      context: {
        businessObjective: String,
        technicalObjective: String,
        constraints: [String],
        requirements: [String],
        stakeholders: [String],
      },

      // Documentation
      documentation: {
        trainingPlan: String,
        methodology: String,
        experiments: [String],
        results: String,
        deployment: String,
        maintenance: String,
      },

      // Reproducibility
      reproducibility: {
        seed: Number,
        environmentDetails: String,
        dependencies: [String],
        dataVersions: [String],
        codeVersion: String,
        configFiles: [String],
      },

      // Compliance and governance
      governance: {
        approvals: [
          {
            stage: String,
            approver: String,
            approvedAt: Date,
            conditions: [String],
          },
        ],
        compliance: [String], // regulatory requirements met
        auditTrail: [
          {
            action: String,
            user: String,
            timestamp: Date,
            details: String,
          },
        ],
      },
    },
  },
  {
    timestamps: true,
    collection: 'agenttraining',
  }
);

// Compound indexes for performance
agentTrainingSchema.index({ 'training.agentId': 1, createdAt: -1 });
agentTrainingSchema.index({
  'training.trainingType': 1,
  'training.trainingMode': 1,
});

// Performance indexes
agentTrainingSchema.index({ 'results.performance.quantitative.accuracy': -1 });
agentTrainingSchema.index({ 'process.metrics.loss.convergence.achieved': 1 });
agentTrainingSchema.index({ 'validation.crossValidation.meanScore': -1 });

// Status indexes
agentTrainingSchema.index({ 'training.trigger': 1 });
agentTrainingSchema.index({ 'deployment.readiness.business.approved': 1 });

// TTL index for training data (keep for 5 years for research)
agentTrainingSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 157680000, // 5 years
  }
);

// Static method to get training history
agentTrainingSchema.statics.getTrainingHistory = async function (
  agentId,
  limit = 10
) {
  return this.find({ 'training.agentId': agentId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select(
      'training results.performance.quantitative deployment.readiness createdAt'
    );
};

// Static method to get training performance trends
agentTrainingSchema.statics.getPerformanceTrends = async function (agentId) {
  const pipeline = [
    {
      $match: { 'training.agentId': agentId },
    },
    {
      $sort: { createdAt: 1 },
    },
    {
      $project: {
        date: '$createdAt',
        accuracy: '$results.performance.quantitative.accuracy',
        f1Score: '$results.performance.quantitative.f1Score',
        loss: '$results.performance.quantitative.loss',
        trainingType: '$training.trainingType',
        convergence: '$process.metrics.loss.convergence.achieved',
      },
    },
  ];

  return this.aggregate(pipeline);
};

// Static method to analyze training effectiveness
agentTrainingSchema.statics.analyzeTrainingEffectiveness = async function (
  agentId,
  timeframe = 'year'
) {
  const days = timeframe === 'month' ? 30 : timeframe === 'quarter' ? 90 : 365;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        'training.agentId': agentId,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$training.trainingType',
        sessions: { $sum: 1 },
        avgAccuracy: { $avg: '$results.performance.quantitative.accuracy' },
        avgF1Score: { $avg: '$results.performance.quantitative.f1Score' },
        avgTrainingTime: { $avg: '$process.resources.time.actual' },
        avgCost: { $avg: '$process.resources.cost.total' },
        successfulDeployments: {
          $sum: {
            $cond: ['$deployment.readiness.business.approved', 1, 0],
          },
        },
      },
    },
    {
      $addFields: {
        costEfficiency: {
          $cond: [
            { $gt: ['$avgCost', 0] },
            { $divide: ['$avgAccuracy', '$avgCost'] },
            0,
          ],
        },
        deploymentRate: {
          $cond: [
            { $gt: ['$sessions', 0] },
            {
              $multiply: [
                { $divide: ['$successfulDeployments', '$sessions'] },
                100,
              ],
            },
            0,
          ],
        },
      },
    },
    {
      $sort: { avgAccuracy: -1 },
    },
  ];

  return this.aggregate(pipeline);
};

// Method to calculate training ROI
agentTrainingSchema.methods.calculateTrainingROI = function () {
  if (
    !this.process.resources.cost.total ||
    !this.results.performance.quantitative.accuracy
  ) {
    return null;
  }

  const cost = this.process.resources.cost.total;
  const accuracyGain =
    this.results.comparison.previous.improvements.accuracy || 0;

  // Simplified ROI calculation based on performance improvement
  const estimatedValue = accuracyGain * 10000; // $10k per accuracy point
  return ((estimatedValue - cost) / cost) * 100;
};

// Method to assess training quality
agentTrainingSchema.methods.assessTrainingQuality = function () {
  let qualityScore = 0;
  let factors = 0;

  // Data quality factor
  if (this.trainingData.statistics.quality) {
    const dataQuality =
      ((this.trainingData.statistics.quality.high * 1.0 +
        this.trainingData.statistics.quality.medium * 0.6 +
        this.trainingData.statistics.quality.low * 0.2) /
        (this.trainingData.statistics.quality.high +
          this.trainingData.statistics.quality.medium +
          this.trainingData.statistics.quality.low)) *
      100;

    qualityScore += dataQuality * 0.3;
    factors++;
  }

  // Performance factor
  if (this.results.performance.quantitative.accuracy) {
    qualityScore += this.results.performance.quantitative.accuracy * 0.4;
    factors++;
  }

  // Convergence factor
  if (this.process.metrics.loss.convergence.achieved) {
    qualityScore += 85 * 0.2; // Good convergence = 85 points
    factors++;
  } else {
    qualityScore += 40 * 0.2; // Poor convergence = 40 points
    factors++;
  }

  // Safety factor
  if (this.safety.alignment.overall) {
    qualityScore += this.safety.alignment.overall * 0.1;
    factors++;
  }

  return factors > 0 ? Math.round(qualityScore / factors) : 0;
};

// Method to generate training report
agentTrainingSchema.methods.generateTrainingReport = function () {
  const roi = this.calculateTrainingROI();
  const qualityScore = this.assessTrainingQuality();

  return {
    session: {
      id: this.training.sessionId,
      agentId: this.training.agentId,
      type: this.training.trainingType,
      mode: this.training.trainingMode,
    },
    data: {
      records: this.trainingData.statistics.total.records,
      quality: qualityScore,
      sources: this.trainingData.sources.length,
    },
    performance: {
      accuracy: this.results.performance.quantitative.accuracy,
      f1Score: this.results.performance.quantitative.f1Score,
      loss: this.results.performance.quantitative.loss,
      convergence: this.process.metrics.loss.convergence.achieved,
    },
    resources: {
      timeSpent: this.process.resources.time.actual,
      cost: this.process.resources.cost.total,
      efficiency: this.resourceEfficiency,
      roi: roi,
    },
    readiness: {
      technical: this.deployment.readiness.technical.score,
      business: this.deployment.readiness.business.score,
      safety: this.deployment.readiness.safety.score,
      approved: this.deployment.readiness.business.approved,
    },
    safety: {
      harmfulContentRate: this.safety.testing.harmfulContent.rate,
      biasLevel: this.safety.testing.bias.severity,
      alignmentScore: this.safety.alignment.overall,
    },
  };
};

// Virtual for training success rate
agentTrainingSchema.virtual('trainingSuccess').get(function () {
  const convergence = this.process.metrics.loss.convergence.achieved;
  const accuracy = this.results.performance.quantitative.accuracy || 0;
  const businessApproval = this.deployment.readiness.business.approved;

  if (convergence && accuracy > 85 && businessApproval) return 'excellent';
  if (convergence && accuracy > 75) return 'good';
  if (convergence && accuracy > 65) return 'acceptable';
  if (convergence) return 'poor';
  return 'failed';
});

// Virtual for resource efficiency
agentTrainingSchema.virtual('resourceEfficiency').get(function () {
  if (
    !this.process.resources.cost.total ||
    !this.results.performance.quantitative.accuracy
  ) {
    return 0;
  }

  const costPerAccuracyPoint =
    this.process.resources.cost.total /
    this.results.performance.quantitative.accuracy;

  // Efficiency score (lower cost per accuracy point = higher efficiency)
  // Assuming $100 per accuracy point is baseline (score = 50)
  const baselineCost = 100;
  return Math.max(0, Math.min(100, (baselineCost / costPerAccuracyPoint) * 50));
});

// Virtual for deployment readiness
agentTrainingSchema.virtual('deploymentReadiness').get(function () {
  const technical = this.deployment.readiness.technical.score || 0;
  const business = this.deployment.readiness.business.score || 0;
  const safety = this.deployment.readiness.safety.score || 0;

  const overallScore = (technical + business + safety) / 3;

  if (overallScore >= 90) return 'ready';
  if (overallScore >= 75) return 'mostly_ready';
  if (overallScore >= 60) return 'needs_improvement';
  return 'not_ready';
});

export default mongoose.model('AgentTraining', agentTrainingSchema);
