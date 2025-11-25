/**
 * ========================================
 * AGENT AI CHAT INTEGRATION
 * ========================================
 * 
 * Frontend helper for sending messages to agents
 * with optimal AI provider selection
 */

import { AIProvider } from './ai-provider-assignments'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface AgentChatOptions {
  temperature?: number
  maxTokens?: number
  forceProvider?: AIProvider
}

export interface AgentChatResponse {
  response: string
  agent: {
    id: string
    specializedFor: string[]
  }
  ai: {
    provider: AIProvider
    model: string
    usedFallback: boolean
    primaryProvider: AIProvider
    fallbacks: AIProvider[]
  }
  metrics: {
    tokensUsed?: number
    latency: number
    timestamp: string
  }
}

export interface AgentConfig {
  agentId: string
  config: {
    agentId: string
    primaryProvider: AIProvider
    fallbackProviders: AIProvider[]
    model: string
    specializedFor: string[]
  }
  hasConfiguration: boolean
}

export interface AgentProviderStats {
  totalAgents: number
  configuredAgents: string[]
  providerStats: Record<AIProvider, number>
  providers: {
    mistralAgents: string[]
    anthropicAgents: string[]
    openaiAgents: string[]
    geminiAgents: string[]
    cohereAgents: string[]
  }
}

// ========================================
// CHAT FUNCTIONS
// ========================================

/**
 * Send message to agent using optimal AI provider
 */
export async function sendMessageToAgent(
  agentId: string,
  message: string,
  options: AgentChatOptions = {}
): Promise<AgentChatResponse> {
  try {
    const response = await fetch('/api/agents/optimized', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId,
        message,
        options
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`[Agent Chat] Error for ${agentId}:`, error)
    throw error
  }
}

/**
 * Get agent AI configuration
 */
export async function getAgentConfig(agentId: string): Promise<AgentConfig> {
  try {
    const response = await fetch(`/api/agents/optimized?agentId=${encodeURIComponent(agentId)}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`[Agent Config] Error for ${agentId}:`, error)
    throw error
  }
}

/**
 * Get all agent configurations and provider statistics
 */
export async function getAgentProviderStats(): Promise<AgentProviderStats> {
  try {
    const response = await fetch('/api/agents/optimized')
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[Agent Stats] Error:', error)
    throw error
  }
}

// ========================================
// SPECIALIZED AGENT HELPERS
// ========================================

/**
 * Chat with Julie Girlfriend (Companion - Mistral)
 */
export function chatWithJulie(message: string, options?: AgentChatOptions) {
  return sendMessageToAgent('julie-girlfriend', message, {
    temperature: 0.8,
    maxTokens: 1200,
    ...options
  })
}

/**
 * Chat with Ben Sega (Tech - Anthropic)
 */
export function chatWithBen(message: string, options?: AgentChatOptions) {
  return sendMessageToAgent('ben-sega', message, {
    temperature: 0.7,
    maxTokens: 2000,
    ...options
  })
}

/**
 * Chat with Einstein (Education - Anthropic)
 */
export function chatWithEinstein(message: string, options?: AgentChatOptions) {
  return sendMessageToAgent('einstein', message, {
    temperature: 0.6,
    maxTokens: 2500,
    ...options
  })
}

/**
 * Chat with Comedy King (Entertainment - Mistral)
 */
export function chatWithComedyKing(message: string, options?: AgentChatOptions) {
  return sendMessageToAgent('comedy-king', message, {
    temperature: 0.9,
    maxTokens: 1500,
    ...options
  })
}

/**
 * Chat with Travel Buddy (Lifestyle - Gemini)
 */
export function chatWithTravelBuddy(message: string, options?: AgentChatOptions) {
  return sendMessageToAgent('travel-buddy', message, {
    temperature: 0.7,
    maxTokens: 1800,
    ...options
  })
}

/**
 * Chat with Mrs Boss (Business - Anthropic)
 */
export function chatWithMrsBoss(message: string, options?: AgentChatOptions) {
  return sendMessageToAgent('mrs-boss', message, {
    temperature: 0.6,
    maxTokens: 2000,
    ...options
  })
}

// ========================================
// BATCH OPERATIONS
// ========================================

/**
 * Send same message to multiple agents for comparison
 */
export async function compareAgentResponses(
  agentIds: string[],
  message: string,
  options?: AgentChatOptions
): Promise<Record<string, AgentChatResponse | Error>> {
  const results: Record<string, AgentChatResponse | Error> = {}

  await Promise.allSettled(
    agentIds.map(async (agentId) => {
      try {
        results[agentId] = await sendMessageToAgent(agentId, message, options)
      } catch (error) {
        results[agentId] = error as Error
      }
    })
  )

  return results
}

/**
 * Test all agents with a simple message
 */
export async function testAllAgents(
  testMessage: string = "Hello! How can you help me today?"
): Promise<Record<string, AgentChatResponse | Error>> {
  try {
    const stats = await getAgentProviderStats()
    return await compareAgentResponses(stats.configuredAgents, testMessage)
  } catch (error) {
    throw new Error(`Failed to test agents: ${error}`)
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get agents by provider type
 */
export async function getAgentsByProvider(provider: AIProvider): Promise<string[]> {
  try {
    const stats = await getAgentProviderStats()
    return stats.providers[`${provider}Agents` as keyof typeof stats.providers]
  } catch (error) {
    console.error(`Error getting ${provider} agents:`, error)
    return []
  }
}

/**
 * Check if agent is configured
 */
export async function isAgentConfigured(agentId: string): Promise<boolean> {
  try {
    await getAgentConfig(agentId)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get recommended provider for agent type
 */
export function getRecommendedProvider(agentType: 'companion' | 'technology' | 'education' | 'entertainment' | 'business' | 'health' | 'lifestyle' | 'creative'): AIProvider {
  const recommendations: Record<string, AIProvider> = {
    companion: 'mistral',     // Conversational & empathetic
    technology: 'anthropic',  // Technical & analytical
    education: 'anthropic',   // Educational & accurate
    entertainment: 'mistral', // Creative & fun
    business: 'anthropic',    // Professional & analytical
    health: 'anthropic',      // Safety-focused
    lifestyle: 'gemini',      // Real-time information
    creative: 'mistral'       // Creative excellence
  }
  
  return recommendations[agentType] || 'mistral'
}

export default {
  sendMessageToAgent,
  getAgentConfig,
  getAgentProviderStats,
  chatWithJulie,
  chatWithBen,
  chatWithEinstein,
  chatWithComedyKing,
  chatWithTravelBuddy,
  chatWithMrsBoss,
  compareAgentResponses,
  testAllAgents,
  getAgentsByProvider,
  isAgentConfigured,
  getRecommendedProvider
}