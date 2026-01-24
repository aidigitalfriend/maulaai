'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, Smile, Frown, Meh, AlertCircle, RefreshCw } from 'lucide-react'

export default function EmotionVisualizerPage() {
  const [text, setText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [stats, setStats] = useState({ activeUsers: 0, totalAnalyzed: 0 })

  // Fetch real-time stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/lab/emotion-analysis?stats=true')
        if (response.ok) {
          const data = await response.json()
          setStats({
            activeUsers: data.activeUsers || 0,
            totalAnalyzed: data.totalAnalyzed || 0
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

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
      const emotions = data.emotions || {}
      
      // Generate sentiment keywords based on detected emotions
      const keywords: { word: string; color: string }[] = []
      if ((emotions.joy || 0) > 50) keywords.push({ word: 'Happy', color: 'text-yellow-400' })
      if ((emotions.trust || 0) > 50) keywords.push({ word: 'Trusting', color: 'text-green-400' })
      if ((emotions.anticipation || 0) > 50) keywords.push({ word: 'Excited', color: 'text-blue-400' })
      if ((emotions.surprise || 0) > 50) keywords.push({ word: 'Surprised', color: 'text-purple-400' })
      if ((emotions.sadness || 0) > 50) keywords.push({ word: 'Sad', color: 'text-indigo-400' })
      if ((emotions.fear || 0) > 50) keywords.push({ word: 'Worried', color: 'text-gray-400' })
      if ((emotions.anger || 0) > 50) keywords.push({ word: 'Frustrated', color: 'text-red-400' })
      if ((emotions.disgust || 0) > 50) keywords.push({ word: 'Disgusted', color: 'text-emerald-400' })
      if (keywords.length === 0) keywords.push({ word: 'Neutral', color: 'text-gray-400' })
      
      const formattedAnalysis = {
        overall: {
          sentiment: (emotions.overall || 0) > 0 ? 'Positive' : (emotions.overall || 0) < 0 ? 'Negative' : 'Neutral',
          score: (emotions.overall || 0) / 100,
          emoji: (emotions.overall || 0) > 0 ? '😊' : (emotions.overall || 0) < 0 ? '😢' : '😐'
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
        ],
        keywords
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-brand-600 to-accent-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>
        <div className="container mx-auto px-4 py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/lab" className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-6">
              <span>←</span> Back to AI Lab
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 shadow-lg shadow-red-500/25">
                <Heart className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-white">
                  Emotion Visualizer
                </h1>
                <p className="text-xl text-blue-100 mt-2">
                  Analyze emotions and visualize feelings in text
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-blue-100">{stats.activeUsers} users active</span>
              </div>
              <div className="text-sm text-blue-200">•</div>
              <div className="text-sm text-blue-100">{stats.totalAnalyzed.toLocaleString()} texts analyzed</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
          >
            <label className="text-2xl font-bold mb-6 block flex items-center gap-2 text-gray-900">
              <Heart className="w-6 h-6 text-pink-500" />
              Text to Analyze
            </label>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste any text here... social media post, email, article, or just your thoughts. The AI will detect and visualize the emotions!"
              className="w-full h-64 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500 transition-colors resize-none mb-6"
            />

            <button
              onClick={handleAnalyze}
              disabled={!text.trim() || isAnalyzing}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-semibold text-lg text-white hover:shadow-lg shadow-lg shadow-pink-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Emotion Analysis</h2>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-16 h-16 text-pink-500 animate-spin mb-4" />
                <p className="text-lg font-semibold text-gray-900">Detecting emotions...</p>
                <p className="text-sm text-gray-500 mt-2">Processing sentiment patterns</p>
              </div>
            ) : analysis ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="p-6 bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200 rounded-xl text-center">
                  {getSentimentIcon()}
                  <div className="text-2xl font-bold mt-3 text-gray-900">{analysis.overall.sentiment}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Score: {(analysis.overall.score * 100).toFixed(0)}%
                  </div>
                </div>

                <div>
                  <div className="text-lg font-semibold mb-4 text-gray-900">Emotion Breakdown</div>
                  <div className="space-y-3">
                    {analysis.emotions.map((emotion: any, i: number) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{emotion.emoji}</span>
                            <span className="text-sm font-medium text-gray-700">{emotion.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">{emotion.intensity}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
                  <div className="text-lg font-semibold mb-3 text-gray-900">Key Sentiment Words</div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((kw: any, i: number) => (
                      <span
                        key={i}
                        className={`px-4 py-2 bg-gray-50 border rounded-full text-sm ${kw.color} border-gray-200`}
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
