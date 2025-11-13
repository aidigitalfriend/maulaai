'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { Swords, Trophy, Zap, Clock, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react'

interface ModelOption {
  id: string
  name: string
  color: string
  icon: string
  description: string
}

interface BattleResponse {
  text: string
  responseTime: number
  tokens: number
}

interface RoundResult {
  round: number
  model1Response: BattleResponse
  model2Response: BattleResponse
  winner: string | null
}

export default function BattleArenaPage() {
  const [prompt, setPrompt] = useState('')
  const [model1, setModel1] = useState<string>('')
  const [model2, setModel2] = useState<string>('')
  const [currentRound, setCurrentRound] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [battleHistory, setBattleHistory] = useState<RoundResult[]>([])
  const [showResults, setShowResults] = useState(false)

  const models: ModelOption[] = [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      color: 'from-green-500 to-emerald-500',
      icon: '🤖',
      description: 'OpenAI\'s most capable model'
    },
    {
      id: 'claude-3',
      name: 'Claude 3',
      color: 'from-orange-500 to-amber-500',
      icon: '🧠',
      description: 'Anthropic\'s constitutional AI'
    },
    {
      id: 'gemini',
      name: 'Gemini Pro',
      color: 'from-blue-500 to-cyan-500',
      icon: '✨',
      description: 'Google\'s multimodal AI'
    },
    {
      id: 'mistral',
      name: 'Mistral Large',
      color: 'from-purple-500 to-pink-500',
      icon: '⚡',
      description: 'Europe\'s frontier model'
    }
  ]

  const handleStartBattle = async () => {
    if (!prompt || !model1 || !model2) return
    if (model1 === model2) {
      alert('Please select different models for the battle!')
      return
    }

    setIsLoading(true)
    setShowResults(false)

    try {
      const response = await fetch('/api/lab/battle-arena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model1,
          model2,
          round: currentRound
        })
      })

      if (!response.ok) throw new Error('Battle request failed')

      const data = await response.json()

      const roundResult: RoundResult = {
        round: currentRound,
        model1Response: data.model1,
        model2Response: data.model2,
        winner: null
      }

      setBattleHistory([...battleHistory, roundResult])
      setShowResults(true)
    } catch (error) {
      console.error('Battle error:', error)
      alert('Battle failed! Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVote = (roundIndex: number, winner: string) => {
    const updated = [...battleHistory]
    updated[roundIndex].winner = winner
    setBattleHistory(updated)

    // If this was round 3, show final results
    if (currentRound === 3) {
      // Calculate final winner
      const model1Wins = updated.filter(r => r.winner === model1).length
      const model2Wins = updated.filter(r => r.winner === model2).length
      
      setTimeout(() => {
        alert(`🏆 Battle Complete!\n\n${model1}: ${model1Wins} wins\n${model2}: ${model2Wins} wins\n\nWinner: ${model1Wins > model2Wins ? model1 : model2Wins > model1Wins ? model2 : 'Draw!'}`)
      }, 500)
    } else {
      // Move to next round
      setCurrentRound(currentRound + 1)
      setShowResults(false)
      setPrompt('')
    }
  }

  const getModelColor = (modelId: string) => {
    return models.find(m => m.id === modelId)?.color || 'from-gray-500 to-gray-600'
  }

  const getModelName = (modelId: string) => {
    return models.find(m => m.id === modelId)?.name || modelId
  }

  const getModelIcon = (modelId: string) => {
    return models.find(m => m.id === modelId)?.icon || '🤖'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link href="/lab" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6">
            <span>←</span> Back to AI Lab
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500">
              <Swords className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                AI Battle Arena
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Pit the world's best AI models against each other in 3 epic rounds!
              </p>
            </div>
          </div>

          {/* Round Indicator */}
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-3">
              {[1, 2, 3].map((round) => (
                <div
                  key={round}
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 ${
                    round < currentRound
                      ? 'bg-green-500 border-green-400'
                      : round === currentRound
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 border-yellow-400 animate-pulse'
                      : 'bg-white/10 border-white/20'
                  }`}
                >
                  {round < currentRound ? '✓' : round}
                </div>
              ))}
            </div>
            <div className="text-lg">
              <span className="text-gray-400">Round</span>{' '}
              <span className="font-bold text-2xl">{currentRound}</span>
              <span className="text-gray-400">/3</span>
            </div>
          </div>
        </motion.div>

        {/* Model Selection */}
        {!showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            {/* Player 1 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Player 1 - Choose Your Champion
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setModel1(model.id)}
                    disabled={model2 === model.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      model1 === model.id
                        ? 'border-green-500 bg-white/20 scale-105'
                        : model2 === model.id
                        ? 'border-red-500 bg-red-500/10 opacity-50 cursor-not-allowed'
                        : 'border-white/20 hover:border-white/40 bg-white/5'
                    }`}
                  >
                    <div className={`text-4xl mb-2`}>{model.icon}</div>
                    <div className="font-bold">{model.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{model.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Player 2 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-blue-400" />
                Player 2 - Choose Your Champion
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setModel2(model.id)}
                    disabled={model1 === model.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      model2 === model.id
                        ? 'border-blue-500 bg-white/20 scale-105'
                        : model1 === model.id
                        ? 'border-red-500 bg-red-500/10 opacity-50 cursor-not-allowed'
                        : 'border-white/20 hover:border-white/40 bg-white/5'
                    }`}
                  >
                    <div className="text-4xl mb-2">{model.icon}</div>
                    <div className="font-bold">{model.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{model.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Prompt Input */}
        {!showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8"
          >
            <label className="flex items-center gap-2 text-lg font-semibold mb-4">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              Battle Prompt (Round {currentRound})
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your challenge... (e.g., 'Explain quantum computing', 'Write a haiku about AI', 'Solve this riddle...')"
              className="w-full h-32 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartBattle}
              disabled={!prompt || !model1 || !model2 || isLoading}
              className="w-full mt-4 py-4 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Zap className="w-5 h-5 animate-spin" />
                  Battle in Progress...
                </>
              ) : (
                <>
                  <Swords className="w-5 h-5" />
                  Start Battle Round {currentRound}!
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Battle Results */}
        <AnimatePresence>
          {showResults && battleHistory[currentRound - 1] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Model 1 Response */}
              <div className={`bg-gradient-to-br ${getModelColor(model1)} p-[2px] rounded-2xl`}>
                <div className="bg-gray-900 rounded-2xl p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{getModelIcon(model1)}</span>
                      <div>
                        <h3 className="text-2xl font-bold">{getModelName(model1)}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          {battleHistory[currentRound - 1].model1Response.responseTime}ms
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 mb-4 min-h-[200px]">
                    <p className="text-gray-200 leading-relaxed">
                      {battleHistory[currentRound - 1].model1Response.text}
                    </p>
                  </div>
                  <button
                    onClick={() => handleVote(currentRound - 1, model1)}
                    disabled={battleHistory[currentRound - 1].winner !== null}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <ThumbsUp className="w-5 h-5" />
                    Vote for {getModelName(model1)}
                  </button>
                </div>
              </div>

              {/* Model 2 Response */}
              <div className={`bg-gradient-to-br ${getModelColor(model2)} p-[2px] rounded-2xl`}>
                <div className="bg-gray-900 rounded-2xl p-6 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{getModelIcon(model2)}</span>
                      <div>
                        <h3 className="text-2xl font-bold">{getModelName(model2)}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          {battleHistory[currentRound - 1].model2Response.responseTime}ms
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 mb-4 min-h-[200px]">
                    <p className="text-gray-200 leading-relaxed">
                      {battleHistory[currentRound - 1].model2Response.text}
                    </p>
                  </div>
                  <button
                    onClick={() => handleVote(currentRound - 1, model2)}
                    disabled={battleHistory[currentRound - 1].winner !== null}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <ThumbsUp className="w-5 h-5" />
                    Vote for {getModelName(model2)}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Battle History */}
        {battleHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-2xl font-bold mb-4">Battle History</h3>
            <div className="space-y-4">
              {battleHistory.map((round, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Round {round.round}</span>
                    {round.winner && (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold">
                        Winner: {getModelName(round.winner)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
