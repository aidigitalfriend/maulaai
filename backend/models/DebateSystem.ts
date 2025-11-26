/**
 * Debate System Model
 * AI-powered debate system for structured discussions
 */

import mongoose from 'mongoose'

const debateSystemSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  
  // References
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  experimentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabExperiment',
    index: true
  },
  
  // Debate Configuration
  debateType: {
    type: String,
    enum: ['formal', 'informal', 'oxford', 'town_hall', 'panel', 'fishbowl', 'parliamentary'],
    required: true,
    default: 'formal'
  },
  
  format: {
    type: String,
    enum: ['single_round', 'multiple_rounds', 'elimination', 'round_robin'],
    default: 'single_round'
  },
  
  category: {
    type: String,
    enum: ['politics', 'philosophy', 'science', 'technology', 'ethics', 'economics', 'social', 'education', 'environment', 'health', 'custom'],
    required: true
  },
  
  // Topic and Position
  topic: {
    statement: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    
    context: {
      type: String,
      maxlength: 2000
    },
    
    background: {
      type: String,
      maxlength: 3000
    },
    
    keyPoints: [{
      type: String,
      maxlength: 200
    }],
    
    sources: [{
      title: String,
      url: String,
      credibility: { type: Number, min: 0, max: 10 },
      relevance: { type: Number, min: 0, max: 10 }
    }]
  },
  
  // Participating Models/Entities
  participants: [{
    // Model Information
    name: {
      type: String,
      required: true
    },
    
    type: {
      type: String,
      enum: ['ai_model', 'human', 'hybrid'],
      required: true
    },
    
    // For AI models
    modelConfig: {
      model: String, // gpt-4, claude-3-sonnet, etc.
      temperature: { type: Number, min: 0, max: 2, default: 0.7 },
      maxTokens: { type: Number, min: 100, max: 4000, default: 800 },
      systemPrompt: String,
      personality: String, // aggressive, diplomatic, analytical, etc.
      expertise: [String] // areas of expertise
    },
    
    // For human participants
    humanInfo: {
      userId: mongoose.Schema.Types.ObjectId,
      credentials: String,
      expertise: [String],
      biography: String
    },
    
    // Position Assignment
    position: {
      type: String,
      enum: ['pro', 'con', 'neutral', 'moderator'],
      required: true
    },
    
    // Debate Strategy
    strategy: {
      approach: {
        type: String,
        enum: ['logical', 'emotional', 'ethical', 'practical', 'balanced'],
        default: 'balanced'
      },
      
      style: {
        type: String,
        enum: ['aggressive', 'diplomatic', 'analytical', 'passionate', 'academic'],
        default: 'analytical'
      },
      
      focusAreas: [String],
      avoidanceTopics: [String]
    },
    
    // Performance Tracking
    performance: {
      argumentsPresented: { type: Number, default: 0 },
      rebuttalsGiven: { type: Number, default: 0 },
      evidenceUsed: { type: Number, default: 0 },
      logicalFallacies: { type: Number, default: 0 },
      persuasivenessScore: { type: Number, min: 0, max: 10 },
      clarityScore: { type: Number, min: 0, max: 10 },
      respectScore: { type: Number, min: 0, max: 10 }
    }
  }],
  
  // Debate Structure and Rules
  rules: {
    timeLimit: {
      openingStatement: { type: Number, default: 180 }, // seconds
      rebuttal: { type: Number, default: 120 },
      crossExamination: { type: Number, default: 90 },
      closingStatement: { type: Number, default: 120 },
      preparationTime: { type: Number, default: 60 }
    },
    
    rounds: {
      total: { type: Number, default: 3, min: 1, max: 10 },
      current: { type: Number, default: 0 }
    },
    
    speaking: {
      maxSpeechLength: { type: Number, default: 1000 }, // characters
      requireEvidence: { type: Boolean, default: true },
      allowInterruptions: { type: Boolean, default: false },
      formalLanguage: { type: Boolean, default: true }
    },
    
    judging: {
      method: {
        type: String,
        enum: ['ai_judge', 'human_panel', 'audience_vote', 'hybrid'],
        default: 'hybrid'
      },
      
      criteria: [{
        name: String,
        description: String,
        weight: { type: Number, min: 0, max: 1, default: 1 },
        maxPoints: { type: Number, default: 10 }
      }],
      
      judges: [{
        type: {
          type: String,
          enum: ['ai', 'human', 'algorithm']
        },
        name: String,
        credentials: String,
        bias: String,
        expertise: [String]
      }]
    }
  },
  
  // Debate Rounds and Content
  rounds: [{
    roundNumber: { type: Number, required: true },
    
    phase: {
      type: String,
      enum: ['opening', 'argument', 'rebuttal', 'cross_examination', 'closing'],
      required: true
    },
    
    speeches: [{
      participantName: String,
      position: String,
      
      content: {
        text: { type: String, required: true },
        arguments: [{
          claim: String,
          evidence: [String],
          reasoning: String,
          strength: { type: Number, min: 0, max: 10 }
        }],
        
        rebuttals: [{
          targetClaim: String,
          counterArgument: String,
          evidence: [String],
          effectiveness: { type: Number, min: 0, max: 10 }
        }]
      },
      
      // Speech Analysis
      analysis: {
        wordCount: Number,
        readabilityScore: Number,
        sentimentScore: Number,
        
        // Argument Quality
        logicalStructure: { type: Number, min: 0, max: 10 },
        evidenceQuality: { type: Number, min: 0, max: 10 },
        relevance: { type: Number, min: 0, max: 10 },
        persuasiveness: { type: Number, min: 0, max: 10 },
        
        // Language Analysis
        formalityLevel: { type: Number, min: 0, max: 10 },
        emotionalAppeal: { type: Number, min: 0, max: 10 },
        
        // Detected Issues
        logicalFallacies: [{
          type: String,
          description: String,
          severity: { type: Number, min: 0, max: 10 }
        }],
        
        factualAccuracy: { type: Number, min: 0, max: 10 },
        biasDetection: [{
          type: String,
          confidence: { type: Number, min: 0, max: 1 }
        }]
      },
      
      // Timing and Metadata
      duration: Number, // seconds
      deliveredAt: { type: Date, default: Date.now },
      
      // Audience Engagement
      reactions: [{
        type: { type: String, enum: ['applause', 'boo', 'neutral', 'confused'] },
        count: { type: Number, default: 0 }
      }]
    }],
    
    // Round Results
    scores: [{
      participantName: String,
      
      criteriaScores: [{
        criterion: String,
        score: Number,
        justification: String
      }],
      
      totalScore: Number,
      judgeComments: String
    }],
    
    winner: String, // Participant name
    reasoning: String,
    
    completedAt: Date
  }],
  
  // Overall Results
  results: {
    winner: {
      participantName: String,
      position: String,
      finalScore: Number,
      winMargin: Number
    },
    
    finalScores: [{
      participantName: String,
      position: String,
      totalScore: Number,
      averageScore: Number,
      
      breakdown: {
        argumentation: Number,
        rebuttal: Number,
        evidence: Number,
        delivery: Number,
        persuasiveness: Number
      }
    }],
    
    // Debate Statistics
    statistics: {
      totalSpeeches: Number,
      totalWords: Number,
      averageSpeechLength: Number,
      argumentsPresented: Number,
      rebuttalsGiven: Number,
      evidencePieces: Number,
      
      // Quality Metrics
      averageArgumentQuality: Number,
      logicalFallaciesDetected: Number,
      factualAccuracy: Number,
      overallQuality: Number
    },
    
    // Key Insights
    insights: [{
      category: String,
      observation: String,
      significance: { type: Number, min: 0, max: 10 }
    }],
    
    // Winning Arguments
    strongestArguments: [{
      participantName: String,
      argument: String,
      impact: Number,
      evidenceQuality: Number
    }],
    
    // Areas for Improvement
    improvements: [{
      participantName: String,
      area: String,
      suggestion: String,
      priority: { type: Number, min: 0, max: 10 }
    }]
  },
  
  // Real-time Features
  liveFeatures: {
    isLive: { type: Boolean, default: false },
    audienceVoting: { type: Boolean, default: true },
    
    currentSpeaker: String,
    timeRemaining: Number, // seconds
    
    // Live Audience Engagement
    currentViewers: { type: Number, default: 0 },
    
    liveVotes: [{
      timestamp: Date,
      position: String, // pro/con
      count: Number
    }],
    
    liveComments: [{
      userId: mongoose.Schema.Types.ObjectId,
      content: String,
      timestamp: { type: Date, default: Date.now },
      likes: { type: Number, default: 0 }
    }],
    
    polls: [{
      question: String,
      options: [String],
      votes: [{
        option: String,
        count: Number
      }],
      isActive: { type: Boolean, default: false }
    }]
  },
  
  // Status and Progress
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'in_progress', 'paused', 'completed', 'cancelled'],
    default: 'draft',
    index: true
  },
  
  progress: {
    currentRound: { type: Number, default: 0 },
    currentPhase: String,
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 }
  },
  
  // Scheduling
  schedule: {
    startTime: Date,
    endTime: Date,
    timezone: String,
    duration: Number, // estimated minutes
    
    reminders: [{
      type: { type: String, enum: ['email', 'push', 'sms'] },
      timing: Number, // minutes before start
      sent: { type: Boolean, default: false }
    }]
  },
  
  // Public and Social Features
  public: {
    isPublic: { type: Boolean, default: false },
    allowAudienceParticipation: { type: Boolean, default: true },
    recordSession: { type: Boolean, default: true },
    
    // Engagement Metrics
    engagement: {
      views: { type: Number, default: 0 },
      participants: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      comments: { type: Number, default: 0 }
    },
    
    // Social Media
    socialLinks: [{
      platform: String,
      url: String,
      followers: Number
    }],
    
    hashtags: [String]
  },
  
  // Moderation and Safety
  moderation: {
    moderatorId: mongoose.Schema.Types.ObjectId,
    
    guidelines: {
      respectfulLanguage: { type: Boolean, default: true },
      factualAccuracy: { type: Boolean, default: true },
      timeCompliance: { type: Boolean, default: true },
      topicRelevance: { type: Boolean, default: true }
    },
    
    violations: [{
      participantName: String,
      rule: String,
      description: String,
      severity: { type: Number, min: 1, max: 5 },
      timestamp: { type: Date, default: Date.now },
      resolved: { type: Boolean, default: false }
    }],
    
    warnings: [{
      participantName: String,
      message: String,
      timestamp: { type: Date, default: Date.now }
    }]
  },
  
  // Analytics and Learning
  analytics: {
    argumentPatterns: [{
      pattern: String,
      frequency: Number,
      effectiveness: Number
    }],
    
    languageAnalysis: {
      vocabularyComplexity: Number,
      averageSentenceLength: Number,
      readabilityLevel: String,
      emotionalTone: String
    },
    
    participantImprovement: [{
      participantName: String,
      metric: String,
      initialScore: Number,
      finalScore: Number,
      improvement: Number
    }]
  },
  
  // Tags and Metadata
  tags: [{
    type: String,
    trim: true
  }],
  
  metadata: {
    difficulty: { type: Number, min: 1, max: 10 },
    educationalLevel: String,
    targetAudience: String,
    
    // Content Warnings
    contentWarnings: [String],
    ageRating: String,
    
    // Technical Info
    recordingUrl: String,
    transcriptUrl: String,
    summaryUrl: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
debateSystemSchema.index({ userId: 1, createdAt: -1 })
debateSystemSchema.index({ status: 1 })
debateSystemSchema.index({ category: 1, 'public.isPublic': 1 })
debateSystemSchema.index({ 'schedule.startTime': 1 })
debateSystemSchema.index({ 'public.isPublic': 1, 'liveFeatures.isLive': 1 })
debateSystemSchema.index({ tags: 1 })

// Virtual for debate duration
debateSystemSchema.virtual('actualDuration').get(function() {
  if (!this.schedule.startTime || !this.schedule.endTime) return null
  return Math.round((this.schedule.endTime - this.schedule.startTime) / (1000 * 60)) // minutes
})

// Virtual for total arguments
debateSystemSchema.virtual('totalArguments').get(function() {
  return this.rounds.reduce((total, round) => {
    return total + round.speeches.reduce((speechTotal, speech) => {
      return speechTotal + (speech.content.arguments?.length || 0)
    }, 0)
  }, 0)
})

// Virtual for current leading participant
debateSystemSchema.virtual('currentLeader').get(function() {
  if (!this.results.finalScores || this.results.finalScores.length === 0) return null
  
  return this.results.finalScores.reduce((leader, participant) => {
    return participant.totalScore > (leader?.totalScore || 0) ? participant : leader
  })
})

// Static methods
debateSystemSchema.statics.findLive = function() {
  return this.find({ 
    'liveFeatures.isLive': true,
    status: 'in_progress',
    'public.isPublic': true
  })
    .populate('userId', 'name email')
    .sort({ 'liveFeatures.currentViewers': -1 })
}

debateSystemSchema.statics.findUpcoming = function(hours = 24) {
  const now = new Date()
  const future = new Date(now.getTime() + hours * 60 * 60 * 1000)
  
  return this.find({
    'schedule.startTime': { $gte: now, $lte: future },
    status: 'scheduled',
    'public.isPublic': true
  })
    .sort({ 'schedule.startTime': 1 })
}

debateSystemSchema.statics.getPopularDebates = function(timeframe = 7, limit = 10) {
  const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000)
  
  return this.find({
    createdAt: { $gte: startDate },
    'public.isPublic': true,
    status: 'completed'
  })
    .sort({ 'public.engagement.views': -1, 'public.engagement.participants': -1 })
    .limit(limit)
    .populate('userId', 'name email')
}

