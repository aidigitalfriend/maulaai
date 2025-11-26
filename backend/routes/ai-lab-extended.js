/**
 * AI Lab API Routes - Part 2
 * Additional routes for Creative Writing, Smart Assistant, VR, and Language Learning
 */

import express from 'express'
import multer from 'multer'
import mongoose from 'mongoose'

// Import remaining AI Lab models
import CreativeWriting from '../models/CreativeWriting.ts'
import SmartAssistant from '../models/SmartAssistant.ts'
import VirtualReality from '../models/VirtualReality.ts'
import LanguageLearning from '../models/LanguageLearning.ts'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
})

// ================================
// UTILITY FUNCTIONS
// ================================

const handleAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id)
}

const createResponse = (success, data = null, message = null, meta = null) => {
  return {
    success,
    data,
    message,
    meta,
    timestamp: new Date().toISOString()
  }
}

// ================================
// CREATIVE WRITING
// ================================

// Create creative writing project
router.post('/creative-writing', handleAsync(async (req, res) => {
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  try {
    const writingData = {
      ...req.body,
      userId,
      content: {
        ...req.body.content,
        wordCount: req.body.content?.text ? req.body.content.text.split(/\\s+/).length : 0,
        characterCount: req.body.content?.text ? req.body.content.text.length : 0,
        paragraphCount: req.body.content?.text ? req.body.content.text.split('\\n\\n').length : 0
      }
    }

    // Calculate reading time
    if (writingData.content.wordCount) {
      writingData.content.readingTime = Math.ceil(writingData.content.wordCount / 200) // 200 WPM
    }

    const writing = new CreativeWriting(writingData)
    await writing.save()
    
    // Trigger async AI analysis here
    // analyzeCreativeWriting(writing._id)
    
    res.status(201).json(createResponse(true, writing, 'Creative writing project created successfully'))
  } catch (error) {
    console.error('Error creating creative writing:', error)
    res.status(400).json(createResponse(false, null, error.message))
  }
}))

