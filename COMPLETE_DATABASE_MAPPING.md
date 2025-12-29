# 🔥 OneLastAI - COMPLETE PLATFORM DATABASE MAPPING

## TOTAL PAGES: 169 | COMPLETE USER JOURNEY TRACKING

---

## 📊 PLATFORM STATISTICS

| Category        | Count |
| --------------- | ----- |
| Total Pages     | 169   |
| Agent Pages     | 28    |
| Tool Pages      | 28    |
| Lab Experiments | 12    |
| Dashboard Pages | 12    |
| Support Pages   | 7     |
| Docs Pages      | 12    |
| Community Pages | 6     |
| Industry Pages  | 8     |
| Solution Pages  | 6     |
| Resource Pages  | 8     |
| Legal Pages     | 6     |
| Auth Pages      | 4     |
| Payment Pages   | 4     |
| About Pages     | 4     |
| Status Pages    | 3     |
| Pricing Pages   | 3     |

---

## 🎯 USER JOURNEY TRACKING

### Legend

- 🔴 **CRITICAL** - Must track, affects revenue/core functionality
- 🟡 **IMPORTANT** - Should track for analytics
- 🟢 **NICE TO HAVE** - Optional tracking
- ✅ Working | ⚠️ Partial | ❌ Not Implemented | 🔍 Needs Check

---

# PHASE 1: VISITOR JOURNEY (Anonymous)

## 1.1 First Visit Tracking 🔴

| Event                | Collection  | Fields                                                          | Status |
| -------------------- | ----------- | --------------------------------------------------------------- | ------ |
| New visitor arrives  | `visitors`  | visitorId, firstVisit, deviceInfo, geoInfo, referrer, utmParams | 🔍     |
| Session starts       | `sessions`  | sessionId, visitorId, startTime, landingPage, deviceInfo        | 🔍     |
| Page view (any page) | `pageviews` | visitorId, sessionId, page.url, page.path, timestamp            | 🔍     |

## 1.2 Landing Pages 🟡

| Page               | Route                 | Track                                 | Collection                |
| ------------------ | --------------------- | ------------------------------------- | ------------------------- |
| Home               | `/`                   | Page view, time on page, scroll depth | `pageviews`               |
| Pricing            | `/pricing`            | Page view, plan interest              | `pageviews`, `userevents` |
| Pricing Overview   | `/pricing/overview`   | Plan comparison time                  | `pageviews`               |
| Pricing Per-Agent  | `/pricing/per-agent`  | Agent pricing interest                | `pageviews`, `userevents` |
| About              | `/about`              | Page view                             | `pageviews`               |
| About Overview     | `/about/overview`     | Page view                             | `pageviews`               |
| About Team         | `/about/team`         | Team section views                    | `pageviews`               |
| About Partnerships | `/about/partnerships` | Partnership interest                  | `pageviews`, `userevents` |

---

# PHASE 2: EXPLORATION (Pre-Registration)

## 2.1 Agent Exploration 🔴

| Page                        | Route                           | What to Track                   | Collection                |
| --------------------------- | ------------------------------- | ------------------------------- | ------------------------- |
| Agents Catalog              | `/agents`                       | View time, scroll, agent clicks | `pageviews`, `userevents` |
| Agent Categories            | `/agents/categories`            | Category preferences            | `userevents`              |
| **Individual Agents (28):** |                                 |                                 |                           |
| Einstein Agent              | `/agents/einstein`              | Interest, demo usage            | `pageviews`, `userevents` |
| Tech Wizard                 | `/agents/tech-wizard`           | Interest, demo usage            | `pageviews`, `userevents` |
| Comedy King                 | `/agents/comedy-king`           | Interest                        | `pageviews`, `userevents` |
| Drama Queen                 | `/agents/drama-queen`           | Interest                        | `pageviews`, `userevents` |
| Fitness Guru                | `/agents/fitness-guru`          | Interest                        | `pageviews`, `userevents` |
| Travel Buddy                | `/agents/travel-buddy`          | Interest                        | `pageviews`, `userevents` |
| Chef Biew                   | `/agents/chef-biew`             | Interest                        | `pageviews`, `userevents` |
| Julie Girlfriend            | `/agents/julie-girlfriend`      | Interest                        | `pageviews`, `userevents` |
| Mrs Boss                    | `/agents/mrs-boss`              | Interest                        | `pageviews`, `userevents` |
| Emma Emotional              | `/agents/emma-emotional`        | Interest                        | `pageviews`, `userevents` |
| Professor Astrology         | `/agents/professor-astrology`   | Interest                        | `pageviews`, `userevents` |
| Nid Gaming                  | `/agents/nid-gaming`            | Interest                        | `pageviews`, `userevents` |
| Ben Sega                    | `/agents/ben-sega`              | Interest                        | `pageviews`, `userevents` |
| Knight Logic                | `/agents/knight-logic`          | Interest                        | `pageviews`, `userevents` |
| Chess Player                | `/agents/chess-player`          | Interest                        | `pageviews`, `userevents` |
| Bishop Burger               | `/agents/bishop-burger`         | Interest                        | `pageviews`, `userevents` |
| Rook Jokey                  | `/agents/rook-jokey`            | Interest                        | `pageviews`, `userevents` |
| Lazy Pawn                   | `/agents/lazy-pawn`             | Interest                        | `pageviews`, `userevents` |
| Voice Agent                 | `/agents/voice`                 | Interest, voice test            | `pageviews`, `userevents` |
| Random Agent                | `/agents/random`                | Random discovery                | `pageviews`, `userevents` |
| Create Agent                | `/agents/create`                | Custom agent interest           | `pageviews`, `userevents` |
| Neural Chat Demo            | `/agents/neural-chat-demo`      | Demo interactions               | `chatinteractions`        |
| Enhanced Chat Demo          | `/agents/enhanced-chat-demo`    | Demo interactions               | `chatinteractions`        |
| Enhanced Demo Working       | `/agents/enhanced-demo-working` | Demo interactions               | `chatinteractions`        |
| PDF Demo                    | `/agents/pdf-demo`              | PDF feature interest            | `pageviews`, `userevents` |
| Multimodal Example          | `/agents/multimodal-example`    | Multimodal interest             | `pageviews`, `userevents` |
| Multilingual Demo           | `/agents/multilingual-demo`     | Language interest               | `pageviews`, `userevents` |
| Settings Demo               | `/agents/settings-demo`         | Settings exploration            | `pageviews`               |

