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
// Universal Structure for ALL agents with MULTIPLE models per provider:
// 1. [Agent Name] - Anthropic Claude (Character/Personality AI)
// 2. Maula AI - Mistral (Platform Branding)
// 3. Image Generator - OpenAI (Best for image generation/vision)
// 4. Code Builder - Cerebras (Fastest for code)
// 5. Fast Response - Groq (Ultra-fast inference)
// 6. Planner - xAI Grok (Strategic planning)
// 7. Research Helper - xAI Grok (Deep analysis & search)
// ============================================================================

// Helper to create standard agent options with agent-specific name
function createAgentOptions(agentName: string): ProviderModelOption[] {
  return [
    // 1. Agent Character - Anthropic Claude (Multiple models)
    {
      provider: 'anthropic',
      label: agentName,
      models: [
        { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (Latest)' },
        { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Most Capable)' },
        { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
        { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fast)' },
      ],
    },
    // 2. Maula AI - Mistral (Multiple models)
    {
      provider: 'mistral',
      label: 'Maula AI',
      models: [
        { value: 'mistral-large-latest', label: 'Mistral Large (Best)' },
        { value: 'mistral-medium-latest', label: 'Mistral Medium' },
        { value: 'mistral-small-latest', label: 'Mistral Small (Fast)' },
        { value: 'open-mistral-nemo', label: 'Mistral Nemo' },
        { value: 'codestral-latest', label: 'Codestral (Code)' },
      ],
    },
    // 3. Image Generator - OpenAI (Multiple models)
    {
      provider: 'openai',
      label: 'Image Generator',
      models: [
        { value: 'gpt-4o', label: 'GPT-4o (Best Vision)' },
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        { value: 'gpt-4', label: 'GPT-4' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Economy)' },
        { value: 'o1-preview', label: 'o1 Preview (Reasoning)' },
        { value: 'o1-mini', label: 'o1 Mini (Fast Reasoning)' },
      ],
    },
    // 4. Code Builder - Cerebras (Multiple models)
    {
      provider: 'cerebras',
      label: 'Code Builder',
      models: [
        { value: 'llama-3.3-70b', label: 'Llama 3.3 70B (Best)' },
        { value: 'llama3.1-70b', label: 'Llama 3.1 70B' },
        { value: 'llama3.1-8b', label: 'Llama 3.1 8B (Fast)' },
      ],
    },
    // 5. Fast Response - Groq (Multiple models)
    {
      provider: 'groq',
      label: 'Fast Response',
      models: [
        { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Best)' },
        { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B' },
        { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Instant)' },
        { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
        { value: 'gemma2-9b-it', label: 'Gemma 2 9B' },
      ],
    },
    // 6. Planner - xAI Grok (Multiple models)
    {
      provider: 'xai',
      label: 'Planner',
      models: [
        { value: 'grok-3', label: 'Grok 3 (Latest)' },
        { value: 'grok-3-mini', label: 'Grok 3 Mini (Fast)' },
        { value: 'grok-2', label: 'Grok 2' },
        { value: 'grok-2-mini', label: 'Grok 2 Mini' },
      ],
    },
    // 7. Research Helper - xAI Grok (Multiple models)
    {
      provider: 'xai',
      label: 'Research Helper',
      models: [
        { value: 'grok-3', label: 'Grok 3 (Deep Analysis)' },
        { value: 'grok-3-mini', label: 'Grok 3 Mini (Quick)' },
        { value: 'grok-2', label: 'Grok 2' },
        { value: 'grok-2-mini', label: 'Grok 2 Mini' },
      ],
    },
  ];
}

// ============================================================================
// 1. EINSTEIN - Theoretical Physicist (Education)
// ============================================================================
const EINSTEIN_OPTIONS = createAgentOptions('Albert Einstein');

// ============================================================================
// 2. CHESS PLAYER - Strategic Thinker (Business)
// ============================================================================
const CHESS_PLAYER_OPTIONS = createAgentOptions('Chess Player');

// ============================================================================
// 3. COMEDY KING - Humor & Entertainment
// ============================================================================
const COMEDY_KING_OPTIONS = createAgentOptions('Comedy King');

// ============================================================================
// 4. DRAMA QUEEN - Emotional Expression (Entertainment)
// ============================================================================
const DRAMA_QUEEN_OPTIONS = createAgentOptions('Drama Queen');

// ============================================================================
// 5. LAZY PAWN - Casual & Relaxed (Entertainment)
// ============================================================================
const LAZY_PAWN_OPTIONS = createAgentOptions('Lazy Pawn');

// ============================================================================
// 6. KNIGHT LOGIC - Problem Solver (Business)
// ============================================================================
const KNIGHT_LOGIC_OPTIONS = createAgentOptions('Knight Logic');

// ============================================================================
// 7. ROOK JOKEY - Direct Communication (Companion)
// ============================================================================
const ROOK_JOKEY_OPTIONS = createAgentOptions('Rook Jokey');

// ============================================================================
// 8. BISHOP BURGER - Culinary Arts (Home & Lifestyle)
// ============================================================================
const BISHOP_BURGER_OPTIONS = createAgentOptions('Bishop Burger');

// ============================================================================
// 9. EMMA EMOTIONAL - Emotional Intelligence (Health & Wellness)
// ============================================================================
const EMMA_EMOTIONAL_OPTIONS = createAgentOptions('Emma Emotional');

// ============================================================================
// 10. JULIE GIRLFRIEND - Companion & Chat
// ============================================================================
const JULIE_GIRLFRIEND_OPTIONS = createAgentOptions('Julie Girlfriend');

// ============================================================================
// 11. MRS BOSS - Leadership & Management (Business)
// ============================================================================
const MRS_BOSS_OPTIONS = createAgentOptions('Mrs Boss');

// ============================================================================
// 12. PROFESSOR ASTROLOGY - Mysticism (Entertainment)
// ============================================================================
const PROFESSOR_ASTROLOGY_OPTIONS = createAgentOptions('Professor Astrology');

// ============================================================================
// 13. NID GAMING - Gaming Expert (Entertainment)
// ============================================================================
const NID_GAMING_OPTIONS = createAgentOptions('Nid Gaming');

// ============================================================================
// 14. CHEF BIEW - Cooking Expert (Home & Lifestyle)
// ============================================================================
const CHEF_BIEW_OPTIONS = createAgentOptions('Chef Biew');

// ============================================================================
// 15. BEN SEGA - Retro Gaming (Entertainment)
// ============================================================================
const BEN_SEGA_OPTIONS = createAgentOptions('Ben Sega');

// ============================================================================
// 16. TECH WIZARD - Technology Expert (Technology)
// ============================================================================
const TECH_WIZARD_OPTIONS = createAgentOptions('Tech Wizard');

// ============================================================================
// 17. FITNESS GURU - Health & Fitness (Health & Wellness)
// ============================================================================
const FITNESS_GURU_OPTIONS = createAgentOptions('Fitness Guru');

// ============================================================================
// 18. TRAVEL BUDDY - Travel Expert (Home & Lifestyle)
// ============================================================================
const TRAVEL_BUDDY_OPTIONS = createAgentOptions('Travel Buddy');

// ============================================================================
// GET AGENT-SPECIFIC PROVIDER OPTIONS
// ============================================================================
export function getAgentProviderOptions(agentId: string): ProviderModelOption[] {
  switch (agentId) {
    // Education & Science
    case 'einstein':
      return EINSTEIN_OPTIONS;
    
    // Business & Strategy
    case 'chess-player':
      return CHESS_PLAYER_OPTIONS;
    case 'knight-logic':
      return KNIGHT_LOGIC_OPTIONS;
    case 'mrs-boss':
      return MRS_BOSS_OPTIONS;
    
    // Entertainment & Humor
    case 'comedy-king':
      return COMEDY_KING_OPTIONS;
    case 'drama-queen':
      return DRAMA_QUEEN_OPTIONS;
    case 'lazy-pawn':
      return LAZY_PAWN_OPTIONS;
    case 'rook-jokey':
      return ROOK_JOKEY_OPTIONS;
    case 'professor-astrology':
      return PROFESSOR_ASTROLOGY_OPTIONS;
    
    // Gaming
    case 'nid-gaming':
      return NID_GAMING_OPTIONS;
    case 'ben-sega':
      return BEN_SEGA_OPTIONS;
    
    // Companions
    case 'emma-emotional':
      return EMMA_EMOTIONAL_OPTIONS;
    case 'julie-girlfriend':
      return JULIE_GIRLFRIEND_OPTIONS;
    
    // Home & Lifestyle
    case 'bishop-burger':
      return BISHOP_BURGER_OPTIONS;
    case 'chef-biew':
      return CHEF_BIEW_OPTIONS;
    case 'travel-buddy':
      return TRAVEL_BUDDY_OPTIONS;
    
    // Technology
    case 'tech-wizard':
      return TECH_WIZARD_OPTIONS;
    
    // Health & Wellness
    case 'fitness-guru':
      return FITNESS_GURU_OPTIONS;
    
    // Default fallback
    default:
      return PROVIDER_MODEL_OPTIONS;
  }
}

// ============================================================================
// GET AGENT-SPECIFIC CANVAS PROVIDER OPTIONS
// ============================================================================
// For Canvas app - same 7 options as chat with multiple models
// ============================================================================
export function getAgentCanvasProviders(agentId: string, agentName?: string): Record<string, { name: string; models: { id: string; name: string }[] }> {
  const displayName = agentName || getAgentDisplayName(agentId);
  
  return {
    // 1. [Agent Name] - Anthropic Claude (Multiple models)
    anthropic: {
      name: displayName,
      models: [
        { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4 (Latest)' },
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku (Fast)' },
      ],
    },
    // 2. Maula AI - Mistral (Multiple models)
    mistral: {
      name: 'Maula AI',
      models: [
        { id: 'mistral-large-latest', name: 'Mistral Large' },
        { id: 'mistral-medium-latest', name: 'Mistral Medium' },
        { id: 'mistral-small-latest', name: 'Mistral Small' },
        { id: 'codestral-latest', name: 'Codestral (Code)' },
      ],
    },
    // 3. Image Generator - OpenAI (Multiple models)
    openai: {
      name: 'Image Generator',
      models: [
        { id: 'gpt-4o', name: 'GPT-4o (Best)' },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
        { id: 'o1-mini', name: 'o1 Mini (Reasoning)' },
      ],
    },
    // 4. Code Builder - Cerebras (Multiple models)
    cerebras: {
      name: 'Code Builder',
      models: [
        { id: 'llama-3.3-70b', name: 'Llama 3.3 70B (Best)' },
        { id: 'llama3.1-70b', name: 'Llama 3.1 70B' },
        { id: 'llama3.1-8b', name: 'Llama 3.1 8B (Fast)' },
      ],
    },
    // 5. Fast Response - Groq (Multiple models)
    groq: {
      name: 'Fast Response',
      models: [
        { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
        { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Instant)' },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
      ],
    },
    // 6. Planner - xAI Grok (Multiple models)
    xai: {
      name: 'Planner',
      models: [
        { id: 'grok-3', name: 'Grok 3 (Latest)' },
        { id: 'grok-3-mini', name: 'Grok 3 Mini' },
        { id: 'grok-2', name: 'Grok 2' },
      ],
    },
  };
}

// ============================================================================
// HELPER: Get Agent Display Name
// ============================================================================
export function getAgentDisplayName(agentId: string): string {
  const names: Record<string, string> = {
    'einstein': 'Albert Einstein',
    'chess-player': 'Chess Player',
    'comedy-king': 'Comedy King',
    'drama-queen': 'Drama Queen',
    'lazy-pawn': 'Lazy Pawn',
    'knight-logic': 'Knight Logic',
    'rook-jokey': 'Rook Jokey',
    'bishop-burger': 'Bishop Burger',
    'emma-emotional': 'Emma Emotional',
    'julie-girlfriend': 'Julie Girlfriend',
    'mrs-boss': 'Mrs Boss',
    'professor-astrology': 'Professor Astrology',
    'nid-gaming': 'Nid Gaming',
    'chef-biew': 'Chef Biew',
    'ben-sega': 'Ben Sega',
    'tech-wizard': 'Tech Wizard',
    'fitness-guru': 'Fitness Guru',
    'travel-buddy': 'Travel Buddy',
  };
  return names[agentId] || 'AI Assistant';
}

// Get first provider key for default selection (Anthropic Claude by default)
export function getAgentDefaultProvider(agentId: string): string {
  const options = getAgentProviderOptions(agentId);
  return options[0]?.provider || 'anthropic';
}

// Get first model for a provider (Claude by default)
export function getAgentDefaultModel(agentId: string, provider?: string): string {
  const options = getAgentProviderOptions(agentId);
  const targetProvider = provider || options[0]?.provider;
  const opt = options.find(o => o.provider === targetProvider);
  return opt?.models[0]?.value || 'claude-sonnet-4-20250514';
}

// ============================================================================
// DEFAULT USER-FRIENDLY AI OPTIONS (Fallback for unknown agents)
// ============================================================================
export const PROVIDER_MODEL_OPTIONS: ProviderModelOption[] = [
  // 1. AI Assistant - Anthropic Claude (Multiple models)
  {
    provider: 'anthropic',
    label: 'AI Assistant',
    models: [
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (Latest)' },
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Most Capable)' },
      { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
      { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fast)' },
    ],
  },
  // 2. Maula AI - Mistral (Multiple models)
  {
    provider: 'mistral',
    label: 'Maula AI',
    models: [
      { value: 'mistral-large-latest', label: 'Mistral Large (Best)' },
      { value: 'mistral-medium-latest', label: 'Mistral Medium' },
      { value: 'mistral-small-latest', label: 'Mistral Small (Fast)' },
      { value: 'open-mistral-nemo', label: 'Mistral Nemo' },
      { value: 'codestral-latest', label: 'Codestral (Code)' },
    ],
  },
  // 3. Image Generator - OpenAI (Multiple models)
  {
    provider: 'openai',
    label: 'Image Generator',
    models: [
      { value: 'gpt-4o', label: 'GPT-4o (Best Vision)' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt-4', label: 'GPT-4' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Economy)' },
      { value: 'o1-preview', label: 'o1 Preview (Reasoning)' },
      { value: 'o1-mini', label: 'o1 Mini (Fast Reasoning)' },
    ],
  },
  // 4. Code Builder - Cerebras (Multiple models)
  {
    provider: 'cerebras',
    label: 'Code Builder',
    models: [
      { value: 'llama-3.3-70b', label: 'Llama 3.3 70B (Best)' },
      { value: 'llama3.1-70b', label: 'Llama 3.1 70B' },
      { value: 'llama3.1-8b', label: 'Llama 3.1 8B (Fast)' },
    ],
  },
  // 5. Fast Response - Groq (Multiple models)
  {
    provider: 'groq',
    label: 'Fast Response',
    models: [
      { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Best)' },
      { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B' },
      { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Instant)' },
      { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
      { value: 'gemma2-9b-it', label: 'Gemma 2 9B' },
    ],
  },
  // 6. Planner - xAI Grok (Multiple models)
  {
    provider: 'xai',
    label: 'Planner',
    models: [
      { value: 'grok-3', label: 'Grok 3 (Latest)' },
      { value: 'grok-3-mini', label: 'Grok 3 Mini (Fast)' },
      { value: 'grok-2', label: 'Grok 2' },
      { value: 'grok-2-mini', label: 'Grok 2 Mini' },
    ],
  },
  // 7. Research Helper - xAI Grok (Multiple models)
  {
    provider: 'xai',
    label: 'Research Helper',
    models: [
      { value: 'grok-3', label: 'Grok 3 (Deep Analysis)' },
      { value: 'grok-3-mini', label: 'Grok 3 Mini (Quick)' },
      { value: 'grok-2', label: 'Grok 2' },
      { value: 'grok-2-mini', label: 'Grok 2 Mini' },
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
  {
    provider: 'gemini',
    label: 'Google',
    models: [
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    ],
  },
];
