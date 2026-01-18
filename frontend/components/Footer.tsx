'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setSubscribed(true)
    setEmail('')
    setTimeout(() => setSubscribed(false), 3000)
  }

  const footerSections = [
    {
      title: 'Platform',
      icon: '🚀',
      links: [
        { name: 'All Agents', href: '/agents' },
        { name: 'Rewards Center', href: '/rewards', highlight: true, badge: 'NEW' },
        { name: 'Pricing', href: '/pricing/overview' },
        { name: 'Dashboard', href: '/dashboard/overview' }
      ]
    },
    {
      title: 'Resources',
      icon: '📚',
      links: [
        { name: 'Documentation', href: '/resources/documentation' },
        { name: 'Tutorials', href: '/resources/tutorials' },
        { name: 'Blog', href: '/resources/blog' },
        { name: 'Careers', href: '/resources/careers', highlight: true, badge: 'HIRING' }
      ]
    },
    {
      title: 'Tools',
      icon: '🛠️',
      links: [
        { name: 'AI Lab', href: '/lab', highlight: true, badge: 'HOT' },
        { name: 'AI Studio', href: '/studio' },
        { name: 'Network Tools', href: '/tools/network-tools' },
        { name: 'Developer Utils', href: '/tools/developer-utils' }
      ]
    },
    {
      title: 'Docs',
      icon: '📖',
      links: [
        { name: 'Overview', href: '/docs' },
        { name: 'Agent Docs', href: '/docs/agents' },
        { name: 'API Reference', href: '/docs/api' },
        { name: 'SDKs', href: '/docs/sdks' }
      ]
    }
  ]

  const stats = [
    { label: 'Active Users', value: '10K+', icon: '👥' },
    { label: 'AI Agents', value: '18+', icon: '🤖' },
    { label: 'Uptime', value: '99.9%', icon: '⚡' },
    { label: 'Countries', value: '50+', icon: '🌍' }
  ]

  return (
    <footer className="relative bg-gradient-to-b from-neural-900 via-[#0a0a1a] to-black text-white w-full overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Stats Section */}
      <div className="relative border-b border-white/5">
        <div className="container-custom py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={stat.label}
                className="group relative text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-brand-500/50 transition-all duration-500 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <span className="text-3xl mb-2 block">{stat.icon}</span>
                <div className="text-3xl font-black bg-gradient-to-r from-white via-brand-200 to-white bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs text-neural-400 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section - Premium Design */}
      <div className="relative border-b border-white/5">
        <div className="container-custom py-16 px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-4xl mx-auto">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/20 via-purple-500/20 to-accent-500/20 rounded-3xl blur-2xl opacity-50" />
            
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-sm mb-4">
                    <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
                    Stay Updated
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-white via-brand-200 to-white bg-clip-text text-transparent">
                    Join the AI Revolution
                  </h3>
                  <p className="text-neural-300 text-lg">
                    Get exclusive updates, early access to features, and AI insights delivered to your inbox.
                  </p>
                </div>
                <div>
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-6 py-4 rounded-2xl bg-black/50 text-white placeholder-neural-500 focus:outline-none focus:ring-2 focus:ring-brand-500 border border-white/10 transition-all"
                        required
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95"
                        >
                          Subscribe →
                        </button>
                      </div>
                    </div>
                    {subscribed && (
                      <p className="text-green-400 text-sm flex items-center gap-2">
                        <span className="text-lg">✨</span> Welcome aboard! Check your inbox.
                      </p>
                    )}
                  </form>
                  <p className="text-neural-500 text-xs mt-3">
                    🔒 No spam. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative container-custom py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
          {/* Brand Section - Enhanced */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-500/50 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image
                  src="/images/logos/company-logo.png"
                  alt="One Last AI"
                  width={48}
                  height={48}
                  className="relative w-12 h-12 object-contain"
                />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-white to-neural-300 bg-clip-text text-transparent">
                One Last AI
              </span>
            </Link>
            <p className="text-neural-400 mb-8 leading-relaxed max-w-sm">
              Transform your business with intelligent AI agents. 18+ specialized personalities 
              ready to revolutionize how you work.
            </p>
            
            {/* Social Links - Modern Design */}
            <div className="flex gap-3">
              {[
                { name: 'X', href: '#', icon: '𝕏' },
                { name: 'Discord', href: '/community/discord', icon: '🎮' },
                { name: 'GitHub', href: '/community/contributing', icon: '⚡' },
                { name: 'LinkedIn', href: '#', icon: '💼' }
              ].map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="group relative w-11 h-11 flex items-center justify-center"
                  title={social.name}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-white/10 rounded-xl border border-white/10 group-hover:border-transparent transition-all" />
                  <span className="relative text-lg group-hover:scale-110 transition-transform">{social.icon}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Links - Interactive Cards */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-6">
            {footerSections.map((section) => (
              <div 
                key={section.title}
                className="group"
                onMouseEnter={() => setHoveredSection(section.title)}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div className={`
                  relative p-4 rounded-2xl transition-all duration-300
                  ${hoveredSection === section.title ? 'bg-white/5 scale-105' : 'bg-transparent'}
                `}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">{section.icon}</span>
                    <h3 className="font-bold text-white">{section.title}</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className={`
                            group/link flex items-center gap-2 text-sm transition-all
                            ${link.highlight 
                              ? 'text-brand-400 hover:text-brand-300' 
                              : 'text-neural-400 hover:text-white'
                            }
                          `}
                        >
                          <span className="opacity-0 -ml-3 group-hover/link:opacity-100 group-hover/link:ml-0 transition-all">→</span>
                          {link.name}
                          {link.badge && (
                            <span className={`
                              px-1.5 py-0.5 text-[10px] font-bold rounded-md
                              ${link.badge === 'NEW' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
                              ${link.badge === 'HOT' ? 'bg-gradient-to-r from-orange-500 to-red-500' : ''}
                              ${link.badge === 'HIRING' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : ''}
                            `}>
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* App Download Section - Futuristic */}
      <div className="relative border-t border-white/5">
        <div className="container-custom py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-2xl">
                📱
              </div>
              <div>
                <h4 className="font-bold text-white">Mobile App Coming Soon</h4>
                <p className="text-sm text-neural-400">Take AI agents anywhere you go</p>
              </div>
            </div>
            <div className="flex gap-3">
              {/* App Store */}
              <button className="group relative flex items-center gap-3 px-5 py-3 bg-black/50 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28C16.03 21.23 14.96 21.08 13.95 20.63C12.88 20.17 11.91 20.15 10.79 20.63C9.36 21.25 8.6 21.07 7.7 20.28C2.42 14.97 3.11 6.95 9.09 6.66C10.5 6.73 11.5 7.46 12.36 7.52C13.71 7.24 15.01 6.49 16.47 6.58C18.22 6.7 19.54 7.38 20.42 8.61C17.13 10.51 17.93 15.19 20.98 16.42C20.38 18.02 19.58 19.6 17.04 20.29L17.05 20.28ZM12.26 6.62C12.1 4.02 14.18 1.88 16.6 1.66C16.94 4.62 13.93 6.86 12.26 6.62Z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[10px] text-neural-400">Download on</div>
                  <div className="text-sm font-semibold text-white">App Store</div>
                </div>
                <span className="px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-300 rounded-full">Soon</span>
              </button>
              {/* Play Store */}
              <button className="group relative flex items-center gap-3 px-5 py-3 bg-black/50 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M3.609 1.814L13.792 12L3.609 22.186C3.218 21.861 3 21.359 3 20.814V3.186C3 2.641 3.218 2.139 3.609 1.814Z"/>
                  <path fill="#FBBC05" d="M13.792 12L3.609 1.814C3.927 1.561 4.328 1.406 4.765 1.406L17.172 8.297L13.792 12Z"/>
                  <path fill="#EA4335" d="M13.792 12L17.172 15.703L4.765 22.594C4.328 22.594 3.927 22.439 3.609 22.186L13.792 12Z"/>
                  <path fill="#34A853" d="M13.792 12L17.172 8.297L19.875 9.844C20.578 10.234 21 10.969 21 11.766C21 12.563 20.578 13.297 19.875 13.688L17.172 15.703L13.792 12Z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[10px] text-neural-400">Get it on</div>
                  <div className="text-sm font-semibold text-white">Play Store</div>
                </div>
                <span className="px-2 py-0.5 text-[10px] bg-green-500/20 text-green-300 rounded-full">Soon</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Sleek */}
      <div className="relative border-t border-white/5 bg-black/30">
        <div className="container-custom py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-neural-500 text-sm">
              <span>©</span>
              <span>{currentYear}</span>
              <span className="w-1 h-1 bg-neural-600 rounded-full" />
              <span>One Last AI</span>
              <span className="w-1 h-1 bg-neural-600 rounded-full" />
              <span>All rights reserved</span>
            </div>
            <div className="flex items-center gap-1">
              {[
                { name: 'Support', href: '/support' },
                { name: 'About', href: '/about' },
                { name: 'Roadmap', href: '/community/roadmap' },
                { name: 'Legal', href: '/legal' }
              ].map((link, index) => (
                <span key={link.name} className="flex items-center">
                  <Link 
                    href={link.href} 
                    className="px-3 py-1.5 text-sm text-neural-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    {link.name}
                  </Link>
                  {index < 3 && <span className="w-1 h-1 bg-neural-700 rounded-full" />}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner - Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-purple-600 to-accent-600" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="relative container-custom py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <span className="text-2xl animate-bounce">🚀</span>
              <span className="font-bold text-lg">Ready to build with AI?</span>
            </div>
            <div className="flex gap-3">
              <Link
                href="/agents"
                className="group px-6 py-2.5 bg-white text-brand-600 rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center gap-2"
              >
                Start Free
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/support/book-consultation"
                className="px-6 py-2.5 bg-white/10 text-white rounded-xl font-medium border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                Book Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
