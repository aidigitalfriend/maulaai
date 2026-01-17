'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { MessageSquare, Users, Trophy, Plus, Play, ThumbsUp, Loader2, Zap, RefreshCw } from 'lucide-react'

// Helper to get visitor ID from localStorage
const getVisitorId = () => {
  if (typeof window === 'undefined') return 'anonymous'
  let visitorId = localStorage.getItem('debateVisitorId')
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('debateVisitorId', visitorId)
  }
  return visitorId
}

interface Debate {
  debateId: string
  topic: string
  status: string
  agent1: {
    name: string
    position: string
    avatar: string
    provider: string
    response: string
    responseTime: number
    votes: number
  }
  agent2: {
    name: string
    position: string
    avatar: string
    provider: string
    response: string
    responseTime: number
    votes: number
  }
  totalVotes: number
  viewers: number
  votedUsers: string[]
  createdAt: string
}

export default function DebateArenaPage() {
  const [debates, setDebates] = useState<Debate[]>([])
  const [activeDebate, setActiveDebate] = useState<Debate | null>(null)
  const [isDebating, setIsDebating] = useState(false)
  const [newTopic, setNewTopic] = useState('')
  const [stats, setStats] = useState({ totalDebates: 0, activeUsers: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [votedDebates, setVotedDebates] = useState<Set<string>>(new Set())

  // Load debates from database
  const loadDebates = useCallback(async () => {
    try {
      const res = await fetch('/api/lab/debate-arena')
      const data = await res.json()
      if (data.success) {
        setDebates(data.debates || [])
        if (data.stats) {
          setStats({
            totalDebates: data.stats.totalDebates,
            activeUsers: data.stats.activeUsers,
          })
        }
        // Check which debates we've voted on
        const visitorId = getVisitorId()
        const voted = new Set<string>()
        for (const debate of data.debates || []) {
          if (debate.votedUsers?.includes(visitorId)) {
            voted.add(debate.debateId)
          }
        }
        setVotedDebates(voted)
      }
    } catch (error) {
      console.error('Failed to fetch debates:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load debates on mount and refresh periodically
  useEffect(() => {
    loadDebates()
    const interval = setInterval(loadDebates, 15000) // Refresh every 15 seconds
    return () => clearInterval(interval)
  }, [loadDebates])

  // Handle voting - persisted to database
  const handleVote = async (debateId: string, vote: 'agent1' | 'agent2') => {
    if (votedDebates.has(debateId)) return

    const visitorId = getVisitorId()

    try {
      const res = await fetch('/api/lab/debate-arena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'vote',
          debateId,
          vote,
          visitorId,
        }),
      })

      const data = await res.json()
      if (data.success) {
        // Update local state
        setVotedDebates(prev => new Set([...prev, debateId]))
        
        // Update debate in list
        setDebates(prev => prev.map(d => {
          if (d.debateId === debateId) {
            return {
              ...d,
              agent1: { ...d.agent1, votes: data.votes.agent1 },
              agent2: { ...d.agent2, votes: data.votes.agent2 },
              totalVotes: data.votes.total,
              votedUsers: [...d.votedUsers, visitorId],
            }
          }
          return d
        }))

        // Update active debate if it's the one being voted on
        if (activeDebate?.debateId === debateId) {
          setActiveDebate(prev => prev ? {
            ...prev,
            agent1: { ...prev.agent1, votes: data.votes.agent1 },
            agent2: { ...prev.agent2, votes: data.votes.agent2 },
            totalVotes: data.votes.total,
            votedUsers: [...prev.votedUsers, visitorId],
          } : null)
        }
      }
    } catch (error) {
      console.error('Vote error:', error)
    }
  }

  // Submit new debate topic
  const handleSubmitTopic = async () => {
    if (!newTopic.trim() || isSubmitting) return
    
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/lab/debate-arena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: newTopic.trim(),
          agent1Position: 'Pro',
          agent2Position: 'Con',
        }),
      })

      const data = await res.json()

      if (data.success && data.debate) {
        // Add new debate to list and set it as active
        setDebates(prev => [data.debate, ...prev])
        setNewTopic('')
        setActiveDebate(data.debate)
      }
    } catch (error) {
      console.error('Failed to create debate:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // View an existing debate
  const handleViewDebate = (debate: Debate) => {
    setActiveDebate(debate)
  }

  const hasVotedOnDebate = (debateId: string) => votedDebates.has(debateId)

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
              <span className="text-gray-300">{stats.activeUsers.toLocaleString()} users active</span>
            </div>
            <div className="text-sm text-gray-400">•</div>
            <div className="text-sm text-gray-300">{stats.totalDebates.toLocaleString()} debates hosted</div>
            <div className="text-sm text-gray-400">•</div>
            <div className="flex items-center gap-1 text-sm text-cyan-400">
              <Zap className="w-3 h-3" />
              <span>Nova vs Blaze</span>
            </div>
            <button
              onClick={loadDebates}
              className="ml-auto flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitTopic()}
                />
                <button 
                  onClick={handleSubmitTopic}
                  disabled={isSubmitting || !newTopic.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-yellow-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                  ) : (
                    'Start Debate'
                  )}
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
                Live Debates ({debates.length})
              </h2>

              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
                </div>
              ) : debates.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                  <MessageSquare className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                  <p className="text-xl text-gray-400">No debates yet</p>
                  <p className="text-gray-500 mt-2">Be the first to start a debate!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {debates.map((debate, index) => (
                    <motion.div
                      key={debate.debateId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
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
                              {debate.viewers || Math.floor(Math.random() * 100) + 50} watching
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-400">
                              <ThumbsUp className="w-4 h-4" />
                              {debate.totalVotes} total votes
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold mb-4">{debate.topic}</h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="p-4 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/50 rounded-xl">
                          <div className="text-4xl mb-2 text-center">{debate.agent1.avatar}</div>
                          <div className="text-lg font-bold text-center mb-1">{debate.agent1.name}</div>
                          <div className="text-xs text-center text-cyan-400 mb-1">Powered by {debate.agent1.provider}</div>
                          <div className="text-sm text-center text-gray-300 mb-3">{debate.agent1.position}</div>
                          <div className="flex items-center justify-center gap-2">
                            <ThumbsUp className="w-4 h-4 text-green-400" />
                            <span className="text-xl font-bold text-green-400">{debate.agent1.votes}</span>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-xl">
                          <div className="text-4xl mb-2 text-center">{debate.agent2.avatar}</div>
                          <div className="text-lg font-bold text-center mb-1">{debate.agent2.name}</div>
                          <div className="text-xs text-center text-purple-400 mb-1">Powered by {debate.agent2.provider}</div>
                          <div className="text-sm text-center text-gray-300 mb-3">{debate.agent2.position}</div>
                          <div className="flex items-center justify-center gap-2">
                            <ThumbsUp className="w-4 h-4 text-green-400" />
                            <span className="text-xl font-bold text-green-400">{debate.agent2.votes}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewDebate(debate)}
                        className="w-full py-4 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-yellow-500/50 transition-all flex items-center justify-center gap-3"
                      >
                        <Play className="w-5 h-5" />
                        View Debate & Vote
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
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
                <div className="text-2xl font-bold mb-1">{activeDebate.agent1.name}</div>
                <div className="text-xs text-cyan-400 mb-2">Powered by {activeDebate.agent1.provider}</div>
                <div className="text-gray-300 mb-4">{activeDebate.agent1.position}</div>
                <div className="text-2xl font-bold text-green-400 mb-3">{activeDebate.agent1.votes} votes</div>
                <button 
                  onClick={() => handleVote(activeDebate.debateId, 'agent1')}
                  disabled={hasVotedOnDebate(activeDebate.debateId)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    hasVotedOnDebate(activeDebate.debateId)
                      ? 'bg-gray-600 opacity-50 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/50'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  {hasVotedOnDebate(activeDebate.debateId) ? 'Already Voted' : 'Vote for Nova'}
                </button>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-2xl">
                <div className="text-6xl mb-4">{activeDebate.agent2.avatar}</div>
                <div className="text-2xl font-bold mb-1">{activeDebate.agent2.name}</div>
                <div className="text-xs text-purple-400 mb-2">Powered by {activeDebate.agent2.provider}</div>
                <div className="text-gray-300 mb-4">{activeDebate.agent2.position}</div>
                <div className="text-2xl font-bold text-green-400 mb-3">{activeDebate.agent2.votes} votes</div>
                <button 
                  onClick={() => handleVote(activeDebate.debateId, 'agent2')}
                  disabled={hasVotedOnDebate(activeDebate.debateId)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    hasVotedOnDebate(activeDebate.debateId)
                      ? 'bg-gray-600 opacity-50 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/50'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  {hasVotedOnDebate(activeDebate.debateId) ? 'Already Voted' : 'Vote for Blaze'}
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Debate Arguments</h3>
                <span className="text-xs text-cyan-400">⚡ Nova vs 🔥 Blaze - Real-time AI Debate</span>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded-lg">
                  <div className="font-semibold text-blue-400 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      ⚡ {activeDebate.agent1.name}
                      <span className="text-xs px-2 py-0.5 bg-white/10 rounded">{activeDebate.agent1.provider}</span>
                    </span>
                    <span className="text-xs text-gray-500">{activeDebate.agent1.responseTime}ms</span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{activeDebate.agent1.response}</p>
                </div>
                <div className="p-4 bg-purple-500/10 border-l-4 border-purple-500 rounded-lg">
                  <div className="font-semibold text-purple-400 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      🚀 {activeDebate.agent2.name}
                      <span className="text-xs px-2 py-0.5 bg-white/10 rounded">{activeDebate.agent2.provider}</span>
                    </span>
                    <span className="text-xs text-gray-500">{activeDebate.agent2.responseTime}ms</span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{activeDebate.agent2.response}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}
