/**
 * Multi-Modal AI Service
 * Unified interface for all AI capabilities:
 * 1. Chat/Reasoning (GPT-4o, GPT-5, Claude, Gemini)
 * 2. Embeddings (text-embedding-3-small/large)
 * 3. Image Generation (gpt-image-1, DALL-E, Stable Diffusion)
 * 4. Speech-to-Text (whisper-1, gpt-4o-mini-transcribe)
 * 5. Text-to-Speech (gpt-4o-mini-tts, tts-hd)
 * 6. Code (integrated in chat models)
 */

import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getAgentPersonalityConfig, buildAgentSystemMessage } from './personality-integration'

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ChatModelConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'cohere'
  model: string
  temperature?: number
  maxTokens?: number
  topP?: number
}

export interface EmbeddingConfig {
  provider: 'openai' | 'gemini'
  model: 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-004'
}

export interface ImageGenConfig {
  provider: 'openai' | 'stability'
  model: string
  size?: '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
}

export interface STTConfig {
  provider: 'openai'
  model: 'whisper-1' | 'gpt-4o-mini-transcribe'
  language?: string
  temperature?: number
}

export interface TTSConfig {
  provider: 'openai'
  model: 'gpt-4o-mini-tts' | 'gpt-4o-mini-tts-hd' | 'tts-1' | 'tts-1-hd'
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  speed?: number
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  text: string
  provider: string
  model: string
  tokensUsed?: number
  latency: number
}

export interface EmbeddingResponse {
  embedding: number[]
  provider: string
  model: string
  dimensions: number
}

export interface ImageResponse {
  url?: string
  base64?: string
  provider: string
  model: string
  revisedPrompt?: string
}

export interface TranscriptionResponse {
  text: string
  provider: string
  model: string
  language?: string
  duration?: number
}

export interface TTSResponse {
  audio: Buffer
  provider: string
  model: string
  voice: string
}

// ============================================
// VOICE ASSIGNMENTS BY AGENT GENDER
// ============================================

export const AGENT_VOICE_MAP: Record<string, TTSConfig['voice']> = {
  // Female Voices
  'julie-girlfriend': 'nova',      // Warm, friendly female
  'drama-queen': 'shimmer',        // Dramatic, expressive female
  'emma-emotional': 'nova',        // Empathetic female
  'mrs-boss': 'alloy',            // Professional, authoritative female
  
  // Male Voices
  'einstein': 'onyx',             // Deep, thoughtful male
  'tech-wizard': 'echo',          // Tech-savvy male
  'fitness-guru': 'fable',        // Energetic male
  'chess-player': 'onyx',         // Strategic male
  'knight-logic': 'echo',         // Tactical male
  'comedy-king': 'fable',         // Funny, expressive male
  'rook-jokey': 'echo',           // Witty male
  'lazy-pawn': 'alloy',           // Casual male
  'chef-biew': 'fable',           // Passionate male
  'professor-astrology': 'onyx',  // Wise male
  'travel-buddy': 'echo',         // Adventurous male
  'ben-sega': 'onyx',             // Professional male
  
  // Default
  'default': 'alloy'
}

// ============================================
// MULTIMODAL AI SERVICE CLASS
// ============================================

export class MultiModalAIService {
  private openai: OpenAI | null = null
  private anthropic: Anthropic | null = null
  private gemini: GoogleGenerativeAI | null = null

  constructor() {
    this.initializeClients()
  }

  private initializeClients() {
    // Initialize OpenAI (for Chat, Embeddings, Image, STT, TTS)
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
    }

