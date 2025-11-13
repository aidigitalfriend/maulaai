'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { Brain, Moon, Sparkles, Eye, RefreshCw } from 'lucide-react'

export default function DreamInterpreterPage() {
  const [dream, setDream] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  const handleAnalyze = async () => {
    if (!dream.trim()) return
    setIsAnalyzing(true)
    await new Promise(resolve => setTimeout(resolve, 2500))
    setAnalysis({
      mainTheme: 'Transformation & Growth',
      emotions: ['Curiosity', 'Anticipation', 'Wonder'],
      symbols: [
        { symbol: 'Flying', meaning: 'Freedom, ambition, escaping limitations' },
        { symbol: 'Water', meaning: 'Emotions, subconscious, cleansing' },
        { symbol: 'Forest', meaning: 'Unknown, exploration, natural instincts' }
      ],
      interpretation: 'Your dream suggests you are going through a period of personal transformation. The recurring themes of flight and exploration indicate a desire for freedom and new experiences. The presence of water suggests deep emotional processing.'
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
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500">
              <Brain className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Dream Interpreter
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Analyze dreams and discover patterns in your subconscious
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-300">98 users active</span>
            </div>
            <div className="text-sm text-gray-400">•</div>
            <div className="text-sm text-gray-300">5,420 dreams analyzed</div>
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
              <Moon className="w-6 h-6 text-violet-400" />
              Describe Your Dream
            </label>

            <textarea
              value={dream}
              onChange={(e) => setDream(e.target.value)}
              placeholder="Describe your dream in as much detail as you can remember... What did you see? How did you feel? What happened?"
              className="w-full h-64 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors resize-none mb-6"
            />

            <button
              onClick={handleAnalyze}
              disabled={!dream.trim() || isAnalyzing}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing Dream...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Interpret My Dream
                </>
              )}
            </button>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-sm text-blue-300">
              <strong>💡 Tip:</strong> The more details you provide, the more accurate the interpretation. Include emotions, colors, people, and locations.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Eye className="w-6 h-6 text-purple-400" />
              Dream Analysis
            </h2>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-16 h-16 text-violet-400 animate-spin mb-4" />
                <p className="text-lg font-semibold">Interpreting your dream...</p>
                <p className="text-sm text-gray-400 mt-2">Analyzing symbols and patterns</p>
              </div>
            ) : analysis ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="p-4 bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/50 rounded-xl">
                  <div className="text-sm text-violet-300 mb-1">Main Theme</div>
                  <div className="text-xl font-bold">{analysis.mainTheme}</div>
                </div>

                <div>
                  <div className="text-lg font-semibold mb-3">Detected Emotions</div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.emotions.map((emotion: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full text-sm">
                        {emotion}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-lg font-semibold mb-3">Key Symbols</div>
                  <div className="space-y-3">
                    {analysis.symbols.map((item: any, i: number) => (
                      <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="font-semibold text-violet-300">{item.symbol}</div>
                        <div className="text-sm text-gray-300 mt-1">{item.meaning}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-lg font-semibold mb-2">Interpretation</div>
                  <p className="text-gray-300 text-sm leading-relaxed">{analysis.interpretation}</p>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Brain className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-center px-4">Your dream analysis will appear here</p>
                <p className="text-sm mt-2">Enter your dream and click Interpret</p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/50 rounded-2xl p-8 text-center"
        >
          <Brain className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Full AI Integration Coming Soon</h3>
          <p className="text-gray-300">
            This is a demo interface. AI-powered dream analysis backend will be added soon!
          </p>
        </motion.div>
      </div>
    </div>
  )
}
