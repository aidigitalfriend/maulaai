#!/bin/bash
KEY="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"
SERVER="ubuntu@47.129.43.231"
REMOTE_DIR="/home/ubuntu/shiny-friend-disco/frontend"

echo "🚀 Deploying Stripe Payment System"
echo "==================================="

# Upload deployment package
echo "📤 Uploading files..."
rsync -avz --no-perms --no-owner --no-group -e "ssh -i $KEY -o LogLevel=QUIET" \
  deploy-package/.next/ \
  ${SERVER}:${REMOTE_DIR}/.next/

rsync -avz --no-perms --no-owner --no-group -e "ssh -i $KEY -o LogLevel=QUIET" \
  deploy-package/api-stripe/ \
  ${SERVER}:${REMOTE_DIR}/app/api/stripe/

rsync -avz --no-perms --no-owner --no-group -e "ssh -i $KEY -o LogLevel=QUIET" \
  deploy-package/api-subscriptions/ \
  ${SERVER}:${REMOTE_DIR}/app/api/subscriptions/

rsync -avz --no-perms --no-owner --no-group -e "ssh -i $KEY -o LogLevel=QUIET" \
  deploy-package/stripe-client.ts \
  deploy-package/mongodb-client.ts \
  ${SERVER}:${REMOTE_DIR}/lib/

rsync -avz --no-perms --no-owner --no-group -e "ssh -i $KEY -o LogLevel=QUIET" \
  deploy-package/Subscription.ts \
  ${SERVER}:${REMOTE_DIR}/models/

rsync -avz --no-perms --no-owner --no-group -e "ssh -i $KEY -o LogLevel=QUIET" \
  deploy-package/.env \
  deploy-package/package.json \
  deploy-package/next.config.js \
  ${SERVER}:${REMOTE_DIR}/

echo ""
echo "📦 Installing dependencies..."
ssh -i $KEY -o LogLevel=QUIET $SERVER "cd $REMOTE_DIR && npm install stripe mongoose --legacy-peer-deps 2>&1 | grep -E '(added|changed)'"

echo ""
echo "🔄 Restarting application..."
ssh -i $KEY -o LogLevel=QUIET $SERVER "pm2 restart all 2>&1 | tail -3"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Testing..."
sleep 3
curl -s -X POST https://onelastai.co/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test","agentName":"Test","plan":"daily","userId":"u1","userEmail":"test@test.com"}' | jq -r '.success,.url' | head -2
