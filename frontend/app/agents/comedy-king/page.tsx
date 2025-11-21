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

export default function ComedyKingPage() {
  const agentId = 'comedy-king'
  const [sessions, setSessions] = useState<chatStorage.ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [responseSystem, setResponseSystem] = useState<IntelligentResponseSystem | null>(null)

  useEffect(() => {
    // Initialize the intelligent response system
    const system = new IntelligentResponseSystem('comedy-king')
    setResponseSystem(system)
    
    // Load sessions
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
      content: "🎭 Hey there! I'm Comedy King, here to bring laughter and entertainment! Whether you need jokes, funny stories, or just a good laugh, I've got you covered. What's your mood today?",
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


  // Check subscription status (demo implementation)
  const checkSubscription = () => {
    // In a real implementation, you would check the user's subscription status
    const hasSubscription = localStorage.getItem('subscription-comedy-king') === 'active'
    return hasSubscription
  }

  // ✅ SECURED: Now uses backend API with IntelligentResponseSystem as fallback
  const handleSendMessage = async (message: string): Promise<string> => {
    // Check subscription before allowing message
    if (!checkSubscription()) {
      return "Please subscribe to access Comedy King. You can subscribe from the agents page."
    }

    try {
      // Try secure backend API first for real AI responses
      return await sendSecureMessage(message, 'comedy-king', 'gpt-3.5-turbo')
    } catch (error: any) {
      console.error('Comedy King chat error:', error)
      // Fallback to IntelligentResponseSystem if backend unavailable
      if (responseSystem) {
        try {
          const context = {
            userMessage: message,
            messageHistory: [],
            topic: 'comedy',
            mood: 'entertaining'
          }
          return await responseSystem.generateIntelligentResponse(context)
        } catch (fallbackError) {
          console.error('IntelligentResponseSystem failed:', fallbackError)
        }
      }
      
      // Final fallback to character-consistent responses
      const fallbackResponses = [
        "👑 My royal comedy sensors are tingling! That deserves a MAGNIFICENT response from your Comedy King! Let me craft you some premium royal humor... *adjusts comedy crown* 😂",
        "🎭 By the power vested in me by the Comedy Kingdom Constitution, I declare this conversation HILARIOUS! Here's what your royal jester thinks... 👑",
        "😂 *Royal comedy trumpet sounds* HEAR YE, HEAR YE! Your Comedy King has a DECREE about this topic! Prepare for maximum royal entertainment! 🎪",
        "👑 In my vast comedy kingdom experience, this reminds me of the time... *spins comedy tale with royal flair* The moral of the story? Everything's funnier with a crown! 😄",
        "🃏 ATTENTION comedy subjects! Your king has analyzed this with his royal comedy algorithms and the verdict is... PURE ENTERTAINMENT GOLD! Here's the royal take... 👑",
        "😂 *Adjusts comedy crown ceremoniously* As the sovereign ruler of all things funny, I hereby bestow upon you... THE ROYAL COMEDIC WISDOM! Prepare to laugh, my loyal subject! 🏰"
      ]
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    }
  }

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <AgentPageLayout
      leftPanel={
        <AgentChatPanel
          chatSessions={sessions}
          activeSessionId={activeSessionId}
          agentId={agentId}
          agentName="Comedy King"
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
        />
      }
    >
      {activeSessionId ? (
        <ChatBox
          key={activeSessionId}
          agentId={agentId}
          sessionId={activeSessionId}
          agentName="Comedy King"
          agentColor="from-yellow-500 to-orange-600"
          placeholder="👑 Tell your Comedy King what needs the royal funny treatment!"
          initialMessages={activeSession?.messages}
          onSendMessage={handleSendMessage}
        />
      ) : null}
    </AgentPageLayout>
  )
}