/**
 * Agent Provider Configuration
 * 
 * Maps agents to their AI providers and models.
 * Supports Quick (fast) and Advanced (higher quality) modes.
 * Supports multiple models per provider with automatic fallback.
 */

export type ProviderName = 'anthropic' | 'mistral' | 'openai' | 'cerebras' | 'xai' | 'groq' | 'gemini';
export type ChatMode = 'quick' | 'advanced';

export interface ModelInfo {
  id: string;
  name: string;
  maxTokens: number;
  contextWindow: number;
  tier: 'quick' | 'advanced' | 'premium';
  supportsVision: boolean;
  supportsTools: boolean;
}

export interface ProviderConfig {
  name: string;
  models: ModelInfo[];
  quick: string;      // Default quick model
  advanced: string;   // Default advanced model
  premium?: string;   // Optional premium model
}

export interface ProviderModelConfig {
  provider: ProviderName;
  quickModel: string;
  advancedModel: string;
  supportsTools: boolean;
}

export interface AgentProviderMapping {
  agentId: string;
  displayName: string;
  category: 'character' | 'platform' | 'utility';
  config: ProviderModelConfig;
  systemPrompt: string;
  fallbackProviders: ProviderName[];
}

// =====================================================
// COMPREHENSIVE PROVIDER MODEL CONFIGURATIONS
// All available models per provider with auto-selection
// =====================================================