## 2.2 Tool Exploration 🟡 (28 Tools)

| Tool                     | Route                           | What to Track            | Collection   |
| ------------------------ | ------------------------------- | ------------------------ | ------------ |
| **Network & DNS Tools:** |                                 |                          |              |
| IP Info                  | `/tools/ip-info`                | IP lookup usage, results | `toolusages` |
| IP Geolocation           | `/tools/ip-geolocation`         | Geo lookup usage         | `toolusages` |
| IP Netblocks             | `/tools/ip-netblocks`           | Netblock queries         | `toolusages` |
| DNS Lookup               | `/tools/dns-lookup`             | DNS queries              | `toolusages` |
| DNS Lookup Advanced      | `/tools/dns-lookup-advanced`    | Advanced DNS queries     | `toolusages` |
| WHOIS Lookup             | `/tools/whois-lookup`           | WHOIS queries            | `toolusages` |
| MAC Lookup               | `/tools/mac-lookup`             | MAC address queries      | `toolusages` |
| Ping Test                | `/tools/ping-test`              | Ping tests run           | `toolusages` |
| Traceroute               | `/tools/traceroute`             | Traceroute runs          | `toolusages` |
| Port Scanner             | `/tools/port-scanner`           | Port scans run           | `toolusages` |
| Speed Test               | `/tools/speed-test`             | Speed tests run          | `toolusages` |
| Network Tools            | `/tools/network-tools`          | Multi-tool usage         | `toolusages` |
| **Domain Tools:**        |                                 |                          |              |
| Domain Availability      | `/tools/domain-availability`    | Domain checks            | `toolusages` |
| Domain Reputation        | `/tools/domain-reputation`      | Reputation checks        | `toolusages` |
| Domain Research          | `/tools/domain-research`        | Research queries         | `toolusages` |
| SSL Checker              | `/tools/ssl-checker`            | SSL checks               | `toolusages` |
| Website Categorization   | `/tools/website-categorization` | Category checks          | `toolusages` |
| **Security Tools:**      |                                 |                          |              |
| Threat Intelligence      | `/tools/threat-intelligence`    | Threat lookups           | `toolusages` |
| **Developer Tools:**     |                                 |                          |              |
| Developer Utils          | `/tools/developer-utils`        | Util page views          | `pageviews`  |
| JSON Formatter           | `/tools/json-formatter`         | JSON formats             | `toolusages` |
| Base64                   | `/tools/base64`                 | Encode/decode ops        | `toolusages` |
| Hash Generator           | `/tools/hash-generator`         | Hash generations         | `toolusages` |
| UUID Generator           | `/tools/uuid-generator`         | UUID generations         | `toolusages` |
| Timestamp Converter      | `/tools/timestamp-converter`    | Conversions              | `toolusages` |
| URL Parser               | `/tools/url-parser`             | URL parses               | `toolusages` |
| Regex Tester             | `/tools/regex-tester`           | Regex tests              | `toolusages` |
| API Tester               | `/tools/api-tester`             | API tests                | `toolusages` |
| Color Picker             | `/tools/color-picker`           | Color picks              | `toolusages` |

## 2.3 AI Lab Exploration 🟡 (12 Experiments)

| Experiment         | Route                     | What to Track                     | Collection             |
| ------------------ | ------------------------- | --------------------------------- | ---------------------- |
| Lab Home           | `/lab`                    | Lab interest                      | `pageviews`            |
| Lab Analytics      | `/lab/analytics`          | Analytics usage                   | `pageviews`            |
| **Experiments:**   |                           |                                   |                        |
| Neural Art         | `/lab/neural-art`         | Art generations, prompts, results | `labexperiments` (NEW) |
| Image Playground   | `/lab/image-playground`   | Image manipulations               | `labexperiments`       |
| Music Generator    | `/lab/music-generator`    | Music generations                 | `labexperiments`       |
| Voice Cloning      | `/lab/voice-cloning`      | Voice clones created              | `labexperiments`       |
| Story Weaver       | `/lab/story-weaver`       | Stories generated                 | `labexperiments`       |
| Dream Interpreter  | `/lab/dream-interpreter`  | Dream interpretations             | `labexperiments`       |
| Emotion Visualizer | `/lab/emotion-visualizer` | Emotion analyses                  | `labexperiments`       |
| Personality Mirror | `/lab/personality-mirror` | Personality tests                 | `labexperiments`       |
| Future Predictor   | `/lab/future-predictor`   | Predictions made                  | `labexperiments`       |
| Battle Arena       | `/lab/battle-arena`       | Battles run                       | `labexperiments`       |
| Debate Arena       | `/lab/debate-arena`       | Debates run                       | `labexperiments`       |

## 2.4 Demo Pages 🟡

