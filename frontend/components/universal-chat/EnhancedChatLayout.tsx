'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bars3Icon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';
import ChatSessionSidebar from './ChatSessionSidebar';
import ChatSettingsPanel, { AgentSettings } from './ChatSettingsPanel';
import ChatRightPanel from './ChatRightPanel';
import CanvasMode from './canvas-build/CanvasMode';
import { ThemeProvider, useChatTheme, ChatTheme } from './ThemeContext';

// Re-export for backward compatibility
export { useChatTheme, ChatTheme } from './ThemeContext';

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
  externalUrl?: string;
}

// Inner component that uses the theme context
function EnhancedChatLayoutContent({
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
  externalUrl,
}: EnhancedChatLayoutProps) {
  // Use theme from context
  const { theme, toggleTheme, isNeural } = useChatTheme();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeLeftPanel, setActiveLeftPanel] = useState<
    'sessions' | 'settings'
  >('sessions');
  const [isMobileCanvasOpen, setIsMobileCanvasOpen] = useState(false);

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

  // Handle settings toggle - show in left panel
  const handleSettingsToggle = () => {
    if (activeLeftPanel === 'settings') {
      setActiveLeftPanel('sessions');
    } else {
      setActiveLeftPanel('settings');
      if (!isSidebarOpen) {
        setIsSidebarOpen(true);
      }
    }
  };

  // Theme-based styles
  const containerBg = isNeural
    ? 'neural-bg neural-grid'
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50';

  const headerBg = isNeural
    ? 'bg-gray-900/80 border-cyan-500/20 backdrop-blur-xl'
    : 'bg-white/80 border-gray-200 backdrop-blur-xl';

  const textPrimary = isNeural ? '!text-[#E5E7EB]' : 'text-gray-900';
  const textSecondary = isNeural ? '!text-[#9CA3AF]' : 'text-gray-600';

  return (
    <div
      className={`h-screen flex flex-col ${containerBg} relative overflow-hidden`}
    >
      {/* Top Header Bar */}
      <div className={`flex-shrink-0 border-b ${headerBg} z-40`}>
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left: Mobile menu + Platform branding */}
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
              {/* Platform Logo */}
              <img
                src="/images/logos/company-logo.png"
                alt="OnelastAI"
                className="h-8 w-auto object-contain"
              />
              <p className={`text-[11px] ${textSecondary}`}>
                AI Digital Friend
              </p>
            </div>
          </div>

          {/* Right: Canvas button for mobile only */}
          <div className="flex items-center space-x-2">
            {/* Canvas Button - Mobile Only */}
            <button
              onClick={() => setIsMobileCanvasOpen(true)}
              className={`p-2 rounded-lg transition-all md:hidden ${
                isNeural
                  ? 'hover:bg-purple-500/20 text-cyan-400 hover:text-cyan-300'
                  : 'hover:bg-indigo-100 text-indigo-500 hover:text-indigo-600'
              }`}
              title="Open Canvas"
            >
              <CodeBracketIcon className="w-5 h-5" />
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

        {/* Left Sidebar - Sessions or Settings */}
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
            {activeLeftPanel === 'sessions' ? (
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
                onToggleCollapse={() =>
                  setIsSidebarCollapsed(!isSidebarCollapsed)
                }
                theme={theme}
              />
            ) : (
              <ChatSettingsPanel
                isOpen={true}
                onClose={() => setActiveLeftPanel('sessions')}
                settings={settings}
                onUpdateSettings={onUpdateSettings}
                onResetSettings={onResetSettings}
                agentName={agentName}
                agentId={agentId}
                theme={theme}
                isLeftPanel={true}
              />
            )}
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Children (ChatBox) */}
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>

        {/* Right Sidebar Panel - mirrors left panel */}
        <div className="hidden md:block">
          <ChatRightPanel
            isCollapsed={isRightPanelCollapsed}
            onToggleCollapse={() =>
              setIsRightPanelCollapsed(!isRightPanelCollapsed)
            }
            theme={theme}
            agentId={agentId}
            agentName={agentName}
            externalUrl={externalUrl}
            onToggleTheme={showThemeToggle ? toggleTheme : undefined}
            onToggleSettings={handleSettingsToggle}
            isSettingsActive={activeLeftPanel === 'settings'}
          />
        </div>
      </div>

      {/* Neural Theme Effects */}
      {isNeural && (
        <>
          {/* Corner glow effects */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Mobile Canvas Mode */}
      <CanvasMode
        isOpen={isMobileCanvasOpen}
        onClose={() => setIsMobileCanvasOpen(false)}
        theme={theme}
        agentId={agentId}
        agentName={agentName}
      />
    </div>
  );
}

// Inner component that uses context
function EnhancedChatLayoutInner(props: EnhancedChatLayoutProps) {
  return <EnhancedChatLayoutContent {...props} />;
}

// Main export that wraps with ThemeProvider
export default function EnhancedChatLayout(props: EnhancedChatLayoutProps) {
  return (
    <ThemeProvider agentId={props.agentId}>
      <EnhancedChatLayoutContent {...props} />
    </ThemeProvider>
  );
}
