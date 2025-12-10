import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// RESPONSE ANALYTICS MODEL
// ============================================
const responseAnalyticsSchema = new Schema(
  {
    // Response Identification
    response: {
      responseId: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },
      conversationId: {
        type: String,
        required: true,
        index: true,
      },
      messageId: {
        type: String,
        required: true,
        index: true,
      },
      agentId: {
        type: String,
        required: true,
        index: true,
      },
      userId: {
        type: String,
        required: true,
        index: true,
      },
    },

    // User Context
    userContext: {
      message: {
        content: String,
        length: Number,
        wordCount: Number,
        language: String,
        sentiment: {
          type: String,
          enum: [
            'very_positive',
            'positive',
            'neutral',
            'negative',
            'very_negative',
          ],
        },
        confidence: Number,
        urgency: {
          type: String,
          enum: ['low', 'medium', 'high', 'urgent'],
        },
      },

      // Intent analysis
      intent: {
        primary: String,
        secondary: [String],
        confidence: Number,
        category: {
          type: String,
          enum: [
            'question',
            'request',
            'complaint',
            'compliment',
            'information',
            'support',
            'sales',
            'other',
          ],
        },
        complexity: {
          type: String,
          enum: ['simple', 'moderate', 'complex', 'very_complex'],
        },
      },

      // Context awareness
      context: {
        isFollowUp: Boolean,
        previousInteractions: Number,
        sessionDuration: Number, // milliseconds
        timeOfDay: String,
        deviceType: String,
        channel: String, // 'web', 'mobile', 'api', 'chat'
        userTier: String, // 'basic', 'premium', 'enterprise'
      },
    },

    // Agent Response
    agentResponse: {
      // Response content
      content: {
        text: String,
        length: Number,
        wordCount: Number,
        paragraphs: Number,
        sentences: Number,
        averageSentenceLength: Number,
        readabilityScore: Number, // Flesch-Kincaid
        language: String,
      },

      // Response type and structure
      type: {
        category: {
          type: String,
          enum: [
            'answer',
            'question',
            'clarification',
            'instruction',
            'recommendation',
            'escalation',
            'closing',
          ],
        },
        format: {
          type: String,
          enum: ['text', 'structured', 'list', 'table', 'code', 'mixed'],
        },
        hasExamples: Boolean,
        hasLinks: Boolean,
        hasAttachments: Boolean,
        isPersonalized: Boolean,
      },

      // Generation metadata
      generation: {
        model: String,
        provider: String,
        temperature: Number,
        tokens: {
          input: Number,
          output: Number,
          total: Number,
        },
        processingTime: Number, // milliseconds
        retries: Number,
        confidenceScore: Number,
      },
    },

    // Quality Analysis
    quality: {
      // Relevance analysis
      relevance: {
        score: {
          type: Number, // 0-100
          required: true,
        },
        factors: {
          topicAlignment: Number,
          contextAwareness: Number,
          completeness: Number,
          directness: Number,
        },
        userIntent: {
          addressed: Boolean,
          fullyAnswered: Boolean,
          partialAnswer: Boolean,
          misunderstood: Boolean,
        },
      },

      // Accuracy analysis
      accuracy: {
        score: {
          type: Number, // 0-100
          required: true,
        },
        factors: {
          factualCorrectness: Number,
          dataAccuracy: Number,
          sourceCredibility: Number,
          upToDateness: Number,
        },
        verification: {
          sources: [String],
          factChecked: Boolean,
          confidence: Number,
          uncertainty: [String],
        },
      },

      // Clarity and coherence
      clarity: {
        score: {
          type: Number, // 0-100
          required: true,
        },
        factors: {
          languageClarity: Number,
          structuralCoherence: Number,
          logicalFlow: Number,
          conciseness: Number,
        },
        issues: [
          {
            type: String, // 'ambiguous', 'verbose', 'unclear', 'contradictory'
            severity: String, // 'low', 'medium', 'high'
            description: String,
            suggestion: String,
          },
        ],
      },

      // Helpfulness
      helpfulness: {
        score: {
          type: Number, // 0-100
          required: true,
        },
        factors: {
          actionability: Number,
          completeness: Number,
          proactivity: Number,
          empathy: Number,
        },
        actionableItems: [
          {
            action: String,
            priority: String,
            difficulty: String,
          },
        ],
      },

      // Tone and style
      tone: {
        sentiment: {
          type: String,
          enum: [
            'very_positive',
            'positive',
            'neutral',
            'negative',
            'very_negative',
          ],
        },
        formality: {
          type: String,
          enum: ['very_formal', 'formal', 'neutral', 'casual', 'very_casual'],
        },
        empathy: {
          score: Number, // 0-100
          detected: Boolean,
          appropriate: Boolean,
        },
        personality: {
          traits: [String],
          consistency: Number,
          brand_alignment: Number,
        },
      },
    },

    // Performance Metrics
    performance: {
      // Speed metrics
      timing: {
        responseTime: {
          type: Number, // milliseconds
          required: true,
        },
        processingTime: Number,
        queueTime: Number,
        networkTime: Number,
        renderTime: Number,
      },

      // Efficiency metrics
      efficiency: {
        tokensPerSecond: Number,
        wordsPerSecond: Number,
        costPerResponse: Number,
        resourceUtilization: Number, // percentage
        cacheHitRate: Number,
      },

      // Scalability metrics
      scalability: {
        concurrentRequests: Number,
        queueLength: Number,
        serverLoad: Number,
        memoryUsage: Number,
        cpuUsage: Number,
      },
    },

    // User Feedback
    userFeedback: {
      // Immediate feedback
      immediate: {
        rating: {
          type: Number, // 1-5
          index: true,
        },
        liked: Boolean,
        helpful: Boolean,
        accurate: Boolean,
        clear: Boolean,
        complete: Boolean,
        feedbackText: String,
        selectedTags: [String],
      },

      // Follow-up behavior
      followUp: {
        askedFollowUp: Boolean,
        needsClarification: Boolean,
        escalated: Boolean,
        satisfied: Boolean,
        nextAction: String,
        timeToNextInteraction: Number, // milliseconds
      },

      // Session outcome
      session: {
        goalAchieved: Boolean,
        issueResolved: Boolean,
        needsHumanAgent: Boolean,
        willReturn: Boolean,
        overallSatisfaction: Number, // 1-10
        recommendationScore: Number, // NPS: 0-10
      },
    },

    // Context Analysis
    contextAnalysis: {
      // Conversation flow
      conversationFlow: {
        turnNumber: Number,
        isFirstTurn: Boolean,
        isLastTurn: Boolean,
        followsLogically: Boolean,
        maintainsContext: Boolean,
        buildsPrevious: Boolean,
        changesDirection: Boolean,
      },

      // Topic tracking
      topics: {
        current: [String],
        previous: [String],
        new: [String],
        maintained: [String],
        drift: Boolean,
        relevantHistory: Number, // relevant turns
      },

      // Entity tracking
      entities: {
        mentioned: [
          {
            entity: String,
            type: String,
            confidence: Number,
            newMention: Boolean,
            resolved: Boolean,
          },
        ],
        carried_forward: [String],
        clarified: [String],
      },
    },

    // Improvement Analysis
    improvement: {
      // Areas for improvement
      suggestions: [
        {
          area: {
            type: String,
            enum: [
              'relevance',
              'accuracy',
              'clarity',
              'helpfulness',
              'tone',
              'efficiency',
            ],
          },
          issue: String,
          suggestion: String,
          priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
          },
          impact: String,
          effort: String, // 'low', 'medium', 'high'
          confidence: Number, // 0-100
        },
      ],

      // Alternative responses
      alternatives: [
        {
          responseText: String,
          expectedImprovement: String,
          tradeoffs: String,
          confidence: Number,
        },
      ],

      // Learning opportunities
      learning: {
        patterns: [String],
        knowledgeGaps: [String],
        skillImprovements: [String],
        trainingData: Boolean,
      },
    },

    // Comparative Analysis
    comparison: {
      // vs. previous responses
      historical: {
        similarQueries: Number,
        averageQuality: Number,
        improvement: Number, // percentage
        consistency: Number,
        learningEvidence: Boolean,
      },

      // vs. human responses
      humanBaseline: {
        available: Boolean,
        qualityComparison: Number, // -100 to 100
        preferredByUsers: Number, // percentage
        timeComparison: Number,
        costComparison: Number,
      },

      // vs. other agents
      peerComparison: {
        betterThan: Number, // percentage of other agents
        averageRanking: Number,
        uniqueStrengths: [String],
        areas_behind: [String],
      },
    },

    // Business Impact
    businessImpact: {
      // Customer satisfaction impact
      satisfaction: {
        contributed: Boolean,
        impact: Number, // -10 to 10
        likelyRetention: Number, // probability
        upsellOpportunity: Number,
        churnRisk: Number,
      },

      // Operational impact
      operational: {
        deflectedTickets: Number,
        savedTime: Number, // minutes
        costSaving: Number, // dollars
        efficiencyGain: Number, // percentage
        qualityImprovement: Number,
      },

      // Revenue impact
      revenue: {
        conversionContribution: Number,
        salesSupport: Number,
        crossSellOpportunity: Number,
        customerLifetimeValue: Number,
        brandImpact: Number, // -10 to 10
      },
    },

    // Error and Issue Tracking
    errors: {
      // Response errors
      response: [
        {
          type: {
            type: String,
            enum: [
              'hallucination',
              'factual_error',
              'logic_error',
              'context_loss',
              'inappropriate_tone',
              'incomplete',
            ],
          },
          severity: {
            type: String,
            enum: ['minor', 'moderate', 'major', 'critical'],
          },
          description: String,
          impact: String,
          detected: {
            automatically: Boolean,
            by_user: Boolean,
            by_human_reviewer: Boolean,
          },
          fixed: Boolean,
          fix_description: String,
        },
      ],

      // Technical errors
      technical: [
        {
          errorType: String,
          errorMessage: String,
          timestamp: Date,
          resolved: Boolean,
          impact: String,
        },
      ],

      // Process errors
      process: [
        {
          stage: String, // 'understanding', 'processing', 'generation', 'delivery'
          issue: String,
          impact: String,
          preventable: Boolean,
        },
      ],
    },

    // Temporal Analysis
    temporal: {
      // Time-based patterns
      patterns: {
        timeOfDay: {
          hour: Number,
          period: String, // 'morning', 'afternoon', 'evening', 'night'
          performance: Number,
          volume: Number,
        },
        dayOfWeek: {
          day: String,
          performance: Number,
          volume: Number,
        },
        seasonality: {
          season: String,
          performance: Number,
          patterns: [String],
        },
      },

      // Response timing
      timing: {
        optimal: Boolean,
        tooSlow: Boolean,
        tooFast: Boolean,
        userExpectation: Number, // milliseconds
        actualTime: Number,
        satisfaction_impact: Number,
      },
    },

    // Multimodal Analysis
    multimodal: {
      // Input modalities
      input: {
        text: Boolean,
        voice: Boolean,
        image: Boolean,
        video: Boolean,
        file: Boolean,
      },

      // Output modalities
      output: {
        text: Boolean,
        voice: Boolean,
        image: Boolean,
        chart: Boolean,
        link: Boolean,
        attachment: Boolean,
      },

      // Cross-modal analysis
      crossModal: {
        consistency: Number, // across modalities
        alignment: Number,
        appropriateness: Number,
        effectiveness: Number,
      },
    },

    // Privacy and Security
    privacy: {
      // Data handling
      dataHandling: {
        personalDataDetected: Boolean,
        sensitiveDataDetected: Boolean,
        properlyAnonymized: Boolean,
        gdprCompliant: Boolean,
        retentionCompliant: Boolean,
      },

      // Security analysis
      security: {
        potentialRisks: [String],
        appropriateFiltering: Boolean,
        noHarmfulContent: Boolean,
        ethicalGuidelines: Boolean,
        biasDetected: Boolean,
      },
    },

    // Metadata and Tags
    metadata: {
      version: {
        type: String,
        default: '1.0',
      },

      // Analysis metadata
      analysis: {
        analysisVersion: String,
        modelUsed: String,
        confidence: Number,
        automaticallyGenerated: Boolean,
        humanReviewed: Boolean,
        reviewerNotes: String,
      },

      // Classification
      classification: {
        category: String,
        subcategory: String,
        tags: [String],
        priority: String,
        complexity: String,
        businessValue: String,
      },

      // Custom metrics
      customMetrics: {
        type: Map,
        of: Number,
      },
    },
  },
  {
    timestamps: true,
    collection: 'responseanalytics',
  }
);

