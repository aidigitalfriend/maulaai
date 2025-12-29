'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bars3Icon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import ChatSessionSidebar from './ChatSessionSidebar';
import ChatSettingsPanel, { AgentSettings, NEURAL_PRESETS } from './ChatSettingsPanel';
import type { AIProvider } from '../app/agents/types';

interface ChatSession {
  id: string;
  name: string;
  lastMessage?: string;
  messageCount?: number;
  updatedAt?: Date;
}

interface EnhancedChatLayoutProps {
  children: React.ReactNode;
  agentId: string;
  agentName: string;
  agentIcon?: string;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewSession: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newName: string) => void;
  onExportSession?: (id: string) => void;
  settings: AgentSettings;
  onUpdateSettings: (settings: Partial<AgentSettings>) => void;
  onResetSettings: () => void;
  showSidebar?: boolean;
  showThemeToggle?: boolean;
}

export type ChatTheme = 'default' | 'neural';

export default function EnhancedChatLayout({
  children,
  agentId,
  agentName,
  agentIcon = '🤖',
  sessions,
  activeSessionId,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onExportSession,
  settings,
  onUpdateSettings,
  onResetSettings,
  showSidebar = true,
  showThemeToggle = true,
}: EnhancedChatLayoutProps) {
  const [theme, setTheme] = useState<ChatTheme>('default');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem(`chat-theme-${agentId}`) as ChatTheme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [agentId]);

  // Save theme to localStorage
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'default' ? 'neural' : 'default';
    setTheme(newTheme);
    localStorage.setItem(`chat-theme-${agentId}`, newTheme);
  }, [theme, agentId]);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isNeural = theme === 'neural';

  // Theme-based styles
  const containerBg = isNeural
    ? 'neural-bg neural-grid'
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50';

  const headerBg = isNeural
    ? 'bg-gray-900/80 border-cyan-500/20 backdrop-blur-xl'
    : 'bg-white/80 border-gray-200 backdrop-blur-xl';

  const textPrimary = isNeural ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isNeural ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`h-screen flex flex-col ${containerBg} relative overflow-hidden`}>
      {/* Top Header Bar */}
      <div className={`flex-shrink-0 border-b ${headerBg} z-40`}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Mobile menu + Agent info */}
          <div className="flex items-center space-x-3">
            {showSidebar && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isNeural
                    ? 'hover:bg-gray-800 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                } md:hidden`}
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{agentIcon}</span>
              <div>
                <h1 className={`font-bold ${textPrimary}`}>{agentName}</h1>
                <p className={`text-xs ${textSecondary}`}>
                  {sessions.length > 0 
                    ? `${sessions.find(s => s.id === activeSessionId)?.name || 'Select a conversation'}`
                    : 'Start a new conversation'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Right: Theme toggle + Settings */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            {showThemeToggle && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all ${
                  isNeural
                    ? 'hover:bg-cyan-500/20 text-cyan-400'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title={isNeural ? 'Switch to Light Mode' : 'Switch to Neural Mode'}
              >
                {isNeural ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <SparklesIcon className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-2 rounded-lg transition-all ${
                isNeural
                  ? 'hover:bg-purple-500/20 text-purple-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Agent Settings"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Overlay */}
        {isMobile && isSidebarOpen && (
          <div
            className="absolute inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        {showSidebar && (
          <div
            className={`${
              isMobile
                ? `absolute left-0 top-0 bottom-0 z-50 transform transition-transform duration-300 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                  }`
                : 'relative'
            }`}
          >
            <ChatSessionSidebar
              sessions={sessions}
              activeSessionId={activeSessionId}
              agentId={agentId}
              agentName={agentName}
              agentIcon={agentIcon}
              onNewChat={onNewSession}
              onSelectSession={(id) => {
                onSelectSession(id);
                if (isMobile) setIsSidebarOpen(false);
              }}
              onDeleteSession={onDeleteSession}
              onRenameSession={onRenameSession}
              onExportSession={onExportSession}
              isCollapsed={!isMobile && isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              theme={theme}
            />
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Settings Panel */}
          <ChatSettingsPanel
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            onResetSettings={onResetSettings}
            agentName={agentName}
            theme={theme}
          />

          {/* Children (ChatBox) */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>

      {/* Neural Theme Effects */}
      {isNeural && (
        <>
          {/* Corner glow effects */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Status indicator */}
          <div className="absolute bottom-4 left-4 flex items-center space-x-2 text-xs text-cyan-400/60 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono">NEURAL_LINK_ACTIVE</span>
          </div>
        </>
      )}
    </div>
  );
}

// Export utility hook for theme management
export function useChatTheme(agentId: string) {
  const [theme, setTheme] = useState<ChatTheme>('default');

  useEffect(() => {
    const savedTheme = localStorage.getItem(`chat-theme-${agentId}`) as ChatTheme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [agentId]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'default' ? 'neural' : 'default';
    setTheme(newTheme);
    localStorage.setItem(`chat-theme-${agentId}`, newTheme);
    return newTheme;
  }, [theme, agentId]);

  return { theme, setTheme, toggleTheme, isNeural: theme === 'neural' };
}
