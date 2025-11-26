/**
 * Community Content Model
 * Posts, discussions, and content management for community groups
 */

import mongoose from 'mongoose'

const communityContentSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
    index: true
  },
  
  slug: {
    type: String,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/,
    index: true
  },
  
  content: {
    // Main content
    body: {
      type: String,
      required: true,
      maxlength: 50000
    },
    
    // Content format
    format: {
      type: String,
      enum: ['markdown', 'html', 'plaintext'],
      default: 'markdown'
    },
    
    // Rich content
    summary: {
      type: String,
      maxlength: 500
    },
    
    excerpt: {
      type: String,
      maxlength: 200
    },
    
    // Content metadata
    wordCount: { type: Number, default: 0 },
    readingTime: { type: Number, default: 0 }, // minutes
    
    // Version control
    versions: [{
      content: String,
      editedAt: Date,
      editedBy: mongoose.Schema.Types.ObjectId,
      editReason: String,
      changeLog: String
    }],
    
    originalContent: String // Backup of original
  },
  
  // Content Classification
  type: {
    type: String,
    required: true,
    enum: [
      'discussion', 'question', 'announcement', 'poll', 'tutorial',
      'showcase', 'help', 'feedback', 'news', 'event', 'job',
      'collaboration', 'resource', 'review', 'blog'
    ],
    index: true
  },
  
  category: {
    type: String,
    enum: [
      'general', 'help', 'showcase', 'tutorial', 'news', 'events',
      'jobs', 'feedback', 'collaboration', 'resources', 'off-topic'
    ],
    index: true
  },
  
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
    maxlength: 30
  }],
  
  // Authorship
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  communityGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityGroup',
    required: true,
    index: true
  },
  
  // Co-authors and contributors
  contributors: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['co-author', 'editor', 'reviewer', 'contributor'],
      default: 'contributor'
    },
    contribution: String,
    addedAt: { type: Date, default: Date.now }
  }],
  
  // Content Status and Visibility
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'hidden', 'deleted'],
    default: 'draft',
    index: true
  },
  
  visibility: {
    type: String,
    enum: ['public', 'members_only', 'restricted', 'private'],
    default: 'public',
    index: true
  },
  
  // Publishing
  publishedAt: {
    type: Date,
    index: true
  },
  
  scheduledFor: Date, // For scheduled publishing
  
  // Content Features
  features: {
    // Interactive elements
    allowComments: { type: Boolean, default: true },
    allowReactions: { type: Boolean, default: true },
    allowSharing: { type: Boolean, default: true },
    
    // Special features
    isPinned: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    
    // Content enhancements
    hasCodeBlocks: { type: Boolean, default: false },
    hasMath: { type: Boolean, default: false },
    hasEmbeds: { type: Boolean, default: false },
    
    // Notifications
    notifyMembers: { type: Boolean, default: false },
    sendNewsletter: { type: Boolean, default: false }
  },
  
  // Media Attachments
  media: [{
    type: { type: String, enum: ['image', 'video', 'audio', 'document', 'link'] },
    url: String,
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number, // bytes
    
    // Media metadata
    dimensions: {
      width: Number,
      height: Number
    },
    duration: Number, // For video/audio
    
    // Processing status
    processed: { type: Boolean, default: false },
    thumbnailUrl: String,
    
    // Upload info
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: mongoose.Schema.Types.ObjectId
  }],
  
  // Links and References
  links: [{
    url: String,
    title: String,
    description: String,
    image: String,
    domain: String,
    
    // Link validation
    validated: { type: Boolean, default: false },
    accessible: { type: Boolean, default: true },
    lastChecked: Date
  }],
  
  // Reactions and Engagement
  reactions: {
    // Standard reactions
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    loves: { type: Number, default: 0 },
    laughs: { type: Number, default: 0 },
    
    // Custom reactions
    custom: [{
      emoji: String,
      name: String,
      count: { type: Number, default: 0 }
    }],
    
    // Reaction details
    details: [{
      userId: mongoose.Schema.Types.ObjectId,
      type: String, // like, dislike, love, laugh, custom emoji
      reactedAt: { type: Date, default: Date.now }
    }]
  },
  
  // Comments System
  comments: {
    enabled: { type: Boolean, default: true },
    count: { type: Number, default: 0 },
    
    // Comment moderation
    moderationRequired: { type: Boolean, default: false },
    allowGuestComments: { type: Boolean, default: false },
    
    // Threading
    maxDepth: { type: Number, default: 3 },
    
    // Recent comments cache
    recent: [{
      commentId: mongoose.Schema.Types.ObjectId,
      author: mongoose.Schema.Types.ObjectId,
      content: String,
      createdAt: Date
    }]
  },
  
  // Analytics and Metrics
  analytics: {
    // View metrics
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    
    // Time-based views
    dailyViews: [{ date: String, views: Number }],
    weeklyViews: [{ week: String, views: Number }],
    
    // Engagement metrics
    totalEngagement: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    
    // Share metrics
    shares: { type: Number, default: 0 },
    shareBreakdown: {
      internal: { type: Number, default: 0 },
      external: { type: Number, default: 0 },
      email: { type: Number, default: 0 },
      social: { type: Number, default: 0 }
    },
    
    // User behavior
    bounceRate: { type: Number, default: 0 },
    timeOnPage: { type: Number, default: 0 }, // average seconds
    scrollDepth: { type: Number, default: 0 }, // average percentage
    
    // Performance metrics
    loadTime: { type: Number, default: 0 }, // milliseconds
    
    // Traffic sources
    trafficSources: [{
      source: String, // search, social, direct, referral
      visits: Number,
      percentage: Number
    }],
    
    // Popular sections (for long content)
    popularSections: [{
      section: String,
      views: Number,
      timeSpent: Number
    }]
  },
  
  // SEO and Discovery
  seo: {
    // Meta information
    metaTitle: String,
    metaDescription: String,
    
    // Keywords and optimization
    focusKeyword: String,
    keywords: [String],
    
    // Social sharing
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    
    // Twitter cards
    twitterTitle: String,
    twitterDescription: String,
    twitterImage: String,
    
    // Schema markup
    schemaType: String,
    
    // SEO scores
    seoScore: { type: Number, min: 0, max: 100 },
    readabilityScore: { type: Number, min: 0, max: 100 }
  },
  
  // Content Quality and Moderation
  quality: {
    // Automated quality assessment
    qualityScore: { type: Number, default: 50, min: 0, max: 100 },
    
    // Content analysis
    sentiment: { type: Number, min: -1, max: 1 }, // -1 negative, 1 positive
    toxicity: { type: Number, min: 0, max: 1 },
    spam: { type: Number, min: 0, max: 1 },
    
    // Language analysis
    language: String,
    readabilityLevel: String, // elementary, middle, high_school, college, graduate
    
    // Fact checking
    factChecked: { type: Boolean, default: false },
    factCheckScore: { type: Number, min: 0, max: 100 },
    
    // Community rating
    communityRating: { type: Number, min: 1, max: 5 },
    ratingCount: { type: Number, default: 0 }
  },
  
  // Moderation Status
  moderation: {
    // Review status
    reviewed: { type: Boolean, default: false },
    reviewedBy: mongoose.Schema.Types.ObjectId,
    reviewedAt: Date,
    
    // Flagging
    flagged: { type: Boolean, default: false },
    flagCount: { type: Number, default: 0 },
    flags: [{
      type: String, // spam, inappropriate, copyright, etc.
      reportedBy: mongoose.Schema.Types.ObjectId,
      reason: String,
      reportedAt: { type: Date, default: Date.now }
    }],
    
    // Actions taken
    warnings: [{
      reason: String,
      issuedBy: mongoose.Schema.Types.ObjectId,
      issuedAt: { type: Date, default: Date.now }
    }],
    
    hidden: { type: Boolean, default: false },
    hiddenReason: String,
    hiddenBy: mongoose.Schema.Types.ObjectId,
    hiddenAt: Date
  },
  
  // Collaboration Features
  collaboration: {
    // Editing permissions
    allowCollaboration: { type: Boolean, default: false },
    collaborators: [mongoose.Schema.Types.ObjectId],
    
    // Version control
    isCollaborativeEdit: { type: Boolean, default: false },
    lockStatus: {
      locked: { type: Boolean, default: false },
      lockedBy: mongoose.Schema.Types.ObjectId,
      lockedAt: Date,
      lockExpires: Date
    },
    
    // Change tracking
    pendingChanges: [{
      proposedBy: mongoose.Schema.Types.ObjectId,
      changes: String, // JSON diff or description
      reason: String,
      proposedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    }]
  },
  
  // Poll/Survey Data (for poll-type posts)
  poll: {
    enabled: { type: Boolean, default: false },
    
    question: String,
    
    options: [{
      text: String,
      votes: { type: Number, default: 0 },
      voters: [mongoose.Schema.Types.ObjectId]
    }],
    
    settings: {
      multipleChoice: { type: Boolean, default: false },
      allowAddOptions: { type: Boolean, default: false },
      requireAuth: { type: Boolean, default: true },
      showResults: { type: String, enum: ['always', 'after_vote', 'after_close'], default: 'after_vote' }
    },
    
    timeline: {
      opensAt: Date,
      closesAt: Date,
      closed: { type: Boolean, default: false }
    },
    
    results: {
      totalVotes: { type: Number, default: 0 },
      participationRate: Number,
      
      demographics: {
        byRole: Map, // role -> count
        byJoinDate: Map // time period -> count
      }
    }
  },
  
  // Related Content
  related: {
    // Manual relationships
    parentPost: mongoose.Schema.Types.ObjectId, // For follow-up posts
    childPosts: [mongoose.Schema.Types.ObjectId],
    
    // Cross-references
    mentions: [mongoose.Schema.Types.ObjectId], // Users mentioned in content
    references: [mongoose.Schema.Types.ObjectId], // Other posts referenced
    
    // Auto-generated relationships
    similar: [{
      postId: mongoose.Schema.Types.ObjectId,
      similarity: Number, // 0-1 similarity score
      reason: String // tags, content, etc.
    }],
    
    // Series/sequence
    series: {
      partOf: mongoose.Schema.Types.ObjectId, // Series ID
      partNumber: Number,
      totalParts: Number
    }
  },
  
  // Monetization
  monetization: {
    // Premium content
    isPremium: { type: Boolean, default: false },
    premiumTiers: [String], // Which tiers can access
    
    // Sponsorship
    sponsored: { type: Boolean, default: false },
    sponsor: {
      name: String,
      logo: String,
      url: String,
      disclosure: String
    },
    
    // Revenue tracking
    revenue: { type: Number, default: 0 },
    revenueModel: { type: String, enum: ['subscription', 'one_time', 'donation', 'sponsored'] }
  },
  
  // Metadata
  metadata: {
    // Content lifecycle
    isTemplate: { type: Boolean, default: false },
    templateCategory: String,
    
    // Import/export
    importedFrom: String,
    originalUrl: String,
    
    // AI assistance
    aiAssisted: { type: Boolean, default: false },
    aiModel: String,
    aiPrompt: String,
    
    // Custom fields
    customFields: [{
      key: String,
      value: mongoose.Schema.Types.Mixed,
      type: { type: String, enum: ['string', 'number', 'boolean', 'date', 'array'] }
    }],
    
    // Content flags
    flags: {
      trending: { type: Boolean, default: false },
      popular: { type: Boolean, default: false },
      recommended: { type: Boolean, default: false },
      editorial: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound indexes for performance
communityContentSchema.index({ communityGroup: 1, status: 1, publishedAt: -1 })
communityContentSchema.index({ author: 1, createdAt: -1 })
communityContentSchema.index({ type: 1, category: 1 })
communityContentSchema.index({ 'features.isPinned': 1, publishedAt: -1 })
communityContentSchema.index({ 'features.isFeatured': 1, 'analytics.views': -1 })
communityContentSchema.index({ tags: 1, status: 1 })
communityContentSchema.index({ 'analytics.views': -1, publishedAt: -1 })

// Text search index
communityContentSchema.index({
  title: 'text',
  'content.body': 'text',
  'content.summary': 'text',
  tags: 'text'
})

// Geospatial index if location-based content is needed
// communityContentSchema.index({ location: '2dsphere' })

// Virtual for excerpt generation
communityContentSchema.virtual('autoExcerpt').get(function() {
  if (this.content.excerpt) return this.content.excerpt
  
  // Generate excerpt from body (strip markdown/html)
  let text = this.content.body
    .replace(/[#*`_~]/g, '') // Remove markdown
    .replace(/<[^>]*>/g, '') // Remove HTML
    .trim()
  
  return text.length > 200 ? text.substring(0, 197) + '...' : text
})

// Virtual for reading time calculation
communityContentSchema.virtual('estimatedReadingTime').get(function() {
  const wordsPerMinute = 200
  const words = this.content.wordCount || this.content.body.split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
})

// Virtual for engagement score
communityContentSchema.virtual('engagementScore').get(function() {
  const views = this.analytics.views || 1
  const comments = this.comments.count
  const reactions = this.reactions.likes + this.reactions.loves + this.reactions.laughs
  const shares = this.analytics.shares
  
  return Math.round(((comments * 3 + reactions * 2 + shares * 5) / views) * 1000) / 10
})

// Virtual for trending score
communityContentSchema.virtual('trendingScore').get(function() {
  const now = new Date()
  const ageHours = (now - this.publishedAt) / (1000 * 60 * 60)
  const decayFactor = Math.exp(-ageHours / 24) // Decay over 24 hours
  
  const engagement = this.engagementScore
  const views = this.analytics.views
  
  return Math.round((engagement * views * decayFactor) / 100)
})

// Static methods
communityContentSchema.statics.findPublished = function(groupId, options = {}) {
  const query = {
    communityGroup: groupId,
    status: 'published',
    visibility: { $in: ['public', 'members_only'] }
  }
  
  if (options.type) query.type = options.type
  if (options.category) query.category = options.category
  if (options.author) query.author = options.author
  
  return this.find(query)
    .populate('author', 'name avatar reputation')
    .sort(options.sort || { publishedAt: -1 })
}

communityContentSchema.statics.findTrending = function(groupId, limit = 10) {
  return this.find({
    communityGroup: groupId,
    status: 'published',
    publishedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
  })
  .populate('author', 'name avatar')
  .sort({ 'analytics.views': -1, 'analytics.totalEngagement': -1 })
  .limit(limit)
}

communityContentSchema.statics.findByAuthor = function(authorId, groupId = null) {
  const query = { author: authorId, status: 'published' }
  if (groupId) query.communityGroup = groupId
  
  return this.find(query)
    .populate('communityGroup', 'name slug')
    .sort({ publishedAt: -1 })
}

communityContentSchema.statics.searchContent = function(query, groupId = null, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'published',
    visibility: { $in: ['public', 'members_only'] },
    ...filters
  }
  
  if (groupId) searchQuery.communityGroup = groupId
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .populate('author', 'name avatar')
    .populate('communityGroup', 'name slug')
    .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
}

communityContentSchema.statics.getContentStats = function(groupId, timeframe = 30) {
  const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000)
  
  return this.aggregate([
    {
      $match: {
        communityGroup: mongoose.Types.ObjectId(groupId),
        publishedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          type: '$type',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$publishedAt' } }
        },
        count: { $sum: 1 },
        totalViews: { $sum: '$analytics.views' },
        totalEngagement: { $sum: '$analytics.totalEngagement' },
        avgQuality: { $avg: '$quality.qualityScore' }
      }
    },
    { $sort: { '_id.date': -1 } }
  ])
}

// Instance methods
communityContentSchema.methods.publish = function() {
  this.status = 'published'
  this.publishedAt = new Date()
  
  // Generate slug if not exists
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100)
  }
  
  // Calculate reading time and word count
  this.content.wordCount = this.content.body.split(/\s+/).length
  this.content.readingTime = Math.ceil(this.content.wordCount / 200)
  
  return this.save()
}

