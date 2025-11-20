/**
 * ========================================
 * UNIVERSAL MULTI-PROVIDER AI INTEGRATION
 * ========================================
 * 
 * Priority Order: Gemini → OpenAI → Mistral → Anthropic → Cohere
 * 
 * ALL MODELS INTEGRATED:
 * 
 * 🟢 GEMINI (Primary):
 *   - gemini-2.5-flash (multimodal, fast)
 *   - gemini-2.0-flash-exp (experimental)
 *   - gemini-1.5-pro (advanced reasoning)
 *   - gemini-1.5-flash (balanced)
 *   - text-embedding-004 (embeddings)
 * 
 * 🔵 OPENAI (Secondary):
 *   Chat: gpt-5, gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo
 *   Embeddings: text-embedding-3-large, text-embedding-3-small
 *   Images: dall-e-3, dall-e-2
 *   Audio: whisper-1, tts-1-hd, tts-1
 * 
 * 🟣 MISTRAL (Third):
 *   - mistral-large-latest (most capable)
 *   - mistral-medium-latest
 *   - mistral-small-latest
 *   - codestral-latest (code specialist)
 *   - mistral-embed (embeddings)
 * 
 * 🟠 ANTHROPIC (Fourth):
 *   - claude-3-5-sonnet-20241022 (latest)
 *   - claude-3-opus-20240229
 *   - claude-3-sonnet-20240229
 *   - claude-3-haiku-20240307
 * 
 * 🟡 COHERE (Fifth):
 *   - command-r-plus (best quality)
 *   - command-r (fast)
 *   - command-light
 *   - embed-english-v3.0, embed-multilingual-v3.0
 * 
 * ========================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { Mistral } from '@mistralai/mistralai'
import Anthropic from '@anthropic-ai/sdk'
import { CohereClient } from 'cohere-ai'
import { rateLimit } from '@/lib/rate-limit'
import { validateInput } from '@/lib/security-validation'

// ========================================
// INITIALIZE ALL PROVIDERS
// ========================================

// 1. GEMINI (Primary)
const gemini = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

// 2. OPENAI (Secondary)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 2,
  timeout: 60000
}) : null

// 3. MISTRAL (Third)
const mistral = process.env.MISTRAL_API_KEY ? new Mistral({
  apiKey: process.env.MISTRAL_API_KEY
}) : null

// 4. ANTHROPIC (Fourth)
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 2,
  timeout: 30000
}) : null

// 5. COHERE (Fifth)
const cohere = process.env.COHERE_API_KEY ? new CohereClient({
  token: process.env.COHERE_API_KEY
}) : null

// ========================================
// MODEL CONFIGURATIONS
// ========================================

const MODELS = {
  gemini: {
    chat: ['gemini-2.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-pro-latest', 'gemini-1.5-flash-latest'],
    embedding: ['text-embedding-004'],
    available: !!gemini
  },
  openai: {
    chat: ['gpt-5', 'gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    embedding: ['text-embedding-3-large', 'text-embedding-3-small'],
    image: ['dall-e-3', 'dall-e-2'],
    audio: {
      stt: ['whisper-1', 'gpt-4o-mini-transcribe'],
      tts: ['tts-1-hd', 'tts-1']
    },
    available: !!openai
  },
  mistral: {
    chat: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'codestral-latest'],
    embedding: ['mistral-embed'],
    available: !!mistral
  },
  anthropic: {
    chat: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    available: !!anthropic
  },
  cohere: {
    chat: ['command-nightly', 'command-light'],
    embedding: ['embed-english-v3.0', 'embed-multilingual-v3.0'],
    available: !!cohere
  }
}

// Agent voice configurations (for TTS)
const AGENT_VOICES: Record<string, {
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  gender: 'male' | 'female'
}> = {
  'ben-sega': { voice: 'onyx', gender: 'male' },
  'tech-wizard': { voice: 'fable', gender: 'male' },
  'doctor-network': { voice: 'echo', gender: 'male' },
  'data-scientist': { voice: 'nova', gender: 'female' },
  'devops-expert': { voice: 'alloy', gender: 'male' }
}

// ========================================
// MAIN API HANDLER
// ========================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { 
      action, // 'chat', 'embed', 'image', 'transcribe', 'speak'
      agentId,
      message,
      conversationHistory = [],
      model, // Specific model or auto-select
      provider, // Force specific provider or use priority
      imagePrompt,
      audioData,
      text,
      options = {}
    } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action type required (chat, embed, image, transcribe, speak)' },
        { status: 400 }
      )
    }

    // Route to appropriate handler
    switch (action) {
      case 'chat':
        return await handleChat(agentId, message, conversationHistory, model, provider, options)
      
      case 'embed':
        return await handleEmbedding(message || text, model, provider, options)
      
      case 'image':
        if (!openai) {
          return NextResponse.json({ error: 'Image generation only available via OpenAI' }, { status: 500 })
        }
        return await handleImageGeneration(imagePrompt, options)
      
      case 'transcribe':
        if (!openai) {
          return NextResponse.json({ error: 'Transcription only available via OpenAI' }, { status: 500 })
        }
        return await handleTranscription(audioData, options)
      
      case 'speak':
        if (!openai) {
          return NextResponse.json({ error: 'TTS only available via OpenAI' }, { status: 500 })
        }
        return await handleTextToSpeech(agentId, text, options)
      
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

  } catch (error) {
    console.error('Multi-provider API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// ========================================
// CHAT HANDLER (All Providers)
// Priority: Gemini → OpenAI → Mistral → Anthropic → Cohere
// ========================================

async function handleChat(
  agentId: string,
  message: string,
  conversationHistory: any[],
  model?: string,
  forceProvider?: string,
  options: any = {}
) {
  const validation = validateInput(message)
  if (!validation.isValid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const systemPrompt = options.systemPrompt || `You are a helpful AI assistant for ${agentId}.`
  
  // Try providers in priority order
  const providers = forceProvider 
    ? [forceProvider] 
    : ['gemini', 'openai', 'mistral', 'anthropic', 'cohere']

  for (const provider of providers) {
    try {
      let result
      
      switch (provider) {
        case 'gemini':
          if (!gemini) continue
          result = await callGemini(message, conversationHistory, model || 'gemini-2.5-flash', systemPrompt, options)
          break
        
        case 'openai':
          if (!openai) continue
          result = await callOpenAI(message, conversationHistory, model || 'gpt-4o-mini', systemPrompt, options)
          break
        
        case 'mistral':
          if (!mistral) continue
          result = await callMistral(message, conversationHistory, model || 'mistral-large-latest', systemPrompt, options)
          break
        
        case 'anthropic':
          if (!anthropic) continue
          result = await callAnthropic(message, conversationHistory, model || 'claude-3-5-sonnet-20241022', systemPrompt, options)
          break
        
        case 'cohere':
          if (!cohere) continue
          result = await callCohere(message, conversationHistory, model || 'command-nightly', systemPrompt, options)
          break
        
        default:
          continue
      }

      if (result) {
        return NextResponse.json({
          success: true,
          response: result.text,
          provider: provider,
          model: result.model,
          usage: result.usage
        })
      }
    } catch (error) {
      console.error(`${provider} failed:`, error)
      // Continue to next provider
    }
  }

  return NextResponse.json(
    { error: 'All AI providers failed. Please try again later.' },
    { status: 500 }
  )
}

// ========================================
// PROVIDER CALL FUNCTIONS
// ========================================

async function callGemini(message: string, history: any[], model: string, systemPrompt: string, options: any) {
  if (!gemini) return null

  const genModel = gemini.getGenerativeModel({ 
    model: model,
    systemInstruction: systemPrompt
  })

  // Build chat history
  const chatHistory = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }))

  const chat = genModel.startChat({ history: chatHistory })
  const result = await chat.sendMessage(message)
  const response = await result.response
  
  return {
    text: response.text(),
    model: model,
    usage: response.usageMetadata
  }
}

async function callOpenAI(message: string, history: any[], model: string, systemPrompt: string, options: any) {
  if (!openai) return null

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message }
  ]

  const response = await openai.chat.completions.create({
    model: model,
    messages: messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 1500,
    top_p: options.topP || 0.9
  })

  return {
    text: response.choices[0].message.content || '',
    model: response.model,
    usage: response.usage
  }
}

async function callMistral(message: string, history: any[], model: string, systemPrompt: string, options: any) {
  if (!mistral) return null

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: message }
  ]

  const response = await mistral.chat.complete({
    model: model,
    messages: messages,
    temperature: options.temperature || 0.7,
    maxTokens: options.maxTokens || 1500
  })

  return {
    text: response.choices?.[0]?.message?.content || '',
    model: model,
    usage: response.usage
  }
}

async function callAnthropic(message: string, history: any[], model: string, systemPrompt: string, options: any) {
  if (!anthropic) return null

  const response = await anthropic.messages.create({
    model: model,
    system: systemPrompt,
    messages: [
      ...history.filter(m => m.role !== 'system'),
      { role: 'user', content: message }
    ],
    max_tokens: options.maxTokens || 1500,
    temperature: options.temperature || 0.7
  })

  const textContent = response.content.find(block => block.type === 'text')
  
  return {
    text: (textContent as any)?.text || '',
    model: response.model,
    usage: response.usage
  }
}

async function callCohere(message: string, history: any[], model: string, systemPrompt: string, options: any) {
  if (!cohere) return null

  const chatHistory = history.map(msg => ({
    role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
    message: msg.content
  }))

  const response = await cohere.chat({
    model: model || 'command',
    message: message,
    chatHistory: chatHistory,
    preamble: systemPrompt,
    temperature: options.temperature || 0.7
  })

  return {
    text: response.text || '',
    model: model,
    usage: response.meta
  }
}

// ========================================
// EMBEDDING HANDLER (Multi-Provider)
// Priority: Gemini → OpenAI → Mistral → Cohere
// ========================================

async function handleEmbedding(text: string, model?: string, forceProvider?: string, options: any = {}) {
  const providers = forceProvider 
    ? [forceProvider] 
    : ['gemini', 'openai', 'mistral', 'cohere']

  for (const provider of providers) {
    try {
      let result

      switch (provider) {
        case 'gemini':
          if (!gemini) continue
          const embedModel = gemini.getGenerativeModel({ model: model || 'text-embedding-004' })
          const embedResult = await embedModel.embedContent(text)
          result = {
            embedding: embedResult.embedding.values,
            dimensions: embedResult.embedding.values.length,
            provider: 'gemini',
            model: model || 'text-embedding-004'
          }
          break

        case 'openai':
          if (!openai) continue
          const openaiResult = await openai.embeddings.create({
            model: model || 'text-embedding-3-small',
            input: text
          })
          result = {
            embedding: openaiResult.data[0].embedding,
            dimensions: openaiResult.data[0].embedding.length,
            provider: 'openai',
            model: openaiResult.model,
            usage: openaiResult.usage
          }
          break

        case 'mistral':
          if (!mistral) continue
          const mistralResult = await mistral.embeddings.create({
            model: model || 'mistral-embed',
            inputs: [text]
          })
          result = {
            embedding: mistralResult.data[0].embedding,
            dimensions: mistralResult.data[0].embedding.length,
            provider: 'mistral',
            model: model || 'mistral-embed'
          }
          break

        case 'cohere':
          if (!cohere) continue
          const cohereResult = await cohere.embed({
            model: model || 'embed-english-v3.0',
            texts: [text],
            inputType: 'search_query'
          })
          result = {
            embedding: cohereResult.embeddings[0],
            dimensions: cohereResult.embeddings[0].length,
            provider: 'cohere',
            model: model || 'embed-english-v3.0'
          }
          break

        default:
          continue
      }

      if (result) {
        return NextResponse.json({
          success: true,
          ...result
        })
      }
    } catch (error) {
      console.error(`${provider} embedding failed:`, error)
    }
  }

  return NextResponse.json(
    { error: 'All embedding providers failed' },
    { status: 500 }
  )
}

// ========================================
// IMAGE, AUDIO (OpenAI Only)
// ========================================

async function handleImageGeneration(prompt: string, options: any = {}) {
  if (!openai) return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })

  const response = await openai.images.generate({
    model: options.imageModel || 'dall-e-3',
    prompt: prompt,
    n: options.numberOfImages || 1,
    size: options.size || '1024x1024',
    quality: options.quality || 'standard',
    style: options.style || 'vivid'
  })

  return NextResponse.json({
    success: true,
    images: response.data.map(img => ({
      url: img.url,
      revisedPrompt: img.revised_prompt
    }))
  })
}

async function handleTranscription(audioData: string, options: any = {}) {
  if (!openai) return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })

  const buffer = Buffer.from(audioData, 'base64')
  const file = new File([buffer], 'audio.mp3', { type: 'audio/mp3' })

  const response = await openai.audio.transcriptions.create({
    file: file,
    model: options.transcribeModel || 'whisper-1',
    language: options.language || undefined,
    response_format: options.responseFormat || 'json'
  })

  return NextResponse.json({
    success: true,
    text: typeof response === 'string' ? response : response.text,
    model: options.transcribeModel || 'whisper-1'
  })
}

async function handleTextToSpeech(agentId: string, text: string, options: any = {}) {
  if (!openai) return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })

  const voiceConfig = AGENT_VOICES[agentId] || { voice: 'alloy', gender: 'male' }

  const response = await openai.audio.speech.create({
    model: options.ttsModel || 'tts-1-hd',
    voice: options.voice || voiceConfig.voice,
    input: text,
    speed: options.speed || 1.0
  })

  const buffer = Buffer.from(await response.arrayBuffer())

  return new Response(buffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename="${agentId}-speech.mp3"`
    }
  })
}

// ========================================
// GET - Health Check & Capabilities
// ========================================

export async function GET() {
  return NextResponse.json({
    status: 'operational',
    priority: ['gemini', 'openai', 'mistral', 'anthropic', 'cohere'],
    models: MODELS,
    capabilities: {
      chat: {
        providers: Object.keys(MODELS).filter(p => MODELS[p as keyof typeof MODELS].available && MODELS[p as keyof typeof MODELS].chat),
        totalModels: Object.values(MODELS).reduce((sum, p: any) => sum + (p.chat?.length || 0), 0)
      },
      embeddings: {
        providers: ['gemini', 'openai', 'mistral', 'cohere'].filter(p => MODELS[p as keyof typeof MODELS].available),
        totalModels: 8
      },
      images: {
        provider: 'openai',
        available: !!openai,
        models: ['dall-e-3', 'dall-e-2']
      },
      audio: {
        provider: 'openai',
        available: !!openai,
        stt: ['whisper-1'],
        tts: ['tts-1-hd', 'tts-1']
      }
    },
    agents: Object.keys(AGENT_VOICES).map(id => ({
      id,
      voice: AGENT_VOICES[id].voice,
      gender: AGENT_VOICES[id].gender
    }))
  })
}
