#!/bin/bash

# ================================================
# Agent Subscription System - Database Setup
# ================================================
# This script sets up MongoDB indexes and validates
# the agent subscription system is ready to use.
# ================================================

echo "🚀 Starting Agent Subscription System Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# MongoDB connection string (update if needed)
MONGO_URI="${MONGODB_URI:-mongodb://localhost:27017/shiny-friend-disco}"

echo -e "${BLUE}📊 Creating MongoDB Indexes...${NC}"
echo ""

# Create indexes using mongosh
mongosh "$MONGO_URI" <<EOF

use shiny-friend-disco

// ================================================
// 1. Agent Subscriptions Collection Indexes
// ================================================
print("✅ Creating indexes for agentsubscriptions...")

db.agentsubscriptions.createIndex(
  { userId: 1, agentId: 1 }, 
  { unique: true, name: "userId_agentId_unique" }
)

db.agentsubscriptions.createIndex(
  { userId: 1, status: 1 },
  { name: "userId_status" }
)

db.agentsubscriptions.createIndex(
  { expiryDate: 1, status: 1 },
  { name: "expiryDate_status" }
)

db.agentsubscriptions.createIndex(
  { userId: 1 },
  { name: "userId_only" }
)

db.agentsubscriptions.createIndex(
  { agentId: 1 },
  { name: "agentId_only" }
)

// ================================================
// 2. Agent Chat History Collection Indexes
// ================================================
print("✅ Creating indexes for agentchathistories...")

db.agentchathistories.createIndex(
  { userId: 1, agentId: 1 },
  { unique: true, name: "userId_agentId_unique" }
)

db.agentchathistories.createIndex(
  { userId: 1, lastActivity: -1 },
  { name: "userId_lastActivity" }
)

db.agentchathistories.createIndex(
  { agentId: 1, lastActivity: -1 },
  { name: "agentId_lastActivity" }
)

db.agentchathistories.createIndex(
  { userId: 1 },
  { name: "userId_only" }
)

// ================================================
// 3. Agent Usage Collection Indexes
// ================================================
print("✅ Creating indexes for agentusages...")

db.agentusages.createIndex(
  { userId: 1, agentId: 1, date: 1 },
  { unique: true, name: "userId_agentId_date_unique" }
)

db.agentusages.createIndex(
  { userId: 1, date: -1 },
  { name: "userId_date" }
)

db.agentusages.createIndex(
  { agentId: 1, date: -1 },
  { name: "agentId_date" }
)

db.agentusages.createIndex(
  { date: 1 },
  { name: "date_only" }
)

// ================================================
// 4. Show Created Indexes
// ================================================
print("")
print("📊 Agent Subscriptions Indexes:")
printjson(db.agentsubscriptions.getIndexes())

print("")
print("📊 Agent Chat History Indexes:")
printjson(db.agentchathistories.getIndexes())

print("")
print("📊 Agent Usage Indexes:")
printjson(db.agentusages.getIndexes())

// ================================================
// 5. Insert Test Data for Ben Sega (OPTIONAL)
// ================================================
print("")
print("🧪 Would you like to insert test subscription for Agent Ben?")
print("(Skipping automatic test data - run test-ben-subscription.sh to add test data)")

EOF

echo ""
echo -e "${GREEN}✅ Database indexes created successfully!${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Test the API endpoints using test-agent-api.sh"
echo "2. Start your backend server: cd backend && npm start"
echo "3. Check indexes: mongosh and run: db.agentsubscriptions.getIndexes()"
echo ""
echo -e "${GREEN}🎉 Agent Subscription System is ready!${NC}"
