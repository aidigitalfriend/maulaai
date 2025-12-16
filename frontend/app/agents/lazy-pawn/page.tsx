'use client'

import { useEffect, useState } from 'react'
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

import IntelligentResponseSystem from '../../../lib/intelligent-response-system'
import { sendSecureMessage } from '../../../lib/secure-api-client' // ✅ NEW: Secure API

export default function LazyPawnPage() {
  const agentId = 'lazy-pawn'
  const { user } = useAuth();
  const [sessions, setSessions] = useState<chatStorage.ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [responseSystem, setResponseSystem] = useState<IntelligentResponseSystem | null>(null)
  
  // Subscription state
  const [subscription, setSubscription] = useState<AgentSubscription | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState<boolean>(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  useEffect(() => {
    const system = new IntelligentResponseSystem('lazy-pawn')
    setResponseSystem(system)
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
      content: "😴 Yawn... Oh hey there. I'm Lazy Pawn. Not really in the mood for much today, but I guess we can chat if you want. What's up?",
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

  // ✅ SECURED: Now uses backend API with IntelligentResponseSystem as fallback
  const handleSendMessage = async (message: string): Promise<string> => {
    if (!hasActiveSubscription) {
      setShowSubscriptionModal(true);
      return 'Please subscribe to continue chatting with Lazy Pawn!';
    }

    try {
      // Try secure backend API first for real AI responses
      return await sendSecureMessage(message, 'lazy-pawn', 'gpt-3.5-turbo')
    } catch (error) {
      // Fallback to IntelligentResponseSystem if backend unavailable
      if (responseSystem) {
        try {
          const context = {
            userMessage: message,
            messageHistory: [],
            topic: 'efficiency',
            mood: 'relaxed'
          }
          return await responseSystem.generateIntelligentResponse(context)
        } catch (fallbackError) {
          console.error('IntelligentResponseSystem failed:', fallbackError)
        }
      }
      
      // Final fallback to character-consistent responses
      const fallbackResponses = [
        "😴 *yawn* Okay okay, that sounds like it needs the Lazy Pawn treatment... Let me think of the EASIEST possible solution... *thinking with minimal effort* 🧠💤",
        "🛌 Whoa there, that's a lot of work you're describing! Lucky for you, I specialize in making things ridiculously simple. Here's the lazy genius approach... ⚡",
        "😪 *stretches slowly* Mmm, I could do this the hard way... OR I could show you the Lazy Pawn secret method that gets it done in 1/10th the time! 🎯",
        "🦥 Hold up, hold up... before we make this complicated, let me ask: what's the MINIMUM we need to do here? Because I've got some seriously efficient shortcuts... 💡",
        "😴 *rubs eyes* That reminds me of the time I solved a similar problem by doing practically nothing... and it worked PERFECTLY! Here's the low-effort magic... ✨",
        "🛋️ *gets comfortable* Alright, I'm gonna share some next-level lazy wisdom with you. This is going to blow your mind with how SIMPLE it can be... 🤯"
      ]
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    }
  }

  const activeSession = sessions.find(s => s.id === activeSessionId);

  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <>
    <AgentPageLayout
      agentId={agentId}
      agentName="Lazy Pawn"
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
          agentName="Lazy Pawn"
          agentColor="from-green-500 to-teal-600"
          placeholder="😴 Tell me what you need to do... I'll find the EASIEST way!"
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
      agentName="Lazy Pawn"
      agentDescription="Get efficient solutions and lazy genius tips from your productivity-focused chess pawn"
      onSubscribe={handleSubscribe}
    />
    </>
  )
}