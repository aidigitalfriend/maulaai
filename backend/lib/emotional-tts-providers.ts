/**
 * EMOTIONAL TTS PROVIDER IMPLEMENTATIONS
 * Each provider with emotion/style mapping and SSML generation
 */

import axios from 'axios'
import { 
  EmotionalTTSResponse, 
  EmotionalTTSConfig, 
  VoicePersonality,
  Emotion,
  SpeakingStyle 
} from './emotional-tts-service'

// ============================================
// ELEVENLABS - BEST EMOTIONAL QUALITY
// ============================================

export async function speakElevenLabs(
  text: string,
  personality: VoicePersonality,
  config: Required<EmotionalTTSConfig>,
  apiKey: string
): Promise<EmotionalTTSResponse> {
  const voiceSettings = personality.providers.elevenlabs
  if (!voiceSettings) throw new Error('ElevenLabs voice not configured')

  // Map emotion to stability and similarity_boost
  const emotionMapping = mapEmotionToElevenLabs(config.emotion, config.intensity, personality)

  const requestBody = {
    text,
    model_id: "eleven_multilingual_v2", // Supports emotions
    voice_settings: {
      stability: emotionMapping.stability,
      similarity_boost: emotionMapping.similarity_boost,
      style: emotionMapping.style,
      use_speaker_boost: true
    }
  }

  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceSettings.voiceId}`,
    requestBody,
    {
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      responseType: 'arraybuffer'
    }
  )

  return {
    audio: Buffer.from(response.data),
    provider: 'elevenlabs',
    emotion: config.emotion,
    style: config.style,
    cost: calculateCost('elevenlabs', text.length)
  }
}

function mapEmotionToElevenLabs(
  emotion: Emotion,
  intensity: number,
  personality: VoicePersonality
): { stability: number; similarity_boost: number; style: number } {
  const baseSettings = personality.providers.elevenlabs!

  let stability = baseSettings.stability
  let similarity = baseSettings.similarityBoost
  let style = 0.5

  switch (emotion) {
    case 'happy':
    case 'joyful':
    case 'excited':
    case 'cheerful':
      stability = Math.max(0.3, baseSettings.stability - 0.2) // More variation
      similarity = Math.min(1.0, baseSettings.similarityBoost + 0.1)
      style = 0.7 + (intensity * 0.3)
      break

    case 'sad':
    case 'melancholic':
    case 'disappointed':
      stability = Math.min(0.8, baseSettings.stability + 0.2) // More stable
      similarity = baseSettings.similarityBoost
      style = 0.3 - (intensity * 0.2)
      break

    case 'angry':
    case 'frustrated':
    case 'annoyed':
      stability = Math.max(0.2, baseSettings.stability - 0.3) // Very expressive
      similarity = Math.min(0.9, baseSettings.similarityBoost + 0.15)
      style = 0.8 + (intensity * 0.2)
      break

    case 'romantic':
    case 'flirty':
    case 'loving':
    case 'passionate':
      stability = Math.max(0.4, baseSettings.stability - 0.1)
      similarity = Math.min(0.85, baseSettings.similarityBoost + 0.1)
      style = 0.6 + (intensity * 0.2)
      break

    case 'dramatic':
    case 'theatrical':
    case 'intense':
      stability = Math.max(0.25, baseSettings.stability - 0.25)
      similarity = Math.min(0.9, baseSettings.similarityBoost + 0.15)
      style = 0.85 + (intensity * 0.15)
      break

    case 'calm':
    case 'peaceful':
    case 'serene':
      stability = Math.min(0.9, baseSettings.stability + 0.3)
      similarity = baseSettings.similarityBoost
      style = 0.2
      break

    case 'energetic':
    case 'motivated':
    case 'enthusiastic':
      stability = Math.max(0.3, baseSettings.stability - 0.2)
      similarity = Math.min(0.85, baseSettings.similarityBoost + 0.1)
      style = 0.75 + (intensity * 0.25)
      break

    case 'professional':
    case 'authoritative':
    case 'confident':
      stability = Math.min(0.75, baseSettings.stability + 0.1)
      similarity = baseSettings.similarityBoost
      style = 0.5
      break

    default:
      // neutral
      stability = baseSettings.stability
      similarity = baseSettings.similarityBoost
      style = 0.5
  }

  return {
    stability: Math.max(0, Math.min(1, stability)),
    similarity_boost: Math.max(0, Math.min(1, similarity)),
    style: Math.max(0, Math.min(1, style))
  }
}

// ============================================
// AZURE COGNITIVE SPEECH - SSML WITH EMOTIONS
// ============================================

export async function speakAzure(
  text: string,
  personality: VoicePersonality,
  config: Required<EmotionalTTSConfig>,
  apiKey: string,
  region: string
): Promise<EmotionalTTSResponse> {
  const voiceSettings = personality.providers.azure
  if (!voiceSettings) throw new Error('Azure voice not configured')

  // Build SSML with emotion and style
  const ssml = buildAzureSSML(text, voiceSettings.voiceName, config, personality)

  const response = await axios.post(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    ssml,
    {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3'
      },
      responseType: 'arraybuffer'
    }
  )

  return {
    audio: Buffer.from(response.data),
    provider: 'azure',
    emotion: config.emotion,
    style: config.style,
    cost: calculateCost('azure', text.length)
  }
}

function buildAzureSSML(
  text: string,
  voiceName: string,
  config: Required<EmotionalTTSConfig>,
  personality: VoicePersonality
): string {
  // Map emotion to Azure style
  const azureStyle = mapEmotionToAzureStyle(config.emotion)
  const styleDegree = config.intensity.toFixed(2)
  
  // Calculate prosody adjustments
  const rate = config.speed === 1.0 ? 'medium' : `${(config.speed * 100).toFixed(0)}%`
  const pitch = config.pitch === 0 ? 'medium' : `${config.pitch > 0 ? '+' : ''}${config.pitch}st`
  const volume = config.volume === 1.0 ? 'default' : `${(config.volume * 100).toFixed(0)}%`

  return `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" 
       xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
  <voice name="${voiceName}">
    <mstts:express-as style="${azureStyle}" styledegree="${styleDegree}">
      <prosody rate="${rate}" pitch="${pitch}" volume="${volume}">
        ${escapeXml(text)}
      </prosody>
    </mstts:express-as>
  </voice>
