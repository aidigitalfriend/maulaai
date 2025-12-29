'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  StarIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  PlusIcon,
  LockClosedIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  content?: React.ReactNode;
  isLoading?: boolean;
}

interface BrowserPanelProps {
  theme?: 'default' | 'neural';
  onContentUpdate?: (content: string) => void;
  agentContent?: {
    url?: string;
    title?: string;
    content?: string;
    html?: string;
  };
}

export default function BrowserPanel({
  theme = 'default',
  onContentUpdate,
  agentContent,
}: BrowserPanelProps) {
  const isNeural = theme === 'neural';
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: '1',
      title: 'New Tab',
      url: 'about:blank',
      content: null,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [urlInput, setUrlInput] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Theme styles
  const bgPrimary = isNeural ? 'bg-gray-900' : 'bg-white';
  const bgSecondary = isNeural ? 'bg-gray-800' : 'bg-gray-100';
  const borderColor = isNeural ? 'border-gray-700' : 'border-gray-200';
  const textPrimary = isNeural ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isNeural ? 'text-gray-400' : 'text-gray-500';

  // Update tab with agent content
  useEffect(() => {
    if (agentContent) {
      const newTab: BrowserTab = {
        id: Date.now().toString(),
        title: agentContent.title || 'AI Search Result',
        url: agentContent.url || 'ai://search',
        content: agentContent.content || agentContent.html,
      };
      setTabs((prev) => {
        const updated = prev.map((t) =>
          t.id === activeTabId ? { ...t, ...newTab, id: t.id } : t
        );
        return updated;
      });
      setUrlInput(agentContent.url || 'ai://search');
    }
  }, [agentContent, activeTabId]);

  const handleNavigate = (url: string) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId ? { ...t, url, title: url, isLoading: true } : t
      )
    );
    setUrlInput(url);
    // Simulate loading
    setTimeout(() => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, isLoading: false } : t))
      );
    }, 500);
  };

  const addNewTab = () => {
    const newTab: BrowserTab = {
      id: Date.now().toString(),
      title: 'New Tab',
      url: 'about:blank',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setUrlInput('');
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter((t) => t.id !== tabId);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
    setTabs(newTabs);
  };

  return (
    <div
      className={`flex flex-col h-full ${bgPrimary} rounded-lg overflow-hidden`}
    >
      {/* Tab Bar */}
      <div
        className={`flex items-center ${bgSecondary} border-b ${borderColor} px-2 py-1`}
      >
        <div className="flex-1 flex items-center space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => {
                setActiveTabId(tab.id);
                setUrlInput(tab.url);
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-t-lg cursor-pointer min-w-[120px] max-w-[200px] group ${
                tab.id === activeTabId
                  ? `${bgPrimary} ${textPrimary}`
                  : `${textSecondary} hover:bg-gray-700/20`
              }`}
            >
              {tab.isLoading ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <GlobeAltIcon className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="text-xs truncate flex-1">{tab.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-gray-600/20 rounded p-0.5"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addNewTab}
          className={`p-1.5 rounded hover:${
            isNeural ? 'bg-gray-700' : 'bg-gray-200'
          }`}
        >
          <PlusIcon className={`w-4 h-4 ${textSecondary}`} />
        </button>
      </div>

      {/* Navigation Bar */}
      <div
        className={`flex items-center space-x-2 px-3 py-2 border-b ${borderColor}`}
      >
        <button
          className={`p-1.5 rounded hover:${
            isNeural ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          <ArrowLeftIcon className={`w-4 h-4 ${textSecondary}`} />
        </button>
        <button
          className={`p-1.5 rounded hover:${
            isNeural ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          <ArrowRightIcon className={`w-4 h-4 ${textSecondary}`} />
        </button>
        <button
          onClick={() => handleNavigate(urlInput)}
          className={`p-1.5 rounded hover:${
            isNeural ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          <ArrowPathIcon className={`w-4 h-4 ${textSecondary}`} />
        </button>
        <button
          className={`p-1.5 rounded hover:${
            isNeural ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          <HomeIcon className={`w-4 h-4 ${textSecondary}`} />
        </button>

        {/* URL Bar */}
        <div
          className={`flex-1 flex items-center ${bgSecondary} rounded-full px-3 py-1.5`}
        >
          <LockClosedIcon
            className={`w-4 h-4 ${
              isNeural ? 'text-green-400' : 'text-green-600'
            } mr-2`}
          />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate(urlInput)}
            placeholder="Search or enter URL..."
            className={`flex-1 bg-transparent text-sm ${textPrimary} outline-none`}
          />
          <MagnifyingGlassIcon className={`w-4 h-4 ${textSecondary}`} />
        </div>

        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`p-1.5 rounded hover:${
            isNeural ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          {isBookmarked ? (
            <StarSolidIcon
              className={`w-4 h-4 ${
                isNeural ? 'text-yellow-400' : 'text-yellow-500'
              }`}
            />
          ) : (
            <StarIcon className={`w-4 h-4 ${textSecondary}`} />
          )}
        </button>
        <button
          className={`p-1.5 rounded hover:${
            isNeural ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          <EllipsisHorizontalIcon className={`w-4 h-4 ${textSecondary}`} />
        </button>
      </div>

      {/* Content Area */}
      <div className={`flex-1 overflow-auto ${bgPrimary} p-4`}>
        {activeTab?.content ? (
          <div className={`prose ${isNeural ? 'prose-invert' : ''} max-w-none`}>
            {typeof activeTab.content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: activeTab.content }} />
            ) : (
              activeTab.content
            )}
          </div>
        ) : activeTab?.url === 'about:blank' ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div
              className={`text-6xl mb-4 ${
                isNeural ? 'text-cyan-400' : 'text-indigo-500'
              }`}
            >
              🌐
            </div>
            <h2 className={`text-xl font-semibold ${textPrimary}`}>
              AI Browser
            </h2>
            <p className={`text-sm ${textSecondary} text-center max-w-md`}>
              Ask the AI to search for anything. Results will appear here
              without leaving the chat.
            </p>
            <div
              className={`flex items-center space-x-2 ${bgSecondary} rounded-full px-4 py-2 mt-4`}
            >
              <MagnifyingGlassIcon className={`w-5 h-5 ${textSecondary}`} />
              <span className={`text-sm ${textMuted}`}>
                Try: "Search for React hooks tutorial"
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <ArrowPathIcon
              className={`w-8 h-8 ${textSecondary} animate-spin`}
            />
            <p className={`text-sm ${textSecondary} mt-2`}>Loading...</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div
        className={`flex items-center justify-between px-3 py-1 border-t ${borderColor} text-xs ${textMuted}`}
      >
        <span>AI-Powered Browser</span>
        <span>{activeTab?.url || 'Ready'}</span>
      </div>
    </div>
  );
}
