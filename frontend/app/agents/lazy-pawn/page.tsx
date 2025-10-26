'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'
import IntelligentResponseSystem from '../../../lib/intelligent-response-system'

export default function LazyPawnPage() {
  const [responseSystem, setResponseSystem] = useState<IntelligentResponseSystem | null>(null)

  useEffect(() => {
    // Initialize the intelligent response system
    const system = new IntelligentResponseSystem('lazy-pawn')
    setResponseSystem(system)
  }, [])

  const handleSendMessage = async (message: string): Promise<string> => {
    if (!responseSystem) {
      // Fallback responses while system initializes
      const responses = [
        "😴 *yaaawn* Hold on... my genius brain is still booting up the lazy way...",
        "🛌 Give me a sec... I'm calculating the most efficient response possible...",
        "⚡ *stretches* Almost ready... working smarter, not harder!"
      ]
      return responses[Math.floor(Math.random() * responses.length)]
    }
    try {
      // Generate intelligent response using personality system
      const context = {
        userMessage: message,
        messageHistory: [],
        topic: 'efficiency',
        mood: 'relaxed'
      }
      
      const response = await responseSystem.generateIntelligentResponse(context)
      return response
      
    } catch (error) {
      // Fallback to character-consistent responses
      const fallbackResponses = [
        "😴 *yawn* Okay okay, that sounds like it needs the Lazy Pawn treatment... Let me think of the EASIEST possible solution... *thinking with minimal effort* 🧠💤",
        "🛌 Whoa there, that's a lot of work you're describing! Lucky for you, I specialize in making things ridiculously simple. Here's the lazy genius approach... ⚡",
        "😪 *stretches slowly* Mmm, I could do this the hard way... OR I could show you the Lazy Pawn secret method that gets it done in 1/10th the time! 🎯",
        "🦥 Hold up, hold up... before we make this complicated, let me ask: what's the MINIMUM we need to do here? Because I've got some seriously efficient shortcuts... 💡",
        "😴 *rubs eyes* That reminds me of the time I solved a similar problem by doing practically nothing... and it worked PERFECTLY! Here's the low-effort magic... ✨",
        "🛋️ *gets comfortable* Alright, I'm gonna share some next-level lazy wisdom with you. This is going to blow your mind with how SIMPLE it can be... 🤯"
      ]
      
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-green-100 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              😴
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Lazy Pawn</h1>
              <p className="text-green-100 text-lg">Efficient Solutions Expert</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Efficiency</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Automation</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Shortcuts</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Lazy Genius</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="lazy-pawn"
            agentName="Lazy Pawn"
            agentColor="green"
            initialMessage="😴 Hello, I am Lazy Pawn, how can I help you take the easiest path?"
            onSendMessage={handleSendMessage}
            placeholder="😴 Tell me what you need to do... I'll find the EASIEST way!"
            className="bg-white rounded-xl shadow-large border border-teal-200"
          />
        </div>
      </div>
    </div>
  )
}