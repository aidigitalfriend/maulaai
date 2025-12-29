# 🔥 OneLastAI - Professional Database Audit & Implementation Plan

## The Problem

We're checking things manually like crazy people - screenshots, console errors, "maybe missing in db" - **NOT PROFESSIONAL!**

## The Solution

Systematic audit of EVERY feature → EVERY endpoint → EVERY database operation

---

## 📋 MASTER CHECKLIST

### Legend

- ✅ = Working & Verified
- ⚠️ = Partially Working / Needs Fix
- ❌ = Not Implemented / Broken
- 🔍 = Needs Verification

---

## 1. 👤 USER MANAGEMENT

### 1.1 Authentication

| Feature            | Endpoint                      | Collection            | Status | Notes |
| ------------------ | ----------------------------- | --------------------- | ------ | ----- |
| User Registration  | `POST /api/session/register`  | `users`               | 🔍     |       |
| User Login         | `POST /api/session/login`     | `users`               | 🔍     |       |
| Password Login     | `POST /api/session/login`     | `users`               | 🔍     |       |
| Passwordless Login | `POST /api/auth/passwordless` | `users`               | 🔍     |       |
| Session Token      | Cookie `session_token`        | `users.sessionId`     | 🔍     |       |
| Session Refresh    | `POST /api/session/refresh`   | `users`               | 🔍     |       |
| Logout             | `POST /api/session/logout`    | -                     | 🔍     |       |
| Email Verification | `POST /api/auth/verify-email` | `users.emailVerified` | 🔍     |       |

### 1.2 User Profile

| Feature           | Endpoint                                | Collection/Field    | Status | Notes |
| ----------------- | --------------------------------------- | ------------------- | ------ | ----- |
| Get Profile       | `GET /api/user/profile`                 | `users`             | 🔍     |       |
| Update Profile    | `PUT /api/user/profile/:userId`         | `users`             | 🔍     |       |
| Upload Avatar     | `POST /api/user/profile/:userId/avatar` | `users.avatar`      | 🔍     |       |
| Update Bio        | `PUT /api/user/profile/:userId`         | `users.bio`         | 🔍     |       |
| Update Name       | `PUT /api/user/profile/:userId`         | `users.name`        | 🔍     |       |
| Update Phone      | `PUT /api/user/profile/:userId`         | `users.phoneNumber` | 🔍     |       |
| Update Location   | `PUT /api/user/profile/:userId`         | `users.location`    | 🔍     |       |
| Update Timezone   | `PUT /api/user/profile/:userId`         | `users.timezone`    | 🔍     |       |
| Update Profession | `PUT /api/user/profile/:userId`         | `users.profession`  | 🔍     |       |
| Update Company    | `PUT /api/user/profile/:userId`         | `users.company`     | 🔍     |       |
| Social Links      | `PUT /api/user/profile/:userId`         | `users.socialLinks` | 🔍     |       |

### 1.3 User Preferences

| Feature                 | Endpoint                                      | Collection/Field                         | Status | Notes |
| ----------------------- | --------------------------------------------- | ---------------------------------------- | ------ | ----- |
| Language Setting        | `PATCH /api/user/profile/:userId/preferences` | `users.preferences.language`             | 🔍     |       |
| Theme Setting           | `PATCH /api/user/profile/:userId/preferences` | `users.preferences.theme`                | 🔍     |       |
| Email Notifications     | `PATCH /api/user/profile/:userId/preferences` | `users.preferences.notifications.email`  | 🔍     |       |
| Push Notifications      | `PATCH /api/user/profile/:userId/preferences` | `users.preferences.notifications.push`   | 🔍     |       |
| SMS Notifications       | `PATCH /api/user/profile/:userId/preferences` | `users.preferences.notifications.sms`    | 🔍     |       |
| Privacy - Show Profile  | `PATCH /api/user/profile/:userId/preferences` | `users.preferences.privacy.showProfile`  | 🔍     |       |
| Privacy - Show Activity | `PATCH /api/user/profile/:userId/preferences` | `users.preferences.privacy.showActivity` | 🔍     |       |

