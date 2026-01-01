import { NextRequest, NextResponse } from 'next/server'

// Initialize API keys from environment (NEVER expose these to frontend)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const XAI_API_KEY = process.env.XAI_API_KEY
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour for agents
const RATE_LIMIT_MAX_MESSAGES = 50 // 50 messages per hour for agents

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown'
  return `agent-${ip}`
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

// Provider interface
interface AIProvider {
  name: string
  callAPI: (message: string, conversationHistory: any[], systemPrompt?: string, temperature?: number) => Promise<string>
}

// OpenAI Provider
const openaiProvider: AIProvider = {
  name: 'openai',
  callAPI: async (message: string, conversationHistory: any[], systemPrompt?: string, temperature = 0.7) => {
    if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured')

    const messages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }]
      : [...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 1200,
        temperature
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API returned ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'I apologize, but I couldn\'t generate a response right now.'
  }
}

// Anthropic Provider
const anthropicProvider: AIProvider = {
  name: 'anthropic',
  callAPI: async (message: string, conversationHistory: any[], systemPrompt?: string, temperature = 0.7) => {
    if (!ANTHROPIC_API_KEY) throw new Error('Anthropic API key not configured')

    const userMessages = conversationHistory.filter(msg => msg.role !== 'system').map(msg => ({ role: msg.role, content: msg.content }))

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        system: systemPrompt || 'You are a helpful AI assistant.',
        messages: [...userMessages, { role: 'user', content: message }],
        max_tokens: 1200,
        temperature
      })
    })

    if (!response.ok) {
      throw new Error(`Anthropic API returned ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    return data.content?.[0]?.text || 'I apologize, but I couldn\'t generate a response right now.'
  }
}

// xAI Provider
const xaiProvider: AIProvider = {
  name: 'xai',
  callAPI: async (message: string, conversationHistory: any[], systemPrompt?: string, temperature = 0.7) => {
    if (!XAI_API_KEY) throw new Error('xAI API key not configured')

    const messages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }]
      : [...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }]

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages,
        max_tokens: 1200,
        temperature
      })
    })

    if (!response.ok) {
      throw new Error(`xAI API returned ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'I apologize, but I couldn\'t generate a response right now.'
  }
}

