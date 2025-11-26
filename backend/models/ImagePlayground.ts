/**
 * Image Playground Model
 * Interactive image generation and manipulation system
 */

import mongoose from 'mongoose'

const imagePlaygroundSchema = new mongoose.Schema({
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
  
  // Project Configuration
  projectType: {
    type: String,
    enum: ['single_generation', 'batch_generation', 'style_transfer', 'image_editing', 'collage', 'animation_sequence'],
    required: true,
    default: 'single_generation'
  },
  
  category: {
    type: String,
    enum: ['art', 'photography', 'design', 'illustration', 'concept_art', 'product', 'architecture', 'character', 'landscape', 'abstract'],
    required: true
  },
  
  // Generation Configuration
  generation: {
    // Primary Settings
    model: {
      type: String,
      enum: ['dall-e-3', 'dall-e-2', 'midjourney', 'stable-diffusion', 'firefly', 'imagen'],
      required: true,
      default: 'dall-e-3'
    },
    
    quality: {
      type: String,
      enum: ['standard', 'hd', 'ultra'],
      default: 'standard'
    },
    
    size: {
      type: String,
      enum: ['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'],
      default: '1024x1024'
    },
    
    style: {
      type: String,
      enum: ['natural', 'vivid', 'artistic', 'photographic', 'anime', 'digital_art', 'oil_painting', 'watercolor'],
      default: 'natural'
    },
    
    // Advanced Parameters
    parameters: {
      cfgScale: { type: Number, min: 1, max: 30, default: 7.5 },
      steps: { type: Number, min: 10, max: 150, default: 50 },
      seed: Number,
      sampler: {
        type: String,
        enum: ['euler', 'euler_a', 'heun', 'dpm', 'lms', 'ddim', 'plms'],
        default: 'euler'
      },
      
      // Style Controls
      creativity: { type: Number, min: 0, max: 1, default: 0.7 },
      coherence: { type: Number, min: 0, max: 1, default: 0.8 },
      detail: { type: Number, min: 0, max: 1, default: 0.6 },
      
      // Composition
      aspectRatio: String,
      composition: {
        type: String,
        enum: ['centered', 'rule_of_thirds', 'golden_ratio', 'symmetric', 'asymmetric'],
        default: 'rule_of_thirds'
      },
      
      // Lighting and Mood
      lighting: {
        type: String,
        enum: ['natural', 'dramatic', 'soft', 'hard', 'ambient', 'directional', 'backlit'],
        default: 'natural'
      },
      
      mood: {
        type: String,
        enum: ['happy', 'melancholy', 'energetic', 'calm', 'mysterious', 'dramatic', 'whimsical'],
        default: 'calm'
      },
      
      // Color Controls
      colorPalette: {
        type: String,
        enum: ['vibrant', 'muted', 'monochrome', 'warm', 'cool', 'complementary', 'analogous'],
        default: 'vibrant'
      },
      
      saturation: { type: Number, min: 0, max: 2, default: 1 },
      contrast: { type: Number, min: 0, max: 2, default: 1 },
      brightness: { type: Number, min: 0, max: 2, default: 1 }
    }
  },
  
  // Prompts and Instructions
  prompts: {
    // Main Generation Prompt
    primary: {
      text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
      },
      
      language: { type: String, default: 'en' },
      
      // Prompt Engineering
      structure: {
        subject: String,
        setting: String,
        style: String,
        mood: String,
        technical: String,
        quality: String
      },
      
      // Weighted Components
      components: [{
        text: String,
        weight: { type: Number, min: 0, max: 2, default: 1 },
        type: { type: String, enum: ['subject', 'style', 'setting', 'mood', 'technical'] }
      }],
      
      // Enhancement Keywords
      enhancers: [String],
      
      // Negative Prompt
      negative: {
        text: String,
        weight: { type: Number, min: 0, max: 2, default: 1 }
      }
    },
    
    // Alternative Prompts
    variations: [{
      text: String,
      description: String,
      weight: { type: Number, min: 0, max: 1, default: 1 }
    }],
    
    // Prompt History and Evolution
    history: [{
      version: Number,
      text: String,
      results: String, // Brief description of results
      performance: { type: Number, min: 0, max: 10 },
      timestamp: { type: Date, default: Date.now }
    }]
  },
  
  // Generated Images
  images: [{
    // Basic Info
    filename: String,
    originalFilename: String,
    url: String,
    thumbnailUrl: String,
    
    // Generation Details
    generationId: String, // Provider's generation ID
    prompt: String, // Exact prompt used
    model: String,
    parameters: mongoose.Schema.Types.Mixed,
    
    // Image Properties
    dimensions: {
      width: Number,
      height: Number
    },
    
    fileSize: Number, // bytes
    format: { type: String, enum: ['png', 'jpg', 'jpeg', 'webp'], default: 'png' },
    
    // Generation Metadata
    generationTime: Number, // milliseconds
    cost: Number, // API cost
    seed: Number,
    
    // Quality Assessment
    quality: {
      overall: { type: Number, min: 0, max: 10 },
      
      technical: {
        sharpness: { type: Number, min: 0, max: 10 },
        exposure: { type: Number, min: 0, max: 10 },
        composition: { type: Number, min: 0, max: 10 },
        colorBalance: { type: Number, min: 0, max: 10 }
      },
      
      artistic: {
        creativity: { type: Number, min: 0, max: 10 },
        style: { type: Number, min: 0, max: 10 },
        emotion: { type: Number, min: 0, max: 10 },
        originality: { type: Number, min: 0, max: 10 }
      },
      
      promptAdherence: { type: Number, min: 0, max: 10 },
      
      // Detected Issues
      issues: [{
        type: String,
        severity: { type: Number, min: 1, max: 5 },
        description: String
      }]
    },
    
    // User Interaction
    rating: { type: Number, min: 1, max: 5 },
    favorite: { type: Boolean, default: false },
    
    // Editing History
    edits: [{
      operation: {
        type: String,
        enum: ['crop', 'resize', 'filter', 'color_adjust', 'rotate', 'flip', 'inpaint', 'outpaint']
      },
      parameters: mongoose.Schema.Types.Mixed,
      resultUrl: String,
      timestamp: { type: Date, default: Date.now }
    }],
    
    // Social Features
    public: { type: Boolean, default: false },
    
    engagement: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      downloads: { type: Number, default: 0 }
    },
    
    // Metadata
    tags: [String],
    
    generatedAt: { type: Date, default: Date.now }
  }],
  
  // Batch Generation (for multiple images)
  batchSettings: {
    count: { type: Number, min: 1, max: 50, default: 1 },
    
    variation: {
      method: {
        type: String,
        enum: ['seed_variation', 'prompt_variation', 'parameter_variation', 'model_comparison'],
        default: 'seed_variation'
      },
      
      // Seed Variation
      seedRange: {
        start: Number,
        end: Number,
        increment: Number
      },
      
      // Parameter Variation
      parameterRanges: [{
        parameter: String,
        min: Number,
        max: Number,
        steps: Number
      }],
      
      // Prompt Variations
      promptTemplates: [String]
    },
    
    progress: {
      completed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      remaining: { type: Number, default: 0 }
    }
  },
  
  // Style Transfer and Editing
  styleTransfer: {
    enabled: { type: Boolean, default: false },
    
    sourceImage: {
      url: String,
      filename: String
    },
    
    targetStyle: {
      style: String,
      intensity: { type: Number, min: 0, max: 1, default: 0.7 },
      preservation: { type: Number, min: 0, max: 1, default: 0.5 } // How much of original to preserve
    },
    
    techniques: [{
      name: String,
      parameters: mongoose.Schema.Types.Mixed,
      weight: { type: Number, min: 0, max: 1, default: 1 }
    }]
  },
  
  // Interactive Editing Tools
  editing: {
    tools: [{
      name: {
        type: String,
        enum: ['inpaint', 'outpaint', 'upscale', 'colorize', 'restore', 'remove_background', 'style_transfer']
      },
      
      enabled: { type: Boolean, default: true },
      
      settings: mongoose.Schema.Types.Mixed,
      
      history: [{
        imageId: mongoose.Schema.Types.ObjectId,
        operation: String,
        parameters: mongoose.Schema.Types.Mixed,
        result: String,
        timestamp: { type: Date, default: Date.now }
      }]
    }],
    
    // Mask and Selection Data
    selections: [{
      imageId: mongoose.Schema.Types.ObjectId,
      maskData: String, // Base64 encoded mask
      selectionType: { type: String, enum: ['rectangle', 'circle', 'freehand', 'ai_detect'] },
      description: String,
      createdAt: { type: Date, default: Date.now }
    }]
  },
  
  // Project Organization
  collections: [{
    name: String,
    description: String,
    imageIds: [mongoose.Schema.Types.ObjectId],
    tags: [String],
    isPublic: { type: Boolean, default: false }
  }],
  
  // Collaboration Features
  collaboration: {
    isShared: { type: Boolean, default: false },
    
    collaborators: [{
      userId: mongoose.Schema.Types.ObjectId,
      role: { type: String, enum: ['viewer', 'editor', 'admin'], default: 'viewer' },
      permissions: [String],
      addedAt: { type: Date, default: Date.now }
    }],
    
    // Shared Links
    shareLinks: [{
      token: String,
      permissions: [String],
      expiresAt: Date,
      password: String,
      createdAt: { type: Date, default: Date.now }
    }],
    
    // Comments and Feedback
    comments: [{
      userId: mongoose.Schema.Types.ObjectId,
      imageId: mongoose.Schema.Types.ObjectId,
      content: String,
      position: {
        x: Number,
        y: Number
      },
      replies: [{
        userId: mongoose.Schema.Types.ObjectId,
        content: String,
        createdAt: { type: Date, default: Date.now }
      }],
      resolved: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  
  // Status and Progress
  status: {
    type: String,
    enum: ['draft', 'generating', 'editing', 'completed', 'failed', 'cancelled'],
    default: 'draft',
    index: true
  },
  
  progress: {
    currentStage: String,
    completedImages: { type: Number, default: 0 },
    totalImages: { type: Number, default: 1 },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    
    estimatedCompletion: Date,
    
    // Error Tracking
    errors: [{
      stage: String,
      message: String,
      code: String,
      timestamp: { type: Date, default: Date.now }
    }]
  },
  
  // Usage Analytics
  analytics: {
    generationCount: { type: Number, default: 0 },
    editingOperations: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    averageGenerationTime: Number,
    
    // Popular Combinations
    successfulPrompts: [{
      prompt: String,
      parameters: mongoose.Schema.Types.Mixed,
      successRate: Number,
      averageRating: Number,
      useCount: Number
    }],
    
    // Performance Metrics
    performance: {
      bestQualityScore: Number,
      averageQualityScore: Number,
      mostPopularImage: mongoose.Schema.Types.ObjectId,
      totalEngagement: Number
    }
  },
  
  // Export and Integration
  exports: [{
    format: { type: String, enum: ['zip', 'pdf', 'psd', 'ai', 'figma'] },
    resolution: String,
    includeMetadata: { type: Boolean, default: true },
    
    url: String,
    size: Number,
    
    exportedAt: { type: Date, default: Date.now },
    expiresAt: Date
  }],
  
  // Tags and Metadata
  tags: [{
    type: String,
    trim: true
  }],
  
  metadata: {
    inspiration: [String], // URLs or references
    artStyle: String,
    targetAudience: String,
    usageRights: String,
    
    // Technical Specifications
    colorSpace: String,
    dpi: Number,
    printSize: String,
    
    // Project Context
    projectType: String,
    clientName: String,
    deadline: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
imagePlaygroundSchema.index({ userId: 1, createdAt: -1 })
imagePlaygroundSchema.index({ status: 1 })
imagePlaygroundSchema.index({ category: 1, 'images.public': 1 })
imagePlaygroundSchema.index({ tags: 1 })
imagePlaygroundSchema.index({ 'generation.model': 1 })
imagePlaygroundSchema.index({ 'images.rating': -1 })

// Virtual for total cost
imagePlaygroundSchema.virtual('totalCost').get(function() {
  return this.images.reduce((total, image) => total + (image.cost || 0), 0)
})

// Virtual for average rating
imagePlaygroundSchema.virtual('averageRating').get(function() {
  const ratedImages = this.images.filter(img => img.rating)
  if (ratedImages.length === 0) return 0
  
  const totalRating = ratedImages.reduce((sum, img) => sum + img.rating, 0)
  return totalRating / ratedImages.length
})

// Virtual for completion percentage
imagePlaygroundSchema.virtual('completionPercentage').get(function() {
  if (this.batchSettings.count === 0) return 100
  
  return Math.round((this.progress.completedImages / this.batchSettings.count) * 100)
})

// Virtual for best image
imagePlaygroundSchema.virtual('bestImage').get(function() {
  if (this.images.length === 0) return null
  
  return this.images.reduce((best, current) => {
    const bestScore = (best.rating || 0) + (best.quality?.overall || 0)
    const currentScore = (current.rating || 0) + (current.quality?.overall || 0)
    
    return currentScore > bestScore ? current : best
  })
})

// Static methods
imagePlaygroundSchema.statics.findPublic = function(options = {}) {
  return this.find({ 'images.public': true }, null, options)
    .populate('userId', 'name email')
    .sort({ 'images.engagement.views': -1 })
}

imagePlaygroundSchema.statics.findByCategory = function(category, options = {}) {
  return this.find({ category, 'images.public': true }, null, options)
    .sort({ createdAt: -1 })
}

imagePlaygroundSchema.statics.getPopularImages = function(timeframe = 7, limit = 20) {
  const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000)
  
  return this.aggregate([
    { $match: { 'images.public': true, createdAt: { $gte: startDate } } },
    { $unwind: '$images' },
    { $match: { 'images.public': true } },
    {
      $project: {
        userId: 1,
        title: 1,
        image: '$images',
        totalEngagement: {
          $add: [
            '$images.engagement.views',
            { $multiply: ['$images.engagement.likes', 3] },
            { $multiply: ['$images.engagement.shares', 5] }
          ]
        }
      }
    },
    { $sort: { totalEngagement: -1 } },
    { $limit: limit }
  ])
}

imagePlaygroundSchema.statics.getModelStatistics = function() {
  return this.aggregate([
    { $unwind: '$images' },
    {
      $group: {
        _id: '$images.model',
        totalImages: { $sum: 1 },
        averageRating: { $avg: '$images.rating' },
        averageQuality: { $avg: '$images.quality.overall' },
        totalCost: { $sum: '$images.cost' }
      }
    },
    { $sort: { averageRating: -1 } }
  ])
}

// Instance methods
imagePlaygroundSchema.methods.generateImage = async function(promptOverride = null) {
  this.status = 'generating'
  this.progress.currentStage = 'Preparing generation'
  
  const prompt = promptOverride || this.prompts.primary.text
  
  // This would integrate with actual image generation APIs
  // For now, we'll simulate the process
  
  try {
    // Simulate generation
    const imageData = {
      filename: `generated_${Date.now()}.png`,
      url: `/api/images/${this._id}/${Date.now()}.png`,
      prompt,
      model: this.generation.model,
      parameters: this.generation.parameters,
      dimensions: this.parseDimensions(this.generation.size),
      generationTime: Math.random() * 10000 + 5000, // 5-15 seconds
      cost: this.calculateGenerationCost(),
      seed: Math.floor(Math.random() * 1000000),
      generatedAt: new Date()
    }
    
    this.images.push(imageData)
    this.progress.completedImages += 1
    this.progress.percentage = this.completionPercentage
    this.analytics.generationCount += 1
    this.analytics.totalCost += imageData.cost
    
    if (this.progress.completedImages >= this.batchSettings.count) {
      this.status = 'completed'
    }
    
    await this.save()
    return imageData
    
  } catch (error) {
    this.progress.errors.push({
      stage: 'generation',
      message: error.message,
      code: error.code
    })
    
    this.status = 'failed'
    await this.save()
    throw error
  }
}

imagePlaygroundSchema.methods.parseDimensions = function(sizeString) {
  const [width, height] = sizeString.split('x').map(Number)
  return { width, height }
}

imagePlaygroundSchema.methods.calculateGenerationCost = function() {
  // Simplified cost calculation based on model and size
  const baseCosts = {
    'dall-e-3': 0.04,
    'dall-e-2': 0.02,
    'stable-diffusion': 0.01,
    'midjourney': 0.03,
    'firefly': 0.025,
    'imagen': 0.035
  }
  
  const sizeMutlipliers = {
    '256x256': 1,
    '512x512': 2,
    '1024x1024': 4,
    '1792x1024': 6,
    '1024x1792': 6
  }
  
  const baseCost = baseCosts[this.generation.model] || 0.02
  const sizeMultiplier = sizeMutlipliers[this.generation.size] || 4
  
  return baseCost * sizeMultiplier
}

imagePlaygroundSchema.methods.addImage = function(imageData) {
  this.images.push(imageData)
  this.progress.completedImages += 1
  this.progress.percentage = this.completionPercentage
  
  return this.save()
}

imagePlaygroundSchema.methods.editImage = function(imageId, operation, parameters) {
  const image = this.images.id(imageId)
  if (!image) throw new Error('Image not found')
  
  // Simulate editing operation
  const editResult = {
    operation,
    parameters,
    resultUrl: `/api/images/${this._id}/edited_${Date.now()}.png`,
    timestamp: new Date()
  }
  
  image.edits.push(editResult)
  this.analytics.editingOperations += 1
  
  return this.save()
}

imagePlaygroundSchema.methods.rateImage = function(imageId, rating) {
  const image = this.images.id(imageId)
  if (!image) throw new Error('Image not found')
  
  image.rating = Math.max(1, Math.min(5, rating))
  
  return this.save()
}

imagePlaygroundSchema.methods.shareImage = function(imageId, isPublic = true) {
  const image = this.images.id(imageId)
  if (!image) throw new Error('Image not found')
  
  image.public = isPublic
  
  if (isPublic) {
    image.engagement.shares += 1
  }
  
  return this.save()
}

imagePlaygroundSchema.methods.createCollection = function(name, description, imageIds = []) {
  // Validate image IDs belong to this playground
  const validImageIds = imageIds.filter(id => 
    this.images.some(img => img._id.toString() === id.toString())
  )
  
  const collection = {
    name,
    description,
    imageIds: validImageIds,
    tags: [],
    isPublic: false
  }
  
  this.collections.push(collection)
  
  return this.save()
}

imagePlaygroundSchema.methods.exportProject = function(format, options = {}) {
  const exportData = {
    format,
    resolution: options.resolution || 'original',
    includeMetadata: options.includeMetadata !== false,
    url: `/api/exports/${this._id}/${Date.now()}.${format}`,
    size: this.calculateExportSize(format),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
  
  this.exports.push(exportData)
  
  return this.save()
}

imagePlaygroundSchema.methods.calculateExportSize = function(format) {
  // Estimate export size based on format and number of images
  const baseSize = this.images.length * 2 * 1024 * 1024 // 2MB per image average
  
  const formatMultipliers = {
    'zip': 0.8, // Compression
    'pdf': 1.2, // PDF overhead
    'psd': 2.5, // Layers and metadata
    'ai': 1.8,  // Vector format
    'figma': 0.6 // Cloud format
  }
  
  return Math.round(baseSize * (formatMultipliers[format] || 1))
}

imagePlaygroundSchema.methods.updateAnalytics = function() {
  // Update average generation time
  const generationTimes = this.images
    .map(img => img.generationTime)
    .filter(time => time > 0)
  
  if (generationTimes.length > 0) {
    this.analytics.averageGenerationTime = 
      generationTimes.reduce((sum, time) => sum + time, 0) / generationTimes.length
  }
  
  // Update best quality score
  const qualityScores = this.images
    .map(img => img.quality?.overall)
    .filter(score => score > 0)
  
  if (qualityScores.length > 0) {
    this.analytics.performance.bestQualityScore = Math.max(...qualityScores)
    this.analytics.performance.averageQualityScore = 
      qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
  }
  
  // Find most popular image
  if (this.images.length > 0) {
    const mostPopular = this.images.reduce((best, current) => {
      const bestEngagement = (best.engagement?.views || 0) + (best.engagement?.likes || 0) * 2
      const currentEngagement = (current.engagement?.views || 0) + (current.engagement?.likes || 0) * 2
      
      return currentEngagement > bestEngagement ? current : best
    })
    
    this.analytics.performance.mostPopularImage = mostPopular._id
    this.analytics.performance.totalEngagement = this.images.reduce((total, img) => {
      return total + (img.engagement?.views || 0) + (img.engagement?.likes || 0) + (img.engagement?.shares || 0)
    }, 0)
  }
  
  return this.save()
}

export default mongoose.model('ImagePlayground', imagePlaygroundSchema)