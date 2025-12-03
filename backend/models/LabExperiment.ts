import { ObjectId } from 'mongodb'

export interface ILabExperiment extends any {
  userId: ObjectId
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

export default LabExperiment
