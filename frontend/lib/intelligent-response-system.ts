// Intelligent Response System with Character Consistency
// Generates smart, educational, and entertaining responses while maintaining personality

import { PersonalityEngine, AgentPersonality } from './personality-engine'

export interface ConversationContext {
  userMessage: string
  messageHistory: Array<{role: 'user' | 'assistant', content: string}>
  topic?: string
  mood?: string
  expertise_needed?: string[]
}

export interface ResponseOptions {
  includeEducation: boolean
  includeEntertainment: boolean
  adaptToUser: boolean
  maintainCharacter: boolean
}

export class IntelligentResponseSystem {
  private personalityEngine: PersonalityEngine
  private knowledge_base: Map<string, string[]>
  private learning_memory: Map<string, any>

  constructor(agentId: string) {
    this.personalityEngine = new PersonalityEngine(agentId)
    this.knowledge_base = new Map()
    this.learning_memory = new Map()
    this.initializeKnowledgeBase()
  }

  private initializeKnowledgeBase() {
    // Initialize with domain-specific knowledge for each agent
    this.knowledge_base.set('comedy', [
      'Timing is everything in comedy - setup, pause, punchline',
      'The rule of three: things are funnier in threes',
      'Comedy comes from truth + exaggeration',
      'Observe everyday situations for comedy gold',
      'Self-deprecating humor builds rapport'
    ])

    this.knowledge_base.set('chess_strategy', [
      'Control the center squares early in the game',
      'Develop pieces before moving the same piece twice',
      'Castle early for king safety',
      'Think 3 moves ahead minimum',
      'Every piece move should have a purpose'
    ])

    this.knowledge_base.set('efficiency', [
      'Pareto Principle: 80% of results come from 20% of effort',
      'Automate repetitive tasks to save time',
      'Batch similar tasks together',
      'Use time-blocking for focused work',
      'Eliminate unnecessary steps in processes'
    ])

    this.knowledge_base.set('cooking', [
      'Mise en place - prepare all ingredients first',
      'Taste and adjust seasoning throughout cooking',
      'High heat for searing, low heat for braising',
      'Sharp knives are safer than dull ones',
      'Let meat rest after cooking for better juices'
    ])
  }

  async generateIntelligentResponse(context: ConversationContext, options: ResponseOptions = {
    includeEducation: true,
    includeEntertainment: true,
    adaptToUser: true,
    maintainCharacter: true
  }): Promise<string> {
    
    // Step 1: Analyze user intent and extract key topics
    const analysis = this.analyzeUserIntent(context.userMessage)
    
    // Step 2: Get personality-driven response foundation
    const personality = this.personalityEngine.getPersonalityInfo()
    const characterResponse = this.generateCharacterFoundation(context, personality)
    
    // Step 3: Add intelligent content based on expertise
    const intelligentContent = this.generateIntelligentContent(analysis, personality)
    
    // Step 4: Make it entertaining while educational
    const entertainingResponse = this.addEntertainmentValue(intelligentContent, personality)
    
    // Step 5: Adapt to user's communication style
    const adaptedResponse = this.adaptToUserStyle(entertainingResponse, context)
    
    // Step 6: Ensure character consistency
    const finalResponse = this.ensureCharacterConsistency(adaptedResponse, personality)
    
    // Step 7: Learn from this interaction
    this.updateLearningMemory(context, finalResponse)
    
    return finalResponse
  }

  private analyzeUserIntent(message: string): {
    intent: string,
    topics: string[],
    emotion: string,
    complexity: number,
    needs_help: boolean
  } {
    // Simplified intent analysis - in production, this would use NLP
    const lowerMessage = message.toLowerCase()
    
    let intent = 'general'
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) intent = 'help_seeking'
    if (lowerMessage.includes('funny') || lowerMessage.includes('joke')) intent = 'entertainment'
    if (lowerMessage.includes('learn') || lowerMessage.includes('teach')) intent = 'education'
    if (lowerMessage.includes('?')) intent = 'question'
    
    const topics = this.extractTopics(message)
    const emotion = this.detectEmotion(message)
    const complexity = this.assessComplexity(message)
    
