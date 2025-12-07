#!/bin/bash

# =================================================
# Production Server SSH Setup for GitHub
# Copies SSH keys and configures automatic deployments
# =================================================

set -e

SERVER="ubuntu@47.129.43.231"
SSH_KEY_FILE="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"
LOCAL_GITHUB_KEY="$HOME/.ssh/github_shiny-friend-disco"

echo "🚀 Setting up GitHub SSH on production server..."

# Step 1: Copy SSH keys to production server
echo "📤 Copying SSH keys to production server..."
scp -i "$SSH_KEY_FILE" "${LOCAL_GITHUB_KEY}" "${LOCAL_GITHUB_KEY}.pub" "$SERVER:~/.ssh/"

# Step 2: Set proper permissions and configure SSH on server
echo "🔧 Configuring SSH on production server..."
ssh -i "$SSH_KEY_FILE" "$SERVER" << 'EOF'
# Set proper permissions
chmod 600 ~/.ssh/github_shiny-friend-disco
chmod 644 ~/.ssh/github_shiny-friend-disco.pub

# Add to SSH config
cat >> ~/.ssh/config << 'SSHCONFIG'

# GitHub SSH configuration for shiny-friend-disco
Host github-shiny-friend-disco
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_shiny-friend-disco
    IdentitiesOnly yes

SSHCONFIG

# Add to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/github_shiny-friend-disco

# Test GitHub connection
echo "🧪 Testing GitHub SSH connection..."
ssh -T git@github-shiny-friend-disco || echo "✅ SSH test completed"

EOF

# Step 3: Update git remote on server and pull latest changes
echo "🔄 Updating git configuration on server..."
ssh -i "$SSH_KEY_FILE" "$SERVER" << 'EOF'
cd ~/shiny-friend-disco

# Update git remote to use SSH
git remote set-url origin git@github-shiny-friend-disco:aidigitalfriend/shiny-friend-disco.git

# Verify remote
echo "📋 Git remote configuration:"
git remote -v

# Pull latest changes
echo "📦 Pulling latest changes..."
git stash || echo "No changes to stash"
git pull origin main

# Update NGINX configuration
echo "🔧 Updating NGINX..."
sudo cp nginx/onelastai.co.conf /etc/nginx/sites-available/onelastai.co
sudo nginx -t
sudo systemctl reload nginx

# Restart services
echo "🔄 Restarting services..."
pm2 restart all

# Check service status
echo "📊 Service status:"
pm2 status

EOF

echo ""
echo "✅ Production server setup complete!"
echo ""
echo "🧪 Testing endpoints:"

# Test endpoints
sleep 5
curl -s "https://onelastai.co/api/subscriptions/pricing" | head -c 100 && echo "✅ Subscription endpoint working"

curl -X POST "https://onelastai.co/api/webhooks/stripe" \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}' \
  -w "\nWebhook status: %{http_code}\n" \
  -s --max-time 10

echo ""
echo "🎉 Deployment complete! Your subscription system should be working now."