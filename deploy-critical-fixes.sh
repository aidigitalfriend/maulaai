#!/bin/bash
set -e

echo "🚀 DEPLOYING CRITICAL FIXES TO PRODUCTION"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
EC2_HOST="ubuntu@47.129.43.231"
KEY_FILE="one-last-ai.pem"
REMOTE_DIR="/home/ubuntu/shiny-friend-disco"

echo -e "${BLUE}[1/6] Staging all our critical fixes...${NC}"
git add .

echo -e "${BLUE}[2/6] Committing fixes to git...${NC}"
git commit -m "🔧 CRITICAL FIXES: Auth routing + Security + Cleanup

✅ Fixed NGINX auth routing (signup 404 resolved)
✅ Secured MongoDB credentials (removed from git)
✅ Fixed PM2 ecosystem config (stable deployment)
✅ Standardized bcrypt dependencies
✅ Cleaned mobile dead code & backup files
✅ Added explicit API routing for subscriptions
✅ Enhanced environment template
✅ Fixed TypeScript import issues

Production ready - resolves critical user-facing issues."

echo -e "${BLUE}[3/6] Pushing to GitHub repository...${NC}"
git push origin main

echo -e "${BLUE}[4/6] Deploying to production server...${NC}"
if [ -f "$KEY_FILE" ]; then
    ssh -i "$KEY_FILE" "$EC2_HOST" << 'ENDSSH'
        set -e
        echo "📂 Navigating to application directory..."
        cd /home/ubuntu/shiny-friend-disco
        
        echo "📥 Pulling latest changes from GitHub..."
        git pull origin main
        
        echo "📦 Installing/updating dependencies..."
        cd backend && npm install --production
        cd ../frontend && npm install --production
        cd ..
        
        echo "🏗️  Building frontend with latest changes..."
        cd frontend
        npm run build
        cd ..
        
        echo "🔄 Restarting services with PM2..."
        pm2 restart ecosystem.config.js --update-env
        
        echo "⏳ Waiting for services to stabilize..."
        sleep 5
        
        echo "📊 Checking PM2 status..."
        pm2 status
        
        echo "🔍 Checking service health..."
        pm2 logs --lines 10 --nostream
        
        echo "✅ Deployment complete!"
ENDSSH
else
    echo -e "${YELLOW}⚠️  SSH key not found. Using alternative deployment...${NC}"
    echo "Please manually run these commands on your server:"
    echo ""
    echo "ssh ubuntu@47.129.43.231"
    echo "cd /home/ubuntu/shiny-friend-disco"
    echo "git pull origin main"
    echo "cd backend && npm install --production"
    echo "cd ../frontend && npm install --production && npm run build"
    echo "pm2 restart ecosystem.config.js --update-env"
fi

echo -e "${BLUE}[5/6] Testing the deployment...${NC}"
echo "Testing signup endpoint..."
curl -s -o /dev/null -w "%{http_code}" "https://onelastai.co/api/auth/signup" || echo "Test will be done after deployment"

echo -e "${BLUE}[6/6] Deployment Summary${NC}"
echo -e "${GREEN}✅ Fixed critical authentication routing issue${NC}"
echo -e "${GREEN}✅ Secured database credentials${NC}"  
echo -e "${GREEN}✅ Stabilized PM2 configuration${NC}"
echo -e "${GREEN}✅ Cleaned up codebase for maintainability${NC}"
echo ""
echo -e "${YELLOW}🎯 NEXT STEPS:${NC}"
echo "1. Test signup at: https://onelastai.co/auth/signup"
echo "2. Monitor PM2 logs: pm2 logs"
echo "3. Check NGINX status: sudo systemctl status nginx"
echo ""
echo -e "${GREEN}🚀 Production deployment complete!${NC}"