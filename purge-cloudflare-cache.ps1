# Purge Cloudflare Cache
# This will clear all cached content on Cloudflare CDN

$ErrorActionPreference = "Stop"

# Load environment variables from backend/.env
Write-Host "Loading Cloudflare credentials..." -ForegroundColor Cyan

$envPath = "backend/.env"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            if ($name -eq "CLOUDFLARE_API_TOKEN") {
                $CF_API_TOKEN = $value
            }
            elseif ($name -eq "CLOUDFLARE_ZONE_ID") {
                $CF_ZONE_ID = $value
            }
        }
    }
}

if (-not $CF_API_TOKEN -or -not $CF_ZONE_ID) {
    Write-Host "ERROR: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID not found in .env file" -ForegroundColor Red
    exit 1
}

Write-Host "Purging Cloudflare cache for zone: $CF_ZONE_ID" -ForegroundColor Yellow

$headers = @{
    "Authorization" = "Bearer $CF_API_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    purge_everything = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" `
        -Method Post `
        -Headers $headers `
        -Body $body

    if ($response.success) {
        Write-Host "`n✅ Cloudflare cache purged successfully!" -ForegroundColor Green
        Write-Host "All cached content has been cleared from Cloudflare CDN." -ForegroundColor Green
        Write-Host "`nNext steps:" -ForegroundColor Cyan
        Write-Host "1. Hard refresh your browser (Ctrl + Shift + R)" -ForegroundColor White
        Write-Host "2. The 503 errors should now be resolved" -ForegroundColor White
    }
    else {
        Write-Host "`n❌ Failed to purge cache" -ForegroundColor Red
        Write-Host "Errors: $($response.errors | ConvertTo-Json -Depth 3)" -ForegroundColor Red
    }
}
catch {
    Write-Host "`n❌ Error calling Cloudflare API: $_" -ForegroundColor Red
    exit 1
}
