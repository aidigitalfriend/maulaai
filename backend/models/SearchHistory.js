import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// SEARCH HISTORY MODEL
// ============================================
const searchHistorySchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Search Session
    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    // Search Query Details
    query: {
      original: {
        type: String,
        required: true,
        index: 'text',
      },
      processed: {
        type: String,
        index: 'text',
      },
      normalized: String,
      language: {
        type: String,
        default: 'en',
      },
      queryType: {
        type: String,
        enum: [
          'keyword',
          'natural_language',
          'voice',
          'filtered',
          'boolean',
          'semantic',
        ],
        required: true,
        index: true,
      },

      // Query analysis
      analysis: {
        intent: String, // 'informational', 'navigational', 'transactional'
        complexity: {
          type: String,
          enum: ['simple', 'moderate', 'complex', 'advanced'],
        },
        keywords: [String],
        entities: [
          {
            entity: String,
            type: String, // 'person', 'place', 'organization', 'concept'
            confidence: Number,
          },
        ],
        topics: [String],
        sentiment: {
          type: String,
          enum: ['positive', 'neutral', 'negative'],
        },
        urgency: {
          type: String,
          enum: ['low', 'medium', 'high', 'urgent'],
        },
      },
    },

    // Search Context
    context: {
      // Where the search originated
      source: {
        type: String,
        enum: [
          'search_bar',
          'chat_interface',
          'voice_assistant',
          'api',
          'mobile_app',
          'widget',
        ],
        required: true,
        index: true,
      },

      // Page/section where search was initiated
      page: String,
      referrer: String,

      // Previous searches in session
      previousQuery: String,
      searchSequence: Number, // nth search in session
      isRefinement: Boolean, // refinement of previous search

      // User state
      userState: {
        isAuthenticated: Boolean,
        userRole: String,
        subscriptionLevel: String,
        previousSearchCount: Number,
      },

      // Device and technical context
      device: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'smart_speaker', 'api_client'],
      },
      userAgent: String,
      ipAddress: String, // hashed for privacy

      // Temporal context
      timestamp: {
        type: Date,
        default: Date.now,
        index: true,
      },
      timezone: String,
      timeOfDay: String, // 'morning', 'afternoon', 'evening', 'night'
      dayOfWeek: Number,
      isBusinessHours: Boolean,
    },

    // Search Filters and Parameters
    filters: {
      // Content type filters
      contentTypes: [String], // 'documents', 'conversations', 'images', 'videos'

      // Time filters
      timeRange: {
        start: Date,
        end: Date,
        preset: String, // 'today', 'week', 'month', 'year', 'all'
      },

      // Category filters
      categories: [String],
      tags: [String],

      // Advanced filters
      advanced: {
        exactPhrase: Boolean,
        includeWords: [String],
        excludeWords: [String],
        fileType: String,
        language: String,
        region: String,
      },

      // Sorting and display preferences
      sortBy: {
        type: String,
        enum: ['relevance', 'date', 'popularity', 'alphabetical'],
        default: 'relevance',
      },
      sortOrder: {
        type: String,
        enum: ['asc', 'desc'],
        default: 'desc',
      },
      resultsPerPage: {
        type: Number,
        default: 10,
      },
    },

    // Search Results
    results: {
      // Result statistics
      statistics: {
        totalResults: {
          type: Number,
          required: true,
        },
        searchTime: {
          type: Number, // milliseconds
          required: true,
        },
        indexesSearched: [String],
        approximateResults: Boolean,
      },

      // Result quality metrics
      quality: {
        relevanceScore: {
          type: Number,
          min: 0,
          max: 1,
        },
        diversityScore: {
          type: Number,
          min: 0,
          max: 1,
        },
        freshnessScore: {
          type: Number,
          min: 0,
          max: 1,
        },
        completenessScore: {
          type: Number,
          min: 0,
          max: 1,
        },
      },

      // Top results (first page)
      topResults: [
        {
          resultId: String,
          title: String,
          snippet: String,
          url: String,
          type: String, // 'document', 'conversation', 'faq', 'article'
          relevanceScore: Number,
          clickPosition: Number, // if clicked
          clicked: Boolean,
          clickTime: Date,
          timeOnResult: Number, // seconds spent on result
          helpful: Boolean, // user feedback
          source: String,
        },
      ],

      // Result categories
      categories: [
        {
          category: String,
          count: Number,
          topResult: String,
        },
      ],

      // Suggested queries
      suggestions: [
        {
          suggestion: String,
          type: String, // 'spelling', 'completion', 'related', 'trending'
          confidence: Number,
          clicked: Boolean,
        },
      ],
    },

    // User Interaction with Results
    interaction: {
      // Click behavior
      clicks: [
        {
          resultId: String,
          position: Number,
          clickTime: Date,
          timeToClick: Number, // milliseconds from search
          dwellTime: Number, // seconds on result page
          bounced: Boolean, // returned quickly to search results
          converted: Boolean, // accomplished goal
          satisfied: Boolean, // user feedback
        },
      ],

      // Pagination behavior
      pagination: {
        pagesViewed: Number,
        maxPageReached: Number,
        timePerPage: [Number], // seconds per page
        backtracking: Boolean, // went back to earlier pages
      },

      // Refinement behavior
      refinement: {
        refined: Boolean,
        refinementType: String, // 'filters', 'query_change', 'spelling'
        refinementTime: Number, // seconds before refinement
        newQuery: String,
        filtersChanged: [String],
      },

      // Overall satisfaction
      satisfaction: {
        found: Boolean, // found what they were looking for
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        feedback: String,
        reportedIssue: Boolean,
        issueType: String, // 'no_results', 'irrelevant', 'slow', 'broken_link'
      },
    },

    // Search Performance
    performance: {
      // System performance
      system: {
        searchTime: Number, // total time to return results (ms)
        indexTime: Number, // time spent searching indexes (ms)
        renderTime: Number, // time to render results (ms)
        totalTime: Number, // end-to-end time (ms)
        resourcesUsed: {
          cpu: Number, // percentage
          memory: Number, // MB
          diskIO: Number, // operations
        },
      },

      // Algorithm performance
      algorithm: {
        algorithmVersion: String,
        rankingModel: String,
        featuresUsed: [String],
        personalizedResults: Boolean,
        aiEnhanced: Boolean,
        cachingUsed: Boolean,
        cacheHit: Boolean,
      },

      // Quality metrics
      qualityMetrics: {
        precision: Number, // relevant results / total results shown
        recall: Number, // relevant results found / all relevant results
        f1Score: Number, // harmonic mean of precision and recall
        ndcg: Number, // Normalized Discounted Cumulative Gain
        clickThroughRate: Number,
        conversionRate: Number,
      },
    },

    // Search Analytics
    analytics: {
      // Query analysis
      queryAnalysis: {
        isPopular: Boolean, // frequently searched query
        isTrending: Boolean, // trending up in searches
        difficulty: Number, // 1-10, how hard to satisfy
        competition: Number, // how many results compete
        seasonality: String, // seasonal patterns
        geographicPopularity: [
          {
            region: String,
            popularity: Number,
          },
        ],
      },

      // User behavior analysis
      behaviorAnalysis: {
        isExplorer: Boolean, // tries multiple variations
        isPersistent: Boolean, // doesn't give up easily
        isSpecific: Boolean, // uses specific/long queries
        hasExpertise: Boolean, // uses domain-specific terms
        learningPattern: String, // how user learns to search better
      },

      // Success prediction
      prediction: {
        successProbability: Number, // 0-1 probability of finding what they want
        refinementProbability: Number, // probability of refining search
        abandonmentRisk: Number, // risk of abandoning search
        satisfactionPrediction: Number, // predicted satisfaction score
        nextQueryPrediction: String,
      },
    },

    // Business Intelligence
    business: {
      // Content gaps
      contentGaps: [
        {
          gapType: String, // 'missing_content', 'outdated_content', 'insufficient_depth'
          description: String,
          priority: String, // 'low', 'medium', 'high', 'critical'
          potentialImpact: String,
        },
      ],

      // Opportunities
      opportunities: [
        {
          type: String, // 'content_creation', 'feature_enhancement', 'integration'
          description: String,
          estimatedValue: Number,
          difficulty: String,
        },
      ],

      // User journey insights
      journey: {
        journeyStage: String, // 'awareness', 'consideration', 'decision', 'retention'
        userGoal: String,
        obstaclesEncountered: [String],
        successFactors: [String],
        dropOffRisk: Number,
      },
    },

    // Privacy and Compliance
    privacy: {
      // Data handling
      dataHandling: {
        anonymized: Boolean,
        encrypted: Boolean,
        retentionPeriod: Number, // days
        canBeDeleted: Boolean,
        consentGiven: Boolean,
      },

      // Compliance flags
      compliance: {
        gdprCompliant: Boolean,
        ccpaCompliant: Boolean,
        coppaCompliant: Boolean, // if user is minor
        sensitiveData: Boolean,
        piiDetected: Boolean,
      },

      // Personalization consent
      personalization: {
        consentGiven: Boolean,
        useForRecommendations: Boolean,
        useForTargeting: Boolean,
        shareWithThirdParty: Boolean,
      },
    },

    // Related Searches and Patterns
    patterns: {
      // Related searches in session
      relatedSearches: [String],

      // Search patterns for this user
      userPatterns: {
        commonKeywords: [String],
        preferredFilters: [String],
        typicalSearchTime: String, // time of day
        averageQueryLength: Number,
        refinementRate: Number, // percentage of searches refined
      },

      // Similar users' behavior
      similarUsers: {
        commonQueries: [String],
        successfulStrategies: [String],
        recommendedRefinements: [String],
      },
    },

    // Follow-up Actions
    followUp: {
      // Actions taken after search
      actions: [
        {
          action: String, // 'bookmarked', 'shared', 'downloaded', 'contacted_support'
          timestamp: Date,
          details: String,
        },
      ],

      // Subsequent searches
      subsequentSearches: [
        {
          query: String,
          timestamp: Date,
          relationship: String, // 'refinement', 'related_topic', 'follow_up'
        },
      ],

      // Long-term tracking
      longTermTracking: {
        returnedToResults: Boolean,
        returnDate: Date,
        goalAchieved: Boolean,
        satisfactionUpdate: Number,
      },
    },
  },
  {
    timestamps: true,
    collection: 'searchhistory',
  }
);