| Page       | Route         | What to Track      | Collection         |
| ---------- | ------------- | ------------------ | ------------------ |
| Demo       | `/demo`       | Demo interactions  | `chatinteractions` |
| Voice Demo | `/voice-demo` | Voice interactions | `chatinteractions` |
| Test Chat  | `/test-chat`  | Test chat messages | `chatinteractions` |
| Dark Theme | `/dark-theme` | Theme preference   | `userevents`       |

---

# PHASE 3: AUTHENTICATION 🔴

## 3.1 Sign Up Flow

| Step                    | Route/Action                 | What to Track    | Collection                   |
| ----------------------- | ---------------------------- | ---------------- | ---------------------------- |
| Visit Signup            | `/signup` or `/auth/signup`  | Signup page view | `pageviews`                  |
| Auth Page               | `/auth`                      | Auth landing     | `pageviews`                  |
| Login Page              | `/auth/login`                | Login page view  | `pageviews`                  |
| Reset Password          | `/auth/reset-password`       | Reset attempts   | `userevents`, `securityLogs` |
| **Registration Submit** | `POST /api/session/register` | User creation    | `users`                      |
| - Email                 | -                            | Store email      | `users.email`                |
| - Name                  | -                            | Store name       | `users.name`                 |
| - Password              | -                            | Store hashed     | `users.password`             |
| - Created timestamp     | -                            | Store            | `users.createdAt`            |
| - Initial preferences   | -                            | Store defaults   | `users.preferences`          |
| Email verification sent | -                            | Track            | `userevents`                 |

## 3.2 Login Flow

| Step                    | Action                    | What to Track           | Collection                   |
| ----------------------- | ------------------------- | ----------------------- | ---------------------------- |
| Login attempt           | `POST /api/session/login` | Login event             | `userevents`, `securityLogs` |
| - Success               | -                         | Update lastLoginAt      | `users.lastLoginAt`          |
| - Failure               | -                         | Increment loginAttempts | `users.loginAttempts`        |
| - Lockout               | -                         | Set lockUntil           | `users.lockUntil`            |
| Session created         | -                         | New session             | `sessions`                   |
| 2FA prompt (if enabled) | -                         | 2FA event               | `securityLogs`               |
| 2FA verify              | -                         | 2FA success/fail        | `securityLogs`               |

---

# PHASE 4: USER DASHBOARD 🔴 (12 Sections)

## 4.1 Dashboard Overview

| Page           | Route                 | What to Track         | Collection  |
| -------------- | --------------------- | --------------------- | ----------- |
| Dashboard Home | `/dashboard`          | Dashboard views       | `pageviews` |
| Overview       | `/dashboard/overview` | Overview metrics load | `pageviews` |

### Data to Display & Track:

- Total agents subscribed
- Active conversations
- Usage statistics
- Recent activity

## 4.2 Profile Management 🔴

| Feature             | Route                | Endpoint                            | Collection.Field      | Status |
| ------------------- | -------------------- | ----------------------------------- | --------------------- | ------ |
| View Profile        | `/dashboard/profile` | `GET /api/user/profile`             | `users`               | 🔍     |
| Update Name         | -                    | `PUT /api/user/profile/:id`         | `users.name`          | 🔍     |
| Update Email        | -                    | `PUT /api/user/profile/:id`         | `users.email`         | 🔍     |
| Update Avatar       | -                    | `POST /api/user/profile/:id/avatar` | `users.avatar`        | 🔍     |
| Update Bio          | -                    | `PUT /api/user/profile/:id`         | `users.bio`           | 🔍     |
| Update Phone        | -                    | `PUT /api/user/profile/:id`         | `users.phoneNumber`   | 🔍     |
| Update Location     | -                    | `PUT /api/user/profile/:id`         | `users.location`      | 🔍     |
| Update Timezone     | -                    | `PUT /api/user/profile/:id`         | `users.timezone`      | 🔍     |
| Update Profession   | -                    | `PUT /api/user/profile/:id`         | `users.profession`    | 🔍     |
| Update Company      | -                    | `PUT /api/user/profile/:id`         | `users.company`       | 🔍     |
| Update Website      | -                    | `PUT /api/user/profile/:id`         | `users.website`       | 🔍     |
| Update Social Links | -                    | `PUT /api/user/profile/:id`         | `users.socialLinks.*` | 🔍     |
| Profile Changes Log | -                    | -                                   | `securityLogs`        | 🔍     |

## 4.3 Preferences 🟡

| Feature                 | Route                    | Endpoint                                  | Collection.Field                         | Status |
| ----------------------- | ------------------------ | ----------------------------------------- | ---------------------------------------- | ------ |
| View Preferences        | `/dashboard/preferences` | `GET /api/user/profile/:id`               | `users.preferences`                      | 🔍     |
| Language Setting        | -                        | `PATCH /api/user/profile/:id/preferences` | `users.preferences.language`             | 🔍     |
| Theme Setting           | -                        | `PATCH /api/user/profile/:id/preferences` | `users.preferences.theme`                | 🔍     |
| Email Notifications     | -                        | `PATCH /api/user/profile/:id/preferences` | `users.preferences.notifications.email`  | 🔍     |
| Push Notifications      | -                        | `PATCH /api/user/profile/:id/preferences` | `users.preferences.notifications.push`   | 🔍     |
| SMS Notifications       | -                        | `PATCH /api/user/profile/:id/preferences` | `users.preferences.notifications.sms`    | 🔍     |
| Privacy - Show Profile  | -                        | `PATCH /api/user/profile/:id/preferences` | `users.preferences.privacy.showProfile`  | 🔍     |
| Privacy - Show Activity | -                        | `PATCH /api/user/profile/:id/preferences` | `users.preferences.privacy.showActivity` | 🔍     |

