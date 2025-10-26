'use client'

import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'

export default function JulieGirlfriendPage() {
  const handleSendMessage = async (message: string): Promise<string> => {
    // Simulate AI response with delay
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const responses = [
      "💕 Aww, you always know how to make me think! I love our conversations, babe...",
      "😘 That's so you! I admire how you see the world. Tell me more, sweetie...",
      "💖 You're amazing, you know that? Here's what I think about this...",
      "🥰 I love how passionate you are about this! It's one of the things I adore about you...",
      "💕 You always make me smile! Let me share my thoughts on this with you...",
      "😍 I could listen to you talk about anything! You're so interesting, babe..."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-rose-50">
      <div className="bg-gradient-to-r from-pink-400 to-red-500 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-pink-100 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              💕
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Julie Girlfriend</h1>
              <p className="text-pink-100 text-lg">Relationship Companion</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Relationships</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Dating</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Companionship</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="julie-girlfriend"
            agentName="Julie Girlfriend"
            agentColor="pink"
            initialMessage="💕 Hello, I am Julie, how can I help you today, sweetie?"
            onSendMessage={handleSendMessage}
            placeholder="Tell me about your day, babe! 💕"
            className="border border-red-200"
          />
        </div>
      </div>
    </div>
  )
}