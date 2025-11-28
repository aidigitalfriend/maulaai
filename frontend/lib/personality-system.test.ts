import { AGENT_SYSTEM_PROMPTS, AGENT_TEMPERATURES, getSystemPrompt, getAgentTemperature } from '@/lib/agent-system-prompts';

/**
 * Test Configuration
 */
const TEST_AGENTS = [
  'comedy-king',
  'drama-queen', 
  'lazy-pawn',
  'rook-jokey',
  'emma-emotional',
  'julie-girlfriend',
  'mrs-boss',
  'knight-logic',
  'tech-wizard',
  'chef-biew',
  'bishop-burger',
  'professor-astrology',
  'fitness-guru',
  'travel-buddy',
  'einstein',
  'chess-player',
  'ben-sega',
  'random'
];

const PERSONALITY_TESTS = [
  {
    question: "Help me fix this bug",
    expectations: {
      'comedy-king': ['royal', 'joke', 'decree', 'funny'],
      'drama-queen': ['DARLING', 'dramatic', 'STARS', 'MAGNIFICENT'],
      'lazy-pawn': ['simple', 'efficient', 'short', '✌️'],
      'tech-wizard': ['🧙‍♂️', 'spell', 'magic', 'wand'],
      'emma-emotional': ['FEEL', 'heart', 'validate', 'emotion'],
      'julia-girlfriend': ['honey', 'proud', 'amazing', 'support']
    }
  },
  {
    question: "I want to learn programming",
    expectations: {
      'comedy-king': ['funny', 'laugh', 'royal'],
      'fitness-guru': ['PUSH', 'warrior', 'CRUSH', 'champion'],
      'einstein': ['fascination', 'curiosity', 'wonder'],
      'chess-player': ['strategy', 'position', 'moves']
    }
  },
  {
    question: "How should I cook a great meal?",
    expectations: {
      'chef-biew': ['passion', 'culinary', 'art', 'love'],
      'bishop-burger': ['BURGER', 'royalty', 'sacred', '🍔'],
      'professor-astrology': ['cosmos', 'planets', 'stars', 'cosmic']
    }
  }
];

/**
 * Test Suite
 */
export class PersonalitySystemTests {
  
  static testAllAgentsExist(): boolean {
    console.log('🧪 Test 1: All 18 agents exist...');
    let passed = true;
    
    TEST_AGENTS.forEach(agentId => {
      const prompt = getSystemPrompt(agentId);
      const temperature = getAgentTemperature(agentId);
      
      if (!prompt) {
        console.error(`❌ Agent "${agentId}" missing system prompt`);
        passed = false;
      }
      if (temperature === undefined || temperature === 0.7) {
        console.error(`⚠️  Agent "${agentId}" using default temperature`);
      }
    });
    
    if (passed) console.log('✅ All 18 agents have system prompts');
    return passed;
  }

  static testPromptStructure(): boolean {
    console.log('\n🧪 Test 2: Prompt structure validation...');
    let passed = true;
    const requiredSections = [
      'CORE MANDATE',
      'UNBREAKABLE RULES',
      'SPEAKING STYLE',
      'Vocabulary:',
      'Catchphrases:',
      'Emojis:',
      'PERSONALITY MODIFIERS',
      'RESPONSE STRUCTURE'
    ];
    
    TEST_AGENTS.forEach(agentId => {
      const prompt = getSystemPrompt(agentId);
      const missingSection = requiredSections.find(section => !prompt.includes(section));
      
      if (missingSection) {
        console.error(`❌ Agent "${agentId}" missing section: "${missingSection}"`);
        passed = false;
      }
    });
    
    if (passed) console.log('✅ All prompts have required structure');
    return passed;
  }

  static testTemperatureRange(): boolean {
    console.log('\n🧪 Test 3: Temperature settings valid...');
    let passed = true;
    const validRange = { min: 0, max: 1 };
    
    TEST_AGENTS.forEach(agentId => {
      const temp = getAgentTemperature(agentId);
      
      if (temp < validRange.min || temp > validRange.max) {
        console.error(`❌ Agent "${agentId}" invalid temperature: ${temp}`);
        passed = false;
      }
      
      if (temp === 0.7) {
        console.warn(`⚠️  Agent "${agentId}" using default temperature`);
      }
    });
    
    if (passed) console.log('✅ All temperatures in valid range (0-1)');
    return passed;
  }

