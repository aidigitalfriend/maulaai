import mongoose from 'mongoose'

const chatInteractionSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
    index: true
  },
  channel: {
    type: String,
    enum: ['web', 'mobile', 'api', 'automation', 'whatsapp', 'slack', 'discord'],
    default: 'web'
  },
  language: {
    type: String,
    default: 'en'
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system', 'tool'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    tokens: Number,
    latencyMs: Number,
    sentiment: {
      score: Number,
      label: String
    },
    attachments: [{
      type: {
        type: String
      },
      url: String,
      size: Number,
      name: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  summary: {
    title: String,
    keywords: [String],
    actionItems: [String]
  },
  satisfaction: {
    rating: Number,
    feedback: String,
    collectedAt: Date
  },
  metrics: {
    totalTokens: { type: Number, default: 0 },
    durationMs: Number,
    turnCount: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'escalated', 'pending_user', 'pending_agent'],
    default: 'open',
    index: true
  },
  metadata: {
    tags: [String],
    useCase: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: Date
}, {
  timestamps: true,
  collection: 'chatinteractions'
})

chatInteractionSchema.index({ conversationId: 1 }, { unique: true })
chatInteractionSchema.index({ startedAt: -1 })
chatInteractionSchema.index({ 'metrics.totalTokens': -1 })

export default mongoose.models.ChatInteraction || mongoose.model('ChatInteraction', chatInteractionSchema, 'chatinteractions')
