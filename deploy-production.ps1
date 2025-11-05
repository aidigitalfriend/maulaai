# Production Deployment Script for EC2
# This script deploys the entire application to the EC2 server

$ErrorActionPreference = "Stop"

$EC2_HOST = "ec2-47-129-195-133.ap-southeast-1.compute.amazonaws.com"
$KEY_FILE = "one-last-ai.pem"
$REMOTE_DIR = "/home/ubuntu/shiny-friend-disco"

Write-Host "=== Starting Production Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Sync code to server
Write-Host "Step 1: Syncing code to server..." -ForegroundColor Yellow
& rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' --exclude '*.log' `
    -e "ssh -i $KEY_FILE" `
    ./ ubuntu@${EC2_HOST}:${REMOTE_DIR}/

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to sync code. Trying with SSH..." -ForegroundColor Red
    # Fallback: use git pull
    ssh -i $KEY_FILE ubuntu@$EC2_HOST "cd $REMOTE_DIR && git pull origin main"
}

Write-Host "Step 2: Installing MongoDB..." -ForegroundColor Yellow
ssh -i $KEY_FILE ubuntu@$EC2_HOST @"
    echo '=== Installing MongoDB ===' && \
    sudo apt-get install -y gnupg curl && \
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg && \
    echo 'deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse' | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list && \
    sudo apt-get update && \
    sudo apt-get install -y mongodb-org && \
    sudo systemctl start mongod && \
    sudo systemctl enable mongod && \
    sudo systemctl status mongod --no-pager | head -5
"@

Write-Host "Step 3: Setting up environment files..." -ForegroundColor Yellow
ssh -i $KEY_FILE ubuntu@$EC2_HOST @"
    cd $REMOTE_DIR && \
    echo '=== Creating .env files ===' && \
    if [ ! -f .env ]; then
        echo 'MONGODB_URI=mongodb://localhost:27017/onelastai' > .env
        echo 'PORT=3000' >> .env
        echo 'NODE_ENV=production' >> .env
        echo 'NEXTAUTH_URL=http://$(curl -s ifconfig.me):3000' >> .env
        echo 'NEXTAUTH_SECRET=$(openssl rand -base64 32)' >> .env
    fi && \
    if [ ! -f backend/.env ]; then
        cp .env backend/.env
        echo 'PORT=3005' >> backend/.env
    fi && \
    cat .env
"@

Write-Host "Step 4: Installing root dependencies..." -ForegroundColor Yellow
ssh -i $KEY_FILE ubuntu@$EC2_HOST @"
    cd $REMOTE_DIR && \
    echo '=== Installing root dependencies ===' && \
    npm install
"@

Write-Host "Step 5: Installing and building backend..." -ForegroundColor Yellow
ssh -i $KEY_FILE ubuntu@$EC2_HOST @"
    cd $REMOTE_DIR/backend && \
    echo '=== Installing backend dependencies ===' && \
    npm install && \
    echo '=== Backend ready ===' && \
    ls -la
"@

Write-Host "Step 6: Installing and building frontend (this may take 5-10 minutes)..." -ForegroundColor Yellow
ssh -i $KEY_FILE ubuntu@$EC2_HOST @"
    cd $REMOTE_DIR/frontend && \
    echo '=== Cleaning old build ===' && \
    rm -rf .next node_modules package-lock.json && \
    echo '=== Installing frontend dependencies ===' && \
    NODE_OPTIONS='--max-old-space-size=4096' npm install && \
    echo '=== Building frontend ===' && \
    NODE_OPTIONS='--max-old-space-size=4096' NODE_ENV=production npm run build && \
    echo '=== Frontend build complete ===' && \
    ls -la .next/
"@

Write-Host "Step 7: Configuring PM2..." -ForegroundColor Yellow
ssh -i $KEY_FILE ubuntu@$EC2_HOST @"
    cd $REMOTE_DIR && \
    echo '=== Stopping old PM2 processes ===' && \
    pm2 delete all || true && \
    echo '=== Starting new PM2 processes ===' && \
    pm2 start ecosystem.config.js && \
    pm2 save && \
    pm2 startup | tail -1 | sudo bash && \
    echo '=== PM2 Status ===' && \
    pm2 status && \
    pm2 logs --lines 10 --nostream
"@

Write-Host "Step 8: Configuring Nginx..." -ForegroundColor Yellow
ssh -i $KEY_FILE ubuntu@$EC2_HOST @"
    echo '=== Setting up Nginx ===' && \
    sudo tee /etc/nginx/sites-available/onelastai.conf > /dev/null << 'NGINXCONF'
server {
    listen 80;
    server_name _;
    client_max_body_size 100M;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3005/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Health check
    location /health {
        access_log off;
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
NGINXCONF
    sudo ln -sf /etc/nginx/sites-available/onelastai.conf /etc/nginx/sites-enabled/ && \
    sudo nginx -t && \
    sudo systemctl reload nginx && \
    echo '=== Nginx configured ===' && \
    sudo systemctl status nginx --no-pager | head -5
"@

Write-Host ""
Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Getting public IP..." -ForegroundColor Cyan
$PUBLIC_IP = ssh -i $KEY_FILE ubuntu@$EC2_HOST "curl -s ifconfig.me"
Write-Host ""
Write-Host "Application is running at:" -ForegroundColor Green
Write-Host "  http://$PUBLIC_IP" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "  ssh -i $KEY_FILE ubuntu@$EC2_HOST 'pm2 logs'" -ForegroundColor Gray
Write-Host ""
Write-Host "To check status:" -ForegroundColor Yellow
Write-Host "  ssh -i $KEY_FILE ubuntu@$EC2_HOST 'pm2 status'" -ForegroundColor Gray
Write-Host ""
