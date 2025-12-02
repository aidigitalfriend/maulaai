# Real-Time Metrics Tracking Implementation Guide

## What We Built

A complete real-time metrics tracking system that monitors:
- **Active user sessions** (tracked via cookies/session IDs)
- **Per-agent usage statistics** (requests, response times, success rates)
- **API endpoint metrics** (request counts, response times, error rates)
- **Historical data** (hourly and daily aggregates)

## Files Created

1. **`backend/lib/metrics-tracker.ts`** - Core metrics tracking service
2. **`backend/lib/metrics-middleware.ts`** - Express middleware for automatic tracking
3. **`backend/lib/enhanced-status.ts`** - Enhanced status endpoints using real metrics

## MongoDB Collections Created

The system automatically creates and manages these collections:

1. **`user_sessions`** - Active user sessions
   - `sessionId` (unique) - Session identifier
   - `userId` - Optional user ID if authenticated
   - `lastActivity` - Last activity timestamp
   - `currentAgent` - Current agent being used
   - `ipAddress`, `userAgent` - Client info
   - `isActive` - Boolean flag

2. **`agent_metrics`** - Per-agent usage metrics (daily)
   - `agentName` - Agent identifier
   - `date` - Date key (YYYY-MM-DD)
   - `requestCount` - Total requests
   - `activeSessions` - Array of session IDs
   - `totalResponseTime`, `avgResponseTime`
   - `successCount`, `errorCount`

3. **`api_metrics`** - Individual API request logs
   - `endpoint`, `method`, `statusCode`
   - `responseTime`, `timestamp`
   - `error` - Optional error message

4. **`hourly_metrics`** - Hourly aggregates
   - `hour` - Hour timestamp
   - `totalRequests`, `totalResponseTime`
   - `errorCount`

5. **`daily_metrics`** - Daily aggregates
   - `date` - Date
   - `totalRequests`, `avgResponseTime`
   - `errorRate`, `uptime`

## How to Integrate

### Option 1: TypeScript Server (Recommended for new deploys)

If you want to use the TypeScript version:

1. **Install dependencies:**
```bash
cd backend
npm install uuid cookie-parser
npm install --save-dev @types/uuid @types/cookie-parser
```

2. **Create a new server file** (`backend/server-enhanced.ts`):
```typescript
import express from 'express'
import cookieParser from 'cookie-parser'
import { initializeMetrics, sessionTrackingMiddleware, apiMetricsMiddleware } from './lib/metrics-middleware'
import { getEnhancedStatus, getEnhancedAnalytics, getEnhancedApiStatus } from './lib/enhanced-status'

const app = express()

// Add cookie parser
app.use(cookieParser())

// Add metrics middleware AFTER body parsers
app.use(sessionTrackingMiddleware)
app.use(apiMetricsMiddleware)

// Initialize metrics on startup
initializeMetrics()

// Your enhanced status endpoints
app.get('/api/status', async (req, res) => {
  const result = await getEnhancedStatus(fallbackMetrics, providers, dbStatus)
  if (result) {
    res.json(result)
  } else {
    // Fallback to old implementation
  }
})

app.get('/api/status/analytics', async (req, res) => {
  const result = await getEnhancedAnalytics()
  if (result) {
    res.json(result)
  } else {
    // Fallback
  }
})

app.get('/api/status/api-status', async (req, res) => {
  const result = await getEnhancedApiStatus()
  if (result) {
    res.json(result)
  } else {
    // Fallback
  }
})
```

3. **Compile and run:**
```bash
npx tsc
pm2 start dist/server-enhanced.js --name backend
```

### Option 2: Quick Integration into Existing server-simple.js

If you want to keep using JavaScript:

1. **Compile TypeScript files to JavaScript:**
```bash
cd backend
npx tsc lib/metrics-tracker.ts lib/metrics-middleware.ts lib/enhanced-status.ts --outDir lib/compiled --module commonjs --target es2020
```

2. **Add to server-simple.js** (after existing imports):
```javascript
import cookieParser from 'cookie-parser'
import { initializeMetrics, sessionTrackingMiddleware, apiMetricsMiddleware } from './lib/compiled/metrics-middleware.js'
import { getEnhancedStatus, getEnhancedAnalytics, getEnhancedApiStatus } from './lib/compiled/enhanced-status.js'

// Add cookie parser middleware
app.use(cookieParser())

// Add metrics tracking middleware (ADD AFTER app.use(express.json()))
app.use(sessionTrackingMiddleware)
app.use(apiMetricsMiddleware)

// Initialize on startup (ADD AFTER MongoDB connection)
initializeMetrics().catch(console.error)
```

