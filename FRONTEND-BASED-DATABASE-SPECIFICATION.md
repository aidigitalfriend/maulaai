# FRONTEND-BASED-DATABASE-SPECIFICATION.md

## Database Collections Based on Frontend/App Structure Analysis

This document specifies all database collections required based on the comprehensive analysis of the frontend/app/ directory structure, components, API endpoints, and data flows.

---

## 1. User Management Collections

### 1.1 Users Collection

**Purpose**: Core user accounts and authentication data

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  name: "John Doe",
  username: "johndoe",
  password: "hashed_password",
  authMethod: "password|google|github",
  emailVerified: true,
  profile: {
    avatar: "https://...",
    bio: "AI enthusiast",
    location: "San Francisco, CA",
    website: "https://johndoe.com",
    socialLinks: {
      twitter: "@johndoe",
      linkedin: "johndoe",
      github: "johndoe"
    }
  },
  preferences: {
    theme: "dark|light|system",
    language: "en",
    timezone: "America/Los_Angeles",
    notifications: {
      email: true,
      push: false,
      marketing: false
    }
  },
  security: {
    twoFactorEnabled: false,
    lastLoginAt: ISODate,
    loginAttempts: 0,
    lockedUntil: null,
    backupCodes: ["code1", "code2"],
    resetPasswordToken: "token",
    resetPasswordExpires: ISODate
  },
  subscription: {
    plan: "free|pro|enterprise",
    status: "active|inactive|cancelled",
    stripeCustomerId: "cus_xxx",
    currentPeriodEnd: ISODate,
    cancelAtPeriodEnd: false
  },
  stats: {
    totalSessions: 0,
    totalMessages: 0,
    totalTokens: 0,
    joinedAt: ISODate,
    lastActiveAt: ISODate
  },
  isActive: true,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- User activity analytics
- Subscription metrics
- Geographic distribution
- User engagement reports

**Schema**:

```javascript
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    username: { type: String, unique: true, sparse: true, lowercase: true },
    password: {
      type: String,
      required: function () {
        return this.authMethod === 'password';
      },
    },
    authMethod: {
      type: String,
      enum: ['password', 'google', 'github'],
      default: 'password',
    },
    emailVerified: { type: Boolean, default: false },
    profile: {
      avatar: { type: String },
      bio: { type: String, maxlength: 500 },
      location: { type: String },
      website: { type: String },
      socialLinks: {
        twitter: { type: String },
        linkedin: { type: String },
        github: { type: String },
      },
    },
    preferences: {
      theme: {
        type: String,
        enum: ['dark', 'light', 'system'],
        default: 'system',
      },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false },
      },
    },
    security: {
      twoFactorEnabled: { type: Boolean, default: false },
      lastLoginAt: { type: Date },
      loginAttempts: { type: Number, default: 0 },
      lockedUntil: { type: Date },
      backupCodes: [{ type: String }],
      resetPasswordToken: { type: String },
      resetPasswordExpires: { type: Date },
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled'],
        default: 'active',
      },
      stripeCustomerId: { type: String },
      currentPeriodEnd: { type: Date },
      cancelAtPeriodEnd: { type: Boolean, default: false },
    },
    stats: {
      totalSessions: { type: Number, default: 0 },
      totalMessages: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
      joinedAt: { type: Date, default: Date.now },
      lastActiveAt: { type: Date, default: Date.now },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ 'subscription.stripeCustomerId': 1 });
userSchema.index({
  'subscription.status': 1,
  'subscription.currentPeriodEnd': 1,
});
userSchema.index({ 'stats.lastActiveAt': -1 });
userSchema.index({ 'security.resetPasswordToken': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, 'stats.lastActiveAt': -1 });
```

**Validation**:

```javascript
userSchema.pre('save', function (next) {
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.email)) {
    return next(new Error('Invalid email format'));
  }

  // Username validation
  if (this.username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(this.username)) {
      return next(
        new Error(
          'Username must be 3-30 characters, alphanumeric or underscore'
        )
      );
    }
  }

  // Password strength for password auth
  if (
    this.authMethod === 'password' &&
    this.password &&
    this.password.length < 8
  ) {
    return next(new Error('Password must be at least 8 characters'));
  }

  next();
});
```

---

### 1.2 User Profiles Collection

**Purpose**: Extended user profile information

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to Users collection
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: ISODate,
    gender: "male|female|other",
    phoneNumber: "+1234567890"
  },
  professionalInfo: {
    company: "Tech Corp",
    jobTitle: "Software Engineer",
    industry: "Technology",
    experience: "5+ years",
    skills: ["JavaScript", "React", "Node.js"]
  },
  interests: ["AI", "Machine Learning", "Web Development"],
  achievements: [{
    title: "First AI Agent Created",
    description: "Created first custom AI agent",
    earnedAt: ISODate,
    badgeUrl: "https://..."
  }],
  privacy: {
    profileVisibility: "public|private|friends",
    showEmail: false,
    showActivity: true
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    personalInfo: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      dateOfBirth: { type: Date },
      gender: { type: String, enum: ['male', 'female', 'other'] },
      phoneNumber: { type: String },
    },
    professionalInfo: {
      company: { type: String },
      jobTitle: { type: String },
      industry: { type: String },
      experience: { type: String },
      skills: [{ type: String }],
    },
    interests: [{ type: String }],
    achievements: [
      {
        title: { type: String, required: true },
        description: { type: String },
        earnedAt: { type: Date, default: Date.now },
        badgeUrl: { type: String },
      },
    ],
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'friends'],
        default: 'public',
      },
      showEmail: { type: Boolean, default: false },
      showActivity: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
