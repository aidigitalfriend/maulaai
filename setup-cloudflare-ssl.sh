#!/bin/bash
# Cloudflare SSL Setup Script for onelastai.co
# Run this on your EC2 instance

set -e

echo "========================================"
echo "🔒 Cloudflare SSL Certificate Setup"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}This script should NOT be run as root${NC}"
   echo "Run it as ubuntu user, it will use sudo when needed"
   exit 1
fi

echo -e "${BLUE}Step 1: Creating SSL directory...${NC}"
sudo mkdir -p /etc/nginx/ssl
sudo chmod 700 /etc/nginx/ssl
echo -e "${GREEN}✓ SSL directory created${NC}"
echo ""

echo -e "${YELLOW}===========================================  =${NC}"
echo -e "${YELLOW}IMPORTANT: You need your Cloudflare Origin Certificate${NC}"
echo -e "${YELLOW}=============================================${NC}"
echo ""
echo "1. Go to: https://dash.cloudflare.com/"
echo "2. Select your domain: onelastai.co"
echo "3. Navigate to: SSL/TLS → Origin Server"
echo "4. Click: Create Certificate"
echo "5. Use default settings (15 years validity)"
echo "6. Copy the certificate and private key"
echo ""
echo -e "${BLUE}Press Enter when you have the certificate and key ready...${NC}"
read

echo -e "${BLUE}Step 2: Installing Origin Certificate...${NC}"
echo "Paste your Cloudflare Origin Certificate below."
echo "Press Ctrl+D when done:"
echo ""
sudo tee /etc/nginx/ssl/onelastai.co.crt > /dev/null
sudo chmod 644 /etc/nginx/ssl/onelastai.co.crt
echo -e "${GREEN}✓ Certificate saved${NC}"
echo ""

echo -e "${BLUE}Step 3: Installing Private Key...${NC}"
echo "Paste your Private Key below."
echo "Press Ctrl+D when done:"
echo ""
sudo tee /etc/nginx/ssl/onelastai.co.key > /dev/null
sudo chmod 600 /etc/nginx/ssl/onelastai.co.key
sudo chown root:root /etc/nginx/ssl/*
echo -e "${GREEN}✓ Private key saved${NC}"
echo ""

echo -e "${BLUE}Step 4: Verifying certificate files...${NC}"
if [ -f /etc/nginx/ssl/onelastai.co.crt ] && [ -f /etc/nginx/ssl/onelastai.co.key ]; then
    echo -e "${GREEN}✓ Certificate files exist${NC}"
    ls -lh /etc/nginx/ssl/
else
    echo -e "${RED}✗ Certificate files missing!${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}Step 5: Testing certificate validity...${NC}"
if sudo openssl x509 -in /etc/nginx/ssl/onelastai.co.crt -text -noout > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Certificate is valid${NC}"
    echo "Certificate details:"
    sudo openssl x509 -in /etc/nginx/ssl/onelastai.co.crt -subject -issuer -dates -noout
else
    echo -e "${RED}✗ Certificate is invalid!${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}Step 6: Checking if Cloudflare Nginx config exists...${NC}"
if [ -f ~/shiny-friend-disco/nginx/onelastai.co.cloudflare.conf ]; then
    echo -e "${GREEN}✓ Configuration file found${NC}"
else
    echo -e "${RED}✗ Configuration file not found!${NC}"
    echo "Expected: ~/shiny-friend-disco/nginx/onelastai.co.cloudflare.conf"
    exit 1
fi
echo ""

echo -e "${BLUE}Step 7: Updating backend port in config...${NC}"
# Copy config and update port from 3005 to 3001
cp ~/shiny-friend-disco/nginx/onelastai.co.cloudflare.conf /tmp/onelastai-https.conf
sed -i 's/127.0.0.1:3005/127.0.0.1:3001/g' /tmp/onelastai-https.conf
echo -e "${GREEN}✓ Backend port updated to 3001${NC}"
echo ""

echo -e "${BLUE}Step 8: Installing Nginx configuration...${NC}"
sudo mv /tmp/onelastai-https.conf /etc/nginx/sites-available/onelastai-https
sudo ln -sf /etc/nginx/sites-available/onelastai-https /etc/nginx/sites-enabled/onelastai-https
echo -e "${GREEN}✓ Configuration installed${NC}"
echo ""

echo -e "${BLUE}Step 9: Removing old HTTP-only config...${NC}"
sudo rm -f /etc/nginx/sites-enabled/onelastai
echo -e "${GREEN}✓ Old configuration removed${NC}"
echo ""

echo -e "${BLUE}Step 10: Testing Nginx configuration...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
else
    echo -e "${RED}✗ Nginx configuration test failed!${NC}"
    echo "Restoring old configuration..."
    sudo rm -f /etc/nginx/sites-enabled/onelastai-https
    sudo ln -sf /etc/nginx/sites-available/onelastai /etc/nginx/sites-enabled/onelastai
    sudo nginx -t
    exit 1
fi
echo ""

echo -e "${BLUE}Step 11: Reloading Nginx...${NC}"
sudo systemctl reload nginx
echo -e "${GREEN}✓ Nginx reloaded${NC}"
echo ""

echo -e "${BLUE}Step 12: Verifying HTTPS is working...${NC}"
sleep 2
if sudo ss -tlnp | grep ':443' > /dev/null; then
    echo -e "${GREEN}✓ Port 443 is listening${NC}"
    sudo ss -tlnp | grep ':443'
else
    echo -e "${RED}✗ Port 443 is NOT listening${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}Step 13: Testing local HTTPS connection...${NC}"
if curl -k -s https://localhost/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ HTTPS is working locally${NC}"
else
    echo -e "${YELLOW}⚠ Could not verify HTTPS locally (may need domain DNS)${NC}"
fi
echo ""

echo -e "${GREEN}========================================"
echo "✅ SSL SETUP COMPLETE!"
echo "========================================${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure Cloudflare DNS:"
echo "   - A record: onelastai.co → 47.129.43.231 (Proxied ON)"
echo "   - A record: www → 47.129.43.231 (Proxied ON)"
echo ""
echo "2. Set Cloudflare SSL/TLS Mode:"
echo "   - Go to: SSL/TLS settings"
echo "   - Select: Full (strict)"
echo ""
echo "3. Test your site:"
echo "   - https://onelastai.co/"
echo "   - https://www.onelastai.co/"
echo ""
echo "4. Verify SSL:"
echo "   - https://www.ssllabs.com/ssltest/analyze.html?d=onelastai.co"
echo ""
echo -e "${GREEN}🎉 Your site is now ready for HTTPS!${NC}"
echo ""
