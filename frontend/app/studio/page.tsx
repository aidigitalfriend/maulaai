'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Send, Copy, ThumbsUp, ThumbsDown, Volume2, Mic, Plus, Settings, Download, Trash2, Menu, X } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  liked?: boolean
  disliked?: boolean
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  model: string
}

const LLM_MODELS = [
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', free: true },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', free: false },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', free: false },
  { id: 'mistral-7b', name: 'Mistral 7B', provider: 'Mistral', free: true },
]

export default function AIStudioPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [selectedModel, setSelectedModel] = useState('gemini-pro')
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Load conversations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('ai-studio-conversations')
    if (stored) {
      const parsed = JSON.parse(stored)
      setConversations(parsed)
      if (parsed.length > 0) {
        setCurrentConversation(parsed[0])
        setMessages(parsed[0].messages)
      }
    }
  }, [])

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('ai-studio-conversations', JSON.stringify(conversations))
    }
  }, [conversations])

  // Auto-scroll to bottom of messages - scroll only within the messages container
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onstart = () => setIsListening(true)
        recognitionRef.current.onend = () => setIsListening(false)
        recognitionRef.current.onresult = (event: any) => {
          let transcript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript
          }
          setInputText(prev => prev + ' ' + transcript)
        }
      }
    }
  }, [])

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model: selectedModel,
    }
    setConversations([newConversation, ...conversations])
    setCurrentConversation(newConversation)
    setMessages([])
  }

  const selectConversation = (conv: Conversation) => {
    setCurrentConversation(conv)
    setMessages(conv.messages)
    setSelectedModel(conv.model)
  }

  const deleteConversation = (id: string) => {
    const updated = conversations.filter(c => c.id !== id)
    setConversations(updated)
    if (currentConversation?.id === id) {
      setCurrentConversation(updated[0] || null)
      setMessages(updated[0]?.messages || [])
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim() || !currentConversation) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputText('')
    setIsLoading(true)

    try {
      // Call backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputText,
          model: selectedModel,
          conversationId: currentConversation.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        }
        const finalMessages = [...updatedMessages, assistantMessage]
        setMessages(finalMessages)

        // Update conversation
        const updatedConversation: Conversation = {
          ...currentConversation,
          messages: finalMessages,
          updatedAt: new Date(),
          title: updatedMessages.length === 1 
            ? inputText.substring(0, 50) 
            : currentConversation.title,
        }
        setCurrentConversation(updatedConversation)
        
        const updatedConversations = conversations.map(c =>
          c.id === updatedConversation.id ? updatedConversation : c
        )
        setConversations(updatedConversations)
      } else {
        console.error('API error:', data)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const speakMessage = (content: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      } else {
        const utterance = new SpeechSynthesisUtterance(content)
        utterance.onend = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
        setIsSpeaking(true)
      }
    }
  }

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start()
    }
  }

  const exportConversation = () => {
    if (!currentConversation) return
    const dataStr = JSON.stringify(currentConversation, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `conversation-${currentConversation.id}.json`
    link.click()
  }

  const clearAllConversations = () => {
    if (confirm('Are you sure you want to delete all conversations?')) {
      setConversations([])
      setCurrentConversation(null)
      setMessages([])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-600 to-accent-600 border-b border-neural-700 p-4">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">🤖 AI Studio</h1>
              <p className="text-sm opacity-90">Advanced AI Chat with Multiple Models</p>
            </div>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - Hidden by default on mobile, toggle button to open */}
        <aside className={`
          fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-neural-800/50 border-r border-neural-700 
          flex flex-col overflow-hidden transform transition-transform duration-300
          ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 border-b border-neural-700 space-y-3">
              <button
                onClick={createNewConversation}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 rounded-lg font-semibold transition"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </button>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neural-300">MODEL</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 bg-neural-700 border border-neural-600 rounded-lg text-sm focus:outline-none focus:border-brand-600 transition"
                >
                  {LLM_MODELS.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} {model.free ? '(Free)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {conversations.length === 0 ? (
                <p className="text-center text-neural-400 text-sm py-8">No conversations yet</p>
              ) : (
                conversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      currentConversation?.id === conv.id
                        ? 'bg-brand-600/30 border border-brand-600'
                        : 'bg-neural-700/50 hover:bg-neural-700 border border-neural-700'
                    }`}
                  >
                    <div className="font-semibold text-sm truncate">{conv.title}</div>
                    <div className="text-xs text-neural-400 mt-1">
                      {conv.messages.length} messages
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Sidebar Footer */}
            {conversations.length > 0 && (
              <div className="p-4 border-t border-neural-700 space-y-2">
                <button
                  onClick={exportConversation}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-neural-700 hover:bg-neural-600 rounded-lg text-sm transition"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={clearAllConversations}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-sm transition text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            )}
          </aside>
        )}

        {/* Overlay for mobile when sidebar is open */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Mobile Toggle Button - Always visible on mobile */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden fixed top-20 left-4 z-50 p-3 bg-brand-600 hover:bg-brand-700 rounded-full shadow-lg transition"
          >
            {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {currentConversation ? (
            <>
              {/* Messages - Scroll contained within this div */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4"
                style={{ scrollBehavior: 'smooth' }}
              >
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h2 className="text-2xl font-bold mb-2">Start a Conversation</h2>
                    <p className="text-neural-400 max-w-md">
                      Ask me anything! I can help with writing, coding, analysis, creative work, and much more.
                    </p>
                  </div>
                ) : (
                  messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xl lg:max-w-2xl px-4 py-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-brand-600 text-white'
                            : 'bg-neural-700 text-neural-100'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        <div className="text-xs mt-2 opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </div>

                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neural-600">
                            <button
                              onClick={() => speakMessage(message.content)}
                              className="p-2 hover:bg-neural-600 rounded-lg transition"
                              title="Read aloud"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => copyMessage(message.content, message.id)}
                              className="p-2 hover:bg-neural-600 rounded-lg transition"
                              title="Copy message"
                            >
                              {copiedId === message.id ? (
                                <span className="text-xs">Copied!</span>
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                const updatedMessages = messages.map(m =>
                                  m.id === message.id ? { ...m, liked: !m.liked } : m
                                )
                                setMessages(updatedMessages)
                              }}
                              className={`p-2 hover:bg-neural-600 rounded-lg transition ${
                                message.liked ? 'text-green-400' : ''
                              }`}
                              title="Like"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const updatedMessages = messages.map(m =>
                                  m.id === message.id ? { ...m, disliked: !m.disliked } : m
                                )
                                setMessages(updatedMessages)
                              }}
                              className={`p-2 hover:bg-neural-600 rounded-lg transition ${
                                message.disliked ? 'text-red-400' : ''
                              }`}
                              title="Dislike"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-xl lg:max-w-2xl px-4 py-3 rounded-lg bg-neural-700">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-neural-700 p-4 bg-neural-800/50">
                <div className="container-custom space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message... or click the mic to speak"
                      className="flex-1 px-4 py-3 bg-neural-700 border border-neural-600 rounded-lg focus:outline-none focus:border-brand-600 transition"
                      disabled={isLoading}
                    />
                    <button
                      onClick={startListening}
                      className={`p-3 rounded-lg transition ${
                        isListening
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-neural-700 hover:bg-neural-600'
                      }`}
                      title="Speak (STT)"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !inputText.trim()}
                      className="p-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-lg transition"
                      title="Send message"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-neural-400">
                    Using: <span className="font-semibold">{LLM_MODELS.find(m => m.id === selectedModel)?.name}</span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-7xl mb-4">🚀</div>
              <h2 className="text-3xl font-bold mb-2">Welcome to AI Studio</h2>
              <p className="text-neural-400 max-w-md mb-6">
                Create a new conversation to get started with our advanced AI chat interface.
              </p>
              <button
                onClick={createNewConversation}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 rounded-lg font-semibold transition"
              >
                Start New Conversation
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
