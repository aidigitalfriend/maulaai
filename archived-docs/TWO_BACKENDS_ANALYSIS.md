# 🔍 TWO BACKENDS ANALYSIS - Current Architecture

**Date:** December 15, 2025  
**Issue:** Using 2 different backend systems simultaneously

---

## 🏗️ CURRENT ARCHITECTURE (CONFUSED/MIXED)

```
                    ┌─────────────────────────────────────┐
                    │     USER BROWSER                    │
                    │  https://maula.ai              │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │   NGINX (Port 80/443)              │
                    │   Reverse Proxy                    │
                    └──────┬────────────────┬─────────────┘
                           │                │
        ┌──────────────────▼───┐      ┌────▼──────────────────┐
        │  BACKEND #1          │      │  BACKEND #2           │
        │  Next.js (Port 3000) │      │  Express (Port 3005)  │
        │  ==================  │      │  ==================   │
        │  Built-in API Routes │      │  Standalone Server    │
        │                      │      │                       │
        │  📁 /app/api/        │      │  📁 /backend/         │
        │  ├─ auth/           │      │  ├─ server-simple.js │
        │  ├─ stripe/         │      │  ├─ routes/          │
        │  ├─ subscriptions/  │      │  ├─ models/          │
        │  ├─ user/           │      │  └─ lib/             │
        │  ├─ lab/            │      │                       │
        │  ├─ studio/         │      │  🔌 Endpoints:       │
        │  └─ tools/          │      │  - /api/agents       │
        │                     │      │  - /api/chat         │
        │  ⚡ These routes   │      │  - /api/analytics    │
        │     handle MOST     │      │  - /api/tracking     │
        │     functionality   │      │  - Socket.io         │
        └──────┬──────────────┘      └────┬──────────────────┘
               │                          │
               │    ┌────────────────────┐│
               └────▶  MongoDB Atlas    ◀┘
                    │  - users          │
                    │  - subscriptions  │
                    │  - sessions       │
                    └───────────────────┘
```

---

## 📊 HOW THEY'RE BEING USED

### BACKEND #1: Next.js API Routes (Port 3000)

**Status:** ✅ **ACTIVE - Primary backend**

**PM2 Process:**

```javascript
// ecosystem.config.cjs
{
  name: 'shiny-frontend',
  script: 'npm start',
  port: 3000
}
```

**Handles These Endpoints:**

```
✓ /api/auth/login              - User authentication
✓ /api/auth/signup             - User registration
✓ /api/auth/logout             - Logout
✓ /api/stripe/checkout         - Stripe payment
✓ /api/stripe/verify-session   - Payment verification
✓ /api/stripe/webhook          - Stripe webhooks
✓ /api/subscriptions           - Get subscriptions
✓ /api/subscriptions/check     - Check access
✓ /api/user/profile            - User profile
✓ /api/user/billing            - Billing info
✓ /api/lab/*                   - AI Lab features
✓ /api/studio/*                - AI Studio
✓ /api/tools/*                 - Network tools
```

**Frontend Calls:**

```typescript
// Direct relative paths (CORRECT)
fetch('/api/stripe/checkout')           ✓
fetch('/api/subscriptions/check')       ✓
fetch('/api/auth/login')                ✓
```

---

### BACKEND #2: Express Server (Port 3005)

**Status:** ⚠️ **ACTIVE - But partially used**

**PM2 Process:**

```javascript
// ecosystem.config.cjs
{
  name: 'shiny-backend',
  script: 'server-simple.js',
  port: 3005
}
```

**Should Handle These Endpoints:**

```javascript
// From backend/server-simple.js

app.use('/api', apiRouter); // Generic API routes
app.use('/api/analytics', analyticsRouter); // Analytics
app.use('/api/agent-subscriptions', agentSubscriptionsRouter); // Subscriptions

// Plus many routes defined in routes/ folder
```

**But Frontend Calls It Like This:**

```typescript
// ❌ PROBLEM: Next.js API routes proxy/forward to Express

// frontend/app/api/agents/route.ts
const BACKEND_BASE = 'http://localhost:3005';
export async function GET() {
  return fetch(`${BACKEND_BASE}/api/agents`);  // Forwards to Express
}

// frontend/app/api/agent-collections/route.ts
const BACKEND_BASE = 'http://localhost:3005';
export async function GET() {
  return fetch(`${BACKEND_BASE}/api/agent-collections`);
}

// frontend/app/api/secure-chat/route.ts
const BACKEND_BASE = 'http://localhost:3005';
export async function POST(req) {
  return fetch(`${BACKEND_BASE}/api/secure-chat`, {...});
}
```

---

## 🎭 THE CONFUSION

### What's Happening:

```
User Request
    ↓
Frontend (Browser)
    ↓
calls: /api/agents
    ↓
Next.js (Port 3000) receives request
    ↓
Next.js API Route: /app/api/agents/route.ts
    ↓
Internally forwards to: http://localhost:3005/api/agents
    ↓
Express Server (Port 3005) processes
    ↓
Returns data back to Next.js
    ↓
Next.js returns to Frontend
```

