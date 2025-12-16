# 🎯 ONE-TIME PURCHASE SYSTEM - What to Do in Each Component

**Date:** December 16, 2025  
**System:** Simple One-Time Agent Purchases

---

## 1️⃣ DATABASE (MongoDB)

### ✅ **WHAT'S ALREADY CORRECT:**

```javascript
Collection: 'subscriptions'

Schema:
{
  userId: String,           // ✅ User who purchased
  agentId: String,          // ✅ Which agent
  plan: 'daily|weekly|monthly',  // ✅ Purchase type
  price: Number,            // ✅ Amount paid
  status: 'active|expired|cancelled',  // ✅ Current state
  startDate: Date,          // ✅ When purchased
  expiryDate: Date,         // ✅ When expires
  autoRenew: Boolean,       // ✅ Set to FALSE (no auto-renewal)
  timestamps: true          // ✅ createdAt, updatedAt
}

Indexes:
- { userId: 1, agentId: 1 }  // ✅ For fast lookups
```

### ❌ **WHAT NEEDS TO BE CHANGED:**

#### Change 1: Fix `autoRenew` default value

**File:** `/frontend/models/AgentSubscription.ts` Line 72
**Current:** `default: true` ❌
**Fix:** `default: false` ✅

**Why:** We don't want auto-renewal for one-time purchases

---

### 📊 **WHAT DATABASE QUERIES ARE NEEDED:**

```javascript
// Query 1: Check if user has active subscription for specific agent
AgentSubscription.findOne({
  userId: 'user123',
  agentId: 'julie-girlfriend',
  status: 'active',
  expiryDate: { $gt: new Date() }, // Not expired
});

// Query 2: Get all user's active subscriptions (any agent)
AgentSubscription.find({
  userId: 'user123',
  status: 'active',
  expiryDate: { $gt: new Date() },
});

// Query 3: Create new subscription (after payment)
new AgentSubscription({
  userId: 'user123',
  agentId: 'julie-girlfriend',
  plan: 'weekly',
  price: 5,
  status: 'active',
  startDate: new Date(),
  expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  autoRenew: false, // ✅ One-time purchase
});

// Query 4: Cancel subscription
AgentSubscription.updateOne(
  { userId: 'user123', agentId: 'julie-girlfriend', status: 'active' },
  { status: 'cancelled' }
);

// Query 5: Auto-expire old subscriptions (cron job)
AgentSubscription.updateMany(
  { status: 'active', expiryDate: { $lt: new Date() } },
  { status: 'expired' }
);
```

---

## 2️⃣ FRONTEND (Next.js)

### ✅ **WHAT'S ALREADY CORRECT:**

- ✅ Subscribe page exists (`/app/subscribe/page.tsx`)
- ✅ Checkout API route exists (`/app/api/stripe/checkout/route.ts`)
- ✅ Verify session API exists (`/app/api/stripe/verify-session/route.ts`)
- ✅ Check subscription API exists (called in subscribe page)

### ❌ **WHAT NEEDS TO BE CHANGED:**

---

#### Change 1: Fix AgentSubscription model default value

**File:** `/frontend/models/AgentSubscription.ts`  
**Line:** 72

```typescript
// CURRENT ❌
autoRenew: {
  type: Boolean,
  default: true,  // ❌ Wrong for one-time purchase
},

// FIX TO ✅
autoRenew: {
  type: Boolean,
  default: false,  // ✅ Correct for one-time purchase
},
```

---

#### Change 2: Add validation BEFORE creating Stripe checkout

**File:** `/frontend/app/api/stripe/checkout/route.ts`  
**Add after Line 33 (before creating session):**

```typescript
// ✅ ADD THIS VALIDATION
import { connectToDatabase } from '@/lib/mongodb-client';
import { getAgentSubscriptionModel } from '@/models/AgentSubscription';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, agentName, plan, userId, userEmail } = body;

    // ... existing validation ...

    // ✅ NEW: Check if user already has active subscription for this agent
    await connectToDatabase();
    const AgentSubscription = await getAgentSubscriptionModel();

    const existingSubscription = await AgentSubscription.findOne({
      userId: userId,
      agentId: agentId,
      status: 'active',
      expiryDate: { $gt: new Date() }  // Not expired
    });

    if (existingSubscription) {
      return NextResponse.json(
        {
          success: false,
          error: 'You already have an active subscription for this agent',
          existingSubscription: {
            plan: existingSubscription.plan,
            expiryDate: existingSubscription.expiryDate,
            daysRemaining: Math.ceil(
              (existingSubscription.expiryDate - new Date()) / (1000 * 60 * 60 * 24)
            )
          }
        },
        { status: 400 }
      );
    }

    // ✅ No active subscription found, continue with checkout
    const session = await createCheckoutSession({...});
    // ... rest of code
  }
}
```

---

#### Change 3: Update Subscribe Page UI

**File:** `/frontend/app/subscribe/page.tsx`  
**Add state and UI to show active subscription:**

