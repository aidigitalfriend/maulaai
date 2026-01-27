'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Heart, MessageCircle, Users, TrendingUp, Award, Zap, BookOpen, Share2, CheckCircle, ArrowRight, Star } from 'lucide-react'

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

export default function ContributingPage() {
  const [likedContributions, setLikedContributions] = useState<Set<string>>(new Set())
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
    gsap.fromTo('.stat-card', { opacity: 0, y: 40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.stats-grid', start: 'top 85%' } })
    gsap.fromTo('.contrib-card', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: '.contrib-grid', start: 'top 85%' } })
    gsap.fromTo('.guideline-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out', scrollTrigger: { trigger: '.guidelines-section', start: 'top 85%' } })
    gsap.fromTo('.recognition-card', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.recognition-grid', start: 'top 85%' } })
    gsap.fromTo('.category-card', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: '.categories-section', start: 'top 85%' } })
    gsap.fromTo('.faq-card', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: '.faq-section', start: 'top 85%' } })
  }, { scope: containerRef })

  const toggleLike = (id: string) => {
    const newLiked = new Set(likedContributions)
    if (newLiked.has(id)) {
      newLiked.delete(id)
    } else {
      newLiked.add(id)
    }
    setLikedContributions(newLiked)
  }

  const contributionTypes = [
    { id: 'ideas', title: '💡 Share Ideas & Feedback', description: 'Have suggestions for new features or improvements? Share your ideas in the Ideas & Suggestions category.', details: ['Propose new agent features', 'Suggest platform improvements', 'Vote on community ideas', 'Discuss feasibility and impact'], impact: 'High', color: '#00d4ff' },
    { id: 'help', title: '🤝 Help Other Community Members', description: 'Answer questions and help fellow users in the Help & Support category.', details: ['Share solutions to common problems', 'Provide tips and workarounds', 'Share your best practices', 'Mentor newer members'], impact: 'High', color: '#00ff88' },
    { id: 'success', title: '🎯 Share Success Stories', description: 'Post about your successful agent implementations and use cases in the Agents & Features category.', details: ['Share project outcomes', 'Discuss integration experiences', 'Showcase innovative applications', 'Inspire other community members'], impact: 'Medium', color: '#a855f7' },
    { id: 'engage', title: '💬 Engage in Discussions', description: 'Participate in General discussions about AI, agents, and technology trends.', details: ['Share industry insights', 'Discuss emerging technologies', 'Network with other members', 'Contribute to knowledge sharing'], impact: 'Medium', color: '#f59e0b' },
    { id: 'create', title: '✍️ Create Content', description: 'Write guides, tutorials, or case studies based on your experience with One Last AI.', details: ['Write how-to guides', 'Document best practices', 'Create case studies', 'Share learning experiences'], impact: 'Very High', color: '#ec4899' },
    { id: 'report', title: '🐛 Report Issues & Bugs', description: 'Help improve the platform by reporting bugs and technical issues you encounter.', details: ['Document bugs clearly', 'Provide reproduction steps', 'Suggest improvements', 'Help with troubleshooting'], impact: 'High', color: '#ef4444' }
  ]

  const stats = [
    { number: "15K+", label: "Active Contributors", color: "#00d4ff" },
    { number: "2.5K+", label: "Discussions", color: "#a855f7" },
    { number: "5.2K+", label: "Posts This Month", color: "#00ff88" },
    { number: "89%", label: "Community Satisfaction", color: "#ec4899" }
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white">
      <style jsx>{creativeStyles}</style>
      
      {/* Header Section */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/50 via-[#0a0a0a] to-[#0a0a0a]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-[#00ff88]/10 via-transparent to-transparent blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 mb-6">
            <Heart className="w-4 h-4 text-[#00ff88]" />
            <span className="text-sm text-[#00ff88] font-medium">Contributing</span>
          </div>
          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent leading-tight">
            Contributing to One Last AI
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Help us build a thriving community of AI enthusiasts and innovators. Every contribution matters.
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="stat-card glass-card float-card shimmer-card text-center p-6 rounded-2xl border border-white/5 cursor-pointer overflow-hidden relative group"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${stat.color}20, transparent 60%)` }}
                ></div>
                <div className="text-3xl font-bold mb-2" style={{ color: stat.color }}>{stat.number}</div>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contribution Types */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#00d4ff]/20 to-transparent rounded-xl mb-3">
              <Star className="w-6 h-6 text-[#00d4ff]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Ways to Contribute</h2>
            <p className="text-gray-400">Choose how you'd like to contribute to One Last AI</p>
          </div>

          <div className="contrib-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            {contributionTypes.map((contribution) => (
              <div
                key={contribution.id}
                className="contrib-card glass-card glow-card shimmer-card rounded-2xl p-6 border border-white/5 hover:border-white/20 transition-all duration-500 group cursor-pointer overflow-hidden relative"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${contribution.color}15, transparent 60%)` }}
                ></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{contribution.title}</h3>
                      <p className="text-gray-400 text-sm">{contribution.description}</p>
                    </div>
                    <button
                      onClick={() => toggleLike(contribution.id)}
                      className="text-gray-500 hover:text-pink-500 transition-colors"
                    >
                      <Heart
                        className="w-5 h-5"
                        fill={likedContributions.has(contribution.id) ? 'currentColor' : 'none'}
                        style={{ color: likedContributions.has(contribution.id) ? '#ec4899' : undefined }}
                      />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    {contribution.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-400 text-sm">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: contribution.color }} />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: `${contribution.color}20`, color: contribution.color }}>
                      <Zap className="w-3 h-3" />
                      Impact: {contribution.impact}
                    </span>
                    <Link
                      href="/community"
                      className="text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
                      style={{ color: contribution.color }}
                    >
                      Go to Community <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guidelines */}
      <section className="guidelines-section py-16 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Community Contribution Guidelines</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div 
              className="guideline-card glass-card rounded-2xl p-8 border border-[#00ff88]/20 cursor-pointer overflow-hidden relative group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-[#00ff88]/10 to-transparent"></div>
              <h3 className="text-xl font-bold text-[#00ff88] mb-4 flex items-center gap-2 relative z-10">
                <span className="w-8 h-8 bg-[#00ff88]/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#00ff88]" />
                </span>
                Do's
              </h3>
              <ul className="space-y-3 text-gray-300 relative z-10">
                <li className="flex gap-2"><span className="text-[#00ff88] font-bold">✓</span><span>Be respectful and constructive in all interactions</span></li>
                <li className="flex gap-2"><span className="text-[#00ff88] font-bold">✓</span><span>Search existing discussions before posting</span></li>
                <li className="flex gap-2"><span className="text-[#00ff88] font-bold">✓</span><span>Provide clear, detailed information</span></li>
                <li className="flex gap-2"><span className="text-[#00ff88] font-bold">✓</span><span>Give credit and link to original sources</span></li>
                <li className="flex gap-2"><span className="text-[#00ff88] font-bold">✓</span><span>Use appropriate category for your post</span></li>
                <li className="flex gap-2"><span className="text-[#00ff88] font-bold">✓</span><span>Engage positively with different viewpoints</span></li>
              </ul>
            </div>

            <div 
              className="guideline-card glass-card rounded-2xl p-8 border border-[#ef4444]/20 cursor-pointer overflow-hidden relative group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-[#ef4444]/10 to-transparent"></div>
              <h3 className="text-xl font-bold text-[#ef4444] mb-4 flex items-center gap-2 relative z-10">
                <span className="w-8 h-8 bg-[#ef4444]/20 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-[#ef4444]" />
                </span>
                Don'ts
              </h3>
              <ul className="space-y-3 text-gray-300 relative z-10">
                <li className="flex gap-2"><span className="text-[#ef4444] font-bold">✗</span><span>Post spam or promotional content</span></li>
                <li className="flex gap-2"><span className="text-[#ef4444] font-bold">✗</span><span>Share personal information or credentials</span></li>
                <li className="flex gap-2"><span className="text-[#ef4444] font-bold">✗</span><span>Engage in harassment or bullying</span></li>
                <li className="flex gap-2"><span className="text-[#ef4444] font-bold">✗</span><span>Cross-post the same content multiple times</span></li>
                <li className="flex gap-2"><span className="text-[#ef4444] font-bold">✗</span><span>Use offensive language or hate speech</span></li>
                <li className="flex gap-2"><span className="text-[#ef4444] font-bold">✗</span><span>Violate intellectual property rights</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contributor Recognition */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Contributor Recognition</h2>
          </div>

          <div className="recognition-grid grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              className="recognition-card glass-card glow-card shimmer-card rounded-2xl p-8 border border-white/5 text-center cursor-pointer overflow-hidden relative group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-[#f59e0b]/15 to-transparent"></div>
              <div className="text-5xl mb-3 relative z-10">🌟</div>
              <h3 className="text-xl font-bold text-white mb-2 relative z-10">Featured Contributor</h3>
              <p className="text-gray-400 text-sm mb-4 relative z-10">Top contributors are featured on our community page and recognized monthly.</p>
              <div className="text-xs text-[#f59e0b] bg-[#f59e0b]/20 rounded-full px-3 py-1 inline-block relative z-10">Awarded after 10+ impactful contributions</div>
            </div>

            <div 
              className="recognition-card glass-card glow-card shimmer-card rounded-2xl p-8 border border-white/5 text-center cursor-pointer overflow-hidden relative group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-[#a855f7]/15 to-transparent"></div>
              <div className="text-5xl mb-3 relative z-10">🎖️</div>
              <h3 className="text-xl font-bold text-white mb-2 relative z-10">Community Badge</h3>
              <p className="text-gray-400 text-sm mb-4 relative z-10">Earn special badges in your profile for contributions to specific areas.</p>
              <div className="text-xs text-[#a855f7] bg-[#a855f7]/20 rounded-full px-3 py-1 inline-block relative z-10">Badges include Helper, Innovator, Mentor</div>
            </div>

            <div 
              className="recognition-card glass-card glow-card shimmer-card rounded-2xl p-8 border border-white/5 text-center cursor-pointer overflow-hidden relative group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-[#00d4ff]/15 to-transparent"></div>
              <div className="text-5xl mb-3 relative z-10">🏆</div>
              <h3 className="text-xl font-bold text-white mb-2 relative z-10">Top Contributors</h3>
              <p className="text-gray-400 text-sm mb-4 relative z-10">Top community members get perks like early access and special features.</p>
              <div className="text-xs text-[#00d4ff] bg-[#00d4ff]/20 rounded-full px-3 py-1 inline-block relative z-10">Exclusive to top 1% of contributors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories */}
      <section className="categories-section py-16 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white">Where to Contribute</h2>
          </div>

          <div className="space-y-4">
            {[
              { href: "/community?category=ideas", emoji: "💡", title: "Ideas & Suggestions", desc: "Share feature ideas and vote on platform improvements", color: "#00d4ff" },
              { href: "/community?category=help", emoji: "❓", title: "Help & Support", desc: "Answer questions and help community members solve problems", color: "#00ff88" },
              { href: "/community?category=agents", emoji: "🤖", title: "Agents & Features", desc: "Share success stories and discuss agent implementations", color: "#a855f7" },
              { href: "/community", emoji: "🌍", title: "General Discussion", desc: "Chat about AI, technology trends, and industry insights", color: "#ec4899" }
            ].map((cat, idx) => (
              <Link
                key={idx}
                href={cat.href}
                className="category-card block glass-card glow-card shimmer-card rounded-2xl p-6 border border-white/5 hover:border-white/20 transition-all duration-500 group cursor-pointer overflow-hidden relative"
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, ${cat.color}10, transparent)` }}
                ></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `linear-gradient(135deg, ${cat.color}30, ${cat.color}10)` }}>{cat.emoji}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{cat.title}</h3>
                      <p className="text-gray-400">{cat.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: cat.color }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started CTA */}
      <section className="py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/10 via-[#a855f7]/10 to-[#00ff88]/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00d4ff]/30 to-transparent rounded-2xl mb-6">
            <Users className="w-8 h-8 text-[#00d4ff]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8 text-lg max-w-xl mx-auto">
            Join our community and start making an impact today. Your contributions help everyone in the One Last AI ecosystem.
          </p>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#00ff88] text-black font-bold rounded-xl transition-all transform hover:scale-105 shadow-xl hover:shadow-[#00d4ff]/25"
          >
            <Users className="w-5 h-5" />
            Visit Community Page
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section py-16 px-6 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "Q: Do I need special skills to contribute?", a: "No! Everyone can contribute. Whether you're a beginner or expert, there are ways to help. Share your experiences, ask questions, or help others learn." },
              { q: "Q: How often should I post?", a: "Contribute at your own pace. Quality matters more than quantity. Post meaningful contributions whenever you have something valuable to share." },
              { q: "Q: Can I get rewarded for contributions?", a: "Yes! Active contributors earn badges, get featured on our page, and may qualify for perks like early access to new features or premium benefits." },
              { q: "Q: What if I disagree with someone?", a: "Respectful disagreement is encouraged! We value diverse perspectives. Engage constructively, focus on ideas rather than people, and maintain professionalism." },
              { q: "Q: How do I report inappropriate content?", a: "Use the report feature on any post or contact our moderation team through the Support page. We take community safety seriously and respond to reports quickly." }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="faq-card glass-card rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
              >
                <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
