#!/bin/bash

# =================================================
# Quick Deploy - Auth Fix for HttpOnly Cookies
# =================================================

set -e

SERVER="ubuntu@47.129.43.231"
SSH_KEY_FILE="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"

echo "🚀 Deploying HttpOnly cookie authentication fix..."

ssh -i "$SSH_KEY_FILE" "$SERVER" << 'EOF'
cd ~/shiny-friend-disco

echo "📦 Pulling latest changes..."
git pull origin main

echo "🔧 Installing dependencies..."
cd frontend
npm install --silent

echo "🏗️ Building frontend..."
npm run build

echo "🔄 Restarting PM2 services..."
cd ~/shiny-friend-disco
pm2 restart all

echo "📊 Services status:"
pm2 list

EOF

echo "✅ Deployment complete!"
echo ""
echo "🧪 The localStorage issue should now be fixed!"
echo "🌐 Test at: https://onelastai.co/dashboard/security"
echo ""
echo "💡 What was fixed:"
echo "   - Frontend no longer uses localStorage for user identity"
echo "   - User data comes from server session validation only"  
echo "   - HttpOnly cookie contains session ID, not user ID"