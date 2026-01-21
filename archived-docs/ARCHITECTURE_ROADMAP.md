# 🗺️ ARCHITECTURE ROADMAP - Next.js + Express Separation

**Date Created:** December 15, 2025  
**Status:** 🔴 NOT STARTED  
**Goal:** Clean separation between Next.js frontend and Express backend

---

## 📊 PROGRESS TRACKER

- **Group 1 (Next.js):** 0/15 tasks complete (0%)
- **Group 2 (Express):** 0/12 tasks complete (0%)
- **Group 3 (API & Database):** 0/10 tasks complete (0%)
- **TOTAL:** 0/37 tasks complete (0%)

---

## 🟦 GROUP 1: NEXT.JS RESPONSIBILITIES

### What Next.js Should Handle:

- ✅ **Frontend pages** (UI, forms, dashboards)
- ✅ **Simple API routes** (auth, user CRUD, basic queries)
- ✅ **Server-side rendering** (SEO pages)
- ✅ **Direct MongoDB access** (for lightweight operations)
- ❌ **NO heavy processing**
- ❌ **NO webhooks**
- ❌ **NO Socket.io**

---

### ✅ TASK CHECKLIST - NEXT.JS

#### 1.1 Environment Variables

- [ ] **Task:** Remove `NEXT_PUBLIC_API_URL` from all `.env` files

  - **Files:** `/.env`, `/frontend/.env`, `/frontend/.env.production`
  - **Reason:** Next.js uses relative `/api` paths, doesn't need this
  - **Status:** 🔴 Not Started

- [ ] **Task:** Add `NEXT_PUBLIC_BACKEND_URL` for Express calls
  - **Files:** `/frontend/.env`, `/frontend/.env.production`
  - **Value (dev):** `http://localhost:3005`
  - **Value (prod):** `https://maula.ai:3005` or internal IP
  - **Status:** 🔴 Not Started

#### 1.2 API Routes to Keep in Next.js

- [ ] **Task:** Keep `/api/auth/*` routes in Next.js

  - **Files:** `/frontend/app/api/auth/login/route.ts`, `signup`, `logout`, `verify`
  - **Why:** User-facing auth, needs session management
  - **Status:** 🔴 Not Started

- [ ] **Task:** Keep `/api/subscriptions/check` in Next.js

  - **File:** `/frontend/app/api/subscriptions/check/route.ts`
  - **Why:** Frontend needs quick access check
  - **Status:** 🔴 Not Started

- [ ] **Task:** Keep `/api/user/profile` in Next.js

  - **File:** `/frontend/app/api/user/profile/route.ts`
  - **Why:** Simple user data fetch
  - **Status:** 🔴 Not Started

- [ ] **Task:** Keep `/api/stripe/checkout` in Next.js
  - **File:** `/frontend/app/api/stripe/checkout/route.ts`
  - **Why:** Creates Stripe session, lightweight
  - **Status:** 🔴 Not Started

#### 1.3 API Routes to Remove from Next.js (Forward to Express)

- [ ] **Task:** Update `/api/agents/route.ts` - call Express directly

  - **File:** `/frontend/app/api/agents/route.ts`
  - **Current:** Proxies to Express
  - **New:** Remove this file, call Express from frontend
  - **Status:** 🔴 Not Started

- [ ] **Task:** Update `/api/agent-collections/route.ts` - call Express directly

  - **File:** `/frontend/app/api/agent-collections/route.ts`
  - **Action:** Remove proxy, call Express directly
  - **Status:** 🔴 Not Started

- [ ] **Task:** Update `/api/agent-subscriptions/route.ts` - call Express directly

  - **File:** `/frontend/app/api/agent-subscriptions/route.ts`
  - **Action:** Remove proxy, call Express directly
  - **Status:** 🔴 Not Started

- [ ] **Task:** Update `/api/secure-chat/route.ts` - call Express directly

  - **File:** `/frontend/app/api/secure-chat/route.ts`
  - **Action:** Remove proxy, call Express directly
  - **Status:** 🔴 Not Started

