/**
 * Backend API handler for AI chat and language services
 * Handles requests from frontend with proper environment variable configuration
 */

import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()
// Default to 3005 to align with frontend rewrites, Nginx upstream, and integration tests
const PORT = process.env.PORT || 3005

// Security middleware
app.use(helmet())

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => process.env.ENABLE_RATE_LIMIT === 'false'
})

if (process.env.ENABLE_RATE_LIMIT !== 'false') {
  app.use(limiter)
}

app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '10mb' }))

// Configuration validation
const validateEnvironment = () => {
  const warnings: string[] = []
  const errors: string[] = []
  
  // Check AI services
  const hasAIService = !!(
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.COHERE_API_KEY
  )
  
  if (!hasAIService) {
    warnings.push('No AI service API keys configured')
  }
  
  // Check voice services if enabled
  if (process.env.ENABLE_VOICE !== 'false') {
    const hasVoiceService = !!(
      process.env.ELEVENLABS_API_KEY ||
      process.env.AZURE_SPEECH_KEY
    )
    
    if (!hasVoiceService) {
      warnings.push('Voice features enabled but no voice service configured')
    }
  }
  
  // Check translation services if enabled
  if (process.env.ENABLE_TRANSLATION !== 'false') {
    const hasTranslationService = !!(
      process.env.GOOGLE_TRANSLATE_API_KEY ||
      process.env.DEEPL_API_KEY ||
      process.env.AZURE_TRANSLATOR_KEY
    )
    
    if (!hasTranslationService) {
      warnings.push('Translation features enabled but no translation service configured')
    }
  }
  
  return { errors, warnings }
}

// Health check endpoint
app.get('/health', (req, res) => {
  const validation = validateEnvironment()
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    validation
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
    
    // Implement language detection based on available services
    let detectedLanguage = null
    
    if (preferredProvider === 'openai' && process.env.OPENAI_API_KEY) {
      detectedLanguage = await detectWithOpenAI(text)
    } else if (preferredProvider === 'cohere' && process.env.COHERE_API_KEY) {
      detectedLanguage = await detectWithCohere(text)
    } else if (process.env.GOOGLE_TRANSLATE_API_KEY) {
      detectedLanguage = await detectWithGoogleTranslate(text)
    }
    
    if (!detectedLanguage) {
      // Fallback to simple pattern detection
      detectedLanguage = await detectWithPatterns(text)
    }
    
    res.json({
      success: true,
      language: detectedLanguage,
      provider: preferredProvider
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
    
    // Route to appropriate AI service
    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      response = await getOpenAIResponse(message, agent, language, attachments)
    } else if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
      response = await getAnthropicResponse(message, agent, language, attachments)
    } else if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
      response = await getGeminiResponse(message, agent, language, attachments)
    } else if (provider === 'cohere' && process.env.COHERE_API_KEY) {
      response = await getCohereResponse(message, agent, language, attachments)
    }
    
    if (!response) {
      return res.status(503).json({
        success: false,
        error: 'No AI service available or configured'
      })
    }
    
    res.json({
      success: true,
      response,
      provider,
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
    
    let audioData = null

    // Explicitly return 501 for unimplemented providers
    if (provider === 'azure') {
      return res.status(501).json({ success: false, error: 'Azure Speech not implemented yet' })
    }

    if (provider === 'elevenlabs' && process.env.ELEVENLABS_API_KEY) {
      audioData = await synthesizeWithElevenLabs(text, voice, language)
    }
    
    if (!audioData) {
      return res.status(503).json({
        success: false,
        error: 'No voice service available or configured'
      })
    }
    
    res.json({
      success: true,
      audioData,
      provider,
      language
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
    
    let translatedText = null

    // Explicitly return 501 for unimplemented providers
    if (provider === 'azure') {
      return res.status(501).json({ success: false, error: 'Azure Translator not implemented yet' })
    }

    if (provider === 'google' && process.env.GOOGLE_TRANSLATE_API_KEY) {
      translatedText = await translateWithGoogle(text, targetLanguage, sourceLanguage)
    } else if (provider === 'deepl' && process.env.DEEPL_API_KEY) {
      translatedText = await translateWithDeepL(text, targetLanguage, sourceLanguage)
    }
    
    if (!translatedText) {
      return res.status(503).json({
        success: false,
        error: 'No translation service available or configured'
      })
    }
    
    res.json({
      success: true,
      translatedText,
      sourceLanguage,
      targetLanguage,
      provider
    })
    
  } catch (error) {
    console.error('Translation error:', error)
    res.status(500).json({
      success: false,
      error: 'Translation failed'
    })
  }
})

// Import real AI service implementations
import {
  getOpenAIResponse,
  getAnthropicResponse,
  getGeminiResponse,
  getCohereResponse,
  detectWithOpenAI,
  detectWithCohere,
  synthesizeWithElevenLabs,
  translateWithGoogle,
  translateWithDeepL
} from './services/aiServices'

// Pattern-based language detection fallback
async function detectWithPatterns(text: string) {
  const patterns = {
    es: /\b(el|la|los|las|de|en|un|una|para|con|por|que|este|esta|como|muy|bien|ser|hacer|tener|sí|no)\b/gi,
    fr: /\b(le|la|les|de|en|un|une|pour|avec|par|que|ce|cette|comme|très|bien|être|faire|avoir|oui|non)\b/gi,
    de: /\b(der|die|das|den|dem|des|ein|eine|einen|einem|und|oder|ist|sind|haben|sein|mit|für|auf|ja|nein)\b/gi,
    it: /\b(il|la|lo|le|gli|di|in|un|una|per|con|da|che|questo|questa|come|molto|bene|essere|fare|avere|sì|no)\b/gi
  }
  
  let bestMatch = { code: 'en', confidence: 0.5 }
  
  for (const [lang, pattern] of Object.entries(patterns)) {
    const matches = text.match(pattern)
    const confidence = matches ? Math.min(matches.length / 10, 0.9) : 0
    
    if (confidence > bestMatch.confidence) {
      bestMatch = { code: lang, confidence }
    }
  }
  
  return bestMatch
}

// Google Translate language detection
async function detectWithGoogleTranslate(text: string) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!apiKey) {
    return { code: 'en', confidence: 0.5 }
  }

  try {
    const url = `https://translation.googleapis.com/language/translate/v2/detect?key=${apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: text })
    })

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`)
    }

    const data = await response.json()
    const detection = data.data.detections[0][0]
    
    return {
      code: detection.language,
      confidence: detection.confidence
    }
  } catch (error) {
    console.error('Google Translate detection error:', error)
    return { code: 'en', confidence: 0.5 }
  }
}

// Azure Speech synthesis placeholder
async function synthesizeWithAzure(text: string, voice: string, language: string) {
  // Azure Speech implementation would go here
  throw new Error('Azure Speech not implemented yet')
}

// Azure Translator placeholder
async function translateWithAzure(text: string, targetLang: string, sourceLang: string) {
  // Azure Translator implementation would go here
  throw new Error('Azure Translator not implemented yet')
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
  
  const validation = validateEnvironment()
  if (validation.warnings.length > 0) {
    console.warn('⚠️  Configuration warnings:')
    validation.warnings.forEach(warning => console.warn(`   - ${warning}`))
  }
  
  if (validation.errors.length === 0) {
    console.log('✅ Server started successfully')
  }
})

export default app