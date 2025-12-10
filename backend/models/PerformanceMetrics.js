import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// PERFORMANCE METRICS MODEL
// ============================================
const performanceMetricsSchema = new Schema(
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
        enum: ['minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'],
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

    // System Performance Metrics
    system: {
      // Response Time Metrics
      responseTime: {
        average: {
          type: Number, // milliseconds
          default: 0,
        },
        median: {
          type: Number,
          default: 0,
        },
        p50: { type: Number, default: 0 },
        p75: { type: Number, default: 0 },
        p90: { type: Number, default: 0 },
        p95: { type: Number, default: 0 },
        p99: { type: Number, default: 0 },
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        standardDeviation: { type: Number, default: 0 },
      },

      // Throughput Metrics
      throughput: {
        requestsPerSecond: {
          type: Number,
          default: 0,
        },
        conversationsPerHour: {
          type: Number,
          default: 0,
        },
        messagesPerSecond: {
          type: Number,
          default: 0,
        },
        peakThroughput: {
          type: Number,
          default: 0,
        },
        averageConcurrency: {
          type: Number,
          default: 0,
        },
      },

      // Error Metrics
      errors: {
        totalErrors: {
          type: Number,
          default: 0,
        },
        errorRate: {
          type: Number, // percentage
          default: 0,
        },
        errorsByType: [
          {
            errorType: String,
            count: Number,
            percentage: Number,
            averageResolutionTime: Number,
          },
        ],
        criticalErrors: {
          type: Number,
          default: 0,
        },
        warningCount: {
          type: Number,
          default: 0,
        },
      },

      // Availability Metrics
      availability: {
        uptime: {
          type: Number, // percentage
          default: 100,
        },
        downtime: {
          type: Number, // minutes
          default: 0,
        },
        mttr: {
          type: Number, // Mean Time To Recovery in minutes
          default: 0,
        },
        mtbf: {
          type: Number, // Mean Time Between Failures in hours
          default: 0,
        },
        incidents: [
          {
            incidentId: String,
            severity: String,
            startTime: Date,
            endTime: Date,
            duration: Number,
            impact: String,
            rootCause: String,
          },
        ],
      },

      // Resource Utilization
      resources: {
        cpu: {
          average: Number, // percentage
          peak: Number,
          min: Number,
        },
        memory: {
          average: Number, // MB
          peak: Number,
          min: Number,
          utilizationPercentage: Number,
        },
        storage: {
          used: Number, // GB
          available: Number,
          utilizationPercentage: Number,
          iops: Number, // Input/Output Operations Per Second
        },
        network: {
          bandwidthIn: Number, // Mbps
          bandwidthOut: Number,
          latency: Number, // milliseconds
          packetLoss: Number, // percentage
        },
      },
    },

    // Application Performance Metrics
    application: {
      // AI Model Performance
      aiModels: {
        totalRequests: {
          type: Number,
          default: 0,
        },
        successfulRequests: {
          type: Number,
          default: 0,
        },
        failedRequests: {
          type: Number,
          default: 0,
        },
        averageLatency: {
          type: Number, // milliseconds
          default: 0,
        },

        // Per model breakdown
        modelPerformance: [
          {
            modelName: String,
            provider: String,
            requests: Number,
            successRate: Number,
            averageLatency: Number,
            tokenUsage: {
              input: Number,
              output: Number,
              total: Number,
            },
            cost: Number,
            accuracy: Number,
            qualityScore: Number,
          },
        ],

        // Token efficiency
        tokenEfficiency: {
          averageInputTokens: Number,
          averageOutputTokens: Number,
          tokenUtilization: Number, // percentage of allocated tokens used
          costPerToken: Number,
          costPerRequest: Number,
        },
      },

      // Database Performance
      database: {
        connectionPool: {
          activeConnections: Number,
          idleConnections: Number,
          maxConnections: Number,
          utilizationPercentage: Number,
        },
        queryPerformance: {
          averageQueryTime: Number, // milliseconds
          slowQueries: Number,
          queryCount: Number,
          cacheHitRate: Number, // percentage
        },
        operations: {
          reads: Number,
          writes: Number,
          updates: Number,
          deletes: Number,
          readLatency: Number,
          writeLatency: Number,
        },
      },

      // Cache Performance
      cache: {
        hitRate: {
          type: Number, // percentage
          default: 0,
        },
        missRate: {
          type: Number,
          default: 0,
        },
        evictionRate: {
          type: Number,
          default: 0,
        },
        memoryUsage: {
          type: Number, // MB
          default: 0,
        },
        keyCount: {
          type: Number,
          default: 0,
        },
        averageKeySize: {
          type: Number, // bytes
          default: 0,
        },
      },

      // API Performance
      api: {
        endpoints: [
          {
            path: String,
            method: String,
            requestCount: Number,
            averageResponseTime: Number,
            errorRate: Number,
            successRate: Number,
            p95ResponseTime: Number,
            p99ResponseTime: Number,
          },
        ],
        rateLimit: {
          requestsPerMinute: Number,
          throttledRequests: Number,
          throttleRate: Number, // percentage
        },
        authentication: {
          successfulLogins: Number,
          failedLogins: Number,
          authenticationTime: Number,
          tokenRefreshCount: Number,
        },
      },
    },

    // User Experience Metrics
    userExperience: {
      // Page Performance
      pageMetrics: {
        loadTime: {
          average: Number, // milliseconds
          p50: Number,
          p75: Number,
          p90: Number,
          p95: Number,
          p99: Number,
        },
        firstContentfulPaint: {
          average: Number,
          median: Number,
        },
        largestContentfulPaint: {
          average: Number,
          median: Number,
        },
        cumulativeLayoutShift: {
          average: Number,
          median: Number,
        },
        timeToInteractive: {
          average: Number,
          median: Number,
        },
      },

      // User Interaction Metrics
      interaction: {
        sessionDuration: {
          average: Number, // seconds
          median: Number,
        },
        pageViews: {
          total: Number,
          unique: Number,
          averagePerSession: Number,
        },
        bounceRate: {
          type: Number, // percentage
          default: 0,
        },
        conversionRate: {
          type: Number, // percentage
          default: 0,
        },
        userSatisfaction: {
          averageRating: Number,
          responseCount: Number,
          npsScore: Number, // Net Promoter Score
        },
      },

      // Device and Browser Performance
      clientMetrics: {
        deviceTypes: [
          {
            deviceType: String, // 'desktop', 'mobile', 'tablet'
            userCount: Number,
            averageLoadTime: Number,
            errorRate: Number,
          },
        ],
        browsers: [
          {
            browser: String,
            version: String,
            userCount: Number,
            performanceScore: Number,
            compatibilityIssues: Number,
          },
        ],
        operatingSystems: [
          {
            os: String,
            version: String,
            userCount: Number,
            performanceScore: Number,
          },
        ],
      },
    },

    // Business Performance Metrics
    business: {
      // Conversion Metrics
      conversion: {
        totalConversions: {
          type: Number,
          default: 0,
        },
        conversionRate: {
          type: Number, // percentage
          default: 0,
        },
        conversionsByType: [
          {
            type: String, // 'signup', 'purchase', 'subscription', etc.
            count: Number,
            rate: Number,
            value: Number,
          },
        ],
        averageConversionTime: {
          type: Number, // minutes
          default: 0,
        },
        conversionFunnel: [
          {
            stage: String,
            users: Number,
            dropOffRate: Number,
            conversionRate: Number,
          },
        ],
      },

      // Revenue Metrics
      revenue: {
        totalRevenue: {
          type: Number,
          default: 0,
        },
        revenuePerUser: {
          type: Number,
          default: 0,
        },
        averageOrderValue: {
          type: Number,
          default: 0,
        },
        lifetimeValue: {
          average: Number,
          median: Number,
        },
        churnRate: {
          type: Number, // percentage
          default: 0,
        },
        retentionRate: {
          type: Number, // percentage
          default: 0,
        },
      },

      // Engagement Metrics
      engagement: {
        activeUsers: {
          total: Number,
          returning: Number,
          new: Number,
        },
        engagementScore: {
          average: Number,
          distribution: [
            {
              range: String,
              count: Number,
              percentage: Number,
            },
          ],
        },
        featureAdoption: [
          {
            featureName: String,
            adoptionRate: Number,
            activeUsers: Number,
            averageUsage: Number,
          },
        ],
        contentEngagement: {
          viewCount: Number,
          shareCount: Number,
          commentCount: Number,
          likeCount: Number,
        },
      },
    },

    // Security Performance Metrics
    security: {
      // Threat Detection
      threats: {
        detected: {
          type: Number,
          default: 0,
        },
        blocked: {
          type: Number,
          default: 0,
        },
        falsePositives: {
          type: Number,
          default: 0,
        },
        threatsByType: [
          {
            threatType: String,
            count: Number,
            severity: String,
            blocked: Number,
          },
        ],
        responseTime: {
          average: Number, // seconds
          median: Number,
        },
      },

      // Authentication Security
      authentication: {
        suspiciousAttempts: {
          type: Number,
          default: 0,
        },
        blockedAttempts: {
          type: Number,
          default: 0,
        },
        multiFactorUsage: {
          type: Number, // percentage
          default: 0,
        },
        passwordStrength: {
          weak: Number,
          medium: Number,
          strong: Number,
        },
        sessionSecurity: {
          hijackingAttempts: Number,
          sessionTimeouts: Number,
          secureConnections: Number, // percentage
        },
      },

      // Data Protection
      dataProtection: {
        encryptionCoverage: {
          type: Number, // percentage
          default: 0,
        },
        dataBreaches: {
          type: Number,
          default: 0,
        },
        accessViolations: {
          type: Number,
          default: 0,
        },
        complianceScore: {
          type: Number, // percentage
          default: 0,
        },
      },
    },

    // Infrastructure Monitoring
    infrastructure: {
      // Load Balancer Performance
      loadBalancer: {
        requestDistribution: [
          {
            serverInstance: String,
            requestCount: Number,
            responseTime: Number,
            errorRate: Number,
          },
        ],
        healthChecks: {
          passed: Number,
          failed: Number,
          responseTime: Number,
        },
      },

      // CDN Performance
      cdn: {
        cacheHitRate: {
          type: Number, // percentage
          default: 0,
        },
        bandwidthSavings: {
          type: Number, // GB
          default: 0,
        },
        globalLatency: [
          {
            region: String,
            averageLatency: Number,
            requestCount: Number,
          },
        ],
        edgeLocations: {
          active: Number,
          total: Number,
          utilizationRate: Number,
        },
      },

      // Third-party Services
      thirdPartyServices: [
        {
          serviceName: String,
          provider: String,
          availability: Number, // percentage
          responseTime: Number,
          errorRate: Number,
          dependencyHealth: String, // 'healthy', 'degraded', 'unhealthy'
          cost: Number,
          usage: Number,
        },
      ],
    },

    // Alert and Monitoring Status
    monitoring: {
      alerts: {
        triggered: {
          type: Number,
          default: 0,
        },
        acknowledged: {
          type: Number,
          default: 0,
        },
        resolved: {
          type: Number,
          default: 0,
        },
        falseAlerts: {
          type: Number,
          default: 0,
        },
        averageResolutionTime: {
          type: Number, // minutes
          default: 0,
        },
        alertsByPriority: [
          {
            priority: String, // 'critical', 'high', 'medium', 'low'
            count: Number,
            averageResolutionTime: Number,
          },
        ],
      },

      healthChecks: {
        total: {
          type: Number,
          default: 0,
        },
        passed: {
          type: Number,
          default: 0,
        },
        failed: {
          type: Number,
          default: 0,
        },
        successRate: {
          type: Number, // percentage
          default: 100,
        },
        averageResponseTime: {
          type: Number, // milliseconds
          default: 0,
        },
      },
    },

    // Performance Trends and Analysis
    trends: {
      // Performance over time
      performanceTrend: {
        direction: {
          type: String,
          enum: ['improving', 'stable', 'degrading'],
          default: 'stable',
        },
        confidence: {
          type: Number, // percentage
          default: 0,
        },
        keyMetrics: [
          {
            metricName: String,
            currentValue: Number,
            previousValue: Number,
            changePercentage: Number,
            trend: String,
          },
        ],
      },

      // Capacity planning
      capacity: {
        currentUtilization: {
          type: Number, // percentage
          default: 0,
        },
        projectedGrowth: {
          type: Number, // percentage per month
          default: 0,
        },
        capacityPlanningAlerts: [
          {
            resource: String,
            currentUsage: Number,
            threshold: Number,
            estimatedExhaustionDate: Date,
            recommendedAction: String,
          },
        ],
      },

      // Anomaly detection
      anomalies: [
        {
          metricName: String,
          anomalyType: String, // 'spike', 'drop', 'trend_change'
          detectedAt: Date,
          severity: String,
          description: String,
          confidence: Number,
          resolved: Boolean,
          resolutionDate: Date,
        },
      ],
    },

    // Calculation Metadata
    calculation: {
      calculatedAt: {
        type: Date,
        default: Date.now,
      },
      calculationDuration: {
        type: Number, // milliseconds
        default: 0,
      },
      dataPoints: {
        type: Number,
        default: 0,
      },
      accuracy: {
        type: Number, // percentage
        default: 100,
      },
      methodology: String,
      version: {
        type: String,
        default: '1.0',
      },
    },
  },
  {
    timestamps: true,
    collection: 'performancemetrics',
  }
);

