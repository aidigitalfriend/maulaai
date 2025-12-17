'use client';

import { useState, useRef, useEffect } from 'react';
import {
  PaperAirplaneIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  TrashIcon,
  PaperClipIcon,
  DocumentIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  EllipsisHorizontalIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as HandThumbUpSolid,
  HandThumbDownIcon as HandThumbDownSolid,
} from '@heroicons/react/24/solid';
import {
  ChatMessage,
  FileAttachment,
  loadChatHistory,
  saveChatHistory,
  addMessageToHistory,
  updateMessageInHistory,
  clearChatHistory,
} from '../utils/chatStorage';
import PDFPreviewModal from './PDFPreviewModal';
import LanguageIndicator from './LanguageIndicator';
import {
  DetectedLanguage,
  detectLanguageWithOpenAI,
  generateMultilingualPrompt,
  getLanguageInfo,
} from '../utils/languageDetection';
import { getAppConfig, getVoiceConfig, validateConfig } from '../utils/config';

// Enhanced typing indicator with multiple states
const TypingIndicator = ({
  agentColor,
  stage = 'thinking',
}: {
  agentColor: string;
  stage?: 'thinking' | 'typing' | 'processing';
}) => {
  const getIndicatorContent = () => {
    switch (stage) {
      case 'processing':
        return (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent"></div>
            <span className="text-xs opacity-75">Processing...</span>
          </div>
        );
      case 'typing':
        return (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div
                className={`w-1.5 h-1.5 rounded-full animate-bounce ${agentColor
                  .replace('from-', 'bg-')
                  .replace('to-', '')
                  .split(' ')[0]
                  .replace('-100', '-500')}`}
                style={{ animationDelay: '0ms', animationDuration: '1.0s' }}
              ></div>
              <div
                className={`w-1.5 h-1.5 rounded-full animate-bounce ${agentColor
                  .replace('from-', 'bg-')
                  .replace('to-', '')
                  .split(' ')[0]
                  .replace('-100', '-500')}`}
                style={{ animationDelay: '150ms', animationDuration: '1.0s' }}
              ></div>
              <div
                className={`w-1.5 h-1.5 rounded-full animate-bounce ${agentColor
                  .replace('from-', 'bg-')
                  .replace('to-', '')
                  .split(' ')[0]
                  .replace('-100', '-500')}`}
                style={{ animationDelay: '300ms', animationDuration: '1.0s' }}
              ></div>
            </div>
            <span className="text-xs opacity-75">Typing...</span>
          </div>
        );
      default: // thinking
        return (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${agentColor
                  .replace('from-', 'bg-')
                  .replace('to-', '')
                  .split(' ')[0]
                  .replace('-100', '-400')}`}
                style={{ animationDelay: '0ms', animationDuration: '2.0s' }}
              ></div>
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${agentColor
                  .replace('from-', 'bg-')
                  .replace('to-', '')
                  .split(' ')[0]
                  .replace('-100', '-400')}`}
                style={{ animationDelay: '400ms', animationDuration: '2.0s' }}
              ></div>
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${agentColor
                  .replace('from-', 'bg-')
                  .replace('to-', '')
                  .split(' ')[0]
                  .replace('-100', '-400')}`}
                style={{ animationDelay: '800ms', animationDuration: '2.0s' }}
              ></div>
            </div>
            <span className="text-xs opacity-75">Thinking...</span>
          </div>
        );
    }
  };

  return <div className="flex items-center">{getIndicatorContent()}</div>;
};

// Typewriter effect component for streaming messages
const TypewriterText = ({
  text,
  speed = 30,
  onComplete,
  isActive = true,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
  isActive?: boolean;
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setDisplayText(text);
      return;
    }

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, isActive, onComplete]);

  // Reset when text changes
  useEffect(() => {
    if (isActive) {
      setDisplayText('');
      setCurrentIndex(0);
    }
  }, [text, isActive]);

  return (
    <span>
      {displayText}
      {isActive && currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
};

// Text highlighting utility for search results
const HighlightedText = ({
  text,
  searchQuery,
}: {
  text: string;
  searchQuery: string;
}) => {
  if (!searchQuery.trim()) return <span>{text}</span>;

  const regex = new RegExp(
    `(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi'
  );
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-300 text-black rounded px-1">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

// Agent Settings Interface
interface AgentSettings {
  temperature: number;
  maxTokens: number;
  mode: 'professional' | 'balanced' | 'creative' | 'fast';
  systemPrompt: string;
  model?: string;
}

interface ChatBoxProps {
  agentId: string;
  sessionId: string;
  agentName: string;
  agentColor: string;
  placeholder?: string;
  initialMessages?: ChatMessage[];
  onSendMessage?: (
    message: string,
    attachments?: FileAttachment[],
    detectedLanguage?: DetectedLanguage
  ) => Promise<string>;
  className?: string;
  allowFileUpload?: boolean;
  maxFileSize?: number; // in MB
  enableLanguageDetection?: boolean;
}

export default function ChatBox({
  agentId,
  sessionId,
  agentName,
  agentColor,
  placeholder = 'Type your message...',
  initialMessages,
  onSendMessage,
  className = '',
  allowFileUpload = true,
  maxFileSize = 10,
  enableLanguageDetection = true,
}: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingStage, setTypingStage] = useState<
    'thinking' | 'processing' | 'typing'
  >('thinking');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    { messageId: string; messageIndex: number }[]
  >([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [agentSettings, setAgentSettings] = useState<AgentSettings>({
    temperature: 0.7,
    maxTokens: 2000,
    mode: 'balanced',
    systemPrompt: '',
    model: 'gpt-3.5-turbo',
  });

  const [pdfPreview, setPdfPreview] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [detectedLanguage, setDetectedLanguage] =
    useState<DetectedLanguage | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);

  // Mode configurations
  const modeConfigs = {
    professional: {
      temp: 0.3,
      tokens: 1500,
      desc: 'Precise, formal, and accurate responses',
    },
    balanced: {
      temp: 0.7,
      tokens: 2000,
      desc: 'Mix of creativity and accuracy',
    },
    creative: {
      temp: 0.9,
      tokens: 2500,
      desc: 'More creative and explorative responses',
    },
    fast: { temp: 0.5, tokens: 1000, desc: 'Quick, concise responses' },
  };

  // Close settings panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        settingsPanelRef.current &&
        !settingsPanelRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    }

    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSettingsOpen]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(`agent-settings-${agentId}`);
    if (savedSettings) {
      setAgentSettings(JSON.parse(savedSettings));
    }
  }, [agentId]);

  // Save settings to localStorage
  const updateSettings = (newSettings: Partial<AgentSettings>) => {
    const updated = { ...agentSettings, ...newSettings };
    setAgentSettings(updated);
    localStorage.setItem(`agent-settings-${agentId}`, JSON.stringify(updated));
  };

  const handleModeChange = (mode: AgentSettings['mode']) => {
    const config = modeConfigs[mode];
    updateSettings({
      mode,
      temperature: config.temp,
      maxTokens: config.tokens,
    });
  };

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const results: { messageId: string; messageIndex: number }[] = [];
    messages.forEach((message, index) => {
      if (message.content.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          messageId: message.id,
          messageIndex: index,
        });
      }
    });

    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);

    if (results.length > 0) {
      const messageElement = document.getElementById(
        `message-${results[0].messageId}`
      );
      messageElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    const history = loadChatHistory(agentId, sessionId);
    if (history.length > 0) {
      setMessages(history);
    } else if (initialMessages) {
      setMessages(initialMessages);
      saveChatHistory(agentId, sessionId, initialMessages);
    }
  }, [agentId, sessionId, initialMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(agentId, sessionId, messages);
    }
  }, [messages, agentId, sessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [messages, isLoading]);

  const handleFeedback = (
    messageId: string,
    feedback: 'positive' | 'negative'
  ) => {
    const updatedMessages = messages.map((msg) => {
      if (msg.id === messageId) {
        const newFeedback = msg.feedback === feedback ? null : feedback;
        updateMessageInHistory(agentId, sessionId, messageId, {
          feedback: newFeedback,
        });
        return { ...msg, feedback: newFeedback };
      }
      return msg;
    });
    setMessages(updatedMessages);
  };

  const handleClearChat = () => {
    clearChatHistory(agentId, sessionId);
    setMessages(initialMessages || []);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
      attachments: attachments,
    };

    setMessages((prev) => [...prev, userMessage]);
    addMessageToHistory(agentId, sessionId, userMessage);
    setInput('');
    setAttachments([]);
    setIsLoading(true);
    setTypingStage('thinking');

    try {
      if (onSendMessage) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500 + Math.random() * 500)
        );
        setTypingStage('typing');

        const responseText = await onSendMessage(
          userMessage.content,
          userMessage.attachments,
          detectedLanguage || undefined
        );

        const assistantMessage: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
          isStreaming: false,
          streamingComplete: true,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        addMessageToHistory(agentId, sessionId, assistantMessage);
      } else {
        const assistantMessage: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: "I'm just a demo! I don't have a brain yet.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        addMessageToHistory(agentId, sessionId, assistantMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      addMessageToHistory(agentId, sessionId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !allowFileUpload) return;

    Array.from(files).forEach((file) => {
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(
          `File "${file.name}" is too large. Maximum size is ${maxFileSize}MB.`
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newAttachment: FileAttachment = {
          name: file.name,
          size: file.size,
          type: file.type,
          data: e.target?.result as string,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (allowFileUpload) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (allowFileUpload) handleFileSelect(e.dataTransfer.files);
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleStopStreaming = () => {
    setIsStreaming(false);
    const lastMsgIndex = messages.length - 1;
    if (lastMsgIndex >= 0 && messages[lastMsgIndex].isStreaming) {
      const updatedMessages = [...messages];
      updatedMessages[lastMsgIndex] = {
        ...updatedMessages[lastMsgIndex],
        isStreaming: false,
        streamingComplete: true,
      };
      setMessages(updatedMessages);
      updateMessageInHistory(
        agentId,
        sessionId,
        updatedMessages[lastMsgIndex].id,
        { isStreaming: false, streamingComplete: true }
      );
    }
  };

  const handleSpeakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported in this browser');
    }
  };

  const handleStartRecording = () => {
    if (
      !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    ) {
      alert(
        'Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.'
      );
      return;
    }

    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // Start recording
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      console.log('Voice recognition started');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      // Update input with final transcript, show interim in real-time
      if (finalTranscript) {
        setInput((prev) => prev + finalTranscript);
      }
      if (interimTranscript && !finalTranscript) {
        // Show interim results in the input
        setInput((prev) => {
          const lastFinalIndex = prev.lastIndexOf(' ');
          return prev.substring(0, lastFinalIndex + 1) + interimTranscript;
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        alert(
          'Microphone access denied. Please allow microphone access in your browser settings.'
        );
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      console.log('Voice recognition ended');
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsRecording(false);
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden ${className}`}
    >
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">{agentName}</h2>
        <div className="flex items-center space-x-2">
          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Agent Settings"
          >
            <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
          </button>

          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Search Messages"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
          </button>

          {/* Clear Chat Button */}
          <button
            onClick={handleClearChat}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear Chat"
          >
            <TrashIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div
          ref={settingsPanelRef}
          className="absolute right-4 top-16 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
        >
          {/* Settings Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cog6ToothIcon className="w-5 h-5 text-white" />
              <h3 className="text-white font-semibold">Agent Settings</h3>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Settings Content - Scrollable */}
          <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4">
            {/* Mode Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Response Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  Object.keys(modeConfigs) as Array<keyof typeof modeConfigs>
                ).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleModeChange(mode)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      agentSettings.mode === mode
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-sm capitalize">{mode}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {modeConfigs[mode].desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">
                  Temperature
                </label>
                <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-indigo-600">
                  {agentSettings.temperature.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={agentSettings.temperature}
                onChange={(e) =>
                  updateSettings({ temperature: parseFloat(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Focused (0.0)</span>
                <span>Balanced (1.0)</span>
                <span>Creative (2.0)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Controls randomness: lower values are more focused, higher
                values are more creative.
              </p>
            </div>

            {/* Max Tokens Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">
                  Max Tokens
                </label>
                <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-indigo-600">
                  {agentSettings.maxTokens}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="4000"
                step="100"
                value={agentSettings.maxTokens}
                onChange={(e) =>
                  updateSettings({ maxTokens: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Short (100)</span>
                <span>Medium (2000)</span>
                <span>Long (4000)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maximum length of the response. ~4 characters = 1 token.
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                AI Model
              </label>
              <select
                value={agentSettings.model}
                onChange={(e) => updateSettings({ model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="gpt-3.5-turbo">
                  GPT-3.5 Turbo (Fast & Efficient)
                </option>
                <option value="gpt-4">GPT-4 (Most Capable)</option>
                <option value="gpt-4-turbo">GPT-4 Turbo (Balanced)</option>
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                <option value="claude-3-opus">Claude 3 Opus</option>
              </select>
            </div>

            {/* System Prompt */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Custom System Prompt
              </label>
              <textarea
                value={agentSettings.systemPrompt}
                onChange={(e) =>
                  updateSettings({ systemPrompt: e.target.value })
                }
                placeholder="Add custom instructions for the agent... (e.g., 'Always respond in a friendly tone' or 'Focus on beginner-level explanations')"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
              />
              <p className="text-xs text-gray-500">
                Custom instructions to guide the agent's behavior. This will be
                prepended to every conversation.
              </p>
            </div>

            {/* Quick Prompts Library */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Quick Prompt Templates
              </label>
              <div className="space-y-1">
                <button
                  onClick={() =>
                    updateSettings({
                      systemPrompt:
                        'You are a helpful assistant. Always provide clear, concise, and accurate information. Break down complex topics into simple explanations.',
                    })
                  }
                  className="w-full text-left px-3 py-2 text-xs bg-gray-50 hover:bg-indigo-50 border border-gray-200 rounded-lg transition-colors"
                >
                  📚 Educational Mode - Clear explanations for learning
                </button>
                <button
                  onClick={() =>
                    updateSettings({
                      systemPrompt:
                        'You are a professional consultant. Provide expert-level analysis with detailed reasoning. Include relevant examples and best practices.',
                    })
                  }
                  className="w-full text-left px-3 py-2 text-xs bg-gray-50 hover:bg-indigo-50 border border-gray-200 rounded-lg transition-colors"
                >
                  💼 Professional Mode - Expert analysis and insights
                </button>
                <button
                  onClick={() =>
                    updateSettings({
                      systemPrompt:
                        'You are a creative brainstorming partner. Think outside the box, suggest innovative ideas, and explore multiple perspectives.',
                    })
                  }
                  className="w-full text-left px-3 py-2 text-xs bg-gray-50 hover:bg-indigo-50 border border-gray-200 rounded-lg transition-colors"
                >
                  💡 Creative Mode - Innovative and imaginative
                </button>
                <button
                  onClick={() =>
                    updateSettings({
                      systemPrompt:
                        'You are a coding assistant. Provide clean, well-documented code with explanations. Follow best practices and modern conventions.',
                    })
                  }
                  className="w-full text-left px-3 py-2 text-xs bg-gray-50 hover:bg-indigo-50 border border-gray-200 rounded-lg transition-colors"
                >
                  💻 Coding Mode - Programming focused responses
                </button>
              </div>
            </div>

            {/* Settings Summary */}
            <div className="pt-3 border-t border-gray-200">
              <div className="bg-indigo-50 rounded-lg p-3 space-y-1">
                <div className="text-xs font-semibold text-indigo-900">
                  Current Configuration:
                </div>
                <div className="text-xs text-indigo-700 space-y-0.5">
                  <div>
                    • Mode:{' '}
                    <span className="font-medium capitalize">
                      {agentSettings.mode}
                    </span>
                  </div>
                  <div>
                    • Temperature:{' '}
                    <span className="font-medium">
                      {agentSettings.temperature}
                    </span>
                  </div>
                  <div>
                    • Max Tokens:{' '}
                    <span className="font-medium">
                      {agentSettings.maxTokens}
                    </span>
                  </div>
                  <div>
                    • Model:{' '}
                    <span className="font-medium">{agentSettings.model}</span>
                  </div>
                  {agentSettings.systemPrompt && (
                    <div>
                      • Custom Prompt:{' '}
                      <span className="font-medium">Enabled</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                const defaultSettings = {
                  temperature: 0.7,
                  maxTokens: 2000,
                  mode: 'balanced' as const,
                  systemPrompt: '',
                  model: 'gpt-3.5-turbo',
                };
                updateSettings(defaultSettings);
              }}
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {isSearchVisible && (
        <div className="p-2 border-b border-gray-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search in conversation..."
            className="flex-grow px-3 py-1.5 text-sm bg-gray-50 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && performSearch(searchQuery)}
          />
          <button
            onClick={() => performSearch(searchQuery)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div
        className="flex-1 p-4 pb-2 overflow-y-auto"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragOver && (
          <div className="absolute inset-0 bg-indigo-500 bg-opacity-20 z-10 flex items-center justify-center rounded-2xl">
            <p className="text-lg font-bold text-indigo-800">
              Drop files to attach
            </p>
          </div>
        )}
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              id={`message-${msg.id}`}
              className={`flex items-end gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${agentColor} flex-shrink-0`}
                ></div>
              )}
              <div
                className={`max-w-xl ${msg.role === 'user' ? 'order-1' : ''}`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-indigo-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.content && (
                    <p className="text-sm">
                      <HighlightedText
                        text={msg.content}
                        searchQuery={searchQuery}
                      />
                    </p>
                  )}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.attachments.map((file, fileIndex) => (
                        <div
                          key={fileIndex}
                          className="flex items-center bg-gray-200/60 p-2 rounded-lg"
                        >
                          <DocumentIcon className="w-6 h-6 text-gray-500 mr-2" />
                          <div className="flex-1 text-sm">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-2 px-1">
                  {msg.role === 'assistant' && (
                    <>
                      <button
                        onClick={() => handleFeedback(msg.id, 'positive')}
                        className="p-1 rounded-full hover:bg-gray-200"
                      >
                        {msg.feedback === 'positive' ? (
                          <HandThumbUpSolid className="w-4 h-4 text-indigo-500" />
                        ) : (
                          <HandThumbUpIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, 'negative')}
                        className="p-1 rounded-full hover:bg-gray-200"
                      >
                        {msg.feedback === 'negative' ? (
                          <HandThumbDownSolid className="w-4 h-4 text-indigo-500" />
                        ) : (
                          <HandThumbDownIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleSpeakMessage(msg.content)}
                        className="p-1 rounded-full hover:bg-gray-200"
                        title="Listen to message"
                      >
                        <SpeakerWaveIcon className="w-4 h-4 text-gray-400" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleCopyMessage(msg.content)}
                    className="p-1 rounded-full hover:bg-gray-200"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-3">
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${agentColor} flex-shrink-0`}
              ></div>
              <div className="px-4 py-3 rounded-2xl bg-gray-100">
                <TypingIndicator agentColor={agentColor} stage={typingStage} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        {attachments.length > 0 && (
          <div className="mb-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="relative group bg-gray-100 p-2 rounded-lg text-sm flex items-center gap-2"
              >
                <DocumentIcon className="w-5 h-5 text-gray-500" />
                <div className="flex-1 truncate">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeAttachment(index)}
                  className="absolute top-1 right-1 p-0.5 bg-gray-300 rounded-full text-white opacity-0 group-hover:opacity-100"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="relative">
          <textarea
            ref={textAreaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={placeholder}
            className="w-full pl-12 pr-20 py-3 text-sm bg-gray-50 rounded-xl border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 shadow-sm"
            rows={1}
            style={{ resize: 'none', overflowY: 'hidden' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full hover:bg-gray-200"
            >
              <PaperClipIcon className="w-5 h-5 text-gray-500" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileSelect(e.target.files)}
              multiple
              className="hidden"
              accept="application/pdf"
            />
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartRecording}
              disabled={isLoading}
              className={`p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 transition-all ${
                isRecording ? 'bg-red-500 text-white animate-pulse' : ''
              }`}
              title={isRecording ? 'Stop recording' : 'Voice input'}
            >
              <MicrophoneIcon
                className={`w-5 h-5 ${
                  isRecording ? 'text-white' : 'text-gray-500'
                }`}
              />
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="p-2 rounded-full bg-indigo-500 text-white disabled:bg-indigo-300 hover:bg-indigo-600 transition-colors"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
