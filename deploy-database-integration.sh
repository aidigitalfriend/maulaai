#!/bin/bash

# Deploy Real-Time Database Integration
# This script deploys the subscription database integration to production

set -e

echo "🚀 Starting deployment of database integration..."

# Server details
SERVER="ubuntu@47.129.43.231"
APP_DIR="/home/ubuntu/shiny-friend-disco"

echo "📦 Building frontend locally..."
cd "$(dirname "$0")"

# Install dependencies if needed
echo "📦 Installing dependencies..."
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

echo "📤 Uploading files to server..."

# Upload new backend files
scp -r backend/models/Subscription.ts "$SERVER:$APP_DIR/backend/models/"
scp -r backend/app/api/webhooks/stripe/route.ts "$SERVER:$APP_DIR/backend/app/api/webhooks/stripe/"
scp -r backend/app/api/subscriptions/ "$SERVER:$APP_DIR/backend/app/api/"
scp -r backend/app/api/user/analytics/ "$SERVER:$APP_DIR/backend/app/api/user/"

# Upload updated frontend files
scp frontend/app/dashboard/page.tsx "$SERVER:$APP_DIR/frontend/app/dashboard/"
scp frontend/app/agents/random/page.tsx "$SERVER:$APP_DIR/frontend/app/agents/random/"

echo "🔧 Restarting services on server..."

ssh "$SERVER" << 'ENDSSH'
cd /home/ubuntu/shiny-friend-disco

echo "📦 Installing dependencies on server..."
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

echo "🏗️ Building frontend..."
cd frontend
npm run build
cd ..

echo "♻️ Restarting PM2 services..."
pm2 restart all

echo "✅ Services restarted"

# Check status
pm2 status
pm2 logs --lines 20

ENDSSH

echo "✅ Deployment complete!"
echo ""
echo "🔍 Testing endpoints:"
echo "- Frontend: http://47.129.43.231:3000"
echo "- Backend: http://47.129.43.231:3005"
echo "- Dashboard: http://47.129.43.231:3000/dashboard"
echo ""
echo "📝 Next steps:"
echo "1. Test Stripe payment flow"
echo "2. Check webhook logs: pm2 logs backend"
echo "3. Verify database saves in MongoDB"
echo "4. Test dashboard displays real data"
echo "5. Test random agent subscription check"