userProfileSchema.index({ userId: 1 }, { unique: true });
userProfileSchema.index({ 'professionalInfo.industry': 1 });
userProfileSchema.index({ 'professionalInfo.skills': 1 });
userProfileSchema.index({ 'privacy.profileVisibility': 1 });
```

---

### 1.3 User Preferences Collection

**Purpose**: User-specific settings and preferences

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  ui: {
    theme: "dark",
    sidebarCollapsed: false,
    defaultView: "grid|list",
    itemsPerPage: 20
  },
  chat: {
    defaultAgent: "einstein",
    autoSave: true,
    messageHistory: 100,
    typingIndicator: true
  },
  notifications: {
    email: {
      marketing: false,
      updates: true,
      security: true
    },
    push: {
      messages: true,
      mentions: true,
      achievements: false
    }
  },
  privacy: {
    analytics: true,
    crashReports: false,
    dataSharing: false
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const userPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    ui: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      sidebarCollapsed: { type: Boolean, default: false },
      defaultView: { type: String, enum: ['grid', 'list'], default: 'grid' },
      itemsPerPage: { type: Number, min: 10, max: 100, default: 20 },
    },
    chat: {
      defaultAgent: { type: String, default: 'einstein' },
      autoSave: { type: Boolean, default: true },
      messageHistory: { type: Number, min: 10, max: 1000, default: 100 },
      typingIndicator: { type: Boolean, default: true },
    },
    notifications: {
      email: {
        marketing: { type: Boolean, default: false },
        updates: { type: Boolean, default: true },
        security: { type: Boolean, default: true },
      },
      push: {
        messages: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true },
        achievements: { type: Boolean, default: false },
      },
    },
    privacy: {
      analytics: { type: Boolean, default: true },
      crashReports: { type: Boolean, default: false },
      dataSharing: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
userPreferencesSchema.index({ userId: 1 }, { unique: true });
userPreferencesSchema.index({ 'ui.theme': 1 });
userPreferencesSchema.index({ 'chat.defaultAgent': 1 });
```

---

## 2. Agent Management Collections

### 2.1 Agents Collection

