'use client'

import { useState, useRef } from 'react'
import { Zap, Play, Loader2, ArrowLeft, Download, Upload, Activity, Gauge } from 'lucide-react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

interface SpeedTestResult {
  downloadSpeed: number
  uploadSpeed: number
  latency: number
  jitter: number
  server?: string
}

export default function SpeedTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SpeedTestResult | null>(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // GSAP Animations
  useGSAP(() => {
    // Hero animations
    const heroTl = gsap.timeline()
    heroTl
      .from('.hero-badge', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power3.out'
      })
      .from('.hero-title', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.3')
      .from('.hero-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.4')

    // Floating orbs animation
    gsap.to('.floating-orb-1', {
      y: -20,
      x: 10,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
    gsap.to('.floating-orb-2', {
      y: 15,
      x: -15,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
    gsap.to('.floating-orb-3', {
      y: -25,
      x: -10,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })

    // Content animations
    gsap.from('.glass-card', {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.glass-card',
        start: 'top 85%'
      }
    })
  }, { scope: containerRef })

  // Animate results when they appear
  useGSAP(() => {
    if (result) {
      gsap.from('.result-card', {
        opacity: 0,
        y: 30,
        scale: 0.95,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
      })
      
      // Animate the speed numbers counting up
      gsap.from('.speed-value', {
        textContent: 0,
        duration: 1.5,
        ease: 'power2.out',
        snap: { textContent: 0.01 }
      })
    }
  }, { dependencies: [result], scope: containerRef })

  const handleSpeedTest = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    setProgress(0)

    try {
      // Simulate speed test stages
      setStage('Measuring latency...')
      setProgress(10)
      await new Promise(resolve => setTimeout(resolve, 1000))

      setStage('Testing download speed...')
      setProgress(30)
      
      const response = await fetch('/api/tools/speed-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      setProgress(70)
      setStage('Testing upload speed...')
      await new Promise(resolve => setTimeout(resolve, 1000))

      const data = await response.json()
      setProgress(100)

      if (data.success) {
        setResult(data.data)
        setStage('Complete!')
      } else {
        setError(data.error || 'Failed to perform speed test')
      }
    } catch (err) {
      setError('Failed to connect to the server')
    } finally {
      setLoading(false)
      setProgress(0)
      setStage('')
    }
  }

  const getSpeedColor = (speed: number | null | undefined, type: 'download' | 'upload') => {
    const s = speed ?? 0
    const threshold = type === 'download' ? 25 : 10
    if (s < threshold / 2) return 'red'
    if (s < threshold) return 'yellow'
    return 'green'
  }

  const getSpeedColorClass = (speed: number | null | undefined, type: 'download' | 'upload') => {
    const color = getSpeedColor(speed, type)
    if (color === 'green') return 'text-emerald-400'
    if (color === 'yellow') return 'text-yellow-400'
    return 'text-red-400'
  }

  const getLatencyColor = (latency: number | null | undefined) => {
    const l = latency ?? 0
    if (l < 50) return 'green'
    if (l < 100) return 'yellow'
    return 'red'
  }

  const getLatencyColorClass = (latency: number | null | undefined) => {
    const color = getLatencyColor(latency)
    if (color === 'green') return 'text-emerald-400'
    if (color === 'yellow') return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Hero Section */}
      <section ref={heroRef} className="py-16 md:py-24 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-rose-500/10" />
          <div className="floating-orb-1 absolute top-20 left-[15%] w-72 h-72 bg-pink-500/20 rounded-full blur-[100px]" />
          <div className="floating-orb-2 absolute top-40 right-[10%] w-96 h-96 bg-rose-500/15 rounded-full blur-[120px]" />
          <div className="floating-orb-3 absolute bottom-10 left-[40%] w-80 h-80 bg-pink-600/10 rounded-full blur-[100px]" />
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Link href="/tools/network-tools" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Network Tools
          </Link>
          
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Gauge className="w-4 h-4 text-pink-400" />
            <span className="text-white/80">Speed Test</span>
          </div>
          
          <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 bg-clip-text text-transparent">
            Internet Speed Test
          </h1>
          
          <p className="hero-subtitle text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            Measure your connection&apos;s download, upload, and latency performance
          </p>
        </div>
      </section>

      <main ref={contentRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Speed Test Button */}
        {!result && !loading && (
          <div className="max-w-3xl mx-auto mb-12">
            <button
              onClick={handleSpeedTest}
              className="glass-card w-full group relative overflow-hidden px-8 py-8 rounded-2xl font-semibold text-xl text-white transition-all flex items-center justify-center gap-3"
              style={{
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(244, 63, 94, 0.2) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(236, 72, 153, 0.3)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center gap-3">
                <Play className="w-7 h-7" />
                Start Speed Test
              </div>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-3xl mx-auto mb-12">
            <div 
              className="glass-card rounded-2xl p-8"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-pink-500/30 rounded-full blur-xl animate-pulse" />
                  <Loader2 className="w-16 h-16 text-pink-400 animate-spin relative z-10" />
                </div>
                <h3 className="text-xl font-semibold text-white mt-6 mb-2">{stage}</h3>
                <p className="text-white/50">{progress}% Complete</p>
              </div>
              <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-3 rounded-full transition-all duration-500 relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto mb-12">
            <div 
              className="p-4 rounded-xl"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Main Speed Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Download Speed */}
              <div 
                className="result-card rounded-2xl p-8"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30">
                    <Download className="w-7 h-7 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Download</h3>
                </div>
                <div className="text-center">
                  <p className={`speed-value text-5xl font-bold mb-2 ${getSpeedColorClass(result.downloadSpeed, 'download')}`}>
                    {(result.downloadSpeed ?? 0).toFixed(2)}
                  </p>
                  <p className="text-white/50 text-lg">Mbps</p>
                </div>
              </div>

              {/* Upload Speed */}
              <div 
                className="result-card rounded-2xl p-8"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30">
                    <Upload className="w-7 h-7 text-rose-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Upload</h3>
                </div>
                <div className="text-center">
                  <p className={`speed-value text-5xl font-bold mb-2 ${getSpeedColorClass(result.uploadSpeed, 'upload')}`}>
                    {(result.uploadSpeed ?? 0).toFixed(2)}
                  </p>
                  <p className="text-white/50 text-lg">Mbps</p>
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Latency */}
              <div 
                className="result-card rounded-xl p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                    <Activity className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Latency (Ping)</h3>
                </div>
                <p className={`text-3xl font-bold ${getLatencyColorClass(result.latency)}`}>
                  {(result.latency ?? 0).toFixed(2)} ms
                </p>
              </div>

              {/* Jitter */}
              <div 
                className="result-card rounded-xl p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30">
                    <Activity className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Jitter</h3>
                </div>
                <p className="text-3xl font-bold text-purple-400">
                  {(result.jitter ?? 0).toFixed(2)} ms
                </p>
              </div>
            </div>

            {/* Server Info */}
            {result.server && (
              <div 
                className="result-card rounded-xl p-6"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-3">Test Server</h3>
                <p className="text-white/70">{result.server}</p>
              </div>
            )}

            {/* Retest Button */}
            <div className="text-center pt-4">
              <button
                onClick={handleSpeedTest}
                className="group relative overflow-hidden px-8 py-4 rounded-xl font-semibold text-white transition-all inline-flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(244, 63, 94, 0.2) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(236, 72, 153, 0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Run Test Again
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        {!result && !loading && (
          <div className="max-w-3xl mx-auto mt-12">
            <div 
              className="glass-card rounded-xl p-6"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">About Speed Test</h3>
              <div className="space-y-3 text-white/60">
                <p>This tool measures your internet connection performance. Key metrics include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-white/90">Download Speed:</strong> How fast you can receive data (streaming, browsing)</li>
                  <li><strong className="text-white/90">Upload Speed:</strong> How fast you can send data (video calls, file uploads)</li>
                  <li><strong className="text-white/90">Latency (Ping):</strong> Response time of your connection</li>
                  <li><strong className="text-white/90">Jitter:</strong> Variation in latency (affects real-time apps)</li>
                </ul>
                <div 
                  className="mt-4 p-4 rounded-lg"
                  style={{
                    background: 'rgba(236, 72, 153, 0.1)',
                    border: '1px solid rgba(236, 72, 153, 0.2)'
                  }}
                >
                  <p className="text-sm text-pink-300">
                    <strong>Tip:</strong> For accurate results, close other applications and ensure no other devices are using the network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Custom shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}
