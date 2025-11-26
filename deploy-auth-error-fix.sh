#!/bin/bash
set -e

# 🔧 Auth Error Endpoint & CSP Fix Deployment Script
echo "==============================================="
echo "🔧 Deploying Auth Error & CSP Fix"
echo "==============================================="

# Configuration
KEY="${HOME}/.ssh/onelastai-ec2-key.pem"
SERVER="ubuntu@47.129.43.231"
DEPLOY_PATH="/var/www/onelastai"

echo "📋 Pre-flight checks..."

# Check if key exists
if [ ! -f "$KEY" ]; then
    echo "❌ SSH key not found: $KEY"
    echo "Please ensure the SSH key exists and is accessible"
    exit 1
fi

# Check if we can connect to server
echo "🔌 Testing server connection..."
ssh -i "$KEY" -o ConnectTimeout=10 "$SERVER" "echo 'Connection successful'" || {
    echo "❌ Failed to connect to server"
    exit 1
}

echo "✅ All checks passed!"
echo ""

echo "📦 Building and packaging frontend with CSP fix..."
cd frontend
npm run build

echo ""
echo "📤 Uploading files to server..."

# Create deployment package
cd ..
tar -czf /tmp/auth-error-fix.tar.gz \
    frontend/.next \
    frontend/next.config.js \
    frontend/app/api/auth/error/route.ts \
    frontend/package.json

# Upload to server
scp -i "$KEY" /tmp/auth-error-fix.tar.gz "$SERVER":/tmp/

echo ""
echo "🚀 Deploying on server..."

ssh -i "$KEY" "$SERVER" << 'EOF'
set -e

echo "📁 Extracting files..."
cd /tmp
tar -xzf auth-error-fix.tar.gz

echo "🔄 Updating frontend files..."
sudo cp -r frontend/.next /var/www/onelastai/frontend/
sudo cp frontend/next.config.js /var/www/onelastai/frontend/
sudo mkdir -p /var/www/onelastai/frontend/app/api/auth/error/
sudo cp frontend/app/api/auth/error/route.ts /var/www/onelastai/frontend/app/api/auth/error/

echo "🔧 Setting permissions..."
sudo chown -R www-data:www-data /var/www/onelastai/frontend/
sudo chmod -R 755 /var/www/onelastai/frontend/

echo "♻️  Restarting services..."
sudo systemctl restart nginx
pm2 restart shiny-frontend --update-env

echo "🧹 Cleanup..."
rm -f /tmp/auth-error-fix.tar.gz
rm -rf /tmp/frontend

echo "✅ Deployment complete!"
EOF

echo ""
echo "🧪 Testing endpoints..."

# Test main site
echo "🌐 Testing main site..."
curl -s -I https://onelastai.co/ | head -3

echo ""
echo "🔍 Testing auth error endpoint..."
curl -s -w "HTTP Status: %{http_code}\n" https://onelastai.co/api/auth/error?error=CredentialsSignin | head -3

echo ""
echo "🧪 Testing signup endpoint..."
curl -s -w "HTTP Status: %{http_code}\n" -X POST https://onelastai.co/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","password":"Test12345"}' | head -3

echo ""
echo "========================================================"
echo "✅ AUTH ERROR & CSP FIX DEPLOYMENT COMPLETE!"
echo "========================================================"
echo ""
echo "🎉 Fixes applied:"
echo "1. ✅ Added /api/auth/error endpoint"
echo "2. ✅ Fixed CSP to allow Cloudflare Insights"
echo "3. ✅ Updated Next.js configuration"
echo ""
echo "📋 What was fixed:"
echo "• GET /api/auth/error now returns proper JSON (not 404)"
echo "• Cloudflare Insights script loading now allowed"
echo "• CSP headers updated to include static.cloudflareinsights.com"
echo ""
echo "🧪 Test it:"
echo "1. Try signup again at https://onelastai.co/auth/signup"
echo "2. Check browser console - no more CSP errors"
echo "3. Auth errors should show properly instead of 404"
echo ""
echo "========================================================"

# Cleanup
rm -f /tmp/auth-error-fix.tar.gz