'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { FileJson, Check, Copy, Trash2, Wand2, Minimize2, SplitSquareHorizontal } from 'lucide-react'

export default function JsonFormatterPage() {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [indent, setIndent] = useState(2)

  const formatted = useMemo(() => {
    if (!input.trim()) {
      setError(null)
      return ''
    }
    try {
      const parsed = JSON.parse(input)
      setError(null)
      return JSON.stringify(parsed, null, indent)
    } catch (e:any) {
      setError(e.message)
      return ''
    }
  }, [input, indent])

  const minified = useMemo(() => {
    try {
      if (!input.trim()) return ''
      return JSON.stringify(JSON.parse(input))
    } catch {
      return ''
    }
  }, [input])

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const loadExample = () => {
    setInput(JSON.stringify({
      user: { id: 123, name: 'Jane Doe' },
      roles: ['admin','editor'],
      active: true,
      meta: { createdAt: new Date().toISOString() }
    }, null, 2))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <Link href="/tools/developer-utils" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors">
            ← Back to Developer Utils
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <span className="text-xl">📝</span>
            JSON Formatter
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            JSON Formatter
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Format, validate, minify, and pretty-print JSON in real-time
          </p>
        </div>
      </section>

      <main className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Input JSON</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center" onClick={loadExample}><SplitSquareHorizontal className="w-4 h-4 mr-1"/>Example</button>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center" onClick={() => setInput('')}><Trash2 className="w-4 h-4 mr-1"/>Clear</button>
              </div>
            </div>
            <textarea className="w-full font-mono text-sm h-[420px] bg-white border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={input} onChange={(e)=>setInput(e.target.value)} placeholder='{"key":"value"}'/>
            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4 lg:sticky lg:top-6 lg:h-fit">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Formatted</h2>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Indent</span>
                  <select className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm w-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={indent} onChange={(e)=>setIndent(parseInt(e.target.value))}>
                    <option value={2}>2</option>
                    <option value={4}>4</option>
                    <option value={8}>8</option>
                  </select>
                </div>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center disabled:opacity-50" disabled={!formatted} onClick={()=>copy(formatted)}>
                  {copied ? <Check className="w-4 h-4 mr-1"/> : <Copy className="w-4 h-4 mr-1"/>}Copy
                </button>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center disabled:opacity-50" disabled={!minified} onClick={()=>copy(minified)}>
                  <Minimize2 className="w-4 h-4 mr-1"/>Copy Minified
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg shadow-blue-500/25 transition-all flex items-center disabled:opacity-50" disabled={!input.trim() || !!error} onClick={()=>setInput(formatted)}>
                  <Wand2 className="w-4 h-4 mr-1"/>Apply
                </button>
              </div>
            </div>
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-auto max-h-[420px] text-gray-900"><code>{formatted || '/* Valid JSON will appear here */'}</code></pre>
          </div>
        </div>
      </main>
    </div>
  )
}
