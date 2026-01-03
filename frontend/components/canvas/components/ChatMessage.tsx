'use client';

import { ChatMessage as ChatMessageType } from '../types';
import { BRAND_COLORS } from '../constants';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 ${
        isUser
          ? BRAND_COLORS.btnPrimary
          : `${BRAND_COLORS.bgSecondary} ${BRAND_COLORS.text} border ${BRAND_COLORS.border}`
      }`}>
        {message.isStreaming ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className={`text-xs ${BRAND_COLORS.textSecondary}`}>Creating...</span>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.attachments.map(file => (
              <span key={file.id} className="text-xs bg-white/20 px-2 py-0.5 rounded">
                📎 {file.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
