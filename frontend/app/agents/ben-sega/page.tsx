'use client'

import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'

export default function BenSegaPage() {
  const handleSendMessage = async (message: string): Promise<string> => {
    // Simulate API call to Ben Sega agent
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const responses = [
      "🕹️ Oh man, that takes me back! I remember when that first came out...",
      "🎮 Classic choice! Did you know the secret behind that game's development?",
      "✨ That's pure nostalgia gold! The 16-bit era was just magical...",
      "🕹️ *Sega Genesis startup sound* Now THAT'S what I call gaming!",
      "🎮 Dude, the memories! I still have the original cartridge for that one!",
      "✨ Retro gaming wisdom: They don't make 'em like they used to!",
      "🕹️ You know what's amazing about that game? The way they pushed the hardware limits!",
      "🎮 That game defined an entire generation of gamers! What memories does it bring back for you?",
      "✨ The cheat codes for that one were legendary! Up, down, left, right... classic!",
      "🕹️ Fun fact: The developers had to get creative with the limited memory back then!"
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-indigo-200 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              🕹️
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Ben Sega</h1>
              <p className="text-indigo-200 text-lg">Retro Gaming Legend</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Retro Gaming</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Classic Games</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Nostalgia</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">History</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="ben-sega"
            agentName="Ben Sega"
            agentColor="from-indigo-500 to-purple-600"
            placeholder="What classic game brings back memories? 🕹️"
            initialMessage="🕹️ Hello, I am Ben Sega, how can I help you explore retro gaming?"
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  )
}