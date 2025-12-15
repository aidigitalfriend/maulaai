#!/bin/bash
# Simple deployment via SSH - tries multiple connection methods

set -e

SERVER="ubuntu@47.129.43.231"
KEY="one-last-ai.pem"
REMOTE_PATH="~/shiny-friend-disco"

echo "🚀 Deploying to production..."

# Try direct SSH deployment
ssh -o ConnectTimeout=10 -i "$KEY" "$SERVER" << 'ENDSSH'
cd ~/shiny-friend-disco || exit 1
echo "📥 Pulling latest code..."
git pull origin main
echo "🔄 Restarting services..."
pm2 restart shiny-backend shiny-frontend
pm2 list
ENDSSH

echo "✅ Deployment complete!"
echo "🔍 Testing endpoints..."
sleep 3
curl -f https://onelastai.co/api/status || echo "⚠️  API check failed"
curl -f https://onelastai.co/ || echo "⚠️  Frontend check failed"
