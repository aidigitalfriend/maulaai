import mongoose from 'mongoose'

export interface IDreamAnalysis extends mongoose.Document {
  experimentId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  dreamTitle: string
  dreamDescription: string
  dreamDate?: Date
  sleepDuration?: number
  emotions: string[]
  symbols: {
    symbol: string
    significance: string
    frequency: number
  }[]
  themes: string[]
  interpretation: {
    psychological: string
    symbolic: string
    spiritual?: string
    predictive?: string
  }
  mood: {
    before: 'anxious' | 'calm' | 'excited' | 'neutral' | 'sad' | 'happy'
    after: 'anxious' | 'calm' | 'excited' | 'neutral' | 'sad' | 'happy'
    overall: 'positive' | 'negative' | 'neutral' | 'mixed'
  }
  clarity: 'very_clear' | 'clear' | 'somewhat_clear' | 'vague' | 'very_vague'
  type: 'nightmare' | 'lucid' | 'recurring' | 'prophetic' | 'normal' | 'fantasy'
  aiAnalysis: {
    confidence: number
    keywords: string[]
    sentiment: 'positive' | 'negative' | 'neutral'
    complexity: 'simple' | 'moderate' | 'complex'
    archetypes: string[]
  }
  relatedDreams: mongoose.Types.ObjectId[]
  tags: string[]
  isPrivate: boolean
  rating?: number
  feedback: string
  processingTime: number
  createdAt: Date
  updatedAt: Date
}

const dreamAnalysisSchema = new mongoose.Schema<IDreamAnalysis>({
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
  dreamTitle: {
    type: String,
    required: true,
    maxlength: 200
  },
  dreamDescription: {
    type: String,
    required: true,
    maxlength: 5000
  },
  dreamDate: {
    type: Date,
    index: true
  },
  sleepDuration: {
    type: Number,
    min: 0,
    max: 24
  },
  emotions: [{
    type: String,
    maxlength: 50
  }],
  symbols: [{
    symbol: { type: String, required: true, maxlength: 100 },
    significance: { type: String, required: true, maxlength: 500 },
    frequency: { type: Number, min: 1, max: 10 }
  }],
  themes: [{
    type: String,
    maxlength: 100
  }],
  interpretation: {
    psychological: { type: String, required: true, maxlength: 2000 },
    symbolic: { type: String, required: true, maxlength: 2000 },
    spiritual: { type: String, maxlength: 1000 },
    predictive: { type: String, maxlength: 1000 }
  },
  mood: {
    before: {
      type: String,
      enum: ['anxious', 'calm', 'excited', 'neutral', 'sad', 'happy'],
      required: true
    },
    after: {
      type: String,
      enum: ['anxious', 'calm', 'excited', 'neutral', 'sad', 'happy'],
      required: true
    },
    overall: {
      type: String,
      enum: ['positive', 'negative', 'neutral', 'mixed'],
      required: true,
      index: true
    }
  },
  clarity: {
    type: String,
    enum: ['very_clear', 'clear', 'somewhat_clear', 'vague', 'very_vague'],
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['nightmare', 'lucid', 'recurring', 'prophetic', 'normal', 'fantasy'],
    required: true,
    index: true
  },
  aiAnalysis: {
    confidence: { type: Number, required: true, min: 0, max: 1 },
    keywords: [{ type: String, maxlength: 50 }],
    sentiment: { type: String, enum: ['positive', 'negative', 'neutral'], required: true },
    complexity: { type: String, enum: ['simple', 'moderate', 'complex'], required: true },
    archetypes: [{ type: String, maxlength: 100 }]
  },
  relatedDreams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DreamAnalysis'
  }],
  tags: [{
    type: String,
    maxlength: 50
  }],
  isPrivate: {
    type: Boolean,
    default: true,
    index: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: 1000
  },
  processingTime: {
    type: Number,
    required: true,
    min: 0
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
dreamAnalysisSchema.index({ userId: 1, type: 1 })
dreamAnalysisSchema.index({ dreamDate: -1 })
dreamAnalysisSchema.index({ themes: 1 })
dreamAnalysisSchema.index({ 'mood.overall': 1, clarity: 1 })

// Methods
dreamAnalysisSchema.methods.findRelatedDreams = async function() {
  const commonThemes = this.themes
  const commonSymbols = this.symbols.map(s => s.symbol)
  
  return await mongoose.model('DreamAnalysis').find({
    _id: { $ne: this._id },
    userId: this.userId,
    $or: [
      { themes: { $in: commonThemes } },
      { 'symbols.symbol': { $in: commonSymbols } }
    ]
  }).limit(10).sort({ createdAt: -1 })
}

dreamAnalysisSchema.methods.updateRelatedDreams = async function() {
  const related = await this.findRelatedDreams()
  this.relatedDreams = related.map(dream => dream._id)
  return this.save()
}

const DreamAnalysis = mongoose.models.DreamAnalysis || mongoose.model<IDreamAnalysis>('DreamAnalysis', dreamAnalysisSchema)
export default DreamAnalysis