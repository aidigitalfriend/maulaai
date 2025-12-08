/**
 * AI Lab API Test Suite
 * Comprehensive testing script for all AI Lab endpoints
 */

import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration
const API_BASE_URL = 'http://localhost:3005/api/ai-lab'
const AUTH_TOKEN = 'test-token' // Placeholder for actual JWT

// Test data
const testUser = {
  id: '507f1f77bcf86cd799439011',
  email: 'test@ailab.com',
  name: 'AI Lab Tester'
}

// HTTP client with default config
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  },
  timeout: 30000
})

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
}

// Test utility functions
const test = async (name, testFn) => {
  testResults.total++
  console.log(`\\n🧪 Testing: ${name}`)
  
  try {
    await testFn()
    testResults.passed++
    testResults.tests.push({ name, status: 'PASSED' })
    console.log(`✅ PASSED: ${name}`)
  } catch (error) {
    testResults.failed++
    testResults.tests.push({ name, status: 'FAILED', error: error.message })
    console.log(`❌ FAILED: ${name}`)
    console.log(`   Error: ${error.message}`)
  }
}

const expect = (actual, expected, message = '') => {
  if (actual !== expected) {
    throw new Error(`${message} - Expected: ${expected}, Got: ${actual}`)
  }
}

const expectToBeDefined = (value, message = '') => {
  if (value === undefined || value === null) {
    throw new Error(`${message} - Expected value to be defined`)
  }
}

// ================================
// HEALTH AND BASIC TESTS
// ================================

async function testHealthEndpoint() {
  const response = await client.get('/health')
  expect(response.status, 200, 'Health endpoint should return 200')
  expect(response.data.success, true, 'Health response should be successful')
  expectToBeDefined(response.data.services, 'Health response should include services')
}

async function testStatsEndpoint() {
  const response = await client.get('/stats')
  expect(response.status, 200, 'Stats endpoint should return 200')
  expect(response.data.success, true, 'Stats response should be successful')
  expectToBeDefined(response.data.data.totalExperiments, 'Stats should include total experiments')
}

async function testCapabilitiesEndpoint() {
  const response = await client.get('/capabilities')
  expect(response.status, 200, 'Capabilities endpoint should return 200')
  expect(response.data.success, true, 'Capabilities response should be successful')
  expectToBeDefined(response.data.data.models, 'Capabilities should include models')
}

// ================================
// LAB EXPERIMENTS TESTS
// ================================

let createdExperimentId = null

async function testCreateExperiment() {
  const experimentData = {
    title: 'Test AI Lab Experiment',
    description: 'Automated test experiment for API validation',
    type: 'image_generation',
    configuration: {
      aiModel: 'dall-e-3',
      parameters: {
        style: 'digital_art',
        quality: 'hd'
      }
    },
    tags: ['test', 'automation', 'api']
  }

  const response = await client.post('/experiments', experimentData)
  expect(response.status, 201, 'Create experiment should return 201')
  expect(response.data.success, true, 'Create experiment response should be successful')
  expectToBeDefined(response.data.data._id, 'Created experiment should have an ID')
  
  createdExperimentId = response.data.data._id
  console.log(`   📝 Created experiment ID: ${createdExperimentId}`)
}

async function testGetExperiments() {
  const response = await client.get('/experiments?page=1&limit=5')
  expect(response.status, 200, 'Get experiments should return 200')
  expect(response.data.success, true, 'Get experiments response should be successful')
  expectToBeDefined(response.data.data.data, 'Response should include experiments data')
}

async function testGetExperimentById() {
  if (!createdExperimentId) {
    throw new Error('No experiment ID available for testing')
  }

  const response = await client.get(`/experiments/${createdExperimentId}`)
  expect(response.status, 200, 'Get experiment by ID should return 200')
  expect(response.data.success, true, 'Get experiment response should be successful')
  expect(response.data.data._id, createdExperimentId, 'Returned experiment should have correct ID')
}

async function testUpdateExperiment() {
  if (!createdExperimentId) {
    throw new Error('No experiment ID available for testing')
  }

  const updateData = {
    description: 'Updated description for automated test',
    tags: ['test', 'automation', 'api', 'updated']
  }

  const response = await client.put(`/experiments/${createdExperimentId}`, updateData)
  expect(response.status, 200, 'Update experiment should return 200')
  expect(response.data.success, true, 'Update experiment response should be successful')
}

