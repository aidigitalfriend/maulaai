// EnhancedChatBox Logic
// Handles advanced chat features, file uploads, message processing, and AI interactions

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: FileUpload[];
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
    error?: string;
  };
}

export interface FileUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  data?: string; // base64 for images
  status: 'uploading' | 'uploaded' | 'error';
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  currentMessage: string;
  files: FileUpload[];
  error: string | null;
  sessionId: string;
  agentId: string;
}

export interface ChatActions {
  sendMessage: (content: string, files?: FileUpload[]) => Promise<void>;
  addFile: (file: File) => Promise<FileUpload>;
  removeFile: (fileId: string) => void;
  clearChat: () => void;
  loadChatHistory: (sessionId: string) => Promise<void>;
  saveChatHistory: () => Promise<void>;
  stopGeneration: () => void;
}

export class EnhancedChatBoxLogic {
  private state: ChatState;
  private actions: ChatActions;
  private abortController: AbortController | null = null;

  constructor(agentId: string, sessionId: string) {
    this.state = {
      messages: [],
      isLoading: false,
      isStreaming: false,
      currentMessage: '',
      files: [],
      error: null,
      sessionId,
      agentId,
    };

    this.actions = {
      sendMessage: this.sendMessage.bind(this),
      addFile: this.addFile.bind(this),
      removeFile: this.removeFile.bind(this),
      clearChat: this.clearChat.bind(this),
      loadChatHistory: this.loadChatHistory.bind(this),
      saveChatHistory: this.saveChatHistory.bind(this),
      stopGeneration: this.stopGeneration.bind(this),
    };
  }

  async sendMessage(content: string, files?: FileUpload[]): Promise<void> {
    if (!content.trim() && (!files || files.length === 0)) return;

    try {
      this.state.isLoading = true;
      this.state.error = null;

      // Create user message
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        files: files || this.state.files,
      };

      this.state.messages = [...this.state.messages, userMessage];
      this.state.files = []; // Clear files after sending

      // Save immediately
      await this.saveChatHistory();

      // Create abort controller for this request
      this.abortController = new AbortController();

      // Prepare API request
      const requestBody = {
        message: content,
        agentId: this.state.agentId,
        sessionId: this.state.sessionId,
        files: userMessage.files?.map((f) => ({
          name: f.name,
          type: f.type,
          data: f.data,
        })),
        history: this.state.messages.slice(-10), // Last 10 messages for context
      };

      this.state.isStreaming = true;

      const response = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      let assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      this.state.messages = [...this.state.messages, assistantMessage];

      // Read stream chunks
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.content) {
                assistantMessage.content += data.content;
                this.updateLastMessage(assistantMessage.content);
              }

              if (data.metadata) {
                assistantMessage.metadata = {
                  ...assistantMessage.metadata,
                  ...data.metadata,
                };
              }
            } catch (e) {
              console.warn('Failed to parse stream data:', line);
            }
          }
        }
      }

      // Analytics tracking
      this.trackChatEvent('message_sent', {
        agent_id: this.state.agentId,
        session_id: this.state.sessionId,
        has_files: (userMessage.files?.length || 0) > 0,
        message_length: content.length,
        response_length: assistantMessage.content.length,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Message generation was stopped');
        return;
      }

      this.state.error =
        error instanceof Error ? error.message : 'Failed to send message';
      console.error('Chat error:', error);

      // Add error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content:
          'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
        metadata: { error: this.state.error },
      };

      this.state.messages = [...this.state.messages, errorMessage];
    } finally {
      this.state.isLoading = false;
      this.state.isStreaming = false;
      this.abortController = null;
      await this.saveChatHistory();
    }
  }

  async addFile(file: File): Promise<FileUpload> {
    const fileUpload: FileUpload = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'uploading',
    };

    this.state.files = [...this.state.files, fileUpload];

    try {
      // Handle different file types
      if (file.type.startsWith('image/')) {
        // Convert image to base64
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        fileUpload.data = dataUrl;
        fileUpload.status = 'uploaded';
      } else {
        // For other files, you might want to upload to a server
        // For now, just read as text if it's a text file
        if (
          file.type.startsWith('text/') ||
          file.name.endsWith('.md') ||
          file.name.endsWith('.txt')
        ) {
          const text = await file.text();
          fileUpload.data = text;
          fileUpload.status = 'uploaded';
        } else {
          throw new Error(`File type ${file.type} not supported`);
        }
      }

      // Update the file in state
      this.state.files = this.state.files.map((f) =>
        f.id === fileUpload.id ? fileUpload : f
      );

      return fileUpload;
    } catch (error) {
      fileUpload.status = 'error';
      this.state.files = this.state.files.map((f) =>
        f.id === fileUpload.id ? fileUpload : f
      );
      throw error;
    }
  }

  removeFile(fileId: string): void {
    this.state.files = this.state.files.filter((f) => f.id !== fileId);
  }

  clearChat(): void {
    this.state.messages = [];
    this.state.files = [];
    this.state.error = null;

    // Clear from localStorage
    const storageKey = `chat_messages_${this.state.sessionId}`;
    localStorage.removeItem(storageKey);

    this.trackChatEvent('chat_cleared', {
      agent_id: this.state.agentId,
      session_id: this.state.sessionId,
    });
  }

  async loadChatHistory(sessionId: string): Promise<void> {
    try {
      const storageKey = `chat_messages_${sessionId}`;
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        const messages = JSON.parse(stored).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));

        this.state.messages = messages;
        this.state.sessionId = sessionId;
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }

  async saveChatHistory(): Promise<void> {
    try {
      const storageKey = `chat_messages_${this.state.sessionId}`;
      localStorage.setItem(storageKey, JSON.stringify(this.state.messages));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }

  stopGeneration(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.state.isStreaming = false;
    this.state.isLoading = false;
  }

  private updateLastMessage(content: string): void {
    if (this.state.messages.length > 0) {
      const lastMessage = this.state.messages[this.state.messages.length - 1];
      if (lastMessage.role === 'assistant') {
        lastMessage.content = content;
        // Trigger UI update (would need callback mechanism)
      }
    }
  }

  private trackChatEvent(event: string, properties: Record<string, any>): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...properties,
        event_category: 'enhanced_chat',
      });
    }
  }

  getState(): ChatState {
    return { ...this.state };
  }

  getActions(): ChatActions {
    return this.actions;
  }

  setState(updates: Partial<ChatState>): void {
    this.state = { ...this.state, ...updates };
  }
}

export default EnhancedChatBoxLogic;