### 1.4 Security Settings

| Feature                 | Endpoint                               | Collection/Field           | Status | Notes |
| ----------------------- | -------------------------------------- | -------------------------- | ------ | ----- |
| Change Password         | `POST /api/auth/change-password`       | `users.password`           | 🔍     |       |
| Change Email            | `POST /api/auth/change-email`          | `users.email`              | 🔍     |       |
| Enable 2FA              | `POST /api/auth/2fa/enable`            | `users.twoFactorEnabled`   | 🔍     |       |
| Disable 2FA             | `POST /api/auth/2fa/disable`           | `users.twoFactorEnabled`   | 🔍     |       |
| 2FA Secret              | -                                      | `users.twoFactorSecret`    | 🔍     |       |
| Backup Codes            | `GET /api/auth/2fa/backup-codes`       | `users.backupCodes`        | 🔍     |       |
| Password Reset Request  | `POST /api/auth/forgot-password`       | `users.resetPasswordToken` | 🔍     |       |
| Password Reset          | `POST /api/auth/reset-password`        | `users.password`           | 🔍     |       |
| Login Attempts Tracking | -                                      | `users.loginAttempts`      | 🔍     |       |
| Account Lockout         | -                                      | `users.lockUntil`          | 🔍     |       |
| Security Logs           | -                                      | `securityLogs`             | 🔍     |       |
| Active Sessions         | `GET /api/auth/sessions`               | `sessions`                 | 🔍     |       |
| Revoke Session          | `DELETE /api/auth/sessions/:sessionId` | `sessions`                 | 🔍     |       |

---

## 2. 🤖 AGENT SYSTEM

### 2.1 Agent Catalog

| Feature           | Endpoint                     | Collection/Field    | Status | Notes |
| ----------------- | ---------------------------- | ------------------- | ------ | ----- |
| List All Agents   | `GET /api/agents`            | `agents`            | 🔍     |       |
| Get Agent Details | `GET /api/agents/:slug`      | `agents`            | 🔍     |       |
| Agent Categories  | `GET /api/agents/categories` | `agents.category`   | 🔍     |       |
| Featured Agents   | `GET /api/agents/featured`   | `agents.isFeatured` | 🔍     |       |
| New Agents        | `GET /api/agents/new`        | `agents.isNew`      | 🔍     |       |
| Agent Search      | `GET /api/agents/search`     | `agents`            | 🔍     |       |

### 2.2 Agent Subscriptions

| Feature                    | Endpoint                                               | Collection/Field          | Status | Notes |
| -------------------------- | ------------------------------------------------------ | ------------------------- | ------ | ----- |
| Subscribe to Agent         | `POST /api/agent-subscriptions/subscribe`              | `subscriptions`           | 🔍     |       |
| Check Subscription         | `GET /api/agent-subscriptions/check/:agentId`          | `subscriptions`           | 🔍     |       |
| Get User Subscriptions     | `GET /api/agent-subscriptions/user/:userId`            | `subscriptions`           | 🔍     |       |
| Cancel Subscription        | `POST /api/agent-subscriptions/cancel/:subscriptionId` | `subscriptions.status`    | 🔍     |       |
| Renew Subscription         | `POST /api/agent-subscriptions/renew/:subscriptionId`  | `subscriptions`           | 🔍     |       |
| Subscription History       | `GET /api/agent-subscriptions/history/:userId`         | `subscriptions`           | 🔍     |       |
| Active Subscriptions Count | `GET /api/agent-subscriptions/stats/:userId`           | `subscriptions`           | 🔍     |       |
| Auto-Renew Toggle          | `PATCH /api/agent-subscriptions/:id/auto-renew`        | `subscriptions.autoRenew` | 🔍     |       |

### 2.3 Agent Chat / Interactions

