# Universal Chat Database Collections Specification

## Overview

This document specifies all database collections required for the `components/universal-chat/` system. Based on analysis of the frontend components, backend models, and data flow, the following collections are needed for complete chat functionality.

## Collections Summary

| Collection             | Purpose                                  | Status    | Documents | Indexes  | Validation |
| ---------------------- | ---------------------------------------- | --------- | --------- | -------- | ---------- |
| `chatinteractions`     | Store chat conversations and messages    | ✅ Exists | High      | Multiple | Strict     |
| `chat_sessions`        | Manage chat session metadata             | ❌ New    | Medium    | Multiple | Medium     |
| `chat_settings`        | User chat preferences and configurations | ❌ New    | Low       | Few      | Medium     |
| `chat_quick_actions`   | Quick action templates and categories    | ❌ New    | Low       | Few      | Light      |
| `chat_feedback`        | Message feedback and ratings             | ❌ New    | Medium    | Multiple | Light      |
| `chat_canvas_projects` | Canvas mode projects                     | ❌ New    | Low       | Few      | Medium     |
| `chat_canvas_files`    | Generated files in canvas mode           | ❌ New    | High      | Multiple | Medium     |
| `chat_canvas_history`  | Canvas generation history                | ❌ New    | Medium    | Multiple | Light      |
| `agents`               | Agent configurations and metadata        | ✅ Exists | Medium    | Multiple | Strict     |
| `users`                | User profiles and authentication         | ✅ Exists | High      | Multiple | Strict     |

---

## 1. `chatinteractions` Collection

**Status:** ✅ **EXISTS** - Already implemented in `backend/models/Analytics.js`

### Purpose

Stores complete chat conversations between users and agents, including message history, metadata, and analytics.

### Documents Structure

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  conversationId: "conv-1703123456789-abc123def",
  userId: ObjectId("507f1f77bcf86cd799439012"),
  agentId: ObjectId("507f1f77bcf86cd799439013"),
  channel: "web",
  language: "en",
  messages: [
    {
      role: "user",
      content: "Hello, can you help me?",
      attachments: [],
      createdAt: ISODate("2024-01-20T10:30:00.000Z")
    },
    {
      role: "assistant",
      content: "Of course! I'd be happy to help. What do you need assistance with?",
      attachments: [],
      createdAt: ISODate("2024-01-20T10:30:02.000Z")
    }
  ],
  summary: {
    keywords: ["help", "assistance"],
    actionItems: ["Provide guidance"]
  },
  metrics: {
    totalTokens: 156,
    durationMs: 2500,
    turnCount: 2
  },
  status: "active",
  metadata: {
    tags: ["general"],
    priority: "medium"
  },
  startedAt: ISODate("2024-01-20T10:30:00.000Z"),
  closedAt: null,
  createdAt: ISODate("2024-01-20T10:30:00.000Z"),
  updatedAt: ISODate("2024-01-20T10:30:02.000Z")
}
```

### Schema Definition

```javascript
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
```

### Indexes

```javascript
// Compound indexes for efficient queries
db.chatinteractions.createIndex({ conversationId: 1, userId: 1 });
db.chatinteractions.createIndex({ userId: 1, startedAt: -1 });
db.chatinteractions.createIndex({ agentId: 1, startedAt: -1 });
db.chatinteractions.createIndex({ status: 1, updatedAt: -1 });
db.chatinteractions.createIndex({ 'messages.createdAt': -1 });

