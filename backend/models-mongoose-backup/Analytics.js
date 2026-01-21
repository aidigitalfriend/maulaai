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
// CHAT INTERACTION MODEL (matches actual DB schema)
// ============================================
const chatInteractionSchema = new Schema(
  {
    conversationId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent', index: true },
    channel: { type: String, enum: ['web', 'mobile', 'api'], default: 'web' },
    language: { type: String, default: 'en' },
    messages: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true,
        },
        content: { type: String, required: true },
        attachments: [{ type: Schema.Types.Mixed }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    summary: {
      keywords: [{ type: String }],
      actionItems: [{ type: String }],
    },
    metrics: {
      totalTokens: { type: Number, default: 0 },
      durationMs: { type: Number, default: 0 },
      turnCount: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'archived'],
      default: 'active',
    },
    metadata: {
      tags: [{ type: String }],
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
    },
    startedAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: 'chatinteractions',
  }
);

// ============================================
// TOOL USAGE MODEL (matches actual DB schema)
// ============================================
const toolUsageSchema = new Schema(
  {
    toolName: { type: String, required: true, index: true },
    version: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent', index: true },
    command: { type: String, required: true },
    arguments: { type: Schema.Types.Mixed },
    inputPreview: { type: String },
    outputPreview: { type: String },
    tokens: {
      input: { type: Number, default: 0 },
      output: { type: Number, default: 0 },
    },
    latencyMs: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    metadata: {
      integration: { type: String },
      environment: { type: String },
      tags: [{ type: String }],
    },
    occurredAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'toolusages',
  }
);

// ============================================
// USER EVENT MODEL (matches actual DB schema)
// ============================================
const userEventSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    eventType: { type: String, required: true, index: true },
    category: { type: String, required: true },
    action: { type: String, required: true },
    label: { type: String },
    value: { type: Number },
    properties: { type: Schema.Types.Mixed },
    metrics: {
      durationMs: { type: Number },
      success: { type: Boolean },
    },
    source: { type: String, enum: ['web', 'mobile', 'api'], default: 'web' },
    occurredAt: { type: Date, default: Date.now },
    metadata: {
      tags: [{ type: String }],
      featureFlag: { type: String },
    },
  },
  {
    timestamps: true,
    collection: 'userevents',
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
    collection: 'apiusages',
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
export const UserEvent =
  mongoose.models.UserEvent || mongoose.model('UserEvent', userEventSchema);
export const ApiUsage =
  mongoose.models.ApiUsage || mongoose.model('ApiUsage', apiUsageSchema);
