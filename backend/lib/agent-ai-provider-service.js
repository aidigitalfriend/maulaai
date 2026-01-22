import { MultiModalAIService } from './multimodal-ai-service.js';
const AGENT_AI_ASSIGNMENTS = {
  // Companion Category - OpenAI (Conversational & Empathetic)
  'julie-girlfriend': {
    agentId: 'julie-girlfriend',
    // OpenAI primary for girlfriend-style companion
    primaryProvider: 'openai',
    // Fallback: Anthropic → xAI → Mistral → Gemini
    fallbackProviders: ['anthropic', 'xai', 'mistral', 'gemini'],
    model: 'gpt-4o',
    specializedFor: [
      'Emotional support',
      'Relationship advice',
      'Conversational companionship',
    ],
  },
  'emma-emotional': {
    agentId: 'emma-emotional',
    primaryProvider: 'openai',
    fallbackProviders: ['anthropic', 'xai', 'mistral', 'gemini'],
    model: 'gpt-4o',
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
    // Anthropic primary, then OpenAI → Mistral → xAI → Gemini
    fallbackProviders: ['openai', 'mistral', 'xai', 'gemini'],
    model: 'claude-3-5-sonnet-20241022',
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
    model: 'claude-3-5-sonnet-20241022',
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
    model: 'claude-3-5-sonnet-20241022',
    specializedFor: [
      'Logic puzzles',
      'Creative problem solving',
      'Strategic thinking',
    ],
  },
  // Education Category - Anthropic First
  einstein: {
    agentId: 'einstein',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'xai', 'gemini'],
    model: 'claude-3-5-sonnet-20241022',
    specializedFor: ['Physics', 'Scientific research', 'Mathematical concepts'],
  },
  'professor-astrology': {
    agentId: 'professor-astrology',
    primaryProvider: 'mistral',
    fallbackProviders: ['anthropic', 'openai', 'xai'],
    model: 'mistral-large-latest',
    specializedFor: ['Astrology', 'Mystical guidance', 'Cosmic wisdom'],
  },
  // Entertainment Category - Mistral (Creative & Fun)
  'comedy-king': {
    agentId: 'comedy-king',
    primaryProvider: 'mistral',
    // Mistral primary, then OpenAI → Anthropic → xAI → Gemini
    fallbackProviders: ['openai', 'anthropic', 'xai', 'gemini'],
    model: 'mistral-large-latest',
    specializedFor: ['Humor generation', 'Entertainment', 'Creative comedy'],
  },
  'drama-queen': {
    agentId: 'drama-queen',
    primaryProvider: 'mistral',
    fallbackProviders: ['openai', 'anthropic', 'xai', 'gemini'],
    model: 'mistral-large-latest',
    specializedFor: [
      'Dramatic storytelling',
      'Theater arts',
      'Creative expression',
    ],
  },
  'nid-gaming': {
    agentId: 'nid-gaming',
    primaryProvider: 'groq',
    fallbackProviders: ['mistral', 'xai', 'openai'],
    model: 'llama-3.3-70b-versatile',
    specializedFor: ['Gaming advice', 'Game strategies', 'Gaming culture'],
  },
  // Business Category - Mix of Anthropic & Mistral
  'mrs-boss': {
    agentId: 'mrs-boss',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'xai', 'gemini'],
    model: 'claude-3-5-sonnet-20241022',
    specializedFor: ['Leadership', 'Business strategy', 'Management'],
  },
  'chess-player': {
    agentId: 'chess-player',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'xai', 'gemini'],
    model: 'claude-3-5-sonnet-20241022',
    specializedFor: [
      'Strategic thinking',
      'Game analysis',
      'Pattern recognition',
    ],
  },
  'lazy-pawn': {
    agentId: 'lazy-pawn',
    primaryProvider: 'groq',
    fallbackProviders: ['mistral', 'openai', 'anthropic'],
    model: 'llama-3.3-70b-versatile',
    specializedFor: [
      'Efficient solutions',
      'Productivity hacks',
      'Smart shortcuts',
    ],
  },
  'rook-jokey': {
    agentId: 'rook-jokey',
    primaryProvider: 'mistral',
    fallbackProviders: ['openai', 'anthropic', 'xai', 'gemini'],
    model: 'mistral-large-latest',
    specializedFor: [
      'Business humor',
      'Light business advice',
      'Workplace comedy',
    ],
  },
  // Health & Wellness - Anthropic (Safety-focused)
  'fitness-guru': {
    agentId: 'fitness-guru',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'xai', 'gemini'],
    model: 'claude-3-5-sonnet-20241022',
    specializedFor: ['Fitness training', 'Health advice', 'Wellness coaching'],
  },
  // Home & Lifestyle - Mistral First
  'chef-biew': {
    agentId: 'chef-biew',
    primaryProvider: 'mistral',
    fallbackProviders: ['openai', 'anthropic', 'xai', 'gemini'],
    model: 'mistral-large-latest',
    specializedFor: ['Cooking recipes', 'Culinary creativity', 'Food culture'],
  },
  'travel-buddy': {
    agentId: 'travel-buddy',
    primaryProvider: 'mistral',
    fallbackProviders: ['openai', 'anthropic', 'xai', 'gemini'],
    model: 'mistral-large-latest',
    specializedFor: [
      'Travel planning',
      'Destination information',
      'Cultural insights',
    ],
  },
  // Creative - Mistral (Creative Excellence)
  'bishop-burger': {
    agentId: 'bishop-burger',
    primaryProvider: 'mistral',
    fallbackProviders: ['openai', 'anthropic', 'xai', 'gemini'],
    model: 'mistral-large-latest',
    specializedFor: [
      'Creative projects',
      'Artistic inspiration',
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
var agent_ai_provider_service_default = agentAIService;
export {
  AgentAIProviderService,
  agentAIService,
  agent_ai_provider_service_default as default,
};
