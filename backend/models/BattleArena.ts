/**
 * Battle Arena Model
 * AI model battle system for comparing AI responses
 */

import mongoose from 'mongoose'

const battleArenaSchema = new mongoose.Schema({
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
    maxlength: 1000
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
  
  // Battle Configuration
  battleType: {
    type: String,
    enum: ['head_to_head', 'tournament', 'benchmark', 'custom'],
    required: true,
    default: 'head_to_head'
  },
  
  category: {
    type: String,
    enum: ['text_generation', 'code_generation', 'creative_writing', 'problem_solving', 'translation', 'summarization', 'qa', 'reasoning'],
    required: true
  },
  
  // Prompt and Context
  prompt: {
    original: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    
    context: String,
    constraints: String,
    expectedOutput: String,
    
    // Multiple prompts for complex battles
    variations: [{
      text: String,
      weight: { type: Number, min: 0, max: 1, default: 1 },
      description: String
    }]
  },
  
  // Participating Models
  models: [{
    name: {
      type: String,
      required: true,
      enum: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-sonnet', 'claude-3-haiku', 'gemini-pro', 'mistral-large', 'llama-2-70b', 'custom']
    },
    
    alias: String, // Display name for the model
    
    configuration: {
      temperature: { type: Number, min: 0, max: 2, default: 0.7 },
      maxTokens: { type: Number, min: 1, max: 8000, default: 1000 },
      topP: { type: Number, min: 0, max: 1, default: 0.9 },
      frequencyPenalty: { type: Number, min: -2, max: 2, default: 0 },
      presencePenalty: { type: Number, min: -2, max: 2, default: 0 },
      systemPrompt: String,
      customParameters: mongoose.Schema.Types.Mixed
    },
    
    metadata: {
      version: String,
      provider: String,
      cost: Number,
      latency: Number
    }
  }],
  
  // Battle Rounds and Results
  rounds: [{
    roundNumber: { type: Number, required: true },
    
    prompt: String, // Specific prompt for this round
    
    responses: [{
      modelName: String,
      response: {
        text: String,
        metadata: {
          tokens: Number,
          latency: Number,
          cost: Number,
          finishReason: String
        }
      },
      
      // Performance Metrics
      metrics: {
        relevance: { type: Number, min: 0, max: 10 },
        coherence: { type: Number, min: 0, max: 10 },
        creativity: { type: Number, min: 0, max: 10 },
        accuracy: { type: Number, min: 0, max: 10 },
        helpfulness: { type: Number, min: 0, max: 10 },
        safety: { type: Number, min: 0, max: 10 },
        overallScore: { type: Number, min: 0, max: 10 }
      },
      
      generatedAt: { type: Date, default: Date.now }
    }],
    
    // Round Results
    winner: String, // Model name that won this round
    
    reasoning: String, // Why this model won
    
    votes: [{
      userId: mongoose.Schema.Types.ObjectId,
      choice: String, // Model name voted for
      reasoning: String,
      votedAt: { type: Date, default: Date.now }
    }],
    
    completedAt: Date
  }],
  
  // Overall Battle Results
  results: {
    winner: String, // Overall winner model name
    
    finalScores: [{
      modelName: String,
      totalScore: Number,
      roundsWon: Number,
      averageMetrics: {
        relevance: Number,
        coherence: Number,
        creativity: Number,
        accuracy: Number,
        helpfulness: Number,
        safety: Number,
        overall: Number
      }
    }],
    
    statistics: {
      totalRounds: Number,
      totalResponses: Number,
      averageLatency: Number,
      totalCost: Number,
      participantVotes: Number
    },
    
    insights: [{
      category: String,
      observation: String,
      recommendation: String
    }]
  },
  
  // Evaluation Criteria
  evaluation: {
    method: {
      type: String,
      enum: ['automatic', 'human', 'hybrid', 'ai_judge'],
      default: 'hybrid'
    },
    
    criteria: [{
      name: String,
      description: String,
      weight: { type: Number, min: 0, max: 1, default: 1 },
      autoEvaluate: { type: Boolean, default: false }
    }],
    
    judges: [{
      type: {
        type: String,
        enum: ['human', 'ai_model', 'algorithm']
      },
      name: String,
      credentials: String,
      bias: String // Known biases or preferences
    }]
  },
  
  // Battle Settings
  settings: {
    maxRounds: { type: Number, default: 1, min: 1, max: 10 },
    timeLimit: Number, // seconds per response
    allowPublicVoting: { type: Boolean, default: true },
    requireJustification: { type: Boolean, default: false },
    anonymizeModels: { type: Boolean, default: false }, // Blind evaluation
    
    // Scoring weights
    weights: {
      relevance: { type: Number, default: 0.2 },
      coherence: { type: Number, default: 0.2 },
      creativity: { type: Number, default: 0.15 },
      accuracy: { type: Number, default: 0.25 },
      helpfulness: { type: Number, default: 0.15 },
      safety: { type: Number, default: 0.05 }
    }
  },
  
  // Status and Progress
  status: {
    type: String,
    enum: ['draft', 'setup', 'running', 'evaluating', 'completed', 'cancelled'],
    default: 'draft',
    index: true
  },
  
  progress: {
    currentRound: { type: Number, default: 0 },
    completedRounds: { type: Number, default: 0 },
    pendingEvaluations: { type: Number, default: 0 }
  },
  
  // Execution Timeline
  timeline: {
    createdAt: { type: Date, default: Date.now },
    startedAt: Date,
    completedAt: Date,
    duration: Number // in milliseconds
  },
  
  // Public Engagement
  public: {
    isPublic: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    
    engagement: {
      views: { type: Number, default: 0 },
      votes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      comments: { type: Number, default: 0 }
    }
  },
  
  // Comments and Community
  comments: [{
    userId: mongoose.Schema.Types.ObjectId,
    content: { type: String, maxlength: 1000 },
    roundNumber: Number, // If commenting on specific round
    modelName: String, // If commenting on specific model
    createdAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 }
  }],
  
  // Tags and Categories
  tags: [{
    type: String,
    trim: true
  }],
  
  // Error Handling
  errors: [{
    phase: String,
    modelName: String,
    errorCode: String,
    errorMessage: String,
    occurredAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
battleArenaSchema.index({ userId: 1, createdAt: -1 })
battleArenaSchema.index({ status: 1 })
battleArenaSchema.index({ category: 1, 'public.isPublic': 1 })
battleArenaSchema.index({ 'public.featured': 1, createdAt: -1 })
battleArenaSchema.index({ tags: 1 })
battleArenaSchema.index({ 'results.winner': 1 })

// Virtual for battle completion percentage
battleArenaSchema.virtual('completionPercentage').get(function() {
  if (this.settings.maxRounds === 0) return 0
  return Math.round((this.progress.completedRounds / this.settings.maxRounds) * 100)
})

// Virtual for total participants
battleArenaSchema.virtual('totalParticipants').get(function() {
  const voters = new Set()
  this.rounds.forEach(round => {
    round.votes.forEach(vote => voters.add(vote.userId.toString()))
  })
  return voters.size
})

// Virtual for average response time
battleArenaSchema.virtual('averageResponseTime').get(function() {
  let totalLatency = 0
  let responseCount = 0
  
  this.rounds.forEach(round => {
    round.responses.forEach(response => {
      if (response.response.metadata?.latency) {
        totalLatency += response.response.metadata.latency
        responseCount++
      }
    })
  })
  
  return responseCount > 0 ? totalLatency / responseCount : 0
})

// Static methods
battleArenaSchema.statics.findPublic = function(options = {}) {
  return this.find({ 'public.isPublic': true }, null, options)
    .populate('userId', 'name email')
    .sort({ 'public.featured': -1, createdAt: -1 })
}

battleArenaSchema.statics.findByCategory = function(category, options = {}) {
  return this.find({ category, 'public.isPublic': true }, null, options)
    .sort({ createdAt: -1 })
}

battleArenaSchema.statics.getFeaturedBattles = function(limit = 10) {
  return this.find({ 
    'public.featured': true, 
    status: 'completed' 
  })
    .limit(limit)
    .populate('userId', 'name email')
    .sort({ 'public.engagement.views': -1 })
}

battleArenaSchema.statics.getLeaderboard = function(timeframe = 30) {
  const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000)
  
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        'timeline.completedAt': { $gte: startDate }
      }
    },
    {
      $unwind: '$results.finalScores'
    },
    {
      $group: {
        _id: '$results.finalScores.modelName',
        totalBattles: { $sum: 1 },
        totalWins: {
          $sum: {
            $cond: [
              { $eq: ['$results.winner', '$results.finalScores.modelName'] },
              1, 0
            ]
          }
        },
        averageScore: { $avg: '$results.finalScores.totalScore' }
      }
    },
    {
      $project: {
        modelName: '$_id',
        totalBattles: 1,
        totalWins: 1,
        winRate: { $divide: ['$totalWins', '$totalBattles'] },
        averageScore: 1
      }
    },
    { $sort: { winRate: -1, averageScore: -1 } }
  ])
}

