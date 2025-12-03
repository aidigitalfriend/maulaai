import { ObjectId } from 'mongodb'

export interface IDreamAnalysis extends any {
  experimentId: ObjectId
  userId: ObjectId
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
  relatedDreams: ObjectId[]
  tags: string[]
  isPrivate: boolean
  rating?: number
  feedback: string
  processingTime: number
  createdAt: Date
  updatedAt: Date
}

export default DreamAnalysis