- [ ] **Task:** Update `/api/studio/session/route.ts` - call Express directly

  - **File:** `/frontend/app/api/studio/session/route.ts`
  - **Action:** Remove proxy, call Express directly
  - **Status:** 🔴 Not Started

- [ ] **Task:** Update `/api/gamification/[...path]/route.ts` - call Express directly
  - **File:** `/frontend/app/api/gamification/[...path]/route.ts`
  - **Action:** Remove proxy, call Express directly
  - **Status:** 🔴 Not Started

#### 1.4 Frontend Service Files

- [ ] **Task:** Fix `agentSubscriptionService.ts`

  - **File:** `/frontend/services/agentSubscriptionService.ts`
  - **Current:** `const API_BASE = process.env.NODE_ENV === 'production' ? 'https://maula.ai/api' : 'http://localhost:3005/api';`
  - **New:** `const API_BASE = '/api';` (use Next.js local routes)
  - **Status:** 🔴 Not Started

- [ ] **Task:** Fix `databaseChatService.ts`
  - **File:** `/frontend/services/databaseChatService.ts`
  - **Current:** Calls external API
  - **New:** Use relative `/api` paths or call Express via `BACKEND_URL`
  - **Status:** 🔴 Not Started

#### 1.5 Frontend Component Updates

- [ ] **Task:** Update all components using hardcoded URLs
  - **Files:** `ContactForm.tsx`, `support/contact-us/page.tsx`
  - **Current:** `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'`
  - **New:** `/api/contact` (relative path)
  - **Status:** 🔴 Not Started

---

## 🟧 GROUP 2: EXPRESS BACKEND RESPONSIBILITIES

### What Express Should Handle:

- ✅ **Stripe webhooks** (reliable, no timeouts)
- ✅ **Socket.io** (real-time chat, WebSockets)
- ✅ **Heavy AI processing** (agent logic)
- ✅ **Analytics processing** (complex queries)
- ✅ **Background jobs** (cron tasks)
- ✅ **File uploads** (large files)
- ✅ **Complex MongoDB queries**
- ❌ **NO UI rendering**
- ❌ **NO user-facing auth forms**

---

### ✅ TASK CHECKLIST - EXPRESS

#### 2.1 Move Stripe Webhook to Express

- [ ] **Task:** Create `/backend/routes/stripe-webhook.js`

  - **Current:** Webhook in Next.js `/api/stripe/webhook/route.ts`
  - **New:** Move to Express `/webhooks/stripe`
  - **Why:** More reliable, no cold starts, proper raw body parsing
  - **Status:** 🔴 Not Started

- [ ] **Task:** Update Stripe dashboard webhook URL
  - **Current URL:** `https://maula.ai/api/stripe/webhook`
  - **New URL:** `https://maula.ai:3005/webhooks/stripe`
  - **Status:** 🔴 Not Started

#### 2.2 Express Environment Variables

- [ ] **Task:** Add backend-specific variables to `/backend/.env`

  - **Add:** `BACKEND_PORT=3005`
  - **Add:** `FRONTEND_URL=https://maula.ai` (for CORS)
  - **Keep:** All Stripe keys, MongoDB URI, AI keys
  - **Status:** 🔴 Not Started

- [ ] **Task:** Remove `VITE_API_URL` from `/backend/.env`
  - **File:** `/backend/.env`
  - **Reason:** Backend doesn't need VITE variables
  - **Status:** 🔴 Not Started

#### 2.3 Express Routes Organization

- [ ] **Task:** Organize Express routes clearly

  - **Structure:**
    ```
    /backend/routes/
    ├── agents.js          (agent CRUD)
    ├── analytics.js       (analytics processing)
    ├── chat.js            (Socket.io chat)
    ├── webhooks.js        (Stripe webhooks)
    ├── ai-processing.js   (heavy AI tasks)
    └── uploads.js         (file uploads)
    ```
  - **Status:** 🔴 Not Started

- [ ] **Task:** Remove duplicate routes from Express
  - **Check:** `/backend/routes/agentSubscriptions.js`
  - **Action:** If Next.js handles this, remove from Express
  - **Status:** 🔴 Not Started

