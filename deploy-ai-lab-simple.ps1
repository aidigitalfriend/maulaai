# AI Lab Integration - Production Deployment Script
# Simple version using SSH with PEM key

Write-Host "Starting AI Lab Integration Deployment..." -ForegroundColor Cyan
Write-Host ""

$SERVER = "ubuntu@47.129.43.231"
$KEY = ".\one-last-ai.pem"
$PROJECT = "~/shiny-friend-disco"

# Step 1: Upload backend API routes
Write-Host "Step 1: Uploading backend API routes..." -ForegroundColor Yellow
scp -i $KEY -r backend/app/api/lab/* ${SERVER}:${PROJECT}/backend/app/api/lab/
if ($LASTEXITCODE -eq 0) {
    Write-Host "Backend routes uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "Failed to upload backend routes" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Upload frontend pages
Write-Host "Step 2: Uploading frontend pages..." -ForegroundColor Yellow
scp -i $KEY -r frontend/app/lab/* ${SERVER}:${PROJECT}/frontend/app/lab/
if ($LASTEXITCODE -eq 0) {
    Write-Host "Frontend pages uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "Failed to upload frontend pages" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Rebuild on server
Write-Host "Step 3: Rebuilding on server..." -ForegroundColor Yellow

$commands = @"
cd $PROJECT
echo '=== Installing dependencies ==='
cd backend
npm install
cd ../frontend
npm install
echo '=== Building backend ==='
cd $PROJECT/backend
npm run build
echo '=== Clearing Next.js cache ==='
cd $PROJECT/frontend
rm -rf .next
echo '=== Building frontend ==='
npm run build
echo '=== Restarting PM2 ==='
pm2 restart backend
pm2 restart frontend
echo '=== PM2 Status ==='
pm2 status
"@

ssh -i $KEY $SERVER $commands

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test at: https://onelastai.co/lab" -ForegroundColor Yellow
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Cyan
Write-Host "  ssh -i $KEY $SERVER" -ForegroundColor White
Write-Host "  pm2 logs frontend --lines 50" -ForegroundColor White
Write-Host "  pm2 logs backend --lines 50" -ForegroundColor White
Write-Host ""
