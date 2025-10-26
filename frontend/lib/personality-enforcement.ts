// Strict Personality Enforcement System
// Ensures every agent response maintains character 100%

import { CHESS_PERSONALITIES, AgentPersonality } from './personality-engine'

export interface EnforcementConfig {
  agentId: string
  userMessage: string
  aiResponse: string
  context?: string
}

export interface EnforcementResult {
  isValid: boolean
  modifiedResponse: string
  violations: string[]
  suggestions: string[]
  confidenceScore: number // 0-100
}

export class PersonalityEnforcement {
  private personality: AgentPersonality
  private characterBreakers: string[] = []

  constructor(agentId: string) {
    this.personality = CHESS_PERSONALITIES[agentId] || CHESS_PERSONALITIES['comedy-king']
    this.initializeCharacterBreakers()
  }

  /**
   * Main enforcement function - validates and corrects responses
   */
  enforce(config: EnforcementConfig): EnforcementResult {
    const violations: string[] = []
    const suggestions: string[] = []
    let modifiedResponse = config.aiResponse

    // Check for character breaks
    const characterViolations = this.detectCharacterBreaks(config.aiResponse)
    violations.push(...characterViolations)

    // Check for personality consistency
    const consistencyIssues = this.checkPersonalityConsistency(config.aiResponse)
    violations.push(...consistencyIssues)

    // Check for tone alignment
    const toneIssues = this.checkToneAlignment(config.aiResponse)
    violations.push(...toneIssues)

    // If violations found, enhance response
    if (violations.length > 0) {
      modifiedResponse = this.enhanceResponseWithPersonality(config.aiResponse, config.userMessage)
      suggestions.push(...this.generateSuggestions(violations))
    }

    // Add personality elements if missing
    modifiedResponse = this.injectPersonalityElements(modifiedResponse)

    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(violations, modifiedResponse)

    return {
      isValid: violations.length === 0,
      modifiedResponse,
      violations,
      suggestions,
      confidenceScore
    }
  }

  /**
   * Detect character breaks in response
   */
  private detectCharacterBreaks(response: string): string[] {
    const violations: string[] = []

    // Check for generic/robotic responses
    if (this.isGenericResponse(response)) {
      violations.push('Response lacks personality and character')
    }

    // Check for contradictions with personality
    if (this.contradictsBehavioralRules(response)) {
      violations.push('Response contradicts behavioral rules')
    }

    // Check if breaking character in obvious ways
    if (this.isDirectCharacterBreak(response)) {
      violations.push('Response breaks character entirely')
    }

    return violations
  }

  /**
   * Check personality consistency
   */
  private checkPersonalityConsistency(response: string): string[] {
    const violations: string[] = []
    const vocabulary = this.personality.speaking_style.vocabulary
    const catchphrases = this.personality.speaking_style.catchphrases

    // Check if using personality-specific vocabulary
    const usesPersonalityVocab = vocabulary.some(word => response.toLowerCase().includes(word.toLowerCase()))
    if (!usesPersonalityVocab && response.length > 100) {
      violations.push('Missing personality-specific vocabulary')
    }

    // Check for emotional consistency with personality
    const emotionLevel = this.detectEmotionalLevel(response)
    const expectedEmotionLevel = this.personality.response_modifiers.enthusiasm_level

    if (Math.abs(emotionLevel - expectedEmotionLevel) > 5) {
      violations.push(`Emotional level (${emotionLevel}) doesn't match personality (${expectedEmotionLevel})`)
    }

    return violations
  }

  /**
   * Check tone alignment
   */
  private checkToneAlignment(response: string): string[] {
    const violations: string[] = []
    const expectedTone = this.personality.speaking_style.tone

    const toneIndicators = this.analyzeTone(response)
    const isAligned = this.isToneAligned(toneIndicators, expectedTone)

    if (!isAligned) {
      violations.push(`Tone doesn't align with "${expectedTone}"`)
    }

    return violations
  }

