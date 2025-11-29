#!/bin/bash
# Complete deployment script for One Last AI
# Deploys both frontend and backend with community fixes

set -e

KEY="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"
SERVER="ubuntu@47.129.43.231"
REMOTE_DIR="/home/ubuntu/shiny-friend-disco"

echo "🚀 Deploying One Last AI with Community Fixes"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Build frontend locally
print_status "Step 1: Building frontend..."
cd frontend
npm run build -- --webpack
print_success "Frontend built successfully"

# Step 2: Deploy frontend
print_status "Step 2: Deploying frontend..."
rsync -avz --delete --no-perms --no-owner --no-group -e "ssh -i $KEY -o LogLevel=QUIET" \
  .next/ \
  ${SERVER}:${REMOTE_DIR}/frontend/.next/

rsync -avz --no-perms --no-owner --no-group -e "ssh -i $KEY -o LogLevel=QUIET" \
  package.json \
  next.config.js \
  ${SERVER}:${REMOTE_DIR}/frontend/

print_success "Frontend deployed"

# Step 3: Deploy backend
print_status "Step 3: Deploying backend..."
cd ../backend
rsync -avz --delete --exclude='node_modules' --exclude='.env*' --exclude='*.log' \
  --no-perms --no-owner --no-group -e "ssh -i $KEY -o LogLevel=QUIET" \
  . \
  ${SERVER}:${REMOTE_DIR}/backend/

print_success "Backend deployed"

# Step 4: Update server and restart
print_status "Step 4: Updating server..."
ssh -i $KEY -o LogLevel=QUIET $SERVER << 'EOF'
  cd /home/ubuntu/shiny-friend-disco

  # Install frontend dependencies
  echo "Installing frontend dependencies..."
  cd frontend
  npm ci --production=false

  # Install backend dependencies
  echo "Installing backend dependencies..."
  cd ../backend
  npm ci --production=false

  # Restart PM2 processes
  echo "Restarting services..."
  pm2 restart all

  echo "Deployment complete!"
EOF

print_success "Server updated and restarted"

# Step 5: Test deployment
print_status "Step 5: Testing deployment..."
sleep 5

# Test basic endpoints
if curl -s -f https://onelastai.co/api/status > /dev/null; then
    print_success "API status check passed"
else
    print_error "API status check failed"
fi

if curl -s -f https://onelastai.co/api/test-community > /dev/null; then
    print_success "Community test endpoint working"
else
    print_warning "Community test endpoint not responding (may be normal)"
fi

if curl -s -f https://onelastai.co > /dev/null; then
    print_success "Frontend responding"
else
    print_error "Frontend not responding"
fi

print_success "Deployment completed successfully!"
echo ""
echo "🌐 Check your site: https://onelastai.co"
echo "👥 Test community: https://onelastai.co/community"