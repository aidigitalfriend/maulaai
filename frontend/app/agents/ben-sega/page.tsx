'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'
import EnhancedAgentHeader from '../../../components/EnhancedAgentHeader'
import BenSegaChatPanel from '../../../components/BenSegaChatPanel'
import AgentPageLayout from '../../../components/AgentPageLayout'
import * as chatStorage from '../../../utils/chatStorage'
import { sendSecureMessage } from '../../../lib/secure-api-client' // ✅ NEW: Secure API

export default function BenSegaPage() {
  const agentId = "ben-sega";
  const [sessions, setSessions] = useState<chatStorage.ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

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
      content: "🕹️ Hey there, gamer! Welcome! I'm Ben Sega, your guide to the golden age of gaming. Whether you wanna talk about the Sega Genesis, the arcade classics, or just reminisce about the best games ever made, I'm here for it! What's your favorite retro game?",
      timestamp: new Date(),
    };
    const newSession = chatStorage.createNewSession(agentId, initialMessage);
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleSelectChat = (sessionId: string) => {
    setActiveSessionId(sessionId);
    // Also update the global active session ID
    const histories = chatStorage.getAllChatHistories ? chatStorage.getAllChatHistories() : {};
    if (histories[agentId]) {
      histories[agentId].activeSessionId = sessionId;
      if(chatStorage.saveAllChatHistories) chatStorage.saveAllChatHistories(histories);
    }
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
    setSessions(sessions.map(s => s.id === sessionId ? { ...s, name: newName } : s));
  };
  
  // ✅ SECURED: Now uses backend API with no exposed keys
  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      return await sendSecureMessage(message, 'ben-sega', 'gpt-3.5-turbo')
    } catch (error: any) {
      return `Sorry, I encountered an error: ${error.message || 'Please try again later.'}`
    }
  }

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <AgentPageLayout
      leftPanel={
        <BenSegaChatPanel
          chatSessions={sessions}
          activeSessionId={activeSessionId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={handleRenameChat}
        />
      }
    >
      {activeSessionId && (
        <ChatBox
          key={activeSessionId}
          agentId={agentId}
          sessionId={activeSessionId}
          agentName="Ben Sega"
          agentColor="from-indigo-500 to-purple-600"
          placeholder="What classic game brings back memories? 🕹️"
          initialMessages={activeSession?.messages}
          onSendMessage={handleSendMessage}
          allowFileUpload={false}
          enableLanguageDetection={false}
        />
      )}
    </AgentPageLayout>
  )
}