| Feature             | Endpoint                                  | Collection/Field                       | Status | Notes |
| ------------------- | ----------------------------------------- | -------------------------------------- | ------ | ----- |
| Start Conversation  | `POST /api/chat/start`                    | `chatinteractions`                     | 🔍     |       |
| Send Message        | `POST /api/chat/message`                  | `chatinteractions.messages`            | 🔍     |       |
| Get Conversation    | `GET /api/chat/:conversationId`           | `chatinteractions`                     | 🔍     |       |
| List Conversations  | `GET /api/chat/user/:userId`              | `chatinteractions`                     | 🔍     |       |
| Delete Conversation | `DELETE /api/chat/:conversationId`        | `chatinteractions`                     | 🔍     |       |
| Chat Feedback       | `POST /api/chat/:conversationId/feedback` | `chatinteractions.feedback`            | 🔍     |       |
| Token Usage         | -                                         | `chatinteractions.totalTokens`         | 🔍     |       |
| Response Time       | -                                         | `chatinteractions.averageResponseTime` | 🔍     |       |

### 2.4 Agent Personalization (Per User)

| Feature                   | Endpoint                               | Collection/Field                     | Status | Notes |
| ------------------------- | -------------------------------------- | ------------------------------------ | ------ | ----- |
| Agent Personality Setting | `PUT /api/agents/:agentId/personality` | `userpreferences` or new collection? | 🔍     |       |
| Agent Voice Setting       | `PUT /api/agents/:agentId/voice`       | `userpreferences`                    | 🔍     |       |
| Agent Response Style      | `PUT /api/agents/:agentId/style`       | `userpreferences`                    | 🔍     |       |
| Favorite Agents           | `POST /api/agents/:agentId/favorite`   | `userpreferences.favoriteAgents`     | 🔍     |       |
| Recent Agents             | -                                      | `userpreferences.recentAgents`       | 🔍     |       |

---

## 3. 💳 BILLING & PAYMENTS

### 3.1 Stripe Integration

| Feature                 | Endpoint                                      | Collection/Field                | Status | Notes |
| ----------------------- | --------------------------------------------- | ------------------------------- | ------ | ----- |
| Create Checkout Session | `POST /api/stripe/checkout`                   | -                               | 🔍     |       |
| Webhook Handler         | `POST /api/stripe/webhook`                    | `subscriptions`, `transactions` | 🔍     |       |
| Get Payment Methods     | `GET /api/stripe/payment-methods`             | -                               | 🔍     |       |
| Add Payment Method      | `POST /api/stripe/payment-methods`            | -                               | 🔍     |       |
| Remove Payment Method   | `DELETE /api/stripe/payment-methods/:id`      | -                               | 🔍     |       |
| Set Default Payment     | `PUT /api/stripe/payment-methods/:id/default` | -                               | 🔍     |       |

### 3.2 Transactions & Invoices

| Feature              | Endpoint                                  | Collection/Field | Status | Notes |
| -------------------- | ----------------------------------------- | ---------------- | ------ | ----- |
| Transaction History  | `GET /api/billing/transactions`           | `transactions`   | 🔍     |       |
| Get Invoice          | `GET /api/billing/invoices/:id`           | `transactions`   | 🔍     |       |
| Download Invoice PDF | `GET /api/billing/invoices/:id/pdf`       | -                | 🔍     |       |
| Refund Request       | `POST /api/billing/refund/:transactionId` | `transactions`   | 🔍     |       |

### 3.3 Plans & Pricing

| Feature          | Endpoint                          | Collection/Field | Status | Notes |
| ---------------- | --------------------------------- | ---------------- | ------ | ----- |
| Get Plans        | `GET /api/plans`                  | `plans`          | 🔍     |       |
| Get Plan Details | `GET /api/plans/:id`              | `plans`          | 🔍     |       |
| Apply Coupon     | `POST /api/coupons/apply`         | `coupons`        | 🔍     |       |
| Validate Coupon  | `GET /api/coupons/validate/:code` | `coupons`        | 🔍     |       |

