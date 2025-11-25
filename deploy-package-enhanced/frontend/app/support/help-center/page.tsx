'use client'

import Link from 'next/link'
import { BookOpen, Users, MessageSquare, Lightbulb, FileText, Video, ShoppingCart, BarChart3, Zap, Phone, Scroll, Map } from 'lucide-react'

export default function SupportHelpCenter() {
  const sections = [
    {
      category: 'Learning & Resources',
      cards: [
        {
          title: 'Documentation',
          description: 'Complete guides and API documentation for developers',
          icon: <BookOpen className="w-8 h-8" />,
          href: '/resources/documentation',
          color: 'from-blue-600 to-blue-400',
          features: ['Getting Started', 'API Reference', 'Integration Guide']
        },
        {
          title: 'Tutorials',
          description: 'Step-by-step tutorials for all agents and features',
          icon: <Video className="w-8 h-8" />,
          href: '/resources/tutorials',
          color: 'from-purple-600 to-purple-400',
          features: ['Agent Walkthroughs', 'Best Practices', 'Video Guides']
        },
        {
          title: 'FAQ & Help',
          description: 'Answers to frequently asked questions',
          icon: <FileText className="w-8 h-8" />,
          href: '/support/faqs',
          color: 'from-green-600 to-green-400',
          features: ['Common Questions', 'Troubleshooting', 'Tips & Tricks']
        },
        {
          title: 'Blog & Case Studies',
          description: 'Insights, case studies, and product updates',
          icon: <Scroll className="w-8 h-8" />,
          href: '/resources/blog',
          color: 'from-orange-600 to-orange-400',
          features: ['Industry News', 'Success Stories', 'Use Cases']
        }
      ]
    },
    {
      category: 'Community & Support',
      cards: [
        {
          title: 'Community',
          description: 'Connect with other users and get community support',
          icon: <Users className="w-8 h-8" />,
          href: '/community',
          color: 'from-pink-600 to-pink-400',
          features: ['Community Forum', 'Events', 'Networking']
        },
        {
          title: 'Product Roadmap',
          description: 'See what we\'re building next and share feedback',
          icon: <Map className="w-8 h-8" />,
          href: '/community/roadmap',
          color: 'from-indigo-600 to-indigo-400',
          features: ['Upcoming Features', 'Status Updates', 'Public Roadmap']
        },
        {
          title: 'Submit Ideas & Suggestions',
          description: 'Share feature requests and improvement ideas',
          icon: <Lightbulb className="w-8 h-8" />,
          href: '/community/suggestions',
          color: 'from-yellow-600 to-yellow-400',
          features: ['Feature Requests', 'Improvements', 'Community Voting']
        },
        {
          title: 'Live Support & Chat',
          description: 'Get real-time assistance from our support team',
          icon: <MessageSquare className="w-8 h-8" />,
          href: '/support/live-support',
          color: 'from-cyan-600 to-cyan-400',
          features: ['Live Chat', 'Real-time Help', 'Expert Support']
        }
      ]
    },
    {
      category: 'Services & Information',
      cards: [
        {
          title: 'Pricing Plans',
          description: 'Explore our pricing options and choose the right plan',
          icon: <ShoppingCart className="w-8 h-8" />,
          href: '/pricing/overview',
          color: 'from-red-600 to-red-400',
          features: ['Per-Agent Pricing', 'Feature Comparison', 'Plans Overview']
        },
        {
          title: 'Book a Consultation',
          description: 'Schedule a one-on-one consultation with an expert',
          icon: <Phone className="w-8 h-8" />,
          href: '/support/book-consultation',
          color: 'from-emerald-600 to-emerald-400',
          features: ['Expert Consultation', 'Personalized Support', 'Training Sessions']
        },
        {
          title: 'Contact Us',
          description: 'Get in touch with our team for any inquiries',
          icon: <Zap className="w-8 h-8" />,
          href: '/support/contact-us',
          color: 'from-violet-600 to-violet-400',
          features: ['Email Support', 'Contact Form', 'Response Guarantee']
        },
        {
          title: 'Create Support Ticket',
          description: 'Submit a ticket for technical issues or problems',
          icon: <BarChart3 className="w-8 h-8" />,
          href: '/support/create-ticket',
          color: 'from-teal-600 to-teal-400',
          features: ['Issue Tracking', 'Priority Support', 'Ticket History']
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-900 to-neural-800 text-white">
      {/* Header */}
      <section className="section-padding bg-gradient-to-r from-brand-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Find everything you need to get the most out of One Last AI. Browse our documentation, tutorials, community resources, and support options.
          </p>
        </div>
      </section>

      {/* Quick Access Buttons */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <Link href="/support/faqs" className="bg-neural-800 hover:bg-neural-700 border border-neural-700 hover:border-brand-600 p-4 rounded-lg text-center transition group">
              <p className="text-2xl mb-2">❓</p>
              <p className="font-semibold group-hover:text-brand-400 transition">FAQs</p>
            </Link>
            <Link href="/resources/documentation" className="bg-neural-800 hover:bg-neural-700 border border-neural-700 hover:border-brand-600 p-4 rounded-lg text-center transition group">
              <p className="text-2xl mb-2">📚</p>
              <p className="font-semibold group-hover:text-brand-400 transition">Docs</p>
            </Link>
            <Link href="/support/live-support" className="bg-neural-800 hover:bg-neural-700 border border-neural-700 hover:border-brand-600 p-4 rounded-lg text-center transition group">
              <p className="text-2xl mb-2">💬</p>
              <p className="font-semibold group-hover:text-brand-400 transition">Live Chat</p>
            </Link>
            <Link href="/support/create-ticket" className="bg-neural-800 hover:bg-neural-700 border border-neural-700 hover:border-brand-600 p-4 rounded-lg text-center transition group">
              <p className="text-2xl mb-2">🎫</p>
              <p className="font-semibold group-hover:text-brand-400 transition">Create Ticket</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Sections */}
      {sections.map((section) => (
        <section key={section.category} className="section-padding border-t border-neural-700">
          <div className="container-custom">
            <h2 className="text-3xl font-bold mb-8 pb-4 border-b border-neural-700">
              {section.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {section.cards.map((card) => (
                <Link key={card.title} href={card.href}>
                  <div className="h-full bg-gradient-to-br from-neural-800 to-neural-700 border border-neural-700 hover:border-brand-600 rounded-lg p-6 transition-all duration-300 group hover:shadow-xl hover:shadow-brand-600/20 cursor-pointer">
                    {/* Icon Background */}
                    <div className={`bg-gradient-to-br ${card.color} rounded-lg p-3 w-fit mb-4 group-hover:scale-110 transition-transform`}>
                      <div className="text-white">{card.icon}</div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold mb-2 group-hover:text-brand-400 transition">
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-neural-300 mb-4">
                      {card.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 mb-4">
                      {card.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-xs text-neural-400">
                          <span className="w-1.5 h-1.5 bg-brand-400 rounded-full"></span>
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-brand-400 group-hover:translate-x-1 transition-transform">
                      Explore
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Still Need Help Section */}
      <section className="section-padding border-t border-neural-700" style={{ backgroundColor: 'rgba(224, 242, 254, 0.05)' }}>
        <div className="container-custom text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-neural-300 mb-8">
            Can't find what you're looking for? Our dedicated support team is ready to help you succeed with One Last AI.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/support/contact-us" className="bg-brand-600 hover:bg-brand-700 px-6 py-3 rounded-lg font-semibold transition text-center">
              Contact Support
            </Link>
            <Link href="/support/live-support" className="bg-accent-600 hover:bg-accent-700 px-6 py-3 rounded-lg font-semibold transition text-center">
              Live Chat
            </Link>
            <Link href="/support/book-consultation" className="bg-neural-700 hover:bg-neural-600 border border-neural-600 px-6 py-3 rounded-lg font-semibold transition text-center">
              Book Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}