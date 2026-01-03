'use client';

import { GeneratedFile } from '../types';
import { BRAND_COLORS } from '../constants';
import FileItem from './FileItem';

interface FileTreeProps {
  files: GeneratedFile[];
  selectedFile: string | null;
  onFileSelect: (fileName: string) => void;
  onNewFile: () => void;
  onDownload: () => void;
}

export default function FileTree({
  files,
  selectedFile,
  onFileSelect,
  onNewFile,
  onDownload,
}: FileTreeProps) {
  return (
    <div className={`w-56 ${BRAND_COLORS.bgCard} ${BRAND_COLORS.border} border-r flex flex-col`}>
      {/* Header */}
      <div className={`p-3 ${BRAND_COLORS.border} border-b flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <svg className={`w-4 h-4 ${BRAND_COLORS.textSecondary}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className={`font-medium text-sm ${BRAND_COLORS.text}`}>Files</span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* New File */}
          <button
            onClick={onNewFile}
            className={`p-1 rounded ${BRAND_COLORS.textSecondary} ${BRAND_COLORS.bgHover} transition-colors`}
            title="New file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          {/* Download All */}
          {files.length > 0 && (
            <button
              onClick={onDownload}
              className={`p-1 rounded ${BRAND_COLORS.textSecondary} ${BRAND_COLORS.bgHover} transition-colors`}
              title="Download all files"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {files.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <svg className={`w-8 h-8 ${BRAND_COLORS.textMuted} mb-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className={`text-xs ${BRAND_COLORS.textMuted}`}>
              No files yet
            </p>
          </div>
        ) : (
          files.map((file) => (
            <FileItem
              key={file.name}
              file={file}
              isSelected={selectedFile === file.name}
              onClick={() => onFileSelect(file.name)}
            />
          ))
        )}
      </div>

      {/* Footer Stats */}
      {files.length > 0 && (
        <div className={`p-2 ${BRAND_COLORS.border} border-t`}>
          <p className={`text-[10px] ${BRAND_COLORS.textMuted} text-center`}>
            {files.length} file{files.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
