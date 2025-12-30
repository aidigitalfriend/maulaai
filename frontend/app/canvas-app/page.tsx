'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

// Types
interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  hasAudio?: boolean;
}

type ModelProvider = 'Gemini' | 'OpenAI' | 'Anthropic';

interface ModelOption {
  id: string;
  name: string;
  provider: ModelProvider;
  description: string;
  isThinking?: boolean;
  icon?: string;
}

interface GeneratedApp {
  id: string;
  name: string;
  code: string;
  prompt: string;
  timestamp: number;
  history: ChatMessage[];
}

enum ViewMode {
  PREVIEW = 'PREVIEW',
  CODE = 'CODE',
}

interface GenerationState {
  isGenerating: boolean;
  error: string | null;
  progressMessage: string;
  isThinking?: boolean;
  streamingCode?: string;
}

type ActivePanel = 'workspace' | 'assistant' | 'history' | 'tools' | null;

const MODELS: ModelOption[] = [
  // Gemini Models
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Gemini',
    description: 'Fast and efficient for basic layouts.',
    icon: '⚡',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Gemini',
    description: 'High reasoning for complex apps.',
    icon: '🧠',
  },
  {
    id: 'gemini-1.5-pro-thinking',
    name: 'Gemini 1.5 Pro (Thinking)',
    provider: 'Gemini',
    description: 'Maximum reasoning power.',
    isThinking: true,
    icon: '💭',
  },
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Most capable OpenAI model.',
    icon: '🌟',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Fast and cost-effective.',
    icon: '⚙️',
  },
  // Anthropic Models
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Expert coding assistant.',
    icon: '🎭',
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most powerful Claude model.',
    icon: '🎯',
  },
];

const PRESET_TEMPLATES = [
  {
    name: 'SaaS Landing Page',
    prompt: 'Build a modern SaaS landing page for a CRM tool with hero section, features grid, pricing table, testimonials, and footer.',
    icon: '🚀',
  },
  {
    name: 'Analytics Dashboard',
    prompt: 'Create a dark-themed analytics dashboard with sidebar navigation, 4 stat cards, 2 chart areas, and a data table.',
    icon: '📊',
  },
  {
    name: 'E-commerce Store',
    prompt: 'Generate an elegant e-commerce storefront with product grid, filters, shopping cart, and checkout flow.',
    icon: '🛒',
  },
  {
    name: 'Portfolio Website',
    prompt: 'Build a creative portfolio website with hero, project gallery with filters, about section, and contact form.',
    icon: '🎨',
  },
  {
    name: 'Blog Platform',
    prompt: 'Create a clean blog homepage with featured posts, categories sidebar, search, and newsletter signup.',
    icon: '📝',
  },
  {
    name: 'Mobile App UI',
    prompt: 'Design a mobile app interface with bottom navigation, cards, profile section, and settings page.',
    icon: '📱',
  },
  {
    name: 'Admin Panel',
    prompt: 'Build an admin dashboard with user management table, CRUD operations, stats overview, and activity log.',
    icon: '⚙️',
  },
  {
    name: 'Restaurant Menu',
    prompt: 'Create a restaurant website with hero image, menu sections, reservation form, and location map.',
    icon: '🍽️',
  },
];

const QUICK_ACTIONS = [
  { label: 'Add dark mode toggle', icon: '🌙' },
  { label: 'Make it responsive', icon: '📱' },
  { label: 'Add smooth animations', icon: '✨' },
  { label: 'Improve accessibility', icon: '♿' },
  { label: 'Add loading states', icon: '⏳' },
  { label: 'Add form validation', icon: '✅' },
];

type ActivePanel = 'workspace' | 'assistant' | 'history' | 'tools' | null;

// Preview Component
const Preview: React.FC<{ code: string }> = ({ code }) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && code) {
      const doc = iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    }
  }, [code]);

  if (!code) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl m-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mb-4 opacity-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9.75 17L9 21h6l-.75-4M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <p className="text-lg font-medium">Your preview will appear here</p>
        <p className="text-sm">
          Describe your app idea and click &quot;Generate&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b text-xs text-gray-500">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 text-center font-mono opacity-60 truncate">
          localhost:3000/generated-app
        </div>
      </div>
      <iframe
        ref={iframeRef}
        title="App Preview"
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin"
      />
    </div>
  );
};

