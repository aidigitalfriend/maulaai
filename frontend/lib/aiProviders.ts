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
// USER-FRIENDLY AI OPTIONS
// ============================================================================
// These show friendly names to users - backend handles actual provider routing
// Users don't need to know technical details - just pick what they want to do!
// ============================================================================

export const PROVIDER_MODEL_OPTIONS: ProviderModelOption[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // ONE LAST AI - Default options (Recommended)
  // ─────────────────────────────────────────────────────────────────────────
  {
    provider: 'cerebras',  // Backend: Maps to Cerebras (fast & reliable)
    label: '⚡ One Last AI 1',
    models: [
      { value: 'llama3.1-8b', label: 'Fast Response' },
      { value: 'llama-3.3-70b', label: 'Smart Response' },
    ],
  },
  {
    provider: 'groq',  // Backend: Maps to Groq (ultra fast)
    label: '🚀 One Last AI 2',
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
