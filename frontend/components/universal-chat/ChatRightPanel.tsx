'use client';

import { useState } from 'react';
import { CodeBracketIcon } from '@heroicons/react/24/outline';
import CanvasMode from './CanvasMode';

interface ChatRightPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  theme?: 'default' | 'neural';
}

export default function ChatRightPanel({
  isCollapsed = false,
  onToggleCollapse,
  theme = 'default',
}: ChatRightPanelProps) {
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const isNeural = theme === 'neural';

  // Theme styles - Enhanced with shadcn aesthetics
  const sidebarBg = isNeural
    ? 'bg-gradient-to-b from-gray-900/98 to-gray-950 border-l border-cyan-500/10'
    : 'bg-gradient-to-b from-white to-slate-50 border-l border-slate-200/80';

  const textSecondary = isNeural ? 'text-gray-400' : 'text-slate-500';
  const textMuted = isNeural ? 'text-gray-500' : 'text-slate-400';

  const handleOpenCanvas = () => {
    setIsCanvasOpen(true);
  };

  return (
    <>
      {/* Canvas Trigger Panel - Enhanced */}
      <div
        className={`w-14 flex-shrink-0 flex flex-col ${sidebarBg} transition-all duration-300`}
      >
        {/* Canvas Icon Button */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <button
            onClick={handleOpenCanvas}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group relative overflow-hidden ${
              isNeural
                ? 'bg-gradient-to-br from-purple-600/30 via-cyan-600/20 to-purple-600/30 hover:from-purple-500/40 hover:via-cyan-500/30 hover:to-purple-500/40 ring-1 ring-purple-500/40 hover:ring-cyan-400/60 shadow-lg shadow-purple-500/20 hover:shadow-cyan-500/30 hover:scale-105 active:scale-95'
                : 'bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-100 hover:from-indigo-200 hover:via-purple-100 hover:to-indigo-200 ring-1 ring-indigo-200/80 hover:ring-indigo-300 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:scale-105 active:scale-95'
            }`}
            title="Open Canvas"
          >
            <div className={`absolute inset-0 ${isNeural ? 'bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0' : 'bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0'} translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700`} />
            <CodeBracketIcon
              className={`w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                isNeural ? 'text-cyan-400 group-hover:text-cyan-300' : 'text-indigo-600 group-hover:text-indigo-500'
              }`}
            />
          </button>
          <span className={`mt-2 text-[10px] font-medium tracking-wide uppercase ${textMuted}`}>Canvas</span>
        </div>

        {/* Bottom indicator - Enhanced */}
        <div className="p-3 flex justify-center">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              isNeural 
                ? 'bg-gradient-to-r from-purple-400 to-cyan-400 animate-pulse shadow-lg shadow-purple-500/50' 
                : 'bg-gradient-to-r from-indigo-400 to-purple-400 shadow-md shadow-indigo-500/30'
            }`}
          />
        </div>
      </div>

      {/* Full Canvas Mode Overlay */}
      <CanvasMode
        isOpen={isCanvasOpen}
        onClose={() => setIsCanvasOpen(false)}
        theme={theme}
      />
    </>
  );
}
