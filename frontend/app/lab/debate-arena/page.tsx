'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Users, Trophy, Plus, Play, ThumbsUp, ThumbsDown } from 'lucide-react'

export default function DebateArenaPage() {
  const [activeDebate, setActiveDebate] = useState<any>(null)
  const [isDebating, setIsDebating] = useState(false)
  const [newTopic, setNewTopic] = useState('')

  const liveDebates = [
    {
      id: 1,
      topic: 'Is AI a threat or opportunity for humanity?',
      agent1: { name: 'Optimist AI', position: 'Opportunity', votes: 245, avatar: '🤖' },
      agent2: { name: 'Realist AI', position: 'Balanced Threat', votes: 198, avatar: '🧠' },
      viewers: 342,
      status: 'live'
    },
    {
      id: 2,
      topic: 'Should social media be regulated by governments?',
      agent1: { name: 'Liberty Bot', position: 'No Regulation', votes: 187, avatar: '🗽' },
      agent2: { name: 'Guardian AI', position: 'Yes, Regulate', votes: 223, avatar: '🛡️' },
      viewers: 289,
      status: 'live'
    },
    {
      id: 3,
      topic: 'Is remote work better than office work?',
      agent1: { name: 'Flex AI', position: 'Remote Wins', votes: 312, avatar: '🏠' },
      agent2: { name: 'Office Pro', position: 'Office Better', votes: 156, avatar: '🏢' },
      viewers: 234,
      status: 'live'
    }
  ]

  const handleStartDebate = async (debate: any) => {
    setActiveDebate(debate)
    setIsDebating(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsDebating(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Link href="/lab" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6">
            <span>←</span> Back to AI Lab
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500">
              <MessageSquare className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                AI Debate Arena
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Watch AI agents debate and vote on winners
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-300">132 users active</span>
            </div>
            <div className="text-sm text-gray-400">•</div>
            <div className="text-sm text-gray-300">6,120 debates hosted</div>
          </div>
        </motion.div>

        {!activeDebate ? (
          <div className="space-y-8">
            {/* Submit New Topic */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Plus className="w-6 h-6 text-yellow-400" />
                Submit Debate Topic
              </h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Suggest a debate topic for AI agents..."
                  className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                />
                <button className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-yellow-500/50 transition-all">
                  Submit
                </button>
              </div>
            </motion.div>

            {/* Live Debates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-400" />
                Live Debates
              </h2>

              <div className="grid grid-cols-1 gap-6">
                {liveDebates.map((debate, index) => (
                  <motion.div
                    key={debate.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-xs text-red-400 flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                            LIVE
                          </span>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Users className="w-4 h-4" />
                            {debate.viewers} watching
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{debate.topic}</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="p-4 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/50 rounded-xl">
                        <div className="text-4xl mb-2 text-center">{debate.agent1.avatar}</div>
                        <div className="text-lg font-bold text-center mb-1">{debate.agent1.name}</div>
                        <div className="text-sm text-center text-gray-300 mb-3">{debate.agent1.position}</div>
                        <div className="flex items-center justify-center gap-2">
                          <ThumbsUp className="w-4 h-4 text-green-400" />
                          <span className="text-xl font-bold text-green-400">{debate.agent1.votes}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-xl">
                        <div className="text-4xl mb-2 text-center">{debate.agent2.avatar}</div>
                        <div className="text-lg font-bold text-center mb-1">{debate.agent2.name}</div>
                        <div className="text-sm text-center text-gray-300 mb-3">{debate.agent2.position}</div>
                        <div className="flex items-center justify-center gap-2">
                          <ThumbsUp className="w-4 h-4 text-green-400" />
                          <span className="text-xl font-bold text-green-400">{debate.agent2.votes}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartDebate(debate)}
                      className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-yellow-500/50 transition-all flex items-center justify-center gap-3"
                    >
                      <Play className="w-5 h-5" />
                      Watch Debate
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
          >
            <button
              onClick={() => setActiveDebate(null)}
              className="mb-6 text-cyan-400 hover:text-cyan-300"
            >
              ← Back to debates
            </button>

            <h2 className="text-3xl font-bold mb-8 text-center">{activeDebate.topic}</h2>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/50 rounded-2xl">
                <div className="text-6xl mb-4">{activeDebate.agent1.avatar}</div>
                <div className="text-2xl font-bold mb-2">{activeDebate.agent1.name}</div>
                <div className="text-gray-300 mb-4">{activeDebate.agent1.position}</div>
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2">
                  <ThumbsUp className="w-5 h-5" />
                  Vote for {activeDebate.agent1.name}
                </button>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-2xl">
                <div className="text-6xl mb-4">{activeDebate.agent2.avatar}</div>
                <div className="text-2xl font-bold mb-2">{activeDebate.agent2.name}</div>
                <div className="text-gray-300 mb-4">{activeDebate.agent2.position}</div>
                <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2">
                  <ThumbsUp className="w-5 h-5" />
                  Vote for {activeDebate.agent2.name}
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/20 rounded-xl p-6 min-h-64">
              <h3 className="text-xl font-bold mb-4">Debate Stream</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 rounded-lg border-l-4 border-blue-500">
                  <div className="font-semibold text-blue-400 mb-2">{activeDebate.agent1.name}:</div>
                  <p className="text-gray-300">The benefits far outweigh the risks when we consider the potential...</p>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg border-l-4 border-purple-500">
                  <div className="font-semibold text-purple-400 mb-2">{activeDebate.agent2.name}:</div>
                  <p className="text-gray-300">While I acknowledge those points, we must also consider the implications...</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/50 rounded-2xl p-8 text-center"
        >
          <MessageSquare className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Full AI Integration Coming Soon</h3>
          <p className="text-gray-300">
            This is a demo interface. Real-time AI debate system will be integrated soon!
          </p>
        </motion.div>
      </div>
    </div>
  )
}
