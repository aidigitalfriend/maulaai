'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'
import AgentChatPanel from '../../../components/AgentChatPanel'
import AgentPageLayout from '../../../components/AgentPageLayout'
import * as chatStorage from '../../../utils/chatStorage'

import { sendSecureMessage } from '../../../lib/secure-api-client' // ✅ NEW: Secure API

export default function TechWizardPage() {
  const agentId = 'tech-wizard'
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
      content: "💻 Hey! I'm Tech Wizard, your technology expert! Whether it's coding, cloud tech, DevOps, or the latest in tech trends, I'm here to help. What tech challenge can I help you with?",
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
    // For now, we'll simulate subscription check
    const hasSubscription = localStorage.getItem('subscription-tech-wizard') === 'active'
    return hasSubscription
  }

  // ✅ SECURED: Now uses backend API with no exposed keys
  const handleSendMessage = async (message: string): Promise<string> => {
    // Check subscription before allowing message
    if (!checkSubscription()) {
      return "Please subscribe to access Tech Wizard. You can subscribe from the agents page."
    }
    
    try {
      // Use multiple fallback strategies for better reliability
      return await sendSecureMessage(message, 'tech-wizard', 'gpt-4')
    } catch (error: any) {
      console.error('Tech Wizard chat error:', error)
      // Fallback response if API fails
      return `I'm Tech Wizard! I'd love to help you with ${message.includes('code') ? 'coding' : message.includes('tech') ? 'technology' : 'your tech question'}, but I'm having trouble connecting to my AI brain right now. Please try again in a moment, or check if the backend server is running properly.`
    }
  }

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <AgentPageLayout
      agentId={agentId}
      agentName="Tech Wizard"
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
          agentName="Tech Wizard"
          agentColor="from-cyan-600 to-blue-700"
          placeholder="What tech magic do you need help with? 🧙‍♂️"
          initialMessages={activeSession?.messages}
          onSendMessage={handleSendMessage}
        />
      )}
    </AgentPageLayout>
  )
}