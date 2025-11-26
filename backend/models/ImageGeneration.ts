/**
 * Image Generation Model
 * Handles AI-powered image creation, editing, and manipulation
 */

import mongoose from 'mongoose'

const imageGenerationSchema = new mongoose.Schema({
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
    required: true
  },
  
  experimentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabExperiment'
  },
  
  // Image Generation Configuration
  prompt: {
    original: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    processed: String, // AI-enhanced or modified prompt
    negative: String,  // Negative prompt for what to avoid
    keywords: [String],
    style: String,
    mood: String,
    composition: String
  },
  
  // Generation Parameters
  parameters: {
    // AI Model Configuration
    aiModel: {
      type: String,
      enum: ['dall-e-3', 'dall-e-2', 'midjourney', 'stable-diffusion', 'firefly', 'custom'],
      required: true
    },
    
    // Image Specifications
    dimensions: {
      width: {
        type: Number,
        required: true,
        min: 64,
        max: 2048
      },
      height: {
        type: Number,
        required: true,
        min: 64,
        max: 2048
      },
      aspectRatio: String // e.g., "16:9", "1:1", "4:3"
    },
    
    // Quality and Style
    quality: {
      type: String,
      enum: ['draft', 'standard', 'hd', 'ultra'],
      default: 'standard'
    },
    
    style: {
      type: String,
      enum: ['photorealistic', 'digital_art', 'oil_painting', 'watercolor', 'sketch', 'cartoon', 'anime', 'abstract', 'minimalist', 'vintage', 'cyberpunk', 'fantasy', 'sci_fi']
    },
    
    // Generation Control
    creativity: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.7
    },
    
    guidance: {
      type: Number,
      min: 1,
      max: 20,
      default: 7
    },
    
    steps: {
      type: Number,
      min: 10,
      max: 150,
      default: 50
    },
    
    seed: Number, // For reproducible results
    
    // Advanced Parameters
    sampling: {
      method: {
        type: String,
        enum: ['euler', 'euler_a', 'dpm', 'ddim', 'plms']
      },
      scheduler: String
    },
    
    // Image Enhancement
    upscaling: {
      enabled: { type: Boolean, default: false },
      factor: { type: Number, enum: [2, 4, 8], default: 2 },
      method: { type: String, enum: ['esrgan', 'real-esrgan', 'waifu2x'] }
    },
    
    postProcessing: {
      colorCorrection: { type: Boolean, default: false },
      sharpening: { type: Boolean, default: false },
      noiseReduction: { type: Boolean, default: false }
    }
  },
  
  // Reference Images
  referenceImages: [{
    filename: String,
    path: String,
    influence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    type: {
      type: String,
      enum: ['style', 'composition', 'subject', 'color', 'lighting']
    }
  }],
  
  // Generation Results
  results: {
    // Generated Images
    images: [{
      filename: String,
      path: String,
      url: String,
      size: Number, // in bytes
      dimensions: {
        width: Number,
        height: Number
      },
      format: {
        type: String,
        enum: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg']
      },
      metadata: {
        colorProfile: String,
        dpi: Number,
        compression: String,
        hasTransparency: Boolean
      },
      generatedAt: { type: Date, default: Date.now },
      isSelected: { type: Boolean, default: false }, // User's favorite
      rating: { type: Number, min: 1, max: 5 }
    }],
    
    // Variations and Alternatives
    variations: [{
      parentImageId: mongoose.Schema.Types.ObjectId,
      filename: String,
      path: String,
      url: String,
      variationType: {
        type: String,
        enum: ['style_variation', 'composition_variation', 'color_variation', 'detail_enhancement']
      },
      parameters: mongoose.Schema.Types.Mixed
    }],
    
    // Generation Analytics
    analytics: {
      totalGenerations: { type: Number, default: 1 },
      successfulGenerations: { type: Number, default: 0 },
      failedGenerations: { type: Number, default: 0 },
      averageGenerationTime: Number, // in milliseconds
      totalComputeTime: Number,
      resourcesUsed: {
        gpu: String,
        memory: String,
        storage: String
      }
    },
    
    // Quality Assessment
    qualityMetrics: {
      aestheticScore: { type: Number, min: 0, max: 10 },
      promptAdherence: { type: Number, min: 0, max: 10 },
      technicalQuality: { type: Number, min: 0, max: 10 },
      originality: { type: Number, min: 0, max: 10 },
      userRating: { type: Number, min: 1, max: 5 }
    }
  },
  
  // Processing Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  progress: {
    percentage: { type: Number, min: 0, max: 100, default: 0 },
    currentStep: String,
    estimatedTimeRemaining: Number // in seconds
  },
  
  // Generation History
  generationHistory: [{
    attempt: Number,
    parameters: mongoose.Schema.Types.Mixed,
    startedAt: Date,
    completedAt: Date,
    duration: Number,
    success: Boolean,
    errorMessage: String,
    resultImageId: mongoose.Schema.Types.ObjectId
  }],
  
  // Execution Details
  execution: {
    startedAt: Date,
    completedAt: Date,
    duration: Number, // in milliseconds
    computeResources: {
      gpu: String,
      memory: String,
      processingNode: String
    },
    errors: [{
      message: String,
      code: String,
      stack: String,
      timestamp: { type: Date, default: Date.now }
    }],
    logs: [{
      level: {
        type: String,
        enum: ['info', 'warning', 'error', 'debug']
      },
      message: String,
      timestamp: { type: Date, default: Date.now }
    }]
  },
  
  // Sharing and Collaboration
  isPublic: {
    type: Boolean,
    default: false
  },
  
  license: {
    type: String,
    enum: ['private', 'cc0', 'cc_by', 'cc_by_sa', 'cc_by_nc', 'custom'],
    default: 'private'
  },
  
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer'
    },
    permissions: [{
      type: String,
      enum: ['view', 'download', 'edit', 'remix', 'commercial_use']
    }],
    addedAt: { type: Date, default: Date.now }
  }],
  
  tags: [{
    type: String,
    trim: true
  }],
  
  // Commercial and Usage
  commercialUse: {
    allowed: { type: Boolean, default: false },
    restrictions: String,
    license: String
  },
  
  attribution: {
    required: { type: Boolean, default: true },
    text: String,
    url: String
  },
  
  // Versioning and Remixing
  version: {
    type: Number,
    default: 1
  },
  
  parentGenerationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ImageGeneration'
  },
  
  remixes: [{
    childGenerationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ImageGeneration'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
imageGenerationSchema.index({ userId: 1, createdAt: -1 })
imageGenerationSchema.index({ experimentId: 1 })
imageGenerationSchema.index({ status: 1 })
imageGenerationSchema.index({ 'parameters.aiModel': 1 })
imageGenerationSchema.index({ 'parameters.style': 1 })
imageGenerationSchema.index({ tags: 1 })
imageGenerationSchema.index({ isPublic: 1, createdAt: -1 })
imageGenerationSchema.index({ 'results.qualityMetrics.userRating': -1 })
imageGenerationSchema.index({ 'results.qualityMetrics.aestheticScore': -1 })

// Virtual for total images generated
imageGenerationSchema.virtual('totalImages').get(function() {
  return this.results.images?.length || 0
})

// Virtual for best rated image
imageGenerationSchema.virtual('bestImage').get(function() {
  if (!this.results.images?.length) return null
  
  return this.results.images
    .filter(img => img.rating)
    .sort((a, b) => b.rating - a.rating)[0] || this.results.images[0]
})

// Virtual for generation efficiency score
imageGenerationSchema.virtual('efficiencyScore').get(function() {
  const analytics = this.results.analytics
  if (!analytics || !analytics.totalGenerations) return 0
  
  const successRate = analytics.successfulGenerations / analytics.totalGenerations
  const timeScore = analytics.averageGenerationTime ? Math.max(0, 1 - (analytics.averageGenerationTime / 300000)) : 0 // Normalize to 5 minutes
  
  return Math.round((successRate * 0.7 + timeScore * 0.3) * 100) / 100
})

// Pre-save middleware
imageGenerationSchema.pre('save', function(next) {
  // Update progress based on status
  if (this.status === 'completed') {
    this.progress.percentage = 100
    if (!this.execution.completedAt) {
      this.execution.completedAt = new Date()
    }
  }
  
  // Calculate execution duration
  if (this.execution.startedAt && this.execution.completedAt) {
    this.execution.duration = this.execution.completedAt - this.execution.startedAt
  }
  
  // Update analytics
  if (this.results.images?.length) {
    this.results.analytics.successfulGenerations = this.results.images.length
    
    if (this.execution.duration) {
      this.results.analytics.averageGenerationTime = this.execution.duration
    }
  }
  
  next()
})

// Static methods
imageGenerationSchema.statics.findByUser = function(userId, options = {}) {
  const query = { 
    $or: [
      { userId },
      { collaborators: { $elemMatch: { userId } } }
    ]
  }
  
  return this.find(query, null, options)
    .populate('userId', 'name email')
    .populate('experimentId', 'title description')
    .sort(options.sort || { createdAt: -1 })
}

imageGenerationSchema.statics.findPublic = function(options = {}) {
  return this.find({ isPublic: true }, null, options)
    .populate('userId', 'name email')
    .sort(options.sort || { 'results.qualityMetrics.userRating': -1, createdAt: -1 })
}

imageGenerationSchema.statics.findByStyle = function(style, options = {}) {
  return this.find({ 'parameters.style': style }, null, options)
    .populate('userId', 'name email')
    .sort(options.sort || { createdAt: -1 })
}

// Instance methods
imageGenerationSchema.methods.addImage = function(imageData) {
  this.results.images.push({
    ...imageData,
    generatedAt: new Date()
  })
  
  // Update analytics
  this.results.analytics.totalGenerations = (this.results.analytics.totalGenerations || 0) + 1
  this.results.analytics.successfulGenerations = this.results.images.length
  
  return this.save()
}

imageGenerationSchema.methods.rateImage = function(imageId, rating) {
  const image = this.results.images.id(imageId)
  if (image) {
    image.rating = rating
    
    // Update overall quality metrics
    const avgRating = this.results.images
      .filter(img => img.rating)
      .reduce((sum, img) => sum + img.rating, 0) / this.results.images.filter(img => img.rating).length
    
    this.results.qualityMetrics.userRating = avgRating
    
    return this.save()
  }
  throw new Error('Image not found')
}

imageGenerationSchema.methods.selectImage = function(imageId) {
  // Deselect all images
  this.results.images.forEach(img => img.isSelected = false)
  
  // Select the specified image
  const image = this.results.images.id(imageId)
  if (image) {
    image.isSelected = true
    return this.save()
  }
  throw new Error('Image not found')
}

imageGenerationSchema.methods.createVariation = function(imageId, variationType, parameters) {
  const variation = {
    parentImageId: imageId,
    variationType,
    parameters,
    generatedAt: new Date()
  }
  
  this.results.variations.push(variation)
  return this.save()
}

imageGenerationSchema.methods.updateProgress = function(percentage, step) {
  this.progress.percentage = percentage
  this.progress.currentStep = step
  return this.save()
}

export default mongoose.model('ImageGeneration', imageGenerationSchema)