
import { SettingsState, NavItem } from './types';

/**
 * PROVIDER_CONFIG - All 7 AI providers supported by backend
 * 
 * No API keys needed here - all calls go through secure backend
 * Backend route: /api/studio/chat
 */
export const PROVIDER_CONFIG = [
  {
    id: 'cerebras',
    name: 'Cerebras',
    icon: '🧠',
    models: ['llama-3.3-70b'],
    defaultModel: 'llama-3.3-70b',
    description: 'Ultra-fast inference (~10ms)',
    status: 'active'
  },
  {
    id: 'groq',
    name: 'Groq',
    icon: '⚡',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
    defaultModel: 'llama-3.3-70b-versatile',
    description: 'Lightning fast LPU inference',
    status: 'active'
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    icon: '✖️',
    models: ['grok-3', 'grok-2-mini'],
    defaultModel: 'grok-3',
    description: 'Grok AI by xAI',
    status: 'active'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '🅰️',
    models: ['claude-sonnet-4-20250514', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    defaultModel: 'claude-sonnet-4-20250514',
    description: 'Claude AI - Safe & helpful',
    status: 'active'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    models: ['gpt-4.1', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4.1',
    description: 'GPT-4 and beyond',
    status: 'active'
  },
  {
    id: 'mistral',
    name: 'Mistral',
    icon: '🌀',
    models: ['mistral-large-2411', 'mistral-medium-latest', 'mixtral-8x7b-instruct'],
    defaultModel: 'mistral-large-2411',
    description: 'European AI excellence',
    status: 'active'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: '💎',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    defaultModel: 'gemini-2.0-flash',
    description: 'Google DeepMind',
    status: 'active'
  }
];

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: "You are a helpful assistant.",
  agentName: "Neural Companion",
  temperature: 0.7,
  maxTokens: 2048,
  provider: 'cerebras',  // Default to Cerebras - fastest inference
  model: "llama-3.3-70b",
  activeTool: 'none',
  workspaceMode: 'CHAT',
  portalUrl: 'https://www.google.com/search?igu=1',
  canvas: {
    content: "// AGENT_DIRECTIVE: Collaborative workspace active.\n\nReady for synthesis.",
    type: 'text',
    title: 'Neural_Canvas_01'
  }
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Create Image', icon: '🎨', tool: 'image_gen', description: 'Visual synthesis module' },
  { label: 'Thinking', icon: '💡', tool: 'thinking', description: 'Chain-of-thought processing' },
  { label: 'Deep Research', icon: '🔭', tool: 'deep_research', description: 'Multi-layer semantic analysis' },
  { label: 'Web Portal', icon: '🌐', tool: 'browser', description: 'Interactive web integration' },
  { label: 'Study and Learn', icon: '📚', tool: 'study', description: 'Pedagogical core enabled' },
  { label: 'Web Search', icon: '🔍', tool: 'web_search', description: 'Real-time global grounding' },
  { label: 'Canvas', icon: '🖌️', tool: 'canvas', description: 'Creative writing workspace' },
  { label: 'Quizzes', icon: '📝', tool: 'quizzes', description: 'Knowledge testing protocol' },
  { label: 'Canvas App', icon: '💻', tool: 'canvas_app', description: 'Full-stack code generation studio' }
];

export const NEURAL_PRESETS: Record<string, { prompt: string; temp: number }> = {
  educational: { prompt: "You are an educational mentor. Use clear logic and analogies.", temp: 0.5 },
  professional: { prompt: "You are a professional business advisor. Use formal language and precise data.", temp: 0.3 },
  creative: { prompt: "You are a creative visionary. Generate imaginative and novel thoughts.", temp: 1.5 },
  coding: { prompt: "You are a senior software engineer. Provide clean, documented code.", temp: 0.4 }
};