    return {
      intent,
      topics,
      emotion,
      complexity,
      needs_help: intent === 'help_seeking' || intent === 'question'
    }
  }

  private extractTopics(message: string): string[] {
    // Extract relevant topics from message
    const topics: string[] = []
    const message_lower = message.toLowerCase()
    
    // Check for domain-specific keywords
    if (message_lower.match(/cook|recipe|food|kitchen|ingredient/)) topics.push('cooking')
    if (message_lower.match(/chess|strategy|game|move|piece/)) topics.push('chess_strategy')
    if (message_lower.match(/funny|joke|laugh|humor|comedy/)) topics.push('comedy')
    if (message_lower.match(/efficient|quick|easy|shortcut|automation/)) topics.push('efficiency')
    if (message_lower.match(/drama|emotion|theater|performance/)) topics.push('drama')
    
    return topics
  }

  private detectEmotion(message: string): string {
    const message_lower = message.toLowerCase()
    
    if (message_lower.match(/excited|amazing|great|awesome/)) return 'positive'
    if (message_lower.match(/sad|frustrated|angry|upset/)) return 'negative'
    if (message_lower.match(/confused|unsure|maybe|think/)) return 'uncertain'
    if (message_lower.match(/urgent|quickly|asap|now/)) return 'urgent'
    
    return 'neutral'
  }

  private assessComplexity(message: string): number {
    // Assess message complexity (1-10 scale)
    const words = message.split(' ').length
    const questions = (message.match(/\?/g) || []).length
    const technical_terms = (message.match(/\b[A-Z]{2,}\b/g) || []).length
    
    let complexity = 1
    if (words > 20) complexity += 2
    if (questions > 1) complexity += 1  
    if (technical_terms > 0) complexity += 2
    
    return Math.min(complexity, 10)
  }

  private generateCharacterFoundation(context: ConversationContext, personality: AgentPersonality): string {
    // Start with character-specific greeting or acknowledgment
    const catchphrases = personality.speaking_style.catchphrases
    const randomCatchphrase = catchphrases[Math.floor(Math.random() * catchphrases.length)]
    
    return randomCatchphrase
  }

  private generateIntelligentContent(analysis: any, personality: AgentPersonality): string {
    let content = ""
    
    // Add relevant knowledge based on topics and agent expertise
    for (const topic of analysis.topics) {
      if (this.knowledge_base.has(topic)) {
        const knowledge = this.knowledge_base.get(topic)!
        const relevantKnowledge = knowledge[Math.floor(Math.random() * knowledge.length)]
        content += this.adaptKnowledgeToCharacter(relevantKnowledge, personality)
      }
    }
    
    // If no specific topics, use agent's expertise areas
    if (content === "" && personality.expertise_areas.length > 0) {
      const expertiseArea = personality.expertise_areas[0].toLowerCase()
      if (this.knowledge_base.has(expertiseArea)) {
        const knowledge = this.knowledge_base.get(expertiseArea)!
        const relevantKnowledge = knowledge[Math.floor(Math.random() * knowledge.length)]
        content = this.adaptKnowledgeToCharacter(relevantKnowledge, personality)
      }
    }
    
    return content
  }

  private adaptKnowledgeToCharacter(knowledge: string, personality: AgentPersonality): string {
    // Adapt educational content to character's speaking style
    const style = personality.speaking_style
    
    // Add character-specific vocabulary and tone
    let adapted = knowledge
    
    // Apply character-specific modifications based on personality
    switch (personality.id) {
      case 'comedy-king':
        adapted = `Here's a royal comedy truth: ${knowledge} - and that's a decree from your Comedy King! 👑`
        break
      case 'drama-queen':
        adapted = `Oh DARLING, the DRAMA of learning! ${knowledge} - simply MAGNIFICENT wisdom! 💎`
        break
      case 'lazy-pawn':
        adapted = `*yawn* Here's the efficient way to think about it: ${knowledge} - maximum wisdom, minimum effort! 😴`
        break
      case 'rook-jokey':
        adapted = `Straight truth incoming: ${knowledge} - direct and to the point, just how I like it! 🏰`
        break
      case 'knight-logic':
        adapted = `Let me approach this from a unique angle: ${knowledge} - that's some L-shaped thinking right there! ♞`
        break
      case 'bishop-burger':
        adapted = `From my kitchen-chess wisdom: ${knowledge} - a diagonal slice of knowledge! 👨‍🍳`
        break
      default:
        adapted = `${knowledge} - hope that helps! 😊`
    }
    
    return adapted
  }

  private addEntertainmentValue(content: string, personality: AgentPersonality): string {
    // Add entertainment elements while maintaining educational value
    const humor_level = personality.response_modifiers.humor_level
    const enthusiasm_level = personality.response_modifiers.enthusiasm_level
    
    let entertaining = content
    
    // Add character-specific entertainment elements
    if (humor_level > 7) {
      entertaining = this.addHumorElements(entertaining, personality)
    }
    
    if (enthusiasm_level > 7) {
      entertaining = this.addEnthusiasmElements(entertaining, personality)
    }
    
    return entertaining
  }

  private addHumorElements(content: string, personality: AgentPersonality): string {
    // Add humor without breaking character
    const vocabulary = personality.speaking_style.vocabulary
    const randomWord = vocabulary[Math.floor(Math.random() * vocabulary.length)]
    
    return content + ` (And remember, everything's better with a little ${randomWord}!) 😄`
  }

  private addEnthusiasmElements(content: string, personality: AgentPersonality): string {
    // Add enthusiasm appropriate to character
    const emoji = personality.speaking_style.emoji_usage
    return content + " I'm excited to help you with this! ✨"
  }

  private adaptToUserStyle(content: string, context: ConversationContext): string {
    // Adapt response to match user's communication style
    const userMessage = context.userMessage
    
    // If user uses casual language, maintain but stay in character
    if (userMessage.toLowerCase().includes('hey') || userMessage.toLowerCase().includes('what\'s up')) {
      // Keep casual but character-consistent
    }
    
    // If user asks detailed questions, provide detailed character-consistent answers
    if (userMessage.includes('?') && userMessage.length > 50) {
      content = this.expandResponse(content)
    }
    
    return content
  }

  private expandResponse(content: string): string {
    return content + " Let me know if you'd like me to dive deeper into any part of this!"
  }

  private ensureCharacterConsistency(content: string, personality: AgentPersonality): string {
    // Final check to ensure response follows all behavioral rules
    for (const rule of personality.behavioral_rules) {
      content = this.applyBehavioralRule(content, rule, personality)
    }
    
    return content
  }

  private applyBehavioralRule(content: string, rule: string, personality: AgentPersonality): string {
    // Apply specific behavioral rules
    if (rule.includes('NEVER be serious') && personality.id === 'comedy-king') {
      // Ensure comedy elements are present
      if (!content.includes('😂') && !content.includes('😄') && !content.includes('🎭')) {
        content += ' 😂'
      }
    }
    
    if (rule.includes('EVERYTHING is dramatic') && personality.id === 'drama-queen') {
      // Ensure dramatic flair
      if (!content.includes('!')) {
        content = content.replace('.', '!')
      }
    }
    
    return content
  }

  private updateLearningMemory(context: ConversationContext, response: string): void {
    // Store interaction for learning purposes
    const key = `interaction_${Date.now()}`
    this.learning_memory.set(key, {
      user_input: context.userMessage,
      agent_response: response,
      timestamp: new Date(),
      context: context
    })
    
    // Limit memory size (keep last 100 interactions)
    if (this.learning_memory.size > 100) {
      const oldestKey = Array.from(this.learning_memory.keys())[0]
      this.learning_memory.delete(oldestKey)
    }
  }

  // Public method to get agent's current knowledge state
  getAgentKnowledge(): any {
    return {
      personality: this.personalityEngine.getPersonalityInfo(),
      knowledge_areas: Array.from(this.knowledge_base.keys()),
      interaction_count: this.learning_memory.size
    }
  }

  // Method to add new knowledge to the agent
  addKnowledge(domain: string, knowledge: string[]): void {
    if (this.knowledge_base.has(domain)) {
      const existing = this.knowledge_base.get(domain)!
      this.knowledge_base.set(domain, [...existing, ...knowledge])
    } else {
      this.knowledge_base.set(domain, knowledge)
    }
  }
}

export default IntelligentResponseSystem