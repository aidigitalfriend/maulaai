# 🔧 Doctor Network Fix - Copy to Frontend Location
# The API route needs to be in frontend/app/api/, not backend/app/api/

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🔧 Fixing Doctor Network API Location" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create frontend API directory locally
Write-Host "📁 Creating frontend API directory..." -ForegroundColor Yellow
$frontendApiDir = "frontend\app\api\doctor-network"
if (-not (Test-Path $frontendApiDir)) {
    New-Item -ItemType Directory -Force -Path $frontendApiDir | Out-Null
    Write-Host "✅ Directory created: $frontendApiDir" -ForegroundColor Green
} else {
    Write-Host "✅ Directory already exists: $frontendApiDir" -ForegroundColor Green
}
Write-Host ""

# Step 2: Copy route.ts from backend to frontend
Write-Host "📋 Copying route.ts to frontend..." -ForegroundColor Yellow
Copy-Item "backend\app\api\doctor-network\route.ts" "$frontendApiDir\route.ts" -Force
Write-Host "✅ File copied locally" -ForegroundColor Green
Write-Host ""

# Step 3: Upload to EC2
Write-Host "📤 Uploading to EC2..." -ForegroundColor Yellow
$pemFile = "one-last-ai.pem"
$server = "ubuntu@47.129.43.231"
$remotePath = "~/shiny-friend-disco"

# Create directory on server
ssh -i $pemFile $server "mkdir -p $remotePath/frontend/app/api/doctor-network"
Write-Host "✅ Remote directory created" -ForegroundColor Green

# Upload the file
scp -i $pemFile "$frontendApiDir\route.ts" "${server}:${remotePath}/frontend/app/api/doctor-network/route.ts"
Write-Host "✅ File uploaded to EC2" -ForegroundColor Green
Write-Host ""

# Step 4: Rebuild frontend
Write-Host "🔨 Rebuilding frontend..." -ForegroundColor Yellow
ssh -i $pemFile $server "cd $remotePath/frontend; NODE_ENV=production npm run build"
Write-Host "✅ Frontend rebuilt" -ForegroundColor Green
Write-Host ""

# Step 5: Restart PM2
Write-Host "🔄 Restarting PM2..." -ForegroundColor Yellow
ssh -i $pemFile $server "cd $remotePath; pm2 restart frontend"
Write-Host "✅ PM2 restarted" -ForegroundColor Green
Write-Host ""

# Step 6: Verify
Write-Host "📊 Verifying deployment..." -ForegroundColor Yellow
ssh -i $pemFile $server "ls -lh $remotePath/frontend/app/api/doctor-network/route.ts"
Write-Host ""

Write-Host "================================================" -ForegroundColor Green
Write-Host "✅ Doctor Network API Fixed!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Test at: https://onelastai.co/tools/ip-info" -ForegroundColor Cyan
Write-Host "🩺 Doctor Network should now work correctly!" -ForegroundColor Cyan
Write-Host ""
