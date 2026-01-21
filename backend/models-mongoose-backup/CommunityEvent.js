/**
 * Community Event Model
 * Event management and scheduling system for community groups
 */

import mongoose from 'mongoose'

const communityEventSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    index: true
  },
  
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  longDescription: {
    type: String,
    trim: true,
    maxlength: 10000
  },
  
  // Event Organization
  organizer: {
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
  
  coHosts: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['co-organizer', 'moderator', 'speaker', 'assistant'],
      default: 'co-organizer'
    },
    permissions: [String],
    addedAt: { type: Date, default: Date.now }
  }],
  
  // Event Type and Category
  type: {
    type: String,
    required: true,
    enum: [
      'workshop', 'webinar', 'meetup', 'conference', 'hackathon',
      'networking', 'social', 'educational', 'presentation', 'panel',
      'ama', 'demo', 'competition', 'collaboration', 'virtual', 'hybrid'
    ],
    index: true
  },
  
  category: {
    type: String,
    required: true,
    enum: [
      'ai-ml', 'programming', 'web-dev', 'mobile-dev', 'data-science',
      'blockchain', 'cybersecurity', 'cloud', 'devops', 'design',
      'business', 'career', 'networking', 'education', 'entertainment'
    ],
    index: true
  },
  
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
    maxlength: 30
  }],
  
  // Scheduling
  schedule: {
    // Start and end times
    startDate: {
      type: Date,
      required: true,
      index: true
    },
    
    endDate: {
      type: Date,
      required: true,
      index: true
    },
    
    timezone: {
      type: String,
      required: true,
      default: 'UTC'
    },
    
    // Duration in minutes
    duration: {
      type: Number,
      required: true,
      min: 15,
      max: 1440 // 24 hours max
    },
    
    // Recurring event settings
    recurring: {
      enabled: { type: Boolean, default: false },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly'],
        default: 'weekly'
      },
      interval: { type: Number, default: 1 }, // Every N intervals
      daysOfWeek: [Number], // 0-6, Sunday = 0
      endRecurrence: Date,
      maxOccurrences: Number
    },
    
    // Registration deadlines
    registrationOpen: { type: Date, default: Date.now },
    registrationClose: Date,
    earlyBirdDeadline: Date
  },
  
  // Location and Access
  location: {
    type: {
      type: String,
      required: true,
      enum: ['online', 'physical', 'hybrid'],
      default: 'online'
    },
    
    // Online event details
    online: {
      platform: {
        type: String,
        enum: ['zoom', 'teams', 'meet', 'webex', 'discord', 'youtube', 'twitch', 'custom']
      },
      url: String,
      meetingId: String,
      password: String,
      dialIn: String,
      streamKey: String
    },
    
    // Physical location
    physical: {
      venue: String,
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      },
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      capacity: Number,
      accessibility: [String] // wheelchair, parking, etc.
    }
  },
  
  // Registration and Attendance
  registration: {
    required: { type: Boolean, default: true },
    maxAttendees: { type: Number, default: 100 },
    currentAttendees: { type: Number, default: 0 },
    waitlistEnabled: { type: Boolean, default: true },
    waitlistCount: { type: Number, default: 0 },
    
    // Registration fields
    customFields: [{
      name: String,
      type: { type: String, enum: ['text', 'email', 'number', 'select', 'checkbox'] },
      required: { type: Boolean, default: false },
      options: [String] // For select fields
    }],
    
    // Approval process
    requireApproval: { type: Boolean, default: false },
    approvalMessage: String,
    
    // Pricing
    free: { type: Boolean, default: true },
    price: Number, // USD cents
    earlyBirdPrice: Number,
    memberPrice: Number, // Discounted price for group members
    currency: { type: String, default: 'USD' }
  },
  
  // Event Content and Agenda
  agenda: [{
    title: String,
    description: String,
    startTime: Date,
    duration: Number, // minutes
    speaker: {
      userId: mongoose.Schema.Types.ObjectId,
      name: String,
      title: String,
      bio: String,
      avatar: String
    },
    type: {
      type: String,
      enum: ['presentation', 'panel', 'workshop', 'break', 'networking', 'qa']
    }
  }],
  
  speakers: [{
    userId: mongoose.Schema.Types.ObjectId,
    name: String,
    title: String,
    company: String,
    bio: String,
    avatar: String,
    socialLinks: {
      twitter: String,
      linkedin: String,
      github: String,
      website: String
    },
    featured: { type: Boolean, default: false }
  }],
  
  // Resources and Materials
  resources: {
    // Pre-event materials
    preEvent: [{
      title: String,
      description: String,
      type: { type: String, enum: ['document', 'video', 'link', 'presentation'] },
      url: String,
      filename: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now }
    }],
    
    // Live event materials
    liveEvent: [{
      title: String,
      description: String,
      type: { type: String, enum: ['document', 'video', 'link', 'presentation', 'code'] },
      url: String,
      filename: String,
      size: Number,
      sharedAt: { type: Date, default: Date.now }
    }],
    
    // Post-event materials
    postEvent: [{
      title: String,
      description: String,
      type: { type: String, enum: ['recording', 'slides', 'notes', 'survey', 'feedback'] },
      url: String,
      filename: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  
  // Interactive Features
  features: {
    chat: { type: Boolean, default: true },
    qa: { type: Boolean, default: true },
    polls: { type: Boolean, default: true },
    networking: { type: Boolean, default: true },
    breakoutRooms: { type: Boolean, default: false },
    recording: { type: Boolean, default: false },
    
    // Advanced features
    liveStreaming: { type: Boolean, default: false },
    whiteboard: { type: Boolean, default: false },
    screenShare: { type: Boolean, default: false },
    virtualBackground: { type: Boolean, default: false }
  },
  
  // Event Status and Lifecycle
  status: {
    type: String,
    enum: ['draft', 'published', 'live', 'ended', 'cancelled', 'postponed'],
    default: 'draft',
    index: true
  },
  
  visibility: {
    type: String,
    enum: ['public', 'members_only', 'private', 'unlisted'],
    default: 'public',
    index: true
  },
  
  // Live Event Management
  liveSession: {
    started: { type: Boolean, default: false },
    startedAt: Date,
    ended: { type: Boolean, default: false },
    endedAt: Date,
    
    // Live statistics
    peakAttendees: { type: Number, default: 0 },
    currentAttendees: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    
    // Technical details
    streamUrl: String,
    recordingUrl: String,
    chatHistory: [{
      userId: mongoose.Schema.Types.ObjectId,
      message: String,
      timestamp: { type: Date, default: Date.now },
      type: { type: String, enum: ['message', 'question', 'announcement'], default: 'message' }
    }],
    
    // Polls and QA
    activePoll: {
      question: String,
      options: [String],
      responses: Map, // optionIndex -> count
      startedAt: Date
    },
    
    qaQueue: [{
      userId: mongoose.Schema.Types.ObjectId,
      question: String,
      askedAt: { type: Date, default: Date.now },
      answered: { type: Boolean, default: false },
      answeredAt: Date,
      upvotes: { type: Number, default: 0 }
    }]
  },
  
  // Attendee Management
  attendees: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    registeredAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'attended', 'no_show', 'cancelled'],
      default: 'registered'
    },
    checkInTime: Date,
    checkOutTime: Date,
    
    // Custom registration data
    customData: Map,
    
    // Engagement tracking
    engagement: {
      chatMessages: { type: Number, default: 0 },
      questionsAsked: { type: Number, default: 0 },
      pollsParticipated: { type: Number, default: 0 },
      timeAttended: { type: Number, default: 0 } // minutes
    },
    
    // Feedback and rating
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      recommend: Boolean,
      submittedAt: Date
    }
  }],
  
  // Waitlist management
  waitlist: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: { type: Date, default: Date.now },
    position: Number,
    notified: { type: Boolean, default: false }
  }],
  
  // Analytics and Metrics
  analytics: {
    // Registration analytics
    totalRegistrations: { type: Number, default: 0 },
    totalAttendees: { type: Number, default: 0 },
    attendanceRate: { type: Number, default: 0 },
    
    // Engagement metrics
    averageRating: { type: Number, default: 0 },
    npsScore: { type: Number, default: 0 }, // Net Promoter Score
    engagementScore: { type: Number, default: 0 },
    
    // Content metrics
    totalChatMessages: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    totalPolls: { type: Number, default: 0 },
    
    // Traffic sources
    trafficSources: [{
      source: String, // email, social, direct, etc.
      registrations: Number,
      conversions: Number
    }],
    
    // Demographics
    demographics: {
      byCountry: Map, // country -> count
      byCompany: Map, // company -> count
      byRole: Map // role -> count
    }
  },
  
  // Marketing and Promotion
  marketing: {
    // Social media promotion
    socialMedia: {
      twitter: {
        hashtags: [String],
        mentions: [String],
        scheduled: Boolean,
        postedAt: Date
      },
      linkedin: {
        scheduled: Boolean,
        postedAt: Date
      }
    },
    
    // Email campaigns
    emailCampaigns: [{
      type: { type: String, enum: ['announcement', 'reminder', 'follow_up'] },
      subject: String,
      recipients: Number,
      sentAt: Date,
      openRate: Number,
      clickRate: Number
    }],
    
    // SEO optimization
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      ogImage: String
    }
  },
  
  // Financial Tracking
  financials: {
    revenue: { type: Number, default: 0 },
    expenses: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    
    // Revenue breakdown
    revenueBreakdown: {
      tickets: { type: Number, default: 0 },
      sponsorships: { type: Number, default: 0 },
      merchandise: { type: Number, default: 0 }
    },
    
    // Expense breakdown
    expenses: [{
      category: String, // venue, catering, speakers, etc.
      amount: Number,
      description: String,
      date: Date
    }],
    
    // Sponsorships
    sponsors: [{
      name: String,
      logo: String,
      tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'title'] },
      amount: Number,
      benefits: [String]
    }]
  },
  
  // Follow-up and Post-Event
  followUp: {
    surveyUrl: String,
    surveySent: { type: Boolean, default: false },
    surveyResponses: { type: Number, default: 0 },
    
    // Thank you messages
    thankYouSent: { type: Boolean, default: false },
    certificatesSent: { type: Boolean, default: false },
    
    // Content sharing
    recordingShared: { type: Boolean, default: false },
    slidesShared: { type: Boolean, default: false },
    
    // Follow-up events
    followUpEvents: [mongoose.Schema.Types.ObjectId]
  },
  
  // Metadata
  metadata: {
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    
    // Quality metrics
    qualityScore: { type: Number, default: 50, min: 0, max: 100 },
    
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

// Indexes for performance
communityEventSchema.index({ communityGroup: 1, 'schedule.startDate': 1 })
communityEventSchema.index({ organizer: 1, createdAt: -1 })
communityEventSchema.index({ status: 1, visibility: 1 })
communityEventSchema.index({ type: 1, category: 1 })
communityEventSchema.index({ 'schedule.startDate': 1, status: 1 })
communityEventSchema.index({ 'metadata.featured': 1, 'analytics.totalRegistrations': -1 })

// Compound index for event discovery
communityEventSchema.index({
  visibility: 1,
  status: 1,
  'schedule.startDate': 1
})

// Text search index
communityEventSchema.index({
  title: 'text',
  description: 'text',
  longDescription: 'text',
  tags: 'text'
})

// Virtual for event status based on dates
communityEventSchema.virtual('eventStatus').get(function() {
  const now = new Date()
  
  if (this.status === 'cancelled' || this.status === 'postponed') {
    return this.status
  }
  
  if (now < this.schedule.startDate) {
    return 'upcoming'
  } else if (now >= this.schedule.startDate && now <= this.schedule.endDate) {
    return 'live'
  } else {
    return 'ended'
  }
})

// Virtual for registration status
communityEventSchema.virtual('registrationStatus').get(function() {
  const now = new Date()
  
  if (!this.registration.required) return 'not_required'
  if (now < this.schedule.registrationOpen) return 'not_open'
  if (this.schedule.registrationClose && now > this.schedule.registrationClose) return 'closed'
  if (this.registration.currentAttendees >= this.registration.maxAttendees) return 'full'
  
  return 'open'
})

// Virtual for spots available
communityEventSchema.virtual('spotsAvailable').get(function() {
  return Math.max(0, this.registration.maxAttendees - this.registration.currentAttendees)
})

// Static methods
communityEventSchema.statics.findUpcoming = function(limit = 10) {
  return this.find({
    'schedule.startDate': { $gte: new Date() },
    status: 'published',
    visibility: { $in: ['public', 'members_only'] }
  })
  .populate('communityGroup', 'name slug avatar')
  .populate('organizer', 'name avatar')
  .sort({ 'schedule.startDate': 1 })
  .limit(limit)
}

communityEventSchema.statics.findByGroup = function(groupId) {
  return this.find({ communityGroup: groupId })
    .populate('organizer', 'name avatar')
    .sort({ 'schedule.startDate': -1 })
}

communityEventSchema.statics.findFeatured = function() {
  return this.find({
    'metadata.featured': true,
    status: 'published',
    'schedule.startDate': { $gte: new Date() }
  })
  .populate('communityGroup', 'name slug')
  .populate('organizer', 'name avatar')
  .sort({ 'analytics.totalRegistrations': -1 })
  .limit(5)
}

communityEventSchema.statics.searchEvents = function(query, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'published',
    visibility: { $in: ['public', 'members_only'] },
    ...filters
  }
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, 'schedule.startDate': 1 })
}

