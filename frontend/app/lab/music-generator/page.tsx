'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { Music, Play, Pause, Download, RefreshCw, Sliders } from 'lucide-react'

export default function MusicGeneratorPage() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [genre, setGenre] = useState('electronic')
  const [mood, setMood] = useState('energetic')
  const [duration, setDuration] = useState(30)

  const genres = ['Electronic', 'Rock', 'Jazz', 'Classical', 'Hip Hop', 'Ambient', 'Pop', 'Cinematic']
  const moods = ['Energetic', 'Calm', 'Dark', 'Uplifting', 'Mysterious', 'Romantic']

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
    setHasGenerated(true)
    setIsGenerating(false)
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
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <Music className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AI Music Generator
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Create original music and soundtracks from text
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-300">143 users active</span>
            </div>
            <div className="text-sm text-gray-400">•</div>
            <div className="text-sm text-gray-300">6,730 tracks created</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <label className="text-lg font-semibold mb-4 block">Describe Your Music</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Epic orchestral soundtrack with powerful drums and soaring strings..."
                className="w-full h-32 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <label className="text-lg font-semibold mb-4 block flex items-center gap-2">
                  <Music className="w-5 h-5 text-cyan-400" />
                  Genre
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {genres.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenre(g.toLowerCase())}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        genre === g.toLowerCase()
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-500'
                          : 'bg-white/5 border border-white/20 hover:border-white/40'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <label className="text-lg font-semibold mb-4 block flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-400" />
                  Mood
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {moods.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m.toLowerCase())}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        mood === m.toLowerCase()
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 border border-purple-500'
                          : 'bg-white/5 border border-white/20 hover:border-white/40'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <label className="text-lg font-semibold mb-4 block">Duration: {duration} seconds</label>
              <input
                type="range"
                min="15"
                max="60"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Composing Music...
                </>
              ) : (
                <>
                  <Music className="w-5 h-5" />
                  Generate Music
                </>
              )}
            </button>
          </motion.div>

          {/* Player */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold mb-6">Your Track</h3>

            {hasGenerated && !isGenerating ? (
              <div className="space-y-6">
                <div className="aspect-square rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 flex items-center justify-center">
                  <Music className="w-24 h-24 opacity-80" />
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-green-500/50 transition-all"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>

                  <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 flex items-center justify-center gap-2 transition-all">
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="aspect-square rounded-xl bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-gray-400">
                <Music className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-center px-4">
                  {isGenerating ? 'Creating your track...' : 'Your generated music will appear here'}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/50 rounded-2xl p-8 text-center"
        >
          <Music className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Full AI Integration Coming Soon</h3>
          <p className="text-gray-300">
            This is a demo interface. AI music generation backend will be added soon!
          </p>
        </motion.div>
      </div>
    </div>
  )
}
