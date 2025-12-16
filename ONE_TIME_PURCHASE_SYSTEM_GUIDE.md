# 🎯 ONE-TIME PURCHASE SYSTEM - Configuration & Management Guide

**Date:** December 16, 2025  
**System:** Simplified One-Time Agent Purchases (No Recurring Subscriptions)

---

## 📋 SYSTEM LOGIC - WHAT YOU REQUESTED

### Core Rules:

1. ✅ **One-Time Purchase Only** - No recurring billing, no auto-renewal
2. ✅ **One Active Purchase Per Agent** - User cannot buy same agent twice while active
3. ✅ **Separate Agents** - Each agent is independent (user can buy multiple agents)
4. ✅ **No Upgrades/Downgrades** - Only cancel option available
5. ✅ **Re-purchase After Expiry** - User can buy again only after expiration or cancellation

---

## 🔍 CURRENT SYSTEM STATE ANALYSIS

### ✅ **WHAT'S ALREADY CORRECT:**

#### 1. **Database Schema (AgentSubscription Model)**

**File:** `/frontend/models/AgentSubscription.ts`

```typescript
{
  userId: String,         // ✅ Ties to specific user
  agentId: String,        // ✅ Ties to specific agent
  plan: 'daily' | 'weekly' | 'monthly',  // ✅ One-time purchase type
  price: Number,          // ✅ Fixed price
  status: 'active' | 'expired' | 'cancelled',  // ✅ Clear lifecycle
  startDate: Date,        // ✅ Purchase start
  expiryDate: Date,       // ✅ When access ends
  autoRenew: boolean      // ✅ Currently set to FALSE
}
```

**Status:** ✅ **CORRECT** - Schema supports one-time purchase logic

- Has compound index: `{ userId: 1, agentId: 1 }` for efficient lookups
- Collection name: `subscriptions` (aligned with backend)

---

#### 2. **Stripe Configuration**

**File:** `/frontend/lib/stripe-client.ts` Line 368-387

```typescript
mode: 'subscription',  // Using subscription mode BUT...
subscription_data: {
  cancel_at_period_end: true,  // ✅ Prevents auto-renewal!
}
```

**Status:** ✅ **CORRECT BUT MISLEADING TERMINOLOGY**

- Uses Stripe "subscription" mode (required for recurring price structure)
- Sets `cancel_at_period_end: true` - acts like one-time payment
- After period ends, subscription auto-cancels (no charges)

**Why Stripe "subscription" mode?**

- Your prices are created as recurring prices (daily/weekly/monthly intervals)
- Stripe requires subscription mode for recurring prices
- But `cancel_at_period_end: true` makes it behave like one-time payment

---

#### 3. **Payment Verification Logic**

**File:** `/frontend/app/api/stripe/verify-session/route.ts`

```typescript
// ✅ Sets autoRenew to FALSE
autoRenew: false,  // No auto-renewal for one-time payments

// ✅ Uses subscription period dates
const startDate = new Date(subscriptionData.current_period_start * 1000);
const expiryDate = new Date(subscriptionData.current_period_end * 1000);
```

**Status:** ✅ **CORRECT** - Creates access record with no auto-renewal

---

### ⚠️ **WHAT NEEDS TO BE FIXED/VERIFIED:**

#### 1. **CRITICAL: Prevent Duplicate Purchases** ❌

**Current Issue:**

- File: `/frontend/app/api/stripe/verify-session/route.ts` Line 117-124
- When user already has active subscription, it **UPDATES** the existing one
- **Problem:** User can click "Buy" multiple times and get charged each time!

**Current Code:**

```typescript
if (existingSubscription) {
  // ❌ BAD: Just updates existing, doesn't prevent duplicate purchase
  subscriptionRecord = await AgentSubscription.findByIdAndUpdate(
    existingSubscription._id,
    { status: 'active', plan: plan, ... }
  );
}
```

**What Should Happen:**

```typescript
// ✅ CORRECT: Check if active subscription exists BEFORE creating Stripe session
if (existingSubscription && existingSubscription.status === 'active') {
  return { error: 'You already have an active plan for this agent' };
}
```

**Where to Fix:**

1. ❌ **Frontend:** Before showing "Buy" button - check if user has active plan
2. ❌ **Backend:** Before creating Stripe session - validate no active plan exists
3. ✅ **Stripe Webhook:** If payment comes through, check again in database

---

