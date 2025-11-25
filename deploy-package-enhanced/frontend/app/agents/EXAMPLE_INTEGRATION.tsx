/**
 * ========================================
 * EXAMPLE: BEN SEGA AGENT WITH FULL AI INTEGRATION
 * ========================================
 * 
 * This shows how to integrate the new AI API
 * into the Ben Sega agent page.
 * 
 * Copy this pattern to any other agent!
 * ========================================
 */

'use client'

import { useState } from 'react'
import { useAgentChat } from '@/lib/agent-api-helper'
import { motion } from 'framer-motion'

export default function BenSegaAgentExample() {
  // Use the AI chat hook - handles ALL AI providers automatically!
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    clearMessages 
  } = useAgentChat('ben-sega')
  
  const [input, setInput] = useState('')

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    // This will try: Anthropic → Gemini → OpenAI → Cohere
    // Automatically falls back if one fails!
    await sendMessage(input, true) // true = streaming mode
    setInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Ben Sega 🚀
          </h1>
          <p className="text-purple-300">
            AI Entrepreneur & Tech Visionary
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
              ✅ Multi-AI Enabled
            </span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
              🔄 Auto-Fallback
            </span>
          </div>
        </motion.div>

        {/* Chat Container */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mb-4">
          
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto mb-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                <p className="text-xl mb-2">👋 Hey there!</p>
                <p>Ask me anything about AI, startups, or tech trends.</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-purple-400">
                      <span>🤖</span>
                      <span>Ben Sega</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-800 text-gray-100 p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-sm text-gray-400">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Input Area */}
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Ben anything about tech, AI, startups..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-white/5 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
              rows={2}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
            >
              {isLoading ? '⏳' : '🚀'}
            </button>
          </div>

          {/* Clear Button */}
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="mt-4 w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              🗑️ Clear Conversation
            </button>
          )}
        </div>

        {/* Info Footer */}
        <div className="text-center text-sm text-gray-400">
          <p>
            Powered by: OpenAI · Anthropic · Google Gemini · Cohere
          </p>
          <p className="mt-1">
            🔄 Automatic fallback ensures 99.9% uptime
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * ========================================
 * MIGRATION GUIDE FOR EXISTING AGENTS
 * ========================================
 * 
 * To migrate an existing agent page:
 * 
 * 1. Import the hook:
 *    import { useAgentChat } from '@/lib/agent-api-helper'
 * 
 * 2. Replace your existing state with:
 *    const { messages, isLoading, error, sendMessage } = useAgentChat('your-agent-id')
 * 
 * 3. Replace your send function with:
 *    await sendMessage(userInput, true) // true for streaming
 * 
 * 4. Remove any manual API calls
 * 
 * 5. That's it! Your agent now uses ALL AI providers!
 * 
 * ========================================
 * AVAILABLE AGENT IDs:
 * ========================================
 * 
 * - 'ben-sega' - Tech entrepreneur
 * - 'tech-wizard' - Mystical technologist  
 * - 'doctor-network' - Network expert
 * - 'data-scientist' - ML/AI expert
 * - 'devops-expert' - DevOps specialist
 * 
 * Add more in: backend/app/api/agents/chat/route.ts
 * ========================================
 */
