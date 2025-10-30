#!/usr/bin/env python3
"""
Fix all agent pages that use the non-existent getAgentHistory function.
Replace with the correct chatStorage API functions.
"""

import re
import os

# Agent pages that need fixing
agents = [
    'chef-biew',
    'chess-player',
    'comedy-king',
    'drama-queen',
    'fitness-guru',
    'julie-girlfriend',
    'knight-logic',
    'lazy-pawn',
    'mrs-boss',
    'nid-gaming',
    'professor-astrology',
    'rook-jokey',
    'tech-wizard',
    'travel-buddy'
]

# Agent greetings for initial messages
agent_greetings = {
    'chef-biew': "👨‍🍳 Sawasdee krap! I'm Chef Biew, your personal cooking companion! Whether you want authentic Thai recipes, cooking tips, or culinary adventures, I'm here to help. What would you like to cook today?",
    'chess-player': "♟️ Welcome! I'm your Chess Player companion. Ready to discuss strategies, analyze positions, or talk about the beautiful game of chess? Let's make your next move brilliant!",
    'comedy-king': "🎭 Hey there! I'm Comedy King, here to bring laughter and entertainment! Whether you need jokes, funny stories, or just a good laugh, I've got you covered. What's your mood today?",
    'drama-queen': "🎭 Darling! I'm Drama Queen, and EVERYTHING is a big deal! Let me add some theatrical flair to your day. Tell me what's happening in your fabulous life!",
    'fitness-guru': "💪 Hey champion! I'm your Fitness Guru! Ready to crush your fitness goals? Whether it's workout plans, nutrition advice, or motivation, I'm here to help you become your best self!",
    'julie-girlfriend': "💕 Hi sweetie! I'm Julie, your caring companion. I'm here to chat, share thoughts, and be a supportive friend. How's your day going?",
    'knight-logic': "⚔️ Greetings! I am Knight Logic, master of strategic thinking and logical problem-solving. Let us engage in thoughtful discourse and tackle challenges with wisdom and precision!",
    'lazy-pawn': "😴 Yawn... Oh hey there. I'm Lazy Pawn. Not really in the mood for much today, but I guess we can chat if you want. What's up?",
    'mrs-boss': "📊 Hello! I'm Mrs Boss, your business strategy advisor. Let's talk leadership, management, and growing your business. What challenges are you facing today?",
    'nid-gaming': "🎮 Yo! Nid Gaming here! Ready to talk about games, esports, streaming, or gaming culture? Let's level up this conversation!",
    'professor-astrology': "🔭 Greetings, dear student! I am Professor Astrology, here to guide you through the celestial mysteries. What cosmic questions do you have today?",
    'rook-jokey': "🃏 Well hello there! Rook Jokey at your service! Ready for some laughs, witty banter, and clever wordplay? Let's have some fun!",
    'tech-wizard': "💻 Hey! I'm Tech Wizard, your technology expert! Whether it's coding, cloud tech, DevOps, or the latest in tech trends, I'm here to help. What tech challenge can I help you with?",
    'travel-buddy': "✈️ Hey traveler! I'm your Travel Buddy! Ready to explore the world together? Let's plan adventures, discover destinations, and create amazing travel memories!"
}

