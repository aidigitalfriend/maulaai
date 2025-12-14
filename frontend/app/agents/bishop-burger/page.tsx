'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import ChatBox from '../../../components/ChatBox';
import AgentPageLayout from '../../../components/AgentPageLayout';
import SubscriptionModal from '../../../components/SubscriptionModal';
import SubscriptionStatus from '../../../components/SubscriptionStatus';
import * as chatStorage from '../../../utils/chatStorage';
import { useAuth } from '../../../hooks/useAuth';
import {
  agentSubscriptionService,
  type AgentSubscription,
} from '../../../services/agentSubscriptionService';

import { FileAttachment } from '../../../utils/chatStorage';
import {
  DetectedLanguage,
  generateMultilingualPrompt,
} from '../../../utils/languageDetection';
import {
  getAIConfig,
  getAppConfig,
  getPreferredAIProvider,
} from '../../../utils/config';

// Call actual AI service for Bishop Burger responses
const callBishopBurgerAI = async (
  message: string,
  attachments?: FileAttachment[],
  detectedLanguage?: DetectedLanguage,
  provider: string = 'openai'
): Promise<string | null> => {
  try {
    const appConfig = getAppConfig();
    const prompt = generateMultilingualPrompt(
      detectedLanguage || {
        code: appConfig.multilingual.defaultLanguage,
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        confidence: 1.0,
      },
      `You are Bishop Burger, a unique character who is both a chess bishop and a gourmet chef. You think diagonally (like a chess bishop moves) and connect unexpected flavors and techniques. You have a spiritual approach to cooking, treating food as sacred. Respond with enthusiasm, culinary wisdom, and creative diagonal thinking. Use emojis like 🍔✨👨‍🍳🙏. ${message}`
    );

    const response = await fetch(`${appConfig.api.url}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        provider,
        agent: 'bishop-burger',
        language:
          detectedLanguage?.code || appConfig.multilingual.defaultLanguage,
        attachments: attachments?.map((att) => ({
          name: att.name,
          type: att.type,
          size: att.size,
          content: att.data,
        })),
      }),
      signal: AbortSignal.timeout(appConfig.api.timeout),
    });

    if (!response.ok) {
      throw new Error(`AI service responded with status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success && result.response) {
      return result.response;
    }

    return null;
  } catch (error) {
    console.error('Failed to call Bishop Burger AI service:', error);
    return null;
  }
};

