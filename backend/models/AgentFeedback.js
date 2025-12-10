import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// AGENT FEEDBACK MODEL
// ============================================
const agentFeedbackSchema = new Schema(
  {
    // Feedback Identification
    feedback: {
      feedbackId: {
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
      sessionId: {
        type: String,
        index: true,
      },
    },

    // Feedback Source
    source: {
      type: {
        type: String,
        enum: [
          'user_rating',
          'user_comment',
          'implicit_behavior',
          'human_reviewer',
          'automated_analysis',
          'support_escalation',
        ],
        required: true,
        index: true,
      },
      channel: {
        type: String,
        enum: ['chat', 'email', 'phone', 'web', 'mobile_app', 'api', 'survey'],
        index: true,
      },
      trigger: {
        type: String,
        enum: [
          'conversation_end',
          'explicit_request',
          'poor_performance',
          'escalation',
          'scheduled_review',
          'error_detection',
        ],
      },
      collectonMethod: {
        type: String,
        enum: [
          'immediate_popup',
          'follow_up_email',
          'in_chat_prompt',
          'survey_link',
          'behavioral_analysis',
          'human_evaluation',
        ],
      },
    },

    // User Information
    user: {
      // User demographics
      profile: {
        userType: {
          type: String,
          enum: ['new', 'regular', 'premium', 'enterprise', 'internal', 'beta'],
          index: true,
        },
        experienceLevel: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        },
        userSegment: String,
        previousInteractions: Number,
        customerTier: String,
        geographicRegion: String,
      },

      // Context
      context: {
        timeOfDay: String,
        deviceType: String,
        browserType: String,
        connectionQuality: String,
        sessionDuration: Number, // milliseconds
        previousSatisfaction: Number, // historical average
        emotionalState: String, // if detectable
      },
    },

    // Feedback Content
    content: {
      // Explicit feedback
      explicit: {
        // Ratings
        ratings: {
          overall: {
            score: Number, // 1-5 or 1-10 scale
            scale: String, // '1-5', '1-10', 'binary'
          },
          aspects: {
            helpfulness: Number,
            accuracy: Number,
            clarity: Number,
            speed: Number,
            politeness: Number,
            completeness: Number,
            relevance: Number,
          },
        },

        // Text feedback
        text: {
          rawText: String,
          processedText: String, // cleaned/normalized
          language: String,
          wordCount: Number,
          sentiment: {
            score: Number, // -1 to 1
            label: String, // 'positive', 'neutral', 'negative'
            confidence: Number,
          },
          emotion: {
            primary: String, // 'joy', 'anger', 'frustration', 'satisfaction'
            intensity: Number, // 0-1
            secondary: [String],
          },
        },

        // Structured feedback
        structured: {
          categories: [
            {
              category: String, // 'bug_report', 'feature_request', 'praise', 'complaint'
              subcategory: String,
              severity: String, // 'low', 'medium', 'high', 'critical'
              details: String,
            },
          ],
          tags: [String],
          priority: String,
          actionRequired: Boolean,
        },
      },

      // Implicit feedback
      implicit: {
        // Behavioral signals
        behavior: {
          // Conversation behavior
          conversation: {
            abandoned: Boolean,
            completionRate: Number, // percentage of conversation completed
            returnedSameSession: Boolean,
            askedForHuman: Boolean,
            repeatedQuestion: Boolean,
            expressedFrustration: Boolean,
          },

          // Response behavior
          response: {
            acknowledged: Boolean, // user acknowledged response
            asked_followup: Boolean,
            copiedText: Boolean,
            sharedResponse: Boolean,
            bookmarked: Boolean,
            timeSpentReading: Number, // seconds
          },

          // Engagement behavior
          engagement: {
            responseTime: Number, // time to respond to agent
            messagesPerSession: Number,
            sessionLength: Number, // milliseconds
            returnVisits: Number,
            recommendedToOthers: Boolean,
          },
        },

        // Usage patterns
        usage: {
          frequencyOfUse: String, // 'first_time', 'occasional', 'regular', 'power_user'
          featureUsage: [String],
          preferredFeatures: [String],
          avoidedFeatures: [String],
          usageContext: String, // when/why they use the agent
        },
      },
    },

    // Feedback Analysis
    analysis: {
      // Sentiment analysis
      sentiment: {
        overall: {
          polarity: Number, // -1 to 1
          subjectivity: Number, // 0 to 1
          confidence: Number,
          label: String, // 'very_negative', 'negative', 'neutral', 'positive', 'very_positive'
        },
        aspects: [
          {
            aspect: String, // 'speed', 'accuracy', 'helpfulness'
            sentiment: Number,
            confidence: Number,
            mentions: [String],
          },
        ],
      },

      // Theme extraction
      themes: {
        primary: [String],
        secondary: [String],
        emerging: [String],
        frequency: {
          type: Map,
          of: Number,
        },
      },

      // Intent classification
      intent: {
        primary: {
          type: String,
          enum: [
            'praise',
            'complaint',
            'suggestion',
            'bug_report',
            'feature_request',
            'clarification',
            'general_feedback',
          ],
        },
        confidence: Number,
        secondary: [String],
        actionable: Boolean,
        urgency: String, // 'low', 'medium', 'high', 'urgent'
      },

      // Quality assessment
      quality: {
        constructiveness: Number, // 0-10, how constructive is the feedback
        specificity: Number, // 0-10, how specific is the feedback
        actionability: Number, // 0-10, how actionable is the feedback
        credibility: Number, // 0-10, how credible is the source
        relevance: Number, // 0-10, how relevant to agent performance
        clarity: Number, // 0-10, how clear is the feedback
      },
    },

    // Context and Conversation
    context: {
      // Conversation context
      conversation: {
        topic: String,
        intent: String,
        complexity: String, // 'simple', 'moderate', 'complex'
        duration: Number, // milliseconds
        turnCount: Number,
        userGoal: String,
        goalAchieved: Boolean,
        escalationPoint: Boolean,
      },

      // Agent performance context
      agent: {
        responseTime: Number, // milliseconds
        responseLength: Number, // characters
        responseQuality: Number, // 0-100
        errorsDetected: [String],
        helpfulnessScore: Number,
        accuracyScore: Number,
        relevanceScore: Number,
      },

      // Technical context
      technical: {
        platform: String,
        version: String,
        features_used: [String],
        errors_encountered: [String],
        performance_issues: [String],
      },
    },

    // Impact Assessment
    impact: {
      // User impact
      user: {
        satisfactionChange: Number, // predicted change in satisfaction
        likelihoodToReturn: Number, // 0-100 percentage
        likelihoodToRecommend: Number, // NPS prediction
        churnRisk: Number, // 0-100 percentage
        lifetimeValueImpact: Number, // estimated dollar impact
      },

      // Business impact
      business: {
        severity: String, // 'low', 'medium', 'high', 'critical'
        affectedUsers: Number, // estimated number affected by similar issues
        revenue_impact: Number, // estimated dollar impact
        brand_impact: String, // 'positive', 'neutral', 'negative'
        competitive_impact: String,
        operationalImpact: String,
      },

      // Agent improvement impact
      agent: {
        improvementOpportunity: Number, // 0-100 score
        difficulty_to_address: String, // 'easy', 'moderate', 'hard', 'very_hard'
        estimated_effort: String, // person-hours
        priority_score: Number, // calculated priority for addressing
        potential_roi: Number, // estimated return on investment
      },
    },

    // Categorization and Routing
    categorization: {
      // Primary classification
      primary: {
        category: {
          type: String,
          enum: [
            'performance',
            'functionality',
            'usability',
            'accuracy',
            'personality',
            'technical',
            'business',
          ],
        },
        subcategory: String,
        specific_area: String,
      },

      // Secondary classifications
      secondary: [String],

      // Routing information
      routing: {
        team: String, // which team should handle this
        priority: String, // 'p0', 'p1', 'p2', 'p3'
        sla: String, // expected response time
        requires_immediate_action: Boolean,
        escalation_needed: Boolean,
      },

      // Related feedback
      related: {
        similar_feedback: [String], // IDs of similar feedback
        duplicate_of: String, // ID if this is a duplicate
        part_of_pattern: String, // ID of pattern this belongs to
        frequency: Number, // how often this type of feedback occurs
      },
    },

    // Response and Follow-up
    response: {
      // Acknowledgment
      acknowledged: {
        timestamp: Date,
        method: String, // 'email', 'in_app', 'phone'
        message: String,
        acknowledged_by: String, // user ID or system
      },

      // Actions taken
      actions: [
        {
          action_type: String, // 'bug_fix', 'feature_addition', 'process_change', 'training_update'
          description: String,
          responsible_team: String,
          started_at: Date,
          completed_at: Date,
          status: String, // 'planned', 'in_progress', 'completed', 'cancelled'
          impact_measurement: String,
        },
      ],

      // Follow-up
      followUp: {
        scheduled: Boolean,
        method: String,
        date: Date,
        completed: Boolean,
        outcome: String,
        user_satisfaction_after: Number,
        issue_resolved: Boolean,
      },
    },

    // Feedback Validation
    validation: {
      // Accuracy validation
      accuracy: {
        validated: Boolean,
        validated_by: String, // 'human', 'system', 'user'
        validated_at: Date,
        validation_confidence: Number,
        discrepancies: [String],
      },

      // Cross-reference validation
      crossReference: {
        logs_verified: Boolean,
        conversation_reviewed: Boolean,
        user_history_checked: Boolean,
        consistent_with_data: Boolean,
        anomalies_detected: [String],
      },

      // Quality validation
      quality: {
        signal_to_noise: Number, // 0-10
        relevance_to_agent: Number, // 0-10
        actionability_score: Number, // 0-10
        reliability_score: Number, // 0-10
        validation_notes: String,
      },
    },

    // Learning and Insights
    insights: {
      // Patterns identified
      patterns: [
        {
          pattern_type: String,
          description: String,
          frequency: Number,
          correlation: String,
          significance: Number,
          action_recommended: String,
        },
      ],

      // Insights generated
      generated: [
        {
          insight_type: String, // 'user_need', 'performance_gap', 'feature_opportunity'
          description: String,
          confidence: Number,
          supporting_evidence: [String],
          business_value: String,
          recommended_action: String,
        },
      ],

      // Learning opportunities
      learning: {
        training_data_opportunity: Boolean,
        model_improvement_opportunity: Boolean,
        process_improvement_opportunity: Boolean,
        product_enhancement_opportunity: Boolean,
        knowledge_gap_identified: [String],
      },
    },

    // Aggregation and Trends
    aggregation: {
      // Time-based aggregation
      temporal: {
        hour: Number,
        dayOfWeek: Number,
        week: Number,
        month: Number,
        quarter: Number,
      },

      // Grouping information
      grouping: {
        user_segment: String,
        interaction_type: String,
        agent_version: String,
        feature_set: String,
        geographic_region: String,
      },

      // Trending information
      trending: {
        is_trending: Boolean,
        trend_direction: String, // 'increasing', 'decreasing', 'stable'
        trend_strength: Number, // 0-1
        trend_duration: Number, // days
        similar_trend_count: Number,
      },
    },

    // Integration and External Data
    integration: {
      // CRM integration
      crm: {
        customer_record_updated: Boolean,
        case_created: Boolean,
        case_id: String,
        account_manager_notified: Boolean,
        customer_success_notified: Boolean,
      },

      // Support system integration
      support: {
        ticket_created: Boolean,
        ticket_id: String,
        assigned_to: String,
        priority: String,
        category: String,
      },

      // Product management integration
      product: {
        feature_request_created: Boolean,
        roadmap_updated: Boolean,
        requirement_documented: Boolean,
        user_research_scheduled: Boolean,
      },
    },

    // Privacy and Compliance
    privacy: {
      // Data handling
      data_handling: {
        personal_data_detected: Boolean,
        personal_data_anonymized: Boolean,
        retention_period: Number, // days
        deletion_scheduled: Date,
        consent_obtained: Boolean,
      },

      // Compliance
      compliance: {
        gdpr_compliant: Boolean,
        ccpa_compliant: Boolean,
        hipaa_compliant: Boolean,
        data_processed_lawfully: Boolean,
        user_rights_respected: Boolean,
      },
    },

    // Metadata
    metadata: {
      version: {
        type: String,
        default: '1.0',
      },

      // Processing metadata
      processing: {
        processed_at: Date,
        processing_version: String,
        processing_model: String,
        processing_confidence: Number,
        manual_review_required: Boolean,
        reviewed_by: String,
        review_date: Date,
      },

      // Classification metadata
      classification: {
        auto_classified: Boolean,
        classification_confidence: Number,
        human_verified: Boolean,
        classification_model: String,
        reclassification_count: Number,
      },

      // Quality metadata
      quality_metadata: {
        completeness: Number, // 0-100
        consistency: Number, // 0-100
        timeliness: Number, // 0-100
        accuracy: Number, // 0-100
        reliability: Number, // 0-100
      },
    },
  },
  {
    timestamps: true,
    collection: 'agentfeedback',
  }
);

