// AgentChatPanel Logic
// Handles chat session management, localStorage operations, and panel interactions

export interface ChatSession {
  id: string;
  name: string;
  agentId: string;
  createdAt: Date;
  lastMessageAt: Date;
  messageCount: number;
}

export interface ChatPanelState {
  isLoading: boolean;
  isRenamingSession: string | null;
  openMenuId: string | null;
  sessions: ChatSession[];
}

export interface ChatPanelActions {
  loadSessions: (agentId: string) => Promise<ChatSession[]>;
  createNewSession: (agentId: string, agentName: string) => Promise<string>;
  renameSession: (sessionId: string, newName: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  exportSession: (sessionId: string) => Promise<void>;
  shareSession: (sessionId: string) => Promise<void>;
}

export class AgentChatPanelLogic {
  private state: ChatPanelState;
  private actions: ChatPanelActions;

  constructor() {
    this.state = {
      isLoading: false,
      isRenamingSession: null,
      openMenuId: null,
      sessions: [],
    };

    this.actions = {
      loadSessions: this.loadSessions.bind(this),
      createNewSession: this.createNewSession.bind(this),
      renameSession: this.renameSession.bind(this),
      deleteSession: this.deleteSession.bind(this),
      exportSession: this.exportSession.bind(this),
      shareSession: this.shareSession.bind(this),
    };
  }

  async loadSessions(agentId: string): Promise<ChatSession[]> {
    try {
      this.state.isLoading = true;

      // Load from localStorage first
      const storageKey = `chat_sessions_${agentId}`;
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        const sessions = JSON.parse(stored).map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          lastMessageAt: new Date(session.lastMessageAt),
        }));

        this.state.sessions = sessions;
        return sessions;
      }

      // If no sessions, create a default one
      const defaultSession = await this.createNewSession(agentId, 'New Chat');
      return [defaultSession];
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      return [];
    } finally {
      this.state.isLoading = false;
    }
  }

  async createNewSession(
    agentId: string,
    agentName: string
  ): Promise<ChatSession> {
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const now = new Date();

    const newSession: ChatSession = {
      id: sessionId,
      name: `Chat with ${agentName}`,
      agentId,
      createdAt: now,
      lastMessageAt: now,
      messageCount: 0,
    };

    this.state.sessions = [newSession, ...this.state.sessions];
    await this.saveSessions(agentId);

    // Analytics tracking
    this.trackSessionEvent('session_created', sessionId, agentId);

    return newSession;
  }

  async renameSession(sessionId: string, newName: string): Promise<void> {
    const sessionIndex = this.state.sessions.findIndex(
      (s) => s.id === sessionId
    );
    if (sessionIndex === -1) return;

    this.state.sessions[sessionIndex].name = newName;
    const agentId = this.state.sessions[sessionIndex].agentId;

    await this.saveSessions(agentId);
    this.trackSessionEvent('session_renamed', sessionId, agentId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    const session = this.state.sessions.find((s) => s.id === sessionId);
    if (!session) return;

    this.state.sessions = this.state.sessions.filter((s) => s.id !== sessionId);

    // Also remove chat messages for this session
    const messagesKey = `chat_messages_${sessionId}`;
    localStorage.removeItem(messagesKey);

    await this.saveSessions(session.agentId);
    this.trackSessionEvent('session_deleted', sessionId, session.agentId);
  }

  async exportSession(sessionId: string): Promise<void> {
    const session = this.state.sessions.find((s) => s.id === sessionId);
    if (!session) return;

    try {
      // Load messages for this session
      const messagesKey = `chat_messages_${sessionId}`;
      const messages = JSON.parse(localStorage.getItem(messagesKey) || '[]');

      const exportData = {
        session,
        messages,
        exportedAt: new Date().toISOString(),
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-${session.name}-${session.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.trackSessionEvent('session_exported', sessionId, session.agentId);
    } catch (error) {
      console.error('Failed to export session:', error);
    }
  }

  async shareSession(sessionId: string): Promise<void> {
    const session = this.state.sessions.find((s) => s.id === sessionId);
    if (!session) return;

    try {
      // Generate a shareable link (would need backend support)
      const shareUrl = `${window.location.origin}/shared-chat/${sessionId}`;

      if (navigator.share) {
        await navigator.share({
          title: `Chat: ${session.name}`,
          url: shareUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        // Would show a toast notification here
        console.log('Chat link copied to clipboard');
      }

      this.trackSessionEvent('session_shared', sessionId, session.agentId);
    } catch (error) {
      console.error('Failed to share session:', error);
    }
  }

  private async saveSessions(agentId: string): Promise<void> {
    const storageKey = `chat_sessions_${agentId}`;
    const sessionsToSave = this.state.sessions.filter(
      (s) => s.agentId === agentId
    );
    localStorage.setItem(storageKey, JSON.stringify(sessionsToSave));
  }

  private trackSessionEvent(
    event: string,
    sessionId: string,
    agentId: string
  ): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        session_id: sessionId,
        agent_id: agentId,
        event_category: 'chat_management',
      });
    }
  }

  updateSessionActivity(sessionId: string): void {
    const sessionIndex = this.state.sessions.findIndex(
      (s) => s.id === sessionId
    );
    if (sessionIndex !== -1) {
      this.state.sessions[sessionIndex].lastMessageAt = new Date();
      this.state.sessions[sessionIndex].messageCount += 1;
    }
  }

  getState(): ChatPanelState {
    return { ...this.state };
  }

  getActions(): ChatPanelActions {
    return this.actions;
  }

  setState(updates: Partial<ChatPanelState>): void {
    this.state = { ...this.state, ...updates };
  }
}

export default AgentChatPanelLogic;