// Compound indexes for performance
responseAnalyticsSchema.index({ 'response.agentId': 1, createdAt: -1 });
responseAnalyticsSchema.index({
  'response.conversationId': 1,
  'response.messageId': 1,
});
responseAnalyticsSchema.index({ 'response.userId': 1, createdAt: -1 });

// Quality indexes
responseAnalyticsSchema.index({ 'quality.relevance.score': -1 });
responseAnalyticsSchema.index({ 'quality.accuracy.score': -1 });
responseAnalyticsSchema.index({ 'quality.clarity.score': -1 });
responseAnalyticsSchema.index({ 'quality.helpfulness.score': -1 });

// Performance indexes
responseAnalyticsSchema.index({ 'performance.timing.responseTime': 1 });
responseAnalyticsSchema.index({ 'userFeedback.immediate.rating': -1 });

// TTL index for old analytics (keep for 1 year)
responseAnalyticsSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 31536000, // 1 year
  }
);

// Static method to analyze response quality trends
responseAnalyticsSchema.statics.getQualityTrends = async function (
  agentId,
  days = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        'response.agentId': agentId,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
          },
        },
        avgRelevance: { $avg: '$quality.relevance.score' },
        avgAccuracy: { $avg: '$quality.accuracy.score' },
        avgClarity: { $avg: '$quality.clarity.score' },
        avgHelpfulness: { $avg: '$quality.helpfulness.score' },
        avgRating: { $avg: '$userFeedback.immediate.rating' },
        avgResponseTime: { $avg: '$performance.timing.responseTime' },
        totalResponses: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ];

  return this.aggregate(pipeline);
};

