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

// Compatibility alias: /api/health -> same as /health
app.get('/api/health', (req, res) => {
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
});

// Gamification API (in-memory) mounted at /api/gamification
;(() => {
  const gamificationDB = {}

  // Simple auth middleware for demo
  function authMiddleware(req, res, next) {
    const userId = req.headers['x-user-id']
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.replace('Bearer ', '')
    if (!userId || !token) return res.status(401).json({ error: 'Unauthorized' })
    req.userId = String(userId)
    next()
  }

  const router = express.Router()
  router.use(authMiddleware)

  // Initialize/Get user profile
  router.get('/profile/:userId', (req, res) => {
    try {
      const { userId } = req.params
      let profile = gamificationDB[userId]
      if (!profile) {
        profile = {
          userId,
          username: req.headers['x-username'] || `User_${userId}`,
          totalPoints: 0,
          achievements: [],
          unlockedBadges: [],
          leaderboardRank: 0,
          currentStreak: 0,
          masteryScores: {},
          rewards: {
            totalPoints: 0,
            availablePoints: 0,
            spentPoints: 0,
            inventory: [],
            transactions: []
          },
          metrics: {
            totalMessages: 0,
            perfectResponses: 0,
            highScores: 0,
            agentsUsed: [],
            usageByHour: {},
            usageByDay: {},
            completedChallenges: 0,
            currentStreak: 0
          },
          createdAt: new Date(),
          lastUpdated: new Date()
        }
        gamificationDB[userId] = profile
      }
      res.json({ success: true, data: profile })
    } catch (e) {
      console.error('Error fetching profile:', e)
      res.status(500).json({ error: 'Failed to fetch profile' })
    }
  })

  // Update metrics
  router.post('/metrics/track', (req, res) => {
    try {
      const userId = req.userId
      const { event, data = {} } = req.body || {}
      const profile = gamificationDB[userId]
      if (!profile) return res.status(404).json({ error: 'Profile not found' })

      switch (event) {
        case 'message-sent': {
          profile.metrics.totalMessages += 1
          profile.totalPoints += 10
          profile.rewards.totalPoints += 10
          profile.rewards.availablePoints += 10
          if (data.agentId && !profile.metrics.agentsUsed.includes(data.agentId)) {
            profile.metrics.agentsUsed.push(data.agentId)
          }
          const hour = new Date().getHours()
          profile.metrics.usageByHour[hour] = (profile.metrics.usageByHour[hour] || 0) + 1
          const day = new Date().toISOString().split('T')[0]
          profile.metrics.usageByDay[day] = (profile.metrics.usageByDay[day] || 0) + 1
          break
        }
        case 'perfect-response': {
          profile.metrics.perfectResponses += 1
          profile.totalPoints += 50
          profile.rewards.totalPoints += 50
          profile.rewards.availablePoints += 50
          break
        }
        case 'high-score': {
          profile.metrics.highScores += 1
          profile.totalPoints += 25
          profile.rewards.totalPoints += 25
          profile.rewards.availablePoints += 25
          break
        }
        case 'challenge-completed': {
          const pts = Number(data.points) || 100
          profile.metrics.completedChallenges += 1
          profile.totalPoints += pts
          profile.rewards.totalPoints += pts
          profile.rewards.availablePoints += pts
          break
        }
        case 'streak-updated': {
          const s = Number(data.streak) || 0
          profile.metrics.currentStreak = s
          profile.currentStreak = s
          profile.totalPoints += s * 10
          profile.rewards.totalPoints += s * 10
          break
        }
        default:
          break
      }

      profile.lastUpdated = new Date()
      const newAchievements = checkAchievements(profile)
      if (newAchievements.length) {
        profile.achievements.push(...newAchievements)
        profile.unlockedBadges.push(...newAchievements.map(a => a.id))
        const achievementPoints = newAchievements.reduce((sum, a) => sum + a.points, 0)
        profile.totalPoints += achievementPoints
        profile.rewards.totalPoints += achievementPoints
        profile.rewards.availablePoints += achievementPoints
      }

      res.json({
        success: true,
        data: {
          totalPoints: profile.totalPoints,
          newAchievements,
          currentStreak: profile.currentStreak,
          rewards: profile.rewards
        }
      })
    } catch (e) {
      console.error('Error tracking metrics:', e)
      res.status(500).json({ error: 'Failed to track metrics' })
    }
  })

  // Leaderboard
  router.get('/leaderboard/:category', (req, res) => {
    try {
      const { category } = req.params
      const limit = parseInt(String(req.query.limit || '50'))
      const offset = parseInt(String(req.query.offset || '0'))
      const profiles = Object.values(gamificationDB)
      let sorted = [...profiles].sort((a, b) => {
        switch (category) {
          case 'total-points': return b.totalPoints - a.totalPoints
          case 'achievements': return b.achievements.length - a.achievements.length
          case 'streak': return b.currentStreak - a.currentStreak
          case 'messages': return b.metrics.totalMessages - a.metrics.totalMessages
          default: return b.totalPoints - a.totalPoints
        }
      })
      sorted = sorted.map((p, i) => ({ ...p, rank: i + 1, tier: getTier(p.totalPoints) }))
      const start = offset * limit
      const page = sorted.slice(start, start + limit)
      res.json({ success: true, data: { category, total: sorted.length, limit, offset, entries: page } })
    } catch (e) {
      console.error('Error fetching leaderboard:', e)
      res.status(500).json({ error: 'Failed to fetch leaderboard' })
    }
  })

  // Daily challenges
  router.get('/challenges/today', (req, res) => {
    try {
      const userId = req.userId
      const today = new Date().toISOString().split('T')[0]
      const profile = gamificationDB[userId]
      if (!profile) return res.status(404).json({ error: 'Profile not found' })
      const challenges = [
        {
          id: `challenge-1-${today}`,
          name: 'Chat Master',
          description: 'Send 5 messages today',
          difficulty: 'easy',
          points: 50,
          progress: profile.metrics.usageByDay[today] || 0,
          target: 5,
          completed: (profile.metrics.usageByDay[today] || 0) >= 5
        },
        {
          id: `challenge-2-${today}`,
          name: 'Agent Explorer',
          description: 'Use 3 different agents',
          difficulty: 'medium',
          points: 75,
          progress: profile.metrics.agentsUsed.length,
          target: 3,
          completed: profile.metrics.agentsUsed.length >= 3
        },
        {
          id: `challenge-3-${today}`,
          name: 'Quality Seeker',
          description: 'Get 2 perfect responses',
          difficulty: 'hard',
          points: 100,
          progress: profile.metrics.perfectResponses,
          target: 2,
          completed: profile.metrics.perfectResponses >= 2
        }
      ]
      res.json({ success: true, data: { date: today, challenges } })
    } catch (e) {
      console.error('Error fetching challenges:', e)
      res.status(500).json({ error: 'Failed to fetch challenges' })
    }
  })

  // Complete challenge
  router.post('/challenges/complete', (req, res) => {
    try {
      const userId = req.userId
      const { challengeId, points } = req.body || {}
      const profile = gamificationDB[userId]
      if (!profile) return res.status(404).json({ error: 'Profile not found' })
      const pts = Number(points) || 0
      profile.totalPoints += pts
      profile.rewards.totalPoints += pts
      profile.rewards.availablePoints += pts
      profile.metrics.completedChallenges += 1
      profile.lastUpdated = new Date()
      res.json({ success: true, data: { totalPoints: profile.totalPoints, completedCount: profile.metrics.completedChallenges, rewardsEarned: pts } })
    } catch (e) {
      console.error('Error completing challenge:', e)
      res.status(500).json({ error: 'Failed to complete challenge' })
    }
  })

  // Achievements
  router.get('/achievements', (req, res) => {
    try {
      const userId = req.userId
      const profile = gamificationDB[userId]
      if (!profile) return res.status(404).json({ error: 'Profile not found' })
      res.json({ success: true, data: { unlockedCount: profile.achievements.length, achievements: profile.achievements, totalPoints: profile.totalPoints } })
    } catch (e) {
      console.error('Error fetching achievements:', e)
      res.status(500).json({ error: 'Failed to fetch achievements' })
    }
  })

  // Shop items
  router.get('/shop/items', (req, res) => {
    try {
      const userId = req.userId
      const profile = gamificationDB[userId]
      if (!profile) return res.status(404).json({ error: 'Profile not found' })
      const shopItems = [
        { id: 'avatar-1', name: 'Gold Avatar', price: 100, category: 'avatar', owned: false },
        { id: 'avatar-2', name: 'Platinum Avatar', price: 200, category: 'avatar', owned: false },
        { id: 'badge-1', name: 'VIP Badge', price: 150, category: 'badge', owned: false },
        { id: 'theme-1', name: 'Dark Theme Pro', price: 80, category: 'theme', owned: false },
        { id: 'theme-2', name: 'Cosmic Theme', price: 120, category: 'theme', owned: false }
      ]
      res.json({ success: true, data: { availablePoints: profile.rewards.availablePoints, inventory: profile.rewards.inventory, items: shopItems.map(item => ({ ...item, owned: profile.rewards.inventory.includes(item.id) })) } })
    } catch (e) {
      console.error('Error fetching shop items:', e)
      res.status(500).json({ error: 'Failed to fetch shop' })
    }
  })

  // Purchase
  router.post('/shop/purchase', (req, res) => {
    try {
      const userId = req.userId
      const { itemId, price } = req.body || {}
      const profile = gamificationDB[userId]
      if (!profile) return res.status(404).json({ error: 'Profile not found' })
      const cost = Number(price) || 0
      if (profile.rewards.availablePoints < cost) return res.status(400).json({ error: 'Insufficient points' })
      profile.rewards.availablePoints -= cost
      profile.rewards.spentPoints += cost
      profile.rewards.inventory.push(itemId)
      profile.rewards.transactions.push({ id: `txn-${Date.now()}`, type: 'purchase', itemId, amount: cost, timestamp: new Date() })
      res.json({ success: true, data: { itemId, availablePoints: profile.rewards.availablePoints, inventory: profile.rewards.inventory } })
    } catch (e) {
      console.error('Error purchasing item:', e)
      res.status(500).json({ error: 'Failed to purchase item' })
    }
  })

  // Mastery
  router.get('/mastery', (req, res) => {
    try {
      const userId = req.userId
      const profile = gamificationDB[userId]
      if (!profile) return res.status(404).json({ error: 'Profile not found' })
      const masteryScores = profile.metrics.agentsUsed.reduce((acc, agentId) => {
        const count = profile.metrics.agentsUsed.filter(a => a === agentId).length
        acc[agentId] = Math.min(Math.floor(count / 10), 5)
        return acc
      }, {})
      res.json({ success: true, data: { masteryScores, totalMastery: profile.metrics.agentsUsed.length * 10 } })
    } catch (e) {
      console.error('Error fetching mastery:', e)
      res.status(500).json({ error: 'Failed to fetch mastery' })
    }
  })

  // Helpers
  function getTier(points) {
    if (points < 1000) return 'bronze'
    if (points < 5000) return 'silver'
    if (points < 15000) return 'gold'
    if (points < 50000) return 'platinum'
    return 'diamond'
  }

  function checkAchievements(profile) {
    const newAchievements = []
    const already = new Set(profile.achievements.map(a => a.id))
    if (profile.metrics.totalMessages === 1 && !already.has('first-agent')) {
      newAchievements.push({ id: 'first-agent', name: 'Agent Whisperer', description: 'Use your first AI agent', points: 10, rarity: 'common', unlockedAt: new Date() })
    }
    if (profile.metrics.totalMessages >= 100 && !already.has('explore-100-messages')) {
      newAchievements.push({ id: 'explore-100-messages', name: 'Conversationalist', description: 'Send 100 messages', points: 25, rarity: 'uncommon', unlockedAt: new Date() })
    }
    if (profile.metrics.agentsUsed.length === 18 && !already.has('all-agents-tried')) {
      newAchievements.push({ id: 'all-agents-tried', name: 'Agent Collector', description: 'Try all 18 AI agents', points: 50, rarity: 'rare', unlockedAt: new Date() })
    }
    if (profile.currentStreak >= 7 && !already.has('week-warrior')) {
      newAchievements.push({ id: 'week-warrior', name: 'Week Warrior', description: 'Maintain 7-day usage streak', points: 40, rarity: 'uncommon', unlockedAt: new Date() })
    }
    if (profile.metrics.perfectResponses >= 10 && !already.has('perfectionist')) {
      newAchievements.push({ id: 'perfectionist', name: 'Perfectionist', description: 'Get 10 perfect responses', points: 75, rarity: 'rare', unlockedAt: new Date() })
    }
    return newAchievements
  }

  app.use('/api/gamification', router)
})()

