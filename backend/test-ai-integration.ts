/**
 * ========================================
 * AI INTEGRATION TEST SCRIPT
 * ========================================
 * 
 * Run this to verify all AI providers are working
 * 
 * Usage:
 * node backend/test-ai-integration.js
 * 
 * Or with tsx:
 * npx tsx backend/test-ai-integration.ts
 * ========================================
 */

import dotenv from 'dotenv'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Load environment variables
dotenv.config({ path: './.env' })

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Test message
const TEST_MESSAGE = "Say hello and tell me your name in exactly 10 words."

interface TestResult {
  provider: string
  success: boolean
  response?: string
  error?: string
  latency?: number
}

/**
 * Test OpenAI
 */
async function testOpenAI(): Promise<TestResult> {
  const startTime = Date.now()
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        provider: 'OpenAI',
        success: false,
        error: 'API key not configured'
      }
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: TEST_MESSAGE }],
      max_tokens: 50
    })

    const latency = Date.now() - startTime
    return {
      provider: 'OpenAI (GPT-3.5)',
      success: true,
      response: response.choices[0]?.message?.content || 'No response',
      latency
    }
  } catch (error) {
    return {
      provider: 'OpenAI',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test Anthropic
 */
async function testAnthropic(): Promise<TestResult> {
  const startTime = Date.now()
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return {
        provider: 'Anthropic',
        success: false,
        error: 'API key not configured'
      }
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 50,
      messages: [{ role: 'user', content: TEST_MESSAGE }]
    })

    const latency = Date.now() - startTime
    const textContent = response.content.find(block => block.type === 'text')
    
    return {
      provider: 'Anthropic (Claude 3.5 Sonnet)',
      success: true,
      response: (textContent as any)?.text || 'No response',
      latency
    }
  } catch (error) {
    return {
      provider: 'Anthropic',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test Google Gemini
 */
async function testGemini(): Promise<TestResult> {
  const startTime = Date.now()
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        provider: 'Google Gemini',
        success: false,
        error: 'API key not configured'
      }
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    // Use the latest available model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent(TEST_MESSAGE)
    const response = await result.response
    const text = response.text()

    const latency = Date.now() - startTime
    return {
      provider: 'Google Gemini (Pro)',
      success: true,
      response: text,
      latency
    }
  } catch (error) {
    return {
      provider: 'Google Gemini',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Test Cohere (commented out - install package if needed)
 */
async function testCohere(): Promise<TestResult> {
  try {
    if (!process.env.COHERE_API_KEY) {
      return {
        provider: 'Cohere',
        success: false,
        error: 'API key not configured'
      }
    }

    // Uncomment if you have cohere-ai package installed
    /*
    const { CohereClient } = require('cohere-ai')
    const client = new CohereClient({
      token: process.env.COHERE_API_KEY
    })

    const startTime = Date.now()
    const response = await client.chat({
      model: 'command-r-plus',
      message: TEST_MESSAGE
    })

    const latency = Date.now() - startTime
    return {
      provider: 'Cohere (Command R+)',
      success: true,
      response: response.text,
      latency
    }
    */

    return {
      provider: 'Cohere',
      success: false,
      error: 'Cohere package not installed (optional)'
    }
  } catch (error) {
    return {
      provider: 'Cohere',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Display test results
 */
function displayResults(results: TestResult[]) {
  console.log('\n')
  log('========================================', 'cyan')
  log('        AI INTEGRATION TEST RESULTS     ', 'cyan')
  log('========================================', 'cyan')
  console.log('\n')

  let successCount = 0
  let totalLatency = 0

  results.forEach(result => {
    if (result.success) {
      successCount++
      log(`✅ ${result.provider}`, 'green')
      log(`   Response: ${result.response}`, 'reset')
      log(`   Latency: ${result.latency}ms`, 'blue')
      totalLatency += result.latency || 0
    } else {
      log(`❌ ${result.provider}`, 'red')
      log(`   Error: ${result.error}`, 'yellow')
    }
    console.log('')
  })

  log('========================================', 'cyan')
  log(`Total Providers Tested: ${results.length}`, 'reset')
  log(`Successful: ${successCount}`, 'green')
  log(`Failed: ${results.length - successCount}`, 'red')
  
  if (successCount > 0) {
    log(`Average Latency: ${Math.round(totalLatency / successCount)}ms`, 'blue')
  }
  
  log('========================================', 'cyan')
  
  console.log('\n')
  
  if (successCount === 0) {
    log('⚠️  WARNING: No AI providers are working!', 'red')
    log('Check your .env file and API keys.', 'yellow')
  } else if (successCount < results.length) {
    log('⚠️  Some providers failed, but you have fallback!', 'yellow')
  } else {
    log('🎉 All AI providers working perfectly!', 'green')
    log('Your app has 100% AI redundancy! 🚀', 'green')
  }
  
  console.log('\n')
}

/**
 * Run all tests
 */
async function runTests() {
  log('🧪 Testing AI Provider Integrations...', 'cyan')
  console.log('\n')

  const results: TestResult[] = []

  // Test each provider
  log('Testing OpenAI...', 'blue')
  results.push(await testOpenAI())

  log('Testing Anthropic...', 'blue')
  results.push(await testAnthropic())

  log('Testing Google Gemini...', 'blue')
  results.push(await testGemini())

  log('Testing Cohere...', 'blue')
  results.push(await testCohere())

  // Display results
  displayResults(results)
}

// Run the tests
runTests().catch(error => {
  log('Fatal error running tests:', 'red')
  console.error(error)
  process.exit(1)
})

/**
 * ========================================
 * TROUBLESHOOTING GUIDE
 * ========================================
 * 
 * If tests fail, check:
 * 
 * 1. Environment Variables:
 *    - Make sure backend/.env exists
 *    - Check API keys are correct
 *    - No extra spaces or quotes
 * 
 * 2. API Key Format:
 *    - OpenAI: sk-...
 *    - Anthropic: sk-ant-...
 *    - Gemini: (no prefix)
 *    - Cohere: (no prefix)
 * 
 * 3. Internet Connection:
 *    - All providers need internet
 *    - Check firewall settings
 * 
 * 4. API Quotas:
 *    - Some providers have free tier limits
 *    - Check your usage on provider dashboard
 * 
 * 5. Dependencies:
 *    npm install openai @anthropic-ai/sdk @google/generative-ai
 * 
 * ========================================
 */
