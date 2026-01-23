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
// Standard Structure for ALL agents (7 options):
// 1. [Agent Name] - Cerebras (Primary Default)
// 2. Maula AI - Groq
// 3. Image Generator - OpenAI
// 4. Code Writing - Anthropic
// 5. Planner - Mistral
// 6. Research Helper - XAI
// 7. Creative Mind - Gemini
// ============================================================================

// Helper to create standard agent options (all 7)
function createAgentOptions(agentName: string): ProviderModelOption[] {
  return [
    // 1. Agent Primary - Cerebras
    {
      provider: 'cerebras',
      label: agentName,
      models: [
        { value: 'llama3.1-8b', label: 'Quick Response' },
        { value: 'llama-3.3-70b', label: 'Smart Response' },
      ],
    },
    // 2. Maula AI - Groq
    {
      provider: 'groq',
      label: 'Maula AI',
      models: [
        { value: 'llama-3.1-8b-instant', label: 'Instant Response' },
        { value: 'llama-3.3-70b-versatile', label: 'Balanced Response' },
      ],
    },
    // 3. Image Generator - OpenAI
    {
      provider: 'openai',
      label: 'Image Generator',
      models: [
        { value: 'gpt-4o', label: 'Best Quality' },
        { value: 'gpt-4o-mini', label: 'Fast Mode' },
      ],
    },
    // 4. Code Writing - Anthropic
    {
      provider: 'anthropic',
      label: 'Code Writing',
      models: [
        { value: 'claude-sonnet-4-20250514', label: 'Advanced Code' },
        { value: 'claude-3-haiku-20240307', label: 'Quick Code' },
      ],
    },
    // 5. Planner - Mistral
    {
      provider: 'mistral',
      label: 'Planner',
      models: [
        { value: 'mistral-medium-latest', label: 'Detailed Planning' },
        { value: 'mistral-small-latest', label: 'Quick Planning' },
      ],
    },
    // 6. Research Helper - XAI
    {
      provider: 'xai',
      label: 'Research Helper',
      models: [
        { value: 'grok-2', label: 'Deep Analysis' },
        { value: 'grok-3', label: 'Advanced Research' },
      ],
    },
    // 7. Creative Mind - Gemini
    {
      provider: 'gemini',
      label: 'Creative Mind',
      models: [
        { value: 'gemini-1.5-flash', label: 'Fast Creative' },
        { value: 'gemini-1.5-pro', label: 'Deep Creative' },
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
// 5. LAZY PAWN - Casual & Relaxed
// ============================================================================
const LAZY_PAWN_OPTIONS = createAgentOptions('Lazy Pawn');

// ============================================================================
// 6. KNIGHT LOGIC - Logical Thinking (Business)
// ============================================================================
const KNIGHT_LOGIC_OPTIONS = createAgentOptions('Knight Logic');

// ============================================================================
// 7. ROOK JOKEY - Humor & Games
// ============================================================================
const ROOK_JOKEY_OPTIONS = createAgentOptions('Rook Jokey');

// ============================================================================
// 8. BISHOP BURGER - Food & Cooking
// ============================================================================
const BISHOP_BURGER_OPTIONS = createAgentOptions('Bishop Burger');

// ============================================================================
// 9. EMMA EMOTIONAL - Emotional Support (Companion)
// ============================================================================
const EMMA_EMOTIONAL_OPTIONS = createAgentOptions('Emma Emotional');

// ============================================================================
// 10. JULIE GIRLFRIEND - Virtual Companion
// ============================================================================
const JULIE_GIRLFRIEND_OPTIONS = createAgentOptions('Julie Girlfriend');

// ============================================================================
// 11. MRS BOSS - Business Leadership
// ============================================================================
const MRS_BOSS_OPTIONS = createAgentOptions('Mrs Boss');

// ============================================================================
// 12. PROFESSOR ASTROLOGY - Mystical & Astrology
// ============================================================================
const PROFESSOR_ASTROLOGY_OPTIONS = createAgentOptions('Professor Astrology');

// ============================================================================
// 13. NID GAMING - Gaming & Esports
// ============================================================================
const NID_GAMING_OPTIONS = createAgentOptions('Nid Gaming');

// ============================================================================
// 14. CHEF BIEW - Cooking & Recipes
// ============================================================================
const CHEF_BIEW_OPTIONS = createAgentOptions('Chef Biew');

// ============================================================================
// 15. BEN SEGA - Retro Gaming
// ============================================================================
const BEN_SEGA_OPTIONS = createAgentOptions('Ben Sega');

// ============================================================================
// 16. TECH WIZARD - Technology & Coding
// ============================================================================
const TECH_WIZARD_OPTIONS = createAgentOptions('Tech Wizard');

// ============================================================================
// 17. FITNESS GURU - Health & Fitness
// ============================================================================
const FITNESS_GURU_OPTIONS = createAgentOptions('Fitness Guru');

// ============================================================================
// 18. TRAVEL BUDDY - Travel & Adventure
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
// For Canvas app - focused on coding with 3 options:
// 1. [Agent Name] - Cerebras
// 2. Maula AI - Groq  
// 3. Better Quality - Gemini
// ============================================================================
export function getAgentCanvasProviders(agentId: string, agentName?: string): Record<string, { name: string; models: { id: string; name: string }[] }> {
  const displayName = agentName || getAgentDisplayName(agentId);
  
  return {
    cerebras: {
      name: displayName,
      models: [
        { id: 'llama3.1-8b', name: 'Quick Response' },
        { id: 'llama-3.3-70b', name: 'Smart Response' },
      ],
    },
    groq: {
      name: 'Maula AI',
      models: [
        { id: 'llama-3.1-8b-instant', name: 'Instant Response' },
        { id: 'llama-3.3-70b-versatile', name: 'Balanced Response' },
      ],
    },
    gemini: {
      name: 'Better Quality',
      models: [
        { id: 'gemini-1.5-flash', name: 'Fast & Smart' },
        { id: 'gemini-1.5-pro', name: 'Best Quality' },
      ],
    },
    anthropic: {
      name: 'Code Expert',
      models: [
        { id: 'claude-sonnet-4-20250514', name: 'Advanced Code' },
        { id: 'claude-3-haiku-20240307', name: 'Quick Code' },
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
// DEFAULT USER-FRIENDLY AI OPTIONS (Fallback for unknown agents)
// ============================================================================
export const PROVIDER_MODEL_OPTIONS: ProviderModelOption[] = [
  {
    provider: 'cerebras',
    label: 'AI Assistant',
    models: [
      { value: 'llama3.1-8b', label: 'Quick Response' },
      { value: 'llama-3.3-70b', label: 'Smart Response' },
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
    label: 'Code Writing',
    models: [
      { value: 'claude-sonnet-4-20250514', label: 'Advanced Code' },
      { value: 'claude-3-haiku-20240307', label: 'Quick Code' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Planner',
    models: [
      { value: 'mistral-medium-latest', label: 'Detailed Planning' },
      { value: 'mistral-small-latest', label: 'Quick Planning' },
    ],
  },
  {
    provider: 'xai',
    label: 'Research Helper',
    models: [
      { value: 'grok-2', label: 'Deep Analysis' },
    ],
  },
  {
    provider: 'gemini',
    label: 'Creative Mind',
    models: [
      { value: 'gemini-2.0-flash', label: 'Fast Creative' },
      { value: 'gemini-1.5-pro', label: 'Deep Creative' },
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
