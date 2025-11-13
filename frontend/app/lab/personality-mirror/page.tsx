'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { User, Brain, MessageSquare, TrendingUp, RefreshCw } from 'lucide-react'

export default function PersonalityMirrorPage() {
  const [text, setText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleAnalyze = async () => {
    if (!text.trim()) return
    setIsAnalyzing(true)
    await new Promise(resolve => setTimeout(resolve, 2500))
    setResults({
      personality: 'ENFP - The Campaigner',
      traits: [
        { name: 'Openness', score: 85, color: 'from-purple-500 to-pink-500' },
        { name: 'Conscientiousness', score: 72, color: 'from-blue-500 to-cyan-500' },
        { name: 'Extraversion', score: 78, color: 'from-green-500 to-emerald-500' },
        { name: 'Agreeableness', score: 81, color: 'from-yellow-500 to-orange-500' },
        { name: 'Emotional Stability', score: 68, color: 'from-red-500 to-pink-500' }
      ],
      communication: 'Enthusiastic and expressive',
      strengths: ['Creative thinking', 'Empathetic', 'Adaptable', 'Inspiring'],
      suggestions: ['Focus on follow-through', 'Practice active listening', 'Set clear boundaries']
    })
    setIsAnalyzing(false)
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
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500">
              <User className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Personality Mirror
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Discover your communication style and personality traits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-300">165 users active</span>
            </div>
            <div className="text-sm text-gray-400">•</div>
            <div className="text-sm text-gray-300">7,650 analyses completed</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <label className="text-2xl font-bold mb-6 block flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-teal-400" />
              Your Writing Sample
            </label>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a few paragraphs about yourself, your thoughts, or respond to a prompt... The more you write, the more accurate the analysis!"
              className="w-full h-64 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-colors resize-none mb-6"
            />

            <button
              onClick={handleAnalyze}
              disabled={!text.trim() || isAnalyzing}
              className="w-full py-4 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-teal-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-6"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Analyze Personality
                </>
              )}
            </button>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-sm text-blue-300">
              <strong>💡 Tip:</strong> Write naturally! The AI analyzes your word choice, sentence structure, and expression patterns to understand your personality.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-cyan-400" />
              Your Personality Profile
            </h2>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-16 h-16 text-teal-400 animate-spin mb-4" />
                <p className="text-lg font-semibold">Analyzing your personality...</p>
                <p className="text-sm text-gray-400 mt-2">Processing linguistic patterns</p>
              </div>
            ) : results ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="p-6 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border border-teal-500/50 rounded-xl text-center">
                  <User className="w-12 h-12 text-teal-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold">{results.personality}</div>
                  <div className="text-sm text-gray-300 mt-1">{results.communication}</div>
                </div>

                <div>
                  <div className="text-lg font-semibold mb-4">Personality Traits</div>
                  <div className="space-y-4">
                    {results.traits.map((trait: any, i: number) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{trait.name}</span>
                          <span className="text-sm text-gray-400">{trait.score}%</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${trait.score}%` }}
                            transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                            className={`h-full bg-gradient-to-r ${trait.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-lg font-semibold mb-3">Key Strengths</div>
                  <div className="flex flex-wrap gap-2">
                    {results.strengths.map((strength: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-teal-500/20 border border-teal-500/50 rounded-full text-sm">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    Growth Suggestions
                  </div>
                  <ul className="space-y-2">
                    {results.suggestions.map((suggestion: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <User className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-center px-4">Your personality analysis will appear here</p>
                <p className="text-sm mt-2">Write something and click Analyze</p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border border-teal-500/50 rounded-2xl p-8 text-center"
        >
          <User className="w-12 h-12 text-teal-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Full AI Integration Coming Soon</h3>
          <p className="text-gray-300">
            This is a demo interface. Advanced personality analysis AI will be integrated soon!
          </p>
        </motion.div>
      </div>
    </div>
  )
}