#### 2.4 Express CORS Configuration

- [ ] **Task:** Update CORS in Express to allow Next.js frontend
  - **File:** `/backend/server-simple.js`
  - **Current:** `origin: process.env.ALLOWED_ORIGINS?.split(',')`
  - **Update:** Ensure includes `http://localhost:3000` (dev) and `https://maula.ai` (prod)
  - **Status:** 🔴 Not Started

#### 2.5 Express Socket.io Setup

- [ ] **Task:** Verify Socket.io is properly configured
  - **File:** `/backend/server-simple.js`
  - **Check:** Socket.io initialized, CORS configured
  - **Status:** 🔴 Not Started

#### 2.6 Express API Endpoints Documentation

- [ ] **Task:** Document all Express endpoints
  - **Create:** `/backend/API_ENDPOINTS.md`
  - **List:** All routes, methods, parameters, responses
  - **Status:** 🔴 Not Started

#### 2.7 Express Health Check

- [ ] **Task:** Add health check endpoint
  - **Endpoint:** `GET /health`
  - **Response:** `{ status: 'ok', timestamp: Date.now() }`
  - **Why:** Monitor backend status
  - **Status:** 🔴 Not Started

#### 2.8 Express Error Handling

- [ ] **Task:** Implement global error handler
  - **File:** `/backend/server-simple.js`
  - **Add:** Middleware for catching errors, logging
  - **Status:** 🔴 Not Started

---

## 🔗 GROUP 3: API & DATABASE MANAGEMENT

### Architecture Rules:

- ✅ **Next.js** → Direct MongoDB for simple queries
- ✅ **Express** → MongoDB for heavy/complex queries
- ✅ **Frontend** → Calls Next.js `/api` for user-facing features
- ✅ **Frontend** → Calls Express `:3005` for heavy operations
- ✅ **Single source of truth** for each data model

---

### ✅ TASK CHECKLIST - API & DATABASE

#### 3.1 MongoDB Connection Strategy

- [ ] **Task:** Keep separate connections (both Next.js and Express)

  - **Next.js:** `/frontend/lib/mongodb-client.ts`
  - **Express:** `/backend/lib/mongodb.js`
  - **Why:** Each can manage its own connection pool
  - **Status:** 🔴 Not Started

- [ ] **Task:** Ensure collection names match exactly
  - **Check:** `subscriptions` collection used by both
  - **Verify:** No typos (`agentsubscriptions` vs `subscriptions`)
  - **Status:** 🔴 Not Started

#### 3.2 Data Model Ownership

- [ ] **Task:** Define which backend owns which collection
  - **Next.js Owns:**
    - `users` (auth, profiles)
    - `subscriptions` (read: check access)
    - `user_sessions` (session management)
  - **Express Owns:**
    - `subscriptions` (write: create/update via webhook)
    - `usage_analytics` (analytics processing)
    - `agent_collections` (agent data)
  - **Shared (Read-only):**
    - Both can read `users`, `subscriptions`
  - **Status:** 🔴 Not Started

#### 3.3 API Call Patterns

- [ ] **Task:** Document when frontend calls Next.js vs Express
  - **Call Next.js `/api` for:**
    - User login/signup
    - Check subscription status
    - Get user profile
    - Create Stripe checkout
  - **Call Express `:3005` for:**
    - Real-time chat (Socket.io)
    - Agent processing
    - Analytics queries
    - Heavy operations
  - **Status:** 🔴 Not Started

#### 3.4 Create Shared Types/Interfaces

- [ ] **Task:** Create shared TypeScript interfaces
  - **File:** `/shared/types/index.ts` (create new folder)
  - **Include:**
    - User interface
    - Subscription interface
    - Agent interface
  - **Use in:** Both Next.js and Express
  - **Status:** 🔴 Not Started

#### 3.5 API Response Format Standardization

