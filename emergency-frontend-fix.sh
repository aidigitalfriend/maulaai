#!/bin/bash

# ===================================================
# 🚀 EMERGENCY FRONTEND FIX - PRODUCTION SERVER
# ===================================================
# Fix the crashing frontend that's causing 502 errors
# ===================================================

set -e

KEY="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"
SERVER="ubuntu@47.129.43.231"
REMOTE_DIR="/home/ubuntu/shiny-friend-disco"

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}🚨 EMERGENCY FRONTEND FIX${NC}"
echo "============================="
echo "Target: Crashed frontend process"
echo "Server: $SERVER"
echo ""

ssh_run() {
    ssh -i "$KEY" -o LogLevel=QUIET "$SERVER" "$1"
}

echo -e "${BLUE}Step 1: Stopping crashed frontend process${NC}"
ssh_run "pm2 delete shiny-frontend || echo 'Process already stopped'"

echo ""
echo -e "${BLUE}Step 2: Checking frontend environment${NC}"
echo "Frontend directory contents:"
ssh_run "ls -la $REMOTE_DIR/frontend/ | head -10"

echo ""
echo "Frontend .env file:"
ssh_run "head -5 $REMOTE_DIR/frontend/.env || echo 'No frontend .env'"

echo ""
echo "Package.json scripts:"
ssh_run "cat $REMOTE_DIR/frontend/package.json | grep -A 10 '\"scripts\"' || echo 'No package.json'"

echo ""
echo -e "${BLUE}Step 3: Checking for build issues${NC}"
echo "Node.js version:"
ssh_run "node --version"

echo "NPM version:"  
ssh_run "npm --version"

echo ""
echo "Next.js build status:"
ssh_run "test -d $REMOTE_DIR/frontend/.next && echo 'Build exists' || echo 'Build missing'"

echo ""
echo -e "${BLUE}Step 4: Checking recent frontend logs${NC}"
echo "Last frontend error logs:"
ssh_run "tail -20 /home/ubuntu/.pm2/logs/shiny-frontend-error.log || echo 'No error logs'"

echo ""
echo "Last frontend output logs:"  
ssh_run "tail -20 /home/ubuntu/.pm2/logs/shiny-frontend-out.log || echo 'No output logs'"

echo ""
echo -e "${BLUE}Step 5: Attempting manual frontend start${NC}"
echo "Testing frontend startup manually..."
ssh_run "cd $REMOTE_DIR/frontend && timeout 10s npm start 2>&1 | head -10 || echo 'Manual start failed or timed out'"

echo ""
echo -e "${BLUE}Step 6: Rebuilding frontend${NC}"
echo "Rebuilding Next.js application..."
ssh_run "cd $REMOTE_DIR/frontend && npm run build 2>&1 | tail -10 || echo 'Build failed'"

echo ""
echo -e "${BLUE}Step 7: Starting frontend with PM2${NC}"
echo "Starting frontend process..."
ssh_run "cd $REMOTE_DIR && pm2 start ecosystem.config.js --only shiny-frontend || pm2 start 'cd frontend && npm start' --name shiny-frontend"

sleep 5

echo ""
echo "PM2 status after restart:"
ssh_run "pm2 status"

echo ""
echo -e "${BLUE}Step 8: Testing endpoints${NC}"
echo "Testing backend health:"
ssh_run "curl -s http://localhost:3005/health | head -3 || echo 'Backend not responding'"

echo ""
echo "Testing frontend health:"
ssh_run "curl -s -I http://localhost:3000 2>/dev/null | head -3 || echo 'Frontend not responding'"

echo ""
echo "Testing external site:"
curl -s -I https://onelastai.co/ 2>/dev/null | head -3 || echo "Still getting 502 - checking Nginx config next..."

echo ""
echo -e "${BLUE}Step 9: Nginx configuration check${NC}"
ssh_run "sudo nginx -t || echo 'Nginx config invalid'"

echo ""
echo "Nginx processes:"
ssh_run "ps aux | grep nginx | grep -v grep"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🔧 EMERGENCY FIX COMPLETE${NC}" 
echo -e "${GREEN}========================================${NC}"
echo ""
echo "If site is still down, try:"
echo "1. SSH: ssh -i $KEY $SERVER"
echo "2. Manual restart: cd $REMOTE_DIR && pm2 restart all"
echo "3. Check logs: pm2 logs shiny-frontend"
echo "4. Test manually: cd $REMOTE_DIR/frontend && npm start"