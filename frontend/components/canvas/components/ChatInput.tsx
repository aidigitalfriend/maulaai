'use client';

import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { FileAttachment } from '../types';
import { BRAND_COLORS } from '../constants';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileAttach: (files: FileAttachment[]) => void;
  attachedFiles: FileAttachment[];
  onRemoveFile: (index: number) => void;
  isGenerating: boolean;
  placeholder?: string;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onFileAttach,
  attachedFiles,
  onRemoveFile,
  isGenerating,
  placeholder = "Describe what you want to build...",
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && value.trim()) {
        onSend();
      }
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: FileAttachment[] = [];
    
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = () => {
            newAttachments.push({
              type: 'image',
              content: reader.result as string,
              name: file.name,
            });
            resolve();
          };
          reader.readAsDataURL(file);
        });
      } else {
        const text = await file.text();
        newAttachments.push({
          type: 'file',
          content: text,
          name: file.name,
        });
      }
    }

    onFileAttach(newAttachments);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className={`p-3 ${BRAND_COLORS.border} border-t`}>
      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachedFiles.map((file, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${BRAND_COLORS.bgSecondary} ${BRAND_COLORS.textSecondary}`}
            >
              {file.type === 'image' ? (
                <img
                  src={file.content}
                  alt={file.name}
                  className="w-6 h-6 rounded object-cover"
                />
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              <span className="max-w-20 truncate">{file.name}</span>
              <button
                onClick={() => onRemoveFile(idx)}
                className={`${BRAND_COLORS.textMuted} hover:text-white transition-colors ml-1`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className={`flex items-end gap-2 ${BRAND_COLORS.bgSecondary} rounded-xl p-2`}>
        {/* File Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`p-2 rounded-lg ${BRAND_COLORS.textSecondary} ${BRAND_COLORS.bgHover} transition-colors`}
          title="Attach files"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.txt,.json,.js,.jsx,.ts,.tsx,.css,.html,.md"
        />

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isGenerating}
          rows={1}
          className={`flex-1 bg-transparent ${BRAND_COLORS.text} text-sm resize-none focus:outline-none placeholder:${BRAND_COLORS.textMuted} min-h-[36px] max-h-[120px]`}
          style={{ height: 'auto' }}
        />

        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={isGenerating || !value.trim()}
          className={`p-2 rounded-lg transition-all ${
            isGenerating || !value.trim()
              ? `${BRAND_COLORS.bgHover} ${BRAND_COLORS.textMuted} cursor-not-allowed`
              : `${BRAND_COLORS.btnPrimary} hover:opacity-90`
          }`}
          title="Send message"
        >
          {isGenerating ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
