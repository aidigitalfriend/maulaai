import mongoose from 'mongoose'

export interface ISmartAssistant extends mongoose.Document {
  experimentId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  name: string
  description?: string
  assistantType: 'personal' | 'business' | 'educational' | 'creative' | 'technical' | 'health' | 'finance' | 'travel' | 'custom'
  personality: {
    traits: {
      extraversion: number // 0-1
      agreeableness: number
      conscientiousness: number
      neuroticism: number
      openness: number
    }
    communication: {
      tone: 'formal' | 'casual' | 'friendly' | 'professional' | 'humorous' | 'empathetic'
      verbosity: 'concise' | 'balanced' | 'detailed'
      style: 'direct' | 'conversational' | 'supportive' | 'analytical'
    }
    behavior: {
      proactivity: number // 0-1
      curiosity: number
      patience: number
      adaptability: number
    }
  }
  capabilities: {
    knowledgeDomains: string[]
    skills: {
      skill: string
      proficiency: number // 0-1
      examples: string[]
    }[]
    languages: string[]
    specializations: string[]
  }
  configuration: {
    aiModel: string
    temperature: number // 0-2
    maxTokens: number
    contextWindow: number
    memoryDepth: number // how many interactions to remember
    learningRate: number // how quickly to adapt
  }
  conversations: {
    conversationId: string
    messages: {
      role: 'user' | 'assistant' | 'system'
      content: string
      timestamp: Date
      metadata?: {
        emotions?: string[]
        intent?: string
        confidence?: number
        processingTime?: number
      }
    }[]
    summary?: string
    mood?: string
    topics: string[]
    satisfaction?: number
    startedAt: Date
    lastActiveAt: Date
  }[]
  memory: {
    shortTerm: {
      key: string
      value: any
      relevance: number
      expiresAt?: Date
    }[]
    longTerm: {
      category: 'preference' | 'fact' | 'relationship' | 'goal' | 'habit'
      key: string
      value: any
      confidence: number
      lastUpdated: Date
      importance: number
    }[]
    contextual: {
      situation: string
      context: any
      relevantFor: string[]
      createdAt: Date
    }[]
  }
  learning: {
    interactions: number
    improvements: {
      area: string
      before: number
      after: number
      timestamp: Date
      feedback?: string
    }[]
    userFeedback: {
      rating: number
      comment?: string
      category: 'helpful' | 'accurate' | 'friendly' | 'fast' | 'understanding'
      timestamp: Date
    }[]
    adaptations: {
      trigger: string
      change: string
      impact: number
      timestamp: Date
    }[]
  }
  tasks: {
    taskId: string
    type: 'reminder' | 'research' | 'planning' | 'monitoring' | 'notification' | 'automation'
    title: string
    description: string
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    dueDate?: Date
    completedAt?: Date
    result?: string
    steps?: {
      step: string
      completed: boolean
      timestamp?: Date
    }[]
  }[]
  integrations: {
    service: string
    enabled: boolean
    credentials?: string // encrypted
    permissions: string[]
    lastSync?: Date
    status: 'connected' | 'disconnected' | 'error'
  }[]
  analytics: {
    totalInteractions: number
    averageResponseTime: number
    satisfactionScore: number
    topTopics: {
      topic: string
      count: number
    }[]
    usagePatterns: {
      timeOfDay: Record<string, number>
      dayOfWeek: Record<string, number>
      sessionLength: number[]
    }
  }
  settings: {
    isActive: boolean
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
    privacy: {
      dataRetention: number // days
      shareAnalytics: boolean
      anonymizeData: boolean
    }
    automation: {
      proactiveMode: boolean
      autoLearn: boolean
      suggestTasks: boolean
    }
  }
  createdAt: Date
  updatedAt: Date
}

