/**
 * ========================================
 * AGENT AI PROVIDER SERVICE
 * ========================================
 * 
 * Backend service for routing agent requests to optimal AI providers
 * based on agent personality and provider strengths
 */

import { MultiModalAIService } from './multimodal-ai-service'

export type AIProvider = 'mistral' | 'anthropic' | 'openai' | 'gemini' | 'cohere'

export interface AgentAIConfig {
  agentId: string
  primaryProvider: AIProvider
  fallbackProviders: AIProvider[]
  model: string
  specializedFor: string[]
}

// ========================================
// AGENT-PROVIDER MAPPING
// ========================================

const AGENT_AI_ASSIGNMENTS: Record<string, AgentAIConfig> = {
  // Companion Category - Mistral (Conversational & Empathetic)
  'julie-girlfriend': {
    agentId: 'julie-girlfriend',
    primaryProvider: 'mistral',
    fallbackProviders: ['anthropic', 'openai', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    specializedFor: ['Emotional support', 'Relationship advice', 'Conversational companionship']
  },
  'emma-emotional': {
    agentId: 'emma-emotional',
    primaryProvider: 'mistral',
    fallbackProviders: ['anthropic', 'openai', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    specializedFor: ['Emotional support', 'Mental wellness', 'Empathetic conversations']
  },

  // Technology Category - Anthropic (Technical & Analytical)
  'ben-sega': {
    agentId: 'ben-sega',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'gemini', 'cohere'],
    model: 'claude-3-5-sonnet-20241022',
    specializedFor: ['Code generation', 'Software development', 'Technical architecture']
  },
  'tech-wizard': {
    agentId: 'tech-wizard',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'gemini', 'cohere'],
    model: 'claude-3-5-sonnet-20241022',
    specializedFor: ['Advanced programming', 'System architecture', 'Technology consulting']
  },
  'knight-logic': {
    agentId: 'knight-logic',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'gemini', 'cohere'],
    model: 'claude-3-5-sonnet-20241022',
    specializedFor: ['Logic puzzles', 'Creative problem solving', 'Strategic thinking']
  },

  // Education Category - Anthropic & Gemini
  'einstein': {
    agentId: 'einstein',
    primaryProvider: 'anthropic',
    fallbackProviders: ['gemini', 'openai', 'mistral', 'cohere'],
    model: 'claude-3-5-sonnet-20241022',
    specializedFor: ['Physics', 'Scientific research', 'Mathematical concepts']
  },
  'professor-astrology': {
    agentId: 'professor-astrology',
    primaryProvider: 'gemini',
    fallbackProviders: ['anthropic', 'openai', 'mistral', 'cohere'],
    model: 'gemini-1.5-pro-latest',
    specializedFor: ['Astronomy', 'Space science', 'Research data']
  },

  // Entertainment Category - Mistral (Creative & Fun)
  'comedy-king': {
    agentId: 'comedy-king',
    primaryProvider: 'mistral',
    fallbackProviders: ['openai', 'anthropic', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    specializedFor: ['Humor generation', 'Entertainment', 'Creative comedy']
  },
  'drama-queen': {
    agentId: 'drama-queen',
    primaryProvider: 'mistral',
    fallbackProviders: ['openai', 'anthropic', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    specializedFor: ['Dramatic storytelling', 'Theater arts', 'Creative expression']
  },
  'nid-gaming': {
    agentId: 'nid-gaming',
    primaryProvider: 'mistral',
    fallbackProviders: ['openai', 'anthropic', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    specializedFor: ['Gaming advice', 'Game strategies', 'Gaming culture']
  },

  // Business Category - Mix of Anthropic & Mistral
  'mrs-boss': {
    agentId: 'mrs-boss',
    primaryProvider: 'anthropic',
    fallbackProviders: ['cohere', 'openai', 'mistral', 'gemini'],
    model: 'claude-3-5-sonnet-20241022',
    specializedFor: ['Leadership', 'Business strategy', 'Management']
  },
  'chess-player': {
    agentId: 'chess-player',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'gemini', 'cohere'],
    model: 'claude-3-5-sonnet-20241022',
    specializedFor: ['Strategic thinking', 'Game analysis', 'Pattern recognition']
  },
  'lazy-pawn': {
    agentId: 'lazy-pawn',
    primaryProvider: 'mistral',
    fallbackProviders: ['anthropic', 'openai', 'gemini', 'cohere'],
    model: 'mistral-medium-latest',
    specializedFor: ['Casual business tips', 'Productivity hacks', 'Work-life balance']
  },
  'rook-jokey': {
    agentId: 'rook-jokey',
    primaryProvider: 'mistral',
    fallbackProviders: ['openai', 'anthropic', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    specializedFor: ['Business humor', 'Light business advice', 'Workplace comedy']
  },

  // Health & Wellness - Anthropic (Safety-focused)
  'fitness-guru': {
    agentId: 'fitness-guru',
    primaryProvider: 'anthropic',
    fallbackProviders: ['gemini', 'openai', 'mistral', 'cohere'],
    model: 'claude-3-5-sonnet-20241022',
    specializedFor: ['Fitness training', 'Health advice', 'Wellness coaching']
  },

  // Home & Lifestyle - Mistral & Gemini
  'chef-biew': {
    agentId: 'chef-biew',
    primaryProvider: 'mistral',
    fallbackProviders: ['gemini', 'anthropic', 'openai', 'cohere'],
    model: 'mistral-large-latest',
    specializedFor: ['Cooking recipes', 'Culinary creativity', 'Food culture']
  },
  'travel-buddy': {
    agentId: 'travel-buddy',
    primaryProvider: 'gemini',
    fallbackProviders: ['mistral', 'anthropic', 'openai', 'cohere'],
    model: 'gemini-1.5-pro-latest',
    specializedFor: ['Travel planning', 'Destination information', 'Cultural insights']
  },

  // Creative - Mistral (Creative Excellence)
  'bishop-burger': {
    agentId: 'bishop-burger',
    primaryProvider: 'mistral',
    fallbackProviders: ['openai', 'anthropic', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    specializedFor: ['Creative projects', 'Artistic inspiration', 'Creative problem solving']
  }
}

// ========================================
// AGENT AI PROVIDER SERVICE
// ========================================

export class AgentAIProviderService {
  private multiModalService: MultiModalAIService

  constructor() {
    this.multiModalService = new MultiModalAIService()
  }

  /**
   * Get AI configuration for specific agent
   */
  getAgentAIConfig(agentId: string): AgentAIConfig | null {
    return AGENT_AI_ASSIGNMENTS[agentId] || null
  }

  /**
   * Send chat message using optimal provider for agent
   */
  async sendAgentMessage(
    agentId: string,
    message: string,
    systemPrompt?: string,
    options: {
      temperature?: number
      maxTokens?: number
      forceProvider?: AIProvider
    } = {}
  ) {
    const config = this.getAgentAIConfig(agentId)
    
    if (!config) {
      throw new Error(`No AI configuration found for agent: ${agentId}`)
    }

    // Use forced provider if specified, otherwise use agent's primary provider
    const provider = options.forceProvider || config.primaryProvider
    const model = config.model

    try {
      console.log(`[AgentAI] ${agentId} -> ${provider} (${model})`)
      
      const response = await this.multiModalService.getChatResponse(
        message,
        agentId,
        {
          provider,
          model,
          temperature: options.temperature || 0.7,
          maxTokens: options.maxTokens || 1500
        }
      )

      return {
        response: response.text,
        provider: response.provider,
        model: response.model,
        tokensUsed: response.tokensUsed,
        latency: response.latency,
        agentConfig: config
      }
    } catch (error) {
      console.error(`[AgentAI] Error with ${provider} for ${agentId}:`, error)
      
      // Try fallback providers
      for (const fallbackProvider of config.fallbackProviders) {
        try {
          console.log(`[AgentAI] Trying fallback: ${agentId} -> ${fallbackProvider}`)
          
          const fallbackResponse = await this.multiModalService.getChatResponse(
            message,
            agentId,
            {
              provider: fallbackProvider,
              model: this.getFallbackModel(fallbackProvider),
              temperature: options.temperature || 0.7,
              maxTokens: options.maxTokens || 1500
            }
          )

          return {
            response: fallbackResponse.text,
            provider: fallbackResponse.provider,
            model: fallbackResponse.model,
            tokensUsed: fallbackResponse.tokensUsed,
            latency: fallbackResponse.latency,
            agentConfig: config,
            usedFallback: true
          }
        } catch (fallbackError) {
          console.error(`[AgentAI] Fallback ${fallbackProvider} failed for ${agentId}:`, fallbackError)
          continue
        }
      }

      throw new Error(`All AI providers failed for agent ${agentId}`)
    }
  }

  /**
   * Get fallback model for provider
   */
  private getFallbackModel(provider: AIProvider): string {
    const fallbackModels: Record<AIProvider, string> = {
      mistral: 'mistral-large-latest',
      anthropic: 'claude-3-5-sonnet-20241022',
      openai: 'gpt-4o-mini',
      gemini: 'gemini-1.5-flash-latest',
      cohere: 'command-nightly'
    }
    return fallbackModels[provider]
  }

  /**
   * Get all agents using a specific provider
   */
  getAgentsByProvider(provider: AIProvider): AgentAIConfig[] {
    return Object.values(AGENT_AI_ASSIGNMENTS).filter(
      config => config.primaryProvider === provider
    )
  }

  /**
   * Get provider statistics
   */
  getProviderStats() {
    const stats: Record<AIProvider, number> = {
      mistral: 0,
      anthropic: 0,
      openai: 0,
      gemini: 0,
      cohere: 0
    }

    Object.values(AGENT_AI_ASSIGNMENTS).forEach(config => {
      stats[config.primaryProvider]++
    })

    return stats
  }

  /**
   * List all configured agents
   */
  getAllAgentIds(): string[] {
    return Object.keys(AGENT_AI_ASSIGNMENTS)
  }

  /**
   * Check if agent has AI configuration
   */
  hasAIConfig(agentId: string): boolean {
    return agentId in AGENT_AI_ASSIGNMENTS
  }
}

// Export singleton instance
export const agentAIService = new AgentAIProviderService()

export default agentAIService