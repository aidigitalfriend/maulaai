
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

// Agent Voice Mapping - ElevenLabs voice IDs for each agent
// Female agents use female voices, Male agents use male voices
export const AGENT_VOICE_MAP: Record<string, { voiceId: string; name: string; gender: 'female' | 'male' }> = {
  // Female Agents (6)
  'mrs-boss': { voiceId: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'female' },           // Professional, authoritative
  'julie-girlfriend': { voiceId: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'female' }, // Warm, romantic
  'emma-emotional': { voiceId: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'female' },  // Empathetic, caring
  'drama-queen': { voiceId: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'female' },       // Dramatic, theatrical
  'chef-biew': { voiceId: 'ThT5KcBeYPX3keUQqHPh', name: 'Dorothy', gender: 'female' },      // Warm, culinary
  'nid-gaming': { voiceId: 'jsCqWAovK2LkecY7zXl4', name: 'Freya', gender: 'female' },       // Energetic, gamer
  
  // Male Agents (12)
  'einstein': { voiceId: 'pqHfZKP75CvOlQylNhV4', name: 'Bill', gender: 'male' },            // Wise, educational
  'tech-wizard': { voiceId: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'male' },       // Tech-savvy
  'travel-buddy': { voiceId: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'male' },        // Adventurous
  'fitness-guru': { voiceId: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'male' },      // Energetic, motivational
  'comedy-king': { voiceId: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'male' },          // Funny, witty
  'chess-player': { voiceId: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'male' },        // Strategic, calm
  'professor-astrology': { voiceId: 'ODq5zmih8GrVes37Dizd', name: 'Patrick', gender: 'male' }, // Mystical, wise
  'ben-sega': { voiceId: 'g5CIjZEefAph4nQFvHAz', name: 'Ethan', gender: 'male' },           // Retro, nostalgic
  'bishop-burger': { voiceId: 'SOYHLrjzK2X1ezoPC6cr', name: 'Harry', gender: 'male' },      // Fun, hungry
  'knight-logic': { voiceId: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', gender: 'male' },      // Strategic
  'lazy-pawn': { voiceId: 'ZQe5CZNOzWyzPSCn5a3c', name: 'James', gender: 'male' },          // Relaxed, chill
  'rook-jokey': { voiceId: 'bVMeCyTHy58xNoL34h3p', name: 'Jeremy', gender: 'male' },        // Playful, humorous
  
  // Default fallback
  'default': { voiceId: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'female' },
};

export const DEFAULT_SETTINGS: SettingsState = {
  customPrompt: "You are a helpful assistant.",
  agentName: "Neural Companion",
  agentId: "default",
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
