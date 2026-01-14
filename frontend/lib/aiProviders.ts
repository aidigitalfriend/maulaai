import type { AIProvider } from '../app/agents/types';

export interface ProviderModelOption {
  provider: AIProvider;
  label: string;
  models: {
    value: string;
    label: string;
  }[];
}

// Central mapping of AI providers to their available models
// Limited to 5 providers to match Canvas page for consistency
export const PROVIDER_MODEL_OPTIONS: ProviderModelOption[] = [
  {
    provider: 'mistral',
    label: 'Mistral',
    models: [
      { value: 'mistral-large-latest', label: 'Mistral Large (Latest)' },
      { value: 'mistral-medium-latest', label: 'Mistral Medium' },
      { value: 'mistral-small-latest', label: 'Mistral Small' },
      { value: 'pixtral-large-latest', label: 'Pixtral Large (Vision)' },
      { value: 'codestral-latest', label: 'Codestral (Coding)' },
    ],
  },
  {
    provider: 'openai',
    label: 'OpenAI',
    models: [
      { value: 'gpt-4o', label: 'GPT-4o (Flagship)' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
      { value: 'o1', label: 'o1 (Reasoning)' },
      { value: 'o1-mini', label: 'o1-mini (Fast Reasoning)' },
    ],
  },
  {
    provider: 'anthropic',
    label: 'Anthropic',
    models: [
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (Latest)' },
      { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fast)' },
    ],
  },
  {
    provider: 'xai',
    label: 'xAI Grok',
    models: [
      { value: 'grok-3', label: 'Grok-3 (Latest)' },
      { value: 'grok-3-mini', label: 'Grok-3 Mini' },
      { value: 'grok-2', label: 'Grok-2' },
    ],
  },
  {
    provider: 'groq',
    label: 'Groq',
    models: [
      { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Versatile)' },
      { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B' },
      { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (32K context)' },
    ],
  },
  {
    provider: 'cerebras',
    label: 'Cerebras (Entropy)',
    models: [
      { value: 'llama-3.3-70b', label: 'Llama 3.3 70B' },
      { value: 'llama-3.1-70b', label: 'Llama 3.1 70B' },
      { value: 'llama-3.1-8b', label: 'Llama 3.1 8B' },
      { value: 'llama3.1-8b', label: 'Llama 3.1 8B (legacy)' },
      { value: 'llama3.1-70b', label: 'Llama 3.1 70B (legacy)' },
    ],
  },
];
