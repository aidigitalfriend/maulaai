#!/bin/bash
# Quick deployment package creator

echo "📦 Creating deployment package..."
cd frontend

# Create deployment directory
rm -rf ../deploy-package
mkdir -p ../deploy-package

# Copy essential files
echo "Copying files..."
cp -r .next ../deploy-package/
cp -r app/api/stripe ../deploy-package/api-stripe
cp -r app/api/subscriptions ../deploy-package/api-subscriptions
cp lib/stripe-client.ts ../deploy-package/
cp lib/mongodb-client.ts ../deploy-package/
cp models/Subscription.ts ../deploy-package/
cp .env ../deploy-package/
cp package.json ../deploy-package/
cp next.config.js ../deploy-package/

cd ../deploy-package

# Create upload instructions
cat > UPLOAD_INSTRUCTIONS.txt << 'INST'
DEPLOYMENT INSTRUCTIONS
=======================

1. Upload .next/ directory to:
   /root/shiny-friend-disco/frontend/.next/
   (Replace entire directory)

2. Upload API files:
   - api-stripe/* to /root/shiny-friend-disco/frontend/app/api/stripe/
   - api-subscriptions/* to /root/shiny-friend-disco/frontend/app/api/subscriptions/

3. Upload library files to /root/shiny-friend-disco/frontend/lib/:
   - stripe-client.ts
   - mongodb-client.ts

4. Upload model to /root/shiny-friend-disco/frontend/models/:
   - Subscription.ts

5. Upload configs to /root/shiny-friend-disco/frontend/:
   - .env
   - package.json
   - next.config.js

6. SSH to server and run:
   cd /root/shiny-friend-disco/frontend
   npm install stripe mongoose --legacy-peer-deps
   pm2 restart all

7. Test:
   curl https://onelastai.co/api/stripe/checkout -X POST -H "Content-Type: application/json" -d '{"agentId":"test","agentName":"Test","plan":"daily","userId":"u1","userEmail":"test@test.com"}'

INST

echo ""
echo "✅ Deployment package created in: $(pwd)"
echo ""
echo "📂 Contents:"
ls -lh
echo ""
echo "📋 Next: Upload these files to your server following UPLOAD_INSTRUCTIONS.txt"
