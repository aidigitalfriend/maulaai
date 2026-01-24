import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import type { AgentState, AgentSession, ChatMessage, ModelOption } from '../types'

// Available AI Models - Using LATEST versions for best quality
export const AVAILABLE_MODELS: ModelOption[] = [
  // Anthropic Claude Models - Latest Claude 4 series
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    description: 'Best for coding - latest & most capable',
    icon: '🎭',
    maxTokens: 16384,
  },
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    description: 'Most powerful Claude model ever',
    icon: '🎯',
    maxTokens: 8192,
  },
  
  // OpenAI Models - Latest GPT-4o and o1
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Most capable multimodal model',
    icon: '🌟',
    maxTokens: 16384,
  },
  {
    id: 'o1',
    name: 'o1 Reasoning',
    provider: 'OpenAI',
    description: 'Advanced reasoning capabilities',
    icon: '🧠',
    maxTokens: 32768,
  },
  
  // Google Gemini Models - Latest 2.0 series
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: 'Fast and highly capable',
    icon: '⚡',
    maxTokens: 32768,
  },
  {
    id: 'gemini-2.0-flash-thinking',
    name: 'Gemini 2.0 Thinking',
    provider: 'Google',
    description: 'Advanced reasoning mode',
    icon: '💭',
    maxTokens: 32768,
  },
  
  // Groq Models (Ultra-Fast Inference)
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
  
  // xAI Grok - Latest
  {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xAI',
    description: 'Strong reasoning and coding',
    icon: '🚀',
    maxTokens: 8192,
  },
  
  // Mistral Models - Latest
  {
    id: 'codestral-latest',
    name: 'Codestral',
    provider: 'Mistral',
    description: 'Specialized for code generation',
    icon: '💻',
    maxTokens: 16384,
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
