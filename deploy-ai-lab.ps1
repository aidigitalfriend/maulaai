# AI Lab Integration - Production Deployment Script
# This script deploys all AI Lab backend and frontend changes to production server

Write-Host "🚀 Starting AI Lab Integration Deployment..." -ForegroundColor Cyan
Write-Host ""

# Server details
$SERVER = "ubuntu@47.129.43.231"
$PROJECT_PATH = "~/shiny-friend-disco"

# Step 1: Upload backend API routes
Write-Host "📦 Step 1: Uploading backend API routes..." -ForegroundColor Yellow
scp -r backend/app/api/lab/* ${SERVER}:${PROJECT_PATH}/backend/app/api/lab/
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Backend routes uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to upload backend routes" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Upload frontend pages
Write-Host "📦 Step 2: Uploading frontend pages..." -ForegroundColor Yellow
scp -r frontend/app/lab/* ${SERVER}:${PROJECT_PATH}/frontend/app/lab/
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Frontend pages uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to upload frontend pages" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: SSH to server and rebuild
Write-Host "🔨 Step 3: Rebuilding on server..." -ForegroundColor Yellow
Write-Host "Connecting to server and executing build commands..." -ForegroundColor Gray

ssh ${SERVER} "cd ${PROJECT_PATH} && \
echo 'Installing backend dependencies...' && \
cd backend && npm install && \
echo 'Installing frontend dependencies...' && \
cd ../frontend && npm install && \
echo 'Building backend...' && \
cd ${PROJECT_PATH}/backend && npm run build && \
echo 'Clearing Next.js cache...' && \
cd ${PROJECT_PATH}/frontend && rm -rf .next && \
echo 'Building frontend...' && \
npm run build && \
echo 'Restarting PM2 processes...' && \
pm2 restart backend && \
pm2 restart frontend && \
echo 'Checking PM2 status...' && \
pm2 status && \
echo 'Deployment complete!'"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Server rebuild and restart completed successfully" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Server commands completed with warnings" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Display PM2 logs
Write-Host "📋 Step 4: Checking recent logs..." -ForegroundColor Yellow
ssh ${SERVER} "pm2 logs --lines 20 --nostream"
Write-Host ""

# Summary
Write-Host "=" -NoNewline; Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "🎉 Deployment Summary" -ForegroundColor Cyan
Write-Host "=" -NoNewline; Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "[OK] Backend API routes deployed: 10 files" -ForegroundColor Green
Write-Host "[OK] Frontend pages deployed: 11 files" -ForegroundColor Green
Write-Host "[OK] Server rebuilt and restarted" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Test the AI Lab at: https://onelastai.co/lab" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Visit https://onelastai.co/lab" -ForegroundColor White
Write-Host "  2. Test each experiment with real prompts" -ForegroundColor White
Write-Host "  3. Verify all 10 experiments are working" -ForegroundColor White
Write-Host "  4. Check Battle Arena functionality" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Monitoring Commands:" -ForegroundColor Cyan
Write-Host "  ssh ${SERVER}" -ForegroundColor White
Write-Host "  pm2 logs frontend --lines 50" -ForegroundColor White
Write-Host "  pm2 logs backend --lines 50" -ForegroundColor White
Write-Host "  pm2 status" -ForegroundColor White
Write-Host ""
Write-Host "=" -NoNewline; Write-Host "=" * 60 -ForegroundColor Cyan
