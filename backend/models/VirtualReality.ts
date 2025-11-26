import mongoose from 'mongoose'

export interface IVirtualReality extends mongoose.Document {
  experimentId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  title: string
  description?: string
  experienceType: 'vr' | 'ar' | 'mr' // Virtual Reality, Augmented Reality, Mixed Reality
  category: 'education' | 'entertainment' | 'training' | 'therapy' | 'simulation' | 'social' | 'creative' | 'medical' | 'business'
  environment: {
    name: string
    type: 'indoor' | 'outdoor' | 'space' | 'underwater' | 'fantasy' | 'historical' | 'abstract' | 'realistic'
    theme: string
    atmosphere: 'calm' | 'exciting' | 'mysterious' | 'educational' | 'immersive' | 'interactive'
    lighting: {
      type: 'natural' | 'artificial' | 'ambient' | 'dramatic'
      intensity: number // 0-1
      color: string
    }
    weather?: {
      condition: 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'stormy' | 'clear'
      temperature: number
      windSpeed: number
    }
  }
  assets: {
    models3D: {
      url: string
      name: string
      type: 'character' | 'object' | 'building' | 'landscape' | 'vehicle'
      fileSize: number
      format: 'fbx' | 'obj' | 'gltf' | 'dae'
    }[]
    textures: {
      url: string
      name: string
      resolution: string
      type: 'diffuse' | 'normal' | 'specular' | 'emission'
    }[]
    audio: {
      url: string
      name: string
      type: 'ambient' | 'effect' | 'music' | 'voice' | 'spatial'
      duration: number
      format: string
    }[]
    animations: {
      name: string
      target: string
      duration: number
      type: 'loop' | 'once' | 'pingpong'
    }[]
  }
  interactions: {
    type: 'gaze' | 'gesture' | 'voice' | 'touch' | 'controller' | 'hand_tracking' | 'eye_tracking'
    triggers: {
      action: string
      target: string
      response: string
      feedback?: 'visual' | 'audio' | 'haptic'
    }[]
    navigation: {
      method: 'teleport' | 'smooth' | 'room_scale' | 'seated' | 'standing'
      boundaries?: {
        width: number
        height: number
        depth: number
      }
    }
  }
  aiElements: {
    npcs?: {
      name: string
      appearance: string
      personality: string
      dialogue: string[]
      behaviors: string[]
      aiModel: string
    }[]
    procedural?: {
      terrain: boolean
      weather: boolean
      objects: boolean
      stories: boolean
    }
    adaptive?: {
      difficulty: boolean
      content: boolean
      pacing: boolean
      userPreferences: boolean
    }
  }
  hardware: {
    requiredDevice: 'oculus' | 'vive' | 'pico' | 'quest' | 'hololens' | 'magic_leap' | 'mobile' | 'any'
    minSpecs: {
      cpu: string
      gpu: string
      ram: number
      storage: number
    }
    tracking: {
      headset: boolean
      controllers: boolean
      hands: boolean
      eyes: boolean
      body: boolean
    }
  }
  performance: {
    targetFPS: number
    renderQuality: 'low' | 'medium' | 'high' | 'ultra'
    optimizations: string[]
    loadTime: number
    frameDrops?: number
  }
  userExperience: {
    duration: number // in minutes
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    comfortLevel: 'comfortable' | 'moderate' | 'intense'
    motionSickness: {
      risk: 'low' | 'medium' | 'high'
      mitigations: string[]
    }
    accessibility: {
      colorblind: boolean
      hearingImpaired: boolean
      mobilityImpaired: boolean
      customizations: string[]
    }
  }
  analytics: {
    sessions: {
      sessionId: string
      startTime: Date
      endTime: Date
      duration: number
      interactions: number
      completion: number // 0-1
      rating?: number
    }[]
    heatmaps: {
      type: 'gaze' | 'movement' | 'interaction'
      data: any // compressed heatmap data
      timestamp: Date
    }[]
    behavior: {
      movementPatterns: any
      interactionFrequency: any
      attentionSpans: number[]
      preferredAreas: string[]
    }
  }
  collaboration: {
    multiUser: boolean
    maxUsers?: number
    roles?: {
      role: string
      permissions: string[]
      avatar?: string
    }[]
    communication: {
      voice: boolean
      text: boolean
      gestures: boolean
      spatialAudio: boolean
    }
  }
  deployment: {
    status: 'development' | 'testing' | 'published' | 'archived'
    version: string
    platforms: string[]
    distributionMethod: 'store' | 'sideload' | 'web' | 'internal'
    fileSize: number
    downloadCount?: number
  }
  feedback: {
    ratings: {
      userId: mongoose.Types.ObjectId
      overall: number // 1-5
      immersion: number
      comfort: number
      content: number
      performance: number
      comment?: string
      timestamp: Date
    }[]
    reviews: {
      userId: mongoose.Types.ObjectId
      title: string
      content: string
      rating: number
      helpful: number
      timestamp: Date
    }[]
  }
  tags: string[]
  visibility: 'private' | 'friends' | 'public' | 'beta'
  createdAt: Date
  updatedAt: Date
}

