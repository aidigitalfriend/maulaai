'use client';

import { useEffect, useState } from 'react';
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
import IntelligentResponseSystem from '../../../lib/intelligent-response-system';
import { sendSecureMessage } from '../../../lib/secure-api-client'; // ✅ NEW: Secure API

export default function ComedyKingPage() {
  const agentId = 'comedy-king';
  const { user } = useAuth();
  const [sessions, setSessions] = useState<chatStorage.ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [responseSystem, setResponseSystem] =
    useState<IntelligentResponseSystem | null>(null);

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

  useEffect(() => {
    // Initialize the intelligent response system
    const system = new IntelligentResponseSystem('comedy-king');
    setResponseSystem(system);
  }, []);

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
        "🎭 Hey there! I'm Comedy King, here to bring laughter and entertainment! Whether you need jokes, funny stories, or just a good laugh, I've got you covered. What's your mood today?",
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

  // ✅ SECURED: Now uses backend API with IntelligentResponseSystem as fallback
  const handleSendMessage = async (message: string): Promise<string> => {
    if (!hasActiveSubscription) {
      setShowSubscriptionModal(true);
      return 'Please subscribe to continue chatting with Comedy King!';
    }

    try {
      // Try secure backend API first for real AI responses
      return await sendSecureMessage(message, 'comedy-king', 'gpt-3.5-turbo');
    } catch (error: any) {
      console.error('Comedy King chat error:', error);
      // Fallback to IntelligentResponseSystem if backend unavailable
      if (responseSystem) {
        try {
          const context = {
            userMessage: message,
            messageHistory: [],
            topic: 'comedy',
            mood: 'entertaining',
          };
          return await responseSystem.generateIntelligentResponse(context);
        } catch (fallbackError) {
          console.error('IntelligentResponseSystem failed:', fallbackError);
        }
      }

      // Final fallback to character-consistent responses
      const fallbackResponses = [
        '👑 My royal comedy sensors are tingling! That deserves a MAGNIFICENT response from your Comedy King! Let me craft you some premium royal humor... *adjusts comedy crown* 😂',
        "🎭 By the power vested in me by the Comedy Kingdom Constitution, I declare this conversation HILARIOUS! Here's what your royal jester thinks... 👑",
        '😂 *Royal comedy trumpet sounds* HEAR YE, HEAR YE! Your Comedy King has a DECREE about this topic! Prepare for maximum royal entertainment! 🎪',
        "👑 In my vast comedy kingdom experience, this reminds me of the time... *spins comedy tale with royal flair* The moral of the story? Everything's funnier with a crown! 😄",
        "🃏 ATTENTION comedy subjects! Your king has analyzed this with his royal comedy algorithms and the verdict is... PURE ENTERTAINMENT GOLD! Here's the royal take... 👑",
        '😂 *Adjusts comedy crown ceremoniously* As the sovereign ruler of all things funny, I hereby bestow upon you... THE ROYAL COMEDIC WISDOM! Prepare to laugh, my loyal subject! 🏰',
      ];

      return fallbackResponses[
        Math.floor(Math.random() * fallbackResponses.length)
      ];
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <>
      <AgentPageLayout
        leftPanel={
          <AgentChatPanel
            chatSessions={sessions}
            activeSessionId={activeSessionId}
            agentId={agentId}
            agentName="Comedy King"
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
            onRenameChat={handleRenameChat}
          />
        }
      >
        {activeSessionId ? (
          <ChatBox
            key={activeSessionId}
            agentId={agentId}
            sessionId={activeSessionId}
            agentName="Comedy King"
            agentColor="from-yellow-500 to-orange-600"
            placeholder="👑 Tell your Comedy King what needs the royal funny treatment!"
            initialMessages={activeSession?.messages}
            onSendMessage={handleSendMessage}
          />
        ) : null}

        {/* Subscription Status */}
        {user && (
          <SubscriptionStatus
            subscription={subscription}
            agentName="Comedy King"
            onManage={handleSubscriptionManage}
          />
        )}
      </AgentPageLayout>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        agentId={agentId}
        agentName="Comedy King"
        agentDescription="Enjoy premium comedy and entertainment from your royal humor expert"
      />
    </>
  );
}
