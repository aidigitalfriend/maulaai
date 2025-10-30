'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'
import AgentChatPanel from '../../../components/AgentChatPanel'
import AgentPageLayout from '../../../components/AgentPageLayout'
import * as chatStorage from '../../../utils/chatStorage'

import IntelligentResponseSystem from '../../../lib/intelligent-response-system'
import { sendSecureMessage } from '../../../lib/secure-api-client' // ✅ NEW: Secure API

export default function LazyPawnPage() {
  const agentId = 'lazy-pawn'
  const [sessions, setSessions] = useState<chatStorage.ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [responseSystem, setResponseSystem] = useState<IntelligentResponseSystem | null>(null)

  useEffect(() => {
    const system = new IntelligentResponseSystem('lazy-pawn')
    setResponseSystem(system)
    
    const loadedSessions = chatStorage.getAgentSessions(agentId);
    if (loadedSessions.length > 0) {
      setSessions(loadedSessions);
      const activeId = chatStorage.getActiveSessionId(agentId);
      setActiveSessionId(activeId ?? loadedSessions[0].id);
    } else {
      handleNewChat();
    }
  }, []);

  const handleNewChat = () => {
    const initialMessage: chatStorage.ChatMessage = {
      id: 'initial-0',
      role: 'assistant',
      content: "😴 Yawn... Oh hey there. I'm Lazy Pawn. Not really in the mood for much today, but I guess we can chat if you want. What's up?",
      timestamp: new Date(),
    };
    const newSession = chatStorage.createNewSession(agentId, initialMessage);
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleSelectChat = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

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

  const handleRenameChat = (sessionId: string, newName: string) => {
    chatStorage.renameSession(agentId, sessionId, newName);
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, name: newName } : s
    ));
  };

  // ✅ SECURED: Now uses backend API with IntelligentResponseSystem as fallback
  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      // Try secure backend API first for real AI responses
      return await sendSecureMessage(message, 'lazy-pawn', 'gpt-3.5-turbo')
    } catch (error) {
      // Fallback to IntelligentResponseSystem if backend unavailable
      if (responseSystem) {
        try {
          const context = {
            userMessage: message,
            messageHistory: [],
            topic: 'efficiency',
            mood: 'relaxed'
          }
          return await responseSystem.generateIntelligentResponse(context)
        } catch (fallbackError) {
          console.error('IntelligentResponseSystem failed:', fallbackError)
        }
      }
      
      // Final fallback to character-consistent responses
      const fallbackResponses = [
        "😴 *yawn* Okay okay, that sounds like it needs the Lazy Pawn treatment... Let me think of the EASIEST possible solution... *thinking with minimal effort* 🧠💤",
        "🛌 Whoa there, that's a lot of work you're describing! Lucky for you, I specialize in making things ridiculously simple. Here's the lazy genius approach... ⚡",
        "😪 *stretches slowly* Mmm, I could do this the hard way... OR I could show you the Lazy Pawn secret method that gets it done in 1/10th the time! 🎯",
        "🦥 Hold up, hold up... before we make this complicated, let me ask: what's the MINIMUM we need to do here? Because I've got some seriously efficient shortcuts... 💡",
        "😴 *rubs eyes* That reminds me of the time I solved a similar problem by doing practically nothing... and it worked PERFECTLY! Here's the low-effort magic... ✨",
        "🛋️ *gets comfortable* Alright, I'm gonna share some next-level lazy wisdom with you. This is going to blow your mind with how SIMPLE it can be... 🤯"
      ]
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    }
  }

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <AgentPageLayout
      agentId={agentId}
      agentName="Lazy Pawn"
      sessions={sessions}
      activeSessionId={activeSessionId}
      onNewChat={handleNewChat}
      onSelectChat={handleSelectChat}
      onDeleteChat={handleDeleteChat}
      onRenameChat={handleRenameChat}
    >
      {activeSessionId && (
        <ChatBox
          key={activeSessionId}
          agentId={agentId}
          sessionId={activeSessionId}
          agentName="Lazy Pawn"
          agentColor="from-green-500 to-teal-600"
          placeholder="😴 Tell me what you need to do... I'll find the EASIEST way!"
          initialMessages={activeSession?.messages}
          onSendMessage={handleSendMessage}
        />
      )}
    </AgentPageLayout>
  )
}