import mongoose from 'mongoose'

const { Schema } = mongoose

// VISITOR TRACKING
const VisitorSchema = new Schema({
  visitorId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, index: true },
  firstVisit: { type: Date, default: Date.now },
  lastVisit: { type: Date, default: Date.now },
  visitCount: { type: Number, default: 1 },
  device: String,
  browser: String,
  os: String,
  country: String,
  city: String,
  ipAddress: String
}, { timestamps: true })

// SESSION TRACKING
const SessionSchema = new Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  visitorId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  lastActivity: { type: Date, default: Date.now },
  pageViews: { type: Number, default: 0 },
  events: { type: Number, default: 0 }
}, { timestamps: true })

// PAGE VIEW TRACKING
const PageViewSchema = new Schema({
  visitorId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  url: { type: String, required: true },
  title: String,
  referrer: String,
  timeSpent: Number,
  scrollDepth: Number,
  timestamp: { type: Date, default: Date.now, index: true }
})

// CHAT INTERACTION TRACKING
const ChatInteractionSchema = new Schema({
  visitorId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  agentId: { type: String, required: true, index: true },
  agentName: { type: String, required: true },
  userMessage: { type: String, required: true },
  aiResponse: { type: String, required: true },
  responseTime: Number,
  model: String,
  language: String,
  satisfied: Boolean,
  feedback: String,
  timestamp: { type: Date, default: Date.now, index: true }
})

// TOOL USAGE TRACKING
const ToolUsageSchema = new Schema({
  visitorId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  toolName: { type: String, required: true, index: true },
  toolCategory: String,
  input: Schema.Types.Mixed,
  output: Schema.Types.Mixed,
  success: Boolean,
  error: String,
  executionTime: Number,
  timestamp: { type: Date, default: Date.now, index: true }
})

// LAB EXPERIMENT TRACKING
const LabExperimentSchema = new Schema({
  visitorId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  experimentName: { type: String, required: true, index: true },
  experimentType: String,
  input: Schema.Types.Mixed,
  output: Schema.Types.Mixed,
  model: String,
  success: Boolean,
  error: String,
  processingTime: Number,
  rating: Number,
  timestamp: { type: Date, default: Date.now, index: true }
})

// USER EVENT TRACKING
const UserEventSchema = new Schema({
  visitorId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  eventType: { type: String, required: true, index: true },
  eventName: { type: String, required: true },
  eventData: Schema.Types.Mixed,
  success: { type: Boolean, default: true },
  error: String,
  timestamp: { type: Date, default: Date.now, index: true }
})

// API USAGE TRACKING
const ApiUsageSchema = new Schema({
  visitorId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  endpoint: { type: String, required: true, index: true },
  method: String,
  statusCode: Number,
  responseTime: Number,
  userAgent: String,
  ipAddress: String,
  timestamp: { type: Date, default: Date.now, index: true }
})

// EXPORT MODELS
export const Visitor = mongoose.model('Visitor', VisitorSchema)
export const Session = mongoose.model('Session', SessionSchema)
export const PageView = mongoose.model('PageView', PageViewSchema)
export const ChatInteraction = mongoose.model('ChatInteraction', ChatInteractionSchema)
export const ToolUsage = mongoose.model('ToolUsage', ToolUsageSchema)
export const LabExperiment = mongoose.model('LabExperiment', LabExperimentSchema)
export const UserEvent = mongoose.model('UserEvent', UserEventSchema)
export const ApiUsage = mongoose.model('ApiUsage', ApiUsageSchema)
