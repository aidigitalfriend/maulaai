'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'
import AgentChatPanel from '../../../components/AgentChatPanel'
import * as chatStorage from '../../../utils/chatStorage'

import { sendSecureMessage } from '../../../lib/secure-api-client' // ✅ NEW: Secure API

export default function RookJokeyPage() {
  const agentId = 'rook-jokey'
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
      content: "🃏 Well hello there! Rook Jokey at your service! Ready for some laughs, witty banter, and clever wordplay? Let's have some fun!",
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
      return await sendSecureMessage(message, 'rook-jokey', 'gpt-3.5-turbo')
    } catch (error: any) {
      return `Sorry, I encountered an error: ${error.message || 'Please try again later.'}`
    }
  }

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      <div className="h-[85vh] flex gap-6 p-6 overflow-hidden">
        <div className="w-1/4 flex flex-col h-full overflow-hidden">
          <AgentChatPanel
            chatSessions={sessions}
            activeSessionId={activeSessionId}
            agentId={agentId}
            agentName="Rook Jokey"
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
            onRenameChat={handleRenameChat}
          />
        </div>
        <div className="w-3/4 h-full flex flex-col">
          {activeSessionId && (
            <ChatBox
              key={activeSessionId}
              agentId={agentId}
              sessionId={activeSessionId}
              agentName="Rook Jokey"
              agentColor="from-red-500 to-rose-600"
              placeholder="Need some straight talk with humor? 🏰"
              initialMessages={activeSession?.messages}
              onSendMessage={handleSendMessage}
            />
          )}
        </div>
      </div>
    </div>
  )
}