## 4.4 Security Settings 🔴

| Feature               | Route                 | Endpoint                          | Collection.Field                                  | Status |
| --------------------- | --------------------- | --------------------------------- | ------------------------------------------------- | ------ |
| View Security         | `/dashboard/security` | -                                 | -                                                 | 🔍     |
| Change Password       | -                     | `POST /api/auth/change-password`  | `users.password`                                  | 🔍     |
| Change Email          | -                     | `POST /api/auth/change-email`     | `users.email`                                     | 🔍     |
| Enable 2FA            | -                     | `POST /api/auth/2fa/enable`       | `users.twoFactorEnabled`, `users.twoFactorSecret` | 🔍     |
| Disable 2FA           | -                     | `POST /api/auth/2fa/disable`      | `users.twoFactorEnabled`                          | 🔍     |
| Generate Backup Codes | -                     | `POST /api/auth/2fa/backup-codes` | `users.backupCodes`                               | 🔍     |
| View Active Sessions  | -                     | `GET /api/auth/sessions`          | `sessions`                                        | 🔍     |
| Revoke Session        | -                     | `DELETE /api/auth/sessions/:id`   | `sessions`                                        | 🔍     |
| View Security Log     | -                     | `GET /api/security/logs`          | `securityLogs`                                    | 🔍     |
| Password Change Log   | -                     | -                                 | `securityLogs`                                    | 🔍     |
| 2FA Change Log        | -                     | -                                 | `securityLogs`                                    | 🔍     |
| Login History         | -                     | -                                 | `securityLogs`                                    | 🔍     |

## 4.5 Billing & Payments 🔴

| Feature               | Route                | Endpoint                                      | Collection.Field       | Status |
| --------------------- | -------------------- | --------------------------------------------- | ---------------------- | ------ |
| View Billing          | `/dashboard/billing` | -                                             | -                      | 🔍     |
| Current Plan          | -                    | `GET /api/billing/plan`                       | `subscriptions`        | 🔍     |
| Payment Methods       | -                    | `GET /api/stripe/payment-methods`             | Stripe                 | 🔍     |
| Add Payment Method    | -                    | `POST /api/stripe/payment-methods`            | Stripe                 | 🔍     |
| Remove Payment Method | -                    | `DELETE /api/stripe/payment-methods/:id`      | Stripe                 | 🔍     |
| Set Default Payment   | -                    | `PUT /api/stripe/payment-methods/:id/default` | Stripe                 | 🔍     |
| Transaction History   | -                    | `GET /api/billing/transactions`               | `transactions`         | 🔍     |
| View Invoice          | -                    | `GET /api/billing/invoices/:id`               | `transactions`         | 🔍     |
| Download Invoice PDF  | -                    | `GET /api/billing/invoices/:id/pdf`           | -                      | 🔍     |
| Apply Coupon          | -                    | `POST /api/coupons/apply`                     | `coupons`              | 🔍     |
| Cancel Subscription   | -                    | `POST /api/billing/cancel`                    | `subscriptions.status` | 🔍     |
| Upgrade Plan          | -                    | `POST /api/billing/upgrade`                   | `subscriptions`        | 🔍     |
| Refund Request        | -                    | `POST /api/billing/refund`                    | `transactions`         | 🔍     |

## 4.6 Agent Management 🔴

| Feature                   | Route                         | Endpoint                                        | Collection.Field           | Status |
| ------------------------- | ----------------------------- | ----------------------------------------------- | -------------------------- | ------ |
| View My Agents            | `/dashboard/agent-management` | `GET /api/agent-subscriptions/user/:userId`     | `subscriptions`            | 🔍     |
| Agent Subscription Status | -                             | -                                               | `subscriptions.status`     | 🔍     |
| Agent Expiry Date         | -                             | -                                               | `subscriptions.expiryDate` | 🔍     |
| Renew Agent               | -                             | `POST /api/agent-subscriptions/renew/:id`       | `subscriptions`            | 🔍     |
| Cancel Agent              | -                             | `POST /api/agent-subscriptions/cancel/:id`      | `subscriptions.status`     | 🔍     |
| Auto-Renew Toggle         | -                             | `PATCH /api/agent-subscriptions/:id/auto-renew` | `subscriptions.autoRenew`  | 🔍     |
| Subscribe to New Agent    | -                             | `POST /api/agent-subscriptions/subscribe`       | `subscriptions`            | 🔍     |

## 4.7 Agent Performance 🟡

| Feature           | Route                          | Endpoint                            | Collection.Field                       | Status |
| ----------------- | ------------------------------ | ----------------------------------- | -------------------------------------- | ------ |
| View Performance  | `/dashboard/agent-performance` | -                                   | -                                      | 🔍     |
| Agent Usage Stats | -                              | `GET /api/analytics/agent/:agentId` | `chatinteractions`                     | 🔍     |
| Messages Sent     | -                              | -                                   | `chatinteractions.totalMessages`       | 🔍     |
| Response Times    | -                              | -                                   | `chatinteractions.averageResponseTime` | 🔍     |
| Token Usage       | -                              | -                                   | `chatinteractions.totalTokens`         | 🔍     |

## 4.8 Conversation History 🔴

| Feature              | Route                             | Endpoint                           | Collection.Field   | Status |
| -------------------- | --------------------------------- | ---------------------------------- | ------------------ | ------ |
| View History         | `/dashboard/conversation-history` | `GET /api/chat/user/:userId`       | `chatinteractions` | 🔍     |
| List Conversations   | -                                 | -                                  | `chatinteractions` | 🔍     |
| View Conversation    | -                                 | `GET /api/chat/:conversationId`    | `chatinteractions` | 🔍     |
| Delete Conversation  | -                                 | `DELETE /api/chat/:conversationId` | `chatinteractions` | 🔍     |
| Search Conversations | -                                 | `GET /api/chat/search`             | `chatinteractions` | 🔍     |
| Export Conversation  | -                                 | `GET /api/chat/:id/export`         | -                  | 🔍     |

