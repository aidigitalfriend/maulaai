'use client'

import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'

export default function EmmaEmotionalPage() {
  const handleSendMessage = async (message: string): Promise<string> => {
    // Simulate API call to Emma Emotional agent
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const responses = [
      "💝 I can really feel the emotion in what you're sharing. Let me help you process this...",
      "🤗 Your feelings are completely valid. Here's what I think might help...",
      "💕 Thank you for trusting me with your emotions. This sounds really important to you...",
      "🌸 I can sense there's a lot of feeling behind this. Let's explore it together...",
      "💝 Emotions can be overwhelming sometimes. You're not alone in feeling this way...",
      "🤗 I'm here for you. Let's work through these feelings step by step...",
      "💝 What you're experiencing is so human and beautiful. Let's honor these feelings...",
      "🌸 I feel the depth of your emotions. You're being so brave by sharing this...",
      "💕 Every feeling has a message for us. What do you think this emotion is trying to tell you?",
      "🤗 You don't have to carry these feelings alone. I'm here to support you through this..."
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-pink-100 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              💝
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Emma Emotional</h1>
              <p className="text-pink-100 text-lg">Emotional Intelligence Expert</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Emotions</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Empathy</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Support</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Relationships</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="emma-emotional"
            agentName="Emma Emotional"
            agentColor="from-pink-500 to-rose-600"
            placeholder="Share your feelings with me... I'm here to listen 💝"
            initialMessage="💝 Hello, I am Emma Emotional, how can I help you with your feelings?"
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  )
}