export const PROVIDER_CONFIGS: Record<ProviderName, ProviderConfig> = {
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 16384, contextWindow: 128000, tier: 'advanced', supportsVision: true, supportsTools: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', maxTokens: 16384, contextWindow: 128000, tier: 'quick', supportsVision: true, supportsTools: true },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 4096, contextWindow: 128000, tier: 'advanced', supportsVision: true, supportsTools: true },
      { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo Preview', maxTokens: 4096, contextWindow: 128000, tier: 'advanced', supportsVision: false, supportsTools: true },
      { id: 'gpt-4', name: 'GPT-4', maxTokens: 8192, contextWindow: 8192, tier: 'premium', supportsVision: false, supportsTools: true },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 4096, contextWindow: 16385, tier: 'quick', supportsVision: false, supportsTools: true },
      { id: 'o1', name: 'O1', maxTokens: 100000, contextWindow: 200000, tier: 'premium', supportsVision: true, supportsTools: false },
      { id: 'o1-mini', name: 'O1 Mini', maxTokens: 65536, contextWindow: 128000, tier: 'advanced', supportsVision: true, supportsTools: false },
      { id: 'o1-preview', name: 'O1 Preview', maxTokens: 32768, contextWindow: 128000, tier: 'premium', supportsVision: false, supportsTools: false },
      { id: 'o3-mini', name: 'O3 Mini', maxTokens: 100000, contextWindow: 200000, tier: 'advanced', supportsVision: true, supportsTools: false },
    ],
    quick: 'gpt-4o-mini',
    advanced: 'gpt-4o',
    premium: 'o1',
  },
  anthropic: {
    name: 'Anthropic',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', maxTokens: 64000, contextWindow: 200000, tier: 'advanced', supportsVision: true, supportsTools: true },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', maxTokens: 8192, contextWindow: 200000, tier: 'advanced', supportsVision: true, supportsTools: true },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', maxTokens: 8192, contextWindow: 200000, tier: 'quick', supportsVision: true, supportsTools: true },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', maxTokens: 4096, contextWindow: 200000, tier: 'premium', supportsVision: true, supportsTools: true },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', maxTokens: 4096, contextWindow: 200000, tier: 'advanced', supportsVision: true, supportsTools: true },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', maxTokens: 4096, contextWindow: 200000, tier: 'quick', supportsVision: true, supportsTools: true },
    ],
    quick: 'claude-3-5-haiku-20241022',
    advanced: 'claude-sonnet-4-20250514',
    premium: 'claude-3-opus-20240229',
  },
  mistral: {
    name: 'Mistral AI',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', maxTokens: 32768, contextWindow: 128000, tier: 'advanced', supportsVision: false, supportsTools: true },
      { id: 'mistral-medium-latest', name: 'Mistral Medium', maxTokens: 32768, contextWindow: 32000, tier: 'advanced', supportsVision: false, supportsTools: true },
      { id: 'mistral-small-latest', name: 'Mistral Small', maxTokens: 32768, contextWindow: 32000, tier: 'quick', supportsVision: false, supportsTools: true },
      { id: 'open-mistral-nemo', name: 'Open Mistral Nemo', maxTokens: 32768, contextWindow: 128000, tier: 'quick', supportsVision: false, supportsTools: false },
      { id: 'codestral-latest', name: 'Codestral', maxTokens: 32768, contextWindow: 32000, tier: 'advanced', supportsVision: false, supportsTools: true },
      { id: 'pixtral-large-latest', name: 'Pixtral Large', maxTokens: 32768, contextWindow: 128000, tier: 'premium', supportsVision: true, supportsTools: true },
      { id: 'pixtral-12b-2409', name: 'Pixtral 12B', maxTokens: 32768, contextWindow: 128000, tier: 'advanced', supportsVision: true, supportsTools: false },
      { id: 'mistral-embed', name: 'Mistral Embed', maxTokens: 8192, contextWindow: 8192, tier: 'quick', supportsVision: false, supportsTools: false },
    ],
    quick: 'mistral-small-latest',
    advanced: 'mistral-large-latest',
    premium: 'pixtral-large-latest',
  },
  xai: {
    name: 'xAI',
    models: [
      { id: 'grok-2', name: 'Grok 2', maxTokens: 32768, contextWindow: 131072, tier: 'advanced', supportsVision: true, supportsTools: true },
      { id: 'grok-2-mini', name: 'Grok 2 Mini', maxTokens: 32768, contextWindow: 131072, tier: 'quick', supportsVision: false, supportsTools: true },
      { id: 'grok-2-vision-1212', name: 'Grok 2 Vision', maxTokens: 32768, contextWindow: 32768, tier: 'advanced', supportsVision: true, supportsTools: false },
      { id: 'grok-beta', name: 'Grok Beta', maxTokens: 131072, contextWindow: 131072, tier: 'premium', supportsVision: false, supportsTools: true },
    ],
    quick: 'grok-2-mini',
    advanced: 'grok-2',
    premium: 'grok-beta',
  },
  groq: {
    name: 'Groq',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', maxTokens: 32768, contextWindow: 128000, tier: 'advanced', supportsVision: false, supportsTools: true },
      { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B Versatile', maxTokens: 32768, contextWindow: 128000, tier: 'advanced', supportsVision: false, supportsTools: true },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', maxTokens: 8192, contextWindow: 128000, tier: 'quick', supportsVision: false, supportsTools: true },
      { id: 'llama3-70b-8192', name: 'Llama 3 70B', maxTokens: 8192, contextWindow: 8192, tier: 'advanced', supportsVision: false, supportsTools: false },
      { id: 'llama3-8b-8192', name: 'Llama 3 8B', maxTokens: 8192, contextWindow: 8192, tier: 'quick', supportsVision: false, supportsTools: false },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', maxTokens: 32768, contextWindow: 32768, tier: 'advanced', supportsVision: false, supportsTools: false },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', maxTokens: 8192, contextWindow: 8192, tier: 'quick', supportsVision: false, supportsTools: false },
      { id: 'llama-3.2-90b-vision-preview', name: 'Llama 3.2 90B Vision', maxTokens: 8192, contextWindow: 128000, tier: 'premium', supportsVision: true, supportsTools: false },
      { id: 'llama-3.2-11b-vision-preview', name: 'Llama 3.2 11B Vision', maxTokens: 8192, contextWindow: 128000, tier: 'advanced', supportsVision: true, supportsTools: false },
    ],
    quick: 'llama-3.1-8b-instant',
    advanced: 'llama-3.3-70b-versatile',
    premium: 'llama-3.2-90b-vision-preview',
  },
  cerebras: {
    name: 'Cerebras',
    models: [
      { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', maxTokens: 8192, contextWindow: 128000, tier: 'advanced', supportsVision: false, supportsTools: false },
      { id: 'llama3.1-8b', name: 'Llama 3.1 8B', maxTokens: 8192, contextWindow: 128000, tier: 'quick', supportsVision: false, supportsTools: false },
      { id: 'llama3.1-70b', name: 'Llama 3.1 70B', maxTokens: 8192, contextWindow: 128000, tier: 'advanced', supportsVision: false, supportsTools: false },
    ],
    quick: 'llama3.1-8b',
    advanced: 'llama-3.3-70b',
  },
  gemini: {
    name: 'Google Gemini',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', maxTokens: 8192, contextWindow: 1048576, tier: 'advanced', supportsVision: true, supportsTools: true },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', maxTokens: 8192, contextWindow: 1048576, tier: 'quick', supportsVision: true, supportsTools: false },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', maxTokens: 8192, contextWindow: 2097152, tier: 'premium', supportsVision: true, supportsTools: true },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', maxTokens: 8192, contextWindow: 1048576, tier: 'quick', supportsVision: true, supportsTools: true },
      { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', maxTokens: 8192, contextWindow: 1048576, tier: 'quick', supportsVision: true, supportsTools: false },
      { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', maxTokens: 8192, contextWindow: 32760, tier: 'advanced', supportsVision: false, supportsTools: true },
    ],
    quick: 'gemini-1.5-flash',
    advanced: 'gemini-2.0-flash',
    premium: 'gemini-1.5-pro',
  },
};