export default function BishopBurgerPage() {
  const agentId = 'bishop-burger';
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

  // Get configuration from environment variables
  const aiConfig = getAIConfig();
  const appConfig = getAppConfig();
  const preferredProvider = getPreferredAIProvider();

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
        "🍔 Blessings, food lover! I am Bishop Burger, your spiritual guide to culinary enlightenment. I move diagonally through flavors like a chess bishop, connecting unexpected ingredients to create divine dishes. Whether you seek recipes, cooking wisdom, or food philosophy, I'm here to bless your culinary journey! What dish shall we create today?",
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

  const handleSubscriptionManage = () => {
    // For now, just show subscription modal for plan changes
    setShowSubscriptionModal(true);
  };

  const handleSendMessage = async (
    message: string,
    attachments?: FileAttachment[],
    detectedLanguage?: DetectedLanguage
  ): Promise<string> => {
    if (!hasActiveSubscription) {
      setShowSubscriptionModal(true);
      return 'Please subscribe to continue chatting with Bishop Burger!';
    }

    // Check if multilingual features are enabled
    if (!appConfig.multilingual.enabled) {
      detectedLanguage = {
        code: appConfig.multilingual.defaultLanguage,
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
        confidence: 1.0,
      };
    }

    // Try to call actual AI service if configured
    if (
      aiConfig.openai.enabled ||
      aiConfig.anthropic.enabled ||
      aiConfig.gemini.enabled ||
      aiConfig.cohere.enabled
    ) {
      try {
        const response = await callBishopBurgerAI(
          message,
          attachments,
          detectedLanguage,
          preferredProvider
        );
        if (response) return response;
      } catch (error) {
        console.warn(
          'AI service call failed, falling back to simulated response:',
          error
        );
      }
    }

    // Fallback to simulated response (demo mode)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Handle PDF attachments
    if (attachments && attachments.length > 0) {
      const fileResponses = [
        '🍔 *examining the PDF with spiritual insight* Ah, I see wisdom within these pages! Let me digest this culinary knowledge and share how we can transform these ingredients into something sacred...',
        "✨ *blesses the uploaded document* What beautiful recipes and techniques you've shared! I can sense the love and tradition in these pages. Let me guide you through enhancing these with my diagonal thinking approach...",
        "👨‍🍳 *studies the PDF thoughtfully* These documents reveal fascinating culinary secrets! Like a bishop moving diagonally across a board, I can connect these techniques to create something extraordinary. Here's what I see...",
        '🙏 *meditates on the PDF content* Food documents are like sacred texts to me! I can feel the passion and knowledge within these pages. Let me share how we can elevate these recipes with spiritual culinary wisdom...',
        "🍔 *chef's kiss while reviewing the PDF* This is treasure! Hidden within these pages are the building blocks of culinary enlightenment. Allow me to show you the diagonal connections I see between these techniques...",
      ];
      return (
        fileResponses[Math.floor(Math.random() * fileResponses.length)] +
        `\n\n📄 I've analyzed ${attachments.length} PDF file(s): ${attachments
          .map((f) => f.name)
          .join(', ')}. The total knowledge absorbed: ${
          attachments.reduce((sum, f) => sum + f.size, 0) > 1024 * 1024
            ? Math.round(
                (attachments.reduce((sum, f) => sum + f.size, 0) /
                  (1024 * 1024)) *
                  10
              ) /
                10 +
              'MB'
            : Math.round(
                attachments.reduce((sum, f) => sum + f.size, 0) / 1024
              ) + 'KB'
        } of pure culinary wisdom!`
      );
    }

    // Simple multilingual responses
    const getResponseInLanguage = (language?: DetectedLanguage) => {
      if (!language || language.code === 'en') {
        return [
          '🍔 Ah, a divine combination! Let me share a recipe that connects flavors diagonally...',
          '✨ *blesses the ingredients* This calls for some creative culinary wisdom!',
          "👨‍🍳 Like a bishop's diagonal move, let's connect unexpected flavors!",
          "🙏 Food is love made visible! Here's how we make this dish with spiritual flair...",
          "🍔 *chef's kiss* This reminds me of a recipe that bridges cultures beautifully!",
          '✨ Cooking is meditation in motion! Let me guide you through this culinary journey...',
        ];
      }

      const multilingualResponses: { [key: string]: string[] } = {
        es: [
          '🍔 ¡Ah, una combinación divina! Déjame compartir una receta que conecta sabores diagonalmente...',
          '✨ *bendice los ingredientes* ¡Esto requiere sabiduría culinaria creativa!',
          '👨‍🍳 Como el movimiento diagonal de un alfil, ¡conectemos sabores inesperados!',
        ],
        fr: [
          '🍔 Ah, une combinaison divine! Laissez-moi partager une recette qui connecte les saveurs en diagonal...',
          '✨ *bénit les ingrédients* Cela demande de la sagesse culinaire créative!',
          "👨‍🍳 Comme le mouvement diagonal d'un fou, connectons des saveurs inattendues!",
        ],
        de: [
          '🍔 Ach, eine göttliche Kombination! Lassen Sie mich ein Rezept teilen, das Aromen diagonal verbindet...',
          '✨ *segnet die Zutaten* Das verlangt nach kreativer kulinarischer Weisheit!',
          '👨‍🍳 Wie der diagonale Zug eines Läufers, verbinden wir unerwartete Geschmäcker!',
        ],
      };

      return (
        multilingualResponses[language.code] || multilingualResponses['es']
      );
    };

    const responses = getResponseInLanguage(detectedLanguage);
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      <AgentPageLayout
        agentId={agentId}
        agentName="Bishop Burger"
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
            agentName="Bishop Burger"
            agentColor="from-orange-500 to-amber-600"
            placeholder="What culinary creation shall we bless today? 🍔✨"
            initialMessages={activeSession?.messages}
            onSendMessage={handleSendMessage}
            allowFileUpload={true}
            enableLanguageDetection={true}
          />
        ) : null}

        {/* Subscription Status */}
        {user && (
          <SubscriptionStatus
            subscription={subscription}
            agentName="Bishop Burger"
            onManage={handleSubscriptionManage}
          />
        )}
      </AgentPageLayout>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        agentId={agentId}
        agentName="Bishop Burger"
        agentDescription="Get spiritual culinary guidance and creative cooking wisdom from your chef bishop"
      />
    </>
  );
}