## 4.9 Performance Metrics 🟡

| Feature       | Route                            | Endpoint                        | Collection.Field | Status |
| ------------- | -------------------------------- | ------------------------------- | ---------------- | ------ |
| View Metrics  | `/dashboard/performance-metrics` | -                               | -                | 🔍     |
| API Calls     | -                                | `GET /api/analytics/api-usage`  | `apiusages`      | 🔍     |
| Tool Usage    | -                                | `GET /api/analytics/tool-usage` | `toolusages`     | 🔍     |
| Monthly Stats | -                                | -                               | aggregated       | 🔍     |

## 4.10 Analytics 🟡

| Feature         | Route                  | Endpoint                   | Collection.Field   | Status |
| --------------- | ---------------------- | -------------------------- | ------------------ | ------ |
| View Analytics  | `/dashboard/analytics` | -                          | -                  | 🔍     |
| Usage Over Time | -                      | `GET /api/analytics/usage` | multiple           | 🔍     |
| Agent Breakdown | -                      | -                          | `chatinteractions` | 🔍     |
| Tool Breakdown  | -                      | -                          | `toolusages`       | 🔍     |

## 4.11 Rewards 🟡

| Feature              | Route                | Endpoint                             | Collection.Field              | Status |
| -------------------- | -------------------- | ------------------------------------ | ----------------------------- | ------ |
| View Rewards         | `/dashboard/rewards` | `GET /api/gamification/metrics`      | `rewardscenters`              | 🔍     |
| Total Points         | -                    | -                                    | `rewardscenters.points`       | 🔍     |
| Achievements         | -                    | `GET /api/gamification/achievements` | `rewardscenters.achievements` | 🔍     |
| Daily Streak         | -                    | -                                    | `rewardscenters.streak`       | 🔍     |
| Leaderboard Position | -                    | `GET /api/gamification/leaderboard`  | `rewardscenters`              | 🔍     |
| Redeem Rewards       | -                    | `POST /api/gamification/redeem`      | `rewardscenters`              | 🔍     |

## 4.12 Advanced Dashboard 🟡

| Feature       | Route                 | Endpoint | Collection.Field | Status |
| ------------- | --------------------- | -------- | ---------------- | ------ |
| Advanced View | `/dashboard-advanced` | -        | -                | 🔍     |

---

# PHASE 5: AGENT INTERACTIONS 🔴

## 5.1 Agent Chat Flow

| Event                       | Endpoint                      | Collection.Field                       | Status |
| --------------------------- | ----------------------------- | -------------------------------------- | ------ |
| Start Conversation          | `POST /api/chat/start`        | `chatinteractions` (new doc)           | 🔍     |
| - conversationId            | -                             | `chatinteractions.conversationId`      | 🔍     |
| - userId                    | -                             | `chatinteractions.userId`              | 🔍     |
| - agentId                   | -                             | `chatinteractions.agentId`             | 🔍     |
| - startTime                 | -                             | `chatinteractions.startTime`           | 🔍     |
| Send User Message           | `POST /api/chat/message`      | `chatinteractions.messages[]`          | 🔍     |
| - role: 'user'              | -                             | `messages[].role`                      | 🔍     |
| - content                   | -                             | `messages[].content`                   | 🔍     |
| - timestamp                 | -                             | `messages[].timestamp`                 | 🔍     |
| - tokens                    | -                             | `messages[].tokens`                    | 🔍     |
| Receive AI Response         | -                             | `chatinteractions.messages[]`          | 🔍     |
| - role: 'assistant'         | -                             | `messages[].role`                      | 🔍     |
| - content                   | -                             | `messages[].content`                   | 🔍     |
| - timestamp                 | -                             | `messages[].timestamp`                 | 🔍     |
| - tokens                    | -                             | `messages[].tokens`                    | 🔍     |
| - model                     | -                             | `messages[].model`                     | 🔍     |
| End Conversation            | -                             | `chatinteractions.endTime`             | 🔍     |
| Update Token Count          | -                             | `chatinteractions.totalTokens`         | 🔍     |
| Update Message Count        | -                             | `chatinteractions.totalMessages`       | 🔍     |
| Calculate Avg Response Time | -                             | `chatinteractions.averageResponseTime` | 🔍     |
| Rate Conversation           | `POST /api/chat/:id/feedback` | `chatinteractions.feedback`            | 🔍     |

## 5.2 Agent Personalization (Per User)

| Feature               | Endpoint                        | Collection                       | Status |
| --------------------- | ------------------------------- | -------------------------------- | ------ |
| Set Agent Personality | `PUT /api/agents/:id/settings`  | `agentpersonalizations` (NEW)    | ❌     |
| Set Response Style    | -                               | `agentpersonalizations.style`    | ❌     |
| Set Voice Preference  | -                               | `agentpersonalizations.voice`    | ❌     |
| Set Language          | -                               | `agentpersonalizations.language` | ❌     |
| Favorite Agent        | `POST /api/agents/:id/favorite` | `userfavorites` (NEW)            | ❌     |
| Recent Agents         | auto                            | `userpreferences.recentAgents`   | ❌     |

---

# PHASE 6: PAYMENTS & SUBSCRIPTIONS 🔴

## 6.1 Subscription Flow