// Compound indexes for performance
performanceMetricsSchema.index({
  userId: 1,
  'period.type': 1,
  'period.startTime': -1,
});
performanceMetricsSchema.index({ userId: 1, 'period.startTime': -1 });
performanceMetricsSchema.index({
  'period.startTime': -1,
  'period.endTime': -1,
});

// Single field indexes
performanceMetricsSchema.index({ userId: 1 });
performanceMetricsSchema.index({ 'period.type': 1 });
performanceMetricsSchema.index({ 'period.startTime': -1 });
performanceMetricsSchema.index({ 'system.responseTime.average': 1 });
performanceMetricsSchema.index({ 'system.errors.errorRate': 1 });
performanceMetricsSchema.index({ 'system.availability.uptime': -1 });

// TTL index for old metrics (keep for 2 years)
performanceMetricsSchema.index(
  { 'period.endTime': 1 },
  {
    expireAfterSeconds: 63072000, // 2 years
  }
);

// Static method to get performance metrics for user
performanceMetricsSchema.statics.getMetricsForUser = async function (
  userId,
  options = {}
) {
  const { periodType, startDate, endDate, limit = 100, skip = 0 } = options;

  const query = { userId };

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

// Static method to get system health overview
performanceMetricsSchema.statics.getSystemHealth = async function (
  userId,
  timeframe = 'hour'
) {
  const startTime = new Date();

  switch (timeframe) {
    case 'hour':
      startTime.setHours(startTime.getHours() - 1);
      break;
    case 'day':
      startTime.setDate(startTime.getDate() - 1);
      break;
    case 'week':
      startTime.setDate(startTime.getDate() - 7);
      break;
  }

  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        'period.startTime': { $gte: startTime },
      },
    },
    {
      $group: {
        _id: null,
        averageResponseTime: { $avg: '$system.responseTime.average' },
        errorRate: { $avg: '$system.errors.errorRate' },
        uptime: { $avg: '$system.availability.uptime' },
        throughput: { $avg: '$system.throughput.requestsPerSecond' },
        cpuUsage: { $avg: '$system.resources.cpu.average' },
        memoryUsage: { $avg: '$system.resources.memory.average' },
      },
    },
  ];

  return this.aggregate(pipeline);
};