// Static method to get improvement opportunities
responseAnalyticsSchema.statics.getImprovementOpportunities = async function (
  agentId,
  limit = 10
) {
  const pipeline = [
    {
      $match: {
        'response.agentId': agentId,
        'improvement.suggestions': { $exists: true, $ne: [] },
      },
    },
    {
      $unwind: '$improvement.suggestions',
    },
    {
      $group: {
        _id: {
          area: '$improvement.suggestions.area',
          issue: '$improvement.suggestions.issue',
        },
        count: { $sum: 1 },
        avgPriority: {
          $avg: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: ['$improvement.suggestions.priority', 'critical'],
                  },
                  then: 4,
                },
                {
                  case: { $eq: ['$improvement.suggestions.priority', 'high'] },
                  then: 3,
                },
                {
                  case: {
                    $eq: ['$improvement.suggestions.priority', 'medium'],
                  },
                  then: 2,
                },
                {
                  case: { $eq: ['$improvement.suggestions.priority', 'low'] },
                  then: 1,
                },
              ],
              default: 0,
            },
          },
        },
        suggestions: { $push: '$improvement.suggestions.suggestion' },
        avgConfidence: { $avg: '$improvement.suggestions.confidence' },
      },
    },
    {
      $sort: { count: -1, avgPriority: -1 },
    },
    {
      $limit: limit,
    },
  ];

  return this.aggregate(pipeline);
};

