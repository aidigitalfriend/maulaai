# Script to update all agent pages with AgentPageLayout

$agentPages = @(
    'chess-player', 'drama-queen', 'emma-emotional', 'fitness-guru', 
    'julie-girlfriend', 'knight-logic', 'lazy-pawn', 'mrs-boss', 
    'nid-gaming', 'professor-astrology', 'rook-jokey', 'tech-wizard', 
    'travel-buddy'
)

foreach ($agent in $agentPages) {
    $filePath = "frontend\app\agents\$agent\page.tsx"
    
    if (Test-Path $filePath) {
        Write-Host "Updating $agent..." -ForegroundColor Cyan
        
        $content = Get-Content $filePath -Raw
        
        # Add import if not present
        if ($content -notmatch "import AgentPageLayout") {
            $content = $content -replace "(import AgentChatPanel from '../../../components/AgentChatPanel')", "`$1`nimport AgentPageLayout from '../../../components/AgentPageLayout'"
        }
        
        # Replace the return statement and layout structure
        $oldPattern = @"
  return \(
    <div className="h-full bg-gray-900 text-white flex flex-col">
      /\* Main Content \*/
      <div className="h-\[85vh\] flex gap-6 p-6 overflow-hidden">
        /\* Left Panel \*/
        <div className="w-1/4 flex flex-col h-full overflow-hidden">
          <AgentChatPanel
"@

        $newPattern = @"
  return (
    <AgentPageLayout
      leftPanel={
        <AgentChatPanel
"@
        
        $content = $content -replace [regex]::Escape($oldPattern), $newPattern
        
        # Save the file
        Set-Content -Path $filePath -Value $content -NoNewline
        
        Write-Host "  ✓ Updated $agent" -ForegroundColor Green
    }
    else {
        Write-Host "  ✗ File not found: $filePath" -ForegroundColor Red
    }
}

Write-Host "`nUpdate complete!" -ForegroundColor Green