**Result:** Next.js acts as a **PROXY** to Express!

---

## 📝 WHICH ENDPOINTS USE WHICH BACKEND

### ✅ ONLY Next.js (Backend #1):

- `/api/auth/*` - Authentication (direct MongoDB)
- `/api/stripe/*` - Payments (direct Stripe API)
- `/api/subscriptions/*` - Subscription management (direct MongoDB)
- `/api/user/profile/*` - User profile (direct MongoDB)
- `/api/user/billing/*` - User billing
- `/api/lab/*` - AI Lab features
- `/api/tools/*` - Network tools

### 🔄 Next.js → Express (Both Backends):

- `/api/agents` → forwards to Express `/api/agents`
- `/api/agent-collections` → forwards to Express
- `/api/agent-subscriptions` → forwards to Express
- `/api/secure-chat` → forwards to Express
- `/api/studio/session` → forwards to Express
- `/api/gamification/*` → forwards to Express
- `/api/user/analytics` → forwards to Express

### 🤔 Express Only (Backend #2):

- Socket.io connections (real-time chat)
- Some analytics endpoints
- Tracking middleware

---

## ⚙️ FILES DOING THE FORWARDING

```typescript
// 14 Next.js API routes forward to Express:

1. frontend/app/api/secure-chat/route.ts
   const BACKEND_BASE = 'http://localhost:3005'

2. frontend/app/api/agent-subscriptions/route.ts
   const BACKEND_BASE = 'http://localhost:3005';

3. frontend/app/api/agents/route.ts
   const BACKEND_BASE = 'http://localhost:3005'

4. frontend/app/api/agent-collections/route.ts
   const BACKEND_BASE = 'http://localhost:3005'

5. frontend/app/api/studio/session/route.ts
   const BACKEND_BASE = 'http://localhost:3005'

6. frontend/app/api/gamification/[...path]/route.ts
   const BACKEND_BASE = 'http://localhost:3005';

7. frontend/app/api/user/analytics/route.ts
   process.env.BACKEND_API_BASE_URL || 'http://127.0.0.1:3005';

8-14. And more...
```

---

## 🚨 WHY THIS IS CONFUSING

### Problem 1: Double Hop

```
Browser → Next.js (3000) → Express (3005) → MongoDB
          [Backend #1]      [Backend #2]

Instead of:
Browser → Next.js (3000) → MongoDB
          [One Backend]
```

### Problem 2: Duplicate Routes

```
Backend #1: /frontend/app/api/agent-subscriptions/route.ts
Backend #2: /backend/routes/agentSubscriptions.js

Both handle same endpoint! Which one is used?
```

### Problem 3: Duplicate MongoDB Connections

```javascript
// Backend #1 (Next.js)
/frontend/lib/mongodb-client.ts → connects to MongoDB

// Backend #2 (Express)
/backend/server-simple.js → connects to MongoDB
/backend/lib/mongodb.js → separate connection pool
```

### Problem 4: Environment Variable Confusion

```env
# Root .env says:
NEXT_PUBLIC_API_URL=https://maula.ai/api  # Points to Next.js

# But backend is:
BACKEND_URL=http://localhost:3005             # Different server

# Code uses both:
fetch(process.env.NEXT_PUBLIC_API_URL)        # Sometimes Next.js
fetch('http://localhost:3005')                 # Sometimes Express
```

---

## 🎯 THE SOLUTION - 3 OPTIONS

### Option A: Keep ONLY Next.js (Remove Express)

**Recommended for simplicity**

```
✓ Move all Express routes to Next.js API routes
✓ Remove backend folder
✓ Use only one MongoDB connection
✓ Simpler deployment
✓ Faster (no proxy hop)

✗ Lose Socket.io real-time features (can use Pusher/Ably instead)
```

### Option B: Keep Both - Clear Separation

**Better for scaling**

```
Next.js (Port 3000):
- Frontend pages
- Simple API routes (auth, stripe, subscriptions)
- Direct MongoDB for read operations

Express (Port 3005):
- Heavy operations (AI processing)
- Socket.io (real-time chat)
- Background jobs
- Analytics processing

✓ Clear separation of concerns
✓ Can scale separately
✓ Next.js handles user-facing
✓ Express handles heavy lifting

✗ More complex deployment
✗ Need to manage 2 servers
```

### Option C: Move Everything to Express

**Not recommended**

```
✗ Lose Next.js benefits (SSR, API routes)
✗ Need separate frontend build
✗ More complex setup
```

---

## 📋 SUMMARY

**You're using 2 backends because:**

1. **Next.js (Port 3000)** - Main application with built-in API routes
2. **Express (Port 3005)** - Legacy/additional backend server

**Current flow:**

- Some API calls go directly to Next.js ✓
- Some API calls go to Next.js → Next.js forwards to Express 🔄
- Creates confusion about where endpoints are handled

**Recommendation:**
Choose Option A (Next.js only) or Option B (Both with clear separation)

**Next Steps:**
Tell me which option you prefer, and I'll create the migration plan.
