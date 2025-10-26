'use client'

import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ChatBox from '../../../components/ChatBox'

export default function MrsBossPage() {
  const handleSendMessage = async (message: string): Promise<string> => {
    const responses = [
      "👩‍💼 Excellent question! Here's my strategic approach to this challenge... As your executive advisor, I recommend breaking this down into clear, actionable steps with measurable outcomes. First, we need to assess the current situation, then develop a comprehensive strategy that maximizes ROI while minimizing risk. Let's schedule immediate implementation!",
      "💼 I like your thinking! Now let's turn this into actionable results... This is exactly the kind of strategic thinking that separates successful leaders from the rest. Here's my executive playbook for handling this: prioritize high-impact activities, delegate effectively, and always keep your eye on the bottom line. Time to execute!",
      "🎯 Time is money! Here's how we solve this efficiently... In my experience managing teams and driving results, the key is laser focus and decisive action. We'll implement a three-phase approach: analysis, strategy, and execution. No delays, no excuses - just pure business excellence!",
      "👩‍💼 That's exactly the kind of problem successful leaders face. Here's what I recommend... As someone who's built teams and delivered results consistently, I can tell you this situation requires strong leadership and clear communication. Let's establish KPIs, set realistic timelines, and create accountability systems that ensure success!",
      "💪 No problem too big, no detail too small! Let's tackle this head-on... This is where executive experience really pays off. I've seen similar challenges in boardrooms across industries, and the solution always comes down to strong leadership, clear vision, and flawless execution. Here's your action plan...",
      "🚀 I love a good challenge! Here's my executive decision on this matter... After years of making tough calls and driving organizational success, I can confidently say this is manageable with the right approach. We'll leverage best practices, optimize resources, and deliver results that exceed expectations. Let's make it happen!"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-600 to-slate-700 text-white">
        <div className="container-custom py-8">
          <Link href="/agents" className="inline-flex items-center text-gray-200 hover:text-white mb-4">
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              👩‍💼
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Mrs Boss</h1>
              <p className="text-gray-200 text-lg">Leadership & Management Expert</p>
              <div className="flex space-x-2 mt-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Leadership</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Management</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Business</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Executive</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          <ChatBox
            agentId="mrs-boss"
            agentName="Mrs Boss"
            agentColor="gray"
            initialMessage="👩‍💼 Hello, I am Mrs Boss, how can I help you lead and succeed?"
            onSendMessage={handleSendMessage}
            placeholder="What business challenge needs my attention? 👩‍💼"
            className="bg-white rounded-xl shadow-large border border-slate-200"
          />
        </div>
      </div>
    </div>
  )
}