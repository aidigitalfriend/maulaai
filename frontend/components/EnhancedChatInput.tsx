'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  PaperAirplaneIcon,
  PaperClipIcon,
  MicrophoneIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline'

interface EnhancedChatInputProps {
  onSend: (message: string) => void
  onFileSelect?: (file: File) => void
  disabled?: boolean
  placeholder?: string
}

export default function EnhancedChatInput({
  onSend,
  onFileSelect,
  disabled = false,
  placeholder = "Type your message... (Shift+Enter for new line, Ctrl+Enter to send)"
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
      if (document.activeElement !== textareaRef.current) return

      // Ctrl/Cmd + Enter to send
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (input.trim()) handleSend()
      }
      // Ctrl/Cmd + / for command palette
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [input])

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (items) {
      Array.from(items).forEach((item) => {
        if (item.kind === 'file') {
          const file = item.getAsFile()
          if (file) {
            onFileSelect?.(file)
          }
        }
      })
    }
  }

  const commands = [
    { name: '/expand', icon: '📝', label: 'Expand response' },
    { name: '/simplify', icon: '⚙️', label: 'Simplify' },
    { name: '/refine', icon: '✨', label: 'Refine' },
  ]

  return (
    <div className="border-t border-gray-200 bg-white p-4 space-y-3">
      
      {/* Command Palette */}
      {showCommandPalette && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2 animate-in fade-in slide-in-from-top">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-700">Quick Commands</p>
            <button
              onClick={() => setShowCommandPalette(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close (ESC)
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {commands.map(cmd => (
              <button
                key={cmd.name}
                onClick={() => {
                  setInput(prev => prev + cmd.name + ' ')
                  setShowCommandPalette(false)
                  textareaRef.current?.focus()
                }}
                className="px-2 py-1 text-xs bg-white border border-gray-200 rounded hover:bg-blue-50 transition-colors"
                title={cmd.label}
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
            title="Attach file"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            disabled={disabled}
            aria-label="Attach file"
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
            title="Voice input"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            disabled={disabled}
            aria-label="Voice input"
          >
            <MicrophoneIcon className="w-5 h-5 text-gray-600" />
          </button>

          {/* Emoji Picker */}
          <button
            title="Add emoji"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
            disabled={disabled}
            aria-label="Add emoji"
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
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            placeholder-gray-400 text-sm leading-relaxed
            max-h-[200px] overflow-y-auto
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          rows={1}
          aria-label="Message input"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          title="Send (Ctrl+Enter)"
          className="
            p-2 rounded-lg transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:enabled:bg-indigo-500 hover:enabled:text-white
            bg-indigo-500 text-white
            flex-shrink-0
          "
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Helper Text */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>
          {input.length > 0 && `${input.length} characters`}
        </span>
        <div className="flex gap-2">
          <span>Shift+Enter = line break</span>
          <button
            onClick={() => setShowCommandPalette(true)}
            className="text-indigo-500 hover:text-indigo-600 font-medium"
            aria-label="Show command palette"
          >
            Ctrl+/ for commands
          </button>
        </div>
      </div>
    </div>
  )
}
