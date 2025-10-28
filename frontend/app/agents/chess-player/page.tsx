'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'
import AgentChatPanel from '../../../components/AgentChatPanel'
import { chatStorage, generateSessionId } from '../../../components/BenSegaChatPanel'
import type { ChatSession } from '../../../components/BenSegaChatPanel'
import { sendSecureMessage } from '../../../lib/secure-api-client' // ✅ NEW: Secure API

export default function ChessPlayerPage() {
  const agentId = 'chess-player'
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>('')

  // Load sessions on mount
  useEffect(() => {
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

  // ✅ SECURED: Now uses backend API with no exposed keys
  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      return await sendSecureMessage(message, 'chess-player', 'gpt-3.5-turbo')
    } catch (error: any) {
      return `Sorry, I encountered an error: ${error.message || 'Please try again later.'}`
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
            agentName="Grandmaster Chess"
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
              agentName="Grandmaster Chess"
              agentColor="from-slate-500 to-gray-600"
              placeholder="Ask about strategy, chess moves, or tactical thinking..."
              initialMessages={activeSession?.messages}
              onSendMessage={handleSendMessage}
            />
          )}
        </div>
      </div>
    </div>
  )
}