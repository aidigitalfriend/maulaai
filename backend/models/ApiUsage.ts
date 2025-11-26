import mongoose from 'mongoose'

const apiUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: false
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    index: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  endpoint: {
    type: String,
    required: true,
    trim: true
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'STREAM'],
    default: 'POST'
  },
  tokens: {
    prompt: { type: Number, default: 0 },
    completion: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  latencyMs: {
    type: Number,
    default: 0
  },
  costUsd: {
    type: Number,
    default: 0
  },
  success: {
    type: Boolean,
    default: true,
    index: true
  },
  statusCode: Number,
  error: {
    type: {
      message: String,
      code: String,
      provider: String,
      retryable: Boolean
    },
    default: null
  },
  request: {
    traceId: { type: String, index: true },
    model: String,
    temperature: Number,
    topP: Number,
    stream: Boolean,
    bodySummary: String
  },
  response: {
    provider: String,
    finishReason: String,
    outputSummary: String
  },
  metadata: {
    ipAddress: String,
    region: String,
    client: {
      type: String,
      enum: ['web', 'mobile', 'api', 'automation', 'webhook'],
      default: 'web'
    },
    tags: [String],
    rateLimitBucket: String
  },
  occurredAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'apiusages'
})

apiUsageSchema.index({ userId: 1, occurredAt: -1 })
apiUsageSchema.index({ agentId: 1, occurredAt: -1 })
apiUsageSchema.index({ success: 1, occurredAt: -1 })
apiUsageSchema.index({ 'metadata.rateLimitBucket': 1 })

export default mongoose.models.ApiUsage || mongoose.model('ApiUsage', apiUsageSchema, 'apiusages')
