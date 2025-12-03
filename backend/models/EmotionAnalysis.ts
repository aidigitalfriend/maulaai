import { ObjectId } from 'mongodb'

export interface IEmotionAnalysis extends any {
  experimentId: ObjectId
  userId: ObjectId
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
    baseline?: ObjectId
    previousAnalysis?: ObjectId
    improvement?: number
  }
  tags: string[]
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
}

export default EmotionAnalysis
