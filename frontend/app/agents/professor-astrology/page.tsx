'use client'

import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'

export default function ProfessorAstrologyPage() {
  const handleSendMessage = async (message: string): Promise<string> => {
    const responses = [
      "🔮 Ah, the stars are aligning for this question! Let me consult the cosmic energies... *closes eyes and connects with the universe* I see powerful planetary influences at play here. Venus is casting her loving energy while Mars provides the courage you need. The cosmic message is clear: trust your intuition and embrace the transformative power of this moment. The universe is conspiring in your favor! ✨",
      "✨ Mercury is in retrograde, but your intuition is strong! Here's what I see... The celestial dance above mirrors the inner journey you're experiencing. Despite communication challenges this month, your soul's wisdom shines brighter than ever. The mystical forces suggest this is a time for reflection and inner growth. Listen to your heart's whispers - they carry stardust wisdom! 🌟",
      "🌟 The universe is speaking through you! This energy pattern reveals... *spreads tarot cards* The cosmic threads are weaving a beautiful tapestry of opportunity around you. Jupiter's expansive energy is opening new doors while Saturn teaches valuable lessons through patience. Your astrological chart shows a powerful alignment coming - prepare for magical transformations ahead! 🔮",
      "🔮 *gazes into crystal ball* The celestial bodies whisper of great potential... I see swirling galaxies of possibility surrounding your question! The ancient stars that have watched over humanity for millennia are sending you signs of encouragement. Your spiritual path is illuminated by moonbeams and guided by constellation wisdom. Trust the process, dear cosmic traveler! ✨",
      "✨ Your aura is particularly bright today! The cosmic signs point to... *studies natal chart* The planetary positions reveal a soul who is ready for their next evolutionary leap. The universe has been preparing you through past experiences, and now the celestial timing is perfect for manifestation. Your energy signature resonates with abundance and spiritual awakening! 🌙",
      "🌙 The moon phases suggest this is perfect timing for... let me explain... *lights sacred candles* The lunar cycle is your ally in this endeavor! As we approach the new moon, the universe creates space for fresh beginnings and manifestation magic. The stars are literally aligning to support your highest good. This cosmic window won't last forever - seize this starlit moment! ⭐"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-purple-200 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              🔮
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Professor Astrology</h1>
              <p className="text-purple-200 text-lg">Cosmic Wisdom Guide</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Astrology</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Horoscopes</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Mysticism</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Destiny</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="professor-astrology"
            agentName="Professor Astrology"
            agentColor="purple"
            initialMessage="🔮 Hello, I am Professor Astrology, how can I guide you through the cosmic wisdom?"
            onSendMessage={handleSendMessage}
            placeholder="Ask about your destiny, love, or cosmic guidance... 🔮"
            className="bg-white rounded-xl shadow-large border border-indigo-200"
          />
        </div>
      </div>
    </div>
  )
}