```typescript
// Add state at top of component
const [activeSubscription, setActiveSubscription] = useState<any>(null);
const [loadingSubscription, setLoadingSubscription] = useState(true);

// Update useEffect to check subscription status
useEffect(() => {
  const checkSubscription = async () => {
    if (!state.user) return;

    try {
      const response = await fetch('/api/subscriptions/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.id,
          agentId: agentSlug,
        }),
      });

      const data = await response.json();

      if (data.hasAccess && data.subscription) {
        setActiveSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  checkSubscription();
}, [state.user, agentSlug]);

// Update UI to show different content based on active subscription
return (
  <div>
    {activeSubscription ? (
      // Show active subscription info
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3>✅ You have active access to {agentName}</h3>
        <p>Plan: {activeSubscription.plan}</p>
        <p>
          Expires:{' '}
          {new Date(activeSubscription.expiryDate).toLocaleDateString()}
        </p>
        <p>Days remaining: {activeSubscription.daysRemaining}</p>

        {/* Cancel button */}
        <button onClick={handleCancel} className="btn-danger">
          Cancel Subscription
        </button>

        {/* Link to chat */}
        <Link href={`/agents/${agentSlug}`} className="btn-primary">
          Start Chatting
        </Link>
      </div>
    ) : (
      // Show pricing plans (existing code)
      <div className="pricing-plans">
        {subscriptionPlans.map((plan) => (
          <PricingCard
            key={plan.type}
            plan={plan}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>
    )}
  </div>
);
```

---

#### Change 4: Create Cancel Subscription API

**File:** `/frontend/app/api/subscriptions/cancel/route.ts` (CREATE NEW FILE)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-client';
import { getAgentSubscriptionModel } from '@/models/AgentSubscription';

