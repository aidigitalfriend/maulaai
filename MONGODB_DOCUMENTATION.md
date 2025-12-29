# MongoDB Database Documentation

## OneLastAI Platform - Complete Database Reference

**Last Updated:** January 2025  
**Database Name:** `onelastai`  
**Database Driver:** MongoDB Native Driver + Mongoose ODM  
**Connection:** Environment variable `MONGODB_URI`

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Connection Configuration](#connection-configuration)
3. [Collections Summary](#collections-summary)
4. [Schema Definitions](#schema-definitions)
   - [Core Collections](#core-collections)
   - [Analytics Collections](#analytics-collections)
   - [Community Collections](#community-collections)
   - [Business Collections](#business-collections)
5. [File References](#file-references)
6. [Index Configurations](#index-configurations)
7. [Query Patterns](#query-patterns)
8. [Database Utilities](#database-utilities)

---

## Database Overview

The OneLastAI platform uses MongoDB as its primary database, with both Mongoose ODM for structured model definitions and the native MongoDB driver for direct collection access in certain high-performance scenarios.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MongoDB Database                          │
│                         (onelastai)                              │
├─────────────────────────────────────────────────────────────────┤
│  Core           │  Analytics      │  Community     │  Business  │
│  ─────          │  ─────────      │  ─────────     │  ────────  │
│  users          │  visitors       │  communityposts│  plans     │
│  userprofiles   │  sessions       │  comments      │  coupons   │
│  userpreferences│  pageviews      │  likes         │  agents    │
│  usersecurities │  chatinteractions│ groups        │  subscriptions│
│  sessions       │  toolusages     │  events        │  notifications│
│                 │  userevents     │  memberships   │  rewardscenters│
│                 │  apiusages      │  moderation    │            │
│                 │                 │  metrics       │            │
│                 │                 │  content       │            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Connection Configuration

### File: `backend/lib/mongodb.js`

```javascript
const MONGODB_URI = process.env.MONGODB_URI;

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
};
```

### File: `backend/lib/database.js`

```javascript
// Connection configuration
const connectionConfig = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  waitQueueTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
  bufferCommands: false,
};
```

### Connection States

| State         | Value | Description               |
| ------------- | ----- | ------------------------- |
| Disconnected  | 0     | Not connected             |
| Connected     | 1     | Connected                 |
| Connecting    | 2     | Connection in progress    |
| Disconnecting | 3     | Disconnection in progress |

---

## Collections Summary

### Full Collection List (20 Collections)

| Collection         | Model File             | Description                      |
| ------------------ | ---------------------- | -------------------------------- |
| `users`            | `User.js`              | User accounts and authentication |
| `userprofiles`     | -                      | Extended user profile data       |
| `sessions`         | `Analytics.js`         | User session tracking            |
| `userpreferences`  | -                      | User preference settings         |
| `usersecurities`   | -                      | Security settings and 2FA        |
| `subscriptions`    | `AgentSubscription.js` | Agent subscription records       |
| `visitors`         | `Analytics.js`         | Anonymous visitor tracking       |
| `pageviews`        | `Analytics.js`         | Page view analytics              |
| `agents`           | `Agent.ts`             | AI agent definitions             |
| `apiusages`        | `Analytics.js`         | API endpoint usage tracking      |
| `notifications`    | -                      | User notifications               |
| `rewardscenters`   | -                      | Gamification rewards             |
| `securityLogs`     | -                      | Security audit logs              |
| `plans`            | -                      | Subscription plan definitions    |
| `coupons`          | -                      | Discount coupons                 |
| `communityposts`   | `CommunityPost.js`     | Community posts                  |
| `contactmessages`  | -                      | Contact form submissions         |
| `chatinteractions` | `Analytics.js`         | Chat conversation logs           |
| `toolusages`       | `Analytics.js`         | Tool usage analytics             |
| `userevents`       | `Analytics.js`         | User event tracking              |

---

## Schema Definitions

### Core Collections

---

#### Users Collection

**Collection Name:** `users`  
**Model File:** `backend/models/User.js`  
**Purpose:** Primary user account storage with authentication, profile, and preferences

```javascript
const userSchema = {
  // Authentication
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  name: { type: String },
  password: { type: String }, // bcrypt hashed
  authMethod: {
    type: String,
    enum: ['password', 'passwordless'],
    default: 'password',
  },
  emailVerified: { type: Date, default: null },

  // Profile Information
  image: { type: String },
  avatar: { type: String },
  bio: { type: String, maxlength: 500 },
  phoneNumber: { type: String },
  location: { type: String },
  timezone: { type: String },
  profession: { type: String },
  company: { type: String },
  website: { type: String },

  // Social Links
  socialLinks: {
    twitter: { type: String },
    linkedin: { type: String },
    github: { type: String },
    website: { type: String },
  },

  // User Preferences
  preferences: {
    language: { type: String, default: 'en' },
    theme: { type: String, default: 'system' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    privacy: {
      showProfile: { type: Boolean, default: true },
      showActivity: { type: Boolean, default: true },
    },
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date },

  // Account Status
  isActive: { type: Boolean, default: true },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },

  // Password Reset
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  // Session Management
  sessionId: { type: String },
  sessionExpiry: { type: Date },

  // Two-Factor Authentication
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  backupCodes: [{ type: String }],

  // Security
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
};

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ resetPasswordToken: 1 });
```

**Query Examples:**

```javascript
// Find by email
User.findOne({ email: email.toLowerCase() });

// Find by ID (excluding password)
User.findById(userId).select('-password -__v');

// Update last login
User.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
```

---

#### Agent Subscriptions Collection

**Collection Name:** `subscriptions`  
**Model File:** `backend/models/AgentSubscription.js`  
**Purpose:** Track user subscriptions to AI agents

```javascript
const agentSubscriptionSchema = {
  userId: {
    type: String,
    required: true,
    index: true,
  },
  agentId: {
    type: String,
    required: true,
    index: true,
  },
  plan: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
    required: true,
    index: true,
  },
  autoRenew: {
    type: Boolean,
    default: false,
  },
  stripeSubscriptionId: {
    type: String,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
};

// Compound Indexes
agentSubscriptionSchema.index({ userId: 1, agentId: 1 });
agentSubscriptionSchema.index({ status: 1, expiryDate: 1 });
```

**Query Examples:**

```javascript
// Check active subscription
AgentSubscription.findOne({
  userId: userId,
  agentId: agentId,
  status: 'active',
  expiryDate: { $gt: new Date() },
});

// Get all user subscriptions
AgentSubscription.find({ userId: userId }).sort({ createdAt: -1 });

// Update expired subscriptions
AgentSubscription.updateMany(
  { expiryDate: { $lt: new Date() }, status: 'active' },
  { $set: { status: 'expired' } }
);
```

---

### Analytics Collections

---

#### Visitors Collection

**Collection Name:** `visitors`  
**Model File:** `backend/models/Analytics.js`  
**Purpose:** Track anonymous and authenticated visitors

```javascript
const visitorSchema = {
  visitorId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  sessionId: { type: String },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  firstVisit: { type: Date, default: Date.now },
  lastVisit: { type: Date, default: Date.now },
  visits: { type: Number, default: 1 },
  deviceInfo: {
    browser: { type: String },
    os: { type: String },
    deviceType: { type: String }, // desktop, mobile, tablet
    screenResolution: { type: String },
  },
  geoInfo: {
    country: { type: String },
    region: { type: String },
    city: { type: String },
    timezone: { type: String },
  },
  referrer: { type: String },
  utmParams: {
    source: { type: String },
    medium: { type: String },
    campaign: { type: String },
    term: { type: String },
    content: { type: String },
  },
};
```

---

#### Sessions Collection

**Collection Name:** `sessions`  
**Model File:** `backend/models/Analytics.js`  
**Purpose:** Track user session activity

```javascript
const sessionSchema = {
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  visitorId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // in seconds
  isActive: { type: Boolean, default: true },
  pageViews: { type: Number, default: 0 },
  events: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now },
  landingPage: { type: String },
  exitPage: { type: String },
  deviceInfo: {
    browser: { type: String },
    os: { type: String },
    deviceType: { type: String },
  },
};
```

---

#### Page Views Collection

**Collection Name:** `pageviews`  
**Model File:** `backend/models/Analytics.js`  
**Purpose:** Track individual page views

```javascript
const pageViewSchema = {
  visitorId: {
    type: String,
    required: true,
    index: true,
  },
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  page: {
    url: { type: String, required: true },
    path: { type: String },
    title: { type: String },
    referrer: { type: String },
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  timeSpent: { type: Number, default: 0 },
  scrollDepth: { type: Number, default: 0 },
};
```

---

#### Chat Interactions Collection

**Collection Name:** `chatinteractions`  
**Model File:** `backend/models/Analytics.js`  
**Purpose:** Log AI chat conversations

```javascript
const chatInteractionSchema = {
  conversationId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  agentId: { type: String, index: true },
  agentType: { type: String },
  messages: [
    {
      role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
      },
      content: { type: String },
      timestamp: { type: Date, default: Date.now },
      tokens: { type: Number },
      model: { type: String },
    },
  ],
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  totalTokens: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  averageResponseTime: { type: Number },
  feedback: {
    rating: { type: Number },
    comment: { type: String },
  },
};
```

---

#### Tool Usages Collection

**Collection Name:** `toolusages`  
**Model File:** `backend/models/Analytics.js`  
**Purpose:** Track AI tool usage patterns

```javascript
const toolUsageSchema = {
  toolName: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  agentId: { type: String },
  conversationId: { type: String },
  command: { type: String },
  arguments: { type: mongoose.Schema.Types.Mixed },
  result: {
    success: { type: Boolean },
    errorMessage: { type: String },
    outputSize: { type: Number },
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  latency: { type: Number }, // in milliseconds
  metadata: { type: mongoose.Schema.Types.Mixed },
};
```

---

#### User Events Collection

**Collection Name:** `userevents`  
**Model File:** `backend/models/Analytics.js`  
**Purpose:** Track custom user events

```javascript
const userEventSchema = {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  visitorId: { type: String },
  sessionId: { type: String },
  eventType: {
    type: String,
    required: true,
    index: true,
  },
  category: { type: String },
  action: { type: String },
  label: { type: String },
  value: { type: Number },
  properties: { type: mongoose.Schema.Types.Mixed },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  context: {
    page: { type: String },
    component: { type: String },
    referrer: { type: String },
  },
};
```

---

#### API Usages Collection

**Collection Name:** `apiusages`  
**Model File:** `backend/models/Analytics.js`  
**Purpose:** Track API endpoint usage

```javascript
const apiUsageSchema = {
  visitorId: { type: String },
  sessionId: { type: String },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  endpoint: {
    type: String,
    required: true,
    index: true,
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
  statusCode: { type: Number },
  responseTime: { type: Number }, // in milliseconds
  requestSize: { type: Number },
  responseSize: { type: Number },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  errorMessage: { type: String },
  userAgent: { type: String },
  ip: { type: String },
};
```

---

### Community Collections

---

#### Community Posts Collection

**Collection Name:** `communityposts`  
**Model File:** `backend/models/CommunityPost.js`  
**Purpose:** User-generated community posts

```javascript
const communityPostSchema = {
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  authorAvatar: { type: String },
  content: {
    type: String,
    required: true,
    maxlength: 10000,
  },
  category: {
    type: String,
    enum: ['general', 'agents', 'tips', 'showcase', 'help', 'feedback'],
    default: 'general',
    index: true,
  },
  tags: [{ type: String }],
  isPinned: {
    type: Boolean,
    default: false,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: { type: Date },
  likesCount: {
    type: Number,
    default: 0,
  },
  repliesCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
};

// Index for feed queries
communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ category: 1, createdAt: -1 });
```

---

#### Community Comments Collection

**Collection Name:** `communitycomments`  
**Model File:** `backend/models/CommunityComment.js`  
**Purpose:** Comments on community posts

```javascript
const communityCommentSchema = {
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityPost',
    required: true,
    index: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  authorAvatar: { type: String },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityComment',
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: { type: Date },
  likesCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
};
```

---

#### Community Likes Collection

**Collection Name:** `communitylikes`  
**Model File:** `backend/models/CommunityLike.js`  
**Purpose:** Track post/comment likes

```javascript
const communityLikeSchema = {
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityPost',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
};

// Compound unique index to prevent duplicate likes
communityLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });
```

---

#### Community Groups Collection

**Collection Name:** `communitygroups`  
**Model File:** `backend/models/CommunityGroup.js`  
**Purpose:** Community group management

```javascript
const communityGroupSchema = {
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    maxlength: 2000,
  },
  avatar: { type: String },
  coverImage: { type: String },
  category: {
    type: String,
    enum: ['general', 'agents', 'development', 'research', 'business', 'other'],
    default: 'general',
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  admins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  moderators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  settings: {
    allowMemberPosts: { type: Boolean, default: true },
    requirePostApproval: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true },
    allowReactions: { type: Boolean, default: true },
  },
  stats: {
    memberCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};
```

---

#### Community Events Collection

**Collection Name:** `communityevents`  
**Model File:** `backend/models/CommunityEvent.js`  
**Purpose:** Event management for community

```javascript
const communityEventSchema = {
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    maxlength: 5000,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityGroup',
    index: true,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coHosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  eventType: {
    type: String,
    enum: ['online', 'in-person', 'hybrid'],
    default: 'online',
  },
  category: {
    type: String,
    enum: ['workshop', 'webinar', 'meetup', 'conference', 'hackathon', 'other'],
    default: 'meetup',
  },
  schedule: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timezone: { type: String, default: 'UTC' },
    isAllDay: { type: Boolean, default: false },
    recurrence: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none',
    },
  },
  location: {
    type: { type: String, enum: ['physical', 'virtual'] },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    virtualLink: { type: String },
    platform: { type: String },
  },
  registration: {
    isRequired: { type: Boolean, default: false },
    maxAttendees: { type: Number },
    currentAttendees: { type: Number, default: 0 },
    waitlistEnabled: { type: Boolean, default: false },
    registrationDeadline: { type: Date },
    fee: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
  },
  attendees: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: {
        type: String,
        enum: ['registered', 'waitlisted', 'attended', 'cancelled'],
      },
      registeredAt: { type: Date, default: Date.now },
    },
  ],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft',
  },
  visibility: {
    type: String,
    enum: ['public', 'members-only', 'invite-only'],
    default: 'public',
  },
  coverImage: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};
```

---

#### Community Memberships Collection

**Collection Name:** `communitymemberships`  
**Model File:** `backend/models/CommunityMembership.js`  
**Purpose:** Track group memberships

```javascript
const communityMembershipSchema = {
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityGroup',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['member', 'moderator', 'admin', 'owner'],
    default: 'member',
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'invited', 'banned', 'left'],
    default: 'active',
  },
  permissions: {
    canPost: { type: Boolean, default: true },
    canComment: { type: Boolean, default: true },
    canInvite: { type: Boolean, default: false },
    canModerate: { type: Boolean, default: false },
    canManageMembers: { type: Boolean, default: false },
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  applicationNote: { type: String },
  joinedAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
};

// Compound unique index
communityMembershipSchema.index({ groupId: 1, userId: 1 }, { unique: true });
```

---

#### Community Moderation Collection

**Collection Name:** `communitymoderations`  
**Model File:** `backend/models/CommunityModeration.js`  
**Purpose:** Content moderation actions

```javascript
const communityModerationSchema = {
  targetType: {
    type: String,
    enum: ['post', 'comment', 'user', 'group', 'event'],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType',
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityGroup',
  },
  action: {
    type: String,
    enum: [
      'warn',
      'hide',
      'remove',
      'ban',
      'mute',
      'flag',
      'approve',
      'reject',
    ],
    required: true,
  },
  reason: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  category: {
    type: String,
    enum: [
      'spam',
      'harassment',
      'hate-speech',
      'misinformation',
      'inappropriate',
      'copyright',
      'other',
    ],
    default: 'other',
  },
  moderator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportedBy: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: { type: String },
      reportedAt: { type: Date, default: Date.now },
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'resolved', 'appealed', 'overturned'],
    default: 'resolved',
  },
  duration: { type: Number }, // For temporary bans (in hours)
  expiresAt: { type: Date },
  notes: { type: String },
  previousActions: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityModeration' },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};
```

---

#### Community Content Collection

**Collection Name:** `communitycontents`  
**Model File:** `backend/models/CommunityContent.js`  
**Purpose:** Rich content posts for groups

```javascript
const communityContentSchema = {
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityGroup',
    required: true,
    index: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  contentType: {
    type: String,
    enum: [
      'post',
      'discussion',
      'poll',
      'announcement',
      'resource',
      'question',
    ],
    default: 'post',
  },
  title: {
    type: String,
    trim: true,
    maxlength: 300,
  },
  body: {
    type: String,
    required: true,
    maxlength: 50000,
  },
  format: {
    type: String,
    enum: ['plain', 'markdown', 'rich'],
    default: 'markdown',
  },
  attachments: [
    {
      type: { type: String, enum: ['image', 'video', 'file', 'link'] },
      url: { type: String },
      name: { type: String },
      size: { type: Number },
      mimeType: { type: String },
    },
  ],
  poll: {
    question: { type: String },
    options: [
      {
        text: { type: String },
        votes: { type: Number, default: 0 },
        voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      },
    ],
    allowMultiple: { type: Boolean, default: false },
    endsAt: { type: Date },
    totalVotes: { type: Number, default: 0 },
  },
  tags: [{ type: String }],
  mentions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  visibility: {
    type: String,
    enum: ['public', 'members', 'moderators'],
    default: 'members',
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'archived', 'removed'],
    default: 'published',
  },
  isPinned: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
  },
  reactions: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      type: {
        type: String,
        enum: ['like', 'love', 'celebrate', 'insightful', 'curious'],
      },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  editHistory: [
    {
      editedAt: { type: Date },
      editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      previousBody: { type: String },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};
```

---

#### Community Metrics Collection

**Collection Name:** `communitymetrics`  
**Model File:** `backend/models/CommunityMetrics.js`  
**Purpose:** Analytics for community groups

```javascript
const communityMetricsSchema = {
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityGroup',
    required: true,
    index: true,
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  members: {
    total: { type: Number, default: 0 },
    new: { type: Number, default: 0 },
    left: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    banned: { type: Number, default: 0 },
  },
  content: {
    posts: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    reactions: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
  },
  engagement: {
    views: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
  },
  events: {
    created: { type: Number, default: 0 },
    attendees: { type: Number, default: 0 },
    completedEvents: { type: Number, default: 0 },
  },
  moderation: {
    reports: { type: Number, default: 0 },
    actionsaken: { type: Number, default: 0 },
    contentRemoved: { type: Number, default: 0 },
  },
  topContributors: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      posts: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      reactions: { type: Number, default: 0 },
    },
  ],
  topContent: [
    {
      contentId: { type: mongoose.Schema.Types.ObjectId },
      views: { type: Number, default: 0 },
      engagement: { type: Number, default: 0 },
    },
  ],
  createdAt: { type: Date, default: Date.now },
};

// Compound index for efficient queries
communityMetricsSchema.index({ groupId: 1, period: 1, date: -1 });
```

---

### Business Collections

---

#### Agents Collection

**Collection Name:** `agents`  
**Model File:** `backend/models/Agent.ts` (TypeScript Interface)  
**Purpose:** AI Agent definitions

```typescript
interface Agent {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  shortDescription: string;
  icon: string;
  image: string;
  capabilities: string[];
  features: string[];
  useCases: string[];
  pricing: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  stats: {
    users: number;
    rating: number;
    reviews: number;
  };
  isActive: boolean;
  isNew: boolean;
  isFeatured: boolean;
  releaseDate: Date;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Note:** Agents are primarily managed via native MongoClient in `agentCollectionHub.js`:

```javascript
// Direct MongoDB access pattern
const client = await MongoClient.connect(process.env.MONGODB_URI);
const db = client.db('onelastai');
const agentsCollection = db.collection('agents');

// Sync agents from different sources
await agentsCollection.updateOne(
  { id: agent.id },
  { $set: agent },
  { upsert: true }
);
```

---

## File References

### Models Directory: `backend/models/`

| File                     | Collection(s)                                                                      | Lines | Description                     |
| ------------------------ | ---------------------------------------------------------------------------------- | ----- | ------------------------------- |
| `User.js`                | users                                                                              | 175   | User authentication and profile |
| `AgentSubscription.js`   | subscriptions                                                                      | 97    | Agent subscription management   |
| `Analytics.js`           | visitors, sessions, pageviews, chatinteractions, toolusages, userevents, apiusages | 244   | All analytics schemas           |
| `Agent.ts`               | agents                                                                             | 47    | Agent TypeScript interface      |
| `CommunityPost.js`       | communityposts                                                                     | 89    | Community posts                 |
| `CommunityComment.js`    | communitycomments                                                                  | 67    | Post comments                   |
| `CommunityLike.js`       | communitylikes                                                                     | 32    | Like relationships              |
| `CommunityGroup.js`      | communitygroups                                                                    | 717   | Group management                |
| `CommunityEvent.js`      | communityevents                                                                    | 869   | Event management                |
| `CommunityMembership.js` | communitymemberships                                                               | 743   | Membership tracking             |
| `CommunityModeration.js` | communitymoderations                                                               | 768   | Content moderation              |
| `CommunityContent.js`    | communitycontents                                                                  | 871   | Rich content posts              |
| `CommunityMetrics.js`    | communitymetrics                                                                   | 851   | Group analytics                 |

### Routes Directory: `backend/routes/`

| File                    | Collections Used                                                        | Lines | Endpoints                    |
| ----------------------- | ----------------------------------------------------------------------- | ----- | ---------------------------- |
| `user.js`               | users                                                                   | 329   | `/api/user/profile` CRUD     |
| `session.js`            | users                                                                   | 333   | `/api/session` login/logout  |
| `agentSubscriptions.js` | subscriptions, agents                                                   | 657   | `/api/agent-subscriptions/*` |
| `analytics.js`          | visitors, sessions, pageviews, chatinteractions, toolusages, userevents | 249   | `/api/analytics/*`           |
| `community.js`          | communityposts, communitycomments, communitylikes                       | 507   | `/api/community/*`           |
| `admin-analytics.js`    | all analytics collections                                               | 150   | `/api/admin/analytics/*`     |
| `agents.js`             | agents                                                                  | 200   | `/api/agents/*`              |
| `gamification.js`       | (in-memory)                                                             | 311   | `/api/gamification/*`        |

### Library Files: `backend/lib/`

| File                   | Purpose                     | Key Functions                                                                                        |
| ---------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `mongodb.js`           | Connection singleton        | `connectToDatabase()`                                                                                |
| `database.js`          | Connection config & indexes | `initializeDatabase()`, `indexOptimizer`                                                             |
| `analytics-tracker.js` | Analytics helper functions  | `trackVisitor()`, `trackSession()`, `trackChatInteraction()`, `trackToolUsage()`, `trackUserEvent()` |

### Services: `backend/services/`

| File                    | Collections           | Purpose                    |
| ----------------------- | --------------------- | -------------------------- |
| `agentCollectionHub.js` | agents                | Sync agents across sources |
| `stripe.js`             | subscriptions, agents | Stripe payment integration |

---

## Index Configurations

### Recommended Indexes (from `database.js`)

```javascript
const indexes = {
  users: [
    { key: { email: 1 }, unique: true },
    { key: { createdAt: 1 } },
    { key: { isActive: 1 } },
    { key: { role: 1 } },
  ],
  userprofiles: [{ key: { userId: 1 }, unique: true }],
  sessions: [
    { key: { sessionId: 1 }, unique: true },
    { key: { visitorId: 1 } },
    { key: { userId: 1 } },
    { key: { startTime: -1 } },
  ],
  subscriptions: [
    { key: { userId: 1, agentId: 1 } },
    { key: { status: 1, expiryDate: 1 } },
    { key: { stripeSubscriptionId: 1 }, sparse: true },
  ],
  visitors: [
    { key: { visitorId: 1 }, unique: true },
    { key: { userId: 1 } },
    { key: { lastVisit: -1 } },
  ],
  pageviews: [
    { key: { visitorId: 1 } },
    { key: { sessionId: 1 } },
    { key: { timestamp: -1 } },
  ],
  agents: [
    { key: { id: 1 }, unique: true },
    { key: { slug: 1 }, unique: true },
    { key: { category: 1 } },
    { key: { isActive: 1 } },
  ],
  chatinteractions: [
    { key: { conversationId: 1 } },
    { key: { userId: 1 } },
    { key: { agentId: 1 } },
    { key: { startTime: -1 } },
  ],
  toolusages: [
    { key: { toolName: 1 } },
    { key: { userId: 1 } },
    { key: { timestamp: -1 } },
  ],
  userevents: [
    { key: { userId: 1 } },
    { key: { eventType: 1 } },
    { key: { timestamp: -1 } },
  ],
  communityposts: [
    { key: { authorId: 1 } },
    { key: { category: 1 } },
    { key: { createdAt: -1 } },
    { key: { isPinned: -1, createdAt: -1 } },
  ],
  communitylikes: [{ key: { postId: 1, userId: 1 }, unique: true }],
};
```

---

## Query Patterns

### Common Query Patterns

#### 1. User Authentication

```javascript
// Login
const user = await User.findOne({ email: email.toLowerCase() });
const isValid = await bcrypt.compare(password, user.password);

// Get session user
const user = await User.findById(decoded.userId).select('-password');
```

#### 2. Subscription Check

```javascript
// Check if user has active subscription
const subscription = await AgentSubscription.findOne({
  userId: userId,
  agentId: agentId,
  status: 'active',
  expiryDate: { $gt: new Date() },
});
```

#### 3. Analytics Tracking

```javascript
// Track visitor
await Visitor.findOneAndUpdate(
  { visitorId },
  {
    $set: { lastVisit: new Date() },
    $inc: { visits: 1 },
    $setOnInsert: { firstVisit: new Date() },
  },
  { upsert: true, new: true }
);

// Track page view
await PageView.create({
  visitorId,
  sessionId,
  page: { url, path, title },
  timestamp: new Date(),
});
```

#### 4. Community Posts with Pagination

```javascript
// Get paginated posts
const posts = await CommunityPost.find({ category })
  .sort({ isPinned: -1, createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit);
```

#### 5. Toggle Like (Atomic Operation)

```javascript
// Try to add like
try {
  await CommunityLike.create({ postId, userId });
  await CommunityPost.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
} catch (error) {
  if (error.code === 11000) {
    // Duplicate key = already liked
    await CommunityLike.deleteOne({ postId, userId });
    await CommunityPost.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
  }
}
```

#### 6. Aggregation for Analytics

```javascript
// Get daily visitor stats
const stats = await Visitor.aggregate([
  { $match: { lastVisit: { $gte: startDate, $lte: endDate } } },
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastVisit' } },
      uniqueVisitors: { $sum: 1 },
      totalVisits: { $sum: '$visits' },
    },
  },
  { $sort: { _id: 1 } },
]);
```

---

## Database Utilities

### Connection Health Check

```javascript
// From database.js
const healthCheck = async () => {
  const start = Date.now();
  await mongoose.connection.db.admin().ping();
  const latency = Date.now() - start;

  return {
    status: 'healthy',
    latency,
    readyState: mongoose.connection.readyState,
    poolSize: connectionConfig.maxPoolSize,
  };
};
```

### Pool Monitoring

```javascript
// From database.js
const getPoolStats = () => ({
  readyState: mongoose.connection.readyState,
  poolSize: mongoose.connection.db?.serverConfig?.poolSize || 0,
  connections: {
    inUse: mongoose.connection.db?.serverConfig?.connections?.inUse || 0,
    available:
      mongoose.connection.db?.serverConfig?.connections?.available || 0,
  },
});
```

### Slow Query Monitoring

```javascript
// From database.js
const monitorSlowQueries = (thresholdMs = 1000) => {
  mongoose.set('debug', (collection, method, query, doc, options) => {
    const start = Date.now();
    setImmediate(() => {
      const duration = Date.now() - start;
      if (duration > thresholdMs) {
        console.warn(`🐌 Slow query (${duration}ms): ${collection}.${method}`, {
          query,
        });
      }
    });
  });
};
```

### Index Optimization

```javascript
// From database.js
const ensureIndexes = async () => {
  const db = mongoose.connection.db;

  for (const [collectionName, indexList] of Object.entries(indexes)) {
    const collection = db.collection(collectionName);
    for (const index of indexList) {
      await collection.createIndex(index.key, {
        unique: index.unique || false,
        sparse: index.sparse || false,
        background: true,
      });
    }
  }
};
```

---

## Environment Variables

| Variable         | Description               | Example                                                 |
| ---------------- | ------------------------- | ------------------------------------------------------- |
| `MONGODB_URI`    | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/onelastai` |
| `JWT_SECRET`     | JWT signing secret        | `your-secret-key`                                       |
| `JWT_EXPIRES_IN` | Token expiration          | `24h`                                                   |

---

## Best Practices Implemented

1. **Connection Pooling:** Max 10 connections with min 2 for availability
2. **Indexing:** Compound indexes for common queries
3. **Projection:** `.select('-password')` to exclude sensitive fields
4. **Lean Queries:** `.lean()` for read-only operations
5. **Upsert:** Atomic create-or-update operations
6. **Compound Unique Indexes:** Prevent duplicate likes
7. **Sparse Indexes:** For optional fields like `stripeSubscriptionId`
8. **TTL Indexes:** Consider for sessions and temporary data
9. **Background Index Creation:** Prevent blocking
10. **Error Handling:** Duplicate key errors handled gracefully

---

## Migration Notes

- Database uses hybrid approach: Mongoose ODM + native MongoClient
- Agents collection primarily managed via native driver
- Community features fully use Mongoose schemas
- Analytics schemas optimized for time-series queries
- Consider adding TTL index on sessions for auto-cleanup

---

_Documentation generated from source code analysis_  
_Last analyzed: January 2025_
