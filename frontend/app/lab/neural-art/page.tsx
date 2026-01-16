'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { Palette, Upload, Download, Wand2, RefreshCw, Sparkles } from 'lucide-react'

export default function NeuralArtPage() {
  const [selectedStyle, setSelectedStyle] = useState('van-gogh')
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)

  const styles = [
    { 
      id: 'van-gogh', 
      name: 'Van Gogh', 
      preview: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/300px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
      description: 'Swirling brushstrokes'
    },
    { 
      id: 'picasso', 
      name: 'Picasso', 
      preview: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/Pablo_Picasso%2C_1910%2C_Girl_with_a_Mandolin_%28Fanny_Tellier%29%2C_oil_on_canvas%2C_100.3_x_73.6_cm%2C_Museum_of_Modern_Art_New_York..jpg/220px-Pablo_Picasso%2C_1910%2C_Girl_with_a_Mandolin_%28Fanny_Tellier%29%2C_oil_on_canvas%2C_100.3_x_73.6_cm%2C_Museum_of_Modern_Art_New_York..jpg',
      description: 'Cubist geometric'
    },
    { 
      id: 'monet', 
      name: 'Monet', 
      preview: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/300px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg',
      description: 'Soft impressionism'
    },
    { 
      id: 'kandinsky', 
      name: 'Kandinsky', 
      preview: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Vassily_Kandinsky%2C_1913_-_Composition_7.jpg/300px-Vassily_Kandinsky%2C_1913_-_Composition_7.jpg',
      description: 'Bold abstract'
    },
    { 
      id: 'dali', 
      name: 'Dalí', 
      preview: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/dd/The_Persistence_of_Memory.jpg/300px-The_Persistence_of_Memory.jpg',
      description: 'Surreal dreamlike'
    },
    { 
      id: 'warhol', 
      name: 'Warhol', 
      preview: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&h=200&fit=crop',
      description: 'Pop art bold'
    },
    { 
      id: 'abstract', 
      name: 'Abstract', 
      preview: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200&h=200&fit=crop',
      description: 'Modern shapes'
    },
    { 
      id: 'watercolor', 
      name: 'Watercolor', 
      preview: 'https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=200&h=200&fit=crop',
      description: 'Soft flowing'
    }
  ]

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(reader.result as string)
        setResultImage(null) // Clear previous result
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTransform = async () => {
    if (!uploadedImage) {
      alert('Please upload an image first!')
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('/api/lab/neural-art', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: uploadedImage,
          style: selectedStyle
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setResultImage(data.image)
      } else {
        alert('Failed to transform image. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsProcessing(false)
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

            {uploadedImage ? (
              <div className="aspect-square rounded-xl overflow-hidden mb-6">
                <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
              </div>
            ) : (
              <label className="aspect-square rounded-xl bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-gray-400 mb-6 cursor-pointer hover:border-orange-500/50 hover:bg-white/10 transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Upload className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-center px-4">Click to upload or drag & drop</p>
                <p className="text-sm mt-2">PNG, JPG up to 10MB</p>
              </label>
            )}

            {uploadedImage && (
              <button
                onClick={() => setUploadedImage(null)}
                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all"
              >
                Upload Different Image
              </button>
            )}
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
            ) : resultImage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="aspect-square rounded-xl overflow-hidden">
                  <img src={resultImage} alt="Stylized result" className="w-full h-full object-cover" />
                </div>
                <a
                  href={resultImage}
                  download="neural-art.png"
                  className="block w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download Artwork
                </a>
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
                className={`p-3 rounded-xl border-2 transition-all group ${
                  selectedStyle === style.id
                    ? 'border-orange-500 bg-white/10 scale-105 shadow-lg shadow-orange-500/30'
                    : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden mb-2 relative">
                  <img 
                    src={style.preview} 
                    alt={style.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {selectedStyle === style.id && (
                    <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-sm font-semibold text-center">{style.name}</div>
                <div className="text-xs text-gray-400 text-center mt-1">{style.description}</div>
              </button>
            ))}
          </div>

          <button
            onClick={handleTransform}
            disabled={isProcessing || !uploadedImage}
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
      </div>
    </div>
  )
}