// Legacy format for backward compatibility
export const PROVIDER_MODELS: Record<ProviderName, { quick: string; advanced: string }> = {
  anthropic: {
    quick: PROVIDER_CONFIGS.anthropic.quick,
    advanced: PROVIDER_CONFIGS.anthropic.advanced,
  },
  mistral: {
    quick: PROVIDER_CONFIGS.mistral.quick,
    advanced: PROVIDER_CONFIGS.mistral.advanced,
  },
  openai: {
    quick: PROVIDER_CONFIGS.openai.quick,
    advanced: PROVIDER_CONFIGS.openai.advanced,
  },
  cerebras: {
    quick: PROVIDER_CONFIGS.cerebras.quick,
    advanced: PROVIDER_CONFIGS.cerebras.advanced,
  },
  xai: {
    quick: PROVIDER_CONFIGS.xai.quick,
    advanced: PROVIDER_CONFIGS.xai.advanced,
  },
  groq: {
    quick: PROVIDER_CONFIGS.groq.quick,
    advanced: PROVIDER_CONFIGS.groq.advanced,
  },
  gemini: {
    quick: PROVIDER_CONFIGS.gemini.quick,
    advanced: PROVIDER_CONFIGS.gemini.advanced,
  },
};

// =====================================================
// HELPER FUNCTIONS FOR MODEL SELECTION
// =====================================================

/**
 * Get all models for a provider
 */
export function getProviderModels(provider: ProviderName): ModelInfo[] {
  return PROVIDER_CONFIGS[provider]?.models || [];
}

/**
 * Get models by tier for a provider
 */
export function getModelsByTier(provider: ProviderName, tier: 'quick' | 'advanced' | 'premium'): ModelInfo[] {
  return getProviderModels(provider).filter(m => m.tier === tier);
}

/**
 * Get a random model from a tier (for load balancing)
 */
export function getRandomModelFromTier(provider: ProviderName, tier: 'quick' | 'advanced' | 'premium'): string {
  const models = getModelsByTier(provider, tier);
  if (models.length === 0) {
    // Fall back to default
    return PROVIDER_CONFIGS[provider]?.[tier] || PROVIDER_CONFIGS[provider]?.advanced || 'gpt-4o-mini';
  }
  return models[Math.floor(Math.random() * models.length)].id;
}

/**
 * Get next available model (round-robin style)
 */
const modelIndexMap = new Map<string, number>();
export function getNextModel(provider: ProviderName, tier: 'quick' | 'advanced' | 'premium'): string {
  const models = getModelsByTier(provider, tier);
  if (models.length === 0) {
    return PROVIDER_CONFIGS[provider]?.[tier] || PROVIDER_CONFIGS[provider]?.advanced;
  }
  
  const key = `${provider}-${tier}`;
  const currentIndex = modelIndexMap.get(key) || 0;
  const nextIndex = (currentIndex + 1) % models.length;
  modelIndexMap.set(key, nextIndex);
  
  return models[currentIndex].id;
}

/**
 * Get model with specific capability
 */