export async function POST(request: NextRequest) {
  try {
    const { userId, agentId } = await request.json();

    if (!userId || !agentId) {
      return NextResponse.json(
        { success: false, error: 'userId and agentId are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const AgentSubscription = await getAgentSubscriptionModel();

    const subscription = await AgentSubscription.findOne({
      userId: userId,
      agentId: agentId,
      status: 'active',
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Mark as cancelled (keep in database for history)
    subscription.status = 'cancelled';
    await subscription.save();

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: {
        agentId: subscription.agentId,
        plan: subscription.plan,
        status: 'cancelled',
        cancelledAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
```

---

#### Change 5: Add loading state to prevent double-click

**File:** `/frontend/app/subscribe/page.tsx` Line 115-130

```typescript
const handleSubscribe = async (plan: any) => {
  setErrorMessage(null);

  if (!state.isAuthenticated || !state.user) {
    router.push(`/auth/login?redirect=...`);
    return;
  }

  // ✅ Prevent double-clicking
  if (processingPlan) {
    return;  // Already processing another plan
  }

  setProcessingPlan(plan.billingCycle);

  try {
    const response = await fetch('/api/stripe/checkout', {...});

    // Handle response...
  } catch (error) {
    setErrorMessage(error.message);
  } finally {
    setProcessingPlan(null);  // ✅ Reset after completion
  }
};

// Update button to show loading state
<button
  onClick={() => handleSubscribe(plan)}
  disabled={processingPlan !== null}  // ✅ Disable all buttons when processing
  className={processingPlan === plan.billingCycle ? 'btn-loading' : 'btn-primary'}
>
  {processingPlan === plan.billingCycle ? 'Processing...' : `Subscribe ${plan.type}`}
</button>
```

---

## 3️⃣ BACKEND (Express.js)

### ✅ **WHAT'S ALREADY CORRECT:**

- ✅ Agent subscriptions route exists (`/backend/routes/agent-subscriptions.js`)
- ✅ Pricing endpoint works (`GET /api/agent-subscriptions/pricing`)
- ✅ Get user subscriptions works (`GET /api/agent-subscriptions/subscriptions/:userId`)

### ❌ **WHAT NEEDS TO BE CHANGED:**

---

#### Change 1: Add validation endpoint

**File:** `/backend/routes/agent-subscriptions.js`  
**Add new route:**

```javascript
// Check if user has active subscription for specific agent
router.post('/check-active', async (req, res) => {
  try {
    const { userId, agentId } = req.body;

    if (!userId || !agentId) {
      return res.status(400).json({
        success: false,
        error: 'userId and agentId are required',
      });
    }

    const subscription = await AgentSubscription.findOne({
      userId: userId,
      agentId: agentId,
      status: 'active',
      expiryDate: { $gt: new Date() }, // Not expired
    });

    if (subscription) {
      return res.json({
        success: true,
        hasActive: true,
        subscription: {
          id: subscription._id,
          plan: subscription.plan,
          price: subscription.price,
          startDate: subscription.startDate,
          expiryDate: subscription.expiryDate,
          daysRemaining: Math.ceil(
            (subscription.expiryDate - new Date()) / (1000 * 60 * 60 * 24)
          ),
        },
      });
    }

    return res.json({
      success: true,
      hasActive: false,
      subscription: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check subscription',
      message: error.message,
    });
  }
});
```

---

#### Change 2: Add cancel endpoint

**File:** `/backend/routes/agent-subscriptions.js`  
**Add new route:**

```javascript
// Cancel user's subscription
router.post('/cancel', async (req, res) => {
  try {
    const { userId, agentId } = req.body;

    if (!userId || !agentId) {
      return res.status(400).json({
        success: false,
        error: 'userId and agentId are required',
      });
    }

    const subscription = await AgentSubscription.findOne({
      userId: userId,
      agentId: agentId,
      status: 'active',
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found',
      });
    }

    // Update status to cancelled
    subscription.status = 'cancelled';
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription: {
        id: subscription._id,
        agentId: subscription.agentId,
        plan: subscription.plan,
        status: 'cancelled',
        wasExpiringOn: subscription.expiryDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription',
      message: error.message,
    });
  }
});
```

---

#### Change 3: Add cron job for auto-expiration

**File:** `/backend/services/subscription-cron.js` (CREATE NEW FILE)

```javascript
import cron from 'node-cron';
import AgentSubscription from '../models/AgentSubscription.js';

/**
 * Auto-expire subscriptions that have passed their expiry date
 * Runs every hour
 */
export function startSubscriptionCron() {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🕐 [Cron] Running subscription expiration check...');

      const now = new Date();

      // Find all active subscriptions that have expired
      const result = await AgentSubscription.updateMany(
        {
          status: 'active',
          expiryDate: { $lt: now },
        },
        {
          $set: { status: 'expired' },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `✅ [Cron] Marked ${result.modifiedCount} subscriptions as expired`
        );
      } else {
        console.log('✅ [Cron] No subscriptions to expire');
      }
    } catch (error) {
      console.error('❌ [Cron] Error expiring subscriptions:', error);
    }
  });

  console.log('✅ Subscription expiration cron job started (runs hourly)');
}
```

**Then add to main server file:**
**File:** `/backend/server-simple.js` (or wherever Express server starts)

```javascript
import { startSubscriptionCron } from './services/subscription-cron.js';

// Start server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // ✅ Start cron job
  startSubscriptionCron();
});
```

---

## 4️⃣ STRIPE

### ✅ **WHAT'S ALREADY CORRECT:**

- ✅ All 18 agents have products configured (108 IDs total)
- ✅ Prices are set: $1 daily, $5 weekly, $19 monthly
- ✅ Using `mode: 'subscription'` with `cancel_at_period_end: true`
- ✅ Webhook endpoint exists
- ✅ Payment verification works

### ❌ **WHAT NEEDS TO BE CHANGED:**

**NOTHING!** ✅ Stripe configuration is already perfect for one-time purchases.

---

### 📊 **HOW STRIPE WORKS (Current Setup):**

```
1. User clicks "Buy Daily" → Frontend calls /api/stripe/checkout
2. Backend creates Stripe checkout session:
   - mode: 'subscription' (required for recurring prices)
   - cancel_at_period_end: true (prevents auto-renewal)
3. User pays on Stripe
4. Stripe redirects to success URL
5. Frontend calls /api/stripe/verify-session
6. Backend:
   - Retrieves session from Stripe
   - Creates subscription record in database
   - Sets autoRenew: false
   - Calculates expiry date
7. User has access until expiry date
8. After expiry, Stripe auto-cancels (no new charges)
```

**Key Point:** Even though we use Stripe "subscription" mode, `cancel_at_period_end: true` makes it behave like a one-time purchase. The subscription automatically cancels at the end of the period, and no future charges occur.

---

## ✅ SUMMARY CHECKLIST

### Database:

- [ ] Change `autoRenew` default from `true` to `false` in schema

### Frontend:

- [ ] Fix AgentSubscription model default value
- [ ] Add validation in checkout route (check for active subscription)
- [ ] Update subscribe page UI (show active subscription status)
- [ ] Create cancel subscription API route
- [ ] Add loading state to prevent double-clicks
- [ ] Show cancel button when subscription is active
- [ ] Hide buy buttons when subscription is active

### Backend:

- [ ] Add `/check-active` endpoint (validate before purchase)
- [ ] Add `/cancel` endpoint (allow users to cancel)
- [ ] Create cron job for auto-expiration
- [ ] Add cron job to server startup

### Stripe:

- [x] All configuration already complete! ✅

---

## 🎯 PRIORITY ORDER

**Phase 1 (Critical - Prevent Duplicate Purchases):**

1. Change `autoRenew` default to `false`
2. Add validation in `/api/stripe/checkout` route
3. Add loading state to prevent double-clicks

**Phase 2 (Important - Better UX):** 4. Update subscribe page to show active subscription 5. Add cancel subscription API + button

**Phase 3 (Nice to Have - Automation):** 6. Add cron job for auto-expiration

---

**Total Changes Needed:**

- **Database:** 1 change
- **Frontend:** 6 changes
- **Backend:** 3 changes
- **Stripe:** 0 changes ✅

**Time Estimate:** 2-3 hours to implement all changes