// Text index for content search
db.chatinteractions.createIndex({
  'messages.content': 'text',
  conversationId: 1,
});
```

### Validation Rules

```javascript
db.runCommand({
  collMod: 'chatinteractions',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['conversationId', 'messages'],
      properties: {
        conversationId: {
          bsonType: 'string',
          description: 'must be a string and is required',
        },
        userId: {
          bsonType: 'objectId',
          description: 'must be an ObjectId if present',
        },
        agentId: {
          bsonType: 'objectId',
          description: 'must be an ObjectId if present',
        },
        messages: {
          bsonType: 'array',
          minItems: 1,
          description: 'must be an array with at least one message',
        },
      },
    },
  },
});
```

### Aggregations

#### Get User Chat Statistics

```javascript
db.chatinteractions.aggregate([
  { $match: { userId: ObjectId('user_id') } },
  {
    $group: {
      _id: '$userId',
      totalConversations: { $sum: 1 },
      totalMessages: { $sum: { $size: '$messages' } },
      totalTokens: { $sum: '$metrics.totalTokens' },
      avgResponseTime: { $avg: '$metrics.durationMs' },
      lastActivity: { $max: '$updatedAt' },
    },
  },
]);
```

#### Get Agent Performance Metrics

```javascript
db.chatinteractions.aggregate([
  { $match: { agentId: ObjectId('agent_id') } },
  {
    $group: {
      _id: '$agentId',
      totalInteractions: { $sum: 1 },
      totalUsers: { $addToSet: '$userId' },
      avgTokensPerInteraction: { $avg: '$metrics.totalTokens' },
      avgDuration: { $avg: '$metrics.durationMs' },
    },
  },
  {
    $project: {
      totalInteractions: 1,
      totalUsers: { $size: '$totalUsers' },
      avgTokensPerInteraction: 1,
      avgDuration: 1,
    },
  },
]);
```

---

## 2. `chat_sessions` Collection

**Status:** ❌ **NEW** - Needs to be created

### Purpose

Manages chat session metadata, separate from message content for better performance and organization.

### Documents Structure

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  sessionId: "session-1703123456789-abc123",
  userId: ObjectId("507f1f77bcf86cd799439012"),
  agentId: ObjectId("507f1f77bcf86cd799439013"),
  name: "Welcome Conversation",
  description: "Initial conversation with AI assistant",
  isActive: true,
  isArchived: false,
  tags: ["welcome", "general"],
  settings: {
    temperature: 0.7,
    maxTokens: 2000,
    mode: "balanced",
    provider: "mistral"
  },
  stats: {
    messageCount: 5,
    totalTokens: 450,
    durationMs: 12500,
    lastMessageAt: ISODate("2024-01-20T10:35:00.000Z")
  },
  createdAt: ISODate("2024-01-20T10:30:00.000Z"),
  updatedAt: ISODate("2024-01-20T10:35:00.000Z"),
  archivedAt: null
}
```

### Schema Definition

```javascript
const chatSessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent', index: true },
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    isActive: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    tags: [{ type: String }],
    settings: {
      temperature: { type: Number, min: 0, max: 2, default: 0.7 },
      maxTokens: { type: Number, min: 1, max: 4000, default: 2000 },
      mode: {
        type: String,
        enum: ['professional', 'balanced', 'creative', 'fast', 'coding'],
        default: 'balanced',
      },
      provider: {
        type: String,
        enum: [
          'openai',
          'anthropic',
          'gemini',
          'cohere',
          'mistral',
          'xai',
          'huggingface',
          'groq',
        ],
        default: 'mistral',
      },
      model: { type: String },
    },
    stats: {
      messageCount: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
      durationMs: { type: Number, default: 0 },
      lastMessageAt: { type: Date },
    },
    archivedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: 'chat_sessions',
  }
);
```

### Indexes

```javascript
db.chat_sessions.createIndex({ userId: 1, updatedAt: -1 });
db.chat_sessions.createIndex({ agentId: 1, createdAt: -1 });
db.chat_sessions.createIndex({ isActive: 1, updatedAt: -1 });
db.chat_sessions.createIndex({ tags: 1 });
db.chat_sessions.createIndex({ 'settings.provider': 1 });
```

### Validation Rules

```javascript
db.runCommand({
  collMod: 'chat_sessions',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['sessionId', 'userId', 'name'],
      properties: {
        sessionId: {
          bsonType: 'string',
          description: 'must be a string and is required',
        },
        userId: {
          bsonType: 'objectId',
          description: 'must be an ObjectId and is required',
        },
        name: {
          bsonType: 'string',
          maxLength: 100,
          description: 'must be a string with max length 100',
        },
      },
    },
  },
});
```

### Aggregations

#### Get User's Active Sessions

```javascript
db.chat_sessions.aggregate([
  { $match: { userId: ObjectId('user_id'), isActive: true } },
  { $sort: { updatedAt: -1 } },
  {
    $lookup: {
      from: 'agents',
      localField: 'agentId',
      foreignField: '_id',
      as: 'agent',
    },
  },
  {
    $project: {
      sessionId: 1,
      name: 1,
      agentName: { $arrayElemAt: ['$agent.name', 0] },
      stats: 1,
      updatedAt: 1,
    },
  },
]);
```