// Static method to get response performance metrics
responseAnalyticsSchema.statics.getPerformanceMetrics = async function (
  agentId,
  timeframe = 'week'
) {
  const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        'response.agentId': agentId,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalResponses: { $sum: 1 },
        avgRelevance: { $avg: '$quality.relevance.score' },
        avgAccuracy: { $avg: '$quality.accuracy.score' },
        avgClarity: { $avg: '$quality.clarity.score' },
        avgHelpfulness: { $avg: '$quality.helpfulness.score' },
        avgRating: { $avg: '$userFeedback.immediate.rating' },
        avgResponseTime: { $avg: '$performance.timing.responseTime' },
        satisfiedUsers: {
          $sum: {
            $cond: [{ $gte: ['$userFeedback.immediate.rating', 4] }, 1, 0],
          },
        },
        fastResponses: {
          $sum: {
            $cond: [{ $lte: ['$performance.timing.responseTime', 2000] }, 1, 0],
          },
        },
        errorCount: { $sum: { $size: { $ifNull: ['$errors.response', []] } } },
      },
    },
    {
      $addFields: {
        satisfactionRate: {
          $cond: [
            { $gt: ['$totalResponses', 0] },
            {
              $multiply: [
                { $divide: ['$satisfiedUsers', '$totalResponses'] },
                100,
              ],
            },
            0,
          ],
        },
        speedRate: {
          $cond: [
            { $gt: ['$totalResponses', 0] },
            {
              $multiply: [
                { $divide: ['$fastResponses', '$totalResponses'] },
                100,
              ],
            },
            0,
          ],
        },
        errorRate: {
          $cond: [
            { $gt: ['$totalResponses', 0] },
            {
              $multiply: [{ $divide: ['$errorCount', '$totalResponses'] }, 100],
            },
            0,
          ],
        },
      },
    },
  ];

  return this.aggregate(pipeline);
};

