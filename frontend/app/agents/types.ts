// Agent configuration types
export type AgentCategory =
  | 'Companion'
  | 'Business'
  | 'Entertainment'
  | 'Home & Lifestyle'
  | 'Education'
  | 'Health & Wellness'
  | 'Creative'
  | 'Technology';

export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'cohere'
  | 'mistral'
  | 'grok'
  | 'huggingface'
  | 'groq';

export interface DetailedSection {
  title: string;
  icon: string;
  items?: string[];
  content?: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  specialty: string;
  description: string;
  avatarUrl: string;
  color: string;
  category: AgentCategory | 'AGENT_CATEGORY'; // Allow placeholder for templates
  tags: string[];
  personality: {
    traits: string[];
    responseStyle: string;
    greetingMessage: string;
    specialties: string[];
    conversationStarters: string[];
  };
  prompts: {
    systemPrompt: string;
    contextPrompt: string;
    exampleResponses: Array<{
      input: string;
      output: string;
    }>;
  };
  settings: {
    maxTokens: number;
    temperature: number;
    enabled: boolean;
    premium: boolean;
  };
  aiProvider: {
    primary: AIProvider;
    fallbacks: AIProvider[];
    model: string;
    reasoning?: string;
  };
  details?: {
    icon: string;
    sections: DetailedSection[];
  };
}

export interface AgentMetrics {
  conversations: number;
  satisfaction: number;
  lastUpdated: string;
}

export interface AgentExport {
  config: AgentConfig;
  metadata: {
    version: string;
    created: string;
    lastModified: string;
  };
}
