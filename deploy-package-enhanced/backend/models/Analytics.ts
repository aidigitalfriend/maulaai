import mongoose, { Schema, Document } from 'mongoose'

// ============================================
// VISITOR TRACKING - Track every visitor
// ============================================
export interface IVisitor extends Document {
  visitorId: string // Unique visitor ID (cookie-based)
  sessionId: string // Current session ID
  userId?: string // If logged in
  firstVisit: Date
  lastVisit: Date
  visitCount: number
  ipAddress: string
  userAgent: string
  country?: string
  city?: string
  device: 'mobile' | 'tablet' | 'desktop'
  browser: string
  os: string
  referrer?: string
  landingPage: string
  isRegistered: boolean
  isActive: boolean
}

const VisitorSchema = new Schema<IVisitor>({
  visitorId: { type: String, required: true, unique: true, index: true },
  sessionId: { type: String, required: true },
  userId: { type: String, index: true },
  firstVisit: { type: Date, default: Date.now },
  lastVisit: { type: Date, default: Date.now },
  visitCount: { type: Number, default: 1 },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  country: String,
  city: String,
  device: { type: String, enum: ['mobile', 'tablet', 'desktop'], default: 'desktop' },
  browser: String,
  os: String,
  referrer: String,
  landingPage: { type: String, required: true },
  isRegistered: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

// ============================================
// PAGE VIEW TRACKING - Every page visit
// ============================================
export interface IPageView extends Document {
  visitorId: string
  sessionId: string
  userId?: string
  path: string
  title?: string
  referrer?: string
  timestamp: Date
  timeSpent?: number // seconds
  scrollDepth?: number // percentage
  interactions?: number // clicks, scrolls, etc.
}

const PageViewSchema = new Schema<IPageView>({
  visitorId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  path: { type: String, required: true, index: true },
  title: String,
  referrer: String,
  timestamp: { type: Date, default: Date.now, index: true },
  timeSpent: Number,
  scrollDepth: Number,
  interactions: { type: Number, default: 0 }
})

// ============================================
// CHAT/DEMO INTERACTIONS - All conversations
// ============================================
export interface IChatInteraction extends Document {
  visitorId: string
  sessionId: string
  userId?: string
  agentId: string
  agentName: string
  userMessage: string
  aiResponse: string
  timestamp: Date
  responseTime: number // milliseconds
  model: string // GPT-4, Claude, etc.
  satisfied?: boolean
  feedback?: string
  language?: string
}

const ChatInteractionSchema = new Schema<IChatInteraction>({
  visitorId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  agentId: { type: String, required: true, index: true },
  agentName: { type: String, required: true },
  userMessage: { type: String, required: true },
  aiResponse: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  responseTime: { type: Number, required: true },
  model: { type: String, required: true },
  satisfied: Boolean,
  feedback: String,
  language: String
})

// ============================================
// TOOL USAGE - All developer tools tests
// ============================================
export interface IToolUsage extends Document {
  visitorId: string
  sessionId: string
  userId?: string
  toolName: string
  toolCategory: string
  input: any
  output?: any
  success: boolean
  error?: string
  timestamp: Date
  executionTime: number // milliseconds
}

const ToolUsageSchema = new Schema<IToolUsage>({
  visitorId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true },
  userId: { type: String, index: true },
  toolName: { type: String, required: true, index: true },
  toolCategory: { type: String, required: true, index: true },
  input: { type: Schema.Types.Mixed, required: true },
  output: Schema.Types.Mixed,
  success: { type: Boolean, required: true },
  error: String,
  timestamp: { type: Date, default: Date.now, index: true },
  executionTime: { type: Number, required: true }
})

// ============================================
// AI LAB USAGE - All experiments
// ============================================
export interface ILabExperiment extends Document {
  visitorId: string
  sessionId: string
  userId?: string
  experimentName: string
  experimentType: string
  input: any
  output?: any
  model?: string
  success: boolean
  error?: string
  timestamp: Date
  processingTime: number
  rating?: number // 1-5 stars
}

const LabExperimentSchema = new Schema<ILabExperiment>({
  visitorId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true },
  userId: { type: String, index: true },
  experimentName: { type: String, required: true, index: true },
  experimentType: { type: String, required: true, index: true },
  input: { type: Schema.Types.Mixed, required: true },
  output: Schema.Types.Mixed,
  model: String,
  success: { type: Boolean, required: true },
  error: String,
  timestamp: { type: Date, default: Date.now, index: true },
  processingTime: { type: Number, required: true },
  rating: { type: Number, min: 1, max: 5 }
})

