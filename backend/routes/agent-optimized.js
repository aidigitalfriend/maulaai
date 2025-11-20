/**
 * ========================================
 * EXPRESS.JS ROUTE FOR AI AGENT INTEGRATION
 * ========================================
 * 
 * Express route to integrate with the existing backend server
 */

// Agent AI Provider Assignments (JavaScript compatible)
const AGENT_AI_ASSIGNMENTS = {
  'julie-girlfriend': {
    agentId: 'julie-girlfriend',
    primaryProvider: 'mistral',
    fallbackProviders: ['anthropic', 'openai', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    specializedFor: ['Emotional support', 'Relationship advice', 'Conversational companionship']
  },
  'ben-sega': {
    agentId: 'ben-sega',
    primaryProvider: 'anthropic',
    fallbackProviders: ['openai', 'mistral', 'gemini', 'cohere'],
    model: 'claude-3-5-sonnet-20241022',
    specializedFor: ['Code generation', 'Software development', 'Technical architecture']
  },
  'einstein': {
    agentId: 'einstein',
    primaryProvider: 'anthropic',
    fallbackProviders: ['gemini', 'openai', 'mistral', 'cohere'],
    model: 'claude-3-5-sonnet-20241022',
    specializedFor: ['Physics', 'Scientific research', 'Mathematical concepts']
  },
  'comedy-king': {
    agentId: 'comedy-king',
    primaryProvider: 'mistral',
    fallbackProviders: ['openai', 'anthropic', 'gemini', 'cohere'],
    model: 'mistral-large-latest',
    specializedFor: ['Humor generation', 'Entertainment', 'Creative comedy']
  },
  'travel-buddy': {
    agentId: 'travel-buddy',
    primaryProvider: 'gemini',
    fallbackProviders: ['mistral', 'anthropic', 'openai', 'cohere'],
    model: 'gemini-1.5-pro-latest',
    specializedFor: ['Travel planning', 'Destination information', 'Cultural insights']
  }
}

function getAgentConfig(agentId) {
  return AGENT_AI_ASSIGNMENTS[agentId] || null
}

function getAllAgentIds() {
  return Object.keys(AGENT_AI_ASSIGNMENTS)
}

function getProviderStats() {
  const stats = { mistral: 0, anthropic: 0, openai: 0, gemini: 0, cohere: 0 }
  Object.values(AGENT_AI_ASSIGNMENTS).forEach(config => {
    stats[config.primaryProvider]++
  })
  return stats
}

function getAgentsByProvider(provider) {
  return Object.values(AGENT_AI_ASSIGNMENTS).filter(
    config => config.primaryProvider === provider
  )
}

export function setupAgentOptimizedRoutes(app) {
  // GET /api/agents/optimized - Get agent configurations and stats
  app.get('/api/agents/optimized', async (req, res) => {
    try {
      const { agentId } = req.query
      
      if (agentId) {
        const config = getAgentConfig(agentId)
        if (!config) {
          return res.status(404).json({
            error: `No AI configuration found for agent: ${agentId}`
          })
        }
        
        return res.json({
          agentId,
          config,
          hasConfiguration: true
        })
      }

      // Return all agent configurations and statistics
      return res.json({
        totalAgents: getAllAgentIds().length,
        configuredAgents: getAllAgentIds(),
        providerStats: getProviderStats(),
        providers: {
          mistralAgents: getAgentsByProvider('mistral').map(c => c.agentId),
          anthropicAgents: getAgentsByProvider('anthropic').map(c => c.agentId),
          openaiAgents: getAgentsByProvider('openai').map(c => c.agentId),
          geminiAgents: getAgentsByProvider('gemini').map(c => c.agentId),
          cohereAgents: getAgentsByProvider('cohere').map(c => c.agentId)
        }
      })

    } catch (error) {
      console.error('[Agent Optimized] GET Error:', error)
      
      return res.status(500).json({
        error: 'Failed to retrieve agent configurations',
        message: error.message
      })
    }
  })

  // POST /api/agents/optimized - Send message to agent
  app.post('/api/agents/optimized', async (req, res) => {
    try {
      const { agentId, message, options = {} } = req.body

      if (!agentId || !message) {
        return res.status(400).json({
          error: 'Agent ID and message are required'
        })
      }

      // Basic input validation
      if (typeof message !== 'string' || typeof agentId !== 'string' || 
          message.length > 4000 || agentId.length > 100) {
        return res.status(400).json({
          error: 'Invalid input parameters'
        })
      }

      // Check if agent has AI configuration
      const agentConfig = getAgentConfig(agentId)
      if (!agentConfig) {
        return res.status(404).json({
          error: `No AI configuration found for agent: ${agentId}`
        })
      }
      
      console.log(`[Agent Optimized] ${agentId} -> ${agentConfig.primaryProvider} (${agentConfig.model})`)

      // For now, return configuration info (AI integration will be completed separately)
      return res.json({
        response: `AI Provider Integration configured for ${agentId}! This agent uses ${agentConfig.primaryProvider} with model ${agentConfig.model}. Specialized for: ${agentConfig.specializedFor.join(', ')}. Full AI integration coming soon!`,
        agent: {
          id: agentId,
          specializedFor: agentConfig.specializedFor
        },
        ai: {
          provider: agentConfig.primaryProvider,
          model: agentConfig.model,
          usedFallback: false,
          primaryProvider: agentConfig.primaryProvider,
          fallbacks: agentConfig.fallbackProviders
        },
        metrics: {
          tokensUsed: 0,
          latency: 50,
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      console.error('[Agent Optimized] Error:', error)
      
      return res.status(500).json({
        error: 'Failed to process agent chat request',
        message: error.message
      })
    }
  })

  console.log('✅ Agent optimized routes configured')
}