/**
 * Chat Service - Secure Backend API Integration
 * 
 * This service replaces direct SDK calls with secure backend API calls.
 * All API keys are kept server-side, never exposed to browser.
 * 
 * Supports: Anthropic, Mistral, xAI, Cerebras, Groq, OpenAI, Gemini
 */

import { SettingsState, CanvasState } from '../types';

// API Base URL - uses Next.js API routes
const API_BASE = '/api';

// Message format for conversation history
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Response from backend
export interface ChatResponse {
  text: string;
  provider: string;
  durationMs: number;
  remaining?: number;  // Rate limit remaining
  error?: string;
}

/**
 * Send a message to the AI backend
 * 
 * @param prompt - User's message
 * @param settings - Current settings (provider, model, temperature, etc.)
 * @param conversationHistory - Previous messages for context
 * @returns AI response with metadata
 */
export const sendMessage = async (
  prompt: string,
  settings: SettingsState,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_BASE}/studio/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        conversationHistory,
        provider: settings.provider,           // anthropic, gemini, openai, etc.
        systemPrompt: settings.customPrompt,   // Custom system instructions
        // Future: temperature, maxTokens when backend supports
      }),
    });

    // Handle rate limit
    if (response.status === 429) {
      const error = await response.json();
      return {
        text: `⚠️ Rate limit reached. ${error.message || 'Please wait 30 minutes.'}`,
        provider: 'system',
        durationMs: 0,
        remaining: 0,
        error: 'rate_limit',
      };
    }

    // Handle other errors
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Server error: ${response.status}`);
    }

    // Success
    const data = await response.json();
    
    return {
      text: data.response || 'No response received.',
      provider: data.provider || settings.provider,
      durationMs: data.durationMs || 0,
      remaining: data.remaining,
    };

  } catch (error: any) {
    console.error('Chat Service Error:', error);
    
    return {
      text: `❌ Connection error: ${error.message || 'Unable to reach server. Check your connection.'}`,
      provider: 'error',
      durationMs: 0,
      error: error.message,
    };
  }
};

/**
 * Convert internal message format to API format
 * 
 * @param messages - Messages from the chat session
 * @returns Formatted conversation history for API
 */
export const formatConversationHistory = (
  messages: { sender: string; text: string }[]
): ChatMessage[] => {
  return messages
    .filter(msg => msg.sender !== 'SYSTEM')  // Skip system messages
    .map(msg => ({
      role: msg.sender === 'YOU' ? 'user' as const : 'assistant' as const,
      content: msg.text,
    }));
};

/**
 * Check if a provider is available
 * (Backend handles this, but we can show status in UI)
 */
export const getAvailableProviders = (): string[] => {
  // All providers supported by backend
  return [
    'anthropic',
    'mistral', 
    'xai',
    'cerebras',
    'groq',
    'openai',
    'gemini',
  ];
};

export default {
  sendMessage,
  formatConversationHistory,
  getAvailableProviders,
};
