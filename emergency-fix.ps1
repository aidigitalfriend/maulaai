# 🔧 Emergency ChunkLoadError Fix Script
# This script diagnoses and fixes the build/deployment issues

$ErrorActionPreference = "Continue"  # Don't stop on errors for diagnosis

Write-Host "================================================" -ForegroundColor Red
Write-Host "🔧 EMERGENCY CHUNKLOA ERROR FIX" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Red
Write-Host ""

$pemFile = "one-last-ai.pem"
$server = "ubuntu@ec2-47-129-195-133.ap-southeast-1.compute.amazonaws.com"
$projectPath = "~/shiny-friend-disco"

# Step 1: Check current PM2 status
Write-Host "📊 Step 1: Checking PM2 status..." -ForegroundColor Yellow
ssh -i $pemFile $server "pm2 list"
Write-Host ""

# Step 2: Check if build exists
Write-Host "🔍 Step 2: Checking if .next build exists..." -ForegroundColor Yellow
ssh -i $pemFile $server "cd $projectPath/frontend && ls -la .next/ 2>/dev/null || echo 'NO BUILD FOUND'"
Write-Host ""

# Step 3: Stop all PM2 processes
Write-Host "🛑 Step 3: Stopping all PM2 processes..." -ForegroundColor Yellow
ssh -i $pemFile $server "pm2 delete all 2>/dev/null || true"
Write-Host ""

# Step 4: Force clean everything
Write-Host "🧹 Step 4: Force cleaning everything..." -ForegroundColor Yellow
ssh -i $pemFile $server "cd $projectPath/frontend && rm -rf .next node_modules/.cache && echo 'Cleaned build folders'"
Write-Host ""

# Step 5: Install dependencies
Write-Host "📦 Step 5: Installing dependencies..." -ForegroundColor Yellow
ssh -i $pemFile $server "cd $projectPath/frontend && npm install --legacy-peer-deps"
Write-Host ""

# Step 6: Build with verbose output
Write-Host "🔨 Step 6: Building with detailed output..." -ForegroundColor Yellow
ssh -i $pemFile $server "cd $projectPath/frontend && NODE_ENV=production npm run build"
Write-Host ""

# Step 7: Verify build completed
Write-Host "✅ Step 7: Verifying build completed..." -ForegroundColor Yellow
ssh -i $pemFile $server "cd $projectPath/frontend && ls -la .next/static/chunks/ | head -5"
Write-Host ""

# Step 8: Start frontend only first
Write-Host "🚀 Step 8: Starting frontend..." -ForegroundColor Yellow
ssh -i $pemFile $server "cd $projectPath/frontend && pm2 start npm --name 'frontend-app' -- run start"
Write-Host ""

# Step 9: Start backend
Write-Host "🚀 Step 9: Starting backend..." -ForegroundColor Yellow
ssh -i $pemFile $server "cd $projectPath/backend && pm2 start npm --name 'backend-api' -- run dev"
Write-Host ""

# Step 10: Save PM2 configuration
Write-Host "💾 Step 10: Saving PM2 configuration..." -ForegroundColor Yellow
ssh -i $pemFile $server "pm2 save"
Write-Host ""

# Step 11: Final status check
Write-Host "📊 Step 11: Final PM2 status..." -ForegroundColor Yellow
ssh -i $pemFile $server "pm2 list"
Write-Host ""

Write-Host "================================================" -ForegroundColor Green
Write-Host "✅ EMERGENCY FIX COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Test the site now: https://onelastai.co/industries/healthcare" -ForegroundColor Cyan
Write-Host ""
Write-Host "If still broken, we'll need to check Nginx configuration next." -ForegroundColor Yellow