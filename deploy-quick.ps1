# Quick deployment script (assumes MongoDB already installed)
# Usage: .\deploy-quick.ps1

$ErrorActionPreference = "Stop"

$EC2_HOST = "ec2-47-129-195-133.ap-southeast-1.compute.amazonaws.com"
$KEY_FILE = "one-last-ai.pem"
$REMOTE_DIR = "/home/ubuntu/shiny-friend-disco"

Write-Host "=== Quick Deployment ===" -ForegroundColor Cyan

Write-Host "[1/6] Syncing code..." -ForegroundColor Yellow
ssh -i $KEY_FILE ubuntu@$EC2_HOST "cd $REMOTE_DIR && git pull origin main || echo 'Using existing code'"

Write-Host "[2/6] Installing root dependencies..." -ForegroundColor Yellow
ssh -i $KEY_FILE ubuntu@$EC2_HOST "cd $REMOTE_DIR && npm install"

Write-Host "[3/6] Installing backend dependencies..." -ForegroundColor Yellow
ssh -i $KEY_FILE ubuntu@$EC2_HOST "cd $REMOTE_DIR/backend && npm install"

Write-Host "[4/6] Building frontend..." -ForegroundColor Yellow
ssh -i $KEY_FILE ubuntu@$EC2_HOST @"
    cd $REMOTE_DIR/frontend && \
    NODE_OPTIONS='--max-old-space-size=4096' npm install && \
    NODE_OPTIONS='--max-old-space-size=4096' NODE_ENV=production npm run build
"@

Write-Host "[5/6] Restarting services..." -ForegroundColor Yellow
ssh -i $KEY_FILE ubuntu@$EC2_HOST "cd $REMOTE_DIR && pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js && pm2 save"

Write-Host "[6/6] Checking status..." -ForegroundColor Yellow
ssh -i $KEY_FILE ubuntu@$EC2_HOST "pm2 status && pm2 logs --lines 5 --nostream"

$PUBLIC_IP = ssh -i $KEY_FILE ubuntu@$EC2_HOST "curl -s ifconfig.me"
Write-Host ""
Write-Host "✓ Deployment complete!" -ForegroundColor Green
Write-Host "  http://$PUBLIC_IP" -ForegroundColor Cyan
