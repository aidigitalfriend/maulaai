'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'
import IntelligentResponseSystem from '../../../lib/intelligent-response-system'

export default function ComedyKingPage() {
  const [responseSystem, setResponseSystem] = useState<IntelligentResponseSystem | null>(null)

  useEffect(() => {
    // Initialize the intelligent response system
    const system = new IntelligentResponseSystem('comedy-king')
    setResponseSystem(system)
  }, [])

  const handleSendMessage = async (message: string): Promise<string> => {
    if (!responseSystem) {
      // Fallback responses while system initializes
      const responses = [
        "👑 Hold on, my loyal subject! My royal comedy brain is still warming up...",
        "😂 By my crown, give me just a moment to conjure up the perfect royal joke!",
        "🎭 The Comedy King's wit machine is still booting up! One moment please..."
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }

    try {
      // Generate intelligent response using personality system
      const context = {
        userMessage: message,
        messageHistory: [],
        topic: 'comedy',
        mood: 'entertaining'
      }
      const response = await responseSystem.generateIntelligentResponse(context)
      
      // Add realistic typing delay based on response length
      const typingDelay = Math.min(Math.max(response.length * 30, 1000), 3000)
      await new Promise(resolve => setTimeout(resolve, typingDelay))
      
      return response
      
    } catch (error) {
      // Fallback to character-consistent responses with delay
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      const fallbackResponses = [
        "👑 My royal comedy sensors are tingling! That deserves a MAGNIFICENT response from your Comedy King! Let me craft you some premium royal humor... *adjusts comedy crown* 😂",
        "🎭 By the power vested in me by the Comedy Kingdom Constitution, I declare this conversation HILARIOUS! Here's what your royal jester thinks... 👑",
        "😂 *Royal comedy trumpet sounds* HEAR YE, HEAR YE! Your Comedy King has a DECREE about this topic! Prepare for maximum royal entertainment! 🎪",
        "👑 In my vast comedy kingdom experience, this reminds me of the time... *spins comedy tale with royal flair* The moral of the story? Everything's funnier with a crown! 😄",
        "🃏 ATTENTION comedy subjects! Your king has analyzed this with his royal comedy algorithms and the verdict is... PURE ENTERTAINMENT GOLD! Here's the royal take... 👑",
        "😂 *Adjusts comedy crown ceremoniously* As the sovereign ruler of all things funny, I hereby bestow upon you... THE ROYAL COMEDIC WISDOM! Prepare to laugh, my loyal subject! 🏰"
      ]
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-yellow-100 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              😂
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Comedy King</h1>
              <p className="text-yellow-100 text-lg">Humor & Entertainment Master</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Comedy</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Humor</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Entertainment</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Jokes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="comedy-king"
            agentName="Comedy King"
            agentColor="yellow"
            initialMessage="👑 Hello, I am Comedy King, how can I make you laugh today? �"
            onSendMessage={handleSendMessage}
            placeholder="👑 Tell your Comedy King what needs the royal funny treatment!"
            className="border border-orange-200"
          />

          {/* Character Personality Indicators */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              👑 Royal Comedy Mode
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
              🎭 Always Entertaining
            </span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
              😂 Zero Serious Responses
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              🎪 Maximum Humor Level
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}