/**
 * Real Backend API Implementation for AI Services
 * This file contains the actual implementations for AI, voice, and translation services
 */

import express from 'express'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { CohereClient } from 'cohere-ai'
import { 
  getAgentPersonalityConfig, 
  createPersonalityEnforcedPayload,
  buildAgentSystemMessage 
} from '../lib/personality-integration'

const app = express()

// Initialize AI clients
let openai = null
let anthropic = null
let gemini = null
let cohere = null

// Initialize clients based on available API keys
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
}

if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })
}

if (process.env.GEMINI_API_KEY) {
  gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
}

if (process.env.COHERE_API_KEY) {
  cohere = new CohereClient({
    token: process.env.COHERE_API_KEY
  })
}

// Real OpenAI implementation with STRICT personality enforcement
export const getOpenAIResponse = async (
  message,
  agent,
  language,
  attachments
) => {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  // Get strict personality configuration for agent
  const config = getAgentPersonalityConfig(agent)
  const systemPrompt = buildAgentSystemMessage(agent, `User's language preference: ${language}`)

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: config.temperature,
      max_tokens: 2000,
      top_p: config.topP,
      frequency_penalty: config.frequencyPenalty,
      presence_penalty: config.presencePenalty
    })

    return response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to get response from OpenAI')
  }
}

// Real Anthropic implementation with STRICT personality enforcement
export const getAnthropicResponse = async (
  message,
  agent,
  language,
  attachments
) => {
  if (!anthropic) {
    throw new Error('Anthropic API key not configured')
  }

  // Get strict personality configuration for agent
  const config = getAgentPersonalityConfig(agent)
  const systemPrompt = buildAgentSystemMessage(agent, `User's language preference: ${language}`)

  try {
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: message }
      ],
      temperature: config.temperature,
      top_p: config.topP
    })

    // Extract text content from the response
    const textContent = response.content.find(block => block.type === 'text')
    return textContent?.text || 'I apologize, but I could not generate a response.'
  } catch (error) {
    console.error('Anthropic API error:', error)
    throw new Error('Failed to get response from Anthropic')
  }
}

// Real Gemini implementation with STRICT personality enforcement
export const getGeminiResponse = async (
  message,
  agent,
  language,
  attachments
) => {
  if (!gemini) {
    throw new Error('Gemini API key not configured')
  }

  // Get strict personality configuration for agent
  const config = getAgentPersonalityConfig(agent)
  const systemPrompt = buildAgentSystemMessage(agent, `User's language preference: ${language}`)

  try {
    const model = gemini.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      generationConfig: {
        temperature: config.temperature,
        topP: config.topP,
        maxOutputTokens: 2000
      }
    })

    const prompt = `${systemPrompt}\n\nHuman: ${message}`
    const result = await model.generateContent(prompt)
    const response = await result.response
    
    return response.text() || 'I apologize, but I could not generate a response.'
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to get response from Gemini')
  }
}

// Real Cohere implementation with STRICT personality enforcement
export const getCohereResponse = async (
  message,
  agent,
  language,
  attachments
) => {
  if (!cohere) {
    throw new Error('Cohere API key not configured')
  }

  // Get strict personality configuration for agent
  const config = getAgentPersonalityConfig(agent)
  const systemPrompt = buildAgentSystemMessage(agent, `User's language preference: ${language}`)

  try {
    const response = await cohere.chat({
      model: process.env.COHERE_MODEL || 'command-r-plus',
      message: message,
      preamble: systemPrompt,
      temperature: config.temperature,
      maxTokens: 2000
    })

    return response.text || 'I apologize, but I could not generate a response.'
  } catch (error) {
    console.error('Cohere API error:', error)
    throw new Error('Failed to get response from Cohere')
  }
}

// Language detection with OpenAI
export const detectWithOpenAI = async (text) => {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a language detection expert. Respond only with the ISO 639-1 language code (e.g., "en", "es", "fr", "de") followed by a confidence score from 0.0 to 1.0, separated by a comma. Example: "en,0.95"'
        },
        {
          role: 'user',
          content: `Detect the language of this text: "${text}"`
        }
      ],
      temperature: 0.1,
      max_tokens: 10
    })

    const result = response.choices[0]?.message?.content?.trim()
    if (result) {
      const [code, confidenceStr] = result.split(',')
      const confidence = parseFloat(confidenceStr) || 0.8
      return { code: code.trim(), confidence }
    }
    
    return { code: 'en', confidence: 0.5 }
  } catch (error) {
    console.error('OpenAI language detection error:', error)
    return { code: 'en', confidence: 0.5 }
  }
}

// Language detection with Cohere
export const detectWithCohere = async (text: string) => {
  if (!cohere) {
    throw new Error('Cohere API key not configured')
  }

  try {
    const response = await cohere.classify({
      model: 'embed-multilingual-v3.0',
      inputs: [text],
      examples: [
        { text: 'Hello, how are you?', label: 'en' },
        { text: 'Hola, ¿cómo estás?', label: 'es' },
        { text: 'Bonjour, comment allez-vous?', label: 'fr' },
        { text: 'Hallo, wie geht es dir?', label: 'de' },
        { text: 'Ciao, come stai?', label: 'it' }
      ]
    })

    const classification = response.classifications[0]
    if (classification) {
      return {
        code: classification.prediction,
        confidence: classification.confidence
      }
    }
    
    return { code: 'en', confidence: 0.5 }
  } catch (error) {
    console.error('Cohere language detection error:', error)
    return { code: 'en', confidence: 0.5 }
  }
}

// Text-to-speech with ElevenLabs
export const synthesizeWithElevenLabs = async (
  text,
  voice,
  language
) => {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured')
  }

  const voiceId = voice || process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    const audioBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioBuffer).toString('base64')
    return `data:audio/mpeg;base64,${base64Audio}`
  } catch (error) {
    console.error('ElevenLabs synthesis error:', error)
    throw new Error('Failed to synthesize speech with ElevenLabs')
  }
}

// Translation with Google Translate
export const translateWithGoogle = async (
  text,
  targetLang,
  sourceLang = 'auto'
) => {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!apiKey) {
    throw new Error('Google Translate API key not configured')
  }

  try {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang === 'auto' ? undefined : sourceLang,
        target: targetLang,
        format: 'text'
      })
    })

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`)
    }

    const data = await response.json()
    return data.data.translations[0].translatedText
  } catch (error) {
    console.error('Google Translate error:', error)
    throw new Error('Failed to translate with Google Translate')
  }
}

// Translation with DeepL
export const translateWithDeepL = async (
  text,
  targetLang,
  sourceLang = 'auto'
) => {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) {
    throw new Error('DeepL API key not configured')
  }

  try {
    const url = 'https://api-free.deepl.com/v2/translate'
    const params = new URLSearchParams({
      auth_key: apiKey,
      text: text,
      target_lang: targetLang.toUpperCase()
    })

    if (sourceLang !== 'auto') {
      params.append('source_lang', sourceLang.toUpperCase())
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    })

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.status}`)
    }

    const data = await response.json()
    return data.translations[0].text
  } catch (error) {
    console.error('DeepL translation error:', error)
    throw new Error('Failed to translate with DeepL')
  }
}

export default app