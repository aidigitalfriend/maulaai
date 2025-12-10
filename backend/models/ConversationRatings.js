import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// CONVERSATION RATINGS MODEL
// ============================================
const conversationRatingsSchema = new Schema(
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
      agentName: String,
      agentVersion: String,
      agentType: String,
    },

    // Overall Rating
    overallRating: {
      score: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        index: true,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 1.0,
      },
      timestamp: {
        type: Date,
        default: Date.now,
        index: true,
      },
    },

    // Detailed Ratings
    detailedRatings: {
      // Response Quality
      responseQuality: {
        accuracy: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
        },
        relevance: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
        },
        completeness: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
        },
        clarity: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
        },
        helpfulness: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
        },
      },

      // User Experience
      userExperience: {
        easeOfUse: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
        },
        responseTime: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
        },
        conversationFlow: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
        },
        personalization: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
        },
        satisfaction: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
        },
      },

      // Technical Performance
      technicalPerformance: {
        reliability: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
        },
        speed: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
        },
        stability: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
        },
        availability: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
        },
      },

      // Communication Style
      communicationStyle: {
        tone: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
          preferred: String, // 'formal', 'casual', 'friendly', 'professional'
        },
        empathy: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
        },
        patience: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
        },
        professionalism: {
          score: { type: Number, min: 1, max: 5 },
          comment: String,
        },
      },
    },

    // Qualitative Feedback
    qualitativeFeedback: {
      // Written feedback
      comments: {
        general: {
          type: String,
          maxlength: 2000,
        },
        positive: {
          type: String,
          maxlength: 1000,
        },
        negative: {
          type: String,
          maxlength: 1000,
        },
        suggestions: {
          type: String,
          maxlength: 1000,
        },
      },

      // Structured feedback
      structured: {
        bestAspects: [
          {
            aspect: String,
            reason: String,
          },
        ],
        improvements: [
          {
            area: String,
            suggestion: String,
            priority: {
              type: String,
              enum: ['low', 'medium', 'high', 'critical'],
            },
          },
        ],
        missing: [
          {
            feature: String,
            importance: {
              type: String,
              enum: ['nice_to_have', 'important', 'critical'],
            },
          },
        ],
      },

      // Emotional response
      emotional: {
        emotions: [
          {
            emotion: {
              type: String,
              enum: [
                'satisfied',
                'frustrated',
                'delighted',
                'confused',
                'impressed',
                'disappointed',
              ],
            },
            intensity: {
              type: Number,
              min: 1,
              max: 5,
            },
          },
        ],
        emotionalJourney: {
          beginning: String, // how user felt at start
          middle: String, // how user felt during
          end: String, // how user felt at end
        },
      },
    },

    // Contextual Information
    context: {
      // Rating context
      ratingContext: {
        promptedOrSpontaneous: {
          type: String,
          enum: ['prompted', 'spontaneous'],
          default: 'prompted',
        },
        ratingTrigger: String, // what triggered the rating request
        timeAfterConversation: Number, // minutes after conversation ended
        conversationOutcome: {
          type: String,
          enum: ['resolved', 'partially_resolved', 'unresolved', 'escalated'],
        },
      },

      // User state during rating
      userState: {
        mood: String, // user's mood when rating
        timeConstraints: Boolean, // was user in a hurry
        distractions: Boolean, // was user distracted
        previousExperience: {
          type: String,
          enum: ['first_time', 'occasional', 'regular', 'power_user'],
        },
        expectationsMet: {
          type: String,
          enum: ['exceeded', 'met', 'partially_met', 'not_met'],
        },
      },

      // Conversation context
      conversationContext: {
        duration: Number, // seconds
        messageCount: Number,
        conversationType: String, // 'support', 'sales', 'information', 'casual'
        complexity: {
          type: String,
          enum: ['simple', 'moderate', 'complex', 'very_complex'],
        },
        resolutionAttempts: Number,
        escalationOccurred: Boolean,
      },
    },

    // Comparative Ratings
    comparative: {
      // Comparison to expectations
      vsExpectations: {
        type: String,
        enum: ['much_worse', 'worse', 'as_expected', 'better', 'much_better'],
      },

      // Comparison to previous interactions
      vsPrevious: {
        type: String,
        enum: ['much_worse', 'worse', 'same', 'better', 'much_better'],
      },

      // Comparison to competitors
      vsCompetitors: {
        type: String,
        enum: ['much_worse', 'worse', 'same', 'better', 'much_better'],
      },

      // Comparison to human agents
      vsHuman: {
        type: String,
        enum: ['much_worse', 'worse', 'same', 'better', 'much_better'],
      },
    },

    // Behavioral Intent
    behavioralIntent: {
      // Future usage intent
      futureUsage: {
        willUseAgain: {
          type: String,
          enum: [
            'definitely_not',
            'probably_not',
            'unsure',
            'probably',
            'definitely',
          ],
          index: true,
        },
        frequency: {
          type: String,
          enum: ['never', 'rarely', 'occasionally', 'regularly', 'frequently'],
        },
        confidence: {
          type: Number,
          min: 1,
          max: 5,
        },
      },

      // Recommendation intent
      recommendation: {
        npsScore: {
          type: Number,
          min: 0,
          max: 10,
          index: true,
        },
        wouldRecommend: {
          type: String,
          enum: [
            'definitely_not',
            'probably_not',
            'neutral',
            'probably',
            'definitely',
          ],
        },
        recommendationReason: String,
        targetAudience: String, // who they would recommend it to
      },

      // Engagement intent
      engagement: {
        willingToProvideMoreFeedback: Boolean,
        willingToParticipateInSurvey: Boolean,
        willingToJoinBetaProgram: Boolean,
        willingToBeContactedForResearch: Boolean,
      },
    },

    // Rating Methodology
    methodology: {
      // Rating approach
      approach: {
        type: {
          type: String,
          enum: [
            'single_question',
            'multi_dimensional',
            'comparative',
            'narrative',
            'mixed',
          ],
          default: 'multi_dimensional',
        },
        scale: {
          type: String,
          enum: [
            '5_point_likert',
            '7_point_likert',
            '10_point',
            'thumbs',
            'stars',
            'nps',
          ],
          default: '5_point_likert',
        },
        responseTime: Number, // seconds taken to complete rating
        completionRate: Number, // percentage of rating completed
      },

      // Rating quality
      quality: {
        responseQuality: {
          type: String,
          enum: ['low', 'medium', 'high'],
          default: 'medium',
        },
        consistency: {
          type: Number,
          min: 0,
          max: 1,
        },
        thoughtfulness: {
          type: String,
          enum: ['superficial', 'moderate', 'thoughtful', 'comprehensive'],
        },
        reliability: {
          type: Number,
          min: 0,
          max: 1,
        },
      },
    },

    // Rating Analytics
    analytics: {
      // Sentiment analysis of comments
      sentimentAnalysis: {
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
        confidence: {
          type: Number,
          min: 0,
          max: 1,
        },
        keywords: [
          {
            word: String,
            sentiment: String,
            weight: Number,
          },
        ],
      },

      // Topic analysis
      topicAnalysis: {
        mainTopics: [String],
        concerns: [String],
        compliments: [String],
        suggestions: [String],
      },

      // Rating patterns
      patterns: {
        isOutlier: Boolean, // significantly different from user's typical ratings
        isInflated: Boolean, // potentially inflated rating
        isDeflated: Boolean, // potentially deflated rating
        biasSuspected: Boolean, // potential rating bias detected
        biasType: String, // 'recency', 'halo', 'confirmation', etc.
      },
    },

    // Business Impact
    businessImpact: {
      // Customer satisfaction impact
      satisfaction: {
        csat: Number, // Customer Satisfaction Score
        ces: Number, // Customer Effort Score
        npsContribution: Number, // contribution to NPS
        loyaltyImpact: {
          type: String,
          enum: ['negative', 'neutral', 'positive'],
        },
      },

      // Revenue impact
      revenue: {
        retentionImpact: {
          type: String,
          enum: [
            'high_churn_risk',
            'medium_churn_risk',
            'low_churn_risk',
            'retention_likely',
          ],
        },
        upsellPotential: {
          type: String,
          enum: ['low', 'medium', 'high'],
        },
        lifetimeValueImpact: Number, // estimated $ impact
        conversionImpact: {
          type: String,
          enum: ['negative', 'neutral', 'positive'],
        },
      },

      // Operational impact
      operational: {
        supportTicketLikelihood: {
          type: String,
          enum: ['low', 'medium', 'high'],
        },
        trainingNeedsIdentified: [String],
        processImprovementsNeeded: [String],
        resourceAllocationImpact: String,
      },
    },

    // Follow-up Actions
    followUp: {
      // Immediate actions
      immediate: {
        required: Boolean,
        actions: [
          {
            action: String,
            assignedTo: String,
            priority: String,
            dueDate: Date,
            status: String,
            completedAt: Date,
          },
        ],
      },

      // User engagement follow-up
      userEngagement: {
        thankYouSent: Boolean,
        followUpSurveyScheduled: Boolean,
        personalizedResponseSent: Boolean,
        issueEscalated: Boolean,
        compensationOffered: Boolean,
      },

      // Product improvement follow-up
      productImprovement: {
        featureRequestCreated: Boolean,
        bugReportCreated: Boolean,
        improvementSuggestionLogged: Boolean,
        trainingUpdatesScheduled: Boolean,
      },
    },

    // Validation and Verification
    validation: {
      // Rating validation
      validated: Boolean,
      validationMethod: String, // 'automatic', 'manual', 'user_confirmed'
      validationDate: Date,
      validatedBy: String,

      // Authenticity checks
      authenticity: {
        ipConsistency: Boolean,
        deviceConsistency: Boolean,
        timingConsistency: Boolean,
        behaviorConsistency: Boolean,
        suspiciousActivity: Boolean,
      },

      // Quality checks
      qualityChecks: {
        completenessScore: Number, // 0-1
        consistencyScore: Number, // 0-1
        relevanceScore: Number, // 0-1
        passedQualityThreshold: Boolean,
      },
    },

    // Privacy and Compliance
    privacy: {
      // Consent and permissions
      consent: {
        feedbackConsentGiven: Boolean,
        analyticsConsentGiven: Boolean,
        contactConsentGiven: Boolean,
        researchConsentGiven: Boolean,
      },

      // Data handling
      dataHandling: {
        anonymized: Boolean,
        containsPII: Boolean,
        retentionPeriod: Number, // days
        canBeShared: Boolean,
        geographicRestrictions: [String],
      },

      // Compliance
      compliance: {
        gdprCompliant: Boolean,
        ccpaCompliant: Boolean,
        industryCompliant: Boolean, // industry-specific compliance
        ethicalGuidelinesFollowed: Boolean,
      },
    },

    // Metadata
    metadata: {
      version: {
        type: String,
        default: '1.0',
      },
      source: {
        type: String,
        enum: [
          'post_conversation',
          'email_survey',
          'sms_survey',
          'web_widget',
          'api',
          'mobile_app',
        ],
        required: true,
      },
      device: String,
      browser: String,
      operatingSystem: String,
      location: {
        country: String,
        region: String,
        city: String,
      },
      sessionId: String,
      experimentId: String, // if part of A/B testing
      customFields: {
        type: Map,
        of: String,
      },
    },
  },
  {
    timestamps: true,
    collection: 'conversationratings',
  }
);

