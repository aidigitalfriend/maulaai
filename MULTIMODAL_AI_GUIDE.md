# Multi-Modal AI Integration Guide

## Overview

All agents now have access to 6 types of AI capabilities through a unified API:

1. **💬 Chat/Reasoning** - GPT-4o, GPT-5, Claude, Gemini
2. **🧩 Embeddings** - text-embedding-3-small/large for search & memory
3. **🎨 Image Generation** - DALL-E, gpt-image-1
4. **🎤 Speech-to-Text** - Whisper-1, gpt-4o-mini-transcribe
5. **🗣️ Text-to-Speech** - Voice synthesis with agent-specific voices
6. **💻 Code** - Integrated in chat models

## Quick Start

### Import the Client

```typescript
import { multiModalAI, useChat, useTTS, useSTT } from '@/lib/multimodal-ai-client'
```

## 1. Chat / Reasoning

### Basic Chat

```typescript
// Simple chat
const response = await multiModalAI.quickChat(
  "What's 2+2?",
  "einstein"
)
console.log(response) // "Ah! A delightful mathematical puzzle..."

// Advanced chat with options
const result = await multiModalAI.chat(
  "Explain quantum physics",
  "einstein",
  {
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.5
  }
)
```

### React Hook

```typescript
function ChatComponent() {
  const { chat, loading, error } = useChat('einstein')
  
  const handleSend = async () => {
    const response = await chat("Hello!")
    console.log(response.text)
  }
}
```

### Provider Options

```typescript
// OpenAI (default)
await multiModalAI.chat(message, agentId, {
  provider: 'openai',
  model: 'gpt-4o' // or 'gpt-5', 'gpt-4o-mini'
})

// Anthropic
await multiModalAI.chat(message, agentId, {
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022'
})

// Gemini
await multiModalAI.chat(message, agentId, {
  provider: 'gemini',
  model: 'gemini-2.0-flash-exp'
})
```

## 2. Embeddings (Search & Memory)

### Single Embedding

```typescript
const embedding = await multiModalAI.getEmbedding(
  "The meaning of life is 42",
  {
    provider: 'openai',
    model: 'text-embedding-3-small' // or 'text-embedding-3-large'
  }
)

console.log(embedding.embedding) // [0.123, -0.456, ...]
console.log(embedding.dimensions) // 1536 or 3072
```

### Batch Embeddings

```typescript
const texts = [
  "First document",
  "Second document",
  "Third document"
]

const embeddings = await multiModalAI.getBatchEmbeddings(texts)
// Store in vector database (Pinecone, FAISS, pgvector)
```

### Similarity Search

```typescript
const similarity = await multiModalAI.calculateSimilarity(
  "How do I cook pasta?",
  "Chef Biew explains cooking techniques"
)

console.log(similarity) // 0.85 (high similarity)
```

### Use Cases

```typescript
// 1. Memory for chatbots
const userQuery = "What did we talk about yesterday?"
const queryEmbedding = await multiModalAI.getEmbedding(userQuery)
// Search vector DB for similar past conversations

// 2. Semantic search in knowledge base
const searchResults = await searchVectorDB(queryEmbedding)

// 3. Content recommendation
const userPreferences = await multiModalAI.getEmbedding(userProfile)
// Find similar content
```

## 3. Image Generation

### Basic Image

```typescript
// Quick image
const imageUrl = await multiModalAI.quickImage(
  "A futuristic robot in a neon city"
)

// Advanced options
const image = await multiModalAI.generateImage(
  "Professional headshot of Einstein",
  {
    provider: 'openai',
    model: 'dall-e-3',
    size: '1024x1024', // or '1792x1024', '1024x1792'
    quality: 'hd',     // or 'standard'
    style: 'vivid'     // or 'natural'
  }
)

console.log(image.url)
console.log(image.revisedPrompt) // AI's interpretation
```

### React Example

```typescript
function ImageGenerator() {
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  
  const generate = async () => {
    setLoading(true)
    const url = await multiModalAI.quickImage(prompt)
    setImageUrl(url)
    setLoading(false)
  }
  
  return (
    <div>
      {imageUrl && <img src={imageUrl} alt="Generated" />}
      <button onClick={generate}>Generate</button>
    </div>
  )
}
```

## 4. Speech-to-Text (Transcription)

### Basic Transcription

```typescript
// From file input
const audioFile = event.target.files[0]
const transcription = await multiModalAI.quickTranscribe(audioFile)
console.log(transcription) // "Hello, this is what I said..."

// With options
const result = await multiModalAI.transcribe(audioBlob, {
  provider: 'openai',
  model: 'whisper-1', // or 'gpt-4o-mini-transcribe' (faster)
  language: 'en'
})
```

### React Hook

```typescript
function VoiceInput() {
  const { transcribe, transcribing, error } = useSTT()
  const [text, setText] = useState('')
  
  const handleAudio = async (audioBlob: Blob) => {
    const result = await transcribe(audioBlob)
    setText(result)
  }
}
```

### Recording Audio

```typescript
// Record from microphone
let mediaRecorder: MediaRecorder
let audioChunks: Blob[] = []

const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  mediaRecorder = new MediaRecorder(stream)
  
  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data)
  }
  
  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
    const text = await multiModalAI.quickTranscribe(audioBlob)
    console.log('User said:', text)
  }
  
  mediaRecorder.start()
}

const stopRecording = () => {
  mediaRecorder.stop()
}
```

