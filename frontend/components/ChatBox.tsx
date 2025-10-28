'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  PaperAirplaneIcon, 
  HandThumbUpIcon, 
  HandThumbDownIcon, 
  TrashIcon,
  PaperClipIcon,
  DocumentIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  Cog6ToothIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  EllipsisHorizontalIcon,
  StopIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline'
import { HandThumbUpIcon as HandThumbUpSolid, HandThumbDownIcon as HandThumbDownSolid } from '@heroicons/react/24/solid'
import { 
  ChatMessage,
  FileAttachment,
  loadChatHistory, 
  saveChatHistory, 
  addMessageToHistory, 
  updateMessageInHistory,
  clearChatHistory 
} from '../utils/chatStorage'
import PDFPreviewModal from './PDFPreviewModal'
import LanguageIndicator from './LanguageIndicator'
import { 
  DetectedLanguage, 
  detectLanguageWithOpenAI, 
  generateMultilingualPrompt,
  getLanguageInfo 
} from '../utils/languageDetection'
import { getAppConfig, getVoiceConfig, validateConfig } from '../utils/config'

// Enhanced typing indicator with multiple states
const TypingIndicator = ({ agentColor, stage = 'thinking' }: { agentColor: string, stage?: 'thinking' | 'typing' | 'processing' }) => {
  const getIndicatorContent = () => {
    switch (stage) {
      case 'processing':
        return (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent"></div>
            <span className="text-xs opacity-75">Processing...</span>
          </div>
        )
      case 'typing':
        return (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div 
                className={`w-1.5 h-1.5 rounded-full animate-bounce ${agentColor.replace('from-', 'bg-').replace('to-', '').split(' ')[0].replace('-100', '-500')}`}
                style={{ animationDelay: '0ms', animationDuration: '1.0s' }}
              ></div>
              <div 
                className={`w-1.5 h-1.5 rounded-full animate-bounce ${agentColor.replace('from-', 'bg-').replace('to-', '').split(' ')[0].replace('-100', '-500')}`}
                style={{ animationDelay: '150ms', animationDuration: '1.0s' }}
              ></div>
              <div 
                className={`w-1.5 h-1.5 rounded-full animate-bounce ${agentColor.replace('from-', 'bg-').replace('to-', '').split(' ')[0].replace('-100', '-500')}`}
                style={{ animationDelay: '300ms', animationDuration: '1.0s' }}
              ></div>
            </div>
            <span className="text-xs opacity-75">Typing...</span>
          </div>
        )
      default: // thinking
        return (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div 
                className={`w-2 h-2 rounded-full animate-pulse ${agentColor.replace('from-', 'bg-').replace('to-', '').split(' ')[0].replace('-100', '-400')}`}
                style={{ animationDelay: '0ms', animationDuration: '2.0s' }}
              ></div>
              <div 
                className={`w-2 h-2 rounded-full animate-pulse ${agentColor.replace('from-', 'bg-').replace('to-', '').split(' ')[0].replace('-100', '-400')}`}
                style={{ animationDelay: '400ms', animationDuration: '2.0s' }}
              ></div>
              <div 
                className={`w-2 h-2 rounded-full animate-pulse ${agentColor.replace('from-', 'bg-').replace('to-', '').split(' ')[0].replace('-100', '-400')}`}
                style={{ animationDelay: '800ms', animationDuration: '2.0s' }}
              ></div>
            </div>
            <span className="text-xs opacity-75">Thinking...</span>
          </div>
        )
    }
  }

  return <div className="flex items-center">{getIndicatorContent()}</div>
}

// Typewriter effect component for streaming messages
const TypewriterText = ({ 
  text, 
  speed = 30, 
  onComplete, 
  isActive = true 
}: { 
  text: string
  speed?: number
  onComplete?: () => void
  isActive?: boolean 
}) => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setDisplayText(text)
      return
    }

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timer)
    } else if (currentIndex === text.length && onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, isActive, onComplete])

  // Reset when text changes
  useEffect(() => {
    if (isActive) {
      setDisplayText('')
      setCurrentIndex(0)
    }
  }, [text, isActive])

  return (
    <span>
      {displayText}
      {isActive && currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  )
}