debateSystemSchema.statics.findByTopic = function(searchTerm, options = {}) {
  return this.find({
    $or: [
      { 'topic.statement': { $regex: searchTerm, $options: 'i' } },
      { 'topic.context': { $regex: searchTerm, $options: 'i' } },
      { tags: { $regex: searchTerm, $options: 'i' } }
    ],
    'public.isPublic': true
  }, null, options)
}

// Instance methods
debateSystemSchema.methods.startDebate = function() {
  this.status = 'in_progress'
  this.schedule.startTime = new Date()
  this.liveFeatures.isLive = true
  this.progress.currentRound = 1
  
  return this.save()
}

debateSystemSchema.methods.addSpeech = function(roundNumber, participantName, speechData) {
  const round = this.rounds.find(r => r.roundNumber === roundNumber) || 
    this.rounds[this.rounds.push({ roundNumber, speeches: [], phase: speechData.phase }) - 1]
  
  // Analyze speech content
  const analysis = this.analyzeSpeech(speechData.content.text)
  
  round.speeches.push({
    participantName,
    position: this.participants.find(p => p.name === participantName)?.position,
    content: speechData.content,
    analysis,
    duration: speechData.duration
  })
  
  // Update participant performance
  const participant = this.participants.find(p => p.name === participantName)
  if (participant) {
    participant.performance.argumentsPresented += speechData.content.arguments?.length || 0
    participant.performance.rebuttalsGiven += speechData.content.rebuttals?.length || 0
  }
  
  return this.save()
}