communityEventSchema.statics.getEventStats = function() {
  return this.aggregate([
    { $match: { status: { $ne: 'draft' } } },
    {
      $group: {
        _id: {
          month: { $month: '$schedule.startDate' },
          year: { $year: '$schedule.startDate' }
        },
        count: { $sum: 1 },
        totalAttendees: { $sum: '$analytics.totalAttendees' },
        avgRating: { $avg: '$analytics.averageRating' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } }
  ])
}

// Instance methods
communityEventSchema.methods.registerAttendee = function(userId, customData = {}) {
  // Check if already registered
  const existingAttendee = this.attendees.find(a => a.userId.toString() === userId.toString())
  if (existingAttendee) {
    throw new Error('User already registered for this event')
  }
  
  // Check capacity
  if (this.registration.currentAttendees >= this.registration.maxAttendees) {
    if (this.registration.waitlistEnabled) {
      return this.addToWaitlist(userId)
    } else {
      throw new Error('Event is full and waitlist is disabled')
    }
  }
  
  // Add attendee
  this.attendees.push({
    userId,
    customData,
    status: this.registration.requireApproval ? 'registered' : 'confirmed'
  })
  
  this.registration.currentAttendees += 1
  this.analytics.totalRegistrations += 1
  
  return this.save()
}

communityEventSchema.methods.addToWaitlist = function(userId) {
  // Check if already on waitlist
  const existingWaitlist = this.waitlist.find(w => w.userId.toString() === userId.toString())
  if (existingWaitlist) {
    throw new Error('User already on waitlist')
  }
  
  this.waitlist.push({
    userId,
    position: this.waitlist.length + 1
  })
  
  this.registration.waitlistCount += 1
  
  return this.save()
}

communityEventSchema.methods.checkInAttendee = function(userId) {
  const attendee = this.attendees.find(a => a.userId.toString() === userId.toString())
  if (!attendee) {
    throw new Error('Attendee not found')
  }
  
  attendee.status = 'attended'
  attendee.checkInTime = new Date()
  
  // Update live session stats
  if (this.liveSession.started && !this.liveSession.ended) {
    this.liveSession.currentAttendees += 1
    this.liveSession.peakAttendees = Math.max(
      this.liveSession.peakAttendees,
      this.liveSession.currentAttendees
    )
  }
  
  return this.save()
}

communityEventSchema.methods.startEvent = function() {
  this.status = 'live'
  this.liveSession.started = true
  this.liveSession.startedAt = new Date()
  
  return this.save()
}

communityEventSchema.methods.endEvent = function() {
  this.status = 'ended'
  this.liveSession.ended = true
  this.liveSession.endedAt = new Date()
  
  // Calculate final attendance rate
  const totalAttended = this.attendees.filter(a => a.status === 'attended').length
  this.analytics.totalAttendees = totalAttended
  this.analytics.attendanceRate = this.registration.currentAttendees > 0 ? 
    (totalAttended / this.registration.currentAttendees) * 100 : 0
  
  return this.save()
}

communityEventSchema.methods.addChatMessage = function(userId, message, type = 'message') {
  this.liveSession.chatHistory.push({
    userId,
    message,
    type
  })
  
  // Update attendee engagement
  const attendee = this.attendees.find(a => a.userId.toString() === userId.toString())
  if (attendee) {
    attendee.engagement.chatMessages += 1
  }
  
  this.analytics.totalChatMessages += 1
  
  return this.save()
}

communityEventSchema.methods.addQuestion = function(userId, question) {
  this.liveSession.qaQueue.push({
    userId,
    question
  })
  
  // Update attendee engagement
  const attendee = this.attendees.find(a => a.userId.toString() === userId.toString())
  if (attendee) {
    attendee.engagement.questionsAsked += 1
  }
  
  this.analytics.totalQuestions += 1
  
  return this.save()
}

communityEventSchema.methods.startPoll = function(question, options) {
  this.liveSession.activePoll = {
    question,
    options,
    responses: new Map(),
    startedAt: new Date()
  }
  
  this.analytics.totalPolls += 1
  
  return this.save()
}

communityEventSchema.methods.submitFeedback = function(userId, rating, comment, recommend) {
  const attendee = this.attendees.find(a => a.userId.toString() === userId.toString())
  if (!attendee) {
    throw new Error('User did not attend this event')
  }
  
  attendee.feedback = {
    rating,
    comment,
    recommend,
    submittedAt: new Date()
  }
  
  // Recalculate average rating
  const feedbacks = this.attendees.filter(a => a.feedback?.rating).map(a => a.feedback.rating)
  if (feedbacks.length > 0) {
    this.analytics.averageRating = feedbacks.reduce((sum, r) => sum + r, 0) / feedbacks.length
  }
  
  // Calculate NPS score
  const recommendations = this.attendees.filter(a => a.feedback?.recommend !== undefined)
  if (recommendations.length > 0) {
    const promoters = recommendations.filter(a => a.feedback.recommend).length
    const detractors = recommendations.filter(a => !a.feedback.recommend).length
    this.analytics.npsScore = ((promoters - detractors) / recommendations.length) * 100
  }
  
  return this.save()
}

// Pre-save middleware
communityEventSchema.pre('save', function(next) {
  // Generate slug from title if not provided
  if (this.isNew && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50)
  }
  
  // Auto-set end date if not provided
  if (this.isNew && !this.schedule.endDate && this.schedule.duration) {
    this.schedule.endDate = new Date(
      this.schedule.startDate.getTime() + (this.schedule.duration * 60 * 1000)
    )
  }
  
  // Update quality score based on engagement
  if (this.isModified('analytics')) {
    let score = 50
    
    if (this.analytics.averageRating) {
      score += (this.analytics.averageRating - 3) * 10
    }
    
    if (this.analytics.attendanceRate) {
      score += (this.analytics.attendanceRate - 50) * 0.5
    }
    
    if (this.analytics.engagementScore) {
      score += (this.analytics.engagementScore - 50) * 0.3
    }
    
    this.metadata.qualityScore = Math.max(0, Math.min(100, score))
  }
  
  next()
})

export default mongoose.model('CommunityEvent', communityEventSchema)