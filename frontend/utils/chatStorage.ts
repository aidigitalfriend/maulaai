// Chat history local storage utilities

export interface FileAttachment {
  name: string
  size: number
  type: string
  url?: string
  data?: string // Base64 encoded file data
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  feedback?: 'positive' | 'negative' | null
  isStreaming?: boolean
  streamingComplete?: boolean
  attachments?: FileAttachment[]
}

export interface ChatHistory {
  agentId: string
  messages: ChatMessage[]
  lastUpdated: Date
}

const CHAT_STORAGE_KEY = 'agentChatHistory'
const MAX_MESSAGES_PER_AGENT = 100 // Limit to prevent storage bloat
const MAX_STORAGE_AGE_DAYS = 30 // Auto-clean old conversations

/**
 * Get all chat histories from localStorage
 */
function getAllChatHistories(): Record<string, ChatHistory> {
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!stored) return {}
    
    const parsed = JSON.parse(stored)
    
    // Convert string dates back to Date objects
    Object.keys(parsed).forEach(agentId => {
      const history = parsed[agentId]
      history.lastUpdated = new Date(history.lastUpdated)
      history.messages = history.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    })
    
    return parsed
  } catch (error) {
    console.error('Error loading chat histories:', error)
    return {}
  }
}

/**
 * Save all chat histories to localStorage
 */
function saveAllChatHistories(histories: Record<string, ChatHistory>): void {
  try {
    // Clean up old conversations before saving
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - MAX_STORAGE_AGE_DAYS)
    
    const cleanedHistories: Record<string, ChatHistory> = {}
    
    Object.keys(histories).forEach(agentId => {
      const history = histories[agentId]
      if (history.lastUpdated > cutoffDate) {
        // Limit messages per agent
        const messages = history.messages.slice(-MAX_MESSAGES_PER_AGENT)
        cleanedHistories[agentId] = {
          ...history,
          messages
        }
      }
    })
    
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(cleanedHistories))
  } catch (error) {
    console.error('Error saving chat histories:', error)
  }
}

/**
 * Load chat history for a specific agent
 */
export function loadChatHistory(agentId: string): ChatMessage[] {
  const histories = getAllChatHistories()
  const history = histories[agentId]
  
  if (!history) return []
  
  return history.messages
}

/**
 * Save chat history for a specific agent
 */
export function saveChatHistory(agentId: string, messages: ChatMessage[]): void {
  const histories = getAllChatHistories()
  
  histories[agentId] = {
    agentId,
    messages: messages.slice(), // Create a copy
    lastUpdated: new Date()
  }
  
  saveAllChatHistories(histories)
}

/**
 * Add a single message to an agent's chat history
 */
export function addMessageToHistory(agentId: string, message: ChatMessage): void {
  const currentMessages = loadChatHistory(agentId)
  const updatedMessages = [...currentMessages, message]
  saveChatHistory(agentId, updatedMessages)
}

/**
 * Update a specific message in an agent's chat history (useful for feedback updates)
 */
export function updateMessageInHistory(agentId: string, messageId: string, updates: Partial<ChatMessage>): void {
  const currentMessages = loadChatHistory(agentId)
  const updatedMessages = currentMessages.map(msg => 
    msg.id === messageId ? { ...msg, ...updates } : msg
  )
  saveChatHistory(agentId, updatedMessages)
}

/**
 * Clear chat history for a specific agent
 */
export function clearChatHistory(agentId: string): void {
  const histories = getAllChatHistories()
  delete histories[agentId]
  saveAllChatHistories(histories)
}

/**
 * Clear all chat histories
 */
export function clearAllChatHistories(): void {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing chat histories:', error)
  }
}

/**
 * Get storage usage statistics
 */
export function getChatStorageInfo(): {
  totalAgents: number
  totalMessages: number
  storageSize: number // in bytes
} {
  const histories = getAllChatHistories()
  const totalAgents = Object.keys(histories).length
  const totalMessages = Object.values(histories).reduce((sum, history) => sum + history.messages.length, 0)
  
  let storageSize = 0
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY)
    storageSize = stored ? new Blob([stored]).size : 0
  } catch (error) {
    console.error('Error calculating storage size:', error)
  }
  
  return {
    totalAgents,
    totalMessages,
    storageSize
  }
}

/**
 * Export chat history for backup or sharing
 */
export function exportChatHistory(agentId?: string): string {
  if (agentId) {
    const messages = loadChatHistory(agentId)
    return JSON.stringify({ [agentId]: messages }, null, 2)
  }
  
  const allHistories = getAllChatHistories()
  return JSON.stringify(allHistories, null, 2)
}

/**
 * Import chat history from backup
 */
export function importChatHistory(jsonData: string): boolean {
  try {
    const importedData = JSON.parse(jsonData)
    const currentHistories = getAllChatHistories()
    
    // Merge imported data with current data
    Object.keys(importedData).forEach(agentId => {
      const importedHistory = importedData[agentId]
      if (Array.isArray(importedHistory)) {
        // Legacy format - just messages array
        currentHistories[agentId] = {
          agentId,
          messages: importedHistory.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })),
          lastUpdated: new Date()
        }
      } else if (importedHistory.messages) {
        // New format - full history object
        currentHistories[agentId] = {
          ...importedHistory,
          messages: importedHistory.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })),
          lastUpdated: new Date(importedHistory.lastUpdated)
        }
      }
    })
    
    saveAllChatHistories(currentHistories)
    return true
  } catch (error) {
    console.error('Error importing chat history:', error)
    return false
  }
}