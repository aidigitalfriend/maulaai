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
export const PROVIDER_MODEL_OPTIONS: ProviderModelOption[] = [
  {
    provider: 'openai',
    label: 'OpenAI',
    models: [
      { value: 'gpt-4o', label: 'GPT-4o (Flagship)' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Cheap)' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fast & Efficient)' },
    ],
  },
  {
    provider: 'anthropic',
    label: 'Anthropic',
    models: [
      {
        value: 'claude-3-5-sonnet-20241022',
        label: 'Claude 3.5 Sonnet (Latest)',
      },
      { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
      { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
    ],
  },
  {
    provider: 'gemini',
    label: 'Google Gemini',
    models: [
      { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro (Latest)' },
      { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash' },
    ],
  },
  {
    provider: 'cohere',
    label: 'Cohere',
    models: [
      { value: 'command-r', label: 'Command R' },
      { value: 'command', label: 'Command' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Mistral',
    models: [
      { value: 'mistral-large-latest', label: 'Mistral Large (Latest)' },
      { value: 'mistral-medium-latest', label: 'Mistral Medium' },
      { value: 'mistral-small-latest', label: 'Mistral Small' },
    ],
  },
  {
    provider: 'xai',
    label: 'xAI Grok',
    models: [
      { value: 'grok-2', label: 'Grok-2 (Default)' },
      { value: 'grok-2-mini', label: 'Grok-2 Mini' },
    ],
  },
  {
    provider: 'huggingface',
    label: 'HuggingFace',
    models: [
      { value: 'meta-llama-3-70b', label: 'Meta Llama 3 70B' },
      { value: 'mistralai-mixtral-8x7b', label: 'Mixtral 8x7B' },
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
];
