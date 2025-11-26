import mongoose from 'mongoose'

export interface IEmotionAnalysis extends mongoose.Document {
  experimentId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  title: string
  inputType: 'text' | 'image' | 'audio' | 'video' | 'voice'
  inputData: {
    content?: string
    fileUrl?: string
    duration?: number
    mimeType?: string
  }
  primaryEmotions: {
    emotion: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'disgust' | 'trust' | 'anticipation'
    intensity: number
    confidence: number
  }[]
  secondaryEmotions: {
    emotion: string
    intensity: number
    confidence: number
  }[]
  sentiment: {
    polarity: 'positive' | 'negative' | 'neutral'
    score: number
    confidence: number
  }
  mood: {
    overall: string
    energy: 'high' | 'medium' | 'low'
    valence: 'positive' | 'negative' | 'neutral'
    arousal: 'high' | 'medium' | 'low'
  }
  emotionalJourney: {
    timestamp: number
    emotion: string
    intensity: number
  }[]
  context: {
    keywords: string[]
    themes: string[]
    triggers: string[]
    relationships: string[]
  }
  insights: {
    dominantPattern: string
    emotionalComplexity: 'simple' | 'moderate' | 'complex'
    stability: 'stable' | 'fluctuating' | 'volatile'
    recommendations: string[]
  }
  aiModel: string
  processingMetrics: {
    processingTime: number
    confidence: number
    modelVersion: string
    accuracy?: number
  }
  visualization: {
    chartType: 'pie' | 'bar' | 'line' | 'radar' | 'heatmap'
    chartUrl?: string
    colors: string[]
  }
  comparison: {
    baseline?: mongoose.Types.ObjectId
    previousAnalysis?: mongoose.Types.ObjectId
    improvement?: number
  }
  tags: string[]
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
}

const emotionAnalysisSchema = new mongoose.Schema<IEmotionAnalysis>({
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
  inputType: {
    type: String,
    enum: ['text', 'image', 'audio', 'video', 'voice'],
    required: true,
    index: true
  },
  inputData: {
    content: { type: String, maxlength: 10000 },
    fileUrl: { type: String, maxlength: 500 },
    duration: { type: Number, min: 0 },
    mimeType: { type: String, maxlength: 100 }
  },
  primaryEmotions: [{
    emotion: {
      type: String,
      enum: ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'trust', 'anticipation'],
      required: true
    },
    intensity: { type: Number, required: true, min: 0, max: 1 },
    confidence: { type: Number, required: true, min: 0, max: 1 }
  }],
  secondaryEmotions: [{
    emotion: { type: String, required: true, maxlength: 50 },
    intensity: { type: Number, required: true, min: 0, max: 1 },
    confidence: { type: Number, required: true, min: 0, max: 1 }
  }],
  sentiment: {
    polarity: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      required: true,
      index: true
    },
    score: { type: Number, required: true, min: -1, max: 1 },
    confidence: { type: Number, required: true, min: 0, max: 1 }
  },
  mood: {
    overall: { type: String, required: true, maxlength: 100 },
    energy: { type: String, enum: ['high', 'medium', 'low'], required: true },
    valence: { type: String, enum: ['positive', 'negative', 'neutral'], required: true },
    arousal: { type: String, enum: ['high', 'medium', 'low'], required: true }
  },
  emotionalJourney: [{
    timestamp: { type: Number, required: true },
    emotion: { type: String, required: true, maxlength: 50 },
    intensity: { type: Number, required: true, min: 0, max: 1 }
  }],
  context: {
    keywords: [{ type: String, maxlength: 50 }],
    themes: [{ type: String, maxlength: 100 }],
    triggers: [{ type: String, maxlength: 100 }],
    relationships: [{ type: String, maxlength: 100 }]
  },
  insights: {
    dominantPattern: { type: String, required: true, maxlength: 200 },
    emotionalComplexity: {
      type: String,
      enum: ['simple', 'moderate', 'complex'],
      required: true,
      index: true
    },
    stability: {
      type: String,
      enum: ['stable', 'fluctuating', 'volatile'],
      required: true,
      index: true
    },
    recommendations: [{ type: String, maxlength: 500 }]
  },
  aiModel: {
    type: String,
    required: true,
    maxlength: 100
  },
  processingMetrics: {
    processingTime: { type: Number, required: true, min: 0 },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    modelVersion: { type: String, required: true, maxlength: 50 },
    accuracy: { type: Number, min: 0, max: 1 }
  },
  visualization: {
    chartType: {
      type: String,
      enum: ['pie', 'bar', 'line', 'radar', 'heatmap'],
      required: true
    },
    chartUrl: { type: String, maxlength: 500 },
    colors: [{ type: String, maxlength: 20 }]
  },
  comparison: {
    baseline: { type: mongoose.Schema.Types.ObjectId, ref: 'EmotionAnalysis' },
    previousAnalysis: { type: mongoose.Schema.Types.ObjectId, ref: 'EmotionAnalysis' },
    improvement: { type: Number, min: -100, max: 100 }
  },
  tags: [{ type: String, maxlength: 50 }],
  isPrivate: {
    type: Boolean,
    default: true,
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
emotionAnalysisSchema.index({ userId: 1, inputType: 1 })
emotionAnalysisSchema.index({ 'sentiment.polarity': 1, createdAt: -1 })
emotionAnalysisSchema.index({ 'mood.overall': 1 })
emotionAnalysisSchema.index({ tags: 1 })

// Methods
emotionAnalysisSchema.methods.getDominantEmotion = function() {
  return this.primaryEmotions.reduce((max, current) => 
    current.intensity > max.intensity ? current : max, 
    this.primaryEmotions[0]
  )
}

emotionAnalysisSchema.methods.getEmotionalScore = function() {
  const totalIntensity = this.primaryEmotions.reduce((sum, emotion) => sum + emotion.intensity, 0)
  return totalIntensity / this.primaryEmotions.length
}

const EmotionAnalysis = mongoose.models.EmotionAnalysis || mongoose.model<IEmotionAnalysis>('EmotionAnalysis', emotionAnalysisSchema)
export default EmotionAnalysis