communityContentSchema.methods.addView = function(userId = null, isUnique = false) {
  this.analytics.views += 1
  
  if (isUnique) {
    this.analytics.uniqueViews += 1
  }
  
  // Update daily views
  const today = new Date().toISOString().split('T')[0]
  let todayViews = this.analytics.dailyViews.find(d => d.date === today)
  
  if (!todayViews) {
    todayViews = { date: today, views: 1 }
    this.analytics.dailyViews.push(todayViews)
  } else {
    todayViews.views += 1
  }
  
  return this.save()
}

communityContentSchema.methods.addReaction = function(userId, reactionType) {
  // Remove existing reaction from user
  this.reactions.details = this.reactions.details.filter(
    r => r.userId.toString() !== userId.toString()
  )
  
  // Add new reaction
  this.reactions.details.push({
    userId,
    type: reactionType
  })
  
  // Update reaction counters
  this.reactions[reactionType] = (this.reactions[reactionType] || 0) + 1
  
  // Update total engagement
  this.analytics.totalEngagement = 
    this.reactions.likes + this.reactions.loves + this.reactions.laughs + 
    this.comments.count + this.analytics.shares
  
  return this.save()
}

communityContentSchema.methods.removeReaction = function(userId) {
  const existingReaction = this.reactions.details.find(
    r => r.userId.toString() === userId.toString()
  )
  
  if (existingReaction) {
    // Decrease counter
    this.reactions[existingReaction.type] = Math.max(0, this.reactions[existingReaction.type] - 1)
    
    // Remove from details
    this.reactions.details = this.reactions.details.filter(
      r => r.userId.toString() !== userId.toString()
    )
    
    // Update total engagement
    this.analytics.totalEngagement = Math.max(0, this.analytics.totalEngagement - 1)
  }
  
  return this.save()
}

