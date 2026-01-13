#!/bin/bash

# =================================================
# NGINX Config Deployment Script
# =================================================

set -e

SERVER="ubuntu@47.130.228.100"
SSH_KEY_FILE="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"
NGINX_CONFIG="/Users/onelastai/Downloads/shiny-friend-disco/nginx/onelastai.co.conf"

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
scp -i "$SSH_KEY_FILE" "$NGINX_CONFIG" "$SERVER:~/onelastai.co.conf"

ssh -i "$SSH_KEY_FILE" "$SERVER" << 'EOF'
echo "🔧 Installing NGINX config..."
sudo cp ~/onelastai.co.conf /etc/nginx/sites-available/onelastai.co

echo "🔗 Ensuring proper symlink (removing any stale copies)..."
# Remove existing file/symlink and create fresh symlink
sudo rm -f /etc/nginx/sites-enabled/onelastai.co
sudo ln -s /etc/nginx/sites-available/onelastai.co /etc/nginx/sites-enabled/

echo "✅ Testing NGINX config..."
sudo nginx -t

echo "🔄 Reloading NGINX..."
sudo systemctl reload nginx

echo "📊 NGINX status:"
sudo systemctl status nginx --no-pager -l

echo "🧹 Cleaning up..."
rm ~/onelastai.co.conf

EOF

echo "✅ NGINX deployment complete!"
echo ""
echo "🧪 Test the API routing:"
echo "   curl https://onelastai.co/api/agent/subscriptions/user/test-user"
echo "   curl https://onelastai.co/api/subscriptions/user/test-user"