// Static method to get performance alerts
performanceMetricsSchema.statics.getPerformanceAlerts = async function (
  userId
) {
  return this.find({
    userId,
    $or: [
      { 'system.responseTime.average': { $gt: 5000 } }, // > 5 seconds
      { 'system.errors.errorRate': { $gt: 5 } }, // > 5% error rate
      { 'system.availability.uptime': { $lt: 99 } }, // < 99% uptime
      { 'system.resources.cpu.average': { $gt: 80 } }, // > 80% CPU
      { 'system.resources.memory.utilizationPercentage': { $gt: 85 } }, // > 85% memory
    ],
  })
    .sort({ 'period.startTime': -1 })
    .limit(10);
};

// Method to calculate overall performance score
performanceMetricsSchema.methods.calculatePerformanceScore = function () {
  let score = 100;

  // Response time impact (max -30 points)
  if (this.system.responseTime.average > 1000) {
    const responseTimePenalty = Math.min(
      (this.system.responseTime.average - 1000) / 100,
      30
    );
    score -= responseTimePenalty;
  }

  // Error rate impact (max -40 points)
  if (this.system.errors.errorRate > 1) {
    const errorRatePenalty = Math.min(this.system.errors.errorRate * 4, 40);
    score -= errorRatePenalty;
  }

  // Uptime impact (max -20 points)
  if (this.system.availability.uptime < 99) {
    const uptimePenalty = (99 - this.system.availability.uptime) * 2;
    score -= uptimePenalty;
  }

  // Resource utilization impact (max -10 points)
  const cpuPenalty = Math.max(0, (this.system.resources.cpu.average - 70) / 3);
  const memoryPenalty = Math.max(
    0,
    (this.system.resources.memory.utilizationPercentage - 70) / 3
  );
  score -= Math.min(cpuPenalty + memoryPenalty, 10);

  return Math.max(0, Math.round(score));
};

