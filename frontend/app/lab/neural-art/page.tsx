'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { Palette, Upload, Download, Wand2, RefreshCw, Sparkles } from 'lucide-react'

export default function NeuralArtPage() {
  const [selectedStyle, setSelectedStyle] = useState('van-gogh')
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasResult, setHasResult] = useState(false)

  const styles = [
    { id: 'van-gogh', name: 'Van Gogh', gradient: 'from-yellow-500 to-orange-500' },
    { id: 'picasso', name: 'Picasso', gradient: 'from-blue-500 to-purple-500' },
    { id: 'monet', name: 'Monet', gradient: 'from-green-500 to-blue-500' },
    { id: 'kandinsky', name: 'Kandinsky', gradient: 'from-red-500 to-pink-500' },
    { id: 'dali', name: 'Dalí', gradient: 'from-purple-500 to-indigo-500' },
    { id: 'warhol', name: 'Warhol', gradient: 'from-pink-500 to-yellow-500' },
    { id: 'abstract', name: 'Abstract', gradient: 'from-cyan-500 to-purple-500' },
    { id: 'watercolor', name: 'Watercolor', gradient: 'from-blue-400 to-cyan-400' }
  ]

  const handleTransform = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 2500))
    setHasResult(true)
    setIsProcessing(false)
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
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500">
              <Palette className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                Neural Art Studio
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Transform photos into masterpieces with AI style transfer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-300">256 users active</span>
            </div>
            <div className="text-sm text-gray-400">•</div>
            <div className="text-sm text-gray-300">9,840 artworks created</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upload & Original */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Upload className="w-6 h-6 text-orange-400" />
              Original Image
            </h2>

            <div className="aspect-square rounded-xl bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-gray-400 mb-6 cursor-pointer hover:border-orange-500/50 hover:bg-white/10 transition-all">
              <Upload className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-center px-4">Click to upload or drag & drop</p>
              <p className="text-sm mt-2">PNG, JPG up to 10MB</p>
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all">
              Upload Image
            </button>
          </motion.div>

          {/* Result */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              Stylized Result
            </h2>

            {isProcessing ? (
              <div className="aspect-square rounded-xl bg-white/5 border border-white/20 flex flex-col items-center justify-center">
                <RefreshCw className="w-16 h-16 text-orange-400 animate-spin mb-4" />
                <p className="text-lg font-semibold">Applying neural style...</p>
                <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
              </div>
            ) : hasResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="aspect-square rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Palette className="w-24 h-24 opacity-80" />
                </div>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 flex items-center justify-center gap-2 transition-all">
                  <Download className="w-5 h-5" />
                  Download Artwork
                </button>
              </motion.div>
            ) : (
              <div className="aspect-square rounded-xl bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-gray-400">
                <Palette className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-center px-4">Your stylized artwork will appear here</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Style Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8"
        >
          <label className="text-2xl font-bold mb-6 block flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-purple-400" />
            Choose Art Style
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedStyle === style.id
                    ? 'border-orange-500 bg-white/10 scale-105'
                    : 'border-white/20 hover:border-white/40 bg-white/5'
                }`}
              >
                <div className={`w-full h-20 rounded-lg bg-gradient-to-br ${style.gradient} mb-2`} />
                <div className="text-sm font-medium text-center">{style.name}</div>
              </button>
            ))}
          </div>

          <button
            onClick={handleTransform}
            disabled={isProcessing}
            className="w-full mt-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Transforming...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Apply Style Transfer
              </>
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 border border-orange-500/50 rounded-2xl p-8 text-center"
        >
          <Palette className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Full AI Integration Coming Soon</h3>
          <p className="text-gray-300">
            This is a demo interface. Neural style transfer backend will be integrated soon!
          </p>
        </motion.div>
      </div>
    </div>
  )
}
