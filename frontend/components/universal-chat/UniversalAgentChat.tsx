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
} from '@heroicons/react/24/solid';
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  ClipboardDocumentIcon,
  ShareIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline';
import EnhancedChatLayout, { useChatTheme } from './EnhancedChatLayout';
import { AgentSettings } from './ChatSettingsPanel';
import QuickActionsPanel from './QuickActionsPanel';
import realtimeChatService, {
  ChatMessage as ServiceChatMessage,
  AgentConfig,
  CodeBlock,
} from './realtimeChatService';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  codeBlocks?: CodeBlock[];
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

export default function UniversalAgentChat({ agent }: UniversalAgentChatProps) {
  // Auth
  const { state: authState } = useAuth();

  // Theme state
  const { isNeural } = useChatTheme(agent.id);

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Settings state - use agent's AI provider config if available
  const [settings, setSettings] = useState<AgentSettings>({
    temperature: 0.7,
    maxTokens: 2000,
    mode: 'balanced',
    systemPrompt: '',
    provider: agent.aiProvider?.primary || 'mistral',
    model: agent.aiProvider?.model || 'mistral-large-latest',
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
      setInputValue((prev) => `${prev.trim()} ${transcript}`.trim());
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (isRecording) {
      try {
        recognition.start();
      } catch (err) {
        console.error('Speech recognition start failed', err);
        setIsRecording(false);
      }
    } else {
      recognition.stop();
    }
  }, [isRecording]);

  const isValidObjectId = useCallback(
    (value: string) => /^[0-9a-fA-F]{24}$/.test(value),
    []
  );

  const fetchSessionMessages = useCallback(async (sessionId: string) => {
    try {
      const resp = await fetch(`/api/chat/sessions/${sessionId}`, {
        credentials: 'include',
      });
      if (!resp.ok) return;
      const data = await resp.json();
      if (data.success && data.session) {
        const msgs = (data.session.messages || []).map((msg: any) => ({
          id: msg.id || `msg-${Date.now()}-${Math.random()}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp || msg.createdAt),
        }));
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
  }, []);

  // Load sessions from database
  const loadSessions = useCallback(async () => {
    if (!authState.isAuthenticated || !authState.user) {
      // For non-authenticated users, keep default session
      return;
    }

    try {
      const query = isValidObjectId(agent.id) ? `?agentId=${agent.id}` : '';
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

  // Save session to database
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
      };
      if (isValidObjectId(agent.id)) {
        body.agentId = agent.id;
      }

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
        const session: ChatSession = {
          id: data.session.id,
          name: data.session.name,
          messages: [],
          lastMessage: '',
          messageCount: 0,
          updatedAt: new Date(data.session.updatedAt || Date.now()),
        };
        setSessions((prev) => [session, ...prev]);
        setActiveSessionId(session.id);
        await fetchSessionMessages(session.id);
      }
    } catch (err) {
      console.error('Error creating session', err);
    }
  }, [agent.id, sessions.length, fetchSessionMessages, isValidObjectId]);

  const handleSelectSession = useCallback(
    (id: string) => {
      setActiveSessionId(id);
      fetchSessionMessages(id);
    },
    [fetchSessionMessages]
  );

  const handleDeleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        if (activeSessionId === id && filtered.length > 0) {
          setActiveSessionId(filtered[0].id);
        }
        return filtered;
      });
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

  const handleListenMessage = useCallback(async (content: string) => {
    if (typeof window === 'undefined') return;

    const cleanText = content
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`(.*?)`/g, '$1')
      .replace(/^#+\s/gm, '')
      .replace(/^[•-]\s/gm, '')
      .replace(/>\s/g, '');

    // Stop any currently playing audio
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Try ElevenLabs first, fall back to browser TTS
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        ttsAudioRef.current = audio;
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          ttsAudioRef.current = null;
        };
        await audio.play();
        return;
      }
    } catch (err) {
      console.warn('ElevenLabs TTS failed, using browser TTS:', err);
    }

    // Fallback to browser speechSynthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (
      (!inputValue.trim() && attachments.length === 0) ||
      !activeSession ||
      isLoading
    )
      return;

    const attachmentText =
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
      content: `${attachmentText}${inputValue}`.trim(),
      timestamp: new Date(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: [...s.messages, userMessage],
              lastMessage: inputValue.slice(0, 50),
              messageCount: s.messages.length + 1,
              updatedAt: new Date(),
            }
          : s
      )
    );

    const userInput = `${attachmentText}${inputValue}`.trim();
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
      // Use the new agent chat API
      const response = await fetch('/api/agent/chat', {
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
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Update the assistant message with the response
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMessageId
                    ? {
                        ...m,
                        content: data.message,
                        isStreaming: false,
                      }
                    : m
                ),
                lastMessage: data.message.slice(0, 50),
              }
            : s
        )
      );
    } catch (error) {
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
    } finally {
      setIsLoading(false);
      // Save session to database after message exchange
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
  ]);

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
                      ? 'bg-gray-800/90 border border-gray-700 text-gray-50'
                      : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        if (inline) {
                          return (
                            <code
                              className={`px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 ${className || ''}`}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }
                        return (
                          <pre
                            className={`rounded-lg border border-gray-200 bg-gray-900 text-gray-100 overflow-x-auto p-3 ${className || ''}`}
                          >
                            <code
                              className={match ? `language-${match[1]}` : ''}
                              {...props}
                            >
                              {children}
                            </code>
                          </pre>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
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
                    className={`flex items-center space-x-1 mt-2 pt-2 border-t ${isNeural ? 'border-gray-600' : 'border-gray-100'}`}
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
                      onClick={() => handleListenMessage(message.content)}
                      className={`p-1.5 rounded-lg transition-all ${isNeural ? 'hover:bg-gray-700 text-gray-300 hover:text-gray-100' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                      title="Listen to message"
                    >
                      <SpeakerWaveIcon className="w-4 h-4" />
                    </button>
                  </div>
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
          theme="default"
          isCollapsed={isQuickActionsCollapsed}
          onToggleCollapse={() =>
            setIsQuickActionsCollapsed(!isQuickActionsCollapsed)
          }
        />

        {/* Input Area */}
        <div className="flex-shrink-0 px-4 py-2 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
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
                  className="flex items-center space-x-2 rounded-lg bg-gray-100 text-gray-700 px-2 py-1 text-xs"
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
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2.5 rounded-xl transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              disabled={!hasSpeechRecognition}
              title={
                hasSpeechRecognition
                  ? 'Speech to Text'
                  : 'Speech recognition not available in this browser'
              }
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              title="Upload File"
            >
              <PaperClipIcon className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => alert('Voice-to-Voice coming soon!')}
              className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
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
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:from-indigo-600 hover:to-purple-700"
              >
                {isLoading ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <PaperAirplaneIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>

          {!hasSpeechRecognition && (
            <p className="mt-1 text-[11px] text-gray-400">
              Speech recognition not available in this browser.
            </p>
          )}

          <div className="mt-1 text-center">
            <p className="text-[10px] text-gray-400">
              AI digital friend can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </EnhancedChatLayout>
  );
}
