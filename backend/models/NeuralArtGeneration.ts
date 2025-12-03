import { ObjectId } from 'mongodb'

export interface INeuralArtGeneration extends any {
  experimentId: ObjectId
  userId: ObjectId
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
  likes: ObjectId[]
  comments: {
    userId: ObjectId
    comment: string
    createdAt: Date
  }[]
  collections: string[]
  isNSFW: boolean
  createdAt: Date
  updatedAt: Date
}

export default NeuralArtGeneration
