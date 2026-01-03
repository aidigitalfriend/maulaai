'use client';

import { useState } from 'react';
import {
  LightBulbIcon,
  CodeBracketIcon,
  PencilSquareIcon,
  AcademicCapIcon,
  ChatBubbleBottomCenterTextIcon,
  SparklesIcon,
  DocumentTextIcon,
  CalculatorIcon,
  GlobeAltIcon,
  BeakerIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
  category: string;
}

interface QuickActionsPanelProps {
  onSelectAction: (prompt: string) => void;
  theme?: 'default' | 'neural';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'explain',
    label: 'Explain this',
    icon: <AcademicCapIcon className="w-4 h-4" />,
    prompt: 'Please explain this in simple terms: ',
    category: 'Learning',
  },
  {
    id: 'summarize',
    label: 'Summarize',
    icon: <DocumentTextIcon className="w-4 h-4" />,
    prompt: 'Please summarize the following: ',
    category: 'Learning',
  },
  {
    id: 'brainstorm',
    label: 'Brainstorm ideas',
    icon: <LightBulbIcon className="w-4 h-4" />,
    prompt: 'Help me brainstorm ideas for: ',
    category: 'Creative',
  },
  {
    id: 'write',
    label: 'Help me write',
    icon: <PencilSquareIcon className="w-4 h-4" />,
    prompt: 'Help me write: ',
    category: 'Creative',
  },
  {
    id: 'code',
    label: 'Write code',
    icon: <CodeBracketIcon className="w-4 h-4" />,
    prompt: 'Write code for: ',
    category: 'Technical',
  },
  {
    id: 'debug',
    label: 'Debug code',
    icon: <BeakerIcon className="w-4 h-4" />,
    prompt: 'Help me debug this code: ',
    category: 'Technical',
  },
  {
    id: 'translate',
    label: 'Translate',
    icon: <GlobeAltIcon className="w-4 h-4" />,
    prompt: 'Translate the following: ',
    category: 'Utility',
  },
  {
    id: 'calculate',
    label: 'Calculate',
    icon: <CalculatorIcon className="w-4 h-4" />,
    prompt: 'Calculate: ',
    category: 'Utility',
  },
  {
    id: 'chat',
    label: 'Just chat',
    icon: <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />,
    prompt: '',
    category: 'General',
  },
  {
    id: 'creative',
    label: 'Get creative',
    icon: <SparklesIcon className="w-4 h-4" />,
    prompt: 'Create something creative about: ',
    category: 'Creative',
  },
];

export default function QuickActionsPanel({
  onSelectAction,
  theme = 'default',
  isCollapsed = false,
  onToggleCollapse,
}: QuickActionsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const isNeural = theme === 'neural';

  // Theme styles - Enhanced with shadcn aesthetics
  const panelBg = isNeural
    ? 'bg-gradient-to-t from-gray-900/95 via-gray-900/90 to-gray-900/80 border-cyan-500/10 backdrop-blur-xl'
    : 'bg-gradient-to-t from-white/98 via-white/95 to-white/90 border-slate-200/60 backdrop-blur-xl';

  const textPrimary = isNeural ? 'text-gray-50' : 'text-slate-900';
  const textSecondary = isNeural ? 'text-gray-400' : 'text-slate-500';

  const buttonBase = isNeural
    ? 'bg-gray-800/40 hover:bg-gray-700/60 border-gray-700/40 text-gray-200 hover:text-cyan-300 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10'
    : 'bg-white/80 hover:bg-white border-slate-200/80 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10';

  const buttonActive = isNeural
    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/15 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/20'
    : 'bg-gradient-to-r from-indigo-100 to-purple-100/80 border-indigo-300 text-indigo-700 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-200/50';

  const categories = [...new Set(QUICK_ACTIONS.map((a) => a.category))];
  const filteredActions = selectedCategory
    ? QUICK_ACTIONS.filter((a) => a.category === selectedCategory)
    : QUICK_ACTIONS;

  if (isCollapsed) {
    return (
      <div
        className={`border-t ${panelBg} px-3 py-2 backdrop-blur-sm cursor-pointer`}
        onClick={onToggleCollapse}
      >
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${textSecondary}`}>
            Quick Actions
          </span>
          <ChevronUpIcon className={`w-4 h-4 ${textSecondary}`} />
        </div>
      </div>
    );
  }

  return (
    <div className={`border-t ${panelBg} backdrop-blur-sm`}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer"
        onClick={onToggleCollapse}
      >
        <span className={`text-xs font-medium ${textSecondary}`}>
          Quick Actions
        </span>
        <ChevronDownIcon className={`w-4 h-4 ${textSecondary}`} />
      </div>

      {/* Category Filters */}
      <div className="px-3 pb-2 flex flex-wrap gap-1">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-2 py-0.5 text-xs rounded-full border transition-all ${
            selectedCategory === null ? buttonActive : buttonBase
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              setSelectedCategory(selectedCategory === cat ? null : cat)
            }
            className={`px-2 py-0.5 text-xs rounded-full border transition-all ${
              selectedCategory === cat ? buttonActive : buttonBase
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Action Buttons - Enhanced */}
      <div className="px-3 pb-3 flex flex-wrap gap-2">
        {filteredActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onSelectAction(action.prompt)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border transition-all duration-200 ${buttonBase} hover:scale-[1.03] active:scale-[0.98] group`}
          >
            <span className="group-hover:scale-110 transition-transform">
              {action.icon}
            </span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
