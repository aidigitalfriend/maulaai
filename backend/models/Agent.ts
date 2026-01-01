import { ObjectId } from 'mongodb';

export type AIProvider = 'openai' | 'anthropic' | 'xai' | 'mistral' | 'gemini';
export type AIModel =
  // OpenAI models
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  // Anthropic models
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-opus-20240229'
  | 'claude-3-sonnet-20240229'
  | 'claude-3-haiku-20240307'
  // xAI models
  | 'grok-beta'
  | 'grok-vision-beta'
  // Mistral models
  | 'mistral-large-latest'
  | 'mistral-medium'
  | 'mistral-small-latest'
  | 'mistral-7b-instruct'
  // Gemini models
  | 'gemini-pro'
  | 'gemini-pro-vision'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash';

export interface AgentProviderConfig {
  primaryProvider: AIProvider;
  primaryModel: AIModel;
  fallbackProviders: Array<{
    provider: AIProvider;
    model: AIModel;
    priority: number;
  }>;
  personalityMatch: {
    creativity: number; // 1-10 scale
    empathy: number; // 1-10 scale
    technical: number; // 1-10 scale
    humor: number; // 1-10 scale
    formality: number; // 1-10 scale
  };
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface Agent {
  agentId: string;
  name: string;
  description: string;
  category:
    | 'assistant'
    | 'specialist'
    | 'creative'
    | 'technical'
    | 'business'
    | 'other';
  avatar: string;
  prompt: string;
  aiModel: AIModel; // Legacy field, kept for backward compatibility
  temperature: number;
  maxTokens: number;
  isActive: boolean;
  isPublic: boolean;
  isPremium: boolean;
  pricing: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  features: string[];
  tags: string[];
  capabilities: string[];
  limitations: string[];
  examples: Array<{
    input: string;
    output: string;
  }>;
  config: {
    systemPrompt?: string;
    functions?: any[];
    tools?: string[];
    personality?: string;
    tone?: string;
  };
  // New provider configuration
  providerConfig: AgentProviderConfig;
  stats: {
    totalInteractions: number;
    totalUsers: number;
    averageRating: number;
    totalRatings: number;
  };
  creator: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export default Agent;
