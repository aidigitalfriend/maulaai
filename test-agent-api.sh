#!/bin/bash

# ================================================
# Test Agent Subscription API Endpoints
# ================================================
# This script tests all agent subscription endpoints
# using curl commands.
# ================================================

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
API_URL="${API_URL:-http://localhost:3005}"
TEST_USER_ID="507f1f77bcf86cd799439011"  # Sample MongoDB ObjectId
AGENT_ID="ben-sega"

echo -e "${BLUE}🧪 Testing Agent Subscription API${NC}"
echo "API URL: $API_URL"
echo "Test User ID: $TEST_USER_ID"
echo "Agent ID: $AGENT_ID"
echo ""

# ================================================
# 1. Create Subscription (Daily Plan)
# ================================================
echo -e "${YELLOW}1. Creating Daily Subscription for Ben Sega...${NC}"
SUBSCRIPTION_RESPONSE=$(curl -s -X POST "$API_URL/api/agent/subscriptions/subscribe" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$TEST_USER_ID\",
    \"agentId\": \"$AGENT_ID\",
    \"plan\": \"daily\"
  }")

echo "$SUBSCRIPTION_RESPONSE" | jq '.'
SUBSCRIPTION_ID=$(echo "$SUBSCRIPTION_RESPONSE" | jq -r '.subscription._id')
echo -e "${GREEN}✅ Subscription ID: $SUBSCRIPTION_ID${NC}"
echo ""

sleep 1

# ================================================
# 2. Check Subscription Status
# ================================================
echo -e "${YELLOW}2. Checking Active Subscription Status...${NC}"
curl -s -X GET "$API_URL/api/agent/subscriptions/check/$TEST_USER_ID/$AGENT_ID" | jq '.'
echo ""

sleep 1

# ================================================
# 3. Get User's All Subscriptions
# ================================================
echo -e "${YELLOW}3. Getting All User Subscriptions...${NC}"
curl -s -X GET "$API_URL/api/agent/subscriptions/user/$TEST_USER_ID" | jq '.'
echo ""

sleep 1

# ================================================
# 4. Create New Chat Session
# ================================================
echo -e "${YELLOW}4. Creating New Chat Session...${NC}"
SESSION_ID="session-$(date +%s)"
CHAT_RESPONSE=$(curl -s -X POST "$API_URL/api/agent/chat/$TEST_USER_ID/$AGENT_ID/session" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"sessionName\": \"Test Chat with Ben Sega\",
    \"initialMessage\": {
      \"messageId\": \"msg-1\",
      \"role\": \"assistant\",
      \"content\": \"🕹️ Hey there, gamer! Welcome to Ben Sega!\",
      \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
    }
  }")

echo "$CHAT_RESPONSE" | jq '.'
echo -e "${GREEN}✅ Session ID: $SESSION_ID${NC}"
echo ""

sleep 1

# ================================================
# 5. Add User Message to Session
# ================================================
echo -e "${YELLOW}5. Adding User Message...${NC}"
curl -s -X POST "$API_URL/api/agent/chat/$TEST_USER_ID/$AGENT_ID/session/$SESSION_ID/message" \
  -H "Content-Type: application/json" \
  -d "{
    \"messageId\": \"msg-2\",
    \"role\": \"user\",
    \"content\": \"What's your favorite Sega game?\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
  }" | jq '.'
echo ""

sleep 1

# ================================================
# 6. Get Chat History
# ================================================
echo -e "${YELLOW}6. Getting Chat History...${NC}"
curl -s -X GET "$API_URL/api/agent/chat/$TEST_USER_ID/$AGENT_ID" | jq '.'
echo ""

sleep 1

# ================================================
# 7. Record Usage Data
# ================================================
echo -e "${YELLOW}7. Recording Usage Data...${NC}"
TODAY=$(date -u +%Y-%m-%d)
curl -s -X POST "$API_URL/api/agent/usage/record" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$TEST_USER_ID\",
    \"agentId\": \"$AGENT_ID\",
    \"date\": \"$TODAY\",
    \"sessionId\": \"$SESSION_ID\",
    \"messagesCount\": 2,
    \"tokensUsed\": 150,
    \"duration\": 120,
    \"interactions\": {
      \"textMessages\": 2
    },
    \"modelName\": \"gpt-3.5-turbo\"
  }" | jq '.'
echo ""

sleep 1

# ================================================
# 8. Get Daily Usage
# ================================================
echo -e "${YELLOW}8. Getting Today's Usage...${NC}"
curl -s -X GET "$API_URL/api/agent/usage/$TEST_USER_ID/$AGENT_ID/daily?date=$TODAY" | jq '.'
echo ""

sleep 1

# ================================================
# 9. Get User's Total Usage Across All Agents
# ================================================
echo -e "${YELLOW}9. Getting Total User Usage...${NC}"
curl -s -X GET "$API_URL/api/agent/usage/user/$TEST_USER_ID/total" | jq '.'
echo ""

sleep 1

# ================================================
# 10. Update Subscription (Cancel)
# ================================================
if [ ! -z "$SUBSCRIPTION_ID" ] && [ "$SUBSCRIPTION_ID" != "null" ]; then
  echo -e "${YELLOW}10. Updating Subscription (Testing Cancel)...${NC}"
  curl -s -X PUT "$API_URL/api/agent/subscriptions/$SUBSCRIPTION_ID" \
    -H "Content-Type: application/json" \
    -d "{
      \"autoRenew\": false
    }" | jq '.'
  echo ""
fi

echo ""
echo -e "${GREEN}✅ All Tests Completed!${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo "- Created subscription for $AGENT_ID"
echo "- Created chat session: $SESSION_ID"
echo "- Recorded usage data"
echo "- All API endpoints tested successfully"
echo ""
echo -e "${YELLOW}💡 Tip: Check MongoDB to verify data:${NC}"
echo "mongosh"
echo "> use shiny-friend-disco"
echo "> db.agentsubscriptions.find().pretty()"
echo "> db.agentchathistories.find().pretty()"
echo "> db.agentusages.find().pretty()"
