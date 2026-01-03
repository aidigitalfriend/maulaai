'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  PlayIcon,
  CodeBracketIcon,
  EyeIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  FolderIcon,
  ChevronDownIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface FileTab {
  id: string;
  name: string;
  language: string;
  content: string;
  isModified: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CanvasModeProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'default' | 'neural';
  initialCode?: string;
  initialLanguage?: string;
  initialFilename?: string;
}

const LANGUAGE_ICONS: Record<string, string> = {
  javascript: '📜',
  typescript: '💠',
  python: '🐍',
  html: '🌐',
  css: '🎨',
  json: '📋',
  markdown: '📝',
  jsx: '⚛️',
  tsx: '⚛️',
  default: '📄',
};

// Pre-built templates for quick start
const TEMPLATES = [
  // Landing Pages
  { id: 't1', name: 'SaaS Landing', category: 'Landing', icon: '🚀', prompt: 'Create a modern SaaS landing page with hero section, features grid, pricing cards, testimonials, and CTA. Use gradient backgrounds and smooth animations.' },
  { id: 't2', name: 'Portfolio', category: 'Landing', icon: '👨‍💼', prompt: 'Build a creative portfolio website with about section, project gallery with hover effects, skills section, and contact form. Modern dark theme.' },
  { id: 't3', name: 'Startup', category: 'Landing', icon: '💡', prompt: 'Design a startup landing page with animated hero, team section, how it works steps, and newsletter signup. Vibrant colors.' },
  { id: 't4', name: 'Agency', category: 'Landing', icon: '🏢', prompt: 'Create a digital agency website with services showcase, case studies grid, client logos, and booking form. Professional design.' },
  { id: 't5', name: 'App Promo', category: 'Landing', icon: '📱', prompt: 'Build a mobile app promotion page with phone mockup, feature highlights, download buttons, and app screenshots carousel.' },
  
  // Dashboards
  { id: 't6', name: 'Analytics', category: 'Dashboard', icon: '📊', prompt: 'Create an analytics dashboard with stats cards, line chart placeholder, bar chart, recent activity list, and sidebar navigation. Dark theme.' },
  { id: 't7', name: 'Admin Panel', category: 'Dashboard', icon: '⚙️', prompt: 'Build an admin panel with user management table, search/filter, pagination, sidebar menu, and top navbar with notifications.' },
  { id: 't8', name: 'Finance', category: 'Dashboard', icon: '💰', prompt: 'Design a finance dashboard with balance cards, transaction history, expense chart, and quick action buttons. Clean minimal style.' },
  { id: 't9', name: 'Project Manager', category: 'Dashboard', icon: '📋', prompt: 'Create a project management dashboard with kanban-style task cards, progress bars, team avatars, and deadline calendar.' },
  { id: 't10', name: 'CRM', category: 'Dashboard', icon: '👥', prompt: 'Build a CRM dashboard with leads funnel, recent contacts, deal pipeline, and activity timeline. Professional blue theme.' },
  
  // E-commerce
  { id: 't11', name: 'Product Store', category: 'E-commerce', icon: '🛒', prompt: 'Create an e-commerce product grid with filter sidebar, product cards with hover effects, cart icon, and sorting dropdown.' },
  { id: 't12', name: 'Product Page', category: 'E-commerce', icon: '📦', prompt: 'Build a product detail page with image gallery, size/color selectors, add to cart button, reviews section, and related products.' },
  { id: 't13', name: 'Checkout', category: 'E-commerce', icon: '💳', prompt: 'Design a checkout page with order summary, shipping form, payment method selector, and order confirmation. Clean UX.' },
  { id: 't14', name: 'Fashion Store', category: 'E-commerce', icon: '👗', prompt: 'Create a fashion boutique homepage with hero banner, new arrivals, categories grid, and Instagram feed section.' },
  { id: 't15', name: 'Food Delivery', category: 'E-commerce', icon: '🍔', prompt: 'Build a food delivery app UI with restaurant cards, menu items, cart sidebar, and delivery tracking section.' },
  
  // Components
  { id: 't16', name: 'Login Form', category: 'Components', icon: '🔐', prompt: 'Create a beautiful login/signup form with social login buttons, input validation styling, and forgot password link. Glassmorphism style.' },
  { id: 't17', name: 'Pricing Table', category: 'Components', icon: '💎', prompt: 'Build a 3-tier pricing table with feature comparison, popular badge, monthly/yearly toggle, and CTA buttons.' },
  { id: 't18', name: 'Contact Form', category: 'Components', icon: '✉️', prompt: 'Design a contact form with name, email, subject, message fields, and submit button. Include form validation styling.' },
  { id: 't19', name: 'Navigation', category: 'Components', icon: '🧭', prompt: 'Create a responsive navigation bar with logo, menu links, dropdown menu, mobile hamburger, and search icon.' },
  { id: 't20', name: 'Cards Gallery', category: 'Components', icon: '🃏', prompt: 'Build a gallery of various card designs: blog card, user card, stats card, pricing card, and testimonial card.' },
  
  // Creative
  { id: 't21', name: 'Blog', category: 'Creative', icon: '📝', prompt: 'Create a blog homepage with featured post hero, recent articles grid, categories sidebar, and newsletter signup.' },
  { id: 't22', name: 'Event Page', category: 'Creative', icon: '🎉', prompt: 'Design an event landing page with countdown timer, speaker profiles, schedule timeline, and ticket purchase section.' },
  { id: 't23', name: 'Resume/CV', category: 'Creative', icon: '📄', prompt: 'Build a digital resume/CV page with profile photo, experience timeline, skills bars, education, and download button.' },
  { id: 't24', name: 'Restaurant', category: 'Creative', icon: '🍽️', prompt: 'Create a restaurant website with hero image, menu sections, reservation form, gallery, and location map placeholder.' },
  { id: 't25', name: 'Fitness App', category: 'Creative', icon: '💪', prompt: 'Design a fitness app UI with workout cards, progress rings, activity calendar, and achievement badges.' },
];

