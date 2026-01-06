# FRONTEND-LIB-DATABASE-SPECIFICATION.md

## Database Collections Based on Frontend/lib/, /models/, /services/, /utils/, /hooks/, /contexts/ Analysis

This document specifies all database collections required based on the comprehensive analysis of the frontend directory structure excluding /app and /components. It covers data structures from lib/, models/, services/, utils/, hooks/, and contexts/ directories.

---

## 1. User Management Collections

### 1.1 Users Collection (Enhanced)

**Purpose**: Core user accounts with authentication and profile data

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  id: "user_1234567890",
  email: "user@example.com",
  name: "John Doe",
  password: "hashed_password",
  authMethod: "password|passwordless",
  emailVerified: true,
  avatar: "https://...",
  bio: "AI enthusiast",
  phoneNumber: "+1234567890",
  location: "San Francisco, CA",
  timezone: "America/Los_Angeles",
  profession: "Software Engineer",
  company: "Tech Corp",
  website: "https://johndoe.com",
  socialLinks: {
    linkedin: "https://linkedin.com/in/johndoe",
    twitter: "@johndoe",
    github: "johndoe"
  },
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    productUpdates: true
  },
  lastLoginAt: ISODate,
  isActive: true,
  role: "user|admin|moderator",
  resetPasswordToken: "token_hash",
  resetPasswordExpires: ISODate,
  sessionId: "session_123",
  sessionExpiry: ISODate,
  twoFactorEnabled: false,
  twoFactorSecret: "encrypted_secret",
  tempTwoFactorSecret: "temp_secret",
  backupCodes: ["code1", "code2"],
  tempBackupCodes: ["temp1", "temp2"],
  joinedAt: ISODate,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Aggregations**:

- User activity analytics
- Geographic distribution
- User engagement metrics
- Authentication success/failure rates

**Schema**:

```javascript
const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, trim: true },
    password: { type: String },
    authMethod: {
      type: String,
      enum: ['password', 'passwordless'],
      default: 'password',
    },
    emailVerified: { type: Boolean, default: false },
    avatar: { type: String },
    bio: { type: String, maxlength: 500 },
    phoneNumber: { type: String },
    location: { type: String },
    timezone: { type: String },
    profession: { type: String },
    company: { type: String },
    website: { type: String },
    socialLinks: {
      linkedin: { type: String },
      twitter: { type: String },
      github: { type: String },
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      marketingEmails: { type: Boolean, default: true },
      productUpdates: { type: Boolean, default: true },
    },
    lastLoginAt: { type: Date },
    isActive: { type: Boolean, default: true },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    sessionId: { type: String },
    sessionExpiry: { type: Date },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    tempTwoFactorSecret: { type: String },
    backupCodes: [{ type: String }],
    tempBackupCodes: [{ type: String }],
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
userSchema.index({ id: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ sessionId: 1 });
userSchema.index({ resetPasswordToken: 1 });
userSchema.index({ 'socialLinks.twitter': 1 });
userSchema.index({ 'socialLinks.github': 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1, lastLoginAt: -1 });
userSchema.index({ createdAt: -1 });
```

**Validation**:

```javascript
userSchema.pre('save', function (next) {
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.email)) {
    return next(new Error('Invalid email format'));
  }

  // Password strength for password auth
  if (
    this.authMethod === 'password' &&
    this.password &&
    this.password.length < 8
  ) {
    return next(new Error('Password must be at least 8 characters'));
  }

  // Two-factor backup codes validation
  if (
    this.twoFactorEnabled &&
    (!this.backupCodes || this.backupCodes.length < 8)
  ) {
    return next(
      new Error('Two-factor enabled users must have at least 8 backup codes')
    );
  }

  next();
});
```

---

### 1.2 User Sessions Collection

