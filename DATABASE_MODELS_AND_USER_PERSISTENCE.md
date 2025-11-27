# Database Models and User Persistence Documentation

## Overview
This document outlines the database models, schemas, and user persistence patterns used in the OneLastAI platform. The system uses MongoDB with Mongoose ODM for data management.

## Core User Models

### 1. User Model (`User.ts`)

**Primary authentication and identity model**

```typescript
interface IUser {
  email: string                    // Unique, required
  name?: string                   // Display name
  password?: string              // Optional (for passwordless users)
  authMethod: 'password' | 'passwordless'
  emailVerified?: Date
  image?: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  isActive: boolean
  role: 'user' | 'admin' | 'moderator'
  resetPasswordToken?: string
  resetPasswordExpires?: Date
}
```

**Key Features:**
- Supports both password and passwordless authentication
- Automatic password hashing with bcrypt
- Email verification system
- Password reset token management
- Role-based access control

### 2. UserProfile Model (`UserProfile.js`)

**Extended user information and social features**

```javascript
{
  userId: String,              // References User._id
  email: String,
  name: String,
  avatar: String,
  bio: String,
  phoneNumber: String,
  location: String,
  timezone: String,
  profession: String,
  company: String,
  website: String,
  socialLinks: {
    linkedin: String,
    twitter: String,
    github: String
  },
  preferences: {               // Basic notification preferences
    emailNotifications: Boolean,
    smsNotifications: Boolean,
    marketingEmails: Boolean,
    productUpdates: Boolean
  }
}
```

### 3. UserPreferences Model (`UserPreferences.js`)

**Comprehensive user settings and preferences**

```javascript
{
  userId: String,              // References User._id
  
  theme: {
    mode: 'light' | 'dark' | 'system',
    primaryColor: String,
    fontSize: 'small' | 'medium' | 'large',
    compactMode: Boolean
  },
  
  notifications: {
    email: {
      enabled: Boolean,
      frequency: 'immediate' | 'daily' | 'weekly',
      types: {
        system: Boolean,
        security: Boolean,
        updates: Boolean,
        marketing: Boolean,
        community: Boolean
      }
    },
    push: {
      enabled: Boolean,
      quiet: {
        enabled: Boolean,
        start: String,        // '22:00'
        end: String          // '08:00'
      }
    },
    desktop: {
      enabled: Boolean,
      sound: Boolean
    }
  },
  
  language: {
    primary: String,
    secondary: String,
    autoDetect: Boolean
  },
  
  accessibility: {
    highContrast: Boolean,
    reduceMotion: Boolean,
    screenReader: Boolean,
    keyboardNavigation: Boolean
  },
  
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends',
    activityTracking: Boolean,
    analytics: Boolean,
    dataSharing: Boolean
  },
  
  advanced: {
    autoSave: Boolean,
    autoBackup: Boolean,
    debugMode: Boolean,
    betaFeatures: Boolean
  }
}
```

## Agent Models

### Agent Model (`Agent.ts`)

**Core agent definitions and capabilities**

```typescript
interface IAgent {
  agentId: string
  name: string
  description: string
  category: 'assistant' | 'specialist' | 'creative' | 'technical' | 'business' | 'other'
  avatar: string
  prompt: string
  aiModel: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'claude-2' | 'gemini-pro' | 'mistral'
  temperature: number
  maxTokens: number
  isActive: boolean
  isPublic: boolean
  isPremium: boolean
  
  pricing: {
    daily: number
    weekly: number
    monthly: number
  }
  
  features: string[]
  tags: string[]
  capabilities: string[]
  limitations: string[]
  
  examples: [{
    input: string
    output: string
  }]
  
  config: {
    systemPrompt?: string
    functions?: any[]
    tools?: string[]
    personality?: string
    tone?: string
  }
  
  stats: {
    totalInteractions: number
    totalUsers: number
    averageRating: number
    totalRatings: number
  }
  
  creator: string
  version: string
}
```

## User Persistence Patterns

### 1. Settings Persistence Strategy

**UserPreferences API Endpoint** (`/api/userPreferences/:userId`)

```javascript
// GET /api/userPreferences/:userId
// Retrieves user preferences, creates defaults if none exist

// PUT /api/userPreferences/:userId
// Updates user preferences with partial data
const preferences = await UserPreferences.findOneAndUpdate(
  { userId },
  { $set: updateData },
  { new: true, upsert: true }
);
```

**Default Settings Creation:**
- Automatic creation when user first accesses preferences
- Sensible defaults for all preference categories
- Gradual migration strategy for new preference fields

### 2. Session Management

**Authentication Flow:**
1. User login creates session in User model (`lastLoginAt`)
2. Session tokens managed through JWT or session cookies
3. UserSecurity model tracks login events and security actions

### 3. Cross-Model Relationships

**User → UserProfile → UserPreferences:**
- `User._id` links to `UserProfile.userId` and `UserPreferences.userId`
- Cascading updates for profile changes
- Separate models for performance and modularity

### 4. API Usage Examples

**Retrieving User Settings:**

```javascript
// Get complete user context
const user = await User.findById(userId);
const profile = await UserProfile.findOne({userId});
const preferences = await UserPreferences.findOne({userId});

// Combined response
const userContext = {
  user: user.toJSON(),
  profile,
  preferences
};
```

**Updating Preferences:**

```javascript
// Theme settings update
PUT /api/userPreferences/:userId
{
  "theme": {
    "mode": "dark",
    "primaryColor": "purple",
    "fontSize": "large"
  }
}
```

## Database Indexes

**Performance Optimization:**

```javascript
// User-related indexes
{ "userId": 1, "createdAt": -1 }
{ "email": 1 }, { unique: true }

// Preference indexes
{ "userId": 1 }, { unique: true }
```

This documentation provides a comprehensive overview of how user settings are persisted and managed in the OneLastAI platform.
