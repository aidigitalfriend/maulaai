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
// Structure for ALL agents:
// 1. [Agent Name] - Cerebras (Primary Default)
// 2. Maula AI - Groq (Secondary Default)
// 3. Specialized options based on agent personality
// ============================================================================

// Helper to create standard agent options
function createAgentOptions(
  agentName: string,
  specialOptions: ProviderModelOption[] = []
): ProviderModelOption[] {
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
    // 3+ Agent-specific specialized options
    ...specialOptions,
  ];
}

// ============================================================================
// 1. EINSTEIN - Theoretical Physicist (Education)
// ============================================================================
const EINSTEIN_OPTIONS = createAgentOptions('Albert Einstein', [
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
]);

// ============================================================================
// 2. CHESS PLAYER - Strategic Thinker (Business)
// ============================================================================
const CHESS_PLAYER_OPTIONS = createAgentOptions('Chess Player', [
  {
    provider: 'anthropic',
    label: 'Strategic Thinker',
    models: [
      { value: 'claude-sonnet-4-20250514', label: 'Deep Strategy' },
      { value: 'claude-3-haiku-20240307', label: 'Quick Tactics' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Planner',
    models: [
      { value: 'mistral-medium-latest', label: 'Game Analysis' },
      { value: 'mistral-small-latest', label: 'Quick Moves' },
    ],
  },
  {
    provider: 'xai',
    label: 'Research Helper',
    models: [
      { value: 'grok-2', label: 'Deep Analysis' },
    ],
  },
]);

// ============================================================================
// 3. COMEDY KING - Humor & Entertainment
// ============================================================================
const COMEDY_KING_OPTIONS = createAgentOptions('Comedy King', [
  {
    provider: 'openai',
    label: 'Image Generator',
    models: [
      { value: 'gpt-4o', label: 'Meme Creator' },
      { value: 'gpt-4o-mini', label: 'Quick Jokes' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Story Writer',
    models: [
      { value: 'mistral-medium-latest', label: 'Comedy Scripts' },
      { value: 'mistral-small-latest', label: 'Quick Jokes' },
    ],
  },
  {
    provider: 'xai',
    label: 'Wit Master',
    models: [
      { value: 'grok-2', label: 'Clever Humor' },
    ],
  },
]);

// ============================================================================
// 4. DRAMA QUEEN - Emotional Expression (Entertainment)
// ============================================================================
const DRAMA_QUEEN_OPTIONS = createAgentOptions('Drama Queen', [
  {
    provider: 'openai',
    label: 'Image Generator',
    models: [
      { value: 'gpt-4o', label: 'Dramatic Scenes' },
      { value: 'gpt-4o-mini', label: 'Quick Drama' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Story Writer',
    models: [
      { value: 'mistral-medium-latest', label: 'Drama Scripts' },
      { value: 'mistral-small-latest', label: 'Quick Scenes' },
    ],
  },
]);

// ============================================================================
// 5. LAZY PAWN - Casual & Relaxed (Entertainment)
// ============================================================================
const LAZY_PAWN_OPTIONS = createAgentOptions('Lazy Pawn', [
  {
    provider: 'mistral',
    label: 'Chill Helper',
    models: [
      { value: 'mistral-small-latest', label: 'Low Effort' },
      { value: 'mistral-medium-latest', label: 'Slightly More Effort' },
    ],
  },
]);

// ============================================================================
// 6. KNIGHT LOGIC - Problem Solver (Business)
// ============================================================================
const KNIGHT_LOGIC_OPTIONS = createAgentOptions('Knight Logic', [
  {
    provider: 'anthropic',
    label: 'Code Builder',
    models: [
      { value: 'claude-sonnet-4-20250514', label: 'Advanced Logic' },
      { value: 'claude-3-haiku-20240307', label: 'Quick Logic' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Planner',
    models: [
      { value: 'mistral-medium-latest', label: 'Strategic Planning' },
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
]);

// ============================================================================
// 7. ROOK JOKEY - Direct Communication (Companion)
// ============================================================================
const ROOK_JOKEY_OPTIONS = createAgentOptions('Rook Jokey', [
  {
    provider: 'mistral',
    label: 'Witty Writer',
    models: [
      { value: 'mistral-medium-latest', label: 'Clever Responses' },
      { value: 'mistral-small-latest', label: 'Quick Wit' },
    ],
  },
  {
    provider: 'xai',
    label: 'Direct Talker',
    models: [
      { value: 'grok-2', label: 'Straight Talk' },
    ],
  },
]);

// ============================================================================
// 8. BISHOP BURGER - Culinary Arts (Home & Lifestyle)
// ============================================================================
const BISHOP_BURGER_OPTIONS = createAgentOptions('Bishop Burger', [
  {
    provider: 'openai',
    label: 'Image Generator',
    models: [
      { value: 'gpt-4o', label: 'Food Photos' },
      { value: 'gpt-4o-mini', label: 'Quick Food Pics' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Recipe Writer',
    models: [
      { value: 'mistral-medium-latest', label: 'Detailed Recipes' },
      { value: 'mistral-small-latest', label: 'Quick Recipes' },
    ],
  },
]);

// ============================================================================
// 9. EMMA EMOTIONAL - Emotional Intelligence (Health & Wellness)
// ============================================================================
const EMMA_EMOTIONAL_OPTIONS = createAgentOptions('Emma Emotional', [
  {
    provider: 'openai',
    label: 'Empathy Expert',
    models: [
      { value: 'gpt-4o', label: 'Deep Understanding' },
      { value: 'gpt-4o-mini', label: 'Quick Support' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Story Writer',
    models: [
      { value: 'mistral-medium-latest', label: 'Emotional Stories' },
      { value: 'mistral-small-latest', label: 'Quick Comfort' },
    ],
  },
]);

// ============================================================================
// 10. JULIE GIRLFRIEND - Companion & Chat
// ============================================================================
const JULIE_GIRLFRIEND_OPTIONS = createAgentOptions('Julie Girlfriend', [
  {
    provider: 'openai',
    label: 'Image Generator',
    models: [
      { value: 'gpt-4o', label: 'Best Quality' },
      { value: 'gpt-4o-mini', label: 'Quick Pics' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Story Writer',
    models: [
      { value: 'mistral-medium-latest', label: 'Romantic Stories' },
      { value: 'mistral-small-latest', label: 'Quick Chat' },
    ],
  },
]);

// ============================================================================
// 11. MRS BOSS - Leadership & Management (Business)
// ============================================================================
const MRS_BOSS_OPTIONS = createAgentOptions('Mrs Boss', [
  {
    provider: 'anthropic',
    label: 'Strategic Advisor',
    models: [
      { value: 'claude-sonnet-4-20250514', label: 'Executive Strategy' },
      { value: 'claude-3-haiku-20240307', label: 'Quick Decisions' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Planner',
    models: [
      { value: 'mistral-medium-latest', label: 'Business Planning' },
      { value: 'mistral-small-latest', label: 'Quick Tasks' },
    ],
  },
  {
    provider: 'xai',
    label: 'Research Helper',
    models: [
      { value: 'grok-2', label: 'Market Analysis' },
    ],
  },
]);

// ============================================================================
// 12. PROFESSOR ASTROLOGY - Mysticism (Entertainment)
// ============================================================================
const PROFESSOR_ASTROLOGY_OPTIONS = createAgentOptions('Professor Astrology', [
  {
    provider: 'openai',
    label: 'Image Generator',
    models: [
      { value: 'gpt-4o', label: 'Cosmic Art' },
      { value: 'gpt-4o-mini', label: 'Quick Stars' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Story Writer',
    models: [
      { value: 'mistral-medium-latest', label: 'Horoscope Writing' },
      { value: 'mistral-small-latest', label: 'Quick Readings' },
    ],
  },
]);

// ============================================================================
// 13. NID GAMING - Gaming Expert (Entertainment)
// ============================================================================
const NID_GAMING_OPTIONS = createAgentOptions('Nid Gaming', [
  {
    provider: 'openai',
    label: 'Image Generator',
    models: [
      { value: 'gpt-4o', label: 'Game Art' },
      { value: 'gpt-4o-mini', label: 'Quick Graphics' },
    ],
  },
  {
    provider: 'anthropic',
    label: 'Code Builder',
    models: [
      { value: 'claude-sonnet-4-20250514', label: 'Game Code' },
      { value: 'claude-3-haiku-20240307', label: 'Quick Scripts' },
    ],
  },
  {
    provider: 'xai',
    label: 'Strategy Helper',
    models: [
      { value: 'grok-2', label: 'Game Analysis' },
    ],
  },
]);

// ============================================================================
// 14. CHEF BIEW - Cooking Expert (Home & Lifestyle)
// ============================================================================
const CHEF_BIEW_OPTIONS = createAgentOptions('Chef Biew', [
  {
    provider: 'openai',
    label: 'Image Generator',
    models: [
      { value: 'gpt-4o', label: 'Food Photography' },
      { value: 'gpt-4o-mini', label: 'Quick Food Pics' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Recipe Writer',
    models: [
      { value: 'mistral-medium-latest', label: 'Detailed Recipes' },
      { value: 'mistral-small-latest', label: 'Quick Recipes' },
    ],
  },
]);

// ============================================================================
// 15. BEN SEGA - Retro Gaming (Entertainment)
// ============================================================================
const BEN_SEGA_OPTIONS = createAgentOptions('Ben Sega', [
  {
    provider: 'openai',
    label: 'Image Generator',
    models: [
      { value: 'gpt-4o', label: 'Retro Art' },
      { value: 'gpt-4o-mini', label: 'Quick Pixels' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Story Writer',
    models: [
      { value: 'mistral-medium-latest', label: 'Retro Stories' },
      { value: 'mistral-small-latest', label: 'Quick Nostalgia' },
    ],
  },
  {
    provider: 'xai',
    label: 'Gaming Expert',
    models: [
      { value: 'grok-2', label: 'Game Analysis' },
    ],
  },
]);

// ============================================================================
// 16. TECH WIZARD - Technology Expert (Technology)
// ============================================================================
const TECH_WIZARD_OPTIONS = createAgentOptions('Tech Wizard', [
  {
    provider: 'anthropic',
    label: 'Code Builder',
    models: [
      { value: 'claude-sonnet-4-20250514', label: 'Advanced Code' },
      { value: 'claude-3-haiku-20240307', label: 'Quick Code' },
    ],
  },
  {
    provider: 'openai',
    label: 'Image Generator',
    models: [
      { value: 'gpt-4o', label: 'Tech Diagrams' },
      { value: 'gpt-4o-mini', label: 'Quick Visuals' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Planner',
    models: [
      { value: 'mistral-medium-latest', label: 'Tech Planning' },
      { value: 'mistral-small-latest', label: 'Quick Specs' },
    ],
  },
  {
    provider: 'xai',
    label: 'Research Helper',
    models: [
      { value: 'grok-2', label: 'Tech Research' },
    ],
  },
]);

// ============================================================================
// 17. FITNESS GURU - Health & Fitness (Health & Wellness)
// ============================================================================
const FITNESS_GURU_OPTIONS = createAgentOptions('Fitness Guru', [
  {
    provider: 'openai',
    label: 'Image Generator',
    models: [
      { value: 'gpt-4o', label: 'Workout Visuals' },
      { value: 'gpt-4o-mini', label: 'Quick Diagrams' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Planner',
    models: [
      { value: 'mistral-medium-latest', label: 'Workout Plans' },
      { value: 'mistral-small-latest', label: 'Quick Routines' },
    ],
  },
]);

// ============================================================================
// 18. TRAVEL BUDDY - Travel Expert (Home & Lifestyle)
// ============================================================================
const TRAVEL_BUDDY_OPTIONS = createAgentOptions('Travel Buddy', [
  {
    provider: 'openai',
    label: 'Image Generator',
    models: [
      { value: 'gpt-4o', label: 'Destination Photos' },
      { value: 'gpt-4o-mini', label: 'Quick Pics' },
    ],
  },
  {
    provider: 'mistral',
    label: 'Planner',
    models: [
      { value: 'mistral-medium-latest', label: 'Trip Planning' },
      { value: 'mistral-small-latest', label: 'Quick Itinerary' },
    ],
  },
  {
    provider: 'xai',
    label: 'Research Helper',
    models: [
      { value: 'grok-2', label: 'Destination Research' },
    ],
  },
]);

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
    label: 'Code Builder',
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
