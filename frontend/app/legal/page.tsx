import Link from 'next/link';

export default function Legal() {
  const legalDocuments = [
    {
      title: 'Privacy Policy',
      description:
        'Learn how we collect, use, and protect your personal information and data.',
      icon: '🔒',
      href: '/legal/privacy-policy',
      lastUpdated: 'December 15, 2023',
      sections: [
        'Data Collection',
        'Usage & Processing',
        'Data Protection',
        'Your Rights',
      ],
    },
    {
      title: 'Terms of Service',
      description:
        'Understand the terms and conditions for using our AI agent platform.',
      icon: '📋',
      href: '/legal/terms-of-service',
      lastUpdated: 'December 15, 2023',
      sections: [
        'Service Usage',
        'User Responsibilities',
        'Limitations',
        'Termination',
      ],
    },
    {
      title: 'Cookie Policy',
      description:
        'Information about cookies and tracking technologies we use on our website.',
      icon: '🍪',
      href: '/legal/cookie-policy',
      lastUpdated: 'December 15, 2023',
      sections: [
        'Cookie Types',
        'Purpose & Usage',
        'Your Choices',
        'Third-Party Cookies',
      ],
    },
    {
      title: 'Payments & Refunds',
      description:
        'Policies regarding one-time purchases, payments, refunds, and access management.',
      icon: '💳',
      href: '/legal/payments-refunds',
      lastUpdated: 'December 15, 2023',
      sections: [
        'One-Time Purchase Terms',
        'Payment Methods',
        'No Refund Policy',
        'Cancellation',
      ],
    },
    {
      title: 'Reports',
      description:
        'Report inappropriate activities, misuse, or violations of our policies to our trust and safety team.',
      icon: '⚠️',
      href: '/legal/reports',
      lastUpdated: 'October 22, 2024',
      sections: [
        'How to Report',
        'Report Types',
        'Investigation Process',
        'Legal Disclaimer',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <span className="text-xl">⚖️</span>
            Legal & Compliance
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Legal Information
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Important legal documents and policies governing your use of our AI agent platform.
          </p>
        </div>
      </section>

      <div className="container-custom section-padding-lg">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {legalDocuments.map((document, index) => (
            <Link
              key={index}
              href={document.href}
              className="group bg-white rounded-2xl p-8 shadow-sm border border-neural-100 hover:shadow-lg hover:border-brand-200 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{document.icon}</div>
              <h3 className="text-xl font-bold text-neural-800 mb-3 group-hover:text-brand-600 transition-colors">
                {document.title}
              </h3>
              <p className="text-neural-600 mb-4 leading-relaxed">
                {document.description}
              </p>
              <div className="text-sm text-neural-500 mb-4">
                Last updated: {document.lastUpdated}
              </div>
              <ul className="space-y-2">
                {document.sections.map((section, sectionIndex) => (
                  <li
                    key={sectionIndex}
                    className="text-sm text-neural-500 flex items-center"
                  >
                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mr-3"></span>
                    {section}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        {/* Compliance Information */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-neural-100 mb-8">
          <h2 className="text-2xl font-bold text-neural-800 mb-6 text-center">
            Compliance & Standards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="font-bold text-neural-800 mb-2">GDPR Compliant</h3>
              <p className="text-sm text-neural-600">
                Full compliance with European data protection regulations.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">🔐</div>
              <h3 className="font-bold text-neural-800 mb-2">SOC 2 Type II</h3>
              <p className="text-sm text-neural-600">
                Independently audited security and availability controls.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">📋</div>
              <h3 className="font-bold text-neural-800 mb-2">ISO 27001</h3>
              <p className="text-sm text-neural-600">
                International standard for information security management.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-brand-600 to-accent-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Legal Questions?</h2>
          <p className="text-lg mb-6 opacity-90">
            If you have questions about our legal policies or need clarification
            on any terms.
          </p>
          <Link
            href="/support/contact-us"
            className="inline-flex items-center px-6 py-3 bg-white text-brand-600 font-semibold rounded-lg hover:bg-neural-50 transition-colors"
          >
            Contact Legal Team
          </Link>
        </div>
      </div>
    </div>
  );
}
