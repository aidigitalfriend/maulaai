'use client';

import { BRAND_COLORS } from '../constants';

type ViewMode = 'preview' | 'code';

interface ViewToggleProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewToggle({ activeView, onViewChange }: ViewToggleProps) {
  return (
    <div className={`flex ${BRAND_COLORS.bgSecondary} rounded-lg p-0.5`}>
      <button
        onClick={() => onViewChange('preview')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          activeView === 'preview'
            ? `${BRAND_COLORS.bgGradient} text-white`
            : `${BRAND_COLORS.textSecondary} hover:text-white`
        }`}
      >
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </span>
      </button>
      <button
        onClick={() => onViewChange('code')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          activeView === 'code'
            ? `${BRAND_COLORS.bgGradient} text-white`
            : `${BRAND_COLORS.textSecondary} hover:text-white`
        }`}
      >
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Code
        </span>
      </button>
    </div>
  );
}
