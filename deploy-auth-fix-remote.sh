#!/bin/zsh
# Auth Signup Fix - Production Deployment via SSH
# This script connects to EC2 and deploys using git pull

set -e  # Exit on error

echo "========================================================"
echo "🚀 Auth Signup Fix - Remote Deployment via Git"
echo "========================================================"
echo ""

SERVER="ubuntu@47.129.43.231"
KEY="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"
PROJECT_DIR="/home/ubuntu/shiny-friend-disco"

echo "🔑 Using SSH key: $KEY"
echo "🖥️  Target server: $SERVER"
echo "📁 Project directory: $PROJECT_DIR"
echo ""

echo "📥 Step 1: Pull Latest Changes from GitHub"
echo "---"
ssh -i "$KEY" "$SERVER" "cd $PROJECT_DIR && echo 'Current directory:' && pwd && echo 'Git status:' && git status --short && echo 'Pulling latest changes...' && git pull origin main"

echo ""
echo "🏗️  Step 2: Rebuild Frontend"
echo "---"
ssh -i "$KEY" "$SERVER" "cd $PROJECT_DIR/frontend && echo 'Installing dependencies...' && npm install && echo 'Building frontend...' && npm run build"

echo ""
echo "⚙️  Step 3: Update NGINX Configuration"
echo "---"
ssh -i "$KEY" "$SERVER" "cd $PROJECT_DIR && echo 'Updating NGINX configs...' && sudo cp nginx-onelastai-https.conf /etc/nginx/sites-available/onelastai-https && sudo cp nginx-onelastai.conf /etc/nginx/sites-available/onelastai && echo 'Testing NGINX config...' && sudo nginx -t && echo 'Reloading NGINX...' && sudo systemctl reload nginx"

echo ""
echo "🔄 Step 4: Restart Services"
echo "---" 
ssh -i "$KEY" "$SERVER" "echo 'Restarting PM2 services...' && pm2 restart all && pm2 save && echo 'Service status:' && pm2 status"

echo ""
echo "✅ Step 5: Test Signup Endpoint"
echo "---"
ssh -i "$KEY" "$SERVER" "echo 'Testing signup endpoint...' && curl -X POST https://onelastai.co/api/auth/signup -H 'Content-Type: application/json' -d '{\"email\":\"test-\$(date +%s)@example.com\",\"name\":\"Test User\",\"password\":\"Test12345\"}' -w '\\nHTTP Status: %{http_code}\\n'"

echo ""
echo "========================================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "========================================================"
echo ""
echo "🎉 Auth signup 404 fix has been deployed!"
echo ""
echo "Next steps:"
echo "1. Visit: https://onelastai.co/auth/signup"
echo "2. Try creating an account"
echo "3. Should see 'Account created successfully' instead of 404"
echo ""
echo "========================================================"