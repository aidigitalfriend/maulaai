# Quick test of AI services on production
$response = Invoke-RestMethod -Uri "https://onelastai.co/api/status"
$services = $response.data.aiServices

Write-Host "`n=== AI SERVICES STATUS ===" -ForegroundColor Cyan
Write-Host "Total Services: $($services.Count)" -ForegroundColor Yellow
Write-Host ""

foreach ($service in $services) {
    $statusColor = if ($service.status -eq "operational") { "Green" } else { "Red" }
    $uptimeColor = if ($service.uptime -ge 99) { "Green" } else { "Yellow" }
    
    Write-Host ">> $($service.name)" -ForegroundColor White
    Write-Host "   Status: " -NoNewline
    Write-Host "$($service.status)" -ForegroundColor $statusColor
    Write-Host "   Response Time: $($service.responseTime)ms" -ForegroundColor Gray
    Write-Host "   Uptime: " -NoNewline
    Write-Host "$($service.uptime)%" -ForegroundColor $uptimeColor
    Write-Host ""
}

Write-Host "All AI services are now visible on the status page!" -ForegroundColor Green
