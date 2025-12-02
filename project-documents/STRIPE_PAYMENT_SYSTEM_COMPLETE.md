# Stripe Payment System - Complete Setup Guide

## ✅ Files Created

### API Routes
1. **`/frontend/app/api/stripe/checkout/route.ts`** (73 lines)
   - Creates Stripe checkout sessions
   - Validates agent details and plan selection
   - Returns checkout URL for payment

2. **`/frontend/app/api/stripe/webhook/route.ts`** (300 lines)
   - Receives Stripe webhook events
   - Handles 6 event types:
     - `checkout.session.completed` - Save new subscription
     - `customer.subscription.created` - Log subscription creation
     - `customer.subscription.updated` - Update subscription status
     - `customer.subscription.deleted` - Mark as canceled
     - `invoice.paid` - Reactivate subscription
     - `invoice.payment_failed` - Mark as past_due
   - Saves to MongoDB with full metadata

3. **`/frontend/app/api/subscriptions/route.ts`** (122 lines)
   - GET: Query user subscriptions with filters
   - POST: Check if user has active access to specific agent
   - Returns subscription status, renewal dates, active state

### Supporting Libraries
4. **`/frontend/lib/stripe-client.ts`** (173 lines)
   - Stripe API wrapper functions
   - `createCheckoutSession()` - Create payment sessions
   - `verifyWebhookSignature()` - Validate webhook events
   - `getSubscription()`, `cancelSubscription()` - Manage subscriptions
   - Subscription plans with pricing (daily $1, weekly $5, monthly $19)

5. **`/frontend/lib/mongodb-client.ts`** (87 lines)
   - MongoDB connection helper with pooling
   - `connectToDatabase()` - Connect with caching
   - Connection state management
   - Handles reconnection and errors

### Data Models
6. **`/frontend/models/Subscription.ts`** (145 lines)
   - MongoDB schema for subscriptions
   - Fields: userId, email, agentId, plan, stripeSubscriptionId, status, dates
   - Methods: `isActive()`, `getDaysUntilRenewal()`
   - Compound indexes for efficient queries

## 📦 Required Dependencies

Add to `frontend/package.json`:
```json
{
  "dependencies": {
    "stripe": "^14.0.0",
    "mongoose": "^8.0.0"
  }
}
```

## 🔧 Environment Variables

Already configured in `backend/.env`:
```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_51QZ1SlRuwx...
STRIPE_PUBLISHABLE_KEY=pk_live_51QZ1SlRuwx...
STRIPE_WEBHOOK_SECRET=[NEEDS TO BE SET]

# Product IDs
STRIPE_DAILY_PRODUCT_ID=prod_RpkbOdVHPfAzYi
STRIPE_WEEKLY_PRODUCT_ID=prod_RpkbK47fCM2f7v
STRIPE_MONTHLY_PRODUCT_ID=prod_RpkbczWRNe8pXZ

# MongoDB
MONGODB_URI=mongodb+srv://onelastai:onelastai-co@onelastai-co.0fsia.mongodb.net/onelastai
```

## 🚀 Deployment Steps

### 1. Install Dependencies
```bash
cd /Users/onelastai/Downloads/shiny-friend-disco/frontend
npm install stripe mongoose
```

### 2. Build Frontend
```bash
npm run build
```

### 3. Copy Environment Variables
```bash
# Copy Stripe keys from backend/.env to production server
# Ensure all STRIPE_* variables are set
```

### 4. Deploy to Production
```bash
# Upload new files to server:
# - app/api/stripe/checkout/route.ts
# - app/api/stripe/webhook/route.ts
# - app/api/subscriptions/route.ts
# - lib/stripe-client.ts
# - lib/mongodb-client.ts
# - models/Subscription.ts

# Restart Next.js server
pm2 restart all
```

### 5. Configure Stripe Webhook

