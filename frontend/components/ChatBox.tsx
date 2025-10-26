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
  agentId: string
  agentName: string
  agentColor: string
  placeholder?: string
  initialMessage?: string
  onSendMessage?: (message: string, attachments?: FileAttachment[], detectedLanguage?: DetectedLanguage) => Promise<string>
  className?: string
  allowFileUpload?: boolean
  maxFileSize?: number // in MB
  enableLanguageDetection?: boolean
}

export default function ChatBox({
  agentId,
  agentName,
  agentColor,
  placeholder = "Type your message...",
  initialMessage,
  onSendMessage,
  className = "",
  allowFileUpload = true,
  maxFileSize = 10,
  enableLanguageDetection = true
}: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false)
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState<'thinking' | 'processing' | 'typing'>('thinking')
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [feedbackLoading, setFeedbackLoading] = useState<string | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{messageId: string, messageIndex: number}[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1)
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  
  // PDF Preview Modal
  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  
  // Voice functionality
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null)
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null)
  
  // Settings panel
  const [showSettings, setShowSettings] = useState(false)
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1,
    pitch: 1,
    volume: 1,
    voice: null as SpeechSynthesisVoice | null
  })
  
  // Chat tools
  const [showTools, setShowTools] = useState(false)
  const [exportFormat, setExportFormat] = useState<'txt' | 'json' | 'pdf'>('txt')
  
  // Language Detection
  const [detectedLanguage, setDetectedLanguage] = useState<DetectedLanguage | null>(null)
  const [isDetectingLanguage, setIsDetectingLanguage] = useState(false)
  const [languageOverride, setLanguageOverride] = useState<DetectedLanguage | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load chat history on component mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const savedMessages = loadChatHistory(agentId)
        
        if (savedMessages.length > 0) {
          setMessages(savedMessages)
        } else if (initialMessage) {
          // Only add initial message if no history exists
          const initialMsg: ChatMessage = {
            id: 'initial',
            role: 'assistant',
            content: initialMessage,
            timestamp: new Date()
          }
          setMessages([initialMsg])
          addMessageToHistory(agentId, initialMsg)
        }
      } catch (error) {
        console.error('Error loading chat history:', error)
        // Fallback to initial message if history loading fails
        if (initialMessage) {
          const initialMsg: ChatMessage = {
            id: 'initial',
            role: 'assistant',
            content: initialMessage,
            timestamp: new Date()
          }
          setMessages([initialMsg])
        }
      } finally {
        setIsHistoryLoaded(true)
      }
    }
    
    loadHistory()
  }, [agentId, initialMessage])

  // Auto-scroll during streaming for better UX
  useEffect(() => {
    // Don't auto-scroll - let user control scroll position
    // Only save messages to localStorage
  }, [messages])

  // Save messages to localStorage when they change
  useEffect(() => {
    if (isHistoryLoaded && messages.length > 0) {
      saveChatHistory(agentId, messages)
    }
  }, [agentId, messages, isHistoryLoaded])

  // Initialize voice functionality
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize speech synthesis
      if ('speechSynthesis' in window) {
        setSpeechSynthesis(window.speechSynthesis)
        
        // Load available voices
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices()
          if (voices.length > 0 && !voiceSettings.voice) {
            // Find a good default voice (preferably English)
            const defaultVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0]
            setVoiceSettings(prev => ({ ...prev, voice: defaultVoice }))
          }
        }
        
        loadVoices()
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
        
        return () => {
          window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
        }
      }
    }
  }, [])

  // Cleanup voice on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      }
      if (currentUtterance && speechSynthesis) {
        speechSynthesis.cancel()
      }
    }
  }, [mediaRecorder, currentUtterance, speechSynthesis])

  const scrollToBottom = () => {
    // Scroll to bottom is disabled - user maintains scroll control
    // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // File upload handlers
  const handleFileSelect = (files: FileList | null) => {
    if (!files || !allowFileUpload) return

    Array.from(files).forEach(file => {
      if (file.type === 'application/pdf') {
        if (file.size > maxFileSize * 1024 * 1024) {
          alert(`File "${file.name}" is too large. Maximum size is ${maxFileSize}MB.`)
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          const newAttachment: FileAttachment = {
            name: file.name,
            size: file.size,
            type: file.type,
            data: e.target?.result as string
          }
          setAttachedFiles(prev => [...prev, newAttachment])
        }
        reader.readAsDataURL(file)
      } else {
        alert(`File "${file.name}" is not supported. Only PDF files are allowed.`)
      }
    })
  }

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (allowFileUpload) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (allowFileUpload) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  // Search functionality
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setCurrentSearchIndex(-1)
      return
    }

    const results: {messageId: string, messageIndex: number}[] = []
    messages.forEach((message, index) => {
      if (message.content.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          messageId: message.id,
          messageIndex: index
        })
      }
    })
    
    setSearchResults(results)
    setCurrentSearchIndex(results.length > 0 ? 0 : -1)
    
    // Scroll to first result
    if (results.length > 0) {
      scrollToMessage(results[0].messageIndex)
    }
  }

  const scrollToMessage = (messageIndex: number) => {
    const messageElement = document.getElementById(`message-${messages[messageIndex]?.id}`)
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Highlight the message temporarily
      messageElement.classList.add('search-highlight')
      setTimeout(() => {
        messageElement.classList.remove('search-highlight')
      }, 2000)
    }
  }

  const navigateSearchResults = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return
    
    let newIndex = currentSearchIndex
    if (direction === 'next') {
      newIndex = (currentSearchIndex + 1) % searchResults.length
    } else {
      newIndex = currentSearchIndex === 0 ? searchResults.length - 1 : currentSearchIndex - 1
    }
    
    setCurrentSearchIndex(newIndex)
    scrollToMessage(searchResults[newIndex].messageIndex)
  }

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible)
    if (isSearchVisible) {
      setSearchQuery('')
      setSearchResults([])
      setCurrentSearchIndex(-1)
    }
  }

  const openPDFPreview = (file: FileAttachment) => {
    setPreviewFile(file)
    setIsPreviewModalOpen(true)
  }

  const closePDFPreview = () => {
    setIsPreviewModalOpen(false)
    setPreviewFile(null)
  }

  // Language detection functions
  const detectLanguage = async (text: string) => {
    if (!enableLanguageDetection || !text.trim()) return null
    
    setIsDetectingLanguage(true)
    try {
      const detected = await detectLanguageWithOpenAI(text)
      setDetectedLanguage(detected)
      return detected
    } catch (error) {
      console.error('Language detection failed:', error)
      return null
    } finally {
      setIsDetectingLanguage(false)
    }
  }

  const handleLanguageOverride = (language: DetectedLanguage) => {
    setLanguageOverride(language)
    setDetectedLanguage(language)
  }

  const handleClearLanguageOverride = () => {
    setLanguageOverride(null)
    // Keep the detected language if we have one
  }

  const getCurrentLanguage = (): DetectedLanguage | null => {
    return languageOverride || detectedLanguage
  }

  // Voice handler functions
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Voice recording is not supported in your browser')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      
      recorder.onstart = () => {
        setIsRecording(true)
        setAudioChunks([])
      }
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data])
        }
      }
      
      recorder.onstop = async () => {
        setIsRecording(false)
        stream.getTracks().forEach(track => track.stop())
        
        if (audioChunks.length > 0) {
          await processVoiceRecording()
        }
      }
      
      setMediaRecorder(recorder)
      recorder.start()
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }
  }

  const processVoiceRecording = async () => {
    if (audioChunks.length === 0) return

    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
    
    // Here you would typically send to speech-to-text service
    // For now, simulate the process
    try {
      setLoadingStage('processing')
      
      // Simulate API call to speech-to-text service
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo, generate a placeholder text
      const transcribedText = "This is a transcribed message from voice input. In a real implementation, this would be the actual speech-to-text result."
      
      setInput(transcribedText)
      
      // Auto-detect language from transcribed text
      if (enableLanguageDetection) {
        await detectLanguage(transcribedText)
      }
    } catch (error) {
      console.error('Error processing voice recording:', error)
      alert('Failed to process voice recording. Please try again.')
    }
  }

  const speakMessage = (messageContent: string, messageId: string) => {
    if (!speechSynthesis || !voiceSettings.voice) {
      alert('Text-to-speech is not available')
      return
    }

    // Cancel any current speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(messageContent)
    utterance.voice = voiceSettings.voice
    utterance.rate = voiceSettings.rate
    utterance.pitch = voiceSettings.pitch
    utterance.volume = voiceSettings.volume

    utterance.onstart = () => {
      setIsPlaying(true)
      setCurrentPlayingId(messageId)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setCurrentPlayingId(null)
      setCurrentUtterance(null)
    }

    utterance.onerror = () => {
      setIsPlaying(false)
      setCurrentPlayingId(null)
      setCurrentUtterance(null)
    }

    setCurrentUtterance(utterance)
    speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel()
      setIsPlaying(false)
      setCurrentPlayingId(null)
      setCurrentUtterance(null)
    }
  }

  const exportChat = (format: 'txt' | 'json' | 'pdf') => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${agentName}-chat-${timestamp}`

    if (format === 'txt') {
      const content = messages.map(msg => 
        `[${msg.timestamp.toLocaleString()}] ${msg.role === 'user' ? 'You' : agentName}: ${msg.content}`
      ).join('\n\n')
      
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'json') {
      const content = JSON.stringify(messages, null, 2)
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
    // PDF export would require a PDF library like jsPDF
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    }).catch(err => {
      console.error('Failed to copy text: ', err)
    })
  }

  const clearHistory = () => {
    setMessages([])
    clearChatHistory(agentId)
  }

  // Handle Escape key for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchVisible) {
        toggleSearch()
      } else if (e.key === 'Enter' && isSearchVisible && searchQuery) {
        performSearch(searchQuery)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSearchVisible, searchQuery])

  const sendMessage = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return

    // Prevent document scroll when adding messages
    const scrollX = window.scrollX
    const scrollY = window.scrollY

    // Detect language if enabled and no override is set
    let messageLanguage = getCurrentLanguage()
    if (enableLanguageDetection && input.trim() && !languageOverride) {
      messageLanguage = await detectLanguage(input.trim())
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined
    }

    setMessages(prev => [...prev, userMessage])
    
    // Restore scroll position immediately after state update
    requestAnimationFrame(() => {
      window.scrollTo(scrollX, scrollY)
    })
    
    setInput('')
    setAttachedFiles([])
    setIsLoading(true)
    setLoadingStage('thinking')

    try {
      // Simulate thinking phase
      await new Promise(resolve => setTimeout(resolve, 800))
      setLoadingStage('processing')
      
      let responseContent = ''
      
      if (onSendMessage) {
        responseContent = await onSendMessage(userMessage.content, userMessage.attachments, messageLanguage || undefined)
      } else {
        // Default responses for demo with more realistic delay
        await new Promise(resolve => setTimeout(resolve, 1200))
        
        const defaultResponses = [
          `That's a fascinating question! Let me break this down for you. Based on my understanding, there are several key aspects to consider here. First, we should look at the fundamental principles involved. These principles help us understand the broader context and implications of your inquiry.`,
          `Great question! Here's what I think about this topic. From my analysis, this involves multiple interconnected factors that we should examine carefully. Let me walk you through each component and explain how they relate to your specific situation.`,
          `I'd love to help you with that! This is actually a really interesting area that touches on several important concepts. Let me provide you with a comprehensive overview that covers both the theoretical framework and practical applications.`,
          `Thanks for sharing that with me! Your question highlights some really important considerations. Let me explore this with you step by step, starting with the foundational elements and then building up to more complex scenarios.`,
          `Let me provide some insights on that topic. This is an area where there's been significant development recently, and I think you'll find the latest perspectives quite enlightening. Here's my detailed analysis of the key factors involved.`
        ]
        responseContent = defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
      }

      setLoadingStage('typing')
      
      // Preserve scroll position before adding new message
      const scrollX = window.scrollX
      const scrollY = window.scrollY
      
      // Create streaming message
      const assistantMessageId = `assistant-${Date.now()}`
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        isStreaming: true,
        streamingComplete: false
      }

      setStreamingMessageId(assistantMessageId)
      setMessages(prev => [...prev, assistantMessage])
      
      // Restore scroll position after message is added
      requestAnimationFrame(() => {
        window.scrollTo(scrollX, scrollY)
      })
      
      setIsLoading(false) // Stop the loading indicator, start streaming

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Preserve scroll position before adding error message
      const scrollX = window.scrollX
      const scrollY = window.scrollY
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      
      // Restore scroll position after message is added
      requestAnimationFrame(() => {
        window.scrollTo(scrollX, scrollY)
      })
      
      setIsLoading(false)
      setStreamingMessageId(null)
    }
  }

  // Handle streaming completion
  const handleStreamingComplete = (messageId: string) => {
    setMessages(prev => {
      const updatedMessages = prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isStreaming: false, streamingComplete: true }
          : msg
      )
      
      // Auto-speak the completed message if enabled
      if (autoSpeak && voiceEnabled) {
        const completedMessage = updatedMessages.find(msg => msg.id === messageId)
        if (completedMessage && completedMessage.role === 'assistant') {
          // Small delay to ensure UI is updated
          setTimeout(() => {
            speakMessage(completedMessage.content, messageId)
          }, 500)
        }
      }
      
      // Save to localStorage when streaming is complete
      saveChatHistory(agentId, updatedMessages)
      return updatedMessages
    })
    setStreamingMessageId(null)
  }

  const handleFeedback = async (messageId: string, feedbackType: 'positive' | 'negative') => {
    setFeedbackLoading(messageId)

    try {
      // Send feedback to API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageId,
          agentId,
          feedbackType,
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        // Update message with feedback
        setMessages(prev => {
          const updatedMessages = prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, feedback: feedbackType }
              : msg
          )
          // Save updated messages to localStorage
          saveChatHistory(agentId, updatedMessages)
          return updatedMessages
        })
        
        // Also update in localStorage directly for consistency
        updateMessageInHistory(agentId, messageId, { feedback: feedbackType })
      } else {
        console.error('Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setFeedbackLoading(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear this conversation history? This action cannot be undone.')) {
      clearChatHistory(agentId)
      
      // Reset to initial message if provided
      if (initialMessage) {
        const initialMsg: ChatMessage = {
          id: `initial-${Date.now()}`,
          role: 'assistant',
          content: initialMessage,
          timestamp: new Date()
        }
        setMessages([initialMsg])
        addMessageToHistory(agentId, initialMsg)
      } else {
        setMessages([])
      }
    }
  }

  return (
    <div className={`bg-white rounded-xl shadow-large border-2 ${agentColor.replace('from-', 'border-').replace('to-', '').split(' ')[0].replace('-500', '-200')} ${className}`} style={{ overflow: 'hidden' }}>
      {/* Chat Header with Clear History Button */}
      <div className={`flex items-center justify-between p-4 border-b-2 ${agentColor.replace('from-', 'border-').replace('to-', '').split(' ')[0].replace('-500', '-200')}`}>
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-800">Chat with {agentName}</h3>
          {messages.length > 1 && (
            <span className="text-sm text-gray-500">
              ({messages.length} messages)
            </span>
          )}
          {enableLanguageDetection && (
            <LanguageIndicator
              detectedLanguage={detectedLanguage}
              isDetecting={isDetectingLanguage}
              onLanguageOverride={handleLanguageOverride}
              onClearOverride={handleClearLanguageOverride}
              hasOverride={!!languageOverride}
            />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Voice Controls */}
          {voiceEnabled && (
            <div className="flex items-center space-x-1">
              <button
                onClick={autoSpeak ? () => setAutoSpeak(false) : () => setAutoSpeak(true)}
                className={`p-1.5 rounded-md transition-colors ${
                  autoSpeak 
                    ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
                title={autoSpeak ? 'Disable auto-speak' : 'Enable auto-speak'}
              >
                <SpeakerWaveIcon className="w-4 h-4" />
              </button>
              
              {isPlaying && (
                <button
                  onClick={stopSpeaking}
                  className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                  title="Stop speaking"
                >
                  <StopIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          
          {/* Tools Button */}
          <button
            onClick={() => setShowTools(!showTools)}
            className="flex items-center space-x-1 px-2 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Chat tools"
          >
            <EllipsisHorizontalIcon className="w-4 h-4" />
          </button>
          
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-1 px-2 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Settings"
          >
            <Cog6ToothIcon className="w-4 h-4" />
          </button>
          
          {messages.length > 0 && (
            <button
              onClick={toggleSearch}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Search conversation"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              <span>Search</span>
            </button>
          )}
          
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Clear conversation history"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {isSearchVisible && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value.trim()) {
                    performSearch(e.target.value)
                  } else {
                    setSearchResults([])
                    setCurrentSearchIndex(-1)
                  }
                }}
                placeholder="Search conversation..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <MagnifyingGlassIcon className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
            
            {searchResults.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{currentSearchIndex + 1} of {searchResults.length}</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => navigateSearchResults('prev')}
                    className="p-1 hover:bg-gray-200 rounded"
                    disabled={searchResults.length === 0}
                  >
                    <ChevronUpIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigateSearchResults('next')}
                    className="p-1 hover:bg-gray-200 rounded"
                    disabled={searchResults.length === 0}
                  >
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            <button
              onClick={toggleSearch}
              className="p-2 hover:bg-gray-200 rounded-lg"
              title="Close search"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
          
          {searchQuery && searchResults.length === 0 && (
            <div className="mt-2 text-sm text-gray-500">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      )}

      <div className="h-96 overflow-y-auto p-6 space-y-4" style={{ scrollBehavior: 'auto' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            id={`message-${message.id}`}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} transition-all duration-300`}
          >
            <div className="flex flex-col max-w-xs lg:max-w-md">
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : `${agentColor.replace('from-', 'bg-').replace('to-', '').split(' ')[0].replace('-500', '-100')} ${agentColor.replace('from-', 'text-').replace('to-', '').split(' ')[0].replace('-500', '-800')}`
                } ${message.isStreaming ? 'min-h-[2rem] flex items-start' : ''}`}
              >
                {message.role === 'assistant' && message.isStreaming ? (
                  <TypewriterText
                    text={message.content}
                    speed={25}
                    isActive={streamingMessageId === message.id}
                    onComplete={() => handleStreamingComplete(message.id)}
                  />
                ) : (
                  <HighlightedText text={message.content} searchQuery={searchQuery} />
                )}
              </div>

              {/* File attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 p-2 rounded-lg border ${
                        message.role === 'user'
                          ? 'bg-white/20 border-white/30'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <DocumentIcon className="w-5 h-5 text-red-600" />
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => openPDFPreview(attachment)}
                          className={`text-sm font-medium truncate hover:underline cursor-pointer text-left transition-colors ${
                            message.role === 'user' 
                              ? 'text-white hover:text-white/80' 
                              : 'text-gray-900 hover:text-blue-600'
                          }`}
                          title="Click to preview PDF"
                        >
                          {attachment.name}
                        </button>
                        <p className={`text-xs ${
                          message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {formatFileSize(attachment.size)} • Click to preview
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => openPDFPreview(attachment)}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            message.role === 'user'
                              ? 'bg-white/20 hover:bg-white/30 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                          title="Preview PDF"
                        >
                          Preview
                        </button>
                        {attachment.data && (
                          <a
                            href={attachment.data}
                            download={attachment.name}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              message.role === 'user'
                                ? 'bg-white/20 hover:bg-white/30 text-white'
                                : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                            }`}
                          >
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Feedback buttons for assistant messages only */}
              {message.role === 'assistant' && (
                <div className="flex items-center justify-end space-x-2 mt-2">
                  <span className="text-xs text-gray-500">
                    {message.isStreaming ? (
                      <span className="flex items-center space-x-1">
                        <span className="animate-pulse">✍️</span>
                        <span>typing...</span>
                      </span>
                    ) : (
                      message.timestamp.toLocaleTimeString()
                    )}
                  </span>
                  
                  {!message.isStreaming && (
                    <div className="flex space-x-1">
                      {/* Voice controls */}
                      {voiceEnabled && (
                        <>
                          <button
                            onClick={() => {
                              if (currentPlayingId === message.id && isPlaying) {
                                stopSpeaking()
                              } else {
                                speakMessage(message.content, message.id)
                              }
                            }}
                            className={`p-1 rounded-full transition-colors ${
                              currentPlayingId === message.id && isPlaying
                                ? 'text-red-600 bg-red-100'
                                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title={currentPlayingId === message.id && isPlaying ? 'Stop speaking' : 'Speak message'}
                          >
                            {currentPlayingId === message.id && isPlaying ? (
                              <StopIcon className="w-4 h-4" />
                            ) : (
                              <SpeakerWaveIcon className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="p-1 rounded-full transition-colors text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                            title="Copy message"
                          >
                            <ClipboardDocumentIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleFeedback(message.id, 'positive')}
                        disabled={feedbackLoading === message.id}
                        className={`p-1 rounded-full transition-colors ${
                          message.feedback === 'positive'
                            ? 'text-green-600 bg-green-100'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        } ${feedbackLoading === message.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Good response"
                      >
                        {message.feedback === 'positive' ? (
                          <HandThumbUpSolid className="w-4 h-4" />
                        ) : (
                          <HandThumbUpIcon className="w-4 h-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleFeedback(message.id, 'negative')}
                        disabled={feedbackLoading === message.id}
                        className={`p-1 rounded-full transition-colors ${
                          message.feedback === 'negative'
                            ? 'text-red-600 bg-red-100'
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        } ${feedbackLoading === message.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Poor response"
                      >
                        {message.feedback === 'negative' ? (
                          <HandThumbDownSolid className="w-4 h-4" />
                        ) : (
                          <HandThumbDownIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex flex-col max-w-xs lg:max-w-md">
              <div className={`px-4 py-3 rounded-lg ${agentColor.replace('from-', 'bg-').replace('to-', '').split(' ')[0].replace('-500', '-100')} ${agentColor.replace('from-', 'text-').replace('to-', '').split(' ')[0].replace('-500', '-800')} animate-pulse`}>
                <div className="flex items-center space-x-3">
                  <TypingIndicator agentColor={agentColor} stage={loadingStage} />
                  <span className="text-sm opacity-75">
                    {agentName} is {loadingStage === 'thinking' ? 'thinking' : loadingStage === 'processing' ? 'processing' : 'getting ready'}...
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 mt-2">
                <span className="text-xs text-gray-400 animate-pulse">
                  {loadingStage === 'thinking' ? 'analyzing...' : loadingStage === 'processing' ? 'generating response...' : 'preparing to type...'}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div 
        className={`border-t-2 ${agentColor.replace('from-', 'border-').replace('to-', '').split(' ')[0].replace('-500', '-200')} p-4 ${
          isDragOver ? 'bg-blue-50 border-blue-300' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* File attachments preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <span>📎 Attached Files ({attachedFiles.length})</span>
              </div>
              <button
                onClick={() => setAttachedFiles([])}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                title="Remove all attachments"
              >
                Clear all
              </button>
            </div>
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-lg shadow-sm animate-fadeIn"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <DocumentIcon className="w-6 h-6 text-red-600" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-white">✓</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                      <span>{file.name}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">PDF</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center space-x-2">
                      <span>{formatFileSize(file.size)}</span>
                      <span className="text-green-600">• Ready to send</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeAttachment(index)}
                  className="flex items-center space-x-1 px-2 py-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 group"
                  title="Remove this file"
                >
                  <XMarkIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">Remove</span>
                </button>
              </div>
            ))}
            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border-l-2 border-blue-300">
              💡 <strong>Tip:</strong> Files will be sent with your message. Click the X to remove individual files or "Clear all" to remove everything.
            </div>
          </div>
        )}

        {/* Drag and drop overlay */}
        {isDragOver && allowFileUpload && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-90 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <DocumentIcon className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <p className="text-lg font-medium text-blue-700">Drop PDF files here</p>
              <p className="text-sm text-blue-600">Maximum file size: {maxFileSize}MB</p>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className={`w-full px-4 py-2 pr-12 border-2 ${agentColor.replace('from-', 'border-').replace('to-', '').split(' ')[0].replace('-500', '-300')} rounded-lg focus:outline-none focus:ring-2 focus:ring-${agentColor.replace('from-', '').replace('to-', '').split(' ')[0].replace('-500', '-600')}`}
              disabled={isLoading}
            />
            
            {/* Voice and File buttons */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {/* Voice recording button */}
              {voiceEnabled && (
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-1 rounded-full transition-colors ${
                    isRecording
                      ? 'text-red-600 bg-red-50 hover:bg-red-100 animate-pulse'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title={isRecording ? 'Stop recording' : 'Start voice recording'}
                  disabled={isLoading}
                >
                  <MicrophoneIcon className="w-5 h-5" />
                </button>
              )}
              
              {/* File upload button */}
              {allowFileUpload && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  title="Attach PDF file"
                  disabled={isLoading}
                >
                  <PaperClipIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {allowFileUpload && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
            )}
          </div>
          
          <button
            onClick={sendMessage}
            disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
            <span>Send</span>
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chat Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Voice Settings */}
            {voiceEnabled && speechSynthesis && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">Voice Settings</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Auto-speak responses
                  </label>
                  <button
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      autoSpeak ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        autoSpeak ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Speech Rate: {voiceSettings.rate}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.rate}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Speech Pitch: {voiceSettings.pitch}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={voiceSettings.pitch}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Speech Volume: {voiceSettings.volume}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceSettings.volume}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                
                {speechSynthesis && speechSynthesis.getVoices().length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Voice
                    </label>
                    <select
                      value={voiceSettings.voice?.name || ''}
                      onChange={(e) => {
                        if (speechSynthesis) {
                          const voice = speechSynthesis.getVoices().find(v => v.name === e.target.value)
                          setVoiceSettings(prev => ({ ...prev, voice: voice || null }))
                        }
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      {speechSynthesis?.getVoices().map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Tools Panel */}
      {showTools && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chat Tools</h3>
              <button
                onClick={() => setShowTools(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Export Chat */}
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Export Conversation</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => exportChat('txt')}
                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>TXT</span>
                  </button>
                  <button
                    onClick={() => exportChat('json')}
                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>
              
              {/* Copy Last Response */}
              {messages.length > 0 && (
                <div>
                  <button
                    onClick={() => {
                      const lastAssistantMessage = messages.slice().reverse().find(m => m.role === 'assistant')
                      if (lastAssistantMessage) {
                        copyToClipboard(lastAssistantMessage.content)
                      }
                    }}
                    className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 rounded-md transition-colors w-full"
                  >
                    <ClipboardDocumentIcon className="w-4 h-4" />
                    <span>Copy Last Response</span>
                  </button>
                </div>
              )}
              
              {/* Clear Chat */}
              <div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear the entire conversation?')) {
                      clearHistory()
                      setShowTools(false)
                    }
                  }}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors w-full"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Clear Conversation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewFile && isPreviewModalOpen && (
        <PDFPreviewModal
          file={previewFile}
          isOpen={isPreviewModalOpen}
          onClose={closePDFPreview}
        />
      )}
    </div>
  )
}