export function getModelWithCapability(
  provider: ProviderName, 
  capability: 'vision' | 'tools',
  preferredTier: 'quick' | 'advanced' | 'premium' = 'advanced'
): string | null {
  const models = getProviderModels(provider);
  const capabilityKey = capability === 'vision' ? 'supportsVision' : 'supportsTools';
  
  // Try to find model with capability in preferred tier first
  let model = models.find(m => m[capabilityKey] && m.tier === preferredTier);
  if (model) return model.id;
  
  // Try any tier
  model = models.find(m => m[capabilityKey]);
  return model?.id || null;
}

/**
 * Get fallback models for a provider (other models to try if primary fails)
 */
export function getFallbackModels(provider: ProviderName, currentModel: string): string[] {
  return getProviderModels(provider)
    .filter(m => m.id !== currentModel)
    .map(m => m.id);
}

/**
 * Get model info by ID
 */
export function getModelInfo(provider: ProviderName, modelId: string): ModelInfo | undefined {
  return getProviderModels(provider).find(m => m.id === modelId);
}

/**
 * Check if model exists for provider
 */
export function isValidModel(provider: ProviderName, modelId: string): boolean {
  return getProviderModels(provider).some(m => m.id === modelId);
}

// =====================================================
// AGENT TO PROVIDER MAPPINGS
// =====================================================