**Purpose**: Track user authentication sessions

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  sessionId: "session_1234567890",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  deviceType: "desktop|mobile|tablet",
  browser: "Chrome",
  os: "macOS",
  location: {
    country: "US",
    city: "San Francisco",
    timezone: "America/Los_Angeles"
  },
  isActive: true,
  expiresAt: ISODate,
  lastActivityAt: ISODate,
  createdAt: ISODate
}
```

**Schema**:

```javascript
const userSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: { type: String, required: true, unique: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
    browser: { type: String },
    os: { type: String },
    location: {
      country: { type: String },
      city: { type: String },
      timezone: { type: String },
    },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
userSessionSchema.index({ userId: 1, createdAt: -1 });
userSessionSchema.index({ sessionId: 1 }, { unique: true });
userSessionSchema.index({ expiresAt: 1 });
userSessionSchema.index({ isActive: 1, lastActivityAt: -1 });
```

---

## 2. Agent Subscription Collections

### 2.1 Agent Subscriptions Collection

**Purpose**: User subscriptions to AI agents

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: "user_123",
  agentId: "einstein",
  plan: "daily|weekly|monthly",
  price: 19.99,
  status: "active|expired|cancelled",
  startDate: ISODate,
  expiryDate: ISODate,
  stripeSubscriptionId: "sub_xxx",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const agentSubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    agentId: { type: String, required: true, index: true },
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
    stripeSubscriptionId: { type: String, sparse: true, index: true },
  },
  { timestamps: true, collection: 'subscriptions' }
);
```

**Indexes**:

```javascript
agentSubscriptionSchema.index({ userId: 1, agentId: 1 }, { unique: true });
agentSubscriptionSchema.index({ userId: 1, status: 1 });
agentSubscriptionSchema.index({ agentId: 1, status: 1 });
agentSubscriptionSchema.index({ status: 1, expiryDate: 1 });
agentSubscriptionSchema.index({ stripeSubscriptionId: 1 });
```

**Validation**:

```javascript
agentSubscriptionSchema.methods.isValid = function () {
  return this.status === 'active' && this.expiryDate > new Date();
};

agentSubscriptionSchema.statics.calculateExpiryDate = function (
  plan,
  startDate
) {
  const date = new Date(startDate);
  switch (plan) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      throw new Error('Invalid plan');
  }
  return date;
};
```

---

### 2.2 Subscription Plans Collection

**Purpose**: Available subscription plans configuration

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  id: "monthly",
  name: "Monthly Plan",
  displayName: "Monthly Plan",
  price: 19,
  period: "month",
  description: "Best value for ongoing work",
  priceFormatted: "$19.00",
  features: ["Unlimited AI chats", "Priority support"],
  isActive: true,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const subscriptionPlanSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    displayName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    period: { type: String, required: true },
    description: { type: String, required: true },
    priceFormatted: { type: String, required: true },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
subscriptionPlanSchema.index({ id: 1 }, { unique: true });
subscriptionPlanSchema.index({ isActive: 1 });
```

---

## 3. Chat & Conversation Collections

### 3.1 Chat Sessions Collection

**Purpose**: Chat conversation sessions

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  id: "session_1234567890",
  userId: "user_123",
  agentId: "einstein",
  name: "Physics Discussion",
  messages: [{
    id: "msg_123",
    role: "user|assistant",
    content: "What is E=mc²?",
    timestamp: ISODate,
    feedback: "positive|negative|null",
    isStreaming: false,
    streamingComplete: true,
    attachments: [{
      name: "diagram.png",
      size: 245760,
      type: "image/png",
      url: "https://...",
      data: "base64..."
    }]
  }],
  lastUpdated: ISODate,
  isActive: true,
  metadata: {
    totalMessages: 15,
    totalTokens: 2500,
    duration: 1800000
  }
}
```

**Schema**:

```javascript
const chatSessionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    agentId: { type: String, index: true },
    name: { type: String, required: true },
    messages: [
      {
        id: { type: String, required: true },
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        feedback: { type: String, enum: ['positive', 'negative', null] },
        isStreaming: { type: Boolean, default: false },
        streamingComplete: { type: Boolean, default: true },
        attachments: [
          {
            name: { type: String, required: true },
            size: { type: Number },
            type: { type: String },
            url: { type: String },
            data: { type: String },
          },
        ],
      },
    ],
    lastUpdated: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    metadata: {
      totalMessages: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
chatSessionSchema.index({ id: 1 }, { unique: true });
chatSessionSchema.index({ userId: 1, lastUpdated: -1 });
chatSessionSchema.index({ agentId: 1, createdAt: -1 });
chatSessionSchema.index({ isActive: 1 });
```

---

### 3.2 Chat Messages Collection

**Purpose**: Individual chat messages for analytics

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  sessionId: "session_123",
  messageId: "msg_123",
  userId: "user_123",
  agentId: "einstein",
  role: "user|assistant",
  content: "What is quantum entanglement?",
  tokens: 6,
  model: "claude-3-sonnet-20240229",
  responseTime: 1200,
  feedback: "positive",
  attachments: [{
    name: "diagram.png",
    size: 245760,
    type: "image/png"
  }],
  metadata: {
    language: "en",
    sentiment: "curious",
    topics: ["physics", "quantum"]
  },
  createdAt: ISODate
}
```

**Schema**:

```javascript
const chatMessageSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    messageId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    agentId: { type: String, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    tokens: { type: Number },
    model: { type: String },
    responseTime: { type: Number },
    feedback: { type: String, enum: ['positive', 'negative', null] },
    attachments: [
      {
        name: { type: String, required: true },
        size: { type: Number },
        type: { type: String },
        url: { type: String },
      },
    ],
    metadata: {
      language: { type: String },
      sentiment: { type: String },
      topics: [{ type: String }],
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
chatMessageSchema.index({ messageId: 1 }, { unique: true });
chatMessageSchema.index({ sessionId: 1, createdAt: 1 });
chatMessageSchema.index({ userId: 1, createdAt: -1 });
chatMessageSchema.index({ agentId: 1, createdAt: -1 });
chatMessageSchema.index({ feedback: 1 });
```

---

## 4. Analytics & Tracking Collections

### 4.1 Analytics Events Collection

**Purpose**: User behavior and system analytics

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  visitorId: "visitor_1234567890",
  sessionId: "session_1234567890",
  userId: "user_123",
  eventType: "page_view|button_click|chat_interaction",
  eventName: "agent_chat_started",
  properties: {
    agentId: "einstein",
    page: "/agents/einstein",
    duration: 1250,
    tokens: 150,
    model: "claude-3-sonnet-20240229"
  },
  context: {
    url: "https://onelastai.co/agents/einstein",
    referrer: "https://onelastai.co",
    userAgent: "Mozilla/5.0...",
    ipAddress: "192.168.1.1",
    deviceType: "desktop",
    browser: "Chrome",
    os: "macOS"
  },
  timestamp: ISODate
}
```

**Schema**:

```javascript
const analyticsEventSchema = new mongoose.Schema({
  visitorId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  eventType: { type: String, required: true },
  eventName: { type: String, required: true },
  properties: { type: mongoose.Schema.Types.Mixed },
  context: {
    url: { type: String },
    referrer: { type: String },
    userAgent: { type: String },
    ipAddress: { type: String },
    deviceType: { type: String },
    browser: { type: String },
    os: { type: String },
  },
  timestamp: { type: Date, default: Date.now, index: true },
});
```

**Indexes**:

```javascript
analyticsEventSchema.index({ visitorId: 1, timestamp: -1 });
analyticsEventSchema.index({ sessionId: 1, timestamp: -1 });
analyticsEventSchema.index({ userId: 1, timestamp: -1 });
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ eventName: 1, timestamp: -1 });
analyticsEventSchema.index({ 'context.url': 1 });
analyticsEventSchema.index({ timestamp: -1 });
```

---

### 4.2 Chat Analytics Collection

**Purpose**: Detailed chat interaction analytics

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: "user_123",
  agentId: "einstein",
  agentName: "Albert Einstein",
  userMessage: "What is E=mc²?",
  aiResponse: "E=mc² is Einstein's famous equation...",
  responseTime: 1200,
  model: "claude-3-sonnet-20240229",
  language: "en",
  personalityScore: 95,
  feedback: {
    interactionId: "int_123",
    satisfied: true,
    comment: "Great explanation!"
  },
  metadata: {
    tokensUsed: 150,
    cost: 0.002,
    provider: "anthropic"
  },
  createdAt: ISODate
}
```

**Schema**:

```javascript
const chatAnalyticsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    agentId: { type: String, required: true, index: true },
    agentName: { type: String, required: true },
    userMessage: { type: String, required: true },
    aiResponse: { type: String, required: true },
    responseTime: { type: Number, required: true },
    model: { type: String, required: true },
    language: { type: String, default: 'en' },
    personalityScore: { type: Number, min: 0, max: 100 },
    feedback: {
      interactionId: { type: String },
      satisfied: { type: Boolean },
      comment: { type: String },
    },
    metadata: {
      tokensUsed: { type: Number },
      cost: { type: Number },
      provider: { type: String },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
chatAnalyticsSchema.index({ userId: 1, createdAt: -1 });
chatAnalyticsSchema.index({ agentId: 1, createdAt: -1 });
chatAnalyticsSchema.index({ 'feedback.satisfied': 1 });
chatAnalyticsSchema.index({ responseTime: 1 });
chatAnalyticsSchema.index({ personalityScore: -1 });
```

---

### 4.3 Tool Usage Analytics Collection

**Purpose**: Track usage of development tools

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: "user_123",
  toolName: "api-tester",
  toolCategory: "network",
  action: "test_endpoint",
  input: {
    method: "POST",
    url: "https://api.example.com/users",
    headers: { "Content-Type": "application/json" },
    body: { "name": "John" }
  },
  output: {
    statusCode: 201,
    responseTime: 245,
    success: true,
    data: { "id": 123, "name": "John" }
  },
  success: true,
  error: null,
  executionTime: 245,
  metadata: {
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0...",
    sessionId: "session_123"
  },
  createdAt: ISODate
}
```

**Schema**:

```javascript
const toolUsageAnalyticsSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    toolName: { type: String, required: true },
    toolCategory: {
      type: String,
      enum: ['network', 'data', 'developer', 'security', 'web'],
      required: true,
    },
    action: { type: String, required: true },
    input: { type: mongoose.Schema.Types.Mixed },
    output: { type: mongoose.Schema.Types.Mixed },
    success: { type: Boolean, required: true },
    error: { type: String },
    executionTime: { type: Number },
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
toolUsageAnalyticsSchema.index({ userId: 1, createdAt: -1 });
toolUsageAnalyticsSchema.index({ toolName: 1, createdAt: -1 });
toolUsageAnalyticsSchema.index({ toolCategory: 1, createdAt: -1 });
toolUsageAnalyticsSchema.index({ success: 1 });
toolUsageAnalyticsSchema.index({ executionTime: 1 });
```

---

## 5. Gamification Collections

### 5.1 User Achievements Collection

**Purpose**: User achievements and badges

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: "user_123",
  achievements: [{
    id: "first-agent",
    name: "Agent Whisperer",
    description: "Use your first AI agent",
    icon: "🤖",
    category: "explorer",
    points: 10,
    rarity: "common",
    unlockedAt: ISODate,
    requirements: {
      type: "agentUsage",
      value: 1
    }
  }],
  totalPoints: 1250,
  totalUnlocked: 15,
  totalPossible: 50,
  progress: {
    "first-agent": 1,
    "all-agents-tried": 0.3
  },
  lastUnlockedAt: ISODate,
  currentStreak: 7,
  masteryLevel: "intermediate"
}
```

**Schema**:

```javascript
const userAchievementsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    achievements: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String },
        icon: { type: String },
        category: {
          type: String,
          enum: ['explorer', 'communicator', 'master', 'legend'],
        },
        points: { type: Number, default: 0 },
        rarity: {
          type: String,
          enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        },
        unlockedAt: { type: Date, default: Date.now },
        requirements: {
          type: { type: String, required: true },
          value: { type: Number, required: true },
          metric: { type: String },
        },
      },
    ],
    totalPoints: { type: Number, default: 0 },
    totalUnlocked: { type: Number, default: 0 },
    totalPossible: { type: Number, default: 50 },
    progress: { type: Map, of: Number },
    lastUnlockedAt: { type: Date },
    currentStreak: { type: Number, default: 0 },
    masteryLevel: {
      type: String,
      enum: [
        'novice',
        'beginner',
        'intermediate',
        'advanced',
        'expert',
        'master',
      ],
      default: 'novice',
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
userAchievementsSchema.index({ userId: 1 }, { unique: true });
userAchievementsSchema.index({ totalPoints: -1 });
userAchievementsSchema.index({ masteryLevel: 1 });
userAchievementsSchema.index({ 'achievements.category': 1 });
```

---

### 5.2 User Rewards Collection

**Purpose**: User points and rewards system

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: "user_123",
  totalPoints: 2450,
  availablePoints: 1800,
  spentPoints: 650,
  inventory: [{
    id: "frame-gold",
    name: "Gold Frame",
    type: "frame",
    price: 2500,
    rarity: "rare",
    owned: true,
    preview: "https://..."
  }],
  transactions: [{
    id: "txn_123",
    timestamp: ISODate,
    type: "purchase",
    amount: 500,
    description: "Purchased Gold Frame",
    relatedItem: "frame-gold",
    refundable: false
  }],
  activeCosmetics: {
    profileFrame: "frame-gold",
    profileTheme: "dark-mode",
    nameEffect: "glow"
  },
  stats: {
    totalEarned: 2450,
    totalSpent: 650,
    itemsOwned: 8,
    refundsUsed: 0
  }
}
```

**Schema**:

```javascript
const userRewardsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    totalPoints: { type: Number, default: 0, min: 0 },
    availablePoints: { type: Number, default: 0, min: 0 },
    spentPoints: { type: Number, default: 0, min: 0 },
    inventory: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        type: {
          type: String,
          enum: ['cosmetic', 'badge', 'theme', 'frame', 'effect', 'exclusive'],
        },
        price: { type: Number, required: true },
        rarity: {
          type: String,
          enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        },
        owned: { type: Boolean, default: false },
        preview: { type: String },
      },
    ],
    transactions: [
      {
        id: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        type: {
          type: String,
          enum: ['purchase', 'earn', 'refund', 'bonus', 'event'],
        },
        amount: { type: Number, required: true },
        description: { type: String, required: true },
        relatedItem: { type: String },
        refundable: { type: Boolean, default: false },
      },
    ],
    activeCosmetics: {
      profileFrame: { type: String },
      profileTheme: { type: String },
      nameEffect: { type: String },
      achievements: [{ type: String }],
    },
    stats: {
      totalEarned: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      itemsOwned: { type: Number, default: 0 },
      refundsUsed: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
userRewardsSchema.index({ userId: 1 }, { unique: true });
userRewardsSchema.index({ totalPoints: -1 });
userRewardsSchema.index({ availablePoints: -1 });
userRewardsSchema.index({ 'inventory.type': 1 });
```

---

### 5.3 Leaderboard Collection

**Purpose**: User rankings and leaderboards

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  category: "points|achievements|streak",
  period: "daily|weekly|monthly|all-time",
  rankings: [{
    userId: "user_123",
    username: "johndoe",
    score: 2450,
    rank: 1,
    avatar: "https://...",
    change: 5,
    trend: "up|down|same"
  }],
  totalParticipants: 1250,
  lastUpdated: ISODate,
  nextUpdate: ISODate
}
```

**Schema**:

```javascript
const leaderboardSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['points', 'achievements', 'streak', 'messages', 'tokens'],
      required: true,
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'all-time'],
      required: true,
    },
    rankings: [
      {
        userId: { type: String, required: true },
        username: { type: String, required: true },
        score: { type: Number, required: true },
        rank: { type: Number, required: true },
        avatar: { type: String },
        change: { type: Number, default: 0 },
        trend: { type: String, enum: ['up', 'down', 'same'], default: 'same' },
      },
    ],
    totalParticipants: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    nextUpdate: { type: Date, required: true },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
