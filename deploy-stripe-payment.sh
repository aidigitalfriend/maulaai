#!/bin/bash
# Deploy Stripe Payment System
# Run this script to deploy the complete payment integration

set -e  # Exit on any error

echo "================================"
echo "Stripe Payment System Deployment"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running in correct directory
if [ ! -d "frontend" ]; then
    print_error "Must run from project root directory"
    exit 1
fi

cd frontend

# Step 1: Install dependencies
echo "Step 1: Installing dependencies..."
if npm install stripe mongoose; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 2: Check environment variables
echo ""
echo "Step 2: Checking environment variables..."

required_vars=(
    "STRIPE_SECRET_KEY"
    "STRIPE_PUBLISHABLE_KEY"
    "STRIPE_DAILY_PRODUCT_ID"
    "STRIPE_WEEKLY_PRODUCT_ID"
    "STRIPE_MONTHLY_PRODUCT_ID"
    "MONGODB_URI"
)

missing_vars=0
for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" ../.env 2>/dev/null || grep -q "^${var}=" .env 2>/dev/null; then
        print_success "$var is set"
    else
        print_warning "$var is not set in .env"
        missing_vars=$((missing_vars + 1))
    fi
done

if [ $missing_vars -gt 0 ]; then
    print_error "$missing_vars environment variables are missing"
    echo "Please add them to backend/.env or frontend/.env"
    exit 1
fi

# Check for webhook secret
if grep -q "^STRIPE_WEBHOOK_SECRET=" ../.env 2>/dev/null || grep -q "^STRIPE_WEBHOOK_SECRET=" .env 2>/dev/null; then
    print_success "STRIPE_WEBHOOK_SECRET is set"
else
    print_warning "STRIPE_WEBHOOK_SECRET not set - you need to configure this after creating webhook in Stripe dashboard"
fi

# Step 3: Verify files exist
echo ""
echo "Step 3: Verifying new files..."

files=(
    "app/api/stripe/checkout/route.ts"
    "app/api/stripe/webhook/route.ts"
    "app/api/subscriptions/route.ts"
    "lib/stripe-client.ts"
    "lib/mongodb-client.ts"
    "models/Subscription.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file is missing"
        exit 1
    fi
done

# Step 4: Build frontend
echo ""
echo "Step 4: Building frontend..."
if npm run build; then
    print_success "Frontend built successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 5: Summary
echo ""
echo "================================"
echo "Deployment Complete!"
echo "================================"
echo ""
echo "✅ All files created and verified"
echo "✅ Dependencies installed"
echo "✅ Frontend built successfully"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure Stripe Webhook:"
echo "   - Go to: https://dashboard.stripe.com/webhooks"
echo "   - Add endpoint: https://onelastai.com/api/stripe/webhook"
echo "   - Select events: checkout.session.completed, customer.subscription.*, invoice.*"
echo "   - Copy webhook signing secret"
echo "   - Add to .env: STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "2. Deploy to production server:"
echo "   - Upload all files from frontend/.next/standalone to server"
echo "   - Copy environment variables to production"
echo "   - Restart PM2: pm2 restart all"
echo ""
echo "3. Test the payment flow:"
echo "   - Use test card: 4242 4242 4242 4242"
echo "   - Verify webhook received in Stripe dashboard"
echo "   - Check MongoDB for new subscription document"
echo ""
echo "4. Monitor webhook deliveries:"
echo "   - Check: https://dashboard.stripe.com/webhooks"
echo "   - View server logs: pm2 logs"
echo ""
echo "📄 Full documentation: STRIPE_PAYMENT_SYSTEM_COMPLETE.md"
echo ""
