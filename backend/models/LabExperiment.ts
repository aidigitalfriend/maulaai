import mongoose from 'mongoose'

export interface ILabExperiment extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  experimentType: 'neural-art' | 'dream-analysis' | 'emotion-analysis' | 'future-prediction' | 
                 'image-generation' | 'music-generation' | 'voice-cloning' | 'story-generation' | 
                 'personality-analysis' | 'battle-arena' | 'debate-arena'
  title: string
  description?: string
  parameters: Record<string, any>
  inputData: Record<string, any>
  outputData?: Record<string, any>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  estimatedDuration?: number
  actualDuration?: number
  errorMessage?: string
  resultUrl?: string
  tags: string[]
  isPublic: boolean
  likeCount: number
  shareCount: number
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

const labExperimentSchema = new mongoose.Schema<ILabExperiment>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  experimentType: {
    type: String,
    enum: ['neural-art', 'dream-analysis', 'emotion-analysis', 'future-prediction', 
           'image-generation', 'music-generation', 'voice-cloning', 'story-generation', 
           'personality-analysis', 'battle-arena', 'debate-arena'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  inputData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  outputData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  estimatedDuration: {
    type: Number,
    min: 0
  },
  actualDuration: {
    type: Number,
    min: 0
  },
  errorMessage: {
    type: String,
    maxlength: 1000
  },
  resultUrl: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  likeCount: {
    type: Number,
    default: 0,
    min: 0
  },
  shareCount: {
    type: Number,
    default: 0,
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
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Indexes for better query performance
labExperimentSchema.index({ userId: 1, experimentType: 1 })
labExperimentSchema.index({ experimentType: 1, status: 1 })
labExperimentSchema.index({ isPublic: 1, likeCount: -1 })
labExperimentSchema.index({ createdAt: -1 })

// Methods
labExperimentSchema.methods.updateProgress = function(progress: number, status?: string) {
  this.progress = Math.max(0, Math.min(100, progress))
  if (status) this.status = status
  if (progress === 100 && status === 'completed') {
    this.completedAt = new Date()
  }
  this.updatedAt = new Date()
  return this.save()
}

labExperimentSchema.methods.markCompleted = function(outputData: any, resultUrl?: string) {
  this.status = 'completed'
  this.progress = 100
  this.outputData = outputData
  if (resultUrl) this.resultUrl = resultUrl
  this.completedAt = new Date()
  this.updatedAt = new Date()
  return this.save()
}

labExperimentSchema.methods.markFailed = function(error: string) {
  this.status = 'failed'
  this.errorMessage = error
  this.updatedAt = new Date()
  return this.save()
}

const LabExperiment = mongoose.models.LabExperiment || mongoose.model<ILabExperiment>('LabExperiment', labExperimentSchema)
export default LabExperiment