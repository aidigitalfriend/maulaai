/**
 * AgentPageLayout Logic - Agent Components Module
 * Handles agent page layout state, session management, and panel coordination
 */

export interface AgentPageLayoutState {
  isLoading: boolean;
  error: string | null;
  agentId: string;
  agentName: string;
  isLeftPanelVisible: boolean;
  isRightPanelVisible: boolean;
  leftPanelWidth: number;
  rightPanelWidth: number;
  isMobile: boolean;
  activeView: 'chat' | 'settings' | 'details' | 'analytics';
  sessions: AgentSession[];
  activeSessionId: string | null;
  sessionStats: SessionStats;
  layoutPreferences: LayoutPreferences;
}

export interface AgentSession {
  id: string;
  name: string;
  agentId: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
  isActive: boolean;
  metadata: SessionMetadata;
  tags: string[];
  summary?: string;
}

export interface SessionMetadata {
  userAgent: string;
  sessionDuration: number;
  messageTypes: Record<string, number>;
  satisfaction?: number;
  lastActivity: string;
  clientInfo: {
    browser: string;
    os: string;
    device: string;
  };
}

export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  averageSessionLength: number;
  totalMessages: number;
  averageMessagesPerSession: number;
  sessionsByDay: Record<string, number>;
  mostActiveHour: number;
  satisfactionAverage: number;
}

export interface LayoutPreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  showTimestamps: boolean;
  showAvatars: boolean;
  panelAnimations: boolean;
  autoSave: boolean;
  keyboardShortcuts: boolean;
  compactMode: boolean;
  sidebarPosition: 'left' | 'right';
  chatPosition: 'center' | 'left' | 'right';
}

export interface AgentPageLayoutActions {
  initializeLayout: (agentId: string, agentName: string) => Promise<void>;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  resizePanel: (panel: 'left' | 'right', width: number) => void;
  setActiveView: (view: 'chat' | 'settings' | 'details' | 'analytics') => void;
  loadSessions: (agentId: string) => Promise<AgentSession[]>;
  createNewSession: (agentId: string, name?: string) => Promise<string>;
  selectSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => Promise<void>;
  renameSession: (sessionId: string, newName: string) => Promise<void>;
  duplicateSession: (sessionId: string) => Promise<string>;
  exportSession: (
    sessionId: string,
    format: 'json' | 'txt' | 'pdf'
  ) => Promise<void>;
  importSession: (data: any) => Promise<string>;
  updatePreferences: (preferences: Partial<LayoutPreferences>) => Promise<void>;
}

export class AgentPageLayoutLogic {
  private state: AgentPageLayoutState;
  private actions: AgentPageLayoutActions;
  private resizeObserver: ResizeObserver | null = null;
  private keyboardShortcuts: Record<string, () => void> = {};

  constructor() {
    this.state = {
      isLoading: false,
      error: null,
      agentId: '',
      agentName: '',
      isLeftPanelVisible: true,
      isRightPanelVisible: false,
      leftPanelWidth: 300,
      rightPanelWidth: 350,
      isMobile: false,
      activeView: 'chat',
      sessions: [],
      activeSessionId: null,
      sessionStats: {
        totalSessions: 0,
        activeSessions: 0,
        averageSessionLength: 0,
        totalMessages: 0,
        averageMessagesPerSession: 0,
        sessionsByDay: {},
        mostActiveHour: 0,
        satisfactionAverage: 0,
      },
      layoutPreferences: {
        theme: 'auto',
        fontSize: 'medium',
        showTimestamps: true,
        showAvatars: true,
        panelAnimations: true,
        autoSave: true,
        keyboardShortcuts: true,
        compactMode: false,
        sidebarPosition: 'left',
        chatPosition: 'center',
      },
    };

    this.actions = {
      initializeLayout: this.initializeLayout.bind(this),
      toggleLeftPanel: this.toggleLeftPanel.bind(this),
      toggleRightPanel: this.toggleRightPanel.bind(this),
      resizePanel: this.resizePanel.bind(this),
      setActiveView: this.setActiveView.bind(this),
      loadSessions: this.loadSessions.bind(this),
      createNewSession: this.createNewSession.bind(this),
      selectSession: this.selectSession.bind(this),
      deleteSession: this.deleteSession.bind(this),
      renameSession: this.renameSession.bind(this),
      duplicateSession: this.duplicateSession.bind(this),
      exportSession: this.exportSession.bind(this),
      importSession: this.importSession.bind(this),
      updatePreferences: this.updatePreferences.bind(this),
    };

    this.initializeEventListeners();
    this.loadLayoutPreferences();
  }

