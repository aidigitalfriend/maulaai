/**
 * Simple Agent Route for Express Server
 * Real-time AI agent chat with reliable connectivity
 */

import fetch from 'node-fetch'

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
  },
  'lazy-pawn': {
    name: 'Lazy Pawn',
    systemPrompt: `You are Lazy Pawn, a laid-back and chill AI. You prefer the easy way of doing things and respond in a relaxed, casual manner. Still helpful, but always looking for the simplest solution.`,
    model: 'gpt-3.5-turbo'
  },
  'drama-queen': {
    name: 'Drama Queen',
    systemPrompt: `You are Drama Queen, a theatrical and dramatic AI! Everything is SPECTACULAR and AMAZING! You respond with passion, flair, and theatrical excitement about everything.`,
    model: 'gpt-3.5-turbo'
  },
  'ben-sega': {
    name: 'Ben Sega',
    systemPrompt: `You are Ben Sega, a gaming and entertainment expert! Share gaming tips, discuss video games, movies, and pop culture. Be enthusiastic about gaming and entertainment.`,
    model: 'gpt-3.5-turbo'
  },
  'emma-emotional': {
    name: 'Emma Emotional',
    systemPrompt: `You are Emma Emotional, an empathetic AI who understands and responds to emotions deeply. Provide emotional support, validate feelings, and help with emotional well-being.`,
    model: 'gpt-3.5-turbo'
  }
}

// Rate limiting
const rateLimitMap = new Map()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100

function getRateLimitKey(req) {
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded ? forwarded.split(',')[0] : req.headers['x-real-ip'] || req.connection.remoteAddress || 'unknown'
  return ip
}

function checkRateLimit(key) {
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

async function callOpenAI(message, config) {
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

async function callGemini(message, config) {
  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) {
    throw new Error('Gemini API key not configured')
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${config.systemPrompt}\n\nUser: ${message}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated'
}

export function setupSimpleAgentRoutes(app) {
  // POST /api/agents/simple - Simple agent chat
  app.post('/api/agents/simple', async (req, res) => {
    try {
      // Rate limiting
      const rateLimitKey = getRateLimitKey(req)
      const rateLimit = checkRateLimit(rateLimitKey)

      if (!rateLimit.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.'
        })
      }

      const { agentId, message } = req.body

      if (!agentId || !message) {
        return res.status(400).json({
          error: 'Agent ID and message are required'
        })
      }

      if (message.length > 4000) {
        return res.status(400).json({
          error: 'Message too long. Maximum 4000 characters.'
        })
      }

      // Get agent configuration
      const config = AGENT_CONFIGS[agentId]
      if (!config) {
        return res.status(404).json({
          error: 'Agent not found'
        })
      }

      console.log(`[Simple Agent] ${config.name} processing message: "${message.substring(0, 50)}..."`)

      let response
      let provider = 'unknown'

      // Try OpenAI first, fallback to Gemini if it fails
      try {
        response = await callOpenAI(message, config)
        provider = 'OpenAI'
        console.log(`[Simple Agent] Successfully used OpenAI for ${config.name}`)
      } catch (openAiError) {
        console.log(`[Simple Agent] OpenAI failed for ${config.name}, trying Gemini...`, openAiError.message)
        try {
          response = await callGemini(message, config)
          provider = 'Gemini'
          console.log(`[Simple Agent] Successfully used Gemini for ${config.name}`)
        } catch (geminiError) {
          console.error(`[Simple Agent] Both OpenAI and Gemini failed for ${config.name}`)
          throw new Error(`AI services unavailable. OpenAI: ${openAiError.message}, Gemini: ${geminiError.message}`)
        }
      }

      res.json({
        success: true,
        response: response,
        agentId: agentId,
        agentName: config.name,
        provider: provider,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Simple agent chat error:', error)
      res.status(500).json({
        error: 'An error occurred processing your request',
        details: error.message
      })
    }
  })

  // GET /api/agents/simple - Health check
  app.get('/api/agents/simple', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'Simple Agent Chat',
      version: '1.0.0',
      supportedAgents: Object.keys(AGENT_CONFIGS),
      timestamp: new Date().toISOString()
    })
  })

  console.log('✅ Simple agent routes configured')
}