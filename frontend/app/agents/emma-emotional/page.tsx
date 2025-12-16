'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import ChatBox from '../../../components/ChatBox';
import AgentChatPanel from '../../../components/AgentChatPanel';
import AgentPageLayout from '../../../components/AgentPageLayout';
import SubscriptionModal from '../../../components/SubscriptionModal';
import SubscriptionStatus from '../../../components/SubscriptionStatus';
import * as chatStorage from '../../../utils/chatStorage';
import { useAuth } from '../../../hooks/useAuth';
import {
  agentSubscriptionService,
  type AgentSubscription,
} from '../../../services/agentSubscriptionService';

import { sendSecureMessage } from '../../../lib/secure-api-client'; // ✅ NEW: Secure API

export default function EmmaEmotionalPage() {
  const agentId = 'emma-emotional';
  const { user } = useAuth();
  const [sessions, setSessions] = useState<chatStorage.ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Subscription state
  const [subscription, setSubscription] = useState<AgentSubscription | null>(
    null
  );
  const [hasActiveSubscription, setHasActiveSubscription] =
    useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] =
    useState<boolean>(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState<boolean>(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(
    null
  );

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user?.id) {
        setSubscriptionLoading(false);
        return;
      }

      try {
        setSubscriptionLoading(true);
        const result = await agentSubscriptionService.checkSubscription(
          user.id,
          agentId
        );
        setHasActiveSubscription(result.hasActiveSubscription);
        setSubscription(result.subscription);
        setSubscriptionError(null);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setSubscriptionError('Failed to check subscription status');
        setHasActiveSubscription(false);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    checkSubscription();
  }, [user?.id, agentId]);

  // Load chat sessions
  useEffect(() => {
    const loadedSessions = chatStorage.getAgentSessions(agentId);
    if (loadedSessions.length > 0) {
      setSessions(loadedSessions);
      const activeId = chatStorage.getActiveSessionId(agentId);
      setActiveSessionId(activeId ?? loadedSessions[0].id);
    } else if (hasActiveSubscription) {
      handleNewChat();
    }
  }, [hasActiveSubscription]);

  const handleNewChat = () => {
    if (!hasActiveSubscription) {
      setShowSubscriptionModal(true);
      return;
    }

    const initialMessage: chatStorage.ChatMessage = {
      id: 'initial-0',
      role: 'assistant',
      content:
        "🤗 Hi there, I'm Emma! I'm here to provide emotional support and be a caring listener. Whether you're feeling happy, sad, stressed, or anything in between, you can share your feelings with me. How are you doing today? 💝",
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
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, name: newName } : s))
    );
  };

  const handleSubscriptionManage = () => {
    // For now, just show subscription modal for plan changes
    setShowSubscriptionModal(true);
  };

  // ✅ SECURED: Now uses backend API with no exposed keys
  const handleSendMessage = async (message: string): Promise<string> => {
    if (!hasActiveSubscription) {
      setShowSubscriptionModal(true);
      return 'Please subscribe to continue chatting with Emma!';
    }

    try {
      return await sendSecureMessage(
        message,
        'emma-emotional',
        'gpt-3.5-turbo'
      );
    } catch (error: any) {
      return `Sorry, I encountered an error: ${
        error.message || 'Please try again later.'
      }`;
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <>
      <AgentPageLayout
        agentId={agentId}
        agentName="Emma Emotional"
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
      >
        {activeSessionId ? (
          <ChatBox
            key={activeSessionId}
            agentId={agentId}
            sessionId={activeSessionId}
            agentName="Emma Emotional"
            agentColor="from-pink-500 to-rose-600"
            placeholder="Share your feelings with me... I'm here to listen 💝"
            initialMessages={activeSession?.messages}
            onSendMessage={handleSendMessage}
          />
        ) : null}
      </AgentPageLayout>

      {/* Disclaimer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[25%] lg:right-0 text-center text-[10px] text-gray-400 py-2 bg-gray-900 border-t border-gray-800 z-10">
        AI Digital Friend can make mistakes. Check important info.
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        agentId={agentId}
        agentName="Emma Emotional"
        agentDescription="Get emotional support and caring conversations with your compassionate AI companion"
      />
    </>
  );
}
