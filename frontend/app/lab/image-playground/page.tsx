'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Wand2, Image as ImageIcon, Palette, Download, Share2, RefreshCw } from 'lucide-react'

export default function ImagePlaygroundPage() {
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('realistic')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  const styles = [
    { id: 'realistic', name: 'Realistic', color: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
    { id: 'artistic', name: 'Artistic', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
    { id: 'anime', name: 'Anime', color: 'bg-gradient-to-br from-pink-500 to-rose-500' },
    { id: 'oil-painting', name: 'Oil Painting', color: 'bg-gradient-to-br from-orange-500 to-amber-500' },
    { id: 'watercolor', name: 'Watercolor', color: 'bg-gradient-to-br from-cyan-500 to-blue-500' },
    { id: 'digital-art', name: 'Digital Art', color: 'bg-gradient-to-br from-violet-500 to-purple-500' },
    { id: '3d-render', name: '3D Render', color: 'bg-gradient-to-br from-indigo-500 to-blue-500' },
    { id: 'pixel-art', name: 'Pixel Art', color: 'bg-gradient-to-br from-green-500 to-emerald-500' }
  ]

  const examples = [
    'A majestic dragon soaring through a starlit galaxy',
    'Futuristic city with flying cars at sunset',
    'Enchanted forest with glowing mushrooms',
    'Cyberpunk street market with neon lights',
    'Serene mountain landscape with crystal clear lake',
    'Abstract representation of human consciousness'
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000))
    // Use Picsum with random seed for variety
    const seed = Math.floor(Math.random() * 10000)
    setGeneratedImage(`https://picsum.photos/seed/${seed}/800/800`)
    setIsGenerating(false)
  }

  const handleDownload = async () => {
    if (!generatedImage) return
    
    try {
      // Fetch the image as a blob
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      
      // Create object URL
      const url = window.URL.createObjectURL(blob)
      
      // Create temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = `ai-generated-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try right-clicking the image and selecting "Save image as..."')
    }
  }

  const handleShare = async () => {
    if (!generatedImage) return
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Image',
          text: `Check out this image I created with AI: "${prompt}"`,
          url: generatedImage
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(generatedImage)
      alert('Image URL copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
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
            <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500">
              <Sparkles className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                AI Image Playground
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Generate stunning images from text descriptions with AI
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-300">342 users active</span>
            </div>
            <div className="text-sm text-gray-400">•</div>
            <div className="text-sm text-gray-300">12,450 images generated</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Prompt Input */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
              <label className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Wand2 className="w-5 h-5 text-purple-400" />
                Your Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create..."
                className="w-full h-32 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
              
              {/* Example Prompts */}
              <div className="mt-4">
                <div className="text-sm text-gray-400 mb-2">Try these examples:</div>
                <div className="flex flex-wrap gap-2">
                  {examples.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/20 hover:border-purple-500/50 transition-all"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Style Selection */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
              <label className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Palette className="w-5 h-5 text-pink-400" />
                Art Style
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedStyle === style.id
                        ? 'border-purple-500 bg-white/10'
                        : 'border-white/20 hover:border-white/40 bg-white/5'
                    }`}
                  >
                    <div className={`w-full h-12 rounded-lg ${style.color} mb-2`} />
                    <div className="text-sm font-medium text-center">{style.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating Magic...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Image
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Right Panel - Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <label className="flex items-center gap-2 text-lg font-semibold mb-4">
              <ImageIcon className="w-5 h-5 text-cyan-400" />
              Generated Image
            </label>

            {/* Preview Area */}
            <div className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/20 mb-4">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <RefreshCw className="w-16 h-16 text-purple-400 animate-spin mb-4" />
                  <div className="text-lg font-semibold">Creating your masterpiece...</div>
                  <div className="text-sm text-gray-400 mt-2">This may take a few seconds</div>
                </div>
              ) : generatedImage ? (
                <motion.img
                  key={generatedImage}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  src={generatedImage}
                  alt="Generated"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                  <div className="text-lg">Your generated image will appear here</div>
                  <div className="text-sm mt-2">Enter a prompt and click Generate</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {generatedImage && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-3"
              >
                <button 
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 hover:border-white/40 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
                <button 
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 hover:border-white/40 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </motion.div>
            )}

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="text-sm text-blue-300">
                <strong>💡 Pro Tip:</strong> Be specific in your prompts! Include details about lighting, mood, colors, and composition for better results.
              </div>
            </div>
          </motion.div>
        </div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/50 rounded-2xl p-8 text-center"
        >
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Full AI Integration Coming Soon</h3>
          <p className="text-gray-300">
            This is a demo interface. Backend AI integration with DALL-E/Stable Diffusion will be added soon!
          </p>
        </motion.div>
      </div>
    </div>
  )
}
