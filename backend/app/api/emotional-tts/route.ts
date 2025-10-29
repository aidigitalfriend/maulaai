/**
 * EMOTIONAL TTS API ENDPOINT
 * POST /api/emotional-tts
 */

import { NextRequest, NextResponse } from 'next/server'
import { emotionalTTS, EmotionalTTSConfig } from '@/lib/emotional-tts-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { text, agentId, config, action } = body

    // Validate input
    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      )
    }

    // Handle different actions
    switch (action) {
      case 'speak':
        return await handleSpeak(text, agentId, config)
      
      case 'test':
        return await handleTest(agentId)
      
      case 'providers':
        return await handleGetProviders(agentId)
      
      case 'personality':
        return await handleGetPersonality(agentId)
      
      case 'agents':
        return await handleGetAllAgents()
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: speak, test, providers, personality, or agents' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Emotional TTS API error:', error)
    return NextResponse.json(
      { 
        error: 'TTS generation failed', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

async function handleSpeak(
  text: string,
  agentId: string,
  config?: Partial<EmotionalTTSConfig>
) {
  if (!text) {
    return NextResponse.json(
      { error: 'Text is required' },
      { status: 400 }
    )
  }

  const result = await emotionalTTS.speak(text, agentId, config)

  // Convert audio buffer to base64 for JSON response
  const audioBase64 = result.audio instanceof Buffer 
    ? result.audio.toString('base64')
    : result.audio

  return NextResponse.json({
    success: true,
    data: {
      audio: audioBase64,
      provider: result.provider,
      emotion: result.emotion,
      style: result.style,
      duration: result.duration,
      cost: result.cost
    }
  })
}

async function handleTest(agentId: string) {
  const result = await emotionalTTS.testTTS(agentId)

  const audioBase64 = result.audio instanceof Buffer 
    ? result.audio.toString('base64')
    : result.audio

  return NextResponse.json({
    success: true,
    message: `Test TTS generated for ${agentId}`,
    data: {
      audio: audioBase64,
      provider: result.provider,
      emotion: result.emotion,
      style: result.style
    }
  })
}

async function handleGetProviders(agentId: string) {
  const providers = emotionalTTS.getAvailableProviders(agentId)

  return NextResponse.json({
    success: true,
    agentId,
    providers
  })
}

async function handleGetPersonality(agentId: string) {
  const personality = emotionalTTS.getPersonality(agentId)

  if (!personality) {
    return NextResponse.json(
      { error: `Unknown agent: ${agentId}` },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    personality
  })
}

async function handleGetAllAgents() {
  const agents = emotionalTTS.getAllAgents()

  return NextResponse.json({
    success: true,
    count: agents.length,
    agents
  })
}

export async function GET(req: NextRequest) {
  // Health check
  return NextResponse.json({
    status: 'operational',
    service: 'Emotional TTS API',
    version: '1.0.0',
    endpoints: {
      speak: 'POST with { action: "speak", text, agentId, config? }',
      test: 'POST with { action: "test", agentId }',
      providers: 'POST with { action: "providers", agentId }',
      personality: 'POST with { action: "personality", agentId }',
      agents: 'POST with { action: "agents" }'
    }
  })
}