---

## 4. 📊 ANALYTICS & TRACKING

### 4.1 Visitor Tracking

| Feature            | Endpoint                      | Collection/Field      | Status | Notes |
| ------------------ | ----------------------------- | --------------------- | ------ | ----- |
| Track Visitor      | `POST /api/analytics/visitor` | `visitors`            | 🔍     |       |
| Update Visit Count | -                             | `visitors.visits`     | 🔍     |       |
| Device Info        | -                             | `visitors.deviceInfo` | 🔍     |       |
| Geo Info           | -                             | `visitors.geoInfo`    | 🔍     |       |
| UTM Tracking       | -                             | `visitors.utmParams`  | 🔍     |       |

### 4.2 Session Tracking

| Feature                | Endpoint                            | Collection/Field     | Status | Notes |
| ---------------------- | ----------------------------------- | -------------------- | ------ | ----- |
| Start Session          | `POST /api/analytics/session/start` | `sessions`           | 🔍     |       |
| End Session            | `POST /api/analytics/session/end`   | `sessions`           | 🔍     |       |
| Session Duration       | -                                   | `sessions.duration`  | 🔍     |       |
| Page Views per Session | -                                   | `sessions.pageViews` | 🔍     |       |

### 4.3 Page Views

| Feature         | Endpoint                       | Collection/Field        | Status | Notes |
| --------------- | ------------------------------ | ----------------------- | ------ | ----- |
| Track Page View | `POST /api/analytics/pageview` | `pageviews`             | 🔍     |       |
| Time on Page    | -                              | `pageviews.timeSpent`   | 🔍     |       |
| Scroll Depth    | -                              | `pageviews.scrollDepth` | 🔍     |       |

### 4.4 Event Tracking

| Feature                | Endpoint                    | Collection/Field   | Status | Notes |
| ---------------------- | --------------------------- | ------------------ | ------ | ----- |
| Track User Event       | `POST /api/analytics/event` | `userevents`       | 🔍     |       |
| Track Chat Interaction | `POST /api/analytics/chat`  | `chatinteractions` | 🔍     |       |
| Track Tool Usage       | `POST /api/analytics/tool`  | `toolusages`       | 🔍     |       |
| Track API Usage        | -                           | `apiusages`        | 🔍     |       |

---

## 5. 👥 COMMUNITY

### 5.1 Posts

| Feature        | Endpoint                             | Collection/Field          | Status | Notes |
| -------------- | ------------------------------------ | ------------------------- | ------ | ----- |
| Create Post    | `POST /api/community/posts`          | `communityposts`          | 🔍     |       |
| Get Posts      | `GET /api/community/posts`           | `communityposts`          | 🔍     |       |
| Get Post by ID | `GET /api/community/posts/:id`       | `communityposts`          | 🔍     |       |
| Update Post    | `PUT /api/community/posts/:id`       | `communityposts`          | 🔍     |       |
| Delete Post    | `DELETE /api/community/posts/:id`    | `communityposts`          | 🔍     |       |
| Pin Post       | `PATCH /api/community/posts/:id/pin` | `communityposts.isPinned` | 🔍     |       |

### 5.2 Comments

| Feature        | Endpoint                                     | Collection/Field    | Status | Notes |
| -------------- | -------------------------------------------- | ------------------- | ------ | ----- |
| Add Comment    | `POST /api/community/posts/:postId/comments` | `communitycomments` | 🔍     |       |
| Get Comments   | `GET /api/community/posts/:postId/comments`  | `communitycomments` | 🔍     |       |
| Update Comment | `PUT /api/community/comments/:id`            | `communitycomments` | 🔍     |       |
| Delete Comment | `DELETE /api/community/comments/:id`         | `communitycomments` | 🔍     |       |

### 5.3 Likes

