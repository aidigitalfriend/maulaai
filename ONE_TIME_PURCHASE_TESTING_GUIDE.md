# One-Time Purchase System - Testing Guide

## System Overview

The system implements **one-time purchases** (not subscriptions) with these key features:

- User can only buy one plan per agent at a time
- No auto-renewal (autoRenew defaults to false)
- User can cancel anytime (keeps subscription record)
- After expiry/cancellation, user can purchase again
- Hourly cron job auto-marks expired subscriptions

---

## Test Cases

### Test 1: First Purchase (Happy Path)

**Steps:**

1. Login as a test user
2. Navigate to `/subscribe`
3. Select an agent (e.g., "Ade Alpha")
4. Click "Subscribe" for any plan (Monthly/Quarterly/Annually)
5. Complete Stripe checkout

**Expected:**

- ✅ Checkout page opens
- ✅ After payment, redirected to success page
- ✅ Database has new subscription with `status: 'active'`, `autoRenew: false`
- ✅ Back on `/subscribe`, see active subscription card showing:
  - Plan name (Monthly/Quarterly/Annually)
  - Expiry date
  - Days remaining
  - "Start Chatting" button
  - "Cancel Subscription" button

---

### Test 2: Duplicate Purchase Prevention

**Steps:**

1. With active subscription from Test 1
2. Try to click "Subscribe" on any plan for the same agent

**Expected:**

- ✅ All "Subscribe" buttons are disabled (grayed out)
- ✅ Active subscription card is visible at top
- ✅ Cannot initiate checkout

**Alternative Test:**

1. Try to manually call `/api/stripe/checkout` with same agentId
2. Should return error: `"You already have an active subscription for this agent"`
3. Error includes details: plan, expiryDate, daysRemaining

---

### Test 3: Double-Click Prevention

**Steps:**

1. Logout and login as different user (no subscription)
2. Navigate to `/subscribe`
3. Click "Subscribe" for a plan
4. Quickly click the same button again before redirect

**Expected:**

- ✅ Button shows "⏳ Processing..." after first click
- ✅ All other "Subscribe" buttons disabled
- ✅ Second click does nothing
- ✅ Only one Stripe session created
- ✅ Only one checkout page opens

---

### Test 4: Cancel Subscription

**Steps:**

1. With active subscription, click "Cancel Subscription"
2. Confirm cancellation in browser dialog

**Expected:**

- ✅ Shows success message
- ✅ Subscription card disappears
- ✅ Pricing plans reappear
- ✅ Database subscription status changed to `'cancelled'`
- ✅ Record still exists (not deleted)
- ✅ Can now purchase again immediately

---

### Test 5: Re-Purchase After Cancellation

**Steps:**

1. After cancelling (Test 4)
2. Click "Subscribe" for any plan (can be different from original)
3. Complete Stripe checkout

**Expected:**

- ✅ Checkout works normally
- ✅ New subscription created in database
- ✅ Old cancelled subscription remains in history
- ✅ Active subscription card shows new plan details

---

### Test 6: Automatic Expiration (Cron Job)

**Setup:**

1. Manually edit a subscription in database:
   ```javascript
   // In MongoDB
   db.subscriptions.updateOne(
     { userId: 'test-user-id', agentId: 'ade-alpha' },
     { $set: { expiryDate: new Date('2024-01-01') } } // Past date
   );
   ```
2. Wait for next hour mark OR manually trigger cron

**To manually trigger cron:**

```bash
cd /Users/onelastai/Downloads/shiny-friend-disco/backend
node -e "import('./services/subscription-cron.js').then(m => m.expireOldSubscriptions())"
```

**Expected:**

- ✅ Cron logs: "Marked X subscription(s) as expired"
- ✅ Database subscription status changed to `'expired'`
- ✅ Refresh `/subscribe` page - subscription card disappears
- ✅ Pricing plans reappear
- ✅ Can purchase again

---

### Test 7: Multiple Agents

**Steps:**

1. Purchase subscription for Agent 1 (e.g., "Ade Alpha")
2. Navigate to same `/subscribe` page
3. Switch to Agent 2 (if UI supports it) or check that you can subscribe to different agent

**Expected:**

- ✅ Can have active subscriptions for multiple different agents simultaneously
- ✅ Each agent tracks independently
- ✅ Cannot have 2+ active subscriptions for the SAME agent

---

### Test 8: Database Validation

**Check these fields in MongoDB after purchase:**

