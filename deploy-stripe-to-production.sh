#!/bin/bash
# Deploy Stripe Payment System to Production

SERVER="root@47.129.43.231"
REMOTE_DIR="/root/shiny-friend-disco/frontend"

echo "🚀 Deploying Stripe Payment System to Production"
echo "=================================================="
echo ""

# Check if build exists
if [ ! -d "frontend/.next" ]; then
  echo "❌ Build not found. Run 'npm run build' first"
  exit 1
fi

echo "📦 Uploading new files to production server..."
echo ""

# Upload API routes
echo "1. Uploading Stripe API routes..."
rsync -avz --progress \
  frontend/app/api/stripe/ \
  ${SERVER}:${REMOTE_DIR}/app/api/stripe/

rsync -avz --progress \
  frontend/app/api/subscriptions/ \
  ${SERVER}:${REMOTE_DIR}/app/api/subscriptions/

# Upload libraries
echo ""
echo "2. Uploading library files..."
rsync -avz --progress \
  frontend/lib/stripe-client.ts \
  frontend/lib/mongodb-client.ts \
  ${SERVER}:${REMOTE_DIR}/lib/

# Upload models
echo ""
echo "3. Uploading models..."
rsync -avz --progress \
  frontend/models/Subscription.ts \
  ${SERVER}:${REMOTE_DIR}/models/

# Upload .next build
echo ""
echo "4. Uploading .next build directory..."
rsync -avz --progress --delete \
  frontend/.next/ \
  ${SERVER}:${REMOTE_DIR}/.next/

# Upload package.json (for dependencies)
echo ""
echo "5. Uploading package.json..."
rsync -avz --progress \
  frontend/package.json \
  ${SERVER}:${REMOTE_DIR}/

# Upload .env
echo ""
echo "6. Uploading environment variables..."
rsync -avz --progress \
  frontend/.env \
  ${SERVER}:${REMOTE_DIR}/

echo ""
echo "7. Installing dependencies on server..."
ssh ${SERVER} "cd ${REMOTE_DIR} && npm install stripe mongoose --legacy-peer-deps"

echo ""
echo "8. Restarting PM2..."
ssh ${SERVER} "pm2 restart all"

echo ""
echo "=================================================="
echo "✅ Deployment Complete!"
echo "=================================================="
echo ""
echo "🔍 Next Steps:"
echo "  1. Test checkout: https://onelastai.co/payment"
echo "  2. Configure Stripe webhook:"
echo "     URL: https://onelastai.co/api/stripe/webhook"
echo "  3. Monitor logs: ssh ${SERVER} 'pm2 logs'"
echo ""