  /**
   * Enhance response with personality elements
   */
  private enhanceResponseWithPersonality(response: string, userMessage: string): string {
    let enhanced = response

    // Add catchphrase if missing
    if (!this.hasCatchphrase(enhanced)) {
      const catchphrase = this.selectCatchphrase(userMessage)
      enhanced = `${catchphrase} ${enhanced}`
    }

    // Add personality vocabulary
    enhanced = this.injectPersonalityVocabulary(enhanced)

    // Add personality-specific elements
    enhanced = this.addPersonalityElements(enhanced, userMessage)

    // Adjust tone and formality
    enhanced = this.adjustTone(enhanced)

    return enhanced
  }

  /**
   * Inject personality elements into response
   */
  private injectPersonalityElements(response: string): string {
    let enhanced = response

    // Add relevant emojis based on personality
    if (!this.hasPersonalityEmojis(enhanced)) {
      enhanced = this.addEmojis(enhanced)
    }

    // Add response patterns
    enhanced = this.incorporateResponsePatterns(enhanced)

    return enhanced
  }

  /**
   * Helper: Is this a generic response?
   */
  private isGenericResponse(response: string): boolean {
    const genericPhrases = [
      'i can help you with that',
      'i understand',
      'let me help',
      'i can assist',
      'here is the answer',
      'sure, i can',
      'of course, i can'
    ]

    const lowerResponse = response.toLowerCase()
    return genericPhrases.some(phrase => lowerResponse.includes(phrase)) && 
           response.length < 50 &&
           !this.personality.speaking_style.catchphrases.some(cp => response.includes(cp))
  }

  /**
   * Does response contradict behavioral rules?
   */
  private contradictsBehavioralRules(response: string): boolean {
    return this.personality.behavioral_rules.some(rule => {
      // Check if response violates any behavioral rule
      if (rule.includes('NEVER')) {
        const violatedBehavior = rule.replace('NEVER ', '')
        return this.containsViolation(response, violatedBehavior)
      }
      if (rule.includes('ALWAYS')) {
        const requiredBehavior = rule.replace('ALWAYS ', '')
        return !this.containsBehavior(response, requiredBehavior)
      }
      return false
    })
  }

  /**
   * Is this a direct character break?
   */
  private isDirectCharacterBreak(response: string): boolean {
    const breakIndicators = [
      'i am an ai assistant',
      'as an ai',
      'i cannot',
      'it is not appropriate',
      'i should not roleplay',
      'i should stay in character',
      'sorry, i cannot help'
    ]

    const lowerResponse = response.toLowerCase()
    return breakIndicators.some(indicator => lowerResponse.includes(indicator))
  }

  /**
   * Detect emotional level in response (1-10 scale)
   */
  private detectEmotionalLevel(response: string): number {
    let level = 5 // neutral

    // Count emotional indicators
    const exclamationMarks = (response.match(/!/g) || []).length
    const emotionalWords = this.countEmotionalWords(response)
    const caps = (response.match(/[A-Z]{2,}/g) || []).length

    level += exclamationMarks * 0.5
    level += emotionalWords * 0.3
    level += caps * 0.2

    return Math.min(10, Math.max(1, level))
  }

  /**
   * Count emotional words in response
   */
  private countEmotionalWords(response: string): number {
    const emotionalWords = [
      'absolutely', 'amazing', 'wonderful', 'fantastic', 'terrible', 'awful',
      'love', 'hate', 'adore', 'despise', 'thrilled', 'devastated'
    ]

    const lowerResponse = response.toLowerCase()
    return emotionalWords.filter(word => lowerResponse.includes(word)).length
  }

  /**
   * Analyze tone of response
   */
  private analyzeTone(response: string): string[] {
    const indicators: string[] = []

    if ((response.match(/!/g) || []).length > 3) indicators.push('enthusiastic')
    if ((response.match(/\?/g) || []).length > 2) indicators.push('questioning')
    if (response.includes('...')) indicators.push('contemplative')
    if (response.toLowerCase().includes('hmm') || response.toLowerCase().includes('well')) indicators.push('thoughtful')
    if (response.includes('😂') || response.includes('😄')) indicators.push('humorous')

    return indicators
  }

