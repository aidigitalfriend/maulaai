#!/bin/bash

# =================================================
# Quick Deploy - Auth Fix for HttpOnly Cookies
# =================================================

set -e

SERVER="ubuntu@ec2-47-129-43-231.ap-southeast-1.compute.amazonaws.com"
SSH_KEY_FILE="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"

echo "🚀 Deploying latest changes to production..."

ssh -i "$SSH_KEY_FILE" "$SERVER" << 'EOF'
cd ~/shiny-friend-disco

echo "📦 Pulling latest changes..."
git pull origin main

echo "🔧 Installing frontend dependencies..."
cd frontend
npm install --silent

echo "🏗️ Building frontend..."
npm run build

echo "🔧 Installing backend dependencies..."
cd ~/shiny-friend-disco/backend
npm install --silent

echo "🔄 Restarting PM2 services..."
cd ~/shiny-friend-disco
pm2 restart all

echo "📊 Services status:"
pm2 list

EOF

echo "✅ Deployment complete!"
echo "🌐 Test at: https://onelastai.co/dashboard/agent-management"
