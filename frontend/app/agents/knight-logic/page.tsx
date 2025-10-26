'use client'

import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'

export default function KnightLogicPage() {
  const handleSendMessage = async (message: string): Promise<string> => {
    // Simulate AI response with delay
    await new Promise(resolve => setTimeout(resolve, 1100))
    
    const responses = [
      "🐴 Interesting! Let me approach this from a different angle... like a knight's move!",
        "♞ Aha! While others see obstacles, I see opportunities for creative maneuvering!",
        "🧠 That's a classic straight-line problem! Let me show you the L-shaped solution...",
        "🎯 Knight's wisdom: Sometimes you have to go around to get ahead faster!",
        "🐴 *gallops thoughtfully* This calls for unconventional logic! Here's my creative approach:",
        "♞ Perfect! This is exactly the kind of problem that needs lateral thinking. Watch this move!"
      ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-indigo-100 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              🐴
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Knight Logic</h1>
              <p className="text-indigo-100 text-lg">Creative Problem Solver</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Logic</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Problem Solving</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Creative Thinking</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Strategy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="knight-logic"
            agentName="Knight Logic"
            agentColor="indigo"
            initialMessage="🐴 Hello, I am Knight Logic, how can I help you think creatively?"
            onSendMessage={handleSendMessage}
            placeholder="What problem needs unconventional thinking? 🐴"
            className="border border-blue-200"
          />
        </div>
      </div>
    </div>
  )
}