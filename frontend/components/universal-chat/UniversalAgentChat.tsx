'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  PaperAirplaneIcon,
  MicrophoneIcon,
  PaperClipIcon,
  PhoneIcon,
  StopIcon,
} from '@heroicons/react/24/solid';
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ClipboardDocumentIcon,
  ShareIcon,
  SpeakerWaveIcon,
  ArrowPathIcon,
  PencilIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import EnhancedChatLayout from './EnhancedChatLayout';
import { useChatTheme } from './ThemeContext';
import { AgentSettings } from './ChatSettingsPanel';
import QuickActionsPanel from './QuickActionsPanel';
import realtimeChatService, {
  ChatMessage as ServiceChatMessage,
  AgentConfig,
  CodeBlock,
} from './realtimeChatService';
import { useAuth } from '@/contexts/AuthContext';

interface MessageAttachment {
  name: string;
  type: string;
  url?: string;
  preview?: string; // For displaying image thumbnail
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  codeBlocks?: CodeBlock[];
  attachments?: MessageAttachment[]; // Store attachments separately for display
}

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  lastMessage?: string;
  messageCount?: number;
  updatedAt?: Date;
}

interface ChatAttachment {
  name: string;
  type: string;
  url?: string;
  data?: string;
}

export interface AgentChatConfig {
  id: string;
  name: string;
  icon: string;
  description?: string;
  systemPrompt: string;
  welcomeMessage: string;
  specialties?: string[];
  color?: string;
  aiProvider?: {
    primary:
      | 'openai'
      | 'anthropic'
      | 'gemini'
      | 'cohere'
      | 'mistral'
      | 'xai'
      | 'huggingface'
      | 'groq';
    fallbacks: string[];
    model: string;
    reasoning?: string;
  };
}

interface UniversalAgentChatProps {
  agent: AgentChatConfig;
}

const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  const SR =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;
  return SR || null;
};

// Helper function to extract text content from React children
// This fixes the [object Object] issue when copying code blocks
const extractTextFromChildren = (children: React.ReactNode): string => {
  if (typeof children === 'string') {
    return children;
  }
  if (typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }
  if (children && typeof children === 'object' && 'props' in children) {
    const element = children as React.ReactElement;
    return extractTextFromChildren(element.props?.children);
  }
  return '';
};

// Helper function to extract base64 images from markdown content
// This prevents markdown parsers from choking on very long data URLs
interface ExtractedImage {
  src: string;
  alt: string;
}

const extractBase64Images = (content: string): { cleanContent: string; images: ExtractedImage[] } => {
  const images: ExtractedImage[] = [];
  // Match markdown images with data URLs: ![alt](data:image/...)
  const imageRegex = /!\[([^\]]*)\]\((data:image\/[^)]+)\)/g;
  let match;
  let cleanContent = content;
  
  while ((match = imageRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const alt = match[1];
    const src = match[2];
    
    // Only extract if it's a large base64 image (over 1000 chars means it's actual image data)
    if (src.length > 1000) {
      images.push({ src, alt });
      // Remove the image markdown entirely - we'll render images separately
      cleanContent = cleanContent.replace(fullMatch, '');
    }
  }
  
  return { cleanContent, images };
};