## 5. Text-to-Speech (Voice Synthesis)

### Agent Voices (Auto-Selected)

Each agent has a pre-assigned voice based on personality:

**Female Voices:**
- `julie-girlfriend` → nova (warm, friendly)
- `drama-queen` → shimmer (dramatic)
- `emma-emotional` → nova (empathetic)
- `mrs-boss` → alloy (professional)

**Male Voices:**
- `einstein` → onyx (deep, thoughtful)
- `tech-wizard` → echo (tech-savvy)
- `fitness-guru` → fable (energetic)
- `comedy-king` → fable (expressive)
- `chef-biew` → fable (passionate)

### Basic TTS

```typescript
// Quick speak (auto-selects voice)
const audioBlob = await multiModalAI.quickSpeak(
  "Hello! I'm Einstein!",
  "einstein"
)

// Play immediately
await multiModalAI.speakAndPlay(
  "This will play right away",
  "einstein"
)

// Advanced options
const audio = await multiModalAI.speak(
  "Custom voice test",
  "einstein",
  {
    provider: 'openai',
    model: 'tts-1-hd', // or 'tts-1', 'gpt-4o-mini-tts', 'gpt-4o-mini-tts-hd'
    voice: 'onyx',     // Override auto-selection
    speed: 1.2         // 0.25 to 4.0
  }
)
```

### React Hook

```typescript
function SpeechButton() {
  const { speak, speaking, error } = useTTS('einstein')
  
  return (
    <button 
      onClick={() => speak("Hello from Einstein!")}
      disabled={speaking}
    >
      {speaking ? 'Speaking...' : 'Speak'}
    </button>
  )
}
```

### Play Audio

```typescript
const audio = await multiModalAI.speak("Hello!", "einstein")
const audioUrl = URL.createObjectURL(
  new Blob([Buffer.from(audio.audio, 'base64')], { type: 'audio/mpeg' })
)
const audioElement = new Audio(audioUrl)
await audioElement.play()
```

## 6. Combo Features

### Voice-to-Voice Conversation

```typescript
// User speaks → Transcribe → Chat → Speak response
const conversation = await multiModalAI.voiceConversation(
  userAudioBlob,
  "einstein"
)

console.log('User said:', conversation.userText)
console.log('AI replied:', conversation.responseText)

// Play AI response
const audioUrl = URL.createObjectURL(conversation.responseAudio)
new Audio(audioUrl).play()
```

### Image Chat

```typescript
// Generate image + chat about it
const result = await multiModalAI.imageChat(
  "A robot teaching physics",     // Image prompt
  "Explain what's in this image", // Chat message
  "einstein"
)

console.log('Image:', result.imageUrl)
console.log('Response:', result.chatResponse)
```

## Integration Example: Full Agent

```typescript
'use client'

import { useState } from 'react'
import { multiModalAI, useChat, useTTS, useSTT } from '@/lib/multimodal-ai-client'

export default function EinsteinAgent() {
  const [messages, setMessages] = useState<string[]>([])
  const { chat, loading } = useChat('einstein')
  const { speak, speaking } = useTTS('einstein')
  const { transcribe } = useSTT()
  
  // Text chat
  const handleTextChat = async (userMessage: string) => {
    const response = await chat(userMessage)
    setMessages(prev => [...prev, userMessage, response.text])
    
    // Optional: speak the response
    await speak(response.text)
  }
  
  // Voice chat
  const handleVoiceChat = async (audioBlob: Blob) => {
    const userText = await transcribe(audioBlob)
    await handleTextChat(userText)
  }
  
  // Generate visualization
  const handleGenerateImage = async (prompt: string) => {
    const imageUrl = await multiModalAI.quickImage(prompt)
    return imageUrl
  }
  
  return (
    <div>
      {/* Your UI here */}
    </div>
  )
}
```

## API Key Requirements

All features work with a single OpenAI API key. Optional providers:

```env
# Required for basic features
OPENAI_API_KEY=sk-...

# Optional additional providers
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AI...
```

## Model Selection Guide

### When to use what:

**Chat Models:**
- `gpt-4o-mini` - Fast, cheap, simple tasks
- `gpt-4o` - Balanced performance (default)
- `gpt-5` - Maximum reasoning power
- `claude-3-5-sonnet` - Long context, detailed
- `gemini-2.0-flash` - Fast, multimodal

**Embedding Models:**
- `text-embedding-3-small` - Fast, 1536 dimensions
- `text-embedding-3-large` - Better quality, 3072 dimensions

**TTS Models:**
- `tts-1` - Fast, standard quality
- `tts-1-hd` - High quality (recommended)
- `gpt-4o-mini-tts` - Ultra fast
- `gpt-4o-mini-tts-hd` - Fast + high quality

**STT Models:**
- `whisper-1` - Accurate, slower
- `gpt-4o-mini-transcribe` - Fast, real-time

## Performance Tips

1. **Use mini models for real-time** (chat, TTS, STT)
2. **Cache embeddings** in database
3. **Batch operations** when possible
4. **Stream responses** for long chats (future feature)
5. **Preload TTS** for common phrases

## Next Steps

1. Add vector database (Pinecone/FAISS)
2. Implement semantic memory
3. Add streaming chat responses
4. Create voice command system
5. Build image understanding (GPT-4V)

## Support

For issues or questions, check the backend logs or API response errors.