</speak>`.trim()
}

function mapEmotionToAzureStyle(emotion: Emotion): string {
  const mapping: Record<Emotion, string> = {
    'neutral': 'general',
    'happy': 'cheerful',
    'joyful': 'cheerful',
    'excited': 'excited',
    'cheerful': 'cheerful',
    'sad': 'sad',
    'melancholic': 'sad',
    'disappointed': 'sad',
    'angry': 'angry',
    'frustrated': 'angry',
    'annoyed': 'unfriendly',
    'calm': 'calm',
    'peaceful': 'calm',
    'serene': 'calm',
    'romantic': 'friendly',
    'flirty': 'cheerful',
    'loving': 'friendly',
    'passionate': 'excited',
    'dramatic': 'newscast-formal',
    'theatrical': 'newscast-formal',
    'intense': 'excited',
    'energetic': 'excited',
    'motivated': 'excited',
    'enthusiastic': 'excited',
    'tired': 'sad',
    'lazy': 'calm',
    'sleepy': 'calm',
    'professional': 'customerservice',
    'authoritative': 'customerservice',
    'confident': 'friendly',
    'empathetic': 'friendly',
    'caring': 'friendly',
    'supportive': 'friendly',
    'funny': 'cheerful',
    'sarcastic': 'unfriendly',
    'witty': 'cheerful',
    'mysterious': 'newscast-formal',
    'serious': 'newscast-formal',
    'wise': 'calm'
  }

  return mapping[emotion] || 'general'
}

// ============================================
// GOOGLE CLOUD TTS - AUDIO EFFECTS
// ============================================

export async function speakGoogle(
  text: string,
  personality: VoicePersonality,
  config: Required<EmotionalTTSConfig>,
  apiKey: string
): Promise<EmotionalTTSResponse> {
  const voiceSettings = personality.providers.google
  if (!voiceSettings) throw new Error('Google voice not configured')

  // Map emotion to audio effects
  const audioConfig = mapEmotionToGoogleEffects(config, personality)

  const requestBody = {
    input: { text },
    voice: {
      languageCode: voiceSettings.languageCode,
      name: voiceSettings.name,
      ssmlGender: personality.gender === 'female' ? 'FEMALE' : 'MALE'
    },
    audioConfig
  }

  const response = await axios.post(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    requestBody,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )

  return {
    audio: response.data.audioContent, // Base64 encoded
    provider: 'google',
    emotion: config.emotion,
    style: config.style,
    cost: calculateCost('google', text.length)
  }
}

function mapEmotionToGoogleEffects(
  config: Required<EmotionalTTSConfig>,
  personality: VoicePersonality
) {
  const baseConfig = {
    audioEncoding: 'MP3',
    speakingRate: config.speed,
    pitch: config.pitch,
    volumeGainDb: (config.volume - 1) * 16 // Convert to dB
  }

  // Add effects based on emotion
  const effects: string[] = []

  switch (config.emotion) {
    case 'dramatic':
    case 'theatrical':
      effects.push('large-home-entertainment-class-device')
      break
    case 'professional':
    case 'authoritative':
      effects.push('medium-bluetooth-speaker-class-device')
      break
    case 'romantic':
    case 'calm':
      effects.push('headphone-class-device')
      break
    default:
      effects.push('small-bluetooth-speaker-class-device')
  }

  return {
    ...baseConfig,
    effectsProfileId: effects
  }
}

// ============================================
// AMAZON POLLY - NEURAL VOICES WITH STYLES
// ============================================

export async function speakPolly(
  text: string,
  personality: VoicePersonality,
  config: Required<EmotionalTTSConfig>,
  accessKey: string,
  secretKey: string
): Promise<EmotionalTTSResponse> {
  const AWS = require('aws-sdk')
  
  const polly = new AWS.Polly({
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
    region: 'us-east-1'
  })

  const voiceSettings = personality.providers.polly
  if (!voiceSettings) throw new Error('Polly voice not configured')

  // Build SSML with emotion-based prosody
  const ssml = buildPollySSML(text, config, personality)

  const params = {
    Text: ssml,
    TextType: 'ssml',
    OutputFormat: 'mp3',
    VoiceId: voiceSettings.voiceId,
    Engine: voiceSettings.engine,
    SampleRate: '24000'
  }

  const data = await polly.synthesizeSpeech(params).promise()

  return {
    audio: Buffer.from(data.AudioStream),
    provider: 'polly',
    emotion: config.emotion,
    style: config.style,
    cost: calculateCost('polly', text.length)
  }
}

function buildPollySSML(
  text: string,
  config: Required<EmotionalTTSConfig>,
  personality: VoicePersonality
): string {
  const rate = `${(config.speed * 100).toFixed(0)}%`
  const pitch = `${config.pitch > 0 ? '+' : ''}${config.pitch}%`
  const volume = config.volume === 1.0 ? 'medium' : `${(config.volume * 100).toFixed(0)}%`

  // Add emotion-specific emphasis
  let processedText = text
  if (config.emotion === 'excited' || config.emotion === 'enthusiastic') {
    processedText = `<emphasis level="strong">${text}</emphasis>`
  } else if (config.emotion === 'calm' || config.emotion === 'peaceful') {
    processedText = `<prosody volume="soft">${text}</prosody>`
  }

  return `