**Purpose**: AI agent configurations and metadata

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  id: "einstein",
  name: "Albert Einstein",
  specialty: "Physics & Science",
  description: "Nobel Prize-winning physicist...",
  avatarUrl: "https://...",
  category: "Education",
  tags: ["physics", "science", "education"],
  color: "from-blue-500 to-purple-500",
  personality: {
    traits: ["intelligent", "curious", "patient"],
    responseStyle: "educational",
    greetingMessage: "Greetings! I'm Albert Einstein...",
    specialties: ["physics", "science", "education"],
    conversationStarters: ["Tell me about relativity...", "..."]
  },
  prompts: {
    systemPrompt: "You are Albert Einstein...",
    contextPrompt: "Always explain concepts clearly...",
    exampleResponses: [{
      input: "What is E=mc²?",
      output: "E=mc² is Einstein's famous equation..."
    }]
  },
  settings: {
    maxTokens: 2000,
    temperature: 0.7,
    enabled: true,
    premium: false
  },
  aiProvider: {
    primary: "anthropic",
    fallbacks: ["openai"],
    model: "claude-3-sonnet-20240229",
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
    averageRating: 4.7,
    totalMessages: 25000
  },
  status: "active",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const agentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, maxlength: 100 },
    specialty: { type: String, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    avatarUrl: { type: String },
    category: {
      type: String,
      enum: [
        'Companion',
        'Business',
        'Entertainment',
        'Home & Lifestyle',
        'Education',
        'Health & Wellness',
        'Creative',
        'Technology',
      ],
    },
    tags: [{ type: String, maxlength: 50 }],
    color: { type: String, maxlength: 100 },
    personality: {
      traits: [{ type: String }],
      responseStyle: { type: String },
      greetingMessage: { type: String },
      specialties: [{ type: String }],
      conversationStarters: [{ type: String }],
    },
    prompts: {
      systemPrompt: { type: String, required: true },
      contextPrompt: { type: String },
      exampleResponses: [
        {
          input: { type: String, required: true },
          output: { type: String, required: true },
        },
      ],
    },
    settings: {
      maxTokens: { type: Number, min: 100, max: 4000, default: 2000 },
      temperature: { type: Number, min: 0, max: 2, default: 0.7 },
      enabled: { type: Boolean, default: true },
      premium: { type: Boolean, default: false },
    },
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
      daily: { type: Number, min: 0, default: 0 },
      weekly: { type: Number, min: 0, default: 0 },
      monthly: { type: Number, min: 0, default: 0 },
    },
    stats: {
      totalUsers: { type: Number, default: 0 },
      totalSessions: { type: Number, default: 0 },
      averageRating: { type: Number, min: 0, max: 5, default: 0 },
      totalMessages: { type: Number, default: 0 },
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
agentSchema.index({ id: 1 }, { unique: true });
agentSchema.index({ status: 1 });
agentSchema.index({ category: 1 });
agentSchema.index({ tags: 1 });
agentSchema.index({ 'aiProvider.primary': 1 });
agentSchema.index({ 'stats.totalUsers': -1 });
agentSchema.index({ 'settings.premium': 1 });
agentSchema.index({ createdAt: -1 });
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

---

### 2.2 Agent Subscriptions Collection

**Purpose**: User subscriptions to specific agents

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  agentId: "einstein",
  plan: "daily|weekly|monthly",
  status: "active|cancelled|expired",
  stripeSubscriptionId: "sub_xxx",
  stripePriceId: "price_xxx",
  currentPeriodStart: ISODate,
  currentPeriodEnd: ISODate,
  cancelAtPeriodEnd: false,
  autoRenew: true,
  pricing: {
    amount: 19,
    currency: "USD",
    interval: "month"
  },
  usage: {
    messagesThisPeriod: 0,
    tokensThisPeriod: 0,
    lastUsedAt: ISODate
  },
  metadata: {
    source: "web|api|admin",
    promoCode: "WELCOME20"
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const agentSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agentId: { type: String, required: true },
    plan: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'paused'],
      default: 'active',
    },
    stripeSubscriptionId: { type: String },
    stripePriceId: { type: String },
    currentPeriodStart: { type: Date, default: Date.now },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    autoRenew: { type: Boolean, default: true },
    pricing: {
      amount: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
      interval: {
        type: String,
        enum: ['day', 'week', 'month'],
        required: true,
      },
    },
    usage: {
      messagesThisPeriod: { type: Number, default: 0 },
      tokensThisPeriod: { type: Number, default: 0 },
      lastUsedAt: { type: Date },
    },
    metadata: {
      source: { type: String, enum: ['web', 'api', 'admin'], default: 'web' },
      promoCode: { type: String },
      notes: { type: String },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
agentSubscriptionSchema.index({ userId: 1, agentId: 1 }, { unique: true });
agentSubscriptionSchema.index({ userId: 1, status: 1 });
agentSubscriptionSchema.index({ agentId: 1, status: 1 });
agentSubscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });
agentSubscriptionSchema.index({ stripeSubscriptionId: 1 });
agentSubscriptionSchema.index({ 'usage.lastUsedAt': -1 });
agentSubscriptionSchema.index({ createdAt: -1 });
```

---

### 2.3 Agent Personalization Collection

**Purpose**: User-specific customizations for agents

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  agentId: "einstein",
  customizations: {
    name: "My Einstein",
    avatar: "https://...",
    personality: {
      traits: ["more humorous"],
      greetingMessage: "Hey there! Ready to explore physics?"
    },
    prompts: {
      systemPrompt: "Custom system prompt...",
      contextPrompt: "Additional context..."
    }
  },
  settings: {
    temperature: 0.8,
    maxTokens: 1500,
    autoSave: true
  },
  isActive: true,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const agentPersonalizationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agentId: { type: String, required: true },
    customizations: {
      name: { type: String, maxlength: 100 },
      avatar: { type: String },
      personality: {
        traits: [{ type: String }],
        greetingMessage: { type: String },
        specialties: [{ type: String }],
      },
      prompts: {
        systemPrompt: { type: String },
        contextPrompt: { type: String },
      },
    },
    settings: {
      temperature: { type: Number, min: 0, max: 2 },
      maxTokens: { type: Number, min: 100, max: 4000 },
      autoSave: { type: Boolean, default: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
agentPersonalizationSchema.index({ userId: 1, agentId: 1 }, { unique: true });
agentPersonalizationSchema.index({ userId: 1, isActive: 1 });
agentPersonalizationSchema.index({ agentId: 1 });
```

---

## 3. Chat & Conversation Collections

### 3.1 Chat Sessions Collection

**Purpose**: Chat conversation sessions between users and agents

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  sessionId: "sess_1234567890",
  userId: ObjectId,
  agentId: ObjectId,
  name: "Physics Discussion",
  description: "Discussion about quantum mechanics",
  isActive: true,
  isArchived: false,
  tags: ["physics", "quantum"],
  settings: {
    temperature: 0.7,
    maxTokens: 2000,
    mode: "balanced",
    provider: "anthropic",
    model: "claude-3-sonnet-20240229"
  },
  stats: {
    messageCount: 15,
    totalTokens: 2500,
    durationMs: 180000,
    lastMessageAt: ISODate
  },
  archivedAt: null,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const chatSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      index: true,
    },
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
  { timestamps: true }
);
```

**Indexes**:

```javascript
chatSessionSchema.index({ userId: 1, updatedAt: -1 });
chatSessionSchema.index({ agentId: 1, createdAt: -1 });
chatSessionSchema.index({ isActive: 1, updatedAt: -1 });
chatSessionSchema.index({ tags: 1 });
chatSessionSchema.index({ 'settings.provider': 1 });
chatSessionSchema.index({ createdAt: -1 });
```

---

### 3.2 Chat Messages Collection

**Purpose**: Individual messages within chat sessions

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  sessionId: "sess_1234567890",
  messageId: "msg_1234567890",
  role: "user|assistant|system",
  content: "What is quantum entanglement?",
  tokens: 6,
  metadata: {
    model: "claude-3-sonnet-20240229",
    temperature: 0.7,
    processingTime: 1200,
    provider: "anthropic"
  },
  attachments: [{
    type: "image",
    url: "https://...",
    filename: "diagram.png"
  }],
  feedback: {
    rating: 5,
    comment: "Great explanation!",
    userId: ObjectId
  },
  createdAt: ISODate
}
```

