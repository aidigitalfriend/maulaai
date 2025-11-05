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
    <div className="min-h-screen bg-neural-900 text-white">
      <header className="bg-neural-800 border-b border-neural-700">
        <div className="container-custom py-6">
          <Link href="/tools/developer-utils" className="text-neural-300 hover:text-white">← Back to Developer Utils</Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"><FileJson className="w-6 h-6"/></div>
            <div>
              <h1 className="text-2xl font-bold">JSON Formatter</h1>
              <p className="text-neural-300">Format, validate, minify, and pretty-print JSON in real-time</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-modern p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Input JSON</h2>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={loadExample}><SplitSquareHorizontal className="w-4 h-4 mr-1"/>Example</button>
                <button className="btn-secondary" onClick={() => setInput('')}><Trash2 className="w-4 h-4 mr-1"/>Clear</button>
              </div>
            </div>
            <textarea className="input-modern w-full font-mono text-sm h-[420px]" value={input} onChange={(e)=>setInput(e.target.value)} placeholder='{"key":"value"}'/>
            {error && (
              <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-300 text-sm">{error}</div>
            )}
          </div>

          <div className="card-modern p-4 lg:sticky lg:top-6 lg:h-fit">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Formatted</h2>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neural-300">Indent</span>
                  <select className="input-modern text-sm w-20" value={indent} onChange={(e)=>setIndent(parseInt(e.target.value))}>
                    <option value={2}>2</option>
                    <option value={4}>4</option>
                    <option value={8}>8</option>
                  </select>
                </div>
                <button className="btn-secondary" disabled={!formatted} onClick={()=>copy(formatted)}>
                  {copied ? <Check className="w-4 h-4 mr-1"/> : <Copy className="w-4 h-4 mr-1"/>}Copy
                </button>
                <button className="btn-secondary" disabled={!minified} onClick={()=>copy(minified)}>
                  <Minimize2 className="w-4 h-4 mr-1"/>Copy Minified
                </button>
                <button className="btn-primary" disabled={!input.trim() || !!error} onClick={()=>setInput(formatted)}>
                  <Wand2 className="w-4 h-4 mr-1"/>Apply
                </button>
              </div>
            </div>
            <pre className="bg-neural-800 rounded-lg p-4 text-sm overflow-auto max-h-[420px]"><code>{formatted || '/* Valid JSON will appear here */'}</code></pre>
          </div>
        </div>
      </main>
    </div>
  )
}
