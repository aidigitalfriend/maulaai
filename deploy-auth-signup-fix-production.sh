#!/bin/bash

# 🚀 Auth Signup Fix - Production Deployment Script (EC2)
# Run this on the production server after SSH login

set -e  # Exit on error

echo "======================================================"
echo "🚀 Production Deployment - Auth Signup Fix"
echo "======================================================"
echo ""

# Step 1: Pull latest changes
echo "📥 Step 1: Pull Latest Changes from GitHub"
echo "---"

cd ~/shiny-friend-disco

echo "Pulling from main branch..."
git pull origin main
echo "✅ Changes pulled"
echo ""

# Step 2: Rebuild Frontend
echo "🏗️  Step 2: Rebuild Frontend"
echo "---"

cd frontend

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building frontend..."
npm run build

echo "✅ Frontend rebuilt successfully"
echo ""

cd ..

# Step 3: Update NGINX Configuration
echo "⚙️  Step 3: Update NGINX Configuration"
echo "---"

echo "Updating NGINX config files..."
sudo cp nginx-onelastai-https.conf /etc/nginx/sites-available/onelastai-https
sudo cp nginx-onelastai.conf /etc/nginx/sites-available/onelastai
# Note: Only copy nginx-config.conf if it's your main config
# sudo cp nginx-config.conf /etc/nginx/nginx.conf

echo "✅ NGINX configs updated"
echo ""

# Step 4: Test NGINX Configuration
echo "🔍 Step 4: Test NGINX Configuration"
echo "---"

if sudo nginx -t; then
    echo "✅ NGINX config is valid"
else
    echo "❌ NGINX config has errors. Fix them before proceeding."
    exit 1
fi
echo ""

# Step 5: Reload NGINX
echo "🔄 Step 5: Reload NGINX"
echo "---"

sudo systemctl reload nginx
echo "✅ NGINX reloaded"
echo ""

# Step 6: Restart PM2 Services
echo "🔄 Step 6: Restart PM2 Services"
echo "---"

pm2 restart all
pm2 save

echo "✅ PM2 services restarted"
echo ""

# Step 7: Show Service Status
echo "📊 Step 7: Service Status"
echo "---"

pm2 status
echo ""

# Step 8: Success Message
echo "======================================================"
echo "✅ PRODUCTION DEPLOYMENT COMPLETE!"
echo "======================================================"
echo ""
echo "Deployed services:"
echo "- Frontend (Next.js): http://localhost:3000"
echo "- Backend (Express): http://localhost:3005"
echo "- NGINX proxy: https://onelastai.co"
echo ""
echo "Verification commands:"
echo ""
echo "1. Test signup endpoint:"
echo "   curl -X POST https://onelastai.co/api/auth/signup \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"test@example.com\",\"password\":\"Test12345\",\"name\":\"Test User\"}'"
echo ""
echo "2. Check NGINX logs:"
echo "   sudo tail -f /var/log/nginx/access.log"
echo ""
echo "3. Check PM2 logs:"
echo "   pm2 logs"
echo ""
echo "======================================================"