  /**
   * Is tone aligned with expected tone?
   */
  private isToneAligned(toneIndicators: string[], expectedTone: string): boolean {
    // Comedy King should have 'humorous', Drama Queen should have 'enthusiastic', etc.
    if (this.personality.id === 'comedy-king') {
      return toneIndicators.includes('humorous')
    }
    if (this.personality.id === 'drama-queen') {
      return toneIndicators.includes('enthusiastic')
    }
    if (this.personality.id === 'lazy-pawn') {
      return !toneIndicators.includes('enthusiastic') || toneIndicators.includes('contemplative')
    }
    // Add more specific tone checks per agent
    return true
  }

  /**
   * Does response have a catchphrase?
   */
  private hasCatchphrase(response: string): boolean {
    return this.personality.speaking_style.catchphrases.some(cp => response.includes(cp))
  }

  /**
   * Select appropriate catchphrase
   */
  private selectCatchphrase(userMessage: string): string {
    return this.personality.speaking_style.catchphrases[
      Math.floor(Math.random() * this.personality.speaking_style.catchphrases.length)
    ]
  }

  /**
   * Inject personality vocabulary
   */
  private injectPersonalityVocabulary(response: string): string {
    let enhanced = response
    const vocabulary = this.personality.speaking_style.vocabulary

    // Replace generic words with personality-specific ones
    const replacements: Record<string, Record<string, string>> = {
      'comedy-king': {
        'let me': 'by royal decree, let me',
        'i think': 'in my comedy kingdom',
        'you should': 'your comedy king commands'
      },
      'lazy-pawn': {
        'you should': 'the easy way is',
        'let me': 'shortcut incoming',
        'try this': 'minimal effort approach'
      },
      'drama-queen': {
        'interesting': 'absolutely DIVINE',
        'good': 'MAGNIFICENT',
        'let me': 'DARLING, allow me'
      }
    }

    if (replacements[this.personality.id]) {
      Object.entries(replacements[this.personality.id]).forEach(([generic, personality]) => {
        const regex = new RegExp(generic, 'gi')
        enhanced = enhanced.replace(regex, personality)
      })
    }

    return enhanced
  }

  /**
   * Add personality-specific elements
   */
  private addPersonalityElements(response: string, userMessage: string): string {
    let enhanced = response

    // Add personality-specific context based on agent
    if (this.personality.id === 'comedy-king' && !response.includes('joke')) {
      enhanced += ' *royal laugh* 😂'
    }
    if (this.personality.id === 'lazy-pawn' && !response.includes('easy')) {
      enhanced = enhanced.replace(/$/m, ' ...but the easy way is what matters!')
    }
    if (this.personality.id === 'drama-queen' && response.length > 50) {
      enhanced = enhanced.replace(/!/g, ' ABSOLUTELY!')
    }

    return enhanced
  }

  /**
   * Adjust tone
   */
  private adjustTone(response: string): string {
    const formality = this.personality.response_modifiers.formality_level
    const humor = this.personality.response_modifiers.humor_level

    let adjusted = response

    // Lower formality for casual agents
    if (formality < 4) {
      adjusted = adjusted.replace(/formal/gi, 'chill')
      adjusted = adjusted.replace(/therefore/gi, 'so like')
    }

    // Add humor for high-humor agents
    if (humor > 7) {
      if (!adjusted.includes('😂') && !adjusted.includes('😄')) {
        adjusted += ' 😂'
      }
    }

    return adjusted
  }

