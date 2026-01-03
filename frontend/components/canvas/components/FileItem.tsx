'use client';

import { GeneratedFile } from '../types';
import { BRAND_COLORS, FILE_ICONS } from '../constants';

interface FileItemProps {
  file: GeneratedFile;
  isSelected: boolean;
  onClick: () => void;
}

export default function FileItem({ file, isSelected, onClick }: FileItemProps) {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const icon = FILE_ICONS[ext] || FILE_ICONS.default;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
        isSelected
          ? `${BRAND_COLORS.bgGradient} text-white`
          : `${BRAND_COLORS.bgHover} ${BRAND_COLORS.textSecondary}`
      }`}
    >
      <span className="text-sm">{icon}</span>
      <span className="text-xs truncate flex-1">{file.name}</span>
      {file.content && (
        <span className={`text-[10px] ${isSelected ? 'text-white/70' : BRAND_COLORS.textMuted}`}>
          {Math.ceil(file.content.length / 40)} lines
        </span>
      )}
    </button>
  );
}