const smartAssistantSchema = new mongoose.Schema<ISmartAssistant>({
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
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  assistantType: {
    type: String,
    enum: ['personal', 'business', 'educational', 'creative', 'technical', 'health', 'finance', 'travel', 'custom'],
    required: true,
    index: true
  },
  personality: {
    traits: {
      extraversion: { type: Number, required: true, min: 0, max: 1 },
      agreeableness: { type: Number, required: true, min: 0, max: 1 },
      conscientiousness: { type: Number, required: true, min: 0, max: 1 },
      neuroticism: { type: Number, required: true, min: 0, max: 1 },
      openness: { type: Number, required: true, min: 0, max: 1 }
    },
    communication: {
      tone: { type: String, enum: ['formal', 'casual', 'friendly', 'professional', 'humorous', 'empathetic'], required: true },
      verbosity: { type: String, enum: ['concise', 'balanced', 'detailed'], required: true },
      style: { type: String, enum: ['direct', 'conversational', 'supportive', 'analytical'], required: true }
    },
    behavior: {
      proactivity: { type: Number, required: true, min: 0, max: 1 },
      curiosity: { type: Number, required: true, min: 0, max: 1 },
      patience: { type: Number, required: true, min: 0, max: 1 },
      adaptability: { type: Number, required: true, min: 0, max: 1 }
    }
  },
  capabilities: {
    knowledgeDomains: [{ type: String, maxlength: 100 }],
    skills: [{
      skill: { type: String, required: true, maxlength: 100 },
      proficiency: { type: Number, required: true, min: 0, max: 1 },
      examples: [{ type: String, maxlength: 200 }]
    }],
    languages: [{ type: String, maxlength: 50 }],
    specializations: [{ type: String, maxlength: 100 }]
  },
  configuration: {
    aiModel: { type: String, required: true, maxlength: 100 },
    temperature: { type: Number, required: true, min: 0, max: 2 },
    maxTokens: { type: Number, required: true, min: 1, max: 100000 },
    contextWindow: { type: Number, required: true, min: 1, max: 100000 },
    memoryDepth: { type: Number, required: true, min: 1, max: 1000 },
    learningRate: { type: Number, required: true, min: 0, max: 1 }
  },
  conversations: [{
    conversationId: { type: String, required: true },
    messages: [{
      role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
      content: { type: String, required: true, maxlength: 10000 },
      timestamp: { type: Date, required: true },
      metadata: {
        emotions: [{ type: String, maxlength: 50 }],
        intent: { type: String, maxlength: 100 },
        confidence: { type: Number, min: 0, max: 1 },
        processingTime: { type: Number, min: 0 }
      }
    }],
    summary: { type: String, maxlength: 1000 },
    mood: { type: String, maxlength: 100 },
    topics: [{ type: String, maxlength: 100 }],
    satisfaction: { type: Number, min: 1, max: 5 },
    startedAt: { type: Date, required: true },
    lastActiveAt: { type: Date, required: true }
  }],
  memory: {
    shortTerm: [{
      key: { type: String, required: true, maxlength: 100 },
      value: mongoose.Schema.Types.Mixed,
      relevance: { type: Number, required: true, min: 0, max: 1 },
      expiresAt: { type: Date }
    }],
    longTerm: [{
      category: { type: String, enum: ['preference', 'fact', 'relationship', 'goal', 'habit'], required: true },
      key: { type: String, required: true, maxlength: 100 },
      value: mongoose.Schema.Types.Mixed,
      confidence: { type: Number, required: true, min: 0, max: 1 },
      lastUpdated: { type: Date, required: true },
      importance: { type: Number, required: true, min: 0, max: 1 }
    }],
    contextual: [{
      situation: { type: String, required: true, maxlength: 200 },
      context: mongoose.Schema.Types.Mixed,
      relevantFor: [{ type: String, maxlength: 100 }],
      createdAt: { type: Date, required: true }
    }]
  },
  learning: {
    interactions: { type: Number, default: 0, min: 0 },
    improvements: [{
      area: { type: String, required: true, maxlength: 100 },
      before: { type: Number, required: true, min: 0, max: 1 },
      after: { type: Number, required: true, min: 0, max: 1 },
      timestamp: { type: Date, required: true },
      feedback: { type: String, maxlength: 500 }
    }],
    userFeedback: [{
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, maxlength: 1000 },
      category: { type: String, enum: ['helpful', 'accurate', 'friendly', 'fast', 'understanding'], required: true },
      timestamp: { type: Date, required: true }
    }],
    adaptations: [{
      trigger: { type: String, required: true, maxlength: 200 },
      change: { type: String, required: true, maxlength: 300 },
      impact: { type: Number, required: true, min: -1, max: 1 },
      timestamp: { type: Date, required: true }
    }]
  },
  tasks: [{
    taskId: { type: String, required: true },
    type: { type: String, enum: ['reminder', 'research', 'planning', 'monitoring', 'notification', 'automation'], required: true },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 1000 },
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'cancelled'], required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], required: true },
    dueDate: { type: Date },
    completedAt: { type: Date },
    result: { type: String, maxlength: 2000 },
    steps: [{
      step: { type: String, required: true, maxlength: 300 },
      completed: { type: Boolean, default: false },
      timestamp: { type: Date }
    }]
  }],
  integrations: [{
    service: { type: String, required: true, maxlength: 100 },
    enabled: { type: Boolean, default: false },
    credentials: { type: String }, // encrypted
    permissions: [{ type: String, maxlength: 100 }],
    lastSync: { type: Date },
    status: { type: String, enum: ['connected', 'disconnected', 'error'], required: true }
  }],
  analytics: {
    totalInteractions: { type: Number, default: 0, min: 0 },
    averageResponseTime: { type: Number, default: 0, min: 0 },
    satisfactionScore: { type: Number, default: 0, min: 0, max: 5 },
    topTopics: [{
      topic: { type: String, required: true, maxlength: 100 },
      count: { type: Number, required: true, min: 0 }
    }],
    usagePatterns: {
      timeOfDay: { type: Map, of: Number },
      dayOfWeek: { type: Map, of: Number },
      sessionLength: [{ type: Number, min: 0 }]
    }
  },
  settings: {
    isActive: { type: Boolean, default: true, index: true },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      dataRetention: { type: Number, default: 365, min: 1, max: 3650 },
      shareAnalytics: { type: Boolean, default: false },
      anonymizeData: { type: Boolean, default: true }
    },
    automation: {
      proactiveMode: { type: Boolean, default: false },
      autoLearn: { type: Boolean, default: true },
      suggestTasks: { type: Boolean, default: true }
    }
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
smartAssistantSchema.index({ userId: 1, assistantType: 1 })
smartAssistantSchema.index({ 'conversations.conversationId': 1 })
smartAssistantSchema.index({ 'tasks.status': 1, 'tasks.dueDate': 1 })
smartAssistantSchema.index({ 'settings.isActive': 1 })

