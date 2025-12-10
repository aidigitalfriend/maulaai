import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// EXPORT LOGS MODEL
// ============================================
const exportLogsSchema = new Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Export Request Details
    exportRequest: {
      requestId: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },
      requestType: {
        type: String,
        enum: [
          'data_export',
          'backup_export',
          'analytics_export',
          'conversation_export',
          'user_data_export',
          'compliance_export',
          'api_export',
          'bulk_export',
          'scheduled_export',
          'custom_export',
        ],
        required: true,
        index: true,
      },
      requestSource: {
        type: String,
        enum: [
          'user_request',
          'admin_request',
          'automated',
          'api',
          'scheduled',
          'compliance',
        ],
        required: true,
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent', 'critical'],
        default: 'medium',
        index: true,
      },
    },

    // Export Configuration
    configuration: {
      // Data scope
      dataScope: {
        dataTypes: [
          {
            type: String, // 'conversations', 'analytics', 'user_profile', 'billing', etc.
            included: Boolean,
            specificFields: [String],
            excludedFields: [String],
          },
        ],
        dateRange: {
          startDate: Date,
          endDate: Date,
          allTime: Boolean,
        },
        filters: {
          conversationStatus: [String],
          agentTypes: [String],
          categories: [String],
          tags: [String],
          customFilters: {
            type: Map,
            of: String,
          },
        },
      },

      // Export format and options
      format: {
        type: {
          type: String,
          enum: ['json', 'csv', 'xlsx', 'xml', 'pdf', 'html', 'zip', 'custom'],
          required: true,
        },
        compression: {
          enabled: Boolean,
          algorithm: String, // 'gzip', 'zip', 'bzip2'
          level: Number, // compression level 1-9
        },
        encryption: {
          enabled: Boolean,
          algorithm: String, // 'AES-256', 'RSA'
          keyId: String,
          passwordProtected: Boolean,
        },
        structure: {
          nested: Boolean, // nested JSON vs flat structure
          includeMetadata: Boolean,
          includeSchema: Boolean,
          dateFormat: String,
          nullHandling: String, // 'include', 'exclude', 'empty_string'
        },
      },

      // Output configuration
      output: {
        destination: {
          type: String,
          enum: ['download', 'email', 's3', 'ftp', 'api_response', 'webhook'],
          required: true,
        },
        filename: String,
        splitFiles: {
          enabled: Boolean,
          maxSize: Number, // bytes
          maxRecords: Number,
        },
        deliveryMethod: {
          email: {
            recipients: [String],
            subject: String,
            body: String,
            attachmentLimit: Number, // MB
          },
          webhook: {
            url: String,
            method: String,
            headers: {
              type: Map,
              of: String,
            },
            authentication: {
              type: String,
              credentials: String, // encrypted
            },
          },
          storage: {
            provider: String, // 'aws_s3', 'google_cloud', 'azure'
            bucket: String,
            path: String,
            accessLevel: String,
            expirationDate: Date,
          },
        },
      },
    },

    // Export Processing
    processing: {
      status: {
        type: String,
        enum: [
          'queued',
          'processing',
          'extracting',
          'formatting',
          'compressing',
          'encrypting',
          'uploading',
          'completed',
          'failed',
          'cancelled',
          'expired',
        ],
        required: true,
        default: 'queued',
        index: true,
      },

      // Processing timeline
      timeline: {
        queuedAt: {
          type: Date,
          default: Date.now,
        },
        startedAt: Date,
        completedAt: Date,
        cancelledAt: Date,
        expiredAt: Date,
      },

      // Processing steps
      steps: [
        {
          stepName: String,
          status: String, // 'pending', 'running', 'completed', 'failed'
          startTime: Date,
          endTime: Date,
          duration: Number, // milliseconds
          recordsProcessed: Number,
          progress: Number, // percentage
          errorDetails: String,
          retryCount: Number,
          metadata: {
            type: Map,
            of: String,
          },
        },
      ],

      // Progress tracking
      progress: {
        percentage: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        recordsProcessed: {
          type: Number,
          default: 0,
        },
        totalRecords: {
          type: Number,
          default: 0,
        },
        currentStep: String,
        estimatedCompletion: Date,
        averageSpeed: Number, // records per second
        remainingTime: Number, // seconds
      },

      // Resource usage
      resources: {
        cpuUsage: Number, // percentage
        memoryUsage: Number, // MB
        diskUsage: Number, // MB
        networkBandwidth: Number, // Mbps
        processingServer: String,
        workerThreads: Number,
      },
    },

    // Export Results
    results: {
      // Success metrics
      success: {
        totalRecords: {
          type: Number,
          default: 0,
        },
        recordsByType: [
          {
            type: String,
            count: Number,
            sizeBytes: Number,
          },
        ],
        totalSize: {
          type: Number, // bytes
          default: 0,
        },
        compressionRatio: Number,

        // File information
        files: [
          {
            filename: String,
            sizeBytes: Number,
            recordCount: Number,
            checksum: String,
            downloadUrl: String,
            expirationDate: Date,
            downloadCount: Number,
            lastDownloaded: Date,
          },
        ],
      },

      // Quality metrics
      quality: {
        dataIntegrity: {
          checksumVerified: Boolean,
          missingRecords: Number,
          corruptedRecords: Number,
          duplicateRecords: Number,
        },
        completeness: {
          percentage: Number,
          missingFields: [String],
          partialRecords: Number,
        },
        accuracy: {
          validationErrors: Number,
          dataTypeErrors: Number,
          formatErrors: Number,
          constraintViolations: Number,
        },
      },

      // Performance metrics
      performance: {
        totalDuration: Number, // milliseconds
        extractionTime: Number,
        processingTime: Number,
        compressionTime: Number,
        uploadTime: Number,
        averageSpeed: Number, // records/second
        peakMemoryUsage: Number, // MB
        ioOperations: Number,
      },
    },

    // Error Handling
    errors: {
      hasErrors: {
        type: Boolean,
        default: false,
      },
      errorCount: {
        type: Number,
        default: 0,
      },

      // Error details
      errorDetails: [
        {
          errorId: String,
          errorType: String, // 'validation', 'processing', 'format', 'system', 'network'
          severity: String, // 'low', 'medium', 'high', 'critical'
          message: String,
          details: String,
          stackTrace: String,
          timestamp: Date,
          affectedRecords: Number,
          context: {
            step: String,
            recordId: String,
            fieldName: String,
            value: String,
          },
          resolution: {
            action: String, // 'retry', 'skip', 'manual_fix', 'abort'
            attempts: Number,
            resolved: Boolean,
            resolvedAt: Date,
          },
        },
      ],

      // Warning details
      warnings: [
        {
          warningId: String,
          warningType: String,
          message: String,
          timestamp: Date,
          affectedRecords: Number,
          impact: String, // 'none', 'minor', 'moderate', 'significant'
        },
      ],

      // Recovery information
      recovery: {
        recoverable: Boolean,
        recoveryAttempts: Number,
        lastRecoveryAttempt: Date,
        recoveryStrategy: String,
        partialRecovery: Boolean,
        recoveredRecords: Number,
      },
    },

    // Security and Compliance
    security: {
      // Access control
      access: {
        requestedBy: {
          userId: mongoose.Schema.Types.ObjectId,
          userEmail: String,
          userRole: String,
          ipAddress: String,
          userAgent: String,
        },
        authorizedBy: {
          userId: mongoose.Schema.Types.ObjectId,
          userEmail: String,
          userRole: String,
          authorizationDate: Date,
          authorizationReason: String,
        },
        accessLevel: String, // 'self', 'admin', 'system', 'compliance'
      },

      // Data protection
      dataProtection: {
        containsSensitiveData: Boolean,
        dataClassification: String, // 'public', 'internal', 'confidential', 'restricted'
        piiIncluded: Boolean,
        piiFields: [String],
        anonymizationApplied: Boolean,
        anonymizationMethod: String,
        encryptionApplied: Boolean,
        encryptionStrength: String,
      },

      // Compliance tracking
      compliance: {
        purpose: String, // 'user_request', 'legal_requirement', 'audit', 'backup'
        legalBasis: String, // 'consent', 'legitimate_interest', 'legal_obligation'
        retentionPeriod: Number, // days
        deletionDate: Date,
        complianceFrameworks: [String], // 'GDPR', 'CCPA', 'HIPAA', 'SOX'
        auditTrail: Boolean,
        rightToPortability: Boolean, // GDPR Article 20
        dataSubjectRights: [String], // 'access', 'rectification', 'erasure', 'portability'
      },
    },

    // Audit and Tracking
    audit: {
      // Activity log
      activities: [
        {
          activity: String,
          timestamp: Date,
          performedBy: {
            userId: mongoose.Schema.Types.ObjectId,
            userEmail: String,
            system: String,
          },
          details: String,
          ipAddress: String,
          userAgent: String,
          result: String, // 'success', 'failure', 'partial'
        },
      ],

      // Access log
      accessLog: [
        {
          accessType: String, // 'view', 'download', 'modify', 'delete'
          timestamp: Date,
          userId: mongoose.Schema.Types.ObjectId,
          ipAddress: String,
          userAgent: String,
          successful: Boolean,
          fileAccessed: String,
          downloadSize: Number,
        },
      ],

      // Compliance audit
      complianceAudit: {
        auditRequired: Boolean,
        auditDate: Date,
        auditor: String,
        auditResult: String, // 'compliant', 'non_compliant', 'needs_review'
        findings: [String],
        recommendations: [String],
        followUpRequired: Boolean,
        followUpDate: Date,
      },
    },

    // Notification and Communication
    notifications: {
      // Notification settings
      settings: {
        notifyOnCompletion: Boolean,
        notifyOnFailure: Boolean,
        notifyOnExpiration: Boolean,
        notificationMethods: [String], // 'email', 'sms', 'push', 'webhook'
        recipients: [String],
      },

      // Notifications sent
      sent: [
        {
          notificationId: String,
          type: String, // 'started', 'progress', 'completed', 'failed', 'expired'
          method: String,
          recipient: String,
          sentAt: Date,
          status: String, // 'sent', 'delivered', 'failed', 'bounced'
          content: String,
          deliveryConfirmation: Date,
        },
      ],

      // Communication log
      communications: [
        {
          type: String, // 'user_inquiry', 'support_response', 'status_update'
          direction: String, // 'inbound', 'outbound'
          timestamp: Date,
          fromUser: mongoose.Schema.Types.ObjectId,
          toUser: mongoose.Schema.Types.ObjectId,
          subject: String,
          message: String,
          attachments: [String],
          resolved: Boolean,
        },
      ],
    },

    // Analytics and Insights
    analytics: {
      // Usage analytics
      usage: {
        downloadCount: {
          type: Number,
          default: 0,
        },
        uniqueDownloaders: {
          type: Number,
          default: 0,
        },
        totalDownloadSize: {
          type: Number, // bytes
          default: 0,
        },
        averageDownloadTime: Number, // seconds
        peakDownloadTime: Date,
        downloadsByRegion: [
          {
            region: String,
            count: Number,
          },
        ],
      },

      // Performance analytics
      performanceMetrics: {
        processingEfficiency: Number, // records per second
        resourceUtilization: Number, // percentage
        errorRate: Number, // percentage
        retryRate: Number, // percentage
        userSatisfactionScore: Number, // 1-10
        timeToCompletion: Number, // seconds
        costEstimate: Number, // dollars
      },

      // Business impact
      businessImpact: {
        complianceValue: String, // regulatory compliance benefit
        operationalEfficiency: Number, // time saved in hours
        riskMitigation: String, // security/compliance risk reduced
        userSatisfaction: Number, // impact on user experience
        costSavings: Number, // estimated cost savings
      },
    },

    // Scheduling and Automation
    scheduling: {
      // Scheduled export information
      isScheduled: {
        type: Boolean,
        default: false,
      },
      scheduleId: String,
      scheduleType: String, // 'one_time', 'recurring', 'event_driven'

      // Recurring schedule details
      recurring: {
        frequency: String, // 'daily', 'weekly', 'monthly', 'quarterly'
        interval: Number, // every N periods
        daysOfWeek: [Number], // for weekly schedules
        dayOfMonth: Number, // for monthly schedules
        time: String, // HH:MM format
        timezone: String,
        nextRun: Date,
        lastRun: Date,
        runCount: Number,
      },

      // Event-driven triggers
      triggers: [
        {
          triggerType: String, // 'data_threshold', 'date_reached', 'user_action'
          condition: String,
          value: String,
          lastTriggered: Date,
          triggerCount: Number,
        },
      ],
    },

    // Integration and API
    integration: {
      // API integration details
      api: {
        apiVersion: String,
        endpoint: String,
        method: String,
        requestHeaders: {
          type: Map,
          of: String,
        },
        responseFormat: String,
        callbackUrl: String,
        timeout: Number, // seconds
        retryPolicy: {
          maxRetries: Number,
          backoffStrategy: String, // 'linear', 'exponential'
          retryDelay: Number, // seconds
        },
      },

      // Third-party integrations
      thirdParty: [
        {
          provider: String, // 'aws', 'google', 'microsoft', 'dropbox'
          service: String,
          apiKey: String, // encrypted
          configuration: {
            type: Map,
            of: String,
          },
          lastSync: Date,
          syncStatus: String,
          errorCount: Number,
        },
      ],

      // Webhook integration
      webhooks: [
        {
          url: String,
          events: [String], // events that trigger webhook
          headers: {
            type: Map,
            of: String,
          },
          authentication: String, // encrypted
          lastTriggered: Date,
          successCount: Number,
          errorCount: Number,
          status: String, // 'active', 'inactive', 'failed'
        },
      ],
    },

    // Metadata and Context
    metadata: {
      version: {
        type: String,
        default: '1.0',
      },
      exporterVersion: String,
      systemVersion: String,

      // Export context
      context: {
        reason: String, // why export was requested
        urgency: String,
        businessJustification: String,
        expectedUse: String,
        stakeholders: [String],
      },

      // Custom fields
      customFields: {
        type: Map,
        of: String,
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
    collection: 'exportlogs',
  }
);