// ============================================
// USER EVENTS - Sign up, login, logout, etc.
// ============================================
export interface IUserEvent extends Document {
  visitorId: string
  sessionId: string
  userId?: string
  eventType: 'signup' | 'login' | 'logout' | 'profile_update' | 'settings_change' | 'subscription' | 'payment' | 'download' | 'share' | 'feedback' | 'error' | 'custom'
  eventName: string
  eventData?: any
  timestamp: Date
  success: boolean
  error?: string
}

const UserEventSchema = new Schema<IUserEvent>({
  visitorId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true },
  userId: { type: String, index: true },
  eventType: { 
    type: String, 
    required: true, 
    enum: ['signup', 'login', 'logout', 'profile_update', 'settings_change', 'subscription', 'payment', 'download', 'share', 'feedback', 'error', 'custom'],
    index: true 
  },
  eventName: { type: String, required: true, index: true },
  eventData: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now, index: true },
  success: { type: Boolean, required: true },
  error: String
})

// ============================================
// SESSION TRACKING - Complete session data
// ============================================
export interface ISession extends Document {
  sessionId: string
  visitorId: string
  userId?: string
  startTime: Date
  endTime?: Date
  duration?: number // seconds
  pageViews: number
  interactions: number
  chatMessages: number
  toolsUsed: number
  labExperiments: number
  device: string
  browser: string
  ipAddress: string
  exitPage?: string
  isActive: boolean
}

const SessionSchema = new Schema<ISession>({
  sessionId: { type: String, required: true, unique: true, index: true },
  visitorId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  startTime: { type: Date, default: Date.now, index: true },
  endTime: Date,
  duration: Number,
  pageViews: { type: Number, default: 0 },
  interactions: { type: Number, default: 0 },
  chatMessages: { type: Number, default: 0 },
  toolsUsed: { type: Number, default: 0 },
  labExperiments: { type: Number, default: 0 },
  device: { type: String, required: true },
  browser: { type: String, required: true },
  ipAddress: { type: String, required: true },
  exitPage: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

// ============================================
// API USAGE - All API calls
// ============================================
export interface IApiUsage extends Document {
  visitorId: string
  sessionId: string
  userId?: string
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  timestamp: Date
  requestBody?: any
  responseBody?: any
  error?: string
  userAgent: string
  ipAddress: string
}

const ApiUsageSchema = new Schema<IApiUsage>({
  visitorId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true },
  userId: { type: String, index: true },
  endpoint: { type: String, required: true, index: true },
  method: { type: String, required: true },
  statusCode: { type: Number, required: true, index: true },
  responseTime: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  requestBody: Schema.Types.Mixed,
  responseBody: Schema.Types.Mixed,
  error: String,
  userAgent: { type: String, required: true },
  ipAddress: { type: String, required: true }
})

// ============================================
// EXPORT MODELS
// ============================================
export const Visitor = mongoose.models.Visitor || mongoose.model<IVisitor>('Visitor', VisitorSchema)
export const PageView = mongoose.models.PageView || mongoose.model<IPageView>('PageView', PageViewSchema)
export const ChatInteraction = mongoose.models.ChatInteraction || mongoose.model<IChatInteraction>('ChatInteraction', ChatInteractionSchema)
export const ToolUsage = mongoose.models.ToolUsage || mongoose.model<IToolUsage>('ToolUsage', ToolUsageSchema)
export const LabExperiment = mongoose.models.LabExperiment || mongoose.model<ILabExperiment>('LabExperiment', LabExperimentSchema)
export const UserEvent = mongoose.models.UserEvent || mongoose.model<IUserEvent>('UserEvent', UserEventSchema)
export const Session = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema)
export const ApiUsage = mongoose.models.ApiUsage || mongoose.model<IApiUsage>('ApiUsage', ApiUsageSchema)