#### 2. **Missing: Pre-Purchase Validation** ❌

**File:** `/frontend/lib/stripe-client.ts` - `createCheckoutSession()`

**Current Flow:**

```
User clicks "Buy"
  → Create Stripe session (NO validation)
  → User pays
  → Verify session creates/updates record
```

**Correct Flow Should Be:**

```
User clicks "Buy"
  → Check database: Does user have active plan for this agent? ❌ MISSING
  → If yes: Show error "Already have active plan"
  → If no: Create Stripe session
  → User pays
  → Verify session creates record
```

**Where to Add:**

- **File:** `/frontend/app/api/stripe/checkout/route.ts` (or create it)
- **Logic:** Check database BEFORE calling `stripe.checkout.sessions.create()`

---

#### 3. **Missing: Re-purchase Logic** ❌

**Current:** No explicit check to allow re-purchase after expiration

**What's Needed:**

```typescript
// ✅ Allow purchase if:
// 1. No existing subscription for this agent, OR
// 2. Existing subscription is expired/cancelled

const existingSub = await AgentSubscription.findOne({
  userId,
  agentId,
});

if (
  existingSub &&
  existingSub.status === 'active' &&
  existingSub.expiryDate > new Date()
) {
  return { error: 'Already have active subscription for this agent' };
}

// Otherwise, allow purchase
```

---

#### 4. **Frontend: Subscribe Button Logic** ⚠️

**Files to Check:**

- `/frontend/app/subscribe/page.tsx` (or wherever subscription UI is)
- `/frontend/components/SubscriptionCard.tsx` (or similar)

**Current Behavior:** Unknown - needs verification

**Correct Behavior Should Be:**

```typescript
// Before rendering "Buy" button:
const hasActiveSubscription = await checkUserSubscription(userId, agentId);

if (hasActiveSubscription) {
  // Show: "Active until [expiryDate]"
  // Show: [Cancel] button only
  // Hide: [Buy Daily] [Buy Weekly] [Buy Monthly] buttons
} else {
  // Show: [Buy Daily] [Buy Weekly] [Buy Monthly] buttons
  // Hide: Cancel button
}
```

---

#### 5. **Backend Routes - Subscription Service** ⚠️

**File:** `/backend/routes/agent-subscriptions.js` (needs to be checked)

**Required API Endpoints:**

```javascript
// ✅ 1. Check if user has active subscription for agent
GET /api/agent-subscriptions/check
Query: { userId, agentId }
Response: { hasActive: boolean, subscription: {...} }

// ✅ 2. Create new subscription (with validation)
POST /api/agent-subscriptions/create
Body: { userId, agentId, plan }
Logic: Check if already active → If yes, return error → If no, create Stripe session

// ✅ 3. Cancel subscription
POST /api/agent-subscriptions/cancel
Body: { userId, agentId }
Logic: Mark status as 'cancelled'

// ✅ 4. Get user's subscriptions
GET /api/agent-subscriptions/user/:userId
Response: [ { agentId, plan, status, expiryDate, ... }, ... ]
```

---

## 📝 CONFIGURATION CHECKLIST

### Phase 1: Database (Already Correct ✅)

- [x] Schema has userId + agentId
- [x] Schema has status field (active/expired/cancelled)
- [x] Schema has expiryDate
- [x] Schema has autoRenew (set to false)
- [x] Compound index on userId + agentId

### Phase 2: Stripe Configuration (Already Correct ✅)

- [x] All 18 agents have products + prices
- [x] Prices are configured as recurring (daily/weekly/monthly)
- [x] checkout.session uses `mode: 'subscription'`
- [x] checkout.session uses `cancel_at_period_end: true`

### Phase 3: Backend Logic (NEEDS FIXES ❌)