debateSystemSchema.methods.analyzeSpeech = function(text) {
  // Basic analysis - in a real implementation, this would use NLP libraries
  const wordCount = text.split(/\s+/).length
  const sentences = text.split(/[.!?]+/).length
  
  return {
    wordCount,
    readabilityScore: Math.max(0, 10 - (wordCount / sentences) / 2), // Simplified readability
    sentimentScore: 5, // Neutral sentiment as default
    logicalStructure: 7, // Default score
    evidenceQuality: 6,
    relevance: 8,
    persuasiveness: 7,
    formalityLevel: 8,
    emotionalAppeal: 5,
    logicalFallacies: [],
    factualAccuracy: 8,
    biasDetection: []
  }
}

debateSystemSchema.methods.scoreRound = function(roundNumber, scores) {
  const round = this.rounds.find(r => r.roundNumber === roundNumber)
  if (!round) throw new Error('Round not found')
  
  round.scores = scores
  
  // Determine round winner
  const highestScore = Math.max(...scores.map(s => s.totalScore))
  const winner = scores.find(s => s.totalScore === highestScore)
  round.winner = winner.participantName
  round.completedAt = new Date()
  
  this.progress.completedRounds = (this.progress.completedRounds || 0) + 1
  this.updateProgress()
  
  return this.save()
}

