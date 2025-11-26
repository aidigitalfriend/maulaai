#!/bin/bash

# ===================================================
# 🚀 DEPLOY FIXED BUILD TO PRODUCTION
# ===================================================
# Deploy the locally fixed version to production server
# This includes the dashboard + pricing page fixes
# ===================================================

set -e

KEY="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"
SERVER="ubuntu@47.129.43.231"
REMOTE_DIR="/home/ubuntu/shiny-friend-disco"

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 DEPLOYING FIXED BUILD TO PRODUCTION${NC}"
echo "========================================"
echo "Target: $SERVER"
echo "Fixes: Dashboard Suspense + Pricing page + API routes"
echo ""

# Function to run SSH commands
ssh_run() {
    ssh -i "$KEY" -o LogLevel=QUIET "$SERVER" "$1"
}

# Step 1: Build the fixed version locally
echo -e "${BLUE}Step 1: Building fixed version locally${NC}"
echo "Building frontend with all fixes..."
cd /Users/onelastai/Downloads/shiny-friend-disco/frontend
npm run build 2>&1 | tail -10

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Local build successful${NC}"
else
    echo -e "${RED}❌ Local build failed - cannot deploy${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Stopping production services${NC}"
echo "Stopping frontend process..."
ssh_run "pm2 stop shiny-frontend || echo 'Frontend already stopped'"

echo ""
echo -e "${BLUE}Step 3: Backing up current production build${NC}"
ssh_run "cd $REMOTE_DIR/frontend && cp -r .next .next.backup.$(date +%s) && echo 'Backup created'"

echo ""
echo -e "${BLUE}Step 4: Uploading fixed build${NC}"
echo "Syncing .next build folder..."
rsync -avz --delete --no-perms --no-owner --no-group \
  -e "ssh -i $KEY -o LogLevel=QUIET" \
  .next/ \
  ${SERVER}:${REMOTE_DIR}/frontend/.next/

echo ""
echo "Uploading fixed source files..."
# Upload the fixed dashboard and pricing pages
rsync -avz --no-perms --no-owner --no-group \
  -e "ssh -i $KEY -o LogLevel=QUIET" \
  app/dashboard/page.tsx \
  ${SERVER}:${REMOTE_DIR}/frontend/app/dashboard/

rsync -avz --no-perms --no-owner --no-group \
  -e "ssh -i $KEY -o LogLevel=QUIET" \
  app/pricing/per-agent/page.tsx \
  ${SERVER}:${REMOTE_DIR}/frontend/app/pricing/per-agent/

rsync -avz --no-perms --no-owner --no-group \
  -e "ssh -i $KEY -o LogLevel=QUIET" \
  app/api/auth/verify/route.ts \
  ${SERVER}:${REMOTE_DIR}/frontend/app/api/auth/verify/

echo ""
echo -e "${BLUE}Step 5: Updating backend files${NC}"
echo "Syncing backend files..."
cd ../backend
rsync -avz --no-perms --no-owner --no-group \
  -e "ssh -i $KEY -o LogLevel=QUIET" \
  server-simple.js \
  package.json \
  ${SERVER}:${REMOTE_DIR}/backend/

echo ""
echo -e "${BLUE}Step 6: Installing/updating dependencies${NC}"
echo "Updating frontend dependencies..."
ssh_run "cd $REMOTE_DIR/frontend && npm install --production 2>&1 | grep -E '(added|updated|audit)'"

echo ""
echo "Updating backend dependencies..."  
ssh_run "cd $REMOTE_DIR/backend && npm install --production 2>&1 | grep -E '(added|updated|audit)'"

echo ""
echo -e "${BLUE}Step 7: Starting services${NC}"
echo "Starting backend..."
ssh_run "cd $REMOTE_DIR && pm2 restart shiny-backend"

echo ""
echo "Starting frontend with fixed build..."
ssh_run "cd $REMOTE_DIR && pm2 start ecosystem.config.js --only shiny-frontend"

# Wait for services to start
sleep 10

echo ""
echo -e "${BLUE}Step 8: Health checks${NC}"
echo "PM2 status:"
ssh_run "pm2 status"

echo ""
echo "Backend health:"
ssh_run "curl -s http://localhost:3005/health | jq .status || curl -s http://localhost:3005/health | head -3"

echo ""
echo "Frontend health:"
ssh_run "curl -s -I http://localhost:3000 2>/dev/null | head -3 || echo 'Frontend still starting...'"

echo ""
echo "External site test:"
sleep 5
curl -s -I https://onelastai.co/ 2>/dev/null | head -3

echo ""
echo -e "${BLUE}Step 9: Verifying fix${NC}"
echo "Testing dashboard page:"
curl -s https://onelastai.co/dashboard 2>/dev/null | head -5 || echo "Dashboard test failed"

echo ""
echo "Testing pricing page:" 
curl -s https://onelastai.co/pricing/per-agent 2>/dev/null | head -5 || echo "Pricing test failed"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE${NC}" 
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Site should now be live at: https://onelastai.co/"
echo ""
echo "If still having issues:"
echo "1. Check PM2 logs: ssh -i $KEY $SERVER 'pm2 logs'"
echo "2. Manual restart: ssh -i $KEY $SERVER 'cd $REMOTE_DIR && pm2 restart all'"
echo "3. Check Nginx: ssh -i $KEY $SERVER 'sudo systemctl status nginx'"