// CodeView Component
const CodeView: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!code) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-900 border-2 border-dashed border-gray-700 rounded-xl m-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mb-4 opacity-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
        <p className="text-lg font-medium">No code generated yet</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-[#1e1e1e] group">
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-md flex items-center gap-2 transition-all opacity-0 group-hover:opacity-100"
      >
        {copied ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            Copy Code
          </>
        )}
      </button>
      <pre className="p-6 overflow-auto h-full font-mono text-sm text-gray-300 custom-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// ChatBox Component
const ChatBox: React.FC<{
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isGenerating: boolean;
}> = ({ messages, onSendMessage, isGenerating }) => {
  const [input, setInput] = useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white w-full overflow-hidden">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              How can I help?
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Ask me to add animations, change colors, or add complex
              functionality to your app.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`group relative max-w-[90%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-100'
                  : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-100'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ))}
        {isGenerating && (
          <div className="flex items-center gap-2 text-indigo-400 text-[10px] px-2 font-bold uppercase tracking-widest italic animate-pulse">
            <span className="flex gap-1">
              <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
              <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></span>
              <span
                className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              ></span>
            </span>
            Processing...
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-100 bg-gray-50/50"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for changes..."
            className="flex-1 px-4 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !input.trim()}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 transition-all"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

// Main Canvas App Component
export default function CanvasAppPage() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelOption>(MODELS[0]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.PREVIEW);
  const [currentApp, setCurrentApp] = useState<GeneratedApp | null>(null);
  const [history, setHistory] = useState<GeneratedApp[]>([]);
  const [activePanel, setActivePanel] = useState<ActivePanel>('workspace');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [genState, setGenState] = useState<GenerationState>({
    isGenerating: false,
    error: null,
    progressMessage: '',
    streamingCode: '',
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.model-dropdown')) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('gencraft_v4_history');
    if (saved)
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
  }, []);

  const saveHistory = (newHistory: GeneratedApp[]) => {
    setHistory(newHistory);
    localStorage.setItem('gencraft_v4_history', JSON.stringify(newHistory));
  };

  // Streaming generation with real-time updates
  const handleGenerateStream = useCallback(async (
    instruction: string,
    isInitial: boolean = false
  ) => {
    if (!instruction.trim() || genState.isGenerating) return;

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    setGenState({
      isGenerating: true,
      error: null,
      progressMessage: selectedModel.isThinking
        ? 'Deep thinking in progress...'
        : `Generating with ${selectedModel.provider}...`,
      isThinking: selectedModel.isThinking,
      streamingCode: '',
    });

    let accumulatedCode = '';

    try {
      const response = await fetch('/api/canvas/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: instruction,
          provider: selectedModel.provider,
          modelId: selectedModel.id,
          isThinking: selectedModel.isThinking,
          currentCode: isInitial ? undefined : currentApp?.code,
          history: isInitial ? [] : currentApp?.history,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to generate application');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                accumulatedCode += data.chunk;
                setGenState(prev => ({
                  ...prev,
                  streamingCode: accumulatedCode,
                  progressMessage: 'Building your application...',
                }));
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Finalize the generation
      const finalCode = accumulatedCode;
      const userMsg: ChatMessage = {
        role: 'user',
        text: instruction,
        timestamp: Date.now(),
      };
      const modelMsg: ChatMessage = {
        role: 'model',
        text: isInitial ? `✅ Application built with ${selectedModel.name}!` : '✅ Changes applied successfully.',
        timestamp: Date.now(),
      };

      if (isInitial) {
        const newApp: GeneratedApp = {
          id: Date.now().toString(),
          name: instruction.substring(0, 40) + '...',
          code: finalCode,
          prompt: instruction,
          timestamp: Date.now(),
          history: [modelMsg],
        };
        setCurrentApp(newApp);
        saveHistory([newApp, ...history].slice(0, 20));
      } else if (currentApp) {
        const updatedApp = {
          ...currentApp,
          code: finalCode,
          history: [...currentApp.history, userMsg, modelMsg],
        };
        setCurrentApp(updatedApp);
        saveHistory(
          history.map((a) => (a.id === updatedApp.id ? updatedApp : a))
        );
      }

      setGenState({ isGenerating: false, error: null, progressMessage: '', streamingCode: '' });
      setViewMode(ViewMode.PREVIEW);
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') {
        setGenState({ isGenerating: false, error: 'Generation cancelled', progressMessage: '', streamingCode: '' });
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setGenState({ isGenerating: false, error: errorMessage, progressMessage: '', streamingCode: '' });
      }
    }
  }, [selectedModel, currentApp, history, genState.isGenerating]);

  // Non-streaming fallback
  const handleGenerateNonStream = async (
    instruction: string,
    isInitial: boolean = false
  ) => {
    if (!instruction.trim() || genState.isGenerating) return;

    setGenState({
      isGenerating: true,
      error: null,
      progressMessage: selectedModel.isThinking
        ? 'Deep thinking in progress...'
        : `Building with ${selectedModel.name}...`,
      isThinking: selectedModel.isThinking,
    });

    try {
      const response = await fetch('/api/canvas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: instruction,
          provider: selectedModel.provider,
          modelId: selectedModel.id,
          isThinking: selectedModel.isThinking,
          currentCode: isInitial ? undefined : currentApp?.code,
          history: isInitial ? [] : currentApp?.history,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate application');
      }

      const data = await response.json();
      const code = data.code;

      const userMsg: ChatMessage = {
        role: 'user',
        text: instruction,
        timestamp: Date.now(),
      };
      const modelMsg: ChatMessage = {
        role: 'model',
        text: isInitial ? `✅ Built with ${selectedModel.name}!` : '✅ Changes applied.',
        timestamp: Date.now(),
      };

      if (isInitial) {
        const newApp: GeneratedApp = {
          id: Date.now().toString(),
          name: instruction.substring(0, 40) + '...',
          code,
          prompt: instruction,
          timestamp: Date.now(),
          history: [modelMsg],
        };
        setCurrentApp(newApp);
        saveHistory([newApp, ...history].slice(0, 20));
      } else if (currentApp) {
        const updatedApp = {
          ...currentApp,
          code,
          history: [...currentApp.history, userMsg, modelMsg],
        };
        setCurrentApp(updatedApp);
        saveHistory(
          history.map((a) => (a.id === updatedApp.id ? updatedApp : a))
        );
      }

      setGenState({ isGenerating: false, error: null, progressMessage: '' });
      setViewMode(ViewMode.PREVIEW);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setGenState({ isGenerating: false, error: errorMessage, progressMessage: '' });
    }
  };

  // Main generate handler
  const handleGenerate = (instruction: string, isInitial: boolean = false) => {
    if (useStreaming) {
      handleGenerateStream(instruction, isInitial);
    } else {
      handleGenerateNonStream(instruction, isInitial);
    }
  };

  // Cancel generation
  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Quick action handler
  const handleQuickAction = (action: string) => {
    if (currentApp) {
      handleGenerate(action, false);
    }
  };

  // Download code
  const downloadCode = () => {
    if (!currentApp?.code) return;
    const blob = new Blob([currentApp.code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentApp.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Open in new tab
  const openInNewTab = () => {
    if (!currentApp?.code) return;
    const blob = new Blob([currentApp.code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  Canvas <span className="text-indigo-600">Builder</span>
                </h1>
                <p className="text-xs text-gray-500">
                  AI-Powered App Generator
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Streaming Toggle */}
            <button
              onClick={() => setUseStreaming(!useStreaming)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                useStreaming
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
              title={useStreaming ? 'Real-time streaming enabled' : 'Standard mode'}
            >
              <span className={`w-2 h-2 rounded-full ${useStreaming ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
              {useStreaming ? 'Stream' : 'Standard'}
            </button>

            {/* Export Buttons */}
            {currentApp && (
              <div className="flex items-center gap-1">
                <button
                  onClick={downloadCode}
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Download HTML"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button
                  onClick={openInNewTab}
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Open in new tab"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            )}

            {/* Model Selector */}
            <div className="relative model-dropdown">
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold hover:border-indigo-300 transition-colors"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    selectedModel.provider === 'Gemini'
                      ? 'bg-green-500'
                      : 'bg-yellow-500'
                  }`}
                ></span>
                {selectedModel.name}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-3 w-3 text-gray-400 transition-transform ${
                    isModelDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isModelDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-2 max-h-[70vh] overflow-y-auto">
                  <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Select AI Model
                  </p>
                  {['Gemini', 'OpenAI', 'Anthropic'].map((provider) => (
                    <div key={provider} className="mb-2">
                      <p className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        provider === 'Gemini' ? 'text-green-600' :
                        provider === 'OpenAI' ? 'text-blue-600' : 'text-purple-600'
                      }`}>
                        {provider}
                      </p>
                      {MODELS.filter(m => m.provider === provider).map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedModel(m);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors ${
                            selectedModel.id === m.id
                              ? 'bg-indigo-50 ring-1 ring-indigo-200'
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-gray-800 flex items-center gap-2">
                              <span>{m.icon}</span>
                              {m.name}
                              {m.isThinking && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                                  THINKING
                                </span>
                              )}
                            </p>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1 ml-6">
                            {m.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200/50">
              <button
                onClick={() => setViewMode(ViewMode.PREVIEW)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === ViewMode.PREVIEW
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                PREVIEW
              </button>
              <button
                onClick={() => setViewMode(ViewMode.CODE)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewMode === ViewMode.CODE
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500'
                }`}
              >
                CODE
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Vertical Nav Bar */}
        <nav className="w-16 bg-[#1e1e2e] flex flex-col items-center py-6 gap-6 shrink-0">
          <button
            onClick={() => togglePanel('workspace')}
            className={`p-3 rounded-xl transition-all ${
              activePanel === 'workspace'
                ? 'bg-indigo-600/20 text-indigo-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Workspace"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>

          <button
            onClick={() => togglePanel('assistant')}
            className={`p-3 rounded-xl transition-all ${
              activePanel === 'assistant'
                ? 'bg-indigo-600/20 text-indigo-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="AI Assistant"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </button>

          <button
            onClick={() => togglePanel('history')}
            className={`p-3 rounded-xl transition-all ${
              activePanel === 'history'
                ? 'bg-indigo-600/20 text-indigo-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="History"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          <button
            onClick={() => togglePanel('tools')}
            className={`p-3 rounded-xl transition-all ${
              activePanel === 'tools'
                ? 'bg-indigo-600/20 text-indigo-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            title="Tools & Quick Actions"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          <div className="mt-auto">
            <div className="w-2 h-2 rounded-full bg-green-500 mx-auto animate-pulse shadow-sm shadow-green-500/50"></div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 relative flex overflow-hidden">
          <div
            className={`relative overflow-hidden bg-gray-50/30 transition-all duration-300 ease-in-out ${
              activePanel ? 'flex-1' : 'w-full'
            }`}
          >
            {genState.isGenerating && (
              <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl">{selectedModel.icon}</span>
                  </div>
                </div>
                <div className="text-center max-w-md px-6">
                  <p className="text-lg font-bold text-gray-800 tracking-tight">
                    {genState.progressMessage}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Using {selectedModel.name} • {selectedModel.provider}
                  </p>
                  {genState.streamingCode && (
                    <div className="mt-4 text-left">
                      <p className="text-[10px] text-indigo-600 font-bold uppercase mb-2">
                        Generating {genState.streamingCode.length.toLocaleString()} characters...
                      </p>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={cancelGeneration}
                    className="mt-4 px-4 py-2 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <div className="h-full w-full">
              {viewMode === ViewMode.PREVIEW ? (
                <Preview code={genState.streamingCode || currentApp?.code || ''} />
              ) : (
                <CodeView code={genState.streamingCode || currentApp?.code || ''} />
              )}
            </div>
          </div>

          {/* Right Toggleable Panels */}
          <div
            className={`h-full bg-white transition-all duration-300 ease-in-out overflow-hidden ${
              activePanel ? 'w-80 border-l border-gray-100 shadow-2xl' : 'w-0'
            }`}
          >
            <div
              className={`w-80 flex flex-col h-full ${
                activePanel ? 'opacity-100' : 'opacity-0'
              } transition-opacity duration-200`}
            >
              {activePanel === 'workspace' && (
                <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Workspace
                    </h3>
                    <button
                      onClick={() => setActivePanel(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="mb-6">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">
                      New App Concept
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ex: Landing page for a SaaS..."
                      className="w-full p-4 text-xs border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50/50 min-h-[160px] resize-none transition-all"
                    />
                    <button
                      onClick={() => handleGenerate(prompt, true)}
                      disabled={genState.isGenerating || !prompt.trim()}
                      className="w-full mt-3 py-3 bg-indigo-600 text-white text-xs font-bold rounded-2xl hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100"
                    >
                      {genState.isGenerating ? 'BUILDING...' : 'GENERATE APP'}
                    </button>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                      Starter Templates
                    </h3>
                    <div className="space-y-2">
                      {PRESET_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.name}
                          onClick={() => setPrompt(tpl.prompt)}
                          className="w-full text-left px-4 py-3 text-xs text-gray-700 bg-gray-50 hover:bg-white hover:text-indigo-600 rounded-xl border border-transparent hover:border-gray-200 transition-all flex items-center gap-3 group"
                        >
                          <span className="text-lg">{tpl.icon}</span>
                          <span className="flex-1">{tpl.name}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activePanel === 'assistant' && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                      AI Assistant
                    </h3>
                    <button
                      onClick={() => setActivePanel(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <ChatBox
                    messages={currentApp?.history || []}
                    onSendMessage={(text) => handleGenerate(text, false)}
                    isGenerating={genState.isGenerating}
                  />
                </div>
              )}

              {activePanel === 'history' && (
                <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      History
                    </h3>
                    <button
                      onClick={() => setActivePanel(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  {history.length > 0 ? (
                    <div className="space-y-2">
                      {history.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => setCurrentApp(app)}
                          className={`w-full text-left px-4 py-3 text-xs rounded-xl transition-all truncate border ${
                            currentApp?.id === app.id
                              ? 'bg-indigo-50 border-indigo-100 text-indigo-700 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="font-bold mb-1 truncate">
                            {app.name}
                          </div>
                          <div className="text-[10px] opacity-60">
                            {new Date(app.timestamp).toLocaleString()}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400 italic text-xs">
                      No project history yet.
                    </div>
                  )}
                </div>
              )}

              {activePanel === 'tools' && (
                <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Tools & Actions
                    </h3>
                    <button
                      onClick={() => setActivePanel(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Quick Actions */}
                  <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">
                      Quick Enhancements
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => handleQuickAction(action.label)}
                          disabled={!currentApp || genState.isGenerating}
                          className="flex items-center gap-2 px-3 py-2 text-[10px] font-medium text-gray-600 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>{action.icon}</span>
                          <span className="truncate">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Export Options */}
                  <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">
                      Export Options
                    </h4>
                    <div className="space-y-2">
                      <button
                        onClick={downloadCode}
                        disabled={!currentApp}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gray-700 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all disabled:opacity-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download HTML File
                      </button>
                      <button
                        onClick={openInNewTab}
                        disabled={!currentApp}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gray-700 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all disabled:opacity-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open in New Tab
                      </button>
                      <button
                        onClick={() => currentApp && navigator.clipboard.writeText(currentApp.code)}
                        disabled={!currentApp}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gray-700 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all disabled:opacity-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy to Clipboard
                      </button>
                    </div>
                  </div>

                  {/* Model Info */}
                  <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">
                      Current Model
                    </h4>
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{selectedModel.icon}</span>
                        <span className="text-sm font-bold text-gray-800">{selectedModel.name}</span>
                      </div>
                      <p className="text-[10px] text-gray-600">{selectedModel.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          selectedModel.provider === 'Gemini' ? 'bg-green-100 text-green-700' :
                          selectedModel.provider === 'OpenAI' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {selectedModel.provider}
                        </span>
                        {selectedModel.isThinking && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                            Thinking Mode
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Generation Settings */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">
                      Settings
                    </h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${useStreaming ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          <span className="text-xs font-medium text-gray-700">Real-time Streaming</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={useStreaming}
                          onChange={() => setUseStreaming(!useStreaming)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Error Toast */}
      {genState.error && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm p-4 bg-white border border-red-100 rounded-3xl shadow-2xl flex gap-4 items-start border-l-4 border-l-red-500 animate-slide-up">
          <div className="p-2 bg-red-50 text-red-500 rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-800">
              Generation Error
            </h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {genState.error}
            </p>
            <div className="mt-3 flex gap-4">
              <button
                onClick={() => setGenState({ ...genState, error: null })}
                className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="fixed bottom-4 left-20 z-40">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-gray-100 shadow-sm">
          <div
            className={`w-2 h-2 rounded-full ${
              genState.isGenerating
                ? 'bg-indigo-500 animate-pulse'
                : 'bg-green-500'
            }`}
          ></div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Canvas Builder Active
          </span>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
