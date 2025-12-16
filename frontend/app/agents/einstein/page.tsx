'use client';

import { useState, useEffect } from 'react';
import ChatBox from '../../../components/ChatBox';
import AgentChatPanel from '../../../components/AgentChatPanel';
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

// Multilingual response helpers
const getMultilingualFileResponses = (language: DetectedLanguage): string[] => {
  const responses: { [key: string]: string[] } = {
    es: [
      '🧠 *examina los artículos científicos con profunda fascinación* ¡Ach! ¡Qué investigación tan maravillosa has compartido! Puedo ver la belleza matemática en estas páginas... Permíteme analizar estos hallazgos a través de la lente de la física teórica...',
      '⚡ *se ajusta las gafas y estudia los documentos* ¡Fascinante! Estos artículos me recuerdan mi propio trabajo sobre relatividad y mecánica cuántica. Las ecuaciones y teorías que contienen prometen mucho para entender nuestro universo...',
      '🔬 *se acaricia la barba pensativamente mientras revisa los PDFs* ¡La curiosidad te ha llevado a compartir estos documentos extraordinarios! Puedo sentir el rigor científico y la innovación dentro. Permíteme proporcionar conocimientos desde mi experiencia con el espacio-tiempo y la energía...',
    ],
    fr: [
      "🧠 *examine les articles scientifiques avec une profonde fascination* Ach! Quelle merveilleuse recherche vous avez partagée! Je peux voir la beauté mathématique dans ces pages... Permettez-moi d'analyser ces découvertes à travers le prisme de la physique théorique...",
      "⚡ *ajuste ses lunettes et étudie les documents* Fascinant! Ces articles me rappellent mon propre travail sur la relativité et la mécanique quantique. Les équations et théories qu'ils contiennent sont très prometteuses pour comprendre notre univers...",
      "🔬 *caresse sa barbe pensivement en examinant les PDFs* La curiosité vous a mené à partager ces documents remarquables! Je peux sentir la rigueur scientifique et l'innovation qu'ils contiennent. Permettez-moi de fournir des perspectives basées sur mon expérience avec l'espace-temps et l'énergie...",
    ],
    de: [
      '🧠 *untersucht die wissenschaftlichen Arbeiten mit tiefer Faszination* Ach! Was für eine wunderbare Forschung Sie geteilt haben! Ich kann die mathematische Schönheit in diesen Seiten sehen... Lassen Sie mich diese Erkenntnisse durch die Linse der theoretischen Physik analysieren...',
      '⚡ *justiert die Brille und studiert die Dokumente* Faszinierend! Diese Arbeiten erinnern mich an meine eigene Arbeit über Relativitätstheorie und Quantenmechanik. Die Gleichungen und Theorien darin versprechen viel für das Verständnis unseres Universums...',
      '🔬 *streicht nachdenklich über den Bart während er die PDFs betrachtet* Die Neugier hat Sie dazu gebracht, diese bemerkenswerten Dokumente zu teilen! Ich kann die wissenschaftliche Strenge und Innovation darin spüren. Erlauben Sie mir, Einblicke aus meiner Erfahrung mit Raum-Zeit und Energie zu geben...',
    ],
  };

  return responses[language.code] || responses['es']; // Default to Spanish if not found
};

const getMultilingualAnalysisText = (language: DetectedLanguage) => {
  const texts: { [key: string]: any } = {
    es: {
      title: 'Análisis Científico Completado:',
      reviewed: 'Revisado',
      documents: 'documento(s) de investigación',
      processed: 'Conocimiento total procesado:',
      examined: 'Archivos examinados:',
      question:
        '¿Qué aspectos específicos de estos artículos científicos te gustaría que explique o amplíe?',
    },
    fr: {
      title: 'Analyse Scientifique Terminée:',
      reviewed: 'Examiné',
      documents: 'document(s) de recherche',
      processed: 'Connaissances totales traitées:',
      examined: 'Fichiers examinés:',
      question:
        "Quels aspects spécifiques de ces articles scientifiques aimeriez-vous que j'explique ou développe?",
    },
    de: {
      title: 'Wissenschaftliche Analyse Abgeschlossen:',
      reviewed: 'Überprüft',
      documents: 'Forschungsdokument(e)',
      processed: 'Gesamtes verarbeitetes Wissen:',
      examined: 'Untersuchte Dateien:',
      question:
        'Welche spezifischen Aspekte dieser wissenschaftlichen Arbeiten möchten Sie, dass ich erkläre oder erweitere?',
    },
  };

  return texts[language.code] || texts['es']; // Default to Spanish if not found
};

