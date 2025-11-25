#!/bin/bash

# Quick Deploy - Copy files manually to server
# This creates a deployment package you can upload to the server

echo "📦 Creating deployment package..."

DEPLOY_DIR="deploy-package-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copy backend files
mkdir -p "$DEPLOY_DIR/backend/models"
mkdir -p "$DEPLOY_DIR/backend/app/api/webhooks/stripe"
mkdir -p "$DEPLOY_DIR/backend/app/api/subscriptions/check"
mkdir -p "$DEPLOY_DIR/backend/app/api/user/analytics"

cp backend/models/Subscription.ts "$DEPLOY_DIR/backend/models/"
cp backend/app/api/webhooks/stripe/route.ts "$DEPLOY_DIR/backend/app/api/webhooks/stripe/"
cp backend/app/api/subscriptions/route.ts "$DEPLOY_DIR/backend/app/api/subscriptions/"
cp backend/app/api/subscriptions/check/route.ts "$DEPLOY_DIR/backend/app/api/subscriptions/check/"
cp backend/app/api/user/analytics/route.ts "$DEPLOY_DIR/backend/app/api/user/analytics/"

# Copy frontend files
mkdir -p "$DEPLOY_DIR/frontend/app/dashboard"
mkdir -p "$DEPLOY_DIR/frontend/app/agents/random"

cp frontend/app/dashboard/page.tsx "$DEPLOY_DIR/frontend/app/dashboard/"
cp frontend/app/agents/random/page.tsx "$DEPLOY_DIR/frontend/app/agents/random/"

# Create deployment instructions
cat > "$DEPLOY_DIR/DEPLOY_INSTRUCTIONS.md" << 'EOF'
# Deployment Instructions

## Files to Upload

Upload these files to your server at `/home/ubuntu/shiny-friend-disco/`:

### Backend Files:
- `backend/models/Subscription.ts`
- `backend/app/api/webhooks/stripe/route.ts`
- `backend/app/api/subscriptions/route.ts`
- `backend/app/api/subscriptions/check/route.ts`
- `backend/app/api/user/analytics/route.ts`

### Frontend Files:
- `frontend/app/dashboard/page.tsx`
- `frontend/app/agents/random/page.tsx`

## After Uploading

Run these commands on the server:

```bash
cd /home/ubuntu/shiny-friend-disco

# Install dependencies (if needed)
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Build frontend
cd frontend
npm run build
cd ..

# Restart services
pm2 restart all

# Check status
pm2 status
pm2 logs backend --lines 50
```

## Testing

1. Test Stripe payment flow: http://47.129.43.231:3000/subscribe
2. Check webhook receives events and saves to database
3. View dashboard with real data: http://47.129.43.231:3000/dashboard
4. Test random agent subscription check: http://47.129.43.231:3000/agents/random

## Verification Checklist

- [ ] Stripe webhook saves subscriptions to MongoDB
- [ ] Dashboard displays real user subscription data
- [ ] Random agent checks database for subscription
- [ ] Payment success redirects to dashboard with data
- [ ] No console errors in browser or PM2 logs
EOF

echo "✅ Deployment package created: $DEPLOY_DIR"
echo ""
echo "📝 Next steps:"
echo "1. Upload files to server (use FTP, SFTP, or your preferred method)"
echo "2. Follow instructions in $DEPLOY_DIR/DEPLOY_INSTRUCTIONS.md"
echo ""
echo "Alternative: If you have access to the server terminal, run:"
echo "  cd /home/ubuntu/shiny-friend-disco"
echo "  # Then manually copy the files from $DEPLOY_DIR"