---

## 3. `chat_settings` Collection

**Status:** ❌ **NEW** - Needs to be created

### Purpose

Stores user-specific chat settings and preferences that persist across sessions.

### Documents Structure

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  userId: ObjectId("507f1f77bcf86cd799439012"),
  theme: "dark",
  fontSize: "medium",
  notifications: {
    messageReceived: true,
    agentResponses: true,
    systemUpdates: false
  },
  autoSave: true,
  defaultAgent: ObjectId("507f1f77bcf86cd799439013"),
  quickActions: {
    enabled: true,
    favorites: ["explain", "summarize", "code"]
  },
  privacy: {
    saveHistory: true,
    allowAnalytics: true,
    shareConversations: false
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReader: false
  },
  createdAt: ISODate("2024-01-20T10:30:00.000Z"),
  updatedAt: ISODate("2024-01-20T10:35:00.000Z")
}
```

### Schema Definition

```javascript
const chatSettingsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto', 'neural'],
      default: 'auto',
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    notifications: {
      messageReceived: { type: Boolean, default: true },
      agentResponses: { type: Boolean, default: true },
      systemUpdates: { type: Boolean, default: false },
    },
    autoSave: { type: Boolean, default: true },
    defaultAgent: { type: Schema.Types.ObjectId, ref: 'Agent' },
    quickActions: {
      enabled: { type: Boolean, default: true },
      favorites: [{ type: String }],
    },
    privacy: {
      saveHistory: { type: Boolean, default: true },
      allowAnalytics: { type: Boolean, default: true },
      shareConversations: { type: Boolean, default: false },
    },
    accessibility: {
      highContrast: { type: Boolean, default: false },
      reducedMotion: { type: Boolean, default: false },
      screenReader: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    collection: 'chat_settings',
  }
);
```

### Indexes

```javascript
db.chat_settings.createIndex({ userId: 1 }, { unique: true });
db.chat_settings.createIndex({ defaultAgent: 1 });
```

### Validation Rules

```javascript
db.runCommand({
  collMod: 'chat_settings',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId'],
      properties: {
        userId: {
          bsonType: 'objectId',
          description: 'must be an ObjectId and is required',
        },
      },
    },
  },
});
```

---

## 4. `chat_quick_actions` Collection

**Status:** ❌ **NEW** - Needs to be created

### Purpose

Stores predefined quick action templates that users can access in the chat interface.

### Documents Structure

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  actionId: "explain",
  label: "Explain this",
  prompt: "Please explain this in simple terms: ",
  category: "Learning",
  icon: "AcademicCapIcon",
  isDefault: true,
  isActive: true,
  usageCount: 1250,
  createdBy: ObjectId("507f1f77bcf86cd799439012"),
  createdAt: ISODate("2024-01-15T08:00:00.000Z"),
  updatedAt: ISODate("2024-01-20T10:30:00.000Z")
}
```

### Schema Definition

```javascript
const chatQuickActionSchema = new Schema(
  {
    actionId: { type: String, required: true, unique: true, index: true },
    label: { type: String, required: true, maxlength: 50 },
    prompt: { type: String, required: true, maxlength: 500 },
    category: {
      type: String,
      enum: ['Learning', 'Creative', 'Technical', 'Utility', 'General'],
      required: true,
    },
    icon: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    usageCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    collection: 'chat_quick_actions',
  }
);
```

### Indexes

```javascript
db.chat_quick_actions.createIndex({ category: 1, isActive: 1 });
db.chat_quick_actions.createIndex({ usageCount: -1 });
db.chat_quick_actions.createIndex({ isDefault: 1 });
```

---

## 5. `chat_feedback` Collection

**Status:** ❌ **NEW** - Needs to be created

### Purpose

Stores user feedback on individual messages and overall conversation quality.

