'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  DocumentIcon,
  FolderIcon,
  PlayIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  XMarkIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

interface FileTab {
  id: string;
  name: string;
  language: string;
  content: string;
  isModified: boolean;
}

interface FileTreeItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  children?: FileTreeItem[];
  isOpen?: boolean;
}

interface CanvasPanelProps {
  theme?: 'default' | 'neural';
  onContentUpdate?: (content: string) => void;
  agentContent?: {
    filename?: string;
    language?: string;
    content?: string;
  };
}

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: 'text-yellow-400',
  typescript: 'text-blue-400',
  python: 'text-green-400',
  html: 'text-orange-400',
  css: 'text-pink-400',
  json: 'text-gray-400',
  markdown: 'text-purple-400',
  default: 'text-gray-400',
};

const LANGUAGE_ICONS: Record<string, string> = {
  javascript: '📜',
  typescript: '💠',
  python: '🐍',
  html: '🌐',
  css: '🎨',
  json: '📋',
  markdown: '📝',
  default: '📄',
};

export default function CanvasPanel({
  theme = 'default',
  onContentUpdate,
  agentContent,
}: CanvasPanelProps) {
  const isNeural = theme === 'neural';
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  const [tabs, setTabs] = useState<FileTab[]>([
    {
      id: '1',
      name: 'untitled.js',
      language: 'javascript',
      content: '// Start typing or ask AI to generate code\n\nfunction hello() {\n  console.log("Hello, AI Canvas!");\n}\n',
      isModified: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [showFileTree, setShowFileTree] = useState(true);
  const [lineNumbers, setLineNumbers] = useState<number[]>([1, 2, 3, 4, 5, 6]);

  const [fileTree] = useState<FileTreeItem[]>([
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      isOpen: true,
      children: [
        { id: 'index.js', name: 'index.js', type: 'file', language: 'javascript' },
        { id: 'app.tsx', name: 'App.tsx', type: 'file', language: 'typescript' },
        { id: 'styles.css', name: 'styles.css', type: 'file', language: 'css' },
      ],
    },
    { id: 'readme', name: 'README.md', type: 'file', language: 'markdown' },
    { id: 'package', name: 'package.json', type: 'file', language: 'json' },
  ]);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Theme styles
  const bgPrimary = isNeural ? 'bg-gray-900' : 'bg-white';
  const bgSecondary = isNeural ? 'bg-gray-800' : 'bg-gray-50';
  const bgEditor = isNeural ? 'bg-gray-950' : 'bg-gray-900';
  const borderColor = isNeural ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = isNeural ? 'text-gray-100' : 'text-gray-100';
  const textSecondary = isNeural ? 'text-gray-400' : 'text-gray-400';

  // Update editor with agent content
  useEffect(() => {
    if (agentContent?.content) {
      const lang = agentContent.language || 'javascript';
      const filename = agentContent.filename || `untitled.${lang === 'javascript' ? 'js' : lang}`;
      
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                name: filename,
                language: lang,
                content: agentContent.content || '',
                isModified: true,
              }
            : t
        )
      );
      updateLineNumbers(agentContent.content || '');
    }
  }, [agentContent, activeTabId]);

  const updateLineNumbers = useCallback((content: string) => {
    const lines = content.split('\n').length;
    setLineNumbers(Array.from({ length: Math.max(lines, 20) }, (_, i) => i + 1));
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? { ...t, content: newContent, isModified: true }
          : t
      )
    );
    updateLineNumbers(newContent);
    onContentUpdate?.(newContent);
  };

  const addNewTab = () => {
    const newTab: FileTab = {
      id: Date.now().toString(),
      name: 'untitled.js',
      language: 'javascript',
      content: '',
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

  const copyToClipboard = () => {
    if (activeTab) {
      navigator.clipboard.writeText(activeTab.content);
    }
  };

  const renderFileTree = (items: FileTreeItem[], depth = 0) => {
    return items.map((item) => (
      <div key={item.id}>
        <div
          className={`flex items-center space-x-1 px-2 py-1 cursor-pointer hover:bg-gray-700/50 ${textSecondary}`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {item.type === 'folder' ? (
            <>
              {item.isOpen ? (
                <ChevronDownIcon className="w-3 h-3" />
              ) : (
                <ChevronRightIcon className="w-3 h-3" />
              )}
              <FolderIcon className="w-4 h-4 text-yellow-500" />
            </>
          ) : (
            <>
              <span className="w-3" />
              <span className="text-xs">
                {LANGUAGE_ICONS[item.language || 'default']}
              </span>
            </>
          )}
          <span className="text-xs truncate">{item.name}</span>
        </div>
        {item.type === 'folder' && item.isOpen && item.children && (
          renderFileTree(item.children, depth + 1)
        )}
      </div>
    ));
  };

  return (
    <div className={`flex flex-col h-full ${bgPrimary} rounded-lg overflow-hidden`}>
      {/* Top Bar */}
      <div className={`flex items-center justify-between px-3 py-1.5 ${bgSecondary} border-b ${borderColor}`}>
        <div className="flex items-center space-x-2">
          <CodeBracketIcon className={`w-4 h-4 ${isNeural ? 'text-cyan-400' : 'text-indigo-500'}`} />
          <span className={`text-sm font-medium ${isNeural ? 'text-gray-200' : 'text-gray-700'}`}>
            AI Canvas
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={copyToClipboard}
            className={`p-1 rounded hover:bg-gray-700/50`}
            title="Copy to clipboard"
          >
            <ClipboardDocumentIcon className={`w-4 h-4 ${textSecondary}`} />
          </button>
          <button className={`p-1 rounded hover:bg-gray-700/50`} title="Download">
            <ArrowDownTrayIcon className={`w-4 h-4 ${textSecondary}`} />
          </button>
          <button className={`p-1 rounded hover:bg-gray-700/50`} title="Run">
            <PlayIcon className={`w-4 h-4 text-green-400`} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer */}
        {showFileTree && (
          <div className={`w-48 flex-shrink-0 ${bgSecondary} border-r ${borderColor} overflow-y-auto`}>
            <div className={`px-3 py-2 text-xs font-semibold ${textSecondary} uppercase tracking-wider`}>
              Explorer
            </div>
            {renderFileTree(fileTree)}
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className={`flex items-center ${bgSecondary} border-b ${borderColor} px-1`}>
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 cursor-pointer border-b-2 group ${
                  tab.id === activeTabId
                    ? `${bgEditor} border-cyan-400 ${textPrimary}`
                    : `border-transparent ${textSecondary} hover:bg-gray-700/30`
                }`}
              >
                <span className="text-xs">
                  {LANGUAGE_ICONS[tab.language] || LANGUAGE_ICONS.default}
                </span>
                <span className="text-xs">{tab.name}</span>
                {tab.isModified && (
                  <span className={`w-2 h-2 rounded-full ${isNeural ? 'bg-cyan-400' : 'bg-indigo-400'}`} />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              onClick={addNewTab}
              className={`p-1.5 hover:bg-gray-700/50 rounded`}
            >
              <PlusIcon className={`w-4 h-4 ${textSecondary}`} />
            </button>
          </div>

          {/* Editor */}
          <div className={`flex-1 flex ${bgEditor} overflow-hidden`}>
            {/* Line Numbers */}
            <div className={`w-12 flex-shrink-0 py-2 text-right pr-3 select-none border-r border-gray-800 ${textSecondary}`}>
              {lineNumbers.map((num) => (
                <div key={num} className="text-xs leading-6 font-mono">
                  {num}
                </div>
              ))}
            </div>

            {/* Code Area */}
            <div className="flex-1 relative">
              <textarea
                ref={editorRef}
                value={activeTab?.content || ''}
                onChange={handleContentChange}
                className={`w-full h-full p-2 bg-transparent ${textPrimary} font-mono text-sm leading-6 resize-none outline-none`}
                spellCheck={false}
                placeholder="// Start typing or ask AI to generate code..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className={`flex items-center justify-between px-3 py-1 border-t ${borderColor} text-xs`}>
        <div className="flex items-center space-x-3">
          <span className={`flex items-center space-x-1 ${textSecondary}`}>
            <CodeBracketIcon className="w-3 h-3" />
            <span>{activeTab?.language || 'plaintext'}</span>
          </span>
          <span className={textSecondary}>
            Ln {lineNumbers.length}, Col 1
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${isNeural ? 'text-cyan-400' : 'text-indigo-400'}`}>
            AI-Powered
          </span>
        </div>
      </div>
    </div>
  );
}
