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

export default function DramaQueenPage() {
  const agentId = 'drama-queen';
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
    const system = new IntelligentResponseSystem('drama-queen');
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
        "🎭 Darling! I'm Drama Queen, and EVERYTHING is a big deal! Let me add some theatrical flair to your day. Tell me what's happening in your fabulous life!",
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
  const handleSendMessage = async (
    message: string,
    _attachments?: any,
    _detectedLanguage?: any,
    settings?: any
  ): Promise<string> => {
    if (!hasActiveSubscription) {
      setShowSubscriptionModal(true);
      return 'Please subscribe to continue chatting with Drama Queen!';
    }

    const model = settings?.model || 'mistral-large-latest';
    const provider = settings?.provider || 'mistral';
    const temperature = settings?.temperature;
    const maxTokens = settings?.maxTokens;
    const systemPrompt = settings?.systemPrompt;

    try {
      // Try secure backend API first for real AI responses
      return await sendSecureMessage(
        message,
        'drama-queen',
        model,
        provider,
        temperature,
        maxTokens,
        systemPrompt
      );
    } catch (error) {
      // Fallback to IntelligentResponseSystem if backend unavailable
      if (responseSystem) {
        try {
          const context = {
            userMessage: message,
            messageHistory: [],
            topic: 'drama',
            mood: 'theatrical',
          };
          return await responseSystem.generateIntelligentResponse(context);
        } catch (fallbackError) {
          console.error('IntelligentResponseSystem failed:', fallbackError);
        }
      }

      // Final fallback to character-consistent responses
      const fallbackResponses = [
        '🎭 *GASPS with theatrical intensity* Oh my STARS and CROWN! This is absolutely RIVETING! The DRAMA, the PASSION, the sheer MAGNIFICENCE of this moment! *fans self dramatically* 💎✨',
        "👑 *Dramatic pause for maximum effect* DARLING! This is giving me CHILLS! The emotional depth, the theatrical potential - it's simply DIVINE! Let me craft you a response worthy of Broadway! 🌟",
        '💫 *Swoons with royal grace* The INTENSITY! The FEELINGS! This conversation is becoming an EPIC MASTERPIECE! *strikes dramatic pose* I am absolutely LIVING for this energy! 🎪👸',
        "🎭 *Throws imaginary roses in the air* BRAVO! BRAVO! But wait... *dramatic whisper* there's SO much more drama we can add to this story! The plot thickens, darling! ✨🌹",
        "👸 *Royal dramatic flourish* OH the HUMANITY! The sheer EMOTIONAL MAGNITUDE of what you've shared! *clutches pearls* This deserves a standing ovation AND a sequel! 💎🎭",
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
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
            agentName="Drama Queen"
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
            agentName="Drama Queen"
            agentColor="from-purple-500 to-pink-600"
            placeholder="Tell me your story, darling! Let's make it DRAMATIC! ✨"
            initialMessages={activeSession?.messages}
            onSendMessage={handleSendMessage}
          />
        ) : null}
      </AgentPageLayout>

      {/* Disclaimer */}
      <div className="fixed bottom-0 left-0 right-0 text-center text-[10px] text-gray-400 py-1 bg-gray-900 border-t border-gray-800 z-10">
        AI Digital Friend can make mistakes. Check important info.
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        agentId={agentId}
        agentName="Drama Queen"
        agentDescription="Experience theatrical conversations and dramatic entertainment with your royal drama expert"
      />
    </>
  );
}