export default function UniversalAgentChat({ agent }: UniversalAgentChatProps) {
  // Auth
  const { state: authState } = useAuth();

  // Theme state - uses context provided by EnhancedChatLayout
  const { isNeural } = useChatTheme();

  // Sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'session-1',
      name: 'Welcome Conversation',
      messages: [
        {
          id: 'msg-1',
          role: 'assistant',
          content: agent.welcomeMessage,
          timestamp: new Date(),
        },
      ],
      lastMessage: `Chat with ${agent.name}`,
      messageCount: 1,
      updatedAt: new Date(),
    },
  ]);

  const [activeSessionId, setActiveSessionId] = useState<string>('session-1');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQuickActionsCollapsed, setIsQuickActionsCollapsed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<
    Record<string, 'up' | 'down' | null>
  >({});
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [userMenuOpenId, setUserMenuOpenId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const ttsAbortControllerRef = useRef<AbortController | null>(null);
  const ttsStoppedIntentionallyRef = useRef<boolean>(false);

  // Settings state - use agent's AI provider config if available, default to cerebras
  const [settings, setSettings] = useState<AgentSettings>({
    temperature: 0.7,
    maxTokens: 2000,
    mode: 'balanced',
    systemPrompt: '',
    provider: agent.aiProvider?.primary || 'cerebras',
    model: agent.aiProvider?.model || 'llama3.1-8b',
  });

  // Load persisted settings per agent
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHasSpeechRecognition(!!getSpeechRecognition());
    const saved = localStorage.getItem(`agent-settings-${agent.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (err) {
        console.error('Failed to parse saved settings', err);
      }
    }
  }, [agent.id]);

  // Persist settings
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(
      `agent-settings-${agent.id}`,
      JSON.stringify(settings)
    );
  }, [settings, agent.id]);

  const handleUpdateSettings = useCallback((next: Partial<AgentSettings>) => {
    setSettings((prev) => ({ ...prev, ...next }));
  }, []);

  const handleResetSettings = useCallback(() => {
    setSettings({
      temperature: 0.7,
      maxTokens: 2000,
      mode: 'balanced',
      systemPrompt: '',
      provider: agent.aiProvider?.primary || 'mistral',
      model: agent.aiProvider?.model || 'mistral-large-latest',
    });
  }, [agent.aiProvider?.model, agent.aiProvider?.primary]);

  // Initialize browser Speech-to-Text
  useEffect(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setIsRecording(false);
      console.log('[Speech] Speech recognition not available');
      return;
    }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      console.log('[Speech] Transcript:', transcript);
      setInputValue((prev) => `${prev.trim()} ${transcript}`.trim());
    };

    recognition.onerror = (e: any) => {
      console.error('[Speech] Error:', e.error);
      setIsRecording(false);
    };
    recognition.onend = () => {
      console.log('[Speech] Recognition ended');
      setIsRecording(false);
    };
    recognition.onstart = () => {
      console.log('[Speech] Recognition started');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  // Handle microphone toggle
  const handleMicrophoneToggle = useCallback(async () => {
    if (!hasSpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert('Speech recognition failed to initialize.');
      return;
    }
    
    if (isRecording) {
      console.log('[Speech] Stopping...');
      recognition.stop();
      setIsRecording(false);
    } else {
      console.log('[Speech] Requesting microphone permission...');
      
      // Request microphone permission first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream immediately - we just needed to get permission
        stream.getTracks().forEach(track => track.stop());
        console.log('[Speech] Microphone permission granted');
      } catch (permissionError) {
        console.error('[Speech] Microphone permission denied:', permissionError);
        alert('Microphone access denied. Please allow microphone access in your browser settings to use voice input.');
        return;
      }
      
      console.log('[Speech] Starting...');
      try {
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        console.error('[Speech] Start failed:', err);
        alert('Failed to start speech recognition. Please try again.');
        setIsRecording(false);
      }
    }
  }, [isRecording, hasSpeechRecognition]);

  const isValidObjectId = useCallback(
    (value: string) => /^[0-9a-fA-F]{24}$/.test(value),
    []
  );

  const fetchSessionMessages = useCallback(
    async (sessionId: string) => {
      try {
        const resp = await fetch(`/api/chat/sessions/${sessionId}`, {
          credentials: 'include',
        });
        if (!resp.ok) return;
        const data = await resp.json();
        if (data.success && data.session) {
          let msgs = (data.session.messages || []).map((msg: any) => ({
            id: msg.id || `msg-${Date.now()}-${Math.random()}`,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp || msg.createdAt),
          }));

          // If no messages, add welcome message locally (don't save to DB)
          if (msgs.length === 0) {
            msgs = [
              {
                id: `welcome-${Date.now()}`,
                role: 'assistant' as const,
                content: agent.welcomeMessage,
                timestamp: new Date(),
              },
            ];
          }

          setSessions((prev) =>
            prev.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    messages: msgs,
                    messageCount: msgs.length,
                    updatedAt: new Date(),
                  }
                : s
            )
          );
        }
      } catch (err) {
        console.error('Failed to fetch session messages', err);
      }
    },
    [agent.welcomeMessage]
  );

  // Load sessions from database
  const loadSessions = useCallback(async () => {
    if (!authState.isAuthenticated || !authState.user) {
      // For non-authenticated users, keep default session
      return;
    }

    try {
      // Always include agentId in query to ensure agent-specific sessions
      const query = `?agentId=${encodeURIComponent(agent.id)}`;
      const response = await fetch(`/api/chat/sessions${query}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.sessions.length > 0) {
          const formattedSessions = data.sessions.map((session: any) => ({
            id: session.id,
            name: session.name,
            messages: session.messages
              ? session.messages.map((msg: any) => ({
                  id: msg.id || `msg-${Date.now()}-${Math.random()}`,
                  role: msg.role,
                  content: msg.content,
                  timestamp: new Date(msg.timestamp || msg.createdAt),
                }))
              : [],
            lastMessage: session.lastMessage,
            messageCount: session.messageCount,
            updatedAt: new Date(session.updatedAt),
          }));

          setSessions(formattedSessions);
          setActiveSessionId(formattedSessions[0].id);

          // load messages for the first session
          const firstId = formattedSessions[0]?.id;
          if (firstId) {
            await fetchSessionMessages(firstId);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }, [
    authState.isAuthenticated,
    authState.user,
    agent.id,
    fetchSessionMessages,
    isValidObjectId,
  ]);

  // Save message to session in database
  const saveMessageToSession = useCallback(
    async (sessionId: string, message: Message) => {
      if (!authState.isAuthenticated || !authState.user) {
        return;
      }

      try {
        const response = await fetch(`/api/chat/sessions/${sessionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            role: message.role,
            content: message.content,
            agentId: agent.id, // Always include agentId for proper session association
          }),
        });

        if (!response.ok) {
          console.error('Failed to save message to session');
        }
      } catch (error) {
        console.error('Error saving message:', error);
      }
    },
    [authState.isAuthenticated, authState.user, agent.id, isValidObjectId]
  );

  // Legacy save session (for analytics/interactions)
  const saveSession = useCallback(
    async (session: ChatSession) => {
      if (!authState.isAuthenticated || !authState.user) {
        return;
      }

      try {
        const response = await fetch('/api/chat/interactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            conversationId: session.id,
            ...(isValidObjectId(agent.id) ? { agentId: agent.id } : {}),
            messages: session.messages.map((msg) => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp,
            })),
          }),
        });

        if (!response.ok) {
          console.error('Failed to save session');
        }
      } catch (error) {
        console.error('Error saving session:', error);
      }
    },
    [authState.isAuthenticated, authState.user, agent.id, isValidObjectId]
  );

  // Load sessions on mount and when auth changes
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  // Handlers
  const handleNewSession = useCallback(async () => {
    try {
      const body: Record<string, any> = {
        name: `Conversation ${sessions.length + 1}`,
        agentId: agent.id, // Always include agentId for proper separation
      };

      const resp = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        console.error('Failed to create session');
        return;
      }
      const data = await resp.json();
      if (data.success && data.session) {
        // Create welcome message for new session
        const welcomeMessage: Message = {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: agent.welcomeMessage,
          timestamp: new Date(),
        };

        const session: ChatSession = {
          id: data.session.id,
          name: data.session.name,
          messages: [welcomeMessage],
          lastMessage: agent.welcomeMessage.slice(0, 50),
          messageCount: 1,
          updatedAt: new Date(data.session.updatedAt || Date.now()),
        };
        setSessions((prev) => [session, ...prev]);
        setActiveSessionId(session.id);

        // Save welcome message to database
        await saveMessageToSession(session.id, welcomeMessage);
      }
    } catch (err) {
      console.error('Error creating session', err);
    }
  }, [
    agent.id,
    agent.welcomeMessage,
    sessions.length,
    isValidObjectId,
    saveMessageToSession,
  ]);

  const handleSelectSession = useCallback(
    (id: string) => {
      setActiveSessionId(id);
      fetchSessionMessages(id);
    },
    [fetchSessionMessages]
  );

  const handleDeleteSession = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/chat/sessions?sessionId=${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          console.error('Failed to delete session');
          return;
        }

        // Update local state after successful deletion
        setSessions((prev) => {
          const filtered = prev.filter((s) => s.id !== id);
          if (activeSessionId === id && filtered.length > 0) {
            setActiveSessionId(filtered[0].id);
          }
          return filtered;
        });
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    },
    [activeSessionId]
  );

  const handleRenameSession = useCallback((id: string, newName: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );
  }, []);

  const handleFeedback = useCallback(
    (messageId: string, type: 'up' | 'down') => {
      setMessageFeedback((prev) => ({
        ...prev,
        [messageId]: prev[messageId] === type ? null : type,
      }));
    },
    []
  );

  const handleCopyMessage = useCallback(async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 1200);
    } catch (err) {
      console.error('Failed to copy message', err);
    }
  }, []);

  // Regenerate the last assistant response
  const handleRegenerateMessage = useCallback(async (messageId: string) => {
    if (!activeSession || isLoading) return;
    
    // Find the index of the message to regenerate
    const messageIndex = activeSession.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    // Get the user message before this assistant message
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0 || activeSession.messages[userMessageIndex]?.role !== 'user') return;
    
    const userMessage = activeSession.messages[userMessageIndex];
    
    // Remove the assistant message being regenerated
    setSessions(prev => prev.map(s => 
      s.id === activeSessionId 
        ? { ...s, messages: s.messages.slice(0, messageIndex) }
        : s
    ));
    
    setIsLoading(true);
    
    const conversationHistory = activeSession.messages
      .slice(0, userMessageIndex)
      .filter(m => m.role !== 'assistant' || !m.isStreaming)
      .map(m => ({ role: m.role, content: m.content }));
    
    const assistantMessageId = `asst-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    
    setSessions(prev => prev.map(s =>
      s.id === activeSessionId
        ? { ...s, messages: [...s.messages, assistantMessage], updatedAt: new Date() }
        : s
    ));
    
    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/agent/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          agentId: agent.id,
          agentName: agent.name,
          conversationHistory,
          settings: {
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            systemPrompt: settings.systemPrompt || agent.systemPrompt,
            provider: settings.provider,
            model: settings.model,
          },
        }),
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      const decoder = new TextDecoder();
      let fullContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                setSessions(prev => prev.map(s =>
                  s.id === activeSessionId
                    ? {
                        ...s,
                        messages: s.messages.map(m =>
                          m.id === assistantMessageId ? { ...m, content: fullContent } : m
                        ),
                      }
                    : s
                ));
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
      
      // Finalize message
      setSessions(prev => prev.map(s =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: s.messages.map(m =>
                m.id === assistantMessageId
                  ? { ...m, content: fullContent, isStreaming: false }
                  : m
              ),
              lastMessage: fullContent.slice(0, 50),
            }
          : s
      ));
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Regenerate failed:', error);
        setSessions(prev => prev.map(s =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: s.messages.map(m =>
                  m.id === assistantMessageId
                    ? { ...m, content: 'Sorry, regeneration failed. Please try again.', isStreaming: false }
                    : m
                ),
              }
            : s
        ));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [activeSession, activeSessionId, isLoading, agent.id, agent.name, agent.systemPrompt, settings]);

  // Start editing a user message
  const handleStartEdit = useCallback((messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
    setUserMenuOpenId(null);
  }, []);

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditingContent('');
  }, []);

  // Save edited message and regenerate response
  const handleSaveEdit = useCallback(async (messageId: string) => {
    if (!activeSession || isLoading || !editingContent.trim()) return;
    
    const messageIndex = activeSession.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    // Update the user message and remove all messages after it
    const updatedMessages = activeSession.messages.slice(0, messageIndex + 1).map(m =>
      m.id === messageId ? { ...m, content: editingContent.trim() } : m
    );
    
    setSessions(prev => prev.map(s =>
      s.id === activeSessionId
        ? { ...s, messages: updatedMessages }
        : s
    ));
    
    setEditingMessageId(null);
    setEditingContent('');
    setIsLoading(true);
    
    const conversationHistory = updatedMessages
      .slice(0, -1)
      .filter(m => m.role !== 'assistant' || !m.isStreaming)
      .map(m => ({ role: m.role, content: m.content }));
    
    const assistantMessageId = `asst-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    
    setSessions(prev => prev.map(s =>
      s.id === activeSessionId
        ? { ...s, messages: [...s.messages, assistantMessage], updatedAt: new Date() }
        : s
    ));
    
    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/agent/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: editingContent.trim(),
          agentId: agent.id,
          agentName: agent.name,
          conversationHistory,
          settings: {
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            systemPrompt: settings.systemPrompt || agent.systemPrompt,
            provider: settings.provider,
            model: settings.model,
          },
        }),
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      const decoder = new TextDecoder();
      let fullContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                setSessions(prev => prev.map(s =>
                  s.id === activeSessionId
                    ? {
                        ...s,
                        messages: s.messages.map(m =>
                          m.id === assistantMessageId ? { ...m, content: fullContent } : m
                        ),
                      }
                    : s
                ));
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
      
      // Finalize message
      setSessions(prev => prev.map(s =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: s.messages.map(m =>
                m.id === assistantMessageId
                  ? { ...m, content: fullContent, isStreaming: false }
                  : m
              ),
              lastMessage: fullContent.slice(0, 50),
            }
          : s
      ));
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Edit and regenerate failed:', error);
        setSessions(prev => prev.map(s =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: s.messages.map(m =>
                  m.id === assistantMessageId
                    ? { ...m, content: 'Sorry, regeneration failed. Please try again.', isStreaming: false }
                    : m
                ),
              }
            : s
        ));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [activeSession, activeSessionId, isLoading, editingContent, agent.id, agent.name, agent.systemPrompt, settings]);

  // Copy user message
  const handleCopyUserMessage = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setUserMenuOpenId(null);
    } catch (err) {
      console.error('Failed to copy message', err);
    }
  }, []);

  const handleShareMessage = useCallback(
    async (content: string) => {
      try {
        if (navigator.share) {
          await navigator.share({ title: agent.name, text: content });
        } else {
          await navigator.clipboard.writeText(content);
        }
      } catch (err) {
        console.error('Failed to share message', err);
      }
    },
    [agent.name]
  );

  const handleFilesSelected = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const maxFileSizeMb = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 10;
      const maxBytes = maxFileSizeMb * 1024 * 1024;

      const readPreview = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string) || '');
          reader.onerror = () => reject(new Error('File read failed'));
          if (
            file.type.startsWith('text/') ||
            file.type === 'application/json'
          ) {
            reader.readAsText(file);
          } else {
            reader.readAsDataURL(file);
          }
        });

      const newAttachments: ChatAttachment[] = [];

      for (const file of Array.from(fileList)) {
        if (file.size > maxBytes) {
          console.warn(
            `Skipping ${file.name}: exceeds ${maxFileSizeMb}MB limit`
          );
          continue;
        }

        try {
          const presignResp = await fetch('/api/uploads/presign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type || 'application/octet-stream',
            }),
          });

          if (!presignResp.ok) {
            console.error('Failed to get upload URL', await presignResp.text());
            continue;
          }

          const { uploadUrl, fileUrl } = await presignResp.json();

          const uploadResp = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
            },
            body: file,
          });

          if (!uploadResp.ok) {
            console.error(
              `Upload failed for ${file.name}:`,
              uploadResp.status,
              await uploadResp.text()
            );
            continue;
          }

          let preview: string | undefined;
          try {
            const result = await readPreview(file);
            const trimmed =
              result.length > 4000 ? `${result.slice(0, 4000)}...` : result;
            preview = trimmed;
          } catch (err) {
            console.warn(
              'Preview read failed, skipping preview for',
              file.name
            );
          }

          newAttachments.push({
            name: file.name,
            type: file.type,
            url: fileUrl,
            data: preview || `File available at ${fileUrl}`,
          });
        } catch (err) {
          console.error('Failed to upload file', err);
        }
      }

      if (newAttachments.length > 0) {
        setAttachments((prev) => [...prev, ...newAttachments]);
        if (!inputValue) {
          setInputValue('');
        }
      }
    },
    [inputValue]
  );

  const handleExportSession = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!activeSession) return;

    const exportLines = [
      `# ${agent.name} Chat Export`,
      `Session: ${activeSession.name}`,
      `Date: ${new Date().toISOString()}`,
      '',
      '---',
      '',
      ...activeSession.messages.map((m) => {
        const prefix = m.role === 'user' ? 'User' : 'Assistant';
        return `**${prefix}:** ${m.content}`;
      }),
    ];

    const blob = new Blob([exportLines.join('\n')], {
      type: 'text/markdown',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${agent.name.replace(/\s+/g, '-').toLowerCase()}-${activeSession.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }, [activeSession, agent.name]);

  // Ref to track playing audio for TTS
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  // Use ref for immediate state tracking (avoids stale closure)
  const speakingMessageIdRef = useRef<string | null>(null);
  
  // Keep ref in sync with state
  useEffect(() => {
    speakingMessageIdRef.current = speakingMessageId;
  }, [speakingMessageId]);

  // Stop TTS function - immediately stops all audio and cancels pending requests
  const stopTTS = useCallback(() => {
    console.log('[TTS] Stopping all audio...');
    
    // Mark as intentionally stopped to prevent fallback TTS
    ttsStoppedIntentionallyRef.current = true;
    
    // FIRST: Abort any pending TTS fetch requests
    if (ttsAbortControllerRef.current) {
      console.log('[TTS] Aborting pending TTS request');
      ttsAbortControllerRef.current.abort();
      ttsAbortControllerRef.current = null;
    }
    
    // Stop HTML5 Audio
    if (ttsAudioRef.current) {
      // Remove event listeners before stopping to prevent onerror from firing
      ttsAudioRef.current.onerror = null;
      ttsAudioRef.current.onended = null;
      ttsAudioRef.current.oncanplaythrough = null;
      ttsAudioRef.current.pause();
      ttsAudioRef.current.currentTime = 0;
      ttsAudioRef.current.src = '';
      ttsAudioRef.current = null;
    }
    // Stop browser speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    speakingMessageIdRef.current = null;
    console.log('[TTS] Stopped');
  }, []);

  const handleListenMessage = useCallback(async (content: string, messageId: string) => {
    if (typeof window === 'undefined') return;

    // Use ref for immediate state check (avoids stale closure)
    const currentlySpeaking = speakingMessageIdRef.current;
    console.log('[TTS] handleListenMessage called, messageId:', messageId, 'currently speaking:', currentlySpeaking);

    // If ANY audio is speaking, stop it first
    if (currentlySpeaking) {
      console.log('[TTS] Stopping current audio');
      stopTTS();
      // If clicking the same message, just stop (don't restart)
      if (currentlySpeaking === messageId) {
        console.log('[TTS] Same message - just stopping');
        return;
      }
      // Small delay to ensure audio is fully stopped before starting new
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const cleanText = content
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`(.*?)`/g, '$1')
      .replace(/^#+\s/gm, '')
      .replace(/^[•-]\s/gm, '')
      .replace(/>\s/g, '');

    if (!cleanText.trim()) {
      console.warn('No text to speak');
      return;
    }

    // Set this message as speaking (both state and ref)
    setSpeakingMessageId(messageId);
    speakingMessageIdRef.current = messageId;

    // Create abort controller for this TTS request
    ttsAbortControllerRef.current = new AbortController();
    const currentAbortController = ttsAbortControllerRef.current;

    // Try ElevenLabs first, fall back to browser TTS
    try {
      console.log('Attempting ElevenLabs TTS...');
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
        signal: currentAbortController.signal,
      });

      // Check if request was aborted while waiting
      if (currentAbortController.signal.aborted) {
        console.log('[TTS] Request was aborted, not playing audio');
        return;
      }

      if (response.ok) {
        console.log('ElevenLabs TTS successful, creating audio...');
        const audioBlob = await response.blob();
        
        // Check again if aborted during blob read
        if (currentAbortController.signal.aborted) {
          console.log('[TTS] Request was aborted after blob, not playing audio');
          return;
        }
        
        console.log('Audio blob size:', audioBlob.size, 'type:', audioBlob.type);
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('Audio URL created:', audioUrl);
        const audio = new Audio(audioUrl);
        ttsAudioRef.current = audio;
        
        // Reset the intentional stop flag since we're starting new audio
        ttsStoppedIntentionallyRef.current = false;
        
        // Add better error handling - but DON'T fallback if intentionally stopped
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          URL.revokeObjectURL(audioUrl);
          ttsAudioRef.current = null;
          
          // Only fallback to browser TTS if NOT intentionally stopped
          if (!ttsStoppedIntentionallyRef.current) {
            console.log('[TTS] Unintentional error, falling back to browser TTS');
            setSpeakingMessageId(null);
            speakingMessageIdRef.current = null;
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(cleanText);
              utterance.onend = () => { setSpeakingMessageId(null); speakingMessageIdRef.current = null; };
              utterance.onerror = () => { setSpeakingMessageId(null); speakingMessageIdRef.current = null; };
              window.speechSynthesis.speak(utterance);
            }
          } else {
            console.log('[TTS] Intentionally stopped, NOT falling back to browser TTS');
          }
        };
        
        audio.onended = () => {
          console.log('Audio playback ended');
          URL.revokeObjectURL(audioUrl);
          ttsAudioRef.current = null;
          setSpeakingMessageId(null);
          speakingMessageIdRef.current = null;
        };
        
        audio.oncanplaythrough = () => {
          console.log('Audio can play through, starting playback...');
        };
        
        try {
          await audio.play();
          console.log('Audio playback started successfully');
          return;
        } catch (playError) {
          console.error('Audio play() failed:', playError);
          URL.revokeObjectURL(audioUrl);
          ttsAudioRef.current = null;
          // This usually happens due to autoplay policy - need user interaction
          // Fallback to browser TTS which doesn't have this restriction
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.warn('ElevenLabs TTS failed:', response.status, errorData);
        setSpeakingMessageId(null);
        speakingMessageIdRef.current = null;
      }
    } catch (err: any) {
      // Don't treat abort as an error - it's intentional
      if (err?.name === 'AbortError') {
        console.log('[TTS] Request aborted (user clicked stop)');
        return;
      }
      console.warn('ElevenLabs TTS error:', err);
      setSpeakingMessageId(null);
      speakingMessageIdRef.current = null;
    }

    // Fallback to browser speechSynthesis
    console.log('Using browser TTS fallback');
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.lang = 'en-US';
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setSpeakingMessageId(null);
        speakingMessageIdRef.current = null;
      };
      
      utterance.onstart = () => {
        console.log('Speech synthesis started');
      };

      utterance.onend = () => {
        console.log('Speech synthesis ended');
        setSpeakingMessageId(null);
        speakingMessageIdRef.current = null;
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported in this browser');
      setSpeakingMessageId(null);
      speakingMessageIdRef.current = null;
    }
  }, [stopTTS]); // Removed speakingMessageId - using ref instead

  const handleSendMessage = useCallback(async () => {
    if (
      (!inputValue.trim() && attachments.length === 0) ||
      !activeSession ||
      isLoading
    )
      return;

    // Store attachments for display (images show as thumbnails)
    const messageAttachments: MessageAttachment[] = attachments.map((file) => ({
      name: file.name,
      type: file.type,
      url: file.url,
      preview: file.type.startsWith('image/')
        ? file.url || file.data
        : undefined,
    }));

    // Build display content (clean, without raw URLs/base64)
    const displayContent =
      inputValue.trim() ||
      (attachments.length > 0 ? '📎 Sent attachment(s)' : '');

    // Build API content with attachment info for the AI
    const attachmentTextForApi =
      attachments.length > 0
        ? attachments
            .map((file) => {
              const parts = [
                `Attachment: ${file.name}${file.type ? ` (${file.type})` : ''}`,
              ];
              if (file.url) {
                parts.push(`URL: ${file.url}`);
              }
              if (file.data) {
                parts.push(String(file.data));
              }
              return parts.join('\n');
            })
            .join('\n\n') + '\n\n'
        : '';

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: displayContent, // Clean content for display
      timestamp: new Date(),
      attachments:
        messageAttachments.length > 0 ? messageAttachments : undefined,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: [...s.messages, userMessage],
              lastMessage: displayContent.slice(0, 50),
              messageCount: s.messages.length + 1,
              updatedAt: new Date(),
            }
          : s
      )
    );

    // Use full content with attachment data for API
    const userInput = `${attachmentTextForApi}${inputValue}`.trim();
    setInputValue('');
    setAttachments([]);
    setIsLoading(true);

    const conversationHistory = activeSession.messages
      .filter((m) => m.role !== 'assistant' || !m.isStreaming) // Exclude streaming messages
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    const assistantMessageId = `asst-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: [...s.messages, assistantMessage],
              messageCount: s.messages.length + 1,
              updatedAt: new Date(),
            }
          : s
      )
    );

    try {
      // Create abort controller for stop functionality
      abortControllerRef.current = new AbortController();

      // Use streaming API for real-time token display
      const response = await fetch('/api/agent/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          conversationHistory,
          agentId: agent.id,
          provider: settings.provider,
          model: settings.model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          systemPrompt: settings.systemPrompt,
          mode: settings.mode,
          attachments,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.token) {
                fullContent += data.token;
                // Update message in real-time
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === activeSessionId
                      ? {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === assistantMessageId
                              ? { ...m, content: fullContent }
                              : m
                          ),
                        }
                      : s
                  )
                );
              }

              if (data.done) {
                // Mark streaming as complete
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === activeSessionId
                      ? {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === assistantMessageId
                              ? { ...m, isStreaming: false }
                              : m
                          ),
                          lastMessage: fullContent.slice(0, 50),
                        }
                      : s
                  )
                );
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }

      // Create final assistant message for saving
      const finalAssistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: fullContent,
        timestamp: new Date(),
        isStreaming: false,
      };

      // Save both messages to the session in database
      await saveMessageToSession(activeSessionId, userMessage);
      await saveMessageToSession(activeSessionId, finalAssistantMessage);
    } catch (error) {
      // Check if it was an abort (user stopped)
      if (error instanceof Error && error.name === 'AbortError') {
        // Mark message as stopped but keep content
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMessageId
                      ? {
                          ...m,
                          content:
                            m.content + '\n\n*[Response stopped by user]*',
                          isStreaming: false,
                        }
                      : m
                  ),
                }
              : s
          )
        );
      } else {
        console.error('Chat error:', error);

        // Update the message with error
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMessageId
                      ? {
                          ...m,
                          content: `❌ **Error:** ${error instanceof Error ? error.message : 'Something went wrong. Please try again.'}`,
                          isStreaming: false,
                        }
                      : m
                  ),
                }
              : s
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      // Legacy: also save to interactions for analytics
      const updatedSession = sessions.find((s) => s.id === activeSessionId);
      if (updatedSession) {
        saveSession(updatedSession);
      }
    }
  }, [
    inputValue,
    attachments,
    activeSession,
    activeSessionId,
    isLoading,
    agent.id,
    settings.provider,
    settings.model,
    settings.temperature,
    settings.maxTokens,
    settings.systemPrompt,
    settings.mode,
    sessions,
    saveSession,
    saveMessageToSession,
  ]);

  // Stop generation function
  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return (
    <EnhancedChatLayout
      agentId={agent.id}
      agentName={agent.name}
      agentIcon={agent.icon}
      sessions={sessions}
      activeSessionId={activeSessionId}
      onNewSession={handleNewSession}
      onSelectSession={handleSelectSession}
      onDeleteSession={handleDeleteSession}
      onRenameSession={handleRenameSession}
      onExportSession={handleExportSession}
      settings={settings}
      onUpdateSettings={handleUpdateSettings}
      onResetSettings={handleResetSettings}
      externalUrl="https://onelastai.co/dashboard/overview"
    >
      <div className="flex flex-col h-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {activeSession?.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    : isNeural
                      ? 'bg-[#2B2B2B] border border-gray-700/50 !text-[#E5E7EB]'
                      : 'bg-[#2B2B2B] border border-gray-700/50 !text-[#E5E7EB]'
                }`}
              >
                <div
                  className={`prose prose-sm max-w-none ${
                    message.role === 'user'
                      ? 'prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white prose-a:text-white/90 prose-li:text-white'
                      : 'prose-invert !text-[#E5E7EB] prose-p:!text-[#E5E7EB] prose-headings:!text-white prose-strong:!text-[#7C6CFF] prose-strong:!font-bold prose-a:!text-[#7C6CFF] prose-li:!text-[#E5E7EB] prose-em:!text-[#9CA3AF]'
                  }`}
                  style={
                    message.role !== 'user'
                      ? { color: '#E5E7EB' }
                      : undefined
                  }
                >
                  {/* Display attachments (images as thumbnails) */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {message.attachments.map((attachment, idx) => (
                        <div key={idx}>
                          {attachment.type.startsWith('image/') &&
                          attachment.preview ? (
                            <div className="relative group">
                              <img
                                src={attachment.preview}
                                alt={attachment.name}
                                className="max-w-[200px] max-h-[200px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() =>
                                  attachment.url &&
                                  window.open(attachment.url, '_blank')
                                }
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                {attachment.name}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-black/10 rounded-lg text-sm">
                              <span>📎</span>
                              <span className="truncate">
                                {attachment.name}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Render extracted base64 images (AI generated images) */}
                  {(() => {
                    const { images } = extractBase64Images(message.content);
                    if (images.length === 0) return null;
                    
                    return (
                      <div className="mb-3 space-y-3">
                        {images.map((image, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={image.src}
                              alt={image.alt}
                              className="max-w-full rounded-lg shadow-lg cursor-pointer hover:opacity-95 transition-opacity"
                              onClick={() => setPreviewImage({ src: image.src, alt: image.alt })}
                            />
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  try {
                                    const [header, base64Data] = image.src.split(',');
                                    const mimeMatch = header.match(/data:([^;]+)/);
                                    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
                                    const byteCharacters = atob(base64Data);
                                    const byteNumbers = new Array(byteCharacters.length);
                                    for (let i = 0; i < byteCharacters.length; i++) {
                                      byteNumbers[i] = byteCharacters.charCodeAt(i);
                                    }
                                    const byteArray = new Uint8Array(byteNumbers);
                                    const blob = new Blob([byteArray], { type: mimeType });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = image.alt || `generated-image-${Date.now()}.png`;
                                    a.style.display = 'none';
                                    document.body.appendChild(a);
                                    a.click();
                                    setTimeout(() => {
                                      document.body.removeChild(a);
                                      window.URL.revokeObjectURL(url);
                                    }, 100);
                                  } catch (err) {
                                    console.error('Download failed:', err);
                                  }
                                }}
                                className="bg-black/70 hover:bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-lg"
                                title="Download image"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewImage({ src: image.src, alt: image.alt });
                                }}
                                className="bg-black/70 hover:bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-lg"
                                title="Open full size"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Open
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  
                  <div style={message.role !== 'user' ? { color: '#E5E7EB', fontSize: '14px', lineHeight: '1.5' } : undefined}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      // Custom image renderer with download button and modal preview
                      img({ src, alt, ...props }) {
                        const handleDownload = async (e: React.MouseEvent) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (!src) return;

                          const filename =
                            alt || `generated-image-${Date.now()}.png`;

                          try {
                            // Handle base64 data URLs directly (no proxy needed)
                            if (src.startsWith('data:')) {
                              // Extract the base64 data and create a blob
                              const [header, base64Data] = src.split(',');
                              const mimeMatch = header.match(/data:([^;]+)/);
                              const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
                              
                              const byteCharacters = atob(base64Data);
                              const byteNumbers = new Array(byteCharacters.length);
                              for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                              }
                              const byteArray = new Uint8Array(byteNumbers);
                              const blob = new Blob([byteArray], { type: mimeType });
                              
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = filename;
                              a.style.display = 'none';
                              document.body.appendChild(a);
                              a.click();
                              setTimeout(() => {
                                document.body.removeChild(a);
                                window.URL.revokeObjectURL(url);
                              }, 100);
                              return;
                            }

                            // Use our proxy endpoint to bypass CORS for remote URLs
                            const proxyUrl = `/api/uploads/proxy-download?url=${encodeURIComponent(src)}&filename=${encodeURIComponent(filename)}`;

                            const response = await fetch(proxyUrl);
                            if (!response.ok) throw new Error('Proxy failed');

                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = filename;
                            a.style.display = 'none';
                            document.body.appendChild(a);
                            a.click();
                            setTimeout(() => {
                              document.body.removeChild(a);
                              window.URL.revokeObjectURL(url);
                            }, 100);
                          } catch (error) {
                            console.error('Download failed:', error);
                            // Last resort: open image in new tab for manual save
                            window.open(src, '_blank');
                          }
                        };

                        return (
                          <div className="relative group my-3">
                            <img
                              src={src}
                              alt={alt}
                              className="max-w-full rounded-lg shadow-lg cursor-pointer hover:opacity-95 transition-opacity"
                              onClick={() => setPreviewImage({ src: src || '', alt: alt || '' })}
                              {...props}
                            />
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <button
                                onClick={handleDownload}
                                className="bg-black/70 hover:bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-lg"
                                title="Download image"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                  />
                                </svg>
                                Download
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle base64 data URLs - create blob URL for new tab
                                  if (src?.startsWith('data:')) {
                                    try {
                                      const [header, base64Data] = src.split(',');
                                      const mimeMatch = header.match(/data:([^;]+)/);
                                      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
                                      
                                      const byteCharacters = atob(base64Data);
                                      const byteNumbers = new Array(byteCharacters.length);
                                      for (let i = 0; i < byteCharacters.length; i++) {
                                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                                      }
                                      const byteArray = new Uint8Array(byteNumbers);
                                      const blob = new Blob([byteArray], { type: mimeType });
                                      const blobUrl = window.URL.createObjectURL(blob);
                                      window.open(blobUrl, '_blank');
                                      // Clean up after a delay
                                      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
                                    } catch (err) {
                                      console.error('Failed to open base64 image:', err);
                                    }
                                  } else {
                                    window.open(src, '_blank');
                                  }
                                }}
                                className="bg-black/70 hover:bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-lg"
                                title="Open full size"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                                Open
                              </button>
                            </div>
                          </div>
                        );
                      },
                      // Custom ordered list with bright numbers
                      ol({ children, ...props }) {
                        return (
                          <ol className="list-none space-y-2 my-3" {...props}>
                            {children}
                          </ol>
                        );
                      },
                      // Custom list item with colorful number badge
                      li({ children, ordered, index, ...props }) {
                        // Check if parent is ordered list by looking at context
                        const isOrdered =
                          (props as any).node?.parent?.tagName === 'ol';
                        if (isOrdered || ordered) {
                          const num =
                            (props as any).node?.position?.start?.line ||
                            index ||
                            0;
                          return (
                            <li className="flex items-start gap-3" {...props}>
                              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm flex items-center justify-center shadow-lg">
                                {num}
                              </span>
                              <div className="flex-1 pt-0.5">{children}</div>
                            </li>
                          );
                        }
                        return (
                          <li
                            className="flex items-start gap-3 my-2"
                            {...props}
                          >
                            <span
                              className={`flex-shrink-0 w-2.5 h-2.5 mt-2 rounded-full bg-gradient-to-r ${isNeural ? 'from-[#7C6CFF] to-[#7C6CFF] shadow-sm shadow-purple-500/30' : 'from-indigo-500 to-purple-500'}`}
                            ></span>
                            <div
                              className={`flex-1 ${isNeural ? '!text-[#E5E7EB]' : 'text-gray-700'}`}
                              style={isNeural ? { color: '#E5E7EB' } : undefined}
                            >
                              {children}
                            </div>
                          </li>
                        );
                      },
                      // Custom strong/bold text with purple color
                      strong({ children, ...props }) {
                        return (
                          <strong
                            className={`font-bold ${isNeural ? '!text-[#7C6CFF]' : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600'}`}
                            style={isNeural ? { color: '#7C6CFF' } : undefined}
                            {...props}
                          >
                            {children}
                          </strong>
                        );
                      },
                      // Custom paragraph with better spacing
                      p({ children, ...props }) {
                        return (
                          <p
                            className={`my-2 leading-relaxed ${isNeural ? '!text-[#E5E7EB]' : 'text-gray-700'}`}
                            style={isNeural ? { color: '#E5E7EB' } : undefined}
                            {...props}
                          >
                            {children}
                          </p>
                        );
                      },
                      // Custom headings with gradient colors
                      h1({ children, ...props }) {
                        return (
                          <h1
                            className={`text-xl font-bold my-3 ${isNeural ? '!text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600'}`}
                            style={isNeural ? { color: '#FFFFFF' } : undefined}
                            {...props}
                          >
                            {children}
                          </h1>
                        );
                      },
                      h2({ children, ...props }) {
                        return (
                          <h2
                            className={`text-lg font-bold my-2.5 ${isNeural ? '!text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600'}`}
                            {...props}
                          >
                            {children}
                          </h2>
                        );
                      },
                      h3({ children, ...props }) {
                        return (
                          <h3
                            className={`text-base font-semibold my-2 ${isNeural ? '!text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600'}`}
                            {...props}
                          >
                            {children}
                          </h3>
                        );
                      },
                      code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = extractTextFromChildren(children).replace(/\n$/, '');

                        const handleCopy = async () => {
                          try {
                            await navigator.clipboard.writeText(codeString);
                          } catch (err) {
                            console.error('Failed to copy:', err);
                          }
                        };

                        if (inline) {
                          return (
                            <code
                              className={`px-1.5 py-0.5 rounded ${className || ''}`}
                              style={{
                                backgroundColor: '#1a1a1a',
                                color: '#7C6CFF',
                                border: '1px solid rgba(124, 108, 255, 0.2)'
                              }}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }
                        return (
                          <div className="relative group my-3">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <button
                                onClick={handleCopy}
                                className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                                style={{
                                  backgroundColor: 'rgba(124, 108, 255, 0.1)',
                                  color: '#7C6CFF',
                                  border: '1px solid rgba(124, 108, 255, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(124, 108, 255, 0.2)';
                                  e.currentTarget.style.borderColor = 'rgba(124, 108, 255, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(124, 108, 255, 0.1)';
                                  e.currentTarget.style.borderColor = 'rgba(124, 108, 255, 0.3)';
                                }}
                                title="Copy code"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                                Copy
                              </button>
                            </div>
                            <pre
                              className={`rounded-lg border overflow-x-auto p-3 pr-20 ${className || ''}`}
                              style={{
                                backgroundColor: '#0f0f0f',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
                                color: '#E5E7EB'
                              }}
                            >
                              <code
                                className={match ? `language-${match[1]}` : ''}
                                {...props}
                              >
                                {children}
                              </code>
                            </pre>
                          </div>
                        );
                      },
                      // Custom table styling for theme awareness
                      table({ children, ...props }) {
                        return (
                          <div className="overflow-x-auto my-4">
                            <table
                              className={`min-w-full border-collapse rounded-lg overflow-hidden ${isNeural ? 'bg-gray-800/50' : 'bg-white shadow-sm'}`}
                              {...props}
                            >
                              {children}
                            </table>
                          </div>
                        );
                      },
                      thead({ children, ...props }) {
                        return (
                          <thead
                            className={`${isNeural ? 'bg-gray-700/80' : 'bg-indigo-50'}`}
                            {...props}
                          >
                            {children}
                          </thead>
                        );
                      },
                      tbody({ children, ...props }) {
                        return (
                          <tbody
                            className={`${isNeural ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}`}
                            {...props}
                          >
                            {children}
                          </tbody>
                        );
                      },
                      tr({ children, ...props }) {
                        return (
                          <tr
                            className={`${isNeural ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}
                            {...props}
                          >
                            {children}
                          </tr>
                        );
                      },
                      th({ children, ...props }) {
                        return (
                          <th
                            className={`px-4 py-3 text-left text-sm font-semibold ${isNeural ? 'text-cyan-400' : 'text-indigo-700'}`}
                            {...props}
                          >
                            {children}
                          </th>
                        );
                      },
                      td({ children, ...props }) {
                        return (
                          <td
                            className={`px-4 py-3 text-sm ${isNeural ? 'text-amber-50' : 'text-gray-700'}`}
                            {...props}
                          >
                            {children}
                          </td>
                        );
                      },
                    }}
                  >
                    {extractBase64Images(message.content).cleanContent}
                  </ReactMarkdown>
                  </div>
                  {/* Blinking cursor during streaming */}
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-5 ml-1 bg-current animate-pulse rounded-sm" />
                  )}
                </div>
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user'
                      ? 'text-white/60'
                      : isNeural
                        ? 'text-gray-300'
                        : 'text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>

                {message.role === 'assistant' && (
                  <div
                    className={`flex items-center space-x-1 mt-2 pt-2 border-t relative z-50 ${isNeural ? 'border-gray-600' : 'border-gray-100'}`}
                  >
                    <button
                      onClick={() => handleFeedback(message.id, 'up')}
                      className={`p-1.5 rounded-lg transition-all ${
                        messageFeedback[message.id] === 'up'
                          ? 'bg-green-100 text-green-600'
                          : isNeural
                            ? 'hover:bg-gray-700 text-gray-300 hover:text-gray-100'
                            : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                      }`}
                      title="Good response"
                    >
                      <HandThumbUpIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, 'down')}
                      className={`p-1.5 rounded-lg transition-all ${
                        messageFeedback[message.id] === 'down'
                          ? 'bg-red-100 text-red-600'
                          : isNeural
                            ? 'hover:bg-gray-700 text-gray-300 hover:text-gray-100'
                            : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                      }`}
                      title="Poor response"
                    >
                      <HandThumbDownIcon className="w-4 h-4" />
                    </button>
                    <div
                      className={`w-px h-4 mx-1 ${isNeural ? 'bg-gray-600' : 'bg-gray-200'}`}
                    />
                    <button
                      onClick={() =>
                        handleCopyMessage(message.id, message.content)
                      }
                      className={`p-1.5 rounded-lg transition-all ${
                        copiedMessageId === message.id
                          ? 'bg-indigo-100 text-indigo-600'
                          : isNeural
                            ? 'hover:bg-gray-700 text-gray-300 hover:text-gray-100'
                            : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                      }`}
                      title={
                        copiedMessageId === message.id
                          ? 'Copied!'
                          : 'Copy message'
                      }
                    >
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShareMessage(message.content)}
                      className={`p-1.5 rounded-lg transition-all ${isNeural ? 'hover:bg-gray-700 text-gray-300 hover:text-gray-100' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                      title="Share message"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleListenMessage(message.content, message.id)}
                      className={`p-1.5 rounded-lg transition-all ${speakingMessageId === message.id ? (isNeural ? 'bg-purple-600 text-white' : 'bg-indigo-500 text-white') : (isNeural ? 'hover:bg-gray-700 text-gray-300 hover:text-gray-100' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600')}`}
                      title={speakingMessageId === message.id ? "Stop speaking" : "Listen to message"}
                    >
                      {speakingMessageId === message.id ? (
                        <StopIcon className="w-4 h-4" />
                      ) : (
                        <SpeakerWaveIcon className="w-4 h-4" />
                      )}
                    </button>
                    <div
                      className={`w-px h-4 mx-1 ${isNeural ? 'bg-gray-600' : 'bg-gray-200'}`}
                    />
                    <button
                      onClick={() => handleRegenerateMessage(message.id)}
                      disabled={isLoading}
                      className={`p-1.5 rounded-lg transition-all ${
                        isLoading
                          ? 'opacity-50 cursor-not-allowed'
                          : isNeural
                            ? 'hover:bg-gray-700 text-gray-300 hover:text-gray-100'
                            : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                      }`}
                      title="Regenerate response"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* User message actions */}
                {message.role === 'user' && (
                  <>
                    {editingMessageId === message.id ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          placeholder="Edit your message..."
                          className="w-full p-2 rounded-lg bg-white/10 text-white text-sm resize-none border border-white/20 focus:border-indigo-400 focus:outline-none"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-xs text-white/70 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(message.id)}
                            disabled={isLoading || !editingContent.trim()}
                            className="px-3 py-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50"
                          >
                            Save & Regenerate
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end space-x-1 mt-2 pt-2 border-t border-white/10 relative">
                        <button
                          onClick={() => handleCopyUserMessage(message.content)}
                          className="p-1.5 rounded-lg transition-all text-white/60 hover:text-white hover:bg-white/10"
                          title="Copy message"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStartEdit(message.id, message.content)}
                          disabled={isLoading}
                          className={`p-1.5 rounded-lg transition-all text-white/60 hover:text-white hover:bg-white/10 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Edit message"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${isNeural ? 'bg-gray-800/90 border border-gray-700' : 'bg-white border border-gray-200'}`}
              >
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                  <span
                    className={`text-xs ${isNeural ? 'text-gray-300' : 'text-gray-500'}`}
                  >
                    {agent.name} is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions Panel */}
        <QuickActionsPanel
          onSelectAction={(prompt) => setInputValue(prompt)}
          theme={isNeural ? 'neural' : 'default'}
          isCollapsed={isQuickActionsCollapsed}
          onToggleCollapse={() =>
            setIsQuickActionsCollapsed(!isQuickActionsCollapsed)
          }
        />

        {/* Input Area */}
        <div
          className={`flex-shrink-0 px-4 py-2 border-t backdrop-blur-sm ${isNeural ? 'border-gray-700 bg-gray-900/80' : 'border-gray-200 bg-white/80'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            aria-label="File upload"
            multiple
            onChange={(e) => {
              handleFilesSelected(e.target.files);
              e.target.value = '';
            }}
          />

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-1 pb-2">
              {attachments.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className={`flex items-center space-x-2 rounded-lg px-2 py-1 text-xs ${isNeural ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  <span
                    className="font-medium truncate max-w-[140px]"
                    title={`${file.name} (${file.type || 'file'})`}
                  >
                    {file.name}
                  </span>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() =>
                      setAttachments((prev) => prev.filter((_, i) => i !== idx))
                    }
                    aria-label={`Remove ${file.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <button
              type="button"
              onClick={handleMicrophoneToggle}
              className={`p-2.5 rounded-xl transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse ring-2 ring-red-300 ring-offset-2'
                  : isNeural
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300 cursor-pointer'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer'
              }`}
              title={
                isRecording
                  ? 'Click to stop recording'
                  : hasSpeechRecognition
                    ? 'Click to speak (Speech to Text)'
                    : 'Speech recognition not available - Click to learn more'
              }
            >
              {isRecording ? (
                <StopIcon className="w-5 h-5" />
              ) : (
                <MicrophoneIcon className="w-5 h-5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2.5 rounded-xl transition-all ${isNeural ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Upload File"
            >
              <PaperClipIcon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => alert('Voice-to-Voice coming soon!')}
              className={`p-2.5 rounded-xl transition-all ${isNeural ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              title="Voice Conversation"
            >
              <PhoneIcon className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Message ${agent.name}...`}
                className={`w-full px-4 py-3 pr-12 rounded-xl border transition-all ${isNeural ? 'border-gray-700 bg-gray-800 text-gray-100 placeholder:text-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent' : 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'}`}
                disabled={isLoading}
              />
              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white transition-all hover:from-red-600 hover:to-rose-700"
                  title="Stop generating"
                >
                  <StopIcon className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:from-indigo-600 hover:to-purple-700"
                  title="Send message"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>

          {!hasSpeechRecognition && (
            <p
              className={`mt-1 text-[11px] ${isNeural ? 'text-gray-500' : 'text-gray-400'}`}
            >
              Speech recognition not available in this browser.
            </p>
          )}

          <div className="mt-1 text-center">
            <p
              className={`text-[10px] ${isNeural ? 'text-gray-500' : 'text-gray-400'}`}
            >
              AI digital friend can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={previewImage.src}
              alt={previewImage.alt}
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const filename = previewImage.alt || `generated-image-${Date.now()}.png`;
                  try {
                    // Handle base64 data URLs directly (no proxy needed)
                    if (previewImage.src.startsWith('data:')) {
                      const [header, base64Data] = previewImage.src.split(',');
                      const mimeMatch = header.match(/data:([^;]+)/);
                      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
                      
                      const byteCharacters = atob(base64Data);
                      const byteNumbers = new Array(byteCharacters.length);
                      for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                      }
                      const byteArray = new Uint8Array(byteNumbers);
                      const blob = new Blob([byteArray], { type: mimeType });
                      
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = filename;
                      a.style.display = 'none';
                      document.body.appendChild(a);
                      a.click();
                      setTimeout(() => {
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                      }, 100);
                      return;
                    }

                    // Use proxy for remote URLs
                    const proxyUrl = `/api/uploads/proxy-download?url=${encodeURIComponent(previewImage.src)}&filename=${encodeURIComponent(filename)}`;
                    const response = await fetch(proxyUrl);
                    if (!response.ok) throw new Error('Proxy failed');
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    }, 100);
                  } catch (error) {
                    console.error('Download failed:', error);
                    // Last resort: open image in new tab for manual save
                    window.open(previewImage.src, '_blank');
                  }
                }}
                className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg"
                title="Download image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              <button
                onClick={() => setPreviewImage(null)}
                className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-lg shadow-lg"
                title="Close preview"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-center text-white/70 text-sm mt-3">Click outside or press close to exit preview</p>
          </div>
        </div>
      )}
    </EnhancedChatLayout>
  );
}
