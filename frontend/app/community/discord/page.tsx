'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { MessageCircle, Users, Zap, Shield, Gamepad2, Code, Sparkles, ArrowRight, ExternalLink } from 'lucide-react'

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
    background: linear-gradient(45deg, #5865F2, #00d4ff, #a855f7, #5865F2);
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
    box-shadow: 0 25px 50px -12px rgba(88, 101, 242, 0.35);
  }
  .discord-pulse {
    animation: discord-pulse 2s ease-in-out infinite;
  }
  @keyframes discord-pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(88, 101, 242, 0.4); }
    50% { transform: scale(1.05); box-shadow: 0 0 40px 10px rgba(88, 101, 242, 0.2); }
  }
`

export default function DiscordPage() {
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
    gsap.fromTo('.discord-cta', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.8, delay: 0.6, ease: 'back.out(1.7)' })
    gsap.fromTo('.stat-card', { opacity: 0, y: 40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.stats-grid', start: 'top 85%' } })
    gsap.fromTo('.feature-card', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: '.features-grid', start: 'top 85%' } })
    gsap.fromTo('.channel-card', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out', scrollTrigger: { trigger: '.channels-list', start: 'top 85%' } })
  }, { scope: containerRef })

  const stats = [
    { value: '10K+', label: 'Members', color: '#5865F2' },
    { value: '24/7', label: 'Active Chat', color: '#00d4ff' },
    { value: '50+', label: 'Channels', color: '#a855f7' },
    { value: '100+', label: 'Daily Messages', color: '#00ff88' }
  ]

  const features = [
    { icon: MessageCircle, title: 'Real-time Support', desc: 'Get instant help from our team and community members around the clock.', color: '#5865F2' },
    { icon: Users, title: 'Connect with Peers', desc: 'Network with developers, creators, and AI enthusiasts from around the world.', color: '#00d4ff' },
    { icon: Zap, title: 'Exclusive Updates', desc: 'Be the first to know about new features, beta access, and announcements.', color: '#f59e0b' },
    { icon: Shield, title: 'Safe Community', desc: 'Moderated environment focused on learning, sharing, and growing together.', color: '#00ff88' },
    { icon: Gamepad2, title: 'Fun Events', desc: 'Participate in hackathons, game nights, and community challenges.', color: '#ec4899' },
    { icon: Code, title: 'Code Reviews', desc: 'Share your projects and get constructive feedback from experienced developers.', color: '#a855f7' }
  ]

  const channels = [
    { name: '#general', desc: 'General chat and community discussions', emoji: '💬' },
    { name: '#introductions', desc: 'Introduce yourself to the community', emoji: '👋' },
    { name: '#help-support', desc: 'Get help with One Last AI products', emoji: '🆘' },
    { name: '#showcase', desc: 'Share your projects and creations', emoji: '🎨' },
    { name: '#ai-discussion', desc: 'Discuss AI trends and technologies', emoji: '🤖' },
    { name: '#feature-requests', desc: 'Suggest new features and improvements', emoji: '💡' },
    { name: '#dev-talk', desc: 'Technical discussions for developers', emoji: '👨‍💻' },
    { name: '#off-topic', desc: 'Casual conversations and fun stuff', emoji: '🎮' }
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white">
      <style jsx>{creativeStyles}</style>
      
      <section className="pt-24 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#5865F2]/10 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-[#5865F2]/20 via-transparent to-transparent blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/30 mb-6">
            <MessageCircle className="w-4 h-4 text-[#5865F2]" />
            <span className="text-sm text-[#5865F2] font-medium">Join Our Community</span>
          </div>
          
          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent leading-tight">
            Join Our Discord
          </h1>
          
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Connect with thousands of AI enthusiasts, get real-time support, and be part of an amazing community shaping the future of AI.
          </p>

          <div className="discord-cta">
            <a 
              href="https://discord.gg/onelastai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="discord-pulse inline-flex items-center gap-3 px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-[#5865F2]/30 group"
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Join Discord Server
              <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <div 
                key={idx}
                className="stat-card glass-card float-card rounded-2xl border border-white/5 p-6 text-center cursor-pointer"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <p className="text-4xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Join Our Discord?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Experience the benefits of being part of an active, supportive community</p>
          </div>

          <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div 
                  key={idx}
                  className="feature-card glass-card glow-card shimmer-card rounded-2xl border border-white/5 p-6 cursor-pointer overflow-hidden relative group"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${feature.color}20, transparent 60%)` }}></div>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg relative z-10" style={{ background: `linear-gradient(135deg, ${feature.color}40, ${feature.color}20)`, boxShadow: `0 10px 40px ${feature.color}30` }}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 relative z-10">{feature.title}</h3>
                  <p className="text-gray-400 text-sm relative z-10">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Popular Channels</h2>
            <p className="text-gray-400">Explore some of our most active community spaces</p>
          </div>

          <div className="channels-list glass-card rounded-2xl border border-white/5 overflow-hidden">
            {channels.map((channel, idx) => (
              <div 
                key={idx}
                className="channel-card flex items-center gap-4 p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 cursor-pointer group"
              >
                <div className="w-10 h-10 bg-[#5865F2]/20 rounded-lg flex items-center justify-center text-xl">
                  {channel.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white group-hover:text-[#5865F2] transition-colors">{channel.name}</p>
                  <p className="text-sm text-gray-500">{channel.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-[#5865F2] group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card glow-card rounded-3xl border border-[#5865F2]/30 p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#5865F2]/10 via-transparent to-[#a855f7]/10"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 bg-[#5865F2]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-[#5865F2]" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Join the Community?</h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-8">
                Don&apos;t miss out on the conversations, events, and connections. Join thousands of members today!
              </p>
              
              <a 
                href="https://discord.gg/onelastai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-[#5865F2]/25 group"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Join Discord Now
                <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
