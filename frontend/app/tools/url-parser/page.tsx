'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Code2, Copy, Check } from 'lucide-react'

export default function UrlParserPage(){
  const [urlStr, setUrlStr] = useState('https://example.com:8080/path/to/page?foo=1&bar=2#section')
  const [copied, setCopied] = useState(false)

  const url = useMemo(()=>{
    try{ return new URL(urlStr) }catch{ return null }
  }, [urlStr])

  const entries = url ? Array.from(url.searchParams.entries()) : []
  const copy = async ()=>{ if(!url) return; await navigator.clipboard.writeText(url.toString()); setCopied(true); setTimeout(()=>setCopied(false),1200) }

  const updateParam = (k:string,v:string)=>{
    if(!url) return
    const u = new URL(url)
    u.searchParams.set(k,v)
    setUrlStr(u.toString())
  }
  const removeParam = (k:string)=>{
    if(!url) return
    const u = new URL(url)
    u.searchParams.delete(k)
    setUrlStr(u.toString())
  }
  const addParam = ()=>{
    const u = url ? new URL(url) : new URL('https://example.com')
    u.searchParams.append('param','value')
    setUrlStr(u.toString())
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
            <span className="text-xl">🔗</span>
            URL Parser
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            URL Parser
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Parse URLs, inspect components, and edit query parameters
          </p>
        </div>
      </section>

      <main className="container-custom py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4 mb-4">
          <input className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={urlStr} onChange={(e)=>setUrlStr(e.target.value)} />
          <div className="mt-3">
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center disabled:opacity-50" disabled={!url} onClick={copy}>{copied ? <Check className="w-4 h-4 mr-1"/> : <Copy className="w-4 h-4 mr-1"/>}Copy URL</button>
          </div>
        </div>

        {!url ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4 text-red-600">Invalid URL</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4"><div className="text-sm text-gray-500">Protocol</div><div className="font-mono text-gray-900">{url.protocol}</div></div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4"><div className="text-sm text-gray-500">Host</div><div className="font-mono text-gray-900">{url.host}</div></div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4"><div className="text-sm text-gray-500">Hostname</div><div className="font-mono text-gray-900">{url.hostname}</div></div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4"><div className="text-sm text-gray-500">Port</div><div className="font-mono text-gray-900">{url.port || '—'}</div></div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4"><div className="text-sm text-gray-500">Pathname</div><div className="font-mono text-gray-900 break-all">{url.pathname}</div></div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4"><div className="text-sm text-gray-500">Hash</div><div className="font-mono text-gray-900 break-all">{url.hash || '—'}</div></div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-gray-900">Query Parameters</h2>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center" onClick={addParam}>+ Add</button>
              </div>
              {!entries.length ? (
                <div className="text-gray-500 text-sm">No query parameters</div>
              ) : (
                <div className="space-y-2">
                  {entries.map(([k,v],i)=> (
                    <div key={i} className="flex items-center gap-2">
                      <input className="w-48 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900" value={k} readOnly/>
                      <input className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={v} onChange={(e)=>updateParam(k, e.target.value)}/>
                      <button className="text-red-500 hover:text-red-600" onClick={()=>removeParam(k)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
