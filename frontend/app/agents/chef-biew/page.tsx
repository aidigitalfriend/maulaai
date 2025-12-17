'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import ChatBox from '../../../components/ChatBox';
import AgentPageLayout from '../../../components/AgentPageLayout';
import SubscriptionModal from '../../../components/SubscriptionModal';
import SubscriptionStatus from '../../../components/SubscriptionStatus';
import * as chatStorage from '../../../utils/chatStorage';
import { sendSecureMessage } from '../../../lib/secure-api-client';
import { useAuth } from '../../../hooks/useAuth';
import {
  agentSubscriptionService,
  type AgentSubscription,
} from '../../../services/agentSubscriptionService';

export default function ChefBiewPage() {
  const agentId = 'chef-biew';
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
    } else {
      handleNewChat();
    }
  }, [hasActiveSubscription]);

  const handleNewChat = () => {
    if (!hasActiveSubscription) {
      setShowSubscriptionModal(true);
    }

    const initialMessage: chatStorage.ChatMessage = {
      id: 'initial-0',
      role: 'assistant',
      content:
        "👨‍🍳 Sawasdee krap! I'm Chef Biew, your Thai culinary master! From authentic pad thai to royal palace cuisine, traditional street food to modern fusion - I bring the flavors of Thailand to your kitchen. What Thai dish shall we cook today?",
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

  // Subscription handlers
  const handleSubscribe = async (plan: string) => {
    if (!user?.id) {
      throw new Error('Please log in to subscribe');
    }

    try {
      const newSubscription = await agentSubscriptionService.createSubscription(
        user.id,
        agentId,
        plan
      );
      setSubscription(newSubscription);
      setHasActiveSubscription(true);
      setShowSubscriptionModal(false);

      // Create initial chat session after successful subscription
      if (sessions.length === 0) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Subscription error:', error);
      throw error;
    }
  };

  const handleSubscriptionManage = () => {
    // For now, just show subscription modal for plan changes
    setShowSubscriptionModal(true);
  };

  // ✅ SECURED: Now uses backend API with no exposed keys
  const handleSendMessage = async (message: string): Promise<string> => {
    if (!hasActiveSubscription) {
      setShowSubscriptionModal(true);
      return 'Please subscribe to continue chatting with Chef Biew!';
    }

    try {
      return await sendSecureMessage(message, 'chef-biew', 'gpt-3.5-turbo');
    } catch (error: any) {
      return `Sorry, I encountered an error: ${
        error.message || 'Please try again later.'
      }`;
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Show loading state
  if (subscriptionLoading) {
    return (
      <AgentPageLayout
        agentId={agentId}
        agentName="Chef Biew"
        sessions={[]}
        activeSessionId={null}
        onNewChat={() => {}}
        onSelectChat={() => {}}
        onDeleteChat={() => {}}
        onRenameChat={() => {}}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking subscription status...</p>
          </div>
        </div>
      </AgentPageLayout>
    );
  }

  return (
    <>
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

      {/* Disclaimer */}
      <div className="fixed bottom-0 left-0 right-0 text-center text-[10px] text-gray-400 py-1 bg-gray-900 border-t border-gray-800 z-10"></div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        agentId={agentId}
        agentName="Chef Biew"
        agentDescription="Master authentic Thai cuisine with Chef Biew, from street food to royal palace dishes"
        onSubscribe={handleSubscribe}
      />
    </>
  );
}
