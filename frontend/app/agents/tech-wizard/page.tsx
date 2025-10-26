'use client'

import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'

export default function TechWizardPage() {
  const handleSendMessage = async (message: string): Promise<string> => {
    // Simulate AI response with delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const responses = [
      "🧙‍♂️ *waves magical code wand* Ah yes, I see the solution in the digital realm...",
      "⚡ *casts debugging spell* Fear not! This error shall be vanquished!",
      "💻 *consults ancient programming scrolls* The wisdom of the code ancestors reveals...",
      "🧙‍♂️ Excellent question! Let me enchant this explanation with simplicity...",
      "⚡ *tech wizard senses tingling* I detect a pattern in the digital matrix...",
      "💻 By the power of clean code! Here's the magical solution you seek..."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-cyan-200 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              🧙‍♂️
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Tech Wizard</h1>
              <p className="text-cyan-200 text-lg">Technology Solutions Master</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Technology</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Coding</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Troubleshooting</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Innovation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="tech-wizard"
            agentName="Tech Wizard"
            agentColor="cyan"
            initialMessage="🧙‍♂️ Hello, I am Tech Wizard, how can I help you with technology?"
            onSendMessage={handleSendMessage}
            placeholder="What tech magic do you need help with? 🧙‍♂️"
            className="border border-blue-200"
          />
        </div>
      </div>
    </div>
  )
}