#!/bin/bash

# 🔧 Auth Fix Deployment Script
# Fixes auth verification endpoint and session persistence issues

set -e  # Exit on any error

echo "🚀 Starting Auth Fix Deployment..."
echo "============================================"

# Configuration
REMOTE_HOST="47.129.43.231"
REMOTE_USER="ubuntu"
REMOTE_DIR="/home/ubuntu/shiny-friend-disco"
LOCAL_DIR="/Users/onelastai/Downloads/shiny-friend-disco"
SSH_KEY="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"

# Check if we can reach the server first
echo "📡 Testing server connection..."
if curl -s --connect-timeout 5 https://onelastai.co > /dev/null; then
    echo "✅ Server is reachable"
else
    echo "❌ Server unreachable. Please check network connection."
    exit 1
fi

echo ""
echo "🔍 Step 1: Checking current auth endpoint..."
echo "--------------------------------------------"

# Test current auth endpoints
AUTH_VERIFY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://onelastai.co/api/auth/verify)
AUTH_LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://onelastai.co/api/auth/login)
AUTH_SIGNUP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://onelastai.co/api/auth/signup)

echo "Current API Status:"
echo "  /api/auth/verify: $AUTH_VERIFY_STATUS"
echo "  /api/auth/login: $AUTH_LOGIN_STATUS" 
echo "  /api/auth/signup: $AUTH_SIGNUP_STATUS"

if [ "$AUTH_VERIFY_STATUS" = "404" ]; then
    echo "❌ Auth verify endpoint returning 404 - needs fixing"
else
    echo "✅ Auth verify endpoint accessible"
fi

echo ""
echo "🛠️  Step 2: Fixing Auth Imports and Dependencies..."
echo "----------------------------------------------------"

# Fix the verify route imports - use relative paths instead of aliases
cd "$LOCAL_DIR/frontend"

echo "✅ Using already fixed auth routes with proper imports"

echo ""
echo "🔧 Step 3: Building Frontend..."
echo "-------------------------------"

# Build the frontend
npm run build 2>&1 | tee /tmp/auth-fix-build.log

BUILD_STATUS=${PIPESTATUS[0]}
if [ $BUILD_STATUS -ne 0 ]; then
    echo "❌ Frontend build failed!"
    echo "Last 10 lines of build log:"
    tail -10 /tmp/auth-fix-build.log
    exit 1
fi

echo "✅ Frontend build completed successfully"

echo ""
echo "🚀 Step 4: Deploying to Production..."
echo "------------------------------------"

# Create deployment package
echo "📦 Creating deployment package..."

# Sync the built frontend 
rsync -avz --progress \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.next/cache' \
    .next/ "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/frontend/.next/" \
    -e "ssh -i '$SSH_KEY' -o LogLevel=QUIET"

# Also sync the app directory to ensure routes are updated
rsync -avz --progress \
    app/ "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/frontend/app/" \
    -e "ssh -i '$SSH_KEY' -o LogLevel=QUIET"

echo "✅ Files deployed to production"

echo ""
echo "🔄 Step 5: Restarting Services..."
echo "---------------------------------"

# Restart frontend to pick up the new routes
ssh -i "$SSH_KEY" "$REMOTE_USER@$REMOTE_HOST" << 'REMOTE_COMMANDS'
echo "🔄 Restarting frontend service..."
pm2 restart shiny-frontend
pm2 save
echo "✅ Frontend restarted"
REMOTE_COMMANDS

echo ""
echo "🧪 Step 6: Testing Auth Endpoints..."
echo "-----------------------------------"

# Wait for services to restart
echo "⏳ Waiting for services to restart..."
sleep 10

# Test auth endpoints again
echo "Testing updated endpoints:"

for i in {1..5}; do
    AUTH_VERIFY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://onelastai.co/api/auth/verify)
    if [ "$AUTH_VERIFY_STATUS" = "401" ]; then
        echo "✅ /api/auth/verify: $AUTH_VERIFY_STATUS (Expected - no token provided)"
        break
    else
        echo "🔄 /api/auth/verify: $AUTH_VERIFY_STATUS (Attempt $i/5)"
        if [ $i -lt 5 ]; then
            sleep 3
        fi
    fi
done

# Test with a dummy token to see if endpoint processes requests
echo ""
echo "Testing verify endpoint with dummy token:"
VERIFY_RESPONSE=$(curl -s -w "%{http_code}" -H "Authorization: Bearer dummy-token" https://onelastai.co/api/auth/verify)
echo "Response: $VERIFY_RESPONSE"

if [[ "$VERIFY_RESPONSE" == *"401" ]]; then
    echo "✅ Verify endpoint is working (properly rejecting invalid token)"
else
    echo "❌ Verify endpoint may still have issues"
fi

echo ""
echo "🎉 Auth Fix Deployment Complete!"
echo "================================="

echo ""
echo "📋 Summary:"
echo "- Fixed auth verify route imports"
echo "- Rebuilt and deployed frontend"
echo "- Restarted services"
echo "- Tested endpoints"
echo ""
echo "🔍 Next steps:"
echo "1. Test login/signup flow"
echo "2. Verify session persistence after hard refresh"
echo "3. Check database connectivity"
echo ""
echo "🌐 Production URL: https://onelastai.co/auth"