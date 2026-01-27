'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const creativeStyles = `
  .glass-card {
    background: rgba(30, 30, 35, 0.9);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
  .glow-card {
    position: relative;
    background: linear-gradient(135deg, rgba(40, 40, 50, 0.95) 0%, rgba(25, 25, 35, 0.95) 100%);
    border: 1px solid rgba(255,255,255,0.12);
  }
  .glow-card::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    padding: 2px;
    background: linear-gradient(135deg, #00d4ff, #a855f7, #00ff88);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  .glow-card:hover::before { opacity: 1; }
  .input-glow:focus {
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
  }
  .shimmer-card {
    position: relative;
    overflow: hidden;
  }
  .shimmer-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
    transition: left 0.6s ease;
  }
  .shimmer-card:hover::after { left: 100%; }
  .float-card {
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;
  }
  .float-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 212, 255, 0.15);
  }
`

export default function BookConsultation() {
  const containerRef = useRef<HTMLDivElement>(null)

  const steps = [
    { icon: '📅', title: 'Schedule', description: 'Choose a time that works for you', color: '#00d4ff' },
    { icon: '💬', title: 'Discuss', description: 'Talk about your AI agent needs', color: '#a855f7' },
    { icon: '🚀', title: 'Launch', description: 'Get started with your solution', color: '#00ff88' }
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-content', { opacity: 0, y: 50, duration: 1, ease: 'power3.out' })
      gsap.from('.step-card', { opacity: 0, y: 30, duration: 0.6, stagger: 0.15, delay: 0.3, ease: 'power3.out' })
      gsap.from('.form-container', { opacity: 0, y: 40, duration: 0.8, delay: 0.5, ease: 'power3.out', scrollTrigger: { trigger: '.form-container', start: 'top 85%' } })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const handleTilt = (e: React.MouseEvent<HTMLElement>, card: HTMLElement) => {
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 15
    const rotateY = (centerX - x) / 15
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`
  }

  const resetTilt = (card: HTMLElement) => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)'
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      <style dangerouslySetInnerHTML={{ __html: creativeStyles }} />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/10 via-[#a855f7]/10 to-[#00ff88]/10" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#00d4ff] rounded-full filter blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#a855f7] rounded-full filter blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="hero-content text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#00d4ff] via-[#a855f7] to-[#00ff88] bg-clip-text text-transparent">
                Book a Consultation
              </span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Schedule a personalized consultation with our AI experts to discuss your specific needs and goals.
            </p>
          </div>

          {/* Steps */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="step-card glass-card glow-card shimmer-card rounded-2xl p-6 text-center transition-all duration-300"
                  onMouseMove={(e) => handleTilt(e, e.currentTarget)}
                  onMouseLeave={(e) => resetTilt(e.currentTarget)}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: `${step.color}22` }}>
                    <span className="text-3xl">{step.icon}</span>
                  </div>
                  <h3 className="font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="form-container glass-card glow-card rounded-3xl p-8 md:p-10">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] input-glow transition-all" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input type="text" className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] input-glow transition-all" placeholder="Doe" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input type="email" className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] input-glow transition-all" placeholder="john@company.com" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                <input type="text" className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] input-glow transition-all" placeholder="Your company name" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">What are you interested in?</label>
                <select className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00d4ff] input-glow transition-all">
                  <option value="" className="bg-[#1a1a1a]">Select an option</option>
                  <option value="enterprise" className="bg-[#1a1a1a]">Enterprise Solutions</option>
                  <option value="agents" className="bg-[#1a1a1a]">AI Agent Implementation</option>
                  <option value="custom" className="bg-[#1a1a1a]">Custom Development</option>
                  <option value="consulting" className="bg-[#1a1a1a]">Strategy Consulting</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tell us about your project</label>
                <textarea rows={4} className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff] input-glow transition-all resize-none" placeholder="Describe your needs, goals, and timeline..."></textarea>
              </div>
              
              <button type="submit" className="w-full py-4 bg-gradient-to-r from-[#00d4ff] to-[#a855f7] text-white font-bold rounded-xl hover:shadow-xl shadow-lg shadow-[#00d4ff]/25 transition-all transform hover:scale-[1.02]">
                Schedule Consultation
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