// ================================
// DATASET ANALYSIS TESTS
// ================================

async function testCreateDatasetAnalysis() {
  const analysisData = {
    title: 'Test Dataset Analysis',
    experimentId: createdExperimentId,
    analysisType: 'statistical',
    dataset: {
      format: 'json',
      source: 'uploaded',
      description: 'Test dataset for API validation'
    },
    configuration: {
      operations: ['describe', 'correlate', 'visualize']
    }
  }

  const response = await client.post('/dataset-analysis', analysisData)
  expect(response.status, 201, 'Create dataset analysis should return 201')
  expect(response.data.success, true, 'Create dataset analysis response should be successful')
  expectToBeDefined(response.data.data._id, 'Created analysis should have an ID')
}

async function testGetDatasetAnalyses() {
  const response = await client.get('/dataset-analysis?page=1&limit=5')
  expect(response.status, 200, 'Get dataset analyses should return 200')
  expect(response.data.success, true, 'Get dataset analyses response should be successful')
}

// ================================
// IMAGE GENERATION TESTS
// ================================

async function testCreateImageGeneration() {
  const imageGenData = {
    title: 'Test Image Generation',
    experimentId: createdExperimentId,
    prompt: 'A futuristic AI laboratory with glowing neural networks',
    style: 'digital_art',
    dimensions: { width: 512, height: 512 },
    aiModel: 'dall-e-3',
    parameters: {
      creativity: 0.8,
      quality: 'standard'
    }
  }

  const response = await client.post('/image-generation', imageGenData)
  expect(response.status, 201, 'Create image generation should return 201')
  expect(response.data.success, true, 'Create image generation response should be successful')
  expectToBeDefined(response.data.data._id, 'Created image generation should have an ID')
}

async function testGetImageGenerations() {
  const response = await client.get('/image-generation?style=digital_art')
  expect(response.status, 200, 'Get image generations should return 200')
  expect(response.data.success, true, 'Get image generations response should be successful')
}

// ================================
// EMOTION ANALYSIS TESTS
// ================================

async function testCreateEmotionAnalysis() {
  const emotionData = {
    title: 'Test Emotion Analysis',
    experimentId: createdExperimentId,
    inputType: 'text',
    inputData: {
      content: 'I am so excited about this new AI technology! It makes me feel hopeful about the future.'
    },
    aiModel: 'openai-emotion'
  }

  const response = await client.post('/emotion-analysis', emotionData)
  expect(response.status, 201, 'Create emotion analysis should return 201')
  expect(response.data.success, true, 'Create emotion analysis response should be successful')
  expectToBeDefined(response.data.data._id, 'Created emotion analysis should have an ID')
}

// ================================
// FUTURE PREDICTION TESTS
// ================================

async function testCreateFuturePrediction() {
  const predictionData = {
    title: 'AI Technology Forecast',
    experimentId: createdExperimentId,
    predictionType: 'technology',
    timeframe: {
      period: 'medium',
      duration: 365
    },
    inputData: {
      context: 'Current state of AI development in 2025',
      currentSituation: 'LLMs are becoming more capable and accessible',
      historicalData: 'Past 5 years show exponential growth in AI capabilities'
    }
  }

  const response = await client.post('/future-prediction', predictionData)
  expect(response.status, 201, 'Create future prediction should return 201')
  expect(response.data.success, true, 'Create future prediction response should be successful')
  expectToBeDefined(response.data.data._id, 'Created prediction should have an ID')
}

// ================================
// MUSIC GENERATION TESTS
// ================================

async function testCreateMusicGeneration() {
  const musicData = {
    title: 'Test AI Music Generation',
    experimentId: createdExperimentId,
    genre: 'electronic',
    mood: 'energetic',
    tempo: { bpm: 128, feel: 'moderate' },
    keySignature: { key: 'C', mode: 'major' },
    timeSignature: '4/4',
    duration: { seconds: 30 },
    instruments: [
      {
        instrument: 'synthesizer',
        role: 'lead',
        prominence: 'primary'
      }
    ]
  }

  const response = await client.post('/music-generation', musicData)
  expect(response.status, 201, 'Create music generation should return 201')
  expect(response.data.success, true, 'Create music generation response should be successful')
  expectToBeDefined(response.data.data._id, 'Created music generation should have an ID')
}

