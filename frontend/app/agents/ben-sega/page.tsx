'use client';

import { useState, useEffect } from 'react';
import ChatBox from '../../../components/ChatBox';
import EnhancedAgentHeader from '../../../components/EnhancedAgentHeader';
import BenSegaChatPanel from '../../../components/BenSegaChatPanel';
import AgentPageLayout from '../../../components/AgentPageLayout';
import * as chatStorage from '../../../utils/chatStorage';
import { sendSecureMessage } from '../../../lib/secure-api-client'; // ✅ NEW: Secure API
import { useAuth } from '../../../hooks/useAuth';

export default function BenSegaPage() {
  const agentId = 'ben-sega';
  const { user } = useAuth();
  const [sessions, setSessions] = useState<chatStorage.ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Load chat sessions
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
      content:
        "🕹️ Hey there, gamer! Welcome! I'm Ben Sega, your guide to the golden age of gaming. Whether you wanna talk about the Sega Genesis, the arcade classics, or just reminisce about the best games ever made, I'm here for it! What's your favorite retro game?",
      timestamp: new Date(),
    };
    const newSession = chatStorage.createNewSession(agentId, initialMessage);
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleSelectChat = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  const handleDeleteChat = (sessionId: string) => {
    chatStorage.deleteSession(agentId, sessionId);
    const remainingSessions = sessions.filter((s) => s.id !== sessionId);
    setSessions(remainingSessions);
    if (activeSessionId === sessionId) {
      setActiveSessionId(
        remainingSessions.length > 0 ? remainingSessions[0].id : null
      );
      if (remainingSessions.length === 0) {
        handleNewChat();
      }
    }
  };

  const handleRenameChat = (sessionId: string, newName: string) => {
    chatStorage.renameSession(agentId, sessionId, newName);
    setSessions(
      sessions.map((s) => (s.id === sessionId ? { ...s, name: newName } : s))
    );
  };

  // ✅ SECURED: Now uses backend API with no exposed keys
  const handleSendMessage = async (
    message: string,
    _attachments?: any,
    _detectedLanguage?: any,
    settings?: any
  ): Promise<string> => {
    const model = settings?.model || 'claude-3-5-sonnet-20241022';
    const provider = settings?.provider || 'anthropic';
    const temperature = settings?.temperature;
    const maxTokens = settings?.maxTokens;
    const systemPrompt = settings?.systemPrompt;

    try {
      return await sendSecureMessage(
        message,
        'ben-sega',
        model,
        provider,
        temperature,
        maxTokens,
        systemPrompt
      );
    } catch (error: any) {
      return `Sorry, I encountered an error: ${
        error.message || 'Please try again later.'
      }`;
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <>
      <AgentPageLayout
        leftPanel={
          <div>
            <BenSegaChatPanel
              chatSessions={sessions}
              activeSessionId={activeSessionId}
              onNewChat={handleNewChat}
              onSelectChat={handleSelectChat}
              onDeleteChat={handleDeleteChat}
              onRenameChat={handleRenameChat}
            />
          </div>
        }
      >
        {/* Chat Area */}
        {activeSessionId ? (
          /* Active Subscription - Show Chat */
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
        ) : (
          /* No Active Session */
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <p className="text-gray-600 mb-4">No chat sessions yet.</p>
              <button
                onClick={handleNewChat}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </AgentPageLayout>
    </>
  );
}