communityContentSchema.methods.addShare = function(shareType = 'internal') {
  this.analytics.shares += 1
  this.analytics.shareBreakdown[shareType] = (this.analytics.shareBreakdown[shareType] || 0) + 1
  this.analytics.totalEngagement += 1
  
  return this.save()
}

communityContentSchema.methods.updateQualityScore = function() {
  let score = 50 // Base score
  
  // Content length factor
  const wordCount = this.content.wordCount || 0
  if (wordCount > 300) score += 10
  if (wordCount > 1000) score += 10
  if (wordCount < 50) score -= 20
  
  // Engagement factor
  const engagementRate = this.analytics.views > 0 ? 
    (this.comments.count + this.reactions.likes) / this.analytics.views : 0
  
  score += Math.min(20, engagementRate * 100)
  
  // Community rating factor
  if (this.quality.communityRating && this.quality.ratingCount > 0) {
    score += (this.quality.communityRating - 3) * 10
  }
  
  // Media enrichment
  if (this.media.length > 0) score += 5
  if (this.links.length > 0) score += 5
  
  // Moderation penalties
  if (this.moderation.flagged) score -= 30
  if (this.moderation.warnings.length > 0) score -= 20
  
  this.quality.qualityScore = Math.max(0, Math.min(100, score))
  
  return this.save()
}

