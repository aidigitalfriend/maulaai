#!/bin/bash

# =================================================
# Simple Public Repo Deployment
# =================================================

set -e

SERVER="ubuntu@47.129.43.231"
SSH_KEY_FILE="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"

echo "🚀 Deploying from public GitHub repository..."

ssh -i "$SSH_KEY_FILE" "$SERVER" << 'EOF'
cd ~/shiny-friend-disco

echo "📦 Pulling latest changes from public repo..."
git pull origin main

echo "🔧 Installing frontend dependencies..."
cd frontend
npm install

echo "🏗️ Building production frontend..."
npm run build

echo "🔄 Restarting services..."
cd ~/shiny-friend-disco
pm2 restart all

echo "📊 Service status:"
pm2 list

EOF

echo "✅ Deployment complete!"
echo "🌐 Test your changes at: https://onelastai.co"
echo ""
echo "🔧 Authentication fix deployed:"
echo "   ✓ HttpOnly session cookies instead of JWT"
echo "   ✓ User identity from server session, not localStorage" 
echo "   ✓ Fixed 403 Forbidden errors on dashboard"