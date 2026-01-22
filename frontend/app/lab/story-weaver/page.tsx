'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { BookOpen, Pen, Sparkles, Save, Share2, RefreshCw, Download, Check, Copy } from 'lucide-react'

export default function StoryWeaverPage() {
  const [story, setStory] = useState('')
  const [genre, setGenre] = useState('fantasy')
  const [isGenerating, setIsGenerating] = useState(false)
  const [stats, setStats] = useState({ activeUsers: 0, totalCreated: 0 })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')

  // Calculate story metrics in real-time
  const storyMetrics = useMemo(() => {
    const words = story.split(/\s+/).filter(w => w.length > 0).length
    
    // Estimate chapters: roughly 1 chapter per 500 words, minimum 0
    const chapters = Math.max(0, Math.floor(words / 500) + (words > 100 ? 1 : 0))
    
    // Count unique capitalized names (potential characters)
    const namePattern = /\b[A-Z][a-z]{2,}\b/g
    const potentialNames = story.match(namePattern) || []
    // Filter out common words that start with capital (beginning of sentences)
    const commonWords = ['The', 'This', 'That', 'There', 'They', 'Then', 'When', 'What', 'Where', 'Which', 'While', 'After', 'Before', 'Maybe', 'Perhaps', 'Something', 'Someone', 'Suddenly', 'Finally', 'However']
    const characters = new Set(potentialNames.filter(name => !commonWords.includes(name))).size
    
    // Calculate read time: average 200 words per minute
    const readTimeMinutes = Math.max(0, Math.ceil(words / 200))
    const readTime = readTimeMinutes < 1 ? '<1m' : `${readTimeMinutes}m`
    
    return { words, chapters, characters, readTime }
  }, [story])

  // Fetch real-time stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/lab/story-generation?stats=true')
        if (response.ok) {
          const data = await response.json()
          setStats({
            activeUsers: data.activeUsers || 0,
            totalCreated: data.totalCreated || 0
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

  // Save/Download story as text file
  const handleSave = () => {
    if (!story.trim()) {
      alert('Please write something to save')
      return
    }
    
    setSaveStatus('saving')
    
    try {
      const blob = new Blob([story], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `story-${genre}-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save story')
      setSaveStatus('idle')
    }
  }

  // Share story - copy to clipboard
  const handleShare = async () => {
    if (!story.trim()) {
      alert('Please write something to share')
      return
    }
    
    try {
      // Try native share API first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: `My ${genre.charAt(0).toUpperCase() + genre.slice(1)} Story`,
          text: story.slice(0, 200) + (story.length > 200 ? '...' : ''),
          url: window.location.href
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(story)
        setShareStatus('copied')
        setTimeout(() => setShareStatus('idle'), 2000)
      }
    } catch (error) {
      // If share was cancelled or failed, try clipboard
      try {
        await navigator.clipboard.writeText(story)
        setShareStatus('copied')
        setTimeout(() => setShareStatus('idle'), 2000)
      } catch (clipError) {
        console.error('Share/Copy error:', clipError)
        alert('Failed to share story')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
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
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/25">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-white">
                  AI Story Weaver
                </h1>
                <p className="text-xl text-blue-100 mt-2">
                  Collaborate with AI to write compelling stories
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-blue-100">{stats.activeUsers.toLocaleString()} users active</span>
              </div>
              <div className="text-sm text-blue-200">•</div>
              <div className="text-sm text-blue-100">{stats.totalCreated.toLocaleString()} stories created</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Genre</h3>
              <div className="space-y-2">
                {genres.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGenre(g.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      genre === g.id
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 border border-green-500 text-white'
                        : 'bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <span>{g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Story Starters</h3>
              <div className="space-y-2">
                {prompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setStory(prompt + '...\n\n')}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-emerald-300 transition-all text-sm text-gray-700"
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
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <label className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                  <Pen className="w-6 h-6 text-emerald-500" />
                  Your Story
                </label>
                <div className="text-sm text-gray-500">
                  {story.split(' ').filter(w => w).length} words
                </div>
              </div>

              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Start typing your story or choose a story starter... The AI will help you continue!"
                className="w-full h-96 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors resize-none font-serif text-lg leading-relaxed"
              />

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleContinue}
                  disabled={!story.trim() || isGenerating}
                  className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold text-lg text-white hover:shadow-lg shadow-lg shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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

                <button 
                  onClick={handleSave}
                  disabled={!story.trim() || saveStatus === 'saving'}
                  className="px-6 py-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                >
                  {saveStatus === 'saved' ? (
                    <>
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-green-600">Saved!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Save
                    </>
                  )}
                </button>

                <button 
                  onClick={handleShare}
                  disabled={!story.trim()}
                  className="px-6 py-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                >
                  {shareStatus === 'copied' ? (
                    <>
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-5 h-5" />
                      Share
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg text-center">
                <div className="text-2xl font-bold text-emerald-500">{storyMetrics.chapters}</div>
                <div className="text-sm text-gray-500">Chapters</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg text-center">
                <div className="text-2xl font-bold text-cyan-500">{storyMetrics.characters}</div>
                <div className="text-sm text-gray-500">Characters</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg text-center">
                <div className="text-2xl font-bold text-purple-500">{storyMetrics.readTime}</div>
                <div className="text-sm text-gray-500">Read Time</div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
