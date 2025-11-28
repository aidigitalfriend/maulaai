/**
 * Organization Model
 * Multi-tenant organization management for enterprise features
 */

import mongoose from 'mongoose'

const organizationSchema = new mongoose.Schema({
  // Organization Identity
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  slug: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },

  description: {
    type: String,
    maxlength: 500
  },

  // Organization Details
  industry: {
    type: String,
    enum: ['technology', 'healthcare', 'finance', 'education', 'retail', 'manufacturing', 'consulting', 'other']
  },

  size: {
    type: String,
    enum: ['startup', 'small', 'medium', 'large', 'enterprise']
  },

  website: String,
  logo: String,

  // Contact Information
  contactEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },

  contactPhone: String,

  // Billing & Subscription
  subscriptionTier: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },

  stripeCustomerId: String,
  billingEmail: String,

  // Organization Settings
  settings: {
    allowPublicProjects: { type: Boolean, default: false },
    requireApproval: { type: Boolean, default: false },
    maxMembers: { type: Number, default: 10 },
    maxProjects: { type: Number, default: 5 },
    features: {
      advancedAnalytics: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      customIntegrations: { type: Boolean, default: false },
      whiteLabel: { type: Boolean, default: false }
    }
  },

  // Ownership & Administration
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  admins: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'billing'], default: 'admin' },
    addedAt: { type: Date, default: Date.now }
  }],

  // Status & Lifecycle
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending', 'cancelled'],
    default: 'active'
  },

  isVerified: { type: Boolean, default: false },

  // Metadata
  metadata: {
    foundedYear: Number,
    headquarters: String,
    employeeCount: Number
  },

  // Usage Statistics
  stats: {
    totalMembers: { type: Number, default: 0 },
    totalProjects: { type: Number, default: 0 },
    totalExperiments: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 }, // in bytes
    apiCalls: { type: Number, default: 0 }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
organizationSchema.index({ owner: 1 })
organizationSchema.index({ slug: 1 })
organizationSchema.index({ contactEmail: 1 })
organizationSchema.index({ status: 1 })
organizationSchema.index({ subscriptionTier: 1 })

// Virtual for member count
organizationSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.length : 0
})

// Pre-save middleware
organizationSchema.pre('save', function(next) {
  if (this.isNew && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }
  next()
})

// Static methods
organizationSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, status: 'active' })
}

organizationSchema.statics.findActive = function() {
  return this.find({ status: 'active' })
}

// Instance methods
organizationSchema.methods.addMember = function(userId, role = 'member') {
  if (!this.members) this.members = []
  if (!this.members.find(m => m.user.toString() === userId.toString())) {
    this.members.push({ user: userId, role, joinedAt: new Date() })
    this.stats.totalMembers = this.members.length
  }
  return this.save()
}

organizationSchema.methods.removeMember = function(userId) {
  if (this.members) {
    this.members = this.members.filter(m => m.user.toString() !== userId.toString())
    this.stats.totalMembers = this.members.length
  }
  return this.save()
}

organizationSchema.methods.isAdmin = function(userId) {
  return this.owner.toString() === userId.toString() ||
         this.admins.some(admin => admin.user.toString() === userId.toString())
}

organizationSchema.methods.canAddMembers = function() {
  return this.stats.totalMembers < this.settings.maxMembers
}

export default mongoose.model('Organization', organizationSchema)