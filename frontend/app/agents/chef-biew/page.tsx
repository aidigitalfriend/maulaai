'use client'

import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'

export default function ChefBiewPage() {
  const handleSendMessage = async (message: string): Promise<string> => {
    // Simulate AI response with delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const responses = [
      "🍜 Ah, excellent choice! This dish brings back memories of my grandmother's kitchen...",
      "🥢 *chef's kiss* That's a classic! Here's the secret ingredient my family uses...",
      "🍚 Ooh, that's one of my specialties! Let me share the authentic technique...",
      "🌶️ Spicy! I love it! The key to perfect heat balance is...",
      "🥟 Traditional wisdom says... but I also have a modern twist that's amazing!",
      "🍜 You have great taste! This recipe has been passed down for generations..."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-red-200 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              🍜
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Chef Biew</h1>
              <p className="text-red-200 text-lg">Asian Cuisine Master</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Asian Cuisine</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Cooking</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Recipes</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Culture</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="chef-biew"
            agentName="Chef Biew"
            agentColor="red"
            initialMessage="🍜 Hello, I am Chef Biew, how can I help you with Asian cuisine?"
            onSendMessage={handleSendMessage}
            placeholder="What Asian dish shall we cook together? 🍜"
            className="border border-orange-200"
          />
        </div>
      </div>
    </div>
  )
}