| Event                  | Endpoint                    | Collection.Field                     | Status |
| ---------------------- | --------------------------- | ------------------------------------ | ------ |
| View Pricing           | `/pricing`                  | `pageviews`                          | 🔍     |
| Select Plan            | click                       | `userevents`                         | 🔍     |
| Visit Payment Page     | `/payment`                  | `pageviews`                          | 🔍     |
| Create Checkout        | `POST /api/stripe/checkout` | -                                    | 🔍     |
| Complete Payment       | Stripe webhook              | `transactions`                       | 🔍     |
| Create Subscription    | Stripe webhook              | `subscriptions`                      | 🔍     |
| - userId               | -                           | `subscriptions.userId`               | 🔍     |
| - agentId              | -                           | `subscriptions.agentId`              | 🔍     |
| - plan                 | -                           | `subscriptions.plan`                 | 🔍     |
| - price                | -                           | `subscriptions.price`                | 🔍     |
| - status: 'active'     | -                           | `subscriptions.status`               | 🔍     |
| - startDate            | -                           | `subscriptions.startDate`            | 🔍     |
| - expiryDate           | -                           | `subscriptions.expiryDate`           | 🔍     |
| - stripeSubscriptionId | -                           | `subscriptions.stripeSubscriptionId` | 🔍     |
| Payment Success        | `/payment/success`          | `pageviews`, `userevents`            | 🔍     |
| Payment Cancel         | `/payment/cancel`           | `pageviews`, `userevents`            | 🔍     |
| Subscription Success   | `/subscription-success`     | `pageviews`                          | 🔍     |
| Subscribe Page         | `/subscribe`                | `pageviews`                          | 🔍     |

## 6.2 Transaction Records

| Field          | Source  | Collection.Field                              | Status |
| -------------- | ------- | --------------------------------------------- | ------ |
| Transaction ID | Stripe  | `transactions.transactionId`                  | 🔍     |
| User ID        | Session | `transactions.userId`                         | 🔍     |
| Amount         | Stripe  | `transactions.amount`                         | 🔍     |
| Currency       | Stripe  | `transactions.currency`                       | 🔍     |
| Status         | Stripe  | `transactions.status`                         | 🔍     |
| Type           | -       | `transactions.type` (purchase/refund/renewal) | 🔍     |
| Agent/Plan     | -       | `transactions.item`                           | 🔍     |
| Invoice URL    | Stripe  | `transactions.invoiceUrl`                     | 🔍     |
| Receipt URL    | Stripe  | `transactions.receiptUrl`                     | 🔍     |
| Timestamp      | -       | `transactions.createdAt`                      | 🔍     |

---

# PHASE 7: TOOL USAGE 🟡

## 7.1 Tool Usage Tracking (All 28 Tools)

For EACH tool, track:

| Field         | Description       | Collection.Field                 |
| ------------- | ----------------- | -------------------------------- |
| Tool Name     | Which tool        | `toolusages.toolName`            |
| User ID       | Who used it       | `toolusages.userId`              |
| Input         | What they queried | `toolusages.input`               |
| Output/Result | What result       | `toolusages.result`              |
| Success       | Did it work       | `toolusages.result.success`      |
| Error         | If failed         | `toolusages.result.errorMessage` |
| Latency       | How long          | `toolusages.latency`             |
| Timestamp     | When              | `toolusages.timestamp`           |

---

# PHASE 8: AI LAB EXPERIMENTS 🟡

## 8.1 New Collection Needed: `labexperiments`

```javascript
const labExperimentSchema = {
  experimentId: String, // Unique ID
  experimentType: String, // neural-art, music-generator, etc.
  userId: ObjectId, // Who ran it
  sessionId: String, // Session tracking
  input: {
    prompt: String, // User prompt/input
    settings: Mixed, // Experiment-specific settings
    files: [String], // Uploaded files if any
  },
  output: {
    result: Mixed, // Generated output
    fileUrl: String, // Generated file URL
    metadata: Mixed, // Extra info
  },
  status: String, // pending, processing, completed, failed
  processingTime: Number, // How long it took
  tokensUsed: Number, // AI tokens consumed
  createdAt: Date,
  completedAt: Date,
};
```

## 8.2 Per-Experiment Tracking

| Experiment         | Special Fields to Track                             |
| ------------------ | --------------------------------------------------- |
| Neural Art         | prompt, style, resolution, generatedImageUrl        |
| Image Playground   | originalImage, transformations[], resultImage       |
| Music Generator    | genre, mood, duration, audioUrl                     |
| Voice Cloning      | sourceAudioUrl, clonedVoiceId, sampleText           |
| Story Weaver       | genre, characters[], plotPoints[], storyText        |
| Dream Interpreter  | dreamText, interpretation, symbols[]                |
| Emotion Visualizer | inputText, detectedEmotions[], visualization        |
| Personality Mirror | answers[], personalityType, traits[]                |
| Future Predictor   | question, prediction, confidence                    |
| Battle Arena       | contestant1, contestant2, topic, winner, transcript |
| Debate Arena       | topic, side1Arguments[], side2Arguments[], verdict  |

---

# PHASE 9: SUPPORT & CONTACT 🟡

## 9.1 Support Pages

| Page              | Route                        | What to Track           | Collection                |
| ----------------- | ---------------------------- | ----------------------- | ------------------------- |
| Support Home      | `/support`                   | Page view               | `pageviews`               |
| Help Center       | `/support/help-center`       | Article views, searches | `pageviews`, `userevents` |
| FAQs              | `/support/faqs`              | FAQ clicks              | `pageviews`, `userevents` |
| Create Ticket     | `/support/create-ticket`     | Ticket submissions      | `supporttickets` (NEW)    |
| Contact Us        | `/support/contact-us`        | Form submissions        | `contactmessages`         |
| Live Support      | `/support/live-support`      | Chat started            | `supportchats` (NEW)      |
| Book Consultation | `/support/book-consultation` | Bookings                | `consultations` (NEW)     |

