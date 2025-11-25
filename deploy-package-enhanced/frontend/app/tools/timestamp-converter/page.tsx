'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Clock, Copy, Check, RefreshCw } from 'lucide-react'

function toEpochMs(date: Date){ return date.getTime() }
function fromEpoch(input: number){ return new Date(input) }

const timeZones = typeof (Intl as any).supportedValuesOf === 'function' ? (Intl as any).supportedValuesOf('timeZone') as string[] : ['UTC']

export default function TimestampConverterPage(){
  const [epoch, setEpoch] = useState<string>('')
  const [human, setHuman] = useState<string>('')
  const [tz, setTz] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
  const [copied, setCopied] = useState('')

  const now = new Date()

  const format = (d: Date) => new Intl.DateTimeFormat('en-US',{ dateStyle:'full', timeStyle:'long', timeZone: tz }).format(d)

  useEffect(()=>{
    if(epoch.trim()===''){ setHuman(''); return }
    const n = Number(epoch)
    const ms = String(n).length<=10 ? n*1000 : n
    const d = fromEpoch(ms)
    setHuman(format(d))
  }, [epoch, tz])

  useEffect(()=>{
    if(!human.trim()) return
    const d = new Date(human)
    if(!isNaN(d.getTime())){
      setEpoch(String(toEpochMs(d)))
    }
  }, [human])

  const copy = async (text:string,label:string)=>{ await navigator.clipboard.writeText(text); setCopied(label); setTimeout(()=>setCopied(''),1200) }

  return (
    <div className="min-h-screen bg-neural-900 text-white">
      <header className="bg-neural-800 border-b border-neural-700">
        <div className="container-custom py-6">
          <Link href="/tools/developer-utils" className="text-neural-300 hover:text-white">← Back to Developer Utils</Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center"><Clock className="w-6 h-6"/></div>
            <div>
              <h1 className="text-2xl font-bold">Timestamp Converter</h1>
              <p className="text-neural-300">Convert between Unix epoch (seconds/ms) and human-readable dates with time zones</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="card-modern p-4 mb-4 flex items-center gap-3 flex-wrap">
          <div className="text-sm text-neural-300">Time Zone</div>
          <select className="input-modern min-w-52" value={tz} onChange={(e)=>setTz(e.target.value)}>
            {timeZones.map(z=> <option key={z} value={z}>{z}</option>)}
          </select>
          <button className="btn-secondary" onClick={()=>{ setEpoch(String(Date.now())); setHuman(format(new Date())) }}><RefreshCw className="w-4 h-4 mr-1"/> Now</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-modern p-4">
            <h2 className="font-semibold mb-2">Epoch (seconds or milliseconds)</h2>
            <input className="input-modern w-full" value={epoch} onChange={(e)=>setEpoch(e.target.value)} placeholder="e.g., 1730790780 or 1730790780123"/>
            {epoch && <button className="btn-secondary mt-3" onClick={()=>copy(epoch,'epoch')}>{copied==='epoch'?<Check className="w-4 h-4 mr-1"/>:<Copy className="w-4 h-4 mr-1"/>}Copy</button>}
          </div>

          <div className="card-modern p-4 lg:sticky lg:top-6 lg:h-fit">
            <h2 className="font-semibold mb-2">Human Date</h2>
            <input className="input-modern w-full" value={human} onChange={(e)=>setHuman(e.target.value)} placeholder={format(now)} />
            {human && <button className="btn-secondary mt-3" onClick={()=>copy(human,'human')}>{copied==='human'?<Check className="w-4 h-4 mr-1"/>:<Copy className="w-4 h-4 mr-1"/>}Copy</button>}
            {epoch && (
              <div className="mt-4 text-sm text-neural-300">Relative: {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(Math.round((Number(epoch)-(Date.now()))/1000/60), 'minute')}</div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
