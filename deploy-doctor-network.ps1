# 🚀 Doctor Network Mistral Integration Deployment
# Deploys updated Doctor Network with Mistral AI

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🩺 Deploying Doctor Network Mistral Update" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$pemFile = "one-last-ai.pem"
$server = "ubuntu@47.129.43.231"
$projectPath = "~/shiny-friend-disco"

# Step 1: Copy updated Doctor Network route
Write-Host "📤 Copying updated Doctor Network API route..." -ForegroundColor Yellow
scp -i $pemFile backend/app/api/doctor-network/route.ts "${server}:${projectPath}/backend/app/api/doctor-network/route.ts"
Write-Host "✅ File copied successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Restart PM2 processes
Write-Host "🔄 Restarting PM2 processes..." -ForegroundColor Yellow
ssh -i $pemFile $server "cd $projectPath; pm2 restart all"
Write-Host "✅ PM2 restarted" -ForegroundColor Green
Write-Host ""

# Step 3: Check PM2 status
Write-Host "📊 Checking PM2 status..." -ForegroundColor Yellow
ssh -i $pemFile $server "pm2 list"
Write-Host ""

Write-Host "================================================" -ForegroundColor Green
Write-Host "✅ Doctor Network Mistral Integration Deployed!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Test at: https://onelastai.co/tools/ip-info" -ForegroundColor Cyan
Write-Host "🩺 Doctor Network now uses:" -ForegroundColor Cyan
Write-Host "   • Mistral AI (primary provider)" -ForegroundColor White
Write-Host "   • OneLastAI branding" -ForegroundColor White
Write-Host "   • 20-message session limit" -ForegroundColor White
Write-Host "   • Internet-focused responses only" -ForegroundColor White
Write-Host ""
