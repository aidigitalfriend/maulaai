// AI Provider Types
export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'cohere'
  | 'mistral'
  | 'xai'
  | 'huggingface'
  | 'groq'
  | 'cerebras';

export interface AgentConfig {
  id: string;
  name: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  provider: AIProvider;
}
