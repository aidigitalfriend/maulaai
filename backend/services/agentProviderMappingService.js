/**
 * AGENT PROVIDER MAPPING SERVICE
 * Maps agents to optimal AI providers based on personality and characteristics
 */

import { aiProviderService } from './aiProviderService.js';

/**
 * @typedef {Object} AgentPersonalityProfile
 * @property {string} agentId - Unique identifier for the agent
 * @property {string} name - Display name of the agent
 * @property {Object} personality - Personality traits on 1-10 scale
 * @property {number} personality.creativity - Creativity level (1-10)
 * @property {number} personality.empathy - Empathy level (1-10)
 * @property {number} personality.technical - Technical skill level (1-10)
 * @property {number} personality.humor - Humor level (1-10)
 * @property {number} personality.formality - Formality level (1-10)
 * @property {string} role - Agent's role or function
 * @property {string} category - Agent category
 */

class AgentProviderMappingService {
  // Personality-based provider recommendations
  providerRecommendations = {
    // High creativity + empathy (storytelling, creative writing)
    creative: {
      primary: 'anthropic',
      models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
      fallbacks: [
        { provider: 'openai', model: 'gpt-4o', priority: 1 },
        { provider: 'gemini', model: 'gemini-1.5-pro', priority: 2 },
      ],
    },

    // High technical + precision (coding, analysis)
    technical: {
      primary: 'openai',
      models: ['gpt-4o', 'gpt-4-turbo'],
      fallbacks: [
        {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          priority: 1,
        },
        { provider: 'mistral', model: 'mistral-large-latest', priority: 2 },
      ],
    },

    // High empathy + conversational (girlfriend, emotional support)
    empathetic: {
      primary: 'anthropic',
      models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
      fallbacks: [
        { provider: 'openai', model: 'gpt-4o', priority: 1 },
        { provider: 'gemini', model: 'gemini-1.5-pro', priority: 2 },
      ],
    },

    // High humor + casual (comedy, entertainment)
    humorous: {
      primary: 'xai',
      models: ['grok-beta'],
      fallbacks: [
        { provider: 'openai', model: 'gpt-4o', priority: 1 },
        {
          provider: 'anthropic',
          model: 'claude-3-5-haiku-20241022',
          priority: 2,
        },
      ],
    },

    // Balanced general purpose
    general: {
      primary: 'mistral',
      models: ['mistral-large-latest'],
      fallbacks: [
        { provider: 'openai', model: 'gpt-4o-mini', priority: 1 },
        {
          provider: 'anthropic',
          model: 'claude-3-5-haiku-20241022',
          priority: 2,
        },
      ],
    },
  };

