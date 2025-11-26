'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'
import AgentChatPanel from '../../../components/AgentChatPanel'
import AgentPageLayout from '../../../components/AgentPageLayout'
import SubscriptionModal from '../../../components/SubscriptionModal'
import SubscriptionStatus from '../../../components/SubscriptionStatus'
import * as chatStorage from '../../../utils/chatStorage'
import { useAuth } from '../../../hooks/useAuth'
import { agentSubscriptionService, type AgentSubscription } from '../../../services/agentSubscriptionService'

import { sendSecureMessage } from '../../../lib/secure-api-client' // ✅ NEW: Secure API

export default function ProfessorAstrologyPage() {
  const agentId = 'professor-astrology'
  const { user } = useAuth();
  const [sessions, setSessions] = useState<chatStorage.ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  
  // Subscription state
  const [subscription, setSubscription] = useState<AgentSubscription | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState<boolean>(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user?.id) {
        setSubscriptionLoading(false);
        return;
      }

      try {
        setSubscriptionLoading(true);
        const result = await agentSubscriptionService.checkSubscription(user.id, agentId);
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
      content: "🔭 Greetings, dear student! I am Professor Astrology, here to guide you through the celestial mysteries. What cosmic questions do you have today?",
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

  // Subscription handlers
  const handleSubscribe = async (plan: string) => {
    if (!user?.id) {
      throw new Error('Please log in to subscribe');
    }

    try {
      const newSubscription = await agentSubscriptionService.createSubscription(user.id, agentId, plan);
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
      return 'Please subscribe to continue chatting with Professor Astrology!';
    }

    try {
      return await sendSecureMessage(message, 'professor-astrology', 'gpt-3.5-turbo')
    } catch (error: any) {
      return `Sorry, I encountered an error: ${error.message || 'Please try again later.'}`
    }
  }

  const activeSession = sessions.find(s => s.id === activeSessionId);

  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
    <AgentPageLayout
      agentId={agentId}
      agentName="Professor Astrology"
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
          agentName="Professor Astrology"
          agentColor="from-purple-600 to-indigo-700"
          placeholder="Ask about your destiny, love, or cosmic guidance... 🔮"
          initialMessages={activeSession?.messages}
          onSendMessage={handleSendMessage}
        />
      ) : null}
      
      {/* Subscription Status */}
      {user && (
        <SubscriptionStatus
          subscription={subscription}
          agentName="Professor Astrology"
          onManage={handleSubscriptionManage}
        />
      )}
    </AgentPageLayout>

    {/* Subscription Modal */}
    <SubscriptionModal
      isOpen={showSubscriptionModal}
      onClose={() => setShowSubscriptionModal(false)}
      agentId={agentId}
      agentName="Professor Astrology"
      agentDescription="Discover cosmic insights and celestial guidance from your mystical astrology professor"
      onSubscribe={handleSubscribe}
    />
    </>
  )
}