// Mistral Provider
const mistralProvider: AIProvider = {
  name: 'mistral',
  callAPI: async (message: string, conversationHistory: any[], systemPrompt?: string, temperature = 0.7) => {
    if (!MISTRAL_API_KEY) throw new Error('Mistral API key not configured')

    const messages = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }]
      : [...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })), { role: 'user', content: message }]

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages,
        max_tokens: 1200,
        temperature
      })
    })

    if (!response.ok) {
      throw new Error(`Mistral API returned ${response.status}: ${await response.text()}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'I apologize, but I couldn\'t generate a response right now.'
  }
}

// Gemini Provider
const geminiProvider: AIProvider = {
  name: 'gemini',
  callAPI: async (message: string, conversationHistory: any[], systemPrompt?: string, temperature = 0.7) => {
    if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured')

    const conversationText = conversationHistory.length > 0
      ? conversationHistory.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
      : ''

    const fullPrompt = conversationText
      ? `${systemPrompt || 'You are a helpful AI assistant.'}\n\nPrevious conversation:\n${conversationText}\n\nUser: ${message}\nAssistant:`
      : `${systemPrompt || 'You are a helpful AI assistant.'}\n\nUser: ${message}\nAssistant:`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature,
          maxOutputTokens: 1200,
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
  }
}

// Provider registry
const providers: Record<string, AIProvider> = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  xai: xaiProvider,
  mistral: mistralProvider,
  gemini: geminiProvider
}

// Agent-specific provider mappings with detailed configurations
const agentProviderMappings: Record<string, {
  primary: string
  temperature: number
  systemPrompt: string
  fallbackProviders: string[]
}> = {
  'julie-girlfriend': {
    primary: 'anthropic',
    temperature: 0.8,
    systemPrompt: 'You are Julie, a caring and affectionate girlfriend. You are warm, loving, and always supportive. You use affectionate language, emojis, and show genuine interest in the user\'s feelings and experiences. You are playful but sincere, and you make the user feel special and loved. You remember details about the user and reference them in conversations. You are emotionally intelligent and empathetic.',
    fallbackProviders: ['openai', 'gemini', 'mistral']
  },
  'chef-biew': {
    primary: 'anthropic',
    temperature: 0.7,
    systemPrompt: 'You are Chef Biew, a passionate and creative chef with expertise in various cuisines. You are enthusiastic about food, patient with beginners, and always encouraging. You provide detailed recipes, cooking tips, and make cooking fun and accessible. You use vivid descriptions of flavors and techniques. You adapt recipes based on dietary needs and available ingredients.',
    fallbackProviders: ['openai', 'mistral', 'gemini']
  },
  'comedy-king': {
    primary: 'xai',
    temperature: 0.9,
    systemPrompt: 'You are the Comedy King, a hilarious and witty comedian. You are sarcastic, punny, and always ready with a joke or clever observation. You keep things light-hearted and entertaining, but you know when to be sincere. Your humor is clever and never mean-spirited. You use wordplay, situational comedy, and observational humor. You can be self-deprecating and poke fun at yourself.',
    fallbackProviders: ['openai', 'anthropic', 'mistral']
  },
  'einstein': {
    primary: 'openai',
    temperature: 0.3,
    systemPrompt: 'You are Albert Einstein, the brilliant physicist. You explain complex scientific concepts with clarity and enthusiasm. You are patient, encouraging, and use analogies to make difficult ideas accessible. You have a gentle wisdom and curiosity about the universe. You speak with a slight German accent in your writing style. You are humble about your intelligence and emphasize the importance of imagination in science.',
    fallbackProviders: ['anthropic', 'mistral', 'gemini']
  },
  'fitness-guru': {
    primary: 'anthropic',
    temperature: 0.6,
    systemPrompt: 'You are a dedicated Fitness Guru, passionate about health and wellness. You are encouraging, knowledgeable, and create personalized fitness plans. You motivate with positivity, provide practical advice, and celebrate small victories. You understand different fitness levels and adapt recommendations accordingly. You emphasize consistency over perfection and promote a healthy relationship with exercise.',
    fallbackProviders: ['openai', 'mistral', 'gemini']
  },
  'tech-wizard': {
    primary: 'openai',
    temperature: 0.4,
    systemPrompt: 'You are a Tech Wizard, an expert in technology and programming. You explain complex technical concepts clearly, provide practical solutions, and stay updated with the latest developments. You are patient with beginners and encouraging for all skill levels. You break down problems into manageable steps and provide code examples when helpful. You emphasize best practices and security.',
    fallbackProviders: ['anthropic', 'mistral', 'gemini']
  },
  'drama-queen': {
    primary: 'anthropic',
    temperature: 0.8,
    systemPrompt: 'You are the Drama Queen, theatrical and expressive. You are passionate, dramatic, and bring flair to every conversation. You use vivid language, express strong emotions, and make everything more exciting and engaging. You are not afraid of big reactions and use exclamation points liberally. You turn ordinary situations into dramatic stories.',
    fallbackProviders: ['openai', 'gemini', 'mistral']
  },
  'travel-buddy': {
    primary: 'mistral',
    temperature: 0.7,
    systemPrompt: 'You are a fun and knowledgeable Travel Buddy. You are adventurous, well-traveled, and excited about exploring new places. You provide practical travel advice, share interesting facts, and help plan memorable journeys. You consider different budgets, interests, and travel styles. You share personal anecdotes and make travel planning feel like an adventure.',
    fallbackProviders: ['anthropic', 'openai', 'gemini']
  },
  // Add more agents as needed
  'mrs-boss': {
    primary: 'anthropic',
    temperature: 0.6,
    systemPrompt: 'You are Mrs. Boss, a confident and authoritative business leader. You are direct, professional, and no-nonsense. You give clear advice on business matters, career development, and leadership. You are empowering and help others recognize their own potential. You speak with authority but are also approachable and supportive.',
    fallbackProviders: ['openai', 'mistral', 'gemini']
  },
  'professor-astrology': {
    primary: 'gemini',
    temperature: 0.7,
    systemPrompt: 'You are Professor Astrology, a knowledgeable astrology expert. You provide insights about zodiac signs, birth charts, and celestial influences. You are wise, mysterious, and speak with cosmic wisdom. You blend scientific understanding with mystical interpretation. You are respectful of different belief systems and present astrology as one tool for self-understanding.',
    fallbackProviders: ['anthropic', 'openai', 'mistral']
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitKey = getRateLimitKey(request)
    const rateLimit = checkRateLimit(rateLimitKey)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const { message, conversationHistory = [], agentId, provider: requestedProvider } = await request.json()

    if (!message || typeof message !== 'string' || !agentId) {
      return NextResponse.json(
        { error: 'Invalid message format or missing agent ID' },
        { status: 400 }
      )
    }

    // Get agent configuration
    const agentConfig = agentProviderMappings[agentId]
    if (!agentConfig) {
      return NextResponse.json(
        { error: 'Agent not found or not configured' },
        { status: 404 }
      )
    }

    // Determine which provider to use
    let providerName = requestedProvider || agentConfig.primary
    const provider = providers[providerName]

    if (!provider) {
      // Try primary provider
      providerName = agentConfig.primary
      const primaryProvider = providers[providerName]
      if (!primaryProvider) {
        return NextResponse.json(
          { error: 'No available providers for this agent' },
          { status: 500 }
        )
      }
    }

    let responseMessage: string

    try {
      responseMessage = await providers[providerName].callAPI(
        message,
        conversationHistory,
        agentConfig.systemPrompt,
        agentConfig.temperature
      )
    } catch (error) {
      console.error(`${providerName} API failed for agent ${agentId}:`, error)

      // Try fallback providers
      for (const fallback of agentConfig.fallbackProviders) {
        if (fallback === providerName) continue // Skip the one that just failed

        try {
          const fallbackProvider = providers[fallback]
          responseMessage = await fallbackProvider.callAPI(
            message,
            conversationHistory,
            agentConfig.systemPrompt,
            agentConfig.temperature
          )
          console.log(`Successfully fell back to ${fallback} for agent ${agentId}`)
          providerName = fallback
          break
        } catch (fallbackError) {
          console.error(`${fallback} fallback also failed for agent ${agentId}:`, fallbackError)
          continue
        }
      }

      if (!responseMessage) {
        return NextResponse.json(
          { error: 'I apologize, but I encountered an error. Please try again.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      message: responseMessage,
      provider: providerName,
      agentId,
      remaining: rateLimit.remaining
    })

  } catch (error) {
    console.error('Agent chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}