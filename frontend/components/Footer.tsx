'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const footerRef = useRef<HTMLElement>(null)
  const brandRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initGSAP = async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      // Animate elements when footer comes into view
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 90%',
          toggleActions: 'play none none reverse'
        }
      });

      tl.fromTo(brandRef.current, 
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
      )
      .fromTo(linksRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo(ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      );
    };

    initGSAP();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setSubscribed(true)
    setEmail('')
    setTimeout(() => setSubscribed(false), 3000)
  }

  // All navigation links in one organized structure
  const footerLinks = [
    { name: 'Agents', href: '/agents' },
    { name: 'AI Studio', href: '/studio' },
    { name: 'AI Lab', href: '/lab' },
    { name: 'Pricing', href: '/pricing/overview' },
    { name: 'Dashboard', href: '/dashboard/overview' },
    { name: 'Documentation', href: '/docs' },
    { name: 'Network Tools', href: '/tools/network-tools' },
    { name: 'Dev Utils', href: '/tools/developer-utils' },
    { name: 'Status', href: '/status' },
    { name: 'Rewards', href: '/rewards' },
  ]

  const bottomLinks = [
    { name: 'Support', href: '/support' },
    { name: 'About', href: '/about' },
    { name: 'Roadmap', href: '/community/roadmap' },
    { name: 'Legal', href: '/legal' },
  ]

  return (
    <footer ref={footerRef} className="relative bg-gradient-to-br from-neural-950 via-neural-900 to-neural-950 border-t border-white/10 w-full overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-brand-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-purple-500/10 via-accent-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500/5 via-brand-500/5 to-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Main Footer */}
      <div className="relative z-10 container-custom py-16 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
          
          {/* Brand & Newsletter */}
          <div ref={brandRef} className="lg:max-w-md">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-500/20 rounded-xl blur-xl group-hover:bg-brand-500/40 transition-all duration-300"></div>
                <Image
                  src="/images/logos/company-logo.png"
                  alt="One Last AI"
                  width={48}
                  height={48}
                  className="relative w-12 h-12 object-contain"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-white to-neural-300 bg-clip-text text-transparent">
                One Last AI
              </span>
            </Link>
            <p className="text-neural-400 text-base mb-8 leading-relaxed">
              Transform your business with intelligent AI agents. 18+ specialized personalities ready to revolutionize how you work.
            </p>
            
            {/* Newsletter - Enhanced styling */}
            <div className="p-1 rounded-2xl bg-gradient-to-r from-brand-500/20 via-indigo-500/20 to-purple-500/20">
              <form onSubmit={handleSubscribe} className="flex gap-2 p-3 rounded-xl bg-neural-900/80 backdrop-blur-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-neural-800/50 border border-white/10 text-white placeholder-neural-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-all duration-300"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-brand-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-brand-600 hover:to-indigo-600 transition-all duration-300 text-sm whitespace-nowrap shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-105"
                >
                  Subscribe
                </button>
              </form>
            </div>
            {subscribed && (
              <p className="text-emerald-400 text-sm mt-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Thanks for subscribing!
              </p>
            )}
          </div>

          {/* Navigation Links - Enhanced with gradient border */}
          <div ref={linksRef} className="relative">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-brand-500/30 via-indigo-500/30 to-purple-500/30 rounded-2xl blur-sm"></div>
            <div className="relative border border-white/10 rounded-2xl p-8 bg-neural-900/60 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-neural-400 uppercase tracking-wider mb-6">Quick Links</h3>
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                {footerLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-neural-300 hover:text-brand-400 text-sm font-medium transition-all duration-300 hover:translate-x-1"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 border-t border-white/5">
        <div className="container-custom py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-neural-500 text-sm">
              © {currentYear} One Last AI. All rights reserved.
            </p>
            <div className="flex items-center gap-8">
              {bottomLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-neural-400 hover:text-brand-400 text-sm transition-all duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner - Enhanced with animation */}
      <div ref={ctaRef} className="relative z-10 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="relative container-custom py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white font-semibold text-lg flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              Ready to build with AI agents?
            </p>
            <div className="flex gap-4">
              <Link
                href="/agents"
                className="px-6 py-2.5 bg-white text-brand-600 rounded-lg font-bold hover:bg-brand-50 transition-all duration-300 text-sm shadow-lg hover:shadow-xl hover:scale-105"
              >
                Start Free →
              </Link>
              <Link
                href="/support/book-consultation"
                className="px-6 py-2.5 bg-white/10 text-white border border-white/30 rounded-lg font-semibold hover:bg-white/20 backdrop-blur-sm transition-all duration-300 text-sm"
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
