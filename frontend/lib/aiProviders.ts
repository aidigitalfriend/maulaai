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
// 1. [Agent Name] - Anthropic (Primary for character personality)
// 2. Maula AI - Mistral (Platform branding)
// 3. Image Generator - OpenAI (DALL-E)
// 4. Fast Response - Cerebras (Ultra-fast inference)
// 5. Research - xAI (Deep analysis)
// 6. Reasoning (Grok) - xAI (Complex reasoning)
// 7. Multi-Modal - Gemini (Text, image, video understanding)
// ============================================================================

// Helper to create standard agent options (all 7)
// 1. Agent Character → Anthropic (primary for personality)
// 2. Maula AI Platform → Mistral (platform branding)
// 3. Image Generator → OpenAI (DALL-E)
// 4. Fast Response → Cerebras
// 5. Research → xAI
// 6. Reasoning → xAI Grok
// 7. Multi-Modal → Gemini
function createAgentOptions(agentName: string): ProviderModelOption[] {
  return [
    // 1. Agent Character - Anthropic (Primary for agent personality responses)
    {
      provider: 'anthropic',
      label: agentName,
      models: [
        { value: 'claude-sonnet-4-20250514', label: 'Best Quality' },
        { value: 'claude-3-5-haiku-20241022', label: 'Fast Response' },
      ],
    },
    // 2. Maula AI Platform - Mistral (Platform branding)
    {
      provider: 'mistral',
      label: 'Maula AI',
      models: [
        { value: 'mistral-large-latest', label: 'Best Quality' },
        { value: 'mistral-medium-latest', label: 'Balanced' },
        { value: 'mistral-small-latest', label: 'Fast Response' },
      ],
    },
    // 3. Image Generator - OpenAI (DALL-E integration)
    {
      provider: 'openai',
      label: 'Image Generator',
      models: [
        { value: 'gpt-4o', label: 'Best Quality' },
        { value: 'gpt-4o-mini', label: 'Fast Mode' },
      ],
    },
    // 4. Fast Response - Cerebras (Ultra-fast inference)
    {
      provider: 'cerebras',
      label: 'Fast Response',
      models: [
        { value: 'llama-3.3-70b', label: 'Smart & Fast' },
        { value: 'llama3.1-8b', label: 'Ultra Fast' },
      ],
    },
    // 5. Research - xAI (Deep analysis & research)
    {
      provider: 'xai',
      label: 'Research',
      models: [
        { value: 'grok-3', label: 'Advanced Research' },
        { value: 'grok-2', label: 'Deep Analysis' },
      ],
    },
    // 6. Reasoning - xAI Grok (Complex reasoning)
    {
      provider: 'xai',
      label: 'Reasoning (Grok)',
      models: [
        { value: 'grok-3', label: 'Best Reasoning' },
        { value: 'grok-2', label: 'Standard Reasoning' },
      ],
    },
    // 7. Multi-Modal - Gemini (Text, image, video understanding)
    {
      provider: 'gemini',
      label: 'Multi-Modal',
      models: [
        { value: 'gemini-2.0-flash', label: 'Latest Flash' },
        { value: 'gemini-1.5-pro', label: 'Best Quality' },
        { value: 'gemini-1.5-flash', label: 'Fast Response' },
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
// For Canvas Build app - focused on coding with 4 options:
// 1. Code Base - Cerebras (Ultra-fast code generation)
// 2. Code Builder - xAI Grok (Advanced code building)
// 3. Planner - xAI (Task planning & architecture)
// 4. Designer - Gemini (UI/UX & visual design)
// ============================================================================
export function getAgentCanvasProviders(agentId: string, agentName?: string): Record<string, { name: string; models: { id: string; name: string }[] }> {
  // agentId and agentName kept for future per-agent customization
  void agentId;
  void agentName;
  
  return {
    // 1. Code Base - Cerebras (Ultra-fast code generation)
    cerebras: {
      name: 'Code Base',
      models: [
        { id: 'llama-3.3-70b', name: 'Smart Code' },
        { id: 'llama3.1-8b', name: 'Quick Code' },
      ],
    },
    // 2. Code Builder - xAI Grok (Advanced code building)
    xai: {
      name: 'Code Builder',
      models: [
        { id: 'grok-3', name: 'Advanced Builder' },
        { id: 'grok-2', name: 'Standard Builder' },
      ],
    },
    // 3. Planner - xAI (Task planning & architecture)
    'xai-planner': {
      name: 'Planner',
      models: [
        { id: 'grok-3', name: 'Deep Planning' },
        { id: 'grok-2', name: 'Quick Planning' },
      ],
    },
    // 4. Designer - Gemini (UI/UX & visual design)
    gemini: {
      name: 'Designer',
      models: [
        { id: 'gemini-2.0-flash', name: 'Latest Design' },
        { id: 'gemini-1.5-pro', name: 'Best Quality' },
        { id: 'gemini-1.5-flash', name: 'Fast Design' },
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

// Get first provider key for default selection (Universal Chat)
export function getAgentDefaultProvider(agentId: string): string {
  const options = getAgentProviderOptions(agentId);
  return options[0]?.provider || 'anthropic';
}

// Get first model for a provider
export function getAgentDefaultModel(agentId: string, provider?: string): string {
  const options = getAgentProviderOptions(agentId);
  const targetProvider = provider || options[0]?.provider;
  const opt = options.find(o => o.provider === targetProvider);
  return opt?.models[0]?.value || 'claude-sonnet-4-20250514';
}

// Get default provider for Canvas Build (first canvas option = cerebras)
export function getCanvasDefaultProvider(): string {
  return 'cerebras';
}

// Get default model for Canvas Build
export function getCanvasDefaultModel(provider?: string): string {
  const canvasProviders = getAgentCanvasProviders('', '');
  const targetProvider = provider || 'cerebras';
  const models = canvasProviders[targetProvider]?.models;
  return models?.[0]?.id || 'llama-3.3-70b';
}

// ============================================================================
// DEFAULT USER-FRIENDLY AI OPTIONS (Fallback for unknown agents)
// ============================================================================
// 1. AI Assistant → Anthropic (primary for personality)
// 2. Maula AI Platform → Mistral (platform branding)
// 3. Image Generator → OpenAI (DALL-E)
// 4. Fast Response → Cerebras
// 5. Research → xAI
// 6. Reasoning → xAI Grok
// 7. Multi-Modal → Gemini
// ============================================================================
export const PROVIDER_MODEL_OPTIONS: ProviderModelOption[] = [
  // 1. AI Assistant - Anthropic (Primary)
  {
    provider: 'anthropic',
    label: 'AI Assistant',
    models: [
      { value: 'claude-sonnet-4-20250514', label: 'Best Quality' },
      { value: 'claude-3-5-haiku-20241022', label: 'Fast Response' },
    ],
  },
  // 2. Maula AI Platform - Mistral
  {
    provider: 'mistral',
    label: 'Maula AI',
    models: [
      { value: 'mistral-large-latest', label: 'Best Quality' },
      { value: 'mistral-medium-latest', label: 'Balanced' },
      { value: 'mistral-small-latest', label: 'Fast Response' },
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
  // 4. Fast Response - Cerebras
  {
    provider: 'cerebras',
    label: 'Fast Response',
    models: [
      { value: 'llama-3.3-70b', label: 'Smart & Fast' },
      { value: 'llama3.1-8b', label: 'Ultra Fast' },
    ],
  },
  // 5. Research - xAI
  {
    provider: 'xai',
    label: 'Research',
    models: [
      { value: 'grok-3', label: 'Advanced Research' },
      { value: 'grok-2', label: 'Deep Analysis' },
    ],
  },
  // 6. Reasoning - xAI Grok
  {
    provider: 'xai',
    label: 'Reasoning (Grok)',
    models: [
      { value: 'grok-3', label: 'Best Reasoning' },
      { value: 'grok-2', label: 'Standard Reasoning' },
    ],
  },
  // 7. Multi-Modal - Gemini
  {
    provider: 'gemini',
    label: 'Multi-Modal',
    models: [
      { value: 'gemini-2.0-flash', label: 'Latest Flash' },
      { value: 'gemini-1.5-pro', label: 'Best Quality' },
      { value: 'gemini-1.5-flash', label: 'Fast Response' },
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
