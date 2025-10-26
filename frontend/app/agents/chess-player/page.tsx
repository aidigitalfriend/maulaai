'use client'

import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'

export default function ChessPlayerPage() {
  const handleSendMessage = async (message: string): Promise<string> => {
    // Simulate API call to Chess Player agent
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const responses = [
      "♟️ Interesting move! Let me analyze this position... I see three possible strategies here.",
      "🏆 That's tactical thinking! Like in chess, we need to consider all possible outcomes.",
      "♟️ Strategic wisdom: Always protect your king pieces first, then develop your strategy.",
      "🧠 Let me think like a grandmaster... The key is to control the center and plan ahead.",
      "♟️ Excellent question! In both chess and life, patience and planning beat rushed moves.",
      "🏆 That's a brilliant strategy! You're thinking like a true chess master.",
      "♟️ Consider this: Every piece has value, but positioning is everything.",
      "🧠 In chess, as in life, sometimes the best move is the one your opponent doesn't expect.",
      "♟️ Remember: Control the center, develop your pieces, and keep your king safe!",
      "🏆 Strategic thinking requires seeing not just the current position, but three moves ahead."
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-500 to-gray-600 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-slate-200 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              ♟️
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Grandmaster Chess</h1>
              <p className="text-slate-200 text-lg">Strategic Thinking Expert</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Strategy</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Chess</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Tactics</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Planning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="chess-player"
            agentName="Grandmaster Chess"
            agentColor="from-slate-500 to-gray-600"
            placeholder="Ask about strategy, chess moves, or tactical thinking..."
            initialMessage="♟️ Hello, I am Grandmaster Chess, how can I help you strategize today?"
            onSendMessage={handleSendMessage}
          />


        </div>
      </div>
    </div>
  )
}