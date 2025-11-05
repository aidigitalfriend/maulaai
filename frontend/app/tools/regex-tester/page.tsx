'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Code2, Copy, Check } from 'lucide-react'

function highlight(text:string, regex:RegExp){
  if(!regex) return text
  const g = regex.global ? regex : new RegExp(regex.source, regex.flags + 'g')
  let lastIndex = 0
  const parts: JSX.Element[] = []
  let m: RegExpExecArray | null
  while((m = g.exec(text))){
    const index = m.index
    const match = m[0]
    if(index>lastIndex){ parts.push(<span key={lastIndex}>{text.slice(lastIndex,index)}</span>) }
    parts.push(<mark key={index} className="bg-yellow-500/30 text-yellow-200 rounded px-1">{match}</mark>)
    lastIndex = index + match.length
  }
  if(lastIndex < text.length){ parts.push(<span key={lastIndex+':end'}>{text.slice(lastIndex)}</span>) }
  return <>{parts}</>
}

export default function RegexTesterPage(){
  const [pattern, setPattern] = useState('foo.*bar')
  const [flags, setFlags] = useState({ g:true, i:true, m:false, s:false, u:true })
  const [text, setText] = useState('foo 123 bar\nFoo BAR baz\nfoobar')

  const regex = useMemo(()=>{
    try{ return new RegExp(pattern, Object.entries(flags).filter(([k,v])=>v).map(([k])=>k).join('')) }catch{return null}
  }, [pattern, flags])

  const matches = useMemo(()=>{
    if(!regex) return [] as RegExpMatchArray[]
    const g = regex.global ? regex : new RegExp(regex.source, regex.flags + 'g')
    const list: RegExpMatchArray[] = []
    let m: RegExpExecArray | null
    while( (m = g.exec(text)) ) { list.push(m as any) }
    return list
  }, [regex, text])

  const [copied, setCopied] = useState(false)
  const copy = async ()=> { await navigator.clipboard.writeText(matches.map(m=>m[0]).join('\n')); setCopied(true); setTimeout(()=>setCopied(false), 1200) }

  return (
    <div className="min-h-screen bg-neural-900 text-white">
      <header className="bg-neural-800 border-b border-neural-700">
        <div className="container-custom py-6">
          <Link href="/tools/developer-utils" className="text-neural-300 hover:text-white">← Back to Developer Utils</Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center"><Code2 className="w-6 h-6"/></div>
            <div>
              <h1 className="text-2xl font-bold">Regex Tester</h1>
              <p className="text-neural-300">Test and debug regular expressions with live matches, groups, and replace preview</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="card-modern p-4 mb-4 flex items-center gap-3 flex-wrap">
          <input className="input-modern flex-1" value={pattern} onChange={(e)=>setPattern(e.target.value)} placeholder="Pattern e.g. foo(.*)bar"/>
          {(['g','i','m','s','u'] as const).map(f => (
            <label key={f} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={(flags as any)[f]} onChange={(e)=>setFlags({...flags, [f]: e.target.checked})}/> {f}</label>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-modern p-4">
            <h2 className="font-semibold mb-2">Test Text</h2>
            <textarea className="input-modern w-full h-72 font-mono text-sm" value={text} onChange={(e)=>setText(e.target.value)} />
          </div>
          <div className="space-y-4">
            <div className="card-modern p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">Matches ({matches.length})</h2>
                <button className="btn-secondary" disabled={!matches.length} onClick={copy}>{copied ? <Check className="w-4 h-4 mr-1"/> : <Copy className="w-4 h-4 mr-1"/>}Copy</button>
              </div>
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap break-words">{regex ? highlight(text, regex) : text}</pre>
              </div>
            </div>
            <div className="card-modern p-4">
              <h2 className="font-semibold mb-2">Groups</h2>
              {!matches.length ? <div className="text-neural-400 text-sm">No groups</div> : (
                <div className="space-y-2">
                  {matches.map((m, idx)=> (
                    <div key={idx} className="bg-neural-800 rounded p-2 text-sm font-mono overflow-auto">
                      {Array.from(m).map((g,i)=> (
                        <div key={i}><span className="text-violet-400">${'{'}{i}{'}'}</span>: {g ?? '—'}</div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