## 9.2 Contact Form

| Field     | Collection.Field            |
| --------- | --------------------------- |
| Name      | `contactmessages.name`      |
| Email     | `contactmessages.email`     |
| Subject   | `contactmessages.subject`   |
| Message   | `contactmessages.message`   |
| Category  | `contactmessages.category`  |
| Timestamp | `contactmessages.createdAt` |
| Status    | `contactmessages.status`    |

## 9.3 Support Ticket Schema (NEW)

```javascript
const supportTicketSchema = {
  ticketId: String,
  userId: ObjectId,
  subject: String,
  description: String,
  category: String,
  priority: String, // low, medium, high, urgent
  status: String, // open, in-progress, resolved, closed
  messages: [
    {
      sender: String, // user or support
      message: String,
      timestamp: Date,
      attachments: [String],
    },
  ],
  assignedTo: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  resolvedAt: Date,
};
```

---

# PHASE 10: COMMUNITY 🟡

## 10.1 Community Pages

| Page           | Route                     | What to Track          | Collection                   |
| -------------- | ------------------------- | ---------------------- | ---------------------------- |
| Community Home | `/community`              | Page view              | `pageviews`                  |
| Overview       | `/community/overview`     | Page view              | `pageviews`                  |
| Discord        | `/community/discord`      | Discord clicks         | `userevents`                 |
| Roadmap        | `/community/roadmap`      | Feature interest       | `userevents`                 |
| Contributing   | `/community/contributing` | Contributor interest   | `userevents`                 |
| Suggestions    | `/community/suggestions`  | Suggestion submissions | `communitysuggestions` (NEW) |

## 10.2 Community Posts

| Action      | Endpoint                                 | Collection                      |
| ----------- | ---------------------------------------- | ------------------------------- |
| Create Post | `POST /api/community/posts`              | `communityposts`                |
| Get Posts   | `GET /api/community/posts`               | `communityposts`                |
| Like Post   | `POST /api/community/posts/:id/like`     | `communitylikes`                |
| Comment     | `POST /api/community/posts/:id/comments` | `communitycomments`             |
| View Post   | `GET /api/community/posts/:id`           | `communityposts` (view count++) |
| Report Post | `POST /api/community/posts/:id/report`   | `communitymoderation`           |

---

# PHASE 11: CONTENT PAGES 🟢

## 11.1 Documentation (12 pages)

| Page              | Route                          | Track       |
| ----------------- | ------------------------------ | ----------- |
| Docs Home         | `/docs`                        | `pageviews` |
| API Docs          | `/docs/api`                    | `pageviews` |
| Tutorials         | `/docs/tutorials`              | `pageviews` |
| SDKs              | `/docs/sdks`                   | `pageviews` |
| Integrations      | `/docs/integrations`           | `pageviews` |
| Agents Docs       | `/docs/agents`                 | `pageviews` |
| - Getting Started | `/docs/agents/getting-started` | `pageviews` |
| - Configuration   | `/docs/agents/configuration`   | `pageviews` |
| - API Reference   | `/docs/agents/api-reference`   | `pageviews` |
| - Troubleshooting | `/docs/agents/troubleshooting` | `pageviews` |
| - Agent Types     | `/docs/agents/agents-type`     | `pageviews` |
| - Best Practices  | `/docs/agents/best-practices`  | `pageviews` |

## 11.2 Resources (8 pages)

| Page             | Route                      | Track                        |
| ---------------- | -------------------------- | ---------------------------- |
| Resources Home   | `/resources`               | `pageviews`                  |
| Documentation    | `/resources/documentation` | `pageviews`                  |
| Webinars         | `/resources/webinars`      | `pageviews`                  |
| Webinar Register | `/webinars/register-now`   | `webinarregistrations` (NEW) |
| Tutorials        | `/resources/tutorials`     | `pageviews`                  |
| Case Studies     | `/resources/case-studies`  | `pageviews`                  |
| News             | `/resources/news`          | `pageviews`                  |
| Careers          | `/resources/careers`       | `pageviews`                  |
| Apply Job        | `/resources/apply-job`     | `jobapplications` (NEW)      |

## 11.3 Industries (8 pages)

| Page                | Route                          | Track                     |
| ------------------- | ------------------------------ | ------------------------- |
| Industries Home     | `/industries`                  | `pageviews`               |
| Overview            | `/industries/overview`         | `pageviews`               |
| Healthcare          | `/industries/healthcare`       | `pageviews`, `userevents` |
| Finance & Banking   | `/industries/finance-banking`  | `pageviews`, `userevents` |
| Education           | `/industries/education`        | `pageviews`, `userevents` |
| Technology          | `/industries/technology`       | `pageviews`, `userevents` |
| Retail & E-commerce | `/industries/retail-ecommerce` | `pageviews`, `userevents` |
| Manufacturing       | `/industries/manufacturing`    | `pageviews`, `userevents` |

## 11.4 Solutions (6 pages)

| Page               | Route                           | Track                     |
| ------------------ | ------------------------------- | ------------------------- |
| Solutions Home     | `/solutions`                    | `pageviews`               |
| Overview           | `/solutions/overview`           | `pageviews`               |
| Enterprise AI      | `/solutions/enterprise-ai`      | `pageviews`, `userevents` |
| Process Automation | `/solutions/process-automation` | `pageviews`, `userevents` |
| Smart Analytics    | `/solutions/smart-analytics`    | `pageviews`, `userevents` |
| AI Security        | `/solutions/ai-security`        | `pageviews`, `userevents` |

