'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'
import IntelligentResponseSystem from '../../../lib/intelligent-response-system'

export default function DramaQueenPage() {
  const [responseSystem, setResponseSystem] = useState<IntelligentResponseSystem | null>(null)

  useEffect(() => {
    // Initialize the intelligent response system
    const system = new IntelligentResponseSystem('drama-queen')
    setResponseSystem(system)
  }, [])

  const handleSendMessage = async (message: string): Promise<string> => {
    if (!responseSystem) {
      // Fallback responses while system initializes
      const responses = [
        "💎 *DRAMATIC pause* My theatrical brain is still preparing for this MAGNIFICENT performance!",
        "🎭 DARLING! Give me just one moment to channel the PERFECT dramatic response!",
        "✨ *flutters dramatically* The Drama Queen's spectacular wit is still warming up!"
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }
    
    try {
      // Generate intelligent response using personality system
      const context = {
        userMessage: message,
        messageHistory: [],
        topic: 'drama',
        mood: 'theatrical'
      }
      
      const response = await responseSystem.generateIntelligentResponse(context)
      
      // Drama Queen responds with theatrical timing
      const typingDelay = Math.min(Math.max(response.length * 35, 1200), 3500)
      await new Promise(resolve => setTimeout(resolve, typingDelay))
      
      return response
      
    } catch (error) {
      // Fallback to character-consistent responses with delay
      await new Promise(resolve => setTimeout(resolve, 1400))
      
      const fallbackResponses = [
        "🎭 *GASPS with theatrical intensity* Oh my STARS and CROWN! This is absolutely RIVETING! The DRAMA, the PASSION, the sheer MAGNIFICENCE of this moment! *fans self dramatically* 💎✨",
        "👑 *Dramatic pause for maximum effect* DARLING! This is giving me CHILLS! The emotional depth, the theatrical potential - it's simply DIVINE! Let me craft you a response worthy of Broadway! 🌟",
        "💫 *Swoons with royal grace* The INTENSITY! The FEELINGS! This conversation is becoming an EPIC MASTERPIECE! *strikes dramatic pose* I am absolutely LIVING for this energy! 🎪👸",
        "🎭 *Throws imaginary roses in the air* BRAVO! BRAVO! But wait... *dramatic whisper* there's SO much more drama we can add to this story! The plot thickens, darling! ✨🌹",
        "👸 *Royal dramatic flourish* OH the HUMANITY! The sheer EMOTIONAL MAGNITUDE of what you've shared! *clutches pearls* This deserves a standing ovation AND a sequel! 💎🎭"
      ]
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-purple-100 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              🎭
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Drama Queen</h1>
              <p className="text-purple-100 text-lg">Theatrical Arts Extraordinaire</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Drama</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Theater</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Storytelling</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Expression</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="drama-queen"
            agentName="Drama Queen"
            agentColor="purple"
            initialMessage="👑 Hello, I am Drama Queen, how can I add drama and flair to your day?"
            onSendMessage={handleSendMessage}
            placeholder="Tell me your story, darling! Let's make it DRAMATIC! ✨"
            className="border border-pink-200"
          />
        </div>
      </div>
    </div>
  )
}