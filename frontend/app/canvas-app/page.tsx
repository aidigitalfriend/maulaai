'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Types
interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  hasAudio?: boolean;
}

type ModelProvider = 'Gemini' | 'OpenAI' | 'Anthropic' | 'xAI' | 'Mistral';

interface ModelOption {
  id: string;
  name: string;
  provider: ModelProvider;
  description: string;
  isThinking?: boolean;
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
}

const MODELS: ModelOption[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    provider: 'Gemini',
    description: 'Fast and efficient for basic layouts.',
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro',
    provider: 'Gemini',
    description: 'High reasoning for complex apps.',
  },
  {
    id: 'gemini-3-pro-preview-thinking',
    name: 'Gemini 3 Pro (Thinking)',
    provider: 'Gemini',
    description: 'Maximum reasoning power for hard logic.',
    isThinking: true,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o (Placeholder)',
    provider: 'OpenAI',
    description: 'Industry standard reasoning.',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet (Placeholder)',
    provider: 'Anthropic',
    description: 'Expert coding assistant.',
  },
];

const PRESET_TEMPLATES = [
  {
    name: 'SaaS Page',
    prompt:
      'Build a modern SaaS landing page for a CRM tool with features, pricing, and hero.',
  },
  {
    name: 'Analytics Dashboard',
    prompt:
      'Create a dark-themed analytics dashboard with 3 chart placeholders and a sidebar.',
  },
  {
    name: 'E-commerce Storefront',
    prompt:
      'Generate an elegant minimal furniture store with a grid of items and cart icon.',
  },
  {
    name: 'Portfolio Website',
    prompt:
      'Build a creative portfolio website for a designer with project gallery and contact form.',
  },
  {
    name: 'Blog Layout',
    prompt:
      'Create a clean blog homepage with featured posts, categories sidebar, and newsletter signup.',
  },
];

type ActivePanel = 'workspace' | 'assistant' | 'history' | null;

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
  const [genState, setGenState] = useState<GenerationState>({
    isGenerating: false,
    error: null,
    progressMessage: '',
  });

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

  const handleGenerate = async (
    instruction: string,
    isInitial: boolean = false
  ) => {
    if (!instruction.trim() || genState.isGenerating) return;

    if (selectedModel.provider !== 'Gemini') {
      setGenState({
        isGenerating: false,
        error:
          'Multi-provider support requires separate API keys. Currently only Gemini is active.',
        progressMessage: '',
      });
      return;
    }

    setGenState({
      isGenerating: true,
      error: null,
      progressMessage: selectedModel.isThinking
        ? 'Deep thinking in progress...'
        : 'Building application...',
      isThinking: selectedModel.isThinking,
    });

    try {
      // Call the API endpoint
      const response = await fetch('/api/canvas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: instruction,
          modelId: selectedModel.isThinking
            ? 'gemini-3-pro-preview'
            : selectedModel.id,
          isThinking: selectedModel.isThinking,
          currentCode: isInitial ? undefined : currentApp?.code,
          history: isInitial ? [] : currentApp?.history,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate application');
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
        text: isInitial ? 'Application built!' : 'Changes applied.',
        timestamp: Date.now(),
      };

      if (isInitial) {
        const newApp: GeneratedApp = {
          id: Date.now().toString(),
          name: instruction.substring(0, 30) + '...',
          code,
          prompt: instruction,
          timestamp: Date.now(),
          history: [modelMsg],
        };
        setCurrentApp(newApp);
        saveHistory([newApp, ...history].slice(0, 10));
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
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setGenState({
        isGenerating: false,
        error: errorMessage,
        progressMessage: '',
      });
    }
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

          <div className="flex items-center gap-4">
            {/* Model Selector */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold hover:border-indigo-300 transition-colors">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {selectedModel.name}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 text-gray-400"
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
              <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
                <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Select Model
                </p>
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m)}
                    className={`w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors ${
                      selectedModel.id === m.id
                        ? 'bg-indigo-50 ring-1 ring-indigo-200'
                        : ''
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-800">
                      {m.name}{' '}
                      {m.isThinking && (
                        <span className="ml-1 text-[10px] bg-indigo-100 text-indigo-700 px-1 rounded">
                          THINKING
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {m.description}
                    </p>
                  </button>
                ))}
              </div>
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

          <div className="mt-auto">
            <div className="w-2 h-2 rounded-full bg-green-500 mx-auto animate-pulse shadow-sm shadow-green-500/50"></div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 relative flex overflow-hidden">
          <div className="flex-1 relative overflow-hidden bg-gray-50/30">
            {genState.isGenerating && (
              <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6 shadow-xl"></div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800 tracking-tight">
                    {genState.progressMessage}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Refining UI components and logic...
                  </p>
                </div>
              </div>
            )}
            <div className="h-full">
              {viewMode === ViewMode.PREVIEW ? (
                <Preview code={currentApp?.code || ''} />
              ) : (
                <CodeView code={currentApp?.code || ''} />
              )}
            </div>
          </div>

          {/* Right Toggleable Panels */}
          <div
            className={`h-full border-l border-gray-100 bg-white transition-all duration-300 ease-in-out flex shrink-0 overflow-hidden shadow-2xl ${
              activePanel ? 'w-80' : 'w-0 border-l-0 opacity-0'
            }`}
          >
            <div className="w-80 flex flex-col h-full">
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
                          className="w-full text-left px-4 py-3 text-xs text-gray-700 bg-gray-50 hover:bg-white hover:text-indigo-600 rounded-xl border border-transparent hover:border-gray-200 transition-all flex justify-between items-center group"
                        >
                          {tpl.name}
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
