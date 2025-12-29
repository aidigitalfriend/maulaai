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
      {/* Canvas Trigger Panel */}
      <div
        className={`w-12 flex-shrink-0 flex flex-col border-l ${sidebarBg} transition-all duration-300`}
      >
        {/* Canvas Icon Button */}
        <div className="flex-1 flex flex-col items-center justify-center">
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
          <span className={`mt-2 text-[10px] ${textMuted}`}>Canvas</span>
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
      />
    </>
  );
}
