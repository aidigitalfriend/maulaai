/**
 * ========================================
 * MULTI-MODAL AI AGENT API
 * ========================================
 * 
 * Supports ALL OpenAI model capabilities:
 * 🧠 Chat/Reasoning: gpt-5, gpt-4o, gpt-4o-mini
 * 🧩 Embeddings: text-embedding-3-small, text-embedding-3-large
 * 🎨 Image Generation: gpt-image-1 (DALL-E)
 * 🗣️ Speech-to-Text: gpt-4o-mini-transcribe, whisper-1
 * 🗣️ Text-to-Speech: gpt-4o-mini-tts, gpt-4o-mini-tts-hd
 * 💻 Code: Integrated in gpt-4o/gpt-5
 * 
 * All capabilities available for every agent!
 * ========================================
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { rateLimit } from '@/lib/rate-limit'
import { validateInput } from '@/lib/security-validation'

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 2,
  timeout: 60000 // Longer timeout for image/audio generation
}) : null

// ========================================
// AGENT VOICE CONFIGURATIONS
// ========================================
// Voice will be character-based (male/female) - to be configured later
const AGENT_VOICES: Record<string, {
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  gender: 'male' | 'female'
  description: string
}> = {
  'ben-sega': {
    voice: 'onyx', // Deep, authoritative male voice
    gender: 'male',
    description: 'Confident, professional male voice'
  },
  'tech-wizard': {
    voice: 'fable', // Expressive, energetic male voice
    gender: 'male',
    description: 'Enthusiastic, creative male voice'
  },
  'doctor-network': {
    voice: 'echo', // Clear, professional male voice
    gender: 'male',
    description: 'Clear, analytical male voice'
  },
  'data-scientist': {
    voice: 'nova', // Warm, intelligent female voice
    gender: 'female',
    description: 'Professional, intelligent female voice'
  },
  'devops-expert': {
    voice: 'alloy', // Neutral, technical voice
    gender: 'male',
    description: 'Technical, precise voice'
  }
}

// ========================================
// 1. CHAT/REASONING ENDPOINT
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

    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { 
      action, // 'chat', 'embed', 'image', 'transcribe', 'speak'
      agentId,
      message,
      conversationHistory = [],
      model = 'gpt-4o-mini', // Default model
      imagePrompt,
      audioData,
      text,
      options = {}
    } = body

    // Validate required fields
    if (!action) {
      return NextResponse.json(
        { error: 'Action type required (chat, embed, image, transcribe, speak)' },
        { status: 400 }
      )
    }

    // Route to appropriate handler based on action
    switch (action) {
      case 'chat':
        return await handleChat(agentId, message, conversationHistory, model, options)
      
      case 'embed':
        return await handleEmbedding(message || text, options)
      
      case 'image':
        return await handleImageGeneration(imagePrompt, options)
      
      case 'transcribe':
        return await handleTranscription(audioData, options)
      
      case 'speak':
        return await handleTextToSpeech(agentId, text, options)
      
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Multi-modal API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ========================================
// HANDLER FUNCTIONS
// ========================================

/**
 * 🧠 CHAT/REASONING - gpt-5, gpt-4o, gpt-4o-mini
 */
async function handleChat(
  agentId: string,
  message: string,
  conversationHistory: any[],
  model: string = 'gpt-4o-mini',
  options: any = {}
) {
  if (!openai) {
    return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })
  }

  const validation = validateInput(message)
  if (!validation.isValid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    )
  }

  // Build messages array
  const messages: any[] = [
    {
      role: 'system',
      content: options.systemPrompt || `You are a helpful AI assistant for ${agentId}.`
    },
    ...conversationHistory,
    {
      role: 'user',
      content: message
    }
  ]

  // Handle image understanding if image URL provided
  if (options.imageUrl) {
    messages[messages.length - 1].content = [
      { type: 'text', text: message },
      { type: 'image_url', image_url: { url: options.imageUrl } }
    ]
  }

  const response = await openai.chat.completions.create({
    model: model,
    messages: messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 1500,
    top_p: options.topP || 0.9,
    frequency_penalty: options.frequencyPenalty || 0.3,
    presence_penalty: options.presencePenalty || 0.3,
    stream: options.stream || false
  })

  if (options.stream) {
    // Return streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response as any) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
  }

  return NextResponse.json({
    success: true,
    response: response.choices[0].message.content,
    model: response.model,
    usage: response.usage
  })
}

