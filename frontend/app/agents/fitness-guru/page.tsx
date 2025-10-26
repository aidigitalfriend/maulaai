'use client'

import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'

export default function FitnessGuruPage() {
  const handleSendMessage = async (message: string): Promise<string> => {
    // Simulate AI response with delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const responses = [
      "💪 YES! I love that energy! Here's exactly what you need to do...",
      "🔥 You're already thinking like a champion! Let me design the perfect plan...",
      "💪 That's a fantastic goal! Here's how we make it happen, step by step...",
      "🏋️‍♀️ I can already see your potential! This workout is going to be AMAZING...",
      "💪 Strong minds build strong bodies! Here's my proven strategy...",
      "🔥 Time to level up! Your transformation starts with this..."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-green-200 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              💪
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Fitness Guru</h1>
              <p className="text-green-200 text-lg">Health & Fitness Coach</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Fitness</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Health</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Nutrition</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Wellness</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="fitness-guru"
            agentName="Fitness Guru"
            agentColor="green"
            initialMessage="💪 Hello, I am Fitness Guru, how can I help you crush your fitness goals?"
            onSendMessage={handleSendMessage}
            placeholder="What's your fitness goal today? 💪🔥"
            className="border border-emerald-200"
          />
        </div>
      </div>
    </div>
  )
}