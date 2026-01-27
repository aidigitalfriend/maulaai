'use client'

import Link from 'next/link'
import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Users, MessageCircle, GitBranch, Map, Heart, Star, Code, Sparkles, ArrowRight, ExternalLink } from 'lucide-react'

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

export default function CommunityOverviewPage() {
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
    gsap.fromTo('.hero-buttons', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.6, ease: 'power2.out' })
    gsap.fromTo('.stat-card', { opacity: 0, y: 40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.stats-grid', start: 'top 85%' } })
    gsap.fromTo('.link-card', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out', scrollTrigger: { trigger: '.links-grid', start: 'top 85%' } })
    gsap.fromTo('.highlight-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: '.highlights-grid', start: 'top 85%' } })
  }, { scope: containerRef })

  const communityLinks = [
    {
      icon: MessageCircle,
      emoji: "💬",
      title: "Discord Community",
      description: "Join our active Discord server to connect with other AI enthusiasts, get help, and share your projects.",
      link: "/community/discord",
      linkText: "Join Discord",
      color: "#a855f7"
    },
    {
      icon: GitBranch,
      emoji: "🔧",
      title: "Contributing",
      description: "Help improve One Last AI by contributing code, reporting bugs, or suggesting new features.",
      link: "/community/contributing",
      linkText: "Get Involved",
      color: "#00ff88"
    },
    {
      icon: Map,
      emoji: "🗺️",
      title: "Open Roadmap",
      description: "See what features are coming next, track progress, and vote on what matters to you.",
      link: "/community/roadmap",
      linkText: "View Roadmap",
      color: "#f59e0b"
    },
    {
      icon: Sparkles,
      emoji: "💡",
      title: "Suggestions",
      description: "Share your ideas and feature requests. We love hearing from our community!",
      link: "/community/suggestions",
      linkText: "Submit Ideas",
      color: "#ec4899"
    }
  ]

  const stats = [
    { number: "10K+", label: "Active Members", emoji: "👥", color: "#00d4ff" },
    { number: "5K+", label: "GitHub Stars", emoji: "⭐", color: "#f59e0b" },
    { number: "500+", label: "Contributions", emoji: "🔧", color: "#00ff88" },
    { number: "18", label: "AI Agents", emoji: "🤖", color: "#a855f7" }
  ]

  const highlights = [
    { icon: Heart, title: "Supportive Environment", description: "Our community is welcoming to all skill levels", color: "#ec4899" },
    { icon: Code, title: "Open Source Spirit", description: "Transparency and collaboration at our core", color: "#00d4ff" },
    { icon: Star, title: "Recognition", description: "Top contributors get featured and rewarded", color: "#f59e0b" }
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white">
      <style jsx>{creativeStyles}</style>
      
      {/* Hero Header */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-[#00d4ff]/10 via-transparent to-transparent blur-3xl"></div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-[#00d4ff]/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-20 w-32 h-32 bg-[#a855f7]/10 rounded-full blur-2xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 mb-6">
            <Users className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-sm text-[#00d4ff] font-medium">Community Overview</span>
          </div>
          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent leading-tight">
            Our Community
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Join thousands of AI enthusiasts, developers, and innovators building the future together.
          </p>
          <div className="hero-buttons flex flex-wrap justify-center gap-4">
            <Link 
              href="/community/discord" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#00ff88] text-black rounded-xl font-semibold hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all transform hover:scale-105"
            >
              <MessageCircle className="w-5 h-5" />
              Join Discord
            </Link>
            <Link 
              href="/community/contributing" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              <GitBranch className="w-5 h-5" />
              Contribute
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Community Stats</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              A growing community of passionate individuals making AI accessible to everyone.
            </p>
          </div>
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className="stat-card glass-card float-card shimmer-card rounded-2xl p-6 border border-white/5 text-center cursor-pointer overflow-hidden relative group"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${stat.color}20, transparent 60%)` }}
                ></div>
                <div className="text-4xl mb-2">{stat.emoji}</div>
                <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: stat.color }}>{stat.number}</div>
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Links Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#00d4ff]/20 to-transparent rounded-2xl mb-4">
              <Sparkles className="w-7 h-7 text-[#00d4ff]" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Get Involved</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              There are many ways to be part of our community. Find what works best for you.
            </p>
          </div>
          
          <div className="links-grid grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {communityLinks.map((item, idx) => {
              const Icon = item.icon
              return (
                <Link 
                  key={idx} 
                  href={item.link}
                  className="link-card group glass-card glow-card shimmer-card rounded-2xl border border-white/5 p-6 transition-all duration-500 hover:border-white/20 overflow-hidden relative"
                  onMouseMove={handleMouseMove as any}
                  onMouseLeave={handleMouseLeave as any}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${item.color}15, transparent 60%)` }}
                  ></div>
                  <div className="flex items-start gap-4 relative z-10">
                    <div 
                      className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                      style={{ background: `linear-gradient(135deg, ${item.color}30, transparent)` }}
                    >
                      {item.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00d4ff] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 mb-4">{item.description}</p>
                      <div className="inline-flex items-center gap-2 font-semibold group-hover:gap-3 transition-all" style={{ color: item.color }}>
                        {item.linkText}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Join Us?</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Be part of a community that values collaboration, learning, and innovation.
            </p>
          </div>
          
          <div className="highlights-grid grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {highlights.map((item, idx) => {
              const Icon = item.icon
              return (
                <div 
                  key={idx} 
                  className="highlight-card glass-card glow-card shimmer-card text-center p-8 rounded-2xl border border-white/5 cursor-pointer overflow-hidden relative group"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${item.color}20, transparent 60%)` }}
                  ></div>
                  <div 
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg relative z-10"
                    style={{ background: `linear-gradient(135deg, ${item.color}40, ${item.color}20)`, boxShadow: `0 10px 40px ${item.color}30` }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 relative z-10">{item.title}</h3>
                  <p className="text-gray-400 relative z-10">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/10 via-[#a855f7]/10 to-[#00ff88]/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#ec4899]/30 to-transparent rounded-2xl mb-6">
            <Heart className="w-8 h-8 text-[#ec4899]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Join?</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Start your journey with One Last AI today. Connect, learn, and build amazing things together.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/community/discord" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#00ff88] text-black rounded-xl font-semibold hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all transform hover:scale-105"
            >
              <MessageCircle className="w-5 h-5" />
              Join Our Discord
              <ExternalLink className="w-4 h-4" />
            </Link>
            <Link 
              href="/agents" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              Explore AI Agents
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
