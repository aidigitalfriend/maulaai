'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
  .avatar-glow {
    box-shadow: 0 0 30px currentColor;
  }
`

export default function TeamPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  const teamMembers = [
    { name: "Shahbaz Chaudhry", role: "CEO & Co-founder", bio: "AI researcher with 15+ years of experience in building intelligent systems", color: "#00d4ff" },
    { name: "Adil Pieter", role: "CTO & Co-founder", bio: "Machine learning expert and former Google AI researcher", color: "#a855f7" },
    { name: "Zara Faisal", role: "VP of Product", bio: "Product leader focused on user experience and innovation", color: "#00ff88" },
    { name: "Sarah Williams", role: "VP of Sales", bio: "Enterprise sales veteran with deep market knowledge", color: "#f59e0b" },
    { name: "Emily Chen", role: "Lead AI Engineer", bio: "PhD in Computer Science from Stanford University", color: "#ec4899" },
    { name: "David Rodriguez", role: "Head of Design", bio: "Design leader passionate about usability and aesthetics", color: "#06b6d4" }
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', { opacity: 0, y: 50, duration: 1, ease: 'power3.out' })
      gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 1, delay: 0.2, ease: 'power3.out' })
      gsap.from('.team-card', { opacity: 0, y: 40, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.team-grid', start: 'top 85%' } })
      gsap.from('.cta-section', { opacity: 0, y: 40, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.cta-section', start: 'top 85%' } })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const handleTilt = (e: React.MouseEvent<HTMLElement>, card: HTMLElement) => {
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 12
    const rotateY = (centerX - x) / 12
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`
  }

  const resetTilt = (card: HTMLElement) => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)'
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      <style dangerouslySetInnerHTML={{ __html: creativeStyles }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#00d4ff] via-[#a855f7] to-[#00ff88] bg-clip-text text-transparent">
              Meet Our Team
            </span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 leading-relaxed">
            Talented people working toward a common goal - building the future of AI
          </p>
        </div>

        {/* Team Grid */}
        <div className="team-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="team-card glass-card glow-card shimmer-card rounded-2xl p-8 text-center transition-all duration-300"
              onMouseMove={(e) => handleTilt(e, e.currentTarget)}
              onMouseLeave={(e) => resetTilt(e.currentTarget)}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div
                className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                style={{
                  background: `linear-gradient(135deg, ${member.color}, ${member.color}88)`,
                  boxShadow: `0 0 40px ${member.color}40`
                }}
              >
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
              <p className="font-semibold mb-3" style={{ color: member.color }}>{member.role}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="cta-section glass-card glow-card rounded-3xl p-10 md:p-12 text-center" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(168,85,247,0.1) 50%, rgba(0,255,136,0.1) 100%)' }}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">We're Growing</h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            We're actively hiring talented people to join our mission. Check out our open positions and become part of something extraordinary.
          </p>
          <Link
            href="/resources/careers"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#a855f7] text-white font-bold rounded-xl hover:shadow-xl shadow-lg shadow-[#00d4ff]/25 transition-all transform hover:scale-105"
          >
            View Open Positions
          </Link>
        </div>
      </div>
    </div>
  )
}