- [ ] **Task:** Standardize all API responses
  - **Format:**
    ```typescript
    {
      success: boolean,
      data?: any,
      error?: string,
      message?: string
    }
    ```
  - **Apply to:** All Next.js routes and Express routes
  - **Status:** 🔴 Not Started

#### 3.6 Update Frontend Fetch Calls

- [ ] **Task:** Create helper functions for API calls
  - **File:** `/frontend/lib/api-client.ts` (create)
  - **Functions:**
    - `callNextApi()` - calls local `/api/*`
    - `callBackendApi()` - calls Express with `BACKEND_URL`
  - **Status:** 🔴 Not Started

#### 3.7 Environment Variable Reference

- [ ] **Task:** Create `.env.example` with all required variables
  - **Files:** `/frontend/.env.example`, `/backend/.env.example`
  - **Document:** Each variable's purpose
  - **Status:** 🔴 Not Started

#### 3.8 Database Indexes

- [ ] **Task:** Verify MongoDB indexes are created
  - **Collections:** `users`, `subscriptions`
  - **Indexes:** userId, email, agentId, expiryDate
  - **Status:** 🔴 Not Started

#### 3.9 Rate Limiting

- [ ] **Task:** Implement rate limiting on Express
  - **Library:** `express-rate-limit`
  - **Apply to:** Public endpoints
  - **Status:** 🔴 Not Started

#### 3.10 API Documentation

- [ ] **Task:** Create complete API documentation
  - **File:** `/API_DOCUMENTATION.md`
  - **Include:**
    - Next.js endpoints
    - Express endpoints
    - Request/response examples
    - Authentication requirements
  - **Status:** 🔴 Not Started

---

## 🚀 DEPLOYMENT CHECKLIST

### After All Tasks Complete:

- [ ] **Deploy Updated Frontend**

  - Build Next.js: `npm run build`
  - Upload to production
  - Restart PM2: `pm2 restart shiny-frontend`

- [ ] **Deploy Updated Backend**

  - Upload new Express code
  - Update `.env` files
  - Restart PM2: `pm2 restart shiny-backend`

- [ ] **Update Stripe Webhook URL**

  - Login to Stripe Dashboard
  - Change webhook endpoint to Express

- [ ] **Test Complete Flow**
  - [ ] User signup ✓
  - [ ] User login ✓
  - [ ] Subscribe to agent ✓
  - [ ] Payment successful ✓
  - [ ] Webhook received ✓
  - [ ] Access granted ✓
  - [ ] Real-time chat works ✓

---

## 📝 NOTES & DECISIONS

### Key Decisions Made:

1. **Keep both backends** - Next.js + Express separation
2. **Next.js:** User-facing APIs (auth, simple queries)
3. **Express:** Heavy processing (webhooks, Socket.io, analytics)
4. **MongoDB:** Shared database, separate connections
5. **Deployment:** Both on AWS EC2 via PM2

### Migration Strategy:

- Phase 1: Fix environment variables (Group 3.7)
- Phase 2: Update frontend service files (Group 1.4)
- Phase 3: Move Stripe webhook to Express (Group 2.1)
- Phase 4: Remove Next.js proxy routes (Group 1.3)
- Phase 5: Test and deploy

---

## 🎯 QUICK REFERENCE

### When to Use What:

| Feature                | Use Next.js | Use Express |
| ---------------------- | ----------- | ----------- |
| User login form        | ✅          | ❌          |
| User signup            | ✅          | ❌          |
| Check subscription     | ✅          | ❌          |
| Create Stripe checkout | ✅          | ❌          |
| Verify Stripe payment  | ✅          | ❌          |
| Stripe webhook         | ❌          | ✅          |
| Socket.io chat         | ❌          | ✅          |
| Heavy AI processing    | ❌          | ✅          |
| Analytics queries      | ❌          | ✅          |
| File uploads           | ❌          | ✅          |
| Background jobs        | ❌          | ✅          |

---

**TO START:** Pick a group and start checking off tasks!  
**UPDATE THIS FILE:** Mark tasks as complete with ✅ as you finish them.  
**TRACK PROGRESS:** Update percentage at the top of each group.
