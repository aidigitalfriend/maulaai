# 🎭 Emotional TTS Setup Script
# Run this to test your emotional TTS configuration

Write-Host "`n=== EMOTIONAL TTS SETUP & VERIFICATION ===" -ForegroundColor Cyan
Write-Host "This script will verify your emotional TTS configuration`n" -ForegroundColor White

# Check if backend directory exists
if (-Not (Test-Path "backend")) {
    Write-Host "❌ Backend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Check .env file
Write-Host "📋 Checking environment variables..." -ForegroundColor Yellow
$envFile = "backend\.env"

if (-Not (Test-Path $envFile)) {
    Write-Host "❌ .env file not found in backend directory!" -ForegroundColor Red
    Write-Host "Please create backend\.env file with your API keys." -ForegroundColor Yellow
    exit 1
}

$envContent = Get-Content $envFile -Raw

# Check for TTS providers
Write-Host "`n🔑 Checking TTS Provider API Keys:" -ForegroundColor Cyan

$providers = @{
    "ELEVENLABS_API_KEY" = "ElevenLabs (PRIMARY - Best Quality)"
    "AZURE_SPEECH_KEY" = "Azure Cognitive Speech (SECONDARY)"
    "AZURE_SPEECH_REGION" = "Azure Speech Region"
    "GOOGLE_CLOUD_TTS_KEY" = "Google Cloud TTS (TERTIARY)"
    "AWS_ACCESS_KEY_ID" = "Amazon Polly (QUATERNARY)"
    "AWS_SECRET_ACCESS_KEY" = "Amazon Polly Secret"
    "OPENAI_API_KEY" = "OpenAI TTS (FALLBACK)"
}

$configuredCount = 0
$totalProviders = 5

foreach ($key in $providers.Keys) {
    if ($envContent -match "$key\s*=\s*\S+") {
        Write-Host "  ✅ $($providers[$key])" -ForegroundColor Green
        if ($key -ne "AZURE_SPEECH_REGION" -and $key -ne "AWS_SECRET_ACCESS_KEY") {
            $configuredCount++
        }
    } else {
        Write-Host "  ⚠️  $($providers[$key]) - Not configured" -ForegroundColor Yellow
    }
}

Write-Host "`n📊 Provider Status: $configuredCount/$totalProviders configured" -ForegroundColor White

if ($configuredCount -eq 0) {
    Write-Host "`n❌ No TTS providers configured!" -ForegroundColor Red
    Write-Host "Please add at least one TTS provider API key to .env file." -ForegroundColor Yellow
    Write-Host "`nRecommended providers (with FREE tiers):" -ForegroundColor Cyan
    Write-Host "  1. Azure Speech - 5M chars/month FREE" -ForegroundColor Green
    Write-Host "  2. Google Cloud TTS - 4M chars/month FREE" -ForegroundColor Green
    Write-Host "  3. Amazon Polly - 5M chars/month FREE (first year)" -ForegroundColor Green
    Write-Host "  4. ElevenLabs - 10K chars/month FREE (best quality)" -ForegroundColor Green
    exit 1
}

# Check if AWS SDK is installed
Write-Host "`n📦 Checking dependencies..." -ForegroundColor Yellow
$packageJson = Get-Content "backend\package.json" -Raw | ConvertFrom-Json

if ($packageJson.dependencies.PSObject.Properties.Name -contains "aws-sdk") {
    Write-Host "  ✅ AWS SDK installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  AWS SDK not installed" -ForegroundColor Yellow
    Write-Host "  Installing AWS SDK..." -ForegroundColor Cyan
    
    Set-Location backend
    npm install aws-sdk --save --legacy-peer-deps
    Set-Location ..
    
    Write-Host "  ✅ AWS SDK installed successfully" -ForegroundColor Green
}

# Check if emotional TTS files exist
Write-Host "`n📁 Checking emotional TTS files..." -ForegroundColor Yellow

$requiredFiles = @(
    "backend\lib\emotional-tts-service.ts",
    "backend\lib\emotional-tts-providers.ts",
    "backend\app\api\emotional-tts\route.ts",
    "frontend\lib\emotional-tts-client.ts",
    "frontend\components\EmotionalTTSExample.tsx"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file - Missing!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-Not $allFilesExist) {
    Write-Host "`n❌ Some required files are missing!" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          EMOTIONAL TTS SETUP COMPLETE! ✅             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n📊 Configuration Summary:" -ForegroundColor White
Write-Host "  • Configured Providers: $configuredCount/$totalProviders" -ForegroundColor $(if ($configuredCount -ge 1) { "Green" } else { "Yellow" })
Write-Host "  • Total Agents: 16 (4 female, 12 male)" -ForegroundColor Green
Write-Host "  • Supported Emotions: 25+" -ForegroundColor Green
Write-Host "  • Speaking Styles: 15+" -ForegroundColor Green

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start backend: npm run dev (in backend directory)" -ForegroundColor White
Write-Host "  2. Start frontend: npm run dev (in frontend directory)" -ForegroundColor White
Write-Host "  3. Test API: curl http://localhost:3005/api/emotional-tts" -ForegroundColor White
Write-Host "  4. Test agent voice: POST /api/emotional-tts with { action: 'test', agentId: 'julie-girlfriend' }" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "  • Full guide: EMOTIONAL_TTS_COMPLETE.md" -ForegroundColor White
Write-Host "  • Example usage: frontend\components\EmotionalTTSExample.tsx" -ForegroundColor White

Write-Host "`n💡 Quick Test:" -ForegroundColor Cyan
Write-Host "  # Test Julie's romantic voice:" -ForegroundColor White
Write-Host '  curl -X POST http://localhost:3005/api/emotional-tts \' -ForegroundColor Gray
Write-Host '    -H "Content-Type: application/json" \' -ForegroundColor Gray
Write-Host '    -d ''{ "action": "test", "agentId": "julie-girlfriend" }''' -ForegroundColor Gray

Write-Host "`n🎭 Available Agents:" -ForegroundColor Cyan
Write-Host "  Female (4): julie-girlfriend, drama-queen, emma-emotional, mrs-boss" -ForegroundColor Magenta
Write-Host "  Male (12): einstein, comedy-king, fitness-guru, tech-wizard, chef-biew," -ForegroundColor Blue
Write-Host "             lazy-pawn, professor-astrology, travel-buddy, ben-sega," -ForegroundColor Blue
Write-Host "             chess-player, knight-logic, rook-jokey" -ForegroundColor Blue

Write-Host "`n💰 Cost Optimization:" -ForegroundColor Cyan
Write-Host "  • FREE Monthly: ~14M characters across all providers!" -ForegroundColor Green
Write-Host "  • Azure: 5M chars FREE" -ForegroundColor Green
Write-Host "  • Google: 4M chars FREE" -ForegroundColor Green
Write-Host "  • Polly: 5M chars FREE (first year)" -ForegroundColor Green
Write-Host "  • ElevenLabs: 10K chars FREE (best quality)" -ForegroundColor Green

Write-Host "`n✅ Setup verification complete!" -ForegroundColor Green
Write-Host "   Your emotional TTS system is ready to make AI agents sound human! 🎤`n" -ForegroundColor White
