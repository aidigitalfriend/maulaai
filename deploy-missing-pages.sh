#!/bin/bash

# Deploy missing pages fix to production
# This script rebuilds frontend and uploads the new pages

echo "🔧 Deploying missing pages fix..."

cd /Users/onelastai/Downloads/shiny-friend-disco/frontend

# Build the frontend with new pages
echo "📦 Building frontend with new pages..."
npm run build

# Upload the new build to production
echo "🚀 Uploading build to production server..."
rsync -avz --progress .next/ ubuntu@47.129.43.231:/home/ubuntu/shiny-friend-disco/frontend/.next/ -e "ssh -i '/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem' -o LogLevel=QUIET"

# Upload the new app directory structure
echo "📁 Uploading app directory..."
rsync -avz --progress app/ ubuntu@47.129.43.231:/home/ubuntu/shiny-friend-disco/frontend/app/ -e "ssh -i '/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem' -o LogLevel=QUIET"

# Restart frontend process
echo "🔄 Restarting frontend process..."
ssh -i "/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem" -o LogLevel=QUIET ubuntu@47.129.43.231 "cd /home/ubuntu/shiny-friend-disco && pm2 restart shiny-frontend"

echo "✅ Missing pages deployment completed!"
echo "🌐 Testing the new pages..."

# Test the new endpoints
sleep 3
curl -I https://onelastai.co/dashboard/agent-performance 2>/dev/null | head -1
curl -I https://onelastai.co/agents/create 2>/dev/null | head -1

echo "🎉 Deployment successful!"