// Compound indexes for performance
searchHistorySchema.index({ userId: 1, 'context.timestamp': -1 });
searchHistorySchema.index({
  'query.original': 'text',
  'query.processed': 'text',
});
searchHistorySchema.index({ userId: 1, sessionId: 1, 'context.timestamp': -1 });
searchHistorySchema.index({ 'context.source': 1, 'context.timestamp': -1 });

// Single field indexes
searchHistorySchema.index({ userId: 1 });
searchHistorySchema.index({ sessionId: 1 });
searchHistorySchema.index({ 'query.queryType': 1 });
searchHistorySchema.index({ 'context.timestamp': -1 });
searchHistorySchema.index({ 'context.source': 1 });
searchHistorySchema.index({ 'results.statistics.totalResults': 1 });

// TTL index for privacy compliance (configurable retention)
searchHistorySchema.index(
  { 'context.timestamp': 1 },
  {
    expireAfterSeconds: 7776000, // 90 days default
  }
);

// Static method to get search history for user
searchHistorySchema.statics.getHistoryForUser = async function (
  userId,
  options = {}
) {
  const {
    startDate,
    endDate,
    queryType,
    source,
    limit = 100,
    skip = 0,
  } = options;

  const query = { userId };

  if (startDate || endDate) {
    query['context.timestamp'] = {};
    if (startDate) query['context.timestamp'].$gte = startDate;
    if (endDate) query['context.timestamp'].$lte = endDate;
  }

  if (queryType) query['query.queryType'] = queryType;
  if (source) query['context.source'] = source;

  return this.find(query)
    .sort({ 'context.timestamp': -1 })
    .limit(limit)
    .skip(skip)
    .select('-privacy -userAgent -ipAddress'); // Exclude sensitive data
};

