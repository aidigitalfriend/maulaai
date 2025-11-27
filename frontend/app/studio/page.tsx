'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, RefreshCw, ThumbsUp, ThumbsDown, Volume2, Copy } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  liked?: boolean
  disliked?: boolean
}

export default function AIStudioPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [showWelcome, setShowWelcome] = useState(true)
  const [rateLimitReached, setRateLimitReached] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const MAX_MESSAGES = 18

  useEffect(() => {
    loadSession()
  }, [])

  const loadSession = async () => {
    try {
      const response = await fetch('/api/studio/session', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const sessionData = data.data
          
          if (!sessionData.isNew && !sessionData.expired) {
            setMessages(sessionData.messages)
            setMessageCount(sessionData.messageCount)
            setShowWelcome(false)
            if (sessionData.messageCount >= MAX_MESSAGES) {
              setRateLimitReached(true)
            }
          } else if (sessionData.expired) {
            // Session expired, start fresh
            setMessages([])
            setMessageCount(0)
            setShowWelcome(true)
            setRateLimitReached(false)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }

  // Track user scroll behavior to prevent auto-scroll interference
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50
      setShouldAutoScroll(isAtBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Smart auto-scroll: only when new messages arrive AND user hasn't scrolled up
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, shouldAutoScroll])

  const handleResetSession = async () => {
    try {
      await fetch('/api/studio/session', {
        method: 'DELETE',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Failed to reset session:', error)
    }
    
    setMessages([])
    setMessageCount(0)
    setRateLimitReached(false)
    setShowWelcome(true)
  }

  const handleLike = (index: number) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, liked: !msg.liked, disliked: false } : msg
    ))
  }

  const handleDislike = (index: number) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, disliked: !msg.disliked, liked: false } : msg
    ))
  }

  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSpeak = (content: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(content)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isLoading || rateLimitReached) return

    const userMessage: Message = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputText('')
    setIsLoading(true)
    setShowWelcome(false)

    const newCount = messageCount + 1
    setMessageCount(newCount)

    if (newCount >= MAX_MESSAGES) {
      setRateLimitReached(true)
    }

    try {
      const response = await fetch('/api/studio/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText.trim(),
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setRateLimitReached(true)
          throw new Error('Rate limit reached. Please reset your session.')
        }
        throw new Error(data.error || 'Failed to send message')
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      const finalMessages = [...newMessages, assistantMessage]
      setMessages(finalMessages)

      // Save session to backend
      try {
        await fetch('/api/studio/session', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: finalMessages,
            messageCount: newCount
          })
        })
      } catch (error) {
        console.error('Failed to save session:', error)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-neutral-900 via-blue-900 to-purple-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">AI Studio</h1>
            <p className="text-sm text-white/60">Powered by One Last AI</p>
          </div>
          {messageCount > 0 && (
            <button
              onClick={handleResetSession}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Session
            </button>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="container mx-auto max-w-4xl space-y-6">
          {showWelcome && messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-3xl font-bold mb-3">Welcome to AI Studio</h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                I am One Last AI Assistant here to help you. Feel free to ask me anything about our platform, services, or any questions you may have!
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-3xl">
                <div
                  className={`px-6 py-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
                  }`}
                >
                  <div className="text-sm font-semibold mb-2 opacity-70">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div className="prose prose-invert max-w-none">
                    {message.role === 'assistant' ? (
                      <ReactMarkdown
                        className="markdown-content"
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="ml-2">{children}</li>,
                          code: ({ children }) => <code className="bg-black/30 px-1.5 py-0.5 rounded text-sm">{children}</code>,
                          h1: ({ children }) => <h1 className="text-2xl font-bold mb-2 mt-4">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xl font-bold mb-2 mt-3">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-2">{children}</h3>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons for Assistant Messages */}
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-2 ml-2">
                    <button
                      onClick={() => handleLike(index)}
                      className={`p-2 rounded-lg transition ${
                        message.liked 
                          ? 'bg-green-600 text-white' 
                          : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                      }`}
                      title="Like"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDislike(index)}
                      className={`p-2 rounded-lg transition ${
                        message.disliked 
                          ? 'bg-red-600 text-white' 
                          : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                      }`}
                      title="Dislike"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSpeak(message.content)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition"
                      title="Read aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopy(message.content, index)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition"
                      title={copiedIndex === index ? "Copied!" : "Copy"}
                    >
                      <Copy className={`w-4 h-4 ${copiedIndex === index ? 'text-green-400' : ''}`} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-3xl px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          {rateLimitReached && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
              <p className="text-red-200 font-semibold mb-2">⚠️ Rate Limit Reached</p>
              <p className="text-red-300 text-sm mb-3">
                You've reached the maximum of {MAX_MESSAGES} messages. Please reset your session to continue.
              </p>
              <button
                onClick={handleResetSession}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition font-medium"
              >
                Reset Session Now
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-black/30 backdrop-blur-sm border-t border-white/10 px-4 py-4">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={rateLimitReached ? "Reset session to continue..." : "Type your message here..."}
              disabled={isLoading || rateLimitReached}
              className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim() || rateLimitReached}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl transition font-medium flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </form>
          <p className="text-xs text-white/40 text-center mt-3">
            Powered by advanced AI technology • Your conversations are private
          </p>
        </div>
      </div>
    </div>
  )
}
