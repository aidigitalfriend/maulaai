// API service for connecting frontend agents to backend AI services
import PersonalityEnforcement from './personality-enforcement'

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  message: string;
  agent_id?: string;
  personality?: string;
  provider?: 'openai' | 'anthropic' | 'gemini' | 'auto';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  conversationHistory?: ChatMessage[];
}

export interface AIResponse {
  response: string;
  provider: string;
  model: string;
  personalityScore?: number;
  enforced?: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

export class AIService {
  // Send message to specific AI agent
  static async sendAgentMessage(
    agentId: string, 
    message: string, 
    conversationHistory: ChatMessage[] = []
  ): Promise<{ response: string; personalityScore?: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          agent_id: agentId,
          conversationHistory,
          provider: 'auto', // Let backend choose best provider
          temperature: 0.7,
          maxTokens: 1000,
        } as AIRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AIResponse = await response.json();
      
      // Apply personality enforcement to the response
      const enforcement = new PersonalityEnforcement(agentId);
      const enforceResult = enforcement.enforce({
        agentId,
        userMessage: message,
        aiResponse: data.response,
        context: conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')
      });

      // Use the enforced response if valid, otherwise use original with logging
      const finalResponse = enforceResult.isValid ? enforceResult.modifiedResponse : data.response;
      
      // Log personality score for debugging
      console.log(`[${agentId}] Personality Score: ${enforceResult.confidenceScore}/100`, {
        valid: enforceResult.isValid,
        violations: enforceResult.violations,
        suggestions: enforceResult.suggestions
      });

      return {
        response: finalResponse,
        personalityScore: enforceResult.confidenceScore
      };
    } catch (error) {
      console.error('Error calling AI service:', error);
      
      // Fallback response for development/demo purposes
      return {
        response: this.getFallbackResponse(agentId, message),
        personalityScore: 0
      };
    }
  }

  // Health check for backend connectivity
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Check available AI providers
  static async getProviderStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Provider status check failed:', error);
      return null;
    }
  }

  // Fallback responses for when backend is unavailable
  private static getFallbackResponse(agentId: string, message: string): string {
    const fallbacks: Record<string, string[]> = {
      einstein: [
        "Imagination is more important than knowledge. Let me think about your question from a theoretical perspective...",
        "As I once said, 'The important thing is not to stop questioning.' Your inquiry touches on fundamental principles of physics.",
        "Ah, this reminds me of the thought experiments I used to explore the nature of space and time. Let me explain...",
      ],
      shakespeare: [
        "Forsooth, thy question doth stir the very essence of creativity! Permit me to craft a response most eloquent...",
        "All the world's a stage, and your inquiry plays a most interesting part upon it. Let me share my thoughts...",
        "In fair Verona, where we lay our scene... but I digress. Your question deserves a most thoughtful response.",
      ],
      tesla: [
        "The present is theirs; the future, for which I really worked, is mine. Your question about innovation intrigues me...",
        "My brain is only a receiver, in the Universe there is a core from which we obtain knowledge. Let me share what I've received...",
        "The day science begins to study non-physical phenomena, it will make more progress in one decade than in all the previous centuries.",
      ],
      default: [
        "I understand your question and I'm processing it carefully. Let me provide you with a thoughtful response...",
        "That's an interesting perspective. Based on my expertise, I can offer you some insights...",
        "Thank you for that question. Allow me to share my thoughts on this matter...",
      ]
    };

    const responses = fallbacks[agentId] || fallbacks.default;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return randomResponse;
  }
}