### Documents Structure

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  conversationId: "conv-1703123456789-abc123",
  messageId: "msg-1703123456789-001",
  userId: ObjectId("507f1f77bcf86cd799439012"),
  agentId: ObjectId("507f1f77bcf86cd799439013"),
  feedbackType: "message",
  rating: 5,
  comment: "Very helpful explanation!",
  category: "accuracy",
  tags: ["helpful", "clear"],
  metadata: {
    messageContent: "The explanation was...",
    responseTime: 2500
  },
  createdAt: ISODate("2024-01-20T10:35:00.000Z")
}
```

### Schema Definition

```javascript
const chatFeedbackSchema = new Schema(
  {
    conversationId: { type: String, required: true, index: true },
    messageId: { type: String, index: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent', index: true },
    feedbackType: {
      type: String,
      enum: ['message', 'conversation', 'agent'],
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: { type: String, maxlength: 1000 },
    category: {
      type: String,
      enum: [
        'accuracy',
        'helpfulness',
        'speed',
        'tone',
        'creativity',
        'technical',
      ],
    },
    tags: [{ type: String }],
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    collection: 'chat_feedback',
  }
);
```

### Indexes

```javascript
db.chat_feedback.createIndex({ conversationId: 1, createdAt: -1 });
db.chat_feedback.createIndex({ userId: 1, createdAt: -1 });
db.chat_feedback.createIndex({ agentId: 1, rating: -1 });
db.chat_feedback.createIndex({ feedbackType: 1, createdAt: -1 });
```

### Aggregations

#### Get Agent Average Rating

```javascript
db.chat_feedback.aggregate([
  { $match: { agentId: ObjectId('agent_id'), feedbackType: 'agent' } },
  {
    $group: {
      _id: '$agentId',
      averageRating: { $avg: '$rating' },
      totalFeedback: { $sum: 1 },
      ratingDistribution: {
        $push: '$rating',
      },
    },
  },
]);
```

---

## 6. `chat_canvas_projects` Collection

**Status:** ❌ **NEW** - Needs to be created

### Purpose

Stores canvas mode projects and their metadata.

### Documents Structure

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  projectId: "canvas-1703123456789-abc123",
  userId: ObjectId("507f1f77bcf86cd799439012"),
  conversationId: "conv-1703123456789-abc123",
  name: "Modern SaaS Landing Page",
  description: "A responsive landing page for a SaaS product",
  template: "SaaS Landing",
  category: "Landing",
  status: "active",
  settings: {
    theme: "dark",
    responsive: true,
    animations: true
  },
  stats: {
    filesGenerated: 5,
    totalSize: 125000,
    lastModified: ISODate("2024-01-20T10:35:00.000Z")
  },
  createdAt: ISODate("2024-01-20T10:30:00.000Z"),
  updatedAt: ISODate("2024-01-20T10:35:00.000Z")
}
```

### Schema Definition

```javascript
const chatCanvasProjectSchema = new Schema(
  {
    projectId: { type: String, required: true, unique: true, index: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    conversationId: { type: String, index: true },
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    template: { type: String, required: true },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
    },
    settings: {
      theme: { type: String, default: 'light' },
      responsive: { type: Boolean, default: true },
      animations: { type: Boolean, default: true },
    },
    stats: {
      filesGenerated: { type: Number, default: 0 },
      totalSize: { type: Number, default: 0 },
      lastModified: { type: Date },
    },
  },
  {
    timestamps: true,
    collection: 'chat_canvas_projects',
  }
);
```

### Indexes

```javascript
db.chat_canvas_projects.createIndex({ userId: 1, updatedAt: -1 });
db.chat_canvas_projects.createIndex({ conversationId: 1 });
db.chat_canvas_projects.createIndex({ template: 1 });
db.chat_canvas_projects.createIndex({ status: 1 });
```

---

## 7. `chat_canvas_files` Collection

**Status:** ❌ **NEW** - Needs to be created

### Purpose

Stores generated files from canvas mode projects.

### Documents Structure

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  fileId: "file-1703123456789-001",
  projectId: "canvas-1703123456789-abc123",
  userId: ObjectId("507f1f77bcf86cd799439012"),
  name: "index.html",
  path: "/project/index.html",
  type: "html",
  content: "<!DOCTYPE html>\n<html>\n<head>\n  <title>SaaS Landing</title>\n</head>\n<body>\n  <h1>Welcome</h1>\n</body>\n</html>",
  size: 125,
  checksum: "a1b2c3d4e5f6...",
  metadata: {
    language: "html",
    framework: "vanilla",
    dependencies: []
  },
  createdAt: ISODate("2024-01-20T10:30:00.000Z"),
  updatedAt: ISODate("2024-01-20T10:30:00.000Z")
}
```

### Schema Definition

```javascript
const chatCanvasFileSchema = new Schema(
  {
    fileId: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    path: { type: String, required: true },
    type: {
      type: String,
      enum: ['html', 'css', 'js', 'tsx', 'json', 'image', 'other'],
      required: true,
    },
    content: { type: String },
    size: { type: Number, required: true },
    checksum: { type: String },
    metadata: {
      language: { type: String },
      framework: { type: String },
      dependencies: [{ type: String }],
    },
  },
  {
    timestamps: true,
    collection: 'chat_canvas_files',
  }
);
```

### Indexes

```javascript
db.chat_canvas_files.createIndex({ projectId: 1, path: 1 });
db.chat_canvas_files.createIndex({ userId: 1, updatedAt: -1 });
db.chat_canvas_files.createIndex({ type: 1 });
```

---

## 8. `chat_canvas_history` Collection

**Status:** ❌ **NEW** - Needs to be created

### Purpose

Stores history of canvas generation attempts and their results.

### Documents Structure

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  historyId: "hist-1703123456789-001",
  projectId: "canvas-1703123456789-abc123",
  userId: ObjectId("507f1f77bcf86cd799439012"),
  prompt: "Create a modern SaaS landing page...",
  status: "completed",
  result: {
    filesGenerated: 5,
    totalSize: 125000,
    duration: 8500
  },
  error: null,
  metadata: {
    provider: "anthropic",
    model: "claude-3-5-sonnet",
    tokens: 2500
  },
  createdAt: ISODate("2024-01-20T10:30:00.000Z")
}
```

### Schema Definition

```javascript
const chatCanvasHistorySchema = new Schema(
  {
    historyId: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    prompt: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      required: true,
    },
    result: {
      filesGenerated: { type: Number },
      totalSize: { type: Number },
      duration: { type: Number },
    },
    error: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    collection: 'chat_canvas_history',
  }
);
```

### Indexes

```javascript
db.chat_canvas_history.createIndex({ projectId: 1, createdAt: -1 });
db.chat_canvas_history.createIndex({ userId: 1, status: 1, createdAt: -1 });
```

---

## 9. `agents` Collection

**Status:** ✅ **EXISTS** - Already implemented in `backend/models/Agent.ts`

### Purpose

Stores AI agent configurations, personalities, and capabilities.

### Documents Structure

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  agentId: "einstein",
  name: "Albert Einstein",
  description: "Theoretical physicist and genius scientist",
  category: "specialist",
  avatar: "🧠",
  prompt: "You are Albert Einstein...",
  aiModel: "gpt-4o",
  temperature: 0.4,
  maxTokens: 2000,
  isActive: true,
  isPublic: true,
  isPremium: false,
  pricing: {
    daily: 5,
    weekly: 25,
    monthly: 75
  },
  features: ["physics", "science", "explanations"],
  tags: ["science", "physics", "education"],
  capabilities: ["explain complex concepts", "scientific reasoning"],
  limitations: ["modern technology references"],
  examples: [
    {
      input: "Explain relativity",
      output: "Ah, relativity! Let me explain..."
    }
  ],
  config: {
    systemPrompt: "You are Albert Einstein...",
    personality: "genius scientist",
    tone: "wise and patient"
  },
  providerConfig: {
    primaryProvider: "openai",
    primaryModel: "gpt-4o",
    fallbackProviders: [
      {
        provider: "anthropic",
        model: "claude-3-5-sonnet",
        priority: 1
      }
    ],
    personalityMatch: {
      creativity: 8,
      empathy: 7,
      technical: 10,
      humor: 3,
      formality: 6
    },
    temperature: 0.4,
    maxTokens: 2000,
    systemPrompt: "You are Albert Einstein..."
  },
  stats: {
    totalInteractions: 15420,
    totalUsers: 1250,
    averageRating: 4.8,
    totalRatings: 890
  },
  creator: "system",
  version: "1.0.0",
  createdAt: ISODate("2024-01-15T08:00:00.000Z"),
  updatedAt: ISODate("2024-01-20T10:30:00.000Z")
}
```

---

## 10. `users` Collection

**Status:** ✅ **EXISTS** - Already implemented in `backend/models/User.js`

### Purpose

Stores user profiles, authentication, and preferences.

### Documents Structure

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  email: "user@example.com",
  name: "John Doe",
  password: "$2a$10$...",
  authMethod: "password",
  emailVerified: ISODate("2024-01-15T08:00:00.000Z"),
  image: "https://...",
  avatar: "JD",
  bio: "Software developer passionate about AI",
  phoneNumber: "+1234567890",
  location: "San Francisco, CA",
  timezone: "America/Los_Angeles",
  profession: "Software Engineer",
  company: "Tech Corp",
  socialLinks: {
    twitter: "@johndoe",
    linkedin: "john-doe",
    github: "johndoe",
    website: "https://johndoe.dev"
  },
  preferences: {
    language: "en",
    theme: "dark",
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      profileVisibility: "public",
      showEmail: false,
      showPhone: false
    }
  },
  createdAt: ISODate("2024-01-15T08:00:00.000Z"),
  updatedAt: ISODate("2024-01-20T10:30:00.000Z"),
  lastLoginAt: ISODate("2024-01-20T10:30:00.000Z"),
  isActive: true,
  role: "user"
}
```

