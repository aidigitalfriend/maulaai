# Test AI Services on production
Write-Host "=== Recompiling TypeScript ===" -ForegroundColor Cyan
ssh -i "one-last-ai.pem" ubuntu@ec2-47-129-43-231.ap-southeast-1.compute.amazonaws.com "cd ~/shiny-friend-disco/backend && npx tsc lib/enhanced-status.ts --outDir lib/compiled --target es2020 --module esnext --esModuleInterop --skipLibCheck --resolveJsonModule --moduleResolution node"

Write-Host "`n=== Restarting PM2 Backend ===" -ForegroundColor Cyan
ssh -i "one-last-ai.pem" ubuntu@ec2-47-129-43-231.ap-southeast-1.compute.amazonaws.com "pm2 restart backend"

Write-Host "`n=== Waiting for restart ===" -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "`n=== Testing AI Services API ===" -ForegroundColor Cyan
$response = ssh -i "one-last-ai.pem" ubuntu@ec2-47-129-43-231.ap-southeast-1.compute.amazonaws.com "curl -s http://localhost:3001/api/status"
$json = $response | ConvertFrom-Json

Write-Host "`nAI Services Status:" -ForegroundColor Green
Write-Host "Total services found: $($json.data.aiServices.Count)" -ForegroundColor Yellow
foreach ($service in $json.data.aiServices) {
    $statusColor = if ($service.status -eq "operational") { "Green" } else { "Red" }
    Write-Host "  - $($service.name): " -NoNewline
    Write-Host "$($service.status)" -ForegroundColor $statusColor -NoNewline
    Write-Host " (${$service.responseTime}ms)"
}

Write-Host "`n=== Testing on public URL ===" -ForegroundColor Cyan
Write-Host "Visit: https://onelastai.co/status" -ForegroundColor Cyan
Write-Host "All AI services should now be visible!" -ForegroundColor Green
