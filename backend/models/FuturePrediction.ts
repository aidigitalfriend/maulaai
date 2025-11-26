import mongoose from 'mongoose'

export interface IFuturePrediction extends mongoose.Document {
  experimentId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  title: string
  predictionType: 'personal' | 'business' | 'technology' | 'society' | 'economy' | 'environment' | 'health'
  timeframe: {
    period: 'short' | 'medium' | 'long' // short: 1-30 days, medium: 1-12 months, long: 1-10 years
    specificDate?: Date
    duration: number // in days
  }
  inputData: {
    context: string
    currentSituation: string
    historicalData?: string
    externalFactors?: string[]
    constraints?: string[]
  }
  predictions: {
    scenario: 'optimistic' | 'realistic' | 'pessimistic'
    outcome: string
    probability: number // 0-1
    confidence: number // 0-1
    keyFactors: string[]
    timeline: {
      milestone: string
      expectedDate: Date
      probability: number
    }[]
  }[]
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical'
    factors: {
      risk: string
      impact: 'low' | 'medium' | 'high'
      probability: number
      mitigation: string
    }[]
  }
  opportunities: {
    opportunity: string
    potential: 'low' | 'medium' | 'high'
    timeline: string
    requirements: string[]
  }[]
  recommendations: {
    action: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    timeline: string
    expectedOutcome: string
  }[]
  methodology: {
    aiModels: string[]
    dataSources: string[]
    analysisMethod: string
    assumptions: string[]
    limitations: string[]
  }
  accuracy: {
    historicalAccuracy?: number
    modelConfidence: number
    uncertaintyRange: number
    validationMethod?: string
  }
  followUp: {
    reviewDate?: Date
    actualOutcome?: string
    accuracyScore?: number
    lessons?: string
    refinements?: string
  }
  tags: string[]
  isShared: boolean
  visibility: 'private' | 'friends' | 'public'
  createdAt: Date
  updatedAt: Date
}

const futurePredictionSchema = new mongoose.Schema<IFuturePrediction>({
  experimentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabExperiment',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  predictionType: {
    type: String,
    enum: ['personal', 'business', 'technology', 'society', 'economy', 'environment', 'health'],
    required: true,
    index: true
  },
  timeframe: {
    period: {
      type: String,
      enum: ['short', 'medium', 'long'],
      required: true,
      index: true
    },
    specificDate: { type: Date },
    duration: { type: Number, required: true, min: 1 }
  },
  inputData: {
    context: { type: String, required: true, maxlength: 2000 },
    currentSituation: { type: String, required: true, maxlength: 2000 },
    historicalData: { type: String, maxlength: 3000 },
    externalFactors: [{ type: String, maxlength: 200 }],
    constraints: [{ type: String, maxlength: 200 }]
  },
  predictions: [{
    scenario: {
      type: String,
      enum: ['optimistic', 'realistic', 'pessimistic'],
      required: true
    },
    outcome: { type: String, required: true, maxlength: 1000 },
    probability: { type: Number, required: true, min: 0, max: 1 },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    keyFactors: [{ type: String, maxlength: 200 }],
    timeline: [{
      milestone: { type: String, required: true, maxlength: 200 },
      expectedDate: { type: Date, required: true },
      probability: { type: Number, required: true, min: 0, max: 1 }
    }]
  }],
  riskAssessment: {
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
      index: true
    },
    factors: [{
      risk: { type: String, required: true, maxlength: 300 },
      impact: { type: String, enum: ['low', 'medium', 'high'], required: true },
      probability: { type: Number, required: true, min: 0, max: 1 },
      mitigation: { type: String, required: true, maxlength: 500 }
    }]
  },
  opportunities: [{
    opportunity: { type: String, required: true, maxlength: 300 },
    potential: { type: String, enum: ['low', 'medium', 'high'], required: true },
    timeline: { type: String, required: true, maxlength: 100 },
    requirements: [{ type: String, maxlength: 200 }]
  }],
  recommendations: [{
    action: { type: String, required: true, maxlength: 300 },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], required: true },
    timeline: { type: String, required: true, maxlength: 100 },
    expectedOutcome: { type: String, required: true, maxlength: 300 }
  }],
  methodology: {
    aiModels: [{ type: String, maxlength: 100 }],
    dataSources: [{ type: String, maxlength: 200 }],
    analysisMethod: { type: String, required: true, maxlength: 300 },
    assumptions: [{ type: String, maxlength: 200 }],
    limitations: [{ type: String, maxlength: 200 }]
  },
  accuracy: {
    historicalAccuracy: { type: Number, min: 0, max: 1 },
    modelConfidence: { type: Number, required: true, min: 0, max: 1 },
    uncertaintyRange: { type: Number, required: true, min: 0, max: 1 },
    validationMethod: { type: String, maxlength: 200 }
  },
  followUp: {
    reviewDate: { type: Date },
    actualOutcome: { type: String, maxlength: 1000 },
    accuracyScore: { type: Number, min: 0, max: 1 },
    lessons: { type: String, maxlength: 1000 },
    refinements: { type: String, maxlength: 1000 }
  },
  tags: [{ type: String, maxlength: 50 }],
  isShared: {
    type: Boolean,
    default: false,
    index: true
  },
  visibility: {
    type: String,
    enum: ['private', 'friends', 'public'],
    default: 'private',
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes
futurePredictionSchema.index({ userId: 1, predictionType: 1 })
futurePredictionSchema.index({ 'timeframe.period': 1, 'riskAssessment.level': 1 })
futurePredictionSchema.index({ tags: 1 })
futurePredictionSchema.index({ 'followUp.reviewDate': 1 })

// Methods
futurePredictionSchema.methods.getMostLikelyScenario = function() {
  return this.predictions.reduce((max, current) => 
    current.probability > max.probability ? current : max,
    this.predictions[0]
  )
}

futurePredictionSchema.methods.updateAccuracy = function(actualOutcome: string, accuracyScore: number) {
  this.followUp.actualOutcome = actualOutcome
  this.followUp.accuracyScore = accuracyScore
  this.updatedAt = new Date()
  return this.save()
}

futurePredictionSchema.methods.scheduleReview = function(reviewDate: Date) {
  this.followUp.reviewDate = reviewDate
  return this.save()
}

const FuturePrediction = mongoose.models.FuturePrediction || mongoose.model<IFuturePrediction>('FuturePrediction', futurePredictionSchema)
export default FuturePrediction