---

## Implementation Priority

### Phase 1 (Critical)

1. ✅ `chatinteractions` - Already exists
2. ✅ `agents` - Already exists
3. ✅ `users` - Already exists

### Phase 2 (High Priority)

4. ❌ `chat_sessions` - New collection needed
5. ❌ `chat_settings` - New collection needed

### Phase 3 (Medium Priority)

6. ❌ `chat_feedback` - New collection needed
7. ❌ `chat_quick_actions` - New collection needed

### Phase 4 (Low Priority)

8. ❌ `chat_canvas_projects` - New collection needed
9. ❌ `chat_canvas_files` - New collection needed
10. ❌ `chat_canvas_history` - New collection needed

---

## Migration Strategy

### For Existing Data

```javascript
// Migrate existing chatinteractions to new chat_sessions format
db.chatinteractions.aggregate([
  {
    $group: {
      _id: '$conversationId',
      userId: { $first: '$userId' },
      agentId: { $first: '$agentId' },
      firstMessage: { $first: '$messages' },
      messageCount: { $sum: { $size: '$messages' } },
      totalTokens: { $sum: '$metrics.totalTokens' },
      startedAt: { $min: '$startedAt' },
      updatedAt: { $max: '$updatedAt' },
    },
  },
  {
    $project: {
      sessionId: '$_id',
      userId: 1,
      agentId: 1,
      name: {
        $concat: [
          'Conversation from ',
          { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
        ],
      },
      stats: {
        messageCount: '$messageCount',
        totalTokens: '$totalTokens',
        lastMessageAt: '$updatedAt',
      },
      createdAt: '$startedAt',
      updatedAt: '$updatedAt',
    },
  },
  { $out: 'chat_sessions' },
]);
```