## 11.5 Legal (6 pages)

| Page               | Route                     | Track       |
| ------------------ | ------------------------- | ----------- |
| Legal Home         | `/legal`                  | `pageviews` |
| Terms of Service   | `/legal/terms-of-service` | `pageviews` |
| Privacy Policy     | `/legal/privacy-policy`   | `pageviews` |
| Cookie Policy      | `/legal/cookie-policy`    | `pageviews` |
| Payments & Refunds | `/legal/payments-refunds` | `pageviews` |
| Reports            | `/legal/reports`          | `pageviews` |

## 11.6 Status Pages (3 pages)

| Page        | Route                | Track       |
| ----------- | -------------------- | ----------- |
| Status Home | `/status`            | `pageviews` |
| API Status  | `/status/api-status` | `pageviews` |
| Analytics   | `/status/analytics`  | `pageviews` |

---

# PHASE 12: ADMIN 🔴

## 12.1 Admin Analytics

| Feature            | Route              | Endpoint                                 | Collection                          |
| ------------------ | ------------------ | ---------------------------------------- | ----------------------------------- |
| Admin Dashboard    | `/admin/analytics` | `GET /api/admin/analytics/dashboard`     | multiple                            |
| User Stats         | -                  | `GET /api/admin/analytics/users`         | `users`                             |
| Revenue Stats      | -                  | `GET /api/admin/analytics/revenue`       | `transactions`                      |
| Subscription Stats | -                  | `GET /api/admin/analytics/subscriptions` | `subscriptions`                     |
| Agent Stats        | -                  | `GET /api/admin/analytics/agents`        | `agents`, `chatinteractions`        |
| Tool Stats         | -                  | `GET /api/admin/analytics/tools`         | `toolusages`                        |
| Traffic Stats      | -                  | `GET /api/admin/analytics/traffic`       | `visitors`, `sessions`, `pageviews` |

---

# PHASE 13: MISCELLANEOUS PAGES 🟢

| Page     | Route       | Track             |
| -------- | ----------- | ----------------- |
| Studio   | `/studio`   | `pageviews`       |
| Config   | `/config`   | `pageviews`       |
| Security | `/security` | `pageviews`       |
| Rewards  | `/rewards`  | `pageviews`       |
| Contact  | `/contact`  | `contactmessages` |

---

# 📊 COLLECTIONS SUMMARY

## Existing Collections (20)

1. `users` - User accounts
2. `userprofiles` - Extended profiles
3. `userpreferences` - User settings
4. `usersecurities` - Security settings
5. `sessions` - Session tracking
6. `subscriptions` - Agent subscriptions
7. `visitors` - Visitor tracking
8. `pageviews` - Page view tracking
9. `agents` - Agent catalog
10. `apiusages` - API usage tracking
11. `notifications` - User notifications
12. `rewardscenters` - Gamification
13. `securityLogs` - Security audit
14. `plans` - Subscription plans
15. `coupons` - Discount coupons
16. `communityposts` - Community posts
17. `communitycomments` - Comments
18. `communitylikes` - Likes
19. `contactmessages` - Contact forms
20. `chatinteractions` - Chat history

## Collections Needed (NEW)

1. `toolusages` - Tool usage tracking
2. `userevents` - Custom event tracking
3. `transactions` - Payment transactions
4. `labexperiments` - AI Lab experiments
5. `agentpersonalizations` - Per-user agent settings
6. `userfavorites` - Favorite agents
7. `supporttickets` - Support tickets
8. `supportchats` - Live support chats
9. `consultations` - Consultation bookings
10. `communitysuggestions` - Feature suggestions
11. `webinarregistrations` - Webinar signups
12. `jobapplications` - Job applications

**TOTAL: 32 COLLECTIONS NEEDED**

---

# 🚀 IMPLEMENTATION PRIORITY

## CRITICAL (Week 1)

1. ✅ Visitor tracking (`visitors`, `sessions`, `pageviews`)
2. ✅ User auth (`users`)
3. ✅ Agent subscriptions (`subscriptions`)
4. ✅ Chat history (`chatinteractions`)
5. ✅ Transactions (`transactions`)

## HIGH (Week 2)

6. Tool usage (`toolusages`)
7. User events (`userevents`)
8. Security logs (`securityLogs`)
9. Notifications (`notifications`)

## MEDIUM (Week 3)

10. Lab experiments (`labexperiments`)
11. Agent personalization (`agentpersonalizations`)
12. Support system (`supporttickets`, `supportchats`)

## LOW (Week 4)

13. Community features (`communitysuggestions`)
14. Resources (`webinarregistrations`, `jobapplications`, `consultations`)
15. Gamification (`rewardscenters`)

---

# ✅ VERIFICATION CHECKLIST

## How to Verify Each Feature:

### 1. Check Backend Route Exists

```bash
grep -r "router.post\|router.get\|router.put\|router.patch\|router.delete" backend/routes/
```

### 2. Check Frontend Calls Endpoint

```bash
grep -r "fetch\|axios" frontend/services/
```

### 3. Check Data in MongoDB

```javascript
use('onelastai');
db.collectionName.find().limit(5);
```

### 4. Test Full Flow

1. Open feature in browser
2. Perform action
3. Check MongoDB immediately
4. Verify data stored correctly

---

_This is THE PROFESSIONAL way - every page, every click, every data point mapped!_

**NOW I'M READY TO IMPLEMENT. WHAT DO YOU WANT FIRST?**
