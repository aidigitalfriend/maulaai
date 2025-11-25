import { NextRequest, NextResponse } from 'next/server'

// Initialize API keys from environment (NEVER expose these to frontend)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 50 // 50 requests per window per IP

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
    // Check rate limit FIRST
    const rateLimitKey = getRateLimitKey(request)
    const rateLimit = checkRateLimit(rateLimitKey)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    const { message, model, conversationId, agentId } = await request.json()

    if (!message || !model) {
      return NextResponse.json(
        { error: 'Missing message or model' },
        { status: 400 }
      )
    }

    // Validate message length
    if (message.length > 4000) {
      return NextResponse.json(
        { error: 'Message too long. Maximum 4000 characters.' },
        { status: 400 }
      )
    }

    // Validate agent ID
    const validAgentIds = [
      'ben-sega', 'einstein', 'bishop-burger', 'chef-biew', 'chess-player',
      'comedy-king', 'drama-queen', 'emma-emotional', 'fitness-guru',
      'julie-girlfriend', 'knight-logic', 'lazy-pawn', 'mrs-boss',
      'nid-gaming', 'professor-astrology', 'rook-jokey', 'tech-wizard',
      'travel-buddy'
    ]

    if (agentId && !validAgentIds.includes(agentId)) {
      return NextResponse.json(
        { error: 'Invalid agent ID' },
        { status: 400 }
      )
    }

    let response

    // Route to appropriate LLM provider
    if (model.startsWith('gemini')) {
      response = await callGeminiAPI(message, model)
    } else if (model.startsWith('gpt')) {
      response = await callOpenAIAPI(message, model)
    } else if (model.startsWith('claude')) {
      response = await callAnthropicAPI(message, model)
    } else if (model.startsWith('mistral')) {
      response = await callMistralAPI(message, model)
    } else {
      return NextResponse.json(
        { error: 'Unsupported model' },
        { status: 400 }
      )
    }

    // Log for monitoring (use proper logging service in production)
    console.log(`[API] Chat - Agent: ${agentId || 'unknown'}, Model: ${model}, IP: ${rateLimitKey}`)

    return NextResponse.json(
      { 
        message: response,
        timestamp: new Date().toISOString()
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
        }
      }
    )
  } catch (error: any) {
    console.error('Chat API error:', error)
    // Don't expose internal error details to client
    return NextResponse.json(
      { 
        error: 'An error occurred processing your request. Please try again.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
}

async function callGeminiAPI(message: string, model: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured')
  }

  const modelId = model === 'gemini-pro' ? 'gemini-pro' : 'gemini-pro-vision'

  const response = await fetch(
    `${GEMINI_API_URL}/${modelId}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: message,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!textContent) {
    throw new Error('No text content in Gemini response')
  }

  return textContent
}

async function callOpenAIAPI(message: string, model: string): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'No response'
}

async function callAnthropicAPI(message: string, model: string): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    throw new Error('Anthropic API key not configured')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: [{ role: 'user', content: message }],
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text || 'No response'
}

async function callMistralAPI(message: string, model: string): Promise<string> {
  const mistralKey = process.env.MISTRAL_API_KEY
  if (!mistralKey) {
    throw new Error('Mistral API key not configured')
  }

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mistralKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'mistral-medium',
      messages: [{ role: 'user', content: message }],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Mistral API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'No response'
}
