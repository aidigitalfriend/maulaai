'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

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
    <footer className="bg-white border-t border-neural-100 w-full">
      {/* Main Footer */}
      <div className="container-custom py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
          
          {/* Brand & Newsletter */}
          <div className="lg:max-w-md">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image
                src="/images/logos/company-logo.png"
                alt="One Last AI"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
              <span className="text-xl font-bold text-neural-800">One Last AI</span>
            </Link>
            <p className="text-neural-600 text-sm mb-6">
              Transform your business with intelligent AI agents. 18+ specialized personalities ready to revolutionize how you work.
            </p>
            
            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-neural-50 border border-neural-200 text-neural-800 placeholder-neural-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors text-sm whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            {subscribed && (
              <p className="text-green-600 text-xs mt-2">✓ Thanks for subscribing!</p>
            )}
          </div>

          {/* Navigation Links - Single Row */}
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-neural-600 hover:text-brand-600 text-sm font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neural-100">
        <div className="container-custom py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-neural-500 text-sm">
              © {currentYear} One Last AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {bottomLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-neural-500 hover:text-neural-700 text-sm transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600">
        <div className="container-custom py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white font-medium">
              🚀 Ready to build with AI agents?
            </p>
            <div className="flex gap-3">
              <Link
                href="/agents"
                className="px-5 py-2 bg-white text-brand-600 rounded-lg font-medium hover:bg-brand-50 transition-colors text-sm"
              >
                Start Free →
              </Link>
              <Link
                href="/support/book-consultation"
                className="px-5 py-2 bg-transparent text-white border border-white/30 rounded-lg font-medium hover:bg-white/10 transition-colors text-sm"
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
