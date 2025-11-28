/**
 * Audit Log Model
 * Security and compliance auditing for all system activities
 */

import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema({
  // Event Identity
  id: {
    type: String,
    unique: true,
    required: true,
    default: () => `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  // Event Classification
  eventType: {
    type: String,
    required: true,
    enum: [
      'auth_login', 'auth_logout', 'auth_failed', 'auth_password_change',
      'user_create', 'user_update', 'user_delete', 'user_suspend',
      'organization_create', 'organization_update', 'organization_delete',
      'team_create', 'team_update', 'team_delete', 'team_member_add', 'team_member_remove',
      'project_create', 'project_update', 'project_delete', 'project_access',
      'api_call', 'api_error', 'api_rate_limit',
      'payment_success', 'payment_failed', 'payment_refund',
      'file_upload', 'file_download', 'file_delete',
      'admin_action', 'security_alert', 'system_error',
      'data_export', 'data_import', 'data_delete'
    ],
    index: true
  },

  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
    index: true
  },

  // Actor Information
  actor: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    userEmail: String,
    userName: String,
    ipAddress: String,
    userAgent: String,
    sessionId: String
  },

  // Target/Resource Information
  target: {
    resourceType: {
      type: String,
      enum: ['user', 'organization', 'team', 'project', 'file', 'api', 'system', 'payment'],
      index: true
    },
    resourceId: String,
    resourceName: String,
    previousState: mongoose.Schema.Types.Mixed,
    newState: mongoose.Schema.Types.Mixed
  },

  // Event Details
  details: {
    action: String,
    description: String,
    reason: String,
    metadata: mongoose.Schema.Types.Mixed,

    // API specific
    endpoint: String,
    method: String,
    statusCode: Number,
    responseTime: Number,

    // Security specific
    threatLevel: String,
    attackType: String,
    blocked: Boolean,

    // Location data
    location: {
      country: String,
      region: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  },

  // Compliance Information
  compliance: {
    gdpr: {
      dataSubject: String,
      processingPurpose: String,
      legalBasis: String,
      retentionPeriod: Number
    },
    hipaa: {
      protectedHealthInfo: Boolean,
      accessReason: String
    },
    sox: {
      financialImpact: Boolean,
      controlId: String
    }
  },

  // System Context
  context: {
    environment: {
      type: String,
      enum: ['production', 'staging', 'development'],
      default: 'production'
    },
    service: String,
    version: String,
    hostname: String,
    processId: Number
  },

  // Risk Assessment
  risk: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    factors: [String],
    recommendations: [String]
  }

}, {
  timestamps: true
})

// Indexes for efficient querying and compliance
auditLogSchema.index({ 'actor.userId': 1, createdAt: -1 })
auditLogSchema.index({ eventType: 1, createdAt: -1 })
auditLogSchema.index({ severity: 1, createdAt: -1 })
auditLogSchema.index({ 'target.resourceType': 1, 'target.resourceId': 1 })
auditLogSchema.index({ 'actor.ipAddress': 1 })
auditLogSchema.index({ createdAt: -1 })

// Compound indexes for common queries
auditLogSchema.index({ 'actor.userId': 1, eventType: 1, createdAt: -1 })
auditLogSchema.index({ 'target.resourceType': 1, 'target.resourceId': 1, createdAt: -1 })

// TTL index for automatic cleanup (retain logs for 7 years for compliance)
auditLogSchema.index({ createdAt: 1 }, {
  expireAfterSeconds: 7 * 365 * 24 * 60 * 60, // 7 years
  partialFilterExpression: { severity: { $ne: 'critical' } }
})

// Static methods for compliance and analysis
auditLogSchema.statics.getUserActivity = function(userId, eventTypes = null, days = 90) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const query = {
    'actor.userId': userId,
    createdAt: { $gte: startDate }
  }

  if (eventTypes) {
    query.eventType = { $in: eventTypes }
  }

  return this.find(query).sort({ createdAt: -1 })
}

auditLogSchema.statics.getSecurityEvents = function(severity = 'high', days = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return this.find({
    severity: { $in: severity === 'high' ? ['high', 'critical'] : [severity, 'high', 'critical'] },
    createdAt: { $gte: startDate }
  }).sort({ createdAt: -1 })
}

auditLogSchema.statics.getResourceAccess = function(resourceType, resourceId, days = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return this.find({
    'target.resourceType': resourceType,
    'target.resourceId': resourceId,
    createdAt: { $gte: startDate }
  }).sort({ createdAt: -1 })
}

auditLogSchema.statics.getComplianceReport = function(userId, dataSubject = null) {
  const match = { 'actor.userId': userId }
  if (dataSubject) {
    match['compliance.gdpr.dataSubject'] = dataSubject
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        lastActivity: { $max: '$createdAt' },
        purposes: { $addToSet: '$compliance.gdpr.processingPurpose' }
      }
    },
    {
      $project: {
        eventType: '$_id',
        count: 1,
        lastActivity: 1,
        purposes: {
          $filter: {
            input: '$purposes',
            as: 'purpose',
            cond: { $ne: ['$$purpose', null] }
          }
        }
      }
    }
  ])
}

auditLogSchema.statics.detectAnomalies = function(userId, hours = 24) {
  const startDate = new Date()
  startDate.setHours(startDate.getHours() - hours)

  return this.aggregate([
    {
      $match: {
        'actor.userId': userId,
        createdAt: { $gte: startDate },
        eventType: { $in: ['auth_failed', 'api_error', 'security_alert'] }
      }
    },
    {
      $group: {
        _id: {
          eventType: '$eventType',
          hour: { $hour: '$createdAt' }
        },
        count: { $sum: 1 },
        ips: { $addToSet: '$actor.ipAddress' }
      }
    },
    {
      $match: {
        count: { $gt: 5 } // More than 5 events of same type per hour
      }
    },
    {
      $sort: { count: -1 }
    }
  ])
}

// Instance methods
auditLogSchema.methods.isSecurityEvent = function() {
  return ['auth_failed', 'security_alert', 'admin_action'].includes(this.eventType)
}

auditLogSchema.methods.requiresNotification = function() {
  return this.severity === 'critical' ||
         (this.severity === 'high' && this.isSecurityEvent())
}

auditLogSchema.methods.getRiskLevel = function() {
  if (this.severity === 'critical') return 'critical'
  if (this.severity === 'high') return 'high'
  if (this.eventType.includes('failed') || this.eventType.includes('error')) return 'medium'
  return 'low'
}

export default mongoose.model('AuditLog', auditLogSchema)