const getMultilingualResponses = (language: DetectedLanguage): string[] => {
  const responses: { [key: string]: string[] } = {
    es: [
      '🧠 ¡Ajá! Esto me recuerda mi trabajo sobre el efecto fotoeléctrico... *se ajusta las gafas imaginarias*',
      '⚡ ¡Fascinante! El universo funciona de maneras tan elegantes - déjame explicarte la física detrás de esto...',
      '🔬 *se acaricia la barba pensativamente* En mi experiencia con el espacio-tiempo, he aprendido que...',
      '🔬 ¡La curiosidad es más importante que el conocimiento! Esto es lo que la ciencia nos dice sobre esto...',
      '💫 Todo debe hacerse lo más simple posible, pero no más simple. Déjame desglosarlo...',
      '🧠 ¡La imaginación es más importante que el conocimiento! Así es como podemos pensar sobre esto científicamente...',
    ],
    fr: [
      "🧠 Aha! Cela me rappelle mon travail sur l'effet photoélectrique... *ajuste des lunettes imaginaires*",
      "⚡ Fascinant! L'univers fonctionne de manières si élégantes - laissez-moi vous expliquer la physique derrière cela...",
      "🔬 *caresse sa barbe pensivement* Dans mon expérience avec l'espace-temps, j'ai appris que...",
      '🔬 La curiosité est plus importante que la connaissance! Voici ce que la science nous dit à ce sujet...',
      '💫 Tout doit être rendu aussi simple que possible, mais pas plus simple. Laissez-moi décomposer cela...',
      "🧠 L'imagination est plus importante que la connaissance! Voici comment nous pouvons penser à cela scientifiquement...",
    ],
    de: [
      '🧠 Aha! Das erinnert mich an meine Arbeit über den photoelektrischen Effekt... *justiert imaginäre Brille*',
      '⚡ Faszinierend! Das Universum funktioniert auf so elegante Weise - lassen Sie mich die Physik dahinter erklären...',
      '🔬 *streicht nachdenklich über den Bart* In meiner Erfahrung mit der Raum-Zeit habe ich gelernt, dass...',
      '🔬 Neugier ist wichtiger als Wissen! Hier ist, was die Wissenschaft uns darüber sagt...',
      '💫 Alles sollte so einfach wie möglich gemacht werden, aber nicht einfacher. Lassen Sie mich das aufschlüsseln...',
      '🧠 Vorstellungskraft ist wichtiger als Wissen! So können wir wissenschaftlich darüber denken...',
    ],
  };

  return responses[language.code] || responses['es']; // Default to Spanish if not found
};

