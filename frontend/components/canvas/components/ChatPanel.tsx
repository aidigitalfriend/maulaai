'use client';

import { useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType, FileAttachment, Template } from '../types';
import { BRAND_COLORS } from '../constants';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TemplateSelector from './TemplateSelector';

interface ChatPanelProps {
  messages: ChatMessageType[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  attachedFiles: FileAttachment[];
  onFileAttach: (files: FileAttachment[]) => void;
  onRemoveFile: (index: number) => void;
  isGenerating: boolean;
  showTemplates: boolean;
  onToggleTemplates: () => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onTemplateSelect: (template: Template) => void;
  onClear: () => void;
}

export default function ChatPanel({
  messages,
  input,
  onInputChange,
  onSend,
  attachedFiles,
  onFileAttach,
  onRemoveFile,
  isGenerating,
  showTemplates,
  onToggleTemplates,
  selectedCategory,
  onCategoryChange,
  onTemplateSelect,
  onClear,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`w-80 ${BRAND_COLORS.bgCard} ${BRAND_COLORS.border} border-r flex flex-col`}>
      {/* Header */}
      <div className={`p-3 ${BRAND_COLORS.border} border-b flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${BRAND_COLORS.bgGradient} flex items-center justify-center`}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <span className={`font-medium text-sm ${BRAND_COLORS.text}`}>Chat</span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Templates Toggle */}
          <button
            onClick={onToggleTemplates}
            className={`p-1.5 rounded-lg transition-colors ${
              showTemplates 
                ? BRAND_COLORS.btnPrimary 
                : `${BRAND_COLORS.textSecondary} ${BRAND_COLORS.bgHover}`
            }`}
            title="Templates"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </button>
          
          {/* Clear Chat */}
          <button
            onClick={onClear}
            className={`p-1.5 rounded-lg ${BRAND_COLORS.textSecondary} ${BRAND_COLORS.bgHover} transition-colors`}
            title="Clear chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Template Selector */}
      <TemplateSelector
        isOpen={showTemplates}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        onTemplateSelect={onTemplateSelect}
      />

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className={`w-12 h-12 rounded-xl ${BRAND_COLORS.bgGradient} flex items-center justify-center mb-3`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className={`font-medium ${BRAND_COLORS.text} mb-1`}>Canvas AI</h3>
            <p className={`text-xs ${BRAND_COLORS.textMuted}`}>
              Describe what you want to build and I'll generate the code for you.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        value={input}
        onChange={onInputChange}
        onSend={onSend}
        onFileAttach={onFileAttach}
        attachedFiles={attachedFiles}
        onRemoveFile={onRemoveFile}
        isGenerating={isGenerating}
      />
    </div>
  );
}
