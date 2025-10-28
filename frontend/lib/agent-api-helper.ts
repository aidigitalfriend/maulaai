/**
 * ========================================
 * FRONTEND AGENT INTEGRATION HELPER
 * ========================================
 * 
 * Simple function to connect any agent to the
 * unified backend AI API with all providers
 * 
 * Usage in any agent page:
 * ```tsx
 * import { sendAgentMessage } from '@/lib/agent-api-helper'
 * 
 * const response = await sendAgentMessage({
 *   agentId: 'ben-sega',
 *   message: userInput,
 *   conversationHistory: messages,
 *   stream: true
 * })
 * ```
 * ========================================
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

export interface SendMessageOptions {
  agentId: string
  message: string
  conversationHistory?: AgentMessage[]
  language?: string
  stream?: boolean
  onChunk?: (chunk: string) => void
}

export interface AgentResponse {
  success: boolean
  message: string
  provider: string
  agentId: string
  timestamp: string
}

/**
 * Send message to any AI agent
 */
export async function sendAgentMessage(
  options: SendMessageOptions
): Promise<AgentResponse | ReadableStream> {
  const {
    agentId,
    message,
    conversationHistory = [],
    language = 'en',
    stream = false,
    onChunk
  } = options

  try {
    const response = await fetch(`${API_BASE_URL}/api/agents/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId,
        message,
        conversationHistory,
        language,
        stream
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    // Handle streaming response
    if (stream && response.body) {
      if (onChunk) {
        // Parse stream and call onChunk for each piece
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let fullMessage = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  fullMessage += parsed.content
                  onChunk(parsed.content)
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }

        return {
          success: true,
          message: fullMessage,
          provider: 'streaming',
          agentId,
          timestamp: new Date().toISOString()
        }
      } else {
        // Return the stream for manual handling
        return response.body
      }
    }

    // Handle regular response
    const data = await response.json()
    return data as AgentResponse
  } catch (error) {
    console.error('[Agent API Helper] Error:', error)
    throw error
  }
}

/**
 * Get AI provider status
 */
export async function getProviderStatus(): Promise<{
  status: string
  providers: Record<string, boolean>
  availableProviders: number
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/agents/chat`, {
      method: 'GET'
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[Agent API Helper] Status check failed:', error)
    throw error
  }
}

/**
 * React Hook for agent chat
 */
export function useAgentChat(agentId: string) {
  const [messages, setMessages] = React.useState<AgentMessage[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const sendMessage = async (message: string, stream: boolean = false) => {
    setIsLoading(true)
    setError(null)

    // Add user message
    const userMessage: AgentMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      if (stream) {
        // Streaming mode
        let assistantMessage = ''
        const assistantMessageObj: AgentMessage = {
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, assistantMessageObj])

        await sendAgentMessage({
          agentId,
          message,
          conversationHistory: messages,
          stream: true,
          onChunk: (chunk) => {
            assistantMessage += chunk
            setMessages(prev => {
              const newMessages = [...prev]
              newMessages[newMessages.length - 1] = {
                ...assistantMessageObj,
                content: assistantMessage
              }
              return newMessages
            })
          }
        })
      } else {
        // Regular mode
        const response = await sendAgentMessage({
          agentId,
          message,
          conversationHistory: messages,
          stream: false
        }) as AgentResponse

        const assistantMessage: AgentMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: response.timestamp
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      console.error('[Agent Chat Hook] Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessages = () => {
    setMessages([])
    setError(null)
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages
  }
}

// Add React import for the hook
import React from 'react'