// Static method to get popular searches
searchHistorySchema.statics.getPopularSearches = async function (
  timeframe = 'week',
  limit = 20
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
  }

  const pipeline = [
    {
      $match: {
        'context.timestamp': { $gte: startDate },
      },
    },
    {
      $group: {
        _id: '$query.normalized',
        count: { $sum: 1 },
        averageResults: { $avg: '$results.statistics.totalResults' },
        averageSearchTime: { $avg: '$results.statistics.searchTime' },
        averageSatisfaction: { $avg: '$interaction.satisfaction.rating' },
        clickThroughRate: {
          $avg: {
            $cond: [{ $gt: [{ $size: '$interaction.clicks' }, 0] }, 1, 0],
          },
        },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: limit,
    },
  ];

  return this.aggregate(pipeline);
};

// Static method to get search analytics
searchHistorySchema.statics.getSearchAnalytics = async function (
  userId,
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

  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        'context.timestamp': { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalSearches: { $sum: 1 },
        uniqueQueries: { $addToSet: '$query.normalized' },
        averageSearchTime: { $avg: '$results.statistics.searchTime' },
        averageResultsFound: { $avg: '$results.statistics.totalResults' },
        averageSatisfaction: { $avg: '$interaction.satisfaction.rating' },
        totalClicks: { $sum: { $size: '$interaction.clicks' } },
        refinementRate: {
          $avg: {
            $cond: ['$interaction.refinement.refined', 1, 0],
          },
        },
        searchesBySource: {
          $push: '$context.source',
        },
      },
    },
    {
      $addFields: {
        uniqueQueryCount: { $size: '$uniqueQueries' },
        clickThroughRate: {
          $cond: [
            { $gt: ['$totalSearches', 0] },
            { $divide: ['$totalClicks', '$totalSearches'] },
            0,
          ],
        },
      },
    },
  ];

  return this.aggregate(pipeline);
};

