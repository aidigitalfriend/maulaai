import Link from 'next/link'

export default function Security() {
  const securityFeatures = [
    {
      title: "Data Encryption",
      description: "All data is encrypted in transit and at rest using industry-standard AES-256 encryption.",
      icon: "🔐",
      details: ["End-to-end encryption", "TLS 1.3 for data in transit", "AES-256 for data at rest", "Regular encryption audits"]
    },
    {
      title: "Access Control",
      description: "Advanced authentication and authorization mechanisms to protect your accounts.",
      icon: "🔑",
      details: ["Multi-factor authentication (MFA)", "Role-based access control (RBAC)", "Single Sign-On (SSO)", "API key management"]
    },
    {
      title: "Infrastructure Security",
      description: "Enterprise-grade infrastructure with multiple layers of security protection.",
      icon: "🏗️",
      details: ["Cloud-based redundancy", "DDoS protection", "Firewall protection", "Intrusion detection systems"]
    },
    {
      title: "Compliance & Certifications",
      description: "We maintain the highest industry standards and certifications.",
      icon: "✅",
      details: ["SOC 2 Type II certified", "GDPR compliant", "ISO 27001 certified", "HIPAA compliant"]
    },
    {
      title: "Monitoring & Logging",
      description: "Continuous monitoring and comprehensive logging of all system activities.",
      icon: "📊",
      details: ["24/7 system monitoring", "Detailed audit logs", "Real-time alerts", "Security incident response"]
    },
    {
      title: "Vulnerability Management",
      description: "Proactive identification and remediation of security vulnerabilities.",
      icon: "🛡️",
      details: ["Regular penetration testing", "Security code reviews", "Bug bounty program", "Vulnerability scanning"]
    }
  ]

  const complianceStandards = [
    {
      name: "GDPR",
      description: "General Data Protection Regulation compliance for EU users",
      icon: "🇪🇺",
      features: ["Data privacy rights", "Consent management", "Data portability", "Right to be forgotten"]
    },
    {
      name: "SOC 2 Type II",
      description: "Independently audited security, availability, and confidentiality controls",
      icon: "📋",
      features: ["Security controls", "Availability controls", "Processing integrity", "Confidentiality controls"]
    },
    {
      name: "ISO 27001",
      description: "International standard for information security management systems",
      icon: "🌍",
      features: ["Information security policies", "Risk management", "Access control", "Incident management"]
    },
    {
      name: "HIPAA",
      description: "Health Insurance Portability and Accountability Act compliance",
      icon: "🏥",
      features: ["Protected health information", "Business associate agreements", "Privacy safeguards", "Security safeguards"]
    }
  ]

  const bestPractices = [
    {
      title: "Use Strong Passwords",
      description: "Create passwords with at least 12 characters including uppercase, lowercase, numbers, and symbols.",
      icon: "🔑"
    },
    {
      title: "Enable MFA",
      description: "Always enable multi-factor authentication on your account for an extra layer of security.",
      icon: "🔐"
    },
    {
      title: "Keep Software Updated",
      description: "Regularly update your browser and operating system to receive the latest security patches.",
      icon: "⬆️"
    },
    {
      title: "Be Cautious with Links",
      description: "Don't click suspicious links or download files from untrusted sources.",
      icon: "⚠️"
    },
    {
      title: "Review Access Logs",
      description: "Regularly review your account access logs and remove any unauthorized sessions.",
      icon: "📊"
    },
    {
      title: "Report Vulnerabilities",
      description: "Report any security issues to our security team at security@example.com.",
      icon: "🚨"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="container-custom section-padding-lg">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-brand-600 via-accent-500 to-brand-700 bg-clip-text text-transparent mb-6">
            Security First
          </h1>
          <p className="text-xl text-neural-600 leading-relaxed mb-8">
            Your data security and privacy are our top priorities. We employ enterprise-grade security measures and maintain the highest industry standards.
          </p>
        </div>
      </div>

      {/* Security Features */}
      <div className="container-custom section-padding">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neural-800 mb-4">Security Features</h2>
          <p className="text-lg text-neural-600">Comprehensive security measures protecting your data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100 hover:shadow-lg hover:border-brand-200 transition-all duration-300">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-neural-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-neural-600 mb-6 leading-relaxed">
                {feature.description}
              </p>
              <ul className="space-y-3">
                {feature.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="text-sm text-neural-600 flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 mt-1 flex-shrink-0"></span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Standards */}
      <div className="bg-white section-padding">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neural-800 mb-4">Compliance Standards</h2>
            <p className="text-lg text-neural-600">We maintain the highest industry certifications and standards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {complianceStandards.map((standard, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 hover:shadow-lg transition-all duration-300">
                <div className="text-4xl mb-4">{standard.icon}</div>
                <h3 className="text-lg font-bold text-neural-800 mb-2">
                  {standard.name}
                </h3>
                <p className="text-sm text-neural-600 mb-4 leading-relaxed">
                  {standard.description}
                </p>
                <ul className="space-y-2">
                  {standard.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-xs text-neural-600 flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
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
      <div className="container-custom section-padding">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neural-800 mb-4">Security Best Practices</h2>
          <p className="text-lg text-neural-600">Tips to keep your account and data secure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {bestPractices.map((practice, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100 hover:shadow-lg transition-all duration-300">
              <div className="text-4xl mb-4">{practice.icon}</div>
              <h3 className="text-xl font-bold text-neural-800 mb-3">
                {practice.title}
              </h3>
              <p className="text-neural-600 leading-relaxed">
                {practice.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Security Contact */}
      <div className="bg-gradient-to-r from-brand-600 to-accent-600 text-white section-padding">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Report a Security Issue</h2>
          <p className="text-lg mb-8 leading-relaxed">
            If you discover a security vulnerability, please report it responsibly to our security team. We appreciate your help in keeping our platform secure.
          </p>
          <div className="bg-white/10 rounded-xl p-8 backdrop-blur-sm">
            <p className="text-lg mb-4">
              <strong>Security Email:</strong>
            </p>
            <a href="mailto:security@aidigitralfriendzone.com" className="text-xl font-semibold hover:underline">
              security@aidigitralfriendzone.com
            </a>
            <p className="text-sm mt-6 opacity-90">
              Please provide detailed information about the vulnerability and allow 48 hours for our team to respond.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container-custom section-padding">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-neural-800 mb-4">Security FAQ</h2>
          <p className="text-lg text-neural-600">Common questions about our security practices</p>
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
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-neural-100 hover:shadow-md transition-all">
              <h3 className="text-lg font-bold text-neural-800 mb-3">{faq.q}</h3>
              <p className="text-neural-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-neural-900 text-white section-padding">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-neural-300 mb-8">
            Your security is guaranteed. Start using our AI platform with confidence today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup" className="btn-primary">
              Create Account
            </Link>
            <Link href="/legal/privacy-policy" className="btn-secondary bg-neutral-800 border-neutral-600 text-white hover:bg-neutral-700">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
