'use client'

import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { Mic, Play, Square, Download, Wand2, Volume2, RefreshCw } from 'lucide-react'

export default function VoiceCloningPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  const [isCloning, setIsCloning] = useState(false)
  const [text, setText] = useState('')
  const [clonedAudio, setClonedAudio] = useState<string | null>(null)

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false)
      setHasRecording(true)
    } else {
      setIsRecording(true)
      setHasRecording(false)
    }
  }

  const handleClone = async () => {
    if (!hasRecording || !text.trim()) return
    setIsCloning(true)
    await new Promise(resolve => setTimeout(resolve, 2500))
    setClonedAudio('cloned')
    setIsCloning(false)
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
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500">
              <Mic className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Voice Cloning Studio
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Clone your voice and create custom speech with AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-300">198 users active</span>
            </div>
            <div className="text-sm text-gray-400">•</div>
            <div className="text-sm text-gray-300">8,920 voices cloned</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recording Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Mic className="w-6 h-6 text-purple-400" />
              Step 1: Record Your Voice
            </h2>

            <div className="text-center py-12">
              {isRecording ? (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mb-6"
                >
                  <Mic className="w-16 h-16" />
                </motion.div>
              ) : (
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-6">
                  <Mic className="w-16 h-16" />
                </div>
              )}

              <button
                onClick={handleRecord}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/50'
                }`}
              >
                {isRecording ? (
                  <span className="flex items-center gap-2">
                    <Square className="w-5 h-5" />
                    Stop Recording
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mic className="w-5 h-5" />
                    Start Recording
                  </span>
                )}
              </button>

              {hasRecording && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 text-green-400 flex items-center justify-center gap-2"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  Recording saved!
                </motion.div>
              )}
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-sm text-blue-300">
              <strong>💡 Tip:</strong> Record 10-15 seconds of clear speech for best results. Speak naturally and clearly.
            </div>
          </motion.div>

          {/* Text-to-Speech Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-indigo-400" />
              Step 2: Generate Speech
            </h2>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you want your cloned voice to say..."
              className="w-full h-48 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none mb-6"
            />

            <button
              onClick={handleClone}
              disabled={!hasRecording || !text.trim() || isCloning}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-6"
            >
              {isCloning ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Cloning Voice...
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  Clone & Generate Speech
                </>
              )}
            </button>

            {clonedAudio && !isCloning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="font-semibold">Voice cloned successfully!</span>
                  </div>
                  <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 flex items-center justify-center gap-2 transition-all">
                    <Play className="w-5 h-5" />
                    Play Cloned Voice
                  </button>
                </div>

                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 flex items-center justify-center gap-2 transition-all">
                  <Download className="w-5 h-5" />
                  Download Audio
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/50 rounded-2xl p-8 text-center"
        >
          <Mic className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Full AI Integration Coming Soon</h3>
          <p className="text-gray-300">
            This is a demo interface. Backend voice cloning AI will be integrated soon!
          </p>
        </motion.div>
      </div>
    </div>
  )
}
