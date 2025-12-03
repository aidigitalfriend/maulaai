import { ObjectId } from 'mongodb'

export interface Agent {
  agentId: string
  name: string
  description: string
  category: 'assistant' | 'specialist' | 'creative' | 'technical' | 'business' | 'other'
  avatar: string
  prompt: string
  aiModel: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'claude-2' | 'gemini-pro' | 'mistral'
  temperature: number
  maxTokens: number
  isActive: boolean
  isPublic: boolean
  isPremium: boolean
  pricing: {
    daily: number
    weekly: number
    monthly: number
  }
  features: string[]
  tags: string[]
  capabilities: string[]
  limitations: string[]
  examples: Array<{
    input: string
    output: string
  }>
  config: {
    systemPrompt?: string
    functions?: any[]
    tools?: string[]
    personality?: string
    tone?: string
  }
  stats: {
    totalInteractions: number
    totalUsers: number
    averageRating: number
    totalRatings: number
  }
  creator: string
  version: string
  createdAt: Date
  updatedAt: Date
}

export default Agent
