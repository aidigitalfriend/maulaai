#!/bin/bash

# Security Page Implementation Deployment Script
# Deploys the new security endpoints and frontend changes to production

set -e  # Exit on any error

echo "🔒 Security Page Implementation Deployment"
echo "=========================================="
echo ""

# Production server details
SERVER="ubuntu@47.129.43.231"
APP_DIR="/var/www/shiny-friend-disco"

echo "📡 Connecting to production server..."

# Deploy to production
ssh $SERVER << 'ENDSSH'
    set -e
    
    echo "📂 Navigating to application directory..."
    cd /var/www/shiny-friend-disco
    
    echo "📥 Pulling latest changes from Git..."
    git pull origin main
    
    echo "🔄 Restarting backend service..."
    pm2 restart onelastai-backend
    
    echo "🏗️  Rebuilding frontend..."
    cd frontend
    npm run build
    
    echo "🔄 Restarting frontend service..."
    pm2 restart onelastai-frontend
    
    echo "✅ Deployment complete!"
    echo ""
    echo "📊 PM2 Status:"
    pm2 list
    
    echo ""
    echo "📝 Recent Backend Logs:"
    pm2 logs onelastai-backend --lines 20 --nostream
    
ENDSSH

echo ""
echo "✅ Security page implementation deployed successfully!"
echo ""
echo "🧪 Test the following features:"
echo "  1. Change Password: https://onelastai.co/dashboard/security"
echo "  2. Enable 2FA with QR code"
echo "  3. View backup codes"
echo "  4. Check trusted devices"
echo "  5. View login history"
echo ""
echo "🔗 Production URL: https://onelastai.co/dashboard/security"