// Compound indexes for performance
conversationRatingsSchema.index({ userId: 1, 'overallRating.timestamp': -1 });
conversationRatingsSchema.index({
  'agent.agentId': 1,
  'overallRating.timestamp': -1,
});
conversationRatingsSchema.index({ conversationId: 1, userId: 1 });
conversationRatingsSchema.index({
  'overallRating.score': 1,
  'overallRating.timestamp': -1,
});

// Single field indexes
conversationRatingsSchema.index({ conversationId: 1 });
conversationRatingsSchema.index({ userId: 1 });
conversationRatingsSchema.index({ 'agent.agentId': 1 });
conversationRatingsSchema.index({ 'overallRating.score': 1 });
conversationRatingsSchema.index({ 'overallRating.timestamp': -1 });
conversationRatingsSchema.index({
  'behavioralIntent.futureUsage.willUseAgain': 1,
});
conversationRatingsSchema.index({
  'behavioralIntent.recommendation.npsScore': 1,
});

// TTL index for privacy compliance (configurable retention)
conversationRatingsSchema.index(
  { 'overallRating.timestamp': 1 },
  {
    expireAfterSeconds: 31536000, // 1 year default
  }
);

// Static method to get ratings for user
conversationRatingsSchema.statics.getRatingsForUser = async function (
  userId,
  options = {}
) {
  const {
    startDate,
    endDate,
    agentId,
    minRating,
    maxRating,
    limit = 100,
    skip = 0,
  } = options;

  const query = { userId };

  if (startDate || endDate) {
    query['overallRating.timestamp'] = {};
    if (startDate) query['overallRating.timestamp'].$gte = startDate;
    if (endDate) query['overallRating.timestamp'].$lte = endDate;
  }

  if (agentId) query['agent.agentId'] = agentId;
  if (minRating !== undefined || maxRating !== undefined) {
    query['overallRating.score'] = {};
    if (minRating !== undefined) query['overallRating.score'].$gte = minRating;
    if (maxRating !== undefined) query['overallRating.score'].$lte = maxRating;
  }

  return this.find(query)
    .sort({ 'overallRating.timestamp': -1 })
    .limit(limit)
    .skip(skip)
    .populate('conversationId')
    .populate('userId', 'email name');
};

