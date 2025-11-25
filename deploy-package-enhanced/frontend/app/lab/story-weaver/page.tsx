'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Pen, Sparkles, Save, Share2, RefreshCw } from 'lucide-react'

export default function StoryWeaverPage() {
  const [story, setStory] = useState('')
  const [genre, setGenre] = useState('fantasy')
  const [isGenerating, setIsGenerating] = useState(false)

  const genres = [
    { id: 'fantasy', name: 'Fantasy', icon: '🧙‍♂️' },
    { id: 'sci-fi', name: 'Sci-Fi', icon: '🚀' },
    { id: 'mystery', name: 'Mystery', icon: '🔍' },
    { id: 'romance', name: 'Romance', icon: '💕' },
    { id: 'horror', name: 'Horror', icon: '👻' },
    { id: 'adventure', name: 'Adventure', icon: '⚔️' }
  ]

  const prompts = [
    'A mysterious stranger arrives in town',
    'You discover a hidden door in your house',
    'The last human on Earth receives a phone call',
    'A detective finds an impossible clue',
    'Two enemies must work together to survive',
    'Someone wakes up with a superpower'
  ]

  const handleContinue = async () => {
    if (!story.trim()) {
      alert('Please write something to continue')
      return
    }
    
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/lab/story-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story,
          genre,
          action: 'continue'
        })
      })

      if (!response.ok) {
        throw new Error('Story generation failed')
      }

      const data = await response.json()
      setStory(story + '\n\n' + data.generated)
    } catch (error) {
      console.error('Story generation error:', error)
      alert('Story generation failed. Please try again.')
    } finally {
      setIsGenerating(false)
    }
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
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500">
              <BookOpen className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                AI Story Weaver
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Collaborate with AI to write compelling stories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-300">289 users active</span>
            </div>
            <div className="text-sm text-gray-400">•</div>
            <div className="text-sm text-gray-300">11,200 stories created</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4">Genre</h3>
              <div className="space-y-2">
                {genres.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGenre(g.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      genre === g.id
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 border border-green-500'
                        : 'bg-white/5 border border-white/20 hover:border-white/40'
                    }`}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <span>{g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4">Story Starters</h3>
              <div className="space-y-2">
                {prompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setStory(prompt + '...\n\n')}
                    className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/20 hover:border-emerald-500/50 transition-all text-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-3 space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <label className="text-2xl font-bold flex items-center gap-2">
                  <Pen className="w-6 h-6 text-emerald-400" />
                  Your Story
                </label>
                <div className="text-sm text-gray-400">
                  {story.split(' ').filter(w => w).length} words
                </div>
              </div>

              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Start typing your story or choose a story starter... The AI will help you continue!"
                className="w-full h-96 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors resize-none font-serif text-lg leading-relaxed"
              />

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleContinue}
                  disabled={!story.trim() || isGenerating}
                  className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      AI Writing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Continue Story with AI
                    </>
                  )}
                </button>

                <button className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 hover:border-white/40 transition-all flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Save
                </button>

                <button className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 hover:border-white/40 transition-all flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
                <div className="text-2xl font-bold text-emerald-400">3</div>
                <div className="text-sm text-gray-400">Chapters</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
                <div className="text-2xl font-bold text-cyan-400">5</div>
                <div className="text-sm text-gray-400">Characters</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
                <div className="text-2xl font-bold text-purple-400">12m</div>
                <div className="text-sm text-gray-400">Read Time</div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