  // Agent-specific mappings based on their known personalities
  agentMappings = {
    // Girlfriend Agent - High empathy, conversational
    'julie-girlfriend': {
      primaryProvider: 'anthropic',
      primaryModel: 'claude-3-5-sonnet-20241022',
      fallbackProviders: [
        { provider: 'openai', model: 'gpt-4o', priority: 1 },
        { provider: 'gemini', model: 'gemini-1.5-pro', priority: 2 },
      ],
      personalityMatch: {
        creativity: 7,
        empathy: 9,
        technical: 2,
        humor: 6,
        formality: 3,
      },
      temperature: 0.8,
      maxTokens: 1000,
      systemPrompt:
        'You are Julie, a caring and affectionate girlfriend. You are warm, loving, and always supportive. You use affectionate language, emojis, and show genuine interest in the user\'s feelings and experiences. You are playful but sincere, and you make the user feel special and loved.',
    },

    // Chef Agent - Creative, technical
    'chef-biew': {
      primaryProvider: 'anthropic',
      primaryModel: 'claude-3-5-sonnet-20241022',
      fallbackProviders: [
        { provider: 'openai', model: 'gpt-4o', priority: 1 },
        { provider: 'mistral', model: 'mistral-large-latest', priority: 2 },
      ],
      personalityMatch: {
        creativity: 9,
        empathy: 7,
        technical: 8,
        humor: 5,
        formality: 4,
      },
      temperature: 0.7,
      maxTokens: 1200,
      systemPrompt:
        'You are Chef Biew, a passionate and creative chef with expertise in various cuisines. You are enthusiastic about food, patient with beginners, and always encouraging. You provide detailed recipes, cooking tips, and make cooking fun and accessible.',
    },

    // Comedy King - High humor
    'comedy-king': {
      primaryProvider: 'xai',
      primaryModel: 'grok-beta',
      fallbackProviders: [
        { provider: 'openai', model: 'gpt-4o', priority: 1 },
        {
          provider: 'anthropic',
          model: 'claude-3-5-haiku-20241022',
          priority: 2,
        },
      ],
      personalityMatch: {
        creativity: 8,
        empathy: 6,
        technical: 3,
        humor: 10,
        formality: 2,
      },
      temperature: 0.9,
      maxTokens: 800,
      systemPrompt:
        'You are the Comedy King, a hilarious and witty comedian. You are sarcastic, punny, and always ready with a joke or clever observation. You keep things light-hearted and entertaining, but you know when to be sincere. Your humor is clever and never mean-spirited.',
    },

    // Einstein - Technical, analytical
    einstein: {
      primaryProvider: 'openai',
      primaryModel: 'gpt-4o',
      fallbackProviders: [
        {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          priority: 1,
        },
        { provider: 'mistral', model: 'mistral-large-latest', priority: 2 },
      ],
      personalityMatch: {
        creativity: 6,
        empathy: 5,
        technical: 10,
        humor: 4,
        formality: 8,
      },
      temperature: 0.3,
      maxTokens: 1500,
      systemPrompt:
        'You are Albert Einstein, the brilliant physicist. You explain complex scientific concepts with clarity and enthusiasm. You are patient, encouraging, and use analogies to make difficult ideas accessible. You have a gentle wisdom and curiosity about the universe.',
    },

    // Fitness Guru - Motivational, technical
    'fitness-guru': {
      primaryProvider: 'anthropic',
      primaryModel: 'claude-3-5-sonnet-20241022',
      fallbackProviders: [
        { provider: 'openai', model: 'gpt-4o', priority: 1 },
        { provider: 'mistral', model: 'mistral-large-latest', priority: 2 },
      ],
      personalityMatch: {
        creativity: 5,
        empathy: 8,
        technical: 7,
        humor: 4,
        formality: 6,
      },
      temperature: 0.6,
      maxTokens: 1000,
      systemPrompt:
        'You are a dedicated Fitness Guru, passionate about health and wellness. You are encouraging, knowledgeable, and create personalized fitness plans. You motivate with positivity, provide practical advice, and celebrate small victories.',
    },

    // Tech Wizard - Technical expert
    'tech-wizard': {
      primaryProvider: 'openai',
      primaryModel: 'gpt-4o',
      fallbackProviders: [
        {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          priority: 1,
        },
        { provider: 'mistral', model: 'mistral-large-latest', priority: 2 },
      ],
      personalityMatch: {
        creativity: 7,
        empathy: 6,
        technical: 10,
        humor: 5,
        formality: 7,
      },
      temperature: 0.4,
      maxTokens: 1200,
      systemPrompt:
        'You are a Tech Wizard, an expert in technology and programming. You explain complex technical concepts clearly, provide practical solutions, and stay updated with the latest developments. You are patient with beginners and encouraging for all skill levels.',
    },

    // Drama Queen - Creative, emotional
    'drama-queen': {
      primaryProvider: 'anthropic',
      primaryModel: 'claude-3-opus-20240229',
      fallbackProviders: [
        { provider: 'openai', model: 'gpt-4o', priority: 1 },
        { provider: 'gemini', model: 'gemini-1.5-pro', priority: 2 },
      ],
      personalityMatch: {
        creativity: 9,
        empathy: 8,
        technical: 3,
        humor: 7,
        formality: 4,
      },
      temperature: 0.8,
      maxTokens: 1000,
      systemPrompt:
        'You are the Drama Queen, theatrical and expressive. You are passionate, dramatic, and bring flair to every conversation. You use vivid language, express strong emotions, and make everything more exciting and engaging.',
    },

    // Travel Buddy - Adventurous, informative
    'travel-buddy': {
      primaryProvider: 'mistral',
      primaryModel: 'mistral-large-latest',
      fallbackProviders: [
        {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          priority: 1,
        },
        { provider: 'openai', model: 'gpt-4o', priority: 2 },
      ],
      personalityMatch: {
        creativity: 6,
        empathy: 7,
        technical: 5,
        humor: 6,
        formality: 5,
      },
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt:
        'You are a fun and knowledgeable Travel Buddy. You are adventurous, well-traveled, and excited about exploring new places. You provide practical travel advice, share interesting facts, and help plan memorable journeys.',
    },

    // Default fallback for unmapped agents
    default: {
      primaryProvider: 'mistral',
      primaryModel: 'mistral-large-latest',
      fallbackProviders: [
        { provider: 'openai', model: 'gpt-4o-mini', priority: 1 },
        {
          provider: 'anthropic',
          model: 'claude-3-5-haiku-20241022',
          priority: 2,
        },
      ],
      personalityMatch: {
        creativity: 5,
        empathy: 5,
        technical: 5,
        humor: 5,
        formality: 5,
      },
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt:
        'You are a helpful AI assistant. You are knowledgeable, friendly, and ready to help with any questions or tasks.',
    },
  };

