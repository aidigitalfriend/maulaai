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
    <div className="min-h-screen bg-neural-900 text-white">
      <header className="bg-neural-800 border-b border-neural-700">
        <div className="container-custom py-6">
          <Link href="/tools/developer-utils" className="text-neural-300 hover:text-white">← Back to Developer Utils</Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center"><Key className="w-6 h-6"/></div>
            <div>
              <h1 className="text-2xl font-bold">UUID Generator</h1>
              <p className="text-neural-300">Generate multiple UUIDs with formatting options</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="card-modern p-4 flex items-center gap-3 flex-wrap mb-4">
          <label className="text-sm text-neural-300">Count</label>
          <input type="number" className="input-modern w-24" value={count} min={1} max={1000} onChange={(e)=>setCount(Math.max(1,Math.min(1000, parseInt(e.target.value||'1'))))}/>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={uppercase} onChange={e=>setUppercase(e.target.checked)}/> Uppercase</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={braces} onChange={e=>setBraces(e.target.checked)}/> Curly braces</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={hyphens} onChange={e=>setHyphens(e.target.checked)}/> Keep hyphens</label>
          <button className="btn-secondary" onClick={()=>{setCount(count);}}><RefreshCcw className="w-4 h-4 mr-1"/>Regenerate</button>
          <button className="btn-primary" onClick={copyAll}>{copied ? <Check className="w-4 h-4 mr-1"/> : <Copy className="w-4 h-4 mr-1"/>}Copy all</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {uuids.map((id, idx)=> (
            <div key={idx} className="card-modern p-3 font-mono text-sm break-all">{id}</div>
          ))}
        </div>
      </main>
    </div>
  )
}
