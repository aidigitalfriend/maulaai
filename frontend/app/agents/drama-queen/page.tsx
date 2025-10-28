'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'
import AgentChatPanel from '../../../components/AgentChatPanel'
import * as chatStorage from '../../../utils/chatStorage'
import type { ChatSession } from '../../../utils/chatStorage'
// Helper function to generate session IDs
const generateSessionId = () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
import IntelligentResponseSystem from '../../../lib/intelligent-response-system'
import { sendSecureMessage } from '../../../lib/secure-api-client' // ✅ NEW: Secure API

export default function DramaQueenPage() {
  const agentId = 'drama-queen'
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>('')
  const [responseSystem, setResponseSystem] = useState<IntelligentResponseSystem | null>(null)

  useEffect(() => {
    // Initialize the intelligent response system
    const system = new IntelligentResponseSystem('drama-queen')
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
      return await sendSecureMessage(message, 'drama-queen', 'gpt-3.5-turbo')
    } catch (error) {
      // Fallback to IntelligentResponseSystem if backend unavailable
      if (responseSystem) {
        try {
          const context = {
            userMessage: message,
            messageHistory: [],
            topic: 'drama',
            mood: 'theatrical'
          }
          return await responseSystem.generateIntelligentResponse(context)
        } catch (fallbackError) {
          console.error('IntelligentResponseSystem failed:', fallbackError)
        }
      }
      
      // Final fallback to character-consistent responses
      const fallbackResponses = [
        "🎭 *GASPS with theatrical intensity* Oh my STARS and CROWN! This is absolutely RIVETING! The DRAMA, the PASSION, the sheer MAGNIFICENCE of this moment! *fans self dramatically* 💎✨",
        "👑 *Dramatic pause for maximum effect* DARLING! This is giving me CHILLS! The emotional depth, the theatrical potential - it's simply DIVINE! Let me craft you a response worthy of Broadway! 🌟",
        "💫 *Swoons with royal grace* The INTENSITY! The FEELINGS! This conversation is becoming an EPIC MASTERPIECE! *strikes dramatic pose* I am absolutely LIVING for this energy! 🎪👸",
        "🎭 *Throws imaginary roses in the air* BRAVO! BRAVO! But wait... *dramatic whisper* there's SO much more drama we can add to this story! The plot thickens, darling! ✨🌹",
        "👸 *Royal dramatic flourish* OH the HUMANITY! The sheer EMOTIONAL MAGNITUDE of what you've shared! *clutches pearls* This deserves a standing ovation AND a sequel! 💎🎭"
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
            agentName="Drama Queen"
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
              agentName="Drama Queen"
              agentColor="from-purple-500 to-pink-600"
              placeholder="Tell me your story, darling! Let's make it DRAMATIC! ✨"
              initialMessages={activeSession?.messages}
              onSendMessage={handleSendMessage}
            />
          )}
        </div>
      </div>
    </div>
  )
}