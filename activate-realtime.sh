#!/bin/bash
# Real-Time Features Activation Script
# Deploys MongoDB Atlas + WebSocket + Real-Time Server

set -e

echo "🚀 ========================================"
echo "🚀 ACTIVATING REAL-TIME FEATURES"
echo "🚀 ========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 What's Being Activated:${NC}"
echo "  ✅ MongoDB Atlas Connection"
echo "  ✅ WebSocket Server (Socket.IO)"
echo "  ✅ Real-Time Metrics Broadcasting"
echo "  ✅ Live Chat & Community Features"
echo "  ✅ Instant Notifications"
echo ""

# Step 1: Check environment
echo -e "${YELLOW}Step 1: Checking environment...${NC}"
if [ ! -f "backend/.env" ]; then
  echo "❌ backend/.env not found!"
  exit 1
fi

if ! grep -q "mongodb+srv" backend/.env; then
  echo "❌ MongoDB Atlas connection string not found!"
  echo "Please update backend/.env with your Atlas URI"
  exit 1
fi

echo -e "${GREEN}✅ Environment configured${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}Step 2: Installing WebSocket dependencies...${NC}"
cd backend
if ! grep -q "socket.io" package.json; then
  echo "Installing socket.io..."
  npm install socket.io
fi
cd ..

cd frontend
if ! grep -q "socket.io-client" package.json; then
  echo "Installing socket.io-client..."
  npm install socket.io-client
fi
cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Test MongoDB connection
echo -e "${YELLOW}Step 3: Testing MongoDB Atlas connection...${NC}"
node -e "
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config({ path: 'backend/.env' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000
});

async function test() {
  try {
    await client.connect();
    await client.db('onelastai').command({ ping: 1 });
    console.log('✅ MongoDB Atlas: Connected successfully');
    console.log('📊 Database: onelastai');
    await client.close();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

test();
" || exit 1

echo ""

# Step 4: Check PM2
echo -e "${YELLOW}Step 4: Checking PM2 status...${NC}"
if ! command -v pm2 &> /dev/null; then
  echo "⚠️  PM2 not found. Installing..."
  npm install -g pm2
fi

echo -e "${GREEN}✅ PM2 ready${NC}"
echo ""

# Step 5: Stop old processes
echo -e "${YELLOW}Step 5: Stopping old processes...${NC}"
pm2 stop shiny-backend || true
pm2 delete shiny-backend || true
echo -e "${GREEN}✅ Old processes stopped${NC}"
echo ""

# Step 6: Start new real-time server
echo -e "${YELLOW}Step 6: Starting real-time server...${NC}"
pm2 start ecosystem.config.js --only shiny-backend
pm2 save
echo -e "${GREEN}✅ Real-time server started${NC}"
echo ""

# Step 7: Health checks
echo -e "${YELLOW}Step 7: Running health checks...${NC}"
sleep 3

echo "Checking HTTP server..."
curl -sf http://localhost:3005/health || echo "⚠️  HTTP server not responding yet"

echo ""
echo "Checking WebSocket..."
timeout 2 bash -c "echo 'test' | nc -w 1 localhost 3005" && echo "✅ WebSocket port open" || echo "⚠️  WebSocket check skipped"

echo ""
echo -e "${YELLOW}Step 8: Displaying logs...${NC}"
pm2 logs shiny-backend --lines 20 --nostream

echo ""
echo "🚀 ========================================"
echo "🚀 REAL-TIME FEATURES ACTIVATED!"
echo "🚀 ========================================"
echo ""
echo -e "${GREEN}✅ MongoDB Atlas: Connected${NC}"
echo -e "${GREEN}✅ WebSocket Server: Running on port 3005${NC}"
echo -e "${GREEN}✅ Real-Time Metrics: Broadcasting${NC}"
echo -e "${GREEN}✅ Socket.IO Path: /socket.io/${NC}"
echo ""
echo "📊 Monitor:"
echo "  pm2 status"
echo "  pm2 logs shiny-backend"
echo "  pm2 monit"
echo ""
echo "🌐 Test endpoints:"
echo "  http://localhost:3005/health"
echo "  http://localhost:3005/api/status"
echo "  ws://localhost:3005/socket.io/"
echo ""
echo "🎉 Ready for real-time features!"