| Feature           | Endpoint                                   | Collection/Field | Status | Notes |
| ----------------- | ------------------------------------------ | ---------------- | ------ | ----- |
| Like Post         | `POST /api/community/posts/:postId/like`   | `communitylikes` | 🔍     |       |
| Unlike Post       | `DELETE /api/community/posts/:postId/like` | `communitylikes` | 🔍     |       |
| Check Like Status | `GET /api/community/posts/:postId/liked`   | `communitylikes` | 🔍     |       |

### 5.4 Groups (Future)

| Feature      | Endpoint                               | Collection/Field       | Status | Notes |
| ------------ | -------------------------------------- | ---------------------- | ------ | ----- |
| Create Group | `POST /api/community/groups`           | `communitygroups`      | 🔍     |       |
| Join Group   | `POST /api/community/groups/:id/join`  | `communitymemberships` | 🔍     |       |
| Leave Group  | `POST /api/community/groups/:id/leave` | `communitymemberships` | 🔍     |       |

### 5.5 Events (Future)

| Feature      | Endpoint                              | Collection/Field            | Status | Notes |
| ------------ | ------------------------------------- | --------------------------- | ------ | ----- |
| Create Event | `POST /api/community/events`          | `communityevents`           | 🔍     |       |
| RSVP Event   | `POST /api/community/events/:id/rsvp` | `communityevents.attendees` | 🔍     |       |

---

## 6. 🎮 GAMIFICATION

### 6.1 Rewards & Points

| Feature            | Endpoint                                     | Collection/Field        | Status | Notes |
| ------------------ | -------------------------------------------- | ----------------------- | ------ | ----- |
| Get User Points    | `GET /api/gamification/points`               | `rewardscenters`        | 🔍     |       |
| Add Points         | `POST /api/gamification/points/add`          | `rewardscenters`        | 🔍     |       |
| Get Achievements   | `GET /api/gamification/achievements`         | `rewardscenters`        | 🔍     |       |
| Unlock Achievement | `POST /api/gamification/achievements/unlock` | `rewardscenters`        | 🔍     |       |
| Get Leaderboard    | `GET /api/gamification/leaderboard`          | `rewardscenters`        | 🔍     |       |
| Daily Streak       | -                                            | `rewardscenters.streak` | 🔍     |       |

---

## 7. 🔔 NOTIFICATIONS

### 7.1 User Notifications

| Feature                  | Endpoint                             | Collection/Field                  | Status | Notes |
| ------------------------ | ------------------------------------ | --------------------------------- | ------ | ----- |
| Get Notifications        | `GET /api/notifications`             | `notifications`                   | 🔍     |       |
| Mark as Read             | `PATCH /api/notifications/:id/read`  | `notifications`                   | 🔍     |       |
| Mark All Read            | `PATCH /api/notifications/read-all`  | `notifications`                   | 🔍     |       |
| Delete Notification      | `DELETE /api/notifications/:id`      | `notifications`                   | 🔍     |       |
| Notification Preferences | `PUT /api/notifications/preferences` | `users.preferences.notifications` | 🔍     |       |

---

## 8. 🛡️ ADMIN

### 8.1 Admin Analytics

| Feature         | Endpoint                             | Collection/Field          | Status | Notes |
| --------------- | ------------------------------------ | ------------------------- | ------ | ----- |
| Dashboard Stats | `GET /api/admin/analytics/dashboard` | multiple                  | 🔍     |       |
| User Stats      | `GET /api/admin/analytics/users`     | `users`                   | 🔍     |       |
| Revenue Stats   | `GET /api/admin/analytics/revenue`   | `transactions`            | 🔍     |       |
| Agent Stats     | `GET /api/admin/analytics/agents`    | `agents`, `subscriptions` | 🔍     |       |

### 8.2 User Management

