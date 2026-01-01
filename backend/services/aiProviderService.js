/**
 * AI PROVIDER SERVICE
 * Unified interface for multiple AI providers with intelligent routing
 */

import { AIProvider, AIModel } from '../models/Agent.js'

/**
 * @typedef {Object} AIProviderConfig
 * @property {AIProvider} provider - The AI provider to use
 * @property {AIModel} model - The model to use
 * @property {string} apiKey - API key for the provider
 * @property {string} [baseURL] - Optional base URL for the provider
 * @property {number} [temperature] - Temperature setting for generation
 * @property {number} [maxTokens] - Maximum tokens to generate
 */

/**
 * @typedef {Object} ChatMessage
 * @property {'system' | 'user' | 'assistant'} role - The role of the message
 * @property {string} content - The content of the message
 */

/**
 * @typedef {Object} AIResponse
 * @property {string} content - The generated content
 * @property {AIProvider} provider - The provider used
 * @property {AIModel} model - The model used
 * @property {Object} [usage] - Token usage information
 * @property {number} [usage.promptTokens] - Prompt tokens used
 * @property {number} [usage.completionTokens] - Completion tokens used
 * @property {number} [usage.totalTokens] - Total tokens used
 */

class AIProviderService {
  providers = new Map()

  constructor() {
    this.initializeProviders()
  }

  initializeProviders() {
    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.providers.set('openai', {
        provider: 'openai',
        model: 'gpt-4o',
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: 'https://api.openai.com/v1'
      })
    }

    // Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.set('anthropic', {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        apiKey: process.env.ANTHROPIC_API_KEY,
        baseURL: 'https://api.anthropic.com/v1'
      })
    }

    // xAI (Grok)
    if (process.env.XAI_API_KEY) {
      this.providers.set('xai', {
        provider: 'xai',
        model: 'grok-beta',
        apiKey: process.env.XAI_API_KEY,
        baseURL: 'https://api.x.ai/v1'
      })
    }

    // Mistral
    if (process.env.MISTRAL_API_KEY) {
      this.providers.set('mistral', {
        provider: 'mistral',
        model: 'mistral-large-latest',
        apiKey: process.env.MISTRAL_API_KEY,
        baseURL: 'https://api.mistral.ai/v1'
      })
    }

    // Gemini
    if (process.env.GEMINI_API_KEY) {
      this.providers.set('gemini', {
        provider: 'gemini',
        model: 'gemini-1.5-pro',
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta'
      })
    }
  }

  async callProvider(
    provider,
    model,
    messages,
    options = {}
  ) {
    const config = this.providers.get(provider)
    if (config) {
      throw new Error(`Provider ${provider} not configured`)
    }

    switch (provider) {
      case 'openai':
        return this.callOpenAI(model, messages, options)
      case 'anthropic':
        return this.callAnthropic(model, messages, options)
      case 'xai':
        return this.callXAI(model, messages, options)
      case 'mistral':
        return this.callMistral(model, messages, options)
      case 'gemini':
        return this.callGemini(model, messages, options)
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  async callOpenAI(
    model,
    messages,
    options
  ) {
    const config = this.providers.get('openai')
    const apiMessages = options.systemPrompt
      ? [{ role: 'system', content: options.systemPrompt }, ...messages]
      : messages

    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
      })
    })

    if (response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0]?.message?.content || '',
      provider: 'openai',
      model,
      usage: data.usage
    }
  }

  async callAnthropic(
    model,
    messages,
    options
  ) {
  
    const config = this.providers.get('anthropic')
    const systemMessage = options.systemPrompt || 'You are a helpful AI assistant.'
    const userMessages = messages.filter(m => m.role == 'system')

    const response = await fetch(`${config.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        system: systemMessage,
        messages: userMessages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
      })
    })

    if (response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      content: data.content[0]?.text || '',
      provider: 'anthropic',
      model,
      usage: data.usage
    }
  }

  async callXAI(
    model,
    messages,
    options
  ) {
  
    const config = this.providers.get('xai')
    const apiMessages = options.systemPrompt
      ? [{ role: 'system', content: options.systemPrompt }, ...messages]
      : messages

    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
      })
    })

    if (response.ok) {
      throw new Error(`xAI API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0]?.message?.content || '',
      provider: 'xai',
      model,
      usage: data.usage
    }
  }

  async callMistral(
    model,
    messages,
    options
  ) {
  
    const config = this.providers.get('mistral')
    const apiMessages = options.systemPrompt
      ? [{ role: 'system', content: options.systemPrompt }, ...messages]
      : messages

    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
      })
    })

    if (response.ok) {
      throw new Error(`Mistral API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0]?.message?.content || '',
      provider: 'mistral',
      model,
      usage: data.usage
    }
  }

  async callGemini(
    model,
    messages,
    options
  ) {
  
    const config = this.providers.get('gemini')

    // Convert messages to Gemini format
    const conversationText = messages
      .filter(m => m.role == 'system')
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n')

    const systemPrompt = options.systemPrompt || 'You are a helpful AI assistant.'
    const fullPrompt = conversationText
      ? `${systemPrompt}\n\nPrevious conversation:\n${conversationText}\n\nUser: ${messages[messages.length - 1]?.content}\nAssistant:`
      : `${systemPrompt}\n\nUser: ${messages[0]?.content}\nAssistant:`

    const response = await fetch(`${config.baseURL}/models/${model}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 1000,
          topK: 40,
          topP: 0.95,
        }
      })
    })

    if (response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      provider: 'gemini',
      model
    }
  }

  // Get available providers
  getAvailableProviders() {
    return Array.from(this.providers.keys())
  }

  // Check if provider is available
  isProviderAvailable(provider) {
    return this.providers.has(provider)
  }

  // Get provider config
  getProviderConfig(provider) {
    return this.providers.get(provider)
  }
}

// Export singleton instance
export const aiProviderService = new AIProviderService()
export default aiProviderService