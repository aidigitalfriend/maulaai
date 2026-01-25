/**
 * NOTE: The actual system prompt used for chat is in:
 * @see /frontend/lib/agent-provider-config.ts
 * This file is for UI/display purposes only.
 */
import { AgentConfig } from '../types'

export const CONFIG_PLACEHOLDER: AgentConfig = {
  id: 'AGENT_ID',
  name: 'AGENT_NAME',
  specialty: 'AGENT_SPECIALTY',
  description: 'AGENT_DESCRIPTION',
  avatarUrl: 'AGENT_AVATAR',
  color: 'AGENT_COLOR',
  category: 'AGENT_CATEGORY',
  tags: ['AGENT_TAGS'],
  
  personality: {
    traits: ['AGENT_TRAITS'],
    responseStyle: 'AGENT_STYLE',
    greetingMessage: 'AGENT_GREETING',
    specialties: ['AGENT_SPECIALTIES'],
    conversationStarters: ['AGENT_STARTERS']
  },

  prompts: {
    systemPrompt: 'AGENT_SYSTEM_PROMPT',
    contextPrompt: 'AGENT_CONTEXT_PROMPT',
    exampleResponses: []
  },

  settings: {
    maxTokens: 400,
    temperature: 0.7,
    enabled: true,
    premium: false
  }
}