// Method to detect anomalies
performanceMetricsSchema.methods.detectAnomalies = function (historicalData) {
  const anomalies = [];

  // Response time anomaly detection
  if (historicalData.length > 0) {
    const avgResponseTime =
      historicalData.reduce(
        (sum, h) => sum + h.system.responseTime.average,
        0
      ) / historicalData.length;
    const threshold = avgResponseTime * 2; // 200% of historical average

    if (this.system.responseTime.average > threshold) {
      anomalies.push({
        metricName: 'response_time',
        anomalyType: 'spike',
        detectedAt: new Date(),
        severity:
          this.system.responseTime.average > threshold * 2
            ? 'critical'
            : 'high',
        description: `Response time ${
          this.system.responseTime.average
        }ms is ${Math.round(
          (this.system.responseTime.average / avgResponseTime) * 100
        )}% higher than average`,
        confidence: 0.9,
        resolved: false,
      });
    }
  }

  // Error rate anomaly detection
  if (this.system.errors.errorRate > 10) {
    anomalies.push({
      metricName: 'error_rate',
      anomalyType: 'spike',
      detectedAt: new Date(),
      severity: this.system.errors.errorRate > 20 ? 'critical' : 'high',
      description: `Error rate ${this.system.errors.errorRate}% is unusually high`,
      confidence: 0.95,
      resolved: false,
    });
  }

  this.trends.anomalies = anomalies;
  return anomalies;
};

