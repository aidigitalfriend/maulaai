'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { Heart, Smile, Frown, Meh, AlertCircle, RefreshCw } from 'lucide-react'

export default function EmotionVisualizerPage() {
  const [text, setText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  const handleAnalyze = async () => {
    if (!text.trim()) {
      alert('Please enter text to analyze')
      return
    }
    
    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/lab/emotion-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        throw new Error('Emotion analysis failed')
      }

      const data = await response.json()
      
      // Format the response to match our UI structure
      const emotions = data.emotions
      const formattedAnalysis = {
        overall: {
          sentiment: emotions.overall > 0 ? 'Positive' : emotions.overall < 0 ? 'Negative' : 'Neutral',
          score: emotions.overall / 100,
          emoji: emotions.overall > 0 ? '😊' : emotions.overall < 0 ? '😢' : '😐'
        },
        emotions: [
          { name: 'Joy', intensity: emotions.joy || 0, color: 'from-yellow-500 to-orange-500', emoji: '😄' },
          { name: 'Trust', intensity: emotions.trust || 0, color: 'from-green-500 to-emerald-500', emoji: '🤝' },
          { name: 'Anticipation', intensity: emotions.anticipation || 0, color: 'from-blue-500 to-cyan-500', emoji: '🎯' },
          { name: 'Surprise', intensity: emotions.surprise || 0, color: 'from-purple-500 to-pink-500', emoji: '😲' },
          { name: 'Sadness', intensity: emotions.sadness || 0, color: 'from-blue-600 to-indigo-600', emoji: '😢' },
          { name: 'Fear', intensity: emotions.fear || 0, color: 'from-gray-500 to-slate-600', emoji: '😨' },
          { name: 'Anger', intensity: emotions.anger || 0, color: 'from-red-500 to-rose-500', emoji: '😠' },
          { name: 'Disgust', intensity: emotions.disgust || 0, color: 'from-green-700 to-emerald-800', emoji: '🤢' }
        ]
      }
      
      setAnalysis(formattedAnalysis)
    } catch (error) {
      console.error('Emotion analysis error:', error)
      alert('Emotion analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSentimentIcon = () => {
    if (!analysis) return <Meh className="w-12 h-12" />
    if (analysis.overall.score > 0.5) return <Smile className="w-12 h-12 text-green-400" />
    if (analysis.overall.score < -0.5) return <Frown className="w-12 h-12 text-red-400" />
    return <Meh className="w-12 h-12 text-yellow-400" />
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
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500">
              <Heart className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Emotion Visualizer
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Analyze emotions and visualize feelings in text
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-300">187 users active</span>
            </div>
            <div className="text-sm text-gray-400">•</div>
            <div className="text-sm text-gray-300">8,340 texts analyzed</div>
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
              <Heart className="w-6 h-6 text-pink-400" />
              Text to Analyze
            </label>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste any text here... social media post, email, article, or just your thoughts. The AI will detect and visualize the emotions!"
              className="w-full h-64 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-colors resize-none mb-6"
            />

            <button
              onClick={handleAnalyze}
              disabled={!text.trim() || isAnalyzing}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing Emotions...
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  Analyze Emotions
                </>
              )}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold mb-6">Emotion Analysis</h2>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-16 h-16 text-pink-400 animate-spin mb-4" />
                <p className="text-lg font-semibold">Detecting emotions...</p>
                <p className="text-sm text-gray-400 mt-2">Processing sentiment patterns</p>
              </div>
            ) : analysis ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="p-6 bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/50 rounded-xl text-center">
                  {getSentimentIcon()}
                  <div className="text-2xl font-bold mt-3">{analysis.overall.sentiment}</div>
                  <div className="text-sm text-gray-300 mt-1">
                    Score: {(analysis.overall.score * 100).toFixed(0)}%
                  </div>
                </div>

                <div>
                  <div className="text-lg font-semibold mb-4">Emotion Breakdown</div>
                  <div className="space-y-3">
                    {analysis.emotions.map((emotion: any, i: number) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{emotion.emoji}</span>
                            <span className="text-sm font-medium">{emotion.name}</span>
                          </div>
                          <span className="text-sm text-gray-400">{emotion.intensity}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${emotion.intensity}%` }}
                            transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                            className={`h-full bg-gradient-to-r ${emotion.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-lg font-semibold mb-3">Key Sentiment Words</div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((kw: any, i: number) => (
                      <span
                        key={i}
                        className={`px-4 py-2 bg-white/5 border rounded-full text-sm ${kw.color} border-current/30`}
                      >
                        {kw.word}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Heart className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-center px-4">Emotion visualization will appear here</p>
                <p className="text-sm mt-2">Enter text and click Analyze</p>
              </div>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  )
}
