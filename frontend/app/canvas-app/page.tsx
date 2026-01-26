'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptions } from '@/contexts/SubscriptionContext';
import type { AgentSubscription } from '@/services/agentSubscriptionService';
import Image from 'next/image';

// Types
interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  hasAudio?: boolean;
  isSystemMessage?: boolean;
}

type ModelProvider = 'One Last AI' | 'Image Generator' | 'Maula AI' | 'Code Builder' | 'Fast Coding' | 'Planner' | 'Designer';

interface ModelOption {
  id: string;
  name: string;
  provider: ModelProvider;
  description: string;
  isThinking?: boolean;
  icon?: string;
  // Backend provider mapping
  backendProvider: string;
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
  // One Last AI - Anthropic Claude (Best for app building)
  {
    id: 'claude-sonnet-4-20250514',
    name: 'Nova',
    provider: 'One Last AI',
    description: 'Best for building apps - highly recommended.',
    icon: '🌟',
    backendProvider: 'anthropic',
  },
  {
    id: 'claude-opus-4-20250514',
    name: 'Nova Pro',
    provider: 'One Last AI',
    description: 'Most powerful AI for complex apps.',
    icon: '💫',
    backendProvider: 'anthropic',
  },
  // Maula AI - Mistral (Platform Branding)
  {
    id: 'mistral-large-2501',
    name: 'Maula Large',
    provider: 'Maula AI',
    description: 'Creative and versatile AI assistant.',
    icon: '🔮',
    backendProvider: 'mistral',
  },
  {
    id: 'codestral-latest',
    name: 'Maula Code',
    provider: 'Maula AI',
    description: 'Optimized for code generation.',
    icon: '💻',
    backendProvider: 'mistral',
  },
  // Image Generator - OpenAI (Best for visual apps)
  {
    id: 'gpt-4o',
    name: 'Vision Pro',
    provider: 'Image Generator',
    description: 'Best for visual and image-rich apps.',
    icon: '🎨',
    backendProvider: 'openai',
  },
  {
    id: 'gpt-4o-mini',
    name: 'Vision Fast',
    provider: 'Image Generator',
    description: 'Fast and cost-effective.',
    icon: '⚡',
    backendProvider: 'openai',
  },
  // Designer - Gemini (Good for UI design)
  {
    id: 'gemini-2.0-flash',
    name: 'Design Flash',
    provider: 'Designer',
    description: 'Fast UI design and layouts.',
    icon: '🎯',
    backendProvider: 'gemini',
  },
  {
    id: 'gemini-2.5-pro-preview-05-06',
    name: 'Design Pro',
    provider: 'Designer',
    description: 'Advanced reasoning for complex UI.',
    icon: '🧠',
    backendProvider: 'gemini',
  },
  // Planner - xAI Grok (Strategic planning)
  {
    id: 'grok-3',
    name: 'Architect',
    provider: 'Planner',
    description: 'Strategic planning and architecture.',
    icon: '📐',
    backendProvider: 'xai',
  },
  {
    id: 'grok-3-fast',
    name: 'Architect Fast',
    provider: 'Planner',
    description: 'Quick planning and prototyping.',
    icon: '🚀',
    backendProvider: 'xai',
  },
  // Code Builder - Groq (Ultra-fast inference)
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Turbo Code',
    provider: 'Code Builder',
    description: 'Ultra-fast code generation.',
    icon: '⚡',
    backendProvider: 'groq',
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Turbo Instant',
    provider: 'Code Builder',
    description: 'Instant responses for quick edits.',
    icon: '💨',
    backendProvider: 'groq',
  },
  // Fast Coding - Cerebras (Fastest for code)
  {
    id: 'llama-3.3-70b',
    name: 'Lightning',
    provider: 'Fast Coding',
    description: 'Fastest code generation available.',
    icon: '⚡',
    backendProvider: 'cerebras',
  },
  {
    id: 'llama3.1-8b',
    name: 'Lightning Lite',
    provider: 'Fast Coding',
    description: 'Quick and efficient for small changes.',
    icon: '✨',
    backendProvider: 'cerebras',
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

// Helper function to create file structure from generated code
const createFilesFromCode = (code: string, appName: string): FileNode[] => {
  // For now, canvas generates single HTML files with embedded CSS/JS
  // We can parse and show the structure
  const files: FileNode[] = [];
  
  // Main project folder
  const projectFolder: FileNode = {
    name: appName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase().substring(0, 30) || 'my-app',
    type: 'folder',
    path: 'project',
    children: []
  };
  
  // Always add index.html with the full code
  projectFolder.children!.push({
    name: 'index.html',
    type: 'file',
    path: 'project/index.html',
    content: code
  });
  
  // Check if code has embedded styles - show as info
  if (code.includes('<style>') || code.includes('<style ')) {
    projectFolder.children!.push({
      name: 'styles (embedded)',
      type: 'file',
      path: 'project/styles-embedded',
      content: '/* Styles are embedded in index.html */'
    });
  }
  
  // Check if code has embedded scripts
  if (code.includes('<script>') || code.includes('<script ')) {
    projectFolder.children!.push({
      name: 'scripts (embedded)',
      type: 'file',
      path: 'project/scripts-embedded',
      content: '// Scripts are embedded in index.html'
    });
  }
  
  files.push(projectFolder);
  return files;
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
      <div className="flex flex-col items-center justify-center h-full w-full text-gray-400 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
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
      <div className="flex flex-col items-center justify-center h-full w-full text-gray-400 bg-gray-900 border-2 border-dashed border-gray-700 rounded-xl">
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
  darkMode?: boolean;
  aiEnabled?: boolean;
}> = ({ messages, onSendMessage, isGenerating, conversationPhase, hasApp, darkMode = false, aiEnabled = true }) => {
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
    <div className={`flex flex-col h-full w-full overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-500 mb-4 ${darkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
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
            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              AI Assistant
            </p>
            <p className={`text-xs leading-relaxed ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
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
                  ? darkMode 
                    ? 'bg-amber-900/30 text-amber-300 rounded-tl-none border border-amber-800'
                    : 'bg-amber-50 text-amber-800 rounded-tl-none border border-amber-200'
                  : darkMode 
                    ? 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                    : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-100'
              }`}
            >
              {msg.text}
            </div>
            <span className={`text-[10px] mt-1 px-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
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
        className={`p-4 border-t ${darkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'}`}
      >
        {!aiEnabled && (
          <div className={`mb-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${darkMode ? 'bg-amber-900/30 text-amber-300 border border-amber-800' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>AI generation requires Weekly/Monthly subscription</span>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={!aiEnabled ? 'Subscribe to use AI...' : getPlaceholderText()}
            className={`flex-1 px-4 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-800'} ${!aiEnabled ? 'opacity-70' : ''}`}
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !input.trim()}
            className={`px-4 py-2 text-white text-xs font-bold rounded-xl transition-all ${!aiEnabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300'}`}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

// Files Panel Component
const FilesPanel: React.FC<{ 
  files: FileNode[]; 
  onClose: () => void;
  onFileClick?: (file: FileNode) => void;
  hasCode: boolean;
  darkMode?: boolean;
}> = ({ files, onClose, onFileClick, hasCode, darkMode = false }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['project']));
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileClick = (node: FileNode) => {
    setSelectedFile(node.path);
    if (onFileClick && node.name === 'index.html') {
      onFileClick(node);
    }
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.html')) return { color: 'text-orange-500', icon: '🌐' };
    if (name.includes('styles')) return { color: 'text-blue-500', icon: '🎨' };
    if (name.includes('scripts')) return { color: 'text-yellow-500', icon: '⚡' };
    return { color: 'text-gray-500', icon: '📄' };
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;
    const paddingLeft = depth * 16 + 12;

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <button
            onClick={() => toggleFolder(node.path)}
            className={`w-full flex items-center gap-2 py-2 px-3 text-xs transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-indigo-50'}`}
            style={{ paddingLeft }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3 w-3 transition-transform ${darkMode ? 'text-gray-500' : 'text-gray-400'} ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-base">📁</span>
            <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{node.name}</span>
          </button>
          {isExpanded && node.children?.map((child) => renderNode(child, depth + 1))}
        </div>
      );
    }

    const fileStyle = getFileIcon(node.name);
    const isClickable = node.name === 'index.html';

    return (
      <button
        key={node.path}
        onClick={() => handleFileClick(node)}
        className={`w-full flex items-center gap-2 py-2 px-3 text-xs transition-colors text-left ${
          isSelected 
            ? darkMode ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-700' 
            : isClickable 
              ? darkMode ? 'text-gray-300 hover:bg-gray-700 cursor-pointer' : 'text-gray-700 hover:bg-indigo-50 cursor-pointer' 
              : darkMode ? 'text-gray-500 cursor-default' : 'text-gray-400 cursor-default'
        }`}
        style={{ paddingLeft }}
        title={isClickable ? 'Click to view code' : node.name}
      >
        <span className="text-sm">{fileStyle.icon}</span>
        <span className={isClickable ? 'font-medium' : 'italic'}>{node.name}</span>
        {node.name === 'index.html' && (
          <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'}`}>main</span>
        )}
      </button>
    );
  };

  // Show actual files if available, otherwise show placeholder
  const displayFiles: FileNode[] = files.length > 0 ? files : [
    {
      name: hasCode ? 'my-app' : 'No project yet',
      type: 'folder',
      path: 'project',
      children: hasCode ? [
        { name: 'index.html', type: 'file', path: 'project/index.html' },
      ] : [],
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Files
        </h3>
        <button
          onClick={onClose}
          className={`${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
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
      <div className={`flex-1 rounded-xl border overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
        {displayFiles.map((node) => renderNode(node))}
      </div>
      {!hasCode && (
        <p className={`text-xs text-center mt-3 italic ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          Generate an app to see project files
        </p>
      )}
    </div>
  );
};

// Subscription Gate Component - Now just provides context, doesn't block
const SubscriptionGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // App is now open to all - subscription check moved to AI generation
  return <>{children}</>;
};

// Hook to check if user has AI access
const useAIAccess = () => {
  const { state } = useAuth();
  const { subscriptions, loading } = useSubscriptions();

  // Check if user has weekly or monthly subscription to ANY agent
  const hasAIAccess = subscriptions.some(
    (sub: AgentSubscription) =>
      sub.status === 'active' &&
      (sub.plan === 'weekly' || sub.plan === 'monthly') &&
      new Date(sub.expiryDate) > new Date()
  );

  return {
    isAuthenticated: state.isAuthenticated,
    hasAIAccess,
    loading,
    // Daily plan users can see but not use AI
    canViewApp: true,
    canUseAI: state.isAuthenticated && hasAIAccess,
  };
};

// Main Canvas App Component (Inner)
function CanvasAppInner() {
  const { state: authState } = useAuth();
  const { subscriptions } = useSubscriptions();
  
  // Check AI access based on subscription
  const { canUseAI, isAuthenticated, loading: aiAccessLoading } = useAIAccess();
  
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelOption>(MODELS[0]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.PREVIEW);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [currentApp, setCurrentApp] = useState<GeneratedApp | null>(null);
  const [history, setHistory] = useState<GeneratedApp[]>([]);
  const [activePanel, setActivePanel] = useState<ActivePanel>('workspace');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [useStreaming, setUseStreaming] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('canvas_dark_mode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [conversationPhase, setConversationPhase] = useState<ConversationPhase>('initial');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [gatheredRequirements, setGatheredRequirements] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Sidebar animation states
  const [sidebarAnimating, setSidebarAnimating] = useState(true);
  const [sidebarGlowIndex, setSidebarGlowIndex] = useState(0);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  
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
      // Close history menu dropdown when clicking outside
      if (openMenuId && !target.closest('.history-menu')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  useEffect(() => {
    const saved = localStorage.getItem('canvas_builder_history');
    if (saved)
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('canvas_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Sidebar scroll animation on mount
  useEffect(() => {
    if (sidebarScrollRef.current && sidebarAnimating) {
      const sidebar = sidebarScrollRef.current;
      const totalHeight = sidebar.scrollHeight - sidebar.clientHeight;
      
      // Animate scroll down then up
      const animateScroll = async () => {
        // Scroll down smoothly
        await new Promise<void>((resolve) => {
          let progress = 0;
          const scrollDown = setInterval(() => {
            progress += 0.02;
            if (progress >= 1) {
              clearInterval(scrollDown);
              resolve();
            }
            sidebar.scrollTop = totalHeight * easeInOutCubic(progress);
          }, 16);
        });
        
        // Pause at bottom
        await new Promise(r => setTimeout(r, 300));
        
        // Scroll back up
        await new Promise<void>((resolve) => {
          let progress = 0;
          const scrollUp = setInterval(() => {
            progress += 0.02;
            if (progress >= 1) {
              clearInterval(scrollUp);
              resolve();
            }
            sidebar.scrollTop = totalHeight * (1 - easeInOutCubic(progress));
          }, 16);
        });
        
        setSidebarAnimating(false);
      };
      
      // Easing function for smooth animation
      const easeInOutCubic = (t: number) => 
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      
      // Start animation after a short delay
      const timer = setTimeout(animateScroll, 500);
      return () => clearTimeout(timer);
    }
  }, [sidebarAnimating]);

  // Sidebar glow cycling effect
  useEffect(() => {
    if (sidebarAnimating) {
      const glowInterval = setInterval(() => {
        setSidebarGlowIndex(prev => (prev + 1) % 12); // 12 items in sidebar
      }, 150);
      return () => clearInterval(glowInterval);
    }
  }, [sidebarAnimating]);

  const saveHistory = (newHistory: GeneratedApp[]) => {
    setHistory(newHistory);
    localStorage.setItem('canvas_builder_history', JSON.stringify(newHistory));
  };

  // AI Agent conversation handler
  const handleAgentConversation = async (userMessage: string) => {
    // Check AI access - if no subscription, show upgrade message
    if (!canUseAI) {
      const upgradeMsg: ChatMessage = {
        role: 'model',
        text: !isAuthenticated 
          ? `🔐 **Sign In Required**\n\nPlease sign in to use AI features.\n\n[Sign In →](/auth/login)`
          : `🔒 **AI Features Locked**\n\nTo unlock AI-powered app generation, you need a **Weekly** or **Monthly** subscription to any AI Agent.\n\n✨ Benefits of subscribing:\n- Full AI app generation\n- Unlimited edits & iterations\n- Code export & download\n- Priority AI processing\n\n[Browse AI Agents →](/agents)`,
        timestamp: Date.now(),
        isSystemMessage: true,
      };
      setChatMessages((prev) => [...prev, { role: 'user', text: userMessage, timestamp: Date.now() }, upgradeMsg]);
      setShowSubscriptionModal(true);
      return;
    }
    
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
            provider: selectedModel.backendProvider,
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
          const appName = instruction.substring(0, 40);
          const newApp: GeneratedApp = {
            id: Date.now().toString(),
            name: appName + '...',
            code: finalCode,
            prompt: instruction,
            timestamp: Date.now(),
            history: [...chatMessages, modelMsg],
            files: createFilesFromCode(finalCode, appName),
          };
          setCurrentApp(newApp);
          saveHistory([newApp, ...history].slice(0, 20));
        } else if (currentApp) {
          const updatedApp = {
            ...currentApp,
            code: finalCode,
            history: [...chatMessages, modelMsg],
            files: createFilesFromCode(finalCode, currentApp.name),
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
          provider: selectedModel.backendProvider,
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
        const appName = instruction.substring(0, 40);
        const newApp: GeneratedApp = {
          id: Date.now().toString(),
          name: appName + '...',
          code,
          prompt: instruction,
          timestamp: Date.now(),
          history: [...chatMessages, modelMsg],
          files: createFilesFromCode(code, appName),
        };
        setCurrentApp(newApp);
        saveHistory([newApp, ...history].slice(0, 20));
      } else if (currentApp) {
        const updatedApp = {
          ...currentApp,
          code,
          history: [...chatMessages, modelMsg],
          files: createFilesFromCode(code, currentApp.name),
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

  // Check if user has required subscription
  const hasRequiredSubscription = subscriptions.some(
    (sub: AgentSubscription) =>
      sub.status === 'active' &&
      (sub.plan === 'weekly' || sub.plan === 'monthly') &&
      new Date(sub.expiryDate) > new Date()
  );

  // Main generate handler
  const handleGenerate = (instruction: string, isInitial: boolean = false) => {
    // Check subscription before generating
    if (!hasRequiredSubscription) {
      setShowSubscriptionModal(true);
      return;
    }
    
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

  // Delete project from history
  const deleteProjectFromHistory = (projectId: string) => {
    if (confirm('Delete this project from history?')) {
      const newHistory = history.filter(app => app.id !== projectId);
      saveHistory(newHistory);
      if (currentApp?.id === projectId) {
        setCurrentApp(null);
        setChatMessages([]);
        setConversationPhase('initial');
      }
      setOpenMenuId(null);
    }
  };

  // Duplicate project (start from existing)
  const duplicateProject = (app: GeneratedApp) => {
    const duplicatedApp = {
      ...app,
      id: Date.now().toString(),
      name: `${app.name} (Copy)`,
      timestamp: Date.now(),
      history: [],
    };
    setCurrentApp(duplicatedApp);
    setChatMessages([]);
    setConversationPhase('editing');
    setOpenMenuId(null);
  };

  // Share project
  const shareProject = async (app: GeneratedApp) => {
    if (!app.code) return;
    await navigator.clipboard.writeText(app.code);
    alert('Code copied to clipboard!');
    setOpenMenuId(null);
  };

  // Reset / New Project
  const resetProject = () => {
    if (currentApp && !confirm('Start a new project? Current work will be saved in history.')) {
      return;
    }
    setCurrentApp(null);
    setPrompt('');
    setChatMessages([]);
    setConversationPhase('initial');
    setGatheredRequirements([]);
    setViewMode(ViewMode.PREVIEW);
  };

  // Delete current project
  const deleteCurrentProject = () => {
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
    <div className={`h-screen overflow-hidden flex transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar Animation Styles */}
      <style jsx>{`
        @keyframes sidebarGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(99, 102, 241, 0); }
          50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.6), inset 0 0 10px rgba(99, 102, 241, 0.3); }
        }
        @keyframes sidebarPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes sidebarSlideIn {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes glowTrail {
          0% { background-position: 0% 0%; }
          100% { background-position: 0% 200%; }
        }
        .sidebar-item-glow {
          animation: sidebarGlow 0.6s ease-in-out;
        }
        .sidebar-item-pulse {
          animation: sidebarPulse 0.4s ease-in-out;
        }
        .sidebar-entrance {
          animation: sidebarSlideIn 0.5s ease-out forwards;
        }
        .sidebar-glow-trail {
          background: linear-gradient(180deg, 
            transparent 0%, 
            rgba(99, 102, 241, 0.1) 20%, 
            rgba(99, 102, 241, 0.3) 50%, 
            rgba(99, 102, 241, 0.1) 80%, 
            transparent 100%
          );
          background-size: 100% 200%;
          animation: glowTrail 2s linear infinite;
        }
      `}</style>
      
      {/* Left Vertical Nav Bar */}
        <nav className={`w-16 flex flex-col items-center shrink-0 border-r relative transition-colors duration-300 ${darkMode ? 'bg-[#0d0d14] border-gray-800' : 'bg-[#1e1e2e] border-gray-700'} ${sidebarAnimating ? 'sidebar-glow-trail' : ''}`}>
          {/* Micro Logo at Top */}
          <div className={`pt-3 pb-2 ${sidebarAnimating ? 'sidebar-entrance' : ''}`} style={{ animationDelay: '0ms' }}>
            <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center">
              <Image 
                src="/images/logos/company-logo.png" 
                alt="OneLast.AI" 
                width={36}
                height={36}
                className={`w-9 h-9 object-contain ${sidebarAnimating ? 'sidebar-item-pulse' : ''}`}
              />
            </div>
          </div>
          
          <div className="w-8 h-px bg-gray-600 mb-2"></div>
          
          {/* Scrollable Content */}
          <div 
            ref={sidebarScrollRef}
            className="flex-1 w-full overflow-y-auto scrollbar-hide py-2 flex flex-col items-center gap-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Home Icon */}
          <Link
            href="/"
            className={`p-3 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-white/5 ${sidebarAnimating && sidebarGlowIndex === 0 ? 'sidebar-item-glow bg-indigo-500/20' : ''}`}
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
            className={`p-3 rounded-xl transition-all ${activePanel === 'workspace' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'} ${sidebarAnimating && sidebarGlowIndex === 1 ? 'sidebar-item-glow bg-indigo-500/20' : ''}`}
            title="Workspace"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>

          <button
            onClick={() => togglePanel('assistant')}
            className={`p-3 rounded-xl transition-all ${activePanel === 'assistant' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'} ${sidebarAnimating && sidebarGlowIndex === 2 ? 'sidebar-item-glow bg-indigo-500/20' : ''}`}
            title="AI Assistant"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>

          <button
            onClick={() => togglePanel('files')}
            className={`p-3 rounded-xl transition-all ${activePanel === 'files' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'} ${sidebarAnimating && sidebarGlowIndex === 3 ? 'sidebar-item-glow bg-indigo-500/20' : ''}`}
            title="Files"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </button>

          <button
            onClick={() => togglePanel('history')}
            className={`p-3 rounded-xl transition-all ${activePanel === 'history' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'} ${sidebarAnimating && sidebarGlowIndex === 4 ? 'sidebar-item-glow bg-indigo-500/20' : ''}`}
            title="History"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button
            onClick={() => togglePanel('tools')}
            className={`p-3 rounded-xl transition-all ${activePanel === 'tools' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'} ${sidebarAnimating && sidebarGlowIndex === 5 ? 'sidebar-item-glow bg-indigo-500/20' : ''}`}
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
            className={`p-2 rounded-lg transition-all ${viewMode === ViewMode.PREVIEW ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-white hover:bg-white/5'} ${sidebarAnimating && sidebarGlowIndex === 6 ? 'sidebar-item-glow bg-indigo-500/20' : ''}`}
            title="Preview Only"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          <button
            onClick={() => setViewMode(ViewMode.SPLIT)}
            className={`p-2 rounded-lg transition-all ${viewMode === ViewMode.SPLIT ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-white hover:bg-white/5'} ${sidebarAnimating && sidebarGlowIndex === 7 ? 'sidebar-item-glow bg-indigo-500/20' : ''}`}
            title="Split View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </button>

          <button
            onClick={() => setViewMode(ViewMode.CODE)}
            className={`p-2 rounded-lg transition-all ${viewMode === ViewMode.CODE ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-white hover:bg-white/5'} ${sidebarAnimating && sidebarGlowIndex === 8 ? 'sidebar-item-glow bg-indigo-500/20' : ''}`}
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
            className={`p-2 rounded-lg transition-all ${deviceMode === 'desktop' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-white hover:bg-white/5'} ${sidebarAnimating && sidebarGlowIndex === 9 ? 'sidebar-item-glow bg-indigo-500/20' : ''}`}
            title="Desktop Preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            onClick={() => setDeviceMode('tablet')}
            className={`p-2 rounded-lg transition-all ${deviceMode === 'tablet' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-white hover:bg-white/5'} ${sidebarAnimating && sidebarGlowIndex === 10 ? 'sidebar-item-glow bg-indigo-500/20' : ''}`}
            title="Tablet Preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            onClick={() => setDeviceMode('mobile')}
            className={`p-2 rounded-lg transition-all ${deviceMode === 'mobile' ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-500 hover:text-white hover:bg-white/5'} ${sidebarAnimating && sidebarGlowIndex === 11 ? 'sidebar-item-glow bg-indigo-500/20' : ''}`}
            title="Mobile Preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>

          <div className="w-8 h-px bg-gray-600 my-1"></div>

          {/* Feature Buttons - Camera, Voice, Screenshot */}
          <button
            onClick={async () => {
              // Open live camera
              try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                  video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
                  audio: false 
                });
                setCameraStream(stream);
                setCameraOpen(true);
                // Set video source after state update
                setTimeout(() => {
                  if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                  }
                }, 100);
              } catch (err) {
                console.error('Camera access denied:', err);
                alert('Camera access denied. Please allow camera permission to use this feature.');
              }
            }}
            className={`p-2 rounded-lg transition-all ${cameraOpen ? 'bg-green-600/20 text-green-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            title="Camera - Live Capture"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2 rounded-lg transition-all ${voiceEnabled ? 'bg-green-600/20 text-green-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            title={voiceEnabled ? 'Voice On - Click to Mute' : 'Voice Off - Click to Enable'}
          >
            {voiceEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>

          <button
            onClick={async () => {
              // Screenshot functionality
              try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const track = stream.getVideoTracks()[0];
                const imageCapture = new (window as any).ImageCapture(track);
                const bitmap = await imageCapture.grabFrame();
                track.stop();
                
                const canvas = document.createElement('canvas');
                canvas.width = bitmap.width;
                canvas.height = bitmap.height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(bitmap, 0, 0);
                
                const dataUrl = canvas.toDataURL('image/png');
                // Add screenshot to chat
                const newMessage: ChatMessage = {
                  id: Date.now().toString(),
                  role: 'user',
                  content: '📸 [Screenshot captured for analysis]',
                  timestamp: Date.now(),
                };
                setChatMessages(prev => [...prev, newMessage]);
                setActivePanel('assistant');
              } catch (err) {
                console.log('Screenshot cancelled or not supported');
              }
            }}
            className="p-2 rounded-lg transition-all text-gray-500 hover:text-white hover:bg-white/5"
            title="Screenshot - Capture Screen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          <div className="w-8 h-px bg-gray-600 my-1"></div>

          {/* Share Icon */}
          <button
            onClick={() => {
              if (currentApp?.code) {
                navigator.clipboard.writeText(currentApp.code);
                alert('Code copied to clipboard!');
              } else {
                alert('No project to share yet. Generate an app first!');
              }
            }}
            className={`p-2 rounded-lg transition-all ${currentApp ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-700 cursor-not-allowed'}`}
            title="Share - Copy Code"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          {/* Download Icon */}
          <button
            onClick={() => {
              if (currentApp?.code) {
                const blob = new Blob([currentApp.code], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${currentApp.name || 'app'}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } else {
                alert('No project to download yet. Generate an app first!');
              }
            }}
            className={`p-2 rounded-lg transition-all ${currentApp ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-700 cursor-not-allowed'}`}
            title="Download HTML"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          {/* Open External Icon */}
          <button
            onClick={() => {
              if (currentApp?.code) {
                const blob = new Blob([currentApp.code], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
              } else {
                alert('No project to open yet. Generate an app first!');
              }
            }}
            className={`p-2 rounded-lg transition-all ${currentApp ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-700 cursor-not-allowed'}`}
            title="Open in New Tab"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>

          {/* Delete Icon */}
          <button
            onClick={() => {
              if (currentApp) {
                if (confirm('Delete this project from history?')) {
                  const newHistory = history.filter((h) => h.id !== currentApp.id);
                  localStorage.setItem('canvas_builder_history', JSON.stringify(newHistory));
                  setHistory(newHistory);
                  setCurrentApp(null);
                  setChatMessages([]);
                  setConversationPhase('initial');
                  setGatheredRequirements([]);
                }
              } else {
                alert('No project to delete.');
              }
            }}
            className={`p-2 rounded-lg transition-all ${currentApp ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-700 cursor-not-allowed'}`}
            title="Delete Project"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          <div className="w-8 h-px bg-gray-600 my-1"></div>

          {/* Templates Icon */}
          <button
            onClick={() => setTemplatesOpen(true)}
            className="p-2 rounded-lg transition-all text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10"
            title="Templates - Start from Template"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </button>

          <div className="w-8 h-px bg-gray-600 my-1"></div>

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={() => {
              const newMode = !darkMode;
              setDarkMode(newMode);
              localStorage.setItem('canvas_dark_mode', JSON.stringify(newMode));
            }}
            className={`p-2 rounded-lg transition-all ${darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Status indicator at bottom */}
          <div className="mt-auto pb-2">
            <div className={`w-2 h-2 rounded-full mx-auto ${genState.isGenerating ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
          </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 relative flex overflow-hidden">
          {/* Preview/Code Area */}
          <div className={`relative overflow-hidden transition-all duration-300 ease-in-out ${activePanel ? 'flex-1' : 'w-full'} ${darkMode ? 'bg-gray-800/30' : 'bg-gray-50/30'}`}>
            {genState.isGenerating && (
              <div className={`absolute inset-0 z-40 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in ${darkMode ? 'bg-gray-900/80' : 'bg-white/80'}`}>
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl">{selectedModel.icon}</span>
                  </div>
                </div>
                <div className="text-center max-w-md px-6">
                  <p className={`text-lg font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-800'}`}>{genState.progressMessage}</p>
                  <p className="text-sm text-gray-500 mt-1">Using {selectedModel.name} • {selectedModel.provider}</p>
                  {genState.streamingCode && (
                    <div className="mt-4 text-left">
                      <p className="text-[10px] text-indigo-600 font-bold uppercase mb-2">
                        Generating {genState.streamingCode.length.toLocaleString()} characters...
                      </p>
                      <div className={`h-1 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div className="h-full bg-indigo-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={cancelGeneration}
                    className={`mt-4 px-4 py-2 text-xs font-medium rounded-lg transition-all ${darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* View Content */}
            <div className="h-full w-full flex">
              {viewMode === ViewMode.PREVIEW && (
                <div className="w-full h-full">
                  <Preview code={genState.streamingCode || currentApp?.code || ''} deviceMode={deviceMode} />
                </div>
              )}
              {viewMode === ViewMode.CODE && (
                <div className="w-full h-full">
                  <CodeView code={genState.streamingCode || currentApp?.code || ''} />
                </div>
              )}
              {viewMode === ViewMode.SPLIT && (
                <>
                  <div className={`w-1/2 h-full border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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
          <div className={`h-full transition-all duration-300 ease-in-out overflow-hidden ${activePanel ? 'w-80 border-l shadow-2xl' : 'w-0'} ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className={`w-80 flex flex-col h-full ${activePanel ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
              
              {/* Workspace Panel */}
              {activePanel === 'workspace' && (
                <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Workspace</h3>
                    <button onClick={() => setActivePanel(null)} className={`${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mb-6">
                    <label className={`block text-[10px] font-bold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>New App Concept</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ex: Landing page for a SaaS..."
                      className={`w-full p-4 text-xs border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] resize-none transition-all ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50/50 border-gray-200 text-gray-800'}`}
                    />
                    <button
                      onClick={() => {
                        if (!canUseAI) {
                          setShowSubscriptionModal(true);
                          return;
                        }
                        if (prompt.trim()) {
                          setGatheredRequirements([prompt]);
                          handleAgentConversation(prompt);
                          setActivePanel('assistant');
                        }
                      }}
                      disabled={genState.isGenerating || !prompt.trim()}
                      className={`w-full mt-3 py-3 text-white text-xs font-bold rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-md ${darkMode ? 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-900/30' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
                    >
                      {genState.isGenerating ? 'BUILDING...' : canUseAI ? 'START BUILDING' : '🔒 UPGRADE TO BUILD'}
                    </button>
                  </div>
                  <div>
                    <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Starter Templates</h3>
                    <div className="space-y-2">
                      {PRESET_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.name}
                          onClick={() => setPrompt(tpl.prompt)}
                          className={`w-full text-left px-4 py-3 text-xs rounded-xl border border-transparent transition-all flex items-center gap-3 group ${darkMode ? 'text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-indigo-400 hover:border-gray-600' : 'text-gray-700 bg-gray-50 hover:bg-white hover:text-indigo-600 hover:border-gray-200'}`}
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
                  <div className={`px-6 py-4 border-b flex items-center justify-between ${darkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-50 bg-gray-50/50'}`}>
                    <div>
                      <h3 className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI Assistant</h3>
                      <p className={`text-[10px] mt-0.5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {conversationPhase === 'initial' && 'Tell me what to build'}
                        {conversationPhase === 'gathering' && 'Gathering requirements'}
                        {conversationPhase === 'confirming' && 'Ready to build'}
                        {conversationPhase === 'building' && 'Building...'}
                        {conversationPhase === 'editing' && 'Ask for changes'}
                      </p>
                    </div>
                    <button onClick={() => setActivePanel(null)} className={`${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
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
                    darkMode={darkMode}
                    aiEnabled={canUseAI}
                  />
                </div>
              )}

              {/* Files Panel */}
              {activePanel === 'files' && (
                <FilesPanel 
                  files={currentApp?.files || []} 
                  onClose={() => setActivePanel(null)} 
                  onFileClick={() => setViewMode(ViewMode.CODE)}
                  hasCode={!!currentApp?.code}
                  darkMode={darkMode}
                />
              )}

              {/* History Panel */}
              {activePanel === 'history' && (
                <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>History</h3>
                    <div className="flex items-center gap-3">
                      {/* New Project Button */}
                      <button
                        onClick={resetProject}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors ${darkMode ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-indigo-500 hover:bg-indigo-600'}`}
                        title="Start New Project"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>New</span>
                      </button>
                      <button onClick={() => setActivePanel(null)} className={`${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {history.length > 0 ? (
                    <div className="space-y-2">
                      {history.map((app) => (
                        <div key={app.id} className="relative group">
                          <button
                            onClick={() => {
                              // Regenerate files from code if not present
                              const appWithFiles = app.files?.length ? app : {
                                ...app,
                                files: app.code ? createFilesFromCode(app.code, app.name) : []
                              };
                              setCurrentApp(appWithFiles);
                              setChatMessages(app.history || []);
                              setConversationPhase('editing');
                            }}
                            className={`w-full text-left px-4 py-3 pr-12 text-xs rounded-xl transition-all truncate border ${
                              currentApp?.id === app.id
                                ? darkMode 
                                  ? 'bg-indigo-900/30 border-indigo-800 text-indigo-300 shadow-sm'
                                  : 'bg-indigo-50 border-indigo-100 text-indigo-700 shadow-sm'
                                : darkMode
                                  ? 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600'
                                  : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <div className="font-bold mb-1 truncate">{app.name}</div>
                            <div className="text-[10px] opacity-60">{new Date(app.timestamp).toLocaleString()}</div>
                          </button>
                          
                          {/* Hamburger Menu */}
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 history-menu">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === app.id ? null : app.id);
                              }}
                              className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                              title="Options"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                                <circle cx="2" cy="8" r="1.5"/>
                                <circle cx="8" cy="8" r="1.5"/>
                                <circle cx="14" cy="8" r="1.5"/>
                              </svg>
                            </button>
                            
                            {/* Dropdown Menu */}
                            {openMenuId === app.id && (
                              <div className={`absolute right-0 top-full mt-1 w-40 rounded-lg shadow-xl border py-1 z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateProject(app);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  Duplicate
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    shareProject(app);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                  </svg>
                                  Share
                                </button>
                                <div className={`border-t my-1 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}></div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteProjectFromHistory(app.id);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-900/20 flex items-center gap-2"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className={`italic text-xs mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No project history yet.</p>
                      <button
                        onClick={resetProject}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Start Your First Project
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tools Panel */}
              {activePanel === 'tools' && (
                <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Tools & Actions</h3>
                    <button onClick={() => setActivePanel(null)} className={`${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Quick Actions */}
                  <div className="mb-6">
                    <h4 className={`text-[10px] font-bold uppercase mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Quick Enhancements</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => handleQuickAction(action.label)}
                          disabled={!currentApp || genState.isGenerating}
                          className={`flex items-center gap-2 px-3 py-2 text-[10px] font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${darkMode ? 'text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-indigo-400' : 'text-gray-600 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600'}`}
                        >
                          <span>{action.icon}</span>
                          <span className="truncate">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Provider & Model Selection */}
                  <div className="mb-6">
                    <h4 className={`text-[10px] font-bold uppercase mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Provider & Model</h4>
                    
                    {/* Current Selection */}
                    <div className={`p-4 rounded-xl border mb-3 ${darkMode ? 'bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-800' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{selectedModel.icon}</span>
                        <span className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedModel.name}</span>
                      </div>
                      <p className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedModel.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          selectedModel.provider === 'One Last AI' ? darkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700' :
                          selectedModel.provider === 'Image Generator' ? darkMode ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-700' :
                          selectedModel.provider === 'Designer' ? darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700' :
                          selectedModel.provider === 'Planner' ? darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700' :
                          selectedModel.provider === 'Maula AI' ? darkMode ? 'bg-pink-900/50 text-pink-300' : 'bg-pink-100 text-pink-700' :
                          selectedModel.provider === 'Code Builder' ? darkMode ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700' :
                          darkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {selectedModel.provider}
                        </span>
                        {selectedModel.isThinking && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>Thinking Mode</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Provider Tabs */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(['One Last AI', 'Maula AI', 'Image Generator', 'Designer', 'Planner', 'Code Builder', 'Fast Coding'] as ModelProvider[]).map((provider) => (
                        <button
                          key={provider}
                          onClick={() => {
                            const firstModel = MODELS.find(m => m.provider === provider);
                            if (firstModel) setSelectedModel(firstModel);
                          }}
                          className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                            selectedModel.provider === provider
                              ? provider === 'One Last AI' ? darkMode ? 'bg-purple-900/50 text-purple-300 ring-1 ring-purple-700' : 'bg-purple-100 text-purple-700 ring-1 ring-purple-300' :
                                provider === 'Image Generator' ? darkMode ? 'bg-emerald-900/50 text-emerald-300 ring-1 ring-emerald-700' : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300' :
                                provider === 'Designer' ? darkMode ? 'bg-green-900/50 text-green-300 ring-1 ring-green-700' : 'bg-green-100 text-green-700 ring-1 ring-green-300' :
                                provider === 'Planner' ? darkMode ? 'bg-blue-900/50 text-blue-300 ring-1 ring-blue-700' : 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' :
                                provider === 'Maula AI' ? darkMode ? 'bg-pink-900/50 text-pink-300 ring-1 ring-pink-700' : 'bg-pink-100 text-pink-700 ring-1 ring-pink-300' :
                                provider === 'Code Builder' ? darkMode ? 'bg-orange-900/50 text-orange-300 ring-1 ring-orange-700' : 'bg-orange-100 text-orange-700 ring-1 ring-orange-300' :
                                darkMode ? 'bg-yellow-900/50 text-yellow-300 ring-1 ring-yellow-700' : 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300'
                              : darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {provider}
                        </button>
                      ))}
                    </div>
                    
                    {/* Model List for Selected Provider */}
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {MODELS.filter(m => m.provider === selectedModel.provider).map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedModel(m)}
                          className={`w-full text-left p-3 rounded-xl transition-all ${
                            selectedModel.id === m.id 
                              ? darkMode ? 'bg-indigo-900/30 ring-1 ring-indigo-700' : 'bg-indigo-50 ring-1 ring-indigo-200' 
                              : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{m.icon}</span>
                            <span className={`text-xs font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{m.name}</span>
                            {m.isThinking && (
                              <span className={`text-[8px] px-1.5 py-0.5 rounded ${darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>THINKING</span>
                            )}
                          </div>
                          <p className={`text-[10px] mt-1 ml-6 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{m.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Settings */}
                  <div>
                    <h4 className={`text-[10px] font-bold uppercase mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Settings</h4>
                    <div className="space-y-3">
                      <label className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${useStreaming ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Real-time Streaming</span>
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

      {/* Live Camera Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center">
          {/* Camera Header */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              Live Camera
            </h3>
            <button
              onClick={() => {
                // Stop camera stream
                if (cameraStream) {
                  cameraStream.getTracks().forEach(track => track.stop());
                  setCameraStream(null);
                }
                setCameraOpen(false);
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
              title="Close Camera"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Video Preview */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-[60vh] bg-black"
            />
            {/* Capture Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-white/50 rounded-tl-lg"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-white/50 rounded-tr-lg"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-white/50 rounded-bl-lg"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-white/50 rounded-br-lg"></div>
            </div>
          </div>

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Capture Button */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={() => {
                // Capture photo from video
                if (videoRef.current && canvasRef.current) {
                  const video = videoRef.current;
                  const canvas = canvasRef.current;
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(video, 0, 0);
                    const imageDataUrl = canvas.toDataURL('image/png');
                    
                    // Stop camera
                    if (cameraStream) {
                      cameraStream.getTracks().forEach(track => track.stop());
                      setCameraStream(null);
                    }
                    setCameraOpen(false);

                    // Add captured image to chat
                    const newMessage: ChatMessage = {
                      id: Date.now().toString(),
                      role: 'user',
                      content: `📷 [Live photo captured]\n\n![Captured Image](${imageDataUrl})`,
                      timestamp: Date.now(),
                    };
                    setChatMessages(prev => [...prev, newMessage]);
                    setActivePanel('assistant');

                    // Auto-send AI response acknowledging the image
                    setTimeout(() => {
                      const aiResponse: ChatMessage = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: "I've received your captured photo! 📸 I can see the image you've shared. How would you like me to help you with this? I can:\n\n• **Analyze** the content and describe what I see\n• **Generate code** inspired by the design or layout\n• **Extract text** if there's any visible text\n• **Create a similar UI** based on the visual elements\n\nJust let me know what you'd like to do!",
                        timestamp: Date.now() + 1,
                      };
                      setChatMessages(prev => [...prev, aiResponse]);
                    }, 500);
                  }
                }
              }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform active:scale-95 group"
              title="Capture Photo"
            >
              <div className="w-16 h-16 bg-red-500 rounded-full group-hover:bg-red-600 transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </button>
          </div>

          {/* Instructions */}
          <p className="mt-4 text-white/60 text-sm">
            Point camera at what you want to capture, then tap the button
          </p>
        </div>
      )}

      {/* Templates Modal */}
      {templatesOpen && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-3xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <div>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Start from Template</h2>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Choose a template to get started quickly</p>
              </div>
              <button
                onClick={() => setTemplatesOpen(false)}
                className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Templates Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[60vh]">
              {/* Template 1: Landing Page */}
              <button
                onClick={() => {
                  const templatePrompt = "Create a modern landing page with a hero section, features grid, testimonials, and a call-to-action footer. Use a clean design with gradients.";
                  setPrompt(templatePrompt);
                  setTemplatesOpen(false);
                  setActivePanel('workspace');
                  // Add to chat
                  const newMessage: ChatMessage = {
                    id: Date.now().toString(),
                    role: 'user',
                    content: `🎨 Starting from template: **Landing Page**\n\n${templatePrompt}`,
                    timestamp: Date.now(),
                  };
                  setChatMessages(prev => [...prev, newMessage]);
                }}
                className={`group p-4 border-2 rounded-2xl transition-all text-left ${darkMode ? 'border-gray-700 hover:border-indigo-500 hover:bg-indigo-900/20' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Landing Page</h3>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Modern hero, features, testimonials & CTA</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}>Hero</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${darkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-600'}`}>Features</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${darkMode ? 'bg-pink-900/50 text-pink-300' : 'bg-pink-100 text-pink-600'}`}>CTA</span>
                </div>
              </button>

              {/* Template 2: Dashboard */}
              <button
                onClick={() => {
                  const templatePrompt = "Create a dashboard UI with a sidebar navigation, stats cards at the top, a main chart area, and a recent activity list. Use a dark theme with accent colors.";
                  setPrompt(templatePrompt);
                  setTemplatesOpen(false);
                  setActivePanel('workspace');
                  const newMessage: ChatMessage = {
                    id: Date.now().toString(),
                    role: 'user',
                    content: `🎨 Starting from template: **Dashboard**\n\n${templatePrompt}`,
                    timestamp: Date.now(),
                  };
                  setChatMessages(prev => [...prev, newMessage]);
                }}
                className={`group p-4 border-2 rounded-2xl transition-all text-left ${darkMode ? 'border-gray-700 hover:border-indigo-500 hover:bg-indigo-900/20' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dashboard</h3>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Sidebar, stats cards, charts & activity</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${darkMode ? 'bg-cyan-900/50 text-cyan-300' : 'bg-cyan-100 text-cyan-600'}`}>Charts</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>Stats</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${darkMode ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-600'}`}>Dark</span>
                </div>
              </button>

              {/* Template 3: Todo App */}
              <button
                onClick={() => {
                  const templatePrompt = "Create a todo list app with the ability to add, complete, and delete tasks. Include categories, a progress bar, and a clean minimal design.";
                  setPrompt(templatePrompt);
                  setTemplatesOpen(false);
                  setActivePanel('workspace');
                  const newMessage: ChatMessage = {
                    id: Date.now().toString(),
                    role: 'user',
                    content: `🎨 Starting from template: **Todo App**\n\n${templatePrompt}`,
                    timestamp: Date.now(),
                  };
                  setChatMessages(prev => [...prev, newMessage]);
                }}
                className={`group p-4 border-2 rounded-2xl transition-all text-left ${darkMode ? 'border-gray-700 hover:border-indigo-500 hover:bg-indigo-900/20' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Todo App</h3>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Task management with categories & progress</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-600'}`}>Tasks</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${darkMode ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-600'}`}>Progress</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${darkMode ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-600'}`}>Minimal</span>
                </div>
              </button>

              {/* More templates coming soon placeholder */}
              <div className={`p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center opacity-60 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className={`font-medium text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>More Coming Soon</h3>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>E-commerce, Blog, Portfolio...</p>
              </div>
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t flex items-center justify-between ${darkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'}`}>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                💡 Tip: You can also describe any custom app idea in the chat
              </p>
              <button
                onClick={() => setTemplatesOpen(false)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Required Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-3xl shadow-2xl max-w-md w-full overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Subscription Required</h2>
              <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                AI-Powered App Generator
              </p>
              <div className={`rounded-xl p-4 mb-6 ${darkMode ? 'bg-amber-900/30 border border-amber-800' : 'bg-amber-50 border border-amber-200'}`}>
                <p className={`text-sm ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                  <strong>Weekly or Monthly subscription required.</strong><br />
                  Subscribe to any AI Agent with a weekly or monthly plan to unlock Canvas Builder.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Maybe Later
                </button>
                <Link
                  href="/agents"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-center"
                >
                  Browse AI Agents
                </Link>
              </div>
              {!authState.isAuthenticated && (
                <p className={`mt-4 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Already subscribed? <Link href="/auth/login" className="text-indigo-500 hover:underline">Sign in</Link>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {genState.error && (
        <div className={`fixed bottom-6 right-6 z-[100] max-w-sm p-4 border rounded-3xl shadow-2xl flex gap-4 items-start border-l-4 border-l-red-500 animate-slide-up ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-red-100'}`}>
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

      {/* Subscription Required Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className={`max-w-md w-full rounded-3xl shadow-2xl p-8 text-center animate-slide-up ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {!isAuthenticated ? 'Sign In to Continue' : 'Unlock AI Generation'}
            </h2>
            <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {!isAuthenticated 
                ? 'Sign in to access AI-powered app generation.'
                : 'Subscribe to any AI Agent with a Weekly or Monthly plan to unlock all AI features.'}
            </p>
            
            {!isAuthenticated ? (
              <Link
                href="/auth/login"
                className="inline-block w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30"
              >
                Sign In
              </Link>
            ) : (
              <div className="space-y-4">
                <div className={`rounded-xl p-4 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Weekly or Monthly Plan</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Any AI Agent subscription</p>
                    </div>
                  </div>
                  <ul className={`text-left text-xs space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>✓ Unlimited AI app generation</li>
                    <li>✓ Real-time code streaming</li>
                    <li>✓ Export & download projects</li>
                    <li>✓ All 7 AI providers included</li>
                  </ul>
                </div>
                <Link
                  href="/agents"
                  className="inline-block w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30"
                >
                  Browse AI Agents
                </Link>
              </div>
            )}
            
            <button
              onClick={() => setShowSubscriptionModal(false)}
              className={`mt-4 text-sm transition-colors ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Continue Exploring
            </button>
          </div>
        </div>
      )}

      {/* AI Status Indicator */}
      {!canUseAI && (
        <div className={`fixed bottom-4 left-20 z-40 flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
          <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {!isAuthenticated ? 'Sign in for AI' : 'AI Disabled - Upgrade to unlock'}
          </span>
          <button
            onClick={() => setShowSubscriptionModal(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            {!isAuthenticated ? 'Sign In' : 'Upgrade'}
          </button>
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

// Main Export - No auth gate, anyone can explore
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
      <CanvasAppInner />
    </Suspense>
  );
}
