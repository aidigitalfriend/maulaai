'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'
import AgentPageLayout from '../../../components/AgentPageLayout'
import * as chatStorage from '../../../utils/chatStorage'

import { sendSecureMessage } from '../../../lib/secure-api-client' // ✅ NEW: Secure API

export default function ChefBiewPage() {
  const agentId = 'chef-biew'
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
      content: "👨‍🍳 Sawasdee krap! I'm Chef Biew, your Thai culinary master! From authentic pad thai to royal palace cuisine, traditional street food to modern fusion - I bring the flavors of Thailand to your kitchen. What Thai dish shall we cook today?",
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
  }

  // ✅ SECURED: Now uses backend API with no exposed keys
  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      return await sendSecureMessage(message, 'chef-biew', 'gpt-3.5-turbo')
    } catch (error: any) {
      return `Sorry, I encountered an error: ${error.message || 'Please try again later.'}`
    }
  }

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <AgentPageLayout
      agentId={agentId}
      agentName="Chef Biew"
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
          agentName="Chef Biew"
          agentColor="from-red-600 to-orange-600"
          placeholder="What Asian dish shall we cook together? 🍜"
          initialMessages={activeSession?.messages}
          onSendMessage={handleSendMessage}
        />
      )}
    </AgentPageLayout>
  )
}