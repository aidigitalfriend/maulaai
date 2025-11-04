#!/bin/bash
# Complete deployment script for shiny-friend-disco
# Run this after SSH into your EC2 server

set -e  # Exit on any error

echo "🚀 Starting deployment of shiny-friend-disco..."
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    echo "Navigating to /var/www/shiny-friend-disco..."
    cd /var/www/shiny-friend-disco
fi

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Pull latest changes
echo "📥 Step 1: Pulling latest changes from GitHub..."
echo "================================================"
git status
git fetch --all
git checkout main
git pull origin main
echo "✅ Code updated successfully!"
echo ""

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
echo "================================================"
echo "Installing root dependencies..."
npm install

echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo "✅ Dependencies installed successfully!"
echo ""

# Step 3: Build frontend
echo "🔨 Step 3: Building frontend..."
echo "================================================"
cd frontend
npm run build
cd ..
echo "✅ Frontend built successfully!"
echo ""

# Step 4: Check PM2 status before deploy
echo "📊 Step 4: Current PM2 status..."
echo "================================================"
pm2 status

# Step 5: Deploy with PM2
echo "🚀 Step 5: Deploying with PM2..."
echo "================================================"
pm2 reload ecosystem.config.js --update-env
pm2 save
echo "✅ PM2 reloaded successfully!"
echo ""

# Step 6: Health checks
echo "🏥 Step 6: Running health checks..."
echo "================================================"

echo "Checking PM2 processes:"
pm2 status

echo ""
echo "Testing backend health:"
curl -sSf https://onelastai.co/health || echo "❌ Backend health check failed"

echo ""
echo "Testing API status:"
curl -sSf https://onelastai.co/api/status | head -n 5 || echo "❌ API status check failed"

echo ""
echo "Testing frontend:"
curl -sI https://onelastai.co/ | head -n 1 || echo "❌ Frontend check failed"

echo ""
echo "Testing Einstein agent page:"
curl -sI https://onelastai.co/agents/einstein | head -n 1 || echo "❌ Einstein agent check failed"

echo ""
echo "================================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "================================================"
echo ""
echo "🌐 Your site: https://onelastai.co"
echo "📊 Health: https://onelastai.co/health"
echo "📈 Status: https://onelastai.co/api/status"
echo ""
echo "Useful commands:"
echo "- Check logs: pm2 logs"
echo "- Monitor: pm2 monit" 
echo "- Restart: pm2 restart all"
echo ""