export default function CanvasMode({
  isOpen,
  onClose,
  theme = 'neural',
  initialCode = '// Start coding or ask AI to help\n\nfunction hello() {\n  console.log("Hello from AI Canvas!");\n}\n\nhello();',
  initialLanguage = 'javascript',
  initialFilename = 'main.js',
}: CanvasModeProps) {
  const isNeural = theme === 'neural';
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // State
  const [activeView, setActiveView] = useState<'code' | 'preview' | 'split'>(
    'code'
  );
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Welcome to Canvas! 🎨 I can help you create amazing designs. Try a template or describe what you want to build!',
      timestamp: new Date(),
    },
  ]);

  const [tabs, setTabs] = useState<FileTab[]>([
    {
      id: '1',
      name: initialFilename,
      language: initialLanguage,
      content: initialCode,
      isModified: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];
  
  // Filter templates by category
  const filteredTemplates = selectedCategory === 'All' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === selectedCategory);

  // Handle template selection
  const handleTemplateSelect = (template: typeof TEMPLATES[0]) => {
    setChatInput(template.prompt);
    setShowTemplates(false);
  };

  // Update line numbers when content changes
  useEffect(() => {
    if (activeTab) {
      const lines = activeTab.content.split('\n').length;
      setLineNumbers(
        Array.from({ length: Math.max(lines, 25) }, (_, i) => i + 1)
      );
    }
  }, [activeTab?.content]);

  // Theme styles - Enhanced with shadcn aesthetics
  const bgPrimary = isNeural
    ? 'bg-gradient-to-b from-gray-900 to-gray-950'
    : 'bg-gradient-to-b from-white to-slate-50';
  const bgSecondary = isNeural ? 'bg-gray-800/80' : 'bg-slate-100/80';
  const bgEditor = isNeural ? 'bg-gray-950' : 'bg-slate-900';
  const borderColor = isNeural ? 'border-gray-700/40' : 'border-slate-200/80';
  const textPrimary = isNeural ? 'text-gray-50' : 'text-slate-900';
  const textSecondary = isNeural ? 'text-gray-400' : 'text-slate-500';
  const accentColor = isNeural ? 'cyan' : 'indigo';

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? { ...t, content: newContent, isModified: true }
          : t
      )
    );
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userPrompt = chatInput.trim();
    setChatInput('');
    setIsGenerating(true);

    try {
      // Call the real Canvas API
      const response = await fetch('/api/canvas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          provider: 'Anthropic',
          modelId: 'claude-3-5-sonnet',
          currentCode: activeTab?.content,
          history: messages.map(m => ({ role: m.role, text: m.content })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate code');
      }

      // Update the active tab with generated code
      if (data.code) {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === activeTabId
              ? { ...t, content: data.code, isModified: true, language: 'html', name: 'index.html' }
              : t
          )
        );
        setActiveView('split');
        
        // Auto-run the preview
        setTimeout(() => {
          if (previewRef.current) {
            const doc = previewRef.current.contentDocument;
            if (doc) {
              doc.open();
              doc.write(data.code);
              doc.close();
            }
          }
        }, 100);
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '✨ Done! I\'ve generated the code and updated the preview. You can see the result on the right, or switch to Code view to edit.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, there was an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const addNewTab = () => {
    const newTab: FileTab = {
      id: Date.now().toString(),
      name: 'untitled.js',
      language: 'javascript',
      content: '// New file\n',
      isModified: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter((t) => t.id !== tabId);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
    setTabs(newTabs);
  };

  const copyCode = () => {
    if (activeTab) {
      navigator.clipboard.writeText(activeTab.content);
    }
  };

  const downloadCode = () => {
    if (activeTab) {
      const blob = new Blob([activeTab.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeTab.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const runCode = () => {
    if (activeTab && previewRef.current) {
      // For HTML/CSS/JS, render in iframe
      const content = activeTab.content;
      const doc = previewRef.current.contentDocument;
      if (doc) {
        if (activeTab.language === 'html') {
          doc.open();
          doc.write(content);
          doc.close();
        } else if (
          activeTab.language === 'javascript' ||
          activeTab.language === 'jsx'
        ) {
          doc.open();
          doc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: system-ui; padding: 20px; background: #1a1a2e; color: #eee; }
                  pre { background: #0d0d1a; padding: 15px; border-radius: 8px; overflow: auto; }
                </style>
              </head>
              <body>
                <pre id="output"></pre>
                <script>
                  const output = document.getElementById('output');
                  const originalLog = console.log;
                  console.log = (...args) => {
                    output.textContent += args.join(' ') + '\\n';
                    originalLog.apply(console, args);
                  };
                  try {
                    ${content}
                  } catch (e) {
                    output.textContent += 'Error: ' + e.message;
                  }
                </script>
              </body>
            </html>
          `);
          doc.close();
        }
      }
      setActiveView('split');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex ${
        isNeural ? 'bg-gray-950' : 'bg-gray-100'
      }`}
    >
      {/* Left Chat Panel */}
      <div
        className={`flex flex-col border-r ${borderColor} transition-all duration-300 ${
          isChatCollapsed ? 'w-12' : 'w-80'
        } ${bgPrimary}`}
      >
        {/* Chat Header */}
        <div
          className={`flex items-center justify-between px-3 py-2 border-b ${borderColor}`}
        >
          {!isChatCollapsed && (
            <div className="flex items-center space-x-2">
              <SparklesIcon
                className={`w-5 h-5 ${
                  isNeural ? 'text-cyan-400' : 'text-indigo-500'
                }`}
              />
              <span className={`font-medium ${textPrimary}`}>AI Assistant</span>
            </div>
          )}
          <button
            onClick={() => setIsChatCollapsed(!isChatCollapsed)}
            className={`p-1.5 rounded-lg hover:bg-gray-700/50 ${textSecondary}`}
          >
            {isChatCollapsed ? (
              <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Chat Messages */}
        {!isChatCollapsed && (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-2.5 ${
                      msg.role === 'user'
                        ? isNeural
                          ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white'
                          : 'bg-indigo-600 text-white'
                        : isNeural
                          ? 'bg-gray-800 text-gray-100'
                          : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      isNeural ? 'bg-gray-800' : 'bg-gray-200'
                    }`}
                  >
                    <div className="flex space-x-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isNeural ? 'bg-cyan-400' : 'bg-indigo-400'
                        } animate-bounce`}
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isNeural ? 'bg-cyan-400' : 'bg-indigo-400'
                        } animate-bounce`}
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isNeural ? 'bg-cyan-400' : 'bg-indigo-400'
                        } animate-bounce`}
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className={`p-3 border-t ${borderColor}`}>
              {/* Templates Toggle Button */}
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className={`w-full mb-2 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  showTemplates
                    ? isNeural
                      ? 'bg-cyan-600/20 text-cyan-400 ring-1 ring-cyan-500/30'
                      : 'bg-indigo-100 text-indigo-600 ring-1 ring-indigo-200'
                    : isNeural
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>🎨</span>
                {showTemplates ? 'Hide Templates' : 'Browse 25+ Templates'}
              </button>

              {/* Templates Panel */}
              {showTemplates && (
                <div className={`mb-3 rounded-xl overflow-hidden ${isNeural ? 'bg-gray-800/50' : 'bg-gray-50'} border ${borderColor}`}>
                  {/* Category Tabs */}
                  <div className={`flex overflow-x-auto p-2 gap-1 border-b ${borderColor}`}>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                          selectedCategory === cat
                            ? isNeural
                              ? 'bg-cyan-600 text-white'
                              : 'bg-indigo-600 text-white'
                            : isNeural
                              ? 'text-gray-400 hover:bg-gray-700'
                              : 'text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  
                  {/* Templates Grid */}
                  <div className="p-2 max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                      {filteredTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className={`p-2 rounded-lg text-left transition-all hover:scale-[1.02] ${
                            isNeural
                              ? 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600/30 hover:border-cyan-500/30'
                              : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-indigo-300 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{template.icon}</span>
                            <div>
                              <p className={`text-xs font-medium ${textPrimary}`}>{template.name}</p>
                              <p className={`text-[10px] ${textSecondary}`}>{template.category}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`flex items-end space-x-2 rounded-xl ${
                  isNeural ? 'bg-gray-800' : 'bg-gray-100'
                } p-2`}
              >
                <textarea
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Describe what you want to build..."
                  className={`flex-1 resize-none bg-transparent outline-none text-sm ${textPrimary} placeholder-gray-500`}
                  rows={2}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isGenerating}
                  className={`p-2 rounded-lg transition-colors ${
                    chatInput.trim() && !isGenerating
                      ? isNeural
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Collapsed Chat Icons */}
        {isChatCollapsed && (
          <div className="flex-1 flex flex-col items-center py-4 space-y-3">
            <button
              onClick={() => setIsChatCollapsed(false)}
              className={`p-2 rounded-lg hover:bg-gray-700/50 ${textSecondary}`}
              title="Open Chat"
            >
              <SparklesIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div
          className={`flex items-center justify-between px-4 py-2 border-b ${borderColor} ${bgSecondary}`}
        >
          {/* File Tabs */}
          <div className="flex items-center space-x-1 flex-1 overflow-x-auto">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-t-lg cursor-pointer group ${
                  tab.id === activeTabId
                    ? `${bgEditor} ${textPrimary}`
                    : `${textSecondary} hover:bg-gray-700/30`
                }`}
              >
                <span className="text-sm">
                  {LANGUAGE_ICONS[tab.language] || LANGUAGE_ICONS.default}
                </span>
                <span className="text-sm">{tab.name}</span>
                {tab.isModified && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isNeural ? 'bg-cyan-400' : 'bg-indigo-400'
                    }`}
                  />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={addNewTab}
              className={`p-1.5 hover:bg-gray-700/50 rounded ${textSecondary}`}
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>

          {/* View Controls */}
          <div className="flex items-center space-x-2 ml-4">
            <div
              className={`flex items-center rounded-lg ${
                isNeural ? 'bg-gray-800' : 'bg-gray-200'
              } p-0.5`}
            >
              <button
                onClick={() => setActiveView('code')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  activeView === 'code'
                    ? isNeural
                      ? 'bg-gray-700 text-cyan-400'
                      : 'bg-white text-indigo-600 shadow-sm'
                    : textSecondary
                }`}
              >
                <CodeBracketIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveView('split')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  activeView === 'split'
                    ? isNeural
                      ? 'bg-gray-700 text-cyan-400'
                      : 'bg-white text-indigo-600 shadow-sm'
                    : textSecondary
                }`}
              >
                <ArrowsPointingOutIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveView('preview')}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  activeView === 'preview'
                    ? isNeural
                      ? 'bg-gray-700 text-cyan-400'
                      : 'bg-white text-indigo-600 shadow-sm'
                    : textSecondary
                }`}
              >
                <EyeIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={runCode}
              className={`p-2 rounded-lg hover:bg-green-500/20 text-green-400`}
              title="Run"
            >
              <PlayIcon className="w-4 h-4" />
            </button>
            <button
              onClick={copyCode}
              className={`p-2 rounded-lg hover:bg-gray-700/50 ${textSecondary}`}
              title="Copy"
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
            </button>
            <button
              onClick={downloadCode}
              className={`p-2 rounded-lg hover:bg-gray-700/50 ${textSecondary}`}
              title="Download"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-red-500/20 text-red-400`}
              title="Close Canvas"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor + Preview Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Code Editor */}
          {(activeView === 'code' || activeView === 'split') && (
            <div
              className={`${
                activeView === 'split' ? 'w-1/2' : 'flex-1'
              } flex ${bgEditor}`}
            >
              {/* Line Numbers */}
              <div
                className={`w-12 py-3 text-right pr-3 select-none text-xs ${textSecondary} border-r border-gray-800`}
              >
                {lineNumbers.map((num) => (
                  <div key={num} className="leading-6">
                    {num}
                  </div>
                ))}
              </div>

              {/* Editor */}
              <textarea
                ref={editorRef}
                value={activeTab?.content || ''}
                onChange={handleContentChange}
                className={`flex-1 p-3 bg-transparent outline-none resize-none font-mono text-sm leading-6 ${textPrimary}`}
                spellCheck={false}
                style={{ tabSize: 2 }}
              />
            </div>
          )}

          {/* Resize Handle */}
          {activeView === 'split' && (
            <div
              className={`w-1 cursor-col-resize ${
                isNeural
                  ? 'bg-gray-700 hover:bg-cyan-500/50'
                  : 'bg-gray-300 hover:bg-indigo-400'
              } transition-colors`}
            />
          )}

          {/* Preview Panel */}
          {(activeView === 'preview' || activeView === 'split') && (
            <div
              className={`${
                activeView === 'split' ? 'w-1/2' : 'flex-1'
              } flex flex-col ${bgPrimary}`}
            >
              <div
                className={`px-3 py-2 border-b ${borderColor} flex items-center space-x-2`}
              >
                <EyeIcon
                  className={`w-4 h-4 ${
                    isNeural ? 'text-purple-400' : 'text-indigo-500'
                  }`}
                />
                <span className={`text-sm font-medium ${textPrimary}`}>
                  Live Preview
                </span>
              </div>
              <iframe
                ref={previewRef}
                className="flex-1 w-full bg-white"
                title="Preview"
                sandbox="allow-scripts"
              />
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div
          className={`flex items-center justify-between px-4 py-1 border-t ${borderColor} ${bgSecondary}`}
        >
          <div className="flex items-center space-x-4">
            <span className={`text-xs ${textSecondary}`}>
              {activeTab?.language.toUpperCase()}
            </span>
            <span className={`text-xs ${textSecondary}`}>
              Ln {lineNumbers.length}, Col 1
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isNeural ? 'bg-cyan-400 animate-pulse' : 'bg-green-400'
              }`}
            />
            <span className={`text-xs ${textSecondary}`}>Canvas Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