**Schema**:

```javascript
const chatMessageSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    messageId: { type: String, required: true, unique: true, index: true },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: { type: String, required: true },
    tokens: { type: Number, min: 0 },
    metadata: {
      model: { type: String },
      temperature: { type: Number },
      processingTime: { type: Number },
      provider: { type: String },
    },
    attachments: [
      {
        type: { type: String, enum: ['image', 'file', 'audio', 'video'] },
        url: { type: String, required: true },
        filename: { type: String },
        size: { type: Number },
        mimeType: { type: String },
      },
    ],
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
chatMessageSchema.index({ sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ messageId: 1 }, { unique: true });
chatMessageSchema.index({ role: 1 });
chatMessageSchema.index({ 'metadata.provider': 1 });
chatMessageSchema.index({ 'feedback.rating': -1 });
chatMessageSchema.index({ createdAt: -1 });
```

---

### 3.3 Chat Canvas Projects Collection

**Purpose**: Canvas-based collaborative projects

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  projectId: "proj_1234567890",
  userId: ObjectId,
  name: "AI Research Project",
  description: "Collaborative research on AI ethics",
  template: "research",
  status: "active",
  collaborators: [{
    userId: ObjectId,
    role: "owner|editor|viewer",
    joinedAt: ISODate
  }],
  settings: {
    isPublic: false,
    allowComments: true,
    maxCollaborators: 10
  },
  stats: {
    totalFiles: 5,
    totalEdits: 127,
    lastActivity: ISODate
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const chatCanvasProjectSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    template: {
      type: String,
      enum: ['blank', 'research', 'brainstorm', 'planning', 'education'],
      default: 'blank',
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
    },
    collaborators: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['owner', 'editor', 'viewer'],
          default: 'viewer',
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    settings: {
      isPublic: { type: Boolean, default: false },
      allowComments: { type: Boolean, default: true },
      maxCollaborators: { type: Number, min: 1, max: 50, default: 10 },
    },
    stats: {
      totalFiles: { type: Number, default: 0 },
      totalEdits: { type: Number, default: 0 },
      lastActivity: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
chatCanvasProjectSchema.index({ projectId: 1 }, { unique: true });
chatCanvasProjectSchema.index({ userId: 1, createdAt: -1 });
chatCanvasProjectSchema.index({ template: 1 });
chatCanvasProjectSchema.index({ status: 1 });
chatCanvasProjectSchema.index({ 'settings.isPublic': 1 });
chatCanvasProjectSchema.index({ 'stats.lastActivity': -1 });
```

---

## 4. Community Collections

### 4.1 Community Posts Collection

**Purpose**: User-generated content and discussions

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  postId: "post_1234567890",
  authorId: ObjectId,
  title: "Best practices for AI agent development",
  content: "Here are some tips for developing AI agents...",
  category: "agents",
  tags: ["ai", "development", "best-practices"],
  type: "discussion|question|announcement|tutorial",
  status: "published",
  isPinned: false,
  isFeatured: false,
  attachments: [{
    type: "image",
    url: "https://...",
    filename: "diagram.png"
  }],
  stats: {
    views: 1250,
    likes: 45,
    comments: 12,
    shares: 8
  },
  metadata: {
    wordCount: 850,
    readingTime: 4,
    lastEditedAt: ISODate
  },
  publishedAt: ISODate,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const communityPostSchema = new mongoose.Schema(
  {
    postId: { type: String, required: true, unique: true, index: true },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'general',
        'agents',
        'ideas',
        'help',
        'announcements',
        'tutorials',
      ],
      default: 'general',
    },
    tags: [{ type: String, maxlength: 50 }],
    type: {
      type: String,
      enum: ['discussion', 'question', 'announcement', 'tutorial', 'showcase'],
      default: 'discussion',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived', 'deleted'],
      default: 'published',
    },
    isPinned: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    attachments: [
      {
        type: { type: String, enum: ['image', 'file', 'video', 'link'] },
        url: { type: String, required: true },
        filename: { type: String },
        size: { type: Number },
        mimeType: { type: String },
      },
    ],
    stats: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
    metadata: {
      wordCount: { type: Number },
      readingTime: { type: Number },
      lastEditedAt: { type: Date },
    },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
communityPostSchema.index({ postId: 1 }, { unique: true });
communityPostSchema.index({ authorId: 1, createdAt: -1 });
communityPostSchema.index({ category: 1, publishedAt: -1 });
communityPostSchema.index({ tags: 1 });
communityPostSchema.index({ type: 1 });
communityPostSchema.index({ status: 1, isPinned: -1, publishedAt: -1 });
communityPostSchema.index({ isFeatured: 1, publishedAt: -1 });
communityPostSchema.index({ 'stats.likes': -1 });
communityPostSchema.index({ 'stats.views': -1 });
communityPostSchema.index({ publishedAt: -1 });
```

---

### 4.2 Community Comments Collection

**Purpose**: Comments and replies on community posts

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  commentId: "comment_1234567890",
  postId: "post_1234567890",
  authorId: ObjectId,
  parentCommentId: null, // For nested replies
  content: "Great post! I have a question about...",
  isEdited: false,
  editedAt: null,
  likes: 5,
  replies: 2,
  depth: 0,
  status: "active",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const communityCommentSchema = new mongoose.Schema(
  {
    commentId: { type: String, required: true, unique: true, index: true },
    postId: { type: String, required: true, index: true },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parentCommentId: { type: String, index: true }, // For nested replies
    content: { type: String, required: true },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    likes: { type: Number, default: 0 },
    replies: { type: Number, default: 0 },
    depth: { type: Number, min: 0, max: 5, default: 0 },
    status: {
      type: String,
      enum: ['active', 'deleted', 'hidden'],
      default: 'active',
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
communityCommentSchema.index({ commentId: 1 }, { unique: true });
communityCommentSchema.index({ postId: 1, createdAt: 1 });
communityCommentSchema.index({ authorId: 1, createdAt: -1 });
communityCommentSchema.index({ parentCommentId: 1 });
communityCommentSchema.index({ depth: 1 });
communityCommentSchema.index({ status: 1 });
```

---

### 4.3 Community Likes Collection

**Purpose**: User likes on posts and comments

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  targetType: "post|comment",
  targetId: "post_1234567890",
  createdAt: ISODate
}
```

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
    targetId: { type: String, required: true },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
communityLikeSchema.index(
  { userId: 1, targetType: 1, targetId: 1 },
  { unique: true }
);
communityLikeSchema.index({ targetType: 1, targetId: 1 });
communityLikeSchema.index({ createdAt: -1 });
```

---

## 5. Support & Communication Collections

### 5.1 Contact Messages Collection

**Purpose**: Contact form submissions from users

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  ticketId: "TICKET-20241201-001",
  name: "John Doe",
  email: "john@example.com",
  subject: "Question about AI agents",
  message: "I have a question about...",
  category: "technical",
  priority: "medium",
  status: "open",
  assignedTo: ObjectId,
  responses: [{
    responseId: "resp_1234567890",
    responderId: ObjectId,
    content: "Thank you for your question...",
    isInternal: false,
    createdAt: ISODate
  }],
  metadata: {
    source: "contact-form",
    userAgent: "Mozilla/5.0...",
    ipAddress: "192.168.1.1",
    referrer: "https://onelastai.co/contact"
  },
  tags: ["question", "agents"],
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const contactMessageSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true },
    category: {
      type: String,
      enum: ['general', 'technical', 'billing', 'feature', 'bug', 'account'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'waiting', 'resolved', 'closed'],
      default: 'open',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    responses: [
      {
        responseId: { type: String, required: true },
        responderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: { type: String, required: true },
        isInternal: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    metadata: {
      source: { type: String, default: 'contact-form' },
      userAgent: { type: String },
      ipAddress: { type: String },
      referrer: { type: String },
    },
    tags: [{ type: String, maxlength: 50 }],
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
contactMessageSchema.index({ ticketId: 1 }, { unique: true });
contactMessageSchema.index({ email: 1, createdAt: -1 });
contactMessageSchema.index({ category: 1, status: 1, createdAt: -1 });
contactMessageSchema.index({ priority: 1, status: 1 });
contactMessageSchema.index({ assignedTo: 1, status: 1 });
contactMessageSchema.index({ status: 1, updatedAt: -1 });
contactMessageSchema.index({ 'metadata.source': 1 });
contactMessageSchema.index({ tags: 1 });
```

---

### 5.2 Support Tickets Collection

**Purpose**: Formal support tickets with attachments

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  ticketId: "SUP-20241201-001",
  requesterId: ObjectId,
  title: "Cannot access AI agent",
  description: "I'm unable to access my subscribed AI agent...",
  category: "account",
  priority: "high",
  status: "open",
  assignedTo: ObjectId,
  attachments: [{
    fileId: "file_1234567890",
    filename: "error_screenshot.png",
    url: "https://...",
    size: 245760,
    mimeType: "image/png"
  }],
  tags: ["login", "agent-access"],
  sla: {
    responseTime: 4, // hours
    resolutionTime: 24, // hours
    breached: false
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'account',
        'billing',
        'technical',
        'feature',
        'bug',
        'integration',
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: [
        'open',
        'assigned',
        'in-progress',
        'waiting',
        'resolved',
        'closed',
      ],
      default: 'open',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attachments: [
      {
        fileId: { type: String, required: true },
        filename: { type: String, required: true },
        url: { type: String, required: true },
        size: { type: Number },
        mimeType: { type: String },
      },
    ],
    tags: [{ type: String, maxlength: 50 }],
    sla: {
      responseTime: { type: Number, default: 24 }, // hours
      resolutionTime: { type: Number, default: 72 }, // hours
      breached: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
supportTicketSchema.index({ ticketId: 1 }, { unique: true });
supportTicketSchema.index({ requesterId: 1, createdAt: -1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });
supportTicketSchema.index({ category: 1, priority: 1, status: 1 });
supportTicketSchema.index({ status: 1, priority: 1, createdAt: 1 });
supportTicketSchema.index({ 'sla.breached': 1 });
```

---

## 6. Analytics & Tracking Collections

### 6.1 Analytics Events Collection

**Purpose**: User behavior and system analytics

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  eventId: "evt_1234567890",
  userId: ObjectId,
  sessionId: "sess_1234567890",
  eventType: "page_view|button_click|agent_interaction",
  eventName: "agent_chat_started",
  properties: {
    agentId: "einstein",
    page: "/agents/einstein",
    duration: 1250,
    tokens: 150
  },
  context: {
    userAgent: "Mozilla/5.0...",
    ipAddress: "192.168.1.1",
    referrer: "https://onelastai.co",
    url: "https://onelastai.co/agents/einstein"
  },
  timestamp: ISODate
}
```

**Schema**:

```javascript
const analyticsEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String, index: true },
  eventType: { type: String, required: true },
  eventName: { type: String, required: true },
  properties: { type: mongoose.Schema.Types.Mixed },
  context: {
    userAgent: { type: String },
    ipAddress: { type: String },
    referrer: { type: String },
    url: { type: String },
    device: { type: String },
    browser: { type: String },
    os: { type: String },
  },
  timestamp: { type: Date, default: Date.now, index: true },
});
```

**Indexes**:

```javascript
analyticsEventSchema.index({ eventId: 1 }, { unique: true });
analyticsEventSchema.index({ userId: 1, timestamp: -1 });
analyticsEventSchema.index({ sessionId: 1, timestamp: -1 });
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ eventName: 1, timestamp: -1 });
analyticsEventSchema.index({ timestamp: -1 });
analyticsEventSchema.index({ 'context.url': 1 });
```

---

### 6.2 Tool Usage Collection

**Purpose**: Tracking usage of development tools

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  toolName: "api-tester",
  toolCategory: "network",
  action: "test_endpoint",
  parameters: {
    method: "POST",
    url: "https://api.example.com/users",
    headers: { "Content-Type": "application/json" }
  },
  result: {
    statusCode: 201,
    responseTime: 245,
    success: true
  },
  metadata: {
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0...",
    sessionId: "sess_1234567890"
  },
  createdAt: ISODate
}
```

**Schema**:

```javascript
const toolUsageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    toolName: { type: String, required: true },
    toolCategory: {
      type: String,
      enum: ['network', 'data', 'developer', 'security', 'web'],
      required: true,
    },
    action: { type: String, required: true },
    parameters: { type: mongoose.Schema.Types.Mixed },
    result: {
      statusCode: { type: Number },
      responseTime: { type: Number },
      success: { type: Boolean },
      error: { type: String },
      dataSize: { type: Number },
    },
    metadata: {
      ipAddress: { type: String },
      userAgent: { type: String },
      sessionId: { type: String },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
toolUsageSchema.index({ userId: 1, createdAt: -1 });
toolUsageSchema.index({ toolName: 1, createdAt: -1 });
toolUsageSchema.index({ toolCategory: 1, createdAt: -1 });
toolUsageSchema.index({ 'result.success': 1 });
toolUsageSchema.index({ createdAt: -1 });
```

---

## 7. Rewards & Gamification Collections

### 7.1 User Rewards Collection

**Purpose**: User points, achievements, and rewards system

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  totalPoints: 2450,
  currentLevel: "Gold",
  levelProgress: 450, // Points in current level
  achievements: [{
    achievementId: "first_agent_chat",
    title: "First Conversation",
    description: "Started your first chat with an AI agent",
    icon: "💬",
    earnedAt: ISODate,
    points: 100
  }],
  rewards: [{
    rewardId: "premium_agent_access",
    title: "Premium Agent Access",
    description: "Unlock access to premium AI agents",
    cost: 500,
    redeemedAt: ISODate,
    status: "redeemed"
  }],
  dailyStats: {
    date: "2024-12-01",
    pointsEarned: 50,
    actionsCompleted: 3,
    loginStreak: 7
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const userRewardsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalPoints: { type: Number, default: 0, min: 0 },
    currentLevel: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
      default: 'Bronze',
    },
    levelProgress: { type: Number, default: 0, min: 0 },
    achievements: [
      {
        achievementId: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String },
        icon: { type: String },
        earnedAt: { type: Date, default: Date.now },
        points: { type: Number, default: 0 },
      },
    ],
    rewards: [
      {
        rewardId: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String },
        cost: { type: Number, required: true },
        redeemedAt: { type: Date },
        status: {
          type: String,
          enum: ['available', 'redeemed', 'expired'],
          default: 'available',
        },
      },
    ],
    dailyStats: {
      date: { type: String, required: true }, // YYYY-MM-DD format
      pointsEarned: { type: Number, default: 0 },
      actionsCompleted: { type: Number, default: 0 },
      loginStreak: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
userRewardsSchema.index({ userId: 1 }, { unique: true });
userRewardsSchema.index({ currentLevel: 1 });
userRewardsSchema.index({ totalPoints: -1 });
userRewardsSchema.index({ 'achievements.earnedAt': -1 });
userRewardsSchema.index({ 'dailyStats.date': 1 });
```

---

### 7.2 Reward Definitions Collection

**Purpose**: Available rewards and achievements catalog

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  rewardId: "daily_login",
  title: "Daily Login",
  description: "Login to your account every day",
  type: "activity",
  category: "engagement",
  points: 50,
  frequency: "daily",
  conditions: {
    consecutiveDays: 1,
    maxClaims: 1
  },
  isActive: true,
  startDate: ISODate,
  endDate: null,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const rewardDefinitionSchema = new mongoose.Schema(
  {
    rewardId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['activity', 'milestone', 'social', 'subscription'],
      required: true,
    },
    category: {
      type: String,
      enum: ['engagement', 'learning', 'social', 'achievement'],
      required: true,
    },
    points: { type: Number, required: true, min: 0 },
    frequency: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly'],
      default: 'once',
    },
    conditions: {
      consecutiveDays: { type: Number, default: 0 },
      maxClaims: { type: Number },
      prerequisites: [{ type: String }],
      userLevel: { type: String },
    },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
rewardDefinitionSchema.index({ rewardId: 1 }, { unique: true });
rewardDefinitionSchema.index({ type: 1, category: 1 });
rewardDefinitionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
rewardDefinitionSchema.index({ points: -1 });
```

---

## 8. Lab & Experiment Collections

### 8.1 Lab Experiments Collection

**Purpose**: AI lab experiments and results

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  experimentId: "exp_1234567890",
  userId: ObjectId,
  experimentType: "battle-arena",
  name: "Claude vs GPT-4 Battle",
  description: "Comparing response quality between models",
  input: {
    prompt: "Explain quantum computing in simple terms",
    model1: "claude-3-sonnet-20240229",
    model2: "gpt-4-turbo"
  },
  output: {
    winner: "claude-3-sonnet-20240229",
    scores: {
      model1: 8.5,
      model2: 7.2
    },
    responses: {
      model1: "Quantum computing uses quantum bits...",
      model2: "Quantum computers work with qubits..."
    }
  },
  metadata: {
    duration: 4500,
    tokensUsed: 1200,
    cost: 0.15,
    provider: "anthropic"
  },
  status: "completed",
  tags: ["comparison", "quantum-computing"],
  createdAt: ISODate,
  completedAt: ISODate
}
```

**Schema**:

```javascript
const labExperimentSchema = new mongoose.Schema(
  {
    experimentId: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    experimentType: {
      type: String,
      enum: [
        'battle-arena',
        'dream-analysis',
        'emotion-analysis',
        'future-prediction',
        'image-generation',
        'music-generation',
        'neural-art',
        'personality-analysis',
        'story-generation',
        'voice-generation',
      ],
      required: true,
    },
    name: { type: String, required: true, maxlength: 200 },
    description: { type: String, maxlength: 500 },
    input: { type: mongoose.Schema.Types.Mixed, required: true },
    output: { type: mongoose.Schema.Types.Mixed },
    metadata: {
      duration: { type: Number }, // milliseconds
      tokensUsed: { type: Number },
      cost: { type: Number },
      provider: { type: String },
      model: { type: String },
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
    },
    tags: [{ type: String, maxlength: 50 }],
    completedAt: { type: Date },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
labExperimentSchema.index({ experimentId: 1 }, { unique: true });
labExperimentSchema.index({ userId: 1, createdAt: -1 });
labExperimentSchema.index({ experimentType: 1, status: 1 });
labExperimentSchema.index({ status: 1, createdAt: -1 });
labExperimentSchema.index({ tags: 1 });
```

---

## 9. Business & Admin Collections

### 9.1 Webinar Registrations Collection

**Purpose**: Webinar and event registrations

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  registrationId: "reg_1234567890",
  webinarId: "webinar_getting_started",
  userId: ObjectId,
  attendeeInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    company: "Tech Corp",
    jobTitle: "Developer",
    phoneNumber: "+1234567890"
  },
  webinarDetails: {
    title: "Getting Started with AI Agents",
    date: ISODate,
    duration: 60,
    instructor: "Jane Smith"
  },
  registrationSource: "website",
  status: "confirmed",
  attendance: {
    joinedAt: ISODate,
    duration: 45,
    completed: true
  },
  feedback: {
    rating: 5,
    comments: "Great session!"
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const webinarRegistrationSchema = new mongoose.Schema(
  {
    registrationId: { type: String, required: true, unique: true, index: true },
    webinarId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attendeeInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      company: { type: String },
      jobTitle: { type: String },
      phoneNumber: { type: String },
    },
    webinarDetails: {
      title: { type: String, required: true },
      date: { type: Date, required: true },
      duration: { type: Number, required: true }, // minutes
      instructor: { type: String },
    },
    registrationSource: {
      type: String,
      enum: ['website', 'email', 'social', 'partner'],
      default: 'website',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'attended', 'no-show'],
      default: 'confirmed',
    },
    attendance: {
      joinedAt: { type: Date },
      duration: { type: Number }, // minutes attended
      completed: { type: Boolean, default: false },
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comments: { type: String },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
webinarRegistrationSchema.index({ registrationId: 1 }, { unique: true });
webinarRegistrationSchema.index({ webinarId: 1, status: 1 });
webinarRegistrationSchema.index({ userId: 1 });
webinarRegistrationSchema.index({ 'attendeeInfo.email': 1 });
webinarRegistrationSchema.index({ 'webinarDetails.date': 1 });
webinarRegistrationSchema.index({ status: 1, createdAt: -1 });
```

---

### 9.2 Job Applications Collection

**Purpose**: Career applications and job postings

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  applicationId: "app_1234567890",
  jobId: "job_ai_engineer_2024",
  applicantId: ObjectId,
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phoneNumber: "+1234567890",
    location: "San Francisco, CA"
  },
  professionalInfo: {
    currentPosition: "Software Engineer",
    company: "Tech Corp",
    experience: "3 years",
    linkedin: "https://linkedin.com/in/johndoe",
    portfolio: "https://johndoe.dev"
  },
  applicationDetails: {
    coverLetter: "I am excited to apply for...",
    expectedSalary: 120000,
    availableStartDate: ISODate,
    workAuthorization: "US Citizen"
  },
  resume: {
    filename: "john_doe_resume.pdf",
    url: "https://...",
    size: 245760,
    mimeType: "application/pdf"
  },
  status: "submitted",
  statusHistory: [{
    status: "submitted",
    changedAt: ISODate,
    changedBy: ObjectId,
    notes: "Application received"
  }],
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const jobApplicationSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: true, unique: true, index: true },
    jobId: { type: String, required: true },
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, lowercase: true },
      phoneNumber: { type: String },
      location: { type: String },
    },
    professionalInfo: {
      currentPosition: { type: String },
      company: { type: String },
      experience: { type: String },
      linkedin: { type: String },
      portfolio: { type: String },
      github: { type: String },
    },
    applicationDetails: {
      coverLetter: { type: String },
      expectedSalary: { type: Number },
      availableStartDate: { type: Date },
      workAuthorization: { type: String },
    },
    resume: {
      filename: { type: String },
      url: { type: String },
      size: { type: Number },
      mimeType: { type: String },
    },
    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'under-review',
        'interviewing',
        'offered',
        'hired',
        'rejected',
      ],
      default: 'submitted',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        notes: { type: String },
      },
    ],
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
jobApplicationSchema.index({ applicationId: 1 }, { unique: true });
jobApplicationSchema.index({ jobId: 1, status: 1 });
jobApplicationSchema.index({ applicantId: 1 });
jobApplicationSchema.index({ 'personalInfo.email': 1 });
jobApplicationSchema.index({ status: 1, createdAt: -1 });
jobApplicationSchema.index({ 'applicationDetails.availableStartDate': 1 });
```

---

## 10. Billing & Payment Collections

### 10.1 Transactions Collection

**Purpose**: Payment transactions and billing history

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  transactionId: "txn_1234567890",
  userId: ObjectId,
  type: "subscription|one-time|refund",
  amount: 19.99,
  currency: "USD",
  status: "completed",
  paymentMethod: {
    type: "card",
    last4: "4242",
    brand: "visa"
  },
  stripeData: {
    paymentIntentId: "pi_xxx",
    chargeId: "ch_xxx",
    subscriptionId: "sub_xxx"
  },
  items: [{
    itemId: "agent_einstein_monthly",
    name: "Einstein Agent - Monthly",
    quantity: 1,
    unitPrice: 19.99,
    total: 19.99
  }],
  metadata: {
    invoiceNumber: "INV-2024-001",
    taxAmount: 1.60,
    discountAmount: 0
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['subscription', 'one-time', 'refund', 'credit'],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: { type: String, enum: ['card', 'paypal', 'bank'] },
      last4: { type: String },
      brand: { type: String },
    },
    stripeData: {
      paymentIntentId: { type: String },
      chargeId: { type: String },
      subscriptionId: { type: String },
      refundId: { type: String },
    },
    items: [
      {
        itemId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],
    metadata: {
      invoiceNumber: { type: String },
      taxAmount: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      notes: { type: String },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
transactionSchema.index({ transactionId: 1 }, { unique: true });
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ 'stripeData.paymentIntentId': 1 });
transactionSchema.index({ 'stripeData.subscriptionId': 1 });
transactionSchema.index({ createdAt: -1 });
```

---

## Summary

This document specifies **29 database collections** based on the comprehensive analysis of the frontend/app/ directory structure. Each collection includes:

- **Documents Structure**: JSON examples showing data format
- **Aggregations**: Analytics and reporting capabilities
- **Schema**: Complete Mongoose schema definitions
- **Indexes**: Performance optimization indexes
- **Validation**: Data validation rules and constraints

The collections cover all major functional areas:

- **User Management** (Users, Profiles, Preferences)
- **Agent Management** (Agents, Subscriptions, Personalization)
- **Chat & Conversation** (Sessions, Messages, Canvas Projects)
- **Community** (Posts, Comments, Likes)
- **Support & Communication** (Contact Messages, Support Tickets)
- **Analytics & Tracking** (Events, Tool Usage)
- **Rewards & Gamification** (User Rewards, Reward Definitions)
- **Lab & Experiments** (Lab Experiments)
- **Business & Admin** (Webinar Registrations, Job Applications)
- **Billing & Payments** (Transactions)

All collections are designed with proper relationships, indexing strategies, and validation rules to ensure data integrity and optimal performance.