3. **Replace status endpoints** (around line 180):
```javascript
app.get('/api/status', async (req, res) => {
  try {
    const metrics = calcMetricsSnapshot()
    const providers = providerStatusFromEnv()
    const db = await checkMongoFast()
    
    // Try enhanced status first
    const enhanced = await getEnhancedStatus(metrics, providers, db)
    if (enhanced) {
      return res.json(enhanced)
    }
    
    // Fallback to original implementation
    // ... (keep existing code)
  } catch (e) {
    console.error('Status error:', e)
    res.status(500).json({ success: false, error: 'Status endpoint failed' })
  }
})

// Similar updates for /api/status/analytics and /api/status/api-status
```

## Deployment Steps

### 1. Upload Files to Server

```powershell
# From your local machine
scp -i "one-last-ai.pem" backend/lib/metrics-tracker.ts ubuntu@ec2-47-129-43-231.ap-southeast-1.compute.amazonaws.com:~/shiny-friend-disco/backend/lib/
scp -i "one-last-ai.pem" backend/lib/metrics-middleware.ts ubuntu@ec2-47-129-43-231.ap-southeast-1.compute.amazonaws.com:~/shiny-friend-disco/backend/lib/
scp -i "one-last-ai.pem" backend/lib/enhanced-status.ts ubuntu@ec2-47-129-43-231.ap-southeast-1.compute.amazonaws.com:~/shiny-friend-disco/backend/lib/
```

### 2. Install Dependencies on Server

```bash
ssh -i "one-last-ai.pem" ubuntu@ec2-47-129-43-231.ap-southeast-1.compute.amazonaws.com
cd ~/shiny-friend-disco/backend
npm install uuid cookie-parser
```

### 3. Compile TypeScript

```bash
# Compile the new TypeScript files
npx tsc lib/metrics-tracker.ts lib/metrics-middleware.ts lib/enhanced-status.ts \
  --outDir lib/compiled \
  --module commonjs \
  --target es2020 \
  --esModuleInterop \
  --skipLibCheck
```

### 4. Update server-simple.js

(See Option 2 above for code changes)

### 5. Restart Server

```bash
pm2 restart backend
pm2 logs backend --lines 50
```

## Testing

### 1. Verify MongoDB Collections

```bash
mongosh

use aiAgent

# Check collections were created
show collections

# Check active users
db.user_sessions.countDocuments({ isActive: true })

# Check agent metrics
db.agent_metrics.find().pretty()
```

### 2. Test Status Endpoints

```bash
# Test main status
curl http://localhost:3001/api/status | jq '.data.realTimeMetrics'

# Should show:
# {
#   "activeUsers": <number>,
#   "trackedAgents": <number>,
#   "usingRealData": true
# }
```

### 3. Generate Some Traffic

```bash
# Make some chat requests
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"agent":"einstein","message":"Hello"}'

# Wait a few seconds, then check metrics again
curl http://localhost:3001/api/status/analytics | jq '.overview'
```

## What You'll See

### Before (Static Data):
- Active users: Always 120
- Agent metrics: Fixed numbers
- Historical: Generated randomly

### After (Real-Time Data):
- Active users: Actual count of sessions active in last 30 minutes
- Agent metrics: Real request counts and response times per agent
- Historical: Actual data from MongoDB aggregates
- **Status pages will show**:  `"usingRealData": true` when real metrics are available

## Benefits

✅ **Real user tracking** - See actual concurrent users
✅ **Per-agent analytics** - Know which agents are most popular
✅ **Response time monitoring** - Track actual performance
✅ **Error rate tracking** - Identify issues quickly
✅ **Historical trends** - See usage patterns over time
✅ **Session continuity** - Track user journeys across requests

## Performance Impact

- **Minimal**: Async database writes don't block requests
- **Cleanup**: Auto-cleanup runs every 5 minutes
- **Indexes**: Optimized for fast queries
- **Memory**: Uses MongoDB, not in-memory storage

## Fallback Behavior

If MongoDB is unavailable or metrics collection fails:
- System automatically falls back to simulated data
- Status pages continue working
- No errors shown to users
- `"usingRealData": false` indicates fallback mode

Ready to deploy! Would you like me to prepare a deployment script to automate these steps?