  /**
   * Initialize agent page layout
   */
  async initializeLayout(agentId: string, agentName: string): Promise<void> {
    this.state.isLoading = true;
    this.state.error = null;
    this.state.agentId = agentId;
    this.state.agentName = agentName;

    try {
      // Load agent-specific preferences
      await this.loadAgentPreferences(agentId);

      // Load sessions for this agent
      const sessions = await this.loadSessions(agentId);

      // Calculate session statistics
      this.calculateSessionStats();

      // Set up responsive layout
      this.checkMobileLayout();

      // Initialize keyboard shortcuts if enabled
      if (this.state.layoutPreferences.keyboardShortcuts) {
        this.initializeKeyboardShortcuts();
      }

      this.trackLayoutEvent('layout_initialized', {
        agentId,
        agentName,
        sessionCount: sessions.length,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to initialize layout';
      this.state.error = message;
    } finally {
      this.state.isLoading = false;
    }
  }

  /**
   * Toggle left panel visibility
   */
  toggleLeftPanel(): void {
    this.state.isLeftPanelVisible = !this.state.isLeftPanelVisible;

    // Auto-hide on mobile when opening right panel
    if (this.state.isMobile && this.state.isRightPanelVisible) {
      this.state.isRightPanelVisible = false;
    }

    this.saveLayoutPreferences();
    this.trackLayoutEvent('left_panel_toggled', {
      visible: this.state.isLeftPanelVisible,
    });
  }

  /**
   * Toggle right panel visibility
   */
  toggleRightPanel(): void {
    this.state.isRightPanelVisible = !this.state.isRightPanelVisible;

    // Auto-hide on mobile when opening left panel
    if (this.state.isMobile && this.state.isLeftPanelVisible) {
      this.state.isLeftPanelVisible = false;
    }

    this.saveLayoutPreferences();
    this.trackLayoutEvent('right_panel_toggled', {
      visible: this.state.isRightPanelVisible,
    });
  }

  /**
   * Resize panel width
   */
  resizePanel(panel: 'left' | 'right', width: number): void {
    const minWidth = 200;
    const maxWidth = 600;
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, width));

    if (panel === 'left') {
      this.state.leftPanelWidth = clampedWidth;
    } else {
      this.state.rightPanelWidth = clampedWidth;
    }

    this.saveLayoutPreferences();
  }

  /**
   * Set active view
   */
  setActiveView(view: 'chat' | 'settings' | 'details' | 'analytics'): void {
    this.state.activeView = view;

    this.trackLayoutEvent('view_changed', { view });
  }

  /**
   * Load sessions for agent
   */
  async loadSessions(agentId: string): Promise<AgentSession[]> {
    try {
      const response = await fetch(`/api/agents/${agentId}/sessions`);

      if (!response.ok) {
        throw new Error('Failed to load sessions');
      }

      const data = await response.json();
      const sessions = data.sessions || [];

      // Sort sessions by last activity
      sessions.sort(
        (a: AgentSession, b: AgentSession) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
      );

      this.state.sessions = sessions;

      // Set active session if none selected
      if (!this.state.activeSessionId && sessions.length > 0) {
        this.state.activeSessionId = sessions[0].id;
      }

      return sessions;
    } catch (error) {
      console.error('Error loading sessions:', error);
      this.state.error = 'Failed to load chat sessions';
      return [];
    }
  }

