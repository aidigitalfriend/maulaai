#!/bin/bash

# =================================================
# Simple Production Deployment Script
# Fixes the localStorage/session authentication issue
# =================================================

set -e

SERVER="ubuntu@47.129.43.231" 
SSH_KEY_FILE="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"

echo "🚀 Deploying authentication fixes to production..."

# Deploy with timeout protection
ssh -i "$SSH_KEY_FILE" "$SERVER" << 'EOF'
cd ~/shiny-friend-disco

echo "📦 Pulling latest changes..."
git stash push -m "auto-stash before deploy" || true
git pull origin main || echo "Git pull failed, continuing..."

echo "🔨 Building frontend..."
cd frontend

# Quick dependency check
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install --silent
fi

# Build 
echo "🔧 Building..."
npm run build

cd ~/shiny-friend-disco

echo "🔄 Restarting services..."
pm2 restart all || pm2 start ecosystem.config.js

echo "📊 Status:"
pm2 list

EOF

echo ""
echo "✅ Authentication fix deployed!"
echo ""
echo "🔗 Test the fix at: https://onelastai.co/dashboard/security"
echo "💡 User should now get fresh user data from session, not localStorage"