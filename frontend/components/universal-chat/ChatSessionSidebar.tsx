'use client';

import { useState, useRef, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface ChatSession {
  id: string;
  name: string;
  lastMessage?: string;
  messageCount?: number;
  updatedAt?: Date;
}

interface ChatSessionSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  agentId: string;
  agentName: string;
  agentIcon?: string;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newName: string) => void;
  onExportSession?: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  theme?: 'default' | 'neural';
}

export default function ChatSessionSidebar({
  sessions,
  activeSessionId,
  agentId,
  agentName,
  agentIcon = '🤖',
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onExportSession,
  isCollapsed = false,
  onToggleCollapse,
  theme = 'default',
}: ChatSessionSidebarProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isNeural = theme === 'neural';

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when renaming
  useEffect(() => {
    if (renamingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renamingId]);

  const handleRenameStart = (session: ChatSession) => {
    setRenamingId(session.id);
    setRenameValue(session.name);
    setOpenMenuId(null);
  };

  const handleRenameConfirm = () => {
    if (renamingId && renameValue.trim()) {
      onRenameSession(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const handleRenameCancel = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameConfirm();
    if (e.key === 'Escape') handleRenameCancel();
  };

  // Theme styles - Enhanced with shadcn aesthetics
  const sidebarBg = isNeural
    ? 'bg-gradient-to-b from-gray-900 via-gray-900/98 to-gray-950 border-cyan-500/10'
    : 'bg-gradient-to-b from-white via-slate-50/50 to-white border-slate-200/80';

  const headerBg = isNeural
    ? 'bg-gradient-to-br from-cyan-950/40 via-gray-900/60 to-purple-950/40 border-b border-cyan-500/20 backdrop-blur-xl'
    : 'bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 border-b border-slate-200/80 backdrop-blur-xl';

  const sessionItemBg = isNeural
    ? 'bg-gray-800/30 hover:bg-gray-800/60 border-gray-700/30 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5'
    : 'bg-white/60 hover:bg-white border-slate-200/60 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5';

  const sessionItemActive = isNeural
    ? 'bg-gradient-to-r from-cyan-500/15 to-purple-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/20'
    : 'bg-gradient-to-r from-indigo-50 to-purple-50/50 border-indigo-300/60 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-200/50';

  const textPrimary = isNeural ? 'text-gray-50' : 'text-slate-900';
  const textSecondary = isNeural ? 'text-gray-400' : 'text-slate-600';
  const textMuted = isNeural ? 'text-gray-500' : 'text-slate-400';

  // Collapsed state
  if (isCollapsed) {
    return (
      <div
        className={`w-12 flex-shrink-0 flex flex-col border-r ${sidebarBg} transition-all duration-300`}
      >
        {/* Toggle button */}
        <button
          onClick={onToggleCollapse}
          className={`p-3 hover:bg-opacity-20 ${
            isNeural ? 'hover:bg-cyan-500' : 'hover:bg-gray-200'
          } transition-colors`}
          title="Expand sidebar"
        >
          <ChevronRightIcon className={`w-5 h-5 ${textSecondary}`} />
        </button>

        {/* New chat button */}
        <button
          onClick={onNewChat}
          className={`p-3 hover:bg-opacity-20 ${
            isNeural ? 'hover:bg-cyan-500' : 'hover:bg-gray-200'
          } transition-colors`}
          title="New chat"
        >
          <PlusIcon
            className={`w-5 h-5 ${
              isNeural ? 'text-cyan-400' : 'text-indigo-500'
            }`}
          />
        </button>

        {/* Session indicators */}
        <div className="flex-1 py-2 space-y-1">
          {sessions.slice(0, 8).map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full p-2 flex justify-center ${
                session.id === activeSessionId
                  ? isNeural
                    ? 'text-cyan-400'
                    : 'text-indigo-600'
                  : textMuted
              }`}
              title={session.name}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  session.id === activeSessionId
                    ? isNeural
                      ? 'bg-cyan-400'
                      : 'bg-indigo-500'
                    : isNeural
                    ? 'bg-gray-600'
                    : 'bg-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-72 flex-shrink-0 flex flex-col h-full border-r ${sidebarBg} transition-all duration-300`}
    >
      {/* Header - Fixed */}
      <div className={`${headerBg} p-4 flex-shrink-0`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{agentIcon}</span>
            <div>
              <h3 className={`font-bold ${textPrimary}`}>{agentName}</h3>
              <p className={`text-xs ${textSecondary}`}>
                {sessions.length} conversation{sessions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-lg transition-colors ${
                isNeural ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
              }`}
              title="Collapse sidebar"
            >
              <ChevronLeftIcon className={`w-4 h-4 ${textSecondary}`} />
            </button>
          )}
        </div>

        {/* New Chat Button - Enhanced */}
        <button
          onClick={onNewChat}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 group ${
            isNeural
              ? 'bg-gradient-to-r from-cyan-600 via-cyan-500 to-purple-600 hover:from-cyan-500 hover:via-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:via-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <SparklesIcon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span>New Conversation</span>
        </button>

        {/* Search Bar */}
        <div className="mt-3">
          {isSearchOpen ? (
            <div className="flex items-center space-x-2">
              <div
                className={`flex-1 flex items-center rounded-lg px-3 py-2 ${
                  isNeural
                    ? 'bg-gray-800 border border-cyan-500/50'
                    : 'bg-white border border-gray-300'
                }`}
              >
                <MagnifyingGlassIcon className={`w-4 h-4 mr-2 ${textMuted}`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className={`flex-1 bg-transparent outline-none text-sm ${textPrimary} placeholder:${textMuted}`}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`p-0.5 rounded ${
                      isNeural ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <XMarkIcon className={`w-4 h-4 ${textMuted}`} />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className={`p-2 rounded-lg ${
                  isNeural
                    ? 'hover:bg-gray-800 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg transition-colors ${
                isNeural
                  ? 'bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-cyan-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700'
              }`}
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              <span className="text-sm">Search conversations</span>
            </button>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {(() => {
          // Filter sessions based on search query
          const filteredSessions = searchQuery
            ? sessions.filter(
                (s) =>
                  s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.lastMessage
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())
              )
            : sessions;

          if (sessions.length === 0) {
            return (
              <div className={`text-center py-8 ${textMuted}`}>
                <ChatBubbleLeftIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Start a new chat to begin</p>
              </div>
            );
          }

          if (filteredSessions.length === 0) {
            return (
              <div className={`text-center py-8 ${textMuted}`}>
                <MagnifyingGlassIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No matching conversations</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            );
          }

          return filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const isRenaming = renamingId === session.id;

            return (
              <div
                key={session.id}
                className={`group rounded-xl border p-3 transition-all cursor-pointer ${
                  isActive ? sessionItemActive : sessionItemBg
                }`}
                onClick={() => !isRenaming && onSelectSession(session.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {isRenaming ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleRenameConfirm}
                        className={`w-full px-2 py-1 rounded text-sm border ${
                          isNeural
                            ? 'bg-gray-800 border-cyan-500 text-gray-100'
                            : 'bg-white border-indigo-300 text-gray-900'
                        } focus:outline-none`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <h4
                          className={`font-medium text-sm truncate ${textPrimary}`}
                        >
                          {session.name}
                        </h4>
                        {session.lastMessage && (
                          <p className={`text-xs truncate mt-0.5 ${textMuted}`}>
                            {session.lastMessage}
                          </p>
                        )}
                        <div
                          className={`flex items-center space-x-2 mt-1.5 text-xs ${textMuted}`}
                        >
                          {session.messageCount !== undefined && (
                            <span>{session.messageCount} messages</span>
                          )}
                          {session.updatedAt && (
                            <span className="flex items-center space-x-1">
                              <ClockIcon className="w-3 h-3" />
                              <span>
                                {new Date(session.updatedAt).toLocaleDateString(
                                  undefined,
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                  }
                                )}
                              </span>
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action Menu */}
                  {!isRenaming && (
                    <div
                      className="relative ml-2"
                      ref={openMenuId === session.id ? menuRef : null}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === session.id ? null : session.id
                          );
                        }}
                        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                          isNeural ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                        }`}
                      >
                        <EllipsisVerticalIcon
                          className={`w-4 h-4 ${textSecondary}`}
                        />
                      </button>

                      {openMenuId === session.id && (
                        <div
                          className={`absolute right-0 top-full mt-1 w-36 rounded-lg shadow-xl border z-50 py-1 ${
                            isNeural
                              ? 'bg-gray-800 border-gray-700'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameStart(session);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm flex items-center space-x-2 ${
                              isNeural
                                ? 'hover:bg-gray-700 text-gray-200'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <PencilIcon className="w-4 h-4" />
                            <span>Rename</span>
                          </button>
                          {onExportSession && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onExportSession(session.id);
                                setOpenMenuId(null);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm flex items-center space-x-2 ${
                                isNeural
                                  ? 'hover:bg-gray-700 text-gray-200'
                                  : 'hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                              <span>Export</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this conversation?')) {
                                onDeleteSession(session.id);
                              }
                              setOpenMenuId(null);
                            }}
                            className={`w-full px-3 py-2 text-left text-sm flex items-center space-x-2 ${
                              isNeural
                                ? 'hover:bg-red-500/20 text-red-400'
                                : 'hover:bg-red-50 text-red-600'
                            }`}
                          >
                            <TrashIcon className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          });
        })()}
      </div>

      {/* Footer */}
      <div
        className={`p-3 border-t ${
          isNeural ? 'border-gray-800' : 'border-gray-200'
        }`}
      >
        <div className={`text-xs ${textMuted} text-center`}>
          {isNeural ? (
            <span className="flex items-center justify-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Neural Link Active</span>
            </span>
          ) : (
            <span>Powered by AI</span>
          )}
        </div>
      </div>
    </div>
  );
}