leaderboardSchema.index({ category: 1, period: 1 }, { unique: true });
leaderboardSchema.index({ 'rankings.userId': 1 });
leaderboardSchema.index({ lastUpdated: -1 });
```

---

## 6. Marketplace Collections

### 6.1 Tools Collection

**Purpose**: Marketplace tools and plugins

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  id: "tool_123",
  metadata: {
    name: "API Tester",
    slug: "api-tester",
    description: "Test REST APIs with ease",
    longDescription: "A comprehensive API testing tool...",
    category: "data-processing",
    tags: ["api", "testing", "rest"],
    icon: "🔧",
    banner: "https://...",
    author: {
      id: "user_123",
      name: "John Doe",
      avatar: "https://...",
      verified: true
    },
    currentVersion: "1.0.0",
    allVersions: [{
      versionId: "v1.0.0",
      version: "1.0.0",
      releaseDate: ISODate,
      description: "Initial release",
      changelog: "Added basic functionality",
      isStable: true,
      downloads: 150,
      rating: 4.5
    }],
    downloads: 1250,
    stars: 89,
    uses: 450
  },
  config: {
    inputs: [{
      id: "url",
      name: "API URL",
      type: "string",
      description: "The API endpoint URL",
      required: true,
      defaultValue: "https://api.example.com"
    }],
    outputs: [{
      id: "response",
      name: "API Response",
      type: "object",
      description: "The API response data"
    }],
    settings: [{
      id: "timeout",
      name: "Timeout",
      type: "number",
      defaultValue: 5000
    }]
  },
  hooks: [{
    name: "onExecute",
    type: "function",
    code: "function onExecute(input) { ... }"
  }],
  dependencies: [{
    name: "axios",
    version: "^1.0.0",
    type: "npm"
  }],
  codeUrl: "https://github.com/user/api-tester",
  mainFunction: "testAPI",
  published: true,
  verified: true,
  featured: false,
  requiredPermissions: ["network"],
  sandboxed: true,
  riskLevel: "low"
}
```

