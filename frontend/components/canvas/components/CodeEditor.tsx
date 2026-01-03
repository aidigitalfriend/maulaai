'use client';

import dynamic from 'next/dynamic';
import { BRAND_COLORS } from '../constants';
import { getFileLanguage } from '../utils';

// Dynamic import for Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-400 text-sm">Loading editor...</span>
      </div>
    </div>
  ),
});

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  fileName: string | null;
  readOnly?: boolean;
}

export default function CodeEditor({
  code,
  onChange,
  fileName,
  readOnly = false,
}: CodeEditorProps) {
  const language = fileName ? getFileLanguage(fileName) : 'html';

  if (!code) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8">
          <div className={`w-16 h-16 rounded-2xl ${BRAND_COLORS.bgSecondary} flex items-center justify-center mx-auto mb-4`}>
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 className={`font-medium ${BRAND_COLORS.text} mb-2`}>No Code Generated</h3>
          <p className={`text-sm ${BRAND_COLORS.textMuted}`}>
            Select a file or generate code from the chat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Editor Header */}
      {fileName && (
        <div className={`px-4 py-2 ${BRAND_COLORS.border} border-b flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className={`text-sm ${BRAND_COLORS.text}`}>{fileName}</span>
            <span className={`text-xs ${BRAND_COLORS.textMuted} px-2 py-0.5 rounded ${BRAND_COLORS.bgSecondary}`}>
              {language}
            </span>
          </div>
          
          {!readOnly && (
            <span className={`text-xs ${BRAND_COLORS.textMuted}`}>
              Editable
            </span>
          )}
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => onChange(value || '')}
          theme="vs-dark"
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 12, bottom: 12 },
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
          }}
        />
      </div>
    </div>
  );
}