// Static method to get rating analytics
conversationRatingsSchema.statics.getRatingAnalytics = async function (
  options = {}
) {
  const { userId, agentId, startDate, endDate, groupBy = 'overall' } = options;

  const matchStage = {};

  if (userId) matchStage.userId = new mongoose.Types.ObjectId(userId);
  if (agentId) matchStage['agent.agentId'] = agentId;
  if (startDate || endDate) {
    matchStage['overallRating.timestamp'] = {};
    if (startDate) matchStage['overallRating.timestamp'].$gte = startDate;
    if (endDate) matchStage['overallRating.timestamp'].$lte = endDate;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: groupBy === 'agent' ? '$agent.agentId' : null,
        totalRatings: { $sum: 1 },
        averageRating: { $avg: '$overallRating.score' },
        ratingDistribution: {
          $push: '$overallRating.score',
        },
        averageNPS: { $avg: '$behavioralIntent.recommendation.npsScore' },
        positiveRatings: {
          $sum: { $cond: [{ $gte: ['$overallRating.score', 4] }, 1, 0] },
        },
        negativeRatings: {
          $sum: { $cond: [{ $lte: ['$overallRating.score', 2] }, 1, 0] },
        },
      },
    },
    {
      $addFields: {
        satisfactionRate: {
          $cond: [
            { $gt: ['$totalRatings', 0] },
            {
              $multiply: [
                { $divide: ['$positiveRatings', '$totalRatings'] },
                100,
              ],
            },
            0,
          ],
        },
      },
    },
  ];

  return this.aggregate(pipeline);
};