/**
 * 🧩 EMBEDDINGS - text-embedding-3-small, text-embedding-3-large
 */
async function handleEmbedding(
  text: string,
  options: any = {}
) {
  if (!openai) {
    return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })
  }

  const model = options.embeddingModel || 'text-embedding-3-small'

  const response = await openai.embeddings.create({
    model: model,
    input: text,
    encoding_format: 'float'
  })

  return NextResponse.json({
    success: true,
    embedding: response.data[0].embedding,
    model: response.model,
    dimensions: response.data[0].embedding.length,
    usage: response.usage
  })
}

/**
 * 🎨 IMAGE GENERATION - gpt-image-1 (DALL-E)
 */
async function handleImageGeneration(
  prompt: string,
  options: any = {}
) {
  if (!openai) {
    return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })
  }

  const response = await openai.images.generate({
    model: options.imageModel || 'dall-e-3',
    prompt: prompt,
    n: options.numberOfImages || 1,
    size: options.size || '1024x1024',
    quality: options.quality || 'standard', // 'standard' or 'hd'
    style: options.style || 'vivid' // 'vivid' or 'natural'
  })

  return NextResponse.json({
    success: true,
    images: response.data.map(img => ({
      url: img.url,
      revisedPrompt: img.revised_prompt
    }))
  })
}

/**
 * 🗣️ SPEECH-TO-TEXT - gpt-4o-mini-transcribe, whisper-1
 */
async function handleTranscription(
  audioData: string, // Base64 encoded audio
  options: any = {}
) {
  if (!openai) {
    return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })
  }

  // Convert base64 to file
  const buffer = Buffer.from(audioData, 'base64')
  const file = new File([buffer], 'audio.mp3', { type: 'audio/mp3' })

  const model = options.transcribeModel || 'whisper-1'

  const response = await openai.audio.transcriptions.create({
    file: file,
    model: model,
    language: options.language || undefined, // Optional language hint
    prompt: options.prompt || undefined, // Optional context
    response_format: options.responseFormat || 'json', // 'json', 'text', 'srt', 'vtt'
    temperature: options.temperature || 0
  })

  return NextResponse.json({
    success: true,
    text: typeof response === 'string' ? response : response.text,
    model: model
  })
}

/**
 * 🗣️ TEXT-TO-SPEECH - gpt-4o-mini-tts, gpt-4o-mini-tts-hd
 */
async function handleTextToSpeech(
  agentId: string,
  text: string,
  options: any = {}
) {
  if (!openai) {
    return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })
  }

  // Get agent's voice configuration
  const voiceConfig = AGENT_VOICES[agentId] || {
    voice: 'alloy',
    gender: 'male',
    description: 'Default voice'
  }

  const model = options.ttsModel || 'tts-1' // 'tts-1' or 'tts-1-hd'
  const voice = options.voice || voiceConfig.voice

  const response = await openai.audio.speech.create({
    model: model,
    voice: voice,
    input: text,
    speed: options.speed || 1.0 // 0.25 to 4.0
  })

  // Convert response to buffer
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
    capabilities: {
      chat: {
        models: ['gpt-5', 'gpt-4o', 'gpt-4o-mini'],
        features: ['text', 'code', 'reasoning', 'image-understanding'],
        available: !!openai
      },
      embeddings: {
        models: ['text-embedding-3-small', 'text-embedding-3-large'],
        features: ['semantic-search', 'similarity', 'clustering'],
        available: !!openai
      },
      imageGeneration: {
        models: ['dall-e-3', 'dall-e-2'],
        features: ['text-to-image', 'variations', 'edits'],
        available: !!openai
      },
      speechToText: {
        models: ['whisper-1', 'gpt-4o-mini-transcribe'],
        features: ['transcription', 'translation', 'multi-language'],
        available: !!openai
      },
      textToSpeech: {
        models: ['tts-1', 'tts-1-hd'],
        voices: Object.keys(AGENT_VOICES).map(id => ({
          agentId: id,
          voice: AGENT_VOICES[id].voice,
          gender: AGENT_VOICES[id].gender,
          description: AGENT_VOICES[id].description
        })),
        features: ['natural-voice', 'multiple-voices', 'speed-control'],
        available: !!openai
      }
    },
    agents: Object.keys(AGENT_VOICES).map(id => ({
      id,
      voice: AGENT_VOICES[id].voice,
      gender: AGENT_VOICES[id].gender
    }))
  })
}
