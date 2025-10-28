# Fix all broken agent imports
# This script fixes the chatStorage import issue in all agent pages

$agentFiles = @(
    'frontend/app/agents/chef-biew/page.tsx',
    'frontend/app/agents/drama-queen/page.tsx',
    'frontend/app/agents/emma-emotional/page.tsx',
    'frontend/app/agents/fitness-guru/page.tsx',
    'frontend/app/agents/julie-girlfriend/page.tsx',
    'frontend/app/agents/knight-logic/page.tsx',
    'frontend/app/agents/lazy-pawn/page.tsx',
    'frontend/app/agents/mrs-boss/page.tsx',
    'frontend/app/agents/nid-gaming/page.tsx',
    'frontend/app/agents/professor-astrology/page.tsx',
    'frontend/app/agents/rook-jokey/page.tsx',
    'frontend/app/agents/tech-wizard/page.tsx',
    'frontend/app/agents/travel-buddy/page.tsx'
)

$oldImport1 = "import { chatStorage, generateSessionId } from '../../../components/BenSegaChatPanel'"
$oldImport2 = "import type { ChatSession } from '../../../components/BenSegaChatPanel'"

$newImport1 = "import * as chatStorage from '../../../utils/chatStorage'"
$newImport2 = "import type { ChatSession } from '../../../utils/chatStorage'"
$helperFunction = "`n// Helper function to generate session IDs`nconst generateSessionId = () => ``session-`${Date.now()}-`${Math.random().toString(36).substr(2, 9)}``"

foreach ($file in $agentFiles) {
    Write-Host "Fixing $file..."
    $content = Get-Content $file -Raw
    $content = $content -replace [regex]::Escape($oldImport1), $newImport1
    $content = $content -replace [regex]::Escape($oldImport2), "$newImport2$helperFunction"
    Set-Content -Path $file -Value $content -NoNewline
}

Write-Host "All agents fixed!" -ForegroundColor Green
