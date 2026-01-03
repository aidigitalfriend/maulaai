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
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Welcome to Canvas! I can help you write, edit, and improve code. What would you like to create?',
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
  const bgPrimary = isNeural ? 'bg-gradient-to-b from-gray-900 to-gray-950' : 'bg-gradient-to-b from-white to-slate-50';
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
    setChatInput('');
    setIsGenerating(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          "I understand! Let me help you with that. Here's what I suggest...",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 1000);
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
                  placeholder="Ask AI to help with code..."
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
