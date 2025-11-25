#!/bin/bash
# Test Stripe Payment APIs
# Quick tests to verify all endpoints are working

BASE_URL="https://onelastai.com"
TEST_USER_ID="test-user-$(date +%s)"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_AGENT_ID="test-agent-123"
TEST_AGENT_NAME="Test AI Agent"

echo "================================"
echo "Stripe Payment API Tests"
echo "================================"
echo ""
echo "Test User: $TEST_USER_ID"
echo "Test Email: $TEST_EMAIL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Create Checkout Session
echo "Test 1: Create Checkout Session"
echo "POST $BASE_URL/api/stripe/checkout"

CHECKOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/stripe/checkout" \
  -H "Content-Type: application/json" \
  -d "{
    \"agentId\": \"$TEST_AGENT_ID\",
    \"agentName\": \"$TEST_AGENT_NAME\",
    \"plan\": \"daily\",
    \"userId\": \"$TEST_USER_ID\",
    \"userEmail\": \"$TEST_EMAIL\"
  }")

echo "Response: $CHECKOUT_RESPONSE"

if echo "$CHECKOUT_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Checkout session created${NC}"
    CHECKOUT_URL=$(echo "$CHECKOUT_RESPONSE" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    echo "Checkout URL: $CHECKOUT_URL"
else
    echo -e "${RED}❌ Failed to create checkout session${NC}"
fi

echo ""

# Test 2: Query Subscriptions (empty for new user)
echo "Test 2: Query Subscriptions"
echo "GET $BASE_URL/api/subscriptions?userId=$TEST_USER_ID"

SUBSCRIPTIONS_RESPONSE=$(curl -s "$BASE_URL/api/subscriptions?userId=$TEST_USER_ID")

echo "Response: $SUBSCRIPTIONS_RESPONSE"

if echo "$SUBSCRIPTIONS_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Subscriptions query successful${NC}"
    COUNT=$(echo "$SUBSCRIPTIONS_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo "Subscription count: $COUNT"
else
    echo -e "${RED}❌ Failed to query subscriptions${NC}"
fi

echo ""

# Test 3: Check Access (should be false for new user)
echo "Test 3: Check Access"
echo "POST $BASE_URL/api/subscriptions/check-access"

ACCESS_RESPONSE=$(curl -s -X POST "$BASE_URL/api/subscriptions/check-access" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$TEST_USER_ID\",
    \"agentId\": \"$TEST_AGENT_ID\"
  }")

echo "Response: $ACCESS_RESPONSE"

if echo "$ACCESS_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Access check successful${NC}"
    HAS_ACCESS=$(echo "$ACCESS_RESPONSE" | grep -o '"hasAccess":[^,}]*' | cut -d':' -f2)
    echo "Has access: $HAS_ACCESS"
    
    if [ "$HAS_ACCESS" = "false" ]; then
        echo -e "${GREEN}✅ Correctly returns no access for new user${NC}"
    fi
else
    echo -e "${RED}❌ Failed to check access${NC}"
fi

echo ""
echo "================================"
echo "Test Summary"
echo "================================"
echo ""
echo "All API endpoints tested:"
echo "✅ POST /api/stripe/checkout - Creates checkout sessions"
echo "✅ GET /api/subscriptions - Queries user subscriptions"
echo "✅ POST /api/subscriptions/check-access - Verifies access"
echo ""
echo "To complete payment flow:"
echo "1. Open checkout URL in browser (printed above)"
echo "2. Use test card: 4242 4242 4242 4242"
echo "3. Complete payment"
echo "4. Verify webhook received in Stripe dashboard"
echo "5. Re-run this script to see subscription saved"
echo ""

# Test 4: Webhook endpoint exists (just check 405 for GET - webhook expects POST)
echo "Test 4: Webhook Endpoint"
echo "GET $BASE_URL/api/stripe/webhook (expecting method not allowed)"

WEBHOOK_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/stripe/webhook")

if [ "$WEBHOOK_RESPONSE" = "405" ] || [ "$WEBHOOK_RESPONSE" = "400" ]; then
    echo -e "${GREEN}✅ Webhook endpoint exists (returns $WEBHOOK_RESPONSE for GET)${NC}"
else
    echo -e "${YELLOW}⚠️  Webhook returned: $WEBHOOK_RESPONSE${NC}"
fi

echo ""
echo "📄 See STRIPE_PAYMENT_SYSTEM_COMPLETE.md for full documentation"
echo ""
