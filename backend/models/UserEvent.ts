import mongoose from 'mongoose'

const userEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSession'
  },
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor'
  },
  eventType: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    default: 'interaction'
  },
  action: String,
  label: String,
  value: Number,
  properties: mongoose.Schema.Types.Mixed,
  metrics: {
    durationMs: Number,
    success: Boolean,
    errorMessage: String
  },
  source: {
    type: String,
    enum: ['web', 'mobile', 'api', 'automation', 'system'],
    default: 'web'
  },
  occurredAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    tags: [String],
    featureFlag: String,
    experiment: {
      id: String,
      variant: String
    }
  }
}, {
  timestamps: true,
  collection: 'userevents'
})

userEventSchema.index({ eventType: 1, occurredAt: -1 })
userEventSchema.index({ category: 1, action: 1 })
userEventSchema.index({ 'metadata.featureFlag': 1 })

export default mongoose.models.UserEvent || mongoose.model('UserEvent', userEventSchema, 'userevents')
