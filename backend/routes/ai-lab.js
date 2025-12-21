/**
 * AI Lab API Routes
 * Comprehensive REST API for AI Lab System
 * Supports all 11 AI Lab models with CRUD operations, file uploads, and advanced features
 */

import express from 'express'
import multer from 'multer'
import { GridFSBucket } from 'mongodb'
import { MongoClient } from 'mongodb'
import mongoose from 'mongoose'

// Import all AI Lab models


const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types for AI experiments
    const allowedTypes = /jpeg|jpg|png|gif|wav|mp3|mp4|avi|csv|json|txt|pdf|doc|docx/
    const extname = allowedTypes.test(file.originalname.toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Invalid file type for AI experiment'))
    }
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
// LAB EXPERIMENTS (Core)
// ================================

// Get all experiments for user
router.get('/experiments', handleAsync(async (req, res) => {
  const { page = 1, limit = 10, type, status, search } = req.query
  const userId = req.user?.id // Assumes auth middleware sets req.user
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  const query = { userId }
  
  if (type) query.type = type
  if (status) query.status = status
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ]
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: ['collaborators.userId']
  }

  try {
    const experiments = await LabExperiment.paginate(query, options)
    res.json(createResponse(true, experiments, 'Experiments retrieved successfully'))
  } catch (error) {
    console.error('Error fetching experiments:', error)
    res.status(500).json(createResponse(false, null, 'Failed to fetch experiments'))
  }
}))

// Create new experiment
router.post('/experiments', upload.array('files', 10), handleAsync(async (req, res) => {
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  try {
    const experimentData = {
      ...req.body,
      userId,
      files: req.files ? req.files.map(file => ({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        buffer: file.buffer
      })) : []
    }

    const experiment = new LabExperiment(experimentData)
    await experiment.save()
    
    res.status(201).json(createResponse(true, experiment, 'Experiment created successfully'))
  } catch (error) {
    console.error('Error creating experiment:', error)
    res.status(400).json(createResponse(false, null, error.message))
  }
}))

// Get specific experiment
router.get('/experiments/:id', handleAsync(async (req, res) => {
  const { id } = req.params
  const userId = req.user?.id
  
  if (!validateObjectId(id)) {
    return res.status(400).json(createResponse(false, null, 'Invalid experiment ID'))
  }

  try {
    const experiment = await LabExperiment.findOne({
      _id: id,
      $or: [
        { userId },
        { 'sharing.visibility': 'public' },
        { 'collaborators.userId': userId }
      ]
    }).populate('collaborators.userId', 'name email')

    if (!experiment) {
      return res.status(404).json(createResponse(false, null, 'Experiment not found'))
    }

    res.json(createResponse(true, experiment, 'Experiment retrieved successfully'))
  } catch (error) {
    console.error('Error fetching experiment:', error)
    res.status(500).json(createResponse(false, null, 'Failed to fetch experiment'))
  }
}))

// Update experiment
router.put('/experiments/:id', upload.array('files', 10), handleAsync(async (req, res) => {
  const { id } = req.params
  const userId = req.user?.id
  
  if (!validateObjectId(id)) {
    return res.status(400).json(createResponse(false, null, 'Invalid experiment ID'))
  }

  try {
    const experiment = await LabExperiment.findOne({ _id: id, userId })
    
    if (!experiment) {
      return res.status(404).json(createResponse(false, null, 'Experiment not found'))
    }

    // Update experiment data
    Object.assign(experiment, req.body)
    
    // Handle new files
    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map(file => ({
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        buffer: file.buffer
      }))
      experiment.files.push(...newFiles)
    }

    await experiment.save()
    
    res.json(createResponse(true, experiment, 'Experiment updated successfully'))
  } catch (error) {
    console.error('Error updating experiment:', error)
    res.status(400).json(createResponse(false, null, error.message))
  }
}))

// Delete experiment
router.delete('/experiments/:id', handleAsync(async (req, res) => {
  const { id } = req.params
  const userId = req.user?.id
  
  if (!validateObjectId(id)) {
    return res.status(400).json(createResponse(false, null, 'Invalid experiment ID'))
  }

  try {
    const experiment = await LabExperiment.findOneAndDelete({ _id: id, userId })
    
    if (!experiment) {
      return res.status(404).json(createResponse(false, null, 'Experiment not found'))
    }

    res.json(createResponse(true, null, 'Experiment deleted successfully'))
  } catch (error) {
    console.error('Error deleting experiment:', error)
    res.status(500).json(createResponse(false, null, 'Failed to delete experiment'))
  }
}))

// ================================
// DATASET ANALYSIS
// ================================

