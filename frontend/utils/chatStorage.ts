// Chat history local storage utilities
import { v4 as uuidv4 } from 'uuid';

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

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  lastUpdated: Date;
}

export interface AgentChatHistory {
  agentId: string;
  sessions: Record<string, ChatSession>;
  activeSessionId: string | null;
}

const CHAT_STORAGE_KEY = 'agentChatHistory_v2'
const MAX_MESSAGES_PER_AGENT = 100 // Limit to prevent storage bloat
const MAX_STORAGE_AGE_DAYS = 30 // Auto-clean old conversations

/**
 * Get all chat histories from localStorage
 */
function getAllChatHistories(): Record<string, AgentChatHistory> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!stored) return {}
    
    const parsed = JSON.parse(stored)
    
    // Convert string dates back to Date objects
    Object.keys(parsed).forEach(agentId => {
      const agentHistory = parsed[agentId] as AgentChatHistory;
      if (agentHistory.sessions) {
        Object.values(agentHistory.sessions).forEach(session => {
          session.lastUpdated = new Date(session.lastUpdated);
          session.messages = session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        });
      }
    });
    
    return parsed
  } catch (error) {
    console.error('Error loading chat histories:', error)
    return {}
  }
}

/**
 * Save all chat histories to localStorage
 */
function saveAllChatHistories(histories: Record<string, AgentChatHistory>): void {
  if (typeof window === 'undefined') return;
  try {
    // Clean up old conversations before saving
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - MAX_STORAGE_AGE_DAYS)
    
    const cleanedHistories: Record<string, AgentChatHistory> = {}
    
    Object.keys(histories).forEach(agentId => {
      const agentHistory = histories[agentId];
      const activeSessions: Record<string, ChatSession> = {};

      if (agentHistory.sessions) {
        Object.values(agentHistory.sessions).forEach(session => {
          if (new Date(session.lastUpdated) > cutoffDate) {
            const messages = session.messages.slice(-MAX_MESSAGES_PER_AGENT);
            activeSessions[session.id] = { ...session, messages };
          }
        });
      }

      if (Object.keys(activeSessions).length > 0) {
        cleanedHistories[agentId] = {
          ...agentHistory,
          sessions: activeSessions,
        };
      } else if (!agentHistory.sessions || Object.keys(agentHistory.sessions).length === 0) {
        // Keep agent history if it has no sessions yet
        cleanedHistories[agentId] = agentHistory;
      }
    });
    
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(cleanedHistories))
  } catch (error) {
    console.error('Error saving chat histories:', error)
  }
}

/**
 * Load chat history for a specific agent and session
 */
export function loadChatHistory(agentId: string, sessionId: string): ChatMessage[] {
  const histories = getAllChatHistories();
  const agentHistory = histories[agentId];
  
  if (!agentHistory || !agentHistory.sessions || !agentHistory.sessions[sessionId]) return [];
  
  return agentHistory.sessions[sessionId].messages;
}

/**
 * Save chat history for a specific agent and session
 */
export function saveChatHistory(agentId: string, sessionId: string, messages: ChatMessage[]): void {
  const histories = getAllChatHistories();
  
  if (!histories[agentId]) {
    histories[agentId] = {
      agentId,
      sessions: {},
      activeSessionId: sessionId,
    };
  }

  if (!histories[agentId].sessions) {
    histories[agentId].sessions = {};
  }

  if (!histories[agentId].sessions[sessionId]) {
    histories[agentId].sessions[sessionId] = {
      id: sessionId,
      name: `Chat ${new Date().toLocaleString()}`,
      messages: [],
      lastUpdated: new Date(),
    };
  }
  
  histories[agentId].sessions[sessionId].messages = messages.slice(); // Create a copy
  histories[agentId].sessions[sessionId].lastUpdated = new Date();
  histories[agentId].activeSessionId = sessionId;
  
  saveAllChatHistories(histories);
}

/**
 * Add a single message to an agent's chat history for a specific session
 */
export function addMessageToHistory(agentId: string, sessionId: string, message: ChatMessage): void {
  const currentMessages = loadChatHistory(agentId, sessionId);
  const updatedMessages = [...currentMessages, message];
  saveChatHistory(agentId, sessionId, updatedMessages);
}

/**
 * Update a specific message in an agent's chat history for a specific session
 */
export function updateMessageInHistory(agentId: string, sessionId: string, messageId: string, updates: Partial<ChatMessage>): void {
  const currentMessages = loadChatHistory(agentId, sessionId);
  const updatedMessages = currentMessages.map(msg => 
    msg.id === messageId ? { ...msg, ...updates } : msg
  );
  saveChatHistory(agentId, sessionId, updatedMessages);
}

/**
 * Clear chat history for a specific session
 */
export function clearChatHistory(agentId: string, sessionId: string): void {
  const histories = getAllChatHistories();
  if (histories[agentId] && histories[agentId].sessions && histories[agentId].sessions[sessionId]) {
    histories[agentId].sessions[sessionId].messages = [];
    histories[agentId].sessions[sessionId].lastUpdated = new Date();
    saveAllChatHistories(histories);
  }
}

/**
 * Clear all chat histories for a specific agent
 */
export function clearAgentChatHistory(agentId: string): void {
  const histories = getAllChatHistories()
  delete histories[agentId]
  saveAllChatHistories(histories)
}

/**
 * Get all sessions for an agent
 */