    // Initialize Anthropic (for Chat)
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      })
    }

    // Initialize Gemini (for Chat, Embeddings)
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    }
  }

  // ============================================
  // 1. CHAT / REASONING MODELS
  // ============================================

  async getChatResponse(
    message: string,
    agentId: string,
    config?: Partial<ChatModelConfig>
  ): Promise<ChatResponse> {
    const startTime = Date.now()
    const personality = getAgentPersonalityConfig(agentId)
    const systemPrompt = buildAgentSystemMessage(agentId, '')

    const defaultConfig: ChatModelConfig = {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: personality.temperature,
      maxTokens: 2000,
      topP: personality.topP,
      ...config
    }

    try {
      switch (defaultConfig.provider) {
        case 'openai':
          return await this.getChatOpenAI(message, systemPrompt, defaultConfig, startTime)
        
        case 'anthropic':
          return await this.getChatAnthropic(message, systemPrompt, defaultConfig, startTime)
        
        case 'gemini':
          return await this.getChatGemini(message, systemPrompt, defaultConfig, startTime)
        
        default:
          throw new Error(`Unsupported chat provider: ${defaultConfig.provider}`)
      }
    } catch (error) {
      console.error('Chat response error:', error)
      throw error
    }
  }

  private async getChatOpenAI(
    message: string,
    systemPrompt: string,
    config: ChatModelConfig,
    startTime: number
  ): Promise<ChatResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized')

    const response = await this.openai.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      top_p: config.topP
    })

    return {
      text: response.choices[0]?.message?.content || '',
      provider: 'openai',
      model: config.model,
      tokensUsed: response.usage?.total_tokens,
      latency: Date.now() - startTime
    }
  }

  private async getChatAnthropic(
    message: string,
    systemPrompt: string,
    config: ChatModelConfig,
    startTime: number
  ): Promise<ChatResponse> {
    if (!this.anthropic) throw new Error('Anthropic not initialized')

    const response = await this.anthropic.messages.create({
      model: config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: config.maxTokens || 2000,
      temperature: config.temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    })

    const textContent = response.content.find(c => c.type === 'text')
    return {
      text: textContent && 'text' in textContent ? textContent.text : '',
      provider: 'anthropic',
      model: config.model || 'claude-3-5-sonnet',
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      latency: Date.now() - startTime
    }
  }

  private async getChatGemini(
    message: string,
    systemPrompt: string,
    config: ChatModelConfig,
    startTime: number
  ): Promise<ChatResponse> {
    if (!this.gemini) throw new Error('Gemini not initialized')

    const model = this.gemini.getGenerativeModel({ 
      model: config.model || 'gemini-2.0-flash-exp',
      systemInstruction: systemPrompt
    })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: message }] }],
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
        topP: config.topP
      }
    })

    return {
      text: result.response.text(),
      provider: 'gemini',
      model: config.model || 'gemini-2.0-flash',
      latency: Date.now() - startTime
    }
  }

  // ============================================
  // 2. EMBEDDING MODELS
  // ============================================

  async getEmbedding(
    text: string,
    config?: Partial<EmbeddingConfig>
  ): Promise<EmbeddingResponse> {
    const defaultConfig: EmbeddingConfig = {
      provider: 'openai',
      model: 'text-embedding-3-small',
      ...config
    }

    try {
      switch (defaultConfig.provider) {
        case 'openai':
          return await this.getEmbeddingOpenAI(text, defaultConfig)
        
        case 'gemini':
          return await this.getEmbeddingGemini(text, defaultConfig)
        
        default:
          throw new Error(`Unsupported embedding provider: ${defaultConfig.provider}`)
      }
    } catch (error) {
      console.error('Embedding error:', error)
      throw error
    }
  }

  private async getEmbeddingOpenAI(
    text: string,
    config: EmbeddingConfig
  ): Promise<EmbeddingResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized')

    const response = await this.openai.embeddings.create({
      model: config.model,
      input: text,
      encoding_format: 'float'
    })

    return {
      embedding: response.data[0].embedding,
      provider: 'openai',
      model: config.model,
      dimensions: response.data[0].embedding.length
    }
  }

  private async getEmbeddingGemini(
    text: string,
    config: EmbeddingConfig
  ): Promise<EmbeddingResponse> {
    if (!this.gemini) throw new Error('Gemini not initialized')

    const model = this.gemini.getGenerativeModel({ 
      model: config.model === 'text-embedding-3-large' ? 'text-embedding-004' : 'text-embedding-004'
    })

    const result = await model.embedContent(text)

    return {
      embedding: result.embedding.values,
      provider: 'gemini',
      model: 'text-embedding-004',
      dimensions: result.embedding.values.length
    }
  }

  // ============================================
  // 3. IMAGE GENERATION MODELS
  // ============================================

  async generateImage(
    prompt: string,
    config?: Partial<ImageGenConfig>
  ): Promise<ImageResponse> {
    const defaultConfig: ImageGenConfig = {
      provider: 'openai',
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
      ...config
    }

    try {
      switch (defaultConfig.provider) {
        case 'openai':
          return await this.generateImageOpenAI(prompt, defaultConfig)
        
        default:
          throw new Error(`Unsupported image provider: ${defaultConfig.provider}`)
      }
    } catch (error) {
      console.error('Image generation error:', error)
      throw error
    }
  }

  private async generateImageOpenAI(
    prompt: string,
    config: ImageGenConfig
  ): Promise<ImageResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized')

    const response = await this.openai.images.generate({
      model: config.model,
      prompt: prompt,
      n: 1,
      size: config.size,
      quality: config.quality,
      style: config.style,
      response_format: 'url'
    })

    return {
      url: response.data[0].url,
      provider: 'openai',
      model: config.model,
      revisedPrompt: response.data[0].revised_prompt
    }
  }

  // ============================================
  // 4. SPEECH-TO-TEXT MODELS
  // ============================================

  async transcribeAudio(
    audioFile: File | Buffer,
    config?: Partial<STTConfig>
  ): Promise<TranscriptionResponse> {
    const defaultConfig: STTConfig = {
      provider: 'openai',
      model: 'whisper-1',
      language: 'en',
      temperature: 0,
      ...config
    }

    try {
      switch (defaultConfig.provider) {
        case 'openai':
          return await this.transcribeOpenAI(audioFile, defaultConfig)
        
        default:
          throw new Error(`Unsupported STT provider: ${defaultConfig.provider}`)
      }
    } catch (error) {
      console.error('Transcription error:', error)
      throw error
    }
  }

  private async transcribeOpenAI(
    audioFile: File | Buffer,
    config: STTConfig
  ): Promise<TranscriptionResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized')

    const response = await this.openai.audio.transcriptions.create({
      file: audioFile as any,
      model: config.model,
      language: config.language,
      temperature: config.temperature
    })

    return {
      text: response.text,
      provider: 'openai',
      model: config.model,
      language: config.language
    }
  }

  // ============================================
  // 5. TEXT-TO-SPEECH MODELS
  // ============================================

  async generateSpeech(
    text: string,
    agentId: string,
    config?: Partial<TTSConfig>
  ): Promise<TTSResponse> {
    // Auto-select voice based on agent gender/personality
    const agentVoice = AGENT_VOICE_MAP[agentId] || AGENT_VOICE_MAP['default']

    const defaultConfig: TTSConfig = {
      provider: 'openai',
      model: 'tts-1',
      voice: agentVoice,
      speed: 1.0,
      ...config
    }

    try {
      switch (defaultConfig.provider) {
        case 'openai':
          return await this.generateSpeechOpenAI(text, defaultConfig)
        
        default:
          throw new Error(`Unsupported TTS provider: ${defaultConfig.provider}`)
      }
    } catch (error) {
      console.error('TTS error:', error)
      throw error
    }
  }

  private async generateSpeechOpenAI(
    text: string,
    config: TTSConfig
  ): Promise<TTSResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized')

    const response = await this.openai.audio.speech.create({
      model: config.model,
      voice: config.voice,
      input: text,
      speed: config.speed
    })

    const buffer = Buffer.from(await response.arrayBuffer())

    return {
      audio: buffer,
      provider: 'openai',
      model: config.model,
      voice: config.voice
    }
  }

  // ============================================
  // BATCH OPERATIONS
  // ============================================

  async batchGetEmbeddings(texts: string[], config?: Partial<EmbeddingConfig>): Promise<EmbeddingResponse[]> {
    return Promise.all(texts.map(text => this.getEmbedding(text, config)))
  }

  async chatWithMemory(
    message: string,
    agentId: string,
    previousMessages: ChatMessage[],
    config?: Partial<ChatModelConfig>
  ): Promise<ChatResponse> {
    // For future: integrate with vector store for semantic memory
    return this.getChatResponse(message, agentId, config)
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const multiModalAI = new MultiModalAIService()
