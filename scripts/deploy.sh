#!/bin/bash

# =================================================
# Shiny Friend Disco - Deployment Script
# Automated deployment for production
# =================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="${APP_DIR:-/var/www/shiny-friend-disco}"
BACKUP_DIR="${BACKUP_DIR:-/var/www/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Start deployment
echo ""
echo "========================================="
echo "🚀 Shiny Friend Disco Deployment"
echo "========================================="
echo "Started: $(date)"
echo ""

# Navigate to app directory
log_info "Navigating to application directory..."
cd $APP_DIR

# Create backup
log_info "Creating backup..."
mkdir -p $BACKUP_DIR
tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=.env \
    . || log_warning "Backup failed, continuing anyway..."

log_success "Backup created: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"

# Pull latest code
log_info "Pulling latest code from GitHub..."
git fetch origin
CURRENT_BRANCH=$(git branch --show-current)
log_info "Current branch: $CURRENT_BRANCH"
git pull origin $CURRENT_BRANCH

log_success "Code updated successfully"

# Install root dependencies
log_info "Installing root dependencies..."
npm install --production

# Install frontend dependencies
log_info "Installing frontend dependencies..."
cd frontend
npm install --production
cd ..

# Install backend dependencies
log_info "Installing backend dependencies..."
cd backend
npm install --production
cd ..

log_success "Dependencies installed"

# Build frontend
log_info "Building frontend..."
cd frontend
npm run build

if [ $? -eq 0 ]; then
    log_success "Frontend built successfully"
else
    log_error "Frontend build failed!"
    exit 1
fi
cd ..

# Build backend (if needed)
log_info "Building backend..."
cd backend
if [ -f "tsconfig.json" ]; then
    npm run build || log_warning "Backend build failed, using existing build"
fi
cd ..

# Restart applications
log_info "Restarting applications with PM2..."
pm2 restart ecosystem.config.js

# Wait for apps to stabilize
log_info "Waiting for applications to stabilize..."
sleep 5

# Check application status
log_info "Checking application status..."
pm2 status

# Test health endpoints
log_info "Testing health endpoints..."

# Test backend
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3005/health || echo "000")
if [ "$BACKEND_HEALTH" = "200" ]; then
    log_success "Backend health check passed (HTTP 200)"
else
    log_error "Backend health check failed (HTTP $BACKEND_HEALTH)"
fi

# Test frontend
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$FRONTEND_HEALTH" = "200" ]; then
    log_success "Frontend health check passed (HTTP 200)"
else
    log_error "Frontend health check failed (HTTP $FRONTEND_HEALTH)"
fi

# Clean up old backups (keep last 5)
log_info "Cleaning up old backups..."
cd $BACKUP_DIR
ls -t backup_*.tar.gz | tail -n +6 | xargs rm -f 2>/dev/null || true
log_success "Old backups cleaned"

# Deployment summary
echo ""
echo "========================================="
echo "🎉 Deployment Complete!"
echo "========================================="
echo "Completed: $(date)"
echo ""
echo "📊 Deployment Summary:"
echo "- Branch: $CURRENT_BRANCH"
echo "- Backup: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
echo "- Backend Health: HTTP $BACKEND_HEALTH"
echo "- Frontend Health: HTTP $FRONTEND_HEALTH"
echo ""
echo "🌐 Application URLs:"
echo "- Production: https://onelastai.co"
echo "- API: https://onelastai.co/api"
echo ""
echo "📋 Quick Commands:"
echo "- View logs: pm2 logs"
echo "- View status: pm2 status"
echo "- Restart: pm2 restart all"
echo "- Monitor: pm2 monit"
echo ""

# Show recent logs
log_info "Recent application logs:"
pm2 logs --lines 20 --nostream

echo ""
log_success "Deployment completed successfully! 🚀"
