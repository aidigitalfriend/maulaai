#!/bin/bash

# Database Migration Deployment Script
echo "🚀 Deploying Database Migration Changes..."
echo "========================================"

# SSH configuration
SSH_KEY="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"
REMOTE_USER="ubuntu"
REMOTE_HOST="47.129.43.231"
REMOTE_DIR="/home/ubuntu/shiny-friend-disco"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

ssh_run() {
    ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" "$1"
}

echo -e "${BLUE}Step 1: Pulling latest changes on production server${NC}"
ssh_run "cd $REMOTE_DIR && git pull origin main"

echo -e "${BLUE}Step 2: Installing backend dependencies${NC}"
ssh_run "cd $REMOTE_DIR/backend && npm install --production"

echo -e "${BLUE}Step 3: Installing frontend dependencies${NC}" 
ssh_run "cd $REMOTE_DIR/frontend && npm install --production"

echo -e "${BLUE}Step 4: Restarting backend service${NC}"
ssh_run "pm2 restart shiny-backend || echo 'Backend service restart failed'"

echo -e "${BLUE}Step 5: Restarting frontend service${NC}"
ssh_run "pm2 restart shiny-frontend || echo 'Frontend service restart failed'"

echo -e "${BLUE}Step 6: Checking service status${NC}"
ssh_run "pm2 list"

echo -e "${BLUE}Step 7: Testing API endpoints${NC}"
echo "Testing agents API..."
curl -s "https://onelastai.co/api/agents" | jq '.success, .count' || echo "API test failed"

echo "Testing agent collections mapping..."
curl -s "https://onelastai.co/api/agent-collections/mapping" | jq '.success, .count' || echo "Collections API test failed"

echo -e "${GREEN}✅ Database migration deployment completed!${NC}"
echo ""
echo "🔍 Next steps:"
echo "1. Monitor PM2 logs: ssh -i ~/.ssh/onelastai ubuntu@47.129.43.231 'pm2 logs'"
echo "2. Test agent endpoints manually"
echo "3. Check application functionality"