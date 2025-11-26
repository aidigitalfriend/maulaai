/**
 * AI Lab Routes Setup
 * Combines all AI Lab routes and provides setup function for server integration
 */

import express from 'express'
import aiLabRoutes from './ai-lab.js'
import aiLabExtendedRoutes from './ai-lab-extended.js'

const router = express.Router()

// ================================
// AUTH MIDDLEWARE (PLACEHOLDER)
// ================================

// Simple auth middleware - replace with actual auth implementation
const authenticateUser = (req, res, next) => {
  // For development - use dummy user
  // In production, this would validate JWT tokens, sessions, etc.
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For development, create a dummy user if no auth provided
    req.user = {
      id: '507f1f77bcf86cd799439011', // dummy ObjectId
      email: 'test@example.com',
      name: 'Test User'
    }
  } else {
    // Extract token and validate (placeholder)
    const token = authHeader.substring(7)
    // TODO: Validate JWT token
    req.user = {
      id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      name: 'Test User'
    }
  }
  
  next()
}

// ================================
// ERROR HANDLER MIDDLEWARE
// ================================

const errorHandler = (error, req, res, next) => {
  console.error('AI Lab API Error:', error)

  // Mongoose validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message)
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors,
      timestamp: new Date().toISOString()
    })
  }

  // Mongoose cast errors (invalid ObjectId)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      timestamp: new Date().toISOString()
    })
  }

  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0]
    return res.status(400).json({
      success: false,
      message: `Duplicate value for ${field}`,
      timestamp: new Date().toISOString()
    })
  }

  // File upload errors
  if (error.message && error.message.includes('file')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }

  // Default server error
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    timestamp: new Date().toISOString()
  })
}

// ================================
// ROUTES SETUP
// ================================

// Apply auth middleware to all AI Lab routes
router.use(authenticateUser)

// Mount AI Lab routes
router.use('/', aiLabRoutes)
router.use('/', aiLabExtendedRoutes)

// Apply error handler
router.use(errorHandler)

// ================================
// ADDITIONAL API ENDPOINTS
// ================================

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Lab API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'connected',
      fileUpload: 'available',
      aiProcessing: 'available'
    }
  })
})

// Get AI Lab statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user?.id

    // Import models for stats
    const LabExperiment = (await import('../models/LabExperiment.ts')).default
    const DatasetAnalysis = (await import('../models/DatasetAnalysis.ts')).default
    const ImageGeneration = (await import('../models/ImageGeneration.ts')).default
    const EmotionAnalysis = (await import('../models/EmotionAnalysis.ts')).default
    const FuturePrediction = (await import('../models/FuturePrediction.ts')).default
    const MusicGeneration = (await import('../models/MusicGeneration.ts')).default
    const PersonalityTest = (await import('../models/PersonalityTest.ts')).default
    const CreativeWriting = (await import('../models/CreativeWriting.ts')).default
    const SmartAssistant = (await import('../models/SmartAssistant.ts')).default
    const VirtualReality = (await import('../models/VirtualReality.ts')).default
    const LanguageLearning = (await import('../models/LanguageLearning.ts')).default

    const stats = {
      totalExperiments: await LabExperiment.countDocuments({ userId }),
      experimentsByType: {
        datasetAnalysis: await DatasetAnalysis.countDocuments({ userId }),
        imageGeneration: await ImageGeneration.countDocuments({ userId }),
        emotionAnalysis: await EmotionAnalysis.countDocuments({ userId }),
        futurePrediction: await FuturePrediction.countDocuments({ userId }),
        musicGeneration: await MusicGeneration.countDocuments({ userId }),
        personalityTest: await PersonalityTest.countDocuments({ userId }),
        creativeWriting: await CreativeWriting.countDocuments({ userId }),
        smartAssistant: await SmartAssistant.countDocuments({ userId }),
        virtualReality: await VirtualReality.countDocuments({ userId }),
        languageLearning: await LanguageLearning.countDocuments({ userId })
      },
      recentActivity: await LabExperiment.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title type status updatedAt'),
      usage: {
        totalProcessingTime: 0, // Would be calculated from all experiments
        totalFileUploads: 0,
        averageExperimentDuration: 0
      }
    }

    res.json({
      success: true,
      data: stats,
      message: 'AI Lab statistics retrieved successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching AI Lab stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI Lab statistics',
      timestamp: new Date().toISOString()
    })
  }
})

// Get available AI models and capabilities
router.get('/capabilities', (req, res) => {
  const capabilities = {
    models: {
      textGeneration: ['gpt-4', 'claude-3', 'gemini-pro'],
      imageGeneration: ['dall-e-3', 'midjourney', 'stable-diffusion'],
      audioGeneration: ['elevenlabs', 'mubert', 'musicgen'],
      emotionAnalysis: ['openai-emotion', 'azure-cognitive', 'google-emotion'],
      languageProcessing: ['google-translate', 'deepl', 'azure-translator']
    },
    features: {
      fileUpload: {
        maxSize: '50MB',
        supportedFormats: ['jpg', 'png', 'wav', 'mp3', 'mp4', 'csv', 'json', 'txt', 'pdf']
      },
      realTimeProcessing: true,
      collaboration: true,
      analytics: true,
      export: ['pdf', 'json', 'csv', 'zip']
    },
    limits: {
      experimentsPerUser: 1000,
      filesPerExperiment: 20,
      collaboratorsPerExperiment: 10,
      apiCallsPerDay: 10000
    }
  }

  res.json({
    success: true,
    data: capabilities,
    message: 'AI Lab capabilities retrieved successfully',
    timestamp: new Date().toISOString()
  })
})

// ================================
// SETUP FUNCTION FOR SERVER INTEGRATION
// ================================

export const setupAILabRoutes = (app) => {
  // Mount all AI Lab routes under /api/ai-lab
  app.use('/api/ai-lab', router)
  
  console.log('✅ AI Lab routes mounted at /api/ai-lab')
  console.log('📋 Available endpoints:')
  console.log('   GET  /api/ai-lab/health')
  console.log('   GET  /api/ai-lab/stats')
  console.log('   GET  /api/ai-lab/capabilities')
  console.log('   📊 Experiments: GET|POST|PUT|DELETE /api/ai-lab/experiments')
  console.log('   📈 Dataset Analysis: GET|POST /api/ai-lab/dataset-analysis')
  console.log('   🎨 Image Generation: GET|POST /api/ai-lab/image-generation')
  console.log('   😊 Emotion Analysis: GET|POST /api/ai-lab/emotion-analysis')
  console.log('   🔮 Future Prediction: GET|POST /api/ai-lab/future-prediction')
  console.log('   🎵 Music Generation: GET|POST /api/ai-lab/music-generation')
  console.log('   🧠 Personality Test: GET|POST /api/ai-lab/personality-test')
  console.log('   ✍️  Creative Writing: GET|POST|PUT /api/ai-lab/creative-writing')
  console.log('   🤖 Smart Assistant: GET|POST /api/ai-lab/smart-assistant')
  console.log('   🥽 Virtual Reality: GET|POST /api/ai-lab/virtual-reality')
  console.log('   🌍 Language Learning: GET|POST|PUT /api/ai-lab/language-learning')
}

export default router