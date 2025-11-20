'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Palette, Copy, Check } from 'lucide-react'

function hexToRgb(hex:string){
  hex = hex.replace('#','')
  if(hex.length===3) hex = hex.split('').map(c=>c+c).join('')
  const n = parseInt(hex,16)
  return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 }
}
function rgbToHex(r:number,g:number,b:number){
  return '#'+[r,g,b].map(v=> Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')
}
function rgbToHsl(r:number,g:number,b:number){
  r/=255; g/=255; b/=255
  const max=Math.max(r,g,b), min=Math.min(r,g,b)
  let h=0,s=0,l=(max+min)/2
  if(max!==min){
    const d=max-min
    s=l>0.5 ? d/(2-max-min) : d/(max+min)
    switch(max){
      case r: h=(g-b)/d+(g<b?6:0); break
      case g: h=(b-r)/d+2; break
      case b: h=(r-g)/d+4; break
    }
    h/=6
  }
  return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) }
}
function hslToRgb(h:number,s:number,l:number){
  h/=360; s/=100; l/=100
  if(s===0){ const v=Math.round(l*255); return {r:v,g:v,b:v} }
  const hue2rgb=(p:number,q:number,t:number)=>{ if(t<0)t+=1; if(t>1)t-=1; if(t<1/6) return p+(q-p)*6*t; if(t<1/2) return q; if(t<2/3) return p+(q-p)*(2/3-t)*6; return p }
  const q=l<0.5? l*(1+s) : l+s-l*s
  const p=2*l-q
  const r=Math.round(hue2rgb(p,q,h+1/3)*255)
  const g=Math.round(hue2rgb(p,q,h)*255)
  const b=Math.round(hue2rgb(p,q,h-1/3)*255)
  return {r,g,b}
}

export default function ColorPickerPage(){
  const [hex, setHex] = useState('#7c3aed')
  const rgb = useMemo(()=> hexToRgb(hex), [hex])
  const hsl = useMemo(()=> rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb])
  const [copied, setCopied] = useState<string>('')

  const setFromRgb = (r:number,g:number,b:number)=> setHex(rgbToHex(r,g,b))
  const setFromHsl = (h:number,s:number,l:number)=> { const c=hslToRgb(h,s,l); setHex(rgbToHex(c.r,c.g,c.b)) }

  const copy = async (text:string, label:string)=>{ await navigator.clipboard.writeText(text); setCopied(label); setTimeout(()=>setCopied(''),1200)}

  return (
    <div className="min-h-screen bg-neural-900 text-white">
      <header className="bg-neural-800 border-b border-neural-700">
        <div className="container-custom py-6">
          <Link href="/tools/developer-utils" className="text-neural-300 hover:text-white">← Back to Developer Utils</Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center"><Palette className="w-6 h-6"/></div>
            <div>
              <h1 className="text-2xl font-bold">Color Picker</h1>
              <p className="text-neural-300">Pick colors and convert between HEX, RGB, and HSL</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-modern p-4">
            <div className="flex items-center gap-4">
              <input type="color" value={hex} onChange={(e)=>setHex(e.target.value)} className="w-16 h-16 rounded-md bg-transparent"/>
              <div>
                <div className="text-sm text-neural-300">Preview</div>
                <div className="w-40 h-8 rounded-md" style={{background: hex}}/>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card-modern p-4 flex items-center gap-3">
              <div className="w-20 text-sm text-neural-300">HEX</div>
              <input className="input-modern flex-1" value={hex} onChange={(e)=>setHex(e.target.value)} />
              <button className="btn-secondary" onClick={()=>copy(hex,'hex')}>{copied==='hex'?<Check className="w-4 h-4 mr-1"/>:<Copy className="w-4 h-4 mr-1"/>}Copy</button>
            </div>

            <div className="card-modern p-4 flex items-center gap-3 flex-wrap">
              <div className="w-20 text-sm text-neural-300">RGB</div>
              <input className="input-modern w-24" value={rgb.r} onChange={(e)=>setFromRgb(parseInt(e.target.value||'0'), rgb.g, rgb.b)} />
              <input className="input-modern w-24" value={rgb.g} onChange={(e)=>setFromRgb(rgb.r, parseInt(e.target.value||'0'), rgb.b)} />
              <input className="input-modern w-24" value={rgb.b} onChange={(e)=>setFromRgb(rgb.r, rgb.g, parseInt(e.target.value||'0'))} />
              <button className="btn-secondary" onClick={()=>copy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,'rgb')}>{copied==='rgb'?<Check className="w-4 h-4 mr-1"/>:<Copy className="w-4 h-4 mr-1"/>}Copy</button>
            </div>

            <div className="card-modern p-4 flex items-center gap-3 flex-wrap">
              <div className="w-20 text-sm text-neural-300">HSL</div>
              <input className="input-modern w-24" value={hsl.h} onChange={(e)=>setFromHsl(parseInt(e.target.value||'0'), hsl.s, hsl.l)} />
              <input className="input-modern w-24" value={hsl.s} onChange={(e)=>setFromHsl(hsl.h, parseInt(e.target.value||'0'), hsl.l)} />
              <input className="input-modern w-24" value={hsl.l} onChange={(e)=>setFromHsl(hsl.h, hsl.s, parseInt(e.target.value||'0'))} />
              <button className="btn-secondary" onClick={()=>copy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,'hsl')}>{copied==='hsl'?<Check className="w-4 h-4 mr-1"/>:<Copy className="w-4 h-4 mr-1"/>}Copy</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
