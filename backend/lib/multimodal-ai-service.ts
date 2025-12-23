/**
 * Multi-Modal AI Service
 * Unified interface for all AI capabilities with auto-fallback
 *
 * Priority Order: GEMINI → OpenAI → Mistral → Anthropic → Cohere
 *
 * Capabilities:
 * 1. Chat/Reasoning (Gemini, GPT-4o, GPT-5, Claude, Mistral, Cohere)
 * 2. Embeddings (Gemini, OpenAI, Cohere)
 * 3. Image Generation (OpenAI DALL-E, Stability AI)
 * 4. Speech-to-Text (OpenAI Whisper)
 * 5. Text-to-Speech (OpenAI TTS, ElevenLabs)
 * 6. Code (integrated in all chat models)
 * 7. External APIs (NASA, News, Alpha Vantage, Shodan, Pinecone)
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Mistral } from '@mistralai/mistralai';
// @ts-ignore
import { CohereClient } from 'cohere-ai';
import {
  getAgentPersonalityConfig,
  buildAgentSystemMessage,
} from './personality-integration';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ChatModelConfig {
  provider?:
    | 'gemini'
    | 'openai'
    | 'mistral'
    | 'anthropic'
    | 'cohere'
    | 'xai'
    | 'auto';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface EmbeddingConfig {
  provider?: 'gemini' | 'openai' | 'cohere' | 'auto';
  model?:
    | 'text-embedding-3-small'
    | 'text-embedding-3-large'
    | 'text-embedding-004'
    | 'embed-english-v3.0'
    | 'embed-multilingual-v3.0';
}

export interface ImageGenConfig {
  provider: 'openai' | 'stability';
  model: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
}

export interface STTConfig {
  provider: 'openai';
  model: 'whisper-1' | 'gpt-4o-mini-transcribe';
  language?: string;
  temperature?: number;
}

export interface TTSConfig {
  provider: 'openai';
  model: 'gpt-4o-mini-tts' | 'gpt-4o-mini-tts-hd' | 'tts-1' | 'tts-1-hd';
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  text: string;
  provider: string;
  model: string;
  tokensUsed?: number;
  latency: number;
}

export interface EmbeddingResponse {
  embedding: number[];
  provider: string;
  model: string;
  dimensions: number;
}

export interface ImageResponse {
  url?: string;
  base64?: string;
  provider: string;
  model: string;
  revisedPrompt?: string;
}

export interface TranscriptionResponse {
  text: string;
  provider: string;
  model: string;
  language?: string;
  duration?: number;
}

export interface TTSResponse {
  audio: Buffer;
  provider: string;
  model: string;
  voice: string;
}

// ============================================
// VOICE ASSIGNMENTS BY AGENT GENDER
// ============================================

export const AGENT_VOICE_MAP: Record<string, TTSConfig['voice']> = {
  // Female Voices
  'julie-girlfriend': 'nova', // Warm, friendly female
  'drama-queen': 'shimmer', // Dramatic, expressive female
  'emma-emotional': 'nova', // Empathetic female
  'mrs-boss': 'alloy', // Professional, authoritative female

  // Male Voices
  einstein: 'onyx', // Deep, thoughtful male
  'tech-wizard': 'echo', // Tech-savvy male
  'fitness-guru': 'fable', // Energetic male
  'chess-player': 'onyx', // Strategic male
  'knight-logic': 'echo', // Tactical male
  'comedy-king': 'fable', // Funny, expressive male
  'rook-jokey': 'echo', // Witty male
  'lazy-pawn': 'alloy', // Casual male
  'chef-biew': 'fable', // Passionate male
  'professor-astrology': 'onyx', // Wise male
  'travel-buddy': 'echo', // Adventurous male
  'ben-sega': 'onyx', // Professional male

  // Default
  default: 'alloy',
};

// ============================================
// MULTIMODAL AI SERVICE CLASS
// ============================================

export class MultiModalAIService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private mistral: Mistral | null = null;
  private cohere: CohereClient | null = null;
  private xaiApiKey: string | null = null;

  // External API keys
  private nasaApiKey: string | null = null;
  private newsApiKey: string | null = null;
  private alphaVantageKey: string | null = null;
  private shodanKey: string | null = null;
  private pineconeKey: string | null = null;
  private elevenLabsKey: string | null = null;

  constructor() {
    this.initializeClients();
  }

  private initializeClients() {
    // AI Providers - Priority order: Gemini > OpenAI > Mistral > Anthropic > Cohere

    // 1. Gemini (PRIMARY)
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('✅ Gemini initialized (PRIMARY)');
    }

    // 2. OpenAI (SECONDARY)
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log('✅ OpenAI initialized (SECONDARY)');
    }

    // 3. Mistral (TERTIARY)
    if (process.env.MISTRAL_API_KEY) {
      this.mistral = new Mistral({
        apiKey: process.env.MISTRAL_API_KEY,
      });
      console.log('✅ Mistral initialized (TERTIARY)');
    }

    // 4. Anthropic (QUATERNARY)
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      console.log('✅ Anthropic initialized (QUATERNARY)');
    }

    // 5. Cohere (FALLBACK)
    if (process.env.COHERE_API_KEY) {
      this.cohere = new CohereClient({
        token: process.env.COHERE_API_KEY,
      });
      console.log('✅ Cohere initialized (FALLBACK)');
    }

    // xAI / Grok provider (optional, used when configured)
    if (process.env.XAI_API_KEY) {
      this.xaiApiKey = process.env.XAI_API_KEY;
      console.log('✅ xAI (Grok) initialized');
    }

    // External APIs
    this.nasaApiKey = process.env.NASA_API_KEY || null;
    this.newsApiKey = process.env.NEWS_API_KEY || null;
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || null;
    this.shodanKey = process.env.SHODAN_API_KEY || null;
    this.pineconeKey = process.env.PINECONE_API_KEY || null;
    this.elevenLabsKey = process.env.ELEVENLABS_API_KEY || null;

    if (this.nasaApiKey) console.log('✅ NASA API initialized');
    if (this.newsApiKey) console.log('✅ News API initialized');
    if (this.alphaVantageKey) console.log('✅ Alpha Vantage API initialized');
    if (this.shodanKey) console.log('✅ Shodan API initialized');
    if (this.pineconeKey) console.log('✅ Pinecone API initialized');
    if (this.elevenLabsKey) console.log('✅ ElevenLabs API initialized');
  }

  // ============================================
  // 1. CHAT / REASONING MODELS
  // ============================================

  async getChatResponse(
    message: string,
    agentId: string,
    config?: Partial<ChatModelConfig>
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    const personality = getAgentPersonalityConfig(agentId);
    const systemPrompt = buildAgentSystemMessage(agentId, '');

    const defaultConfig: ChatModelConfig = {
      provider: 'auto', // Auto-fallback with priority
      model: undefined,
      temperature: personality.temperature,
      maxTokens: 2000,
      topP: personality.topP,
      ...config,
    };

    // Auto provider selection with fallback
    const provider =
      defaultConfig.provider === 'auto'
        ? this.selectBestProvider()
        : defaultConfig.provider;

    try {
      switch (provider) {
        case 'gemini':
          return await this.getChatGemini(
            message,
            systemPrompt,
            defaultConfig,
            startTime
          );

        case 'openai':
          return await this.getChatOpenAI(
            message,
            systemPrompt,
            defaultConfig,
            startTime
          );

        case 'mistral':
          return await this.getChatMistral(
            message,
            systemPrompt,
            defaultConfig,
            startTime
          );

        case 'anthropic':
          return await this.getChatAnthropic(
            message,
            systemPrompt,
            defaultConfig,
            startTime
          );

        case 'cohere':
          return await this.getChatCohere(
            message,
            systemPrompt,
            defaultConfig,
            startTime
          );

        case 'xai':
          return await this.getChatXAI(
            message,
            systemPrompt,
            defaultConfig,
            startTime
          );

        default:
          throw new Error(`No AI provider available`);
      }
    } catch (error) {
      console.error(`${provider} failed, trying fallback...`, error);

      // Try fallback providers
      return await this.getChatWithFallback(
        message,
        agentId,
        provider,
        startTime
      );
    }
  }

  private selectBestProvider():
    | 'gemini'
    | 'openai'
    | 'mistral'
    | 'anthropic'
    | 'cohere'
    | 'xai' {
    // Priority: Gemini > OpenAI > Mistral > Anthropic > xAI > Cohere
    if (this.gemini) return 'gemini';
    if (this.openai) return 'openai';
    if (this.mistral) return 'mistral';
    if (this.anthropic) return 'anthropic';
    if (this.xaiApiKey) return 'xai';
    if (this.cohere) return 'cohere';
    throw new Error('No AI provider available');
  }

  private async getChatWithFallback(
    message: string,
    agentId: string,
    failedProvider: string,
    startTime: number
  ): Promise<ChatResponse> {
    const systemPrompt = buildAgentSystemMessage(agentId, '');
    const personality = getAgentPersonalityConfig(agentId);
    const config: ChatModelConfig = {
      provider: 'auto',
      temperature: personality.temperature,
      maxTokens: 2000,
      topP: personality.topP,
    };

    const providers = [
      'gemini',
      'openai',
      'mistral',
      'anthropic',
      'xai',
      'cohere',
    ];

    for (const provider of providers) {
      if (provider === failedProvider) continue;

      try {
        switch (provider) {
          case 'gemini':
            if (this.gemini)
              return await this.getChatGemini(
                message,
                systemPrompt,
                config,
                startTime
              );
            break;
          case 'openai':
            if (this.openai)
              return await this.getChatOpenAI(
                message,
                systemPrompt,
                config,
                startTime
              );
            break;
          case 'mistral':
            if (this.mistral)
              return await this.getChatMistral(
                message,
                systemPrompt,
                config,
                startTime
              );
            break;
          case 'anthropic':
            if (this.anthropic)
              return await this.getChatAnthropic(
                message,
                systemPrompt,
                config,
                startTime
              );
            break;
          case 'xai':
            if (this.xaiApiKey)
              return await this.getChatXAI(
                message,
                systemPrompt,
                config,
                startTime
              );
            break;
          case 'cohere':
            if (this.cohere)
              return await this.getChatCohere(
                message,
                systemPrompt,
                config,
                startTime
              );
            break;
        }
      } catch (error) {
        console.error(`Fallback ${provider} also failed:`, error);
        continue;
      }
    }

    throw new Error('All AI providers failed');
  }

  private async getChatGemini(
    message: string,
    systemPrompt: string,
    config: ChatModelConfig,
    startTime: number
  ): Promise<ChatResponse> {
    if (!this.gemini) throw new Error('Gemini not initialized');

    const model = this.gemini.getGenerativeModel({
      model: config.model || 'gemini-2.0-flash-exp',
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: message }] }],
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
        topP: config.topP,
      },
    });

    return {
      text: result.response.text(),
      provider: 'gemini',
      model: config.model || 'gemini-2.0-flash',
      latency: Date.now() - startTime,
    };
  }

  private async getChatOpenAI(
    message: string,
    systemPrompt: string,
    config: ChatModelConfig,
    startTime: number
  ): Promise<ChatResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    const response = await this.openai.chat.completions.create({
      model: config.model || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      top_p: config.topP,
    });

    return {
      text: response.choices[0]?.message?.content || '',
      provider: 'openai',
      model: config.model || 'gpt-4o',
      tokensUsed: response.usage?.total_tokens,
      latency: Date.now() - startTime,
    };
  }

  private async getChatMistral(
    message: string,
    systemPrompt: string,
    config: ChatModelConfig,
    startTime: number
  ): Promise<ChatResponse> {
    if (!this.mistral) throw new Error('Mistral not initialized');

    const response = await this.mistral.chat.complete({
      model: config.model || 'mistral-large-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      topP: config.topP,
    });

    return {
      text: response.choices?.[0]?.message?.content || '',
      provider: 'mistral',
      model: config.model || 'mistral-large',
      tokensUsed: response.usage?.totalTokens,
      latency: Date.now() - startTime,
    };
  }

  private async getChatAnthropic(
    message: string,
    systemPrompt: string,
    config: ChatModelConfig,
    startTime: number
  ): Promise<ChatResponse> {
    if (!this.anthropic) throw new Error('Anthropic not initialized');

    const response = await this.anthropic.messages.create({
      model: config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: config.maxTokens || 2000,
      temperature: config.temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    return {
      text: textContent && 'text' in textContent ? textContent.text : '',
      provider: 'anthropic',
      model: config.model || 'claude-3-5-sonnet',
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      latency: Date.now() - startTime,
    };
  }

  private async getChatCohere(
    message: string,
    systemPrompt: string,
    config: ChatModelConfig,
    startTime: number
  ): Promise<ChatResponse> {
    if (!this.cohere) throw new Error('Cohere not initialized');

    const response = await this.cohere.chat({
      model: config.model || 'command-r-plus',
      message: message,
      preamble: systemPrompt,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    });

    return {
      text: response.text || '',
      provider: 'cohere',
      model: config.model || 'command-r-plus',
      latency: Date.now() - startTime,
    };
  }

  /**
   * Chat with xAI (Grok) via HTTP API
   */
  private async getChatXAI(
    message: string,
    systemPrompt: string,
    config: ChatModelConfig,
    startTime: number
  ): Promise<ChatResponse> {
    if (!this.xaiApiKey) throw new Error('xAI not initialized');

    const model = config.model || 'grok-2';

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.xaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI API error response:', errorText);
      throw new Error(`xAI API error: ${errorText}`);
    }

    const data: any = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const latency = Date.now() - startTime;

    return {
      text,
      provider: 'xai',
      model: data.model || model,
      tokensUsed: data.usage?.total_tokens,
      latency,
    };
  }

  // ============================================
  // 2. EMBEDDING MODELS
  // ============================================

  async getEmbedding(
    text: string,
    config?: Partial<EmbeddingConfig>
  ): Promise<EmbeddingResponse> {
    const defaultConfig: EmbeddingConfig = {
      provider: 'auto',
      model: 'text-embedding-3-small',
      ...config,
    };

    const provider =
      defaultConfig.provider === 'auto'
        ? this.selectBestEmbeddingProvider()
        : defaultConfig.provider;

    try {
      switch (provider) {
        case 'gemini':
          return await this.getEmbeddingGemini(text, defaultConfig);

        case 'openai':
          return await this.getEmbeddingOpenAI(text, defaultConfig);

        case 'cohere':
          return await this.getEmbeddingCohere(text, defaultConfig);

        default:
          throw new Error(`Unsupported embedding provider: ${provider}`);
      }
    } catch (error) {
      console.error('Embedding error:', error);
      throw error;
    }
  }

  private selectBestEmbeddingProvider(): 'gemini' | 'openai' | 'cohere' {
    if (this.gemini) return 'gemini';
    if (this.openai) return 'openai';
    if (this.cohere) return 'cohere';
    throw new Error('No embedding provider available');
  }

  private async getEmbeddingGemini(
    text: string,
    config: EmbeddingConfig
  ): Promise<EmbeddingResponse> {
    if (!this.gemini) throw new Error('Gemini not initialized');

    const model = this.gemini.getGenerativeModel({
      model: 'text-embedding-004',
    });

    const result = await model.embedContent(text);

    return {
      embedding: result.embedding.values,
      provider: 'gemini',
      model: 'text-embedding-004',
      dimensions: result.embedding.values.length,
    };
  }

  private async getEmbeddingOpenAI(
    text: string,
    config: EmbeddingConfig
  ): Promise<EmbeddingResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    const response = await this.openai.embeddings.create({
      model: config.model || 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    return {
      embedding: response.data[0].embedding,
      provider: 'openai',
      model: config.model || 'text-embedding-3-small',
      dimensions: response.data[0].embedding.length,
    };
  }

  private async getEmbeddingCohere(
    text: string,
    config: EmbeddingConfig
  ): Promise<EmbeddingResponse> {
    if (!this.cohere) throw new Error('Cohere not initialized');

    const response = await this.cohere.embed({
      texts: [text],
      model: config.model || 'embed-english-v3.0',
      inputType: 'search_document',
    });

    return {
      embedding: response.embeddings[0],
      provider: 'cohere',
      model: config.model || 'embed-english-v3.0',
      dimensions: response.embeddings[0].length,
    };
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
      ...config,
    };

    try {
      switch (defaultConfig.provider) {
        case 'openai':
          return await this.generateImageOpenAI(prompt, defaultConfig);

        default:
          throw new Error(
            `Unsupported image provider: ${defaultConfig.provider}`
          );
      }
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  }

  private async generateImageOpenAI(
    prompt: string,
    config: ImageGenConfig
  ): Promise<ImageResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    const response = await this.openai.images.generate({
      model: config.model,
      prompt: prompt,
      n: 1,
      size: config.size,
      quality: config.quality,
      style: config.style,
      response_format: 'url',
    });

    return {
      url: response.data[0].url,
      provider: 'openai',
      model: config.model,
      revisedPrompt: response.data[0].revised_prompt,
    };
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
      ...config,
    };

    try {
      switch (defaultConfig.provider) {
        case 'openai':
          return await this.transcribeOpenAI(audioFile, defaultConfig);

        default:
          throw new Error(
            `Unsupported STT provider: ${defaultConfig.provider}`
          );
      }
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  private async transcribeOpenAI(
    audioFile: File | Buffer,
    config: STTConfig
  ): Promise<TranscriptionResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    const response = await this.openai.audio.transcriptions.create({
      file: audioFile as any,
      model: config.model,
      language: config.language,
      temperature: config.temperature,
    });

    return {
      text: response.text,
      provider: 'openai',
      model: config.model,
      language: config.language,
    };
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
    const agentVoice = AGENT_VOICE_MAP[agentId] || AGENT_VOICE_MAP['default'];

    const defaultConfig: TTSConfig = {
      provider: 'openai',
      model: 'tts-1',
      voice: agentVoice,
      speed: 1.0,
      ...config,
    };

    try {
      switch (defaultConfig.provider) {
        case 'openai':
          return await this.generateSpeechOpenAI(text, defaultConfig);

        default:
          throw new Error(
            `Unsupported TTS provider: ${defaultConfig.provider}`
          );
      }
    } catch (error) {
      console.error('TTS error:', error);
      throw error;
    }
  }

  private async generateSpeechOpenAI(
    text: string,
    config: TTSConfig
  ): Promise<TTSResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    const response = await this.openai.audio.speech.create({
      model: config.model,
      voice: config.voice,
      input: text,
      speed: config.speed,
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    return {
      audio: buffer,
      provider: 'openai',
      model: config.model,
      voice: config.voice,
    };
  }

  // ============================================
  // BATCH OPERATIONS
  // ============================================

  async batchGetEmbeddings(
    texts: string[],
    config?: Partial<EmbeddingConfig>
  ): Promise<EmbeddingResponse[]> {
    return Promise.all(texts.map((text) => this.getEmbedding(text, config)));
  }

  async chatWithMemory(
    message: string,
    agentId: string,
    previousMessages: ChatMessage[],
    config?: Partial<ChatModelConfig>
  ): Promise<ChatResponse> {
    // For future: integrate with vector store for semantic memory
    return this.getChatResponse(message, agentId, config);
  }

  // ============================================
  // EXTERNAL APIs
  // ============================================

  /**
   * NASA API - Get astronomy picture of the day, Mars rover photos, etc.
   */
  async getNASAData(endpoint: string = 'planetary/apod'): Promise<any> {
    if (!this.nasaApiKey) throw new Error('NASA API key not configured');

    const response = await fetch(
      `https://api.nasa.gov/${endpoint}?api_key=${this.nasaApiKey}`
    );
    return await response.json();
  }

  /**
   * News API - Get latest news articles
   */
  async getNews(query: string, language: string = 'en'): Promise<any> {
    if (!this.newsApiKey) throw new Error('News API key not configured');

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        query
      )}&language=${language}&apiKey=${this.newsApiKey}`
    );
    return await response.json();
  }

  /**
   * Alpha Vantage - Get stock market data, crypto prices, forex
   */
  async getStockData(symbol: string, interval: string = 'daily'): Promise<any> {
    if (!this.alphaVantageKey)
      throw new Error('Alpha Vantage API key not configured');

    const functionMap: Record<string, string> = {
      daily: 'TIME_SERIES_DAILY',
      intraday: 'TIME_SERIES_INTRADAY',
      weekly: 'TIME_SERIES_WEEKLY',
      monthly: 'TIME_SERIES_MONTHLY',
    };

    const response = await fetch(
      `https://www.alphavantage.co/query?function=${
        functionMap[interval] || functionMap.daily
      }&symbol=${symbol}&apikey=${this.alphaVantageKey}`
    );
    return await response.json();
  }

  /**
   * Shodan - Security/network information
   */
  async getShodanData(query: string): Promise<any> {
    if (!this.shodanKey) throw new Error('Shodan API key not configured');

    const response = await fetch(
      `https://api.shodan.io/shodan/host/search?key=${
        this.shodanKey
      }&query=${encodeURIComponent(query)}`
    );
    return await response.json();
  }

  /**
   * Get available API status
   */
  getAPIStatus(): {
    ai: Record<string, boolean>;
    external: Record<string, boolean>;
  } {
    return {
      ai: {
        gemini: !!this.gemini,
        openai: !!this.openai,
        mistral: !!this.mistral,
        anthropic: !!this.anthropic,
        cohere: !!this.cohere,
      },
      external: {
        nasa: !!this.nasaApiKey,
        news: !!this.newsApiKey,
        alphaVantage: !!this.alphaVantageKey,
        shodan: !!this.shodanKey,
        pinecone: !!this.pineconeKey,
        elevenLabs: !!this.elevenLabsKey,
      },
    };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const multiModalAI = new MultiModalAIService();
