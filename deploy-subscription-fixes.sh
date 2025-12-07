#!/bin/bash

# =================================================
# Deploy Subscription System Fixes
# Quick deployment script for subscription fixes
# =================================================

set -e

echo "🚀 Deploying Subscription System Fixes..."

# Pull latest changes
echo "📦 Pulling latest code..."
git pull origin main

# Update NGINX configuration
echo "🔧 Updating NGINX configuration..."
sudo cp nginx/onelastai.co.conf /etc/nginx/sites-available/onelastai.co
sudo nginx -t
sudo systemctl reload nginx

# Restart backend services
echo "🔄 Restarting services..."
pm2 restart all

# Wait for services to start
echo "⏳ Waiting for services to stabilize..."
sleep 5

# Test endpoints
echo "🧪 Testing subscription endpoints..."

# Test pricing endpoint
PRICING_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://onelastai.co/api/subscriptions/pricing)
echo "Pricing endpoint: HTTP $PRICING_TEST"

# Test webhook endpoint (should return 400 due to missing signature)
WEBHOOK_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://onelastai.co/api/webhooks/stripe -H "Content-Type: application/json" -d '{"test":"webhook"}')
echo "Webhook endpoint: HTTP $WEBHOOK_TEST"

# Test Stripe frontend webhook
STRIPE_FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://onelastai.co/api/stripe/webhook -H "Content-Type: application/json" -d '{"test":"webhook"}')
echo "Stripe frontend webhook: HTTP $STRIPE_FRONTEND_TEST"

echo ""
echo "✅ Subscription system deployment complete!"
echo ""
echo "📋 Status Summary:"
echo "- NGINX configuration updated and reloaded"
echo "- Backend services restarted"
echo "- Subscription endpoints tested"
echo ""
echo "🔗 Test URLs:"
echo "- Pricing: https://onelastai.co/api/subscriptions/pricing"
echo "- Webhook: https://onelastai.co/api/webhooks/stripe"
echo "- Stripe Frontend: https://onelastai.co/api/stripe/webhook"