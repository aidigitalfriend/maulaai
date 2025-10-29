/**
 * Unified Multi-Modal AI API Endpoints
 * Handles: Chat, Embeddings, Image Gen, STT, TTS
 */

import { NextRequest, NextResponse } from 'next/server'
import { multiModalAI } from '../../../lib/multimodal-ai-service'

// ============================================
// 1. CHAT ENDPOINT
// ============================================
export async function POST(req: NextRequest) {
  try {
    const { action, ...data } = await req.json()

    switch (action) {
      case 'chat':
        return await handleChat(data)
      
      case 'embedding':
        return await handleEmbedding(data)
      
      case 'image':
        return await handleImageGeneration(data)
      
      case 'transcribe':
        return await handleTranscription(data)
      
      case 'speak':
        return await handleTextToSpeech(data)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Multimodal API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// CHAT HANDLER
// ============================================
async function handleChat(data: any) {
  const { message, agentId, provider, model, temperature } = data

  if (!message || !agentId) {
    return NextResponse.json(
      { error: 'Missing required fields: message, agentId' },
      { status: 400 }
    )
  }

  const response = await multiModalAI.getChatResponse(message, agentId, {
    provider,
    model,
    temperature
  })

  return NextResponse.json({
    success: true,
    data: response
  })
}

// ============================================
// EMBEDDING HANDLER
// ============================================
async function handleEmbedding(data: any) {
  const { text, texts, provider, model } = data

  if (!text && !texts) {
    return NextResponse.json(
      { error: 'Missing required field: text or texts' },
      { status: 400 }
    )
  }

  // Batch or single
  if (texts && Array.isArray(texts)) {
    const embeddings = await multiModalAI.batchGetEmbeddings(texts, {
      provider,
      model
    })
    return NextResponse.json({
      success: true,
      data: embeddings
    })
  } else {
    const embedding = await multiModalAI.getEmbedding(text, {
      provider,
      model
    })
    return NextResponse.json({
      success: true,
      data: embedding
    })
  }
}

// ============================================
// IMAGE GENERATION HANDLER
// ============================================
async function handleImageGeneration(data: any) {
  const { prompt, provider, model, size, quality, style } = data

  if (!prompt) {
    return NextResponse.json(
      { error: 'Missing required field: prompt' },
      { status: 400 }
    )
  }

  const image = await multiModalAI.generateImage(prompt, {
    provider,
    model,
    size,
    quality,
    style
  })

  return NextResponse.json({
    success: true,
    data: image
  })
}

// ============================================
// SPEECH-TO-TEXT HANDLER
// ============================================
async function handleTranscription(data: any) {
  const { audioData, provider, model, language } = data

  if (!audioData) {
    return NextResponse.json(
      { error: 'Missing required field: audioData' },
      { status: 400 }
    )
  }

  // Convert base64 to buffer
  const audioBuffer = Buffer.from(audioData, 'base64')

  const transcription = await multiModalAI.transcribeAudio(audioBuffer, {
    provider,
    model,
    language
  })

  return NextResponse.json({
    success: true,
    data: transcription
  })
}

// ============================================
// TEXT-TO-SPEECH HANDLER
// ============================================
async function handleTextToSpeech(data: any) {
  const { text, agentId, provider, model, voice, speed } = data

  if (!text || !agentId) {
    return NextResponse.json(
      { error: 'Missing required fields: text, agentId' },
      { status: 400 }
    )
  }

  const audio = await multiModalAI.generateSpeech(text, agentId, {
    provider,
    model,
    voice,
    speed
  })

  // Return audio as base64
  return NextResponse.json({
    success: true,
    data: {
      audio: audio.audio.toString('base64'),
      provider: audio.provider,
      model: audio.model,
      voice: audio.voice
    }
  })
}
