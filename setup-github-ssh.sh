#!/bin/bash

# =================================================
# GitHub SSH Setup for Private Repository
# Configures SSH keys for automatic deployments
# =================================================

set -e

echo "🔑 Setting up GitHub SSH for private repository..."

# GitHub and user information
GITHUB_USER="aidigitalfriend"
GITHUB_EMAIL="aidigitalfriend@outlook.com"
REPO_NAME="shiny-friend-disco"

echo ""
echo "📋 Configuration:"
echo "- GitHub User: $GITHUB_USER"
echo "- Email: $GITHUB_EMAIL"
echo "- Repository: $REPO_NAME"
echo ""

# Step 1: Generate SSH key if it doesn't exist
SSH_KEY_PATH="$HOME/.ssh/github_${REPO_NAME}"

if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "🔐 Generating new SSH key for GitHub..."
    ssh-keygen -t ed25519 -C "$GITHUB_EMAIL" -f "$SSH_KEY_PATH" -N ""
    echo "✅ SSH key generated: $SSH_KEY_PATH"
else
    echo "✅ SSH key already exists: $SSH_KEY_PATH"
fi

# Step 2: Add SSH key to ssh-agent
echo "🔧 Adding SSH key to ssh-agent..."
eval "$(ssh-agent -s)"
ssh-add "$SSH_KEY_PATH"

# Step 3: Configure SSH for GitHub
SSH_CONFIG="$HOME/.ssh/config"
echo "📝 Configuring SSH config..."

# Create SSH config entry
cat >> "$SSH_CONFIG" << EOF

# GitHub SSH configuration for $REPO_NAME
Host github-$REPO_NAME
    HostName github.com
    User git
    IdentityFile $SSH_KEY_PATH
    IdentitiesOnly yes

EOF

echo "✅ SSH config updated"

# Step 4: Display public key for GitHub
echo ""
echo "📋 Public SSH key (add this to GitHub):"
echo "----------------------------------------"
cat "${SSH_KEY_PATH}.pub"
echo "----------------------------------------"
echo ""

# Step 5: Test SSH connection
echo "🧪 Testing SSH connection to GitHub..."
ssh -T git@github-$REPO_NAME || echo "⚠️  SSH test completed (expected: Permission denied message is normal)"

# Step 6: Update git remote to use SSH
echo "🔄 Updating git remote to use SSH..."
git remote set-url origin git@github-$REPO_NAME:$GITHUB_USER/$REPO_NAME.git
echo "✅ Git remote updated"

# Step 7: Verify git remote
echo "🔍 Current git remote:"
git remote -v

echo ""
echo "🎉 SSH setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the public key above"
echo "2. Go to: https://github.com/$GITHUB_USER/$REPO_NAME/settings/keys"
echo "3. Click 'Add deploy key'"
echo "4. Paste the public key"
echo "5. Check 'Allow write access' (for automatic deployments)"
echo "6. Save the key"
echo ""
echo "🚀 Then test with: git push origin main"