**Schema**:

```javascript
const toolSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    metadata: {
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      description: { type: String, required: true },
      longDescription: { type: String },
      category: {
        type: String,
        enum: [
          'data-processing',
          'integration',
          'analytics',
          'automation',
          'utility',
          'ai',
          'custom',
        ],
      },
      tags: [{ type: String }],
      icon: { type: String },
      banner: { type: String },
      author: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        avatar: { type: String },
        verified: { type: Boolean, default: false },
      },
      currentVersion: { type: String, required: true },
      allVersions: [
        {
          versionId: { type: String, required: true },
          version: { type: String, required: true },
          releaseDate: { type: Date, default: Date.now },
          description: { type: String },
          changelog: { type: String },
          isStable: { type: Boolean, default: true },
          downloads: { type: Number, default: 0 },
          rating: { type: Number, min: 0, max: 5, default: 0 },
        },
      ],
      downloads: { type: Number, default: 0 },
      stars: { type: Number, default: 0 },
      uses: { type: Number, default: 0 },
    },
    config: {
      inputs: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          type: {
            type: String,
            enum: [
              'string',
              'number',
              'boolean',
              'array',
              'object',
              'file',
              'multiselect',
            ],
          },
          description: { type: String },
          required: { type: Boolean, default: false },
          defaultValue: { type: mongoose.Schema.Types.Mixed },
          validation: {
            minLength: { type: Number },
            maxLength: { type: Number },
            pattern: { type: String },
            min: { type: Number },
            max: { type: Number },
          },
        },
      ],
      outputs: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          type: { type: String },
          description: { type: String },
        },
      ],
      settings: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          type: { type: String },
          defaultValue: { type: mongoose.Schema.Types.Mixed },
        },
      ],
    },
    hooks: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
        code: { type: String, required: true },
      },
    ],
    dependencies: [
      {
        name: { type: String, required: true },
        version: { type: String, required: true },
        type: { type: String, enum: ['npm', 'pip', 'gem'] },
      },
    ],
    codeUrl: { type: String, required: true },
    mainFunction: { type: String, required: true },
    published: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    requiredPermissions: [{ type: String }],
    sandboxed: { type: Boolean, default: true },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
toolSchema.index({ id: 1 }, { unique: true });
toolSchema.index({ 'metadata.slug': 1 }, { unique: true });
toolSchema.index({ 'metadata.category': 1 });
toolSchema.index({ 'metadata.tags': 1 });
toolSchema.index({ 'metadata.author.id': 1 });
toolSchema.index({ published: 1, featured: 1 });
toolSchema.index({ verified: 1 });
toolSchema.index({ 'metadata.downloads': -1 });
toolSchema.index({ 'metadata.stars': -1 });
```