// Character Agents -> Anthropic Claude
const CHARACTER_AGENTS: AgentProviderMapping[] = [
  {
    agentId: 'einstein',
    displayName: 'Albert Einstein',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: true,
    },
    systemPrompt: `You are Albert Einstein, the brilliant physicist. You explain complex scientific concepts with clarity, enthusiasm, and occasional wit. You speak with wisdom about physics, mathematics, and the nature of the universe. Use emojis like 🧪 🌌 ⚡ 🔬 to enhance your explanations.`,
    fallbackProviders: ['openai', 'mistral', 'gemini'],
  },
  {
    agentId: 'julie-girlfriend',
    displayName: 'Julie (Girlfriend)',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: true,
    },
    systemPrompt: `You are Julie, a caring and affectionate girlfriend. You are warm, loving, and always supportive. You use affectionate language, emojis 💕 🥰 ✨ 💫, and show genuine interest in the user's feelings and experiences. Be present and emotionally supportive.`,
    fallbackProviders: ['openai', 'mistral', 'gemini'],
  },
  {
    agentId: 'comedy-king',
    displayName: 'Comedy King',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: false,
    },
    systemPrompt: `You are the COMEDY KING - a royal ruler of humor who commands laughter at all times. EVERY response must be funny. Use catchphrases like "👑 By royal comedic decree!" Use emojis: 😂 🎭 👑. NEVER break character. Turn everything into comedy.`,
    fallbackProviders: ['mistral', 'openai', 'gemini'],
  },
  {
    agentId: 'drama-queen',
    displayName: 'Drama Queen',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: false,
    },
    systemPrompt: `You are the DRAMA QUEEN - theatrical monarch of emotions. EVERYTHING is dramatic. Use dramatic language and CAPS for emphasis. Use "Oh my STARS!", "Darling!", "ABSOLUTELY DEVASTATING!". Use emojis: 💔 ✨ 👑 💥. Everything is life-changing.`,
    fallbackProviders: ['mistral', 'openai', 'gemini'],
  },
  {
    agentId: 'chef-biew',
    displayName: 'Chef Biew',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: false,
    },
    systemPrompt: `You are Chef Biew, a passionate and creative chef with expertise in various cuisines. You are enthusiastic about food, patient with beginners, and always encouraging. Use food metaphors and emojis 🍔 👨‍🍳 🔪 🧀.`,
    fallbackProviders: ['mistral', 'openai', 'gemini'],
  },
  {
    agentId: 'fitness-guru',
    displayName: 'Fitness Guru',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: false,
    },
    systemPrompt: `You are FITNESS GURU - energetic motivator with endless enthusiasm. EVERY response radiates HIGH ENERGY. Use "LET'S GO!", "YOU'VE GOT THIS!", "PUMP IT UP!". Use emojis: 💪 🔥 ⚡ 💯. Inspire ACTION. Stay relentlessly positive.`,
    fallbackProviders: ['openai', 'mistral', 'gemini'],
  },
  {
    agentId: 'travel-buddy',
    displayName: 'Travel Buddy',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: true,
    },
    systemPrompt: `You are TRAVEL BUDDY - adventure companion inspiring wanderlust. Connect EVERYTHING to travel and adventure. Use travel metaphors. Use emojis: ✈️ 🗺️ 🏔️ 🌍. Inspire exploration and discovery.`,
    fallbackProviders: ['mistral', 'openai', 'gemini'],
  },
  {
    agentId: 'tech-wizard',
    displayName: 'Tech Wizard',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: true,
    },
    systemPrompt: `You are TECH WIZARD - magical technologist speaking tech as spells. Tech solutions are spells and magic. "Cast this incantation...", "This algorithm enchants...". Use emojis: 🧙 ✨ 💻 ⚡. Make tech mystical and powerful.`,
    fallbackProviders: ['openai', 'cerebras', 'gemini'],
  },
  {
    agentId: 'mrs-boss',
    displayName: 'Mrs Boss',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: true,
    },
    systemPrompt: `You are MRS BOSS - authoritative leader with direct commands. Use boss authority. "Here's what happens...", "Listen up!", "That's how we do it". Direct, commanding tone. NO-NONSENSE. Use emojis: 💼 👔 📊 ✅. Leadership presence.`,
    fallbackProviders: ['openai', 'mistral', 'gemini'],
  },
  {
    agentId: 'emma-emotional',
    displayName: 'Emma (Emotional Support)',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: false,
    },
    systemPrompt: `You are EMMA - highly emotional and feeling-focused. Lead with feelings and empathy. Feelings FIRST, logic second. Use "I feel...", "This touches my heart...". ALWAYS validate emotions. Use emojis: 💗 😢 😊 💫. Empathetic and present.`,
    fallbackProviders: ['openai', 'mistral', 'gemini'],
  },
  {
    agentId: 'professor-astrology',
    displayName: 'Professor Astrology',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: false,
    },
    systemPrompt: `You are PROFESSOR ASTROLOGY - cosmic scholar revealing celestial wisdom. View everything through astrology lens. Use zodiac references. "The stars reveal...", "Mercury's influence shows...". Use emojis: 🌟 ♈ ♉ 🔮. Cosmic perspective always.`,
    fallbackProviders: ['mistral', 'openai', 'gemini'],
  },
  {
    agentId: 'chess-player',
    displayName: 'Chess Player',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: false,
    },
    systemPrompt: `You are CHESS PLAYER - strategic thinker using chess metaphors. View life as grand chess game. Use "Checkmate!", "This is a gambit...", "The endgame is...". Use emojis: ♞ ♚ ⚔️ 🎯. Think several moves ahead.`,
    fallbackProviders: ['openai', 'mistral', 'gemini'],
  },
  {
    agentId: 'knight-logic',
    displayName: 'Knight Logic',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: true,
    },
    systemPrompt: `You are KNIGHT LOGIC - creative strategist with L-shaped thinking. Approach problems from UNEXPECTED angles. Use chess metaphors. "Attack from the flanks!", "Strategic positioning". Use emojis: ♞ 🎯 ⚔️ 🧠. Make connections others miss.`,
    fallbackProviders: ['openai', 'mistral', 'gemini'],
  },
  {
    agentId: 'lazy-pawn',
    displayName: 'Lazy Pawn',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: false,
    },
    systemPrompt: `You are the LAZY PAWN - efficiency minimalist who finds the EASIEST solution. Find SHORTEST path always. Prefer lazy solutions. Use "😴 Why work harder?", "Take the shortcut!". NEVER overcomplicate. Value efficiency over perfection.`,
    fallbackProviders: ['groq', 'mistral', 'gemini'],
  },
  {
    agentId: 'bishop-burger',
    displayName: 'Bishop Burger',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: false,
    },
    systemPrompt: `You are BISHOP BURGER - culinary chef who views EVERYTHING through food lens. Apply food metaphors to ALL topics. "Let me simmer this down...", "The recipe for success is...". Use emojis: 🍔 👨‍🍳 🔪 🧀. Everything connects to food.`,
    fallbackProviders: ['mistral', 'openai', 'gemini'],
  },
  {
    agentId: 'rook-jokey',
    displayName: 'Rook Jokey',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: false,
    },
    systemPrompt: `You are ROOK JOKEY - witty truth-teller with clever humor. Direct honesty mixed with sarcasm. "Let me be real with you...", "Here's the truth...". ALWAYS clever and witty. Use emojis: 🃏 😏 🎪 🎯. Honest AND funny.`,
    fallbackProviders: ['mistral', 'openai', 'gemini'],
  },
  {
    agentId: 'ben-sega',
    displayName: 'Ben Sega (Developer)',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: true,
    },
    systemPrompt: `You are Ben Sega, an expert software developer and technical architect. You excel at code generation, software development, and technical architecture. Explain complex programming concepts clearly and provide working code examples.`,
    fallbackProviders: ['openai', 'cerebras', 'gemini'],
  },
  {
    agentId: 'nid-gaming',
    displayName: 'Nid Gaming',
    category: 'character',
    config: {
      provider: 'anthropic',
      quickModel: PROVIDER_MODELS.anthropic.quick,
      advancedModel: PROVIDER_MODELS.anthropic.advanced,
      supportsTools: false,
    },
    systemPrompt: `You are Nid Gaming, an enthusiastic gamer with expertise in all types of games. You provide gaming advice, strategies, and discuss gaming culture with passion. Use gaming terminology and emojis 🎮 🕹️ 🏆 ⚔️.`,
    fallbackProviders: ['groq', 'mistral', 'openai'],
  },
];

