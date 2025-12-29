'use client';

import { useState } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  BookmarkIcon,
  LightBulbIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

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
  const isNeural = theme === 'neural';

  // Theme styles - mirroring left panel
  const sidebarBg = isNeural
    ? 'bg-gray-900/95 border-cyan-500/20'
    : 'bg-white border-gray-200';

  const headerBg = isNeural
    ? 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-b border-cyan-500/20'
    : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-gray-200';

  const textPrimary = isNeural ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isNeural ? 'text-gray-400' : 'text-gray-500';
  const textMuted = isNeural ? 'text-gray-500' : 'text-gray-400';

  const itemBg = isNeural
    ? 'bg-gray-800/50 hover:bg-gray-800 border-gray-700/50'
    : 'bg-gray-50 hover:bg-gray-100 border-gray-200';

  // Collapsed state - mirrors left panel collapsed state
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

        {/* Quick action buttons in collapsed state */}
        <div className="flex-1 py-2 space-y-1">
          <button
            className={`w-full p-2 flex justify-center ${textMuted} hover:${
              isNeural ? 'text-cyan-400' : 'text-indigo-500'
            }`}
            title="Saved Items"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isNeural ? 'bg-cyan-400' : 'bg-indigo-500'
              }`}
            />
          </button>
          <button
            className={`w-full p-2 flex justify-center ${textMuted}`}
            title="Suggestions"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isNeural ? 'bg-purple-500/60' : 'bg-gray-300'
              }`}
            />
          </button>
          <button
            className={`w-full p-2 flex justify-center ${textMuted}`}
            title="Documents"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isNeural ? 'bg-purple-500/40' : 'bg-gray-200'
              }`}
            />
          </button>
          <button
            className={`w-full p-2 flex justify-center ${textMuted}`}
            title="Settings"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isNeural ? 'bg-purple-500/20' : 'bg-gray-200'
              }`}
            />
          </button>
        </div>
      </div>
    );
  }

  // Expanded state
  return (
    <div
      className={`w-72 flex-shrink-0 flex flex-col h-full border-l ${sidebarBg} transition-all duration-300`}
    >
      {/* Header - Fixed */}
      <div className={`${headerBg} p-4 flex-shrink-0`}>
        <div className="flex items-center justify-between mb-3">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-lg transition-colors ${
                isNeural ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
              }`}
              title="Collapse panel"
            >
              <ChevronRightIcon className={`w-4 h-4 ${textSecondary}`} />
            </button>
          )}
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <h3 className={`font-bold ${textPrimary}`}>Tools & Resources</h3>
              <p className={`text-xs ${textSecondary}`}>Quick access panel</p>
            </div>
            <span className="text-2xl">🛠️</span>
          </div>
        </div>

        {/* Quick Actions Button */}
        <button
          className={`w-full py-2.5 px-4 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 ${
            isNeural
              ? 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-lg shadow-purple-500/25'
              : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md'
          }`}
        >
          <SparklesIcon className="w-4 h-4" />
          <span>Quick Actions</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {/* Saved Items Section */}
        <div
          className={`rounded-xl border p-3 transition-all ${itemBg} cursor-pointer`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                isNeural ? 'bg-cyan-500/20' : 'bg-indigo-100'
              }`}
            >
              <BookmarkIcon
                className={`w-5 h-5 ${
                  isNeural ? 'text-cyan-400' : 'text-indigo-600'
                }`}
              />
            </div>
            <div className="flex-1">
              <h4 className={`font-medium text-sm ${textPrimary}`}>
                Saved Items
              </h4>
              <p className={`text-xs ${textMuted}`}>Bookmarked responses</p>
            </div>
          </div>
        </div>

        {/* Suggestions Section */}
        <div
          className={`rounded-xl border p-3 transition-all ${itemBg} cursor-pointer`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                isNeural ? 'bg-purple-500/20' : 'bg-purple-100'
              }`}
            >
              <LightBulbIcon
                className={`w-5 h-5 ${
                  isNeural ? 'text-purple-400' : 'text-purple-600'
                }`}
              />
            </div>
            <div className="flex-1">
              <h4 className={`font-medium text-sm ${textPrimary}`}>
                Suggestions
              </h4>
              <p className={`text-xs ${textMuted}`}>AI recommendations</p>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div
          className={`rounded-xl border p-3 transition-all ${itemBg} cursor-pointer`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                isNeural ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}
            >
              <DocumentTextIcon
                className={`w-5 h-5 ${
                  isNeural ? 'text-blue-400' : 'text-blue-600'
                }`}
              />
            </div>
            <div className="flex-1">
              <h4 className={`font-medium text-sm ${textPrimary}`}>Documents</h4>
              <p className={`text-xs ${textMuted}`}>Uploaded files</p>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div
          className={`rounded-xl border p-3 transition-all ${itemBg} cursor-pointer`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                isNeural ? 'bg-gray-500/20' : 'bg-gray-100'
              }`}
            >
              <Cog6ToothIcon
                className={`w-5 h-5 ${
                  isNeural ? 'text-gray-400' : 'text-gray-600'
                }`}
              />
            </div>
            <div className="flex-1">
              <h4 className={`font-medium text-sm ${textPrimary}`}>
                Preferences
              </h4>
              <p className={`text-xs ${textMuted}`}>Chat settings</p>
            </div>
          </div>
        </div>

        {/* Coming Soon placeholder */}
        <div className={`text-center py-4 ${textMuted}`}>
          <p className="text-xs">More features coming soon...</p>
        </div>
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
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span>Tools Ready</span>
            </span>
          ) : (
            <span>AI Tools Panel</span>
          )}
        </div>
      </div>
    </div>
  );
}
