import mongoose from 'mongoose'

export interface INeuralArtGeneration extends mongoose.Document {
  experimentId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  title: string
  prompt: string
  negativePrompt?: string
  style: 'abstract' | 'realistic' | 'impressionist' | 'surreal' | 'minimalist' | 'cyberpunk'
  dimensions: {
    width: number
    height: number
  }
  model: string
  steps: number
  guidance: number
  seed?: number
  imageUrl?: string
  thumbnailUrl?: string
  processingTime?: number
  aiModel: string
  parameters: {
    temperature?: number
    topP?: number
    iterations?: number
    styleMix?: number
  }
  metadata: {
    colors: string[]
    dominantColor: string
    complexity: 'low' | 'medium' | 'high'
    mood: string
  }
  rating?: number
  likes: mongoose.Types.ObjectId[]
  comments: {
    userId: mongoose.Types.ObjectId
    comment: string
    createdAt: Date
  }[]
  collections: string[]
  isNSFW: boolean
  createdAt: Date
  updatedAt: Date
}

const neuralArtGenerationSchema = new mongoose.Schema<INeuralArtGeneration>({
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
  prompt: {
    type: String,
    required: true,
    maxlength: 2000
  },
  negativePrompt: {
    type: String,
    maxlength: 1000
  },
  style: {
    type: String,
    enum: ['abstract', 'realistic', 'impressionist', 'surreal', 'minimalist', 'cyberpunk'],
    required: true,
    index: true
  },
  dimensions: {
    width: { type: Number, required: true, min: 64, max: 2048 },
    height: { type: Number, required: true, min: 64, max: 2048 }
  },
  model: {
    type: String,
    required: true
  },
  steps: {
    type: Number,
    required: true,
    min: 1,
    max: 150
  },
  guidance: {
    type: Number,
    required: true,
    min: 0,
    max: 20
  },
  seed: {
    type: Number
  },
  imageUrl: {
    type: String,
    maxlength: 500
  },
  thumbnailUrl: {
    type: String,
    maxlength: 500
  },
  processingTime: {
    type: Number,
    min: 0
  },
  aiModel: {
    type: String,
    required: true
  },
  parameters: {
    temperature: { type: Number, min: 0, max: 2 },
    topP: { type: Number, min: 0, max: 1 },
    iterations: { type: Number, min: 1, max: 100 },
    styleMix: { type: Number, min: 0, max: 1 }
  },
  metadata: {
    colors: [{ type: String }],
    dominantColor: { type: String },
    complexity: { type: String, enum: ['low', 'medium', 'high'] },
    mood: { type: String }
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now }
  }],
  collections: [{
    type: String,
    maxlength: 100
  }],
  isNSFW: {
    type: Boolean,
    default: false,
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
neuralArtGenerationSchema.index({ userId: 1, style: 1 })
neuralArtGenerationSchema.index({ style: 1, createdAt: -1 })
neuralArtGenerationSchema.index({ 'likes': 1 })
neuralArtGenerationSchema.index({ collections: 1 })

// Methods
neuralArtGenerationSchema.methods.addLike = function(userId: mongoose.Types.ObjectId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId)
    return this.save()
  }
  return Promise.resolve(this)
}

neuralArtGenerationSchema.methods.removeLike = function(userId: mongoose.Types.ObjectId) {
  this.likes = this.likes.filter(id => !id.equals(userId))
  return this.save()
}

neuralArtGenerationSchema.methods.addComment = function(userId: mongoose.Types.ObjectId, comment: string) {
  this.comments.push({ userId, comment, createdAt: new Date() })
  return this.save()
}

const NeuralArtGeneration = mongoose.models.NeuralArtGeneration || mongoose.model<INeuralArtGeneration>('NeuralArtGeneration', neuralArtGenerationSchema)
export default NeuralArtGeneration