// Instance methods
battleArenaSchema.methods.startBattle = function() {
  this.status = 'running'
  this.timeline.startedAt = new Date()
  return this.save()
}

battleArenaSchema.methods.addRound = function(roundData) {
  const roundNumber = this.rounds.length + 1
  
  this.rounds.push({
    roundNumber,
    ...roundData
  })
  
  this.progress.currentRound = roundNumber
  return this.save()
}

battleArenaSchema.methods.completeRound = function(roundNumber, results) {
  const round = this.rounds.find(r => r.roundNumber === roundNumber)
  if (!round) throw new Error('Round not found')
  
  round.winner = results.winner
  round.reasoning = results.reasoning
  round.completedAt = new Date()
  
  this.progress.completedRounds += 1
  
  // Check if battle is complete
  if (this.progress.completedRounds >= this.settings.maxRounds) {
    this.completeBattle()
  }
  
  return this.save()
}

battleArenaSchema.methods.completeBattle = function() {
  this.status = 'completed'
  this.timeline.completedAt = new Date()
  this.timeline.duration = this.timeline.completedAt - this.timeline.startedAt
  
  // Calculate final results
  this.calculateFinalResults()
  
  return this.save()
}

battleArenaSchema.methods.calculateFinalResults = function() {
  const modelScores = new Map()
  
  // Initialize scores for each model
  this.models.forEach(model => {
    modelScores.set(model.name, {
      modelName: model.name,
      totalScore: 0,
      roundsWon: 0,
      responses: 0,
      metrics: {
        relevance: [],
        coherence: [],
        creativity: [],
        accuracy: [],
        helpfulness: [],
        safety: [],
        overall: []
      }
    })
  })
  
  // Accumulate scores from all rounds
  this.rounds.forEach(round => {
    if (round.winner) {
      const winnerStats = modelScores.get(round.winner)
      if (winnerStats) winnerStats.roundsWon += 1
    }
    
    round.responses.forEach(response => {
      const stats = modelScores.get(response.modelName)
      if (stats && response.metrics) {
        stats.responses += 1
        Object.keys(response.metrics).forEach(metric => {
          if (metric !== 'overallScore' && stats.metrics[metric]) {
            stats.metrics[metric].push(response.metrics[metric])
          }
        })
      }
    })
  })
  
  // Calculate averages and final scores
  const finalScores = []
  for (const [modelName, stats] of modelScores) {
    const averageMetrics = {}
    let totalWeightedScore = 0
    
    Object.keys(stats.metrics).forEach(metric => {
      const values = stats.metrics[metric]
      if (values.length > 0) {
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length
        averageMetrics[metric] = avg
        
        const weight = this.settings.weights[metric] || 0
        totalWeightedScore += avg * weight
      }
    })
    
    finalScores.push({
      modelName,
      totalScore: totalWeightedScore,
      roundsWon: stats.roundsWon,
      averageMetrics
    })
  }
  
  // Sort by total score and determine winner
  finalScores.sort((a, b) => b.totalScore - a.totalScore)
  
  this.results = {
    winner: finalScores[0]?.modelName,
    finalScores,
    statistics: {
      totalRounds: this.rounds.length,
      totalResponses: this.rounds.reduce((sum, r) => sum + r.responses.length, 0),
      averageLatency: this.averageResponseTime,
      totalCost: this.calculateTotalCost(),
      participantVotes: this.totalParticipants
    }
  }
}

battleArenaSchema.methods.calculateTotalCost = function() {
  let totalCost = 0
  this.rounds.forEach(round => {
    round.responses.forEach(response => {
      if (response.response.metadata?.cost) {
        totalCost += response.response.metadata.cost
      }
    })
  })
  return totalCost
}

battleArenaSchema.methods.addVote = function(roundNumber, userId, choice, reasoning) {
  const round = this.rounds.find(r => r.roundNumber === roundNumber)
  if (!round) throw new Error('Round not found')
  
  // Remove existing vote from this user for this round
  round.votes = round.votes.filter(v => v.userId.toString() !== userId.toString())
  
  // Add new vote
  round.votes.push({
    userId,
    choice,
    reasoning
  })
  
  this.public.engagement.votes += 1
  return this.save()
}

export default mongoose.model('BattleArena', battleArenaSchema)