| Feature          | Endpoint                          | Collection/Field | Status | Notes |
| ---------------- | --------------------------------- | ---------------- | ------ | ----- |
| List Users       | `GET /api/admin/users`            | `users`          | 🔍     |       |
| Get User         | `GET /api/admin/users/:id`        | `users`          | 🔍     |       |
| Update User Role | `PATCH /api/admin/users/:id/role` | `users.role`     | 🔍     |       |
| Ban User         | `POST /api/admin/users/:id/ban`   | `users.isActive` | 🔍     |       |
| Delete User      | `DELETE /api/admin/users/:id`     | `users`          | 🔍     |       |

---

## 🔄 VERIFICATION PROCESS

### Step 1: Endpoint Audit

For each endpoint:

1. Check if route exists in backend
2. Check if it connects to correct collection
3. Test with Postman/curl
4. Verify data appears in MongoDB

### Step 2: Frontend Integration Audit

For each feature:

1. Check if frontend calls the endpoint
2. Check if response is handled correctly
3. Check if UI updates properly
4. Check error handling

### Step 3: Data Integrity Audit

For each collection:

1. Check schema validation
2. Check required fields
3. Check indexes exist
4. Check for orphaned data

---

## 📁 FILES TO VERIFY

### Backend Routes

- [ ] `backend/routes/session.js` - Auth endpoints
- [ ] `backend/routes/user.js` - User profile endpoints
- [ ] `backend/routes/agentSubscriptions.js` - Subscription endpoints
- [ ] `backend/routes/analytics.js` - Analytics endpoints
- [ ] `backend/routes/community.js` - Community endpoints
- [ ] `backend/routes/agents.js` - Agent endpoints
- [ ] `backend/routes/gamification.js` - Gamification endpoints
- [ ] `backend/routes/admin-analytics.js` - Admin endpoints

### Frontend Services

- [ ] `frontend/services/auth.ts` - Auth API calls
- [ ] `frontend/services/user.ts` - User API calls
- [ ] `frontend/services/agents.ts` - Agent API calls
- [ ] `frontend/services/analytics.ts` - Analytics API calls
- [ ] `frontend/services/stripe.ts` - Payment API calls

### Frontend Pages

- [ ] `/dashboard` - Dashboard data loading
- [ ] `/settings` - Settings saving
- [ ] `/settings/security` - Security features
- [ ] `/settings/billing` - Billing data
- [ ] `/agents` - Agent listing
- [ ] `/agents/[slug]` - Agent details
- [ ] `/community` - Community posts
- [ ] `/chat` - Chat functionality

---

## 🚀 ACTION PLAN

### Phase 1: Audit (Day 1)

1. Run through each endpoint with test requests
2. Mark status in this document
3. Identify all ❌ and ⚠️ items

### Phase 2: Fix Critical (Day 2)

1. Fix authentication issues
2. Fix profile saving issues
3. Fix subscription issues

### Phase 3: Fix Secondary (Day 3)

1. Fix analytics tracking
2. Fix community features
3. Fix gamification

### Phase 4: Verify (Day 4)

1. Re-test all endpoints
2. Test full user flows
3. Update documentation

---

## 🧪 TESTING COMMANDS

### Quick MongoDB Verification

```javascript
// Connect to MongoDB and check collections
use('onelastai');

// Count documents in each collection
db.users.countDocuments();
db.subscriptions.countDocuments();
db.agents.countDocuments();
db.chatinteractions.countDocuments();
db.visitors.countDocuments();
db.sessions.countDocuments();
db.communityposts.countDocuments();

// Find recent users
db.users.find().sort({ createdAt: -1 }).limit(5);

// Find active subscriptions
db.subscriptions.find({ status: 'active' });

// Check if indexes exist
db.users.getIndexes();
db.subscriptions.getIndexes();
```

### API Testing with curl

```bash
# Test login
curl -X POST http://localhost:5000/api/session/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test get profile
curl http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test get agents
curl http://localhost:5000/api/agents
```

---

_This is a living document - update status as we verify each feature!_
