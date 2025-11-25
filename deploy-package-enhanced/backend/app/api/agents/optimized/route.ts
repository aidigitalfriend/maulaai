/**
 * ========================================
 * AGENT-OPTIMIZED AI CHAT API
 * ========================================
 * 
 * Enhanced API route that uses optimal AI providers
 * based on agent personality and specialization
 */

import { NextRequest, NextResponse } from 'next/server'
import { agentAIService } from '@/lib/agent-ai-provider-service'
// Rate limiting and security imports handled by the MultiModalAIService

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json()
    const { agentId, message, options = {} } = body

    if (!agentId || !message) {
      return NextResponse.json(
        { error: 'Agent ID and message are required' },
        { status: 400 }
      )
    }

    // Basic input validation
    if (typeof message !== 'string' || typeof agentId !== 'string' || message.length > 4000 || agentId.length > 100) {
      return NextResponse.json(
        { error: 'Invalid input parameters' },
        { status: 400 }
      )
    }

    // Check if agent has AI configuration
    if (!agentAIService.hasAIConfig(agentId)) {
      return NextResponse.json(
        { error: `No AI configuration found for agent: ${agentId}` },
        { status: 404 }
      )
    }

    // Get agent configuration
    const agentConfig = agentAIService.getAgentAIConfig(agentId)
    
    console.log(`[Agent Optimized] ${agentId} -> ${agentConfig?.primaryProvider} (${agentConfig?.model})`)

    // Send message using optimal AI provider
    const result = await agentAIService.sendAgentMessage(
      agentId,
      message,
      undefined, // System prompt is automatically handled
      {
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 1500,
        forceProvider: options.forceProvider
      }
    )

    // Enhanced response with provider information
    return NextResponse.json({
      response: result.response,
      agent: {
        id: agentId,
        specializedFor: agentConfig?.specializedFor
      },
      ai: {
        provider: result.provider,
        model: result.model,
        usedFallback: result.usedFallback || false,
        primaryProvider: agentConfig?.primaryProvider,
        fallbacks: agentConfig?.fallbackProviders
      },
      metrics: {
        tokensUsed: result.tokensUsed,
        latency: result.latency,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('[Agent Optimized] Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process agent chat request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get agent configuration endpoint
    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agentId')
    
    if (agentId) {
      const config = agentAIService.getAgentAIConfig(agentId)
      if (!config) {
        return NextResponse.json(
          { error: `No AI configuration found for agent: ${agentId}` },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        agentId,
        config,
        hasConfiguration: true
      })
    }

    // Return all agent configurations and statistics
    return NextResponse.json({
      totalAgents: agentAIService.getAllAgentIds().length,
      configuredAgents: agentAIService.getAllAgentIds(),
      providerStats: agentAIService.getProviderStats(),
      providers: {
        mistralAgents: agentAIService.getAgentsByProvider('mistral').map(c => c.agentId),
        anthropicAgents: agentAIService.getAgentsByProvider('anthropic').map(c => c.agentId),
        openaiAgents: agentAIService.getAgentsByProvider('openai').map(c => c.agentId),
        geminiAgents: agentAIService.getAgentsByProvider('gemini').map(c => c.agentId),
        cohereAgents: agentAIService.getAgentsByProvider('cohere').map(c => c.agentId)
      }
    })

  } catch (error) {
    console.error('[Agent Optimized] GET Error:', error)
    
    return NextResponse.json(
      { error: 'Failed to retrieve agent configurations' },
      { status: 500 }
    )
  }
}