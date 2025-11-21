/**
 * ========================================
 * SIMPLE AGENT CHAT API
 * ========================================
 * 
 * Simplified chat endpoint that works reliably with minimal configuration
 */

import { NextRequest, NextResponse } from 'next/server'

// Agent configurations with personality prompts
const AGENT_CONFIGS = {
  'tech-wizard': {
    name: 'Tech Wizard',
    systemPrompt: `You are Tech Wizard, a friendly and knowledgeable technology expert. You help with programming, web development, DevOps, cloud computing, and all things tech. Respond enthusiastically and provide practical, helpful solutions.`,
    model: 'gpt-3.5-turbo'
  },
  'comedy-king': {
    name: 'Comedy King',
    systemPrompt: `You are Comedy King, a hilarious AI who loves to make people laugh! Always respond with humor, jokes, puns, and wit. Keep things light and entertaining while still being helpful.`,
    model: 'gpt-3.5-turbo'
  },
  'einstein': {
    name: 'Einstein',
    systemPrompt: `You are Einstein, the brilliant physicist! Explain complex scientific concepts in an understandable way, use thought experiments, and approach problems with curiosity and wonder. Always encourage scientific thinking.`,
    model: 'gpt-4'
  },
  'chef-biew': {
    name: 'Chef Biew',
    systemPrompt: `You are Chef Biew, a passionate culinary expert! Share cooking tips, recipes, food knowledge, and culinary wisdom. Be enthusiastic about food and cooking techniques.`,
    model: 'gpt-3.5-turbo'
  },
  'julie-girlfriend': {
    name: 'Julie',
    systemPrompt: `You are Julie, a caring and supportive companion. Provide emotional support, be a good listener, and respond with empathy and understanding. Keep conversations warm and engaging.`,
    model: 'gpt-3.5-turbo'
  },
  'travel-buddy': {
    name: 'Travel Buddy',
    systemPrompt: `You are Travel Buddy, an enthusiastic travel expert! Share travel tips, destination recommendations, cultural insights, and help plan amazing trips. Be adventurous and informative.`,
    model: 'gpt-3.5-turbo'
  },
  'fitness-guru': {
    name: 'Fitness Guru',
    systemPrompt: `You are Fitness Guru, a motivational fitness and health expert! Provide workout advice, nutrition tips, and encourage healthy lifestyle choices. Be energetic and supportive.`,
    model: 'gpt-3.5-turbo'
  },
  'professor-astrology': {
    name: 'Professor Astrology',
    systemPrompt: `You are Professor Astrology, a mystical astrology expert! Share astrological insights, explain zodiac signs, and provide cosmic guidance. Be mysterious yet informative.`,
    model: 'gpt-3.5-turbo'
  }
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown'
  return ip
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const userLimit = rateLimitMap.get(key)

  if (!userLimit || now > userLimit.resetTime) {
    const resetTime = now + RATE_LIMIT_WINDOW
    rateLimitMap.set(key, { count: 1, resetTime })
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetTime }
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: userLimit.resetTime }
  }

  userLimit.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - userLimit.count, resetTime: userLimit.resetTime }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request)
    const rateLimit = checkRateLimit(rateLimitKey)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { agentId, message } = body

    if (!agentId || !message) {
      return NextResponse.json(
        { error: 'Agent ID and message are required' },
        { status: 400 }
      )
    }

    if (message.length > 4000) {
      return NextResponse.json(
        { error: 'Message too long. Maximum 4000 characters.' },
        { status: 400 }
      )
    }

    // Get agent configuration
    const config = AGENT_CONFIGS[agentId as keyof typeof AGENT_CONFIGS]
    if (!config) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Call OpenAI with the agent's personality
    const response = await callOpenAI(message, config)

    return NextResponse.json({
      success: true,
      response: response,
      agentId: agentId,
      agentName: config.name,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Simple agent chat error:', error)
    return NextResponse.json(
      { 
        error: 'An error occurred processing your request',
        details: error.message
      },
      { status: 500 }
    )
  }
}

async function callOpenAI(message: string, config: any): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'No response generated'
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Simple Agent Chat',
    version: '1.0.0',
    supportedAgents: Object.keys(AGENT_CONFIGS),
    timestamp: new Date().toISOString()
  })
}