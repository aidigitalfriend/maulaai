'use client';

import { useState } from 'react';
import {
  CodeBracketIcon,
  ArrowTopRightOnSquareIcon,
  SunIcon,
  SparklesIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import CanvasMode from './canvas-build/CanvasMode';

interface ChatRightPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  theme?: 'default' | 'neural';
  agentId?: string;
  agentName?: string;
  externalUrl?: string;
  onToggleTheme?: () => void;
  onToggleSettings?: () => void;
  isSettingsActive?: boolean;
}

export default function ChatRightPanel({
  isCollapsed = false,
  onToggleCollapse,
  theme = 'default',
  agentId,
  agentName,
  externalUrl,
  onToggleTheme,
  onToggleSettings,
  isSettingsActive = false,
}: ChatRightPanelProps) {
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const isNeural = theme === 'neural';

  // Theme styles
  const sidebarBg = isNeural
    ? 'bg-gray-900/95 border-cyan-500/20'
    : 'bg-white border-gray-200';

  const textSecondary = isNeural ? 'text-gray-400' : 'text-gray-500';
  const textMuted = isNeural ? 'text-gray-500' : 'text-gray-400';

  const handleOpenCanvas = () => {
    setIsCanvasOpen(true);
  };

  return (
    <>
      {/* Right Sidebar Panel */}
      <div
        className={`w-14 flex-shrink-0 flex flex-col border-l ${sidebarBg} transition-all duration-300`}
      >
        {/* Icon buttons container */}
        <div className="flex-1 flex flex-col items-center pt-4 space-y-4">
          {/* Canvas Icon Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleOpenCanvas}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group ${
                isNeural
                  ? 'bg-gradient-to-br from-purple-600/20 to-cyan-600/20 hover:from-purple-600/40 hover:to-cyan-600/40 ring-1 ring-purple-500/30 hover:ring-purple-500/50'
                  : 'bg-indigo-100 hover:bg-indigo-200 ring-1 ring-indigo-200 hover:ring-indigo-300'
              }`}
              title="Open Canvas"
            >
              <CodeBracketIcon
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  isNeural ? 'text-cyan-400' : 'text-indigo-600'
                }`}
              />
            </button>
            <span className={`mt-1 text-[9px] ${textMuted}`}>Canvas</span>
          </div>

          {/* Divider */}
          <div className={`w-8 h-px ${isNeural ? 'bg-gray-700' : 'bg-gray-200'}`} />

          {/* External Link */}
          {externalUrl && (
            <div className="flex flex-col items-center">
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group ${
                  isNeural
                    ? 'hover:bg-gray-800 ring-1 ring-gray-700 hover:ring-cyan-500/30'
                    : 'hover:bg-gray-100 ring-1 ring-gray-200 hover:ring-gray-300'
                }`}
                title="Open in new tab"
              >
                <ArrowTopRightOnSquareIcon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isNeural ? 'text-gray-400 group-hover:text-cyan-400' : 'text-gray-500 group-hover:text-indigo-600'
                  }`}
                />
              </a>
              <span className={`mt-1 text-[9px] ${textMuted}`}>External</span>
            </div>
          )}

          {/* Theme Toggle */}
          {onToggleTheme && (
            <div className="flex flex-col items-center">
              <button
                onClick={onToggleTheme}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group ${
                  isNeural
                    ? 'hover:bg-cyan-500/20 ring-1 ring-gray-700 hover:ring-cyan-500/30'
                    : 'hover:bg-gray-100 ring-1 ring-gray-200 hover:ring-gray-300'
                }`}
                title={isNeural ? 'Switch to Light Mode' : 'Switch to Neural Mode'}
              >
                {isNeural ? (
                  <SunIcon className={`w-5 h-5 transition-transform group-hover:scale-110 text-cyan-400`} />
                ) : (
                  <SparklesIcon className={`w-5 h-5 transition-transform group-hover:scale-110 text-gray-500 group-hover:text-indigo-600`} />
                )}
              </button>
              <span className={`mt-1 text-[9px] ${textMuted}`}>Theme</span>
            </div>
          )}

          {/* Settings */}
          {onToggleSettings && (
            <div className="flex flex-col items-center">
              <button
                onClick={onToggleSettings}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group ${
                  isSettingsActive
                    ? isNeural
                      ? 'bg-purple-500/20 ring-1 ring-purple-500/50'
                      : 'bg-indigo-100 ring-1 ring-indigo-300'
                    : isNeural
                      ? 'hover:bg-purple-500/20 ring-1 ring-gray-700 hover:ring-purple-500/30'
                      : 'hover:bg-gray-100 ring-1 ring-gray-200 hover:ring-gray-300'
                }`}
                title="Agent Settings"
              >
                <Cog6ToothIcon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isSettingsActive
                      ? isNeural ? 'text-purple-400' : 'text-indigo-600'
                      : isNeural ? 'text-gray-400 group-hover:text-purple-400' : 'text-gray-500 group-hover:text-indigo-600'
                  }`}
                />
              </button>
              <span className={`mt-1 text-[9px] ${textMuted}`}>Settings</span>
            </div>
          )}
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

      {/* Full Canvas Mode Overlay */}
      <CanvasMode
        isOpen={isCanvasOpen}
        onClose={() => setIsCanvasOpen(false)}
        theme={theme}
        agentId={agentId}
        agentName={agentName}
      />
    </>
  );
}
