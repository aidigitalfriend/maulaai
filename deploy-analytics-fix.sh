#!/bin/bash

echo "🔧 Deploying Analytics 404 Fix..."

# SSH to server and deploy the fix
echo "📡 Connecting to server..."
ssh -o StrictHostKeyChecking=no -i /Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem ubuntu@47.129.43.231 << 'EOF'
    cd /home/ubuntu/shiny-friend-disco
    
    echo "📥 Pulling latest changes..."
    git pull origin main
    
    echo "📦 Installing dependencies..."
    cd backend
    npm install --production
    
    echo "🔄 Restarting backend service..."
    pm2 restart backend
    pm2 restart all
    
    echo "✅ Backend restarted successfully"
    
    echo "🧪 Testing analytics endpoint..."
    sleep 3
    curl -s "http://localhost:3005/api/user/analytics" | head -20
    
    echo "✅ Analytics 404 fix deployed!"
EOF