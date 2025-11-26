/**
 * User Profile Model
 * Extended user profile data and preferences
 */

import mongoose from 'mongoose'

const userProfileSchema = new mongoose.Schema({
  // Reference to User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Personal Information
  personalInfo: {
    firstName: String,
    lastName: String,
    displayName: String,
    title: String,
    bio: { type: String, maxlength: 1000 },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },
    pronouns: String,
    location: {
      city: String,
      state: String,
      country: String,
      timezone: String
    },
    languages: [String], // ISO language codes
    website: String,
    linkedIn: String,
    twitter: String,
    github: String
  },
  
  // Avatar and Media
  avatar: {
    url: String,
    filename: String,
    size: Number,
    uploadedAt: Date
  },
  
  coverImage: {
    url: String,
    filename: String,
    size: Number,
    uploadedAt: Date
  },
  
  // Professional Information
  professional: {
    company: String,
    jobTitle: String,
    industry: String,
    experience: {
      type: String,
      enum: ['student', '0-1', '1-3', '3-5', '5-10', '10+']
    },
    skills: [String],
    interests: [String],
    goals: [String],
    education: [{
      institution: String,
      degree: String,
      field: String,
      startYear: Number,
      endYear: Number,
      current: { type: Boolean, default: false }
    }],
    certifications: [{
      name: String,
      issuer: String,
      issueDate: Date,
      expiryDate: Date,
      credentialId: String,
      url: String
    }]
  },
  
  // User Preferences
  preferences: {
    // UI/UX Preferences
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    
    language: {
      type: String,
      default: 'en'
    },
    
    dateFormat: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'MM/DD/YYYY'
    },
    
    timeFormat: {
      type: String,
      enum: ['12', '24'],
      default: '12'
    },
    
    // AI Agent Preferences
    defaultAgentPersonality: {
      type: String,
      enum: ['professional', 'friendly', 'casual', 'creative', 'analytical'],
      default: 'friendly'
    },
    
    aiResponseStyle: {
      type: String,
      enum: ['concise', 'detailed', 'balanced'],
      default: 'balanced'
    },
    
    // Communication Preferences
    emailFrequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly', 'monthly', 'never'],
      default: 'weekly'
    },
    
    marketingEmails: { type: Boolean, default: true },
    productUpdates: { type: Boolean, default: true },
    communityDigest: { type: Boolean, default: true }
  },
  
  // Privacy Settings
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'members', 'private'],
      default: 'members'
    },
    
    showEmail: { type: Boolean, default: false },
    showLocation: { type: Boolean, default: false },
    showActivity: { type: Boolean, default: true },
    allowDirectMessages: { type: Boolean, default: true },
    allowMentions: { type: Boolean, default: true },
    searchable: { type: Boolean, default: true }
  },
  
  // Account Status
  status: {
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    isBeta: { type: Boolean, default: false },
    lastActive: Date,
    joinedAt: { type: Date, default: Date.now }
  },
  
  // Usage Statistics
  stats: {
    totalLogins: { type: Number, default: 0 },
    totalExperiments: { type: Number, default: 0 },
    totalAgentChats: { type: Number, default: 0 },
    totalCommunityPosts: { type: Number, default: 0 },
    favoriteAgents: [String],
    streakDays: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastStreakDate: Date
  },
  
  // Achievements and Badges
  achievements: [{
    id: String,
    name: String,
    description: String,
    iconUrl: String,
    unlockedAt: { type: Date, default: Date.now },
    category: {
      type: String,
      enum: ['engagement', 'learning', 'community', 'innovation', 'milestone']
    }
  }],
  
  // Subscription and Billing
  subscription: {
    plan: String,
    status: String,
    startDate: Date,
    endDate: Date,
    autoRenew: { type: Boolean, default: true },
    paymentMethod: String,
    nextBillingDate: Date
  },
  
  // AI Lab Preferences
  aiLab: {
    favoriteModels: [String],
    defaultSettings: {
      creativity: { type: Number, min: 0, max: 1, default: 0.7 },
      temperature: { type: Number, min: 0, max: 2, default: 1.0 },
      maxTokens: { type: Number, min: 1, max: 4000, default: 1000 }
    },
    experimentHistory: [{
      experimentId: mongoose.Schema.Types.ObjectId,
      type: String,
      completedAt: Date,
      rating: { type: Number, min: 1, max: 5 }
    }]
  },
  
  // Developer Settings (if applicable)
  developer: {
    apiKey: String,
    apiCallsUsed: { type: Number, default: 0 },
    apiCallsLimit: { type: Number, default: 1000 },
    webhookUrl: String,
    webhookSecret: String,
    githubIntegration: {
      enabled: { type: Boolean, default: false },
      username: String,
      accessToken: String // encrypted
    }
  },
  
  // Social Features
  social: {
    followers: [{ 
      userId: mongoose.Schema.Types.ObjectId,
      followedAt: { type: Date, default: Date.now }
    }],
    
    following: [{
      userId: mongoose.Schema.Types.ObjectId,
      followedAt: { type: Date, default: Date.now }
    }],
    
    blockedUsers: [{
      userId: mongoose.Schema.Types.ObjectId,
      blockedAt: { type: Date, default: Date.now },
      reason: String
    }],
    
    reputation: { type: Number, default: 0 },
    communityRank: String
  },
  
  // Analytics Tracking
  analytics: {
    lastLoginIP: String,
    lastLoginUserAgent: String,
    loginHistory: [{
      ip: String,
      userAgent: String,
      location: String,
      timestamp: { type: Date, default: Date.now }
    }],
    
    deviceInfo: {
      primaryDevice: String,
      browserPreference: String,
      mobileApp: { type: Boolean, default: false }
    }
  },
  
  // Temporary Data
  temp: {
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    pendingEmailChange: String,
    twoFactorTempSecret: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
userProfileSchema.index({ 'personalInfo.displayName': 'text', 'personalInfo.bio': 'text' })
userProfileSchema.index({ 'professional.skills': 1 })
userProfileSchema.index({ 'status.lastActive': -1 })
userProfileSchema.index({ 'social.reputation': -1 })
userProfileSchema.index({ 'stats.totalExperiments': -1 })

// Virtuals
userProfileSchema.virtual('fullName').get(function() {
  const first = this.personalInfo.firstName || ''
  const last = this.personalInfo.lastName || ''
  return `${first} ${last}`.trim()
})

userProfileSchema.virtual('followersCount').get(function() {
  return this.social.followers?.length || 0
})

userProfileSchema.virtual('followingCount').get(function() {
  return this.social.following?.length || 0
})

userProfileSchema.virtual('isOnline').get(function() {
  if (!this.status.lastActive) return false
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  return this.status.lastActive > fiveMinutesAgo
})

// Static methods
userProfileSchema.statics.findByDisplayName = function(displayName) {
  return this.findOne({
    'personalInfo.displayName': { $regex: new RegExp(`^${displayName}$`, 'i') }
  })
}

userProfileSchema.statics.searchProfiles = function(query, options = {}) {
  return this.find({
    $text: { $search: query },
    'privacy.profileVisibility': { $ne: 'private' },
    'privacy.searchable': true
  }, null, options)
    .populate('userId', 'name email')
}

userProfileSchema.statics.getLeaderboard = function(metric = 'reputation', limit = 10) {
  const sortField = metric === 'reputation' ? 'social.reputation' : `stats.${metric}`
  return this.find({
    'privacy.profileVisibility': { $ne: 'private' }
  })
    .sort({ [sortField]: -1 })
    .limit(limit)
    .populate('userId', 'name email')
}

// Instance methods
userProfileSchema.methods.updateStats = function(statType, increment = 1) {
  this.stats[statType] = (this.stats[statType] || 0) + increment
  this.status.lastActive = new Date()
  return this.save()
}

userProfileSchema.methods.addAchievement = function(achievement) {
  // Check if already has this achievement
  const existing = this.achievements.find(a => a.id === achievement.id)
  if (existing) return this
  
  this.achievements.push(achievement)
  return this.save()
}

userProfileSchema.methods.follow = function(targetUserId) {
  if (this.social.following.some(f => f.userId.toString() === targetUserId.toString())) {
    return this // Already following
  }
  
  this.social.following.push({ userId: targetUserId })
  return this.save()
}

userProfileSchema.methods.unfollow = function(targetUserId) {
  this.social.following = this.social.following.filter(
    f => f.userId.toString() !== targetUserId.toString()
  )
  return this.save()
}

userProfileSchema.methods.blockUser = function(targetUserId, reason) {
  // Remove from following/followers
  this.unfollow(targetUserId)
  
  // Add to blocked list
  this.social.blockedUsers.push({
    userId: targetUserId,
    reason: reason || 'User blocked'
  })
  
  return this.save()
}

export default mongoose.model('UserProfile', userProfileSchema)