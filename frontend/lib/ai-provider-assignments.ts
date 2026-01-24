/**
 * ========================================
 * AI PROVIDER ASSIGNMENT STRATEGY
 * ========================================
 * 
 * Optimal AI provider assignments for each agent based on:
 * - Personality traits and use cases
 * - Provider strengths and specialties
 * - Response style requirements
 * 
 * Priority: Mistral > Anthropic > OpenAI > Gemini > Cohere
 */

export type AIProvider = 'mistral' | 'anthropic' | 'openai' | 'gemini' | 'cohere'

export interface AgentProviderConfig {
  agentId: string
  name: string
  category: string
  primaryProvider: AIProvider
  fallbackProviders: AIProvider[]
  model: string
  reasoning: string
  specializedFor: string[]
}

// ========================================
// PROVIDER STRENGTHS ANALYSIS
// ========================================

export const PROVIDER_STRENGTHS = {
  mistral: {
    strengths: ['Conversational AI', 'Creative writing', 'Multilingual', 'Fast responses', 'Code generation'],
    bestFor: ['Companions', 'Creative agents', 'Gaming', 'Entertainment'],
    personality: 'Natural, conversational, creative'
  },
  anthropic: {
    strengths: ['Reasoning', 'Analysis', 'Safety', 'Complex problem solving', 'Educational content'],
    bestFor: ['Education', 'Business', 'Professional advice', 'Health & wellness'],
    personality: 'Thoughtful, analytical, responsible'
  },
  openai: {
    strengths: ['General purpose', 'Coding', 'Creative writing', 'Multimodal', 'Versatile'],
    bestFor: ['Technology', 'Development', 'Creative projects', 'General assistance'],
    personality: 'Versatile, helpful, technical'
  },
  gemini: {
    strengths: ['Multimodal', 'Real-time data', 'Search integration', 'Factual accuracy'],
    bestFor: ['Research', 'Information retrieval', 'Data analysis', 'Current events'],
    personality: 'Factual, comprehensive, research-oriented'
  },
  cohere: {
    strengths: ['Enterprise AI', 'Embeddings', 'Classification', 'Specialized tasks'],
    bestFor: ['Business intelligence', 'Data processing', 'Classification tasks'],
    personality: 'Professional, task-focused'
  }
}

// ========================================
// AGENT-PROVIDER ASSIGNMENTS
// ========================================

