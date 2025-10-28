'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'
import AgentChatPanel from '../../../components/AgentChatPanel'
import * as chatStorage from '../../../utils/chatStorage'
import type { ChatSession } from '../../../utils/chatStorage'
import IntelligentResponseSystem from '../../../lib/intelligent-response-system'
import { sendSecureMessage } from '../../../lib/secure-api-client' // ✅ NEW: Secure API

// Helper function to generate session IDs
const generateSessionId = () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`export default function ComedyKingPage() {
  const agentId = 'comedy-king'
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>('')
  const [responseSystem, setResponseSystem] = useState<IntelligentResponseSystem | null>(null)

  useEffect(() => {
    // Initialize the intelligent response system
    const system = new IntelligentResponseSystem('comedy-king')
    setResponseSystem(system)
    
    // Load sessions
    const history = chatStorage.getAgentHistory(agentId)
    const sessionList = Object.values(history.sessions || {})
    
    if (sessionList.length === 0) {
      // Create initial session
      const initialSession: ChatSession = {
        id: generateSessionId(),
        name: 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      chatStorage.saveSession(agentId, initialSession)
      setSessions([initialSession])
      setActiveSessionId(initialSession.id)
    } else {
      setSessions(sessionList)
      setActiveSessionId(sessionList[0].id)
    }
  }, [])

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: generateSessionId(),
      name: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    chatStorage.saveSession(agentId, newSession)
    setSessions(prev => [newSession, ...prev])
    setActiveSessionId(newSession.id)
  }

  const handleSelectChat = (sessionId: string) => {
    setActiveSessionId(sessionId)
  }

  const handleDeleteChat = (sessionId: string) => {
    chatStorage.deleteSession(agentId, sessionId)
    const remainingSessions = sessions.filter(s => s.id !== sessionId)
    setSessions(remainingSessions)
    
    if (activeSessionId === sessionId) {
      if (remainingSessions.length > 0) {
        setActiveSessionId(remainingSessions[0].id)
      } else {
        handleNewChat()
      }
    }
  }

  const handleRenameChat = (sessionId: string, newName: string) => {
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      const updatedSession = { ...session, name: newName, updatedAt: Date.now() }
      chatStorage.saveSession(agentId, updatedSession)
      setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s))
    }
  }


  // ✅ SECURED: Now uses backend API with IntelligentResponseSystem as fallback
  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      // Try secure backend API first for real AI responses
      return await sendSecureMessage(message, 'comedy-king', 'gpt-3.5-turbo')
    } catch (error) {
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
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Main Content */}
      <div className="h-[85vh] flex gap-6 p-6 overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/4 flex flex-col h-full overflow-hidden">
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
        </div>

        {/* Right Panel (Chat) */}
        <div className="w-3/4 h-full flex flex-col">
          {activeSessionId && (
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
          )}
        </div>
      </div>
    </div>
  )
}