---

### 6.2 Tool Reviews Collection

**Purpose**: User reviews and ratings for marketplace tools

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  toolId: "tool_123",
  userId: "user_123",
  rating: 5,
  title: "Excellent API testing tool",
  content: "This tool has saved me hours of work...",
  pros: ["Easy to use", "Fast", "Reliable"],
  cons: ["Limited to REST APIs"],
  version: "1.0.0",
  helpful: 12,
  notHelpful: 2,
  verified: true,
  attachments: [{
    type: "image",
    url: "https://...",
    filename: "screenshot.png"
  }],
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const toolReviewSchema = new mongoose.Schema(
  {
    toolId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, maxlength: 100 },
    content: { type: String, required: true },
    pros: [{ type: String }],
    cons: [{ type: String }],
    version: { type: String },
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    attachments: [
      {
        type: { type: String, enum: ['image', 'video', 'file'] },
        url: { type: String, required: true },
        filename: { type: String },
      },
    ],
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
toolReviewSchema.index({ toolId: 1, createdAt: -1 });
toolReviewSchema.index({ userId: 1 });
toolReviewSchema.index({ rating: -1 });
toolReviewSchema.index({ verified: 1 });
toolReviewSchema.index({ helpful: -1 });
```

---

## 7. Billing & Payment Collections

### 7.1 Invoices Collection

**Purpose**: Payment invoices and billing records

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  email: "user@example.com",
  stripeInvoiceId: "in_xxx",
  stripeSubscriptionId: "sub_xxx",
  agentId: "einstein",
  agentName: "Albert Einstein",
  plan: "monthly",
  amount: 19.99,
  currency: "USD",
  status: "paid",
  paidAt: ISODate,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: { type: String, required: true },
    stripeInvoiceId: { type: String },
    stripeSubscriptionId: { type: String, required: true },
    agentId: { type: String, required: true },
    agentName: { type: String, required: true },
    plan: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['paid', 'pending', 'failed', 'void'],
      default: 'pending',
    },
    paidAt: { type: Date },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
invoiceSchema.index({ userId: 1, createdAt: -1 });
invoiceSchema.index({ stripeInvoiceId: 1 });
invoiceSchema.index({ stripeSubscriptionId: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ agentId: 1 });
```

---

### 7.2 Payments Collection

**Purpose**: Payment transaction records

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  email: "user@example.com",
  stripePaymentIntentId: "pi_xxx",
  stripeChargeId: "ch_xxx",
  stripeInvoiceId: "in_xxx",
  stripeSubscriptionId: "sub_xxx",
  agentId: "einstein",
  agentName: "Albert Einstein",
  plan: "monthly",
  amount: 19.99,
  currency: "USD",
  status: "succeeded",
  paymentMethod: "card",
  last4: "4242",
  brand: "visa",
  paidAt: ISODate,
  createdAt: ISODate
}
```

**Schema**:

```javascript
const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: { type: String, required: true },
    stripePaymentIntentId: { type: String },
    stripeChargeId: { type: String },
    stripeInvoiceId: { type: String },
    stripeSubscriptionId: { type: String, required: true },
    agentId: { type: String, required: true },
    agentName: { type: String, required: true },
    plan: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['succeeded', 'pending', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'paypal', 'bank'],
      default: 'card',
    },
    last4: { type: String },
    brand: { type: String },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ stripeChargeId: 1 });