// Static method to get NPS calculation
conversationRatingsSchema.statics.calculateNPS = async function (options = {}) {
  const { userId, agentId, startDate, endDate } = options;

  const matchStage = {
    'behavioralIntent.recommendation.npsScore': { $exists: true },
  };

  if (userId) matchStage.userId = new mongoose.Types.ObjectId(userId);
  if (agentId) matchStage['agent.agentId'] = agentId;
  if (startDate || endDate) {
    matchStage['overallRating.timestamp'] = {};
    if (startDate) matchStage['overallRating.timestamp'].$gte = startDate;
    if (endDate) matchStage['overallRating.timestamp'].$lte = endDate;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: null,
        promoters: {
          $sum: {
            $cond: [
              { $gte: ['$behavioralIntent.recommendation.npsScore', 9] },
              1,
              0,
            ],
          },
        },
        passives: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ['$behavioralIntent.recommendation.npsScore', 7] },
                  { $lte: ['$behavioralIntent.recommendation.npsScore', 8] },
                ],
              },
              1,
              0,
            ],
          },
        },
        detractors: {
          $sum: {
            $cond: [
              { $lte: ['$behavioralIntent.recommendation.npsScore', 6] },
              1,
              0,
            ],
          },
        },
        totalResponses: { $sum: 1 },
      },
    },
    {
      $addFields: {
        npsScore: {
          $cond: [
            { $gt: ['$totalResponses', 0] },
            {
              $subtract: [
                {
                  $multiply: [
                    { $divide: ['$promoters', '$totalResponses'] },
                    100,
                  ],
                },
                {
                  $multiply: [
                    { $divide: ['$detractors', '$totalResponses'] },
                    100,
                  ],
                },
              ],
            },
            0,
          ],
        },
      },
    },
  ];

  return this.aggregate(pipeline);
};

// Method to calculate overall satisfaction score
conversationRatingsSchema.methods.calculateSatisfactionScore = function () {
  const weights = {
    responseQuality: 0.3,
    userExperience: 0.4,
    technicalPerformance: 0.2,
    communicationStyle: 0.1,
  };

  let totalScore = 0;
  let totalWeight = 0;

  // Calculate weighted average of detailed ratings
  Object.keys(weights).forEach((category) => {
    if (this.detailedRatings[category]) {
      const categoryScores = Object.values(this.detailedRatings[category])
        .filter((item) => item.score !== undefined)
        .map((item) => item.score);

      if (categoryScores.length > 0) {
        const categoryAvg =
          categoryScores.reduce((sum, score) => sum + score, 0) /
          categoryScores.length;
        totalScore += categoryAvg * weights[category];
        totalWeight += weights[category];
      }
    }
  });

  return totalWeight > 0 ? totalScore / totalWeight : this.overallRating.score;
};