debateSystemSchema.methods.completeDebate = function() {
  this.status = 'completed'
  this.schedule.endTime = new Date()
  this.liveFeatures.isLive = false
  this.progress.completionPercentage = 100
  
  // Calculate final results
  this.calculateFinalResults()
  
  return this.save()
}

debateSystemSchema.methods.calculateFinalResults = function() {
  const participantScores = new Map()
  
  // Initialize participant scores
  this.participants.forEach(participant => {
    participantScores.set(participant.name, {
      participantName: participant.name,
      position: participant.position,
      totalScore: 0,
      roundsWon: 0,
      speechCount: 0,
      averageScore: 0,
      breakdown: {
        argumentation: 0,
        rebuttal: 0,
        evidence: 0,
        delivery: 0,
        persuasiveness: 0
      }
    })
  })
  
  // Accumulate scores from all rounds
  this.rounds.forEach(round => {
    if (round.winner) {
      const winnerStats = participantScores.get(round.winner)
      if (winnerStats) winnerStats.roundsWon += 1
    }
    
    round.scores.forEach(score => {
      const participantStats = participantScores.get(score.participantName)
      if (participantStats) {
        participantStats.totalScore += score.totalScore
        participantStats.speechCount += 1
      }
    })
  })
  
  // Calculate averages and determine overall winner
  const finalScores = Array.from(participantScores.values())
  finalScores.forEach(stats => {
    stats.averageScore = stats.speechCount > 0 ? stats.totalScore / stats.speechCount : 0
  })
  
  finalScores.sort((a, b) => b.totalScore - a.totalScore)
  
  this.results = {
    winner: {
      participantName: finalScores[0]?.participantName,
      position: finalScores[0]?.position,
      finalScore: finalScores[0]?.totalScore,
      winMargin: finalScores.length > 1 ? 
        finalScores[0].totalScore - finalScores[1].totalScore : 0
    },
    finalScores,
    statistics: {
      totalSpeeches: this.rounds.reduce((sum, r) => sum + r.speeches.length, 0),
      totalWords: this.calculateTotalWords(),
      argumentsPresented: this.totalArguments,
      rebuttalsGiven: this.calculateTotalRebuttals(),
      overallQuality: this.calculateOverallQuality()
    }
  }
}