---

## API Endpoints Required

Based on the collections, the following API endpoints need to be implemented:

### Chat Sessions

- `GET /api/chat/sessions` - List user sessions
- `POST /api/chat/sessions` - Create new session
- `GET /api/chat/sessions/:id` - Get session details
- `PUT /api/chat/sessions/:id` - Update session
- `DELETE /api/chat/sessions/:id` - Delete session

### Chat Settings

- `GET /api/chat/settings` - Get user settings
- `PUT /api/chat/settings` - Update user settings

### Chat Feedback

- `POST /api/chat/feedback` - Submit feedback

### Canvas Projects

- `GET /api/chat/canvas/projects` - List projects
- `POST /api/chat/canvas/projects` - Create project
- `GET /api/chat/canvas/projects/:id` - Get project
- `DELETE /api/chat/canvas/projects/:id` - Delete project

### Canvas Files

- `GET /api/chat/canvas/projects/:id/files` - List project files
- `POST /api/chat/canvas/files` - Save generated file
- `GET /api/chat/canvas/files/:id` - Get file content

This comprehensive database specification ensures all universal-chat functionality is properly persisted and scalable.</content>
<parameter name="filePath">/Users/onelastai/Downloads/shiny-friend-disco/UNIVERSAL_CHAT_DATABASE_SPECIFICATION.md
