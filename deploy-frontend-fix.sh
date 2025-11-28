#!/bin/bash
KEY="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"
SERVER="ubuntu@47.129.43.231"
REMOTE_DIR="/home/ubuntu/shiny-friend-disco/frontend"

echo "🔧 Deploying Frontend Next.js 16.0.5 Fix"
echo "========================================="

# Build the frontend with Next.js 16.0.5
echo "🔨 Building frontend with Next.js 16.0.5..."
cd /Users/onelastai/Downloads/shiny-friend-disco/frontend
npm run build

# Upload the complete built application
echo "📤 Uploading complete build..."
rsync -avz --no-perms --no-owner --no-group -e "ssh -i $KEY -o LogLevel=QUIET" \
  .next/ \
  ${SERVER}:${REMOTE_DIR}/.next/

rsync -avz --no-perms --no-owner --no-group -e "ssh -i $KEY -o LogLevel=QUIET" \
  package.json \
  ${SERVER}:${REMOTE_DIR}/

echo ""
echo "🔄 Restarting frontend application..."
ssh -i $KEY -o LogLevel=QUIET $SERVER "cd $REMOTE_DIR && pm2 restart shiny-frontend"

echo ""
echo "✅ Frontend deployment complete!"
echo ""
echo "🧪 Testing production site..."
sleep 3

# Test the main site
echo "Testing main site:"
curl -s -w "Main Site: %{http_code}\n" https://onelastai.co/ | tail -1

echo ""
echo "🎉 Frontend fix deployed successfully!"
