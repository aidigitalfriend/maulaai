import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type { AgentState, AgentSession, ChatMessage, ModelOption } from '../types'

// Available AI Models
export const AVAILABLE_MODELS: ModelOption[] = [
  // Anthropic Claude Models
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Best for coding - highly recommended',
    icon: '🎭',
    maxTokens: 8192,
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most powerful Claude model',
    icon: '🎯',
    maxTokens: 4096,
  },
  
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Most capable OpenAI model',
    icon: '🌟',
    maxTokens: 4096,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Fast and cost-effective',
    icon: '⚡',
    maxTokens: 4096,
  },
  
  // Google Gemini Models
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    description: 'High reasoning for complex apps',
    icon: '🧠',
    maxTokens: 8192,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    description: 'Fast and efficient',
    icon: '💨',
    maxTokens: 8192,
  },
  
  // Groq Models (Fast Inference)
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Groq',
    description: 'Ultra-fast inference',
    icon: '🦙',
    maxTokens: 8192,
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'Groq',
    description: 'Fast MoE model',
    icon: '🔀',
    maxTokens: 4096,
  },
  
  // xAI Grok
  {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xAI',
    description: 'Strong reasoning and coding',
    icon: '🚀',
    maxTokens: 4096,
  },
  
  // Mistral Models
  {
    id: 'codestral',
    name: 'Codestral',
    provider: 'Mistral',
    description: 'Specialized for code generation',
    icon: '💻',
    maxTokens: 8192,
  },
]

interface AgentStore extends AgentState {
  // Session Actions
  createSession: (name?: string, model?: ModelOption) => string
  deleteSession: (id: string) => void
  setActiveSession: (id: string | null) => void
  renameSession: (id: string, name: string) => void
  
  // Message Actions
  addMessage: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  updateMessage: (sessionId: string, messageId: string, content: string) => void
  clearMessages: (sessionId: string) => void
  
  // Generation Actions
  setGenerating: (isGenerating: boolean) => void
  setStreamingContent: (content: string) => void
  appendStreamingContent: (chunk: string) => void
  setError: (error: string | null) => void
  
  // Model Actions
  setSessionModel: (sessionId: string, model: ModelOption) => void
  
  // Utility
  getActiveSession: () => AgentSession | null
  reset: () => void
}

const createDefaultSession = (model?: ModelOption): AgentSession => ({
  id: nanoid(),
  name: 'New Chat',
  messages: [],
  model: model || AVAILABLE_MODELS[0],
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

const initialState: AgentState = {
  sessions: [],
  activeSessionId: null,
  isGenerating: false,
  streamingContent: '',
  error: null,
}

export const useAgentStore = create<AgentStore>()(
  immer((set, get) => ({
    ...initialState,

    // Session Actions
    createSession: (name, model) => {
      const session = createDefaultSession(model)
      if (name) session.name = name
      
      set((state) => {
        state.sessions.unshift(session)
        state.activeSessionId = session.id
      })
      
      return session.id
    },

    deleteSession: (id) => {
      set((state) => {
        state.sessions = state.sessions.filter(s => s.id !== id)
        if (state.activeSessionId === id) {
          state.activeSessionId = state.sessions[0]?.id || null
        }
      })
    },

    setActiveSession: (id) => {
      set((state) => {
        state.activeSessionId = id
        state.error = null
      })
    },

    renameSession: (id, name) => {
      set((state) => {
        const session = state.sessions.find(s => s.id === id)
        if (session) {
          session.name = name
          session.updatedAt = Date.now()
        }
      })
    },

    // Message Actions
    addMessage: (sessionId, message) => {
      const fullMessage: ChatMessage = {
        id: nanoid(),
        timestamp: Date.now(),
        ...message,
      }
      
      set((state) => {
        const session = state.sessions.find(s => s.id === sessionId)
        if (session) {
          session.messages.push(fullMessage)
          session.updatedAt = Date.now()
          
          // Auto-name session based on first user message
          if (session.name === 'New Chat' && message.role === 'user') {
            session.name = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
          }
        }
      })
    },

    updateMessage: (sessionId, messageId, content) => {
      set((state) => {
        const session = state.sessions.find(s => s.id === sessionId)
        if (session) {
          const message = session.messages.find(m => m.id === messageId)
          if (message) {
            message.content = content
            message.isStreaming = false
          }
          session.updatedAt = Date.now()
        }
      })
    },

    clearMessages: (sessionId) => {
      set((state) => {
        const session = state.sessions.find(s => s.id === sessionId)
        if (session) {
          session.messages = []
          session.updatedAt = Date.now()
        }
      })
    },

    // Generation Actions
    setGenerating: (isGenerating) => {
      set((state) => {
        state.isGenerating = isGenerating
        if (!isGenerating) {
          state.streamingContent = ''
        }
      })
    },

    setStreamingContent: (content) => {
      set((state) => {
        state.streamingContent = content
      })
    },

    appendStreamingContent: (chunk) => {
      set((state) => {
        state.streamingContent += chunk
      })
    },

    setError: (error) => {
      set((state) => {
        state.error = error
        state.isGenerating = false
      })
    },

    // Model Actions
    setSessionModel: (sessionId, model) => {
      set((state) => {
        const session = state.sessions.find(s => s.id === sessionId)
        if (session) {
          session.model = model
          session.updatedAt = Date.now()
        }
      })
    },

    // Utility
    getActiveSession: () => {
      const state = get()
      return state.sessions.find(s => s.id === state.activeSessionId) || null
    },

    reset: () => {
      set(() => initialState)
    },
  }))
)