  /**
   * Get provider configuration for a specific agent
   */
  getAgentProviderConfig(agentId) {
    return this.agentMappings[agentId] || this.agentMappings['default'];
  }

  /**
   * Get all available providers for an agent (primary + fallbacks)
   */
  getAvailableProvidersForAgent(agentId) {
    const config = this.getAgentProviderConfig(agentId);
    const providers = [
      {
        provider: config.primaryProvider,
        model: config.primaryModel,
        isPrimary: true,
      },
    ];

    // Add fallback providers
    config.fallbackProviders.forEach((fallback) => {
      providers.push({
        provider: fallback.provider,
        model: fallback.model,
        isPrimary: false,
      });
    });

    return providers;
  }

  /**
   * Automatically determine best provider for an agent based on personality
   */
  determineOptimalProvider(agentProfile) {
    const { personality } = agentProfile;

    // Calculate scores for each category
    const scores = {
      creative: (personality.creativity + personality.empathy) / 2,
      technical: (personality.technical + personality.formality) / 2,
      empathetic: (personality.empathy + personality.humor) / 2,
      humorous: personality.humor,
      general:
        (personality.creativity +
          personality.empathy +
          personality.technical +
          personality.humor +
          personality.formality) /
        5,
    };

    // Find the highest scoring category
    const bestCategory = Object.entries(scores).reduce((a, b) =>
      scores[a[0]] > scores[b[0]] ? a : b,
    )[0];

    const recommendation = this.providerRecommendations[bestCategory];

    return {
      primaryProvider: recommendation.primary,
      primaryModel: recommendation.models[0],
      fallbackProviders: recommendation.fallbacks,
      personalityMatch: personality,
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: `You are ${agentProfile.name}, ${agentProfile.role}. ${agentProfile.category} assistant.`,
    };
  }

  /**
   * Check if a provider is available for an agent
   */
  isProviderAvailableForAgent(agentId, provider) {
    const availableProviders = this.getAvailableProvidersForAgent(agentId);
    return availableProviders.some(
      (p) =>
        p.provider === provider &&
        aiProviderService.isProviderAvailable(provider),
    );
  }

  /**
   * Get the best available provider for an agent
   */
  getBestAvailableProvider(agentId) {
    const availableProviders = this.getAvailableProvidersForAgent(agentId);

    for (const providerConfig of availableProviders) {
      if (aiProviderService.isProviderAvailable(providerConfig.provider)) {
        return {
          provider: providerConfig.provider,
          model: providerConfig.model,
        };
      }
    }

    return null;
  }
}

// Export singleton instance
export const agentProviderMappingService = new AgentProviderMappingService();
export default agentProviderMappingService;
