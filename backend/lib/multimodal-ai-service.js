import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Mistral } from "@mistralai/mistralai";
import { CohereClient } from "cohere-ai";
import {
  getAgentPersonalityConfig,
  buildAgentSystemMessage
} from "./personality-integration.js";
const AGENT_VOICE_MAP = {
  // Female Voices
  "julie-girlfriend": "nova",
  // Warm, friendly female
  "drama-queen": "shimmer",
  // Dramatic, expressive female
  "emma-emotional": "nova",
  // Empathetic female
  "mrs-boss": "alloy",
  // Professional, authoritative female
  // Male Voices
  einstein: "onyx",
  // Deep, thoughtful male
  "tech-wizard": "echo",
  // Tech-savvy male
  "fitness-guru": "fable",
  // Energetic male
  "chess-player": "onyx",
  // Strategic male
  "knight-logic": "echo",
  // Tactical male
  "comedy-king": "fable",
  // Funny, expressive male
  "rook-jokey": "echo",
  // Witty male
  "lazy-pawn": "alloy",
  // Casual male
  "chef-biew": "fable",
  // Passionate male
  "professor-astrology": "onyx",
  // Wise male
  "travel-buddy": "echo",
  // Adventurous male
  "ben-sega": "onyx",
  // Professional male
  // Default
  default: "alloy"
};
class MultiModalAIService {
  openai = null;
  anthropic = null;
  gemini = null;
  mistral = null;
  cohere = null;
  xaiApiKey = null;
  // External API keys
  nasaApiKey = null;
  newsApiKey = null;
  alphaVantageKey = null;
  shodanKey = null;
  pineconeKey = null;
  elevenLabsKey = null;
  constructor() {
    this.initializeClients();
  }
  initializeClients() {
    if (process.env.GEMINI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log("\u2705 Gemini initialized (PRIMARY)");
    }
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      console.log("\u2705 OpenAI initialized (SECONDARY)");
    }
    if (process.env.MISTRAL_API_KEY) {
      this.mistral = new Mistral({
        apiKey: process.env.MISTRAL_API_KEY
      });
      console.log("\u2705 Mistral initialized (TERTIARY)");
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
      console.log("\u2705 Anthropic initialized (QUATERNARY)");
    }
    if (process.env.COHERE_API_KEY) {
      this.cohere = new CohereClient({
        token: process.env.COHERE_API_KEY
      });
      console.log("\u2705 Cohere initialized (FALLBACK)");
    }
    if (process.env.XAI_API_KEY) {
      this.xaiApiKey = process.env.XAI_API_KEY;
      console.log("\u2705 xAI (Grok) initialized");
    }
    this.nasaApiKey = process.env.NASA_API_KEY || null;
    this.newsApiKey = process.env.NEWS_API_KEY || null;
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY || null;
    this.shodanKey = process.env.SHODAN_API_KEY || null;
    this.pineconeKey = process.env.PINECONE_API_KEY || null;
    this.elevenLabsKey = process.env.ELEVENLABS_API_KEY || null;
    if (this.nasaApiKey) console.log("\u2705 NASA API initialized");
    if (this.newsApiKey) console.log("\u2705 News API initialized");
    if (this.alphaVantageKey) console.log("\u2705 Alpha Vantage API initialized");
    if (this.shodanKey) console.log("\u2705 Shodan API initialized");
    if (this.pineconeKey) console.log("\u2705 Pinecone API initialized");
    if (this.elevenLabsKey) console.log("\u2705 ElevenLabs API initialized");
  }
  // ============================================
  // 1. CHAT / REASONING MODELS
  // ============================================
  async getChatResponse(message, agentId, config) {
    const startTime = Date.now();
    const personality = getAgentPersonalityConfig(agentId);
    const systemPrompt = buildAgentSystemMessage(agentId, "");
    const defaultConfig = {
      provider: "auto",
      // Auto-fallback with priority
      model: void 0,
      temperature: personality.temperature,
      maxTokens: 2e3,
      topP: personality.topP,
      ...config
    };
    const provider = defaultConfig.provider === "auto" ? this.selectBestProvider() : defaultConfig.provider;
    try {
      switch (provider) {
        case "gemini":
          return await this.getChatGemini(
            message,
            systemPrompt,
            defaultConfig,
            startTime
          );
        case "openai":
          return await this.getChatOpenAI(
            message,
            systemPrompt,
            defaultConfig,
            startTime
          );
        case "mistral":
          return await this.getChatMistral(
            message,
            systemPrompt,
            defaultConfig,
            startTime
          );
        case "anthropic":
          return await this.getChatAnthropic(
            message,
            systemPrompt,
            defaultConfig,
            startTime
          );
        case "cohere":
          return await this.getChatCohere(
            message,
            systemPrompt,
            defaultConfig,
            startTime
          );
        case "xai":
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
      return await this.getChatWithFallback(
        message,
        agentId,
        provider,
        startTime
      );
    }
  }
  selectBestProvider() {
    if (this.gemini) return "gemini";
    if (this.openai) return "openai";
    if (this.mistral) return "mistral";
    if (this.anthropic) return "anthropic";
    if (this.xaiApiKey) return "xai";
    if (this.cohere) return "cohere";
    throw new Error("No AI provider available");
  }
  async getChatWithFallback(message, agentId, failedProvider, startTime) {
    const systemPrompt = buildAgentSystemMessage(agentId, "");
    const personality = getAgentPersonalityConfig(agentId);
    const config = {
      provider: "auto",
      temperature: personality.temperature,
      maxTokens: 2e3,
      topP: personality.topP
    };
    const providers = [
      "gemini",
      "openai",
      "mistral",
      "anthropic",
      "xai",
      "cohere"
    ];
    for (const provider of providers) {
      if (provider === failedProvider) continue;
      try {
        switch (provider) {
          case "gemini":
            if (this.gemini)
              return await this.getChatGemini(
                message,
                systemPrompt,
                config,
                startTime
              );
            break;
          case "openai":
            if (this.openai)
              return await this.getChatOpenAI(
                message,
                systemPrompt,
                config,
                startTime
              );
            break;
          case "mistral":
            if (this.mistral)
              return await this.getChatMistral(
                message,
                systemPrompt,
                config,
                startTime
              );
            break;
          case "anthropic":
            if (this.anthropic)
              return await this.getChatAnthropic(
                message,
                systemPrompt,
                config,
                startTime
              );
            break;
          case "xai":
            if (this.xaiApiKey)
              return await this.getChatXAI(
                message,
                systemPrompt,
                config,
                startTime
              );
            break;
          case "cohere":
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
    throw new Error("All AI providers failed");
  }
  async getChatGemini(message, systemPrompt, config, startTime) {
    if (!this.gemini) throw new Error("Gemini not initialized");
    const model = this.gemini.getGenerativeModel({
      model: config.model || "gemini-2.0-flash-exp",
      systemInstruction: systemPrompt
    });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
        topP: config.topP
      }
    });
    return {
      text: result.response.text(),
      provider: "gemini",
      model: config.model || "gemini-2.0-flash",
      latency: Date.now() - startTime
    };
  }
  async getChatOpenAI(message, systemPrompt, config, startTime) {
    if (!this.openai) throw new Error("OpenAI not initialized");
    const response = await this.openai.chat.completions.create({
      model: config.model || "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      top_p: config.topP
    });
    return {
      text: response.choices[0]?.message?.content || "",
      provider: "openai",
      model: config.model || "gpt-4o",
      tokensUsed: response.usage?.total_tokens,
      latency: Date.now() - startTime
    };
  }
  async getChatMistral(message, systemPrompt, config, startTime) {
    if (!this.mistral) throw new Error("Mistral not initialized");
    const response = await this.mistral.chat.complete({
      model: config.model || "mistral-large-latest",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      topP: config.topP
    });
    return {
      text: response.choices?.[0]?.message?.content || "",
      provider: "mistral",
      model: config.model || "mistral-large",
      tokensUsed: response.usage?.totalTokens,
      latency: Date.now() - startTime
    };
  }
  async getChatAnthropic(message, systemPrompt, config, startTime) {
    if (!this.anthropic) throw new Error("Anthropic not initialized");
    const response = await this.anthropic.messages.create({
      model: config.model || "claude-3-5-sonnet-20241022",
      max_tokens: config.maxTokens || 2e3,
      temperature: config.temperature,
      system: systemPrompt,
      messages: [{ role: "user", content: message }]
    });
    const textContent = response.content.find((c) => c.type === "text");
    return {
      text: textContent && "text" in textContent ? textContent.text : "",
      provider: "anthropic",
      model: config.model || "claude-3-5-sonnet",
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      latency: Date.now() - startTime
    };
  }
  async getChatCohere(message, systemPrompt, config, startTime) {
    if (!this.cohere) throw new Error("Cohere not initialized");
    const response = await this.cohere.chat({
      model: config.model || "command-r-plus",
      message,
      preamble: systemPrompt,
      temperature: config.temperature,
      maxTokens: config.maxTokens
    });
    return {
      text: response.text || "",
      provider: "cohere",
      model: config.model || "command-r-plus",
      latency: Date.now() - startTime
    };
  }
  /**
   * Chat with xAI (Grok) via HTTP API
   */
  async getChatXAI(message, systemPrompt, config, startTime) {
    if (!this.xaiApiKey) throw new Error("xAI not initialized");
    const model = config.model || "grok-2";
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.xaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 2e3
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("xAI API error response:", errorText);
      throw new Error(`xAI API error: ${errorText}`);
    }
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const latency = Date.now() - startTime;
    return {
      text,
      provider: "xai",
      model: data.model || model,
      tokensUsed: data.usage?.total_tokens,
      latency
    };
  }
  // ============================================
  // 2. EMBEDDING MODELS
  // ============================================
  async getEmbedding(text, config) {
    const defaultConfig = {
      provider: "auto",
      model: "text-embedding-3-small",
      ...config
    };
    const provider = defaultConfig.provider === "auto" ? this.selectBestEmbeddingProvider() : defaultConfig.provider;
    try {
      switch (provider) {
        case "gemini":
          return await this.getEmbeddingGemini(text, defaultConfig);
        case "openai":
          return await this.getEmbeddingOpenAI(text, defaultConfig);
        case "cohere":
          return await this.getEmbeddingCohere(text, defaultConfig);
        default:
          throw new Error(`Unsupported embedding provider: ${provider}`);
      }
    } catch (error) {
      console.error("Embedding error:", error);
      throw error;
    }
  }
  selectBestEmbeddingProvider() {
    if (this.gemini) return "gemini";
    if (this.openai) return "openai";
    if (this.cohere) return "cohere";
    throw new Error("No embedding provider available");
  }
  async getEmbeddingGemini(text, config) {
    if (!this.gemini) throw new Error("Gemini not initialized");
    const model = this.gemini.getGenerativeModel({
      model: "text-embedding-004"
    });
    const result = await model.embedContent(text);
    return {
      embedding: result.embedding.values,
      provider: "gemini",
      model: "text-embedding-004",
      dimensions: result.embedding.values.length
    };
  }
  async getEmbeddingOpenAI(text, config) {
    if (!this.openai) throw new Error("OpenAI not initialized");
    const response = await this.openai.embeddings.create({
      model: config.model || "text-embedding-3-small",
      input: text,
      encoding_format: "float"
    });
    return {
      embedding: response.data[0].embedding,
      provider: "openai",
      model: config.model || "text-embedding-3-small",
      dimensions: response.data[0].embedding.length
    };
  }
  async getEmbeddingCohere(text, config) {
    if (!this.cohere) throw new Error("Cohere not initialized");
    const response = await this.cohere.embed({
      texts: [text],
      model: config.model || "embed-english-v3.0",
      inputType: "search_document"
    });
    return {
      embedding: response.embeddings[0],
      provider: "cohere",
      model: config.model || "embed-english-v3.0",
      dimensions: response.embeddings[0].length
    };
  }
  // ============================================
  // 3. IMAGE GENERATION MODELS
  // ============================================
  async generateImage(prompt, config) {
    const defaultConfig = {
      provider: "openai",
      model: "dall-e-3",
      size: "1024x1024",
      quality: "standard",
      style: "vivid",
      ...config
    };
    try {
      switch (defaultConfig.provider) {
        case "openai":
          return await this.generateImageOpenAI(prompt, defaultConfig);
        default:
          throw new Error(
            `Unsupported image provider: ${defaultConfig.provider}`
          );
      }
    } catch (error) {
      console.error("Image generation error:", error);
      throw error;
    }
  }
  async generateImageOpenAI(prompt, config) {
    if (!this.openai) throw new Error("OpenAI not initialized");
    const response = await this.openai.images.generate({
      model: config.model,
      prompt,
      n: 1,
      size: config.size,
      quality: config.quality,
      style: config.style,
      response_format: "url"
    });
    return {
      url: response.data[0].url,
      provider: "openai",
      model: config.model,
      revisedPrompt: response.data[0].revised_prompt
    };
  }
  // ============================================
  // 4. SPEECH-TO-TEXT MODELS
  // ============================================
  async transcribeAudio(audioFile, config) {
    const defaultConfig = {
      provider: "openai",
      model: "whisper-1",
      language: "en",
      temperature: 0,
      ...config
    };
    try {
      switch (defaultConfig.provider) {
        case "openai":
          return await this.transcribeOpenAI(audioFile, defaultConfig);
        default:
          throw new Error(
            `Unsupported STT provider: ${defaultConfig.provider}`
          );
      }
    } catch (error) {
      console.error("Transcription error:", error);
      throw error;
    }
  }
  async transcribeOpenAI(audioFile, config) {
    if (!this.openai) throw new Error("OpenAI not initialized");
    const response = await this.openai.audio.transcriptions.create({
      file: audioFile,
      model: config.model,
      language: config.language,
      temperature: config.temperature
    });
    return {
      text: response.text,
      provider: "openai",
      model: config.model,
      language: config.language
    };
  }
  // ============================================
  // 5. TEXT-TO-SPEECH MODELS
  // ============================================
  async generateSpeech(text, agentId, config) {
    const agentVoice = AGENT_VOICE_MAP[agentId] || AGENT_VOICE_MAP["default"];
    const defaultConfig = {
      provider: "openai",
      model: "tts-1",
      voice: agentVoice,
      speed: 1,
      ...config
    };
    try {
      switch (defaultConfig.provider) {
        case "openai":
          return await this.generateSpeechOpenAI(text, defaultConfig);
        default:
          throw new Error(
            `Unsupported TTS provider: ${defaultConfig.provider}`
          );
      }
    } catch (error) {
      console.error("TTS error:", error);
      throw error;
    }
  }
  async generateSpeechOpenAI(text, config) {
    if (!this.openai) throw new Error("OpenAI not initialized");
    const response = await this.openai.audio.speech.create({
      model: config.model,
      voice: config.voice,
      input: text,
      speed: config.speed
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    return {
      audio: buffer,
      provider: "openai",
      model: config.model,
      voice: config.voice
    };
  }
  // ============================================
  // BATCH OPERATIONS
  // ============================================
  async batchGetEmbeddings(texts, config) {
    return Promise.all(texts.map((text) => this.getEmbedding(text, config)));
  }
  async chatWithMemory(message, agentId, previousMessages, config) {
    return this.getChatResponse(message, agentId, config);
  }
  // ============================================
  // EXTERNAL APIs
  // ============================================
  /**
   * NASA API - Get astronomy picture of the day, Mars rover photos, etc.
   */
  async getNASAData(endpoint = "planetary/apod") {
    if (!this.nasaApiKey) throw new Error("NASA API key not configured");
    const response = await fetch(
      `https://api.nasa.gov/${endpoint}?api_key=${this.nasaApiKey}`
    );
    return await response.json();
  }
  /**
   * News API - Get latest news articles
   */
  async getNews(query, language = "en") {
    if (!this.newsApiKey) throw new Error("News API key not configured");
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
  async getStockData(symbol, interval = "daily") {
    if (!this.alphaVantageKey)
      throw new Error("Alpha Vantage API key not configured");
    const functionMap = {
      daily: "TIME_SERIES_DAILY",
      intraday: "TIME_SERIES_INTRADAY",
      weekly: "TIME_SERIES_WEEKLY",
      monthly: "TIME_SERIES_MONTHLY"
    };
    const response = await fetch(
      `https://www.alphavantage.co/query?function=${functionMap[interval] || functionMap.daily}&symbol=${symbol}&apikey=${this.alphaVantageKey}`
    );
    return await response.json();
  }
  /**
   * Shodan - Security/network information
   */
  async getShodanData(query) {
    if (!this.shodanKey) throw new Error("Shodan API key not configured");
    const response = await fetch(
      `https://api.shodan.io/shodan/host/search?key=${this.shodanKey}&query=${encodeURIComponent(query)}`
    );
    return await response.json();
  }
  /**
   * Get available API status
   */
  getAPIStatus() {
    return {
      ai: {
        gemini: !!this.gemini,
        openai: !!this.openai,
        mistral: !!this.mistral,
        anthropic: !!this.anthropic,
        cohere: !!this.cohere
      },
      external: {
        nasa: !!this.nasaApiKey,
        news: !!this.newsApiKey,
        alphaVantage: !!this.alphaVantageKey,
        shodan: !!this.shodanKey,
        pinecone: !!this.pineconeKey,
        elevenLabs: !!this.elevenLabsKey
      }
    };
  }
}
const multiModalAI = new MultiModalAIService();
export {
  AGENT_VOICE_MAP,
  MultiModalAIService,
  multiModalAI
};
