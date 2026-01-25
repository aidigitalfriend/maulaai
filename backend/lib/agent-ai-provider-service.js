import { MultiModalAIService } from './multimodal-ai-service.js';

// All agents now use Anthropic Claude Sonnet 4 as primary for best quality
const AGENT_AI_ASSIGNMENTS = {
  // Companion Category - Anthropic (Best for empathy & conversation)
  'julie-girlfriend': {
    agentId: 'julie-girlfriend',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'xai', 'mistral', 'gemini'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: [
      'Emotional support',
      'Relationship conversation',
      'Intimate companionship',
    ],
  },
  'emma-emotional': {
    agentId: 'emma-emotional',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'xai', 'mistral', 'gemini'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: [
      'Emotional support',
      'Mental wellness',
      'Empathetic conversations',
    ],
  },
  // Technology Category - Anthropic (Technical & Analytical)
  'ben-sega': {
    agentId: 'ben-sega',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'xai', 'gemini'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: [
      'Code generation',
      'Software development',
      'Technical architecture',
    ],
  },
  'tech-wizard': {
    agentId: 'tech-wizard',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'xai', 'gemini'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: [
      'Advanced programming',
      'System architecture',
      'Technology consulting',
    ],
  },
  'knight-logic': {
    agentId: 'knight-logic',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'xai', 'gemini'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: [
      'Logic puzzles',
      'Creative problem solving',
      'Strategic thinking',
    ],
  },
  // Education Category - Anthropic
  einstein: {
    agentId: 'einstein',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'xai', 'gemini'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: ['Physics', 'Scientific research', 'Mathematical concepts'],
  },
  'professor-astrology': {
    agentId: 'professor-astrology',
    primaryProvider: 'anthropic',
    fallbackProviders: ['mistral', 'openai', 'xai'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: ['Astrology', 'Mystical guidance', 'Cosmic wisdom'],
  },
  // Entertainment Category - Anthropic (Creative & Fun)
  'comedy-king': {
    agentId: 'comedy-king',
    primaryProvider: 'anthropic',
    fallbackProviders: ['mistral', 'openai', 'xai', 'gemini'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: ['Humor generation', 'Entertainment', 'Creative comedy'],
  },
  'drama-queen': {
    agentId: 'drama-queen',
    primaryProvider: 'anthropic',
    fallbackProviders: ['mistral', 'openai', 'xai', 'gemini'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: [
      'Dramatic storytelling',
      'Theater arts',
      'Creative expression',
    ],
  },
  'nid-gaming': {
    agentId: 'nid-gaming',
    primaryProvider: 'anthropic',
    fallbackProviders: ['groq', 'mistral', 'xai', 'openai'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: ['Gaming advice', 'Game strategies', 'Gaming culture'],
  },
  // Business Category - Anthropic
  'mrs-boss': {
    agentId: 'mrs-boss',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'xai', 'gemini'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: ['Leadership', 'Business strategy', 'Management'],
  },
  'chess-player': {
    agentId: 'chess-player',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'xai', 'gemini'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: [
      'Strategic thinking',
      'Game analysis',
      'Pattern recognition',
    ],
  },
  'lazy-pawn': {
    agentId: 'lazy-pawn',
    primaryProvider: 'anthropic',
    fallbackProviders: ['groq', 'mistral', 'openai'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: [
      'Efficient solutions',
      'Productivity hacks',
      'Smart shortcuts',
    ],
  },
  'rook-jokey': {
    agentId: 'rook-jokey',
    primaryProvider: 'anthropic',
    fallbackProviders: ['mistral', 'openai', 'xai', 'gemini'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: [
      'Witty truth-telling',
      'Honest feedback',
      'Sarcastic wisdom',
    ],
  },
  // Health & Wellness - Anthropic
  'fitness-guru': {
    agentId: 'fitness-guru',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'xai', 'gemini'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: ['Fitness training', 'Health advice', 'Wellness coaching'],
  },
  // Home & Lifestyle - Anthropic
  'chef-biew': {
    agentId: 'chef-biew',
    primaryProvider: 'anthropic',
    fallbackProviders: ['mistral', 'openai', 'xai', 'gemini'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: ['Cooking recipes', 'Culinary creativity', 'Food culture'],
  },
  'travel-buddy': {
    agentId: 'travel-buddy',
    primaryProvider: 'anthropic',
    fallbackProviders: ['mistral', 'openai', 'xai', 'gemini'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: [
      'Travel planning',
      'Destination information',
      'Cultural insights',
    ],
  },
  // Creative - Anthropic
  'bishop-burger': {
    agentId: 'bishop-burger',
    primaryProvider: 'anthropic',
    fallbackProviders: ['mistral', 'openai', 'xai', 'gemini'],
    model: 'claude-sonnet-4-20250514',
    specializedFor: [
      'Burger philosophy',
      'Food metaphors',
      'Creative problem solving',
    ],
  },
};
class AgentAIProviderService {
  multiModalService;
  constructor() {
    this.multiModalService = new MultiModalAIService();
  }
  /**
   * Get AI configuration for specific agent
   */
  getAgentAIConfig(agentId) {
    return AGENT_AI_ASSIGNMENTS[agentId] || null;
  }
  /**
   * Send chat message using optimal provider for agent
   */
  async sendAgentMessage(agentId, message, systemPrompt, options = {}) {
    const config = this.getAgentAIConfig(agentId);
    if (!config) {
      throw new Error(`No AI configuration found for agent: ${agentId}`);
    }
    const provider = options.forceProvider || config.primaryProvider;
    const model = options.model || config.model;
    try {
      console.log(`[AgentAI] ${agentId} -> ${provider} (${model})`);
      const response = await this.multiModalService.getChatResponse(
        message,
        agentId,
        {
          provider,
          model,
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 1500,
        }
      );
      return {
        response: response.text,
        provider: response.provider,
        model: response.model,
        tokensUsed: response.tokensUsed,
        latency: response.latency,
        agentConfig: config,
      };
    } catch (error) {
      console.error(`[AgentAI] Error with ${provider} for ${agentId}:`, error);
      for (const fallbackProvider of config.fallbackProviders) {
        try {
          console.log(
            `[AgentAI] Trying fallback: ${agentId} -> ${fallbackProvider}`
          );
          const fallbackResponse = await this.multiModalService.getChatResponse(
            message,
            agentId,
            {
              provider: fallbackProvider,
              model: this.getFallbackModel(fallbackProvider),
              temperature: options.temperature || 0.7,
              maxTokens: options.maxTokens || 1500,
            }
          );
          return {
            response: fallbackResponse.text,
            provider: fallbackResponse.provider,
            model: fallbackResponse.model,
            tokensUsed: fallbackResponse.tokensUsed,
            latency: fallbackResponse.latency,
            agentConfig: config,
            usedFallback: true,
          };
        } catch (fallbackError) {
          console.error(
            `[AgentAI] Fallback ${fallbackProvider} failed for ${agentId}:`,
            fallbackError
          );
          continue;
        }
      }
      throw new Error(`All AI providers failed for agent ${agentId}`);
    }
  }
  /**
   * Get fallback model for provider
   */
  getFallbackModel(provider) {
    const fallbackModels = {
      mistral: 'mistral-large-latest',
      anthropic: 'claude-3-5-sonnet-20241022',
      openai: 'gpt-4o-mini',
      gemini: 'gemini-1.5-flash-latest',
      cohere: 'command-nightly',
      xai: 'grok-2',
      groq: 'llama-3.3-70b-versatile',
    };
    return fallbackModels[provider];
  }
  /**
   * Get all agents using a specific provider
   */
  getAgentsByProvider(provider) {
    return Object.values(AGENT_AI_ASSIGNMENTS).filter(
      (config) => config.primaryProvider === provider
    );
  }
  /**
   * Get provider statistics
   */
  getProviderStats() {
    const stats = {
      mistral: 0,
      anthropic: 0,
      openai: 0,
      gemini: 0,
      cohere: 0,
      xai: 0,
      groq: 0,
    };
    Object.values(AGENT_AI_ASSIGNMENTS).forEach((config) => {
      stats[config.primaryProvider]++;
    });
    return stats;
  }
  /**
   * List all configured agents
   */
  getAllAgentIds() {
    return Object.keys(AGENT_AI_ASSIGNMENTS);
  }
  /**
   * Check if agent has AI configuration
   */
  hasAIConfig(agentId) {
    return agentId in AGENT_AI_ASSIGNMENTS;
  }
}
const agentAIService = new AgentAIProviderService();
const agent_ai_provider_service_default = agentAIService;
export {
  AgentAIProviderService,
  agentAIService,
  agent_ai_provider_service_default as default,
};
