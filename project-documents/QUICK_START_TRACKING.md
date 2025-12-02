# 🎯 QUICK START - Universal Tracking Integration

## 📦 Installation (1 minute)
```bash
cd backend
npm install cookie-parser
```

## 🚀 Activate Server (1 command)
```bash
./activate-tracking.sh
```

## 💻 Frontend Integration (Copy-Paste Ready)

### 1️⃣ Add to Layout (Auto-track all pages)
```typescript
// app/layout.tsx
import { usePageTracking } from '@/lib/tracking-hooks'

export default function RootLayout({ children }) {
  usePageTracking() // ✅ Auto-tracks all page views
  return <html><body>{children}</body></html>
}
```

### 2️⃣ Chat Agent Integration
```typescript
// app/agents/[agentId]/page.tsx
import { useChatTracking } from '@/lib/tracking-hooks'

const { trackChat } = useChatTracking(agentId, agentName)

// After AI responds:
await trackChat(userMsg, aiMsg, responseTime, 'gpt-4', 'en')
```

### 3️⃣ Tool Integration
```typescript
// app/tools/[toolName]/page.tsx
import { useToolTracking } from '@/lib/tracking-hooks'

const { trackTool } = useToolTracking()

// After tool runs:
await trackTool(toolName, category, input, output, success, error, execTime)
```

### 4️⃣ Lab Integration
```typescript
// app/lab/[experiment]/page.tsx
import { useLabTracking } from '@/lib/tracking-hooks'

const { trackExperiment } = useLabTracking()

// After experiment:
await trackExperiment(name, type, input, output, model, success, error, time)
```

### 5️⃣ Auth Integration
```typescript
// app/auth/signup/page.tsx
import { useEventTracking } from '@/lib/tracking-hooks'

const { trackEvent } = useEventTracking()

// After signup:
await trackEvent('auth', 'signup', { email }, true)
```

## 📊 Check Analytics
```bash
# Get real-time stats
curl http://localhost:3005/api/analytics/analytics/realtime

# Get current tracking data
curl http://localhost:3005/api/analytics/analytics/current \
  -H "Cookie: onelastai_visitor=abc; onelastai_session=xyz"
```

## ✅ What's Tracked Automatically
- ✅ Every visitor (cookie-based, 1-year)
- ✅ Every session (30-min timeout)
- ✅ Every page view (time spent, scroll depth)
- ✅ Every API call (timing, status codes)

## 🎯 What Needs Manual Integration
- ⚠️ Chat interactions (5 min per agent)
- ⚠️ Tool usage (3 min per tool)
- ⚠️ Lab experiments (5 min per experiment)
- ⚠️ Auth events (10 min total)

## 📁 Files Created
```
backend/
├── models/Analytics.ts (8 Mongoose models)
├── lib/analytics-tracker.ts (tracking service)
├── lib/tracking-middleware.ts (universal middleware)
└── routes/analytics.js (API endpoints)

frontend/
└── lib/tracking-hooks.ts (React hooks)
```

## 🔗 Documentation
- **Full Guide:** `UNIVERSAL_TRACKING_COMPLETE.md`
- **Deployment:** `TRACKING_DEPLOYMENT_SUCCESS.md`
- **GitHub:** https://github.com/aidigitalfriend/shiny-friend-disco

## 🚀 Production Deploy
```bash
# SSH to server
ssh user@47.129.43.231

# Pull and deploy
cd /var/www/shiny-friend-disco
git pull origin main
cd backend && npm install cookie-parser
pm2 restart shiny-backend
pm2 logs shiny-backend
```

---

**That's it! 🎉 Everything is now tracked and stored in MongoDB Atlas.**