// ================================
// PERSONALITY TEST TESTS
// ================================

async function testCreatePersonalityTest() {
  const testData = {
    title: 'Big Five Personality Test',
    experimentId: createdExperimentId,
    testType: 'big5',
    questions: [
      {
        id: 'q1',
        question: 'I am the life of the party',
        type: 'scale',
        scaleRange: { min: 1, max: 5, labels: ['Disagree', 'Neutral', 'Agree'] },
        category: 'extraversion'
      },
      {
        id: 'q2',
        question: 'I feel comfortable around people',
        type: 'scale',
        scaleRange: { min: 1, max: 5 },
        category: 'extraversion'
      }
    ]
  }

  const response = await client.post('/personality-test', testData)
  expect(response.status, 201, 'Create personality test should return 201')
  expect(response.data.success, true, 'Create personality test response should be successful')
  expectToBeDefined(response.data.data._id, 'Created personality test should have an ID')
}

// ================================
// CREATIVE WRITING TESTS
// ================================

async function testCreateCreativeWriting() {
  const writingData = {
    title: 'AI-Assisted Short Story',
    experimentId: createdExperimentId,
    genre: 'sci_fi',
    writingType: 'short_story',
    prompt: {
      original: 'A world where AI and humans collaborate seamlessly',
      themes: ['cooperation', 'technology', 'future']
    },
    content: {
      text: 'In the year 2087, the boundary between human and artificial intelligence had become beautifully blurred...',
      title: 'The Collaboration Era'
    },
    style: {
      tone: 'optimistic',
      voice: 'third_person_limited',
      tense: 'past'
    }
  }

  const response = await client.post('/creative-writing', writingData)
  expect(response.status, 201, 'Create creative writing should return 201')
  expect(response.data.success, true, 'Create creative writing response should be successful')
  expectToBeDefined(response.data.data._id, 'Created creative writing should have an ID')
}

// ================================
// SMART ASSISTANT TESTS
// ================================

async function testCreateSmartAssistant() {
  const assistantData = {
    name: 'TestBot',
    experimentId: createdExperimentId,
    assistantType: 'personal',
    personality: {
      traits: {
        extraversion: 0.7,
        agreeableness: 0.9,
        conscientiousness: 0.8,
        neuroticism: 0.2,
        openness: 0.85
      },
      communication: {
        tone: 'friendly',
        verbosity: 'balanced',
        style: 'conversational'
      },
      behavior: {
        proactivity: 0.6,
        curiosity: 0.8,
        patience: 0.9,
        adaptability: 0.7
      }
    }
  }

  const response = await client.post('/smart-assistant', assistantData)
  expect(response.status, 201, 'Create smart assistant should return 201')
  expect(response.data.success, true, 'Create smart assistant response should be successful')
  expectToBeDefined(response.data.data._id, 'Created smart assistant should have an ID')
}

// ================================
// VIRTUAL REALITY TESTS
// ================================

async function testCreateVirtualReality() {
  const vrData = {
    title: 'Virtual AI Lab Tour',
    experimentId: createdExperimentId,
    experienceType: 'vr',
    category: 'education',
    environment: {
      name: 'Futuristic AI Laboratory',
      type: 'indoor',
      theme: 'Technology showcase',
      atmosphere: 'educational',
      lighting: {
        type: 'artificial',
        intensity: 0.8,
        color: '#4A90E2'
      }
    },
    hardware: {
      requiredDevice: 'any',
      minSpecs: {
        cpu: 'Intel i5 or AMD Ryzen 5',
        gpu: 'GTX 1060 or equivalent',
        ram: 8,
        storage: 2
      },
      tracking: {
        headset: true,
        controllers: true,
        hands: false,
        eyes: false,
        body: false
      }
    }
  }

  const response = await client.post('/virtual-reality', vrData)
  expect(response.status, 201, 'Create VR experience should return 201')
  expect(response.data.success, true, 'Create VR experience response should be successful')
  expectToBeDefined(response.data.data._id, 'Created VR experience should have an ID')
}