// Method to identify improvement areas
conversationRatingsSchema.methods.identifyImprovementAreas = function () {
  const areas = [];
  const threshold = 3; // ratings below 3 need improvement

  // Check detailed ratings for low scores
  Object.keys(this.detailedRatings).forEach((category) => {
    Object.keys(this.detailedRatings[category]).forEach((aspect) => {
      const rating = this.detailedRatings[category][aspect];
      if (rating.score && rating.score <= threshold) {
        areas.push({
          category,
          aspect,
          score: rating.score,
          priority: rating.score <= 2 ? 'high' : 'medium',
          comment: rating.comment,
        });
      }
    });
  });

  // Sort by score (lowest first) and priority
  return areas.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.priority === 'high' ? -1 : 1;
  });
};

// Method to extract insights from feedback
conversationRatingsSchema.methods.extractInsights = function () {
  const insights = {
    strengths: [],
    weaknesses: [],
    suggestions: [],
    emotions: [],
  };

  // Extract from structured feedback
  if (this.qualitativeFeedback.structured.bestAspects) {
    insights.strengths = this.qualitativeFeedback.structured.bestAspects;
  }

  if (this.qualitativeFeedback.structured.improvements) {
    insights.weaknesses = this.qualitativeFeedback.structured.improvements;
  }

  // Extract emotions
  if (this.qualitativeFeedback.emotional.emotions) {
    insights.emotions = this.qualitativeFeedback.emotional.emotions;
  }

  // Extract improvement suggestions
  if (this.qualitativeFeedback.comments.suggestions) {
    insights.suggestions.push({
      source: 'general_comment',
      suggestion: this.qualitativeFeedback.comments.suggestions,
    });
  }

  return insights;
};

// Method to predict churn risk based on rating
conversationRatingsSchema.methods.predictChurnRisk = function () {
  let riskScore = 0;

  // Overall rating impact (50% weight)
  if (this.overallRating.score <= 2) riskScore += 50;
  else if (this.overallRating.score === 3) riskScore += 25;
  else if (this.overallRating.score === 4) riskScore += 5;

  // NPS impact (30% weight)
  if (this.behavioralIntent.recommendation.npsScore <= 6) riskScore += 30;
  else if (this.behavioralIntent.recommendation.npsScore <= 8) riskScore += 10;

  // Future usage intent (20% weight)
  const futureUsage = this.behavioralIntent.futureUsage.willUseAgain;
  if (futureUsage === 'definitely_not') riskScore += 20;
  else if (futureUsage === 'probably_not') riskScore += 15;
  else if (futureUsage === 'unsure') riskScore += 10;

  // Determine risk level
  let riskLevel = 'low';
  if (riskScore >= 70) riskLevel = 'high';
  else if (riskScore >= 40) riskLevel = 'medium';

  return {
    score: riskScore,
    level: riskLevel,
    factors: this.getChurnRiskFactors(),
  };
};

// Helper method to get churn risk factors
conversationRatingsSchema.methods.getChurnRiskFactors = function () {
  const factors = [];

  if (this.overallRating.score <= 2) {
    factors.push('Very low overall satisfaction');
  }

  if (this.behavioralIntent.recommendation.npsScore <= 6) {
    factors.push('Negative recommendation likelihood');
  }

  if (this.behavioralIntent.futureUsage.willUseAgain === 'definitely_not') {
    factors.push('No intention to use again');
  }

  // Check for negative emotions
  const negativeEmotions = ['frustrated', 'disappointed', 'confused'];
  const hasNegativeEmotions = this.qualitativeFeedback.emotional.emotions?.some(
    (emotion) =>
      negativeEmotions.includes(emotion.emotion) && emotion.intensity >= 3
  );

  if (hasNegativeEmotions) {
    factors.push('Strong negative emotional response');
  }

  return factors;
};

// Virtual for satisfaction category
conversationRatingsSchema.virtual('satisfactionCategory').get(function () {
  const score = this.overallRating.score;

  if (score >= 4.5) return 'very_satisfied';
  if (score >= 4) return 'satisfied';
  if (score >= 3) return 'neutral';
  if (score >= 2) return 'dissatisfied';
  return 'very_dissatisfied';
});

// Virtual for NPS category
conversationRatingsSchema.virtual('npsCategory').get(function () {
  const nps = this.behavioralIntent.recommendation.npsScore;

  if (nps === undefined) return 'unknown';
  if (nps >= 9) return 'promoter';
  if (nps >= 7) return 'passive';
  return 'detractor';
});

export default mongoose.model('ConversationRatings', conversationRatingsSchema);