// Text highlighting utility for search results
const HighlightedText = ({ text, searchQuery }: { text: string, searchQuery: string }) => {
  if (!searchQuery.trim()) return <span>{text}</span>
  
  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  
  return (
    <span>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-300 text-black rounded px-1">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  )
}

interface ChatBoxProps {
  agentId: string;
  sessionId: string;
  agentName: string;
  agentColor: string;
  placeholder?: string;
  initialMessages?: ChatMessage[];
  onSendMessage?: (message: string, attachments?: FileAttachment[], detectedLanguage?: DetectedLanguage) => Promise<string>;
  className?: string;
  allowFileUpload?: boolean;
  maxFileSize?: number; // in MB
  enableLanguageDetection?: boolean;
}

export default function ChatBox({
  agentId,
  sessionId,
  agentName,
  agentColor,
  placeholder = "Type your message...",
  initialMessages,
  onSendMessage,
  className = "",
  allowFileUpload = true,
  maxFileSize = 10,
  enableLanguageDetection = true
}: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingStage, setTypingStage] = useState<'thinking' | 'processing' | 'typing'>('thinking');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{messageId: string, messageIndex: number}[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  const [pdfPreview, setPdfPreview] = useState<{ url: string, name: string } | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<DetectedLanguage | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const results: { messageId: string; messageIndex: number }[] = [];
    messages.forEach((message, index) => {
      if (message.content.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          messageId: message.id,
          messageIndex: index,
        });
      }
    });

    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);

    if (results.length > 0) {
      const messageElement = document.getElementById(`message-${results[0].messageId}`);
      messageElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    const history = loadChatHistory(agentId, sessionId);
    if (history.length > 0) {
      setMessages(history);
    } else if (initialMessages) {
      setMessages(initialMessages);
      saveChatHistory(agentId, sessionId, initialMessages);
    }
  }, [agentId, sessionId, initialMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(agentId, sessionId, messages);
    }
  }, [messages, agentId, sessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isLoading]);

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId) {
        const newFeedback = msg.feedback === feedback ? null : feedback;
        updateMessageInHistory(agentId, sessionId, messageId, { feedback: newFeedback });
        return { ...msg, feedback: newFeedback };
      }
      return msg;
    });
    setMessages(updatedMessages);
  };

  const handleClearChat = () => {
    clearChatHistory(agentId, sessionId);
    setMessages(initialMessages || []);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
      attachments: attachments
    };

    setMessages(prev => [...prev, userMessage]);
    addMessageToHistory(agentId, sessionId, userMessage);
    setInput('');
    setAttachments([]);
    setIsLoading(true);
    setTypingStage('thinking');

    try {
      if (onSendMessage) {
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
        setTypingStage('typing');

        const responseText = await onSendMessage(userMessage.content, userMessage.attachments, detectedLanguage || undefined);
        
        const assistantMessage: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
          isStreaming: false,
          streamingComplete: true,
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        addMessageToHistory(agentId, sessionId, assistantMessage);
        
      } else {
        const assistantMessage: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: "I'm just a demo! I don't have a brain yet.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        addMessageToHistory(agentId, sessionId, assistantMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      addMessageToHistory(agentId, sessionId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !allowFileUpload) return;

    Array.from(files).forEach(file => {
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is ${maxFileSize}MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newAttachment: FileAttachment = {
          name: file.name,
          size: file.size,
          type: file.type,
          data: e.target?.result as string
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (allowFileUpload) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (allowFileUpload) handleFileSelect(e.dataTransfer.files);
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleStopStreaming = () => {
    setIsStreaming(false);
    const lastMsgIndex = messages.length - 1;
    if (lastMsgIndex >= 0 && messages[lastMsgIndex].isStreaming) {
      const updatedMessages = [...messages];
      updatedMessages[lastMsgIndex] = {
        ...updatedMessages[lastMsgIndex],
        isStreaming: false,
        streamingComplete: true,
      };
      setMessages(updatedMessages);
      updateMessageInHistory(agentId, sessionId, updatedMessages[lastMsgIndex].id, { isStreaming: false, streamingComplete: true });
    }
  };

  const handleSpeakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported in this browser');
    }
  };

  const handleStartRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // Start recording
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsRecording(true);
      console.log('Voice recognition started');
    };
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update input with final transcript, show interim in real-time
      if (finalTranscript) {
        setInput(prev => prev + finalTranscript);
      }
      if (interimTranscript && !finalTranscript) {
        // Show interim results in the input
        setInput(prev => {
          const lastFinalIndex = prev.lastIndexOf(' ');
          return prev.substring(0, lastFinalIndex + 1) + interimTranscript;
        });
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access in your browser settings.');
      }
    };
    
    recognition.onend = () => {
      setIsRecording(false);
      console.log('Voice recognition ended');
    };
    
    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsRecording(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-2xl shadow-lg border border-gray-200/80 ${className}`}>
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">{agentName}</h2>
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsSearchVisible(p => !p)} className="p-2 rounded-full hover:bg-gray-100">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
          </button>
          <button onClick={handleClearChat} className="p-2 rounded-full hover:bg-gray-100">
            <TrashIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {isSearchVisible && (
        <div className="p-2 border-b border-gray-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search in conversation..."
            className="flex-grow px-3 py-1.5 text-sm bg-gray-50 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && performSearch(searchQuery)}
          />
          <button onClick={() => performSearch(searchQuery)} className="p-2 rounded-full hover:bg-gray-100">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        {isDragOver && (
          <div className="absolute inset-0 bg-indigo-500 bg-opacity-20 z-10 flex items-center justify-center rounded-2xl">
            <p className="text-lg font-bold text-indigo-800">Drop files to attach</p>
          </div>
        )}
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={msg.id} id={`message-${msg.id}`} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${agentColor} flex-shrink-0`}></div>
              )}
              <div className={`max-w-xl ${msg.role === 'user' ? 'order-1' : ''}`}>
                <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                  {msg.content && <p className="text-sm"><HighlightedText text={msg.content} searchQuery={searchQuery} /></p>}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.attachments.map((file, fileIndex) => (
                        <div key={fileIndex} className="flex items-center bg-gray-200/60 p-2 rounded-lg">
                          <DocumentIcon className="w-6 h-6 text-gray-500 mr-2" />
                          <div className="flex-1 text-sm">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-2 px-1">
                  {msg.role === 'assistant' && (
                    <>
                      <button onClick={() => handleFeedback(msg.id, 'positive')} className="p-1 rounded-full hover:bg-gray-200">
                        {msg.feedback === 'positive' ? <HandThumbUpSolid className="w-4 h-4 text-indigo-500" /> : <HandThumbUpIcon className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button onClick={() => handleFeedback(msg.id, 'negative')} className="p-1 rounded-full hover:bg-gray-200">
                        {msg.feedback === 'negative' ? <HandThumbDownSolid className="w-4 h-4 text-indigo-500" /> : <HandThumbDownIcon className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button onClick={() => handleSpeakMessage(msg.content)} className="p-1 rounded-full hover:bg-gray-200" title="Listen to message">
                        <SpeakerWaveIcon className="w-4 h-4 text-gray-400" />
                      </button>
                    </>
                  )}
                  <button onClick={() => handleCopyMessage(msg.content)} className="p-1 rounded-full hover:bg-gray-200">
                    <ClipboardDocumentIcon className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-3">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${agentColor} flex-shrink-0`}></div>
              <div className="px-4 py-3 rounded-2xl bg-gray-100">
                <TypingIndicator agentColor={agentColor} stage={typingStage} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200">
        {attachments.length > 0 && (
          <div className="mb-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="relative group bg-gray-100 p-2 rounded-lg text-sm flex items-center gap-2">
                <DocumentIcon className="w-5 h-5 text-gray-500" />
                <div className="flex-1 truncate">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <button onClick={() => removeAttachment(index)} className="absolute top-1 right-1 p-0.5 bg-gray-300 rounded-full text-white opacity-0 group-hover:opacity-100">
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="relative">
          <textarea
            ref={textAreaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={placeholder}
            className="w-full pl-12 pr-20 py-3 text-sm bg-gray-50 rounded-xl border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 shadow-sm"
            rows={1}
            style={{ resize: 'none', overflowY: 'hidden' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-gray-200">
              <PaperClipIcon className="w-5 h-5 text-gray-500" />
            </button>
            <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files)} multiple className="hidden" accept="application/pdf" />
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button 
              type="button" 
              onClick={handleStartRecording} 
              disabled={isLoading} 
              className={`p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : ''}`}
              title={isRecording ? "Stop recording" : "Voice input"}
            >
              <MicrophoneIcon className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-gray-500'}`} />
            </button>
            <button type="submit" disabled={isLoading} className="p-2 rounded-full bg-indigo-500 text-white disabled:bg-indigo-300 hover:bg-indigo-600 transition-colors">
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}