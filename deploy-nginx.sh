#!/bin/bash

# =================================================
# NGINX Config Deployment Script for One Last AI
# Server: 18.140.156.40 (onelastai.com)
# =================================================

set -e

SERVER="ubuntu@18.140.156.40"
SSH_KEY_FILE="./victorykit.pem"
NGINX_CONFIG="./nginx/onelastai.com.conf"

echo "🚀 Deploying NGINX configuration..."

# Check if NGINX config exists
if [[ ! -f "$NGINX_CONFIG" ]]; then
  echo "❌ NGINX config not found at $NGINX_CONFIG"
  exit 1
fi

# Check if SSH key exists
if [[ ! -f "$SSH_KEY_FILE" ]]; then
  echo "❌ SSH key not found at $SSH_KEY_FILE"
  exit 1
fi

echo "📤 Copying NGINX config to server..."
scp -i "$SSH_KEY_FILE" "$NGINX_CONFIG" "$SERVER:~/onelastai.com.conf"

ssh -i "$SSH_KEY_FILE" "$SERVER" << 'EOF'
echo "🔧 Installing NGINX config..."
sudo cp ~/onelastai.com.conf /etc/nginx/sites-available/onelastai.com

echo "🔗 Ensuring proper symlink (removing any stale copies)..."
# Remove existing file/symlink and create fresh symlink
sudo rm -f /etc/nginx/sites-enabled/onelastai.com
sudo ln -s /etc/nginx/sites-available/onelastai.com /etc/nginx/sites-enabled/

echo "✅ Testing NGINX config..."
sudo nginx -t

echo "🔄 Reloading NGINX..."
sudo systemctl reload nginx

echo "📊 NGINX status:"
sudo systemctl status nginx --no-pager -l

echo "🧹 Cleaning up..."
rm ~/onelastai.com.conf

EOF

echo "✅ NGINX deployment complete!"
echo ""
echo "🧪 Test the API routing:"
echo "   curl https://onelastai.com/api/status"
echo "   curl https://onelastai.com/api/health"
