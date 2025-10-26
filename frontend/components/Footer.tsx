'use client'

import Link from 'next/link'
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

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'All Agents', href: '/agents' },
        { name: 'Solutions', href: '/solutions/overview' },
        { name: 'Industries', href: '/industries/overview' },
        { name: 'Pricing', href: '/pricing/overview' },
        { name: 'Per-Agent Pricing', href: '/pricing/per-agent' },
        { name: 'Dashboard', href: '/dashboard/overview' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/resources/documentation' },
        { name: 'Tutorials', href: '/resources/tutorials' },
        { name: 'Case Studies', href: '/resources/case-studies' },
        { name: 'Blog', href: '/resources/blog' },
        { name: 'News', href: '/resources/news' },
        { name: 'Webinars', href: '/resources/webinars' },
        { name: 'Careers', href: '/resources/careers' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/support/help-center' },
        { name: 'Contact Us', href: '/support/contact-us' },
        { name: 'Book Consultation', href: '/support/book-consultation' },
        { name: 'Live Support', href: '/support/live-support' },
        { name: 'FAQs', href: '/support/faqs' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about/overview' },
        { name: 'Meet the Team', href: '/about/team' },
        { name: 'Partnerships', href: '/about/partnerships' },
        { name: 'Community', href: '/community/overview' },
        { name: 'Open Roadmap', href: '/community/roadmap' }
      ]
    },
    {
      title: 'Tools',
      links: [
        { name: 'AI Studio', href: '/studio' },
        { name: 'IP Address Lookup', href: '/tools/ip-info' },
        { name: 'Network Tools', href: '#' },
        { name: 'Developer Utils', href: '#' },
        { name: 'API Tester', href: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/legal/privacy-policy' },
        { name: 'Terms of Service', href: '/legal/terms-of-service' },
        { name: 'Cookie Policy', href: '/legal/cookie-policy' },
        { name: 'Payments & Refunds', href: '/legal/payments-refunds' },
        { name: 'Reports', href: '/legal/reports' }
      ]
    }
  ]

  const socialLinks = [
    { name: 'Discord', href: '/community/discord', icon: '💬' },
    { name: 'GitHub', href: '/community/contributing', icon: '🔧' },
    { name: 'Twitter', href: '#', icon: '🐦' },
    { name: 'LinkedIn', href: '#', icon: '💼' }
  ]

  return (
    <footer className="bg-neural-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-neural-700">
        <div className="container-custom py-12 px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">Subscribe to our newsletter</h3>
              <p className="text-neural-300">Get the latest updates on AI agents, features, and industry insights.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded bg-neural-800 text-white placeholder-neural-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-brand-500 text-white rounded font-semibold hover:bg-brand-600 transition"
              >
                Subscribe
              </button>
            </form>
            {subscribed && <p className="text-green-400 text-sm">Thank you for subscribing!</p>}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-custom py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-brand-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <span className="text-2xl font-bold">AgentHub</span>
            </Link>
            <p className="text-neural-300 mb-6 max-w-md">
              Transform your business with intelligent AI agents. 18+ specialized personalities 
              ready to revolutionize how you work, communicate, and solve problems.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-neural-800 rounded-lg flex items-center justify-center hover:bg-brand-600 transition-colors"
                  title={social.name}
                >
                  <span className="text-lg">{social.icon}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-neural-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neural-800">
        <div className="container-custom py-6 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-neural-400 text-sm">
              © {currentYear} AgentHub. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/legal/privacy-policy" className="text-neural-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/legal/terms-of-service" className="text-neural-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/legal/cookie-policy" className="text-neural-400 hover:text-white transition-colors">
                Cookies
              </Link>
              <Link href="/support/contact-us" className="text-neural-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Bar */}
      <div className="bg-gradient-to-r from-brand-600 to-accent-600">
        <div className="container-custom py-4 px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-white font-medium">
              🚀 Ready to get started with AI agents?
            </div>
            <div className="flex gap-3">
              <Link
                href="/agents"
                className="bg-white text-brand-600 px-6 py-2 rounded-lg font-medium hover:bg-brand-50 transition-colors"
              >
                Try Now
              </Link>
              <Link
                href="/support/book-consultation"
                className="border-2 border-white text-white px-6 py-2 rounded-lg font-medium hover:bg-white hover:text-brand-600 transition-colors"
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