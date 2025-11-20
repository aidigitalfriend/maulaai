# =============================================================================
# SECURITY CHECK SCRIPT FOR GITHUB REPOSITORY (PowerShell)
# =============================================================================
# This script checks for sensitive files and data before committing to GitHub
# Run this script before pushing to ensure no secrets are exposed

Write-Host "🔍 GITHUB SECURITY CHECK - Scanning for sensitive files..." -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan

# Initialize counters
$WARNINGS = 0
$ERRORS = 0

Write-Host "`n1. Checking for sensitive files..." -ForegroundColor Blue

# Check for actual .env files (not .env.example)
$envFiles = Get-ChildItem -Path . -Name ".env" -Recurse | Where-Object { $_ -notlike "*node_modules*" -and $_ -notlike "*.next*" }
if ($envFiles) {
    Write-Host "❌ Found .env files:" -ForegroundColor Red
    $envFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    Write-Host "⚠️  Make sure these contain only placeholder values!" -ForegroundColor Yellow
    $WARNINGS++
} else {
    Write-Host "✅ No .env files found" -ForegroundColor Green
}

# Check for .env.local files
$envLocalFiles = Get-ChildItem -Path . -Name ".env.local" -Recurse | Where-Object { $_ -notlike "*node_modules*" -and $_ -notlike "*.next*" }
if ($envLocalFiles) {
    Write-Host "❌ Found .env.local files:" -ForegroundColor Red
    $envLocalFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    $ERRORS++
} else {
    Write-Host "✅ No .env.local files found" -ForegroundColor Green
}

# Check for API key files
$apiKeyFiles = Get-ChildItem -Path . -Name "*api*key*" -Recurse | Where-Object { $_ -notlike "*node_modules*" -and $_ -notlike "*.next*" }
if ($apiKeyFiles) {
    Write-Host "❌ Found potential API key files:" -ForegroundColor Red
    $apiKeyFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    $ERRORS++
} else {
    Write-Host "✅ No API key files found" -ForegroundColor Green
}

# Check for certificate files
$certFiles = Get-ChildItem -Path . -Include "*.pem", "*.key", "*.crt", "*.cer" -Recurse | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" }
if ($certFiles) {
    Write-Host "❌ Found certificate/key files:" -ForegroundColor Red
    $certFiles | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor Red }
    $ERRORS++
} else {
    Write-Host "✅ No certificate files found" -ForegroundColor Green
}

# Check for APIKEYS.md file
if (Test-Path "APIKEYS.md") {
    Write-Host "❌ Found APIKEYS.md file" -ForegroundColor Red
    Write-Host "⚠️  This file contains sensitive API key information and should not be committed!" -ForegroundColor Yellow
    $ERRORS++
} else {
    Write-Host "✅ No APIKEYS.md file found" -ForegroundColor Green
}

Write-Host "`n2. Checking .gitignore configuration..." -ForegroundColor Blue

if (Test-Path ".gitignore") {
    Write-Host "✅ .gitignore file exists" -ForegroundColor Green
    
    # Check if important patterns are in .gitignore
    $requiredPatterns = @(".env", "node_modules", ".next", "*.key", "*.pem", "APIKEYS.md")
    $gitignoreContent = Get-Content ".gitignore" -Raw
    
    foreach ($pattern in $requiredPatterns) {
        if ($gitignoreContent -like "*$pattern*") {
            Write-Host "✅ Pattern '$pattern' found in .gitignore" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Pattern '$pattern' missing from .gitignore" -ForegroundColor Yellow
            $WARNINGS++
        }
    }
} else {
    Write-Host "❌ .gitignore file missing" -ForegroundColor Red
    $ERRORS++
}

Write-Host "`n3. Checking for build artifacts..." -ForegroundColor Blue

# Check for Next.js build files
if (Test-Path ".next") {
    Write-Host "⚠️  Found .next directory (should be gitignored)" -ForegroundColor Yellow
    $WARNINGS++
} else {
    Write-Host "✅ No .next directory found" -ForegroundColor Green
}

# Check for node_modules
if (Test-Path "node_modules") {
    Write-Host "⚠️  Found node_modules directory (should be gitignored)" -ForegroundColor Yellow
    $WARNINGS++
} else {
    Write-Host "✅ No node_modules directory found" -ForegroundColor Green
}

Write-Host "`n4. Checking for database files..." -ForegroundColor Blue

$dbFiles = Get-ChildItem -Path . -Include "*.db", "*.sqlite", "*.sqlite3" -Recurse
if ($dbFiles) {
    Write-Host "❌ Found database files:" -ForegroundColor Red
    $dbFiles | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor Red }
    $ERRORS++
} else {
    Write-Host "✅ No database files found" -ForegroundColor Green
}

Write-Host "`n5. Final recommendations..." -ForegroundColor Blue

Write-Host "`nBefore committing to GitHub:" -ForegroundColor Blue
Write-Host "1. Remove or rename APIKEYS.md to something like APIKEYS.example.md"
Write-Host "2. Ensure all .env files contain only placeholder values"
Write-Host "3. Create .env.example files with placeholder values for documentation"
Write-Host "4. Run 'git status' to verify no sensitive files are staged"
Write-Host "5. Consider using tools like 'git-secrets' for additional protection"

Write-Host "`nSummary:" -ForegroundColor Blue
Write-Host "Errors: $ERRORS" -ForegroundColor $(if ($ERRORS -gt 0) { "Red" } else { "Green" })
Write-Host "Warnings: $WARNINGS" -ForegroundColor $(if ($WARNINGS -gt 0) { "Yellow" } else { "Green" })

if ($ERRORS -gt 0) {
    Write-Host "`n❌ CRITICAL: Fix errors before committing to GitHub!" -ForegroundColor Red
    exit 1
} elseif ($WARNINGS -gt 0) {
    Write-Host "`n⚠️  WARNING: Review warnings before committing" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "`n✅ All checks passed! Safe to commit to GitHub" -ForegroundColor Green
    exit 0
}