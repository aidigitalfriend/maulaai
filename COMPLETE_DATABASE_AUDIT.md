# Complete MongoDB Database Audit

## Database: `onelastai`

**Total Collections: 28**

---

## 📊 COLLECTION STATUS SUMMARY

| Collection           | Has Data | Schema OK | Indexes | Needs Work                           |
| -------------------- | -------- | --------- | ------- | ------------------------------------ |
| users                | ✅       | ✅        | 8       | ⚠️ Missing `passwordChangedAt` index |
| agents               | ✅       | ✅        | 16      | ✅ Good                              |
| subscriptions        | ✅       | ✅        | 22      | ✅ Good                              |
| sessions             | ✅       | ✅        | 6       | ✅ Good                              |
| visitors             | ✅       | ✅        | 9       | ✅ Good                              |
| pageviews            | ✅       | ✅        | 12      | ✅ Good                              |
| chatinteractions     | ✅       | ✅        | 11      | ✅ Good                              |
| apiusages            | ✅       | ✅        | 17      | ✅ Good                              |
| toolusages           | ✅       | ✅        | -       | ⚠️ Missing indexes                   |
| userevents           | ✅       | ✅        | -       | ⚠️ Missing indexes                   |
| userprofiles         | ❌ Empty | -         | -       | 🔴 Unused                            |
| userpreferences      | ✅       | ✅        | -       | ⚠️ Missing indexes                   |
| usersecurities       | ✅       | ✅        | -       | ⚠️ Missing indexes                   |
| userfavorites        | ❌ Empty | -         | -       | 🔴 Unused                            |
| notifications        | ✅       | ✅        | -       | ⚠️ Missing indexes                   |
| plans                | ✅       | ✅        | -       | ⚠️ Missing indexes                   |
| rewardscenters       | ✅       | ✅        | -       | ⚠️ Missing indexes                   |
| transactions         | ❌ Empty | -         | -       | 🔴 Unused                            |
| coupons              | ✅       | ✅        | -       | ⚠️ Missing indexes                   |
| contactmessages      | ✅       | ✅        | -       | ⚠️ Missing indexes                   |
| securityLogs         | ✅       | ✅        | -       | ⚠️ Missing indexes                   |
| communityposts       | ✅       | ✅        | -       | ⚠️ Missing indexes                   |
| communitysuggestions | ❌ Empty | -         | -       | 🔴 Unused                            |
| consultations        | ❌ Empty | -         | -       | 🔴 Unused                            |
| supporttickets       | ❌ Empty | -         | -       | 🔴 Unused                            |
| webinarregistrations | ❌ Empty | -         | -       | 🔴 Unused                            |
| jobapplications      | ❌ Empty | -         | -       | 🔴 Unused                            |
| labexperiments       | ❌ Empty | -         | -       | 🔴 Unused                            |

---

## 📁 COLLECTION DETAILS

### 1. `users` Collection

**Purpose:** Store user account information and authentication data

**Current Schema (36 fields):**

