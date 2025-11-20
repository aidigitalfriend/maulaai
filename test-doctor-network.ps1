# Doctor Network Mistral Integration Test Script
# Tests the live Doctor Network API with Mistral AI

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🩺 Testing Doctor Network Mistral Integration" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$apiUrl = "https://onelastai.co/api/doctor-network"

# Test 1: Initial greeting (should mention OneLastAI)
Write-Host "Test 1: Initial Greeting" -ForegroundColor Yellow
$body1 = @{
    message = "Hello"
    conversation = @()
    language = "en"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body1 -ContentType "application/json"
    Write-Host "✅ Response received" -ForegroundColor Green
    Write-Host "Content: $($response1.response.content)" -ForegroundColor White
    
    if ($response1.response.content -match "OneLastAI") {
        Write-Host "✅ OneLastAI branding present!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ OneLastAI branding NOT found" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Test failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Network question (should use Mistral)
Write-Host "Test 2: Network Question" -ForegroundColor Yellow
$body2 = @{
    message = "What is an IP address?"
    conversation = @(
        @{
            type = "user"
            content = "Hello"
        }
        @{
            type = "assistant"
            content = "Hi! I'm Doctor Network, created by OneLastAI..."
        }
    )
    language = "en"
} | ConvertTo-Json -Depth 5

try {
    $response2 = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body2 -ContentType "application/json"
    Write-Host "✅ Response received" -ForegroundColor Green
    Write-Host "Content: $($response2.response.content)" -ForegroundColor White
    Write-Host "Metadata: $($response2.metadata | ConvertTo-Json)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Test failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Message limit check (simulate 20 messages)
Write-Host "Test 3: Message Limit (20 messages)" -ForegroundColor Yellow
$conversation = @()
for ($i = 1; $i -le 19; $i++) {
    $conversation += @{
        type = "user"
        content = "Question $i"
    }
    $conversation += @{
        type = "assistant"
        content = "Answer $i"
    }
}

$body3 = @{
    message = "This should trigger the limit"
    conversation = $conversation
    language = "en"
} | ConvertTo-Json -Depth 10

try {
    $response3 = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body3 -ContentType "application/json"
    Write-Host "✅ Response received" -ForegroundColor Green
    Write-Host "Content: $($response3.response.content)" -ForegroundColor White
    
    if ($response3.metadata.limitReached) {
        Write-Host "✅ Message limit enforced correctly!" -ForegroundColor Green
        Write-Host "Messages used: $($response3.metadata.messagesUsed)" -ForegroundColor White
    } else {
        Write-Host "⚠️ Message limit NOT triggered (expected at 20)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Test failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Doctor Network Testing Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Manual Test: https://onelastai.co/tools/ip-info" -ForegroundColor Yellow
Write-Host "📊 Check PM2 logs: ssh -i one-last-ai.pem ubuntu@47.129.43.231 'pm2 logs backend'" -ForegroundColor Yellow
