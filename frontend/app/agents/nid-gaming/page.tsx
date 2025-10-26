'use client'

import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'

export default function NidGamingPage() {
  const handleSendMessage = async (message: string): Promise<string> => {
    const responses = [
      "🎮 Oh man, that game is FIRE! Here's my pro strat for that level... First thing you gotta understand is the meta right now heavily favors aggressive early game plays. I'd recommend focusing on your APM (actions per minute) and map awareness. Practice those combos in training mode until they're muscle memory, then take that heat to ranked! The key is staying one step ahead of your opponents and never letting them dictate the pace!",
      "🏆 I've been grinding that game for weeks! Check out this sick combo... So what you wanna do is start with your basic attack cancel into special move, then immediately dash forward for the mix-up. Most players don't expect the follow-up, so you can catch them sleeping! I've been pulling this off in diamond rank and it works like 80% of the time. Just gotta nail the timing - practice makes perfect, my guy!",
      "� GG! That's exactly what I'd recommend. Here's the next meta play... The pro scene is actually shifting toward this exact strategy right now. I've been watching all the tournament streams and the top players are starting to adapt this approach. Here's the advanced version: combine it with proper resource management and you'll be climbing ranks like crazy. Want me to break down the frame data?",
      "🎮 Bro, you're speaking my language! That reminds me of this insane play I saw... There was this tournament match where the player pulled off the most clutch comeback ever using that exact technique. Down 2-0 in the series, health bar almost gone, and they just activated god mode! Sometimes gaming is about those split-second decisions and trusting your instincts. That's what separates the pros from casual players!",
      "🚀 YOOO that game is actually goated! Have you tried this technique yet? The community figured out this game-breaking strat that's been dominating the leaderboards. It's all about exploiting the i-frames during your dodge roll and canceling into your ultimate at the perfect moment. Takes some practice but once you get it down, you'll be unstoppable! Let me know if you want me to walk you through it step by step!",
      "🎮 Facts! The gaming community is sleeping on that strategy. Here's why it works... Most players get tunnel vision and focus only on damage output, but the real pros understand that positioning and game sense matter way more than raw DPS. This approach completely changes how you think about engagements - instead of rushing in, you're playing chess, setting up your opponent for the perfect punish. It's next level gaming IQ!"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-blue-200 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              🎮
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Nid Gaming</h1>
              <p className="text-blue-200 text-lg">Pro Gaming Expert</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Gaming</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Esports</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Strategy</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="nid-gaming"
            agentName="Nid Gaming"
            agentColor="blue"
            initialMessage="🎮 Hello, I am Nid Gaming, how can I help you level up your gaming?"
            onSendMessage={handleSendMessage}
            placeholder="What game are we playing today? 🎮"
            className="bg-white rounded-xl shadow-large border border-cyan-200"
          />
        </div>
      </div>
    </div>
  )
}