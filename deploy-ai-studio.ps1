# Deploy AI Studio to production
Write-Host "=== Deploying AI Studio ===" -ForegroundColor Cyan

# Upload API route
Write-Host "Uploading API route..." -ForegroundColor Yellow
scp -i "one-last-ai.pem" frontend/app/api/studio/chat/route.ts ubuntu@47.129.43.231:~/shiny-friend-disco/frontend/app/api/studio/chat/route.ts

# Create studio page directly on server
Write-Host "Creating studio page on server..." -ForegroundColor Yellow
ssh -i "one-last-ai.pem" ubuntu@47.129.43.231 @"
cat > ~/shiny-friend-disco/frontend/app/studio/page.tsx << 'STUDIO_EOF'
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AIStudioPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [rateLimitReached, setRateLimitReached] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const MESSAGE_LIMIT = 18

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to AI Studio. I am One Last AI Assistant here to help you. Feel free to ask me anything about our platform, services, or any questions you may have!',
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [])

  const resetSession = () => {
    setMessages([{
      id: 'welcome-' + Date.now(),
      role: 'assistant',
      content: 'Welcome to AI Studio. I am One Last AI Assistant here to help you. Feel free to ask me anything about our platform, services, or any questions you may have!',
      timestamp: new Date()
    }])
    setMessageCount(0)
    setRateLimitReached(false)
    setInputText('')
  }

  const sendMessage = async () => {
    if (!inputText.trim()) return
    
    if (messageCount >= MESSAGE_LIMIT) {
      setRateLimitReached(true)
      return
    }

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
    setMessageCount(prev => prev + 1)

    try {
      const response = await fetch('/api/studio/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputText,
          conversationHistory: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          }))
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
        setMessages([...updatedMessages, assistantMessage])
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
          timestamp: new Date(),
        }
        setMessages([...updatedMessages, errorMessage])
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages([...updatedMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-neutral-900 via-blue-900 to-purple-900 text-white flex flex-col overflow-hidden">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 border-b border-white/10 p-6 flex-shrink-0 shadow-xl">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">🤖 AI Studio</h1>
          <p className="text-blue-100 text-sm">Your intelligent assistant for all things One Last AI</p>
        </div>
      </header>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map(message => (
              <div key={message.id} className={\`flex \${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn\`}>
                <div className={\`max-w-[80%] px-6 py-4 rounded-2xl shadow-lg \${message.role === 'user' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto' : 'bg-white/10 backdrop-blur-md text-white border border-white/20'}\`}>
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                  <div className="text-xs mt-2 opacity-60">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="max-w-[80%] px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <div className="flex gap-2 items-center"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Thinking...</span></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        {rateLimitReached && (
          <div className="px-4 pb-4">
            <div className="max-w-4xl mx-auto bg-red-500/20 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Rate Limit Reached</h3>
                  <p className="text-sm text-red-100 mb-3">You have reached the maximum of {MESSAGE_LIMIT} messages in this session. Please reset your session or refresh your browser to start a new conversation.</p>
                  <button onClick={resetSession} className="px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50 transition">Reset Session</button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="px-4"><div className="max-w-4xl mx-auto"><div className="text-xs text-center text-white/40 mb-2">{messageCount}/{MESSAGE_LIMIT} messages used</div></div></div>
        <div className="border-t border-white/10 p-4 bg-black/20 backdrop-blur-md">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} placeholder={rateLimitReached ? "Please reset session to continue..." : "Type your message here..."} className="flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition placeholder-white/40 text-white backdrop-blur-sm" disabled={isLoading || rateLimitReached} />
              <button onClick={sendMessage} disabled={isLoading || !inputText.trim() || rateLimitReached} className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
STUDIO_EOF
"@

# Rebuild
Write-Host "Rebuilding frontend..." -ForegroundColor Yellow
ssh -i "one-last-ai.pem" ubuntu@47.129.43.231 "cd ~/shiny-friend-disco/frontend && npm run build"

# Restart PM2
Write-Host "Restarting PM2..." -ForegroundColor Yellow
ssh -i "one-last-ai.pem" ubuntu@47.129.43.231 "pm2 restart frontend"

Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "AI Studio is now live at: https://onelastai.co/studio" -ForegroundColor Cyan
