import mongoose from 'mongoose'

const pageViewSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSession',
    index: true
  },
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  path: {
    type: String,
    required: true,
    trim: true
  },
  title: String,
  referrer: String,
  utm: {
    source: String,
    medium: String,
    campaign: String,
    term: String,
    content: String
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
  geo: {
    country: String,
    region: String,
    city: String,
    timezone: String
  },
  performance: {
    loadTimeMs: Number,
    domInteractiveMs: Number,
    firstContentfulPaintMs: Number,
    largestContentfulPaintMs: Number
  },
  engagement: {
    timeOnPageMs: Number,
    scrollDepth: Number,
    interactions: Number,
    bounced: Boolean
  },
  experiments: [{
    key: String,
    variant: String
  }],
  occurredAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'pageviews'
})

pageViewSchema.index({ path: 1, occurredAt: -1 })
pageViewSchema.index({ 'utm.campaign': 1, occurredAt: -1 })
pageViewSchema.index({ 'device.type': 1, occurredAt: -1 })

export default mongoose.models.PageView || mongoose.model('PageView', pageViewSchema, 'pageviews')
