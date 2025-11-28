#!/bin/bash

echo "🔧 Deploying backend server fix..."

# Build and deploy backend
echo "📦 Building backend..."
cd backend
npm run build 2>/dev/null || echo "No build script found, skipping build"

echo "🚀 Deploying backend to production..."
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='.env*' \
  --exclude='*.bak' \
  . ubuntu@onelastai.co:/home/ubuntu/shiny-friend-disco/backend/

# Upload package.json separately
rsync -avz package.json ubuntu@onelastai.co:/home/ubuntu/shiny-friend-disco/backend/

echo "🔄 Restarting backend server..."
ssh ubuntu@onelastai.co "cd /home/ubuntu/shiny-friend-disco/backend && pm2 restart shiny-backend"

echo "🧪 Testing backend API..."
curl -s -o /dev/null -w "Backend status: %{http_code}\n" https://onelastai.co/api/auth/status

echo "✅ Backend deployment complete!"
