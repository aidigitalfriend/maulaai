'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function SupportPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  const supportOptions = [
    { title: 'Help Center', description: 'Browse documentation, tutorials, and comprehensive guides', icon: '📚', href: '/support/help-center' },
    { title: 'FAQs', description: 'Quick answers to the most commonly asked questions', icon: '❓', href: '/support/faqs' },
    { title: 'Live Support', description: 'Chat with our AI-powered support assistant instantly', icon: '💬', href: '/support/live-support' },
    { title: 'Create Ticket', description: 'Submit a detailed request for personalized help', icon: '🎫', href: '/support/create-ticket' },
    { title: 'Contact Us', description: 'Get in touch with our dedicated support team', icon: '📧', href: '/support/contact-us' },
    { title: 'Book Consultation', description: 'Schedule a personalized one-on-one session', icon: '📅', href: '/support/book-consultation' }
  ]

  const stats = [
    { value: '< 2hrs', label: 'Avg Response Time' },
    { value: '24/7', label: 'Availability' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '10K+', label: 'Issues Resolved' }
  ]

  useGSAP(() => {
    // Hero entrance
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    heroTl
      .fromTo('.hero-badge', { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 })
      .fromTo('.hero-title', { opacity: 0, y: 100, scale: 0.9, rotateX: 20 }, { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 1.2 }, '-=0.3')
      .fromTo('.hero-subtitle', { opacity: 0, y: 50, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 }, '-=0.6')
      .fromTo('.hero-cta', { opacity: 0, y: 30, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(2)' }, '-=0.4')

    // Cards stagger animation
    const cards = gsap.utils.toArray('.support-card')
    cards.forEach((card: any, i) => {
      const directions = [
        { x: -80, y: -40, rotate: -8 },
        { x: 0, y: -60, rotate: 0 },
        { x: 80, y: -40, rotate: 8 },
        { x: -80, y: 40, rotate: -8 },
        { x: 0, y: 60, rotate: 0 },
        { x: 80, y: 40, rotate: 8 },
      ]
      const dir = directions[i % directions.length]
      
      gsap.fromTo(card,
        { opacity: 0, x: dir.x, y: dir.y, rotate: dir.rotate, scale: 0.8 },
        {
          opacity: 1, x: 0, y: 0, rotate: 0, scale: 1,
          duration: 0.8,
          delay: i * 0.1,
          ease: 'elastic.out(1, 0.8)',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      )
    })

    // Stats animation
    gsap.fromTo('.stat-item',
      { opacity: 0, y: 40, scale: 0.9 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    )
  }, { scope: containerRef })

  // 3D Tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 20
    const rotateY = (centerX - x) / 20
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      
      {/* Styles matching theme-demo */}
      <style jsx global>{`
        .glow-card {
          position: relative;
          overflow: hidden;
        }
        .glow-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(90deg, #00d4ff, #00ff88, #0066ff, #00d4ff);
          background-size: 400% 100%;
          animation: glow-rotate 4s linear infinite;
          border-radius: inherit;
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .glow-card:hover::before {
          opacity: 1;
        }
        .glow-card::after {
          content: '';
          position: absolute;
          inset: 1px;
          background: #0f0f0f;
          border-radius: inherit;
          z-index: -1;
        }
        @keyframes glow-rotate {
          0% { background-position: 0% 50%; }
          100% { background-position: 400% 50%; }
        }
        
        .shimmer-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(0, 212, 255, 0.1), transparent);
          transition: left 0.6s ease;
        }
        .shimmer-card:hover::before {
          left: 100%;
        }
        
        .float-card {
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
        }
        .float-card:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 212, 255, 0.25);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(0, 212, 255, 0.3);
        }
        
        .gradient-border {
          position: relative;
          background: linear-gradient(#0f0f0f, #0f0f0f) padding-box,
                      linear-gradient(135deg, #00d4ff, #00ff88, #0066ff) border-box;
          border: 2px solid transparent;
        }
        
        .icon-bounce {
          transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .group:hover .icon-bounce {
          transform: scale(1.2) rotate(-5deg);
        }
      `}</style>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(circle,rgba(0,212,255,0.1),transparent)] blur-3xl"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#00ff88]/5 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-[#0066ff]/5 rounded-full filter blur-[100px]"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8 opacity-0">
            <span className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse"></span>
            Support Available 24/7
          </div>
          
          {/* Title with metallic gradient */}
          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent leading-tight opacity-0">
            How Can We Help You Today?
          </h1>
          
          {/* Subtitle */}
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 opacity-0">
            Get instant support, browse our knowledge base, or connect with our team. We&apos;re here to ensure your success.
          </p>
          
          {/* CTA Buttons */}
          <div className="hero-cta flex flex-wrap items-center justify-center gap-4 opacity-0">
            <Link href="/support/live-support" className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white font-semibold hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all hover:scale-105">
              Start Live Chat
            </Link>
            <Link href="/support/help-center" className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all">
              Browse Help Center
            </Link>
          </div>
        </div>
      </section>

      {/* Support Options Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
              Support Options
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Choose the support channel that works best for you
            </p>
          </div>
          
          {/* Cards Grid - 3 columns */}
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportOptions.map((option, index) => (
              <Link
                key={index}
                href={option.href}
                className="support-card group relative rounded-2xl p-6 glass-card glow-card shimmer-card float-card transition-all duration-300 opacity-0"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Icon */}
                <div className="text-5xl mb-4 icon-bounce">{option.icon}</div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00d4ff] transition-colors">
                  {option.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {option.description}
                </p>
                
                {/* Arrow */}
                <div className="flex items-center text-sm font-medium text-[#00d4ff] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-24 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl gradient-border p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, i) => (
                <div key={i} className="stat-item opacity-0">
                  <div className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#00d4ff] to-[#00ff88] bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-2xl p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(0,102,255,0.1) 100%)' }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,212,255,0.15),transparent_70%)]"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
                Need Immediate Assistance?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Our AI support assistant is available around the clock to help you with any questions or issues.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/support/create-ticket" className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white font-semibold hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all hover:scale-105">
                  Create Support Ticket
                </Link>
                <Link href="/support/book-consultation" className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all">
                  Book a Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
