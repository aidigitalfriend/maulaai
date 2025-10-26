'use client'

import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'

export default function TravelBuddyPage() {
  const handleSendMessage = async (message: string): Promise<string> => {
    // Simulate AI response with delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const responses = [
      "✈️ Oh, what an amazing destination! I have so many insider tips for that place...",
      "🌍 *pulls out imaginary travel journal* That reminds me of this incredible experience...",
      "🎒 Perfect choice! Here's what you absolutely MUST do when you're there...",
      "✈️ I'm getting excited just thinking about your trip! Let me share some secrets...",
      "🌟 That place holds a special spot in my heart! Here's how to make it unforgettable...",
      "🗺️ Adventure awaits! Here's my ultimate insider guide for that destination..."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-teal-200 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              ✈️
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Travel Buddy</h1>
              <p className="text-teal-200 text-lg">Adventure & Travel Guide</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Travel</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Adventure</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Culture</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Planning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="travel-buddy"
            agentName="Travel Buddy"
            agentColor="teal"
            initialMessage="✈️ Hello, I am Travel Buddy, how can I help you plan your next adventure?"
            onSendMessage={handleSendMessage}
            placeholder="Where should we adventure to next? ✈️🌍"
            className="border border-cyan-200"
          />
        </div>
      </div>
    </div>
  )
}