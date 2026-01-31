
import { SettingsState, NavItem } from './types';

/**
 * PROVIDER_CONFIG - All 7 AI providers supported by backend
 * 
 * No API keys needed here - all calls go through secure backend
 * Backend route: /api/studio/chat
 * 
 * One Last AI - Earn the name, not just money! ✌️
 */
export const PROVIDER_CONFIG = [
  {
    id: 'cerebras',
    name: 'Maula AI',
    icon: '🧠',
    models: [
      { id: 'llama-3.3-70b', name: 'Ultra Fast' }
    ],
    defaultModel: 'llama-3.3-70b',
    description: 'Lightning speed reasoning (~10ms)',
    status: 'active'
  },
  {
    id: 'groq',
    name: 'One Last AI',
    icon: '⚡',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Power Mode' },
      { id: 'llama-3.1-8b-instant', name: 'Quick Reply' }
    ],
    defaultModel: 'llama-3.3-70b-versatile',
    description: 'Your AI digital friend zone',
    status: 'active'
  },
  {
    id: 'xai',
    name: 'Planner',
    icon: '📋',
    models: [
      { id: 'grok-3', name: 'Master Plan' },
      { id: 'grok-2-mini', name: 'Quick Plan' }
    ],
    defaultModel: 'grok-3',
    description: 'Strategic thinking & planning',
    status: 'active'
  },
  {
    id: 'anthropic',
    name: 'Code Expert',
    icon: '💻',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Pro Coder' },
      { id: 'claude-3-opus-20240229', name: 'Senior Dev' },
      { id: 'claude-3-haiku-20240307', name: 'Quick Fix' }
    ],
    defaultModel: 'claude-sonnet-4-20250514',
    description: 'Expert coding assistant',
    status: 'active'
  },
  {
    id: 'openai',
    name: 'Designer',
    icon: '🎨',
    models: [
      { id: 'gpt-4.1', name: 'Creative Pro' },
      { id: 'gpt-4-turbo', name: 'Fast Design' },
      { id: 'gpt-3.5-turbo', name: 'Quick Sketch' }
    ],
    defaultModel: 'gpt-4.1',
    description: 'Creative design & content',
    status: 'active'
  },
  {
    id: 'mistral',
    name: 'Writer',
    icon: '✍️',
    models: [
      { id: 'mistral-large-latest', name: 'Bestseller' },
      { id: 'mistral-medium-latest', name: 'Story Mode' },
      { id: 'mixtral-8x7b-instruct', name: 'Blog Post' }
    ],
    defaultModel: 'mistral-large-latest',
    description: 'Professional writing & content',
    status: 'active'
  },
  {
    id: 'gemini',
    name: 'Researcher',
    icon: '🔬',
    models: [
      { id: 'gemini-2.0-flash', name: 'Deep Dive' },
      { id: 'gemini-1.5-pro', name: 'Analysis Pro' },
      { id: 'gemini-1.5-flash', name: 'Quick Search' }
    ],
    defaultModel: 'gemini-2.0-flash',
    description: 'Research & analysis',
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
