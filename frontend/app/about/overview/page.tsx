'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Heart, Zap, Shield, Lightbulb, Users, Star, Award, Globe } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const creativeStyles = `
  .glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .glow-card {
    position: relative;
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
    border: 1px solid rgba(255,255,255,0.1);
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
  .gradient-border {
    position: relative;
  }
  .gradient-border::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, #f59e0b, #ec4899);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
`

export default function AboutOverviewPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-content', { opacity: 0, y: 50, duration: 1, ease: 'power3.out' })
      gsap.from('.thanks-card', { opacity: 0, x: -50, duration: 0.8, delay: 0.3, ease: 'power3.out', scrollTrigger: { trigger: '.thanks-card', start: 'top 85%' } })
      gsap.from('.about-section', { opacity: 0, y: 40, duration: 0.8, stagger: 0.2, ease: 'power3.out', scrollTrigger: { trigger: '.about-section', start: 'top 85%' } })
      gsap.from('.mission-grid > div', { opacity: 0, y: 30, duration: 0.6, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.mission-grid', start: 'top 85%' } })
      gsap.from('.platform-card', { opacity: 0, scale: 0.95, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.platforms-grid', start: 'top 85%' } })
      gsap.from('.value-card', { opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.values-section', start: 'top 85%' } })
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

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/10 via-[#a855f7]/10 to-[#00ff88]/10" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#00d4ff] rounded-full filter blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#a855f7] rounded-full filter blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="hero-content text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 glass-card rounded-2xl mb-6">
              <Users className="w-10 h-10 text-[#00d4ff]" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#00d4ff] via-[#a855f7] to-[#00ff88] bg-clip-text text-transparent">
                About One Last AI
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Transforming businesses with emotionally intelligent, human-centric AI agents
            </p>
          </div>
        </div>
      </section>

      {/* Special Thanks */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="thanks-card gradient-border glass-card rounded-2xl p-8 md:p-10" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(236,72,153,0.1) 100%)' }}>
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#f59e0b] to-[#ec4899] rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🙏</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">Special Recognition</h3>
                <p className="text-lg text-gray-300 mb-3">
                  We extend our heartfelt gratitude to <span className="font-bold text-[#f59e0b]">Mr. Ben from Thailand</span> for his exceptional and invaluable contributions to One Last AI.
                </p>
                <p className="text-gray-400 mb-2 font-semibold">His dedication includes:</p>
                <ul className="space-y-2 text-gray-400 ml-4">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#f59e0b] text-black rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                    Significant improvements to our core services and platform architecture
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#f59e0b] text-black rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                    Development and provision of essential tools that accelerate innovation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#f59e0b] text-black rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                    Financial support that enabled critical growth and expansion
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#f59e0b] text-black rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                    Unwavering overall support across all aspects of our mission
                  </li>
                </ul>
                <p className="text-gray-300 font-semibold mt-4">
                  Mr. Ben's vision, generosity, and commitment to excellence have been instrumental in bringing One Last AI to life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About AI Digital Friend */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="about-section text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#00d4ff] to-[#a855f7] rounded-2xl mb-4">
              <Lightbulb className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">About AI Digital Friend</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Building emotionally intelligent, human-centric AI systems that redefine digital companionship
            </p>
          </div>

          {/* Intro */}
          <div className="about-section glass-card glow-card rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">The Initiative</h3>
            <p className="text-lg text-gray-300 mb-4 leading-relaxed">
              <span className="font-semibold text-[#00d4ff]">AI Digital Friend</span> is a product of <span className="font-semibold">Grand Pa United</span>, a global alliance of innovators from the UAE, UK, and USA, united by a shared mission.
            </p>
            <p className="text-lg text-gray-300 mb-4 leading-relaxed">
              This initiative is led by the visionary leadership of <span className="font-semibold text-[#a855f7]">Mr. Chaudhary Mumtaz & Sons</span>, whose commitment to innovation, community empowerment, and ethical technology has shaped the foundation of the platform.
            </p>
            <p className="text-gray-400 leading-relaxed">
              The focus is not just on tools, but on creating intelligent allies designed to support, understand, and evolve with users across cultures and contexts.
            </p>
          </div>

          {/* Mission & Why */}
          <div className="mission-grid grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div 
              className="glass-card glow-card shimmer-card rounded-2xl p-8 transition-all duration-300"
              onMouseMove={(e) => handleTilt(e, e.currentTarget)}
              onMouseLeave={(e) => resetTilt(e.currentTarget)}
              style={{ transformStyle: 'preserve-3d', borderColor: 'rgba(168,85,247,0.3)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#a855f7] to-[#ec4899] rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Our Mission</h3>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                To develop modular, adaptive, and emotionally aware AI agents that enhance human life through intuitive interaction.
              </p>
              <div className="space-y-3">
                {['Modular - Easily integrated and customized', 'Intuitive - Seamless user experience', 'Intelligent - Real-time learning frameworks', 'Companionable - Empathy over efficiency'].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-[#a855f7] font-bold">▸</span>
                    <span className="text-gray-400 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div 
              className="glass-card glow-card shimmer-card rounded-2xl p-8 transition-all duration-300"
              onMouseMove={(e) => handleTilt(e, e.currentTarget)}
              onMouseLeave={(e) => resetTilt(e.currentTarget)}
              style={{ transformStyle: 'preserve-3d', borderColor: 'rgba(0,255,136,0.3)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00ff88] to-[#00d4ff] rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Why AI Digital Friend?</h3>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                In a world full of automation, the future belongs to human-aware AI that understands context, emotion, and intent.
              </p>
              <div className="space-y-3">
                {['Approachable - Friendly, natural interactions', 'Adaptive - Learns from user behavior', 'Secure - Privacy and ethical safeguards', 'Scalable - Enterprise-ready, global'].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-[#00ff88] font-bold">✓</span>
                    <span className="text-gray-400 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Royal AI Vision */}
          <div className="about-section rounded-2xl p-8 md:p-10 mb-8" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.2) 50%, rgba(236,72,153,0.2) 100%)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-[#f59e0b]" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">The Road Ahead: Royal AI</h3>
            </div>
            <p className="text-lg text-gray-300 mb-6">
              Long-term vision: Royal AI, a next-generation ecosystem to push the boundaries of AI-human collaboration.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-6">
                <h4 className="text-xl font-bold text-white mb-3">Red Teaming Academy</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2"><span className="text-[#00d4ff]">▸</span> Secure, invite-only ethical hacking education</li>
                  <li className="flex items-center gap-2"><span className="text-[#00d4ff]">▸</span> Hands-on labs, mentorship, awareness</li>
                  <li className="flex items-center gap-2"><span className="text-[#00d4ff]">▸</span> Youth empowerment and professional development</li>
                </ul>
              </div>
              <div className="glass-card rounded-xl p-6">
                <h4 className="text-xl font-bold text-white mb-3">One Last AI Master</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2"><span className="text-[#a855f7]">▸</span> Immersive AI multiverse with 50+ agents</li>
                  <li className="flex items-center gap-2"><span className="text-[#a855f7]">▸</span> Memory, voice, and visual intelligence</li>
                  <li className="flex items-center gap-2"><span className="text-[#a855f7]">▸</span> Cinematic AI design - personal and purposeful</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Vision */}
          <div className="about-section glass-card glow-card rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00d4ff] to-[#00ff88] rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Our Vision</h3>
            </div>
            <p className="text-lg text-gray-300 mb-4 leading-relaxed">
              A future where AI and humanity co-create solutions, govern systems, and elevate global well-being.
            </p>
            <p className="text-gray-400 leading-relaxed">
              AI Digital Friend will be a trusted ally as AI becomes part of daily life. One day, AI could play a role in governance, education, and diplomacy.
            </p>
          </div>

          {/* Strategic Platforms */}
          <div className="about-section mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#f59e0b] to-[#ec4899] rounded-xl mb-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">Strategic Platforms</h3>
            </div>
            <div className="platforms-grid grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="platform-card glass-card glow-card shimmer-card float-card rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#f59e0b] to-[#ec4899] rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white">OneManArmy.ai</h4>
                </div>
                <p className="text-gray-400 text-sm mb-4">Tactical platform for ethical hacking education</p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full"></span> Real-world labs & AI-powered mentors</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full"></span> Certification pathways</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full"></span> Youth-focused, premium, secure</li>
                </ul>
              </div>
              <div className="platform-card glass-card glow-card shimmer-card float-card rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#a855f7] to-[#ec4899] rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white">One Last AI</h4>
                </div>
                <p className="text-gray-400 text-sm mb-4">Cinematic AI multiverse with 50+ modular agents</p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#a855f7] rounded-full"></span> Memory, emotion, voice, personality</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#a855f7] rounded-full"></span> Terminal, web, mobile deployment</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#a855f7] rounded-full"></span> Enterprise-ready, scalable</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Public Manifesto */}
          <div className="about-section glass-card rounded-2xl p-8 mb-8" style={{ borderColor: 'rgba(236,72,153,0.3)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#ec4899] to-[#f43f5e] rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Public Manifesto</h3>
            </div>
            <p className="text-gray-300 mb-6 font-semibold">This is built for the public - the real stakeholders.</p>
            <ul className="space-y-3 mb-6">
              {['Every learner cracking their first exploit', 'Every creator launching with an AI co-pilot', 'Every dreamer who sees tech as a story'].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#ec4899] font-bold text-lg">→</span>
                  <span className="text-gray-400">{item}</span>
                </li>
              ))}
            </ul>
            <div className="glass-card rounded-xl p-6">
              <p className="text-gray-300 font-semibold mb-3">Our Belief:</p>
              <ul className="space-y-2">
                {['Platforms should feel personal', 'Agents should feel alive', 'Every launch should feel cinematic'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-400">
                    <span className="text-[#ec4899]">◆</span>
                    <span className="font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-white font-bold mt-6 text-lg">
              Royal AI: Every limitation becomes a legend. Every user becomes a collaborator.
            </p>
          </div>

          {/* Acknowledgments */}
          <div className="about-section glass-card glow-card rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#f59e0b] to-[#fbbf24] rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Acknowledgments</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Special thanks to <span className="font-semibold text-[#f59e0b]">Professor Johnny</span>, whose technical brilliance, creative direction, and strategic insight shaped the platform's architecture, branding, and strategy.
            </p>
            <p className="text-gray-500 mt-4 italic">
              His work embodies guerrilla-grade innovation - turning constraints into creativity, and ideas into impact.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="values-section py-20 md:py-28" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(168,85,247,0.1) 50%, rgba(0,255,136,0.1) 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 glass-card rounded-2xl mb-4">
              <Star className="w-8 h-8 text-[#f59e0b]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: 'Innovation', desc: 'Continuously pushing the boundaries of what\'s possible with AI technology.', color: '#00d4ff' },
              { icon: Shield, title: 'Trust', desc: 'Building secure, reliable, and transparent AI solutions you can depend on.', color: '#a855f7' },
              { icon: Zap, title: 'Excellence', desc: 'Delivering exceptional experiences that exceed expectations every time.', color: '#00ff88' }
            ].map((value, i) => (
              <div key={i} className="value-card text-center glass-card glow-card shimmer-card float-card rounded-2xl p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${value.color}33, ${value.color}11)` }}>
                  <value.icon className="w-8 h-8" style={{ color: value.color }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Team */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card glow-card rounded-3xl p-10 md:p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#00d4ff] to-[#a855f7] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join Our Growing Team</h2>
            <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
              We're hiring talented people who share our passion for AI innovation and human-centric technology.
            </p>
            <Link href="/resources/careers" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#a855f7] text-white font-bold rounded-xl hover:shadow-xl shadow-lg shadow-[#00d4ff]/25 transition-all transform hover:scale-105">
              View Careers
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
