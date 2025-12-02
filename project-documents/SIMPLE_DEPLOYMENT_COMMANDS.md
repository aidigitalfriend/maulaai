# 🚀 SIMPLIFIED DEPLOYMENT - Copy & Paste Commands

## Phase 1: Local Machine (Your Computer)

Copy and paste these commands one by one:

```bash
# 1. Navigate to project
cd /Users/onelastai/Downloads/shiny-friend-disco

# 2. Add all changes to git
git add -A

# 3. Commit changes
git commit -m "🔧 Fix: Auth Signup 404 - NGINX routing + bcryptjs + dev scripts

- Fixed NGINX /api/auth/ routing to frontend:3000
- Added bcryptjs dependency to frontend
- Updated signup endpoint imports 
- Added dev scripts with hot reload
- Fixed image config in Next.js

Fixes signup 404 errors and improves development workflow."

# 4. Push to GitHub
git push origin main

# 5. Install frontend dependencies
cd frontend
npm install

# 6. Build frontend
npm run build

# 7. Go back to root
cd ..

echo "✅ LOCAL DEPLOYMENT COMPLETE!"
```

## Phase 2: Production Server (EC2)

SSH to server and run:

```bash
# 1. SSH to server
ssh -i one-last-ai.pem ubuntu@47.129.43.231

# 2. Navigate to project
cd ~/shiny-friend-disco

# 3. Pull latest changes
git pull origin main

# 4. Install frontend dependencies
cd frontend
npm install

# 5. Build frontend
npm run build

# 6. Go back to root
cd ..

# 7. Update NGINX configs
sudo cp nginx-onelastai-https.conf /etc/nginx/sites-available/onelastai-https
sudo cp nginx-onelastai.conf /etc/nginx/sites-available/onelastai

# 8. Test NGINX config
sudo nginx -t

# 9. Reload NGINX (only if test passes)
sudo systemctl reload nginx

# 10. Restart PM2 services
pm2 restart all

# 11. Save PM2 state
pm2 save

# 12. Check status
pm2 status

echo "✅ PRODUCTION DEPLOYMENT COMPLETE!"
```

## Phase 3: Test Signup

```bash
# Test the signup endpoint
curl -X POST https://onelastai.co/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "name": "Test User", 
    "password": "Test12345"
  }'
```

Expected: 201 response with user data (NOT 404!)

---

## Common Errors & Fixes

### Error: "npm: command not found"
```bash
# Install Node.js if missing
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Error: "Permission denied" for NGINX
```bash
# Fix permissions
sudo chown root:root nginx-onelastai-https.conf
sudo chmod 644 nginx-onelastai-https.conf
```

### Error: "Port 3000 in use"
```bash
# Check what's using port 3000
sudo lsof -i :3000
# Kill if needed
sudo kill -9 [PID]
```

### Error: "Module not found: bcryptjs"
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error: NGINX test fails
```bash
# Check syntax
sudo nginx -t
# Check specific config
sudo nano /etc/nginx/sites-available/onelastai-https
```

---

Copy these commands to your terminal now!