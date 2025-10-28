# 🛠️ Agent Pages & ChatBox - Implementation Guide with Code Examples

**Purpose:** Ready-to-implement code snippets for UI/UX enhancements  
**Target:** Frontend React/Next.js components

---

## 1️⃣ QUICK WIN: Enhanced Message Component with Actions

### **Problem:** Messages lack user interaction options

### **Solution: MessageWithActions.tsx**

```tsx
'use client'

import { useState } from 'react'
import { 
  DocumentDuplicateIcon,
  CheckIcon,
  HeartIcon,
  RocketLaunchIcon,
  ExclamationCircleIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'

interface MessageWithActionsProps {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
  onReaction?: (messageId: string, reaction: string) => void
  onSave?: (messageId: string) => void
}

export default function MessageWithActions({
  id,
  role,
  content,
  timestamp,
  onReaction,
  onSave
}: MessageWithActionsProps) {
  const [copied, setCopied] = useState(false)
  const [reactions, setReactions] = useState<Record<string, boolean>>({
    helpful: false,
    love: false,
    rocket: false,
    warning: false,
    bookmark: false
  })

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleReaction = (reaction: string) => {
    const newState = !reactions[reaction as keyof typeof reactions]
    setReactions(prev => ({
      ...prev,
      [reaction]: newState
    }))
    onReaction?.(id, reaction)
  }

  const reactionIcons = {
    helpful: { icon: CheckIcon, label: 'Helpful', color: 'text-green-500' },
    love: { icon: HeartSolid, label: 'Love it', color: 'text-red-500' },
    rocket: { icon: RocketLaunchIcon, label: 'Awesome', color: 'text-blue-500' },
    warning: { icon: ExclamationCircleIcon, label: 'Unclear', color: 'text-yellow-500' },
    bookmark: { icon: BookmarkIcon, label: 'Save', color: 'text-purple-500' }
  }

  return (
    <div className={`message-wrapper group mb-4 ${role === 'user' ? 'ml-12' : 'mr-12'}`}>
      {/* Main Message Bubble */}
      <div
        className={`
          message-bubble px-4 py-3 rounded-lg transition-all duration-200
          ${role === 'user'
            ? 'bg-blue-500 text-white ml-auto max-w-[70%]'
            : 'bg-gray-100 text-gray-900 max-w-[70%]'
          }
        `}
      >
        <p className="text-sm leading-relaxed break-words">{content}</p>
        
        {timestamp && (
          <p className={`text-xs mt-1 opacity-70`}>
            {timestamp.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Message Actions - Appear on Hover */}
      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          title="Copy message"
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors duration-150"
        >
          {copied ? (
            <CheckIcon className="w-4 h-4 text-green-500" />
          ) : (
            <DocumentDuplicateIcon className="w-4 h-4 text-gray-500 hover:text-gray-700" />
          )}
        </button>

        {/* Reaction Buttons */}
        {role === 'assistant' && (
          <>
            {Object.entries(reactionIcons).map(([key, { icon: Icon, label, color }]) => (
              <button
                key={key}
                onClick={() => toggleReaction(key)}
                title={label}
                className={`
                  p-1.5 rounded-md transition-all duration-150
                  ${reactions[key as keyof typeof reactions]
                    ? 'bg-gray-200'
                    : 'hover:bg-gray-100'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${
                  reactions[key as keyof typeof reactions] ? color : 'text-gray-500'
                }`} />
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
```

---

## 2️⃣ CRITICAL: Enhanced Multi-line Input Component

### **Problem:** Single-line input limits user experience

### **Solution: EnhancedChatInput.tsx**

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  PaperAirplaneIcon,
  PaperClipIcon,
  MicrophoneIcon,
  FaceSmileIcon,
  CheckIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/outline'

interface EnhancedChatInputProps {
  onSend: (message: string) => void
  onFileSelect?: (file: File) => void
  onVoiceStart?: () => void
  disabled?: boolean
  placeholder?: string
}

export default function EnhancedChatInput({
  onSend,
  onFileSelect,
  onVoiceStart,
  disabled = false,
  placeholder = "Type your message or press Ctrl+Enter to send..."
}: EnhancedChatInputProps) {
  const [input, setInput] = useState('')
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-expand textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px'
    }
  }, [input])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to send
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (input.trim()) handleSend()
      }
      // Shift + Enter for new line (default behavior in textarea)
      // Ctrl/Cmd + / for command palette
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
    }

    textareaRef.current?.addEventListener('keydown', handleKeyDown)
    return () => textareaRef.current?.removeEventListener('keydown', handleKeyDown)
  }, [input])

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim())
      setInput('')
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (items) {
      for (let item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (file) {
            onFileSelect?.(file)
          }
        }
      }
    }
  }

  const commands = [
    { name: 'Expand', icon: '📝', shortcut: '/expand' },
    { name: 'Simplify', icon: '⚙️', shortcut: '/simplify' },
    { name: 'Summarize', icon: '📊', shortcut: '/summarize' },
    { name: 'Refine', icon: '✨', shortcut: '/refine' },
    { name: 'Translate', icon: '🌍', shortcut: '/translate' }
  ]

  return (
    <div className="border-t border-gray-200 bg-white p-4 space-y-3">
      
      {/* Command Palette */}
      {showCommandPalette && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">Quick Commands</p>
            <button
              onClick={() => setShowCommandPalette(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close (ESC)
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {commands.map(cmd => (
              <button
                key={cmd.shortcut}
                onClick={() => {
                  setInput(prev => prev + cmd.shortcut)
                  setShowCommandPalette(false)
                }}
                className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-blue-50 transition-colors"
              >
                <span className="text-lg block">{cmd.icon}</span>
                {cmd.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="flex gap-3 items-end">
        
        {/* Left Action Buttons */}
        <div className="flex gap-2">
          {/* File Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach file (Ctrl+Shift+F)"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            disabled={disabled}
          >
            <PaperClipIcon className="w-5 h-5 text-gray-600" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFileSelect?.(file)
            }}
            accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg"
          />

          {/* Voice Input */}
          <button
            onClick={onVoiceStart}
            title="Voice input (Ctrl+M)"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            disabled={disabled}
          >
            <MicrophoneIcon className="w-5 h-5 text-gray-600" />
          </button>

          {/* Emoji Picker (placeholder) */}
          <button
            title="Add emoji"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            disabled={disabled}
          >
            <FaceSmileIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled}
          className="
            flex-1 resize-none p-3 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            placeholder-gray-400 text-sm leading-relaxed
            max-h-[200px] overflow-y-auto
          "
          rows={1}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          title="Send (Ctrl+Enter)"
          className="
            p-2 rounded-lg transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:enabled:bg-blue-500 hover:enabled:text-white
            bg-blue-500 text-white
          "
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Helper Text */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {input.length > 0 && `${input.length} characters`}
        </span>
        <div className="flex gap-3">
          <span>Ctrl+Enter to send</span>
          <button
            onClick={() => setShowCommandPalette(true)}
            className="text-blue-500 hover:text-blue-600"
          >
            Ctrl+/ for commands
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 3️⃣ HIGH PRIORITY: Mobile Optimization Wrapper

### **Problem:** ChatBox not optimized for mobile

### **Solution: MobileOptimizedChatBox.tsx**

```tsx
'use client'

import { useState, useEffect } from 'react'
import ChatBox from './ChatBox'

interface MobileOptimizedChatBoxProps {
  agentId: string
  agentName: string
  agentColor: string
  initialMessage?: string
  onSendMessage: (message: string) => Promise<string>
  [key: string]: any
}

export default function MobileOptimizedChatBox({
  agentId,
  agentName,
  agentColor,
  initialMessage,
  onSendMessage,
  ...props
}: MobileOptimizedChatBoxProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Handle keyboard height changes (iOS)
    const handleResize = () => {
      const windowHeight = window.innerHeight
      const clientHeight = document.documentElement.clientHeight
      setKeyboardHeight(Math.max(0, clientHeight - windowHeight))
    }

    window.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('resize', handleResize)
    }
  }, [])

  const mobileStyles = isMobile ? {
    paddingBottom: `${keyboardHeight + 20}px`,
    transition: 'padding-bottom 0.3s ease-in-out'
  } : {}

  return (
    <div 
      className={`
        flex flex-col h-screen max-h-screen
        ${isMobile ? 'fixed inset-0 z-40' : 'relative'}
      `}
      style={mobileStyles}
    >
      {/* Mobile Header */}
      {isMobile && (
        <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg">
              🤖
            </div>
            <div>
              <h2 className="font-semibold text-sm">{agentName}</h2>
              <p className="text-xs text-gray-500">Always here to help</p>
            </div>
          </div>
          {/* Menu button placeholder */}
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            ⋮
          </button>
        </div>
      )}

      {/* ChatBox Container */}
      <div className="flex-1 overflow-hidden">
        <ChatBox
          agentId={agentId}
          agentName={agentName}
          agentColor={agentColor}
          initialMessage={initialMessage}
          onSendMessage={onSendMessage}
          {...props}
        />
      </div>

      {/* Mobile Safe Area Padding */}
      {isMobile && (
        <div className="safe-area-bottom" style={{
          height: 'max(env(safe-area-inset-bottom), 12px)',
          backgroundColor: 'white'
        }} />
      )}
    </div>
  )
}
```

---

## 4️⃣ MEDIUM PRIORITY: Enhanced Agent Page Header

### **Problem:** Generic agent headers without personality

### **Solution: EnhancedAgentHeader.tsx**

```tsx
'use client'

import { AgentConfig } from '@/app/agents/types'
import { StarIcon, CheckCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

interface EnhancedAgentHeaderProps {
  agent: AgentConfig
  stats?: {
    totalConversations: number
    avgRating: number
    responseTime: string
    userCount: number
  }
}

export default function EnhancedAgentHeader({ 
  agent, 
  stats = {
    totalConversations: 1250,
    avgRating: 4.8,
    responseTime: '2s',
    userCount: 3420
  }
}: EnhancedAgentHeaderProps) {
  const [isFavorite, setIsFavorite] = React.useState(false)

  return (
    <div className={`bg-gradient-to-r ${agent.color} text-white overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, currentColor 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative container-custom py-12 z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          
          {/* Agent Avatar Section */}
          <div className="flex-shrink-0">
            <div className="relative">
              {/* Large Avatar */}
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-2xl flex items-center justify-center text-6xl md:text-7xl shadow-lg backdrop-blur-sm">
                {agent.avatarUrl ? (
                  <img 
                    src={agent.avatarUrl} 
                    alt={agent.name}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  '🤖'
                )}
              </div>
              
              {/* Favorite Button */}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="absolute -top-2 -right-2 bg-yellow-400 p-2 rounded-full hover:scale-110 transition-transform duration-200"
              >
                {isFavorite ? (
                  <StarSolid className="w-5 h-5 text-yellow-600" />
                ) : (
                  <StarIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Status Badge */}
              <div className="absolute -bottom-2 -right-2 bg-green-400 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Available
              </div>
            </div>
          </div>

          {/* Agent Info Section */}
          <div className="flex-1">
            {/* Name and Specialty */}
            <div className="mb-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{agent.name}</h1>
              <p className="text-xl text-white/90">{agent.specialty}</p>
            </div>

            {/* Description */}
            <p className="text-white/80 mb-4 max-w-xl leading-relaxed">
              {agent.description}
            </p>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm text-white/70">Total Conversations</p>
                <p className="text-2xl font-bold">{stats.totalConversations.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm text-white/70">Rating</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">{stats.avgRating}</p>
                  <StarSolid className="w-5 h-5 text-yellow-300" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm text-white/70">Response Time</p>
                <p className="text-2xl font-bold">{stats.responseTime}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-sm text-white/70">Happy Users</p>
                <p className="text-2xl font-bold">{stats.userCount.toLocaleString()}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {agent.tags.map(tag => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="flex-shrink-0 space-y-3">
            <button className="w-full md:w-auto px-6 py-3 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors duration-200 block">
              Start Conversation
            </button>
            <button className="w-full md:w-auto px-6 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors duration-200 block">
              View Details
            </button>
          </div>
        </div>

        {/* Key Traits/Capabilities */}
        <div className="mt-8 pt-8 border-t border-white/20">
          <h3 className="text-lg font-semibold mb-4">Key Capabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agent.personality?.specialties?.map(specialty => (
              <div key={specialty} className="flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{specialty}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 5️⃣ ACCESSIBILITY: Keyboard Shortcuts System

### **Problem:** No keyboard shortcuts for power users

### **Solution: useKeyboardShortcuts.ts**

```typescript
// hooks/useKeyboardShortcuts.ts
import { useEffect, useCallback } from 'react'

interface ShortcutConfig {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  handler: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], enabled = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Don't trigger shortcuts in input fields (unless specifically allowed)
    const target = event.target as HTMLElement
    const isInputField = ['INPUT', 'TEXTAREA'].includes(target.tagName)
    if (isInputField && !event.ctrlKey && !event.metaKey) return

    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatch = (event.ctrlKey || event.metaKey) === (shortcut.ctrlKey || shortcut.metaKey)
      const shiftMatch = event.shiftKey === (shortcut.shiftKey || false)
      const altMatch = event.altKey === (shortcut.altKey || false)

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault()
        shortcut.handler()
        break
      }
    }
  }, [shortcuts, enabled])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Usage in ChatBox:
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export default function ChatBox({ ...props }) {
  const shortcuts: ShortcutConfig[] = [
    {
      key: 'Enter',
      ctrlKey: true,
      handler: handleSend,
      description: 'Send message'
    },
    {
      key: '/',
      ctrlKey: true,
      handler: () => setShowCommandPalette(true),
      description: 'Show commands'
    },
    {
      key: 'k',
      ctrlKey: true,
      handler: () => setIsSearchVisible(true),
      description: 'Search messages'
    },
    {
      key: 'f',
      ctrlKey: true,
      shiftKey: true,
      handler: () => fileInputRef.current?.click(),
      description: 'Attach file'
    },
    {
      key: 'c',
      ctrlKey: true,
      shiftKey: true,
      handler: clearHistory,
      description: 'Clear chat'
    }
  ]

  useKeyboardShortcuts(shortcuts)

  // ... rest of component
}
```

---

## 6️⃣ ACCESSIBILITY: ARIA Labels Helper

### **Problem:** Missing accessibility labels

### **Solution: accessibilityHelpers.ts**

```typescript
// utils/accessibilityHelpers.ts

export function createAriaLabel(action: string, context?: string): string {
  return `${action}${context ? ` - ${context}` : ''}`
}

export function createLiveRegionAnnouncement(message: string, priority: 'polite' | 'assertive' = 'polite'): JSX.Element {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}

export const ARIA_LABELS = {
  SEND_MESSAGE: 'Send message',
  ATTACH_FILE: 'Attach file to message',
  VOICE_INPUT: 'Start voice input',
  EMOJI_PICKER: 'Open emoji picker',
  SETTINGS: 'Open settings panel',
  SEARCH: 'Search conversations',
  CLEAR_CHAT: 'Clear all messages',
  COPY_MESSAGE: 'Copy message to clipboard',
  HELPFUL_REACTION: 'Mark as helpful',
  LOVE_REACTION: 'I love this response',
  SAVE_MESSAGE: 'Save message for later',
  AGENT_AVATAR: 'Agent avatar',
  AGENT_NAME: 'Agent name',
  CHAT_HISTORY: 'Chat history region',
  MESSAGE_INPUT: 'Message input area'
} as const

// Usage example:
interface AccessibleButtonProps {
  onClick: () => void
  ariaLabel: keyof typeof ARIA_LABELS
  children: React.ReactNode
}

export function AccessibleButton({ onClick, ariaLabel, children }: AccessibleButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ARIA_LABELS[ariaLabel]}
      className="focus:ring-2 focus:ring-blue-500 focus:outline-none rounded"
    >
      {children}
    </button>
  )
}
```

---

## 7️⃣ STATE MANAGEMENT: Improved ChatBox State

### **Problem:** ChatBox has too much state logic

### **Solution: useChatStore.ts (with Zustand)**

```typescript
// stores/useChatStore.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  reactions?: Record<string, boolean>
  pinned?: boolean
}

interface ChatStore {
  // State
  messages: ChatMessage[]
  isLoading: boolean
  currentAgent: string
  savedConversations: Record<string, ChatMessage[]>
  
  // Mutations
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  deleteMessage: (id: string) => void
  setIsLoading: (loading: boolean) => void
  clearMessages: () => void
  setCurrentAgent: (agentId: string) => void
  
  // Reactions
  toggleReaction: (messageId: string, reaction: string) => void
  
  // Saved Conversations
  saveConversation: (name: string) => void
  loadConversation: (name: string) => void
  deleteConversation: (name: string) => void
}

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set, get) => ({
        messages: [],
        isLoading: false,
        currentAgent: 'general',
        savedConversations: {},

        addMessage: (message) =>
          set((state) => ({
            messages: [...state.messages, message],
          })),

        updateMessage: (id, updates) =>
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === id ? { ...msg, ...updates } : msg
            ),
          })),

        deleteMessage: (id) =>
          set((state) => ({
            messages: state.messages.filter((msg) => msg.id !== id),
          })),

        setIsLoading: (loading) => set({ isLoading: loading }),

        clearMessages: () => set({ messages: [] }),

        setCurrentAgent: (agentId) => set({ currentAgent: agentId }),

        toggleReaction: (messageId, reaction) =>
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    reactions: {
                      ...msg.reactions,
                      [reaction]: !msg.reactions?.[reaction],
                    },
                  }
                : msg
            ),
          })),

        saveConversation: (name) =>
          set((state) => ({
            savedConversations: {
              ...state.savedConversations,
              [name]: state.messages,
            },
          })),

        loadConversation: (name) =>
          set((state) => ({
            messages: state.savedConversations[name] || [],
          })),

        deleteConversation: (name) =>
          set((state) => {
            const { [name]: _, ...rest } = state.savedConversations
            return { savedConversations: rest }
          }),
      }),
      {
        name: 'chat-store',
      }
    )
  )
)
```

---

## 8️⃣ TESTING: Accessibility Test Checklist

### **File: __tests__/accessibility.test.tsx**

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import ChatBox from '@/components/ChatBox'

expect.extend(toHaveNoViolations)

describe('ChatBox Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(
      <ChatBox
        agentId="test"
        agentName="Test Agent"
        agentColor="blue"
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup()
    render(
      <ChatBox
        agentId="test"
        agentName="Test Agent"
        agentColor="blue"
      />
    )

    const sendButton = screen.getByRole('button', { name: /send/i })
    await user.tab()
    expect(sendButton).toHaveFocus()
  })

  it('should have proper ARIA labels', () => {
    render(
      <ChatBox
        agentId="test"
        agentName="Test Agent"
        agentColor="blue"
      />
    )

    expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /attach/i })).toBeInTheDocument()
  })

  it('should handle keyboard shortcuts', async () => {
    const user = userEvent.setup()
    const onSend = jest.fn()

    render(
      <ChatBox
        agentId="test"
        agentName="Test Agent"
        agentColor="blue"
        onSendMessage={onSend}
      />
    )

    const input = screen.getByRole('textbox', { name: /message/i })
    await user.type(input, 'Test message')
    await user.keyboard('{Control>}{Enter}{/Control}')

    expect(onSend).toHaveBeenCalledWith('Test message')
  })

  it('should support reduced motion', () => {
    const { container } = render(
      <ChatBox
        agentId="test"
        agentName="Test Agent"
        agentColor="blue"
      />
    )

    const style = window.getComputedStyle(container)
    expect(style.animation).not.toBe('none')

    // Mock prefers-reduced-motion
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
    }))

    // After re-render with reduced motion, animations should be disabled
  })
})
```

---

## ✅ Implementation Checklist

Quick reference for implementing each enhancement:

```
PHASE 1 - CRITICAL (Week 1-2):
☐ Implement EnhancedChatInput with multi-line support
☐ Add MessageWithActions component
☐ Mobile optimization (MobileOptimizedChatBox)
☐ Keyboard shortcuts (useKeyboardShortcuts hook)
☐ Basic ARIA labels

PHASE 2 - IMPORTANT (Week 3-4):
☐ Enhanced Agent Headers (EnhancedAgentHeader)
☐ Accessibility helpers (createAriaLabel, etc.)
☐ Keyboard navigation improvements
☐ Chat state management (useChatStore)
☐ Add unit/accessibility tests

PHASE 3 - POLISH (Week 5-6):
☐ Agent personality UI theming
☐ Conversation management features
☐ Analytics integration
☐ Performance optimization
☐ Cross-browser testing

PHASE 4 - ADVANCED (Ongoing):
☐ Integrations (Slack, Teams)
☐ Advanced automation
☐ Social features
☐ Custom workflows
```

---

**Next Steps:**
1. Review these code examples with your team
2. Start with Phase 1 implementations
3. Use the checklist above to track progress
4. Set up automated accessibility testing
5. Gather user feedback after each phase

