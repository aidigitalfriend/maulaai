// Database chat history service - replaces localStorage with MongoDB API calls
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://onelastai.co/api' 
  : 'http://localhost:3005/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative' | null;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  name: string;
  size: number;
  type: string;
  url?: string;
  data?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  lastUpdated: Date;
}

export interface AgentChatHistory {
  userId: string;
  agentId: string;
  sessions: ChatSession[];
  activeSessionId: string | null;
  totalMessages: number;
  lastActivity: Date;
}

class DatabaseChatService {
  // Get chat history for user and agent
  async getChatHistory(userId: string, agentId: string): Promise<AgentChatHistory | null> {
    try {
      const response = await fetch(`${API_BASE}/agent/chat/${userId}/${agentId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chat history: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.transformChatHistory(data.chatHistory);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return null;
    }
  }

  // Create new chat session
  async createSession(
    userId: string, 
    agentId: string, 
    sessionId: string, 
    sessionName?: string, 
    initialMessage?: ChatMessage
  ): Promise<ChatSession | null> {
    try {
      const response = await fetch(`${API_BASE}/agent/chat/${userId}/${agentId}/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          sessionName,
          initialMessage: initialMessage ? this.transformMessageForAPI(initialMessage) : null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create session: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformSession(data.session);
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  }

  // Add message to session
  async addMessage(
    userId: string, 
    agentId: string, 
    sessionId: string, 
    message: ChatMessage
  ): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/agent/chat/${userId}/${agentId}/session/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.transformMessageForAPI(message)),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to add message: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error adding message:', error);
      return false;
    }
  }

  // Get specific session
  async getSession(userId: string, agentId: string, sessionId: string): Promise<ChatSession | null> {
    try {
      const response = await fetch(`${API_BASE}/agent/chat/${userId}/${agentId}/session/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch session: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.transformSession(data.session);
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  }

  // Update session name
  async renameSession(
    userId: string, 
    agentId: string, 
    sessionId: string, 
    newName: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/agent/chat/${userId}/${agentId}/session/${sessionId}/name`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to rename session: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error renaming session:', error);
      return false;
    }
  }

  // Set active session
  async setActiveSession(userId: string, agentId: string, sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/agent/chat/${userId}/${agentId}/active-session`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to set active session: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error setting active session:', error);
      return false;
    }
  }

  // Delete session
  async deleteSession(userId: string, agentId: string, sessionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/agent/chat/${userId}/${agentId}/session/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete session: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  // Update message feedback
  async updateMessageFeedback(
    userId: string,
    agentId: string, 
    sessionId: string, 
    messageId: string, 
    feedback: 'positive' | 'negative' | null
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE}/agent/chat/${userId}/${agentId}/session/${sessionId}/message/${messageId}/feedback`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ feedback }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update feedback: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating feedback:', error);
      return false;
    }
  }

  // Bulk import sessions from localStorage (migration helper)
  async bulkImportSessions(
    userId: string, 
    agentId: string, 
    sessions: ChatSession[]
  ): Promise<boolean> {
    try {
      const transformedSessions = sessions.map(session => ({
        sessionId: session.id,
        name: session.name,
        messages: session.messages.map(msg => this.transformMessageForAPI(msg)),
        lastUpdated: session.lastUpdated
      }));

      const response = await fetch(`${API_BASE}/agent/chat/${userId}/${agentId}/bulk-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessions: transformedSessions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to bulk import: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error bulk importing sessions:', error);
      return false;
    }
  }

  // Get recent activity across all agents for user
  async getRecentActivity(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE}/agent/chat/user/${userId}/recent?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recent activity: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.recentActivity || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }

  // Transform database chat history to frontend format
  private transformChatHistory(dbHistory: any): AgentChatHistory {
    return {
      userId: dbHistory.userId,
      agentId: dbHistory.agentId,
      sessions: dbHistory.sessions.map((session: any) => this.transformSession(session)),
      activeSessionId: dbHistory.activeSessionId,
      totalMessages: dbHistory.totalMessages || 0,
      lastActivity: new Date(dbHistory.lastActivity)
    };
  }

  // Transform database session to frontend format
  private transformSession(dbSession: any): ChatSession {
    return {
      id: dbSession.sessionId,
      name: dbSession.name,
      messages: dbSession.messages.map((msg: any) => ({
        id: msg.messageId,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        feedback: msg.feedback,
        attachments: msg.attachments || []
      })),
      lastUpdated: new Date(dbSession.lastUpdated)
    };
  }

  // Transform frontend message to API format
  private transformMessageForAPI(message: ChatMessage) {
    return {
      messageId: message.id,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp.toISOString(),
      feedback: message.feedback,
      attachments: message.attachments || []
    };
  }
}

export const databaseChatService = new DatabaseChatService();