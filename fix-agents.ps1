#!/usr/bin/env pwsh
# Fix all agent pages with getAgentHistory error

$agents = @(
    @{id='drama-queen'; greeting="🎭 Darling! I'm Drama Queen, and EVERYTHING is a big deal! Let me add some theatrical flair to your day. Tell me what's happening in your fabulous life!"},
    @{id='lazy-pawn'; greeting="😴 Yawn... Oh hey there. I'm Lazy Pawn. Not really in the mood for much today, but I guess we can chat if you want. What's up?"},
    @{id='chef-biew'; greeting="👨‍🍳 Sawasdee krap! I'm Chef Biew, your personal cooking companion! Whether you want authentic Thai recipes, cooking tips, or culinary adventures, I'm here to help. What would you like to cook today?"},
    @{id='fitness-guru'; greeting="💪 Hey champion! I'm your Fitness Guru! Ready to crush your fitness goals? Whether it's workout plans, nutrition advice, or motivation, I'm here to help you become your best self!"},
    @{id='julie-girlfriend'; greeting="💕 Hi sweetie! I'm Julie, your caring companion. I'm here to chat, share thoughts, and be a supportive friend. How's your day going?"},
    @{id='knight-logic'; greeting="⚔️ Greetings! I am Knight Logic, master of strategic thinking and logical problem-solving. Let us engage in thoughtful discourse and tackle challenges with wisdom and precision!"},
    @{id='mrs-boss'; greeting="📊 Hello! I'm Mrs Boss, your business strategy advisor. Let's talk leadership, management, and growing your business. What challenges are you facing today?"},
    @{id='nid-gaming'; greeting="🎮 Yo! Nid Gaming here! Ready to talk about games, esports, streaming, or gaming culture? Let's level up this conversation!"},
    @{id='professor-astrology'; greeting="🔭 Greetings, dear student! I am Professor Astrology, here to guide you through the celestial mysteries. What cosmic questions do you have today?"},
    @{id='rook-jokey'; greeting="🃏 Well hello there! Rook Jokey at your service! Ready for some laughs, witty banter, and clever wordplay? Let's have some fun!"},
    @{id='tech-wizard'; greeting="💻 Hey! I'm Tech Wizard, your technology expert! Whether it's coding, cloud tech, DevOps, or the latest in tech trends, I'm here to help. What tech challenge can I help you with?"},
    @{id='travel-buddy'; greeting="✈️ Hey traveler! I'm your Travel Buddy! Ready to explore the world together? Let's plan adventures, discover destinations, and create amazing travel memories!"}
)

Write-Host "`n🔧 Fixing $($agents.Count) agent pages...`n" -ForegroundColor Cyan

$fixedCount = 0

foreach ($agent in $agents) {
    $agentId = $agent.id
    $greeting = $agent.greeting
    $filePath = "frontend/app/agents/$agentId/page.tsx"
    
    if (-not (Test-Path $filePath)) {
        Write-Host "❌ $agentId - File not found" -ForegroundColor Red
        continue
    }
    
    $content = Get-Content $filePath -Raw
    
    if ($content -notmatch 'getAgentHistory') {
        Write-Host "✓ $agentId - Already fixed" -ForegroundColor Green
        continue
    }
    
    Write-Host "⚙️  Fixing $agentId..." -ForegroundColor Yellow
    
    # Remove helper function and type import
    $content = $content -replace "// Helper function to generate session IDs\s*\nconst generateSessionId[^\n]*\n", ""
    $content = $content -replace "import type \{ ChatSession \} from '../../../utils/chatStorage'\s*\n", ""
    
    # Fix useState types
    $content = $content -replace "useState<ChatSession\[\]>", "useState<chatStorage.ChatSession[]>"
    $content = $content -replace "useState<string>\(''\)", "useState<string | null>(null)"
    
    # Fix useEffect - Replace getAgentHistory pattern
    $oldUseEffect = @'
const history = chatStorage.getAgentHistory\(agentId\)\s+const sessionList = Object\.values\(history\.sessions \|\| \{\}\)\s+if \(sessionList\.length === 0\) \{[^}]*?chatStorage\.saveSession\(agentId, initialSession\)[^}]*?setSessions\(\[initialSession\]\)[^}]*?setActiveSessionId\(initialSession\.id\)[^}]*?\} else \{[^}]*?setSessions\(sessionList\)[^}]*?setActiveSessionId\(sessionList\[0\]\.id\)[^}]*?\}
'@
    
    $newUseEffect = @"
