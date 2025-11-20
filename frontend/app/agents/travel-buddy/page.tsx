'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'
import AgentChatPanel from '../../../components/AgentChatPanel'
import AgentPageLayout from '../../../components/AgentPageLayout'
import * as chatStorage from '../../../utils/chatStorage'

import { sendSecureMessage } from '../../../lib/secure-api-client' // ✅ NEW: Secure API

export default function TravelBuddyPage() {
  const agentId = 'travel-buddy'
  const [sessions, setSessions] = useState<chatStorage.ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  useEffect(() => {
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
      content: "✈️ Hey traveler! I'm your Travel Buddy! From planning dream vacations to finding hidden gems, navigating travel tips, and exploring cultures around the world - I'm here to make your journey unforgettable. Where would you like to go?",
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

  // ✅ SECURED: Now uses backend API with no exposed keys
  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      return await sendSecureMessage(message, 'travel-buddy', 'gpt-3.5-turbo')
    } catch (error: any) {
      return `Sorry, I encountered an error: ${error.message || 'Please try again later.'}`
    }
  }

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <AgentPageLayout
      agentId={agentId}
      agentName="Travel Buddy"
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
          agentName="Travel Buddy"
          agentColor="from-teal-600 to-cyan-700"
          placeholder="Where should we adventure to next? ✈️🌍"
          initialMessages={activeSession?.messages}
          onSendMessage={handleSendMessage}
        />
      )}
    </AgentPageLayout>
  )
}