```javascript
{
  _id: ObjectId,
  email: String (required, unique, lowercase),
  name: String,
  password: String (hashed),
  authMethod: String ['password', 'passwordless'],
  emailVerified: Date | null,
  image: String | null,
  avatar: String | null,
  bio: String (max 500),
  phoneNumber: String,
  location: String,
  timezone: String,
  profession: String,
  company: String,
  website: String,
  socialLinks: {
    twitter: String,
    linkedin: String,
    github: String
  },
  preferences: {
    emailNotifications: Boolean,
    smsNotifications: Boolean,
    marketingEmails: Boolean,
    productUpdates: Boolean
  },
  lastLoginAt: Date,
  isActive: Boolean,
  role: String ['user', 'admin', 'moderator'],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  sessionId: String,
  sessionExpiry: Date,
  twoFactorEnabled: Boolean,
  twoFactorSecret: String,
  tempTwoFactorSecret: String,
  backupCodes: [String],
  tempBackupCodes: [String],
  twoFactor: {
    secret: String,
    enabled: Boolean,
    verified: Boolean,
    tempSecret: String,
    backupCodes: [String]
  },
  verified: Boolean,
  joinedAt: String,
  passwordChangedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Current Indexes:**

1. `_id_` - Primary key
2. `email_1` - Unique email lookup
3. `createdAt_-1` - Sort by registration date
4. `isActive_1_role_1` - Filter active users by role
5. `sessionId_1` - Session lookup
6. `resetPasswordToken_1` - Password reset flow
7. `lastLoginAt_-1` - Sort by last login
8. `isActive_1_createdAt_-1` - Active users sorted by date

**Recommended Additional Indexes:**

```javascript
db.users.createIndex({ passwordChangedAt: -1 });
db.users.createIndex({ twoFactorEnabled: 1 });
```

**Used By Pages/Endpoints:**

- `/auth/login`, `/auth/signup`, `/auth/reset-password`
- `/api/auth/login`, `/api/auth/signup`, `/api/auth/verify`
- `/dashboard/profile`, `/dashboard/security`
- `/api/user/profile`, `/api/user/security/*`

---

### 2. `agents` Collection

**Purpose:** Store AI agent definitions, configurations, and metadata

**Current Schema (33 fields):**

```javascript
{
  _id: ObjectId,
  agentId: String (unique),
  id: String,
  name: String,
  description: String,
  category: String,
  specialty: String,
  emoji: String,
  avatar: String,
  avatarUrl: String,
  prompt: String (system prompt),
  aiModel: String ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'gemini-pro'],
  temperature: Number,
  maxTokens: Number,
  isActive: Boolean,
  isPublic: Boolean,
  isPremium: Boolean,
  subscriptionRequired: Boolean,
  pricing: {
    daily: Number,
    weekly: Number,
    monthly: Number
  },
  features: [String],
  tags: [String],
  capabilities: [String],
  limitations: [String],
  examples: [{
    input: String,
    output: String
  }],
  config: {
    functions: [Mixed],
    tools: [String],
    personality: String,
    tone: String
  },
  stats: {
    totalInteractions: Number,
    totalUsers: Number,
    averageRating: Number,
    totalRatings: Number
  },
  metrics: {
    conversations: Number,
    rating: Number,
    totalSessions: Number
  },
  expertise: [String],
  creator: String,
  version: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Current Indexes (16):**

1. `_id_` - Primary key
2. `agentId_1` - Unique agent ID
3. `id_1` - Alternative ID
4. `slug_1` - URL slug
5. `category_1` - Category filter
6. `aiModel_1` - Model filter
7. `isActive_1` - Active status
8. `isPublic_1` - Public visibility
9. `isPremium_1` - Premium filter
10. `creator_1` - Creator filter
11. `tags_1` - Tag search
12. `subscriptionRequired_1` - Subscription filter
13. `category_1_isActive_1_isPublic_1` - Compound for listings
14. `isPremium_1_isActive_1` - Premium active agents
15. `tags_1_isActive_1` - Tags with active status
16. `stats.averageRating_-1_stats.totalRatings_-1` - Sorted by rating

**Used By Pages/Endpoints:**

- `/agents`, `/agents/[slug]`, `/agents/categories`
- `/api/agents`, `/api/agent/*`
- `/studio`, `/dashboard/agent-management`

---

### 3. `subscriptions` Collection

**Purpose:** Track user subscriptions to agents (daily/weekly/monthly)

**Current Schema (22 fields):**

```javascript
{
  _id: ObjectId,
  userId: String | ObjectId,
  user: ObjectId (ref: User),
  agentId: String,
  agentName: String,
  plan: String | ObjectId ['daily', 'weekly', 'monthly'],
  price: Number,
  status: String ['active', 'expired', 'cancelled', 'pending'],
  startDate: Date,
  expiryDate: Date,
  autoRenew: Boolean,
  cancelAtPeriodEnd: Boolean,
  stripeSubscriptionId: String,
  stripeCustomerId: String,
  subscriptionId: String,
  billing: {
    interval: String,
    intervalCount: Number,
    amount: Number,
    currency: String,
    startDate: Date,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    nextBillingDate: Date
  },
  trial: {
    isActive: Boolean,
    daysRemaining: Number
  },
  usage: {
    current: {
      apiCalls: Number,
      storage: Number,
      aiQueries: Number,
      projects: Number
    },
    lastReset: Date
  },
  metrics: {
    totalRevenue: Number,
    loginCount: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Current Indexes (22):**

- Comprehensive coverage for all query patterns
- Includes compound indexes for common queries

**Used By Pages/Endpoints:**

- `/payment`, `/payment/success`, `/pricing`
- `/api/subscriptions/*`, `/api/stripe/*`
- `/dashboard/billing`, `/subscribe`

---

### 4. `sessions` Collection

**Purpose:** Track visitor/user sessions for analytics

**Schema (13 fields):**

```javascript
{
  _id: ObjectId,
  sessionId: String (unique),
  visitorId: String,
  userId: ObjectId | null,
  startTime: Date,
  lastActivity: Date,
  pageViews: Number,
  events: Number,
  duration: Number (seconds),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes (6):** All essential indexes present

---

### 5. `visitors` Collection

**Purpose:** Track unique visitors and their device/location info

**Schema (21 fields):**

```javascript
{
  _id: ObjectId,
  visitorId: String (unique),
  sessionId: String,
  userId: ObjectId | null,
  firstVisit: Date,
  lastVisit: Date,
  visitCount: Number,
  ipAddress: String,
  userAgent: String,
  country: String,
  city: String,
  device: String ['mobile', 'tablet', 'desktop'],
  browser: String,
  os: String,
  referrer: String,
  landingPage: String,
  isRegistered: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 6. `pageviews` Collection

**Purpose:** Track individual page views with performance metrics

**Schema (19 fields):**

```javascript
{
  _id: ObjectId,
  visitorId: String,
  sessionId: String,
  userId: ObjectId | null,
  url: String,
  path: String,
  title: String,
  referrer: String,
  timeSpent: Number,
  timestamp: Date,
  device: { type: String, os: String, browser: String },
  geo: { country: String, region: String, city: String },
  performance: {
    loadTimeMs: Number,
    domInteractiveMs: Number,
    firstContentfulPaintMs: Number
  },
  engagement: {
    timeOnPageMs: Number,
    scrollDepth: Number,
    interactions: Number,
    bounced: Boolean
  },
  experiments: [{ key: String, variant: String }],
  occurredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 7. `chatinteractions` Collection

**Purpose:** Store AI chat conversations

**Schema (16 fields):**

```javascript
{
  _id: ObjectId,
  conversationId: String,
  userId: ObjectId,
  agentId: ObjectId,
  channel: String ['web', 'mobile', 'api'],
  language: String,
  messages: [{
    role: String ['user', 'assistant', 'system'],
    content: String,
    attachments: [Mixed],
    createdAt: Date
  }],
  summary: {
    keywords: [String],
    actionItems: [String]
  },
  metrics: {
    totalTokens: Number,
    durationMs: Number,
    turnCount: Number
  },
  status: String ['active', 'closed', 'archived'],
  metadata: {
    tags: [String],
    priority: String
  },
  startedAt: Date,
  closedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 8. `apiusages` Collection

**Purpose:** Track API endpoint usage for analytics and rate limiting

**Schema (25 fields):**

```javascript
{
  _id: ObjectId,
  visitorId: String,
  sessionId: String,
  userId: ObjectId,
  agentId: ObjectId,
  subscriptionId: ObjectId,
  endpoint: String,
  method: String,
  statusCode: Number,
  responseTime: Number,
  latencyMs: Number,
  tokens: { prompt: Number, completion: Number, total: Number },
  costUsd: Number,
  success: Boolean,
  error: String | null,
  request: {
    traceId: String,
    model: String,
    temperature: Number,
    bodySummary: String
  },
  response: {
    provider: String,
    finishReason: String,
    outputSummary: String
  },
  metadata: {
    ipAddress: String,
    region: String,
    client: String,
    tags: [String]
  },
  userAgent: String,
  ipAddress: String,
  timestamp: Date,
  occurredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 9. `plans` Collection

**Purpose:** Define subscription plans with features and limits

**Schema (27 fields):**

```javascript
{
  _id: ObjectId,
  name: String,
  slug: String,
  description: String,
  shortDescription: String,
  type: String,
  category: String,
  pricing: {
    amount: Number,
    currency: String,
    interval: String,
    intervalCount: Number,
    trialPeriod: { enabled: Boolean, days: Number },
    setupFee: { amount: Number, currency: String }
  },
  limits: {
    aiModels: { total: Number, concurrent: Number, monthlyQueries: Number },
    users: { total: Number, teamMembers: Number, administrators: Number },
    storage: { totalGB: Number, fileUploadMB: Number, backupRetentionDays: Number },
    api: { requestsPerMonth: Number, requestsPerMinute: Number },
    analytics: { historyDays: Number, customReports: Boolean },
    support: { level: String, responseTimeHours: Number }
  },
  features: {
    dashboard: Boolean,
    analytics: Boolean,
    aiLab: Boolean,
    voiceCloning: Boolean,
    imageGeneration: Boolean,
    apiAccess: Boolean,
    sso: Boolean,
    twoFactorAuth: Boolean,
    // ... more features
  },
  visibility: { public: Boolean, featured: Boolean, recommended: Boolean },
  billing: { prorateUpgrades: Boolean, gracePeriodDays: Number },
  compliance: { gdprCompliant: Boolean, hipaaCompliant: Boolean },
  metrics: {
    totalSubscriptions: Number,
    activeSubscriptions: Number,
    monthlyRevenue: Number,
    churnRate: Number
  },
  status: String,
  version: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 10. `userpreferences` Collection

**Purpose:** Store user UI/notification preferences

**Schema (20 fields):**

```javascript
{
  _id: ObjectId,
  userId: ObjectId | String,
  theme: String,
  language: String | { primary: String, secondary: String, autoDetect: Boolean },
  timezone: String,
  dateFormat: String,
  timeFormat: String,
  currency: String,
  notifications: {
    email: { enabled: Boolean, frequency: String, types: [String] },
    push: { enabled: Boolean, types: [String], quiet: { enabled, start, end } },
    sms: { enabled: Boolean, types: [String] }
  },
  dashboard: { defaultView: String, widgets: [String], layout: String },
  accessibility: {
    highContrast: Boolean,
    largeText: Boolean,
    reduceMotion: Boolean,
    screenReader: Boolean,
    keyboardNavigation: Boolean
  },
  privacy: {
    showOnlineStatus: Boolean,
    allowDataCollection: Boolean,
    profileVisibility: String
  },
  ai: { defaultModel: String, temperature: Number },
  createdAt: Date,
  updatedAt: Date
}
```

**Recommended Indexes:**

```javascript
db.userpreferences.createIndex({ userId: 1 }, { unique: true });
```

---

### 11. `usersecurities` Collection

**Purpose:** Store security-related user data (2FA, sessions, login history)

**Schema (19 fields):**

```javascript
{
  _id: ObjectId,
  userId: ObjectId | String,
  email: String,
  passwordLastChanged: Date,
  twoFactorEnabled: Boolean,
  twoFactorSecret: String | null,
  backupCodes: [String],
  trustedDevices: [{
    id: String,
    name: String,
    type: String,
    lastSeen: String,
    location: String,
    browser: String,
    current: Boolean,
    ipAddress: String
  }],
  loginHistory: [{
    id: String,
    date: String,
    device: String,
    location: String,
    status: String,
    ip: String,
    userAgent: String,
    timestamp: Date,
    success: Boolean
  }],
  activeSessions: [{
    id: String,
    createdAt: Date,
    lastActivity: Date,
    ipAddress: String,
    userAgent: String,
    isCurrent: Boolean
  }],
  securityQuestions: [Mixed],
  accountLocked: Boolean,
  lockReason: String | null,
  lockExpires: Date | null,
  failedLoginAttempts: Number,
  lastFailedLogin: Date | null,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Recommended Indexes:**

```javascript
db.usersecurities.createIndex({ userId: 1 }, { unique: true });
db.usersecurities.createIndex({ email: 1 });
db.usersecurities.createIndex({ accountLocked: 1 });
```

---

### 12. `notifications` Collection

**Purpose:** Store user notifications

**Schema (13 fields):**

```javascript
{
  _id: ObjectId,
  userId: String,
  type: String,
  category: String,
  title: String,
  message: String,
  read: Boolean,
  sent: Boolean,
  priority: String,
  channels: [String],
  createdAt: Date,
  updatedAt: Date
}
```

**Recommended Indexes:**

```javascript
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 });
db.notifications.createIndex({ userId: 1, type: 1 });
```

---

### 13. `rewardscenters` Collection

**Purpose:** Gamification - track user points, badges, achievements

**Schema (14 fields):**

```javascript
{
  _id: ObjectId,
  userId: String,
  currentLevel: Number,
  totalPoints: Number,
  pointsThisLevel: Number,
  pointsToNextLevel: Number,
  badges: [{
    name: String,
    description: String,
    rarity: String,
    points: Number,
    earned: Boolean,
    earnedDate: Date
  }],
  achievements: [{
    category: String,
    title: String,
    description: String,
    points: Number,
    completed: Boolean,
    completedDate: Date,
    hidden: Boolean
  }],
  rewardHistory: [{
    type: String,
    item: String,
    points: Number,
    date: Date
  }],
  streaks: { current: Number, longest: Number },
  statistics: {
    totalBadgesEarned: Number,
    totalAchievementsCompleted: Number,
    averagePointsPerDay: Number,
    daysActive: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Recommended Indexes:**

```javascript
db.rewardscenters.createIndex({ userId: 1 }, { unique: true });
db.rewardscenters.createIndex({ totalPoints: -1 }); // Leaderboard
db.rewardscenters.createIndex({ currentLevel: -1 });
```

---

### 14. `coupons` Collection

**Purpose:** Discount codes and promotional offers

**Schema (21 fields):** Comprehensive coupon system with:

- Discount types (percentage, fixed)
- Usage limits and tracking
- Validity periods
- Applicability rules
- Security features
- Analytics

---

### 15. `contactmessages` Collection

**Purpose:** Contact form submissions

**Schema (15 fields):**

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  subject: String,
  message: String,
  category: String,
  status: String ['new', 'read', 'replied', 'closed'],
  priority: String,
  tags: [String],
  ipAddress: String,
  userAgent: String,
  source: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 16. `securityLogs` Collection

**Purpose:** Audit log for security events

**Schema (10 fields):**

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  action: String,
  timestamp: Date,
  ip: String,
  userAgent: String,
  deviceId: ObjectId,
  device: String,
  browser: String,
  location: String
}
```

---

### 17. `toolusages` Collection

**Purpose:** Track AI tool usage (Canvas Builder, Lab experiments, etc.)

**Schema (17 fields):** Documented above

**Recommended Indexes:**

```javascript
db.toolusages.createIndex({ userId: 1, occurredAt: -1 });
db.toolusages.createIndex({ toolName: 1, occurredAt: -1 });
db.toolusages.createIndex({ agentId: 1 });
```

---

### 18. `userevents` Collection

**Purpose:** Track user actions for analytics

**Schema (15 fields):** Documented above

**Recommended Indexes:**

```javascript
db.userevents.createIndex({ userId: 1, occurredAt: -1 });
db.userevents.createIndex({ eventType: 1, occurredAt: -1 });
db.userevents.createIndex({ category: 1, action: 1 });
```

---

### 19. `communityposts` Collection

**Purpose:** Community discussion posts

**Schema (12 fields):**

```javascript
{
  _id: ObjectId,
  authorId: ObjectId,
  authorName: String,
  authorAvatar: String,
  content: String,
  category: String,
  isPinned: Boolean,
  likesCount: Number,
  repliesCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔴 EMPTY COLLECTIONS (Need Population or Removal)

### Collections with No Data:

1. **`userprofiles`** - Redundant with `users` collection
2. **`userfavorites`** - Model exists but no data
3. **`transactions`** - Model exists but not used (Stripe handles payments)
4. **`communitysuggestions`** - Community feature not active
5. **`consultations`** - Support feature not implemented
6. **`supporttickets`** - Support feature not implemented
7. **`webinarregistrations`** - Events feature not active
8. **`jobapplications`** - Careers feature not active
9. **`labexperiments`** - AI Lab experiments not saved

**Recommendation:** Either populate these or remove from models/index.js

---

## 🔧 RECOMMENDED AGGREGATION PIPELINES

### 1. User Analytics Dashboard

```javascript
// Get user activity summary
db.users.aggregate([
  { $match: { isActive: true } },
  {
    $lookup: {
      from: 'subscriptions',
      localField: '_id',
      foreignField: 'user',
      as: 'subscriptions',
    },
  },
  {
    $lookup: {
      from: 'chatinteractions',
      localField: '_id',
      foreignField: 'userId',
      as: 'chats',
    },
  },
  {
    $project: {
      email: 1,
      name: 1,
      subscriptionCount: { $size: '$subscriptions' },
      chatCount: { $size: '$chats' },
      lastLogin: '$lastLoginAt',
    },
  },
]);
```

### 2. Agent Performance Metrics

```javascript
db.agents.aggregate([
  { $match: { isActive: true, isPublic: true } },
  {
    $lookup: {
      from: 'chatinteractions',
      localField: '_id',
      foreignField: 'agentId',
      as: 'interactions',
    },
  },
  {
    $lookup: {
      from: 'subscriptions',
      localField: 'agentId',
      foreignField: 'agentId',
      as: 'subs',
    },
  },
  {
    $project: {
      name: 1,
      category: 1,
      totalInteractions: { $size: '$interactions' },
      activeSubscriptions: {
        $size: {
          $filter: {
            input: '$subs',
            cond: { $eq: ['$$this.status', 'active'] },
          },
        },
      },
      revenue: { $sum: '$subs.price' },
    },
  },
  { $sort: { totalInteractions: -1 } },
]);
```

### 3. Daily Active Users

```javascript
db.sessions.aggregate([
  {
    $match: {
      startTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  },
  {
    $group: {
      _id: '$visitorId',
      sessions: { $sum: 1 },
      totalDuration: { $sum: '$duration' },
    },
  },
  { $count: 'dailyActiveUsers' },
]);
```

### 4. Revenue by Period

```javascript
db.subscriptions.aggregate([
  { $match: { status: 'active' } },
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
      totalRevenue: { $sum: '$price' },
      subscriptionCount: { $sum: 1 },
    },
  },
  { $sort: { _id: -1 } },
]);
```

---

## 🛡️ VALIDATION RULES TO ADD

### Users Collection

```javascript
db.runCommand({
  collMod: 'users',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        },
        role: {
          enum: ['user', 'admin', 'moderator'],
        },
        isActive: { bsonType: 'bool' },
      },
    },
  },
  validationLevel: 'moderate',
});
```

### Subscriptions Collection

```javascript
db.runCommand({
  collMod: 'subscriptions',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'agentId', 'status'],
      properties: {
        status: {
          enum: ['active', 'expired', 'cancelled', 'pending'],
        },
        plan: {
          enum: ['daily', 'weekly', 'monthly'],
        },
        price: {
          bsonType: 'number',
          minimum: 0,
        },
      },
    },
  },
});
```

---

## 📈 MISSING INDEXES TO CREATE

Run this script to add all missing indexes:

```javascript
// userpreferences
db.userpreferences.createIndex({ userId: 1 }, { unique: true });

// usersecurities
db.usersecurities.createIndex({ userId: 1 }, { unique: true });
db.usersecurities.createIndex({ email: 1 });

// notifications
db.notifications.createIndex({ userId: 1, read: 1, createdAt: -1 });

// rewardscenters
db.rewardscenters.createIndex({ userId: 1 }, { unique: true });
db.rewardscenters.createIndex({ totalPoints: -1 });

// toolusages
db.toolusages.createIndex({ userId: 1, occurredAt: -1 });
db.toolusages.createIndex({ toolName: 1 });

// userevents
db.userevents.createIndex({ userId: 1, occurredAt: -1 });
db.userevents.createIndex({ eventType: 1, category: 1 });

// contactmessages
db.contactmessages.createIndex({ status: 1, createdAt: -1 });
db.contactmessages.createIndex({ email: 1 });

// securityLogs
db.securityLogs.createIndex({ userId: 1, timestamp: -1 });
db.securityLogs.createIndex({ action: 1 });

// communityposts
db.communityposts.createIndex({ authorId: 1 });
db.communityposts.createIndex({ category: 1, createdAt: -1 });
db.communityposts.createIndex({ isPinned: -1, createdAt: -1 });

// plans
db.plans.createIndex({ slug: 1 }, { unique: true });
db.plans.createIndex({ status: 1, 'visibility.public': 1 });

// coupons
db.coupons.createIndex({ code: 1 }, { unique: true });
db.coupons.createIndex({ status: 1, 'validity.endDate': 1 });
```

---

## 📊 DATABASE MAPPING TO PAGES/ENDPOINTS

| Page/Endpoint          | Collections Used                       |
| ---------------------- | -------------------------------------- |
| `/` (Homepage)         | agents, pageviews                      |
| `/agents`              | agents                                 |
| `/agents/[slug]`       | agents, chatinteractions               |
| `/studio`              | agents, chatinteractions, apiusages    |
| `/canvas-app`          | toolusages                             |
| `/lab/*`               | labexperiments, toolusages             |
| `/auth/*`              | users, sessions                        |
| `/dashboard/profile`   | users, userpreferences                 |
| `/dashboard/security`  | users, usersecurities, securityLogs    |
| `/dashboard/billing`   | subscriptions, transactions            |
| `/dashboard/rewards`   | rewardscenters                         |
| `/dashboard/analytics` | pageviews, apiusages, userevents       |
| `/pricing`             | plans, subscriptions                   |
| `/payment/*`           | subscriptions, coupons                 |
| `/community/*`         | communityposts, communitysuggestions   |
| `/contact`             | contactmessages                        |
| `/support/*`           | supporttickets                         |
| `/status`              | sessions, apiusages                    |
| `/api/auth/*`          | users, sessions                        |
| `/api/user/*`          | users, userpreferences, usersecurities |
| `/api/agents`          | agents                                 |
| `/api/subscriptions/*` | subscriptions                          |
| `/api/stripe/*`        | subscriptions, users                   |
| `/api/gamification/*`  | rewardscenters                         |
| `/api/canvas/*`        | toolusages                             |
| `/api/lab/*`           | labexperiments                         |
| `/api/studio/*`        | chatinteractions, apiusages            |
| `/api/tools/*`         | toolusages                             |
| `/api/status/*`        | sessions, apiusages, pageviews         |

---

## ✅ ACTION ITEMS

### High Priority:

1. ⬜ Add missing indexes (script above)
2. ⬜ Add validation rules to critical collections
3. ⬜ Decide on empty collections - populate or remove

### Medium Priority:

4. ⬜ Implement TTL indexes for sessions (auto-expire old sessions)
5. ⬜ Add text indexes for search functionality
6. ⬜ Set up aggregation pipelines for dashboard

### Low Priority:

7. ⬜ Review schema consistency (some collections have duplicate patterns)
8. ⬜ Consider sharding strategy for high-volume collections
9. ⬜ Set up backup and monitoring

---

_Generated: December 30, 2025_
_Database: onelastai @ MongoDB Atlas_