// Compound indexes for performance
agentFeedbackSchema.index({ 'feedback.agentId': 1, createdAt: -1 });
agentFeedbackSchema.index({ 'feedback.userId': 1, createdAt: -1 });
agentFeedbackSchema.index({
  'feedback.conversationId': 1,
  'feedback.messageId': 1,
});

// Feedback analysis indexes
agentFeedbackSchema.index({ 'source.type': 1, 'analysis.intent.primary': 1 });
agentFeedbackSchema.index({ 'content.explicit.ratings.overall.score': -1 });
agentFeedbackSchema.index({ 'analysis.sentiment.overall.label': 1 });
agentFeedbackSchema.index({ 'categorization.primary.category': 1 });

// Priority and routing indexes
agentFeedbackSchema.index({ 'categorization.routing.priority': 1 });
agentFeedbackSchema.index({ 'impact.business.severity': 1 });

// TTL index for feedback data (keep for 3 years for learning)
agentFeedbackSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 94608000, // 3 years
  }
);

// Static method to get feedback trends
agentFeedbackSchema.statics.getFeedbackTrends = async function (
  agentId,
  days = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        'feedback.agentId': agentId,
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
        totalFeedback: { $sum: 1 },
        avgRating: { $avg: '$content.explicit.ratings.overall.score' },
        positiveFeedback: {
          $sum: {
            $cond: [
              {
                $in: [
                  '$analysis.sentiment.overall.label',
                  ['positive', 'very_positive'],
                ],
              },
              1,
              0,
            ],
          },
        },
        negativeFeedback: {
          $sum: {
            $cond: [
              {
                $in: [
                  '$analysis.sentiment.overall.label',
                  ['negative', 'very_negative'],
                ],
              },
              1,
              0,
            ],
          },
        },
        complaints: {
          $sum: {
            $cond: [{ $eq: ['$analysis.intent.primary', 'complaint'] }, 1, 0],
          },
        },
        suggestions: {
          $sum: {
            $cond: [{ $eq: ['$analysis.intent.primary', 'suggestion'] }, 1, 0],
          },
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ];

  return this.aggregate(pipeline);
};

