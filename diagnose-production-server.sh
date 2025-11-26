#!/bin/bash

# ===================================================
# 🚨 PRODUCTION SERVER EMERGENCY RECOVERY SCRIPT 
# ===================================================
# Fix 502 Bad Gateway error for https://onelastai.co/
# Server: ubuntu@47.129.43.231
# ===================================================

set -e

# Configuration
KEY="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"
SERVER="ubuntu@47.129.43.231"
REMOTE_DIR="/home/ubuntu/shiny-friend-disco"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚨 PRODUCTION SERVER RECOVERY${NC}"
echo "================================="
echo "Server: $SERVER"
echo "Domain: https://onelastai.co/"
echo ""

# Function to run SSH commands
ssh_run() {
    ssh -i "$KEY" -o LogLevel=QUIET -o ConnectTimeout=10 "$SERVER" "$1"
}

# Step 1: Check server connectivity
echo -e "${BLUE}Step 1: Testing Server Connectivity${NC}"
if ssh_run "echo 'Server is accessible'"; then
    echo -e "${GREEN}✅ SSH connection successful${NC}"
else
    echo -e "${RED}❌ Cannot connect to server${NC}"
    echo "Please check:"
    echo "1. Server is running"
    echo "2. SSH key permissions: chmod 400 $KEY"
    echo "3. Security group allows SSH (port 22)"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Checking System Status${NC}"
echo "System info:"
ssh_run "uptime && free -h | head -2 && df -h | grep -E '(Filesystem|/$)'"

echo ""
echo -e "${BLUE}Step 3: Checking Services Status${NC}"
echo "PM2 processes:"
ssh_run "pm2 status || echo 'PM2 not running'"

echo ""
echo "Nginx status:"
ssh_run "sudo systemctl status nginx --no-pager -l | head -10 || echo 'Nginx not running'"

echo ""
echo "Port usage:"
ssh_run "sudo netstat -tlnp | grep -E ':(80|443|3000|3005)' | head -10 || echo 'No processes on web ports'"

echo ""
echo -e "${BLUE}Step 4: Checking Application Files${NC}"
echo "Project directory:"
ssh_run "ls -la $REMOTE_DIR | head -10 || echo 'Project directory missing'"

echo ""
echo "Backend server file:"
ssh_run "ls -la $REMOTE_DIR/backend/server-simple.js || echo 'Backend server missing'"

echo ""
echo "Frontend build:"
ssh_run "ls -la $REMOTE_DIR/frontend/.next || echo 'Frontend build missing'"

echo ""
echo -e "${BLUE}Step 5: Checking Configuration${NC}"
echo "Environment file:"
ssh_run "test -f $REMOTE_DIR/backend/.env && echo 'Backend .env exists' || echo 'Backend .env missing'"
ssh_run "test -f $REMOTE_DIR/frontend/.env && echo 'Frontend .env exists' || echo 'Frontend .env missing'"

echo ""
echo "PM2 ecosystem:"
ssh_run "test -f $REMOTE_DIR/ecosystem.config.js && echo 'PM2 ecosystem exists' || echo 'PM2 ecosystem missing'"

echo ""
echo -e "${BLUE}Step 6: Checking Logs${NC}"
echo "Recent PM2 logs:"
ssh_run "pm2 logs --lines 5 2>/dev/null || echo 'No PM2 logs available'"

echo ""
echo "Nginx error logs:"
ssh_run "sudo tail -5 /var/log/nginx/error.log 2>/dev/null || echo 'No Nginx error logs'"

echo ""
echo -e "${BLUE}Step 7: Recovery Actions${NC}"
echo "Attempting to restart services..."

# Try to restart PM2 processes
echo "1. Restarting PM2 processes..."
ssh_run "cd $REMOTE_DIR && pm2 restart all || pm2 start ecosystem.config.js || echo 'PM2 restart failed'"

# Check if processes started
sleep 3
echo "PM2 status after restart:"
ssh_run "pm2 status"

# Try to restart Nginx
echo ""
echo "2. Restarting Nginx..."
ssh_run "sudo systemctl restart nginx && echo 'Nginx restarted successfully' || echo 'Nginx restart failed'"

# Check Nginx status
echo "Nginx status after restart:"
ssh_run "sudo systemctl status nginx --no-pager -l | head -5"

echo ""
echo -e "${BLUE}Step 8: Final Health Checks${NC}"
echo "Testing internal endpoints..."

# Test backend health
echo "Backend health (port 3005):"
ssh_run "curl -s http://localhost:3005/health | head -3 || echo 'Backend not responding'"

# Test frontend health  
echo ""
echo "Frontend health (port 3000):"
ssh_run "curl -s -I http://localhost:3000 | head -3 || echo 'Frontend not responding'"

echo ""
echo "Testing external access..."
echo "Domain resolution:"
nslookup onelastai.co | grep -E '(Address|answer)'

echo ""
echo "External HTTP test:"
curl -s -I https://onelastai.co/ | head -3 || echo "Still getting errors - need manual intervention"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🔍 DIAGNOSIS COMPLETE${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "If the site is still down, common fixes:"
echo "1. SSH into server: ssh -i $KEY $SERVER"
echo "2. Check project directory: cd $REMOTE_DIR"
echo "3. Restart all services: pm2 restart all && sudo systemctl restart nginx"
echo "4. Check application logs: pm2 logs"
echo "5. Check Nginx config: sudo nginx -t"
echo "6. Rebuild application: npm run build (in frontend/)"
echo ""
echo "Emergency deploy command:"
echo "./deploy-live-production.sh"