// IP information endpoint (used by frontend /tools/ip-info)
// GET /api/ipinfo?ip=1.2.3.4
app.get('/api/ipinfo', async (req, res) => {
  try {
    // Determine target IP: query ?ip= overrides detected client IP
    const q = (req.query?.ip || '').toString().trim()
    const forwardedFor = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim()
    const remoteIP = req.ip?.replace('::ffff:', '') || ''
    const targetIP = q || forwardedFor || remoteIP || ''

    // Prefer ip-api.com (no key needed); request minimal fields to keep latency low
    const ipApiFields = 'status,message,query,reverse,country,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,mobile,proxy,hosting'
    const ipApiUrl = `http://ip-api.com/json/${encodeURIComponent(targetIP || '')}?fields=${ipApiFields}`

    let raw = null
    let source = 'ip-api.com'

    try {
      const r = await fetch(ipApiUrl)
      raw = await r.json()
      if (!r.ok || raw?.status === 'fail') {
        throw new Error(raw?.message || 'ip-api.com lookup failed')
      }
    } catch (err) {
      // Fallback to ipapi.co
      const ipapiUrl = `https://ipapi.co/${encodeURIComponent(targetIP || '')}/json/`
      const r2 = await fetch(ipapiUrl)
      const j2 = await r2.json()
      if (!r2.ok || j2?.error) {
        return res.status(502).json({ success: false, error: j2?.reason || 'IP lookup failed' })
      }
      raw = j2
      source = 'ipapi.co'
    }

    // Normalize into the shape expected by the frontend
    // Map for ip-api.com payload
    const isIpApi = source === 'ip-api.com'

    const ip = isIpApi ? (raw.query || '') : (raw.ip || '')
    const city = isIpApi ? raw.city : raw.city
    const region = isIpApi ? raw.regionName : (raw.region || raw.region_code)
    const country = isIpApi ? raw.country : (raw.country_name || raw.country)
    const postal = isIpApi ? raw.zip : raw.postal
    const timezone = isIpApi ? raw.timezone : raw.timezone
    const lat = isIpApi ? raw.lat : raw.latitude
    const lon = isIpApi ? raw.lon : raw.longitude
    const isp = isIpApi ? raw.isp : (raw.org || raw.org)
    const org = isIpApi ? raw.org : (raw.org || raw.org)
    const asFull = isIpApi ? raw.as : (raw.asn || '')
    const asName = isIpApi ? raw.asname : (raw.asn_name || '')
    const reverse = isIpApi ? raw.reverse : (raw.hostname || '')
    const proxy = isIpApi ? !!raw.proxy : !!raw.proxy
    const hosting = isIpApi ? !!raw.hosting : (raw.hosting === true || /cloud|hosting|datacenter/i.test(org || isp || ''))

    // Derive ASN number if embedded like "AS15169 Google LLC"
    let asn = ''
    if (asFull) {
      const m = String(asFull).match(/AS\d+/i)
      asn = m ? m[0].toUpperCase() : String(asFull)
    }

    // Heuristic flags
    const isVPN = Boolean(hosting && /(vpn|privacy|mullvad|nord|express)/i.test(`${isp} ${org} ${asName}`))
    const isProxy = Boolean(proxy)
    const isTor = /(tor|exit\s*node)/i.test(`${isp} ${org} ${asName}`)
    const isHosting = Boolean(hosting)

    let threat = 'low'
    if (isTor || isProxy) threat = 'high'
    else if (isVPN) threat = 'medium'

    const data = {
      ip: ip || targetIP || 'unknown',
      location: {
        city: city || undefined,
        region: region || undefined,
        country: country || undefined,
        coordinates: (lat != null && lon != null) ? { lat: Number(lat), lng: Number(lon) } : undefined,
        postal: postal || undefined,
        timezone: timezone || undefined
      },
      network: {
        isp: isp || undefined,
        organization: org || undefined,
        asn: asn || undefined,
        asnName: asName || undefined,
        domain: undefined,
        type: isHosting ? 'hosting' : 'residential'
      },
      security: {
        isVPN,
        isProxy,
        isTor,
        isHosting,
        threat,
        service: undefined
      },
      metadata: {
        hostname: reverse || undefined,
        lastUpdated: new Date().toISOString(),
        source,
        userAgent: req.headers['user-agent']
      }
    }

    res.json({ success: true, data, raw })
  } catch (error) {
    console.error('IP info error:', error)
    res.status(500).json({ success: false, error: 'Failed to retrieve IP information' })
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