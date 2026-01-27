'use client'

import Link from 'next/link'
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Map, Lightbulb, Users, CheckCircle, Clock, Sparkles } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const creativeStyles = `
  .glass-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .glow-card {
    position: relative;
    overflow: hidden;
  }
  .glow-card::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(45deg, #00d4ff, #00ff88, #a855f7, #00d4ff);
    background-size: 400% 400%;
    animation: glow-rotate 8s linear infinite;
    opacity: 0;
    transition: opacity 0.5s ease;
    border-radius: inherit;
    z-index: -1;
  }
  .glow-card:hover::before {
    opacity: 1;
  }
  .glow-card::after {
    content: '';
    position: absolute;
    inset: 1px;
    background: #0a0a0a;
    border-radius: inherit;
    z-index: -1;
  }
  @keyframes glow-rotate {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .shimmer-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.7s ease;
  }
  .shimmer-card:hover::before {
    left: 100%;
  }
  .float-card {
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;
  }
  .float-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 25px 50px -12px rgba(0, 212, 255, 0.25);
  }
`

export default function RoadmapPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 20
    const rotateY = (centerX - x) / 20
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)'
  }

  useGSAP(() => {
    gsap.fromTo('.hero-badge', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.7)' })
    gsap.fromTo('.hero-title', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' })
    gsap.fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power2.out' })
    gsap.fromTo('.phase-card', { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.2, ease: 'power2.out', scrollTrigger: { trigger: '.roadmap-timeline', start: 'top 85%' } })
    gsap.fromTo('.progress-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: '.progress-card', start: 'top 85%' } })
    gsap.fromTo('.cta-card', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.cta-card', start: 'top 85%' } })
  }, { scope: containerRef })

  const roadmap = [
    {
      quarter: "Q4 2025",
      status: "Completed",
      statusColor: "#00ff88",
      icon: "✓",
      features: [
        { name: "Voice integration for all agents", description: "Natural voice conversations with every AI agent", completed: true },
        { name: "Advanced analytics dashboard", description: "Deep insights into usage patterns and performance", completed: true },
        { name: "Custom agent creation", description: "Build and train your own specialized AI agents", completed: true }
      ]
    },
    {
      quarter: "Q1 2026",
      status: "In Progress",
      statusColor: "#f59e0b",
      icon: "🔄",
      features: [
        { name: "Mobile app launch", description: "Native iOS and Android apps for on-the-go access", completed: false },
        { name: "Slack integration", description: "Use agents directly in your Slack workspace", completed: true },
        { name: "Team collaboration features", description: "Share agents and conversations with your team", completed: false },
        { name: "Canvas code generation", description: "AI-powered code and content generation workspace", completed: true }
      ]
    },
    {
      quarter: "Q2 2026",
      status: "Planned",
      statusColor: "#00d4ff",
      icon: "📋",
      features: [
        { name: "Enterprise SSO", description: "SAML and OAuth integration for enterprise security", completed: false },
        { name: "Advanced security features", description: "SOC 2 compliance and advanced encryption", completed: false },
        { name: "API marketplace", description: "Discover and integrate third-party AI tools", completed: false }
      ]
    },
    {
      quarter: "Q3 2026",
      status: "Planned",
      statusColor: "#a855f7",
      icon: "🚀",
      features: [
        { name: "Multi-modal agents", description: "Agents that understand images, audio, and documents", completed: false },
        { name: "Workflow automation", description: "Chain agents together for complex tasks", completed: false },
        { name: "White-label solutions", description: "Deploy branded AI agents for your customers", completed: false }
      ]
    }
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white">
      <style jsx>{creativeStyles}</style>
      
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-[#a855f7]/15 via-transparent to-transparent blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 mb-6">
            <Map className="w-4 h-4 text-[#a855f7]" />
            <span className="text-sm text-[#a855f7] font-medium">Building the Future</span>
          </div>
          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent leading-tight">
            Product Roadmap
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            See what we&apos;re building next and help shape the future of One Last AI
          </p>
        </div>
      </section>

      <section className="roadmap-timeline py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {roadmap.map((phase, idx) => (
            <div 
              key={idx} 
              className="phase-card glass-card glow-card rounded-2xl border border-white/5 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex flex-wrap items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${phase.statusColor}40, ${phase.statusColor}20)`, boxShadow: `0 10px 40px ${phase.statusColor}30` }}
                >
                  {phase.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{phase.quarter}</h2>
                </div>
                <span 
                  className="px-4 py-1.5 rounded-full text-sm font-semibold border"
                  style={{ 
                    backgroundColor: `${phase.statusColor}15`, 
                    color: phase.statusColor, 
                    borderColor: `${phase.statusColor}30` 
                  }}
                >
                  {phase.status}
                </span>
              </div>
              
              <div className="p-6 space-y-4">
                {phase.features.map((feature, fIdx) => (
                  <div 
                    key={fIdx} 
                    className={`flex items-start gap-4 p-4 rounded-xl transition ${
                      feature.completed 
                        ? 'bg-[#00ff88]/5 border border-[#00ff88]/20' 
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      feature.completed 
                        ? 'bg-[#00ff88] text-black' 
                        : 'bg-white/10 text-gray-400'
                    }`}>
                      {feature.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${feature.completed ? 'text-[#00ff88]' : 'text-white'}`}>
                        {feature.name}
                      </h3>
                      <p className={`text-sm mt-0.5 ${feature.completed ? 'text-[#00ff88]/70' : 'text-gray-500'}`}>
                        {feature.description}
                      </p>
                    </div>
                    {feature.completed && (
                      <span className="text-xs font-medium text-[#00ff88] bg-[#00ff88]/10 px-2 py-1 rounded-full">Done</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-12">
          <div 
            className="progress-card glass-card float-card rounded-2xl border border-white/5 p-6 cursor-pointer"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <h3 className="text-lg font-bold text-white mb-4">Overall Progress</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-full transition-all duration-1000" 
                  style={{ width: '45%' }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-white">45% Complete</span>
            </div>
            <div className="flex flex-wrap gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00ff88]"></div>
                <span className="text-gray-400">Completed: 6 features</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                <span className="text-gray-400">In Progress: 2 features</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-gray-400">Planned: 6 features</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div 
            className="cta-card glass-card glow-card rounded-3xl border border-[#a855f7]/30 p-10 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7]/10 via-transparent to-[#00d4ff]/10"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-[#a855f7] to-[#00d4ff] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#a855f7]/25">
                <Lightbulb className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Have an Idea?</h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-8">
                We love hearing from our community. Share your feature requests and help shape the future of One Last AI.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/community/suggestions" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#00ff88] hover:from-[#00b8e6] hover:to-[#00e077] text-black rounded-xl font-semibold transition shadow-lg shadow-[#00d4ff]/25"
                >
                  <Sparkles className="w-5 h-5" />
                  Submit Your Idea
                </Link>
                <Link 
                  href="/community" 
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition"
                >
                  <Users className="w-5 h-5" />
                  Join Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