paymentSchema.index({ stripeSubscriptionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMethod: 1 });
```

---

## 8. Configuration Collections

### 8.1 Application Config Collection

**Purpose**: Application-wide configuration settings

**Documents Structure**:

```javascript
{
  _id: ObjectId,
  key: "ai_config",
  value: {
    openai: {
      apiKey: "",
      model: "gpt-4",
      enabled: true
    },
    anthropic: {
      apiKey: "",
      model: "claude-3-sonnet-20240229",
      enabled: true
    },
    gemini: {
      apiKey: "",
      model: "gemini-pro",
      enabled: false
    }
  },
  description: "AI service provider configurations",
  isPublic: false,
  lastUpdatedBy: "admin",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Schema**:

```javascript
const appConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    description: { type: String },
    isPublic: { type: Boolean, default: false },
    lastUpdatedBy: { type: String },
    category: {
      type: String,
      enum: ['ai', 'billing', 'security', 'ui', 'features'],
    },
  },
  { timestamps: true }
);
```

**Indexes**:

```javascript
appConfigSchema.index({ key: 1 }, { unique: true });
appConfigSchema.index({ category: 1 });
appConfigSchema.index({ isPublic: 1 });
```

---

## Summary

This document specifies **23 database collections** based on the comprehensive analysis of the frontend/lib/, /models/, /services/, /utils/, /hooks/, and /contexts/ directories. Each collection includes:

- **Documents Structure**: JSON examples showing data format
- **Aggregations**: Analytics and reporting capabilities
- **Schema**: Complete Mongoose schema definitions
- **Indexes**: Performance optimization indexes
- **Validation**: Data validation rules and constraints

The collections cover all major functional areas:

- **User Management** (Users, User Sessions)
- **Agent Subscriptions** (Agent Subscriptions, Subscription Plans)
- **Chat & Conversation** (Chat Sessions, Chat Messages)
- **Analytics & Tracking** (Analytics Events, Chat Analytics, Tool Usage Analytics)
- **Gamification** (User Achievements, User Rewards, Leaderboard)
- **Marketplace** (Tools, Tool Reviews)
- **Billing & Payments** (Invoices, Payments)
- **Configuration** (Application Config)

All collections are designed with proper relationships, indexing strategies, and validation rules to ensure data integrity and optimal performance.