```javascript
{
  _id: ObjectId,
  userId: "user-id-string",
  agentId: "agent-id-string",
  plan: "monthly" | "quarterly" | "annually",
  price: 9.99 | 24.99 | 89.99,
  status: "active" | "cancelled" | "expired",
  startDate: ISODate,
  expiryDate: ISODate,
  autoRenew: false,  // MUST be false
  stripeSubscriptionId: "sub_xxx",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Validate:**

- ✅ `autoRenew` is `false` (not true)
- ✅ `expiryDate` = `startDate` + plan duration
- ✅ `status` is `'active'` for new subscriptions
- ✅ All required fields present

---

## Edge Cases to Test

### Edge Case 1: Expired Checkout Session

**Steps:**

1. Click "Subscribe"
2. Stripe checkout opens
3. Wait 30+ minutes without completing payment
4. Try to complete payment

**Expected:**

- ❌ Stripe shows "Session expired" error
- ✅ No subscription created in database
- ✅ Can try again with new checkout session

---

### Edge Case 2: Failed Payment

**Steps:**

1. Use Stripe test card: `4000 0000 0000 0002` (card declined)
2. Try to complete checkout

**Expected:**

- ❌ Payment fails at Stripe
- ✅ No subscription created in database
- ✅ Can retry with valid card

---

### Edge Case 3: Network Error During Checkout

**Steps:**

1. Click "Subscribe"
2. Turn off internet before checkout loads
3. Turn internet back on

**Expected:**

- ✅ Error message shows
- ✅ "Subscribe" button re-enables
- ✅ Can try again

---

## Manual Database Checks

### Check Active Subscriptions

```javascript
// In MongoDB shell or Compass
db.subscriptions.find({ status: 'active' });
```

### Check Cancelled Subscriptions

```javascript
db.subscriptions.find({ status: 'cancelled' });
```

### Check Expired Subscriptions

```javascript
db.subscriptions.find({ status: 'expired' });
```

### Check User's Subscription History

```javascript
db.subscriptions.find({ userId: 'specific-user-id' }).sort({ createdAt: -1 });
```

### Manually Expire a Subscription (for testing)

```javascript
db.subscriptions.updateOne(
  { _id: ObjectId('subscription-id') },
  { $set: { status: 'expired' } }
);
```

---

## API Endpoint Testing

### Test Check-Active Endpoint

```bash
curl -X POST http://localhost:3005/api/agent-subscriptions/check-active \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id", "agentId": "ade-alpha"}'
```

**Expected Response:**

```json
{
  "hasActive": true,
  "subscription": {
    "userId": "test-user-id",
    "agentId": "ade-alpha",
    "plan": "monthly",
    "status": "active",
    "expiryDate": "2025-02-15T00:00:00.000Z"
  }
}
```

### Test Cancel Endpoint

```bash
curl -X POST http://localhost:5000/api/subscriptions/cancel \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id", "agentId": "ade-alpha"}'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Subscription cancelled successfully"
}
```

---

## Production Readiness Checklist

- [x] autoRenew defaults to false
- [x] Pre-purchase validation prevents duplicates
- [x] Double-click prevention implemented
- [x] Active subscription displayed in UI
- [x] Cancel functionality works (frontend + backend)
- [x] Cron job auto-expires old subscriptions
- [ ] End-to-end testing completed
- [ ] All test cases passed
- [ ] Stripe webhook handles payment success
- [ ] Error messages are user-friendly
- [ ] Loading states work correctly

---

## Next Steps After Testing

1. **If bugs found:** Fix and re-test
2. **If all tests pass:** Deploy to production
3. **Post-deployment:** Monitor logs for:
   - Cron job executions (hourly)
   - Any duplicate purchase attempts
   - Successful purchases and cancellations
4. **User feedback:** Collect feedback on purchase flow UX

---

## Troubleshooting

### Issue: Cron job not running

**Check:**

```bash
# SSH to server
pm2 logs shiny-backend | grep Cron
# Should see: "Subscription expiration cron job started"
```

### Issue: Checkout button always disabled

**Check:**

1. Browser console for errors
2. Verify `processingPlan` state resets after error
3. Clear browser cache and cookies

### Issue: Active subscription not showing

**Check:**

1. Database has subscription with `status: 'active'`
2. `/api/subscriptions/check` endpoint returns data
3. Browser console for API errors
4. Verify `userId` and `agentId` match

### Issue: Can purchase duplicate

**Check:**

1. `/api/stripe/checkout` validation is running
2. Database query is correct
3. `userId` and `agentId` are being passed correctly
4. Check browser network tab for `/api/stripe/checkout` response

---

## Success Criteria

System is ready for production when:
✅ User cannot purchase same agent twice while active
✅ UI clearly shows active subscription with cancel option
✅ Cancellation works and allows re-purchase
✅ Cron job successfully expires old subscriptions
✅ All validation and error handling working
✅ No duplicate purchase edge cases found
✅ Database records are accurate and consistent
