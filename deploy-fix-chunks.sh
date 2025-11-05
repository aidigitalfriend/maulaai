#!/bin/bash

# 🔧 Emergency Fix for ChunkLoadError
# Run this on your EC2 server to fix the production build issues

set -e

echo "================================================"
echo "🔧 Fixing ChunkLoadError Issues"
echo "================================================"
echo ""

cd ~/shiny-friend-disco || cd /var/www/shiny-friend-disco || cd /home/ubuntu/shiny-friend-disco

echo "📥 Step 1: Pulling latest code from GitHub..."
git fetch origin
git reset --hard origin/main
echo "✅ Code updated!"
echo ""

echo "🧹 Step 2: Cleaning old build artifacts..."
cd frontend
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Cleaned!"
echo ""

echo "📦 Step 3: Ensuring dependencies are up to date..."
npm install --legacy-peer-deps
echo "✅ Dependencies installed!"
echo ""

echo "🔨 Step 4: Building fresh production bundle..."
NODE_ENV=production npm run build
echo "✅ Build complete!"
echo ""

echo "🔄 Step 5: Restarting frontend with PM2..."
cd ..
pm2 delete frontend-app 2>/dev/null || true
cd frontend
pm2 start npm --name "frontend-app" -- run start --update-env
pm2 save
echo "✅ Frontend restarted!"
echo ""

echo "🔄 Step 6: Restarting backend (if needed)..."
cd ../backend
pm2 restart backend-api 2>/dev/null || pm2 start npm --name "backend-api" -- run dev --update-env
pm2 save
echo "✅ Backend restarted!"
echo ""

echo "================================================"
echo "✅ Deployment Complete!"
echo "================================================"
echo ""
echo "📊 PM2 Status:"
pm2 list
echo ""
echo "🌐 Your site should now be working at https://onelastai.co"
echo ""
echo "🧹 IMPORTANT: Clear Cloudflare cache now!"
echo "Run: bash scripts/purge-cloudflare-cache.sh"
echo ""