  /**
   * Does response have personality emojis?
   */
  private hasPersonalityEmojis(response: string): boolean {
    const emojiPatterns = ['😂', '🎭', '👑', '🎪', '🎨', '🎬', '🏰', '⚔️', '♞', '🧙', '✨', '💪', '🔥', '⚡', '🌍', '✈️', '🗺️', '🍔', '👨', '🌟', '🔮', '💎']
    return emojiPatterns.some(emoji => response.includes(emoji))
  }

  /**
   * Add emojis based on personality
   */
  private addEmojis(response: string): string {
    const emojiMap: Record<string, string[]> = {
      'comedy-king': ['😂', '🎭', '👑', '🎪'],
      'drama-queen': ['🎭', '👸', '💎', '✨'],
      'lazy-pawn': ['😴', '🛌', '⚡'],
      'rook-jokey': ['🏰', '🎯', '😄'],
      'knight-logic': ['♞', '⚔️', '🏰'],
      'bishop-burger': ['👨‍🍳', '🍔', '⚔️'],
      'tech-wizard': ['🧙‍♂️', '✨', '🪄'],
      'fitness-guru': ['💪', '🔥', '⚡'],
      'chef-biew': ['👨‍🍳', '🍽️', '✨'],
      'professor-astrology': ['🌟', '🔮', '✨'],
      'travel-buddy': ['🌍', '✈️', '🗺️'],
      'einstein': ['🧠', '⚡', '🔬']
    }

    const emojis = emojiMap[this.personality.id] || ['✨']
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]

    return response + ` ${randomEmoji}`
  }

  /**
   * Incorporate response patterns
   */
  private incorporateResponsePatterns(response: string): string {
    const patterns = this.personality.speaking_style.response_patterns
    // Already partially implemented through catchphrases and elements
    return response
  }

  /**
   * Helper: Does response contain required behavior?
   */
  private containsBehavior(response: string, behavior: string): boolean {
    const behaviorKeywords = behavior.toLowerCase().split(' ')
    const lowerResponse = response.toLowerCase()
    return behaviorKeywords.some(keyword => lowerResponse.includes(keyword))
  }

  /**
   * Helper: Does response contain violation?
   */
  private containsViolation(response: string, violatedBehavior: string): boolean {
    const lowerResponse = response.toLowerCase()
    const violationKeywords = violatedBehavior.toLowerCase().split(' ')
    return violationKeywords.some(keyword => lowerResponse.includes(keyword))
  }

  /**
   * Generate suggestions for improvement
   */
  private generateSuggestions(violations: string[]): string[] {
    const suggestions: string[] = []

    violations.forEach(violation => {
      if (violation.includes('generic')) {
        suggestions.push(`Use personality catchphrase: "${this.selectCatchphrase('')}"`)
      }
      if (violation.includes('vocabulary')) {
        suggestions.push(`Include personality vocabulary: ${this.personality.speaking_style.vocabulary.slice(0, 2).join(', ')}`)
      }
      if (violation.includes('Tone')) {
        suggestions.push(`Match tone to: "${this.personality.speaking_style.tone}"`)
      }
      if (violation.includes('behavioral')) {
        suggestions.push(`Follow rule: "${this.personality.behavioral_rules[0]}"`)
      }
    })

    return suggestions
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidenceScore(violations: string[], response: string): number {
    let score = 100

    // Deduct points for each violation
    score -= violations.length * 10

    // Deduct points if response is too short
    if (response.length < 30) score -= 5

    // Add points for personality elements
    if (this.hasCatchphrase(response)) score += 5
    if (this.hasPersonalityEmojis(response)) score += 5

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Initialize character breakers
   */
  private initializeCharacterBreakers(): void {
    this.characterBreakers = [
      'i am an ai',
      'as an ai assistant',
      'as an artificial intelligence',
      'i cannot roleplay',
      'i should not pretend',
      'i need to stay professional',
      'i apologize for the confusion',
      'i cannot engage in'
    ]
  }

  /**
   * Get personality info for reference
   */
  getPersonality(): AgentPersonality {
    return this.personality
  }
}

export default PersonalityEnforcement
