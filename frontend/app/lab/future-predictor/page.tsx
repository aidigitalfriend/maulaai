'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Zap, Target, Calendar, RefreshCw } from 'lucide-react'

export default function FuturePredictorPage() {
  const [topic, setTopic] = useState('')
  const [timeframe, setTimeframe] = useState('1-year')
  const [isPredicting, setIsPredicting] = useState(false)
  const [prediction, setPrediction] = useState<any>(null)

  const timeframes = [
    { id: '6-months', label: '6 Months' },
    { id: '1-year', label: '1 Year' },
    { id: '3-years', label: '3 Years' },
    { id: '5-years', label: '5 Years' },
    { id: '10-years', label: '10 Years' }
  ]

  const exampleTopics = [
    'AI in healthcare',
    'Remote work trends',
    'Electric vehicles adoption',
    'Space exploration',
    'Cryptocurrency regulation',
    'Climate change solutions'
  ]

  const handlePredict = async () => {
    if (!topic.trim()) return
    setIsPredicting(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
    setPrediction({
      confidence: 78,
      trend: 'Rising',
      keyInsights: [
        'Rapid adoption expected in Q2 2026',
        'Major tech companies investing heavily',
        'Regulatory frameworks being developed'
      ],
      scenarios: [
        { type: 'Optimistic', probability: 35, description: 'Mainstream adoption with full regulatory support' },
        { type: 'Moderate', probability: 50, description: 'Gradual adoption with mixed regulatory environment' },
        { type: 'Conservative', probability: 15, description: 'Slow adoption due to regulatory challenges' }
      ],
      relatedTrends: ['AI Ethics', 'Data Privacy', 'Digital Infrastructure']
    })
    setIsPredicting(false)
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
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500">
              <TrendingUp className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Future Predictor
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Forecast trends and explore future scenarios with AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-300">87 users active</span>
            </div>
            <div className="text-sm text-gray-400">•</div>
            <div className="text-sm text-gray-300">4,890 predictions made</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <label className="text-lg font-semibold mb-4 block flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                What do you want to predict?
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI in healthcare, remote work trends..."
                className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors mb-4"
              />
              
              <div className="text-sm text-gray-400 mb-2">Example topics:</div>
              <div className="flex flex-wrap gap-2">
                {exampleTopics.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setTopic(ex)}
                    className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/20 hover:border-indigo-500/50 transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <label className="text-lg font-semibold mb-4 block flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Timeframe
              </label>
              <div className="grid grid-cols-3 gap-3">
                {timeframes.map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setTimeframe(tf.id)}
                    className={`px-4 py-3 rounded-xl text-sm transition-all ${
                      timeframe === tf.id
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 border border-indigo-500'
                        : 'bg-white/5 border border-white/20 hover:border-white/40'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handlePredict}
              disabled={!topic.trim() || isPredicting}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isPredicting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Predicting Future...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate Prediction
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
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              Prediction Results
            </h2>

            {isPredicting ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-16 h-16 text-indigo-400 animate-spin mb-4" />
                <p className="text-lg font-semibold">Analyzing trends...</p>
                <p className="text-sm text-gray-400 mt-2">Processing data patterns</p>
              </div>
            ) : prediction ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 border border-indigo-500/50 rounded-xl text-center">
                    <div className="text-3xl font-bold text-indigo-400">{prediction.confidence}%</div>
                    <div className="text-sm text-gray-300 mt-1">Confidence</div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 rounded-xl text-center">
                    <div className="text-3xl font-bold text-green-400">↗</div>
                    <div className="text-sm text-gray-300 mt-1">{prediction.trend}</div>
                  </div>
                </div>

                <div>
                  <div className="text-lg font-semibold mb-3">Key Insights</div>
                  <ul className="space-y-2">
                    {prediction.keyInsights.map((insight: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-lg font-semibold mb-3">Future Scenarios</div>
                  <div className="space-y-3">
                    {prediction.scenarios.map((scenario: any, i: number) => (
                      <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{scenario.type}</span>
                          <span className="text-sm text-gray-400">{scenario.probability}% chance</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
                            style={{ width: `${scenario.probability}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-300">{scenario.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-lg font-semibold mb-3">Related Trends</div>
                  <div className="flex flex-wrap gap-2">
                    {prediction.relatedTrends.map((trend: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full text-sm">
                        {trend}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <TrendingUp className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-center px-4">Your prediction will appear here</p>
                <p className="text-sm mt-2">Enter a topic and timeframe</p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 border border-indigo-500/50 rounded-2xl p-8 text-center"
        >
          <TrendingUp className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Full AI Integration Coming Soon</h3>
          <p className="text-gray-300">
            This is a demo interface. Advanced trend forecasting AI will be integrated soon!
          </p>
        </motion.div>
      </div>
    </div>
  )
}
