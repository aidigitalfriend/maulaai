/**
 * ANALYTICS MONGOOSE MODELS
 * Database models for analytics and tracking
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

// ============================================
// VISITOR MODEL
// ============================================
const visitorSchema = new Schema(
  {
    visitorId: { type: String, required: true, unique: true, index: true },
    sessionId: { type: String, required: true },
    // Link to users collection (normalized as ObjectId)
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    firstVisit: { type: Date, required: true, default: Date.now },
    lastVisit: { type: Date, required: true, default: Date.now },
    visitCount: { type: Number, required: true, default: 1 },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    country: { type: String, default: 'Unknown' },
    city: { type: String, default: 'Unknown' },
    device: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop'],
      required: true,
    },
    browser: { type: String, required: true },
    os: { type: String, required: true },
    referrer: { type: String },
    landingPage: { type: String, default: '/' },
    isRegistered: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'visitors',
  }
);

// ============================================
// SESSION MODEL
// ============================================
const sessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    visitorId: { type: String, required: true, index: true },
    // Link to users collection (normalized as ObjectId)
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    startTime: { type: Date, required: true, default: Date.now },
    lastActivity: { type: Date, required: true, default: Date.now },
    pageViews: { type: Number, default: 0 },
    events: { type: Number, default: 0 },
    duration: { type: Number, default: 0 }, // in seconds
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'sessions',
  }
);

// ============================================
// PAGE VIEW MODEL
// ============================================
const pageViewSchema = new Schema(
  {
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    // Link to users collection (normalized as ObjectId)
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    url: { type: String, required: true },
    title: { type: String },
    referrer: { type: String },
    timeSpent: { type: Number, default: 0 }, // in seconds
    timestamp: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'pageviews',
  }
);

// ============================================
// CHAT INTERACTION MODEL
// ============================================
const chatInteractionSchema = new Schema(
  {
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    // Link to users collection (normalized as ObjectId)
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    agentId: { type: String, required: true },
    agentName: { type: String, required: true },
    userMessage: { type: String, required: true },
    aiResponse: { type: String, required: true },
    responseTime: { type: Number, required: true }, // in milliseconds
    model: { type: String },
    language: { type: String },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
    },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'chat_interactions',
  }
);

// ============================================
// TOOL USAGE MODEL
// ============================================
const toolUsageSchema = new Schema(
  {
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    // Link to users collection (normalized as ObjectId)
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    toolId: { type: String, required: true },
    toolName: { type: String, required: true },
    action: { type: String, required: true },
    parameters: { type: Schema.Types.Mixed },
    result: { type: String },
    duration: { type: Number }, // in milliseconds
    success: { type: Boolean, default: true },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'tool_usage',
  }
);

// ============================================
// LAB EXPERIMENT MODEL
// ============================================
const labExperimentSchema = new Schema(
  {
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    // Link to users collection (normalized as ObjectId)
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    experimentId: { type: String, required: true },
    experimentName: { type: String, required: true },
    parameters: { type: Schema.Types.Mixed },
    result: { type: Schema.Types.Mixed },
    duration: { type: Number }, // in milliseconds
    success: { type: Boolean, default: true },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'lab_experiments',
  }
);

// ============================================
// USER EVENT MODEL
// ============================================
const userEventSchema = new Schema(
  {
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    // Link to users collection (normalized as ObjectId)
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    eventType: { type: String, required: true },
    eventName: { type: String, required: true },
    properties: { type: Schema.Types.Mixed },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'user_events',
  }
);

// ============================================
// API USAGE MODEL
// ============================================
const apiUsageSchema = new Schema(
  {
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    // Link to users collection (normalized as ObjectId)
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    statusCode: { type: Number, required: true },
    responseTime: { type: Number, required: true }, // in milliseconds
    userAgent: { type: String },
    ipAddress: { type: String },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'api_usage',
  }
);

// Create models
export const Visitor =
  mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema);
export const Session =
  mongoose.models.Session || mongoose.model('Session', sessionSchema);
export const PageView =
  mongoose.models.PageView || mongoose.model('PageView', pageViewSchema);
export const ChatInteraction =
  mongoose.models.ChatInteraction ||
  mongoose.model('ChatInteraction', chatInteractionSchema);
export const ToolUsage =
  mongoose.models.ToolUsage || mongoose.model('ToolUsage', toolUsageSchema);
export const LabExperiment =
  mongoose.models.LabExperiment ||
  mongoose.model('LabExperiment', labExperimentSchema);
export const UserEvent =
  mongoose.models.UserEvent || mongoose.model('UserEvent', userEventSchema);
export const ApiUsage =
  mongoose.models.ApiUsage || mongoose.model('ApiUsage', apiUsageSchema);