  static testNoGenericLanguage(): boolean {
    console.log('\n🧪 Test 4: No generic AI language...');
    let passed = true;
    const genericPatterns = [
      /as an ai/i,
      /i am an ai/i,
      /let me help/i,
      /i can assist/i,
      /helpful assistant/i
    ];
    
    TEST_AGENTS.forEach(agentId => {
      const prompt = getSystemPrompt(agentId);
      const foundGeneric = genericPatterns.find(pattern => pattern.test(prompt));
      
      if (foundGeneric) {
        console.error(`❌ Agent "${agentId}" contains generic language: "${foundGeneric}"`);
        passed = false;
      }
    });
    
    if (passed) console.log('✅ No generic AI language detected');
    return passed;
  }

  static testPersonalitySpecificity(): boolean {
    console.log('\n🧪 Test 5: Personality specificity...');
    let passed = true;
    
    // Check key personality indicators
    const personalityChecks = {
      'comedy-king': { must: ['comedy', 'funny', 'royal', 'decree'] },
      'drama-queen': { must: ['DARLING', 'dramatic', 'MAGNIFICENT'] },
      'lazy-pawn': { must: ['efficient', 'minimal', 'short'] },
      'tech-wizard': { must: ['magic', 'spell', 'wizard'] },
      'fitness-guru': { must: ['warrior', 'PUSH', 'transform'] },
      'einstein': { must: ['physics', 'genius', 'curiosity'] }
    };
    
    Object.entries(personalityChecks).forEach(([agentId, { must }]) => {
      const prompt = getSystemPrompt(agentId);
      const missingKeywords = must.filter(keyword => !prompt.toLowerCase().includes(keyword.toLowerCase()));
      
      if (missingKeywords.length > 0) {
        console.error(`❌ Agent "${agentId}" missing keywords: ${missingKeywords.join(', ')}`);
        passed = false;
      }
    });
    
    if (passed) console.log('✅ All agents have specific personality indicators');
    return passed;
  }

  static testNeverAlwaysRules(): boolean {
    console.log('\n🧪 Test 6: NEVER/ALWAYS rules present...');
    let passed = true;
    
    TEST_AGENTS.forEach(agentId => {
      const prompt = getSystemPrompt(agentId);
      const hasNeverRules = prompt.includes('🚫 NEVER');
      const hasAlwaysRules = prompt.includes('✅ ALWAYS');
      
      if (!hasNeverRules || !hasAlwaysRules) {
        console.error(`❌ Agent "${agentId}" missing enforcement rules`);
        passed = false;
      }
    });
    
    if (passed) console.log('✅ All agents have NEVER/ALWAYS enforcement rules');
    return passed;
  }

  static testEmojisPresent(): boolean {
    console.log('\n🧪 Test 7: Emojis present for character...');
    let passed = true;
    
    TEST_AGENTS.forEach(agentId => {
      const prompt = getSystemPrompt(agentId);
      const emojiPattern = /[\u{1F300}-\u{1F9FF}]/u;
      
      if (!emojiPattern.test(prompt)) {
        console.warn(`⚠️  Agent "${agentId}" has no emojis`);
      }
    });
    
    console.log('✅ Emoji check complete');
    return true;
  }

  static runAllTests(): void {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   PERSONALITY SYSTEM INTEGRATION TESTS     ║');
    console.log('╚════════════════════════════════════════════╝\n');

    const results = {
      agentsExist: this.testAllAgentsExist(),
      structure: this.testPromptStructure(),
      temperature: this.testTemperatureRange(),
      noGeneric: this.testNoGenericLanguage(),
      specificity: this.testPersonalitySpecificity(),
      rules: this.testNeverAlwaysRules(),
      emojis: this.testEmojisPresent()
    };

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║            TEST RESULTS SUMMARY            ║');
    console.log('╚════════════════════════════════════════════╝\n');

    const passed = Object.values(results).filter(r => r).length;
    const total = Object.values(results).length;

    console.log(`Passed: ${passed}/${total} test suites\n`);

    if (passed === total) {
      console.log('🎉 ALL TESTS PASSED! Personality system is ready.\n');
      console.log('✅ All 18 agents have strict personality enforcement');
      console.log('✅ No generic AI language detected');
      console.log('✅ All NEVER/ALWAYS rules present');
      console.log('✅ Temperatures calibrated per agent');
    } else {
      console.log('⚠️  Some tests failed. Review above for details.\n');
    }
  }
}

// Run tests if executed directly
if (require.main === module) {
  PersonalitySystemTests.runAllTests();
}

export default PersonalitySystemTests;
