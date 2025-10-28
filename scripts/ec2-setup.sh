#!/bin/bash

# =================================================
# EC2 Ubuntu Server Setup Script
# For: Shiny Friend Disco Production Deployment
# =================================================

set -e  # Exit on error

echo "🚀 Starting EC2 Ubuntu Server Setup..."
echo "========================================="

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw

# Install Node.js 18 LTS
echo "📦 Installing Node.js 18 LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

echo "✅ Node.js version:"
node -v
echo "✅ npm version:"
npm -v

# Install PM2 globally
echo "📦 Installing PM2 process manager..."
sudo npm install -g pm2

# Configure PM2 startup
echo "🔧 Configuring PM2 to start on boot..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

echo "✅ Nginx status:"
sudo systemctl status nginx --no-pager

# Install Certbot for Let's Encrypt
echo "📦 Installing Certbot for SSL certificates..."
sudo apt install -y certbot python3-certbot-nginx

# Create webroot for Let's Encrypt
sudo mkdir -p /var/www/certbot

# Configure UFW firewall
echo "🔥 Configuring firewall (UFW)..."
sudo ufw --force enable
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

echo "✅ Firewall status:"
sudo ufw status

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/shiny-friend-disco
sudo chown ubuntu:ubuntu /var/www/shiny-friend-disco

# Create log directory for PM2
echo "📁 Creating log directories..."
sudo mkdir -p /var/log/pm2
sudo chown ubuntu:ubuntu /var/log/pm2

# Generate SSH key for GitHub (optional)
if [ ! -f ~/.ssh/id_ed25519 ]; then
    echo "🔑 Generating SSH key for GitHub..."
    ssh-keygen -t ed25519 -C "ubuntu@ec2-shiny-friend-disco" -N "" -f ~/.ssh/id_ed25519
    echo ""
    echo "📋 Your SSH public key (add this to GitHub):"
    echo "========================================="
    cat ~/.ssh/id_ed25519.pub
    echo "========================================="
    echo ""
    echo "Add this key to: https://github.com/settings/ssh/new"
    echo ""
else
    echo "✅ SSH key already exists"
fi

# Install MongoDB tools (optional, for MongoDB Atlas connection)
echo "📦 Installing MongoDB tools..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt install -y mongodb-mongosh

# System information
echo ""
echo "========================================="
echo "✅ EC2 Setup Complete!"
echo "========================================="
echo ""
echo "📊 System Information:"
echo "- OS: $(lsb_release -d | cut -f2)"
echo "- Node.js: $(node -v)"
echo "- npm: $(npm -v)"
echo "- PM2: $(pm2 -v)"
echo "- Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo "- MongoDB Shell: $(mongosh --version | head -n1)"
echo ""
echo "📁 Application directory: /var/www/shiny-friend-disco"
echo "📁 Log directory: /var/log/pm2"
echo ""
echo "🔥 Firewall status:"
sudo ufw status numbered
echo ""
echo "📋 Next Steps:"
echo "1. Add SSH key to GitHub (shown above)"
echo "2. Clone repository to /var/www/shiny-friend-disco"
echo "3. Create .env files (frontend & backend)"
echo "4. Configure Nginx (/etc/nginx/sites-available/onelastai.co)"
echo "5. Obtain SSL certificate with Certbot"
echo "6. Start applications with PM2"
echo ""
echo "🚀 Ready for deployment!"