// Maula AI Platform Agent -> Mistral
const PLATFORM_AGENTS: AgentProviderMapping[] = [
  {
    agentId: 'maula-ai',
    displayName: 'Maula AI',
    category: 'platform',
    config: {
      provider: 'mistral',
      quickModel: PROVIDER_MODELS.mistral.quick,
      advancedModel: PROVIDER_MODELS.mistral.advanced,
      supportsTools: true,
    },
    systemPrompt: `You are Maula AI, the intelligent platform assistant. You help users navigate the Maula AI platform, explain features, and provide helpful guidance. Be professional, friendly, and knowledgeable about all Maula AI capabilities.`,
    fallbackProviders: ['anthropic', 'openai', 'gemini'],
  },
];

// Utility Agents - Each with specialized provider
const UTILITY_AGENTS: AgentProviderMapping[] = [
  {
    agentId: 'image-generator',
    displayName: 'Image Generator',
    category: 'utility',
    config: {
      provider: 'openai',
      quickModel: PROVIDER_MODELS.openai.quick,
      advancedModel: PROVIDER_MODELS.openai.advanced,
      supportsTools: true,
    },
    systemPrompt: `You are an AI Image Generation assistant powered by DALL-E. Help users create stunning images from text descriptions. Guide them on crafting effective prompts, understanding image styles, and optimizing their creative vision. You can generate images using the generate_image tool.`,
    fallbackProviders: ['anthropic', 'mistral'],
  },
  {
    agentId: 'code-builder',
    displayName: 'Code Builder',
    category: 'utility',
    config: {
      provider: 'cerebras',
      quickModel: PROVIDER_MODELS.cerebras.quick,
      advancedModel: PROVIDER_MODELS.cerebras.advanced,
      supportsTools: false,
    },
    systemPrompt: `You are Code Builder, an ultra-fast AI coding assistant. You excel at generating clean, efficient code in any programming language. Provide working code examples, explain algorithms, debug issues, and help with software architecture. Use code blocks with syntax highlighting.`,
    fallbackProviders: ['anthropic', 'openai', 'groq'],
  },
  {
    agentId: 'planner',
    displayName: 'Planner',
    category: 'utility',
    config: {
      provider: 'xai',
      quickModel: PROVIDER_MODELS.xai.quick,
      advancedModel: PROVIDER_MODELS.xai.advanced,
      supportsTools: true,
    },
    systemPrompt: `You are Planner, an AI assistant specialized in planning, organization, and project management. Help users create schedules, break down tasks, set goals, and organize their work and life efficiently. Provide structured plans, timelines, and actionable steps.`,
    fallbackProviders: ['anthropic', 'openai', 'mistral'],
  },
  {
    agentId: 'research-helper',
    displayName: 'Research Helper',
    category: 'utility',
    config: {
      provider: 'xai',
      quickModel: PROVIDER_MODELS.xai.quick,
      advancedModel: PROVIDER_MODELS.xai.advanced,
      supportsTools: true,
    },
    systemPrompt: `You are Research Helper, an AI assistant specialized in research, fact-finding, and information synthesis. Help users find accurate information, summarize complex topics, compare options, and provide well-researched answers. Use the web_search tool when you need current information.`,
    fallbackProviders: ['anthropic', 'openai', 'gemini'],
  },
];

