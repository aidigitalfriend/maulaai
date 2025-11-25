/**
 * ========================================
 * UNIVERSAL AI PROVIDER TEST
 * ========================================
 * 
 * Tests ALL providers and ALL models:
 * - Gemini (Primary)
 * - OpenAI (Secondary)
 * - Mistral (Third)
 * - Anthropic (Fourth)
 * - Cohere (Fifth)
 * ========================================
 */

import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { Mistral } from '@mistralai/mistralai'
import Anthropic from '@anthropic-ai/sdk'
import { CohereClient } from 'cohere-ai'

dotenv.config({ path: './.env' })

const TEST_MESSAGE = 'Say hello and introduce yourself briefly in one sentence.'

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
}

interface TestResult {
  provider: string
  model: string
  success: boolean
  response?: string
  latency?: number
  error?: string
}

const results: TestResult[] = []

// ========================================
// GEMINI TESTS
// ========================================

async function testGemini() {
  console.log('\n🟢 Testing GEMINI (Primary)...\n')
  
  if (!process.env.GEMINI_API_KEY) {
    results.push({
      provider: 'Gemini',
      model: 'N/A',
      success: false,
      error: 'API key not configured'
    })
    return
  }

  const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash-exp']

  for (const modelName of models) {
    try {
      const startTime = Date.now()
      const model = gemini.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(TEST_MESSAGE)
      const response = await result.response
      const latency = Date.now() - startTime

      results.push({
        provider: 'Gemini',
        model: modelName,
        success: true,
        response: response.text().substring(0, 100),
        latency
      })
    } catch (error) {
      results.push({
        provider: 'Gemini',
        model: modelName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Test embedding
  try {
    const model = gemini.getGenerativeModel({ model: 'text-embedding-004' })
    const result = await model.embedContent('test embedding')
    results.push({
      provider: 'Gemini',
      model: 'text-embedding-004',
      success: true,
      response: `Embedding dimensions: ${result.embedding.values.length}`
    })
  } catch (error) {
    results.push({
      provider: 'Gemini',
      model: 'text-embedding-004',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// ========================================
// OPENAI TESTS
// ========================================

async function testOpenAI() {
  console.log('\n🔵 Testing OPENAI (Secondary)...\n')
  
  if (!process.env.OPENAI_API_KEY) {
    results.push({
      provider: 'OpenAI',
      model: 'N/A',
      success: false,
      error: 'API key not configured'
    })
    return
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const models = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo']

  for (const modelName of models) {
    try {
      const startTime = Date.now()
      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: TEST_MESSAGE }],
        max_tokens: 50
      })
      const latency = Date.now() - startTime

      results.push({
        provider: 'OpenAI',
        model: modelName,
        success: true,
        response: response.choices[0].message.content?.substring(0, 100) || '',
        latency
      })
    } catch (error) {
      results.push({
        provider: 'OpenAI',
        model: modelName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Test embedding
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'test embedding'
    })
    results.push({
      provider: 'OpenAI',
      model: 'text-embedding-3-small',
      success: true,
      response: `Embedding dimensions: ${response.data[0].embedding.length}`
    })
  } catch (error) {
    results.push({
      provider: 'OpenAI',
      model: 'text-embedding-3-small',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// ========================================
// MISTRAL TESTS
// ========================================

async function testMistral() {
  console.log('\n🟣 Testing MISTRAL (Third)...\n')
  
  if (!process.env.MISTRAL_API_KEY) {
    results.push({
      provider: 'Mistral',
      model: 'N/A',
      success: false,
      error: 'API key not configured'
    })
    return
  }

  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY })
  const models = ['mistral-large-latest', 'mistral-small-latest']

  for (const modelName of models) {
    try {
      const startTime = Date.now()
      const response = await mistral.chat.complete({
        model: modelName,
        messages: [{ role: 'user', content: TEST_MESSAGE }],
        maxTokens: 50
      })
      const latency = Date.now() - startTime

      results.push({
        provider: 'Mistral',
        model: modelName,
        success: true,
        response: response.choices?.[0]?.message?.content?.substring(0, 100) || '',
        latency
      })
    } catch (error) {
      results.push({
        provider: 'Mistral',
        model: modelName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Test embedding
  try {
    const response = await mistral.embeddings.create({
      model: 'mistral-embed',
      inputs: ['test embedding']
    })
    results.push({
      provider: 'Mistral',
      model: 'mistral-embed',
      success: true,
      response: `Embedding dimensions: ${response.data[0].embedding.length}`
    })
  } catch (error) {
    results.push({
      provider: 'Mistral',
      model: 'mistral-embed',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// ========================================
// ANTHROPIC TESTS
// ========================================

async function testAnthropic() {
  console.log('\n🟠 Testing ANTHROPIC (Fourth)...\n')
  
  if (!process.env.ANTHROPIC_API_KEY) {
    results.push({
      provider: 'Anthropic',
      model: 'N/A',
      success: false,
      error: 'API key not configured'
    })
    return
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const models = ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307']

  for (const modelName of models) {
    try {
      const startTime = Date.now()
      const response = await anthropic.messages.create({
        model: modelName,
        max_tokens: 50,
        messages: [{ role: 'user', content: TEST_MESSAGE }]
      })
      const latency = Date.now() - startTime

      const textContent = response.content.find(block => block.type === 'text')
      results.push({
        provider: 'Anthropic',
        model: modelName,
        success: true,
        response: ((textContent as any)?.text || '').substring(0, 100),
        latency
      })
    } catch (error) {
      results.push({
        provider: 'Anthropic',
        model: modelName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

// ========================================
// COHERE TESTS
// ========================================

async function testCohere() {
  console.log('\n🟡 Testing COHERE (Fifth)...\n')
  
  if (!process.env.COHERE_API_KEY) {
    results.push({
      provider: 'Cohere',
      model: 'N/A',
      success: false,
      error: 'API key not configured'
    })
    return
  }

  const cohere = new CohereClient({ token: process.env.COHERE_API_KEY })
  const models = ['command', 'command-nightly']

  for (const modelName of models) {
    try {
      const startTime = Date.now()
      const response = await cohere.chat({
        model: modelName,
        message: TEST_MESSAGE
      })
      const latency = Date.now() - startTime

      results.push({
        provider: 'Cohere',
        model: modelName,
        success: true,
        response: response.text?.substring(0, 100) || '',
        latency
      })
    } catch (error) {
      results.push({
        provider: 'Cohere',
        model: modelName,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Test embedding
  try {
    const response = await cohere.embed({
      model: 'embed-english-v3.0',
      texts: ['test embedding'],
      inputType: 'search_query'
    })
    results.push({
      provider: 'Cohere',
      model: 'embed-english-v3.0',
      success: true,
      response: `Embedding dimensions: ${response.embeddings[0].length}`
    })
  } catch (error) {
    results.push({
      provider: 'Cohere',
      model: 'embed-english-v3.0',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// ========================================
// DISPLAY RESULTS
// ========================================

function displayResults() {
  console.log('\n' + '='.repeat(80))
  console.log('  UNIVERSAL AI PROVIDER TEST RESULTS')
  console.log('  Priority: Gemini → OpenAI → Mistral → Anthropic → Cohere')
  console.log('='.repeat(80) + '\n')

  const providerGroups: Record<string, TestResult[]> = {}
  results.forEach(r => {
    if (!providerGroups[r.provider]) providerGroups[r.provider] = []
    providerGroups[r.provider].push(r)
  })

  const providerOrder = ['Gemini', 'OpenAI', 'Mistral', 'Anthropic', 'Cohere']
  
  providerOrder.forEach(provider => {
    const group = providerGroups[provider]
    if (!group) return

    const successCount = group.filter(r => r.success).length
    const totalCount = group.length
    const avgLatency = group.filter(r => r.latency).reduce((sum, r) => sum + (r.latency || 0), 0) / (group.filter(r => r.latency).length || 1)

    const providerIcon = provider === 'Gemini' ? '🟢' : 
                         provider === 'OpenAI' ? '🔵' :
                         provider === 'Mistral' ? '🟣' :
                         provider === 'Anthropic' ? '🟠' : '🟡'

    console.log(`${providerIcon} ${colors.cyan}${provider.toUpperCase()}${colors.reset} - ${successCount}/${totalCount} models working`)
    if (successCount > 0) {
      console.log(`   Average latency: ${Math.round(avgLatency)}ms\n`)
    } else {
      console.log()
    }

    group.forEach(r => {
      const status = r.success ? `${colors.green}✅` : `${colors.red}❌`
      const modelName = r.model.padEnd(35)
      
      if (r.success) {
        const latencyStr = r.latency ? `${r.latency}ms` : ''
        const responsePreview = r.response?.substring(0, 40) || ''
        console.log(`   ${status} ${modelName} ${colors.yellow}${latencyStr}${colors.reset}`)
        if (responsePreview) {
          console.log(`      ${colors.blue}${responsePreview}...${colors.reset}`)
        }
      } else {
        console.log(`   ${status} ${modelName}`)
        console.log(`      ${colors.red}Error: ${r.error}${colors.reset}`)
      }
    })
    console.log()
  })

  console.log('='.repeat(80))
  console.log('SUMMARY:')
  console.log('='.repeat(80))
  
  const totalTests = results.length
  const successfulTests = results.filter(r => r.success).length
  const failedTests = totalTests - successfulTests

  console.log(`${colors.green}✅ Successful: ${successfulTests}/${totalTests}${colors.reset}`)
  console.log(`${colors.red}❌ Failed: ${failedTests}/${totalTests}${colors.reset}`)
  
  const workingProviders = providerOrder.filter(p => providerGroups[p]?.some(r => r.success))
  console.log(`${colors.cyan}🔄 Working Providers: ${workingProviders.join(', ')}${colors.reset}`)
  
  console.log('\n')
}

// ========================================
// RUN ALL TESTS
// ========================================

async function runTests() {
  console.log(`${colors.magenta}🧪 Testing ALL AI Providers...${colors.reset}\n`)
  console.log('Priority Order: 🟢 Gemini → 🔵 OpenAI → 🟣 Mistral → 🟠 Anthropic → 🟡 Cohere\n')

  await testGemini()
  await testOpenAI()
  await testMistral()
  await testAnthropic()
  await testCohere()

  displayResults()
}

runTests().catch(console.error)
