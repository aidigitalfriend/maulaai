#!/bin/bash

# =================================================
# Fix Production Build - Complete rebuild
# =================================================

set -e

SERVER="ubuntu@47.129.43.231"
SSH_KEY_FILE="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"

echo "🔧 Fixing production build..."

ssh -i "$SSH_KEY_FILE" "$SERVER" << 'EOF'
cd ~/shiny-friend-disco

echo "🧹 Cleaning up build artifacts..."
rm -rf frontend/.next
rm -rf frontend/node_modules/.cache
rm -f frontend/package-lock.json
rm -f package-lock.json

echo "📦 Installing dependencies..."
cd frontend
npm install

echo "🏗️ Building production version..."
npm run build

echo "🔄 Restarting frontend service..."
cd ~/shiny-friend-disco
pm2 restart frontend

echo "⏳ Waiting for service to start..."
sleep 5

echo "📊 Final status:"
pm2 list

EOF

echo "✅ Production build complete!"
echo "🌐 Site should be accessible at: https://onelastai.co"