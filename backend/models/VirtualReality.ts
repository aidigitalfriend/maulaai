import { ObjectId } from 'mongodb'

export interface IVirtualReality extends any {
  experimentId: ObjectId
  userId: ObjectId
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
      userId: ObjectId
      overall: number // 1-5
      immersion: number
      comfort: number
      content: number
      performance: number
      comment?: string
      timestamp: Date
    }[]
    reviews: {
      userId: ObjectId
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

export default VirtualReality