// Static method to get feedback insights
agentFeedbackSchema.statics.getFeedbackInsights = async function (
  agentId,
  timeframe = 'month'
) {
  const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const pipeline = [
    {
      $match: {
        'feedback.agentId': agentId,
        createdAt: { $gte: startDate },
      },
    },
    {
      $facet: {
        // Overall metrics
        overall: [
          {
            $group: {
              _id: null,
              totalFeedback: { $sum: 1 },
              avgRating: { $avg: '$content.explicit.ratings.overall.score' },
              avgSentiment: { $avg: '$analysis.sentiment.overall.polarity' },
            },
          },
        ],

        // Category breakdown
        categories: [
          {
            $group: {
              _id: '$categorization.primary.category',
              count: { $sum: 1 },
              avgRating: { $avg: '$content.explicit.ratings.overall.score' },
              avgSentiment: { $avg: '$analysis.sentiment.overall.polarity' },
            },
          },
          { $sort: { count: -1 } },
        ],

        // Intent breakdown
        intents: [
          {
            $group: {
              _id: '$analysis.intent.primary',
              count: { $sum: 1 },
              urgentCount: {
                $sum: {
                  $cond: [
                    { $eq: ['$analysis.intent.urgency', 'urgent'] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
          { $sort: { count: -1 } },
        ],

        // Common themes
        themes: [
          {
            $unwind: '$analysis.themes.primary',
          },
          {
            $group: {
              _id: '$analysis.themes.primary',
              frequency: { $sum: 1 },
              avgImpact: { $avg: '$impact.agent.improvementOpportunity' },
            },
          },
          {
            $sort: { frequency: -1 },
          },
          {
            $limit: 10,
          },
        ],
      },
    },
  ];

  return this.aggregate(pipeline);
};

// Static method to get improvement opportunities from feedback
agentFeedbackSchema.statics.getImprovementOpportunities = async function (
  agentId,
  limit = 10
) {
  const pipeline = [
    {
      $match: {
        'feedback.agentId': agentId,
        'analysis.intent.actionable': true,
        'impact.agent.improvementOpportunity': { $gte: 60 },
      },
    },
    {
      $group: {
        _id: {
          category: '$categorization.primary.category',
          theme: '$analysis.themes.primary.0',
        },
        count: { $sum: 1 },
        avgImpact: { $avg: '$impact.agent.improvementOpportunity' },
        avgPriority: { $avg: '$impact.agent.priority_score' },
        difficulty: { $first: '$impact.agent.difficulty_to_address' },
        examples: { $push: '$content.explicit.text.rawText' },
        businessImpact: { $avg: '$impact.business.affectedUsers' },
      },
    },
    {
      $addFields: {
        opportunityScore: {
          $multiply: ['$avgImpact', '$count', '$businessImpact'],
        },
      },
    },
    {
      $sort: { opportunityScore: -1 },
    },
    {
      $limit: limit,
    },
  ];

  return this.aggregate(pipeline);
};

// Method to calculate feedback quality score
agentFeedbackSchema.methods.calculateFeedbackQuality = function () {
  const quality = this.analysis.quality;

  const weights = {
    constructiveness: 0.25,
    specificity: 0.2,
    actionability: 0.25,
    credibility: 0.15,
    relevance: 0.1,
    clarity: 0.05,
  };

  let score = 0;
  score += (quality.constructiveness || 0) * weights.constructiveness;
  score += (quality.specificity || 0) * weights.specificity;
  score += (quality.actionability || 0) * weights.actionability;
  score += (quality.credibility || 0) * weights.credibility;
  score += (quality.relevance || 0) * weights.relevance;
  score += (quality.clarity || 0) * weights.clarity;

  return Math.round(score * 10) / 10; // Round to 1 decimal place
};

// Method to determine priority level
agentFeedbackSchema.methods.determinePriority = function () {
  let priorityScore = 0;

  // Impact factors
  if (this.impact.business.severity === 'critical') priorityScore += 40;
  else if (this.impact.business.severity === 'high') priorityScore += 30;
  else if (this.impact.business.severity === 'medium') priorityScore += 20;
  else priorityScore += 10;

  // User impact
  if (this.impact.user.churnRisk > 70) priorityScore += 20;
  else if (this.impact.user.churnRisk > 40) priorityScore += 15;
  else if (this.impact.user.churnRisk > 20) priorityScore += 10;

  // Frequency and affected users
  if (this.impact.business.affectedUsers > 1000) priorityScore += 15;
  else if (this.impact.business.affectedUsers > 100) priorityScore += 10;
  else if (this.impact.business.affectedUsers > 10) priorityScore += 5;

  // Sentiment
  if (this.analysis.sentiment.overall.polarity < -0.5) priorityScore += 10;

  // Actionability
  if (this.analysis.quality.actionability > 8) priorityScore += 10;

  if (priorityScore >= 80) return 'p0'; // Critical
  if (priorityScore >= 60) return 'p1'; // High
  if (priorityScore >= 40) return 'p2'; // Medium
  return 'p3'; // Low
};

// Method to generate feedback summary
agentFeedbackSchema.methods.generateSummary = function () {
  return {
    feedback: {
      id: this.feedback.feedbackId,
      type: this.source.type,
      priority: this.determinePriority(),
      quality: this.calculateFeedbackQuality(),
    },
    user: {
      type: this.user.profile.userType,
      experience: this.user.profile.experienceLevel,
    },
    content: {
      rating: this.content.explicit.ratings.overall.score,
      sentiment: this.analysis.sentiment.overall.label,
      intent: this.analysis.intent.primary,
      category: this.categorization.primary.category,
    },
    impact: {
      userImpact: this.impact.user.churnRisk,
      businessSeverity: this.impact.business.severity,
      improvementOpportunity: this.impact.agent.improvementOpportunity,
    },
    response: {
      acknowledged: !!this.response.acknowledged.timestamp,
      actionsPlanned: this.response.actions.length,
      followUpScheduled: this.response.followUp.scheduled,
    },
  };
};

// Virtual for feedback priority
agentFeedbackSchema.virtual('priority').get(function () {
  return this.determinePriority();
});

// Virtual for sentiment category
agentFeedbackSchema.virtual('sentimentCategory').get(function () {
  const polarity = this.analysis.sentiment.overall.polarity;

  if (polarity > 0.3) return 'positive';
  if (polarity > 0.1) return 'slightly_positive';
  if (polarity > -0.1) return 'neutral';
  if (polarity > -0.3) return 'slightly_negative';
  return 'negative';
});

// Virtual for actionability level
agentFeedbackSchema.virtual('actionabilityLevel').get(function () {
  const score = this.analysis.quality.actionability;

  if (score >= 8) return 'highly_actionable';
  if (score >= 6) return 'actionable';
  if (score >= 4) return 'somewhat_actionable';
  return 'low_actionability';
});

export default mongoose.model('AgentFeedback', agentFeedbackSchema);
