/**
 * Community Moderation Model
 * Content moderation and community safety management system
 */

import mongoose from 'mongoose'

const communityModerationSchema = new mongoose.Schema({
  // Target Information
  targetType: {
    type: String,
    required: true,
    enum: ['post', 'comment', 'user', 'event', 'message', 'media'],
    index: true
  },
  
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  communityGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityGroup',
    required: true,
    index: true
  },
  
  // Moderation Action
  action: {
    type: String,
    required: true,
    enum: [
      'flag', 'warn', 'hide', 'remove', 'edit', 'approve', 'reject',
      'mute', 'suspend', 'ban', 'escalate', 'resolve', 'dismiss'
    ],
    index: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'in_review', 'resolved', 'escalated', 'dismissed'],
    default: 'pending',
    index: true
  },
  
  // Moderation Details
  reason: {
    category: {
      type: String,
      required: true,
      enum: [
        'spam', 'harassment', 'hate_speech', 'violence', 'adult_content',
        'copyright', 'misinformation', 'off_topic', 'low_quality',
        'duplicate', 'self_promotion', 'doxxing', 'impersonation',
        'fraud', 'malware', 'other'
      ],
      index: true
    },
    
    subcategory: String,
    
    description: {
      type: String,
      required: true,
      maxlength: 1000
    },
    
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true
    }
  },
  
  // Reporter Information
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  reportedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Anonymous reporting
  anonymous: {
    type: Boolean,
    default: false
  },
  
  // Automated Detection
  automated: {
    detected: { type: Boolean, default: false },
    confidence: { type: Number, min: 0, max: 1 }, // AI confidence score
    model: String, // Which AI model detected this
    modelVersion: String,
    flags: [String], // Specific flags from automated system
    
    // Content analysis results
    toxicity: { type: Number, min: 0, max: 1 },
    spam: { type: Number, min: 0, max: 1 },
    profanity: { type: Number, min: 0, max: 1 },
    sentiment: { type: Number, min: -1, max: 1 }
  },
  
  // Content Snapshot
  content: {
    // Original content at time of reporting
    original: {
      text: String,
      media: [String], // URLs to media files
      metadata: mongoose.Schema.Types.Mixed
    },
    
    // Current content (may have been edited)
    current: {
      text: String,
      media: [String],
      metadata: mongoose.Schema.Types.Mixed
    },
    
    // Evidence attachments
    evidence: [{
      type: { type: String, enum: ['screenshot', 'recording', 'document', 'link'] },
      url: String,
      filename: String,
      description: String,
      uploadedBy: mongoose.Schema.Types.ObjectId,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  
  // Review Process
  review: {
    // Assignment
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    assignedAt: Date,
    
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Review timeline
    reviewStartedAt: Date,
    reviewCompletedAt: Date,
    
    // Reviewer notes
    reviewerNotes: [{
      note: String,
      addedBy: mongoose.Schema.Types.ObjectId,
      addedAt: { type: Date, default: Date.now },
      private: { type: Boolean, default: true }
    }],
    
    // Decision
    decision: {
      action: {
        type: String,
        enum: ['no_action', 'warn', 'hide', 'remove', 'edit', 'suspend_user', 'ban_user']
      },
      reason: String,
      decisionMadeBy: mongoose.Schema.Types.ObjectId,
      decisionMadeAt: Date,
      
      // Action details
      duration: Number, // For suspensions/bans (milliseconds)
      editedContent: String, // If content was edited
      publicReason: String // Reason visible to users
    },
    
    // Quality assurance
    reviewedBy: [{
      reviewer: mongoose.Schema.Types.ObjectId,
      reviewedAt: Date,
      approved: Boolean,
      notes: String
    }]
  },
  
  // Escalation
  escalation: {
    escalated: { type: Boolean, default: false },
    escalatedAt: Date,
    escalatedBy: mongoose.Schema.Types.ObjectId,
    escalationReason: String,
    
    // Escalation level
    level: {
      type: String,
      enum: ['moderator', 'admin', 'owner', 'platform'],
      default: 'moderator'
    },
    
    // External escalation
    external: {
      reported: { type: Boolean, default: false },
      reportedTo: String, // Law enforcement, platform, etc.
      reportedAt: Date,
      referenceNumber: String
    }
  },
  
  // Follow-up Actions
  followUp: {
    // User communication
    userNotified: { type: Boolean, default: false },
    notificationSent: Date,
    notificationMethod: String, // email, in-app, etc.
    
    // Reporter feedback
    reporterNotified: { type: Boolean, default: false },
    reporterFeedback: {
      satisfied: Boolean,
      comment: String,
      submittedAt: Date
    },
    
    // Appeal process
    appeal: {
      submitted: { type: Boolean, default: false },
      submittedAt: Date,
      reason: String,
      evidence: [String], // Additional evidence URLs
      
      reviewed: { type: Boolean, default: false },
      reviewedBy: mongoose.Schema.Types.ObjectId,
      reviewedAt: Date,
      
      decision: {
        type: String,
        enum: ['upheld', 'overturned', 'modified']
      },
      decisionReason: String
    }
  },
  
  // Related Cases
  related: {
    // Similar cases
    similarCases: [mongoose.Schema.Types.ObjectId],
    
    // Pattern detection
    partOfPattern: { type: Boolean, default: false },
    patternType: String, // coordinated_harassment, spam_wave, etc.
    patternId: String,
    
    // Duplicate reports
    duplicateOf: mongoose.Schema.Types.ObjectId,
    duplicates: [mongoose.Schema.Types.ObjectId]
  },
  
  // Impact Assessment
  impact: {
    // Community impact
    severity: {
      type: String,
      enum: ['negligible', 'minor', 'moderate', 'major', 'severe'],
      default: 'minor'
    },
    
    // Affected users
    affectedUsers: [mongoose.Schema.Types.ObjectId],
    estimatedReach: Number, // Number of users who saw content
    
    // Community health metrics
    beforeMetrics: {
      memberSatisfaction: Number,
      activityLevel: Number,
      reportRate: Number
    },
    
    afterMetrics: {
      memberSatisfaction: Number,
      activityLevel: Number,
      reportRate: Number
    }
  },
  
  // Automation and ML
  automation: {
    // Auto-actions taken
    autoActions: [{
      action: String,
      timestamp: Date,
      confidence: Number,
      overridden: { type: Boolean, default: false },
      overriddenBy: mongoose.Schema.Types.ObjectId,
      overriddenAt: Date
    }],
    
    // Learning feedback
    humanFeedback: {
      correct: Boolean, // Was automated decision correct?
      feedback: String,
      providedBy: mongoose.Schema.Types.ObjectId,
      providedAt: Date
    },
    
    // Model updates
    usedForTraining: { type: Boolean, default: false },
    modelUpdated: { type: Boolean, default: false }
  },
  
  // Analytics and Metrics
  metrics: {
    // Response times
    reportToAssignment: Number, // milliseconds
    assignmentToReview: Number,
    reviewToDecision: Number,
    totalResolutionTime: Number,
    
    // Accuracy metrics
    reportAccuracy: Number, // Was report valid?
    decisionAccuracy: Number, // Was decision correct?
    
    // Efficiency metrics
    reviewerEfficiency: Number,
    automationSavings: Number // Time saved by automation
  },
  
  // Tags and Classification
  tags: [{
    tag: String,
    addedBy: mongoose.Schema.Types.ObjectId,
    addedAt: { type: Date, default: Date.now },
    category: { type: String, enum: ['system', 'moderator', 'custom'] }
  }],
  
  // Priority and Urgency
  priority: {
    level: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent', 'critical'],
      default: 'normal',
      index: true
    },
    
    // Auto-calculated priority factors
    factors: {
      severityScore: Number,
      reporterReputation: Number,
      targetUserHistory: Number,
      communityImpact: Number,
      timesSensitive: Boolean
    },
    
    // Manual priority override
    manualOverride: {
      enabled: { type: Boolean, default: false },
      level: String,
      reason: String,
      setBy: mongoose.Schema.Types.ObjectId,
      setAt: Date
    }
  },
  
  // Communication Log
  communications: [{
    type: { type: String, enum: ['internal', 'user', 'reporter', 'external'] },
    method: { type: String, enum: ['email', 'in_app', 'sms', 'phone', 'chat'] },
    recipient: mongoose.Schema.Types.ObjectId,
    subject: String,
    message: String,
    sentBy: mongoose.Schema.Types.ObjectId,
    sentAt: { type: Date, default: Date.now },
    
    // Delivery status
    delivered: Boolean,
    opened: Boolean,
    responded: Boolean,
    responseAt: Date
  }],
  
  // Metadata
  metadata: {
    // Source tracking
    source: {
      type: String,
      enum: ['user_report', 'automated', 'moderator_review', 'external', 'pattern_detection'],
      default: 'user_report'
    },
    
    // Processing information
    processingTime: Number, // Total milliseconds to resolve
    complexity: {
      type: String,
      enum: ['simple', 'moderate', 'complex', 'very_complex'],
      default: 'simple'
    },
    
    // Quality metrics
    qualityScore: { type: Number, min: 0, max: 100 },
    
    // Custom fields
    customFields: [{
      key: String,
      value: mongoose.Schema.Types.Mixed,
      type: { type: String, enum: ['string', 'number', 'boolean', 'date'] }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound indexes for performance
communityModerationSchema.index({ communityGroup: 1, status: 1 })
communityModerationSchema.index({ targetType: 1, targetId: 1 })
communityModerationSchema.index({ reportedBy: 1, reportedAt: -1 })
communityModerationSchema.index({ 'review.assignedTo': 1, status: 1 })
communityModerationSchema.index({ 'reason.category': 1, 'reason.severity': 1 })
communityModerationSchema.index({ 'priority.level': 1, reportedAt: 1 })
communityModerationSchema.index({ 'automated.detected': 1, 'automated.confidence': -1 })

// Text search index
communityModerationSchema.index({
  'reason.description': 'text',
  'content.original.text': 'text',
  'review.reviewerNotes.note': 'text'
})

// Virtual for time to resolution
communityModerationSchema.virtual('resolutionTime').get(function() {
  if (!this.review.reviewCompletedAt) return null
  return this.review.reviewCompletedAt - this.reportedAt
})

// Virtual for priority score (calculated)
communityModerationSchema.virtual('priorityScore').get(function() {
  let score = 0
  
  // Base severity scoring
  const severityMap = { low: 1, medium: 3, high: 7, critical: 10 }
  score += severityMap[this.reason.severity] || 1
  
  // Automated detection confidence boost
  if (this.automated.detected && this.automated.confidence > 0.8) {
    score += 2
  }
  
  // Time factor (older reports get higher priority)
  const hoursOld = (new Date() - this.reportedAt) / (1000 * 60 * 60)
  if (hoursOld > 24) score += 2
  if (hoursOld > 72) score += 3
  
  return Math.min(10, score)
})

// Virtual for case complexity assessment
communityModerationSchema.virtual('complexityAssessment').get(function() {
  let factors = 0
  
  if (this.escalation.escalated) factors++
  if (this.related.partOfPattern) factors++
  if (this.followUp.appeal.submitted) factors++
  if (this.evidence?.length > 2) factors++
  if (this.related.similarCases?.length > 3) factors++
  
  if (factors >= 3) return 'very_complex'
  if (factors >= 2) return 'complex'
  if (factors >= 1) return 'moderate'
  return 'simple'
})

// Static methods
communityModerationSchema.statics.findPending = function(groupId, assigneeId = null) {
  const query = {
    communityGroup: groupId,
    status: { $in: ['pending', 'in_review'] }
  }
  
  if (assigneeId) {
    query['review.assignedTo'] = assigneeId
  }
  
  return this.find(query)
    .populate('reportedBy', 'name email avatar')
    .populate('review.assignedTo', 'name avatar')
    .sort({ 'priority.level': -1, reportedAt: 1 })
}

communityModerationSchema.statics.findByModerator = function(moderatorId) {
  return this.find({ 'review.assignedTo': moderatorId })
    .populate('communityGroup', 'name slug')
    .sort({ status: 1, reportedAt: -1 })
}

communityModerationSchema.statics.getGroupStats = function(groupId, timeframe = 30) {
  const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000)
  
  return this.aggregate([
    {
      $match: {
        communityGroup: mongoose.Types.ObjectId(groupId),
        reportedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgResolutionTime: { $avg: '$metrics.totalResolutionTime' },
        severityBreakdown: {
          $push: '$reason.severity'
        }
      }
    }
  ])
}

communityModerationSchema.statics.getAutomationStats = function(timeframe = 30) {
  const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000)
  
  return this.aggregate([
    {
      $match: {
        reportedAt: { $gte: startDate },
        'automated.detected': true
      }
    },
    {
      $group: {
        _id: null,
        totalAutomated: { $sum: 1 },
        avgConfidence: { $avg: '$automated.confidence' },
        correctPredictions: {
          $sum: {
            $cond: ['$automation.humanFeedback.correct', 1, 0]
          }
        },
        totalFeedback: {
          $sum: {
            $cond: [{ $ne: ['$automation.humanFeedback.correct', null] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        totalAutomated: 1,
        avgConfidence: 1,
        accuracy: {
          $cond: [
            { $gt: ['$totalFeedback', 0] },
            { $divide: ['$correctPredictions', '$totalFeedback'] },
            null
          ]
        }
      }
    }
  ])
}

// Instance methods
communityModerationSchema.methods.assign = function(moderatorId, assignedBy) {
  this.review.assignedTo = moderatorId
  this.review.assignedAt = new Date()
  this.review.assignedBy = assignedBy
  this.status = 'in_review'
  
  // Calculate assignment time metric
  this.metrics.reportToAssignment = new Date() - this.reportedAt
  
  return this.save()
}

communityModerationSchema.methods.startReview = function() {
  this.review.reviewStartedAt = new Date()
  
  // Calculate review start time metric
  if (this.review.assignedAt) {
    this.metrics.assignmentToReview = new Date() - this.review.assignedAt
  }
  
  return this.save()
}

communityModerationSchema.methods.addReviewerNote = function(note, addedBy, isPrivate = true) {
  this.review.reviewerNotes.push({
    note,
    addedBy,
    private: isPrivate
  })
  
  return this.save()
}

communityModerationSchema.methods.makeDecision = function(decision, decisionMadeBy) {
  this.review.decision = {
    ...decision,
    decisionMadeBy,
    decisionMadeAt: new Date()
  }
  
  this.review.reviewCompletedAt = new Date()
  this.status = 'resolved'
  
  // Calculate decision time metric
  if (this.review.reviewStartedAt) {
    this.metrics.reviewToDecision = new Date() - this.review.reviewStartedAt
  }
  
  // Calculate total resolution time
  this.metrics.totalResolutionTime = new Date() - this.reportedAt
  
  return this.save()
}

communityModerationSchema.methods.escalate = function(escalatedBy, reason, level = 'admin') {
  this.escalation.escalated = true
  this.escalation.escalatedAt = new Date()
  this.escalation.escalatedBy = escalatedBy
  this.escalation.escalationReason = reason
  this.escalation.level = level
  this.status = 'escalated'
  
  return this.save()
}

communityModerationSchema.methods.submitAppeal = function(reason, evidence = []) {
  this.followUp.appeal = {
    submitted: true,
    submittedAt: new Date(),
    reason,
    evidence
  }
  
  this.status = 'in_review' // Reopen for review
  
  return this.save()
}

communityModerationSchema.methods.reviewAppeal = function(reviewedBy, decision, decisionReason) {
  this.followUp.appeal.reviewed = true
  this.followUp.appeal.reviewedBy = reviewedBy
  this.followUp.appeal.reviewedAt = new Date()
  this.followUp.appeal.decision = decision
  this.followUp.appeal.decisionReason = decisionReason
  
  this.status = 'resolved'
  
  return this.save()
}

communityModerationSchema.methods.addEvidence = function(evidence, uploadedBy) {
  this.content.evidence.push({
    ...evidence,
    uploadedBy,
    uploadedAt: new Date()
  })
  
  return this.save()
}

communityModerationSchema.methods.linkSimilarCase = function(caseId) {
  if (!this.related.similarCases.includes(caseId)) {
    this.related.similarCases.push(caseId)
  }
  
  return this.save()
}

communityModerationSchema.methods.markAsPattern = function(patternType, patternId) {
  this.related.partOfPattern = true
  this.related.patternType = patternType
  this.related.patternId = patternId
  
  // Increase priority for pattern cases
  if (this.priority.level === 'normal' || this.priority.level === 'low') {
    this.priority.level = 'high'
    this.priority.manualOverride = {
      enabled: true,
      level: 'high',
      reason: `Part of ${patternType} pattern`,
      setAt: new Date()
    }
  }
  
  return this.save()
}

communityModerationSchema.methods.provideFeedback = function(correct, feedback, providedBy) {
  this.automation.humanFeedback = {
    correct,
    feedback,
    providedBy,
    providedAt: new Date()
  }
  
  return this.save()
}

communityModerationSchema.methods.sendCommunication = function(type, method, recipient, subject, message, sentBy) {
  this.communications.push({
    type,
    method,
    recipient,
    subject,
    message,
    sentBy
  })
  
  // Mark appropriate notification flags
  if (type === 'user') {
    this.followUp.userNotified = true
    this.followUp.notificationSent = new Date()
    this.followUp.notificationMethod = method
  } else if (type === 'reporter') {
    this.followUp.reporterNotified = true
  }
  
  return this.save()
}

// Pre-save middleware
communityModerationSchema.pre('save', function(next) {
  // Auto-calculate priority based on factors
  if (!this.priority.manualOverride.enabled) {
    const score = this.priorityScore
    
    if (score >= 8) this.priority.level = 'critical'
    else if (score >= 6) this.priority.level = 'urgent'
    else if (score >= 4) this.priority.level = 'high'
    else if (score >= 2) this.priority.level = 'normal'
    else this.priority.level = 'low'
  }
  
  // Set complexity assessment
  this.metadata.complexity = this.complexityAssessment
  
  // Update quality score based on resolution metrics
  if (this.status === 'resolved' && this.metrics.totalResolutionTime) {
    let qualityScore = 50
    
    // Faster resolution = higher quality (up to 48 hours)
    const hoursToResolve = this.metrics.totalResolutionTime / (1000 * 60 * 60)
    if (hoursToResolve <= 1) qualityScore += 30
    else if (hoursToResolve <= 6) qualityScore += 20
    else if (hoursToResolve <= 24) qualityScore += 10
    else if (hoursToResolve > 72) qualityScore -= 20
    
    // Appeal results affect quality
    if (this.followUp.appeal.decision === 'overturned') qualityScore -= 30
    else if (this.followUp.appeal.decision === 'upheld') qualityScore += 10
    
    // Automation accuracy affects quality
    if (this.automation.humanFeedback.correct === true) qualityScore += 10
    else if (this.automation.humanFeedback.correct === false) qualityScore -= 20
    
    this.metadata.qualityScore = Math.max(0, Math.min(100, qualityScore))
  }
  
  next()
})

export default mongoose.model('CommunityModeration', communityModerationSchema)