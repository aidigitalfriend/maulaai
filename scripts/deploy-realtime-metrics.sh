#!/bin/bash
# Deploy Real-Time Metrics Tracking System
# This script automates the installation and configuration

echo "============================================"
echo "  Real-Time Metrics Deployment Script"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running on server
if [ ! -d "$HOME/shiny-friend-disco" ]; then
    print_error "Project directory not found at $HOME/shiny-friend-disco"
    exit 1
fi

cd $HOME/shiny-friend-disco/backend || exit 1

print_status "Step 1: Installing dependencies..."
npm install uuid cookie-parser --save
if [ $? -eq 0 ]; then
    print_status "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

print_status "Step 2: Compiling TypeScript files..."
mkdir -p lib/compiled

npx tsc lib/metrics-tracker.ts lib/metrics-middleware.ts lib/enhanced-status.ts \
    --outDir lib/compiled \
    --module commonjs \
    --target es2020 \
    --esModuleInterop \
    --skipLibCheck \
    --resolveJsonModule

if [ $? -eq 0 ]; then
    print_status "TypeScript compilation successful"
else
    print_error "TypeScript compilation failed"
    exit 1
fi

print_status "Step 3: Creating backup of server-simple.js..."
cp server-simple.js server-simple.js.backup.$(date +%Y%m%d_%H%M%S)
print_status "Backup created"

print_status "Step 4: Checking MongoDB connection..."
if systemctl is-active --quiet mongod; then
    print_status "MongoDB is running"
else
    print_warning "MongoDB is not running. Starting..."
    sudo systemctl start mongod
    sudo systemctl enable mongod
    sleep 2
    if systemctl is-active --quiet mongod; then
        print_status "MongoDB started successfully"
    else
        print_error "Failed to start MongoDB"
        exit 1
    fi
fi

print_status "Step 5: Creating MongoDB indexes..."
mongosh --eval "
use aiAgent;
db.user_sessions.createIndex({ sessionId: 1 }, { unique: true });
db.user_sessions.createIndex({ lastActivity: 1 });
db.user_sessions.createIndex({ isActive: 1 });
db.agent_metrics.createIndex({ agentName: 1, date: 1 }, { unique: true });
db.agent_metrics.createIndex({ date: 1 });
db.api_metrics.createIndex({ timestamp: 1 });
db.api_metrics.createIndex({ endpoint: 1, timestamp: 1 });
db.hourly_metrics.createIndex({ hour: 1 }, { unique: true });
db.daily_metrics.createIndex({ date: 1 }, { unique: true });
print('Indexes created successfully');
" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_status "MongoDB indexes created"
else
    print_warning "Some indexes may already exist (this is normal)"
fi

print_status "Step 6: Testing compiled code..."
node -e "
const { metricsTracker } = require('./lib/compiled/metrics-tracker.js');
console.log('Metrics tracker loaded successfully');
" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_status "Compiled code is valid"
else
    print_error "Compiled code test failed"
    exit 1
fi

echo ""
echo "============================================"
print_status "Deployment Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Review the integration guide: REALTIME_METRICS_GUIDE.md"
echo ""
echo "2. Update server-simple.js with the following imports:"
echo "   ${YELLOW}import cookieParser from 'cookie-parser'${NC}"
echo "   ${YELLOW}import { initializeMetrics, sessionTrackingMiddleware, apiMetricsMiddleware } from './lib/compiled/metrics-middleware.js'${NC}"
echo "   ${YELLOW}import { getEnhancedStatus, getEnhancedAnalytics, getEnhancedApiStatus } from './lib/compiled/enhanced-status.js'${NC}"
echo ""
echo "3. Add middleware after express.json():"
echo "   ${YELLOW}app.use(cookieParser())${NC}"
echo "   ${YELLOW}app.use(sessionTrackingMiddleware)${NC}"
echo "   ${YELLOW}app.use(apiMetricsMiddleware)${NC}"
echo ""
echo "4. Initialize metrics after MongoDB connection:"
echo "   ${YELLOW}initializeMetrics().catch(console.error)${NC}"
echo ""
echo "5. Update status endpoints to use enhanced versions"
echo ""
echo "6. Restart the backend:"
echo "   ${YELLOW}pm2 restart backend${NC}"
echo "   ${YELLOW}pm2 logs backend --lines 50${NC}"
echo ""
echo "7. Test the endpoints:"
echo "   ${YELLOW}curl http://localhost:3001/api/status | jq '.data.realTimeMetrics'${NC}"
echo ""
echo "For detailed instructions, see: ${YELLOW}REALTIME_METRICS_GUIDE.md${NC}"
echo ""
