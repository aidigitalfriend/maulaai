#!/bin/bash
KEY="/Users/onelastai/Downloads/shiny-friend-disco/one-last-ai.pem"
SERVER="ubuntu@47.129.43.231"
REMOTE_DIR="/home/ubuntu/shiny-friend-disco/frontend"

echo "🎯 Deploying Dashboard System to Production"
echo "=========================================="

# Build the latest frontend
echo "🔨 Building frontend..."
cd /Users/onelastai/Downloads/shiny-friend-disco/frontend
npm run build

# Upload the complete built application
echo "📤 Uploading complete build..."
rsync -avz --no-perms --no-owner --no-group -e "ssh -i $KEY -o LogLevel=QUIET" \
  .next/ \
  ${SERVER}:${REMOTE_DIR}/.next/

# Upload dashboard pages specifically
echo "📤 Uploading dashboard pages..."
rsync -avz --no-perms --no-owner --no-group -e "ssh -i $KEY -o LogLevel=QUIET" \
  app/dashboard/ \
  ${SERVER}:${REMOTE_DIR}/app/dashboard/

# Upload components (including Navigation)
echo "📤 Uploading components..."
rsync -avz --no-perms --no-owner --no-group -e "ssh -i $KEY -o LogLevel=QUIET" \
  ../frontend/components/ \
  ${SERVER}:${REMOTE_DIR}/components/

echo ""
echo "🔄 Restarting frontend application..."
ssh -i $KEY -o LogLevel=QUIET $SERVER "cd $REMOTE_DIR && pm2 restart shiny-frontend"

echo ""
echo "✅ Dashboard deployment complete!"
echo ""
echo "🧪 Testing dashboard pages..."
sleep 5

echo "Testing Dashboard URLs:"
curl -s -o /dev/null -w "Overview: %{http_code}\n" https://onelastai.co/dashboard/overview
curl -s -o /dev/null -w "Profile: %{http_code}\n" https://onelastai.co/dashboard/profile  
curl -s -o /dev/null -w "Security: %{http_code}\n" https://onelastai.co/dashboard/security
curl -s -o /dev/null -w "Preferences: %{http_code}\n" https://onelastai.co/dashboard/preferences
curl -s -o /dev/null -w "Rewards: %{http_code}\n" https://onelastai.co/dashboard/rewards

echo ""
echo "🎉 Dashboard system deployed successfully!"
echo "🌐 Access your dashboard at: https://onelastai.co/dashboard/overview"