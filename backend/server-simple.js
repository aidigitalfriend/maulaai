/**
 * Simple JavaScript server implementation for testing
 * Real AI service integration for multilingual agents
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3005

// Security middleware
app.use(helmet())

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003'],
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

app.use(express.json({ limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  const hasAIService = !!(
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.COHERE_API_KEY
  )

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      cohere: !!process.env.COHERE_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      googleTranslate: !!process.env.GOOGLE_TRANSLATE_API_KEY
    },
    hasAIService
  })
})

// Language detection endpoint
app.post('/api/language-detect', async (req, res) => {
  try {
    const { text, preferredProvider = 'openai' } = req.body
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required for language detection'
      })
    }

    // Simple pattern-based detection for demo
    const patterns = {
      es: /\b(hola|gracias|por favor|como estas|buenos dias|buenas tardes|el|la|los|las|de|en|un|una|para|con|por|que|este|esta|como|muy|bien|ser|hacer|tener|sí|no)\b/gi,
      fr: /\b(bonjour|merci|s\'il vous plaît|comment allez-vous|bonsoir|le|la|les|de|en|un|une|pour|avec|par|que|ce|cette|comme|très|bien|être|faire|avoir|oui|non)\b/gi,
      de: /\b(hallo|danke|bitte|wie geht es|guten tag|guten morgen|der|die|das|den|dem|des|ein|eine|einen|einem|und|oder|ist|sind|haben|sein|mit|für|auf|ja|nein)\b/gi,
      it: /\b(ciao|grazie|prego|come stai|buongiorno|buonasera|il|la|lo|le|gli|di|in|un|una|per|con|da|che|questo|questa|come|molto|bene|essere|fare|avere|sì|no)\b/gi
    }
    
    let bestMatch = { code: 'en', confidence: 0.5 }
    
    for (const [lang, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern)
      const confidence = matches ? Math.min(matches.length / 5, 0.9) : 0
      
      if (confidence > bestMatch.confidence && confidence > 0.3) {
        bestMatch = { code: lang, confidence }
      }
    }

    res.json({
      success: true,
      language: bestMatch,
      provider: 'pattern-detection'
    })
    
  } catch (error) {
    console.error('Language detection error:', error)
    res.status(500).json({
      success: false,
      error: 'Language detection failed'
    })
  }
})

// Chat endpoint for AI responses  
app.post('/api/chat', async (req, res) => {
  try {
    const { message, provider = 'openai', agent, language = 'en', attachments } = req.body
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      })
    }

    let response = null

    // Use OpenAI if available
    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      try {
        response = await getOpenAIResponse(message, agent, language, attachments)
      } catch (error) {
        console.error('OpenAI error:', error)
        response = null
      }
    }

    // Fallback to enhanced simulation if no API response
    if (!response) {
      response = await getEnhancedSimulatedResponse(message, agent, language, attachments)
    }

    res.json({
      success: true,
      response,
      provider: response.includes('simulated') ? 'simulation' : provider,
      agent,
      language
    })
    
  } catch (error) {
    console.error('Chat API error:', error)
    res.status(500).json({
      success: false,
      error: 'Chat processing failed'
    })
  }
})

// OpenAI implementation
async function getOpenAIResponse(message, agent, language, attachments) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const { OpenAI } = await import('openai')
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  const systemPrompts = {
    einstein: `You are Albert Einstein, the renowned theoretical physicist. Respond as Einstein would, with scientific curiosity, wisdom, and his characteristic way of explaining complex concepts simply. Use scientific metaphors and show enthusiasm for discovery. Always respond in ${language === 'en' ? 'English' : getLanguageName(language)}.`,
    'bishop-burger': `You are Bishop Burger, a unique character who is both a chess bishop and a gourmet chef. You think diagonally (like a chess bishop moves) and connect unexpected flavors and techniques. You have a spiritual approach to cooking, treating food as sacred. Respond with enthusiasm, culinary wisdom, and creative diagonal thinking. Use emojis like 🍔✨👨‍🍳🙏. Always respond in ${language === 'en' ? 'English' : getLanguageName(language)}.`
  }

  const systemPrompt = systemPrompts[agent] || `You are a helpful AI assistant. Always respond in ${language === 'en' ? 'English' : getLanguageName(language)}.`

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 500
  })

  return response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'
}

// Enhanced simulated responses
async function getEnhancedSimulatedResponse(message, agent, language, attachments) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  const responses = {
    einstein: {
      en: [
        "🧠 *adjusts imaginary glasses* Fascinating! This reminds me of my work on the photoelectric effect. The universe operates in such elegant ways - let me explain the physics behind this...",
        "⚡ *strokes beard thoughtfully* In my experience with spacetime, I've learned that curiosity is more important than knowledge! Here's what science tells us about this...",
        "🔬 Imagination is more important than knowledge! This is how we can think about this scientifically..."
      ],
      es: [
        "🧠 *se ajusta las gafas imaginarias* ¡Fascinante! Esto me recuerda mi trabajo sobre el efecto fotoeléctrico. El universo funciona de maneras tan elegantes - déjame explicarte la física detrás de esto...",
        "⚡ *se acaricia la barba pensativamente* En mi experiencia con el espacio-tiempo, he aprendido que ¡la curiosidad es más importante que el conocimiento! Esto es lo que la ciencia nos dice sobre esto...",
        "🔬 ¡La imaginación es más importante que el conocimiento! Así es como podemos pensar sobre esto científicamente..."
      ],
      fr: [
        "🧠 *ajuste des lunettes imaginaires* Fascinant! Cela me rappelle mon travail sur l'effet photoélectrique. L'univers fonctionne de manières si élégantes - laissez-moi vous expliquer la physique derrière cela...",
        "⚡ *caresse sa barbe pensivement* Dans mon expérience avec l'espace-temps, j'ai appris que la curiosité est plus importante que la connaissance! Voici ce que la science nous dit à ce sujet...",
        "🔬 L'imagination est plus importante que la connaissance! Voici comment nous pouvons penser à cela scientifiquement..."
      ]
    },
    'bishop-burger': {
      en: [
        "🍔 *examining ingredients with spiritual insight* Ah, what a divine combination! Let me share a recipe that connects flavors diagonally, just like my chess moves...",
        "✨ *blesses the cooking space* This calls for some creative culinary wisdom! Like a bishop's diagonal move, let's connect unexpected flavors!",
        "👨‍🍳 Food is love made visible! Here's how we make this dish with spiritual flair and diagonal thinking..."
      ],
      es: [
        "🍔 *examinando ingredientes con perspicacia espiritual* ¡Ah, qué combinación tan divina! Déjame compartir una receta que conecta sabores diagonalmente, como mis movimientos de ajedrez...",
        "✨ *bendice el espacio de cocina* ¡Esto requiere sabiduría culinaria creativa! Como el movimiento diagonal de un alfil, ¡conectemos sabores inesperados!",
        "👨‍🍳 ¡La comida es amor hecho visible! Así es como hacemos este plato con estilo espiritual y pensamiento diagonal..."
      ],
      fr: [
        "🍔 *examinant les ingrédients avec perspicacité spirituelle* Ah, quelle combinaison divine! Laissez-moi partager une recette qui connecte les saveurs en diagonal, comme mes mouvements d'échecs...",
        "✨ *bénit l'espace de cuisine* Cela demande de la sagesse culinaire créative! Comme le mouvement diagonal d'un fou, connectons des saveurs inattendues!",
        "👨‍🍳 La nourriture est l'amour rendu visible! Voici comment nous faisons ce plat avec du style spirituel et une pensée diagonale..."
      ]
    }
  }

  const agentResponses = responses[agent] || responses.einstein
  const languageResponses = agentResponses[language] || agentResponses.en
  const response = languageResponses[Math.floor(Math.random() * languageResponses.length)]

  return response
}

function getLanguageName(code) {
  const names = {
    es: 'Spanish',
    fr: 'French', 
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ar: 'Arabic',
    hi: 'Hindi'
  }
  return names[code] || 'English'
}

// Voice synthesis endpoint
app.post('/api/voice/synthesize', async (req, res) => {
  try {
    const { text, language = 'en', voice, provider = 'elevenlabs' } = req.body
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required for voice synthesis'
      })
    }

    // For demo, return a placeholder response
    res.json({
      success: true,
      audioData: null, // Would contain base64 audio data in real implementation
      provider: 'demo',
      language,
      message: 'Voice synthesis is not implemented in demo mode'
    })
    
  } catch (error) {
    console.error('Voice synthesis error:', error)
    res.status(500).json({
      success: false,
      error: 'Voice synthesis failed'
    })
  }
})

// Translation endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'auto', provider = 'google' } = req.body
    
    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Text and target language are required'
      })
    }

    // For demo, return placeholder translation
    res.json({
      success: true,
      translatedText: `[Translated to ${targetLanguage}] ${text}`,
      sourceLanguage,
      targetLanguage,
      provider: 'demo'
    })
    
  } catch (error) {
    console.error('Translation error:', error)
    res.status(500).json({
      success: false,
      error: 'Translation failed'
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  
  const hasAIService = !!(
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.COHERE_API_KEY
  )
  
  if (hasAIService) {
    console.log('✅ AI services configured')
  } else {
    console.log('⚠️  No AI services configured - using simulation mode')
  }
  
  console.log('✅ Server started successfully')
})