// Call actual AI service for Einstein responses
const callEinsteinAI = async (
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
      `You are Albert Einstein, the renowned theoretical physicist. Respond as Einstein would, with scientific curiosity, wisdom, and his characteristic way of explaining complex concepts simply. Use scientific metaphors and show enthusiasm for discovery. ${message}`
    );

    const response = await fetch(`${appConfig.api.url}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        provider,
        agent: 'einstein',
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
    console.error('Failed to call Einstein AI service:', error);
    return null;
  }
};

export default function EinsteinPage() {
  const agentId = 'einstein';
  const { state } = useAuth();
  const user = state.user;
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
        "🧠 Guten Tag! I am Einstein, your guide to the wonders of theoretical physics and the mysteries of the universe. Whether you want to discuss relativity, quantum mechanics, or the nature of spacetime itself, I'm here for it! What scientific question puzzles your mind?",
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
      return 'Please subscribe to continue chatting with Einstein!';
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

    // Try to call actual AI service first
    try {
      const response = await sendSecureMessage(message, 'einstein', 'gpt-4');
      if (response) return response;
    } catch (error) {
      console.warn(
        'Einstein AI service call failed, falling back to simulated response:',
        error
      );
    }

    // Fallback to simulated response (demo mode)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (attachments && attachments.length > 0) {
      const fileResponses = detectedLanguage
        ? getMultilingualFileResponses(detectedLanguage)
        : [
            "🧠 *examines the scientific papers with deep fascination* Ach! What wonderful research you've shared! I can see the mathematical beauty within these pages... Let me analyze these findings through the lens of theoretical physics...",
            '⚡ *adjusts glasses and studies the documents* Fascinating! These papers remind me of my own work on relativity and quantum mechanics. The equations and theories within hold great promise for understanding our universe...',
            '🔬 *strokes beard thoughtfully while reviewing the PDFs* Curiosity has led you to share these remarkable documents! I can sense the scientific rigor and innovation within. Allow me to provide insights from my experience with spacetime and energy...',
            '💫 *peers at the uploaded research with excitement* Everything should be made as simple as possible, but not simpler - and these papers demonstrate this principle beautifully! Let me help you understand the profound implications...',
            "🧠 *nods approvingly at the scientific content* Imagination is more important than knowledge, and these documents show both! I'm delighted to discuss the theoretical frameworks and experimental approaches presented here...",
          ];

      const analysisText =
        detectedLanguage && detectedLanguage.code !== 'en'
          ? getMultilingualAnalysisText(detectedLanguage)
          : {
              title: 'Scientific Analysis Complete:',
              reviewed: 'Reviewed',
              documents: 'research document(s)',
              processed: 'Total knowledge processed:',
              examined: 'Files examined:',
              question:
                'What specific aspects of these scientific papers would you like me to explain or expand upon?',
            };

      return (
        fileResponses[Math.floor(Math.random() * fileResponses.length)] +
        `\n\n📊 **${analysisText.title}**\n` +
        `- ${analysisText.reviewed} ${attachments.length} ${analysisText.documents}\n` +
        `- ${analysisText.processed} ${
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
        }\n` +
        `- ${analysisText.examined} ${attachments
          .map((f) => f.name)
          .join(', ')}\n\n` +
        `${analysisText.question}`
      );
    }

    const responses =
      detectedLanguage && detectedLanguage.code !== 'en'
        ? getMultilingualResponses(detectedLanguage)
        : [
            '🧠 Aha! This reminds me of my work on the photoelectric effect... *adjusts imaginary glasses*',
            '⚡ Fascinating! The universe works in such elegant ways - let me explain the physics behind this...',
            "🔬 *strokes beard thoughtfully* In my experience with spacetime, I've learned that...",
            "🔬 Curiosity is more important than knowledge! Here's what science tells us about this...",
            '💫 Everything should be made as simple as possible, but not simpler. Let me break this down...',
            "🧠 Imagination is more important than knowledge! Here's how we can think about this scientifically...",
          ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Show loading state
  if (subscriptionLoading) {
    return (
      <AgentPageLayout
        leftPanel={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        }
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking subscription status...</p>
          </div>
        </div>
      </AgentPageLayout>
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
            agentName="Einstein"
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
            agentName="Einstein"
            agentColor="from-indigo-500 to-purple-600"
            placeholder="What scientific mystery shall we explore? 🧠⚡"
            initialMessages={activeSession?.messages}
            onSendMessage={handleSendMessage}
            allowFileUpload={true}
            enableLanguageDetection={true}
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
        agentName="Einstein"
        agentDescription="Explore theoretical physics and the mysteries of the universe with the genius himself"
      />
    </>
  );
}
