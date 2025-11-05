'use client'

import { useState } from 'react'
import { Zap, Play, Loader2, ArrowLeft, Download, Upload, Activity } from 'lucide-react'
import Link from 'next/link'

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

  const getSpeedColor = (speed: number, type: 'download' | 'upload') => {
    const threshold = type === 'download' ? 25 : 10
    if (speed < threshold / 2) return 'red'
    if (speed < threshold) return 'yellow'
    return 'green'
  }

  const getLatencyColor = (latency: number) => {
    if (latency < 50) return 'green'
    if (latency < 100) return 'yellow'
    return 'red'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white">
      <div className="container-custom py-12">
        {/* Back Button */}
        <Link 
          href="/tools/network-tools"
          className="inline-flex items-center gap-2 text-neural-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Network Tools
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Zap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Internet <span className="text-gradient bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Speed Test</span>
          </h1>
          <p className="text-xl text-neural-300 max-w-2xl mx-auto">
            Test your internet connection speed
          </p>
        </div>

        {/* Speed Test Button */}
        {!result && !loading && (
          <div className="max-w-3xl mx-auto mb-12">
            <button
              onClick={handleSpeedTest}
              className="w-full px-8 py-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-2xl font-semibold text-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40"
            >
              <Play className="w-6 h-6" />
              Start Speed Test
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-neural-800/50 rounded-2xl p-8 border border-neural-700">
              <div className="text-center mb-6">
                <Loader2 className="w-12 h-12 text-pink-400 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{stage}</h3>
                <p className="text-neural-300">{progress}% Complete</p>
              </div>
              <div className="w-full bg-neural-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto mb-12">
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Main Speed Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Download Speed */}
              <div className={`bg-gradient-to-br from-${getSpeedColor(result.downloadSpeed, 'download')}-500/10 to-${getSpeedColor(result.downloadSpeed, 'download')}-600/10 rounded-2xl p-8 border border-${getSpeedColor(result.downloadSpeed, 'download')}-500/20`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 bg-${getSpeedColor(result.downloadSpeed, 'download')}-500/20 rounded-xl flex items-center justify-center`}>
                    <Download className={`w-7 h-7 text-${getSpeedColor(result.downloadSpeed, 'download')}-400`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Download</h3>
                </div>
                <div className="text-center">
                  <p className={`text-5xl font-bold text-${getSpeedColor(result.downloadSpeed, 'download')}-400 mb-2`}>
                    {result.downloadSpeed.toFixed(2)}
                  </p>
                  <p className="text-neural-300 text-lg">Mbps</p>
                </div>
              </div>

              {/* Upload Speed */}
              <div className={`bg-gradient-to-br from-${getSpeedColor(result.uploadSpeed, 'upload')}-500/10 to-${getSpeedColor(result.uploadSpeed, 'upload')}-600/10 rounded-2xl p-8 border border-${getSpeedColor(result.uploadSpeed, 'upload')}-500/20`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 bg-${getSpeedColor(result.uploadSpeed, 'upload')}-500/20 rounded-xl flex items-center justify-center`}>
                    <Upload className={`w-7 h-7 text-${getSpeedColor(result.uploadSpeed, 'upload')}-400`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Upload</h3>
                </div>
                <div className="text-center">
                  <p className={`text-5xl font-bold text-${getSpeedColor(result.uploadSpeed, 'upload')}-400 mb-2`}>
                    {result.uploadSpeed.toFixed(2)}
                  </p>
                  <p className="text-neural-300 text-lg">Mbps</p>
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Latency */}
              <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 bg-${getLatencyColor(result.latency)}-500/20 rounded-lg flex items-center justify-center`}>
                    <Activity className={`w-5 h-5 text-${getLatencyColor(result.latency)}-400`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Latency (Ping)</h3>
                </div>
                <p className={`text-3xl font-bold text-${getLatencyColor(result.latency)}-400`}>
                  {result.latency.toFixed(2)} ms
                </p>
              </div>

              {/* Jitter */}
              <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Jitter</h3>
                </div>
                <p className="text-3xl font-bold text-purple-400">
                  {result.jitter.toFixed(2)} ms
                </p>
              </div>
            </div>

            {/* Server Info */}
            {result.server && (
              <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
                <h3 className="text-lg font-semibold text-white mb-3">Test Server</h3>
                <p className="text-neural-200">{result.server}</p>
              </div>
            )}

            {/* Retest Button */}
            <div className="text-center">
              <button
                onClick={handleSpeedTest}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-xl font-semibold transition-all inline-flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Run Test Again
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        {!result && !loading && (
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-neural-800/50 rounded-xl p-6 border border-neural-700">
              <h3 className="text-lg font-semibold text-white mb-4">About Speed Test</h3>
              <div className="space-y-3 text-neural-300">
                <p>This tool measures your internet connection performance. Key metrics include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Download Speed:</strong> How fast you can receive data (streaming, browsing)</li>
                  <li><strong>Upload Speed:</strong> How fast you can send data (video calls, file uploads)</li>
                  <li><strong>Latency (Ping):</strong> Response time of your connection</li>
                  <li><strong>Jitter:</strong> Variation in latency (affects real-time apps)</li>
                </ul>
                <div className="mt-4 p-3 bg-pink-500/10 border border-pink-500/30 rounded-lg">
                  <p className="text-sm text-pink-200">
                    <strong>Tip:</strong> For accurate results, close other applications and ensure no other devices are using the network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
