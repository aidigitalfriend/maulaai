'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Shield, Lock, Key, Server, CheckCircle, Activity, AlertTriangle, Globe, FileCheck, Heart, Mail, HelpCircle, ArrowRight, Zap } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export default function Security() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    
    tl.fromTo('.hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 })
      .fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
    
    gsap.fromTo('.feature-card', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, scrollTrigger: { trigger: '.features-section', start: 'top 80%' } }
    )
    
    gsap.fromTo('.compliance-card',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, scrollTrigger: { trigger: '.compliance-section', start: 'top 80%' } }
    )
    
    gsap.fromTo('.practice-card',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, scrollTrigger: { trigger: '.practices-section', start: 'top 80%' } }
    )
    
    gsap.fromTo('.faq-item',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, scrollTrigger: { trigger: '.faq-section', start: 'top 80%' } }
    )
  }, { scope: containerRef })

  const glassCard = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  }

  const securityFeatures = [
    {
      title: "Data Encryption",
      description: "All data is encrypted in transit and at rest using industry-standard AES-256 encryption.",
      icon: Lock,
      color: "text-cyan-400",
      bgColor: "rgba(34, 211, 238, 0.1)",
      details: ["End-to-end encryption", "TLS 1.3 for data in transit", "AES-256 for data at rest", "Regular encryption audits"]
    },
    {
      title: "Access Control",
      description: "Advanced authentication and authorization mechanisms to protect your accounts.",
      icon: Key,
      color: "text-purple-400",
      bgColor: "rgba(168, 85, 247, 0.1)",
      details: ["Multi-factor authentication (MFA)", "Role-based access control (RBAC)", "Single Sign-On (SSO)", "API key management"]
    },
    {
      title: "Infrastructure Security",
      description: "Enterprise-grade infrastructure with multiple layers of security protection.",
      icon: Server,
      color: "text-emerald-400",
      bgColor: "rgba(52, 211, 153, 0.1)",
      details: ["Cloud-based redundancy", "DDoS protection", "Firewall protection", "Intrusion detection systems"]
    },
    {
      title: "Compliance & Certifications",
      description: "We maintain the highest industry standards and certifications.",
      icon: CheckCircle,
      color: "text-amber-400",
      bgColor: "rgba(251, 191, 36, 0.1)",
      details: ["SOC 2 Type II certified", "GDPR compliant", "ISO 27001 certified", "HIPAA compliant"]
    },
    {
      title: "Monitoring & Logging",
      description: "Continuous monitoring and comprehensive logging of all system activities.",
      icon: Activity,
      color: "text-pink-400",
      bgColor: "rgba(236, 72, 153, 0.1)",
      details: ["24/7 system monitoring", "Detailed audit logs", "Real-time alerts", "Security incident response"]
    },
    {
      title: "Vulnerability Management",
      description: "Proactive identification and remediation of security vulnerabilities.",
      icon: Shield,
      color: "text-blue-400",
      bgColor: "rgba(59, 130, 246, 0.1)",
      details: ["Regular penetration testing", "Security code reviews", "Bug bounty program", "Vulnerability scanning"]
    }
  ]

  const complianceStandards = [
    {
      name: "GDPR",
      description: "General Data Protection Regulation compliance for EU users",
      icon: Globe,
      color: "text-blue-400",
      bgColor: "rgba(59, 130, 246, 0.1)",
      features: ["Data privacy rights", "Consent management", "Data portability", "Right to be forgotten"]
    },
    {
      name: "SOC 2 Type II",
      description: "Independently audited security, availability, and confidentiality controls",
      icon: FileCheck,
      color: "text-purple-400",
      bgColor: "rgba(168, 85, 247, 0.1)",
      features: ["Security controls", "Availability controls", "Processing integrity", "Confidentiality controls"]
    },
    {
      name: "ISO 27001",
      description: "International standard for information security management systems",
      icon: Shield,
      color: "text-emerald-400",
      bgColor: "rgba(52, 211, 153, 0.1)",
      features: ["Information security policies", "Risk management", "Access control", "Incident management"]
    },
    {
      name: "HIPAA",
      description: "Health Insurance Portability and Accountability Act compliance",
      icon: Heart,
      color: "text-pink-400",
      bgColor: "rgba(236, 72, 153, 0.1)",
      features: ["Protected health information", "Business associate agreements", "Privacy safeguards", "Security safeguards"]
    }
  ]

  const bestPractices = [
    {
      title: "Use Strong Passwords",
      description: "Create passwords with at least 12 characters including uppercase, lowercase, numbers, and symbols.",
      icon: Key,
      color: "text-cyan-400"
    },
    {
      title: "Enable MFA",
      description: "Always enable multi-factor authentication on your account for an extra layer of security.",
      icon: Lock,
      color: "text-purple-400"
    },
    {
      title: "Keep Software Updated",
      description: "Regularly update your browser and operating system to receive the latest security patches.",
      icon: ArrowRight,
      color: "text-emerald-400"
    },
    {
      title: "Be Cautious with Links",
      description: "Don't click suspicious links or download files from untrusted sources.",
      icon: AlertTriangle,
      color: "text-amber-400"
    },
    {
      title: "Review Access Logs",
      description: "Regularly review your account access logs and remove any unauthorized sessions.",
      icon: Activity,
      color: "text-pink-400"
    },
    {
      title: "Report Vulnerabilities",
      description: "Report any security issues to our security team at security@example.com.",
      icon: Mail,
      color: "text-blue-400"
    }
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a]">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 container-custom section-padding-lg">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="hero-title inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Enterprise-Grade Security
          </div>
          <h1 className="hero-title text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent mb-6">
            Security First
          </h1>
          <p className="hero-subtitle text-xl text-gray-400 leading-relaxed mb-8">
            Your data security and privacy are our top priorities. We employ enterprise-grade security measures and maintain the highest industry standards.
          </p>
        </div>
      </div>

      {/* Security Features */}
      <div className="relative z-10 container-custom section-padding features-section">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Security Features</h2>
          <p className="text-lg text-gray-400">Comprehensive security measures protecting your data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="feature-card rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300" style={glassCard}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: feature.bgColor }}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                {feature.description}
              </p>
              <ul className="space-y-3">
                {feature.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="text-sm text-gray-400 flex items-start">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3 mt-1.5 flex-shrink-0"></span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Standards */}
      <div className="relative z-10 section-padding compliance-section" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
        <div className="container-custom">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium mb-4">
              <CheckCircle className="w-4 h-4" />
              Industry Standards
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Compliance Standards</h2>
            <p className="text-lg text-gray-400">We maintain the highest industry certifications and standards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {complianceStandards.map((standard, index) => (
              <div key={index} className="compliance-card rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300" style={glassCard}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: standard.bgColor }}>
                  <standard.icon className={`w-6 h-6 ${standard.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {standard.name}
                </h3>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                  {standard.description}
                </p>
                <ul className="space-y-2">
                  {standard.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-xs text-gray-400 flex items-center">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Best Practices */}
      <div className="relative z-10 container-custom section-padding practices-section">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-4">
            <Key className="w-4 h-4" />
            Stay Protected
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Security Best Practices</h2>
          <p className="text-lg text-gray-400">Tips to keep your account and data secure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {bestPractices.map((practice, index) => (
            <div key={index} className="practice-card rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300" style={glassCard}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                <practice.icon className={`w-6 h-6 ${practice.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {practice.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {practice.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Security Contact */}
      <div className="relative z-10 section-padding" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)' }}>
        <div className="container-custom text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium mb-6">
            <AlertTriangle className="w-4 h-4" />
            Security Reporting
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">Report a Security Issue</h2>
          <p className="text-lg text-gray-400 mb-8 leading-relaxed">
            If you discover a security vulnerability, please report it responsibly to our security team. We appreciate your help in keeping our platform secure.
          </p>
          <div className="rounded-xl p-8" style={glassCard}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-cyan-400" />
              <p className="text-lg text-gray-300">
                <strong>Security Email:</strong>
              </p>
            </div>
            <a href="mailto:security@aidigitralfriendzone.com" className="text-xl font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
              security@aidigitralfriendzone.com
            </a>
            <p className="text-sm mt-6 text-gray-500">
              Please provide detailed information about the vulnerability and allow 48 hours for our team to respond.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative z-10 container-custom section-padding faq-section">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            Common Questions
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Security FAQ</h2>
          <p className="text-lg text-gray-400">Common questions about our security practices</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              q: "Where is my data stored?",
              a: "Your data is stored in secure, redundant data centers across multiple geographic locations. All data is encrypted both in transit and at rest."
            },
            {
              q: "How often do you perform security audits?",
              a: "We perform comprehensive security audits quarterly and maintain continuous monitoring. We also engage third-party security firms for penetration testing twice yearly."
            },
            {
              q: "Can I export my data?",
              a: "Yes, you can export your data at any time in standard formats. We support GDPR data portability requirements for all users."
            },
            {
              q: "What happens if there's a data breach?",
              a: "In the unlikely event of a breach, we will notify affected users within 24 hours as required by law. We maintain comprehensive incident response procedures."
            },
            {
              q: "Is my data shared with third parties?",
              a: "No, we do not sell or share your personal data with third parties. We only share data with service providers under strict data processing agreements."
            },
            {
              q: "How do I enable two-factor authentication?",
              a: "You can enable 2FA in your account settings. We support authenticator apps and SMS-based verification methods for maximum security."
            }
          ].map((faq, index) => (
            <div key={index} className="faq-item rounded-xl p-6 hover:scale-[1.01] transition-all" style={glassCard}>
              <h3 className="text-lg font-bold text-white mb-3">{faq.q}</h3>
              <p className="text-gray-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 section-padding" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
        <div className="container-custom text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-gray-400 mb-8">
            Your security is guaranteed. Start using our AI platform with confidence today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:from-purple-500 hover:to-cyan-500 transition-all">
              <Zap className="w-5 h-5" />
              Create Account
            </Link>
            <Link href="/legal/privacy-policy" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold border border-white/20 text-white hover:bg-white/10 transition-all">
              <Shield className="w-5 h-5" />
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