// Compound indexes for performance
exportLogsSchema.index({ userId: 1, 'processing.timeline.queuedAt': -1 });
exportLogsSchema.index({
  'exportRequest.requestType': 1,
  'processing.status': 1,
});
exportLogsSchema.index({
  'processing.status': 1,
  'exportRequest.priority': -1,
});
exportLogsSchema.index({
  userId: 1,
  'exportRequest.requestType': 1,
  createdAt: -1,
});

// Single field indexes
exportLogsSchema.index({ 'exportRequest.requestId': 1 }, { unique: true });
exportLogsSchema.index({ userId: 1 });
exportLogsSchema.index({ 'processing.status': 1 });
exportLogsSchema.index({ 'exportRequest.requestType': 1 });
exportLogsSchema.index({ 'exportRequest.priority': 1 });
exportLogsSchema.index({ 'processing.timeline.queuedAt': -1 });

// TTL index for completed exports (configurable retention)
exportLogsSchema.index(
  { 'results.files.expirationDate': 1 },
  {
    expireAfterSeconds: 0, // expires based on expirationDate field
  }
);

// Static method to get export logs for user
exportLogsSchema.statics.getLogsForUser = async function (
  userId,
  options = {}
) {
  const {
    requestType,
    status,
    startDate,
    endDate,
    limit = 50,
    skip = 0,
  } = options;

  const query = { userId };

  if (requestType) query['exportRequest.requestType'] = requestType;
  if (status) query['processing.status'] = status;
  if (startDate || endDate) {
    query['processing.timeline.queuedAt'] = {};
    if (startDate) query['processing.timeline.queuedAt'].$gte = startDate;
    if (endDate) query['processing.timeline.queuedAt'].$lte = endDate;
  }

  return this.find(query)
    .sort({ 'processing.timeline.queuedAt': -1 })
    .limit(limit)
    .skip(skip)
    .select(
      '-security.dataProtection -integration.thirdParty.apiKey -integration.webhooks.authentication'
    );
};

