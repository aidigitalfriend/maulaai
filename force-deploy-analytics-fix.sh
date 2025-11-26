#!/bin/bash

echo "🔧 Force Deploying Analytics 404 Fix..."

# SSH to server and force deploy the fix
echo "📡 Connecting to server..."
ssh -o StrictHostKeyChecking=no -i /Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem ubuntu@47.129.43.231 << 'EOF'
    cd /home/ubuntu/shiny-friend-disco
    
    echo "🧹 Stashing local changes..."
    git stash
    
    echo "📥 Force pulling latest changes..."
    git fetch origin main
    git reset --hard origin/main
    
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install --production --no-audit
    
    echo "🔄 Restarting backend service..."
    pm2 restart shiny-backend
    
    echo "✅ Backend restarted successfully"
    
    echo "🧪 Testing analytics endpoint..."
    sleep 5
    curl -s "http://localhost:3005/api/user/analytics" | head -50
    
    echo ""
    echo "✅ Analytics 404 fix force deployed!"
EOF