const loadedSessions = chatStorage.getAgentSessions(agentId);
    if (loadedSessions.length > 0) {
      setSessions(loadedSessions);
      const activeId = chatStorage.getActiveSessionId(agentId);
      setActiveSessionId(activeId ?? loadedSessions[0].id);
    } else {
      handleNewChat();
    }
"@
    
    $content = $content -replace $oldUseEffect, $newUseEffect
    
    # Fix handleNewChat
    $oldHandleNewChat = @'
const handleNewChat = \(\) => \{[^}]*?const newSession: ChatSession = \{[^}]*?id: generateSessionId\(\),[^}]*?name: 'New Chat',[^}]*?messages: \[\],[^}]*?createdAt: Date\.now\(\),[^}]*?updatedAt: Date\.now\(\)[^}]*?\}[^}]*?chatStorage\.saveSession\(agentId, newSession\)[^}]*?setSessions\(prev => \[newSession, \.\.\.prev\]\)[^}]*?setActiveSessionId\(newSession\.id\)[^}]*?\}
'@
    
    $newHandleNewChat = @"
const handleNewChat = () => {
    const initialMessage: chatStorage.ChatMessage = {
      id: 'initial-0',
      role: 'assistant',
      content: "$greeting",
      timestamp: new Date(),
    };
    const newSession = chatStorage.createNewSession(agentId, initialMessage);
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };
"@
    
    $content = $content -replace $oldHandleNewChat, $newHandleNewChat
    
    # Fix handleDeleteChat
    $oldHandleDelete = @'
const handleDeleteChat = \(sessionId: string\) => \{[^}]*?chatStorage\.deleteSession\(agentId, sessionId\)[^}]*?const remainingSessions = sessions\.filter\(s => s\.id !== sessionId\)[^}]*?setSessions\(remainingSessions\)[^}]*?if \(activeSessionId === sessionId\) \{[^}]*?if \(remainingSessions\.length > 0\) \{[^}]*?setActiveSessionId\(remainingSessions\[0\]\.id\)[^}]*?\} else \{[^}]*?handleNewChat\(\)[^}]*?\}[^}]*?\}[^}]*?\}
'@
    
    $newHandleDelete = @"
const handleDeleteChat = (sessionId: string) => {
    chatStorage.deleteSession(agentId, sessionId);
    const remainingSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(remainingSessions);
    if (activeSessionId === sessionId) {
      setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
      if (remainingSessions.length === 0) {
        handleNewChat();
      }
    }
  };
"@
    
    $content = $content -replace $oldHandleDelete, $newHandleDelete
    
    # Fix handleRenameChat
    $oldHandleRename = @'
const handleRenameChat = \(sessionId: string, newName: string\) => \{[^}]*?const session = sessions\.find\(s => s\.id === sessionId\)[^}]*?if \(session\) \{[^}]*?const updatedSession = \{ \.\.\.session, name: newName, updatedAt: Date\.now\(\) \}[^}]*?chatStorage\.saveSession\(agentId, updatedSession\)[^}]*?setSessions\(prev => prev\.map\(s => s\.id === sessionId \? updatedSession : s\)\)[^}]*?\}[^}]*?\}
'@
    
    $newHandleRename = @"
const handleRenameChat = (sessionId: string, newName: string) => {
    chatStorage.renameSession(agentId, sessionId, newName);
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, name: newName } : s
    ));
  };
"@
    
    $content = $content -replace $oldHandleRename, $newHandleRename
    
    # Save the file
    Set-Content -Path $filePath -Value $content -NoNewline
    
    $fixedCount++
    Write-Host "✅ $agentId - Fixed successfully" -ForegroundColor Green
}

Write-Host "`n✨ Fixed $fixedCount/$($agents.Count) agent pages!`n" -ForegroundColor Magenta