**In Stripe Dashboard:**
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://onelastai.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copy the webhook signing secret
6. Add to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`

## 🧪 Testing the Payment Flow

### Test with Stripe Test Cards

**Test Card Numbers:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

**Test Details:**
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### End-to-End Test Flow

1. **Start Subscription**
   ```bash
   # User clicks "Subscribe" on agent page
   # Frontend sends POST to /api/stripe/checkout
   curl -X POST https://onelastai.com/api/stripe/checkout \
     -H "Content-Type: application/json" \
     -d '{
       "agentId": "test-agent-123",
       "agentName": "Test Agent",
       "plan": "daily",
       "userId": "user123",
       "userEmail": "test@example.com"
     }'
   
   # Returns: { success: true, url: "https://checkout.stripe.com/..." }
   ```

2. **Complete Payment**
   - User is redirected to Stripe checkout page
   - User enters test card: 4242 4242 4242 4242
   - Stripe processes payment
   - User redirected to success page

3. **Verify Webhook Received**
   ```bash
   # Check server logs for webhook events
   pm2 logs
   
   # Should see:
   # "Stripe webhook event received: checkout.session.completed"
   # "Subscription saved to database: sub_xxx"
   ```

4. **Check Database**
   ```bash
   # Query MongoDB to verify subscription saved
   mongo "mongodb+srv://onelastai-co.0fsia.mongodb.net/onelastai" \
     --username onelastai
   
   > db.subscriptions.find({ userId: "user123" })
   ```

5. **Query Subscriptions**
   ```bash
   # Check user's subscriptions via API
   curl "https://onelastai.com/api/subscriptions?userId=user123"
   
   # Returns:
   # {
   #   "success": true,
   #   "subscriptions": [{
   #     "userId": "user123",
   #     "agentId": "test-agent-123",
   #     "status": "active",
   #     "plan": "daily",
   #     "currentPeriodEnd": "2024-01-02T00:00:00.000Z",
   #     "isActive": true,
   #     "daysUntilRenewal": 1
   #   }],
   #   "count": 1
   # }
   ```

6. **Check Access**
   ```bash
   # Verify user has access to agent
   curl -X POST https://onelastai.com/api/subscriptions/check-access \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "user123",
       "agentId": "test-agent-123"
     }'
   
   # Returns:
   # {
   #   "success": true,
   #   "hasAccess": true,
   #   "subscription": {
   #     "id": "...",
   #     "plan": "daily",
   #     "status": "active",
   #     "currentPeriodEnd": "2024-01-02T00:00:00.000Z",
   #     "daysUntilRenewal": 1,
   #     "isActive": true
   #   }
   # }
   ```

## 🔍 Monitoring & Debugging

### Check Webhook Deliveries
1. Go to: https://dashboard.stripe.com/webhooks
2. Click on your webhook endpoint
3. View "Recent deliveries" tab
4. Check for:
   - ✅ Success (200 response)
   - ❌ Failures (check error message)

### Common Issues

**Issue: Webhook signature verification fails**
- Solution: Ensure `STRIPE_WEBHOOK_SECRET` matches dashboard
- Check: Secret starts with `whsec_`

**Issue: Subscriptions not saving**
- Check: MongoDB connection string correct
- Check: Server logs for database errors
- Verify: `Subscription` model imported correctly

**Issue: Checkout session creation fails**
- Verify: Product IDs exist in Stripe dashboard
- Check: All required fields provided (agentId, plan, userId, email)
- Ensure: Stripe secret key is production key (`sk_live_`)

### View Server Logs
```bash
# Real-time logs
pm2 logs

# Filter for Stripe events
pm2 logs | grep "Stripe"

# Check for errors
pm2 logs --err
```

## 📊 Database Schema

**Subscriptions Collection:**
```javascript
{
  _id: ObjectId("..."),
  userId: "user123",
  email: "user@example.com",
  agentId: "agent456",
  agentName: "AI Assistant",
  plan: "daily",
  stripeSubscriptionId: "sub_xxx",
  stripeCustomerId: "cus_xxx",
  stripePriceId: "price_xxx",
  status: "active",
  price: 100, // cents
  currency: "usd",
  startDate: ISODate("2024-01-01T00:00:00Z"),
  currentPeriodStart: ISODate("2024-01-01T00:00:00Z"),
  currentPeriodEnd: ISODate("2024-01-02T00:00:00Z"),
  cancelAtPeriodEnd: false,
  canceledAt: null,
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

## ✨ What This Completes

### Before (Issues)
- ❌ No API routes to create Stripe checkout sessions
- ❌ No webhook handler to receive Stripe events
- ❌ Subscriptions not being saved to MongoDB
- ❌ No way to query user subscriptions
- ❌ No access control for paid agents

### After (Fixed)
- ✅ Complete checkout flow (create session → redirect → payment)
- ✅ Webhook handler processes 6 event types automatically
- ✅ Subscriptions saved with full metadata (dates, status, plan)
- ✅ Query API to get user subscriptions
- ✅ Check access API to verify user has active subscription
- ✅ Subscription lifecycle management (create, update, cancel)
- ✅ Automatic status updates (active, past_due, canceled)

## 🎯 Next Steps

1. **Deploy files to production server**
2. **Install npm dependencies** (stripe, mongoose)
3. **Configure Stripe webhook URL** in dashboard
4. **Test payment flow** with test card
5. **Verify subscriptions** saving to MongoDB
6. **Update agent pages** to check subscription access
7. **Add subscription management UI** (view, cancel)

## 📝 Integration with Agent Pages

To check if user has access to an agent:

```typescript
// In agent page component
async function checkAccess(agentId: string) {
  const user = await getCurrentUser()
  
  const response = await fetch('/api/subscriptions/check-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      agentId: agentId
    })
  })
  
  const data = await response.json()
  
  if (!data.hasAccess) {
    // Redirect to payment page
    window.location.href = `/payment?agent=${agentId}`
  }
}
```

## 🔐 Security Considerations

- ✅ Webhook signature verification prevents fake events
- ✅ MongoDB connection pooling prevents connection exhaustion
- ✅ Input validation on all API routes
- ✅ Idempotent webhook handlers (no duplicate subscriptions)
- ✅ Status checks before granting access
- ✅ Secure environment variable storage

---

**Status:** All files created, ready for deployment
**Last Updated:** 2024-01-XX
**Author:** GitHub Copilot