// Get creative writing projects for user
router.get('/creative-writing', handleAsync(async (req, res) => {
  const { page = 1, limit = 10, genre, writingType, visibility } = req.query
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  const query = {
    $or: [
      { userId },
      { 'publication.visibility': 'public' },
      { 'collaboration.contributors.userId': userId }
    ]
  }
  
  if (genre) query.genre = genre
  if (writingType) query.writingType = writingType
  if (visibility) query['publication.visibility'] = visibility

  try {
    const writings = await CreativeWriting.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('experimentId', 'title')
      .populate('collaboration.contributors.userId', 'name')

    const total = await CreativeWriting.countDocuments(query)
    
    res.json(createResponse(true, {
      data: writings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Creative writing projects retrieved successfully'))
  } catch (error) {
    console.error('Error fetching creative writings:', error)
    res.status(500).json(createResponse(false, null, 'Failed to fetch creative writings'))
  }
}))

// Update creative writing
router.put('/creative-writing/:id', handleAsync(async (req, res) => {
  const { id } = req.params
  const userId = req.user?.id
  
  if (!validateObjectId(id)) {
    return res.status(400).json(createResponse(false, null, 'Invalid writing ID'))
  }

  try {
    const writing = await CreativeWriting.findOne({
      _id: id,
      $or: [
        { userId },
        { 'collaboration.contributors.userId': userId }
      ]
    })
    
    if (!writing) {
      return res.status(404).json(createResponse(false, null, 'Creative writing not found'))
    }

    // Create new version if collaborative
    if (writing.collaboration.isCollaborative && req.body.content?.text) {
      await writing.addVersion(req.body.content.text, req.body.changes || 'Content update', userId)
    }

    // Update writing data
    Object.assign(writing, req.body)
    
    // Recalculate metrics if content changed
    if (req.body.content?.text) {
      writing.content.wordCount = req.body.content.text.split(/\\s+/).length
      writing.content.characterCount = req.body.content.text.length
      writing.content.paragraphCount = req.body.content.text.split('\\n\\n').length
      writing.content.readingTime = Math.ceil(writing.content.wordCount / 200)
    }

    await writing.save()
    
    res.json(createResponse(true, writing, 'Creative writing updated successfully'))
  } catch (error) {
    console.error('Error updating creative writing:', error)
    res.status(400).json(createResponse(false, null, error.message))
  }
}))

// Add peer review
router.post('/creative-writing/:id/review', handleAsync(async (req, res) => {
  const { id } = req.params
  const { rating, comments, categories } = req.body
  const reviewerId = req.user?.id
  
  if (!validateObjectId(id)) {
    return res.status(400).json(createResponse(false, null, 'Invalid writing ID'))
  }

  try {
    const writing = await CreativeWriting.findById(id)
    
    if (!writing) {
      return res.status(404).json(createResponse(false, null, 'Creative writing not found'))
    }

    // Add peer review
    writing.feedback.peerReviews.push({
      reviewerId,
      rating,
      comments,
      categories,
      timestamp: new Date()
    })

    await writing.save()
    
    res.json(createResponse(true, writing, 'Review added successfully'))
  } catch (error) {
    console.error('Error adding review:', error)
    res.status(500).json(createResponse(false, null, 'Failed to add review'))
  }
}))

// ================================
// SMART ASSISTANT
// ================================

// Create smart assistant
router.post('/smart-assistant', handleAsync(async (req, res) => {
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  try {
    const assistantData = {
      ...req.body,
      userId
    }

    const assistant = new SmartAssistant(assistantData)
    await assistant.save()
    
    res.status(201).json(createResponse(true, assistant, 'Smart assistant created successfully'))
  } catch (error) {
    console.error('Error creating smart assistant:', error)
    res.status(400).json(createResponse(false, null, error.message))
  }
}))

// Get user's smart assistants
router.get('/smart-assistant', handleAsync(async (req, res) => {
  const { page = 1, limit = 10, type, active } = req.query
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  const query = { userId }
  if (type) query.assistantType = type
  if (active !== undefined) query['settings.isActive'] = active === 'true'

  try {
    const assistants = await SmartAssistant.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('experimentId', 'title')

    const total = await SmartAssistant.countDocuments(query)
    
    res.json(createResponse(true, {
      data: assistants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Smart assistants retrieved successfully'))
  } catch (error) {
    console.error('Error fetching smart assistants:', error)
    res.status(500).json(createResponse(false, null, 'Failed to fetch smart assistants'))
  }
}))

// Chat with smart assistant
router.post('/smart-assistant/:id/chat', handleAsync(async (req, res) => {
  const { id } = req.params
  const { conversationId, message } = req.body
  const userId = req.user?.id
  
  if (!validateObjectId(id)) {
    return res.status(400).json(createResponse(false, null, 'Invalid assistant ID'))
  }

  try {
    const assistant = await SmartAssistant.findOne({ _id: id, userId })
    
    if (!assistant) {
      return res.status(404).json(createResponse(false, null, 'Smart assistant not found'))
    }

    // Add user message
    await assistant.addMessage(conversationId, 'user', message)
    
    // Generate AI response (placeholder - would integrate with actual AI service)
    const aiResponse = `Thank you for your message: \"${message}\". I'm processing your request...`
    
    await assistant.addMessage(conversationId, 'assistant', aiResponse, {
      processingTime: 150,
      confidence: 0.85
    })
    
    res.json(createResponse(true, { response: aiResponse }, 'Message processed successfully'))
  } catch (error) {
    console.error('Error processing chat:', error)
    res.status(500).json(createResponse(false, null, 'Failed to process message'))
  }
}))

// Update assistant memory
router.post('/smart-assistant/:id/memory', handleAsync(async (req, res) => {
  const { id } = req.params
  const { category, key, value, confidence } = req.body
  const userId = req.user?.id
  
  if (!validateObjectId(id)) {
    return res.status(400).json(createResponse(false, null, 'Invalid assistant ID'))
  }

  try {
    const assistant = await SmartAssistant.findOne({ _id: id, userId })
    
    if (!assistant) {
      return res.status(404).json(createResponse(false, null, 'Smart assistant not found'))
    }

    await assistant.updateMemory(category, key, value, confidence)
    
    res.json(createResponse(true, assistant, 'Memory updated successfully'))
  } catch (error) {
    console.error('Error updating memory:', error)
    res.status(500).json(createResponse(false, null, 'Failed to update memory'))
  }
}))

// ================================
// VIRTUAL REALITY
// ================================

// Create VR experience
router.post('/virtual-reality', upload.array('assets', 20), handleAsync(async (req, res) => {
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  try {
    const vrData = {
      ...req.body,
      userId,
      assets: {
        models3D: [],
        textures: [],
        audio: [],
        animations: []
      }
    }

    // Process uploaded assets
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const assetData = {
          url: `uploads/vr/${file.originalname}`,
          name: file.originalname,
          fileSize: file.size,
          format: file.mimetype.split('/')[1]
        }

        if (file.mimetype.startsWith('model/')) {
          assetData.type = 'object'
          vrData.assets.models3D.push(assetData)
        } else if (file.mimetype.startsWith('image/')) {
          assetData.resolution = '1024x1024'
          assetData.type = 'diffuse'
          vrData.assets.textures.push(assetData)
        } else if (file.mimetype.startsWith('audio/')) {
          assetData.type = 'ambient'
          assetData.duration = 0 // Would be extracted from file
          vrData.assets.audio.push(assetData)
        }
      })
    }

    const vr = new VirtualReality(vrData)
    await vr.save()
    
    res.status(201).json(createResponse(true, vr, 'VR experience created successfully'))
  } catch (error) {
    console.error('Error creating VR experience:', error)
    res.status(400).json(createResponse(false, null, error.message))
  }
}))

// Get VR experiences for user
router.get('/virtual-reality', handleAsync(async (req, res) => {
  const { page = 1, limit = 10, experienceType, category, visibility } = req.query
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  const query = {
    $or: [
      { userId },
      { visibility: 'public' }
    ]
  }
  
  if (experienceType) query.experienceType = experienceType
  if (category) query.category = category
  if (visibility) query.visibility = visibility

  try {
    const experiences = await VirtualReality.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('experimentId', 'title')

    const total = await VirtualReality.countDocuments(query)
    
    res.json(createResponse(true, {
      data: experiences,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'VR experiences retrieved successfully'))
  } catch (error) {
    console.error('Error fetching VR experiences:', error)
    res.status(500).json(createResponse(false, null, 'Failed to fetch VR experiences'))
  }
}))

// Start VR session
router.post('/virtual-reality/:id/session', handleAsync(async (req, res) => {
  const { id } = req.params
  const { sessionId } = req.body
  const userId = req.user?.id
  
  if (!validateObjectId(id)) {
    return res.status(400).json(createResponse(false, null, 'Invalid VR experience ID'))
  }

  try {
    const vr = await VirtualReality.findById(id)
    
    if (!vr) {
      return res.status(404).json(createResponse(false, null, 'VR experience not found'))
    }

    const sessionData = {
      sessionId: sessionId || new mongoose.Types.ObjectId().toString(),
      startTime: new Date(),
      interactions: 0,
      completion: 0
    }

    await vr.addSession(sessionData)
    
    res.json(createResponse(true, { sessionId: sessionData.sessionId }, 'VR session started successfully'))
  } catch (error) {
    console.error('Error starting VR session:', error)
    res.status(500).json(createResponse(false, null, 'Failed to start VR session'))
  }
}))

// Rate VR experience
router.post('/virtual-reality/:id/rate', handleAsync(async (req, res) => {
  const { id } = req.params
  const { overall, immersion, comfort, content, performance, comment } = req.body
  const userId = req.user?.id
  
  if (!validateObjectId(id)) {
    return res.status(400).json(createResponse(false, null, 'Invalid VR experience ID'))
  }

  try {
    const vr = await VirtualReality.findById(id)
    
    if (!vr) {
      return res.status(404).json(createResponse(false, null, 'VR experience not found'))
    }

    // Add rating
    vr.feedback.ratings.push({
      userId,
      overall,
      immersion,
      comfort,
      content,
      performance,
      comment,
      timestamp: new Date()
    })

    await vr.save()
    
    res.json(createResponse(true, vr, 'Rating added successfully'))
  } catch (error) {
    console.error('Error adding VR rating:', error)
    res.status(500).json(createResponse(false, null, 'Failed to add rating'))
  }
}))

// ================================
// LANGUAGE LEARNING
// ================================

// Create language learning program
router.post('/language-learning', handleAsync(async (req, res) => {
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  try {
    const learningData = {
      ...req.body,
      userId
    }

    const learning = new LanguageLearning(learningData)
    await learning.save()
    
    res.status(201).json(createResponse(true, learning, 'Language learning program created successfully'))
  } catch (error) {
    console.error('Error creating language learning:', error)
    res.status(400).json(createResponse(false, null, error.message))
  }
}))

// Get language learning programs for user
router.get('/language-learning', handleAsync(async (req, res) => {
  const { page = 1, limit = 10, targetLanguage, proficiencyLevel } = req.query
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  const query = { userId }
  if (targetLanguage) query.targetLanguage = targetLanguage
  if (proficiencyLevel) query.proficiencyLevel = proficiencyLevel

  try {
    const programs = await LanguageLearning.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('experimentId', 'title')

    const total = await LanguageLearning.countDocuments(query)
    
    res.json(createResponse(true, {
      data: programs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Language learning programs retrieved successfully'))
  } catch (error) {
    console.error('Error fetching language learning:', error)
    res.status(500).json(createResponse(false, null, 'Failed to fetch language learning programs'))
  }
}))

// Add vocabulary word
router.post('/language-learning/:id/vocabulary', handleAsync(async (req, res) => {
  const { id } = req.params
  const { word, translation, category, difficulty } = req.body
  const userId = req.user?.id
  
  if (!validateObjectId(id)) {
    return res.status(400).json(createResponse(false, null, 'Invalid learning program ID'))
  }

  try {
    const learning = await LanguageLearning.findOne({ _id: id, userId })
    
    if (!learning) {
      return res.status(404).json(createResponse(false, null, 'Language learning program not found'))
    }

    await learning.addVocabularyWord(word, translation, category, difficulty || 5)
    
    res.json(createResponse(true, learning, 'Vocabulary word added successfully'))
  } catch (error) {
    console.error('Error adding vocabulary:', error)
    res.status(500).json(createResponse(false, null, 'Failed to add vocabulary word'))
  }
}))

// Submit pronunciation assessment
router.post('/language-learning/:id/pronunciation', upload.single('audio'), handleAsync(async (req, res) => {
  const { id } = req.params
  const { word, phonetic } = req.body
  const userId = req.user?.id
  
  if (!validateObjectId(id)) {
    return res.status(400).json(createResponse(false, null, 'Invalid learning program ID'))
  }

  try {
    const learning = await LanguageLearning.findOne({ _id: id, userId })
    
    if (!learning) {
      return res.status(404).json(createResponse(false, null, 'Language learning program not found'))
    }

    // Process audio file (placeholder)
    const audioUrl = req.file ? `uploads/pronunciation/${req.file.originalname}` : null
    
    // Add pronunciation assessment
    learning.pronunciation.assessments.push({
      word,
      phonetic,
      userAttempt: {
        audioUrl,
        phonetic: phonetic || word, // Would be extracted from audio
        confidence: 0.8 // Would be calculated
      },
      aiAnalysis: {
        accuracy: 0.85, // Would be calculated by AI
        feedback: 'Good pronunciation! Pay attention to the vowel sounds.',
        problemAreas: ['vowel clarity'],
        suggestions: ['Practice vowel sounds separately', 'Listen to native speakers']
      },
      timestamp: new Date()
    })

    await learning.save()
    
    res.json(createResponse(true, learning, 'Pronunciation assessment submitted successfully'))
  } catch (error) {
    console.error('Error submitting pronunciation:', error)
    res.status(500).json(createResponse(false, null, 'Failed to submit pronunciation assessment'))
  }
}))

// Update learning progress
router.put('/language-learning/:id/progress', handleAsync(async (req, res) => {
  const { id } = req.params
  const userId = req.user?.id
  
  if (!validateObjectId(id)) {
    return res.status(400).json(createResponse(false, null, 'Invalid learning program ID'))
  }

  try {
    const learning = await LanguageLearning.findOne({ _id: id, userId })
    
    if (!learning) {
      return res.status(404).json(createResponse(false, null, 'Language learning program not found'))
    }

    // Calculate overall progress
    const overallProgress = learning.calculateOverallProgress()
    
    res.json(createResponse(true, {
      overallProgress,
      skillLevels: learning.analytics.progress.skillLevels,
      totalVocabulary: learning.vocabulary.totalVocabulary,
      grammarMastery: learning.grammar.overallMastery
    }, 'Progress updated successfully'))
  } catch (error) {
    console.error('Error updating progress:', error)
    res.status(500).json(createResponse(false, null, 'Failed to update progress'))
  }
}))

export default router