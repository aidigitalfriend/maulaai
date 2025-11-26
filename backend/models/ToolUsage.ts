import mongoose from 'mongoose'

const toolUsageSchema = new mongoose.Schema({
  toolName: {
    type: String,
    required: true,
    index: true
  },
  version: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    index: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSession'
  },
  command: String,
  arguments: mongoose.Schema.Types.Mixed,
  inputPreview: String,
  outputPreview: String,
  tokens: {
    input: { type: Number, default: 0 },
    output: { type: Number, default: 0 }
  },
  latencyMs: Number,
  costUsd: Number,
  status: {
    type: String,
    enum: ['queued', 'running', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  error: {
    message: String,
    code: String,
    stack: String
  },
  metadata: {
    integration: String,
    environment: {
      type: String,
      enum: ['production', 'staging', 'development'],
      default: 'development'
    },
    tags: [String]
  },
  occurredAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'toolusages'
})

toolUsageSchema.index({ userId: 1, occurredAt: -1 })
toolUsageSchema.index({ agentId: 1, toolName: 1, occurredAt: -1 })
toolUsageSchema.index({ status: 1 })

export default mongoose.models.ToolUsage || mongoose.model('ToolUsage', toolUsageSchema, 'toolusages')