<speak>
  <prosody rate="${rate}" pitch="${pitch}" volume="${volume}">
    ${processedText}
  </prosody>
</speak>`.trim()
}

// ============================================
// OPENAI TTS - SIMPLE FALLBACK
// ============================================

export async function speakOpenAI(
  text: string,
  personality: VoicePersonality,
  config: Required<EmotionalTTSConfig>,
  apiKey: string
): Promise<EmotionalTTSResponse> {
  const OpenAI = require('openai')
  const openai = new OpenAI({ apiKey })

  const voiceSettings = personality.providers.openai
  if (!voiceSettings) throw new Error('OpenAI voice not configured')

  // OpenAI doesn't support emotions, so we just use speed
  const response = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice: voiceSettings.voice,
    input: text,
    speed: config.speed
  })

  const buffer = Buffer.from(await response.arrayBuffer())

  return {
    audio: buffer,
    provider: 'openai',
    emotion: config.emotion,
    style: config.style,
    cost: calculateCost('openai', text.length)
  }
}

// ============================================
// UTILITIES
// ============================================

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function calculateCost(provider: string, textLength: number): number {
  const charCount = textLength
  
  switch (provider) {
    case 'elevenlabs':
      return (charCount / 1000) * 0.30 // $0.30 per 1K chars
    case 'azure':
      return (charCount / 1000000) * 16 // $16 per 1M chars
    case 'google':
      return (charCount / 1000000) * 16 // $16 per 1M chars
    case 'polly':
      return (charCount / 1000000) * 16 // $16 per 1M chars (neural)
    case 'openai':
      return (charCount / 1000) * 0.015 // $15 per 1M chars = $0.015 per 1K
    default:
      return 0
  }
}
