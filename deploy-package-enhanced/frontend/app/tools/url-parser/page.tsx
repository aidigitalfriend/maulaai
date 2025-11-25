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
    <div className="min-h-screen bg-neural-900 text-white">
      <header className="bg-neural-800 border-b border-neural-700">
        <div className="container-custom py-6">
          <Link href="/tools/developer-utils" className="text-neural-300 hover:text-white">← Back to Developer Utils</Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center"><Code2 className="w-6 h-6"/></div>
            <div>
              <h1 className="text-2xl font-bold">URL Parser</h1>
              <p className="text-neural-300">Parse URLs, inspect components, and edit query parameters</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="card-modern p-4 mb-4">
          <input className="input-modern w-full" value={urlStr} onChange={(e)=>setUrlStr(e.target.value)} />
          <div className="mt-3">
            <button className="btn-secondary" disabled={!url} onClick={copy}>{copied ? <Check className="w-4 h-4 mr-1"/> : <Copy className="w-4 h-4 mr-1"/>}Copy URL</button>
          </div>
        </div>

        {!url ? (
          <div className="card-modern p-4 text-red-300">Invalid URL</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="card-modern p-4"><div className="text-sm text-neural-400">Protocol</div><div className="font-mono">{url.protocol}</div></div>
              <div className="card-modern p-4"><div className="text-sm text-neural-400">Host</div><div className="font-mono">{url.host}</div></div>
              <div className="card-modern p-4"><div className="text-sm text-neural-400">Hostname</div><div className="font-mono">{url.hostname}</div></div>
              <div className="card-modern p-4"><div className="text-sm text-neural-400">Port</div><div className="font-mono">{url.port || '—'}</div></div>
              <div className="card-modern p-4"><div className="text-sm text-neural-400">Pathname</div><div className="font-mono break-all">{url.pathname}</div></div>
              <div className="card-modern p-4"><div className="text-sm text-neural-400">Hash</div><div className="font-mono break-all">{url.hash || '—'}</div></div>
            </div>
            <div className="card-modern p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">Query Parameters</h2>
                <button className="btn-secondary" onClick={addParam}>+ Add</button>
              </div>
              {!entries.length ? (
                <div className="text-neural-400 text-sm">No query parameters</div>
              ) : (
                <div className="space-y-2">
                  {entries.map(([k,v],i)=> (
                    <div key={i} className="flex items-center gap-2">
                      <input className="input-modern w-48" value={k} readOnly/>
                      <input className="input-modern flex-1" value={v} onChange={(e)=>updateParam(k, e.target.value)}/>
                      <button className="text-red-400 hover:text-red-300" onClick={()=>removeParam(k)}>✕</button>
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