// ================================
// LANGUAGE LEARNING TESTS
// ================================

async function testCreateLanguageLearning() {
  const learningData = {
    title: 'AI-Powered Spanish Learning',
    experimentId: createdExperimentId,
    targetLanguage: 'es',
    nativeLanguage: 'en',
    proficiencyLevel: 'beginner',
    learningGoals: {
      primary: 'conversation',
      specific: ['basic greetings', 'ordering food', 'asking directions'],
      timeline: [
        {
          target: 'Complete basic greetings module',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
        }
      ]
    },
    aiTutor: {
      personalityType: 'encouraging',
      teachingStyle: 'mixed'
    }
  }

  const response = await client.post('/language-learning', learningData)
  expect(response.status, 201, 'Create language learning should return 201')
  expect(response.data.success, true, 'Create language learning response should be successful')
  expectToBeDefined(response.data.data._id, 'Created language learning should have an ID')
}

// ================================
// ERROR HANDLING TESTS
// ================================

async function testInvalidEndpoint() {
  try {
    await client.get('/nonexistent-endpoint')
    throw new Error('Should have thrown an error for invalid endpoint')
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Expected 404 error
    } else {
      throw error
    }
  }
}

async function testInvalidExperimentId() {
  try {
    await client.get('/experiments/invalid-id')
    throw new Error('Should have thrown an error for invalid ID')
  } catch (error) {
    if (error.response && error.response.status === 400) {
      // Expected 400 error for invalid ID format
    } else {
      throw error
    }
  }
}

// ================================
// CLEANUP TESTS
// ================================

async function testDeleteExperiment() {
  if (!createdExperimentId) {
    throw new Error('No experiment ID available for cleanup')
  }

  const response = await client.delete(`/experiments/${createdExperimentId}`)
  expect(response.status, 200, 'Delete experiment should return 200')
  expect(response.data.success, true, 'Delete experiment response should be successful')
}

// ================================
// MAIN TEST RUNNER
// ================================

async function runAllTests() {
  console.log('🚀 Starting AI Lab API Test Suite')
  console.log('=' .repeat(50))

  // Health and basic tests
  await test('Health endpoint', testHealthEndpoint)
  await test('Stats endpoint', testStatsEndpoint)
  await test('Capabilities endpoint', testCapabilitiesEndpoint)

  // Core experiment management
  await test('Create experiment', testCreateExperiment)
  await test('Get experiments list', testGetExperiments)
  await test('Get experiment by ID', testGetExperimentById)
  await test('Update experiment', testUpdateExperiment)

  // AI Lab feature tests
  await test('Create dataset analysis', testCreateDatasetAnalysis)
  await test('Get dataset analyses', testGetDatasetAnalyses)
  await test('Create image generation', testCreateImageGeneration)
  await test('Get image generations', testGetImageGenerations)
  await test('Create emotion analysis', testCreateEmotionAnalysis)
  await test('Create future prediction', testCreateFuturePrediction)
  await test('Create music generation', testCreateMusicGeneration)
  await test('Create personality test', testCreatePersonalityTest)
  await test('Create creative writing', testCreateCreativeWriting)
  await test('Create smart assistant', testCreateSmartAssistant)
  await test('Create VR experience', testCreateVirtualReality)
  await test('Create language learning', testCreateLanguageLearning)

  // Error handling tests
  await test('Invalid endpoint handling', testInvalidEndpoint)
  await test('Invalid experiment ID handling', testInvalidExperimentId)

  // Cleanup
  await test('Delete experiment', testDeleteExperiment)

  // Print summary
  console.log('\\n' + '=' .repeat(50))
  console.log('🏁 Test Suite Complete')
  console.log(`📊 Results: ${testResults.passed}/${testResults.total} tests passed`)
  
  if (testResults.failed > 0) {
    console.log('❌ Failed Tests:')
    testResults.tests
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`   - ${test.name}: ${test.error}`)
      })
  } else {
    console.log('✅ All tests passed!')
  }

  return testResults
}

// Run tests if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runAllTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0)
    })
    .catch(error => {
      console.error('💥 Test suite crashed:', error)
      process.exit(1)
    })
}

export { runAllTests, testResults }