import mongoose, { Schema, Document } from 'mongoose'

export interface IAgent extends Document {
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

const AgentSchema = new Schema<IAgent>(
  {
    agentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ['assistant', 'specialist', 'creative', 'technical', 'business', 'other'],
      default: 'assistant',
      index: true,
    },
    avatar: {
      type: String,
      default: '🤖',
    },
    prompt: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    aiModel: {
      type: String,
      enum: ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'claude-2', 'gemini-pro', 'mistral'],
      default: 'gpt-4',
      index: true,
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2,
    },
    maxTokens: {
      type: Number,
      default: 1000,
      min: 100,
      max: 8000,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
      index: true,
    },
    pricing: {
      daily: { type: Number, default: 100 }, // in cents
      weekly: { type: Number, default: 500 },
      monthly: { type: Number, default: 1900 },
    },
    features: [{
      type: String,
      trim: true,
    }],
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    capabilities: [{
      type: String,
      trim: true,
    }],
    limitations: [{
      type: String,
      trim: true,
    }],
    examples: [{
      input: { type: String, required: true },
      output: { type: String, required: true },
    }],
    config: {
      systemPrompt: String,
      functions: [Schema.Types.Mixed],
      tools: [String],
      personality: String,
      tone: String,
    },
    stats: {
      totalInteractions: { type: Number, default: 0 },
      totalUsers: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
    },
    creator: {
      type: String,
      required: true,
      index: true,
    },
    version: {
      type: String,
      default: '1.0.0',
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
AgentSchema.index({ category: 1, isActive: 1, isPublic: 1 })
AgentSchema.index({ isPremium: 1, isActive: 1 })
AgentSchema.index({ tags: 1, isActive: 1 })
AgentSchema.index({ 'stats.averageRating': -1, 'stats.totalRatings': -1 })

// Methods
AgentSchema.methods.updateStats = function (rating?: number) {
  this.stats.totalInteractions += 1
  
  if (rating !== undefined && rating >= 1 && rating <= 5) {
    const currentTotal = this.stats.averageRating * this.stats.totalRatings
    this.stats.totalRatings += 1
    this.stats.averageRating = (currentTotal + rating) / this.stats.totalRatings
  }
  
  return this.save()
}

AgentSchema.methods.addUser = function () {
  this.stats.totalUsers += 1
  return this.save()
}

AgentSchema.methods.toJSON = function () {
  const agent = this.toObject()
  delete agent.__v
  return agent
}

export default mongoose.models.Agent ||
  mongoose.model<IAgent>('Agent', AgentSchema)