// Method to calculate overall quality score
responseAnalyticsSchema.methods.calculateQualityScore = function () {
  const weights = {
    relevance: 0.3,
    accuracy: 0.3,
    clarity: 0.2,
    helpfulness: 0.2,
  };

  const relevanceScore = this.quality.relevance.score || 0;
  const accuracyScore = this.quality.accuracy.score || 0;
  const clarityScore = this.quality.clarity.score || 0;
  const helpfulnessScore = this.quality.helpfulness.score || 0;

  return Math.round(
    relevanceScore * weights.relevance +
      accuracyScore * weights.accuracy +
      clarityScore * weights.clarity +
      helpfulnessScore * weights.helpfulness
  );
};

// Method to identify critical issues
responseAnalyticsSchema.methods.getCriticalIssues = function () {
  const issues = [];

  // Quality issues
  if (this.quality.relevance.score < 60) {
    issues.push({
      type: 'quality',
      area: 'relevance',
      severity: 'high',
      score: this.quality.relevance.score,
      message: 'Response relevance is below acceptable threshold',
    });
  }

  if (this.quality.accuracy.score < 70) {
    issues.push({
      type: 'quality',
      area: 'accuracy',
      severity: 'critical',
      score: this.quality.accuracy.score,
      message: 'Response accuracy is critically low',
    });
  }

  // Performance issues
  if (this.performance.timing.responseTime > 5000) {
    issues.push({
      type: 'performance',
      area: 'speed',
      severity: 'medium',
      time: this.performance.timing.responseTime,
      message: 'Response time exceeds user expectations',
    });
  }

  // User feedback issues
  if (
    this.userFeedback.immediate.rating &&
    this.userFeedback.immediate.rating < 3
  ) {
    issues.push({
      type: 'satisfaction',
      area: 'user_rating',
      severity: 'high',
      rating: this.userFeedback.immediate.rating,
      message: 'User rated response below satisfactory level',
    });
  }

  // Error issues
  if (this.errors.response && this.errors.response.length > 0) {
    const criticalErrors = this.errors.response.filter(
      (error) => error.severity === 'critical' || error.severity === 'major'
    );

    if (criticalErrors.length > 0) {
      issues.push({
        type: 'error',
        area: 'response_errors',
        severity: 'critical',
        count: criticalErrors.length,
        message: 'Response contains critical errors',
      });
    }
  }

  return issues.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
};

// Method to generate improvement recommendations
responseAnalyticsSchema.methods.generateRecommendations = function () {
  const recommendations = [];
  const qualityScore = this.calculateQualityScore();

  // Quality-based recommendations
  if (this.quality.relevance.score < 80) {
    recommendations.push({
      area: 'relevance',
      priority: 'high',
      action: 'Improve context understanding and intent recognition',
      expected_impact: 'Better topic alignment and user satisfaction',
      effort: 'medium',
    });
  }

  if (this.quality.clarity.score < 80) {
    recommendations.push({
      area: 'clarity',
      priority: 'medium',
      action: 'Simplify language and improve structure',
      expected_impact: 'Enhanced user comprehension',
      effort: 'low',
    });
  }

  // Performance-based recommendations
  if (this.performance.timing.responseTime > 3000) {
    recommendations.push({
      area: 'performance',
      priority: 'medium',
      action: 'Optimize processing pipeline and caching',
      expected_impact: 'Faster response times',
      effort: 'high',
    });
  }

  // Personalization recommendations
  if (!this.agentResponse.type.isPersonalized) {
    recommendations.push({
      area: 'personalization',
      priority: 'low',
      action: 'Incorporate user preferences and history',
      expected_impact: 'More relevant and engaging responses',
      effort: 'medium',
    });
  }

  return recommendations;
};

// Virtual for response grade
responseAnalyticsSchema.virtual('responseGrade').get(function () {
  const score = this.calculateQualityScore();

  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
});

// Virtual for user satisfaction level
responseAnalyticsSchema.virtual('satisfactionLevel').get(function () {
  if (!this.userFeedback.immediate.rating) return 'unrated';

  const rating = this.userFeedback.immediate.rating;
  if (rating >= 4.5) return 'excellent';
  if (rating >= 4) return 'good';
  if (rating >= 3) return 'fair';
  if (rating >= 2) return 'poor';
  return 'very_poor';
});

export default mongoose.model('ResponseAnalytics', responseAnalyticsSchema);
