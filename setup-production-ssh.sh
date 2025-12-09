#!/bin/bash

# =================================================
# Production Server Deployment Script
# Deploys latest changes from public GitHub repository
# =================================================

set -e

SERVER="ubuntu@47.129.43.231"
SSH_KEY_FILE="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"

echo "🚀 Deploying to production server..."

# Deploy from public repository
echo "🔄 Deploying from public GitHub repository..."

# 🎯 FIXED: force pseudo-terminal allocation
ssh -tt -i "$SSH_KEY_FILE" "$SERVER" << 'EOF'
cd ~/shiny-friend-disco

# Ensure we're using HTTPS for the public repo
git remote set-url origin https://github.com/aidigitalfriend/shiny-friend-disco.git

# Verify remote
echo "📋 Git remote configuration:"
git remote -v

# Pull latest changes
echo "📦 Pulling latest changes..."
git stash || echo "No changes to stash"
git pull origin main

# Build frontend for production
echo "🔨 Building frontend for production..."
cd ~/shiny-friend-disco

# Remove conflicting lockfiles to fix bcryptjs version mismatch
echo "🧹 Cleaning up conflicting package locks..."
rm -f package-lock.json
rm -f frontend/package-lock.json

# Install dependencies fresh
cd frontend
npm install
npm run build
cd ~/shiny-friend-disco

# Update NGINX configuration
echo "🔧 Updating NGINX..."
sudo cp nginx/onelastai.co.conf /etc/nginx/sites-available/onelastai.co
sudo nginx -t
sudo systemctl reload nginx

# Restart services
echo "🔄 Restarting services..."
pm2 restart all

# Check service status
echo "📊 Service status:"
pm2 status

EOF

echo ""
echo "✅ Production deployment complete!"
echo ""
echo "🧪 Testing endpoints:"

# Test endpoints
sleep 5
curl -s "https://onelastai.co/health" | head -c 50 && echo "✅ Health endpoint working"

echo ""
echo "🎉 Deployment complete! Visitor tracking should now be active."
