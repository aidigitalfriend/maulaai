/**
 * Team Model
 * Team management within organizations
 */

import mongoose from 'mongoose'

const teamSchema = new mongoose.Schema({
  // Team Identity
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  description: {
    type: String,
    maxlength: 500
  },

  // Organization Relationship
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },

  // Team Lead
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Team Members
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'lead', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    permissions: {
      canInvite: { type: Boolean, default: false },
      canManageProjects: { type: Boolean, default: false },
      canViewAnalytics: { type: Boolean, default: true }
    }
  }],

  // Team Settings
  settings: {
    isPublic: { type: Boolean, default: false },
    allowExternalMembers: { type: Boolean, default: false },
    maxMembers: { type: Number, default: 50 }
  },

  // Projects associated with this team
  projects: [{
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Team Statistics
  stats: {
    totalMembers: { type: Number, default: 0 },
    activeProjects: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 }
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
teamSchema.index({ organization: 1 })
teamSchema.index({ lead: 1 })
teamSchema.index({ 'members.user': 1 })
teamSchema.index({ status: 1 })

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.length : 0
})

// Pre-save middleware
teamSchema.pre('save', function(next) {
  this.stats.totalMembers = this.members ? this.members.length : 0
  next()
})

// Static methods
teamSchema.statics.findByOrganization = function(orgId) {
  return this.find({ organization: orgId, status: 'active' })
}

teamSchema.statics.findUserTeams = function(userId) {
  return this.find({
    'members.user': userId,
    status: 'active'
  })
}

// Instance methods
teamSchema.methods.addMember = function(userId, role = 'member') {
  if (!this.members) this.members = []
  if (!this.members.find(m => m.user.toString() === userId.toString())) {
    this.members.push({
      user: userId,
      role,
      joinedAt: new Date(),
      permissions: this.getDefaultPermissions(role)
    })
    this.stats.totalMembers = this.members.length
  }
  return this.save()
}

teamSchema.methods.removeMember = function(userId) {
  if (this.members) {
    this.members = this.members.filter(m => m.user.toString() !== userId.toString())
    this.stats.totalMembers = this.members.length
  }
  return this.save()
}

teamSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(m => m.user.toString() === userId.toString())
  if (member) {
    member.role = newRole
    member.permissions = this.getDefaultPermissions(newRole)
  }
  return this.save()
}

teamSchema.methods.getDefaultPermissions = function(role) {
  switch (role) {
    case 'admin':
      return { canInvite: true, canManageProjects: true, canViewAnalytics: true }
    case 'lead':
      return { canInvite: true, canManageProjects: true, canViewAnalytics: true }
    case 'member':
    default:
      return { canInvite: false, canManageProjects: false, canViewAnalytics: true }
  }
}

teamSchema.methods.isMember = function(userId) {
  return this.members.some(m => m.user.toString() === userId.toString())
}

teamSchema.methods.getMemberRole = function(userId) {
  const member = this.members.find(m => m.user.toString() === userId.toString())
  return member ? member.role : null
}

export default mongoose.model('Team', teamSchema)