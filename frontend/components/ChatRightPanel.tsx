'use client';

import { useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { BrowserPanel, CanvasPanel } from './panels';

type PanelView = 'browser' | 'canvas' | 'chat';

interface BrowserContent {
  url: string;
  title: string;
  content: string;
  isLoading?: boolean;
}

interface CanvasContent {
  filename: string;
  language: string;
  code: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatRightPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  theme?: 'default' | 'neural';
  browserContent?: BrowserContent;
  canvasContent?: CanvasContent;
  parallelMessages?: ChatMessage[];
}

export default function ChatRightPanel({
  isCollapsed = false,
  onToggleCollapse,
  theme = 'default',
  browserContent,
  canvasContent,
  parallelMessages = [],
}: ChatRightPanelProps) {
  const [activeView, setActiveView] = useState<PanelView>('browser');
  const isNeural = theme === 'neural';

  // Theme styles
  const sidebarBg = isNeural
    ? 'bg-gray-900/95 border-cyan-500/20'
    : 'bg-white border-gray-200';

  const textSecondary = isNeural ? 'text-gray-400' : 'text-gray-500';
  const textPrimary = isNeural ? 'text-gray-100' : 'text-gray-900';
  const textMuted = isNeural ? 'text-gray-500' : 'text-gray-400';

  // Panel icons configuration
  const panelIcons = [
    { id: 'browser' as PanelView, icon: GlobeAltIcon, label: 'Browser', color: 'cyan' },
    { id: 'canvas' as PanelView, icon: CodeBracketIcon, label: 'Canvas', color: 'purple' },
    { id: 'chat' as PanelView, icon: ChatBubbleLeftRightIcon, label: 'Chat', color: 'green' },
  ];

  // Get active icon color
  const getIconColor = (panelId: PanelView, isActive: boolean) => {
    if (!isActive) return textMuted;
    switch (panelId) {
      case 'browser':
        return isNeural ? 'text-cyan-400' : 'text-cyan-600';
      case 'canvas':
        return isNeural ? 'text-purple-400' : 'text-purple-600';
      case 'chat':
        return isNeural ? 'text-green-400' : 'text-green-600';
      default:
        return textSecondary;
    }
  };

  // Collapsed state - shows 3 icons vertically
  if (isCollapsed) {
    return (
      <div
        className={`w-12 flex-shrink-0 flex flex-col border-l ${sidebarBg} transition-all duration-300`}
      >
        {/* Toggle button */}
        <button
          onClick={onToggleCollapse}
          className={`p-3 hover:bg-opacity-20 ${
            isNeural ? 'hover:bg-cyan-500' : 'hover:bg-gray-200'
          } transition-colors`}
          title="Expand panel"
        >
          <ChevronLeftIcon className={`w-5 h-5 ${textSecondary}`} />
        </button>

        {/* Panel selector icons */}
        <div className="flex-1 flex flex-col items-center py-4 space-y-2">
          {panelIcons.map((panel) => {
            const Icon = panel.icon;
            const isActive = activeView === panel.id;
            return (
              <button
                key={panel.id}
                onClick={() => {
                  setActiveView(panel.id);
                  onToggleCollapse?.();
                }}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? isNeural
                      ? `bg-${panel.color}-500/20 ring-1 ring-${panel.color}-500/50`
                      : `bg-${panel.color}-100 ring-1 ring-${panel.color}-300`
                    : isNeural
                    ? 'hover:bg-gray-800'
                    : 'hover:bg-gray-100'
                }`}
                title={panel.label}
              >
                <Icon className={`w-5 h-5 ${getIconColor(panel.id, isActive)}`} />
              </button>
            );
          })}
        </div>

        {/* Bottom indicator */}
        <div className="p-3 flex justify-center">
          <div
            className={`w-2 h-2 rounded-full ${
              isNeural ? 'bg-purple-400 animate-pulse' : 'bg-indigo-400'
            }`}
          />
        </div>
      </div>
    );
  }

  // Expanded state
  return (
    <div
      className={`w-[450px] flex-shrink-0 flex flex-col h-full border-l ${sidebarBg} transition-all duration-300`}
    >
      {/* Header with tabs */}
      <div
        className={`flex-shrink-0 border-b ${
          isNeural ? 'border-gray-700/50 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}
      >
        <div className="flex items-center justify-between px-2 py-1">
          {/* Collapse button */}
          <button
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-lg transition-colors ${
              isNeural ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
            }`}
            title="Collapse panel"
          >
            <ChevronRightIcon className={`w-4 h-4 ${textSecondary}`} />
          </button>

          {/* Tab buttons */}
          <div className="flex items-center space-x-1">
            {panelIcons.map((panel) => {
              const Icon = panel.icon;
              const isActive = activeView === panel.id;
              return (
                <button
                  key={panel.id}
                  onClick={() => setActiveView(panel.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? isNeural
                        ? `bg-gray-800 ${getIconColor(panel.id, true)}`
                        : `bg-white shadow-sm ${getIconColor(panel.id, true)}`
                      : `${textMuted} ${isNeural ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{panel.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'browser' && (
          <BrowserPanel
            theme={theme}
            content={browserContent}
          />
        )}
        {activeView === 'canvas' && (
          <CanvasPanel
            theme={theme}
            content={canvasContent}
          />
        )}
        {activeView === 'chat' && (
          <ParallelChatPanel
            theme={theme}
            messages={parallelMessages}
          />
        )}
      </div>
    </div>
  );
}

// Parallel Chat Panel Component
function ParallelChatPanel({
  theme,
  messages,
}: {
  theme: 'default' | 'neural';
  messages: ChatMessage[];
}) {
  const isNeural = theme === 'neural';
  const textPrimary = isNeural ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isNeural ? 'text-gray-400' : 'text-gray-500';
  const textMuted = isNeural ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className="h-full flex flex-col">
      {/* Chat header */}
      <div
        className={`px-4 py-3 border-b ${
          isNeural ? 'border-gray-700/50' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isNeural ? 'bg-green-400 animate-pulse' : 'bg-green-500'
            }`}
          />
          <span className={`text-sm font-medium ${textPrimary}`}>
            Parallel Conversation
          </span>
        </div>
        <p className={`text-xs ${textMuted} mt-1`}>
          Side thread for focused discussions
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className={`text-center py-12 ${textMuted}`}>
            <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No parallel conversations yet</p>
            <p className="text-xs mt-1">
              Start a side thread to discuss specific topics
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user'
                    ? isNeural
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                      : 'bg-indigo-600 text-white'
                    : isNeural
                    ? 'bg-gray-800 text-gray-100'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.role === 'user'
                      ? 'text-white/60'
                      : isNeural
                      ? 'text-gray-500'
                      : 'text-gray-400'
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick input hint */}
      <div
        className={`px-4 py-3 border-t ${
          isNeural ? 'border-gray-700/50' : 'border-gray-200'
        }`}
      >
        <p className={`text-xs ${textMuted} text-center`}>
          Use the main chat input to continue this thread
        </p>
      </div>
    </div>
  );
}