communityContentSchema.methods.flag = function(reportedBy, flagType, reason) {
  this.moderation.flagged = true
  this.moderation.flagCount += 1
  
  this.moderation.flags.push({
    type: flagType,
    reportedBy,
    reason
  })
  
  return this.save()
}

communityContentSchema.methods.hide = function(hiddenBy, reason) {
  this.moderation.hidden = true
  this.moderation.hiddenBy = hiddenBy
  this.moderation.hiddenReason = reason
  this.moderation.hiddenAt = new Date()
  this.status = 'hidden'
  
  return this.save()
}

communityContentSchema.methods.createVersion = function(newContent, editedBy, editReason) {
  // Save current content as version
  this.content.versions.push({
    content: this.content.body,
    editedAt: new Date(),
    editedBy,
    editReason
  })
  
  // Update content
  this.content.body = newContent
  this.content.wordCount = newContent.split(/\s+/).length
  this.content.readingTime = Math.ceil(this.content.wordCount / 200)
  
  return this.save()
}

// Pre-save middleware
communityContentSchema.pre('save', function(next) {
  // Auto-generate slug if new and no slug
  if (this.isNew && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100) + '-' + Date.now().toString(36)
  }
  
  // Update word count and reading time if content changed
  if (this.isModified('content.body')) {
    this.content.wordCount = this.content.body.split(/\s+/).length
    this.content.readingTime = Math.ceil(this.content.wordCount / 200)
  }
  
  // Set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date()
  }
  
  // Update engagement rate
  if (this.isModified('analytics.views') || this.isModified('comments.count') || this.isModified('reactions')) {
    const views = this.analytics.views || 1
    const engagement = this.comments.count + this.reactions.likes + this.reactions.loves + this.reactions.laughs
    this.analytics.engagementRate = (engagement / views) * 100
  }
  
  // Set trending flag based on recent performance
  const hoursOld = this.publishedAt ? (new Date() - this.publishedAt) / (1000 * 60 * 60) : 999
  if (hoursOld <= 48 && this.trendingScore > 100) {
    this.metadata.flags.trending = true
  } else {
    this.metadata.flags.trending = false
  }
  
  next()
})

export default mongoose.model('CommunityContent', communityContentSchema)