'use client';

import { BRAND_COLORS, DEVICE_STYLES } from '../constants';
import ViewToggle from './ViewToggle';
import DeviceToggle from './DeviceToggle';

type ViewMode = 'preview' | 'code';
type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface ToolbarProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  activeDevice: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  onRefresh: () => void;
  onRunPreview: () => void;
  canRunPreview: boolean;
}

export default function Toolbar({
  activeView,
  onViewChange,
  activeDevice,
  onDeviceChange,
  onRefresh,
  onRunPreview,
  canRunPreview,
}: ToolbarProps) {
  return (
    <div className={`h-12 ${BRAND_COLORS.bgCard} ${BRAND_COLORS.border} border-b flex items-center justify-between px-4`}>
      {/* Left - View Toggle */}
      <ViewToggle activeView={activeView} onViewChange={onViewChange} />

      {/* Center - Actions */}
      <div className="flex items-center gap-2">
        {/* Run Preview Button */}
        <button
          onClick={onRunPreview}
          disabled={!canRunPreview}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            canRunPreview
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
              : `${BRAND_COLORS.bgSecondary} ${BRAND_COLORS.textMuted} cursor-not-allowed`
          }`}
          title="Run code and update preview"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Run Preview
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className={`p-2 rounded-lg ${BRAND_COLORS.textSecondary} ${BRAND_COLORS.bgHover} transition-colors`}
          title="Refresh preview"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Right - Device Toggle (only in preview mode) */}
      {activeView === 'preview' && (
        <DeviceToggle activeDevice={activeDevice} onDeviceChange={onDeviceChange} />
      )}
      
      {/* Placeholder for code view to maintain layout */}
      {activeView === 'code' && <div className="w-24" />}
    </div>
  );
}
