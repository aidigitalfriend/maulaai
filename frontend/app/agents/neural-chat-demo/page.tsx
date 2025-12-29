'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  PaperAirplaneIcon,
  StopIcon,
  CodeBracketIcon,
  ClipboardDocumentIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  SpeakerWaveIcon,
  ShareIcon,
  XMarkIcon,
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import realtimeChatService, {
  ChatMessage,
  AgentConfig,
} from '../../../services/realtimeChatService';

interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// System prompts for different AI modes
const AI_MODES = {
  assistant: {
    name: 'AI Assistant',
    icon: '🤖',
    prompt:
      'You are a helpful, knowledgeable AI assistant. Provide clear, accurate, and thoughtful responses. When coding, provide well-commented code with explanations.',
    color: 'indigo',
  },
  coder: {
    name: 'Code Expert',
    icon: '💻',
    prompt:
      'You are an expert programmer. Provide clean, efficient, well-documented code. Always explain your approach and suggest improvements. Include code examples when helpful.',
    color: 'green',
  },
  analyst: {
    name: 'Data Analyst',
    icon: '📊',
    prompt:
      'You are a data analysis expert. Help with data interpretation, statistics, and visualization advice. Provide structured insights and actionable recommendations.',
    color: 'blue',
  },
  creative: {
    name: 'Creative Writer',
    icon: '✨',
    prompt:
      'You are a creative writing assistant. Help with creative content, storytelling, marketing copy, and engaging text. Be imaginative while maintaining clarity.',
    color: 'purple',
  },
};

type AIMode = keyof typeof AI_MODES;

