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

  // Theme styles
  const panelBg = isNeural
    ? 'bg-gray-900/80 border-cyan-500/20'
    : 'bg-white/90 border-gray-200';

  const textPrimary = isNeural ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isNeural ? 'text-gray-400' : 'text-gray-500';

  const buttonBase = isNeural
    ? 'bg-gray-800/50 hover:bg-gray-700 border-gray-700/50 text-gray-200'
    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700';

  const buttonActive = isNeural
    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
    : 'bg-indigo-100 border-indigo-300 text-indigo-700';

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

      {/* Action Buttons */}
      <div className="px-3 pb-3 flex flex-wrap gap-2">
        {filteredActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onSelectAction(action.prompt)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all ${buttonBase} hover:scale-105`}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
