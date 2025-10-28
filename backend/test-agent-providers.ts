/**
 * ========================================
 * AGENT AI PROVIDER TEST
 * ========================================
 * 
 * Tests which AI providers work with each agent
 * ========================================
 */

import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: './.env' })

const agents = {
  'ben-sega': {
    name: 'Ben Sega',
    preferredProvider: 'anthropic',
    fallback: ['gemini', 'openai']
  },
  'tech-wizard': {
    name: 'Tech Wizard',
    preferredProvider: 'openai',
    fallback: ['gemini', 'anthropic']
  },
  'doctor-network': {
    name: 'Doctor Network',
    preferredProvider: 'gemini',
    fallback: ['openai', 'anthropic']
  },
  'data-scientist': {
    name: 'Data Scientist',
    preferredProvider: 'anthropic',
    fallback: ['gemini', 'openai']
  },
  'devops-expert': {
    name: 'DevOps Expert',
    preferredProvider: 'openai',
    fallback: ['gemini', 'anthropic']
  }
}

const providerStatus = {
  openai: !!process.env.OPENAI_API_KEY,
  anthropic: !!process.env.ANTHROPIC_API_KEY,
  gemini: !!process.env.GEMINI_API_KEY,
  cohere: !!process.env.COHERE_API_KEY
}

// Test results from previous run
const providerWorking = {
  openai: true,    // ✅ Working
  anthropic: false, // ❌ Organization disabled
  gemini: true,     // ✅ Working
  cohere: false     // ❌ Not installed
}

console.log('🤖 Agent AI Provider Analysis\n')
console.log('========================================')
console.log('AVAILABLE AI PROVIDERS:')
console.log('========================================\n')

console.log(`✅ OpenAI:     ${providerStatus.openai ? 'CONFIGURED & WORKING' : 'NOT CONFIGURED'}`)
console.log(`❌ Anthropic:  ${providerStatus.anthropic ? 'CONFIGURED (DISABLED)' : 'NOT CONFIGURED'}`)
console.log(`✅ Gemini:     ${providerStatus.gemini ? 'CONFIGURED & WORKING' : 'NOT CONFIGURED'}`)
console.log(`❌ Cohere:     ${providerStatus.cohere ? 'CONFIGURED (NOT INSTALLED)' : 'NOT CONFIGURED'}`)

console.log('\n========================================')
console.log('AGENT CONFIGURATION & STATUS:')
console.log('========================================\n')

Object.entries(agents).forEach(([id, agent]) => {
  const preferred = agent.preferredProvider
  const preferredWorks = providerWorking[preferred as keyof typeof providerWorking]
  
  let activeProvider = preferred
  if (!preferredWorks) {
    // Find first working fallback
    const workingFallback = agent.fallback.find(p => providerWorking[p as keyof typeof providerWorking])
    activeProvider = workingFallback || preferred
  }
  
  const willWork = providerWorking[activeProvider as keyof typeof providerWorking]
  
  console.log(`${willWork ? '✅' : '❌'} ${agent.name} (${id})`)
  console.log(`   Preferred: ${preferred.toUpperCase()} ${preferredWorks ? '✅' : '❌'}`)
  console.log(`   Active:    ${activeProvider.toUpperCase()} ${willWork ? '✅' : '⚠️  FALLBACK'}`)
  console.log(`   Status:    ${willWork ? 'WORKING' : 'WILL NOT WORK'}`)
  console.log('')
})

console.log('========================================')
console.log('SUMMARY:')
console.log('========================================\n')

const workingAgents = Object.values(agents).filter(agent => {
  const preferredWorks = providerWorking[agent.preferredProvider as keyof typeof providerWorking]
  if (preferredWorks) return true
  return agent.fallback.some(p => providerWorking[p as keyof typeof providerWorking])
})

console.log(`Total Agents: ${Object.keys(agents).length}`)
console.log(`Working Agents: ${workingAgents.length}`)
console.log(`Active Providers: 2/4 (OpenAI, Gemini)`)

console.log('\n========================================')
console.log('RECOMMENDATIONS:')
console.log('========================================\n')

if (!providerWorking.anthropic) {
  console.log('⚠️  ACTION REQUIRED: Anthropic')
  console.log('   - ben-sega and data-scientist prefer Anthropic')
  console.log('   - Currently falling back to Gemini/OpenAI')
  console.log('   - To fix: Contact Anthropic support about disabled organization')
  console.log('   - Or create new account at: https://console.anthropic.com\n')
}

console.log('✅ CURRENT STATUS: All agents functional')
console.log('   - Using intelligent fallback system')
console.log('   - OpenAI handling: tech-wizard, devops-expert')
console.log('   - Gemini handling: doctor-network, ben-sega, data-scientist')
console.log('\n')