// Methods
smartAssistantSchema.methods.addMessage = function(conversationId: string, role: string, content: string, metadata?: any) {
  let conversation = this.conversations.find(conv => conv.conversationId === conversationId)
  
  if (!conversation) {
    conversation = {
      conversationId,
      messages: [],
      topics: [],
      startedAt: new Date(),
      lastActiveAt: new Date()
    }
    this.conversations.push(conversation)
  }
  
  conversation.messages.push({
    role,
    content,
    timestamp: new Date(),
    metadata
  })
  
  conversation.lastActiveAt = new Date()
  this.analytics.totalInteractions++
  
  return this.save()
}

smartAssistantSchema.methods.updateMemory = function(category: string, key: string, value: any, confidence: number = 0.8) {
  const existingMemory = this.memory.longTerm.find(mem => mem.key === key && mem.category === category)
  
  if (existingMemory) {
    existingMemory.value = value
    existingMemory.confidence = confidence
    existingMemory.lastUpdated = new Date()
  } else {
    this.memory.longTerm.push({
      category,
      key,
      value,
      confidence,
      lastUpdated: new Date(),
      importance: confidence
    })
  }
  
  return this.save()
}

const SmartAssistant = mongoose.models.SmartAssistant || mongoose.model<ISmartAssistant>('SmartAssistant', smartAssistantSchema)
export default SmartAssistant