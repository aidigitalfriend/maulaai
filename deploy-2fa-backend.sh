#!/bin/bash
set -e

echo "🚀 Deploying complete 2FA system to production..."

# Step 1: Commit frontend if any changes
cd /Users/onelastai/Downloads/shiny-friend-disco
git add -A
if ! git diff-index --quiet HEAD --; then
  git commit -m "🔐 Complete 2FA system - frontend + backend"
  git push origin main
  echo "✅ Changes committed and pushed"
else
  echo "✅ No frontend changes to commit"
fi

# Step 2: Deploy backend to EC2
echo "📦 Deploying backend to EC2..."
ssh -i one-last-ai.pem ubuntu@47.129.43.231 << 'EC2_EOF'
  cd ~/shiny-friend-disco
  echo "📥 Pulling latest code..."
  git pull origin main
  
  cd backend
  echo "📦 Installing dependencies..."
  npm install
  
  echo "🔄 Restarting backend..."
  pm2 restart shiny-backend
  pm2 list
  
  echo "✅ Backend deployed!"
EC2_EOF

# Step 3: Deploy frontend to EC2
echo "🎨 Deploying frontend to EC2..."
ssh -i one-last-ai.pem ubuntu@47.129.43.231 << 'EC2_EOF2'
  cd ~/shiny-friend-disco/frontend
  echo "🏗️  Building frontend..."
  npm run build
  
  echo "🔄 Restarting frontend..."
  pm2 restart shiny-frontend
  pm2 list
  
  echo "✅ Frontend deployed!"
EC2_EOF2

echo ""
echo "🎉 Complete 2FA system deployed successfully!"
echo ""
echo "Test URLs:"
echo "  - Frontend: https://onelastai.co"
echo "  - Backend: http://47.129.43.231:3005"
echo ""
echo "Test the flow:"
echo "  1. Go to /dashboard/security"
echo "  2. Enable 2FA (scan QR, enter code)"
echo "  3. Logout and login again"
echo "  4. Enter 6-digit code from authenticator"
echo "  5. Try backup code"
echo ""
