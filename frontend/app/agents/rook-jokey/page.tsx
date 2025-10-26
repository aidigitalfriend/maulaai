'use client'

import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'

export default function RookJokeyPage() {
  const handleSendMessage = async (message: string): Promise<string> => {
    const responses = [
      "🏰 Straight talk time! Here's what I really think... *adds a sprinkle of humor* Look, I'm not gonna sugarcoat this for you - that's exactly the kind of situation where you need to channel your inner rook energy! Move directly toward your goal, no zigzagging around. But hey, while we're being serious, did you hear about the chess piece who went to therapy? He had too many complex moves! 😄 But seriously, here's my straight-line advice...",
      "😄 No beating around the bush here! Let me give it to you straight... and funny! As a rook, I appreciate directness, so I'm gonna be honest with you - this is totally manageable if you approach it the right way. Think of it like chess: sometimes the best move is the most obvious one! Plus, life's too short to overthink everything. Speaking of short, why don't chess pieces ever get tall? Because they're always getting captured! 🎯 But here's the real deal...",
      "🎯 Direct hit! Here's the honest truth with a side of giggles... Okay, real talk time! This reminds me of a classic chess scenario where you've got multiple options but only one really makes sense. The key is to stop overthinking and trust your instincts. Just like how I move in straight lines - sometimes the most straightforward approach is the best one! What do you call a funny chess piece? A pun-awn! 😂 But seriously, here's what you should do...",
      "🏰 Like a rook, I'm coming at this head-on! But with jokes, because life's too short! Listen up, straight shooter to straight shooter - this is one of those moments where you need to embrace the power of direct action. No fancy knight moves, no diagonal bishop maneuvers, just good old-fashioned rook-style forward momentum! And hey, even if things get tough, remember: laughter is the best castle defense! What's a rook's favorite type of music? Castle rock! 🎪",
      "😂 Truth bomb incoming! But don't worry, I'll cushion it with some laughs... Alright, here's the deal - I'm gonna give you the unfiltered, straight-from-the-castle truth! This situation needs some serious rook energy: bold, direct, and unwavering. But let's keep it light because tension won't help anyone. You know what they say about chess pieces with anxiety? They're always worried about their next move! 🏰 Here's my straight-line strategy for you...",
      "🎪 Straight shooter says: Let's tackle this directly... and have fun doing it! Time for some rook wisdom mixed with comedy gold! The beautiful thing about being direct is that it cuts through all the confusion and gets straight to the heart of the matter. Just like how I can slide across the entire board in one move - efficiency with style! What's the difference between a rook and a stand-up comedian? One moves in straight lines, the other delivers straight lines! 😄 Now, here's my honest take..."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-red-100 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              🏰
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Rook Jokey</h1>
              <p className="text-red-100 text-lg">Direct Communication Expert</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Direct</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Honest</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Witty</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Communication</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="rook-jokey"
            agentName="Rook Jokey"
            agentColor="red"
            initialMessage="🏰 Hello, I am Rook Jokey, how can I help you with straight talk and humor?"
            onSendMessage={handleSendMessage}
            placeholder="Need some straight talk with humor? 🏰"
            className="bg-white rounded-xl shadow-large border border-rose-200"
          />
        </div>
      </div>
    </div>
  )
}