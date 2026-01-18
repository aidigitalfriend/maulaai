'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptions } from '@/contexts/SubscriptionContext';
import type { AgentSubscription } from '@/services/agentSubscriptionService';

// Types
interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  hasAudio?: boolean;
  isSystemMessage?: boolean;
}

type ModelProvider = 'Gemini' | 'OpenAI' | 'Anthropic' | 'Groq' | 'xAI';

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
  files?: FileNode[];
}

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  content?: string;
}

enum ViewMode {
  PREVIEW = 'PREVIEW',
  CODE = 'CODE',
  SPLIT = 'SPLIT',
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

interface GenerationState {
  isGenerating: boolean;
  error: string | null;
  progressMessage: string;
  isThinking?: boolean;
  streamingCode?: string;
}

type ActivePanel = 'workspace' | 'assistant' | 'history' | 'tools' | 'files' | null;

// Conversation Phase for AI Agent
type ConversationPhase = 'initial' | 'gathering' | 'confirming' | 'building' | 'editing';

const MODELS: ModelOption[] = [
  // Anthropic Models - Best for coding
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Best for coding - highly recommended.',
    icon: '🎭',
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most powerful Claude model.',
    icon: '🎯',
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
  // xAI
  {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xAI',
    description: 'Strong reasoning and coding.',
    icon: '🚀',
  },
  // Groq - Fast inference
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Groq',
    description: 'Ultra-fast inference.',
    icon: '🦙',
  },
];

