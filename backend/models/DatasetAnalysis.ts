/**
 * Dataset Analysis Model
 * Handles statistical analysis, data visualization, and insights from datasets
 */

import mongoose from 'mongoose'

const datasetAnalysisSchema = new mongoose.Schema({
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
  
  // Analysis Configuration
  analysisType: {
    type: String,
    enum: ['statistical', 'predictive', 'clustering', 'classification', 'regression', 'time_series', 'correlation', 'custom'],
    required: true
  },
  
  // Dataset Information
  dataset: {
    format: {
      type: String,
      enum: ['csv', 'json', 'xlsx', 'parquet', 'sql', 'api', 'streaming'],
      required: true
    },
    source: {
      type: String,
      enum: ['uploaded', 'url', 'database', 'api', 'generated'],
      required: true
    },
    size: {
      rows: { type: Number },
      columns: { type: Number },
      fileSize: { type: Number } // in bytes
    },
    schema: [{
      columnName: String,
      dataType: {
        type: String,
        enum: ['string', 'number', 'boolean', 'date', 'categorical', 'binary']
      },
      nullable: { type: Boolean, default: true },
      unique: { type: Boolean, default: false }
    }],
    description: String
  },
  
  // Analysis Configuration
  configuration: {
    operations: [{
      type: String,
      enum: ['describe', 'correlate', 'visualize', 'predict', 'cluster', 'classify', 'detect_anomalies', 'trend_analysis']
    }],
    parameters: {
      targetVariable: String,
      features: [String],
      algorithms: [String],
      validationMethod: {
        type: String,
        enum: ['train_test_split', 'cross_validation', 'holdout', 'time_series_split']
      },
      metrics: [String],
      visualization: {
        charts: [{
          type: {
            type: String,
            enum: ['scatter', 'line', 'bar', 'histogram', 'box', 'heatmap', 'correlation_matrix', 'distribution']
          },
          variables: [String],
          title: String
        }]
      }
    }
  },
  
  // Analysis Results
  results: {
    summary: {
      recordCount: Number,
      featureCount: Number,
      missingValues: Number,
      duplicateRows: Number,
      dataQualityScore: { type: Number, min: 0, max: 1 }
    },
    statistics: {
      descriptive: [{
        column: String,
        count: Number,
        mean: Number,
        median: Number,
        mode: mongoose.Schema.Types.Mixed,
        standardDeviation: Number,
        variance: Number,
        min: mongoose.Schema.Types.Mixed,
        max: mongoose.Schema.Types.Mixed,
        quartiles: [Number]
      }],
      correlations: [{
        variable1: String,
        variable2: String,
        correlation: Number,
        pValue: Number,
        significance: String
      }]
    },
    insights: [{
      category: {
        type: String,
        enum: ['pattern', 'anomaly', 'trend', 'correlation', 'prediction', 'recommendation']
      },
      title: String,
      description: String,
      confidence: { type: Number, min: 0, max: 1 },
      impact: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      }
    }],
    visualizations: [{
      type: String,
      title: String,
      description: String,
      data: mongoose.Schema.Types.Mixed,
      config: mongoose.Schema.Types.Mixed,
      imageUrl: String
    }]
  },
  
  // Model Performance (for ML analyses)
  modelPerformance: {
    algorithm: String,
    metrics: {
      accuracy: Number,
      precision: Number,
      recall: Number,
      f1Score: Number,
      rSquared: Number,
      meanSquaredError: Number,
      meanAbsoluteError: Number
    },
    confusionMatrix: [[Number]],
    featureImportance: [{
      feature: String,
      importance: Number
    }],
    crossValidationScores: [Number]
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
  
  // Files and Resources
  files: [{
    originalName: String,
    filename: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  outputs: [{
    type: {
      type: String,
      enum: ['report', 'visualization', 'model', 'dataset', 'code']
    },
    filename: String,
    path: String,
    size: Number,
    description: String,
    generatedAt: { type: Date, default: Date.now }
  }],
  
  // Execution Details
  execution: {
    startedAt: Date,
    completedAt: Date,
    duration: Number, // in milliseconds
    computeResources: {
      cpu: String,
      memory: String,
      gpu: String
    },
    errors: [{
      message: String,
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
  
  // Collaboration and Sharing
  isPublic: {
    type: Boolean,
    default: false
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
    addedAt: { type: Date, default: Date.now }
  }],
  
  tags: [{
    type: String,
    trim: true
  }],
  
  // Versioning
  version: {
    type: Number,
    default: 1
  },
  
  parentAnalysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DatasetAnalysis'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
datasetAnalysisSchema.index({ userId: 1, createdAt: -1 })
datasetAnalysisSchema.index({ experimentId: 1 })
datasetAnalysisSchema.index({ status: 1 })
datasetAnalysisSchema.index({ analysisType: 1 })
datasetAnalysisSchema.index({ tags: 1 })
datasetAnalysisSchema.index({ isPublic: 1, createdAt: -1 })
datasetAnalysisSchema.index({ 'dataset.format': 1 })
datasetAnalysisSchema.index({ 'results.summary.dataQualityScore': -1 })

// Virtual for duration in human-readable format
datasetAnalysisSchema.virtual('durationFormatted').get(function() {
  if (!this.execution.duration) return null
  const seconds = Math.floor(this.execution.duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
})

// Virtual for analysis complexity score
datasetAnalysisSchema.virtual('complexityScore').get(function() {
  let score = 0
  
  // Dataset size contribution
  if (this.dataset.size?.rows) {
    if (this.dataset.size.rows > 1000000) score += 3
    else if (this.dataset.size.rows > 100000) score += 2
    else if (this.dataset.size.rows > 10000) score += 1
  }
  
  // Operations complexity
  score += this.configuration.operations?.length || 0
  
  // Algorithm complexity
  const complexAlgorithms = ['neural_network', 'deep_learning', 'ensemble', 'svm', 'random_forest']
  const hasComplexAlgorithm = this.configuration.parameters?.algorithms?.some(alg => 
    complexAlgorithms.includes(alg)
  )
  if (hasComplexAlgorithm) score += 2
  
  return Math.min(score, 10) // Cap at 10
})

// Pre-save middleware
datasetAnalysisSchema.pre('save', function(next) {
  // Update progress based on status
  if (this.status === 'completed') {
    this.progress.percentage = 100
    if (!this.execution.completedAt) {
      this.execution.completedAt = new Date()
    }
  } else if (this.status === 'failed' || this.status === 'cancelled') {
    if (!this.execution.completedAt) {
      this.execution.completedAt = new Date()
    }
  }
  
  // Calculate execution duration
  if (this.execution.startedAt && this.execution.completedAt) {
    this.execution.duration = this.execution.completedAt - this.execution.startedAt
  }
  
  next()
})

// Static methods
datasetAnalysisSchema.statics.findByUser = function(userId, options = {}) {
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

datasetAnalysisSchema.statics.findPublic = function(options = {}) {
  return this.find({ isPublic: true }, null, options)
    .populate('userId', 'name email')
    .populate('experimentId', 'title description')
    .sort(options.sort || { createdAt: -1 })
}

// Instance methods
datasetAnalysisSchema.methods.addInsight = function(insight) {
  this.results.insights.push({
    ...insight,
    timestamp: new Date()
  })
  return this.save()
}

datasetAnalysisSchema.methods.updateProgress = function(percentage, step) {
  this.progress.percentage = percentage
  this.progress.currentStep = step
  return this.save()
}

datasetAnalysisSchema.methods.addCollaborator = function(userId, role = 'viewer') {
  const existingCollaborator = this.collaborators.find(c => 
    c.userId.toString() === userId.toString()
  )
  
  if (existingCollaborator) {
    existingCollaborator.role = role
  } else {
    this.collaborators.push({ userId, role })
  }
  
  return this.save()
}

export default mongoose.model('DatasetAnalysis', datasetAnalysisSchema)