// Method to calculate search success score
searchHistorySchema.methods.calculateSuccessScore = function () {
  let score = 0;
  let factors = 0;

  // Results found (30%)
  if (this.results.statistics.totalResults > 0) {
    score += 30;
    factors++;
  }

  // User clicked on results (25%)
  if (this.interaction.clicks.length > 0) {
    score += 25;
    factors++;
  }

  // User was satisfied (25%)
  if (this.interaction.satisfaction.rating >= 4) {
    score += 25;
    factors++;
  }

  // Fast search (20%)
  if (this.results.statistics.searchTime < 500) {
    // < 500ms
    score += 20;
    factors++;
  }

  return factors > 0 ? Math.round(score) : 0;
};

// Method to analyze search intent
searchHistorySchema.methods.analyzeIntent = function () {
  const query = this.query.original.toLowerCase();
  const keywords = this.query.analysis.keywords || [];

  let intent = 'informational'; // default

  // Transactional intent indicators
  const transactionalKeywords = [
    'buy',
    'purchase',
    'order',
    'download',
    'get',
    'subscribe',
  ];
  if (transactionalKeywords.some((kw) => query.includes(kw))) {
    intent = 'transactional';
  }

  // Navigational intent indicators
  const navigationalKeywords = [
    'login',
    'dashboard',
    'account',
    'profile',
    'settings',
  ];
  if (navigationalKeywords.some((kw) => query.includes(kw))) {
    intent = 'navigational';
  }

  // Question words indicate informational intent
  const questionWords = ['how', 'what', 'when', 'where', 'why', 'who'];
  if (questionWords.some((qw) => query.includes(qw))) {
    intent = 'informational';
  }

  this.query.analysis.intent = intent;
  return intent;
};

// Method to predict search refinement
searchHistorySchema.methods.predictRefinement = function () {
  let refinementProbability = 0.1; // base probability

  // Low results increase refinement probability
  if (this.results.statistics.totalResults < 5) {
    refinementProbability += 0.4;
  } else if (this.results.statistics.totalResults < 20) {
    refinementProbability += 0.2;
  }

  // No clicks increase refinement probability
  if (this.interaction.clicks.length === 0) {
    refinementProbability += 0.3;
  }

  // Slow search increases refinement probability
  if (this.results.statistics.searchTime > 2000) {
    refinementProbability += 0.1;
  }

  // Complex queries are less likely to be refined
  if (this.query.analysis.complexity === 'complex') {
    refinementProbability -= 0.1;
  }

  this.analytics.prediction.refinementProbability = Math.min(
    1,
    refinementProbability
  );
  return this.analytics.prediction.refinementProbability;
};

// Method to generate search insights
searchHistorySchema.methods.generateInsights = function () {
  const insights = [];

  // No results insight
  if (this.results.statistics.totalResults === 0) {
    insights.push({
      type: 'no_results',
      message: 'No results found for this query',
      suggestion: 'Try using different keywords or removing filters',
    });
  }

  // Slow search insight
  if (this.results.statistics.searchTime > 3000) {
    insights.push({
      type: 'performance',
      message: 'Search took longer than expected',
      suggestion: 'Consider optimizing your query or checking system status',
    });
  }

  // Low click-through insight
  if (
    this.results.statistics.totalResults > 10 &&
    this.interaction.clicks.length === 0
  ) {
    insights.push({
      type: 'relevance',
      message: 'Results may not be relevant to your query',
      suggestion: 'Try refining your search terms or using different keywords',
    });
  }

  // High refinement user insight
  if (this.interaction.refinement.refined) {
    insights.push({
      type: 'refinement',
      message: 'Query was refined during search',
      suggestion: 'Original query may have been too broad or specific',
    });
  }

  return insights;
};

// Virtual for search effectiveness
searchHistorySchema.virtual('effectiveness').get(function () {
  const successScore = this.calculateSuccessScore();

  if (successScore >= 80) return 'excellent';
  if (successScore >= 60) return 'good';
  if (successScore >= 40) return 'fair';
  if (successScore >= 20) return 'poor';
  return 'very_poor';
});

// Virtual for query complexity score
searchHistorySchema.virtual('complexityScore').get(function () {
  const queryLength = this.query.original.length;
  const keywordCount = this.query.analysis.keywords?.length || 0;
  const hasFilters = Object.keys(this.filters.advanced || {}).length > 0;

  let score = 0;

  if (queryLength > 100) score += 3;
  else if (queryLength > 50) score += 2;
  else if (queryLength > 20) score += 1;

  if (keywordCount > 5) score += 2;
  else if (keywordCount > 3) score += 1;

  if (hasFilters) score += 2;

  return Math.min(10, score);
});

export default mongoose.model('SearchHistory', searchHistorySchema);
