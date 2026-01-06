# COMPONENT-BASED DATABASE COLLECTIONS SPECIFICATION

## Overview

This document outlines all database collections required based on the analysis of frontend components in `components/` and `components/ui/` directories. Each collection includes complete specifications for Documents, Aggregations, Schema, Indexes, and Validation rules.

## Existing Collections (Already Implemented)

### 1. Chat Sessions (`chat_sessions`)

**Purpose**: Manages chat session metadata for better performance and organization

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  sessionId: "string", // Unique session identifier
  userId: ObjectId, // Reference to user
  agentId: ObjectId, // Reference to agent
  name: "string", // Session display name
  description: "string", // Optional description
  tags: ["array", "of", "tags"], // Categorization tags
  settings: {
    temperature: 0.7,
    maxTokens: 2000,
    mode: "balanced"
  },
  stats: {
    messageCount: 0,
    totalTokens: 0,
    durationMs: 0,
    lastMessageAt: ISODate
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Session statistics aggregation
- User session history
- Agent usage analytics
- Message count rollups

**Schema**:

```javascript
const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
    },
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    tags: [{ type: String, maxlength: 50 }],
    settings: {
      temperature: { type: Number, min: 0, max: 2, default: 0.7 },
      maxTokens: { type: Number, min: 1, max: 4000, default: 2000 },
      mode: {
        type: String,
        enum: ['professional', 'balanced', 'creative', 'fast', 'coding'],
        default: 'balanced',
      },
    },
    stats: {
      messageCount: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
      durationMs: { type: Number, default: 0 },
      lastMessageAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
// Compound indexes for queries
chatSessionSchema.index({ userId: 1, updatedAt: -1 }); // User sessions by recency
chatSessionSchema.index({ agentId: 1, updatedAt: -1 }); // Agent usage tracking
chatSessionSchema.index({ sessionId: 1 }); // Unique session lookup
chatSessionSchema.index({ 'stats.lastMessageAt': -1 }); // Recent activity
chatSessionSchema.index({ tags: 1 }); // Tag-based filtering
chatSessionSchema.index({ userId: 1, agentId: 1, updatedAt: -1 }); // User-agent sessions
```

**Validation**:

```javascript
chatSessionSchema.pre('save', function (next) {
  if (this.settings.temperature < 0 || this.settings.temperature > 2) {
    return next(new Error('Temperature must be between 0 and 2'));
  }
  if (this.settings.maxTokens < 1 || this.settings.maxTokens > 4000) {
    return next(new Error('Max tokens must be between 1 and 4000'));
  }
  next();
});
```

### 2. Chat Settings (`chat_settings`)

**Purpose**: Stores user-specific chat preferences and configurations

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Unique per user
  theme: "auto", // auto, light, dark, neural
  fontSize: "medium", // small, medium, large
  notifications: {
    messageReceived: true,
    agentResponses: true,
    systemUpdates: false
  },
  autoSave: true,
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
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- User preference analytics
- Theme popularity statistics
- Feature usage tracking

**Schema**:

```javascript
const chatSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    theme: {
      type: String,
      enum: ['auto', 'light', 'dark', 'neural'],
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
    quickActions: {
      enabled: { type: Boolean, default: true },
      favorites: [{ type: String, maxlength: 50 }],
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
  { timestamps: true }
);
```

**Indexes**:

```javascript
chatSettingsSchema.index({ userId: 1 }, { unique: true }); // One settings per user
chatSettingsSchema.index({ theme: 1 }); // Theme analytics
chatSettingsSchema.index({ 'privacy.allowAnalytics': 1 }); // Privacy compliance
```

**Validation**:

```javascript
chatSettingsSchema.pre('save', function (next) {
  if (this.quickActions.favorites && this.quickActions.favorites.length > 10) {
    return next(new Error('Maximum 10 favorite quick actions allowed'));
  }
  next();
});
```

### 3. Chat Feedback (`chat_feedback`)

**Purpose**: Stores user feedback on messages, conversations, and agents

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  conversationId: "string", // Links to chat session
  userId: ObjectId,
  agentId: ObjectId,
  messageId: "string", // Optional specific message feedback
  rating: 5, // 1-5 star rating
  feedback: "Great response!", // Optional text feedback
  categories: ["accuracy", "helpfulness"], // Feedback categories
  metadata: {
    userAgent: "Mozilla/5.0...",
    timestamp: ISODate,
    sessionDuration: 300000
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Agent performance metrics
- Feedback trend analysis
- User satisfaction scores
- Category-based insights

**Schema**:

```javascript
const chatFeedbackSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
    },
    messageId: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, maxlength: 1000 },
    categories: [
      {
        type: String,
        enum: [
          'accuracy',
          'helpfulness',
          'speed',
          'creativity',
          'formatting',
          'relevance',
        ],
      },
    ],
    metadata: {
      userAgent: String,
      timestamp: { type: Date, default: Date.now },
      sessionDuration: Number,
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
chatFeedbackSchema.index({ conversationId: 1 }); // Conversation feedback lookup
chatFeedbackSchema.index({ userId: 1, createdAt: -1 }); // User feedback history
chatFeedbackSchema.index({ agentId: 1, rating: -1 }); // Agent performance
chatFeedbackSchema.index({ categories: 1 }); // Category analytics
chatFeedbackSchema.index({ createdAt: -1 }); // Recent feedback
chatFeedbackSchema.index({ userId: 1, agentId: 1 }); // User-agent feedback
```

**Validation**:

```javascript
chatFeedbackSchema.pre('save', function (next) {
  if (this.rating < 1 || this.rating > 5) {
    return next(new Error('Rating must be between 1 and 5'));
  }
  if (this.feedback && this.feedback.length > 1000) {
    return next(new Error('Feedback text cannot exceed 1000 characters'));
  }
  next();
});
```

### 4. Chat Quick Actions (`chat_quick_actions`)

**Purpose**: Manages predefined quick action templates for chat interface

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  actionId: "explain", // Unique action identifier
  label: "Explain this",
  prompt: "Please explain this in simple terms:",
  category: "Learning",
  icon: "AcademicCapIcon",
  usageCount: 1250,
  isDefault: true,
  isActive: true,
  createdBy: ObjectId, // null for system defaults
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Usage statistics by action
- Category popularity
- User customization analytics

**Schema**:

```javascript
const chatQuickActionSchema = new mongoose.Schema(
  {
    actionId: { type: String, required: true, unique: true },
    label: { type: String, required: true, maxlength: 100 },
    prompt: { type: String, required: true, maxlength: 500 },
    category: { type: String, required: true, maxlength: 50 },
    icon: { type: String, maxlength: 50 },
    usageCount: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
chatQuickActionSchema.index({ actionId: 1 }, { unique: true }); // Unique action lookup
chatQuickActionSchema.index({ category: 1, isActive: 1 }); // Category filtering
chatQuickActionSchema.index({ usageCount: -1 }); // Popular actions
chatQuickActionSchema.index({ isDefault: 1, isActive: 1 }); // Default actions
chatQuickActionSchema.index({ createdBy: 1 }); // User custom actions
```

**Validation**:

```javascript
chatQuickActionSchema.pre('save', function (next) {
  if (this.usageCount < 0) {
    return next(new Error('Usage count cannot be negative'));
  }
  next();
});
```

### 5. Chat Canvas Projects (`chat_canvas_projects`)

**Purpose**: Manages canvas mode projects and their metadata

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  projectId: "canvas-1234567890-abc123",
  userId: ObjectId,
  conversationId: "session-123",
  name: "My SaaS Landing Page",
  description: "Modern landing page with features grid",
  template: "SaaS Landing",
  category: "Landing",
  status: "active", // active, archived, deleted
  settings: {
    theme: "dark",
    responsive: true,
    animations: true
  },
  stats: {
    filesGenerated: 5,
    totalSize: 245760,
    lastModified: ISODate
  },
  tags: ["saas", "landing", "modern"],
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Project statistics by user
- Template usage analytics
- File generation metrics

**Schema**:

```javascript
const chatCanvasProjectSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    conversationId: { type: String },
    name: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 500 },
    template: { type: String, required: true, maxlength: 100 },
    category: { type: String, required: true, maxlength: 50 },
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
      lastModified: { type: Date, default: Date.now },
    },
    tags: [{ type: String, maxlength: 50 }],
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
chatCanvasProjectSchema.index({ projectId: 1 }, { unique: true }); // Unique project lookup
chatCanvasProjectSchema.index({ userId: 1, status: 1, updatedAt: -1 }); // User projects
chatCanvasProjectSchema.index({ template: 1 }); // Template analytics
chatCanvasProjectSchema.index({ category: 1 }); // Category filtering
chatCanvasProjectSchema.index({ tags: 1 }); // Tag-based search
chatCanvasProjectSchema.index({ conversationId: 1 }); // Chat session link
```

**Validation**:

```javascript
chatCanvasProjectSchema.pre('save', function (next) {
  if (this.stats.filesGenerated < 0) {
    return next(new Error('Files generated count cannot be negative'));
  }
  if (this.stats.totalSize < 0) {
    return next(new Error('Total size cannot be negative'));
  }
  next();
});
```

### 6. Chat Canvas Files (`chat_canvas_files`)

**Purpose**: Stores generated files from canvas mode projects

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  fileId: "file-1234567890-def456",
  projectId: "canvas-1234567890-abc123",
  name: "index.html",
  path: "src/index.html",
  type: "html", // html, css, js, tsx, json, image, other
  content: "<!DOCTYPE html>...",
  size: 2048,
  checksum: "sha256:abc123...",
  metadata: {
    language: "html",
    framework: "vanilla",
    dependencies: ["none"],
    lastModified: ISODate
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- File type distribution
- Project file counts
- Size analytics

**Schema**:

```javascript
const chatCanvasFileSchema = new mongoose.Schema(
  {
    fileId: { type: String, required: true, unique: true },
    projectId: { type: String, required: true },
    name: { type: String, required: true, maxlength: 255 },
    path: { type: String, required: true, maxlength: 500 },
    type: {
      type: String,
      enum: ['html', 'css', 'js', 'tsx', 'json', 'image', 'other'],
      required: true,
    },
    content: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    checksum: { type: String },
    metadata: {
      language: { type: String, maxlength: 50 },
      framework: { type: String, maxlength: 50 },
      dependencies: [{ type: String }],
      lastModified: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
chatCanvasFileSchema.index({ fileId: 1 }, { unique: true }); // Unique file lookup
chatCanvasFileSchema.index({ projectId: 1, path: 1 }); // Project file structure
chatCanvasFileSchema.index({ type: 1 }); // File type analytics
chatCanvasFileSchema.index({ size: -1 }); // Large file identification
chatCanvasFileSchema.index({ 'metadata.language': 1 }); // Language filtering
```

**Validation**:

```javascript
chatCanvasFileSchema.pre('save', function (next) {
  if (this.size < 0) {
    return next(new Error('File size cannot be negative'));
  }
  if (this.content.length !== this.size) {
    return next(new Error('Content length does not match declared size'));
  }
  next();
});
```

### 7. Chat Canvas History (`chat_canvas_history`)

**Purpose**: Tracks canvas generation attempts and their results

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  historyId: "hist-1234567890-ghi789",
  projectId: "canvas-1234567890-abc123",
  prompt: "Create a modern SaaS landing page...",
  status: "completed", // pending, processing, completed, failed
  result: {
    filesGenerated: 5,
    totalSize: 245760,
    error: null
  },
  metadata: {
    duration: 45000,
    tokensUsed: 1200,
    model: "mistral-large-latest",
    provider: "mistral"
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Generation success rates
- Performance metrics
- Error analysis

**Schema**:

```javascript
const chatCanvasHistorySchema = new mongoose.Schema(
  {
    historyId: { type: String, required: true, unique: true },
    projectId: { type: String, required: true },
    prompt: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    result: {
      filesGenerated: { type: Number, default: 0 },
      totalSize: { type: Number, default: 0 },
      error: { type: String },
    },
    metadata: {
      duration: { type: Number },
      tokensUsed: { type: Number },
      model: { type: String },
      provider: { type: String },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
chatCanvasHistorySchema.index({ historyId: 1 }, { unique: true }); // Unique history lookup
chatCanvasHistorySchema.index({ projectId: 1, createdAt: -1 }); // Project history
chatCanvasHistorySchema.index({ status: 1 }); // Status filtering
chatCanvasHistorySchema.index({ 'metadata.duration': -1 }); // Performance analysis
chatCanvasHistorySchema.index({ createdAt: -1 }); // Recent generations
```

**Validation**:

```javascript
chatCanvasHistorySchema.pre('save', function (next) {
  if (this.result.filesGenerated < 0) {
    return next(new Error('Files generated count cannot be negative'));
  }
  if (this.metadata.duration && this.metadata.duration < 0) {
    return next(new Error('Duration cannot be negative'));
  }
  next();
});
```

### 8. Agent Subscriptions (`agent_subscriptions`)

**Purpose**: Manages user subscriptions to specific agents

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  agentId: ObjectId,
  plan: "monthly", // daily, weekly, monthly
  price: 19,
  status: "active", // active, expired, cancelled
  startDate: ISODate,
  expiryDate: ISODate,
  autoRenew: true,
  paymentMethod: "stripe",
  stripeSubscriptionId: "sub_1234567890",
  metadata: {
    cancelledAt: ISODate,
    cancelReason: "string"
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Revenue analytics
- Subscription metrics
- Churn analysis
- Plan popularity

**Schema**:

```javascript
const agentSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
    },
    plan: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    autoRenew: { type: Boolean, default: true },
    paymentMethod: { type: String, default: 'stripe' },
    stripeSubscriptionId: { type: String },
    metadata: {
      cancelledAt: Date,
      cancelReason: String,
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
agentSubscriptionSchema.index({ userId: 1, agentId: 1 }, { unique: true }); // One subscription per user-agent
agentSubscriptionSchema.index({ status: 1, expiryDate: 1 }); // Active subscriptions
agentSubscriptionSchema.index({ agentId: 1, status: 1 }); // Agent subscriptions
agentSubscriptionSchema.index({ stripeSubscriptionId: 1 }); // Stripe integration
agentSubscriptionSchema.index({ expiryDate: 1 }); // Expiration tracking
```

**Validation**:

```javascript
agentSubscriptionSchema.pre('save', function (next) {
  if (this.expiryDate <= this.startDate) {
    return next(new Error('Expiry date must be after start date'));
  }
  if (this.price < 0) {
    return next(new Error('Price cannot be negative'));
  }
  next();
});
```

### 9. Users (`users`)

**Purpose**: Core user account management

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  username: "johndoe",
  displayName: "John Doe",
  avatar: "https://...",
  role: "user", // user, admin, moderator
  status: "active", // active, suspended, deleted
  emailVerified: true,
  lastLogin: ISODate,
  preferences: {
    theme: "auto",
    notifications: true,
    language: "en"
  },
  profile: {
    bio: "Software developer...",
    website: "https://johndoe.dev",
    location: "San Francisco, CA",
    skills: ["JavaScript", "React", "Node.js"]
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- User demographics
- Activity analytics
- Registration trends

**Schema**:

```javascript
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
    },
    displayName: { type: String, maxlength: 100 },
    avatar: { type: String },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
    },
    emailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    preferences: {
      theme: { type: String, enum: ['auto', 'light', 'dark'], default: 'auto' },
      notifications: { type: Boolean, default: true },
      language: { type: String, default: 'en' },
    },
    profile: {
      bio: { type: String, maxlength: 500 },
      website: { type: String },
      location: { type: String, maxlength: 100 },
      skills: [{ type: String, maxlength: 50 }],
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
userSchema.index({ email: 1 }, { unique: true }); // Email login
userSchema.index({ username: 1 }, { unique: true }); // Username lookup
userSchema.index({ status: 1 }); // Active users
userSchema.index({ role: 1 }); // Role-based queries
userSchema.index({ lastLogin: -1 }); // Recent activity
userSchema.index({ 'preferences.theme': 1 }); // Theme analytics
```

**Validation**:

```javascript
userSchema.pre('save', function (next) {
  if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
    return next(new Error('Invalid email format'));
  }
  if (this.username && !/^[a-zA-Z0-9_]+$/.test(this.username)) {
    return next(
      new Error('Username can only contain letters, numbers, and underscores')
    );
  }
  next();
});
```

### 10. Agents (`agents`)

**Purpose**: AI agent configurations and metadata

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  id: "mistral-expert",
  name: "Mistral Expert",
  avatarUrl: "https://...",
  specialty: "General AI Assistant",
  description: "Advanced AI assistant powered by Mistral",
  systemPrompt: "You are an expert AI assistant...",
  welcomeMessage: "Hello! I'm your AI assistant...",
  specialties: ["coding", "writing", "analysis"],
  tags: ["AI", "assistant", "mistral"],
  color: "from-blue-500 to-purple-500",
  aiProvider: {
    primary: "mistral",
    fallbacks: ["openai"],
    model: "mistral-large-latest",
    reasoning: "advanced"
  },
  pricing: {
    daily: 1,
    weekly: 5,
    monthly: 19
  },
  stats: {
    totalUsers: 1250,
    totalSessions: 5600,
    averageRating: 4.7
  },
  status: "active", // active, maintenance, deprecated
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Agent popularity metrics
- Performance analytics
- Usage statistics

**Schema**:

```javascript
const agentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, maxlength: 100 },
    avatarUrl: { type: String },
    specialty: { type: String, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    systemPrompt: { type: String, required: true },
    welcomeMessage: { type: String, required: true },
    specialties: [{ type: String, maxlength: 50 }],
    tags: [{ type: String, maxlength: 50 }],
    color: { type: String, maxlength: 100 },
    aiProvider: {
      primary: {
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
      },
      fallbacks: [{ type: String }],
      model: { type: String },
      reasoning: { type: String },
    },
    pricing: {
      daily: { type: Number, min: 0 },
      weekly: { type: Number, min: 0 },
      monthly: { type: Number, min: 0 },
    },
    stats: {
      totalUsers: { type: Number, default: 0 },
      totalSessions: { type: Number, default: 0 },
      averageRating: { type: Number, min: 0, max: 5, default: 0 },
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'deprecated'],
      default: 'active',
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
agentSchema.index({ id: 1 }, { unique: true }); // Unique agent lookup
agentSchema.index({ status: 1 }); // Active agents
agentSchema.index({ 'aiProvider.primary': 1 }); // Provider analytics
agentSchema.index({ tags: 1 }); // Tag-based search
agentSchema.index({ 'stats.totalUsers': -1 }); // Popular agents
agentSchema.index({ specialties: 1 }); // Specialty filtering
```

**Validation**:

```javascript
agentSchema.pre('save', function (next) {
  if (this.stats.averageRating < 0 || this.stats.averageRating > 5) {
    return next(new Error('Average rating must be between 0 and 5'));
  }
  if (
    this.pricing.daily < 0 ||
    this.pricing.weekly < 0 ||
    this.pricing.monthly < 0
  ) {
    return next(new Error('Pricing cannot be negative'));
  }
  next();
});
```

## New Collections (Need to be Created)

### 11. Contact Messages (`contact_messages`)

**Purpose**: Stores contact form submissions from users

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  name: "John Doe",
  email: "john@example.com",
  subject: "Inquiry about Mistral Expert Agent",
  message: "I would like to know more about...",
  agentName: "Mistral Expert", // Optional
  status: "pending", // pending, read, replied, closed
  priority: "normal", // low, normal, high, urgent
  category: "general", // general, technical, billing, feature_request, bug_report
  metadata: {
    userAgent: "Mozilla/5.0...",
    ipAddress: "192.168.1.1",
    referrer: "https://onelastai.co/agents/mistral-expert"
  },
  assignedTo: ObjectId, // Admin user ID
  response: {
    content: "Thank you for your inquiry...",
    respondedBy: ObjectId,
    respondedAt: ISODate
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Contact volume analytics
- Response time metrics
- Category distribution
- Agent inquiry tracking

**Schema**:

```javascript
const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true },
    subject: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 2000 },
    agentName: { type: String, maxlength: 100 },
    status: {
      type: String,
      enum: ['pending', 'read', 'replied', 'closed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    category: {
      type: String,
      enum: [
        'general',
        'technical',
        'billing',
        'feature_request',
        'bug_report',
      ],
      default: 'general',
    },
    metadata: {
      userAgent: String,
      ipAddress: String,
      referrer: String,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    response: {
      content: { type: String, maxlength: 2000 },
      respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      respondedAt: Date,
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
contactMessageSchema.index({ email: 1 }); // User contact history
contactMessageSchema.index({ status: 1, createdAt: -1 }); // Status filtering
contactMessageSchema.index({ priority: 1, status: 1 }); // Priority queue
contactMessageSchema.index({ category: 1 }); // Category analytics
contactMessageSchema.index({ assignedTo: 1, status: 1 }); // Assignment tracking
contactMessageSchema.index({ agentName: 1 }); // Agent-specific inquiries
contactMessageSchema.index({ createdAt: -1 }); // Recent contacts
```

**Validation**:

```javascript
contactMessageSchema.pre('save', function (next) {
  if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
    return next(new Error('Invalid email format'));
  }
  if (this.message.length < 10) {
    return next(new Error('Message must be at least 10 characters long'));
  }
  next();
});
```

### 12. Community Posts (`community_posts`)

**Purpose**: User-generated content in the community section

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  authorId: ObjectId,
  title: "How to optimize React performance",
  content: "Here are some tips for optimizing React apps...",
  excerpt: "Learn practical techniques for improving React app performance...",
  tags: ["react", "performance", "optimization"],
  category: "tutorial", // tutorial, discussion, question, showcase, news
  status: "published", // draft, published, archived, deleted
  visibility: "public", // public, community, private
  stats: {
    views: 1250,
    likes: 45,
    comments: 12,
    shares: 8
  },
  metadata: {
    readingTime: 5,
    wordCount: 850,
    featured: false,
    pinned: false
  },
  attachments: [{
    type: "image",
    url: "https://...",
    name: "performance-chart.png"
  }],
  createdAt: ISODate,
  updatedAt: ISODate,
  publishedAt: ISODate
}
```

**Aggregations**:

- Popular posts analytics
- Category engagement metrics
- Author contribution tracking
- Content performance analysis

**Schema**:

```javascript
const communityPostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true },
    excerpt: { type: String, maxlength: 300 },
    tags: [{ type: String, maxlength: 50 }],
    category: {
      type: String,
      enum: ['tutorial', 'discussion', 'question', 'showcase', 'news'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived', 'deleted'],
      default: 'draft',
    },
    visibility: {
      type: String,
      enum: ['public', 'community', 'private'],
      default: 'public',
    },
    stats: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
    metadata: {
      readingTime: { type: Number },
      wordCount: { type: Number },
      featured: { type: Boolean, default: false },
      pinned: { type: Boolean, default: false },
    },
    attachments: [
      {
        type: { type: String, enum: ['image', 'video', 'file'] },
        url: { type: String, required: true },
        name: { type: String, required: true },
        size: Number,
      },
    ],
    publishedAt: Date,
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
communityPostSchema.index({ authorId: 1, status: 1, createdAt: -1 }); // Author posts
communityPostSchema.index({ status: 1, visibility: 1, publishedAt: -1 }); // Public posts
communityPostSchema.index({ category: 1, status: 1 }); // Category filtering
communityPostSchema.index({ tags: 1 }); // Tag-based search
communityPostSchema.index({ 'stats.likes': -1 }); // Popular posts
communityPostSchema.index({ 'stats.views': -1 }); // Trending posts
communityPostSchema.index({ 'metadata.featured': 1, publishedAt: -1 }); // Featured posts
```

**Validation**:

```javascript
communityPostSchema.pre('save', function (next) {
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  if (this.excerpt && this.excerpt.length > 300) {
    return next(new Error('Excerpt cannot exceed 300 characters'));
  }
  next();
});
```

### 13. Community Comments (`community_comments`)

**Purpose**: Comments on community posts

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  postId: ObjectId,
  authorId: ObjectId,
  parentId: ObjectId, // For nested replies
  content: "Great tutorial! This really helped me...",
  status: "published", // published, deleted, spam
  stats: {
    likes: 5,
    replies: 2
  },
  mentions: [ObjectId], // Mentioned users
  attachments: [{
    type: "image",
    url: "https://...",
    name: "code-example.png"
  }],
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Comment engagement metrics
- Thread depth analysis
- User participation tracking

**Schema**:

```javascript
const communityCommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityPost',
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityComment' }, // For nested comments
    content: { type: String, required: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['published', 'deleted', 'spam'],
      default: 'published',
    },
    stats: {
      likes: { type: Number, default: 0 },
      replies: { type: Number, default: 0 },
    },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    attachments: [
      {
        type: { type: String, enum: ['image', 'video', 'file'] },
        url: { type: String, required: true },
        name: { type: String, required: true },
        size: Number,
      },
    ],
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
communityCommentSchema.index({ postId: 1, status: 1, createdAt: 1 }); // Post comments
communityCommentSchema.index({ authorId: 1, createdAt: -1 }); // User comments
communityCommentSchema.index({ parentId: 1 }); // Nested comment threads
communityCommentSchema.index({ status: 1 }); // Moderation queue
communityCommentSchema.index({ mentions: 1 }); // User mentions
```

**Validation**:

```javascript
communityCommentSchema.pre('save', function (next) {
  if (this.content.length < 1) {
    return next(new Error('Comment content cannot be empty'));
  }
  if (this.parentId && this.parentId.equals(this._id)) {
    return next(new Error('Comment cannot be its own parent'));
  }
  next();
});
```

### 14. Community Likes (`community_likes`)

**Purpose**: Tracks likes on posts and comments

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  targetType: "post", // post, comment
  targetId: ObjectId,
  type: "like", // like, dislike, love, laugh, angry
  createdAt: ISODate
}
```

**Aggregations**:

- Engagement analytics
- Content popularity metrics
- User interaction patterns

**Schema**:

```javascript
const communityLikeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: { type: String, enum: ['post', 'comment'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: {
      type: String,
      enum: ['like', 'dislike', 'love', 'laugh', 'angry'],
      default: 'like',
    },
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicate likes
communityLikeSchema.index(
  { userId: 1, targetType: 1, targetId: 1 },
  { unique: true }
);
```

**Indexes**:

```javascript
communityLikeSchema.index({ targetType: 1, targetId: 1 }); // Target likes count
communityLikeSchema.index({ userId: 1, createdAt: -1 }); // User activity
communityLikeSchema.index({ type: 1 }); // Reaction analytics
```

**Validation**:

```javascript
// Validation handled by unique compound index
```

### 15. Community Groups (`community_groups`)

**Purpose**: Community interest groups and categories

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  name: "React Developers",
  slug: "react-developers",
  description: "A community for React developers to share knowledge and experiences",
  avatar: "https://...",
  banner: "https://...",
  category: "Technology",
  privacy: "public", // public, private, invite-only
  ownerId: ObjectId,
  moderators: [ObjectId],
  rules: ["Be respectful", "No spam"],
  stats: {
    members: 1250,
    posts: 450,
    activeToday: 25
  },
  settings: {
    allowPosts: true,
    allowComments: true,
    requireApproval: false
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Group popularity metrics
- Category distribution
- Member engagement analysis

**Schema**:

```javascript
const communityGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, maxlength: 500 },
    avatar: String,
    banner: String,
    category: { type: String, required: true, maxlength: 50 },
    privacy: {
      type: String,
      enum: ['public', 'private', 'invite-only'],
      default: 'public',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rules: [{ type: String, maxlength: 200 }],
    stats: {
      members: { type: Number, default: 0 },
      posts: { type: Number, default: 0 },
      activeToday: { type: Number, default: 0 },
    },
    settings: {
      allowPosts: { type: Boolean, default: true },
      allowComments: { type: Boolean, default: true },
      requireApproval: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
communityGroupSchema.index({ slug: 1 }, { unique: true }); // URL routing
communityGroupSchema.index({ category: 1 }); // Category browsing
communityGroupSchema.index({ privacy: 1 }); // Privacy filtering
communityGroupSchema.index({ ownerId: 1 }); // Owner groups
communityGroupSchema.index({ 'stats.members': -1 }); // Popular groups
```

**Validation**:

```javascript
communityGroupSchema.pre('save', function (next) {
  if (this.slug && !/^[a-z0-9-]+$/.test(this.slug)) {
    return next(
      new Error('Slug can only contain lowercase letters, numbers, and hyphens')
    );
  }
  if (this.rules && this.rules.length > 20) {
    return next(new Error('Maximum 20 rules allowed'));
  }
  next();
});
```

### 16. Community Memberships (`community_memberships`)

**Purpose**: Tracks user memberships in community groups

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  groupId: ObjectId,
  role: "member", // member, moderator, admin
  status: "active", // active, pending, suspended, left
  joinedAt: ISODate,
  invitedBy: ObjectId,
  permissions: {
    canPost: true,
    canComment: true,
    canModerate: false
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Group membership analytics
- User participation tracking
- Role distribution metrics

**Schema**:

```javascript
const communityMembershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityGroup',
      required: true,
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member',
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended', 'left'],
      default: 'active',
    },
    joinedAt: { type: Date, default: Date.now },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permissions: {
      canPost: { type: Boolean, default: true },
      canComment: { type: Boolean, default: true },
      canModerate: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Compound unique index
communityMembershipSchema.index({ userId: 1, groupId: 1 }, { unique: true });
```

**Indexes**:

```javascript
communityMembershipSchema.index({ groupId: 1, status: 1 }); // Group members
communityMembershipSchema.index({ userId: 1, status: 1 }); // User memberships
communityMembershipSchema.index({ role: 1 }); // Role analytics
communityMembershipSchema.index({ status: 1 }); // Membership status
```

**Validation**:

```javascript
communityMembershipSchema.pre('save', function (next) {
  if (this.role === 'admin' && this.permissions.canModerate !== true) {
    this.permissions.canModerate = true;
  }
  next();
});
```

### 17. Community Events (`community_events`)

**Purpose**: Community events and meetups

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  title: "React Meetup - Performance Optimization",
  description: "Join us for a deep dive into React performance techniques",
  organizerId: ObjectId,
  groupId: ObjectId, // Optional group association
  eventType: "meetup", // meetup, webinar, workshop, conference
  status: "upcoming", // draft, upcoming, ongoing, completed, cancelled
  startDate: ISODate,
  endDate: ISODate,
  timezone: "America/New_York",
  location: {
    type: "virtual", // virtual, physical, hybrid
    venue: "Zoom",
    address: "123 Main St, City, State",
    coordinates: [40.7128, -74.0060]
  },
  capacity: 100,
  registeredCount: 75,
  price: {
    amount: 0,
    currency: "USD"
  },
  tags: ["react", "performance", "meetup"],
  agenda: [{
    time: "10:00 AM",
    title: "Opening Remarks",
    description: "Welcome and agenda overview"
  }],
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Event attendance analytics
- Popular event types
- Organizer performance metrics

**Schema**:

```javascript
const communityEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityGroup' },
    eventType: {
      type: String,
      enum: ['meetup', 'webinar', 'workshop', 'conference'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'draft',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timezone: { type: String, default: 'UTC' },
    location: {
      type: {
        type: String,
        enum: ['virtual', 'physical', 'hybrid'],
        required: true,
      },
      venue: String,
      address: String,
      coordinates: [Number], // [longitude, latitude]
    },
    capacity: { type: Number, min: 1 },
    registeredCount: { type: Number, default: 0 },
    price: {
      amount: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: 'USD' },
    },
    tags: [{ type: String, maxlength: 50 }],
    agenda: [
      {
        time: { type: String, maxlength: 20 },
        title: { type: String, required: true, maxlength: 100 },
        description: { type: String, maxlength: 300 },
      },
    ],
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
communityEventSchema.index({ organizerId: 1 }); // Organizer events
communityEventSchema.index({ groupId: 1 }); // Group events
communityEventSchema.index({ status: 1, startDate: 1 }); // Upcoming events
communityEventSchema.index({ eventType: 1 }); // Type filtering
communityEventSchema.index({ tags: 1 }); // Tag-based search
communityEventSchema.index({ startDate: 1 }); // Date-based queries
```

**Validation**:

```javascript
communityEventSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  if (this.capacity && this.registeredCount > this.capacity) {
    return next(new Error('Registered count cannot exceed capacity'));
  }
  if (this.location.coordinates && this.location.coordinates.length !== 2) {
    return next(new Error('Coordinates must be [longitude, latitude]'));
  }
  next();
});
```

### 18. Community Content (`community_content`)

**Purpose**: Additional content associated with community posts

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  postId: ObjectId,
  type: "image", // image, video, file, link
  title: "React Performance Chart",
  url: "https://...",
  thumbnail: "https://...",
  metadata: {
    size: 245760,
    format: "png",
    dimensions: { width: 800, height: 600 },
    duration: 120 // for videos
  },
  order: 1, // Display order
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Content type analytics
- Storage usage metrics
- Media performance tracking

**Schema**:

```javascript
const communityContentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityPost',
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'video', 'file', 'link'],
      required: true,
    },
    title: { type: String, maxlength: 200 },
    url: { type: String, required: true },
    thumbnail: String,
    metadata: {
      size: Number,
      format: String,
      dimensions: {
        width: Number,
        height: Number,
      },
      duration: Number, // for videos/audio
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
communityContentSchema.index({ postId: 1, order: 1 }); // Post content ordering
communityContentSchema.index({ type: 1 }); // Content type analytics
```

**Validation**:

```javascript
communityContentSchema.pre('save', function (next) {
  if (this.type === 'image' && !this.metadata.dimensions) {
    return next(new Error('Image content must have dimensions'));
  }
  if (this.metadata.size && this.metadata.size < 0) {
    return next(new Error('Size cannot be negative'));
  }
  next();
});
```

### 19. Community Metrics (`community_metrics`)

**Purpose**: Analytics and metrics for community features

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  date: ISODate, // Date for the metrics
  type: "daily", // daily, weekly, monthly
  metrics: {
    totalUsers: 1250,
    activeUsers: 450,
    newPosts: 25,
    newComments: 120,
    totalViews: 5600,
    topCategories: {
      tutorial: 15,
      discussion: 8,
      question: 2
    },
    engagement: {
      avgLikesPerPost: 4.2,
      avgCommentsPerPost: 2.8,
      avgViewsPerPost: 45
    }
  },
  createdAt: ISODate
}
```

**Aggregations**:

- Trend analysis
- Growth metrics
- Engagement tracking

**Schema**:

```javascript
const communityMetricsSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    metrics: {
      totalUsers: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 },
      newPosts: { type: Number, default: 0 },
      newComments: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
      topCategories: {},
      engagement: {
        avgLikesPerPost: { type: Number, default: 0 },
        avgCommentsPerPost: { type: Number, default: 0 },
        avgViewsPerPost: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true }
);

// Compound unique index for date + type
communityMetricsSchema.index({ date: 1, type: 1 }, { unique: true });
```

**Indexes**:

```javascript
communityMetricsSchema.index({ type: 1, date: -1 }); // Time series queries
```

**Validation**:

```javascript
communityMetricsSchema.pre('save', function (next) {
  if (this.metrics.totalUsers < 0 || this.metrics.activeUsers < 0) {
    return next(new Error('User counts cannot be negative'));
  }
  next();
});
```

### 20. Community Moderation (`community_moderation`)

**Purpose**: Content moderation actions and queue

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  contentType: "post", // post, comment
  contentId: ObjectId,
  reporterId: ObjectId,
  moderatorId: ObjectId,
  action: "approve", // approve, reject, flag, delete, edit
  reason: "spam", // spam, harassment, inappropriate, duplicate, off-topic
  details: "Automated spam detection",
  status: "resolved", // pending, in_review, resolved
  priority: "normal", // low, normal, high, urgent
  metadata: {
    autoFlagged: true,
    confidence: 0.95,
    rulesTriggered: ["spam_keywords", "repeated_content"]
  },
  createdAt: ISODate,
  resolvedAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Moderation workload analytics
- Content quality metrics
- Rule effectiveness tracking

**Schema**:

```javascript
const communityModerationSchema = new mongoose.Schema(
  {
    contentType: { type: String, enum: ['post', 'comment'], required: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    moderatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: {
      type: String,
      enum: ['approve', 'reject', 'flag', 'delete', 'edit'],
      required: true,
    },
    reason: {
      type: String,
      enum: [
        'spam',
        'harassment',
        'inappropriate',
        'duplicate',
        'off-topic',
        'other',
      ],
    },
    details: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'resolved'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    metadata: {
      autoFlagged: { type: Boolean, default: false },
      confidence: { type: Number, min: 0, max: 1 },
      rulesTriggered: [{ type: String }],
    },
    resolvedAt: Date,
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
communityModerationSchema.index({ status: 1, priority: 1, createdAt: 1 }); // Moderation queue
communityModerationSchema.index({ contentType: 1, contentId: 1 }); // Content moderation history
communityModerationSchema.index({ moderatorId: 1, resolvedAt: -1 }); // Moderator activity
communityModerationSchema.index({ reporterId: 1 }); // Reporter analytics
```

**Validation**:

```javascript
communityModerationSchema.pre('save', function (next) {
  if (this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  if (
    this.metadata.confidence &&
    (this.metadata.confidence < 0 || this.metadata.confidence > 1)
  ) {
    return next(new Error('Confidence must be between 0 and 1'));
  }
  next();
});
```

### 21. Community Suggestions (`community_suggestions`)

**Purpose**: User suggestions for platform improvements

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  authorId: ObjectId,
  title: "Add dark mode toggle",
  description: "It would be great to have a dark mode option...",
  category: "ui", // ui, feature, bug, performance, accessibility
  status: "under_review", // submitted, under_review, planned, in_progress, completed, declined
  priority: "medium", // low, medium, high
  votes: {
    count: 25,
    voters: [ObjectId]
  },
  tags: ["dark-mode", "ui", "accessibility"],
  attachments: [{
    type: "image",
    url: "https://...",
    name: "mockup.png"
  }],
  assignedTo: ObjectId, // Team member
  comments: [{
    authorId: ObjectId,
    content: "This is a great idea!",
    createdAt: ISODate
  }],
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Popular suggestions analytics
- Implementation priority tracking
- User engagement metrics

**Schema**:

```javascript
const communitySuggestionSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    category: {
      type: String,
      enum: ['ui', 'feature', 'bug', 'performance', 'accessibility'],
      required: true,
    },
    status: {
      type: String,
      enum: [
        'submitted',
        'under_review',
        'planned',
        'in_progress',
        'completed',
        'declined',
      ],
      default: 'submitted',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    votes: {
      count: { type: Number, default: 0 },
      voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    tags: [{ type: String, maxlength: 50 }],
    attachments: [
      {
        type: { type: String, enum: ['image', 'video', 'file'] },
        url: { type: String, required: true },
        name: { type: String, required: true },
        size: Number,
      },
    ],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [
      {
        authorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: { type: String, required: true, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
communitySuggestionSchema.index({ status: 1, priority: 1 }); // Status filtering
communitySuggestionSchema.index({ category: 1 }); // Category browsing
communitySuggestionSchema.index({ 'votes.count': -1 }); // Popular suggestions
communitySuggestionSchema.index({ authorId: 1 }); // User suggestions
communitySuggestionSchema.index({ assignedTo: 1 }); // Assignment tracking
communitySuggestionSchema.index({ tags: 1 }); // Tag-based search
```

**Validation**:

```javascript
communitySuggestionSchema.pre('save', function (next) {
  if (this.votes.voters && this.votes.count !== this.votes.voters.length) {
    this.votes.count = this.votes.voters.length;
  }
  next();
});
```

### 22. Support Tickets (`support_tickets`)

**Purpose**: Customer support ticket system

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  ticketId: "TICK-2024-001",
  requesterId: ObjectId,
  assigneeId: ObjectId,
  subject: "Cannot access chat history",
  description: "I'm unable to view my previous chat conversations...",
  category: "technical", // technical, billing, account, feature_request, bug_report
  priority: "medium", // low, medium, high, urgent
  status: "open", // open, in_progress, waiting_for_customer, resolved, closed
  tags: ["chat", "history", "bug"],
  metadata: {
    browser: "Chrome 120.0",
    os: "macOS 14.0",
    userAgent: "Mozilla/5.0...",
    ipAddress: "192.168.1.1"
  },
  conversation: [{
    authorId: ObjectId,
    authorType: "customer", // customer, agent
    message: "I'm having trouble accessing my chat history...",
    attachments: [{
      name: "screenshot.png",
      url: "https://...",
      size: 245760
    }],
    createdAt: ISODate
  }],
  resolution: {
    summary: "Fixed by clearing browser cache",
    resolvedBy: ObjectId,
    resolvedAt: ISODate
  },
  satisfaction: {
    rating: 5,
    feedback: "Quick and helpful support!"
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Support workload analytics
- Resolution time metrics
- Customer satisfaction tracking
- Category distribution analysis

**Schema**:

```javascript
const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subject: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    category: {
      type: String,
      enum: [
        'technical',
        'billing',
        'account',
        'feature_request',
        'bug_report',
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: [
        'open',
        'in_progress',
        'waiting_for_customer',
        'resolved',
        'closed',
      ],
      default: 'open',
    },
    tags: [{ type: String, maxlength: 50 }],
    metadata: {
      browser: String,
      os: String,
      userAgent: String,
      ipAddress: String,
    },
    conversation: [
      {
        authorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        authorType: {
          type: String,
          enum: ['customer', 'agent'],
          required: true,
        },
        message: { type: String, required: true },
        attachments: [
          {
            name: { type: String, required: true },
            url: { type: String, required: true },
            size: Number,
          },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resolution: {
      summary: { type: String, maxlength: 500 },
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      resolvedAt: Date,
    },
    satisfaction: {
      rating: { type: Number, min: 1, max: 5 },
      feedback: { type: String, maxlength: 500 },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
supportTicketSchema.index({ ticketId: 1 }, { unique: true }); // Ticket lookup
supportTicketSchema.index({ requesterId: 1, status: 1 }); // Customer tickets
supportTicketSchema.index({ assigneeId: 1, status: 1 }); // Assigned tickets
supportTicketSchema.index({ status: 1, priority: 1, createdAt: 1 }); // Support queue
supportTicketSchema.index({ category: 1 }); // Category analytics
supportTicketSchema.index({ tags: 1 }); // Tag-based search
supportTicketSchema.index({ createdAt: -1 }); // Recent tickets
```

**Validation**:

```javascript
supportTicketSchema.pre('save', function (next) {
  if (this.status === 'resolved' && !this.resolution.resolvedAt) {
    this.resolution.resolvedAt = new Date();
  }
  if (
    this.satisfaction.rating &&
    (this.satisfaction.rating < 1 || this.satisfaction.rating > 5)
  ) {
    return next(new Error('Satisfaction rating must be between 1 and 5'));
  }
  next();
});
```

### 23. Consultations (`consultations`)

**Purpose**: Scheduled consultation sessions with experts

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  consultationId: "CONS-2024-001",
  clientId: ObjectId,
  consultantId: ObjectId,
  title: "React Performance Optimization Consultation",
  description: "1-hour consultation to optimize React application performance",
  category: "technical", // technical, business, career, creative
  type: "one-on-one", // one-on-one, group, workshop
  status: "scheduled", // draft, scheduled, confirmed, in_progress, completed, cancelled
  scheduledAt: ISODate,
  duration: 60, // minutes
  timezone: "America/New_York",
  location: {
    type: "virtual", // virtual, physical
    platform: "Zoom",
    meetingLink: "https://zoom.us/j/123456789",
    address: "123 Office St, City, State"
  },
  pricing: {
    amount: 150,
    currency: "USD",
    paymentStatus: "paid" // pending, paid, refunded
  },
  agenda: ["Introduction", "Current challenges", "Solutions discussion", "Action items"],
  notes: {
    client: "Client has large React app with performance issues",
    consultant: "Will focus on code splitting and lazy loading",
    internal: "Follow up email needed"
  },
  feedback: {
    clientRating: 5,
    clientFeedback: "Excellent consultation!",
    consultantRating: 5,
    consultantFeedback: "Great client, clear requirements"
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Consultation revenue analytics
- Consultant performance metrics
- Client satisfaction tracking
- Category popularity analysis

**Schema**:

```javascript
const consultationSchema = new mongoose.Schema(
  {
    consultationId: { type: String, required: true, unique: true },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    consultantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    category: {
      type: String,
      enum: ['technical', 'business', 'career', 'creative'],
      required: true,
    },
    type: {
      type: String,
      enum: ['one-on-one', 'group', 'workshop'],
      default: 'one-on-one',
    },
    status: {
      type: String,
      enum: [
        'draft',
        'scheduled',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
      ],
      default: 'draft',
    },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true, min: 15, max: 480 }, // 15 min to 8 hours
    timezone: { type: String, default: 'UTC' },
    location: {
      type: { type: String, enum: ['virtual', 'physical'], required: true },
      platform: String,
      meetingLink: String,
      address: String,
    },
    pricing: {
      amount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'USD' },
      paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending',
      },
    },
    agenda: [{ type: String, maxlength: 200 }],
    notes: {
      client: { type: String, maxlength: 500 },
      consultant: { type: String, maxlength: 500 },
      internal: { type: String, maxlength: 500 },
    },
    feedback: {
      clientRating: { type: Number, min: 1, max: 5 },
      clientFeedback: { type: String, maxlength: 500 },
      consultantRating: { type: Number, min: 1, max: 5 },
      consultantFeedback: { type: String, maxlength: 500 },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
consultationSchema.index({ consultationId: 1 }, { unique: true }); // Consultation lookup
consultationSchema.index({ clientId: 1, status: 1 }); // Client consultations
consultationSchema.index({ consultantId: 1, status: 1 }); // Consultant schedule
consultationSchema.index({ status: 1, scheduledAt: 1 }); // Upcoming consultations
consultationSchema.index({ category: 1 }); // Category analytics
consultationSchema.index({ scheduledAt: 1 }); // Date-based queries
```

**Validation**:

```javascript
consultationSchema.pre('save', function (next) {
  if (this.scheduledAt <= new Date()) {
    return next(new Error('Scheduled time must be in the future'));
  }
  if (
    this.feedback.clientRating &&
    (this.feedback.clientRating < 1 || this.feedback.clientRating > 5)
  ) {
    return next(new Error('Client rating must be between 1 and 5'));
  }
  if (
    this.feedback.consultantRating &&
    (this.feedback.consultantRating < 1 || this.feedback.consultantRating > 5)
  ) {
    return next(new Error('Consultant rating must be between 1 and 5'));
  }
  next();
});
```

### 24. Job Applications (`job_applications`)

**Purpose**: Job applications and career opportunities

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  applicantId: ObjectId,
  jobId: ObjectId,
  status: "submitted", // submitted, under_review, interview_scheduled, rejected, accepted
  coverLetter: "I am excited to apply for this position...",
  resume: {
    filename: "john_doe_resume.pdf",
    url: "https://...",
    uploadedAt: ISODate
  },
  portfolio: [{
    title: "React E-commerce App",
    url: "https://...",
    description: "Full-stack e-commerce application"
  }],
  answers: [{
    question: "Why do you want to work here?",
    answer: "I admire your company's mission..."
  }],
  notes: {
    hr: "Strong technical background",
    hiringManager: "Good cultural fit"
  },
  interviews: [{
    round: 1,
    scheduledAt: ISODate,
    interviewerId: ObjectId,
    feedback: "Excellent technical skills",
    rating: 4
  }],
  offer: {
    salary: 75000,
    startDate: ISODate,
    status: "pending" // pending, accepted, rejected
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Application funnel analytics
- Hiring success metrics
- Candidate quality tracking
- Time-to-hire analysis

**Schema**:

```javascript
const jobApplicationSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to job posting
    status: {
      type: String,
      enum: [
        'submitted',
        'under_review',
        'interview_scheduled',
        'rejected',
        'accepted',
      ],
      default: 'submitted',
    },
    coverLetter: { type: String, maxlength: 2000 },
    resume: {
      filename: { type: String, required: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
    portfolio: [
      {
        title: { type: String, required: true, maxlength: 100 },
        url: { type: String, required: true },
        description: { type: String, maxlength: 300 },
      },
    ],
    answers: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true, maxlength: 1000 },
      },
    ],
    notes: {
      hr: { type: String, maxlength: 500 },
      hiringManager: { type: String, maxlength: 500 },
    },
    interviews: [
      {
        round: { type: Number, required: true },
        scheduledAt: { type: Date, required: true },
        interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        feedback: { type: String, maxlength: 500 },
        rating: { type: Number, min: 1, max: 5 },
      },
    ],
    offer: {
      salary: Number,
      startDate: Date,
      status: { type: String, enum: ['pending', 'accepted', 'rejected'] },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
jobApplicationSchema.index({ applicantId: 1, jobId: 1 }, { unique: true }); // One application per job per user
jobApplicationSchema.index({ jobId: 1, status: 1 }); // Job applications
jobApplicationSchema.index({ status: 1, createdAt: -1 }); // Application pipeline
jobApplicationSchema.index({ 'interviews.scheduledAt': 1 }); // Interview schedule
```

**Validation**:

```javascript
jobApplicationSchema.pre('save', function (next) {
  if (this.interviews && this.interviews.length > 0) {
    for (const interview of this.interviews) {
      if (interview.rating && (interview.rating < 1 || interview.rating > 5)) {
        return next(new Error('Interview rating must be between 1 and 5'));
      }
    }
  }
  next();
});
```

### 25. Webinar Registrations (`webinar_registrations`)

**Purpose**: Webinar and online event registrations

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  webinarId: ObjectId,
  registrantId: ObjectId,
  registrationType: "attendee", // attendee, speaker, organizer
  status: "confirmed", // pending, confirmed, attended, no_show, cancelled
  registrationData: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    company: "Tech Corp",
    jobTitle: "Developer",
    experience: "intermediate" // beginner, intermediate, advanced
  },
  attendance: {
    joinedAt: ISODate,
    leftAt: ISODate,
    duration: 3600, // seconds
    engagement: {
      questionsAsked: 2,
      pollsResponded: 5
    }
  },
  feedback: {
    rating: 5,
    comments: "Excellent webinar!",
    suggestions: "More hands-on examples"
  },
  certificate: {
    issued: true,
    url: "https://...",
    issuedAt: ISODate
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Webinar attendance analytics
- Registrant demographics
- Engagement metrics
- Content effectiveness tracking

**Schema**:

```javascript
const webinarRegistrationSchema = new mongoose.Schema(
  {
    webinarId: { type: mongoose.Schema.Types.ObjectId, required: true },
    registrantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registrationType: {
      type: String,
      enum: ['attendee', 'speaker', 'organizer'],
      default: 'attendee',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'attended', 'no_show', 'cancelled'],
      default: 'pending',
    },
    registrationData: {
      firstName: { type: String, required: true, maxlength: 50 },
      lastName: { type: String, required: true, maxlength: 50 },
      email: { type: String, required: true },
      company: { type: String, maxlength: 100 },
      jobTitle: { type: String, maxlength: 100 },
      experience: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
      },
    },
    attendance: {
      joinedAt: Date,
      leftAt: Date,
      duration: Number,
      engagement: {
        questionsAsked: { type: Number, default: 0 },
        pollsResponded: { type: Number, default: 0 },
      },
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comments: { type: String, maxlength: 500 },
      suggestions: { type: String, maxlength: 500 },
    },
    certificate: {
      issued: { type: Boolean, default: false },
      url: String,
      issuedAt: Date,
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
webinarRegistrationSchema.index(
  { webinarId: 1, registrantId: 1 },
  { unique: true }
); // One registration per webinar per user
webinarRegistrationSchema.index({ webinarId: 1, status: 1 }); // Webinar registrations
webinarRegistrationSchema.index({ registrantId: 1 }); // User registrations
webinarRegistrationSchema.index({ status: 1 }); // Registration status
```

**Validation**:

```javascript
webinarRegistrationSchema.pre('save', function (next) {
  if (this.attendance.joinedAt && this.attendance.leftAt) {
    if (this.attendance.leftAt <= this.attendance.joinedAt) {
      return next(new Error('Left time must be after joined time'));
    }
    this.attendance.duration = Math.floor(
      (this.attendance.leftAt - this.attendance.joinedAt) / 1000
    );
  }
  if (
    this.feedback.rating &&
    (this.feedback.rating < 1 || this.feedback.rating > 5)
  ) {
    return next(new Error('Feedback rating must be between 1 and 5'));
  }
  next();
});
```

### 26. Transactions (`transactions`)

**Purpose**: Payment and financial transaction records

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  transactionId: "TXN-2024-001",
  userId: ObjectId,
  type: "subscription", // subscription, consultation, webinar, donation
  amount: 19.99,
  currency: "USD",
  status: "completed", // pending, completed, failed, refunded, disputed
  paymentMethod: {
    type: "card", // card, paypal, bank_transfer, crypto
    last4: "4242",
    brand: "visa"
  },
  description: "Monthly subscription - Mistral Expert Agent",
  metadata: {
    agentId: ObjectId,
    plan: "monthly",
    period: { start: ISODate, end: ISODate }
  },
  stripe: {
    paymentIntentId: "pi_1234567890",
    chargeId: "ch_1234567890",
    refundId: "ref_1234567890"
  },
  tax: {
    rate: 0.08,
    amount: 1.60
  },
  fees: {
    processing: 0.59,
    platform: 1.00
  },
  refunds: [{
    amount: 19.99,
    reason: "customer_request",
    processedAt: ISODate
  }],
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Revenue analytics
- Transaction success rates
- Payment method preferences
- Refund analysis

**Schema**:

```javascript
const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['subscription', 'consultation', 'webinar', 'donation'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'disputed'],
      default: 'pending',
    },
    paymentMethod: {
      type: {
        type: String,
        enum: ['card', 'paypal', 'bank_transfer', 'crypto'],
        required: true,
      },
      last4: String,
      brand: String,
    },
    description: { type: String, required: true, maxlength: 200 },
    metadata: {}, // Flexible metadata for different transaction types
    stripe: {
      paymentIntentId: String,
      chargeId: String,
      refundId: String,
    },
    tax: {
      rate: { type: Number, min: 0, max: 1 },
      amount: { type: Number, min: 0 },
    },
    fees: {
      processing: { type: Number, min: 0 },
      platform: { type: Number, min: 0 },
    },
    refunds: [
      {
        amount: { type: Number, required: true, min: 0 },
        reason: {
          type: String,
          enum: ['customer_request', 'duplicate', 'fraud', 'other'],
        },
        processedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
transactionSchema.index({ transactionId: 1 }, { unique: true }); // Transaction lookup
transactionSchema.index({ userId: 1, createdAt: -1 }); // User transactions
transactionSchema.index({ status: 1, createdAt: -1 }); // Transaction status
transactionSchema.index({ type: 1 }); // Transaction type analytics
transactionSchema.index({ 'stripe.paymentIntentId': 1 }); // Stripe integration
transactionSchema.index({ createdAt: -1 }); // Recent transactions
```

**Validation**:

```javascript
transactionSchema.pre('save', function (next) {
  if (this.refunds && this.refunds.length > 0) {
    const totalRefunded = this.refunds.reduce(
      (sum, refund) => sum + refund.amount,
      0
    );
    if (totalRefunded > this.amount) {
      return next(new Error('Total refunds cannot exceed transaction amount'));
    }
  }
  if (this.tax.rate && (this.tax.rate < 0 || this.tax.rate > 1)) {
    return next(new Error('Tax rate must be between 0 and 1'));
  }
  next();
});
```

### 27. Lab Experiments (`lab_experiments`)

**Purpose**: AI lab experiments and research projects

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  experimentId: "EXP-2024-001",
  researcherId: ObjectId,
  title: "Fine-tuning GPT for Code Generation",
  description: "Experimenting with different fine-tuning approaches for code generation tasks",
  category: "nlp", // nlp, computer_vision, reinforcement_learning, other
  status: "running", // planning, running, completed, paused, failed
  hypothesis: "Fine-tuning with code-specific datasets will improve code generation quality",
  methodology: {
    model: "gpt-3.5-turbo",
    dataset: "code-search-net",
    parameters: {
      learningRate: 0.0001,
      batchSize: 32,
      epochs: 10
    }
  },
  results: {
    metrics: {
      accuracy: 0.85,
      bleu: 0.72,
      codebleu: 0.68
    },
    observations: "Model shows significant improvement in syntax correctness",
    artifacts: [{
      name: "fine-tuned-model",
      url: "https://...",
      type: "model"
    }]
  },
  collaborators: [ObjectId],
  tags: ["fine-tuning", "code-generation", "gpt"],
  budget: {
    allocated: 5000,
    spent: 3200,
    currency: "USD"
  },
  timeline: {
    startedAt: ISODate,
    estimatedCompletion: ISODate,
    completedAt: ISODate
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Research productivity metrics
- Experiment success rates
- Resource utilization tracking
- Category performance analysis

**Schema**:

```javascript
const labExperimentSchema = new mongoose.Schema(
  {
    experimentId: { type: String, required: true, unique: true },
    researcherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    category: {
      type: String,
      enum: ['nlp', 'computer_vision', 'reinforcement_learning', 'other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['planning', 'running', 'completed', 'paused', 'failed'],
      default: 'planning',
    },
    hypothesis: { type: String, maxlength: 500 },
    methodology: {
      model: String,
      dataset: String,
      parameters: {},
    },
    results: {
      metrics: {},
      observations: { type: String, maxlength: 1000 },
      artifacts: [
        {
          name: { type: String, required: true },
          url: { type: String, required: true },
          type: { type: String, enum: ['model', 'dataset', 'code', 'report'] },
        },
      ],
    },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: [{ type: String, maxlength: 50 }],
    budget: {
      allocated: { type: Number, min: 0 },
      spent: { type: Number, min: 0 },
      currency: { type: String, default: 'USD' },
    },
    timeline: {
      startedAt: Date,
      estimatedCompletion: Date,
      completedAt: Date,
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
labExperimentSchema.index({ experimentId: 1 }, { unique: true }); // Experiment lookup
labExperimentSchema.index({ researcherId: 1, status: 1 }); // Researcher experiments
labExperimentSchema.index({ status: 1 }); // Experiment status
labExperimentSchema.index({ category: 1 }); // Category analytics
labExperimentSchema.index({ collaborators: 1 }); // Collaboration tracking
labExperimentSchema.index({ tags: 1 }); // Tag-based search
```

**Validation**:

```javascript
labExperimentSchema.pre('save', function (next) {
  if (this.status === 'completed' && !this.timeline.completedAt) {
    this.timeline.completedAt = new Date();
  }
  if (this.budget.spent > this.budget.allocated) {
    return next(new Error('Spent amount cannot exceed allocated budget'));
  }
  next();
});
```

### 28. User Favorites (`user_favorites`)

**Purpose**: User favorites and bookmarks

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  itemType: "agent", // agent, post, comment, session, canvas_project
  itemId: ObjectId,
  category: "ai-assistants", // user-defined categories
  notes: "Great for coding tasks",
  tags: ["coding", "javascript", "helpful"],
  addedAt: ISODate,
  lastAccessed: ISODate,
  accessCount: 5
}
```

**Aggregations**:

- User preference analytics
- Content popularity tracking
- Engagement metrics

**Schema**:

```javascript
const userFavoritesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemType: {
    type: String,
    enum: ['agent', 'post', 'comment', 'session', 'canvas_project'],
    required: true,
  },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  category: { type: String, maxlength: 50 },
  notes: { type: String, maxlength: 200 },
  tags: [{ type: String, maxlength: 50 }],
  addedAt: { type: Date, default: Date.now },
  lastAccessed: { type: Date, default: Date.now },
  accessCount: { type: Number, default: 0 },
});

// Compound unique index to prevent duplicate favorites
userFavoritesSchema.index(
  { userId: 1, itemType: 1, itemId: 1 },
  { unique: true }
);
```

**Indexes**:

```javascript
userFavoritesSchema.index({ userId: 1, itemType: 1 }); // User favorites by type
userFavoritesSchema.index({ itemType: 1, itemId: 1 }); // Item favorites count
userFavoritesSchema.index({ category: 1 }); // Category analytics
userFavoritesSchema.index({ tags: 1 }); // Tag-based search
```

**Validation**:

```javascript
// Validation handled by unique compound index
```

### 29. Agent Personalization (`agent_personalization`)

**Purpose**: User-specific agent customizations and preferences

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  agentId: ObjectId,
  customName: "My Coding Buddy",
  avatar: "https://...",
  color: "from-purple-500 to-pink-500",
  systemPrompt: "You are a coding assistant who...",
  welcomeMessage: "Hey there! Ready to code?",
  settings: {
    temperature: 0.8,
    maxTokens: 3000,
    mode: "creative"
  },
  quickActions: ["debug", "optimize", "explain"],
  conversationStyle: "casual", // formal, casual, technical
  notifications: {
    enabled: true,
    sound: "gentle",
    desktop: true
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- Personalization usage analytics
- Agent customization trends
- User engagement metrics

**Schema**:

```javascript
const agentPersonalizationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
    },
    customName: { type: String, maxlength: 100 },
    avatar: String,
    color: { type: String, maxlength: 100 },
    systemPrompt: { type: String, maxlength: 2000 },
    welcomeMessage: { type: String, maxlength: 500 },
    settings: {
      temperature: { type: Number, min: 0, max: 2, default: 0.7 },
      maxTokens: { type: Number, min: 1, max: 4000, default: 2000 },
      mode: {
        type: String,
        enum: ['professional', 'balanced', 'creative', 'fast', 'coding'],
        default: 'balanced',
      },
    },
    quickActions: [{ type: String, maxlength: 50 }],
    conversationStyle: {
      type: String,
      enum: ['formal', 'casual', 'technical'],
      default: 'casual',
    },
    notifications: {
      enabled: { type: Boolean, default: true },
      sound: { type: String, default: 'gentle' },
      desktop: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Compound unique index
agentPersonalizationSchema.index({ userId: 1, agentId: 1 }, { unique: true });
```

**Indexes**:

```javascript
agentPersonalizationSchema.index({ userId: 1 }); // User personalizations
agentPersonalizationSchema.index({ agentId: 1 }); // Agent usage analytics
```

**Validation**:

```javascript
agentPersonalizationSchema.pre('save', function (next) {
  if (this.settings.temperature < 0 || this.settings.temperature > 2) {
    return next(new Error('Temperature must be between 0 and 2'));
  }
  if (this.settings.maxTokens < 1 || this.settings.maxTokens > 4000) {
    return next(new Error('Max tokens must be between 1 and 4000'));
  }
  next();
});
```

## Summary

This comprehensive database specification covers **29 collections** total:

### Existing Collections (Already Implemented - 10):

1. Chat Sessions
2. Chat Settings
3. Chat Feedback
4. Chat Quick Actions
5. Chat Canvas Projects
6. Chat Canvas Files
7. Chat Canvas History
8. Agent Subscriptions
9. Users
10. Agents

### New Collections (Need to be Created - 19):

11. Contact Messages
12. Community Posts
13. Community Comments
14. Community Likes
15. Community Groups
16. Community Memberships
17. Community Events
18. Community Content
19. Community Metrics
20. Community Moderation
21. Community Suggestions
22. Support Tickets
23. Consultations
24. Job Applications
25. Webinar Registrations
26. Transactions
27. Lab Experiments
28. User Favorites
29. Agent Personalization

Each collection includes complete specifications for:

- **Documents**: Detailed structure with all fields and data types
- **Aggregations**: Analytics and reporting pipelines needed
- **Schema**: Complete Mongoose schema definitions
- **Indexes**: Optimized database indexes for performance
- **Validation**: Pre-save validation rules and business logic

All collections are designed to work together to support the full feature set of the universal chat platform, community features, business operations, and user management system.