export function getAgentSessions(agentId: string): ChatSession[] {
  const histories = getAllChatHistories();
  const agentHistory = histories[agentId];
  return agentHistory && agentHistory.sessions ? Object.values(agentHistory.sessions).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()) : [];
}

/**
 * Get the active session ID for an agent
 */
export function getActiveSessionId(agentId: string): string | null {
  const histories = getAllChatHistories();
  const agentHistory = histories[agentId];
  if (agentHistory && agentHistory.activeSessionId && agentHistory.sessions && agentHistory.sessions[agentHistory.activeSessionId]) {
    return agentHistory.activeSessionId;
  } else if (agentHistory && agentHistory.sessions && Object.keys(agentHistory.sessions).length > 0) {
    const sortedSessions = Object.values(agentHistory.sessions).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    return sortedSessions[0].id;
  }
  return null;
}

/**
 * Create a new chat session for an agent
 */
export function createNewSession(agentId: string, initialMessage?: ChatMessage): ChatSession {
  const histories = getAllChatHistories();
  if (!histories[agentId]) {
    histories[agentId] = {
      agentId,
      sessions: {},
      activeSessionId: null,
    };
  }

  if (!histories[agentId].sessions) {
    histories[agentId].sessions = {};
  }

  const newSessionId = uuidv4();
  const newSession: ChatSession = {
    id: newSessionId,
    name: `New Chat ${Object.keys(histories[agentId].sessions).length + 1}`,
    messages: initialMessage ? [initialMessage] : [],
    lastUpdated: new Date(),
  };

  histories[agentId].sessions[newSessionId] = newSession;
  histories[agentId].activeSessionId = newSessionId;
  saveAllChatHistories(histories);
  return newSession;
}

/**
 * Delete a chat session for an agent
 */
export function deleteSession(agentId: string, sessionId: string): void {
  const histories = getAllChatHistories();
  if (histories[agentId] && histories[agentId].sessions && histories[agentId].sessions[sessionId]) {
    delete histories[agentId].sessions[sessionId];
    if (histories[agentId].activeSessionId === sessionId) {
      const remainingSessions = Object.values(histories[agentId].sessions).sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
      histories[agentId].activeSessionId = remainingSessions.length > 0 ? remainingSessions[0].id : null;
    }
    saveAllChatHistories(histories);
  }
}

/**
 * Rename a chat session for an agent
 */
export function renameSession(agentId: string, sessionId: string, newName: string): void {
  const histories = getAllChatHistories();
  if (histories[agentId] && histories[agentId].sessions && histories[agentId].sessions[sessionId]) {
    histories[agentId].sessions[sessionId].name = newName;
    histories[agentId].sessions[sessionId].lastUpdated = new Date();
    saveAllChatHistories(histories);
  }
}

/**
 * Clear all chat histories
 */
export function clearAllChatHistories(): void {
  if (typeof window === 'undefined') return;
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
  totalSessions: number;
  storageSize: number // in bytes
} {
  const histories = getAllChatHistories()
  const totalAgents = Object.keys(histories).length
  let totalMessages = 0;
  let totalSessions = 0;
  Object.values(histories).forEach(agentHistory => {
    if (agentHistory.sessions) {
      totalSessions += Object.keys(agentHistory.sessions).length;
      Object.values(agentHistory.sessions).forEach(session => {
        totalMessages += session.messages.length;
      });
    }
  });
  
  let storageSize = 0
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY)
      storageSize = stored ? new Blob([stored]).size : 0
    } catch (error) {
      console.error('Error calculating storage size:', error)
    }
  }
  
  return {
    totalAgents,
    totalMessages,
    totalSessions,
    storageSize
  }
}

/**
 * Export chat history for backup or sharing
 */
export function exportChatHistory(agentId?: string): string {
  const historiesToExport: Record<string, AgentChatHistory> = {};
  const allHistories = getAllChatHistories();

  if (agentId) {
    if (allHistories[agentId]) {
      historiesToExport[agentId] = allHistories[agentId];
    }
  } else {
    Object.assign(historiesToExport, allHistories);
  }
  
  return JSON.stringify(historiesToExport, null, 2)
}

/**
 * Import chat history from backup
 */
export function importChatHistory(jsonData: string): boolean {
  try {
    const importedData = JSON.parse(jsonData);
    const currentHistories = getAllChatHistories();

    for (const agentId in importedData) {
      const agentHistoryToImport = importedData[agentId];
      if (agentHistoryToImport && agentHistoryToImport.sessions) {
        if (!currentHistories[agentId]) {
          currentHistories[agentId] = {
            agentId,
            sessions: {},
            activeSessionId: null,
          };
        }
        // Merge sessions
        for (const sessionId in agentHistoryToImport.sessions) {
          const sessionToImport = agentHistoryToImport.sessions[sessionId];
          // Basic validation
          if (sessionToImport && sessionToImport.id && sessionToImport.messages) {
            currentHistories[agentId].sessions[sessionId] = {
              ...sessionToImport,
              lastUpdated: new Date(sessionToImport.lastUpdated),
              messages: sessionToImport.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
            };
          }
        }
        // Update active session id
        if (agentHistoryToImport.activeSessionId) {
          currentHistories[agentId].activeSessionId = agentHistoryToImport.activeSessionId;
        }
      }
    }
    
    saveAllChatHistories(currentHistories);
    return true;
  } catch (error) {
    console.error('Error importing chat history:', error);
    return false;
  }
}