const virtualRealitySchema = new mongoose.Schema<IVirtualReality>({
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
  description: {
    type: String,
    maxlength: 2000
  },
  experienceType: {
    type: String,
    enum: ['vr', 'ar', 'mr'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['education', 'entertainment', 'training', 'therapy', 'simulation', 'social', 'creative', 'medical', 'business'],
    required: true,
    index: true
  },
  environment: {
    name: { type: String, required: true, maxlength: 100 },
    type: {
      type: String,
      enum: ['indoor', 'outdoor', 'space', 'underwater', 'fantasy', 'historical', 'abstract', 'realistic'],
      required: true
    },
    theme: { type: String, required: true, maxlength: 100 },
    atmosphere: {
      type: String,
      enum: ['calm', 'exciting', 'mysterious', 'educational', 'immersive', 'interactive'],
      required: true
    },
    lighting: {
      type: { type: String, enum: ['natural', 'artificial', 'ambient', 'dramatic'], required: true },
      intensity: { type: Number, required: true, min: 0, max: 1 },
      color: { type: String, required: true, maxlength: 20 }
    },
    weather: {
      condition: { type: String, enum: ['sunny', 'rainy', 'cloudy', 'snowy', 'stormy', 'clear'] },
      temperature: { type: Number },
      windSpeed: { type: Number, min: 0 }
    }
  },
  assets: {
    models3D: [{
      url: { type: String, required: true, maxlength: 500 },
      name: { type: String, required: true, maxlength: 100 },
      type: { type: String, enum: ['character', 'object', 'building', 'landscape', 'vehicle'], required: true },
      fileSize: { type: Number, required: true, min: 0 },
      format: { type: String, enum: ['fbx', 'obj', 'gltf', 'dae'], required: true }
    }],
    textures: [{
      url: { type: String, required: true, maxlength: 500 },
      name: { type: String, required: true, maxlength: 100 },
      resolution: { type: String, required: true, maxlength: 20 },
      type: { type: String, enum: ['diffuse', 'normal', 'specular', 'emission'], required: true }
    }],
    audio: [{
      url: { type: String, required: true, maxlength: 500 },
      name: { type: String, required: true, maxlength: 100 },
      type: { type: String, enum: ['ambient', 'effect', 'music', 'voice', 'spatial'], required: true },
      duration: { type: Number, required: true, min: 0 },
      format: { type: String, required: true, maxlength: 20 }
    }],
    animations: [{
      name: { type: String, required: true, maxlength: 100 },
      target: { type: String, required: true, maxlength: 100 },
      duration: { type: Number, required: true, min: 0 },
      type: { type: String, enum: ['loop', 'once', 'pingpong'], required: true }
    }]
  },
  interactions: {
    type: {
      type: String,
      enum: ['gaze', 'gesture', 'voice', 'touch', 'controller', 'hand_tracking', 'eye_tracking'],
      required: true
    },
    triggers: [{
      action: { type: String, required: true, maxlength: 100 },
      target: { type: String, required: true, maxlength: 100 },
      response: { type: String, required: true, maxlength: 300 },
      feedback: { type: String, enum: ['visual', 'audio', 'haptic'] }
    }],
    navigation: {
      method: {
        type: String,
        enum: ['teleport', 'smooth', 'room_scale', 'seated', 'standing'],
        required: true
      },
      boundaries: {
        width: { type: Number, min: 0 },
        height: { type: Number, min: 0 },
        depth: { type: Number, min: 0 }
      }
    }
  },
  aiElements: {
    npcs: [{
      name: { type: String, required: true, maxlength: 100 },
      appearance: { type: String, required: true, maxlength: 300 },
      personality: { type: String, required: true, maxlength: 300 },
      dialogue: [{ type: String, maxlength: 500 }],
      behaviors: [{ type: String, maxlength: 200 }],
      aiModel: { type: String, required: true, maxlength: 100 }
    }],
    procedural: {
      terrain: { type: Boolean, default: false },
      weather: { type: Boolean, default: false },
      objects: { type: Boolean, default: false },
      stories: { type: Boolean, default: false }
    },
    adaptive: {
      difficulty: { type: Boolean, default: false },
      content: { type: Boolean, default: false },
      pacing: { type: Boolean, default: false },
      userPreferences: { type: Boolean, default: false }
    }
  },
  hardware: {
    requiredDevice: {
      type: String,
      enum: ['oculus', 'vive', 'pico', 'quest', 'hololens', 'magic_leap', 'mobile', 'any'],
      required: true,
      index: true
    },
    minSpecs: {
      cpu: { type: String, required: true, maxlength: 100 },
      gpu: { type: String, required: true, maxlength: 100 },
      ram: { type: Number, required: true, min: 1 },
      storage: { type: Number, required: true, min: 1 }
    },
    tracking: {
      headset: { type: Boolean, default: true },
      controllers: { type: Boolean, default: false },
      hands: { type: Boolean, default: false },
      eyes: { type: Boolean, default: false },
      body: { type: Boolean, default: false }
    }
  },
  performance: {
    targetFPS: { type: Number, required: true, min: 30, max: 120 },
    renderQuality: { type: String, enum: ['low', 'medium', 'high', 'ultra'], required: true },
    optimizations: [{ type: String, maxlength: 100 }],
    loadTime: { type: Number, required: true, min: 0 },
    frameDrops: { type: Number, min: 0 }
  },
  userExperience: {
    duration: { type: Number, required: true, min: 1, max: 1440 },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], required: true },
    comfortLevel: { type: String, enum: ['comfortable', 'moderate', 'intense'], required: true },
    motionSickness: {
      risk: { type: String, enum: ['low', 'medium', 'high'], required: true },
      mitigations: [{ type: String, maxlength: 200 }]
    },
    accessibility: {
      colorblind: { type: Boolean, default: false },
      hearingImpaired: { type: Boolean, default: false },
      mobilityImpaired: { type: Boolean, default: false },
      customizations: [{ type: String, maxlength: 100 }]
    }
  },
  analytics: {
    sessions: [{
      sessionId: { type: String, required: true },
      startTime: { type: Date, required: true },
      endTime: { type: Date },
      duration: { type: Number, min: 0 },
      interactions: { type: Number, default: 0, min: 0 },
      completion: { type: Number, min: 0, max: 1 },
      rating: { type: Number, min: 1, max: 5 }
    }],
    heatmaps: [{
      type: { type: String, enum: ['gaze', 'movement', 'interaction'], required: true },
      data: mongoose.Schema.Types.Mixed,
      timestamp: { type: Date, required: true }
    }],
    behavior: {
      movementPatterns: mongoose.Schema.Types.Mixed,
      interactionFrequency: mongoose.Schema.Types.Mixed,
      attentionSpans: [{ type: Number, min: 0 }],
      preferredAreas: [{ type: String, maxlength: 100 }]
    }
  },
  collaboration: {
    multiUser: { type: Boolean, default: false },
    maxUsers: { type: Number, min: 1, max: 100 },
    roles: [{
      role: { type: String, required: true, maxlength: 50 },
      permissions: [{ type: String, maxlength: 100 }],
      avatar: { type: String, maxlength: 200 }
    }],
    communication: {
      voice: { type: Boolean, default: false },
      text: { type: Boolean, default: false },
      gestures: { type: Boolean, default: false },
      spatialAudio: { type: Boolean, default: false }
    }
  },
  deployment: {
    status: {
      type: String,
      enum: ['development', 'testing', 'published', 'archived'],
      default: 'development',
      index: true
    },
    version: { type: String, required: true, maxlength: 20 },
    platforms: [{ type: String, maxlength: 50 }],
    distributionMethod: {
      type: String,
      enum: ['store', 'sideload', 'web', 'internal'],
      required: true
    },
    fileSize: { type: Number, required: true, min: 0 },
    downloadCount: { type: Number, default: 0, min: 0 }
  },
  feedback: {
    ratings: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      overall: { type: Number, required: true, min: 1, max: 5 },
      immersion: { type: Number, required: true, min: 1, max: 5 },
      comfort: { type: Number, required: true, min: 1, max: 5 },
      content: { type: Number, required: true, min: 1, max: 5 },
      performance: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, maxlength: 1000 },
      timestamp: { type: Date, required: true }
    }],
    reviews: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      title: { type: String, required: true, maxlength: 200 },
      content: { type: String, required: true, maxlength: 2000 },
      rating: { type: Number, required: true, min: 1, max: 5 },
      helpful: { type: Number, default: 0, min: 0 },
      timestamp: { type: Date, required: true }
    }]
  },
  tags: [{ type: String, maxlength: 50 }],
  visibility: {
    type: String,
    enum: ['private', 'friends', 'public', 'beta'],
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
virtualRealitySchema.index({ userId: 1, experienceType: 1 })
virtualRealitySchema.index({ category: 1, 'hardware.requiredDevice': 1 })
virtualRealitySchema.index({ tags: 1 })
virtualRealitySchema.index({ 'deployment.status': 1, visibility: 1 })

// Methods
virtualRealitySchema.methods.addSession = function(sessionData: any) {
  this.analytics.sessions.push({
    sessionId: sessionData.sessionId,
    startTime: sessionData.startTime,
    endTime: sessionData.endTime,
    duration: sessionData.duration,
    interactions: sessionData.interactions || 0,
    completion: sessionData.completion || 0,
    rating: sessionData.rating
  })
  
  return this.save()
}

virtualRealitySchema.methods.calculateAverageRating = function() {
  if (this.feedback.ratings.length === 0) return 0
  
  const total = this.feedback.ratings.reduce((sum, rating) => sum + rating.overall, 0)
  return total / this.feedback.ratings.length
}

const VirtualReality = mongoose.models.VirtualReality || mongoose.model<IVirtualReality>('VirtualReality', virtualRealitySchema)
export default VirtualReality