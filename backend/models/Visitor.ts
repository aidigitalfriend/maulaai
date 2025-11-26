import mongoose from 'mongoose'

const visitorSchema = new mongoose.Schema({
  visitorId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstSeenAt: {
    type: Date,
    default: Date.now
  },
  lastSeenAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  sessionCount: {
    type: Number,
    default: 1
  },
  pageViews: {
    type: Number,
    default: 0
  },
  converted: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    country: String,
    region: String,
    city: String,
    timezone: String,
    latitude: Number,
    longitude: Number
  },
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'bot', 'other'],
      default: 'desktop'
    },
    os: String,
    browser: String
  },
  trafficSource: {
    source: String,
    medium: String,
    campaign: String,
    referrer: String
  },
  consent: {
    marketing: { type: Boolean, default: false },
    analytics: { type: Boolean, default: true },
    personalization: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
  },
  attributes: {
    tags: [String],
    interests: [String],
    score: { type: Number, default: 0 }
  },
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true,
  collection: 'visitors'
})

visitorSchema.index({ converted: 1, lastSeenAt: -1 })
visitorSchema.index({ 'trafficSource.source': 1 })
visitorSchema.index({ 'location.country': 1 })

export default mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema, 'visitors')