// Create dataset analysis
router.post('/dataset-analysis', upload.single('dataset'), handleAsync(async (req, res) => {
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  try {
    const analysisData = {
      ...req.body,
      userId,
      dataset: req.file ? {
        filename: req.file.originalname,
        size: req.file.size,
        format: req.file.mimetype,
        buffer: req.file.buffer
      } : null
    }

    const analysis = new DatasetAnalysis(analysisData)
    await analysis.save()
    
    // Trigger async analysis processing here
    // processDatasetAnalysis(analysis._id)
    
    res.status(201).json(createResponse(true, analysis, 'Dataset analysis created successfully'))
  } catch (error) {
    console.error('Error creating dataset analysis:', error)
    res.status(400).json(createResponse(false, null, error.message))
  }
}))

// Get dataset analyses for user
router.get('/dataset-analysis', handleAsync(async (req, res) => {
  const { page = 1, limit = 10, format, status } = req.query
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  const query = { userId }
  if (format) query['dataset.format'] = format
  if (status) query['processing.status'] = status

  try {
    const analyses = await DatasetAnalysis.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('experimentId', 'title')

    const total = await DatasetAnalysis.countDocuments(query)
    
    res.json(createResponse(true, {
      data: analyses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Dataset analyses retrieved successfully'))
  } catch (error) {
    console.error('Error fetching dataset analyses:', error)
    res.status(500).json(createResponse(false, null, 'Failed to fetch dataset analyses'))
  }
}))

// ================================
// IMAGE GENERATION
// ================================

// Create image generation request
router.post('/image-generation', handleAsync(async (req, res) => {
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  try {
    const imageGenData = {
      ...req.body,
      userId,
      status: 'queued',
      createdAt: new Date()
    }

    const imageGen = new ImageGeneration(imageGenData)
    await imageGen.save()
    
    // Trigger async image generation here
    // processImageGeneration(imageGen._id)
    
    res.status(201).json(createResponse(true, imageGen, 'Image generation request created successfully'))
  } catch (error) {
    console.error('Error creating image generation:', error)
    res.status(400).json(createResponse(false, null, error.message))
  }
}))

// Get image generations for user
router.get('/image-generation', handleAsync(async (req, res) => {
  const { page = 1, limit = 10, style, status } = req.query
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  const query = { userId }
  if (style) query.style = style
  if (status) query.status = status

  try {
    const generations = await ImageGeneration.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('experimentId', 'title')

    const total = await ImageGeneration.countDocuments(query)
    
    res.json(createResponse(true, {
      data: generations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Image generations retrieved successfully'))
  } catch (error) {
    console.error('Error fetching image generations:', error)
    res.status(500).json(createResponse(false, null, 'Failed to fetch image generations'))
  }
}))

// ================================
// EMOTION ANALYSIS
// ================================

// Create emotion analysis
router.post('/emotion-analysis', upload.single('input'), handleAsync(async (req, res) => {
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  try {
    const analysisData = {
      ...req.body,
      userId,
      inputData: req.file ? {
        fileUrl: `uploads/${req.file.originalname}`,
        mimeType: req.file.mimetype,
        duration: req.body.duration || null
      } : {
        content: req.body.content
      }
    }

    const analysis = new EmotionAnalysis(analysisData)
    await analysis.save()
    
    // Trigger async emotion analysis here
    // processEmotionAnalysis(analysis._id)
    
    res.status(201).json(createResponse(true, analysis, 'Emotion analysis created successfully'))
  } catch (error) {
    console.error('Error creating emotion analysis:', error)
    res.status(400).json(createResponse(false, null, error.message))
  }
}))

// Get emotion analyses for user
router.get('/emotion-analysis', handleAsync(async (req, res) => {
  const { page = 1, limit = 10, inputType, sentiment } = req.query
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  const query = { userId }
  if (inputType) query.inputType = inputType
  if (sentiment) query['sentiment.polarity'] = sentiment

  try {
    const analyses = await EmotionAnalysis.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('experimentId', 'title')

    const total = await EmotionAnalysis.countDocuments(query)
    
    res.json(createResponse(true, {
      data: analyses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Emotion analyses retrieved successfully'))
  } catch (error) {
    console.error('Error fetching emotion analyses:', error)
    res.status(500).json(createResponse(false, null, 'Failed to fetch emotion analyses'))
  }
}))

// ================================
// FUTURE PREDICTION
// ================================

// Create future prediction
router.post('/future-prediction', handleAsync(async (req, res) => {
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  try {
    const predictionData = {
      ...req.body,
      userId
    }

    const prediction = new FuturePrediction(predictionData)
    await prediction.save()
    
    // Trigger async prediction processing here
    // processFuturePrediction(prediction._id)
    
    res.status(201).json(createResponse(true, prediction, 'Future prediction created successfully'))
  } catch (error) {
    console.error('Error creating future prediction:', error)
    res.status(400).json(createResponse(false, null, error.message))
  }
}))

// Get future predictions for user
router.get('/future-prediction', handleAsync(async (req, res) => {
  const { page = 1, limit = 10, type, timeframe } = req.query
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  const query = { userId }
  if (type) query.predictionType = type
  if (timeframe) query['timeframe.period'] = timeframe

  try {
    const predictions = await FuturePrediction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('experimentId', 'title')

    const total = await FuturePrediction.countDocuments(query)
    
    res.json(createResponse(true, {
      data: predictions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Future predictions retrieved successfully'))
  } catch (error) {
    console.error('Error fetching future predictions:', error)
    res.status(500).json(createResponse(false, null, 'Failed to fetch future predictions'))
  }
}))

// ================================
// MUSIC GENERATION
// ================================

// Create music generation request
router.post('/music-generation', handleAsync(async (req, res) => {
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  try {
    const musicData = {
      ...req.body,
      userId
    }

    const music = new MusicGeneration(musicData)
    await music.save()
    
    // Trigger async music generation here
    // processMusicGeneration(music._id)
    
    res.status(201).json(createResponse(true, music, 'Music generation request created successfully'))
  } catch (error) {
    console.error('Error creating music generation:', error)
    res.status(400).json(createResponse(false, null, error.message))
  }
}))

// Get music generations for user
router.get('/music-generation', handleAsync(async (req, res) => {
  const { page = 1, limit = 10, genre, mood } = req.query
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  const query = { userId }
  if (genre) query.genre = genre
  if (mood) query.mood = mood

  try {
    const music = await MusicGeneration.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('experimentId', 'title')

    const total = await MusicGeneration.countDocuments(query)
    
    res.json(createResponse(true, {
      data: music,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Music generations retrieved successfully'))
  } catch (error) {
    console.error('Error fetching music generations:', error)
    res.status(500).json(createResponse(false, null, 'Failed to fetch music generations'))
  }
}))

// Rate music generation
router.post('/music-generation/:id/rate', handleAsync(async (req, res) => {
  const { id } = req.params
  const { rating, comment } = req.body
  const userId = req.user?.id
  
  if (!validateObjectId(id)) {
    return res.status(400).json(createResponse(false, null, 'Invalid music ID'))
  }

  try {
    const music = await MusicGeneration.findById(id)
    
    if (!music) {
      return res.status(404).json(createResponse(false, null, 'Music generation not found'))
    }

    await music.addRating(userId, rating, comment)
    
    res.json(createResponse(true, music, 'Rating added successfully'))
  } catch (error) {
    console.error('Error adding rating:', error)
    res.status(500).json(createResponse(false, null, 'Failed to add rating'))
  }
}))

// ================================
// PERSONALITY TEST
// ================================

// Create personality test
router.post('/personality-test', handleAsync(async (req, res) => {
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  try {
    const testData = {
      ...req.body,
      userId
    }

    const test = new PersonalityTest(testData)
    await test.save()
    
    res.status(201).json(createResponse(true, test, 'Personality test created successfully'))
  } catch (error) {
    console.error('Error creating personality test:', error)
    res.status(400).json(createResponse(false, null, error.message))
  }
}))

// Get personality tests for user
router.get('/personality-test', handleAsync(async (req, res) => {
  const { page = 1, limit = 10, testType } = req.query
  const userId = req.user?.id
  
  if (!userId) {
    return res.status(401).json(createResponse(false, null, 'Authentication required'))
  }

  const query = { userId }
  if (testType) query.testType = testType

  try {
    const tests = await PersonalityTest.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('experimentId', 'title')

    const total = await PersonalityTest.countDocuments(query)
    
    res.json(createResponse(true, {
      data: tests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Personality tests retrieved successfully'))
  } catch (error) {
    console.error('Error fetching personality tests:', error)
    res.status(500).json(createResponse(false, null, 'Failed to fetch personality tests'))
  }
}))

// Submit personality test response
router.post('/personality-test/:id/respond', handleAsync(async (req, res) => {
  const { id } = req.params
  const { responses } = req.body
  const userId = req.user?.id
  
  if (!validateObjectId(id)) {
    return res.status(400).json(createResponse(false, null, 'Invalid test ID'))
  }

  try {
    const test = await PersonalityTest.findOne({ _id: id, userId })
    
    if (!test) {
      return res.status(404).json(createResponse(false, null, 'Personality test not found'))
    }

    // Update responses
    test.responses = responses
    
    // Calculate results (simplified - would use actual personality algorithms)
    test.results = {
      primaryType: 'ENFP', // placeholder
      traits: [
        { name: 'Extraversion', score: 0.7, description: 'High energy and sociability' }
      ],
      summary: {
        overall: 'You are an energetic and creative individual...',
        strengths: ['Creative', 'Enthusiastic', 'Flexible'],
        challenges: ['May lack focus', 'Can be overly optimistic'],
        recommendations: ['Focus on goal setting', 'Practice mindfulness']
      }
    }
    
    await test.save()
    
    res.json(createResponse(true, test, 'Test responses submitted successfully'))
  } catch (error) {
    console.error('Error submitting test responses:', error)
    res.status(500).json(createResponse(false, null, 'Failed to submit responses'))
  }
}))

export default router