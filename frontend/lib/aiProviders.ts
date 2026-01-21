import type { AIProvider } from '../app/agents/types';

export interface ProviderModelOption {
  provider: AIProvider;
  label: string;
  models: {
    value: string;
    label: string;
  }[];
}

// ============================================================================
// AGENT-SPECIFIC AI PROVIDER OPTIONS
// ============================================================================
// Each agent gets customized dropdown options based on their personality
// First option = Agent's primary persona, Second option = Maula AI fallback
// ============================================================================

// Einstein - Theoretical Physicist
const EINSTEIN_PROVIDER_OPTIONS: ProviderModelOption[] = [
  {
    provider: 'cerebras',
    label: 'Albert Einstein',
    models: [
      { value: 'llama3.1-8b', label: 'Quick Insight' },
      { value: 'llama-3.3-70b', label: 'Deep Thought' },
    ],
  },
  {
    provider: 'groq',
    label: 'Maula AI',
    models: [
      { value: 'llama-3.1-8b-instant', label: 'Instant Response' },
      { value: 'llama-3.3-70b-versatile', label: 'Balanced Response' },
    ],
  },
  {
    provider: 'openai',
    label: 'Image Generator',
    models: [
      { value: 'gpt-4o', label: 'Best Quality' },
      { value: 'gpt-4o-mini', label: 'Fast Mode' },
    ],
  },
  {
    provider: 'anthropic',
    label: 'Code Builder',
    models: [
      { value: 'claude-sonnet-4-20250514', label: 'Advanced Code' },
      { value: 'claude-3-haiku-20240307', label: 'Quick Code' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Writing Assistant',
    models: [
      { value: 'mistral-medium-latest', label: 'Detailed Write' },
      { value: 'mistral-small-latest', label: 'Quick Write' },
    ],
  },
  {
    provider: 'xai',
    label: 'Research Helper',
    models: [
      { value: 'grok-2', label: 'Deep Analysis' },
    ],
  },
];

// ============================================================================
// GET AGENT-SPECIFIC PROVIDER OPTIONS
// ============================================================================
export function getAgentProviderOptions(agentId: string): ProviderModelOption[] {
  switch (agentId) {
    case 'einstein':
      return EINSTEIN_PROVIDER_OPTIONS;
    // Add more agents here as we configure them
    default:
      return PROVIDER_MODEL_OPTIONS;
  }
}

// ============================================================================
// GET AGENT-SPECIFIC CANVAS PROVIDER OPTIONS
// ============================================================================
// Converts ProviderModelOption[] to Canvas format for CanvasPage settings
export function getAgentCanvasProviders(agentId: string): Record<string, { name: string; models: { id: string; name: string }[] }> {
  const options = getAgentProviderOptions(agentId);
  const result: Record<string, { name: string; models: { id: string; name: string }[] }> = {};
  
  for (const opt of options) {
    result[opt.provider] = {
      name: opt.label,
      models: opt.models.map(m => ({ id: m.value, name: m.label })),
    };
  }
  
  return result;
}

// Get first provider key for default selection
export function getAgentDefaultProvider(agentId: string): string {
  const options = getAgentProviderOptions(agentId);
  return options[0]?.provider || 'cerebras';
}

// Get first model for a provider
export function getAgentDefaultModel(agentId: string, provider?: string): string {
  const options = getAgentProviderOptions(agentId);
  const targetProvider = provider || options[0]?.provider;
  const opt = options.find(o => o.provider === targetProvider);
  return opt?.models[0]?.value || 'llama3.1-8b';
}

// ============================================================================
// DEFAULT USER-FRIENDLY AI OPTIONS (Fallback)
// ============================================================================
// These show friendly names to users - backend handles actual provider routing
// Users don't need to know technical details - just pick what they want to do!
// ============================================================================

export const PROVIDER_MODEL_OPTIONS: ProviderModelOption[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // MAULA AI - Default options (Recommended)
  // ─────────────────────────────────────────────────────────────────────────
  {
    provider: 'cerebras',  // Backend: Maps to Cerebras (fast & reliable)
    label: '⚡ Maula AI 1',
    models: [
      { value: 'llama3.1-8b', label: 'Fast Response' },
      { value: 'llama-3.3-70b', label: 'Smart Response' },
    ],
  },
  {
    provider: 'groq',  // Backend: Maps to Groq (ultra fast)
    label: '🚀 Maula AI 2',
    models: [
      { value: 'llama-3.1-8b-instant', label: 'Instant Response' },
      { value: 'llama-3.3-70b-versatile', label: 'Balanced Response' },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────
  // SPECIALIZED AGENTS - Purpose-based options
  // ─────────────────────────────────────────────────────────────────────────
  {
    provider: 'openai',  // Backend: Maps to OpenAI for images/creative
    label: '🎨 Image Generator',
    models: [
      { value: 'gpt-4o-mini', label: 'Creative Mode' },
      { value: 'gpt-3.5-turbo', label: 'Quick Mode' },
    ],
  },
  {
    provider: 'anthropic',  // Backend: Maps to Anthropic for coding
    label: '💻 Code Builder',
    models: [
      { value: 'claude-3-haiku-20240307', label: 'Quick Code' },
      { value: 'claude-sonnet-4-20250514', label: 'Advanced Code' },
    ],
  },
  {
    provider: 'mistral',  // Backend: Maps to Mistral for general tasks
    label: '📝 Writing Assistant',
    models: [
      { value: 'mistral-small-latest', label: 'Quick Write' },
      { value: 'mistral-medium-latest', label: 'Detailed Write' },
    ],
  },
  {
    provider: 'xai',  // Backend: Maps to xAI for research/analysis
    label: '🔍 Research Helper',
    models: [
      { value: 'grok-2', label: 'Deep Analysis' },
    ],
  },
];

// ============================================================================
// LEGACY PROVIDER OPTIONS (for backend/admin use only)
// ============================================================================
export const LEGACY_PROVIDER_OPTIONS: ProviderModelOption[] = [
  {
    provider: 'openai',
    label: 'OpenAI',
    models: [
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    ],
  },
  {
    provider: 'anthropic',
    label: 'Anthropic',
    models: [
      { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Mistral',
    models: [
      { value: 'mistral-small-latest', label: 'Mistral Small' },
      { value: 'mistral-medium-latest', label: 'Mistral Medium' },
    ],
  },
  {
    provider: 'groq',
    label: 'Groq',
    models: [
      { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B' },
      { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
    ],
  },
  {
    provider: 'cerebras',
    label: 'Cerebras',
    models: [
      { value: 'llama3.1-8b', label: 'Llama 3.1 8B' },
      { value: 'llama-3.3-70b', label: 'Llama 3.3 70B' },
    ],
  },
  {
    provider: 'xai',
    label: 'xAI',
    models: [
      { value: 'grok-2', label: 'Grok-2' },
    ],
  },
];
