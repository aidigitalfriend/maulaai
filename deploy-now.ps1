# 🚀 Automated Deployment Script for Windows
# This script deploys to EC2 without interactive SSH

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🚀 Starting Automated Deployment to EC2" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$pemFile = "one-last-ai.pem"
$server = "ubuntu@ec2-47-129-43-231.ap-southeast-1.compute.amazonaws.com"
$projectPath = "~/shiny-friend-disco"

# Step 1: Copy environment files
Write-Host "📤 Step 1: Copying environment files to EC2..." -ForegroundColor Yellow
if (Test-Path "frontend/.env.temp") {
    scp -i $pemFile frontend/.env.temp "${server}:${projectPath}/frontend/.env"
    Write-Host "✅ Frontend .env copied" -ForegroundColor Green
}
if (Test-Path "backend/.env.temp") {
    scp -i $pemFile backend/.env.temp "${server}:${projectPath}/backend/.env"
    Write-Host "✅ Backend .env copied" -ForegroundColor Green
}
Write-Host ""

# Step 2: Pull latest code
Write-Host "📥 Step 2: Pulling latest code from GitHub..." -ForegroundColor Yellow
ssh -i $pemFile $server "cd $projectPath && git pull origin main"
Write-Host "✅ Code updated" -ForegroundColor Green
Write-Host ""

# Step 3: Clean old build
Write-Host "🧹 Step 3: Cleaning old build artifacts..." -ForegroundColor Yellow
ssh -i $pemFile $server "cd $projectPath/frontend && rm -rf .next node_modules/.cache"
Write-Host "✅ Cleaned" -ForegroundColor Green
Write-Host ""

# Step 4: Install dependencies
Write-Host "📦 Step 4: Installing dependencies..." -ForegroundColor Yellow
ssh -i $pemFile $server "cd $projectPath/frontend && npm install --legacy-peer-deps"
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 5: Build frontend
Write-Host "🔨 Step 5: Building production frontend..." -ForegroundColor Yellow
ssh -i $pemFile $server "cd $projectPath/frontend && NODE_ENV=production npm run build"
Write-Host "✅ Build complete" -ForegroundColor Green
Write-Host ""

# Step 6: Restart services with PM2
Write-Host "🔄 Step 6: Restarting PM2 services..." -ForegroundColor Yellow
ssh -i $pemFile $server "cd $projectPath && pm2 delete frontend-app 2>/dev/null || true && pm2 delete backend-api 2>/dev/null || true"
ssh -i $pemFile $server "cd $projectPath/frontend && pm2 start npm --name 'frontend-app' -- run start"
ssh -i $pemFile $server "cd $projectPath/backend && pm2 start npm --name 'backend-api' -- run dev"
ssh -i $pemFile $server "pm2 save"
Write-Host "✅ Services restarted" -ForegroundColor Green
Write-Host ""

# Step 7: Show PM2 status
Write-Host "📊 Step 7: PM2 Status:" -ForegroundColor Yellow
ssh -i $pemFile $server "pm2 list"
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Your site: https://onelastai.co" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧹 NEXT STEP: Clear Cloudflare cache!" -ForegroundColor Yellow
Write-Host "   Run: ssh -i $pemFile $server 'cd $projectPath && bash scripts/purge-cloudflare-cache.sh'" -ForegroundColor White
Write-Host ""
