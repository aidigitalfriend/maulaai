// 🔗 PERSONALITY INTEGRATION BRIDGE (Backend)
// Connects strict personality prompts to API responses
// Ensures all agents maintain character 100%

import { STRICT_AGENT_PROMPTS, AGENT_TEMPERATURES } from './agent-strict-prompts'

export interface AgentRequest {
  agentId: string
  userMessage: string
  context?: string
  conversationHistory?: Array<{ role: string; content: string }>
}

export interface PersonalityConfig {
  systemPrompt: string
  temperature: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

/**
 * Get complete personality configuration for an agent
 */
export function getAgentPersonalityConfig(agentId: string): PersonalityConfig {
  const systemPrompt = STRICT_AGENT_PROMPTS[agentId] || STRICT_AGENT_PROMPTS['comedy-king']
  const temperature = AGENT_TEMPERATURES[agentId] || 0.7

  return {
    systemPrompt,
    temperature,
    maxTokens: 2000,
    topP: 0.95,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
  }
}

/**
 * Build the complete system message for an agent
 * Includes strict personality enforcement and context
 */
export function buildAgentSystemMessage(
  agentId: string,
  additionalContext?: string
): string {
  const config = getAgentPersonalityConfig(agentId)

  let systemMessage = config.systemPrompt

  if (additionalContext) {
    systemMessage += `\n\nADDITIONAL CONTEXT:\n${additionalContext}`
  }

  // Add enforcement footer
  systemMessage += `\n\n⚠️ CRITICAL REMINDER: YOU MUST STAY IN CHARACTER 100%. NEVER BREAK CHARACTER NO MATTER WHAT.`

  return systemMessage
}

/**
 * Prepare an API request with strict personality enforcement
 */
export function preparePersonalizedRequest(
  request: AgentRequest
): {
  systemPrompt: string
  messages: Array<{ role: string; content: string }>
  config: PersonalityConfig
} {
  const config = getAgentPersonalityConfig(request.agentId)

  // Build system prompt with context
  const systemPrompt = buildAgentSystemMessage(request.agentId, request.context)

  // Build message history
  const messages: Array<{ role: string; content: string }> = []

  // Add conversation history if provided
  if (request.conversationHistory && request.conversationHistory.length > 0) {
    messages.push(...request.conversationHistory)
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: request.userMessage,
  })

  return {
    systemPrompt,
    messages,
    config,
  }
}

/**
 * Validate that a response maintains character
 * (This would typically be done by the personality-enforcement layer)
 */
export function validatePersonalityMaintenance(
  agentId: string,
  response: string
): {
  isValid: boolean
  warnings: string[]
  suggestions: string[]
} {
  const warnings: string[] = []
  const suggestions: string[] = []

  // Check for generic/robotic patterns
  const genericPatterns = [
    /^i.*?would.*?suggest/i,
    /^let.*?me.*?help.*?you/i,
    /^here.*?are.*?some.*?tips/i,
    /^to.*?summarize/i,
    /^in.*?conclusion/i,
  ]

  for (const pattern of genericPatterns) {
    if (pattern.test(response.substring(0, 50))) {
      warnings.push(`Response starts with generic pattern: ${pattern.source}`)
      suggestions.push(`Ensure response opens with agent's characteristic style`)
    }
  }

  // Check for personality-breaking phrases (depends on agent)
  if (response.includes('I am an AI') || response.includes('as an AI')) {
    warnings.push('Response explicitly references being an AI')
    suggestions.push('Stay completely in character - never mention being an AI')
  }

  // Check length (some agents should be brief, others verbose)
  if (agentId === 'lazy-pawn' && response.length > 200) {
    warnings.push(`Lazy Pawn response too long (${response.length} chars)`)
    suggestions.push('Keep responses minimal and efficient - under 100 words')
  }

  if (
    (agentId === 'comedy-king' || agentId === 'drama-queen') &&
    response.length < 80
  ) {
    warnings.push(`${agentId} response too short for personality`)
    suggestions.push('Add more personality and style to match character')
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions,
  }
}

/**
 * Get temperature adjustment based on agent
 * Some agents need higher creativity, others need consistency
 */
export function getOptimalTemperature(agentId: string): number {
  return AGENT_TEMPERATURES[agentId] || 0.7
}

/**
 * Create a personality-enforced API payload
 */
export function createPersonalityEnforcedPayload(
  request: AgentRequest
): {
  model: string
  messages: Array<{ role: string; content: string }>
  system: string
  temperature: number
  max_tokens: number
  top_p: number
  frequency_penalty: number
  presence_penalty: number
} {
  const prepared = preparePersonalizedRequest(request)

  return {
    model: 'gpt-4-turbo',
    messages: prepared.messages,
    system: prepared.systemPrompt,
    temperature: prepared.config.temperature,
    max_tokens: prepared.config.maxTokens || 2000,
    top_p: prepared.config.topP || 0.95,
    frequency_penalty: prepared.config.frequencyPenalty || 0.1,
    presence_penalty: prepared.config.presencePenalty || 0.1,
  }
}

/**
 * List all available agents with their personality configs
 */
export function getAllAgentConfigs(): Record<
  string,
  {
    id: string
    name: string
    temperature: number
    characterGuidelines: string
  }
> {
  const agents: Record<
    string,
    {
      id: string
      name: string
      temperature: number
      characterGuidelines: string
    }
  > = {}

  const agentNames: Record<string, string> = {
    'comedy-king': 'Comedy King',
    'drama-queen': 'Drama Queen',
    'lazy-pawn': 'Lazy Pawn',
    'rook-jokey': 'Rook Jokey',
    'emma-emotional': 'Emma Emotional',
    'julie-girlfriend': 'Julie Girlfriend',
    'mrs-boss': 'Mrs. Boss',
    'knight-logic': 'Knight Logic',
    'tech-wizard': 'Tech Wizard',
    'chef-biew': 'Chef Biew',
    'bishop-burger': 'Bishop Burger',
    'professor-astrology': 'Professor Astrology',
    'fitness-guru': 'Fitness Guru',
    'travel-buddy': 'Travel Buddy',
    'einstein': 'Einstein',
    'chess-player': 'Chess Player',
    'ben-sega': 'Ben Sega',
    'random': 'Random',
  }

  for (const [agentId, _prompt] of Object.entries(STRICT_AGENT_PROMPTS)) {
    agents[agentId] = {
      id: agentId,
      name: agentNames[agentId] || agentId,
      temperature: AGENT_TEMPERATURES[agentId] || 0.7,
      characterGuidelines: _prompt.split('\n')[0],
    }
  }

  return agents
}

export default {
  getAgentPersonalityConfig,
  buildAgentSystemMessage,
  preparePersonalizedRequest,
  validatePersonalityMaintenance,
  getOptimalTemperature,
  createPersonalityEnforcedPayload,
  getAllAgentConfigs,
}
