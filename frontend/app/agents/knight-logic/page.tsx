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

export default function KnightLogicPage() {
  const agentId = 'knight-logic';
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
        '⚔️ Greetings! I am Knight Logic, master of strategic thinking and logical problem-solving. Let us engage in thoughtful discourse and tackle challenges with wisdom and precision!',
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
      return 'Please subscribe to continue chatting with Knight Logic!';
    }

    try {
      return await sendSecureMessage(message, 'knight-logic', 'gpt-3.5-turbo');
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <>
      <AgentPageLayout
        agentId={agentId}
        agentName="Knight Logic"
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
            agentName="Knight Logic"
            agentColor="from-indigo-500 to-blue-600"
            placeholder="What problem needs unconventional thinking? 🐴"
            initialMessages={activeSession?.messages}
            onSendMessage={handleSendMessage}
          />
        ) : null}

        {/* Disclaimer */}
        <div className="text-center text-xs text-gray-500 py-3 border-t border-gray-200">
          AI Digital Friend can make mistakes. Check important info.
        </div>
      </AgentPageLayout>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        agentId={agentId}
        agentName="Knight Logic"
        agentDescription="Master strategic thinking and logical problem-solving with your chess knight strategist"
      />
    </>
  );
}
