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
  .pulse-glow {
    animation: pulseGlow 2s ease-in-out infinite;
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 212, 255, 0.6); }
  }
`

export default function SupportPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  const supportOptions = [
    { title: 'Help Center', description: 'Browse docs, tutorials, and guides', icon: '📚', href: '/support/help-center', color: '#00d4ff' },
    { title: 'FAQs', description: 'Quick answers to common questions', icon: '❓', href: '/support/faqs', color: '#a855f7' },
    { title: 'Live Support', description: 'Chat with our AI support agent', icon: '💬', href: '/support/live-support', color: '#00ff88' },
    { title: 'Create Ticket', description: 'Submit a detailed support request', icon: '🎫', href: '/support/create-ticket', color: '#f59e0b' },
    { title: 'Contact Us', description: 'Get in touch with our team', icon: '📧', href: '/support/contact-us', color: '#ec4899' },
    { title: 'Book Consultation', description: 'Schedule a personalized session', icon: '📅', href: '/support/book-consultation', color: '#06b6d4' }
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', { opacity: 0, y: 50, duration: 1, ease: 'power3.out' })
      gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 1, delay: 0.2, ease: 'power3.out' })
      gsap.from('.hero-cta', { opacity: 0, scale: 0.9, duration: 0.8, delay: 0.4, ease: 'back.out(1.7)' })
      gsap.from('.support-card', { opacity: 0, y: 40, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.support-grid', start: 'top 85%' } })
      gsap.from('.stat-item', { opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.stats-section', start: 'top 85%' } })
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

      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/10 via-[#a855f7]/10 to-[#00ff88]/10" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#00d4ff] rounded-full filter blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#a855f7] rounded-full filter blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#00d4ff] via-[#a855f7] to-[#00ff88] bg-clip-text text-transparent">
              Support Center
            </span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 leading-relaxed mb-10 max-w-3xl mx-auto">
            Get help, contact support, book consultations, and find answers to all your questions.
          </p>
          <Link href="/support/help-center" className="hero-cta inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#a855f7] text-white font-bold rounded-xl hover:shadow-xl shadow-lg shadow-[#00d4ff]/25 transition-all transform hover:scale-105 pulse-glow">
            Get Support Now
          </Link>
        </div>
      </section>

      {/* Support Options Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="support-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {supportOptions.map((option, index) => (
              <Link
                key={index}
                href={option.href}
                className="support-card group glass-card glow-card shimmer-card rounded-2xl p-8 transition-all duration-300"
                onMouseMove={(e) => handleTilt(e, e.currentTarget)}
                onMouseLeave={(e) => resetTilt(e.currentTarget)}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="text-5xl mb-4">{option.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00d4ff] transition-colors">
                  {option.title}
                </h3>
                <p className="text-gray-400">{option.description}</p>
                <div className="mt-4 flex items-center text-sm font-semibold" style={{ color: option.color }}>
                  Learn more
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-3xl p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '< 2hrs', label: 'Avg Response', color: '#00d4ff' },
                { value: '24/7', label: 'Availability', color: '#a855f7' },
                { value: '98%', label: 'Satisfaction', color: '#00ff88' },
                { value: '10K+', label: 'Issues Resolved', color: '#f59e0b' }
              ].map((stat, i) => (
                <div key={i} className="stat-item">
                  <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: stat.color, textShadow: `0 0 30px ${stat.color}` }}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