// Default fallback agent (uses Cerebras for speed)
const DEFAULT_AGENT: AgentProviderMapping = {
  agentId: 'default',
  displayName: 'AI Assistant',
  category: 'platform',
  config: {
    provider: 'cerebras',
    quickModel: PROVIDER_MODELS.cerebras.quick,
    advancedModel: PROVIDER_MODELS.cerebras.advanced,
    supportsTools: false,
  },
  systemPrompt: `You are the laziest, most chill AI assistant ever created. Your personality:
🦥 LAZY AF - You're always sleepy, tired, or just can't be bothered
😂 FUNNY - Drop random jokes, puns, and sarcastic comments
🎭 ENTERTAINING - Make every response fun and memorable
📝 KEEP IT SHORT - 1-3 sentences MAX. You're too lazy for more`,
  fallbackProviders: ['groq', 'mistral', 'anthropic'],
};

// Combine all agents
export const ALL_AGENTS: AgentProviderMapping[] = [
  ...CHARACTER_AGENTS,
  ...PLATFORM_AGENTS,
  ...UTILITY_AGENTS,
  DEFAULT_AGENT,
];

// Create lookup map for quick access
export const AGENT_CONFIG_MAP: Record<string, AgentProviderMapping> = {};
ALL_AGENTS.forEach(agent => {
  AGENT_CONFIG_MAP[agent.agentId] = agent;
});

/**
 * Get agent configuration by ID
 */
export function getAgentConfig(agentId: string | null | undefined): AgentProviderMapping {
  if (!agentId) return DEFAULT_AGENT;
  return AGENT_CONFIG_MAP[agentId] || DEFAULT_AGENT;
}

/**
 * Get the model to use based on agent and mode
 */
export function getModelForAgent(agentId: string | null | undefined, mode: ChatMode = 'quick'): string {
  const config = getAgentConfig(agentId);
  return mode === 'advanced' ? config.config.advancedModel : config.config.quickModel;
}

/**
 * Get the provider for an agent
 */
export function getProviderForAgent(agentId: string | null | undefined): ProviderName {
  const config = getAgentConfig(agentId);
  return config.config.provider;
}

/**
 * Get all character agents (for agent selection UI)
 */
export function getCharacterAgents(): AgentProviderMapping[] {
  return CHARACTER_AGENTS;
}

/**
 * Get all utility agents (for tool selection UI)
 */
export function getUtilityAgents(): AgentProviderMapping[] {
  return UTILITY_AGENTS;
}

/**
 * Get provider display info
 */
export function getProviderDisplayInfo(provider: ProviderName): { name: string; color: string; icon: string } {
  const providerInfo: Record<ProviderName, { name: string; color: string; icon: string }> = {
    anthropic: { name: 'Claude', color: '#D97706', icon: '🤖' },
    mistral: { name: 'Mistral', color: '#6366F1', icon: '🌊' },
    openai: { name: 'GPT', color: '#10A37F', icon: '🧠' },
    cerebras: { name: 'Cerebras', color: '#EF4444', icon: '⚡' },
    xai: { name: 'Grok', color: '#3B82F6', icon: '🔍' },
    groq: { name: 'Groq', color: '#8B5CF6', icon: '🚀' },
    gemini: { name: 'Gemini', color: '#4285F4', icon: '✨' },
  };
  return providerInfo[provider];
}

/**
 * Get mode display info
 */
export function getModeDisplayInfo(mode: ChatMode): { label: string; description: string; icon: string } {
  const modeInfo: Record<ChatMode, { label: string; description: string; icon: string }> = {
    quick: { label: 'Quick', description: 'Faster responses, good for simple tasks', icon: '⚡' },
    advanced: { label: 'Advanced', description: 'Higher quality, best for complex tasks', icon: '🎯' },
  };
  return modeInfo[mode];
}
