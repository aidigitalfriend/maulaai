/**
 * ========================================
 * MULTI-MODAL AGENT EXAMPLE
 * ========================================
 * 
 * Complete example showing ALL OpenAI capabilities:
 * 🧠 Chat/Reasoning
 * 🧩 Embeddings
 * 🎨 Image Generation
 * 🗣️ Speech-to-Text
 * 🗣️ Text-to-Speech
 * ========================================
 */

'use client'

import { useState } from 'react'
import {
  sendChatMessage,
  streamChatMessage,
  generateEmbedding,
  generateImage,
  transcribeAudio,
  textToSpeech,
  speakText,
  voiceConversation,
  generateAndDescribeImage,
  useMultiModalAgent
} from '@/lib/multimodal-helper'

export default function MultiModalAgentExample() {
  const agentId = 'ben-sega' // Or any agent: tech-wizard, doctor-network, etc.
  
  const {
    messages,
    isLoading,
    error,
    chat,
    generateImage: genImg,
    speak,
    transcribe,
    reset
  } = useMultiModalAgent(agentId)

  const [imageUrl, setImageUrl] = useState<string>('')
  const [audioUrl, setAudioUrl] = useState<string>('')
  const [embedding, setEmbedding] = useState<number[]>([])

  // ========================================
  // 1. 🧠 CHAT EXAMPLE
  // ========================================
  const handleChat = async () => {
    try {
      const response = await chat('Tell me about AI trends in 2025')
      console.log('AI Response:', response)
    } catch (err) {
      console.error('Chat error:', err)
    }
  }

  // ========================================
  // 2. 🧩 EMBEDDING EXAMPLE
  // ========================================
  const handleEmbedding = async () => {
    try {
      const result = await generateEmbedding('AI agent technology', {
        embeddingModel: 'text-embedding-3-large'
      })
      setEmbedding(result.embedding)
      console.log('Embedding dimensions:', result.dimensions)
      console.log('First 5 values:', result.embedding.slice(0, 5))
    } catch (err) {
      console.error('Embedding error:', err)
    }
  }

  // ========================================
  // 3. 🎨 IMAGE GENERATION EXAMPLE
  // ========================================
  const handleImageGeneration = async () => {
    try {
      const result = await generateImage('A futuristic AI robot in a neon city', {
        size: '1024x1024',
        quality: 'hd',
        style: 'vivid'
      })
      setImageUrl(result.images[0].url)
      console.log('Image generated:', result.images[0].url)
    } catch (err) {
      console.error('Image generation error:', err)
    }
  }

  // ========================================
  // 4. 🗣️ SPEECH-TO-TEXT EXAMPLE
  // ========================================
  const handleTranscription = async (file: File) => {
    try {
      const text = await transcribe(file, {
        transcribeModel: 'whisper-1',
        language: 'en'
      })
      console.log('Transcribed text:', text)
      // Optionally send transcribed text to chat
      await chat(text)
    } catch (err) {
      console.error('Transcription error:', err)
    }
  }

  // ========================================
  // 5. 🗣️ TEXT-TO-SPEECH EXAMPLE
  // ========================================
  const handleTextToSpeech = async () => {
    try {
      const text = 'Hello! I am Ben Sega, your AI assistant specializing in technology and innovation.'
      await speak(text, {
        ttsModel: 'tts-1-hd', // High-quality voice
        speed: 1.0
      })
      console.log('Playing audio...')
    } catch (err) {
      console.error('TTS error:', err)
    }
  }

  // ========================================
  // 6. 💬 VOICE CONVERSATION EXAMPLE
  // ========================================
  const handleVoiceConversation = async () => {
    try {
      const result = await voiceConversation(agentId, {
        transcriptionOptions: { transcribeModel: 'whisper-1' },
        chatOptions: { model: 'gpt-4o-mini', temperature: 0.7 },
        ttsOptions: { ttsModel: 'tts-1-hd' }
      })
      console.log('User said:', result.userText)
      console.log('AI responded:', result.aiText)
      console.log('Audio URL:', result.audioUrl)
    } catch (err) {
      console.error('Voice conversation error:', err)
    }
  }

  // ========================================
  // 7. 🖼️ IMAGE + CHAT EXAMPLE
  // ========================================
  const handleImageWithChat = async () => {
    try {
      const result = await generateAndDescribeImage(
        agentId,
        'A modern tech startup office with developers working on AI',
        'Describe this office and suggest improvements for productivity',
        {
          imageOptions: { quality: 'hd', style: 'natural' },
          chatOptions: { model: 'gpt-4o', temperature: 0.7 }
        }
      )
      setImageUrl(result.imageUrl)
      console.log('Image description:', result.description)
    } catch (err) {
      console.error('Image + chat error:', err)
    }
  }

  // ========================================
  // RENDER UI
  // ========================================
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        🤖 Multi-Modal AI Agent Demo
      </h1>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Current Agent: <span className="font-bold">{agentId}</span>
        </p>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}
      </div>

      {/* 1. CHAT SECTION */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">🧠 1. Chat / Reasoning</h2>
        <button
          onClick={handleChat}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Thinking...' : 'Ask about AI Trends'}
        </button>
        
        <div className="mt-4 space-y-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded ${
                msg.role === 'user' 
                  ? 'bg-blue-100 ml-8' 
                  : 'bg-gray-100 mr-8'
              }`}
            >
              <p className="text-sm font-bold">{msg.role}</p>
              <p>{msg.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. EMBEDDINGS SECTION */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">🧩 2. Embeddings (Semantic Search)</h2>
        <button
          onClick={handleEmbedding}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Generate Embedding Vector
        </button>
        
        {embedding.length > 0 && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="text-sm">Dimensions: {embedding.length}</p>
            <p className="text-xs text-gray-600">
              First 5 values: [{embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Use this vector for semantic search, similarity matching, or clustering
            </p>
          </div>
        )}
      </section>

      {/* 3. IMAGE GENERATION SECTION */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">🎨 3. Image Generation</h2>
        <button
          onClick={handleImageGeneration}
          disabled={isLoading}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Generating...' : 'Generate AI Robot Image'}
        </button>
        
        {imageUrl && (
          <div className="mt-4">
            <img src={imageUrl} alt="Generated" className="max-w-md rounded shadow-lg" />
          </div>
        )}
      </section>

      {/* 4. SPEECH-TO-TEXT SECTION */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">🗣️ 4. Speech-to-Text</h2>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleTranscription(file)
          }}
          className="px-4 py-2 border rounded"
        />
        <p className="text-xs text-gray-600 mt-2">
          Upload audio file to transcribe (MP3, WAV, M4A, etc.)
        </p>
      </section>

      {/* 5. TEXT-TO-SPEECH SECTION */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">🗣️ 5. Text-to-Speech</h2>
        <button
          onClick={handleTextToSpeech}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Generating...' : 'Speak Introduction'}
        </button>
        <p className="text-xs text-gray-600 mt-2">
          Agent will speak with their unique voice
        </p>
      </section>

      {/* 6. VOICE CONVERSATION SECTION */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">💬 6. Voice Conversation</h2>
        <button
          onClick={handleVoiceConversation}
          disabled={isLoading}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Recording...' : 'Start Voice Chat'}
        </button>
        <p className="text-xs text-gray-600 mt-2">
          Speak → AI transcribes → AI responds → AI speaks back
        </p>
      </section>

      {/* 7. IMAGE + CHAT SECTION */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">🖼️ 7. Image Generation + Analysis</h2>
        <button
          onClick={handleImageWithChat}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Processing...' : 'Generate & Analyze Office Image'}
        </button>
        <p className="text-xs text-gray-600 mt-2">
          Generate image → AI analyzes it → Get insights
        </p>
      </section>

      {/* RESET BUTTON */}
      <div className="text-center">
        <button
          onClick={reset}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset All
        </button>
      </div>

      {/* DOCUMENTATION */}
      <section className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">📚 Available Models</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-bold">Chat/Reasoning:</h3>
            <ul className="list-disc list-inside">
              <li>gpt-5 (most advanced)</li>
              <li>gpt-4o (multimodal)</li>
              <li>gpt-4o-mini (fast & affordable)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold">Embeddings:</h3>
            <ul className="list-disc list-inside">
              <li>text-embedding-3-large</li>
              <li>text-embedding-3-small</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold">Image:</h3>
            <ul className="list-disc list-inside">
              <li>dall-e-3 (latest)</li>
              <li>dall-e-2</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold">Audio:</h3>
            <ul className="list-disc list-inside">
              <li>whisper-1 (transcription)</li>
              <li>tts-1-hd (text-to-speech)</li>
              <li>tts-1 (faster TTS)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
