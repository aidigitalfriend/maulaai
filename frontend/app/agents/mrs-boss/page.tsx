'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'
import AgentChatPanel from '../../../components/AgentChatPanel'
import AgentPageLayout from '../../../components/AgentPageLayout'
import * as chatStorage from '../../../utils/chatStorage'
import type { ChatSession } from '../../../utils/chatStorage'
// Helper function to generate session IDs
const generateSessionId = () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

import { sendSecureMessage } from '../../../lib/secure-api-client' // ✅ NEW: Secure API

export default function MrsBossPage() {
  const agentId = 'mrs-boss'
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>('')

  useEffect(() => {
    const history = chatStorage.getAgentHistory(agentId)
    const sessionList = Object.values(history.sessions || {})
    
    if (sessionList.length === 0) {
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
      return await sendSecureMessage(message, 'mrs-boss', 'gpt-3.5-turbo')
    } catch (error: any) {
      return `Sorry, I encountered an error: ${error.message || 'Please try again later.'}`
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
          agentName="Mrs Boss"
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
        />
      }
      rightPanel={
        activeSessionId ? (
          <ChatBox
            key={activeSessionId}
            agentId={agentId}
            sessionId={activeSessionId}
            agentName="Mrs Boss"
            agentColor="from-gray-600 to-slate-700"
            placeholder="What business challenge needs my attention? 👩‍💼"
            initialMessages={activeSession?.messages}
            onSendMessage={handleSendMessage}
          />
        ) : null
      }
    />
  )
}