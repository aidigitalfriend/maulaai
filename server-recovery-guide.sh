#!/bin/bash

# =================================================
# Server Recovery and SSH Setup Guide
# Run this when your production server is back online
# =================================================

echo "🚀 Production Server Recovery Guide"
echo "=================================="
echo ""

SERVER_IP="47.129.43.231"
SSH_KEY="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"

echo "📋 Step 1: Test server connectivity"
echo "Run: ping -c 3 $SERVER_IP"
echo ""

echo "📋 Step 2: Test SSH connection" 
echo "Run: ssh -i $SSH_KEY ubuntu@$SERVER_IP 'uptime'"
echo ""

echo "📋 Step 3: Copy GitHub SSH keys to server"
echo "Run the following commands:"
echo ""
echo "# Copy SSH keys"
echo "scp -i $SSH_KEY ~/.ssh/github_shiny-friend-disco ubuntu@$SERVER_IP:~/.ssh/"
echo "scp -i $SSH_KEY ~/.ssh/github_shiny-friend-disco.pub ubuntu@$SERVER_IP:~/.ssh/"
echo ""

echo "📋 Step 4: Configure SSH on server"
echo "ssh -i $SSH_KEY ubuntu@$SERVER_IP << 'EOF'"
cat << 'SERVERCONFIG'
# Set permissions
chmod 600 ~/.ssh/github_shiny-friend-disco
chmod 644 ~/.ssh/github_shiny-friend-disco.pub

# Configure SSH
cat >> ~/.ssh/config << 'SSHCONFIG'

Host github-shiny-friend-disco
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_shiny-friend-disco
    IdentitiesOnly yes

SSHCONFIG

# Test GitHub connection
ssh -T git@github-shiny-friend-disco
SERVERCONFIG
echo "EOF"
echo ""

echo "📋 Step 5: Update git and deploy"
echo "ssh -i $SSH_KEY ubuntu@$SERVER_IP << 'EOF'"
cat << 'DEPLOYCONFIG'
cd ~/shiny-friend-disco

# Update git remote to SSH
git remote set-url origin git@github-shiny-friend-disco:aidigitalfriend/shiny-friend-disco.git

# Pull latest changes
git stash
git pull origin main

# Update NGINX
sudo cp nginx/onelastai.co.conf /etc/nginx/sites-available/onelastai.co
sudo nginx -t && sudo systemctl reload nginx

# Restart services
pm2 restart all
pm2 status
DEPLOYCONFIG
echo "EOF"
echo ""

echo "📋 Step 6: Test endpoints"
echo "curl https://onelastai.co/api/subscriptions/pricing"
echo "curl -X POST https://onelastai.co/api/webhooks/stripe"
echo ""

echo "🎉 Your subscription system should be working!"
echo ""
echo "💡 Alternative: Run the automated script when server is online:"
echo "./setup-production-ssh.sh"