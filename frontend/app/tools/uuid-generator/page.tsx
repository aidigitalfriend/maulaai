'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Key, Copy, Check, RefreshCcw } from 'lucide-react'

function generate(count:number, opts:{uppercase:boolean;braces:boolean;hyphens:boolean}){
  const list:string[] = []
  for(let i=0;i<count;i++){
    let id = (crypto as any).randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random()*16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
    if(!opts.hyphens) id = id.replace(/-/g,'')
    if(opts.uppercase) id = id.toUpperCase()
    if(opts.braces) id = `{${id}}`
    list.push(id)
  }
  return list
}

export default function UuidGeneratorPage(){
  const [count, setCount] = useState(5)
  const [uppercase, setUppercase] = useState(false)
  const [braces, setBraces] = useState(false)
  const [hyphens, setHyphens] = useState(true)
  const uuids = useMemo(()=> generate(count, {uppercase, braces, hyphens}), [count, uppercase, braces, hyphens])
  const [copied, setCopied] = useState(false)

  const copyAll = async () => { await navigator.clipboard.writeText(uuids.join('\n')); setCopied(true); setTimeout(()=>setCopied(false),1200) }

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
            <span className="text-xl">🆔</span>
            UUID Generator
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            UUID Generator
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Generate multiple UUIDs with formatting options
          </p>
        </div>
      </section>

      <main className="container-custom py-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4 flex items-center gap-3 flex-wrap mb-4">
          <label className="text-sm text-gray-600">Count</label>
          <input type="number" className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={count} min={1} max={1000} onChange={(e)=>setCount(Math.max(1,Math.min(1000, parseInt(e.target.value||'1'))))}/>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={uppercase} onChange={e=>setUppercase(e.target.checked)}/> Uppercase</label>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={braces} onChange={e=>setBraces(e.target.checked)}/> Curly braces</label>
          <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={hyphens} onChange={e=>setHyphens(e.target.checked)}/> Keep hyphens</label>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center" onClick={()=>{setCount(count);}}><RefreshCcw className="w-4 h-4 mr-1"/>Regenerate</button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg shadow-blue-500/25 transition-all flex items-center" onClick={copyAll}>{copied ? <Check className="w-4 h-4 mr-1"/> : <Copy className="w-4 h-4 mr-1"/>}Copy all</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {uuids.map((id, idx)=> (
            <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-3 font-mono text-sm text-gray-900 break-all">{id}</div>
          ))}
        </div>
      </main>
    </div>
  )
}