// Method to generate performance recommendations
performanceMetricsSchema.methods.generateRecommendations = function () {
  const recommendations = [];

  // Response time recommendations
  if (this.system.responseTime.average > 2000) {
    recommendations.push({
      category: 'response_time',
      priority: 'high',
      recommendation:
        'Consider implementing caching mechanisms and optimizing database queries',
      expectedImpact: 'Reduce response time by 30-50%',
    });
  }

  // Error rate recommendations
  if (this.system.errors.errorRate > 3) {
    recommendations.push({
      category: 'error_handling',
      priority: 'high',
      recommendation:
        'Review error logs and implement better error handling and retry mechanisms',
      expectedImpact: 'Reduce error rate to <1%',
    });
  }

  // Resource utilization recommendations
  if (this.system.resources.cpu.average > 75) {
    recommendations.push({
      category: 'scaling',
      priority: 'medium',
      recommendation:
        'Consider scaling up resources or optimizing CPU-intensive operations',
      expectedImpact: 'Maintain consistent performance under load',
    });
  }

  return recommendations;
};

// Virtual for health status
performanceMetricsSchema.virtual('healthStatus').get(function () {
  const score = this.calculatePerformanceScore();

  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'fair';
  if (score >= 60) return 'poor';
  return 'critical';
});

// Virtual for SLA compliance
performanceMetricsSchema.virtual('slaCompliance').get(function () {
  const responseTimeSLA = this.system.responseTime.average <= 3000; // 3 seconds
  const errorRateSLA = this.system.errors.errorRate <= 2; // 2% error rate
  const uptimeSLA = this.system.availability.uptime >= 99.5; // 99.5% uptime

  return {
    responseTime: responseTimeSLA,
    errorRate: errorRateSLA,
    uptime: uptimeSLA,
    overall: responseTimeSLA && errorRateSLA && uptimeSLA,
  };
});

export default mongoose.model('PerformanceMetrics', performanceMetricsSchema);
