'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { state, logout } = useAuth()
  
  const handleLogout = async () => {
    try {
      await logout()
      setIsMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const navigation = [
    {
      name: 'Agents',
      href: '/agents',
      hasDropdown: true,
      items: [
        { name: 'All Agents', href: '/agents' },
        { name: 'Random Agent', href: '/agents/random' },
        { name: 'Einstein', href: '/agents/einstein' },
        { name: 'Chef Biew', href: '/agents/chef-biew' },
        { name: 'Tech Wizard', href: '/agents/tech-wizard' },
        { name: 'Travel Buddy', href: '/agents/travel-buddy' }
      ]
    },
    {
      name: 'Solutions',
      href: '/solutions',
      hasDropdown: true,
      items: [
        { name: 'Overview', href: '/solutions/overview' },
        { name: 'Enterprise AI', href: '/solutions/enterprise-ai' },
        { name: 'Process Automation', href: '/solutions/process-automation' },
        { name: 'Smart Analytics', href: '/solutions/smart-analytics' },
        { name: 'AI Security', href: '/solutions/ai-security' }
      ]
    },
    {
      name: 'Industries',
      href: '/industries',
      hasDropdown: true,
      items: [
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
      name: 'Resources',
      href: '/resources',
      hasDropdown: true,
      items: [
        { name: 'Overview', href: '/resources/overview' },
        { name: 'Blog & News', href: '/resources/blog' },
        { name: 'Case Studies', href: '/resources/case-studies' },
        { name: 'Whitepapers', href: '/resources/whitepapers' },
        { name: 'Webinars', href: '/resources/webinars' },
        { name: 'Tutorials', href: '/resources/tutorials' }
      ]
    },
    {
      name: 'Docs',
      href: '/docs',
      hasDropdown: true,
      items: [
        { name: 'Overview', href: '/docs' },
        { name: 'Agent Docs', href: '/docs/agents' },
        { name: 'API Reference', href: '/docs/api' },
        { name: 'Integrations', href: '/docs/integrations' },
        { name: 'SDKs', href: '/docs/sdks' }
      ]
    },
    {
      name: 'Pricing',
      href: '/pricing',
      hasDropdown: true,
      items: [
        { name: 'Overview', href: '/pricing/overview' },
        { name: 'Per-Agent Pricing', href: '/pricing/per-agent' }
      ]
    },
    {
      name: 'Support',
      href: '/support',
      hasDropdown: true,
      items: [
        { name: 'Live Support', href: '/support/live-support' },
        { name: 'Help Center', href: '/support/help-center' },
        { name: 'Contact Us', href: '/support/contact-us' },
        { name: 'Book Consultation', href: '/support/book-consultation' },
        { name: 'FAQs', href: '/support/faqs' }
      ]
    }
  ]

  return (
    <header className="bg-white shadow-sm border-b border-neural-100 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-brand-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold text-neural-800">AgentHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="px-4 py-2 text-neural-600 hover:text-brand-600 font-medium transition-colors rounded-lg hover:bg-brand-50"
                >
                  {item.name}
                  {item.hasDropdown && (
                    <svg className="w-4 h-4 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {/* Dropdown Menu */}
                {item.hasDropdown && activeDropdown === item.name && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-neural-100 py-2 z-50">
                    {item.items?.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="block px-4 py-2 text-neural-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {state.isLoading ? (
              // Loading state
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-neural-500">Loading...</span>
              </div>
            ) : state.isAuthenticated ? (
              // Authenticated user navigation
              <>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700 font-medium">
                    {state.user?.name || state.user?.email}
                  </span>
                </div>
                <Link href="/dashboard" className="btn-secondary">
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-neural-600 hover:text-red-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              // Unauthenticated user navigation
              <>
                <Link href="/auth/signup" className="btn-secondary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-neural-600 hover:text-brand-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-neural-100">
            <div className="space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className="block px-4 py-2 text-neural-600 hover:text-brand-600 font-medium transition-colors rounded-lg hover:bg-brand-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.hasDropdown && (
                    <div className="ml-4 space-y-1">
                      {item.items?.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="block px-4 py-1 text-sm text-neural-500 hover:text-brand-600 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 space-y-2">
                {state.isLoading ? (
                  // Loading state for mobile
                  <div className="flex items-center justify-center gap-2 py-4">
                    <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-neural-500">Loading...</span>
                  </div>
                ) : state.isAuthenticated ? (
                  // Authenticated mobile navigation
                  <>
                    <div className="px-4 py-2 mb-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-700 font-medium">
                          {state.user?.name || state.user?.email}
                        </span>
                      </div>
                    </div>
                    <Link href="/dashboard" className="block btn-secondary text-center" onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-center px-4 py-2 text-neural-600 hover:text-red-600 font-medium transition-colors rounded-lg hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  // Unauthenticated mobile navigation
                  <>
                    <Link href="/auth/login" className="block text-center px-4 py-2 text-neural-600 hover:text-brand-600 font-medium transition-colors" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                    <Link href="/auth/signup" className="block btn-secondary text-center" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Link>
                    <Link href="/agents" className="block btn-primary text-center" onClick={() => setIsMenuOpen(false)}>
                      Try Agents
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}