const PRESET_TEMPLATES = [
  {
    name: 'SaaS Landing Page',
    prompt:
      'Build a modern SaaS landing page for a CRM tool with hero section, features grid, pricing table, testimonials, and footer.',
    icon: '🚀',
  },
  {
    name: 'Analytics Dashboard',
    prompt:
      'Create a dark-themed analytics dashboard with sidebar navigation, 4 stat cards, 2 chart areas, and a data table.',
    icon: '📊',
  },
  {
    name: 'E-commerce Store',
    prompt:
      'Generate an elegant e-commerce storefront with product grid, filters, shopping cart, and checkout flow.',
    icon: '🛒',
  },
  {
    name: 'Portfolio Website',
    prompt:
      'Build a creative portfolio website with hero, project gallery with filters, about section, and contact form.',
    icon: '🎨',
  },
  {
    name: 'Blog Platform',
    prompt:
      'Create a clean blog homepage with featured posts, categories sidebar, search, and newsletter signup.',
    icon: '📝',
  },
  {
    name: 'Mobile App UI',
    prompt:
      'Design a mobile app interface with bottom navigation, cards, profile section, and settings page.',
    icon: '📱',
  },
  {
    name: 'Admin Panel',
    prompt:
      'Build an admin dashboard with user management table, CRUD operations, stats overview, and activity log.',
    icon: '⚙️',
  },
  {
    name: 'Restaurant Menu',
    prompt:
      'Create a restaurant website with hero image, menu sections, reservation form, and location map.',
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

// Device dimensions for preview
const DEVICE_SIZES = {
  desktop: { width: '100%', height: '100%' },
  tablet: { width: '768px', height: '1024px' },
  mobile: { width: '375px', height: '812px' },
};

// Preview Component with device sizing
const Preview: React.FC<{ code: string; deviceMode: DeviceMode }> = ({ code, deviceMode }) => {
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

  const deviceSize = DEVICE_SIZES[deviceMode];
  const isFullWidth = deviceMode === 'desktop';

  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center overflow-auto p-4">
      <div
        className={`bg-white shadow-2xl overflow-hidden transition-all duration-300 ${
          isFullWidth ? 'w-full h-full' : 'rounded-3xl border-8 border-gray-800'
        }`}
        style={isFullWidth ? {} : { width: deviceSize.width, height: deviceSize.height, maxHeight: '100%' }}
      >
        {/* Browser chrome for non-mobile */}
        {!isFullWidth && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b text-xs text-gray-500">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 text-center font-mono opacity-60 truncate">
              {deviceMode === 'tablet' ? 'iPad Preview' : 'iPhone Preview'}
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          title="App Preview"
          className="w-full h-full border-none bg-white"
          style={!isFullWidth ? { height: 'calc(100% - 36px)' } : {}}
          sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin"
        />
      </div>
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

// Enhanced ChatBox Component with AI Agent Phases
const ChatBox: React.FC<{
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isGenerating: boolean;
  conversationPhase: ConversationPhase;
  hasApp: boolean;
}> = ({ messages, onSendMessage, isGenerating, conversationPhase, hasApp }) => {
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

  const getPlaceholderText = () => {
    if (hasApp) {
      return "Ask to modify, add features, change styles...";
    }
    switch (conversationPhase) {
      case 'initial':
        return "Tell me about the app you want to build...";
      case 'gathering':
        return "Provide more details...";
      case 'confirming':
        return "Type 'yes' to build or describe changes...";
      case 'building':
        return "Building your app...";
      case 'editing':
        return "What would you like to change?";
      default:
        return "Describe your app idea...";
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
              AI Assistant
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              I&apos;ll help you build your app. Tell me what you&apos;d like to create and I&apos;ll ask clarifying questions before we start building.
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
              className={`group relative max-w-[90%] px-4 py-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-100'
                  : msg.isSystemMessage
                  ? 'bg-amber-50 text-amber-800 rounded-tl-none border border-amber-200'
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
            {conversationPhase === 'building' ? 'Building...' : 'Thinking...'}
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
            placeholder={getPlaceholderText()}
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

// Files Panel Component
const FilesPanel: React.FC<{ files: FileNode[]; onClose: () => void }> = ({ files, onClose }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const paddingLeft = depth * 16 + 12;

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <button
            onClick={() => toggleFolder(node.path)}
            className="w-full flex items-center gap-2 py-1.5 px-3 text-xs text-gray-700 hover:bg-gray-100 transition-colors"
            style={{ paddingLeft }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3 w-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H8a3 3 0 00-3 3v1.5a1.5 1.5 0 01-3 0V6z" clipRule="evenodd" />
              <path d="M6 12a2 2 0 012-2h8a2 2 0 012 2v2a2 2 0 01-2 2H2h2a2 2 0 002-2v-2z" />
            </svg>
            <span className="font-medium">{node.name}</span>
          </button>
          {isExpanded && node.children?.map((child) => renderNode(child, depth + 1))}
        </div>
      );
    }

    return (
      <div
        key={node.path}
        className="flex items-center gap-2 py-1.5 px-3 text-xs text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
        style={{ paddingLeft }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>{node.name}</span>
      </div>
    );
  };

  // Default file structure for single-file HTML app
  const defaultFiles: FileNode[] = files.length > 0 ? files : [
    {
      name: 'project',
      type: 'folder',
      path: 'root',
      children: [
        { name: 'index.html', type: 'file', path: 'root/index.html' },
      ],
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Files
        </h3>
        <button
          onClick={onClose}
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
      <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
        {defaultFiles.map((node) => renderNode(node))}
      </div>
    </div>
  );
};

// Subscription Gate Component
const SubscriptionGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();
  const { subscriptions, loading } = useSubscriptions();

  // Check if user has weekly or monthly subscription to ANY agent
  const hasRequiredSubscription = subscriptions.some(
    (sub: AgentSubscription) =>
      sub.status === 'active' &&
      (sub.plan === 'weekly' || sub.plan === 'monthly') &&
      new Date(sub.expiryDate) > new Date()
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access Canvas Builder.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!hasRequiredSubscription) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Canvas Builder</h2>
          <p className="text-gray-600 mb-4">
            AI-Powered App Generator
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Weekly or Monthly subscription required.</strong><br />
              Subscribe to any AI Agent with a weekly or monthly plan to unlock Canvas Builder.
            </p>
          </div>
          <Link
            href="/agents"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Browse AI Agents
          </Link>
          <Link
            href="/"
            className="block mt-4 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Main Canvas App Component (Inner)
function CanvasAppInner() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelOption>(MODELS[0]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.PREVIEW);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [currentApp, setCurrentApp] = useState<GeneratedApp | null>(null);
  const [history, setHistory] = useState<GeneratedApp[]>([]);
  const [activePanel, setActivePanel] = useState<ActivePanel>('workspace');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true);
  const [conversationPhase, setConversationPhase] = useState<ConversationPhase>('initial');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [gatheredRequirements, setGatheredRequirements] = useState<string[]>([]);
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
    const saved = localStorage.getItem('canvas_builder_history');
    if (saved)
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
  }, []);

  const saveHistory = (newHistory: GeneratedApp[]) => {
    setHistory(newHistory);
    localStorage.setItem('canvas_builder_history', JSON.stringify(newHistory));
  };

  // AI Agent conversation handler
  const handleAgentConversation = async (userMessage: string) => {
    // Add user message to chat
    const userMsg: ChatMessage = {
      role: 'user',
      text: userMessage,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, userMsg]);

    // If we already have an app, treat this as an edit request
    if (currentApp) {
      handleGenerate(userMessage, false);
      return;
    }

    // Phase-based conversation flow
    if (conversationPhase === 'initial' || conversationPhase === 'gathering') {
      // Gather requirements
      setGatheredRequirements((prev) => [...prev, userMessage]);
      
      // Simulate AI asking clarifying questions
      setGenState({ ...genState, isGenerating: true, progressMessage: 'Thinking...' });
      
      // Simple heuristic: after 1-2 messages, move to confirmation
      const totalRequirements = gatheredRequirements.length + 1;
      
      setTimeout(() => {
        let aiResponse: ChatMessage;
        
        if (totalRequirements === 1) {
          // First message - ask clarifying questions
          setConversationPhase('gathering');
          aiResponse = {
            role: 'model',
            text: `Great idea! Let me understand better:\n\n1. What's the primary color scheme or brand style?\n2. Any specific features you'd like to highlight?\n3. Should it be dark mode, light mode, or have a toggle?\n\nFeel free to answer any or all, or just say "let's build it" if you're ready!`,
            timestamp: Date.now(),
          };
        } else if (totalRequirements >= 2 || userMessage.toLowerCase().includes('build') || userMessage.toLowerCase().includes('yes') || userMessage.toLowerCase().includes('ready')) {
          // Ready to build
          setConversationPhase('confirming');
          const allRequirements = [...gatheredRequirements, userMessage].join('\n- ');
          aiResponse = {
            role: 'model',
            text: `Perfect! Here's what I'll build:\n\n📋 Requirements:\n- ${allRequirements}\n\n✨ I'll create a modern, responsive design with:\n- Clean UI with smooth animations\n- Mobile-friendly layout\n- Professional styling\n\nType "yes" or "build it" to start, or tell me any changes you'd like first!`,
            timestamp: Date.now(),
            isSystemMessage: true,
          };
        } else {
          // Continue gathering
          aiResponse = {
            role: 'model',
            text: `Got it! Anything else you'd like to add? Or say "build it" when you're ready!`,
            timestamp: Date.now(),
          };
        }
        
        setChatMessages((prev) => [...prev, aiResponse]);
        setGenState({ ...genState, isGenerating: false, progressMessage: '' });
      }, 1000);
      
      return;
    }
    
    if (conversationPhase === 'confirming') {
      if (userMessage.toLowerCase().includes('yes') || userMessage.toLowerCase().includes('build')) {
        // Start building
        setConversationPhase('building');
        const fullPrompt = gatheredRequirements.join('. ');
        handleGenerate(fullPrompt, true);
      } else {
        // User wants changes
        setGatheredRequirements((prev) => [...prev, userMessage]);
        const aiResponse: ChatMessage = {
          role: 'model',
          text: `I've noted that. Ready to build when you are - just say "yes" or "build it"!`,
          timestamp: Date.now(),
        };
        setChatMessages((prev) => [...prev, aiResponse]);
      }
    }
  };

  // Streaming generation with real-time updates
  const handleGenerateStream = useCallback(
    async (instruction: string, isInitial: boolean = false) => {
      if (!instruction.trim() || genState.isGenerating) return;

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
                  setGenState((prev) => ({
                    ...prev,
                    streamingCode: accumulatedCode,
                    progressMessage: 'Building your application...',
                  }));
                }
                if (data.error) {
                  throw new Error(data.error);
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }

        const finalCode = accumulatedCode;
        const modelMsg: ChatMessage = {
          role: 'model',
          text: isInitial
            ? `✅ Your app is ready! Built with ${selectedModel.name}.\n\nYou can now ask me to make any changes - add features, modify styles, fix issues, or completely redesign sections.`
            : '✅ Changes applied! What else would you like me to modify?',
          timestamp: Date.now(),
        };

        setChatMessages((prev) => [...prev, modelMsg]);
        setConversationPhase('editing');

        if (isInitial) {
          const newApp: GeneratedApp = {
            id: Date.now().toString(),
            name: instruction.substring(0, 40) + '...',
            code: finalCode,
            prompt: instruction,
            timestamp: Date.now(),
            history: [...chatMessages, modelMsg],
          };
          setCurrentApp(newApp);
          saveHistory([newApp, ...history].slice(0, 20));
        } else if (currentApp) {
          const updatedApp = {
            ...currentApp,
            code: finalCode,
            history: [...chatMessages, modelMsg],
          };
          setCurrentApp(updatedApp);
          saveHistory(
            history.map((a) => (a.id === updatedApp.id ? updatedApp : a))
          );
        }

        setGenState({
          isGenerating: false,
          error: null,
          progressMessage: '',
          streamingCode: '',
        });
        setViewMode(ViewMode.PREVIEW);
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') {
          setGenState({
            isGenerating: false,
            error: 'Generation cancelled',
            progressMessage: '',
            streamingCode: '',
          });
        } else {
          const errorMessage =
            err instanceof Error ? err.message : 'An error occurred';
          setGenState({
            isGenerating: false,
            error: errorMessage,
            progressMessage: '',
            streamingCode: '',
          });
        }
      }
    },
    [selectedModel, currentApp, history, genState.isGenerating, chatMessages]
  );

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

      const modelMsg: ChatMessage = {
        role: 'model',
        text: isInitial
          ? `✅ Your app is ready! Built with ${selectedModel.name}.\n\nYou can now ask me to make any changes.`
          : '✅ Changes applied!',
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, modelMsg]);
      setConversationPhase('editing');

      if (isInitial) {
        const newApp: GeneratedApp = {
          id: Date.now().toString(),
          name: instruction.substring(0, 40) + '...',
          code,
          prompt: instruction,
          timestamp: Date.now(),
          history: [...chatMessages, modelMsg],
        };
        setCurrentApp(newApp);
        saveHistory([newApp, ...history].slice(0, 20));
      } else if (currentApp) {
        const updatedApp = {
          ...currentApp,
          code,
          history: [...chatMessages, modelMsg],
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
      const userMsg: ChatMessage = {
        role: 'user',
        text: action,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, userMsg]);
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
    a.download = `${currentApp.name
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()}.html`;
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

  // Share (copy link) - for now just copy code
  const shareApp = async () => {
    if (!currentApp?.code) return;
    await navigator.clipboard.writeText(currentApp.code);
    alert('Code copied to clipboard! You can paste it anywhere.');
  };

  // Reset / New Project
  const resetProject = () => {
    if (confirm('Start a new project? Current work will be saved in history.')) {
      setCurrentApp(null);
      setPrompt('');
      setChatMessages([]);
      setConversationPhase('initial');
      setGatheredRequirements([]);
      setViewMode(ViewMode.PREVIEW);
    }
  };

  // Delete current project
  const deleteProject = () => {
    if (currentApp && confirm('Delete this project from history?')) {
      const newHistory = history.filter((h) => h.id !== currentApp.id);
      saveHistory(newHistory);
      setCurrentApp(null);
      setChatMessages([]);
      setConversationPhase('initial');
      setGatheredRequirements([]);
    }
  };

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
            {/* Action Buttons */}
            {currentApp && (
              <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-2">
                <button
                  onClick={shareApp}
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Share / Copy Code"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
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
                  onClick={resetProject}
                  className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                  title="New Project"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={deleteProject}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete Project"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}

            {/* Model Selector */}
            <div className="relative model-dropdown">
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:border-indigo-300 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${
                  selectedModel.provider === 'Gemini' ? 'bg-green-500' :
                  selectedModel.provider === 'OpenAI' ? 'bg-emerald-500' :
                  selectedModel.provider === 'Anthropic' ? 'bg-purple-500' :
                  selectedModel.provider === 'xAI' ? 'bg-blue-500' :
                  'bg-orange-500'
                }`}></span>
                {selectedModel.name}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-gray-400 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isModelDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 p-2 max-h-[70vh] overflow-y-auto">
                  <p className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Select AI Model
                  </p>
                  {['Anthropic', 'OpenAI', 'Gemini', 'xAI', 'Groq'].map((provider) => (
                    <div key={provider} className="mb-2">
                      <p className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        provider === 'Anthropic' ? 'text-purple-600' :
                        provider === 'OpenAI' ? 'text-emerald-600' :
                        provider === 'Gemini' ? 'text-green-600' :
                        provider === 'xAI' ? 'text-blue-600' :
                        'text-orange-600'
                      }`}>
                        {provider}
                      </p>
                      {MODELS.filter((m) => m.provider === provider).map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedModel(m);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors ${
                            selectedModel.id === m.id ? 'bg-indigo-50 ring-1 ring-indigo-200' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-gray-800 flex items-center gap-2">
                              <span>{m.icon}</span>
                              {m.name}
                              {m.isThinking && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">THINKING</span>
                              )}
                            </p>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1 ml-6">{m.description}</p>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Vertical Nav Bar */}
        <nav className="w-16 bg-[#1e1e2e] flex flex-col items-center py-4 gap-2 shrink-0 border-r border-gray-700">
          {/* Home Icon */}
          <Link
            href="/"
            className="p-3 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-white/5"
            title="Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>

          <div className="w-8 h-px bg-gray-600 my-1"></div>

          {/* Panel Toggles */}
          <button
            onClick={() => togglePanel('workspace')}
            className={`p-3 rounded-xl transition-all ${activePanel === 'workspace' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title="Workspace"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>

          <button
            onClick={() => togglePanel('assistant')}
            className={`p-3 rounded-xl transition-all ${activePanel === 'assistant' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title="AI Assistant"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>

          <button
            onClick={() => togglePanel('files')}
            className={`p-3 rounded-xl transition-all ${activePanel === 'files' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title="Files"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </button>

          <button
            onClick={() => togglePanel('history')}
            className={`p-3 rounded-xl transition-all ${activePanel === 'history' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title="History"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button
            onClick={() => togglePanel('tools')}
            className={`p-3 rounded-xl transition-all ${activePanel === 'tools' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title="Tools & Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <div className="w-8 h-px bg-gray-600 my-1"></div>

          {/* View Mode Buttons */}
          <button
            onClick={() => setViewMode(ViewMode.PREVIEW)}
            className={`p-2 rounded-lg transition-all ${viewMode === ViewMode.PREVIEW ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            title="Preview Only"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          <button
            onClick={() => setViewMode(ViewMode.SPLIT)}
            className={`p-2 rounded-lg transition-all ${viewMode === ViewMode.SPLIT ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            title="Split View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </button>

          <button
            onClick={() => setViewMode(ViewMode.CODE)}
            className={`p-2 rounded-lg transition-all ${viewMode === ViewMode.CODE ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            title="Code Only"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>

          <div className="w-8 h-px bg-gray-600 my-1"></div>

          {/* Device Preview Buttons */}
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`p-2 rounded-lg transition-all ${deviceMode === 'desktop' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            title="Desktop Preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            onClick={() => setDeviceMode('tablet')}
            className={`p-2 rounded-lg transition-all ${deviceMode === 'tablet' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            title="Tablet Preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            onClick={() => setDeviceMode('mobile')}
            className={`p-2 rounded-lg transition-all ${deviceMode === 'mobile' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            title="Mobile Preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Status indicator at bottom */}
          <div className="mt-auto">
            <div className={`w-2 h-2 rounded-full mx-auto ${genState.isGenerating ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 relative flex overflow-hidden">
          {/* Preview/Code Area */}
          <div className={`relative overflow-hidden bg-gray-50/30 transition-all duration-300 ease-in-out ${activePanel ? 'flex-1' : 'w-full'}`}>
            {genState.isGenerating && (
              <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl">{selectedModel.icon}</span>
                  </div>
                </div>
                <div className="text-center max-w-md px-6">
                  <p className="text-lg font-bold text-gray-800 tracking-tight">{genState.progressMessage}</p>
                  <p className="text-sm text-gray-500 mt-1">Using {selectedModel.name} • {selectedModel.provider}</p>
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

            {/* View Content */}
            <div className="h-full w-full flex">
              {viewMode === ViewMode.PREVIEW && (
                <Preview code={genState.streamingCode || currentApp?.code || ''} deviceMode={deviceMode} />
              )}
              {viewMode === ViewMode.CODE && (
                <CodeView code={genState.streamingCode || currentApp?.code || ''} />
              )}
              {viewMode === ViewMode.SPLIT && (
                <>
                  <div className="w-1/2 h-full border-r border-gray-200">
                    <Preview code={genState.streamingCode || currentApp?.code || ''} deviceMode={deviceMode} />
                  </div>
                  <div className="w-1/2 h-full">
                    <CodeView code={genState.streamingCode || currentApp?.code || ''} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Panels */}
          <div className={`h-full bg-white transition-all duration-300 ease-in-out overflow-hidden ${activePanel ? 'w-80 border-l border-gray-100 shadow-2xl' : 'w-0'}`}>
            <div className={`w-80 flex flex-col h-full ${activePanel ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
              
              {/* Workspace Panel */}
              {activePanel === 'workspace' && (
                <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Workspace</h3>
                    <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mb-6">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">New App Concept</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ex: Landing page for a SaaS..."
                      className="w-full p-4 text-xs border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50/50 min-h-[120px] resize-none transition-all"
                    />
                    <button
                      onClick={() => {
                        if (prompt.trim()) {
                          setGatheredRequirements([prompt]);
                          handleAgentConversation(prompt);
                          setActivePanel('assistant');
                        }
                      }}
                      disabled={genState.isGenerating || !prompt.trim()}
                      className="w-full mt-3 py-3 bg-indigo-600 text-white text-xs font-bold rounded-2xl hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100"
                    >
                      {genState.isGenerating ? 'BUILDING...' : 'START BUILDING'}
                    </button>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Starter Templates</h3>
                    <div className="space-y-2">
                      {PRESET_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.name}
                          onClick={() => setPrompt(tpl.prompt)}
                          className="w-full text-left px-4 py-3 text-xs text-gray-700 bg-gray-50 hover:bg-white hover:text-indigo-600 rounded-xl border border-transparent hover:border-gray-200 transition-all flex items-center gap-3 group"
                        >
                          <span className="text-lg">{tpl.icon}</span>
                          <span className="flex-1">{tpl.name}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Assistant Panel */}
              {activePanel === 'assistant' && (
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">AI Assistant</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {conversationPhase === 'initial' && 'Tell me what to build'}
                        {conversationPhase === 'gathering' && 'Gathering requirements'}
                        {conversationPhase === 'confirming' && 'Ready to build'}
                        {conversationPhase === 'building' && 'Building...'}
                        {conversationPhase === 'editing' && 'Ask for changes'}
                      </p>
                    </div>
                    <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <ChatBox
                    messages={chatMessages}
                    onSendMessage={handleAgentConversation}
                    isGenerating={genState.isGenerating}
                    conversationPhase={conversationPhase}
                    hasApp={!!currentApp}
                  />
                </div>
              )}

              {/* Files Panel */}
              {activePanel === 'files' && (
                <FilesPanel files={currentApp?.files || []} onClose={() => setActivePanel(null)} />
              )}

              {/* History Panel */}
              {activePanel === 'history' && (
                <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">History</h3>
                    <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {history.length > 0 ? (
                    <div className="space-y-2">
                      {history.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => {
                            setCurrentApp(app);
                            setChatMessages(app.history || []);
                            setConversationPhase('editing');
                          }}
                          className={`w-full text-left px-4 py-3 text-xs rounded-xl transition-all truncate border ${
                            currentApp?.id === app.id
                              ? 'bg-indigo-50 border-indigo-100 text-indigo-700 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="font-bold mb-1 truncate">{app.name}</div>
                          <div className="text-[10px] opacity-60">{new Date(app.timestamp).toLocaleString()}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400 italic text-xs">No project history yet.</div>
                  )}
                </div>
              )}

              {/* Tools Panel */}
              {activePanel === 'tools' && (
                <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tools & Actions</h3>
                    <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Quick Actions */}
                  <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">Quick Enhancements</h4>
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
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">Export Options</h4>
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
                        onClick={shareApp}
                        disabled={!currentApp}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs text-gray-700 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all disabled:opacity-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share / Copy Code
                      </button>
                    </div>
                  </div>

                  {/* Model Info */}
                  <div className="mb-6">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">Current Model</h4>
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{selectedModel.icon}</span>
                        <span className="text-sm font-bold text-gray-800">{selectedModel.name}</span>
                      </div>
                      <p className="text-[10px] text-gray-600">{selectedModel.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          selectedModel.provider === 'Anthropic' ? 'bg-purple-100 text-purple-700' :
                          selectedModel.provider === 'OpenAI' ? 'bg-emerald-100 text-emerald-700' :
                          selectedModel.provider === 'Gemini' ? 'bg-green-100 text-green-700' :
                          selectedModel.provider === 'xAI' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {selectedModel.provider}
                        </span>
                        {selectedModel.isThinking && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">Thinking Mode</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3">Settings</h4>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-800">Generation Error</h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{genState.error}</p>
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

// Main Export with Subscription Gate and Suspense
export default function CanvasAppPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading Canvas Builder...</p>
        </div>
      </div>
    }>
      <SubscriptionGate>
        <CanvasAppInner />
      </SubscriptionGate>
    </Suspense>
  );
}
