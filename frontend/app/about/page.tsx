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
  .stat-glow {
    text-shadow: 0 0 30px currentColor;
  }
`

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])

  const sections = [
    {
      title: "About Us",
      description: "Learn about our mission, vision, and the story behind our AI agent platform.",
      icon: "🏢",
      href: "/about/overview",
      highlights: ["Company Mission", "Our Vision", "Core Values", "Company History"],
      color: "#00d4ff"
    },
    {
      title: "Meet the Team",
      description: "Get to know the talented individuals driving innovation in AI technology.",
      icon: "👥",
      href: "/about/team",
      highlights: ["Leadership Team", "Engineering", "Research", "Customer Success"],
      color: "#a855f7"
    },
    {
      title: "Partnerships",
      description: "Discover our strategic partnerships and ecosystem of collaborators.",
      icon: "🤝",
      href: "/about/partnerships",
      highlights: ["Technology Partners", "Integration Partners", "Channel Partners", "Academic Research"],
      color: "#00ff88"
    }
  ]

  const stats = [
    { number: "50M+", label: "Conversations Processed", color: "#00d4ff" },
    { number: "10K+", label: "Active Users", color: "#a855f7" },
    { number: "99.9%", label: "Uptime", color: "#00ff88" },
    { number: "150+", label: "Countries Served", color: "#f59e0b" }
  ]

  const values = [
    { icon: "🎯", title: "Innovation", description: "Continuously pushing the boundaries of what's possible with AI technology." },
    { icon: "🛡️", title: "Trust", description: "Building secure, reliable, and transparent AI solutions you can depend on." },
    { icon: "🚀", title: "Excellence", description: "Delivering exceptional experiences that exceed expectations every time." }
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', { opacity: 0, y: 50, duration: 1, ease: 'power3.out' })
      gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 1, delay: 0.2, ease: 'power3.out' })
      gsap.from('.mission-card', { opacity: 0, y: 40, duration: 0.8, delay: 0.4, ease: 'power3.out', scrollTrigger: { trigger: '.mission-card', start: 'top 85%' } })
      gsap.from('.stat-item', { opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.stats-grid', start: 'top 85%' } })
      gsap.from('.section-card', { opacity: 0, y: 40, duration: 0.6, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.sections-grid', start: 'top 85%' } })
      gsap.from('.value-card', { opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.values-grid', start: 'top 85%' } })
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
        {/* Hero */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#00d4ff] via-[#a855f7] to-[#00ff88] bg-clip-text text-transparent">
              About Us
            </span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl text-gray-400 leading-relaxed">
            We're building the future of AI agents, empowering businesses to automate and scale with intelligent conversational AI.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="mission-card glass-card glow-card rounded-3xl p-10 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              To democratize access to advanced AI technology by creating intelligent agents that understand, learn, and adapt to help businesses achieve their goals more efficiently.
            </p>
            <p className="text-gray-400">
              We believe that AI should be accessible, transparent, and designed to augment human capabilities rather than replace them.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item text-center p-6 glass-card rounded-2xl">
              <div className="text-4xl md:text-5xl font-bold mb-2 stat-glow" style={{ color: stat.color }}>
                {stat.number}
              </div>
              <div className="text-gray-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* About Sections */}
        <div className="sections-grid grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {sections.map((section, index) => (
            <Link
              key={index}
              href={section.href}
              className="section-card group glass-card glow-card shimmer-card float-card rounded-2xl p-8 transition-all duration-300"
              onMouseMove={(e) => handleTilt(e, e.currentTarget)}
              onMouseLeave={(e) => resetTilt(e.currentTarget)}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="text-5xl mb-4">{section.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00d4ff] transition-colors">
                {section.title}
              </h3>
              <p className="text-gray-400 mb-4 leading-relaxed">
                {section.description}
              </p>
              <ul className="space-y-2">
                {section.highlights.map((highlight, highlightIndex) => (
                  <li key={highlightIndex} className="text-sm text-gray-500 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full mr-3" style={{ backgroundColor: section.color }}></span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        {/* Values */}
        <div className="values-grid rounded-3xl p-10" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(168,85,247,0.1) 50%, rgba(0,255,136,0.1) 100%)' }}>
          <h2 className="text-3xl font-bold text-white mb-10 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="value-card text-center glass-card rounded-2xl p-8">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
