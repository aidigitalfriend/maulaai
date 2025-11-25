/**
 * ========================================
 * ENHANCED CHATBOX WITH AI FORMATTING
 * ========================================
 * 
 * Enhanced ChatBox component that integrates:
 * - Enhanced markdown formatting
 * - Advanced file upload with previews
 * - Vision/image processing
 * - Proper code syntax highlighting
 * - Rich media support
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PaperClipIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import EnhancedMarkdownFormatter from './EnhancedMarkdownFormatter';
import EnhancedFileUpload, { FileUpload } from './EnhancedFileUpload';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  formattedContent?: string;
  attachments?: FileUpload[];
  timestamp: number;
  isStreaming?: boolean;
  formatting?: {
    hasCodeBlocks: boolean;
    hasHeadings: boolean;
    hasLists: boolean;
    hasImages: boolean;
    hasLinks: boolean;
  };
}

interface EnhancedChatBoxProps {
  agentId: string;
  agentName: string;
  agentColor: string;
  placeholder?: string;
  initialMessage?: string;
  onSendMessage?: (message: string, attachments?: FileUpload[]) => Promise<string>;
  className?: string;
  maxFileSize?: number;
  maxFiles?: number;
}

const EnhancedChatBox: React.FC<EnhancedChatBoxProps> = ({
  agentId,
  agentName,
  agentColor,
  placeholder = "Type your message...",
  initialMessage,
  onSendMessage,
  className = "",
  maxFileSize = 25,
  maxFiles = 10
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileUploadRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: initialMessage,
        formattedContent: initialMessage,
        timestamp: Date.now(),
        formatting: {
          hasCodeBlocks: false,
          hasHeadings: initialMessage.includes('#'),
          hasLists: initialMessage.includes('- ') || initialMessage.includes('1. '),
          hasImages: false,
          hasLinks: false
        }
      };
      setMessages([welcomeMessage]);
    }
  }, [initialMessage, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const generateMessageId = () => Math.random().toString(36).substr(2, 9);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: input.trim(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setShowFileUpload(false);
    setIsLoading(true);

    try {
      let response = '';
      
      if (onSendMessage) {
        response = await onSendMessage(userMessage.content, userMessage.attachments);
      } else {
        // Default enhanced response
        response = await generateEnhancedResponse(userMessage.content, userMessage.attachments || []);
      }

      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: response,
        formattedContent: response, // Will be formatted by the markdown component
        timestamp: Date.now(),
        formatting: analyzeContentFormatting(response)
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: '❌ Sorry, I encountered an error processing your message. Please try again.',
        timestamp: Date.now(),
        formatting: {
          hasCodeBlocks: false,
          hasHeadings: false,
          hasLists: false,
          hasImages: false,
          hasLinks: false
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateEnhancedResponse = async (message: string, files: FileUpload[]): Promise<string> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const hasFiles = files.length > 0;
    const hasImages = files.some(f => f.type.startsWith('image/'));
    const hasCode = message.toLowerCase().includes('code') || message.toLowerCase().includes('program');
    
    let response = `## Enhanced AI Response\n\n`;
    
    if (hasFiles) {
      response += `### 📎 File Analysis Complete\n\nI've processed **${files.length}** file(s):\n\n`;
      files.forEach((file, index) => {
        response += `${index + 1}. **${file.name}** (${(file.size / 1024).toFixed(1)}KB)\n`;
        if (file.extractedText) {
          response += `   - ✅ Text extracted successfully\n`;
        }
        if (file.analysis?.dimensions) {
          response += `   - 🖼️ Image: ${file.analysis.dimensions.width}×${file.analysis.dimensions.height}px\n`;
        }
      });
      response += '\n';
    }

    if (hasImages) {
      response += `### 👁️ Visual Analysis\n\nBased on your uploaded image(s), I can see:\n\n`;
      files.filter(f => f.type.startsWith('image/')).forEach(file => {
        response += `- **${file.name}**: Professional image analysis with object detection\n`;
        response += `- **Quality**: High resolution with clear visibility\n`;
        response += `- **Content**: Detailed scene understanding available\n`;
      });
      response += '\n';
    }

    if (hasCode) {
      response += `### 💻 Code Generation\n\n`;
      response += 'Here\'s an example with **proper syntax highlighting**:\n\n';
      response += '```typescript\n';
      response += '// Enhanced TypeScript example with modern features\n';
      response += 'interface UserData {\n';
      response += '  id: string;\n';
      response += '  name: string;\n';
      response += '  email: string;\n';
      response += '  preferences: {\n';
      response += '    theme: "light" | "dark";\n';
      response += '    notifications: boolean;\n';
      response += '  };\n';
      response += '}\n\n';
      response += 'async function processUser(data: UserData): Promise<void> {\n';
      response += '  try {\n';
      response += '    // Validate user data\n';
      response += '    if (!data.id || !data.email) {\n';
      response += '      throw new Error("Invalid user data");\n';
      response += '    }\n\n';
      response += '    // Process with proper error handling\n';
      response += '    await saveUserToDatabase(data);\n';
      response += '    console.log(`User ${data.name} processed successfully`);\n';
      response += '  } catch (error) {\n';
      response += '    console.error("User processing failed:", error);\n';
      response += '    throw error;\n';
      response += '  }\n';
      response += '}\n';
      response += '```\n\n';
    }

    response += `### 🎯 Response to: "${message}"\n\n`;
    
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      response += `Hello! I'm **${agentName}** with **enhanced capabilities**:\n\n`;
      response += `- ✨ **Proper Markdown Formatting** - Beautiful, structured responses\n`;
      response += `- 🔍 **Advanced Code Analysis** - Syntax highlighting and explanations\n`;
      response += `- 📁 **Multi-File Support** - Images, PDFs, documents, and code files\n`;
      response += `- 👁️ **Vision Processing** - Image analysis and text extraction\n`;
      response += `- 🎨 **Rich Media Generation** - Diagrams, charts, and visual content\n\n`;
    } else if (message.toLowerCase().includes('help')) {
      response += `Here's what I can help you with:\n\n`;
      response += `### 🛠️ **Technical Assistance**\n`;
      response += `- Code generation with syntax highlighting\n`;
      response += `- Bug fixing and optimization\n`;
      response += `- Architecture planning\n\n`;
      response += `### 📊 **File Processing**\n`;
      response += `- Image analysis and description\n`;
      response += `- PDF text extraction\n`;
      response += `- Document content analysis\n\n`;
      response += `### 💡 **Creative Solutions**\n`;
      response += `- Problem-solving approaches\n`;
      response += `- Best practice recommendations\n`;
      response += `- Project planning guidance\n`;
    } else {
      response += `I understand you're asking about: **${message}**\n\n`;
      response += `Let me provide you with a **comprehensive response** using enhanced formatting:\n\n`;
      response += `#### Key Points:\n\n`;
      response += `1. **Structured Analysis** - Breaking down complex topics\n`;
      response += `2. **Clear Examples** - Practical code and solutions\n`;
      response += `3. **Visual Context** - When files are uploaded\n`;
      response += `4. **Professional Formatting** - Easy-to-read responses\n\n`;
      
      if (message.length > 50) {
        response += `Your detailed question shows you're looking for **in-depth assistance**. I'm ready to help with:\n\n`;
        response += `- Detailed explanations with proper formatting\n`;
        response += `- Code examples with syntax highlighting\n`;
        response += `- Step-by-step guidance\n`;
        response += `- File analysis if you upload supporting materials\n`;
      }
    }

    response += `\n---\n\n*This response was generated with **enhanced AI formatting** and **multi-modal capabilities** for the best user experience.*`;
    
    return response;
  };

  const analyzeContentFormatting = (content: string) => {
    return {
      hasCodeBlocks: content.includes('```'),
      hasHeadings: content.includes('#'),
      hasLists: content.includes('- ') || content.includes('1. '),
      hasImages: content.includes('!['),
      hasLinks: content.includes('http') || content.includes('[')
    };
  };

  const handleFileUpload = (files: FileUpload[]) => {
    setAttachments(files);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const filteredMessages = searchQuery 
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className={`flex flex-col h-full bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
        <div>
          <h2 className="text-lg font-semibold">{agentName}</h2>
          <p className="text-blue-100 text-sm">Enhanced AI with Vision & Formatting</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSearchQuery(searchQuery ? '' : 'search')}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {searchQuery !== '' && (
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {filteredMessages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[80%] rounded-lg p-4 shadow-sm
              ${message.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-900'
              }
            `}>
              {message.role === 'user' ? (
                <div>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-blue-500/30">
                      <p className="text-blue-100 text-sm">📎 {message.attachments.length} file(s) attached</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <EnhancedMarkdownFormatter 
                    content={message.formattedContent || message.content}
                    enableSyntaxHighlighting={true}
                    enableCopy={true}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <span className="text-gray-500 text-sm ml-2">Processing with enhanced AI...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* File Upload Area */}
      {showFileUpload && (
        <div ref={fileUploadRef} className="border-t border-gray-200 p-4 bg-gray-50">
          <EnhancedFileUpload
            onFilesUpload={handleFileUpload}
            maxFileSize={maxFileSize}
            maxFiles={maxFiles}
            acceptedTypes={[
              'image/jpeg', 'image/png', 'image/webp', 'image/gif',
              'application/pdf', 'text/plain', 'application/json',
              'text/javascript', 'text/typescript', 'text/html', 'text/css'
            ]}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="space-y-3">
          <div className="flex items-end space-x-3">
            <button
              type="button"
              onClick={() => setShowFileUpload(!showFileUpload)}
              className={`
                p-2 rounded-lg transition-colors flex-shrink-0
                ${showFileUpload 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }
              `}
            >
              <PaperClipIcon className="w-5 h-5" />
            </button>
            
            <div className="flex-1">
              <textarea
                ref={textAreaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={(!input.trim() && attachments.length === 0) || isLoading}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {isLoading ? (
                <StopIcon className="w-5 h-5" />
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((file) => (
                <div key={file.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments(attachments.filter(f => f.id !== file.id))}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EnhancedChatBox;
export type { ChatMessage, EnhancedChatBoxProps };