  /**
   * Create new chat session
   */
  async createNewSession(agentId: string, name?: string): Promise<string> {
    try {
      const sessionName = name || `Chat ${this.state.sessions.length + 1}`;

      const response = await fetch(`/api/agents/${agentId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sessionName,
          agentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create session');
      }

      const newSession = data.session;
      this.state.sessions.unshift(newSession);
      this.state.activeSessionId = newSession.id;

      this.trackLayoutEvent('session_created', {
        sessionId: newSession.id,
        agentId,
        sessionName,
      });

      return newSession.id;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create session';
      this.state.error = message;
      throw new Error(message);
    }
  }

  /**
   * Select chat session
   */
  selectSession(sessionId: string): void {
    this.state.activeSessionId = sessionId;

    // Mark session as active
    this.state.sessions.forEach((session) => {
      session.isActive = session.id === sessionId;
    });

    this.trackLayoutEvent('session_selected', { sessionId });
  }

  /**
   * Delete chat session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`/api/agents/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      // Remove from state
      this.state.sessions = this.state.sessions.filter(
        (session) => session.id !== sessionId
      );

      // Update active session if deleted
      if (this.state.activeSessionId === sessionId) {
        this.state.activeSessionId =
          this.state.sessions.length > 0 ? this.state.sessions[0].id : null;
      }

      this.calculateSessionStats();

      this.trackLayoutEvent('session_deleted', { sessionId });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete session';
      this.state.error = message;
      throw new Error(message);
    }
  }

  /**
   * Rename chat session
   */
  async renameSession(sessionId: string, newName: string): Promise<void> {
    try {
      const response = await fetch(`/api/agents/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename session');
      }

      // Update in state
      const session = this.state.sessions.find((s) => s.id === sessionId);
      if (session) {
        session.name = newName;
      }

      this.trackLayoutEvent('session_renamed', {
        sessionId,
        newName,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to rename session';
      this.state.error = message;
      throw new Error(message);
    }
  }

  /**
   * Duplicate chat session
   */
  async duplicateSession(sessionId: string): Promise<string> {
    try {
      const response = await fetch(
        `/api/agents/sessions/${sessionId}/duplicate`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to duplicate session');
      }

      const newSession = data.session;
      this.state.sessions.unshift(newSession);

      this.trackLayoutEvent('session_duplicated', {
        originalSessionId: sessionId,
        newSessionId: newSession.id,
      });

      return newSession.id;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to duplicate session';
      this.state.error = message;
      throw new Error(message);
    }
  }

  /**
   * Export chat session
   */
  async exportSession(
    sessionId: string,
    format: 'json' | 'txt' | 'pdf'
  ): Promise<void> {
    try {
      const response = await fetch(
        `/api/agents/sessions/${sessionId}/export?format=${format}`
      );

      if (!response.ok) {
        throw new Error('Failed to export session');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `session-${sessionId}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);

      this.trackLayoutEvent('session_exported', {
        sessionId,
        format,
      });
    } catch (error) {
      console.error('Export failed:', error);
      this.state.error = 'Failed to export session';
    }
  }

  /**
   * Import chat session
   */
  async importSession(data: any): Promise<string> {
    try {
      const response = await fetch(
        `/api/agents/${this.state.agentId}/sessions/import`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to import session');
      }

      const importedSession = result.session;
      this.state.sessions.unshift(importedSession);

      this.trackLayoutEvent('session_imported', {
        sessionId: importedSession.id,
      });

      return importedSession.id;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to import session';
      this.state.error = message;
      throw new Error(message);
    }
  }

  /**
   * Update layout preferences
   */
  async updatePreferences(
    preferences: Partial<LayoutPreferences>
  ): Promise<void> {
    this.state.layoutPreferences = {
      ...this.state.layoutPreferences,
      ...preferences,
    };

    // Apply theme changes immediately
    if (preferences.theme) {
      this.applyTheme(preferences.theme);
    }

    // Update keyboard shortcuts
    if (preferences.keyboardShortcuts !== undefined) {
      if (preferences.keyboardShortcuts) {
        this.initializeKeyboardShortcuts();
      } else {
        this.removeKeyboardShortcuts();
      }
    }

    // Save to backend
    try {
      await fetch(`/api/agents/${this.state.agentId}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.state.layoutPreferences),
      });

      this.saveLayoutPreferences();

      this.trackLayoutEvent('preferences_updated', {
        changes: Object.keys(preferences),
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  /**
   * Private helper methods
   */
  private async loadAgentPreferences(agentId: string): Promise<void> {
    try {
      const response = await fetch(`/api/agents/${agentId}/preferences`);

      if (response.ok) {
        const data = await response.json();
        this.state.layoutPreferences = {
          ...this.state.layoutPreferences,
          ...data.preferences,
        };
      }
    } catch (error) {
      console.error('Error loading agent preferences:', error);
    }
  }

  private loadLayoutPreferences(): void {
    try {
      const saved = localStorage.getItem('agentLayoutPreferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        this.state.layoutPreferences = {
          ...this.state.layoutPreferences,
          ...preferences,
        };
      }
    } catch (error) {
      console.error('Error loading layout preferences:', error);
    }
  }

  private saveLayoutPreferences(): void {
    try {
      localStorage.setItem(
        'agentLayoutPreferences',
        JSON.stringify({
          ...this.state.layoutPreferences,
          leftPanelWidth: this.state.leftPanelWidth,
          rightPanelWidth: this.state.rightPanelWidth,
          isLeftPanelVisible: this.state.isLeftPanelVisible,
          isRightPanelVisible: this.state.isRightPanelVisible,
        })
      );
    } catch (error) {
      console.error('Error saving layout preferences:', error);
    }
  }

  private calculateSessionStats(): void {
    const sessions = this.state.sessions;

    if (sessions.length === 0) return;

    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    // Calculate basic stats
    this.state.sessionStats = {
      totalSessions: sessions.length,
      activeSessions: sessions.filter((s) => s.isActive).length,
      averageSessionLength:
        sessions.reduce((sum, s) => sum + s.metadata.sessionDuration, 0) /
        sessions.length,
      totalMessages: sessions.reduce((sum, s) => sum + s.messageCount, 0),
      averageMessagesPerSession:
        sessions.reduce((sum, s) => sum + s.messageCount, 0) / sessions.length,
      sessionsByDay: this.groupSessionsByDay(sessions),
      mostActiveHour: this.getMostActiveHour(sessions),
      satisfactionAverage: this.getAverageSatisfaction(sessions),
    };
  }

  private groupSessionsByDay(sessions: AgentSession[]): Record<string, number> {
    return sessions.reduce((acc, session) => {
      const date = new Date(session.createdAt).toDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private getMostActiveHour(sessions: AgentSession[]): number {
    const hourCounts = new Array(24).fill(0);

    sessions.forEach((session) => {
      const hour = new Date(session.lastMessageAt).getHours();
      hourCounts[hour]++;
    });

    return hourCounts.indexOf(Math.max(...hourCounts));
  }

  private getAverageSatisfaction(sessions: AgentSession[]): number {
    const withSatisfaction = sessions.filter(
      (s) => s.metadata.satisfaction !== undefined
    );
    if (withSatisfaction.length === 0) return 0;

    return (
      withSatisfaction.reduce(
        (sum, s) => sum + (s.metadata.satisfaction || 0),
        0
      ) / withSatisfaction.length
    );
  }

  private initializeEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Window resize listener
    this.resizeObserver = new ResizeObserver(() => {
      this.checkMobileLayout();
    });

    if (document.body) {
      this.resizeObserver.observe(document.body);
    }

    // Visibility change listener
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // Refresh sessions when page becomes visible
        this.loadSessions(this.state.agentId);
      }
    });
  }

  private checkMobileLayout(): void {
    const isMobile = window.innerWidth < 768;

    if (isMobile !== this.state.isMobile) {
      this.state.isMobile = isMobile;

      // Auto-adjust panels for mobile
      if (isMobile) {
        this.state.leftPanelWidth = Math.min(this.state.leftPanelWidth, 280);
        this.state.rightPanelWidth = Math.min(this.state.rightPanelWidth, 300);

        // Only show one panel at a time on mobile
        if (this.state.isLeftPanelVisible && this.state.isRightPanelVisible) {
          this.state.isRightPanelVisible = false;
        }
      }
    }
  }

  private initializeKeyboardShortcuts(): void {
    if (typeof window === 'undefined') return;

    this.keyboardShortcuts = {
      Escape: () => {
        if (this.state.isRightPanelVisible) {
          this.toggleRightPanel();
        }
      },
      'ctrl+b': () => this.toggleLeftPanel(),
      'ctrl+shift+b': () => this.toggleRightPanel(),
      'ctrl+n': () => this.createNewSession(this.state.agentId),
      'ctrl+1': () => this.setActiveView('chat'),
      'ctrl+2': () => this.setActiveView('settings'),
      'ctrl+3': () => this.setActiveView('details'),
      'ctrl+4': () => this.setActiveView('analytics'),
    };

    document.addEventListener(
      'keydown',
      this.handleKeyboardShortcut.bind(this)
    );
  }

  private removeKeyboardShortcuts(): void {
    if (typeof window === 'undefined') return;

    document.removeEventListener(
      'keydown',
      this.handleKeyboardShortcut.bind(this)
    );
    this.keyboardShortcuts = {};
  }

  private handleKeyboardShortcut(event: KeyboardEvent): void {
    const key = event.key;
    const modifiers = [];

    if (event.ctrlKey || event.metaKey) modifiers.push('ctrl');
    if (event.shiftKey) modifiers.push('shift');
    if (event.altKey) modifiers.push('alt');

    const shortcut =
      modifiers.length > 0
        ? `${modifiers.join('+')}+${key.toLowerCase()}`
        : key;

    if (this.keyboardShortcuts[shortcut]) {
      event.preventDefault();
      this.keyboardShortcuts[shortcut]();
    }
  }

  private applyTheme(theme: 'light' | 'dark' | 'auto'): void {
    if (typeof window === 'undefined') return;

    let appliedTheme = theme;

    if (theme === 'auto') {
      appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    document.documentElement.classList.toggle('dark', appliedTheme === 'dark');
  }

  private trackLayoutEvent(
    event: string,
    properties?: Record<string, any>
  ): void {
    try {
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('Agent Layout', {
          event,
          agentId: this.state.agentId,
          timestamp: new Date().toISOString(),
          ...properties,
        });
      }
    } catch (error) {
      console.error('Error tracking layout event:', error);
    }
  }

  /**
   * Public getters
   */
  getState(): AgentPageLayoutState {
    return { ...this.state };
  }

  getActions(): AgentPageLayoutActions {
    return this.actions;
  }

  getSessions(): AgentSession[] {
    return [...this.state.sessions];
  }

  getActiveSession(): AgentSession | null {
    return (
      this.state.sessions.find(
        (session) => session.id === this.state.activeSessionId
      ) || null
    );
  }

  getSessionStats(): SessionStats {
    return { ...this.state.sessionStats };
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.state.error = null;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.removeKeyboardShortcuts();
  }
}

// Export singleton instance
export const agentPageLayoutLogic = new AgentPageLayoutLogic();

// Export utility functions
export const agentLayoutUtils = {
  /**
   * Format session duration
   */
  formatSessionDuration(duration: number): string {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  },

  /**
   * Get session age
   */
  getSessionAge(createdAt: string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  },

  /**
   * Get panel width CSS
   */
  getPanelWidthCSS(width: number, visible: boolean): React.CSSProperties {
    return {
      width: visible ? `${width}px` : '0px',
      minWidth: visible ? `${Math.min(width, 200)}px` : '0px',
      maxWidth: visible ? `${Math.max(width, 600)}px` : '0px',
      overflow: 'hidden',
      transition: 'width 0.3s ease-in-out',
    };
  },

  /**
   * Get view icon
   */
  getViewIcon(view: string): string {
    const icons = {
      chat: '💬',
      settings: '⚙️',
      details: 'ℹ️',
      analytics: '📊',
    };
    return icons[view as keyof typeof icons] || '❓';
  },

  /**
   * Validate session name
   */
  validateSessionName(name: string): { isValid: boolean; error?: string } {
    if (!name.trim()) {
      return { isValid: false, error: 'Session name cannot be empty' };
    }

    if (name.length > 100) {
      return {
        isValid: false,
        error: 'Session name too long (max 100 characters)',
      };
    }

    return { isValid: true };
  },
};
