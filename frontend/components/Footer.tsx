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

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'All Agents', href: '/agents' },
        { name: 'Rewards Center', href: '/rewards', highlight: true },
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
      title: 'Docs',
      links: [
        { name: 'Overview', href: '/docs' },
        { name: 'Agent Docs', href: '/docs/agents' },
        { name: 'API Reference', href: '/docs/api' },
        { name: 'Integrations', href: '/docs/integrations' },
        { name: 'SDKs', href: '/docs/sdks' }
      ]
    },
    {
      title: 'Industries',
      links: [
        { name: 'Overview', href: '/industries/overview' },
        { name: 'Healthcare', href: '/industries/healthcare' },
        { name: 'Finance & Banking', href: '/industries/finance-banking' },
        { name: 'Retail & E-commerce', href: '/industries/retail-ecommerce' },
        { name: 'Manufacturing', href: '/industries/manufacturing' },
        { name: 'Technology', href: '/industries/technology' },
        { name: 'Education', href: '/industries/education' }
      ]
    },
    {
      title: 'Solutions',
      links: [
        { name: 'Overview', href: '/solutions/overview' },
        { name: 'Enterprise AI', href: '/solutions/enterprise-ai' },
        { name: 'Process Automation', href: '/solutions/process-automation' },
        { name: 'Smart Analytics', href: '/solutions/smart-analytics' },
        { name: 'AI Security', href: '/solutions/ai-security' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/support/help-center' },
        { name: 'Contact Us', href: '/support/contact-us' },
        { name: 'Book Consultation', href: '/support/book-consultation' },
        { name: 'Live Support', href: '/support/live-support' },
        { name: 'Status Page', href: '/status' },
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
        { name: 'AI Lab', href: '/lab', highlight: true },
        { name: 'AI Studio', href: '/studio' },
        { name: 'IP Address Lookup', href: '/tools/ip-info' },
        { name: 'Network Tools', href: '/tools/network-tools' },
        { name: 'Developer Utils', href: '/tools/developer-utils' },
        { name: 'API Tester', href: '/tools/api-tester' }
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
    <footer className="bg-neural-900 text-white w-full overflow-x-hidden">
      {/* Newsletter Section */}
      <div className="border-b border-neural-700 w-full">
        <div className="container-custom py-12 px-4 sm:px-6 lg:px-8 w-full max-w-full">
          <div className="grid md:grid-cols-2 gap-8 items-center w-full max-w-full">
            <div>
              <h3 className="text-2xl font-bold mb-2">Subscribe to our newsletter</h3>
              <p className="text-neural-300">Get the latest updates on AI agents, features, and industry insights.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded bg-neural-800 text-white placeholder-neural-400 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-brand-500 text-white rounded font-semibold hover:bg-brand-600 transition whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            {subscribed && <p className="text-green-400 text-sm">Thank you for subscribing!</p>}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container-custom py-16 px-4 sm:px-6 lg:px-8 w-full max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-8 w-full max-w-full justify-items-center md:justify-items-start">
          {/* Brand Section */}
          <div className="lg:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex items-center gap-3 mb-6 justify-center md:justify-start">
              <Image
                src="/images/logos/company-logo.png"
                alt="One Last AI"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold">One Last AI</span>
            </Link>
            <p className="text-neural-300 mb-6 max-w-md">
              Transform your business with intelligent AI agents. 18+ specialized personalities 
              ready to revolutionize how you work, communicate, and solve problems.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
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
            <div key={section.title} className="text-center md:text-left">
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={`transition-colors inline-block ${
                        link.highlight 
                          ? 'text-yellow-400 hover:text-yellow-300 font-semibold flex items-center gap-2' 
                          : 'text-neural-300 hover:text-white'
                      }`}
                    >
                      {link.highlight && <span className="text-lg">🎁</span>}
                      {link.name}
                      {link.highlight && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-pulse">
                          NEW
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile App Download Section */}
      <div className="border-t border-neural-800 w-full bg-gradient-to-r from-neural-900 via-neural-800 to-neural-900">
        <div className="container-custom py-12 px-4 sm:px-6 lg:px-8 w-full max-w-full">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Download Our Mobile App</h3>
            <p className="text-neural-300">Experience One Last AI on the go - Available soon on iOS and Android</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* App Store Badge */}
            <div className="relative group cursor-pointer">
              <div className="bg-neural-800 rounded-xl p-6 hover:bg-neural-700 transition-all duration-300 border border-neural-700 hover:border-brand-500 h-full flex flex-col items-center justify-center">
                <div className="mb-4">
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.05 20.28C16.03 21.23 14.96 21.08 13.95 20.63C12.88 20.17 11.91 20.15 10.79 20.63C9.36 21.25 8.6 21.07 7.7 20.28C2.42 14.97 3.11 6.95 9.09 6.66C10.5 6.73 11.5 7.46 12.36 7.52C13.71 7.24 15.01 6.49 16.47 6.58C18.22 6.7 19.54 7.38 20.42 8.61C17.13 10.51 17.93 15.19 20.98 16.42C20.38 18.02 19.58 19.6 17.04 20.29L17.05 20.28ZM12.26 6.62C12.1 4.02 14.18 1.88 16.6 1.66C16.94 4.62 13.93 6.86 12.26 6.62Z" fill="currentColor" className="text-white"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neural-400 mb-1">Download on the</p>
                  <h4 className="text-xl font-bold text-white mb-2">App Store</h4>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-pulse">
                    Launching Soon
                  </span>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-500/0 via-brand-500/5 to-brand-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Play Store Badge */}
            <div className="relative group cursor-pointer">
              <div className="bg-neural-800 rounded-xl p-6 hover:bg-neural-700 transition-all duration-300 border border-neural-700 hover:border-accent-500 h-full flex flex-col items-center justify-center">
                <div className="mb-4">
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.609 1.814L13.792 12L3.609 22.186C3.218 21.861 3 21.359 3 20.814V3.186C3 2.641 3.218 2.139 3.609 1.814Z" fill="url(#paint0_linear)" className="text-blue-500"/>
                    <path d="M13.792 12L3.609 1.814C3.927 1.561 4.328 1.406 4.765 1.406C5.068 1.406 5.359 1.478 5.625 1.609L17.172 8.297L13.792 12Z" fill="url(#paint1_linear)" className="text-yellow-500"/>
                    <path d="M13.792 12L17.172 15.703L5.625 22.391C5.359 22.522 5.068 22.594 4.765 22.594C4.328 22.594 3.927 22.439 3.609 22.186L13.792 12Z" fill="url(#paint2_linear)" className="text-red-500"/>
                    <path d="M13.792 12L17.172 8.297L19.875 9.844C20.578 10.234 21 10.969 21 11.766C21 12.563 20.578 13.297 19.875 13.688L17.172 15.703L13.792 12Z" fill="url(#paint3_linear)" className="text-green-500"/>
                    <defs>
                      <linearGradient id="paint0_linear" x1="8.5" y1="1.814" x2="8.5" y2="22.186" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00D4FF"/>
                        <stop offset="1" stopColor="#0099FF"/>
                      </linearGradient>
                      <linearGradient id="paint1_linear" x1="10.5" y1="1.406" x2="10.5" y2="12" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFD500"/>
                        <stop offset="1" stopColor="#FFA500"/>
                      </linearGradient>
                      <linearGradient id="paint2_linear" x1="10.5" y1="12" x2="10.5" y2="22.594" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF3A44"/>
                        <stop offset="1" stopColor="#C31162"/>
                      </linearGradient>
                      <linearGradient id="paint3_linear" x1="17.5" y1="8.297" x2="17.5" y2="15.703" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00E676"/>
                        <stop offset="1" stopColor="#00C853"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neural-400 mb-1">Get it on</p>
                  <h4 className="text-xl font-bold text-white mb-2">Play Store</h4>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-600 to-blue-600 text-white animate-pulse">
                    Launching Soon
                  </span>
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-500/0 via-accent-500/5 to-accent-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neural-800 w-full">
        <div className="container-custom py-6 px-4 sm:px-6 lg:px-8 w-full max-w-full">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full max-w-full">
            <div className="text-neural-400 text-sm">
              © {currentYear} One Last AI. All rights reserved.
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
      <div className="bg-gradient-to-r from-brand-600 to-accent-600 w-full">
        <div className="container-custom py-4 px-4 sm:px-6 lg:px-8 w-full max-w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-full">
            <div className="text-white font-medium">
              🚀 Ready to get started with AI agents?
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/agents"
                className="bg-white text-brand-600 px-6 py-2 rounded-lg font-medium hover:bg-brand-50 transition-colors text-center"
              >
                Try Now
              </Link>
              <Link
                href="/support/book-consultation"
                className="border-2 border-white text-white px-6 py-2 rounded-lg font-medium hover:bg-white hover:text-brand-600 transition-colors text-center"
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