export const AGENT_PROVIDER_ASSIGNMENTS: AgentProviderConfig[] = [
  // ===== COMPANION CATEGORY =====
  {
    agentId: 'julie-girlfriend',
    name: 'Julie Girlfriend',
    category: 'Companion',
    primaryProvider: 'mistral',
    fallbackProviders: ['anthropic', 'openai', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    reasoning: 'Mistral excels at conversational AI with natural, warm responses perfect for companion interactions',
    specializedFor: ['Emotional support', 'Relationship advice', 'Conversational companionship']
  },
  {
    agentId: 'emma-emotional',
    name: 'Emma Emotional',
    category: 'Companion',
    primaryProvider: 'mistral',
    fallbackProviders: ['anthropic', 'openai', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    reasoning: 'Emotional intelligence and empathetic responses are Mistral\'s strength for companion agents',
    specializedFor: ['Emotional support', 'Mental wellness', 'Empathetic conversations']
  },

  // ===== TECHNOLOGY CATEGORY =====
  {
    agentId: 'ben-sega',
    name: 'Ben Sega',
    category: 'Technology',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'gemini', 'cohere'],
    model: 'claude-sonnet-4-20250514',
    reasoning: 'Anthropic Claude excels at coding, technical analysis, and complex problem-solving for development tasks',
    specializedFor: ['Code generation', 'Software development', 'Technical architecture', 'Debugging']
  },
  {
    agentId: 'tech-wizard',
    name: 'Tech Wizard',
    category: 'Technology',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'gemini', 'cohere'],
    model: 'claude-sonnet-4-20250514',
    reasoning: 'Advanced technical knowledge and reasoning capabilities make Anthropic ideal for tech expertise',
    specializedFor: ['Advanced programming', 'System architecture', 'Technology consulting', 'Innovation']
  },
  {
    agentId: 'knight-logic',
    name: 'Knight Logic',
    category: 'Technology',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'gemini', 'cohere'],
    model: 'claude-sonnet-4-20250514',
    reasoning: 'Complex logical reasoning and creative problem-solving align perfectly with Anthropic\'s strengths',
    specializedFor: ['Logic puzzles', 'Creative problem solving', 'Strategic thinking', 'Innovation']
  },

  // ===== EDUCATION CATEGORY =====
  {
    agentId: 'einstein',
    name: 'Albert Einstein',
    category: 'Education',
    primaryProvider: 'anthropic',
    fallbackProviders: ['gemini', 'openai', 'mistral', 'cohere'],
    model: 'claude-sonnet-4-20250514',
    reasoning: 'Complex scientific concepts and educational content require Anthropic\'s advanced reasoning capabilities',
    specializedFor: ['Physics', 'Scientific research', 'Mathematical concepts', 'Educational explanations']
  },
  {
    agentId: 'professor-astrology',
    name: 'Professor Astrology',
    category: 'Education',
    primaryProvider: 'gemini',
    fallbackProviders: ['anthropic', 'openai', 'mistral', 'cohere'],
    model: 'gemini-2.0-flash',
    reasoning: 'Gemini\'s access to real-time data and research capabilities make it ideal for astronomical information',
    specializedFor: ['Astronomy', 'Space science', 'Research data', 'Educational content']
  },

  // ===== ENTERTAINMENT CATEGORY =====
  {
    agentId: 'comedy-king',
    name: 'Comedy King',
    category: 'Entertainment',
    primaryProvider: 'mistral',
    fallbackProviders: ['openai', 'anthropic', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    reasoning: 'Creative humor and entertaining conversations are where Mistral shines for entertainment agents',
    specializedFor: ['Humor generation', 'Entertainment', 'Creative comedy', 'Interactive fun']
  },
  {
    agentId: 'drama-queen',
    name: 'Drama Queen',
    category: 'Entertainment',
    primaryProvider: 'mistral',
    fallbackProviders: ['openai', 'anthropic', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    reasoning: 'Dramatic storytelling and theatrical responses benefit from Mistral\'s creative capabilities',
    specializedFor: ['Dramatic storytelling', 'Theater arts', 'Creative expression', 'Performance']
  },
  {
    agentId: 'nid-gaming',
    name: 'Nid Gaming',
    category: 'Entertainment',
    primaryProvider: 'mistral',
    fallbackProviders: ['openai', 'anthropic', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    reasoning: 'Gaming conversations and interactive entertainment align with Mistral\'s conversational strengths',
    specializedFor: ['Gaming advice', 'Game strategies', 'Gaming culture', 'Interactive entertainment']
  },

  // ===== BUSINESS CATEGORY =====
  {
    agentId: 'mrs-boss',
    name: 'Mrs Boss',
    category: 'Business',
    primaryProvider: 'anthropic',
    fallbackProviders: ['cohere', 'openai', 'mistral', 'gemini'],
    model: 'claude-sonnet-4-20250514',
    reasoning: 'Professional business advice and leadership guidance require Anthropic\'s analytical and safety-focused approach',
    specializedFor: ['Leadership', 'Business strategy', 'Management', 'Professional development']
  },
  {
    agentId: 'chess-player',
    name: 'Chess Player',
    category: 'Business',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'gemini', 'cohere'],
    model: 'claude-sonnet-4-20250514',
    reasoning: 'Strategic thinking and complex game analysis benefit from Anthropic\'s reasoning capabilities',
    specializedFor: ['Strategic thinking', 'Game analysis', 'Pattern recognition', 'Tactical planning']
  },
  {
    agentId: 'lazy-pawn',
    name: 'Lazy Pawn',
    category: 'Business',
    primaryProvider: 'mistral',
    fallbackProviders: ['anthropic', 'openai', 'gemini', 'cohere'],
    model: 'mistral-medium-latest',
    reasoning: 'Casual business advice with a relaxed personality fits Mistral\'s conversational style',
    specializedFor: ['Casual business tips', 'Productivity hacks', 'Work-life balance', 'Relaxed consulting']
  },
  {
    agentId: 'rook-jokey',
    name: 'Rook Jokey',
    category: 'Business',
    primaryProvider: 'mistral',
    fallbackProviders: ['openai', 'anthropic', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    reasoning: 'Business advice with humor requires Mistral\'s creative and conversational abilities',
    specializedFor: ['Business humor', 'Light business advice', 'Workplace comedy', 'Fun strategies']
  },

  // ===== HEALTH & WELLNESS CATEGORY =====
  {
    agentId: 'fitness-guru',
    name: 'Fitness Guru',
    category: 'Health & Wellness',
    primaryProvider: 'anthropic',
    fallbackProviders: ['gemini', 'openai', 'mistral', 'cohere'],
    model: 'claude-sonnet-4-20250514',
    reasoning: 'Health and fitness advice requires accurate, responsible information that Anthropic provides safely',
    specializedFor: ['Fitness training', 'Health advice', 'Wellness coaching', 'Exercise science']
  },

  // ===== HOME & LIFESTYLE CATEGORY =====
  {
    agentId: 'chef-biew',
    name: 'Chef Biew',
    category: 'Home & Lifestyle',
    primaryProvider: 'mistral',
    fallbackProviders: ['gemini', 'anthropic', 'openai', 'cohere'],
    model: 'mistral-large-latest',
    reasoning: 'Creative cooking and lifestyle advice benefit from Mistral\'s creative and conversational approach',
    specializedFor: ['Cooking recipes', 'Culinary creativity', 'Food culture', 'Kitchen tips']
  },
  {
    agentId: 'travel-buddy',
    name: 'Travel Buddy',
    category: 'Home & Lifestyle',
    primaryProvider: 'gemini',
    fallbackProviders: ['mistral', 'anthropic', 'openai', 'cohere'],
    model: 'gemini-2.0-flash',
    reasoning: 'Travel advice benefits from Gemini\'s access to current information and real-time data about destinations',
    specializedFor: ['Travel planning', 'Destination information', 'Cultural insights', 'Current travel data']
  },

  // ===== CREATIVE CATEGORY =====
  {
    agentId: 'bishop-burger',
    name: 'Bishop Burger',
    category: 'Creative',
    primaryProvider: 'mistral',
    fallbackProviders: ['openai', 'anthropic', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    reasoning: 'Creative and artistic conversations align perfectly with Mistral\'s creative capabilities',
    specializedFor: ['Creative projects', 'Artistic inspiration', 'Creative problem solving', 'Design thinking']
  }
]

// ========================================
// UTILITY FUNCTIONS
// ========================================

export function getAgentProviderConfig(agentId: string): AgentProviderConfig | null {
  return AGENT_PROVIDER_ASSIGNMENTS.find(config => config.agentId === agentId) || null
}

export function getProvidersByCategory(category: string): AgentProviderConfig[] {
  return AGENT_PROVIDER_ASSIGNMENTS.filter(config => config.category === category)
}

export function getMistralAgents(): AgentProviderConfig[] {
  return AGENT_PROVIDER_ASSIGNMENTS.filter(config => config.primaryProvider === 'mistral')
}

export function getAnthropicAgents(): AgentProviderConfig[] {
  return AGENT_PROVIDER_ASSIGNMENTS.filter(config => config.primaryProvider === 'anthropic')
}

export function getGeminiAgents(): AgentProviderConfig[] {
  return AGENT_PROVIDER_ASSIGNMENTS.filter(config => config.primaryProvider === 'gemini')
}

export function getOpenAIAgents(): AgentProviderConfig[] {
  return AGENT_PROVIDER_ASSIGNMENTS.filter(config => config.primaryProvider === 'openai')
}

export function getAllAgentIds(): string[] {
  return AGENT_PROVIDER_ASSIGNMENTS.map(config => config.agentId)
}

// ========================================
// PROVIDER STATISTICS
// ========================================

export function getProviderStats() {
  const stats = {
    mistral: 0,
    anthropic: 0,
    openai: 0,
    gemini: 0,
    cohere: 0
  }

  AGENT_PROVIDER_ASSIGNMENTS.forEach(config => {
    stats[config.primaryProvider]++
  })

  return stats
}

// ========================================
// EXPORT FOR BACKEND INTEGRATION
// ========================================

export default {
  AGENT_PROVIDER_ASSIGNMENTS,
  PROVIDER_STRENGTHS,
  getAgentProviderConfig,
  getProvidersByCategory,
  getProviderStats
}