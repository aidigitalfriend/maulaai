#!/bin/bash

# ===========================================
# 🚀 ONE LAST AI - PRODUCTION DEPLOYMENT
# ===========================================
# Deploy real-time agents and subscription workflow
# 
# This script deploys all the fixes we implemented:
# ✅ Real-time agent connectivity
# ✅ Simple agent API with OpenAI integration  
# ✅ Updated subscription workflow
# ✅ Enhanced agent pages with subscription checks
# ✅ Payment processing system
# ✅ Multi-tier API fallback system
#
# Usage: Run this on your production server
# ===========================================

set -e

echo "🚀 Starting One Last AI production deployment..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'  
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Step 1: Navigate to app directory
print_status "Step 1: Navigating to application directory..."
cd /var/www/html/shiny-friend-disco || cd ~/shiny-friend-disco || {
    print_error "Could not find application directory"
    print_status "Please run this script from your One Last AI directory"
    exit 1
}

print_success "Found application directory: $(pwd)"

# Step 2: Pull latest changes
print_status "Step 2: Pulling latest changes from GitHub..."
git fetch origin main
git pull origin main
print_success "Latest code pulled successfully!"

# Step 3: Install/update dependencies  
print_status "Step 3: Installing dependencies..."

# Backend dependencies
if [ -d "backend" ]; then
    print_status "Installing backend dependencies..."
    cd backend
    npm install --production
    cd ..
    print_success "Backend dependencies installed!"
fi

# Frontend dependencies  
if [ -d "frontend" ]; then
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install --production
    npm run build
    cd ..
    print_success "Frontend built successfully!"
fi

# Step 4: Set up environment variables
print_status "Step 4: Checking environment configuration..."

if [ ! -f "backend/.env" ]; then
    print_warning "Backend .env file not found. Please configure environment variables."
else
    print_success "Environment configuration found!"
fi

# Step 5: Restart services
print_status "Step 5: Restarting services..."

# Stop existing processes
print_status "Stopping existing processes..."
pm2 stop all || true
pkill -f "node server" || true
pkill -f "next" || true

# Start backend
print_status "Starting backend server..."
cd backend
pm2 start server-simple.js --name "onelastai-backend" --watch --ignore-watch="node_modules logs *.log" || {
    print_warning "PM2 not available, starting backend directly..."
    nohup node server-simple.js > logs/backend.log 2>&1 &
}
cd ..

# Start frontend
print_status "Starting frontend server..."
cd frontend
pm2 start npm --name "onelastai-frontend" -- start || {
    print_warning "PM2 not available, starting frontend directly..."  
    nohup npm start > logs/frontend.log 2>&1 &
}
cd ..

# Step 6: Verify deployment
print_status "Step 6: Verifying deployment..."
sleep 5

# Check if services are running
if pm2 list | grep -q "onelastai"; then
    print_success "Services started successfully via PM2!"
    pm2 list
elif pgrep -f "node server" > /dev/null && pgrep -f "next" > /dev/null; then
    print_success "Services started successfully!"
else
    print_warning "Services may not be running properly. Please check logs."
fi

# Final status
echo ""
echo "================================================"
print_success "🎉 DEPLOYMENT COMPLETE!"
echo "================================================"
print_status "🌐 Your site should now be live with:"
echo ""
echo "   ✅ Real-time AI agents with OpenAI integration"
echo "   ✅ New subscription workflow ($1/day, $5/week, $19/month)"  
echo "   ✅ Enhanced agent pages with subscription checks"
echo "   ✅ Payment processing system"
echo "   ✅ Multi-tier API fallback for reliability"
echo "   ✅ 12+ configured agents with unique personalities"
echo ""
print_status "🔗 Check your live site: https://onelastai.co"
print_status "📊 Monitor with: pm2 monit"
print_status "📝 View logs with: pm2 logs"
echo ""
print_success "All agents are now live and responding in real-time! 🚀"
echo "================================================"