# 🔍 Agent Subscription Flow - Complete Diagnosis

## Database Location
**Collection Name**: `agentsubscriptions`  
**Database**: `onelastai` (MongoDB Atlas)  
**Current Status**: ⚠️ **EMPTY (0 documents)**

## Complete Data Flow

### 1. **User Purchases Agent** (`/subscribe` page)
- **Frontend**: `frontend/app/subscribe/page.tsx`
- **Action**: User clicks "Purchase Daily/Weekly/Monthly Access"
- **API Call**: `POST /api/stripe/checkout`
- **Request**:
  ```json
  {
    "agentId": "einstein",
    "agentName": "Einstein",
    "plan": "daily",
    "userId": "67809cef3c04c22a85bd5edd",
    "userEmail": "user@example.com"
  }
  ```

### 2. **Stripe Checkout Session Created**
- **File**: `frontend/app/api/stripe/checkout/route.ts`
- **Actions**:
  1. Checks if user already has active subscription
  2. Query: `AgentSubscription.findOne({ userId, agentId, status: 'active', expiryDate: { $gt: now } })`
  3. If exists → Return error "Already subscribed"
  4. If not → Create Stripe checkout session
  5. Redirect user to Stripe payment page

### 3. **User Completes Payment on Stripe**
- Stripe processes payment
- On success → Redirect to: `/subscription-success?session_id=xxx&agent=Einstein&slug=einstein`

### 4. **Subscription Verification & Database Record Creation**
- **Frontend**: `frontend/app/subscription-success/page.tsx`
- **API Call**: `POST /api/stripe/verify-session`
- **File**: `frontend/app/api/stripe/verify-session/route.ts`
- **Actions**:
  1. Retrieve session from Stripe: `stripe.checkout.sessions.retrieve(sessionId)`
  2. Verify payment_status === 'paid'
  3. Extract metadata: agentId, agentName, plan, userId
  4. Calculate dates:
     - `startDate`: `new Date(subscription.current_period_start * 1000)`
     - `expiryDate`: `new Date(subscription.current_period_end * 1000)`
  5. **CREATE AgentSubscription record**:
     ```javascript
     new AgentSubscription({
       userId: session.metadata?.userId,
       agentId: agentId,
       plan: plan,
       price: price,
       status: 'active',
       startDate: startDate,
       expiryDate: expiryDate,
       stripeSubscriptionId: subscription.id
     })
     ```
  6. Save to `agentsubscriptions` collection

## AgentSubscription Schema
**File**: `backend/models/AgentSubscription.js`

```javascript
{
  userId: String,        // "67809cef3c04c22a85bd5edd"
  agentId: String,       // "einstein"
  plan: String,          // "daily" | "weekly" | "monthly"
  price: Number,         // 1 | 5 | 19
  status: String,        // "active" | "expired" | "cancelled"
  startDate: Date,
  expiryDate: Date,
  stripeSubscriptionId: String,
  autoRenew: Boolean,    // Default: false
  createdAt: Date,
  updatedAt: Date
}
```

## Where Billing Page Gets Data

### Backend Endpoint: `/api/user/billing/:userId`
**File**: `backend/server-simple.js` (Line 2348)

```javascript
const activeAgentSubscriptions = await AgentSubscription.find({
  userId: sessionUser._id.toString(),  // "67809cef3c04c22a85bd5edd"
  status: 'active',
  expiryDate: { $gt: now },
})
.sort({ expiryDate: -1 })
.lean()
.exec();
```

### Dashboard Analytics: `/api/user/analytics`
**File**: `backend/server-simple.js` (Line 1569)

```javascript
const activeAgentCount = await AgentSubscription.countDocuments({
  userId: userObjectId.toString(),
  status: 'active',
  expiryDate: { $gt: now },
});
```

## 🚨 THE PROBLEM

### Issue
The `agentsubscriptions` collection is **completely empty** (0 documents).

### What This Means
1. No agent subscriptions have been created/saved to the database
2. Billing page queries empty collection → Returns "No Active Plan"
3. Dashboard shows "9 active agents" but this is **NOT from database**

### Why Dashboard Shows 9 Agents
The dashboard is likely:
- Showing a hardcoded/default value
- OR counting platform subscriptions (wrong collection)
- OR showing available agents to purchase (not purchased agents)

### How Stripe Gives Data
Stripe provides data through:
1. **Checkout Session** (immediate after payment)
   - Session ID, payment status, subscription details
   - Metadata: agentId, agentName, plan, userId
2. **Subscription Object**
   - current_period_start, current_period_end
   - cancel_at_period_end: true (no auto-renewal)
   - price, status, customer info

### How Database Takes Data
Backend receives Stripe data and creates AgentSubscription:
```javascript
// Line 172-182 in verify-session/route.ts
subscriptionRecord = new AgentSubscription({
  userId: session.metadata?.userId,
  agentId: agentId,
  plan: plan,
  price: price,
  status: 'active',
  startDate: new Date(subscriptionData.current_period_start * 1000),
  expiryDate: new Date(subscriptionData.current_period_end * 1000),
  stripeSubscriptionId: subscriptionData.id,
});
await subscriptionRecord.save();  // ← This should save to agentsubscriptions
```

## 🔧 Verification Needed

### Check if agent purchases were completed
```bash
# In Stripe Dashboard
1. Go to Payments → Check if payments exist
2. Check metadata: agentId, agentName, plan, userId
3. Check if subscriptions were created

# In MongoDB
db.agentsubscriptions.find({})  # Should show records
db.agentsubscriptions.countDocuments({ status: 'active' })  # Should be > 0
```

### Possible Root Causes
1. **No actual purchases made** - User didn't complete Stripe checkout
2. **verify-session never called** - Success page didn't trigger verification
3. **Database write failed** - AgentSubscription.save() threw error
4. **Wrong database/collection** - Saving to different location
5. **Model not loaded** - AgentSubscription model not properly initialized

## ✅ Solution Steps

1. **Test a real purchase flow**:
   - Go to `/subscribe?agent=Einstein&slug=einstein`
   - Complete payment on Stripe
   - Check if record created in `agentsubscriptions`

2. **Check Stripe Dashboard**:
   - Verify payments exist
   - Check subscription metadata

3. **Check backend logs**:
   - Look for "Payment verified successfully" logs
   - Check for database save errors

4. **Manually create test record** (if needed):
   ```javascript
   await AgentSubscription.create({
     userId: "YOUR_USER_ID",
     agentId: "einstein",
     plan: "monthly",
     price: 19,
     status: "active",
     startDate: new Date(),
     expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
     stripeSubscriptionId: "test_sub_xxx"
   });
   ```

## Summary

**Database Collection**: `agentsubscriptions`  
**Expected Documents**: Agent purchases (1 record per agent per user)  
**Current State**: Empty (0 documents)  
**Data Source**: Stripe → verify-session API → MongoDB  
**Problem**: Records not being created after Stripe payment

The billing page is working correctly - it's querying the right collection with the right logic. The issue is that the `agentsubscriptions` collection has no data because either:
- No purchases have been completed, OR
- The verify-session API is failing to create records
