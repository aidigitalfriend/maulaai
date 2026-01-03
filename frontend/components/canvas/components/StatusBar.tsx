'use client';

import { BRAND_COLORS } from '../constants';

interface StatusBarProps {
  isGenerating: boolean;
  filesCount: number;
  currentFile: string | null;
  generationStatus?: string;
}

export default function StatusBar({
  isGenerating,
  filesCount,
  currentFile,
  generationStatus,
}: StatusBarProps) {
  return (
    <div className={`h-6 ${BRAND_COLORS.bgCard} ${BRAND_COLORS.border} border-t flex items-center justify-between px-3`}>
      {/* Left side - Status */}
      <div className="flex items-center gap-2">
        {isGenerating ? (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className={`text-[10px] ${BRAND_COLORS.textMuted}`}>
              {generationStatus || 'Generating...'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className={`text-[10px] ${BRAND_COLORS.textMuted}`}>
              Ready
            </span>
          </div>
        )}
      </div>

      {/* Center - Current File */}
      {currentFile && (
        <div className={`text-[10px] ${BRAND_COLORS.textMuted} truncate max-w-[200px]`}>
          {currentFile}
        </div>
      )}

      {/* Right side - Stats */}
      <div className="flex items-center gap-3">
        <span className={`text-[10px] ${BRAND_COLORS.textMuted}`}>
          {filesCount} file{filesCount !== 1 ? 's' : ''}
        </span>
        <span className={`text-[10px] ${BRAND_COLORS.textMuted}`}>
          Canvas AI
        </span>
      </div>
    </div>
  );
}