debateSystemSchema.methods.calculateTotalWords = function() {
  return this.rounds.reduce((total, round) => {
    return total + round.speeches.reduce((speechTotal, speech) => {
      return speechTotal + (speech.analysis?.wordCount || 0)
    }, 0)
  }, 0)
}

debateSystemSchema.methods.calculateTotalRebuttals = function() {
  return this.rounds.reduce((total, round) => {
    return total + round.speeches.reduce((speechTotal, speech) => {
      return speechTotal + (speech.content.rebuttals?.length || 0)
    }, 0)
  }, 0)
}

debateSystemSchema.methods.calculateOverallQuality = function() {
  let totalQuality = 0
  let speechCount = 0
  
  this.rounds.forEach(round => {
    round.speeches.forEach(speech => {
      if (speech.analysis) {
        totalQuality += (
          speech.analysis.logicalStructure + 
          speech.analysis.evidenceQuality + 
          speech.analysis.relevance + 
          speech.analysis.persuasiveness
        ) / 4
        speechCount++
      }
    })
  })
  
  return speechCount > 0 ? totalQuality / speechCount : 0
}

debateSystemSchema.methods.updateProgress = function() {
  const totalRounds = this.rules.rounds.total
  const completedRounds = this.progress.completedRounds || 0
  
  this.progress.completionPercentage = Math.round((completedRounds / totalRounds) * 100)
  
  if (completedRounds >= totalRounds && this.status === 'in_progress') {
    this.completeDebate()
  }
}

debateSystemSchema.methods.addLiveComment = function(userId, content) {
  this.liveFeatures.liveComments.push({
    userId,
    content: content.substring(0, 500) // Limit comment length
  })
  
  // Keep only last 100 comments for performance
  if (this.liveFeatures.liveComments.length > 100) {
    this.liveFeatures.liveComments = this.liveFeatures.liveComments.slice(-100)
  }
  
  this.public.engagement.comments += 1
  return this.save()
}

debateSystemSchema.methods.recordLiveVote = function(position) {
  const now = new Date()
  
  // Find or create vote record for current minute
  const currentMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 
    now.getHours(), now.getMinutes())
  
  let voteRecord = this.liveFeatures.liveVotes.find(v => 
    v.timestamp.getTime() === currentMinute.getTime() && v.position === position
  )
  
  if (voteRecord) {
    voteRecord.count += 1
  } else {
    this.liveFeatures.liveVotes.push({
      timestamp: currentMinute,
      position,
      count: 1
    })
  }
  
  return this.save()
}

export default mongoose.model('DebateSystem', debateSystemSchema)