import { NextRequest, NextResponse } from 'next/server'

// Initialize API keys from environment (NEVER expose these to frontend)
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 30 * 60 * 1000 // 30 minutes
const RATE_LIMIT_MAX_MESSAGES = 18 // 18 messages per 30 min window

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown'
  return `studio-${ip}`
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const userLimit = rateLimitMap.get(key)

  if (!userLimit || now > userLimit.resetTime) {
    const resetTime = now + RATE_LIMIT_WINDOW
    rateLimitMap.set(key, { count: 1, resetTime })
    return { allowed: true, remaining: RATE_LIMIT_MAX_MESSAGES - 1 }
  }

  if (userLimit.count >= RATE_LIMIT_MAX_MESSAGES) {
    return { allowed: false, remaining: 0 }
  }

  userLimit.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX_MESSAGES - userLimit.count }
}

async function callMistralAPI(message: string, conversationHistory: any[]) {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new Error('Mistral API key not configured')

  const systemPrompt = 'You are One Last AI Assistant, a friendly and professional AI assistant for One Last AI platform. Your role: Help users understand One Last AI\'s services, features, and platform. Answer questions about AI agents, tools, and solutions we provide. Be friendly, neutral, and professional. Never mention which AI model you are or any technical details about yourself. If you don\'t know something specific about the platform, be honest but helpful. About One Last AI: We provide advanced AI solutions and agents. We offer various AI-powered tools including IP lookup, developer utilities, network tools. We have an AI Studio for interactive AI conversations. We serve multiple industries with custom AI solutions. Our platform focuses on accessibility and ease of use. Response guidelines: Keep responses clear and concise. Use friendly, professional tone. Include emojis sparingly when appropriate. Format important points with bullet points. Be helpful and informative.'

  try {
    // Use the same approach as Doctor Network - direct HTTP call with proper error handling
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`Mistral API returned ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    if (typeof content === 'string') {
      return content
    }
    
    return 'I apologize, but I couldn\'t generate a response right now.'
  } catch (error) {
    console.error('Mistral API error:', error)
    throw new Error(`Mistral API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function callGeminiAPI(message: string, conversationHistory: any[]) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Gemini API key not configured')

  try {
    const systemPrompt = 'You are One Last AI Assistant, a friendly and professional AI assistant for One Last AI platform. Help users understand our services, features, and platform. Be friendly, neutral, and professional. Never mention which AI model you are.'
    
    // Build conversation history for Gemini format
    const conversationText = conversationHistory.length > 0
      ? conversationHistory.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
      : ''
    
    const fullPrompt = conversationText 
      ? `${systemPrompt}\n\nPrevious conversation:\n${conversationText}\n\nUser: ${message}\nAssistant:`
      : `${systemPrompt}\n\nUser: ${message}\nAssistant:`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topK: 40,
          topP: 0.95,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I couldn\'t generate a response right now.'
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(request)
    const rateLimit = checkRateLimit(rateLimitKey)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please reset your session or try again later.' },
        { status: 429 }
      )
    }

    const { message, conversationHistory = [] } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      )
    }

    let responseMessage: string

    // Try Mistral first, fallback to Gemini
    try {
      responseMessage = await callMistralAPI(message, conversationHistory)
    } catch (mistralError) {
      console.error('Mistral API failed, falling back to Gemini:', mistralError)
      try {
        responseMessage = await callGeminiAPI(message, conversationHistory)
      } catch (geminiError) {
        console.error('Both Mistral and Gemini APIs failed:', geminiError)
        return NextResponse.json(
          { error: 'I apologize, but I encountered an error. Please try again.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      message: responseMessage,
      remaining: rateLimit.remaining
    })

  } catch (error) {
    console.error('Studio chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
