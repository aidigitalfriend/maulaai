// Real-time Chat Service with streaming support
const API_BASE =
  process.env.NODE_ENV === 'production'
    ? 'https://maula.ai/api'
    : '/api';  // Use relative path for local dev to avoid port issues

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative' | null;
  isStreaming?: boolean;
  codeBlocks?: CodeBlock[];
}

export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  agentId: string;
  model?: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  provider: 'mistral' | 'gemini' | 'openai';
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: (fullMessage: string) => void;
  onError: (error: Error) => void;
  onCodeBlock?: (codeBlock: CodeBlock) => void;
}

class RealtimeChatService {
  private abortController: AbortController | null = null;

  // Send message with streaming response
  async sendMessageStream(
    message: string,
    conversationHistory: ChatMessage[],
    agentConfig: AgentConfig,
    callbacks: StreamCallbacks
  ): Promise<void> {
    // Cancel any existing request
    this.abortController?.abort();
    this.abortController = new AbortController();

    try {
      const response = await fetch(`${API_BASE}/studio/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: conversationHistory.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          agentConfig: {
            systemPrompt: agentConfig.systemPrompt,
            model: agentConfig.model,
            temperature: agentConfig.temperature,
            maxTokens: agentConfig.maxTokens,
          },
          stream: false, // Our current API doesn't support streaming, use chunked response
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.response) {
        // Parse code blocks from response
        const codeBlocks = this.extractCodeBlocks(data.response);
        if (codeBlocks.length > 0 && callbacks.onCodeBlock) {
          codeBlocks.forEach((block) => callbacks.onCodeBlock!(block));
        }

        // Simulate streaming for better UX
        await this.simulateStreaming(data.response, callbacks.onToken);
        callbacks.onComplete(data.response);
      } else {
        throw new Error(data.error || 'No response received');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return; // Request was cancelled
      }
      callbacks.onError(error);
    }
  }

  // Non-streaming message send
  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[],
    agentConfig: AgentConfig
  ): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/studio/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: conversationHistory.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          agentConfig: {
            systemPrompt: agentConfig.systemPrompt,
            model: agentConfig.model,
            temperature: agentConfig.temperature,
            maxTokens: agentConfig.maxTokens,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, response: data.response };
      }

      return { success: false, error: data.error || 'Unknown error' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  }

  // Simulate streaming effect for better UX
  private async simulateStreaming(
    text: string,
    onToken: (token: string) => void
  ): Promise<void> {
    const words = text.split(' ');
    let currentIndex = 0;

    while (currentIndex < words.length) {
      // Send 1-3 words at a time for natural feel
      const chunkSize = Math.min(
        Math.floor(Math.random() * 3) + 1,
        words.length - currentIndex
      );
      const chunk =
        words.slice(currentIndex, currentIndex + chunkSize).join(' ') + ' ';

      onToken(chunk);
      currentIndex += chunkSize;

      // Variable delay for natural feeling
      await new Promise((resolve) =>
        setTimeout(resolve, 20 + Math.random() * 30)
      );
    }
  }

  // Extract code blocks from markdown
  extractCodeBlocks(content: string): CodeBlock[] {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: CodeBlock[] = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'plaintext',
        code: match[2].trim(),
      });
    }

    return blocks;
  }

  // Cancel ongoing request
  cancelRequest(): void {
    this.abortController?.abort();
    this.abortController = null;
  }

  // Generate unique message ID
  generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate unique session ID
  generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const realtimeChatService = new RealtimeChatService();
export default realtimeChatService;