export default function NeuralChatPro() {
  // Session management
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: realtimeChatService.generateSessionId(),
      name: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>(
    sessions[0].id
  );

  // Chat state
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [currentMode, setCurrentMode] = useState<AIMode>('assistant');

  // UI state
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasCode, setCanvasCode] = useState('// Start coding here...\n');
  const [canvasLanguage, setCanvasLanguage] = useState('javascript');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<
    Record<string, 'up' | 'down' | null>
  >({});
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Settings
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get current session
  const currentSession = sessions.find((s) => s.id === activeSessionId);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 150) + 'px';
    }
  }, [inputValue]);

  // Get agent config
  const getAgentConfig = useCallback(
    (): AgentConfig => ({
      id: 'neural-chat-pro',
      name: AI_MODES[currentMode].name,
      systemPrompt: AI_MODES[currentMode].prompt,
      model: 'mistral-small-latest',
      temperature,
      maxTokens,
      provider: 'mistral',
    }),
    [currentMode, temperature, maxTokens]
  );

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isGenerating || !currentSession) return;

    const userMessage: ChatMessage = {
      id: realtimeChatService.generateMessageId(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Update session with user message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: [...s.messages, userMessage],
              updatedAt: new Date(),
            }
          : s
      )
    );

    setInputValue('');
    setIsGenerating(true);
    setStreamingContent('');

    const assistantMessageId = realtimeChatService.generateMessageId();

    try {
      await realtimeChatService.sendMessageStream(
        userMessage.content,
        currentSession.messages,
        getAgentConfig(),
        {
          onToken: (token) => {
            setStreamingContent((prev) => prev + token);
          },
          onComplete: (fullMessage) => {
            const assistantMessage: ChatMessage = {
              id: assistantMessageId,
              role: 'assistant',
              content: fullMessage,
              timestamp: new Date(),
              codeBlocks: realtimeChatService.extractCodeBlocks(fullMessage),
            };

            setSessions((prev) =>
              prev.map((s) =>
                s.id === activeSessionId
                  ? {
                      ...s,
                      messages: [...s.messages, assistantMessage],
                      updatedAt: new Date(),
                      name:
                        s.messages.length === 0
                          ? userMessage.content.slice(0, 30) + '...'
                          : s.name,
                    }
                  : s
              )
            );

            setStreamingContent('');
            setIsGenerating(false);
          },
          onError: (error) => {
            console.error('Chat error:', error);
            const errorMessage: ChatMessage = {
              id: assistantMessageId,
              role: 'assistant',
              content: `❌ Error: ${error.message}. Please try again.`,
              timestamp: new Date(),
            };

            setSessions((prev) =>
              prev.map((s) =>
                s.id === activeSessionId
                  ? {
                      ...s,
                      messages: [...s.messages, errorMessage],
                      updatedAt: new Date(),
                    }
                  : s
              )
            );

            setStreamingContent('');
            setIsGenerating(false);
          },
          onCodeBlock: (codeBlock) => {
            setCanvasCode(codeBlock.code);
            setCanvasLanguage(codeBlock.language);
          },
        }
      );
    } catch {
      setIsGenerating(false);
      setStreamingContent('');
    }
  }, [
    inputValue,
    isGenerating,
    currentSession,
    activeSessionId,
    getAgentConfig,
  ]);

  // Stop generation
  const handleStopGeneration = useCallback(() => {
    realtimeChatService.cancelRequest();
    setIsGenerating(false);

    if (streamingContent) {
      const assistantMessage: ChatMessage = {
        id: realtimeChatService.generateMessageId(),
        role: 'assistant',
        content: streamingContent + '... (stopped)',
        timestamp: new Date(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: [...s.messages, assistantMessage],
                updatedAt: new Date(),
              }
            : s
        )
      );
    }

    setStreamingContent('');
  }, [streamingContent, activeSessionId]);

  // Create new session
  const handleNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: realtimeChatService.generateSessionId(),
      name: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }, []);

  // Delete session
  const handleDeleteSession = useCallback(
    (id: string) => {
      if (sessions.length === 1) {
        handleNewSession();
      }
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        const remaining = sessions.filter((s) => s.id !== id);
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        }
      }
    },
    [sessions, activeSessionId, handleNewSession]
  );

  // Copy message
  const handleCopyMessage = useCallback(
    (messageId: string, content: string) => {
      navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    },
    []
  );

  // Feedback
  const handleFeedback = useCallback(
    (messageId: string, type: 'up' | 'down') => {
      setMessageFeedback((prev) => ({
        ...prev,
        [messageId]: prev[messageId] === type ? null : type,
      }));
    },
    []
  );

  // Listen to message
  const handleListenMessage = useCallback((content: string) => {
    const cleanText = content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }, []);

  // Open code in canvas
  const handleOpenInCanvas = useCallback((code: string, language: string) => {
    setCanvasCode(code);
    setCanvasLanguage(language);
    setIsCanvasOpen(true);
  }, []);

  // Render markdown content
  const renderContent = (content: string) => {
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    let keyIndex = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={keyIndex++} className="whitespace-pre-wrap">
            {renderInlineFormatting(content.slice(lastIndex, match.index))}
          </span>
        );
      }

      // Add code block
      const language = match[1] || 'plaintext';
      const code = match[2].trim();
      parts.push(
        <div
          key={keyIndex++}
          className="my-3 rounded-lg overflow-hidden border border-gray-700"
        >
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
            <span className="text-xs text-gray-400 font-mono">{language}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Copy
              </button>
              <button
                onClick={() => handleOpenInCanvas(code, language)}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Open in Canvas
              </button>
            </div>
          </div>
          <pre className="p-4 bg-gray-900 overflow-x-auto">
            <code className="text-sm text-gray-100 font-mono">{code}</code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key={keyIndex++} className="whitespace-pre-wrap">
          {renderInlineFormatting(content.slice(lastIndex))}
        </span>
      );
    }

    return parts;
  };

  // Render inline formatting
  const renderInlineFormatting = (text: string) => {
    return text.split('\n').map((line, i) => {
      let formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(
          /`(.*?)`/g,
          '<code class="bg-gray-800 px-1 rounded text-cyan-400 font-mono text-sm">$1</code>'
        );

      if (line.startsWith('# ')) {
        return (
          <h1 key={i} className="text-xl font-bold mt-4 mb-2">
            {line.slice(2)}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={i} className="text-lg font-bold mt-3 mb-2">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={i} className="text-base font-bold mt-2 mb-1">
            {line.slice(4)}
          </h3>
        );
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={i} className="flex items-start space-x-2 ml-2">
            <span className="text-cyan-400">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatted.slice(2) }} />
          </div>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        const num = line.match(/^(\d+)\./)?.[1];
        return (
          <div key={i} className="flex items-start space-x-2 ml-2">
            <span className="text-cyan-400 font-medium">{num}.</span>
            <span
              dangerouslySetInnerHTML={{
                __html: formatted.replace(/^\d+\.\s/, ''),
              }}
            />
          </div>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={i}
            className="border-l-4 border-cyan-500 pl-3 italic text-gray-400 my-2"
          >
            <span dangerouslySetInnerHTML={{ __html: formatted.slice(2) }} />
          </blockquote>
        );
      }

      return (
        <span key={i} dangerouslySetInnerHTML={{ __html: formatted + '\n' }} />
      );
    });
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-72' : 'w-0'
        } transition-all duration-300 overflow-hidden border-r border-gray-800 flex flex-col bg-gray-900`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={handleNewSession}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl text-white font-medium hover:from-cyan-500 hover:to-purple-500 transition-all shadow-lg shadow-cyan-500/20"
          >
            <PlusIcon className="w-5 h-5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                session.id === activeSessionId
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
                  : 'hover:bg-gray-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <ChatBubbleLeftRightIcon
                  className={`w-5 h-5 flex-shrink-0 ${
                    session.id === activeSessionId
                      ? 'text-cyan-400'
                      : 'text-gray-500'
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{session.name}</p>
                  <p className="text-xs text-gray-500">
                    {session.messages.length} messages
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this chat?')) {
                    handleDeleteSession(session.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
              >
                <TrashIcon className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>

        {/* Mode Selector */}
        <div className="p-3 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-2 px-1">AI Mode</p>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(AI_MODES) as AIMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setCurrentMode(mode)}
                className={`flex items-center space-x-2 p-2 rounded-lg text-xs transition-all ${
                  currentMode === mode
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400'
                    : 'hover:bg-gray-800 text-gray-400'
                }`}
              >
                <span>{AI_MODES[mode].icon}</span>
                <span className="truncate">{AI_MODES[mode].name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-xl">{AI_MODES[currentMode].icon}</span>
              <div>
                <h1 className="font-semibold">{AI_MODES[currentMode].name}</h1>
                <p className="text-xs text-gray-500">Neural Chat Pro</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCanvasOpen(!isCanvasOpen)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                isCanvasOpen
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'hover:bg-gray-800 text-gray-400'
              }`}
            >
              <CodeBracketIcon className="w-5 h-5" />
              <span className="text-sm hidden sm:inline">Canvas</span>
            </button>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Cog6ToothIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Chat + Canvas Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Messages Area */}
          <div
            className={`flex-1 flex flex-col ${
              isCanvasOpen ? 'w-1/2' : 'w-full'
            } transition-all`}
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Welcome Message */}
              {currentSession?.messages.length === 0 && !streamingContent && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                  <div className="text-6xl">{AI_MODES[currentMode].icon}</div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {AI_MODES[currentMode].name}
                  </h2>
                  <p className="text-gray-400 max-w-md">
                    Start a conversation with AI. Ask questions, write code,
                    analyze data, or get creative.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {[
                      'Write a Python script',
                      'Explain quantum computing',
                      'Help me debug code',
                      'Create a marketing plan',
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => setInputValue(prompt)}
                        className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-300 transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {currentSession?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] ${
                      message.role === 'user' ? 'order-1' : ''
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white'
                          : 'bg-gray-800/80 border border-gray-700'
                      }`}
                    >
                      <div className="text-sm leading-relaxed">
                        {message.role === 'assistant'
                          ? renderContent(message.content)
                          : message.content}
                      </div>
                    </div>

                    {/* Message Actions (Assistant only) */}
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-1 mt-2 ml-2">
                        <button
                          onClick={() => handleFeedback(message.id, 'up')}
                          className={`p-1.5 rounded-lg transition-all ${
                            messageFeedback[message.id] === 'up'
                              ? 'bg-green-500/20 text-green-400'
                              : 'hover:bg-gray-800 text-gray-500 hover:text-gray-300'
                          }`}
                          title="Good response"
                        >
                          <HandThumbUpIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, 'down')}
                          className={`p-1.5 rounded-lg transition-all ${
                            messageFeedback[message.id] === 'down'
                              ? 'bg-red-500/20 text-red-400'
                              : 'hover:bg-gray-800 text-gray-500 hover:text-gray-300'
                          }`}
                          title="Poor response"
                        >
                          <HandThumbDownIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleCopyMessage(message.id, message.content)
                          }
                          className={`p-1.5 rounded-lg transition-all ${
                            copiedMessageId === message.id
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'hover:bg-gray-800 text-gray-500 hover:text-gray-300'
                          }`}
                          title={
                            copiedMessageId === message.id ? 'Copied!' : 'Copy'
                          }
                        >
                          <ClipboardDocumentIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleListenMessage(message.content)}
                          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-all"
                          title="Listen"
                        >
                          <SpeakerWaveIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({ text: message.content });
                            } else {
                              navigator.clipboard.writeText(message.content);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-all"
                          title="Share"
                        >
                          <ShareIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Streaming Response */}
              {streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-gray-800/80 border border-gray-700">
                    <div className="text-sm leading-relaxed">
                      {renderContent(streamingContent)}
                      <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1" />
                    </div>
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {isGenerating && !streamingContent && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/80 border border-gray-700 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/50">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`Message ${AI_MODES[currentMode].name}...`}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 resize-none transition-all"
                    rows={1}
                    disabled={isGenerating}
                  />
                </div>

                {isGenerating ? (
                  <button
                    onClick={handleStopGeneration}
                    className="p-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
                    title="Stop generation"
                  >
                    <StopIcon className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="p-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-xl hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              <p className="text-center text-xs text-gray-600 mt-2">
                AI can make mistakes. Verify important information.
              </p>
            </div>
          </div>

          {/* Canvas Panel */}
          {isCanvasOpen && (
            <div className="w-1/2 border-l border-gray-800 flex flex-col bg-gray-900">
              {/* Canvas Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <div className="flex items-center space-x-2">
                  <CodeBracketIcon className="w-5 h-5 text-cyan-400" />
                  <span className="font-medium">Code Canvas</span>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                    {canvasLanguage}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(canvasCode)}
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
                    title="Copy code"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsCanvasOpen(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
                    title="Close canvas"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 flex bg-gray-950">
                {/* Line Numbers */}
                <div className="w-12 py-4 text-right pr-3 select-none text-xs text-gray-600 border-r border-gray-800 font-mono">
                  {canvasCode.split('\n').map((_, i) => (
                    <div key={i} className="leading-6">
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Editor */}
                <textarea
                  value={canvasCode}
                  onChange={(e) => setCanvasCode(e.target.value)}
                  className="flex-1 p-4 bg-transparent outline-none resize-none font-mono text-sm leading-6 text-gray-100"
                  spellCheck={false}
                  style={{ tabSize: 2 }}
                />
              </div>

              {/* Canvas Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-800 text-xs text-gray-500">
                <span>{canvasCode.split('\n').length} lines</span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Ready</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-96 max-w-[90vw] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Temperature: {temperature.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Max Tokens: {maxTokens}
                </label>
                <input
                  type="range"
                  min="500"
                  max="4000"
                  step="100"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Short</span>
                  <span>Long</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-xl font-medium hover:from-cyan-500 hover:to-purple-500 transition-all"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
