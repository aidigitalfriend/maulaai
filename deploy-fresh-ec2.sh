#!/bin/bash
set -e

echo "======================================"
echo "🚀 ONE LAST AI - FRESH EC2 DEPLOYMENT"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/aidigitalfriend/shiny-friend-disco.git"
APP_DIR="$HOME/shiny-friend-disco"
NODE_VERSION="20"

echo -e "${BLUE}[1/10] Updating system packages...${NC}"
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

echo -e "${BLUE}[2/10] Installing Node.js $NODE_VERSION...${NC}"
curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | sudo -E bash -
sudo apt-get install -y nodejs
echo "✓ Node.js version: $(node -v)"
echo "✓ NPM version: $(npm -v)"

echo -e "${BLUE}[3/10] Installing MongoDB 7.0...${NC}"
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update -qq
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
echo "✓ MongoDB status: $(sudo systemctl is-active mongod)"

echo -e "${BLUE}[4/10] Installing PM2 process manager...${NC}"
sudo npm install -g pm2
pm2 install pm2-logrotate
pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | sudo bash
echo "✓ PM2 installed and configured for auto-start"

echo -e "${BLUE}[5/10] Installing Nginx web server...${NC}"
sudo apt-get install -y nginx
sudo systemctl enable nginx
echo "✓ Nginx installed"

echo -e "${BLUE}[6/10] Cloning repository...${NC}"
if [ -d "$APP_DIR" ]; then
    echo "Repository exists, pulling latest changes..."
    cd "$APP_DIR"
    git pull
else
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi
echo "✓ Repository ready at $APP_DIR"

echo -e "${BLUE}[7/10] Installing backend dependencies...${NC}"
cd "$APP_DIR/backend"
npm install --legacy-peer-deps
echo "✓ Backend dependencies installed"

echo -e "${BLUE}[8/10] Installing frontend dependencies...${NC}"
cd "$APP_DIR/frontend"
npm install --legacy-peer-deps
echo "✓ Frontend dependencies installed"

echo -e "${BLUE}[9/10] Building frontend (this takes 2-3 minutes)...${NC}"
export NODE_OPTIONS="--max-old-space-size=6144"
export NODE_ENV=production
npm run build
echo "✓ Frontend build complete!"

echo -e "${BLUE}[10/10] Starting applications with PM2...${NC}"
cd "$APP_DIR"

# Stop any existing processes
pm2 delete all 2>/dev/null || true

# Start backend (port 3001)
cd "$APP_DIR/backend"
pm2 start npm --name "backend" -- start -- -p 3001

# Start frontend (port 3000)
cd "$APP_DIR/frontend"
pm2 start npm --name "frontend" -- start -- -p 3000

# Save PM2 configuration
pm2 save

echo ""
echo -e "${GREEN}======================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================================${NC}"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://47.129.43.231:3000"
echo "   Backend:  http://47.129.43.231:3001"
echo ""
echo "📝 Useful commands:"
echo "   pm2 status          - Check app status"
echo "   pm2 logs            - View logs"
echo "   pm2 restart all     - Restart all apps"
echo "   pm2 stop all        - Stop all apps"
echo ""
echo -e "${GREEN}🎉 Your application is now live!${NC}"
echo ""