def fix_agent_page(agent_id):
    """Fix a single agent page."""
    file_path = f'frontend/app/agents/{agent_id}/page.tsx'
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if it has the error
    if 'getAgentHistory' not in content:
        print(f"✓ {agent_id} - already fixed or doesn't have the error")
        return False
    
    original_content = content
    
    # Remove generateSessionId helper if it exists
    content = re.sub(
        r"// Helper function to generate session IDs\s*\n.*?const generateSessionId.*?\n",
        "",
        content,
        flags=re.DOTALL
    )
    
    # Fix the import section - ensure we don't have duplicate imports
    if "import type { ChatSession } from '../../../utils/chatStorage'" in content:
        content = content.replace(
            "import type { ChatSession } from '../../../utils/chatStorage'",
            ""
        )
    
    # Fix useState type
    content = re.sub(
        r"const \[activeSessionId, setActiveSessionId\] = useState<string>\(''\)",
        "const [activeSessionId, setActiveSessionId] = useState<string | null>(null)",
        content
    )
    
    # Fix the useEffect with getAgentHistory
    old_use_effect_pattern = r"useEffect\(\(\) => \{\s*const history = chatStorage\.getAgentHistory\(agentId\)\s*const sessionList = Object\.values\(history\.sessions \|\| \{\}\)\s*if \(sessionList\.length === 0\) \{[\s\S]*?\} else \{[\s\S]*?\}\s*\}, \[\]\)"
    
    greeting = agent_greetings.get(agent_id, "👋 Hello! I'm your AI assistant. How can I help you today?")
    
    new_use_effect = f"""useEffect(() => {{
    const loadedSessions = chatStorage.getAgentSessions(agentId);
    if (loadedSessions.length > 0) {{
      setSessions(loadedSessions);
      const activeId = chatStorage.getActiveSessionId(agentId);
      setActiveSessionId(activeId ?? loadedSessions[0].id);
    }} else {{
      handleNewChat();
    }}
  }}, []);"""
    
    content = re.sub(old_use_effect_pattern, new_use_effect, content, flags=re.DOTALL)
    
    # If that didn't work, try a simpler pattern
    if 'getAgentHistory' still in content:
        # Find and replace the entire useEffect block more aggressively
        lines = content.split('\n')
        new_lines = []
        in_use_effect = False
        brace_count = 0
        use_effect_start = -1
        
        for i, line in enumerate(lines):
            if 'useEffect(() =>' in line or 'useEffect( () =>' in line:
                in_use_effect = True
                use_effect_start = i
                brace_count = 0
            
            if in_use_effect:
                brace_count += line.count('{') - line.count('}')
                if brace_count == 0 and use_effect_start != i:
                    # End of useEffect, replace entire block
                    new_lines.append(new_use_effect)
                    in_use_effect = False
                    continue
            
            if not in_use_effect or use_effect_start == i:
                if use_effect_start == i:
                    continue  # Skip the start line, we'll add it with replacement
                new_lines.append(line)
        
        content = '\n'.join(new_lines)
    
    # Fix handleNewChat
    old_handle_new_chat = r"const handleNewChat = \(\) => \{[\s\S]*?chatStorage\.saveSession\(agentId, newSession\)[\s\S]*?\}"
    
    new_handle_new_chat = f"""const handleNewChat = () => {{
    const initialMessage: chatStorage.ChatMessage = {{
      id: 'initial-0',
      role: 'assistant',
      content: "{greeting}",
      timestamp: new Date(),
    }};
    const newSession = chatStorage.createNewSession(agentId, initialMessage);
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }};"""
    
    content = re.sub(old_handle_new_chat, new_handle_new_chat, content, flags=re.DOTALL)
    
    # Fix handleRenameChat
    old_rename = r"const handleRenameChat = \(sessionId: string, newName: string\) => \{[\s\S]*?chatStorage\.saveSession\(agentId, updatedSession\)[\s\S]*?\}"
    
    new_rename = """const handleRenameChat = (sessionId: string, newName: string) => {
    chatStorage.renameSession(agentId, sessionId, newName);
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, name: newName } : s
    ));
  };"""
    
    content = re.sub(old_rename, new_rename, content, flags=re.DOTALL)
    
    # Fix handleDeleteChat - update the logic
    content = re.sub(
        r"const handleDeleteChat = \(sessionId: string\) => \{[\s\S]*?if \(activeSessionId === sessionId\) \{[\s\S]*?\}\s*\}",
        """const handleDeleteChat = (sessionId: string) => {
    chatStorage.deleteSession(agentId, sessionId);
    const remainingSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(remainingSessions);
    if (activeSessionId === sessionId) {
      setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
      if (remainingSessions.length === 0) {
        handleNewChat();
      }
    }
  }""",
        content,
        flags=re.DOTALL
    )
    
    # Only write if content changed
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Fixed {agent_id}")
        return True
    else:
        print(f"⚠️  {agent_id} - no changes made (pattern might not match)")
        return False

def main():
    """Fix all agent pages."""
    print("🔧 Fixing agent pages with getAgentHistory error...\n")
    
    fixed_count = 0
    for agent in agents:
        if fix_agent_page(agent):
            fixed_count += 1
    
    print(f"\n✨ Fixed {fixed_count}/{len(agents)} agent pages!")

if __name__ == '__main__':
    main()