- [ ] **Add pre-purchase validation** - Check if active subscription exists
- [ ] **Add API endpoint:** `GET /api/agent-subscriptions/check`
- [ ] **Update API endpoint:** `POST /api/stripe/checkout` - Add validation before creating session
- [ ] **Add cancellation logic:** Mark subscription as cancelled (don't delete from database)
- [ ] **Add expiration cron job:** Automatically mark expired subscriptions

### Phase 4: Frontend Logic (NEEDS FIXES ❌)

- [ ] **Update subscribe page:** Check if user has active subscription before showing "Buy" buttons
- [ ] **Add loading state:** Prevent double-clicking "Buy" button
- [ ] **Show subscription status:** "Active until [date]" if user has active plan
- [ ] **Show cancel button:** Only if user has active subscription
- [ ] **Hide buy buttons:** If user has active subscription for that agent
- [ ] **Enable buy buttons:** Only if no active subscription OR subscription expired/cancelled

### Phase 5: API Flow (NEEDS IMPLEMENTATION ❌)

```
┌─────────────────────────────────────────────────────────────┐
│ USER WANTS TO BUY AGENT                                     │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Frontend: Check Subscription Status                      │
│    GET /api/agent-subscriptions/check?userId=X&agentId=Y    │
└────────────┬────────────────────────────────────────────────┘
             │
        ┌────▼─────┐
        │ Has      │
        │ Active?  │
        └──┬───┬───┘
           │   │
       Yes │   │ No
           │   │
           ▼   ▼
    ┌──────┐  ┌──────────────────────────────────────────────┐
    │ Show │  │ 2. Backend: Validate + Create Stripe Session │
    │ Error│  │    POST /api/stripe/checkout                  │
    │      │  │    - Check DB again (race condition)          │
    │ OR   │  │    - If no active: Create Stripe session      │
    │      │  │    - Return sessionId                          │
    │ Show │  └───────────────┬──────────────────────────────┘
    │Cancel│                  │
    │Button│                  ▼
    └──────┘  ┌──────────────────────────────────────────────┐
              │ 3. User Completes Payment on Stripe          │
              └───────────────┬──────────────────────────────┘
                              │
                              ▼
              ┌──────────────────────────────────────────────┐
              │ 4. Backend: Verify Session                   │
              │    POST /api/stripe/verify-session           │
              │    - Check payment_status === 'paid'         │
              │    - Create subscription record in DB        │
              │    - Set autoRenew = false                   │
              │    - Calculate expiryDate                    │
              └───────────────┬──────────────────────────────┘
                              │
                              ▼
              ┌──────────────────────────────────────────────┐
              │ 5. User Has Access                           │
              │    - Show "Active until [date]"              │
              │    - Show [Cancel] button                    │
              │    - Hide [Buy] buttons for this agent       │
              └──────────────────────────────────────────────┘
```

---

## 🔧 FILES THAT NEED CHANGES

### 1. **Backend**

```
/backend/routes/agent-subscriptions.js
  → Add GET /check endpoint (check if user has active subscription)
  → Add validation in POST /create before creating Stripe session

/backend/services/subscription-service.js (create if doesn't exist)
  → checkActiveSubscription(userId, agentId)
  → createSubscription(userId, agentId, plan) - with validation
  → cancelSubscription(userId, agentId)
  → expireOldSubscriptions() - cron job
```

### 2. **Frontend API Routes**

```
/frontend/app/api/stripe/checkout/route.ts
  → Add validation before creating Stripe session
  → Check if user already has active subscription

/frontend/app/api/stripe/verify-session/route.ts
  → Instead of updating existing, reject if already active
  → Allow re-purchase only if expired/cancelled

/frontend/app/api/agent-subscriptions/check/route.ts (create)
  → Check if user has active subscription for specific agent
```

### 3. **Frontend UI**

```
/frontend/app/subscribe/page.tsx (or wherever subscription UI is)
  → Fetch user's active subscriptions
  → Show/hide buttons based on subscription status
  → Add loading states
  → Add error handling

/frontend/components/SubscriptionCard.tsx (or similar)
  → Conditional rendering based on active status
```

### 4. **Frontend Services**

```
/frontend/services/agentSubscriptionService.ts
  → checkSubscription(userId, agentId) - call API
  → getUserSubscriptions(userId) - get all user's subscriptions
  → cancelSubscription(userId, agentId) - cancel API call
```

---

## 🎯 RECOMMENDED IMPLEMENTATION ORDER

### Step 1: Add Pre-Purchase Validation (Critical)

**Priority:** 🔴 HIGH - Prevents users from getting charged twice

**Files:**

1. `/frontend/app/api/stripe/checkout/route.ts`
   - Add database check before creating Stripe session
2. `/frontend/app/api/agent-subscriptions/check/route.ts`
   - Create endpoint to check subscription status

**Code:**

```typescript
// /frontend/app/api/stripe/checkout/route.ts
export async function POST(request: NextRequest) {
  const { userId, agentId, plan } = await request.json();

  // ✅ CHECK FIRST: Does user already have active subscription?
  await connectToDatabase();
  const AgentSubscription = await getAgentSubscriptionModel();

  const existingSub = await AgentSubscription.findOne({
    userId,
    agentId,
    status: 'active',
    expiryDate: { $gt: new Date() } // Not expired
  });

  if (existingSub) {
    return NextResponse.json({
      error: 'You already have an active subscription for this agent'
    }, { status: 400 });
  }

  // ✅ No active subscription, create Stripe session
  const session = await createCheckoutSession({...});
  return NextResponse.json({ sessionId: session.id });
}
```

---

### Step 2: Update Frontend UI

**Priority:** 🟡 MEDIUM - Improves UX

**Files:**

1. `/frontend/app/subscribe/page.tsx`
2. `/frontend/services/agentSubscriptionService.ts`

**Logic:**

```typescript
// On page load:
const userSubscriptions = await fetchUserSubscriptions(userId);

// For each agent card:
const hasSub = userSubscriptions.find(
  (sub) =>
    sub.agentId === agent.id &&
    sub.status === 'active' &&
    sub.expiryDate > new Date()
);

if (hasSub) {
  // Show: "Active until [date]" + [Cancel] button
  // Hide: [Buy] buttons
} else {
  // Show: [Buy Daily] [Buy Weekly] [Buy Monthly]
  // Hide: [Cancel] button
}
```

---

### Step 3: Add Cancellation Logic

**Priority:** 🟢 LOW - User-requested feature

**Files:**

1. `/frontend/app/api/agent-subscriptions/cancel/route.ts`

**Logic:**

```typescript
export async function POST(request: NextRequest) {
  const { userId, agentId } = await request.json();

  await connectToDatabase();
  const AgentSubscription = await getAgentSubscriptionModel();

  const subscription = await AgentSubscription.findOne({
    userId,
    agentId,
    status: 'active',
  });

  if (!subscription) {
    return NextResponse.json(
      { error: 'No active subscription found' },
      { status: 404 }
    );
  }

  // Mark as cancelled (don't delete - keep history)
  subscription.status = 'cancelled';
  await subscription.save();

  return NextResponse.json({ success: true });
}
```

---

### Step 4: Add Expiration Cron Job

**Priority:** 🟢 LOW - Automatic cleanup

**File:** `/backend/services/subscription-cron.js` (create)

**Logic:**

```javascript
const cron = require('node-cron');

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('🕐 Running subscription expiration check...');

  const now = new Date();

  // Find all active subscriptions with expiryDate < now
  const expiredSubs = await AgentSubscription.updateMany(
    {
      status: 'active',
      expiryDate: { $lt: now },
    },
    {
      $set: { status: 'expired' },
    }
  );

  console.log(
    `✅ Marked ${expiredSubs.modifiedCount} subscriptions as expired`
  );
});
```

---

## 📊 SUMMARY - WHAT NEEDS TO BE DONE

### ✅ Already Working (No Changes Needed):

1. Database schema - supports one-time purchases
2. Stripe configuration - all 18 agents have products/prices
3. Payment verification - creates access records correctly
4. autoRenew set to false
5. cancel_at_period_end set to true

### ❌ Needs Implementation:

1. **Pre-purchase validation** - Stop duplicate purchases
2. **Frontend UI updates** - Show/hide buttons based on active status
3. **Cancellation endpoint** - Allow users to cancel
4. **Expiration cron job** - Auto-mark expired subscriptions
5. **Better error handling** - Clear messages for duplicate purchases

### 🎯 Priority Order:

1. 🔴 **Step 1:** Add pre-purchase validation (prevents charging users twice)
2. 🟡 **Step 2:** Update frontend UI (improves user experience)
3. 🟢 **Step 3:** Add cancellation (user feature)
4. 🟢 **Step 4:** Add cron job (automatic cleanup)

---

## ✅ FINAL VALIDATION CHECKLIST

After implementing all changes, test:

- [ ] User cannot buy same agent twice while active
- [ ] User can buy different agents simultaneously
- [ ] User sees "Active until [date]" for active subscriptions
- [ ] User can cancel active subscription
- [ ] After expiry, user can purchase again
- [ ] After cancellation, user can purchase again
- [ ] Double-clicking "Buy" doesn't charge twice
- [ ] Database records have autoRenew = false
- [ ] Expired subscriptions auto-marked as expired

---

**Ready to implement?** Let me know which step you want me to start with!
