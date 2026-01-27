'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Cloud, Zap, Globe, Link2, Award, Users } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const creativeStyles = `
  .glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .glow-card {
    position: relative;
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .glow-card::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    padding: 2px;
    background: linear-gradient(135deg, #00d4ff, #a855f7, #00ff88);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  .glow-card:hover::before { opacity: 1; }
  .shimmer-card {
    position: relative;
    overflow: hidden;
  }
  .shimmer-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
    transition: left 0.6s ease;
  }
  .shimmer-card:hover::after { left: 100%; }
  .float-card {
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;
  }
  .float-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 212, 255, 0.15);
  }
  .stat-glow {
    text-shadow: 0 0 30px currentColor;
  }
`

export default function PartnershipsPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  const technologyPartners = [
    { name: "Google Cloud", icon: "☁️", description: "Infrastructure and AI/ML services", details: "Leveraging Google Cloud's powerful infrastructure and AI tools for scalable agent deployment.", color: "#4285f4" },
    { name: "Amazon Web Services", icon: "⚙️", description: "Cloud computing and storage solutions", details: "Using AWS's comprehensive suite of services for reliable hosting and data processing.", color: "#ff9900" },
    { name: "Microsoft Azure", icon: "🔷", description: "Enterprise cloud and AI services", details: "Integrating Azure's enterprise solutions for advanced AI capabilities and compliance.", color: "#00a4ef" }
  ]

  const integrationPartners = [
    { name: "Slack", icon: "💬", description: "Team communication platform", details: "Deploy agents directly in Slack to enhance team productivity and automate workflows.", color: "#4a154b" },
    { name: "Microsoft Teams", icon: "👥", description: "Enterprise communication hub", details: "Integrate One Last AI agents with Teams for seamless collaboration.", color: "#6264a7" },
    { name: "Zapier", icon: "⚡", description: "Automation and workflow platform", details: "Connect One Last AI with thousands of apps through Zapier.", color: "#ff4a00" },
    { name: "HubSpot", icon: "📊", description: "CRM and marketing automation", details: "Enhance your CRM with intelligent agents for customer support.", color: "#ff7a59" }
  ]

  const resellerPartners = [
    { name: "Accenture", icon: "🏢", description: "Global technology consulting", details: "Helping organizations worldwide implement and optimize AI agent solutions.", color: "#a100ff" },
    { name: "Deloitte", icon: "📈", description: "Professional services and consulting", details: "Providing strategic guidance and implementation support for enterprises.", color: "#86bc25" },
    { name: "IBM Consulting", icon: "🔧", description: "Enterprise technology solutions", details: "Delivering comprehensive consulting and integration services.", color: "#0530ad" }
  ]

  const stats = [
    { number: "50+", label: "Active Partnerships", color: "#00d4ff" },
    { number: "150+", label: "Countries Reached", color: "#a855f7" },
    { number: "10K+", label: "Enterprises Supported", color: "#00ff88" },
    { number: "99.99%", label: "Uptime SLA", color: "#f59e0b" }
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-content', { opacity: 0, y: 50, duration: 1, ease: 'power3.out' })
      gsap.from('.overview-card', { opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.overview-grid', start: 'top 85%' } })
      gsap.from('.partner-card', { opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.partners-section', start: 'top 85%' } })
      gsap.from('.benefit-card', { opacity: 0, scale: 0.95, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.benefits-grid', start: 'top 85%' } })
      gsap.from('.stat-item', { opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.stats-grid', start: 'top 85%' } })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const handleTilt = (e: React.MouseEvent<HTMLElement>, card: HTMLElement) => {
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 15
    const rotateY = (centerX - x) / 15
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`
  }

  const resetTilt = (card: HTMLElement) => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)'
  }

  const PartnerCard = ({ partner }: { partner: typeof technologyPartners[0] }) => (
    <div
      className="partner-card glass-card glow-card shimmer-card rounded-2xl p-6 transition-all duration-300"
      onMouseMove={(e) => handleTilt(e, e.currentTarget)}
      onMouseLeave={(e) => resetTilt(e.currentTarget)}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="text-4xl mb-3">{partner.icon}</div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#00d4ff] transition-colors">{partner.name}</h3>
      <p className="text-sm font-semibold mb-3" style={{ color: partner.color }}>{partner.description}</p>
      <p className="text-gray-400 text-sm">{partner.details}</p>
    </div>
  )

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      <style dangerouslySetInnerHTML={{ __html: creativeStyles }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="hero-content text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#00d4ff] via-[#a855f7] to-[#00ff88] bg-clip-text text-transparent">
              Our Partnerships
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-4">Strategic alliances driving innovation in AI</p>
          <p className="text-gray-500">Together with industry leaders, we're building the future of intelligent automation</p>
        </div>

        {/* Partnership Overview */}
        <div className="overview-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Cloud, title: "Technology Partnerships", desc: "Infrastructure and cloud services powering One Last AI", color: "#00d4ff" },
            { icon: Zap, title: "Integration Partnerships", desc: "Tools and platforms that enhance One Last AI capabilities", color: "#a855f7" },
            { icon: Users, title: "Reseller Partnerships", desc: "Consulting firms helping enterprises implement solutions", color: "#ec4899" }
          ].map((item, i) => (
            <div key={i} className="overview-card glass-card glow-card shimmer-card float-card rounded-2xl p-6 text-center">
              <item.icon className="w-10 h-10 mx-auto mb-3" style={{ color: item.color }} />
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Technology Partners */}
        <div className="partners-section mb-16">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="w-6 h-6 text-[#00d4ff]" />
              <h2 className="text-3xl font-bold text-white">Technology Partners</h2>
            </div>
            <p className="text-gray-400">Strategic partnerships with leading tech companies providing world-class infrastructure</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {technologyPartners.map((partner, idx) => (
              <PartnerCard key={idx} partner={partner} />
            ))}
          </div>

          <div className="glass-card rounded-2xl p-6" style={{ borderColor: 'rgba(0,212,255,0.3)' }}>
            <h4 className="text-white font-bold mb-2">Why These Partners?</h4>
            <p className="text-gray-400">
              We partner with Google Cloud, AWS, and Microsoft Azure to ensure One Last AI runs on best-in-class infrastructure.
              These partnerships guarantee reliability, security, and scalability for enterprises of all sizes.
            </p>
          </div>
        </div>

        {/* Integration Partners */}
        <div className="partners-section mb-16">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-6 h-6 text-[#a855f7]" />
              <h2 className="text-3xl font-bold text-white">Integration Partners</h2>
            </div>
            <p className="text-gray-400">Companies we integrate with to enhance your workflow and maximize productivity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {integrationPartners.map((partner, idx) => (
              <PartnerCard key={idx} partner={partner} />
            ))}
          </div>

          <div className="glass-card rounded-2xl p-6" style={{ borderColor: 'rgba(168,85,247,0.3)' }}>
            <h4 className="text-white font-bold mb-2">Seamless Integrations</h4>
            <p className="text-gray-400">
              Our integration partnerships enable One Last AI to work seamlessly with tools your team already uses.
              From communication platforms to automation tools, we're constantly expanding our ecosystem.
            </p>
          </div>
        </div>

        {/* Reseller Partners */}
        <div className="partners-section mb-16">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-6 h-6 text-[#ec4899]" />
              <h2 className="text-3xl font-bold text-white">Reseller Partners</h2>
            </div>
            <p className="text-gray-400">Global consulting firms helping organizations implement One Last AI solutions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {resellerPartners.map((partner, idx) => (
              <PartnerCard key={idx} partner={partner} />
            ))}
          </div>

          <div className="glass-card rounded-2xl p-6" style={{ borderColor: 'rgba(236,72,153,0.3)' }}>
            <h4 className="text-white font-bold mb-2">Enterprise Implementation</h4>
            <p className="text-gray-400">
              Our reseller partners bring deep enterprise expertise and global reach. They help organizations of all sizes
              successfully implement, customize, and optimize One Last AI for their specific business needs.
            </p>
          </div>
        </div>

        {/* Partnership Benefits */}
        <div className="glass-card glow-card rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Partnership Benefits</h2>

          <div className="benefits-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: "🛡️", title: "Enterprise Reliability", desc: "Backed by industry-leading infrastructure providers ensuring 99.99% uptime and enterprise-grade security.", color: "#00d4ff" },
              { icon: "🔌", title: "Seamless Integrations", desc: "Connect with tools your teams already use, reducing friction and accelerating adoption.", color: "#a855f7" },
              { icon: "📈", title: "Advanced Capabilities", desc: "Access cutting-edge AI and ML capabilities through our technology partnerships.", color: "#00ff88" },
              { icon: "🚀", title: "Expert Implementation", desc: "Get support from world-class consulting firms with deep experience in enterprise AI.", color: "#f59e0b" }
            ].map((benefit, i) => (
              <div key={i} className="benefit-card glass-card shimmer-card rounded-xl p-6" style={{ borderColor: `${benefit.color}33` }}>
                <h3 className="text-lg font-bold text-white mb-3">{benefit.icon} {benefit.title}</h3>
                <p className="text-gray-400">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Statistics */}
        <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2 stat-glow" style={{ color: stat.color }}>
                {stat.number}
              </div>
              <p className="text-gray-400 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Become a Partner CTA */}
        <div className="rounded-3xl p-10 text-center" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(168,85,247,0.15) 50%, rgba(0,255,136,0.15) 100%)' }}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Interested in Partnering?</h2>
          <p className="text-gray-300 mb-4 text-lg max-w-2xl mx-auto">
            We're always looking for innovative companies and consulting firms to partner with One Last AI.
          </p>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Whether you're interested in technology partnerships, integrations, or reselling, we'd love to explore opportunities together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/support/contact-us"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#a855f7] text-white font-bold rounded-xl hover:shadow-xl shadow-lg shadow-[#00d4ff]/25 transition-all transform hover:scale-105"
            >
              Contact Partnership Team
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-card text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