// Static method to get pending exports
exportLogsSchema.statics.getPendingExports = async function (priority = null) {
  const query = {
    'processing.status': { $in: ['queued', 'processing'] },
  };

  if (priority) {
    query['exportRequest.priority'] = priority;
  }

  return this.find(query)
    .sort({ 'exportRequest.priority': -1, 'processing.timeline.queuedAt': 1 })
    .populate('userId', 'email name');
};

// Static method to get export statistics
exportLogsSchema.statics.getExportStats = async function (timeframe = 'month') {
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
        'processing.timeline.queuedAt': { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalExports: { $sum: 1 },
        completedExports: {
          $sum: { $cond: [{ $eq: ['$processing.status', 'completed'] }, 1, 0] },
        },
        failedExports: {
          $sum: { $cond: [{ $eq: ['$processing.status', 'failed'] }, 1, 0] },
        },
        averageProcessingTime: { $avg: '$results.performance.totalDuration' },
        totalDataExported: { $sum: '$results.success.totalSize' },
        totalRecordsExported: { $sum: '$results.success.totalRecords' },
      },
    },
    {
      $addFields: {
        successRate: {
          $cond: [
            { $gt: ['$totalExports', 0] },
            {
              $multiply: [
                { $divide: ['$completedExports', '$totalExports'] },
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

// Method to update processing status
exportLogsSchema.methods.updateStatus = function (newStatus, details = {}) {
  this.processing.status = newStatus;

  const now = new Date();

  switch (newStatus) {
    case 'processing':
      this.processing.timeline.startedAt = now;
      break;
    case 'completed':
      this.processing.timeline.completedAt = now;
      this.processing.progress.percentage = 100;
      break;
    case 'failed':
    case 'cancelled':
      this.processing.timeline.cancelledAt = now;
      break;
  }

  // Add processing step
  if (details.stepName) {
    this.processing.steps.push({
      stepName: details.stepName,
      status: newStatus,
      startTime: now,
      endTime: newStatus === 'completed' ? now : null,
      recordsProcessed: details.recordsProcessed || 0,
      progress: details.progress || 0,
      errorDetails: details.errorDetails,
      metadata: details.metadata || {},
    });
  }

  return this.save();
};

// Method to add error
exportLogsSchema.methods.addError = function (errorDetails) {
  this.errors.hasErrors = true;
  this.errors.errorCount += 1;

  const error = {
    errorId: new mongoose.Types.ObjectId().toString(),
    errorType: errorDetails.type || 'system',
    severity: errorDetails.severity || 'medium',
    message: errorDetails.message,
    details: errorDetails.details,
    timestamp: new Date(),
    affectedRecords: errorDetails.affectedRecords || 0,
    context: errorDetails.context || {},
  };

  this.errors.errorDetails.push(error);
  return error;
};

// Method to calculate processing efficiency
exportLogsSchema.methods.calculateEfficiency = function () {
  if (
    !this.results.performance.totalDuration ||
    !this.results.success.totalRecords
  ) {
    return 0;
  }

  const recordsPerSecond =
    this.results.success.totalRecords /
    (this.results.performance.totalDuration / 1000);

  this.analytics.performanceMetrics.processingEfficiency = recordsPerSecond;
  return recordsPerSecond;
};

// Method to generate download URL
exportLogsSchema.methods.generateDownloadUrl = function (fileIndex = 0) {
  if (!this.results.success.files || this.results.success.files.length === 0) {
    return null;
  }

  const file = this.results.success.files[fileIndex];
  if (!file) return null;

  // In a real implementation, this would generate a signed URL
  const baseUrl =
    process.env.EXPORT_DOWNLOAD_BASE_URL || 'https://api.example.com/exports';
  const signedUrl = `${baseUrl}/${this.exportRequest.requestId}/${file.filename}`;

  // Update download tracking
  file.downloadCount = (file.downloadCount || 0) + 1;
  file.lastDownloaded = new Date();

  return signedUrl;
};

// Method to check if export is expired
exportLogsSchema.methods.isExpired = function () {
  if (this.processing.status === 'expired') return true;

  const now = new Date();
  return (
    this.results.success.files?.some(
      (file) => file.expirationDate && file.expirationDate < now
    ) || false
  );
};

// Virtual for processing duration
exportLogsSchema.virtual('processingDuration').get(function () {
  if (!this.processing.timeline.startedAt) return null;

  const endTime =
    this.processing.timeline.completedAt ||
    this.processing.timeline.cancelledAt ||
    new Date();

  return endTime - this.processing.timeline.startedAt;
});

// Virtual for estimated completion
exportLogsSchema.virtual('estimatedCompletion').get(function () {
  if (
    this.processing.status === 'completed' ||
    this.processing.status === 'failed'
  ) {
    return null;
  }

  if (
    !this.processing.progress.averageSpeed ||
    this.processing.progress.averageSpeed === 0
  ) {
    return null;
  }

  const remainingRecords =
    this.processing.progress.totalRecords -
    this.processing.progress.recordsProcessed;
  const remainingSeconds =
    remainingRecords / this.processing.progress.averageSpeed;

  return new Date(Date.now() + remainingSeconds * 1000);
});

// Virtual for success rate
exportLogsSchema.virtual('successRate').get(function () {
  if (
    !this.results.success.totalRecords ||
    this.results.success.totalRecords === 0
  ) {
    return 0;
  }

  const erroredRecords = this.errors.errorDetails.reduce(
    (sum, error) => sum + (error.affectedRecords || 0),
    0
  );

  const successfulRecords = this.results.success.totalRecords - erroredRecords;
  return (successfulRecords / this.results.success.totalRecords) * 100;
});

export default mongoose.model('ExportLogs', exportLogsSchema);
